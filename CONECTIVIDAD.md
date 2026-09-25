# Conectividad Frontend ↔ Backend (Raysafe)

> Guía pensada para alguien que **nunca ha conectado un frontend con un backend**.
> Se explica desde cero: qué son, cómo se hablan, y cómo agregar endpoints nuevos
> (públicos y protegidos con JWT).

---

## 1. ¿Qué pasa aquí? ¿Por qué necesitas "conectar" algo?

Tienes **dos programas separados** corriendo en la misma computadora:

| Programa | Tecnología | Corre en |
|---|---|---|
| Frontend | Angular | `http://localhost:4200` |
| Backend | Express (Node) | `http://localhost:3000` |

El backend habla con una base de datos MySQL. El frontend solo dibuja pantallas.
Para que una pantalla muestre datos reales, el frontend tiene que **pedírselos al backend**.

Esa petición se llama **HTTP request**. El backend contesta con un **HTTP response**,
normalmente en formato **JSON** (texto estructurado que Angular puede entender).

```
Navegador (usuario)  ──▶  Frontend Angular (:4200)
                                  │
                                  ▼  "GET /api/stats/dashboard"
                              Backend Express (:3000)
                                  │
                                  ▼
                               MySQL (datos)
```

### El problema: CORS

El navegador tiene una regla de seguridad: **una página solo puede hablar con su propio
servidor**. Como tu página vive en `:4200` y el backend en `:3000`, el navegador se lo
prohibiría por defecto (error CORS).

Hay dos formas de resolverlo:

1. **Abrir CORS en el backend** (el backend dice "dejo que cualquiera me hable") y que el
   frontend llame directamente a `http://localhost:3000/api/...`.
2. **Usar un proxy** (lo que hicimos): el servidor de desarrollo de Angular "se hace pasar"
   por el backend.

### La solución que usamos: el proxy

```
Navegador (4200)  ──/api/...──▶  Dev server de Angular  ──▶  Backend (3000)
        ▲                                                                │
        └───────────────── la respuesta regresa por el mismo camino ──────┘
```

- El navegador cree que todo pasa en `:4200` → **sin CORS**.
- El backend recibe la petición del dev server → **funciona normal**.
- A ti no te exigen recordar la URL del backend: en el código escribes solo `/api/...`.

---

## 2. Los archivos que hacen posible la conexión

### `proxy.conf.json` (raíz del frontend)

El puente. "Cualquier petición que empiece por `/api`, reenvíala a `http://localhost:3000`":

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### `angular.json`

Le dice a `ng serve` que use el proxy. Vive dentro de `serve.options.proxyConfig`:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

> ⚠️ Si cambias `angular.json` debes **reiniciar `ng serve`**. No se recarga solo.

### `src/app/app.config.ts`

Habilita `HttpClient`, la herramienta de Angular para hacer peticiones HTTP en toda la app:

```ts
providers: [
  provideHttpClient(withFetch()),
  // ...
]
```

Sin esto, ningún servicio puede hacer `this.http.get(...)`.

---

## 3. La arquitectura capa por capa (el patrón)

Tanto el frontend como el backend organizan el trabajo en **capas**. Cada capa tiene
**una sola responsabilidad** y solo habla con la capa inmediata. Esta disciplina es lo que
hace que un proyecto sea mantenible.

### Del lado del frontend (Angular)

```
Componente (vista)  →  Service (HTTP)  →  Backend
```

| Capa | Responsabilidad | Archivo de ejemplo |
|---|---|---|
| **Componente** | Se ve el HTML, maneja el estado de la pantalla (signals). NUNCA llama a `HttpClient` directo. | `views/user/abuse-stats/abuse-stats.ts` |
| **Service** | Hace las peticiones HTTP, expone métodos con nombres claros (`getDashboard()`). | `services/stats.service.ts` |
| **Backend** | Procesa y responde. | `raysafe-backend` |

### Del lado del backend (Express)

```
Ruta → [Middleware] → Controller → Service → Repository → MySQL
```

| Capa | Responsabilidad |
|---|---|
| **Route** | Asocia `método + URL` con un controlador. |
| **Middleware** | Intercepta la petición antes del controlador (validar body, validar JWT, roles...). |
| **Controller** | Recibe `req/res`, delega en el service, responde con el código HTTP correcto. |
| **Service** | Lógica de negocio. No sabe de HTTP ni de SQL. |
| **Repository** | Única capa que toca MySQL (consultas con placeholders `?`). |

> No necesitas memorizar el backend para usarlo: **la regla de oro es que el frontend
> nunca toca la base de datos**; solo pide datos a la API y la API hace el resto.

---

## 4. Recorrido completo de una vista real: `/abuse-stats`

Esto es lo que hicimos, paso a paso.

### 4.1 El endpoint

El backend ya tenía listo `GET /api/stats/dashboard`. Con el backend corriendo,
abrirlo en el navegador devuelve algo como:

```json
{
  "total_denuncias_nacional": 122,
  "total_departamentos": 22,
  "departamentos": [
    {
      "nombre_departamento": "Alta Verapaz",
      "total_denuncias": 4,
      "desglose_por_categoria": [
        { "categoria": "ABUSO ANIMAL", "cantidad": 3, "porcentaje": 75 }
      ]
    }
  ]
}
```

### 4.2 El Service que describe la respuesta

En `services/stats.service.ts` definimos interfaces que **copian la forma del JSON**,
método que llama al endpoint y el `Observable` que Angular entrega cuando responde:

```ts
export interface Dashboard {
  total_denuncias_nacional: number;
  total_departamentos: number;
  departamentos: DepartamentoStat[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>('/api/stats/dashboard');
  }
}
```

Claves:

- `providedIn: 'root'` → mismo service disponible en toda la app, no hace falta declararlo.
- `inject(HttpClient)` → obtiene el `HttpClient` (de la config del paso 2).
- `this.http.get<T>(ruta)` → "haz un GET; cuando llegue la respuesta, conviértela a `T`".

### 4.3 El Componente que consume el service

En `abuse-stats.ts`:

```ts
export class AbuseStats implements OnInit {
  private readonly statsService = inject(StatsService);

  protected readonly departamentos = signal<Departamento[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // ver nota SSR
    this.cargarDashboard();
  }

  private cargarDashboard(): void {
    this.statsService.getDashboard().subscribe({
      next: (data) => {
        // 1. llegó la respuesta → guardar en signals
        this.departamentos.set(data.departamentos.map(...));
        this.cargando.set(false);
      },
      error: () => {
        // 2. falló → mostrar mensaje
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
```

### 4.4 El template se entera solo

```html
<div *ngIf="cargando()">Cargando…</div>
<div *ngIf="error()">Error <button (click)="reintentar()">Reintentar</button></div>
<div *ngIf="!cargando() && !error()">
  <button *ngFor="let depto of departamentos()">{{ depto.nombre }} — {{ depto.total }}</button>
</div>
```

Los **signals** son la forma moderna de estado en Angular: al hacer `.set(...)`, la vista
se redibuja sola. No hay que "actualizar a mano".

> **Qué es `subscribe`**: la llamada `getDashboard()` no viaja hasta que alguien se
> suscribe. `subscribe({ next, error })` dispara la petición y te dice qué hacer con la
> respuesta (`next`) o si falló (`error`).

### 4.5 ¿Por qué el `isPlatformBrowser`? (SSR)

El proyecto tiene SSR: Angular también renderiza HTML **en el servidor** (al hacer build).
Ahí, llamar al backend generaría errores si no está corriendo. La guardia

```ts
if (!isPlatformBrowser(this.platformId)) return;
```

significa: "solo hago la petición cuando estoy en el navegador del usuario; en el
servidor, renderizo la pantalla vacía y el navegador la llena después".

---

## 5. Receta: llamar un endpoint nuevo (público)

El proxy ya cubre **cualquier** ruta `/api/*`, así que **no** tocas `proxy.conf.json` ni
`angular.json`. Solo 4 pasos:

1. **Mira la respuesta real** del endpoint (navegador o curl) para copiar su forma.
2. **Define las interfaces** que describan esa respuesta, junto al service.
3. **Agrega un método** al service:

```ts
getHelpResources(): Observable<HelpResource[]> {
  return this.http.get<HelpResource[]>('/api/help-resources');
}
```

4. **Úsalo en el componente**:

```ts
ngOnInit(): void {
  this.service.getHelpResources().subscribe({
    next: (data) => this.recursos.set(data),
    error: () => this.error.set(true),
  });
}
```

Reglas de oro:

- Escribe **rutas relativas** (`/api/...`), nunca `http://localhost:3000/...`.
- No hagas `HttpClient` desde el componente: siempre a través de un service.
- Mantén los nombres de las interfaces iguales a los del JSON de la API (forman el contrato).
- Guarda el resultado en signals y deja que el template haga el resto.

---

## 6. Endpoints que requieren autenticación (JWT)

Algunos endpoints del backend exigen que **demuestres quién eres** antes de responder.
El mecanismo es un **JWT** (JSON Web Token).

### 6.1 Cómo funciona, en 3 actos

```
1. LOGIN
   POST /api/auth/login
   { "email": "...", "password": "..." }

   Respuesta: { "token": "eyJhbGciOi...", "user": { id, name, email, role } }

2. GUARDAR el token (cada navegador tiene el suyo)

3. LLAMADAS AUTENTICADAS
   GET /api/auth/me
   Header: Authorization: Bearer <el token guardado>

   Respuesta: datos del usuario actual (id, name, email, role)
```

El token es como una **credencial con vencimiento**: el backend lo firma con un secreto
(`JWT_SECRET`) y lleva dentro `{ sub: id, role }`. Cualquier endpoint protegido lee el
token, verifica la firma y **confía en lo que dice** — por eso "los datos del usuario
actualse extraen del token": el backend saca el `sub` (id) del token y con él busca al
usuario en la base de datos.

Así se ve en el backend:

```ts
// middleware/auth.middleware.ts
const payload = jwt.verify(token, env.JWT_SECRET);   // verifica firma + expiración
req.user = { id: payload.sub, role: payload.role };  // deja al usuario en req.user

// controller que "usa datos del usuario actual"
const user = await authService.getMe(req.user!.id);  // el id salió del token
```

### 6.2 Lo que necesitarás en el frontend (cuando llegue el momento)

**a) Un service de auth** que haga el login y guarde el token:

```ts
// services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResult> {
    return this.http.post<LoginResult>('/api/auth/login', { email, password });
  }

  // Guarda y recupera el token (solo en el navegador)
  guardarToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('token', token);
  }
  obtenerToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('token');
    return null;
  }
}
```

**b) Un interceptor** — el "automatizador". En vez de escribir el header en cada llamada,
un interceptor se encarga de **toda** petición que salga de la app: si hay token, agrega
`Authorization: Bearer <token>`. Se registra en `app.config.ts` con
`provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`:

```ts
// interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

Con esto, los servicios llaman igual que siempre:

```ts
getMiPerfil(): Observable<User> {
  return this.http.get<User>('/api/auth/me'); // el interceptor ya agregó el token
}
```

**c) Roles** — si quieres saber si el usuario es `admin` o `agente` sin otra petición,
puedes **decodificar el JWT** localmente. El token es `cabecera.parte_media.firma`, y la
parte media es JSON en base64 con el `sub` (id) y el `role`:

```ts
function decodificarJwt(token: string): { sub: number; role: string } | null {
  const payload = token.split('.')[1];
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json);
}
```

Úsalo solo para **UI** (qué header mostrar, qué botones). Para acciones de seguridad,
siempre confía en el backend: si el rol no está permitido, el middleware `authorize`
responde `403`.

**d) Manejar el 401** — si el token expiró, el backend responde `401`. En el interceptor
(bloque `error` global) puedes borrar el token y mandar al usuario al login.

---

## 7. Errores comunes y cómo evitarlos

| Síntoma | Causa probable | Solución |
|---|---|---|
| `EADDRINUSE` en backend | Ya hay algo usando el puerto 3000 (otro `pnpm dev`) | Cierra el otro proceso |
| "No se pudieron cargar las estadísticas" | El dev server no proxea (proxy mal ubicado o server viejo) | Verifica `serve.options.proxyConfig` en `angular.json` y reinicia `ng serve` |
| El navegador muestra HTML en vez de JSON | La ruta no pasa por el proxy / el endpoint no existe | Prueba `http://localhost:4200/api/...`; debe dar JSON |
| `401` en una petición | Endpoint protegido y no envías `Authorization` | Implementa el interceptor (sección 6) |
| CORS en consola | Se llamó a `http://localhost:3000` directo desde Angular | Usa rutas relativas `/api/...` |
| `ng serve` no aplica cambios de `angular.json` | Se necesita reiniciar el proceso | Detén y vuelve a `npm start` |

---

## 8. Cheatsheet mental

```
Frontend:  Componente → Service → (/api/...) → Backend → MySQL
Proxy:     /api  =  localhost:3000
Login:     POST /api/auth/login      → token
Autenticar: Authorization: Bearer <token>  (automático con interceptor)
Datos del usuario actual: el backend los saca del token (req.user.id) / GET /api/auth/me
```