# Raysafe — Frontend

Interfaz web de RaySafe: sistema de denuncia y seguimiento de casos de abuso (personas y animales) en Guatemala.

Angular 22 con **standalone components** y **signals**, con renderizado en servidor (SSR) y prerenderizado.

## Requisitos

- Node.js `^22.22.3` \| `^24.15.0` \| `>=26.0.0` (requisito de Angular CLI 22)
- npm 10 o superior (el proyecto declara `packageManager: npm@10.9.8`)
- El backend corriendo en `http://localhost:3000` — ver [`../raysafe-backend`](../raysafe-backend)

## Puesta en marcha

```bash
npm install
npm start
```

La app queda en `http://localhost:4200/`.

> Usa los scripts de `npm` y el CLI local (`npm start`, no `ng` global): la versión global puede diferir y no aplicar el proxy correctamente.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila a `dist/raysafe/` |
| `npm run watch` | Compila en modo desarrollo, viendo cambios |
| `npm test` | Tests unitarios con Vitest |
| `npm run serve:ssr:raysafe` | Sirve la build con el servidor SSR de Node |

## Cómo se conecta con el backend

Todas las llamadas HTTP usan **rutas relativas** (`/api/...`); no hay ninguna URL absoluta en el código.

En desarrollo, `proxy.conf.json` redirige `/api` y `/uploads` a `http://localhost:3000`, configurado en el target `serve` de `angular.json`. Por eso no hay problemas de CORS en local: la petición sale del mismo origen (`localhost:4200`).

Para comprobar que el proxy responde:

```
http://localhost:4200/api/stats/dashboard
```

Debe devolver JSON, no HTML.

> En producción (build con SSR) no hay proxy: el servidor Express generado sirve los archivos estáticos y el resto de rutas las resuelve el enrutador de Angular. Las llamadas a `/api` necesitan un servidor aparte o una regla de reescritura en el hosting.

## Sesión y roles

- `AuthService` (signals + `localStorage`) guarda el token JWT y los datos del usuario.
- `authInterceptor` añade la cabecera `Authorization: Bearer` a cada petición y, ante un `401`, cierra sesión y redirige a `/login`.
- `roleGuard` protege las rutas internas según el rol del usuario: `agente` o `admin`.

## Rutas de la aplicación

| Ruta | Vista | Acceso |
|---|---|---|
| `/home` | Portada | Público |
| `/login` | Iniciar sesión | Público |
| `/create-report` | Formulario de denuncia | Público |
| `/track-report` | Seguimiento de una denuncia | Público |
| `/abuse-stats` | Estadísticas por departamento | Público |
| `/help-resources` | Recursos de ayuda y guías | Público |
| `/unassigned-reports` | Pool de denuncias sin asignar | `agente` |
| `/assigned-reports` | Denuncias asignadas al agente | `agente` |
| `/agent-list` | Gestión de agentes | `admin` |
| `/register-agent` | Alta de agente | `admin` |
| `/agent-logs` | Bitácora global de denuncias | `admin` |
| `**` | Página 404 | Público |

## Estructura

```
src/
  main.ts                Bootstrap del navegador
  main.server.ts         Bootstrap del servidor (SSR)
  server.ts              Servidor Express que sirve la build con Angular
  app/
    app.ts               Componente raíz
    app.config.ts        Providers: router, HTTP, interceptores
    app.routes.ts        Tabla de rutas
    app.routes.server.ts  Modo de renderizado por ruta
    views/               Una carpeta por vista (componente + template + estilos)
      user/              Portal ciudadano: home, create-report, track-report, abuse-stats, help-resources
      agent/             Panel del agente: unassigned-reports, assigned-reports
      admin/             Panel de administración: agent-list, register-agent, agent-logs
      auth/              login
      not-found/         404
    components/          Cabeceras por rol y pie de página
    services/            Una capa por módulo: llamadas HTTP con HttpClient
    guards/              roleGuard
    interceptors/        authInterceptor
```

Los servicios son el único lugar donde se escriben rutas de API. Los componentes no llaman a `HttpClient` directamente.

## Tests

```bash
npm test
```

Vitest vía `@angular/build`. Cubre los componentes y `AuthService`.

> Los tests que necesitan backend usan `HttpTestingController` y verifican las peticiones esperadas; no requieren el servidor corriendo.

## Notas

- **El build requiere acceso a internet.** Varios archivos `.scss` importan Google Fonts con `@import url(...)`, y el plugin de inlining de fuentes los descarga durante la compilación. Sin conexión a `fonts.googleapis.com`, `npm run build` falla con un error de inlining. Esto no afecta a `npm start` ni a `npm test`.
- No hay linter configurado, pero `.prettierrc` está presente; puedes aplicarlo con `npx prettier --write "src/**/*.{ts,html,scss}"`.
- Para entender la conectividad con el backend capa por capa, ver [CONECTIVIDAD.md](./CONECTIVIDAD.md).
