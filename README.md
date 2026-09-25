# Raysafe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6.

> **Gestor de paquetes:** este proyecto usa **npm** (lo declara `packageManager` en `package.json`). No uses `pnpm dev` aquí — usa los scripts de `npm`.

## Requisitos

- Node.js 18+
- npm 10+
- El backend corriendo en `http://localhost:3000` (ver `raysafe-backend`)

## Development server

Con el backend levantado, inicia el frontend:

```bash
npm start        # equivale a ng serve
```

> Usa `npm start` (CLI local del proyecto). No uses el `ng` global: puede diferir en versión y no aplicar el proxy correctamente.

Una vez corriendo, abre `http://localhost:4200/`. La aplicación recarga automáticamente al modificar archivos.

### Proxy al backend

El dev server redirige las peticiones `/api/*` al backend (`http://localhost:3000`) mediante `proxy.conf.json`, configurado en el target `serve` de `angular.json`. No hay problemas de CORS en desarrollo porque la petición sale del mismo origen (`localhost:4200`).

Para verificar que el proxy funciona (con el backend corriendo):

```
http://localhost:4200/api/stats/dashboard
```

Debe devolver JSON (no HTML).

> 📖 ¿Quieres entender cómo funciona todo esto, capa por capa, y cómo llamar más
> endpoints (incluidos los que requieren JWT)? Lee **[CONECTIVIDAD.md](./CONECTIVIDAD.md)**.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
