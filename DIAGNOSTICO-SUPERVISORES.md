# Diagnóstico Supervisores (backend NestJS)

Fecha de revisión: 2026-09-22.

Alcance: código en `main` (HEAD `f26f7f8`). No se modificó código de aplicación. Este documento es un diagnóstico, no un diseño nuevo.

Fuentes usadas, en este orden:

- Código de `src/`, `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `prisma.config.ts`, `package.json`, `nest-cli.json`, `tsconfig*.json`.
- `README.md` del backend (plantilla de NestJS; no describe el dominio ni las variables de entorno).
- No hay `.env.example`, OpenAPI ni carpeta `docs/`.
- El frontend de `frontend/src/services/` se usó solo como contrato de consumo ya escrito, no como requisito nuevo.
- La rama remota `origin/feature/integracion-datos-territoriales` (HEAD `2a0d88a`) no está mergeada. Se describe al final de las secciones que afecta. No forma parte del comportamiento de `main`.

No existe un módulo de materias / subjects. El catálogo de evaluación de este repositorio es `BloqueEvaluacion` + `CriterioEvaluacion`. No se propone crear materias.

Verificación hecha sobre `main` en esta revisión (sin base de datos real):

- `npx tsc --noEmit -p tsconfig.json` termina sin errores (hace falta `prisma generate`, y `prisma generate` exige `DATABASE_URL` por `prisma.config.ts`).
- `npx nest start` sin `JWT_SECRET` aborta en el arranque: `TypeError: JwtStrategy requires a secret or key` (`src/auth/strategies/jwt.strategies.ts`).
- Con `JWT_SECRET` y sin `DATABASE_URL`, Nest registra las rutas y después aborta en `PrismaService.onModuleInit`: `PrismaClientInitializationError` P1012, variable `DATABASE_URL` ausente.
- `npx jest`: 14 suites, 2 passed (`app.controller.spec.ts` y `prisma.service.spec.ts`), 12 failed. Los fallos son de inyección de dependencias en specs generados por el CLI, no de compilación.
- `npx prisma db seed` sí encuentra el comando `tsx prisma/seed.ts`, pero falla si Postgres no está alcanzable.

---

## 1. Arquitectura actual

Monolito NestJS 11 + TypeScript. El paquete se llama `backend` (`package.json`). El ORM es **Prisma 6.19** contra **PostgreSQL**. No hay TypeORM.

Arranque (`src/main.ts`):

- `NestFactory.create(AppModule)`.
- CORS fijo: origen `http://localhost:5173`, `credentials: true`.
- `app.listen(3000)` fijo. No hay `PORT`, prefijo global (`/api`), `ConfigModule`, ni carga de `.env` en el proceso Nest.
- `ValidationPipe` está importado y **no se aplica**. Los decoradores de `class-validator` no se ejecutan.

`AppModule` (`src/app.module.ts`) importa, en este orden:

`PrismaModule`, `UsuariosModule`, `AuthModule`, `AreasModule`, `SectoresModule`, `AgentesModule`, `SupervisionesModule`, `BloquesEvaluacionModule`, `CriteriosEvaluacionModule`.

También declara `AppController` y `AppService` (el `GET /` de la plantilla Nest, que responde `Hello World!`).

`PrismaModule` es `@Global()` y exporta `PrismaService` (`PrismaClient` con `$connect` / `$disconnect`). El resto de módulos no reimportan Prisma: lo reciben por ser global.

`AuthModule` registra `JwtModule` con `secret: process.env.JWT_SECRET` y `expiresIn: '8h'`, y provee `AuthService` + `JwtStrategy`. No importa `PassportModule`. En el arranque observado la estrategia igual se instancia (el fallo sin secreto ocurre dentro de `passport-jwt`), así que la ausencia de `PassportModule` no bloquea el bootstrap.

No hay `APP_GUARD` global. Cada controlador declara sus guards.

Compilación: `nest-cli.json` con `sourceRoot: src` y `deleteOutDir: true`. `tsconfig.json` usa `module` / `moduleResolution` `nodenext`, `strictNullChecks: true`, `noImplicitAny: false`. `package.json` no tiene `"type": "module"`, así que el emit es CommonJS y `nest build` es viable (el typecheck pasó).

El frontend React/Vite vive en `frontend/` y no entra en el build del backend (`tsconfig` lo excluye). Habla con `http://localhost:3000` sin prefijo (`frontend/src/services/api.ts`).

---

## 2. Módulos existentes

| Módulo | Archivos | Responsabilidad real en `main` |
| --- | --- | --- |
| `PrismaModule` | `src/prisma/` | Cliente Prisma global y ciclo de vida de la conexión. |
| `AuthModule` | `src/auth/` | Login con email/password, JWT bearer 8 h, `GET /auth/me`. Estrategia recarga el usuario y rechaza inactivos. |
| `UsuariosModule` | `src/usuarios/` | ABM parcial de usuarios de sistema (admin y supervisor): alta, listado, detalle, password, activo, rol. No edita nombre/apellido/email. |
| `AreasModule` | `src/areas/` | Alta y listado de áreas operativas activas. No hay edición ni baja. |
| `SectoresModule` | `src/sectores/` | Alta y listado de sectores activos, global o por área. No hay edición ni baja. |
| `AgentesModule` | `src/agentes/` | CRUD parcial de agentes sanitarios: alta, listado (activos e inactivos), por área (solo activos), detalle, actualización, activar/desactivar. |
| `SupervisionesModule` | `src/supervisiones/` | Alta de una supervisión con evaluaciones, listados, detalle con alcance por rol, historial por agente (admin) y métricas. No hay edición ni borrado. |
| `BloquesEvaluacionModule` | `src/bloques-evaluacion/` | Catálogo de bloques: listar (incluye criterios), detalle, alta, actualización (incluye `activo`). |
| `CriteriosEvaluacionModule` | `src/criterios-evaluacion/` | Criterios de un bloque: listar, por bloque, detalle, alta, actualización (incluye `activo` y cambio de bloque). |
| `AppModule` | `src/app.*` | Composición y el endpoint de plantilla `GET /`. |

No hay módulos de materias, zonas, rondas (como entidad), auditoría, archivos ni reportes en el servidor. El PDF se arma en el frontend (`frontend/src/services/exportar-pdf.service.ts`).

---

## 3. Entidades existentes

Definidas en `prisma/schema.prisma`. Una migración: `prisma/migrations/20260812130015_inicio`. El SQL coincide con el schema de `main`. No hay tablas intermedias (join tables): todas las relaciones son claves foráneas directas.

Convención de borrado Prisma/Postgres: `ON DELETE RESTRICT` y `ON UPDATE CASCADE`, salvo donde se indica otra cosa.

### Enums

- `RolUsuario`: `ADMIN`, `SUPERVISOR`.
- `DecisionGestion`: `NO_REQUIERE`, `SEGUIMIENTO`, `CAPACITACION`, `SUPERVISION_INTENSIVA`.
- `Clasificacion`: `CRITICO`, `REGULAR`, `BUENO`, `EXCELENTE`.

### `Usuario`

Campos: `id`, `nombre`, `apellido`, `email` (único), `passwordHash`, `rol`, `activo` (default `true`), `createdAt`, `updatedAt`.

Relación: un usuario tiene muchas `Supervision` (`supervisorId`). No tiene área, sector ni agente asociado.

Dueño de la credencial de acceso. El hash no se devuelve en los `select` de los servicios revisados.

### `AreaOperativa`

Campos: `id`, `nombre` (único), `descripcion?`, `activo` (default `true`), `createdAt`, `updatedAt`.

Relaciones (lado uno):

- muchos `AgenteSanitario`
- muchos `Sector`
- muchas `Supervision`

No se puede borrar un área si tiene hijos (RESTRICT).

### `Sector`

Campos: `id`, `areaOperativaId`, `numero`, `nombre?`, `activo` (default `true`).

No tiene `createdAt` ni `updatedAt`.

Relaciones:

- pertenece a un `AreaOperativa` (RESTRICT).
- tiene muchas `Supervision`.

Único compuesto `(areaOperativaId, numero)`. Índice en `areaOperativaId`.

### `AgenteSanitario`

Campos: `id`, `areaOperativaId`, `nombre`, `apellido`, `documento?`, `legajo?`, `activo` (default `true`), `createdAt`, `updatedAt`.

Relaciones:

- pertenece a un `AreaOperativa` (RESTRICT).
- tiene muchas `Supervision` (RESTRICT).

`documento` y `legajo` no son únicos. No hay FK a `Sector`: el sector se elige en cada supervisión, no en el agente.

### `BloqueEvaluacion`

Campos: `id`, `nombre` (único), `descripcion?`, `orden`, `activo` (default `true`), `createdAt`, `updatedAt`.

Relación: muchos `CriterioEvaluacion` (RESTRICT al borrar el bloque).

### `CriterioEvaluacion`

Campos: `id`, `bloqueId`, `nombre`, `descripcion?`, `orden`, `activo` (default `true`), `createdAt`, `updatedAt`.

Relaciones:

- pertenece a un `BloqueEvaluacion` (RESTRICT).
- tiene muchas `EvaluacionCriterio` (RESTRICT). No se puede borrar un criterio ya usado en una supervisión.

Índice en `bloqueId`. No hay unicidad de `nombre` dentro del bloque (el seed busca por nombre, pero la base no lo impone).

### `Supervision`

Campos: `id`, `agenteSanitarioId`, `supervisorId`, `areaOperativaId`, `sectorId`, `fecha`, `familiaNumero?`, `rondaNumero?` (entero suelto, no es FK), `decisionGestion`, `promedio` `Decimal(4,2)?`, `clasificacion?`, `fortalezas?`, `oportunidadesMejora?`, `situacionesCriticas?`, `recomendaciones?`, `createdAt`, `updatedAt`.

Relaciones (todas RESTRICT):

- `agenteSanitario` → `AgenteSanitario`
- `supervisor` → `Usuario`
- `areaOperativa` → `AreaOperativa`
- `sector` → `Sector`
- muchas `EvaluacionCriterio`

Índices en agente, supervisor, área, sector y fecha.

El servicio de alta copia `areaOperativaId` y `sectorId` desde el body y comprueba que el agente y el sector pertenezcan a esa área. No hay FK que ate al agente con el sector.

### `EvaluacionCriterio`

Campos: `id`, `supervisionId`, `criterioId`, `criterioNombre`, `criterioDescripcion?`, `puntuacion`.

Relaciones:

- `supervision`: **`onDelete: Cascade`**. Borrar la supervisión borraría sus evaluaciones. No hay endpoint de borrado.
- `criterio`: RESTRICT.

Único `(supervisionId, criterioId)`.

`criterioNombre` y `criterioDescripcion` son una copia al momento de la supervisión. Sirven para que el detalle histórico no dependa de un renombre posterior del catálogo. No conviene eliminar esos campos al “normalizar”.

### Seed (`prisma/seed.ts`)

Crea o actualiza:

- un usuario admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, con fallback en código);
- 6 bloques y sus criterios (textos fijos del instrumento de supervisión sanitaria).

No crea áreas, sectores, agentes ni supervisiones. En un update del admin **no** rehace `passwordHash`.

Hay typos en textos de criterios del seed (`comopleta`, `aactua`). Son datos, no lógica.

---

## 4. Endpoints existentes

Base: `http://localhost:3000`, sin prefijo. Auth = `Authorization: Bearer <jwt>`, salvo que se marque público.

Guards: `JwtAuthGuard` (estrategia `jwt`) y `RolesGuard` (lee metadata `@Roles`). Si el handler no tiene `@Roles`, `RolesGuard` deja pasar. Si hay roles y el usuario no está, devuelve `false` (Nest responde 403). Si el rol no coincide, `ForbiddenException`.

### `AppController` — público

| Método | Ruta | Auth | Para qué |
| --- | --- | --- | --- |
| GET | `/` | Público | Responde `Hello World!`. No es un health check de base de datos. |

### `AuthController` — `src/auth/auth.controller.ts`

| Método | Ruta | Auth | Para qué |
| --- | --- | --- | --- |
| POST | `/auth/login` | Público | Valida email, password (bcrypt) y `activo`. Devuelve `accessToken` y datos públicos del usuario (sin `activo` y sin hash). |
| GET | `/auth/me` | JWT, cualquier rol | Devuelve el usuario que armó `JwtStrategy` (`id`, `nombre`, `apellido`, `email`, `rol`, `activo`). El frontend actual no lo llama: guarda el usuario del login en `localStorage`. |

No hay refresh, logout ni registro público.

### `UsuariosController` — clase con `JwtAuthGuard` + `RolesGuard`

Todos los métodos exigen `ADMIN`.

| Método | Ruta | Para qué |
| --- | --- | --- |
| GET | `/usuarios` | Lista id, nombre, apellido, email, rol, activo, createdAt. Orden por apellido. |
| GET | `/usuarios/:id` | Detalle, incluye `updatedAt`. 404 si no existe. |
| POST | `/usuarios` | Alta. 409 si el email existe. |
| PATCH | `/usuarios/:id/password` | Reemplaza el hash. No pide la password anterior. |
| PATCH | `/usuarios/:id/estado` | Cambia `activo`. El body no es un DTO de clase. |
| PATCH | `/usuarios/:id/rol` | Cambia rol. Impide cambiar el rol propio y cambiar al mismo rol. |

No hay PATCH de nombre, apellido ni email, ni DELETE.

### `AreasController` — clase con `JwtAuthGuard`

| Método | Ruta | Rol | Para qué |
| --- | --- | --- | --- |
| GET | `/areas` | Cualquier autenticado | Áreas con `activo: true`, orden por nombre. |
| POST | `/areas` | `ADMIN` (`RolesGuard` en el método) | Alta. 409 si el nombre existe. |

El frontend solo consume el GET.

### `SectoresController` — clase con `JwtAuthGuard`

| Método | Ruta | Rol | Para qué |
| --- | --- | --- | --- |
| GET | `/sectores` | Cualquier autenticado | Sectores activos, con área (`id`, `nombre`). No filtra área inactiva. |
| GET | `/sectores/area/:areaOperativaId` | Cualquier autenticado | Sectores activos de un área activa. 404 si el área no existe o está inactiva. |
| POST | `/sectores` | `ADMIN` | Alta. 404 si el área no existe o está inactiva. 409 si el número ya existe en el área. |

El frontend solo consume el GET por área.

### `AgentesController` — clase con `JwtAuthGuard`

| Método | Ruta | Rol | Para qué |
| --- | --- | --- | --- |
| GET | `/agentes` | Cualquier autenticado | Todos, activos e inactivos, con área. |
| GET | `/agentes/area/:areaOperativaId` | Cualquier autenticado | Solo activos del área. 404 si el área no existe o está inactiva. Declarado antes de `GET :id`. |
| GET | `/agentes/:id` | Cualquier autenticado | Detalle con área. 404 si no existe. |
| POST | `/agentes` | `ADMIN` o `SUPERVISOR` | Alta en un área activa. |
| PATCH | `/agentes/:id/estado` | `ADMIN` o `SUPERVISOR` | Activa o desactiva. Al reactivar exige área activa. Declarado antes de `PATCH :id`. |
| PATCH | `/agentes/:id` | `ADMIN` o `SUPERVISOR` | Actualiza nombre, apellido, documento, legajo y/o área. Si cambia el área, exige área activa. |

### `SupervisionesController` — clase con `JwtAuthGuard` + `RolesGuard`

El `supervisorId` de una alta sale del JWT, no del body.

| Método | Ruta | Rol | Para qué |
| --- | --- | --- | --- |
| POST | `/supervisiones` | `ADMIN` o `SUPERVISOR` | Crea supervisión + evaluaciones en una transacción. Calcula promedio y clasificación. |
| GET | `/supervisiones/mis-supervisiones` | `SUPERVISOR` | Listado del supervisor autenticado. |
| GET | `/supervisiones/mis-metricas` | `SUPERVISOR` | Totales, mes en curso, promedio, conteo por clasificación, últimas 5. |
| GET | `/supervisiones/metricas` | `ADMIN` | Igual, global, e incluye supervisor en las últimas 5. |
| GET | `/supervisiones` | `ADMIN` | Todas, fecha descendente, sin evaluaciones. |
| GET | `/supervisiones/agente/:agenteId` | `ADMIN` | Historial del agente. 404 si el agente no existe. |
| GET | `/supervisiones/:id` | `ADMIN` o `SUPERVISOR` | Detalle con evaluaciones. El supervisor solo ve las suyas; si no, 404 (no 403). |

Rutas estáticas declaradas antes de `:id`. Correcto para Express.

El listado no selecciona `sector.numero` (solo `id` y `nombre`). El detalle de `buscarPorIdParaUsuario` incluye el sector completo.

### `BloquesEvaluacionController` — clase con `JwtAuthGuard`

| Método | Ruta | Rol | Para qué |
| --- | --- | --- | --- |
| GET | `/bloques-evaluacion` | Cualquier autenticado | Todos los bloques, activos e inactivos, con sus criterios (también inactivos), ordenados. |
| GET | `/bloques-evaluacion/:id` | Cualquier autenticado | Detalle con criterios. 404 si no existe. |
| POST | `/bloques-evaluacion` | `ADMIN` | Alta. 409 si el nombre existe. |
| PATCH | `/bloques-evaluacion/:id` | `ADMIN` | Actualiza nombre, descripción, orden y/o `activo`. 409 si el nombre pertenece a otro bloque. |

### `CriteriosEvaluacionController` — clase con `JwtAuthGuard`

| Método | Ruta | Rol | Para qué |
| --- | --- | --- | --- |
| GET | `/criterios-evaluacion` | Cualquier autenticado | Todos, con bloque. Orden bloque.orden, criterio.orden. |
| GET | `/criterios-evaluacion/bloque/:bloqueId` | Cualquier autenticado | Criterios de ese `bloqueId`, activos e inactivos. Si el bloque no existe, devuelve `[]` (no 404). Declarado antes de `GET :id`. |
| GET | `/criterios-evaluacion/:id` | Cualquier autenticado | Detalle con bloque. 404 si no existe. |
| POST | `/criterios-evaluacion` | `ADMIN` | Alta. 404 si el bloque no existe. No mira `bloque.activo`. |
| PATCH | `/criterios-evaluacion/:id` | `ADMIN` | Actualiza bloque, nombre, descripción, orden y/o `activo`. 404 si el criterio o el bloque destino no existen. |

---

## 5. Autenticación y autorización

### Flujo JWT

1. `POST /auth/login` busca por email exacto (sensible a mayúsculas).
2. Si no existe o el bcrypt no coincide: `401 Credenciales inválidas` (mismo mensaje en ambos casos).
3. Si `activo === false`: `401 Usuario inactivo`. Este mensaje sí distingue el caso.
4. Payload: `sub` = id, `email`, `rol`.
5. Firma HS256 con `process.env.JWT_SECRET`, vencimiento 8 horas. No hay refresh token.
6. En cada request protegido, `JwtStrategy.validate` vuelve a leer el usuario. Si no existe o está inactivo, `401`. Un usuario desactivado deja de pasar en el próximo request, aunque el token no haya vencido.
7. El objeto de `request.user` es el `select` de la estrategia (incluye `activo`). No incluye `passwordHash`.

El secreto se lee al cargar el módulo y al construir la estrategia, no en cada request. Si falta, el proceso no llega a escuchar (verificado).

No hay `ConfigModule` ni `dotenv` en `main.ts`. Un archivo `.env` **no** entra al proceso `nest start` por sí solo.

### Roles

Solo dos, enum Prisma: `ADMIN` y `SUPERVISOR`. No hay permisos finos ni guard por área.

`RolesGuard` está bien escrito para el caso “hay metadata de roles”: compara `usuario.rol` con la lista. No está registrado como guard global; hay que acordarse de ponerlo. En áreas, sectores, agentes, bloques y criterios el GET no lo usa, y eso es coherente con “cualquier autenticado”.

### Qué está protegido

Público:

- `GET /`
- `POST /auth/login`

Todo lo demás de los controladores de dominio exige JWT.

Resumen de autorización en `main`:

- Gestión de usuarios, alta de áreas, alta de sectores, alta/edición de bloques y criterios: solo `ADMIN`.
- Alta y edición de agentes, alta de supervisión, detalle de supervisión: `ADMIN` y `SUPERVISOR`.
- Listados de áreas, sectores, agentes, bloques y criterios: cualquier autenticado.
- Listado global de supervisiones, métricas globales e historial por agente: solo `ADMIN`.
- “Mis supervisiones” y “mis métricas”: solo `SUPERVISOR`. Un admin no puede llamar esas dos rutas (403). Usa las globales.
- Un supervisor no puede abrir la supervisión de otro: el filtro agrega `supervisorId` y el fallo es 404.

### Huecos de este flujo (detalle en las secciones 13 y 8)

- El pipe de validación no corre, así que el DTO de login no se valida.
- Un `ADMIN` puede crear una supervisión a su propio nombre (`supervisorId` = su id). El servicio no exige que ese usuario tenga rol `SUPERVISOR`.
- Un supervisor puede crear agentes y supervisiones en cualquier área. No hay asignación territorial en `main`.
- No hay protección contra desactivar al propio admin ni al último admin.
- El frontend confía en el `rol` guardado en `localStorage` para ocultar pantallas (`AdminRoute`). La autorización real está en el backend; la del browser no sustituye a los guards.

---

## 6. Base de datos / ORM

ORM: **Prisma Client 6.19.3** (`@prisma/client` + CLI `prisma` en devDependencies). Provider **PostgreSQL**. No hay `synchronize` de TypeORM. El esquema cambia solo por migraciones Prisma.

Archivos:

- `prisma/schema.prisma` — modelos y `url = env("DATABASE_URL")`.
- `prisma.config.ts` — `defineConfig` de `prisma/config`, `engine: "classic"`, `datasource.url = env("DATABASE_URL")`, importa `dotenv/config`.
- `prisma/migrations/migration_lock.toml` — provider `postgresql`.
- `prisma/migrations/20260812130015_inicio/migration.sql` — única migración en `main`.
- `package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`.

`prisma.config.ts` avisa que **pisa** la clave `package.json#prisma` (deprecada hacia Prisma 7). Hoy `npx prisma db seed` igual ejecuta `tsx prisma/seed.ts` (comprobado). En Prisma 7 ese seed hay que declararlo en el config. **DECISIÓN PENDIENTE DE CONFIRMAR** si se va a subir de major.

`dotenv` no está en `dependencies` ni `devDependencies`. `prisma.config.ts` lo importa. Hoy resuelve porque `prisma` lo trae transitivo (`dotenv@16.6.1` en el lockfile). El propio comentario del config dice instalar `dotenv`. Es frágil.

Prisma, al detectar `prisma.config.ts`, **no** carga `.env` por su cuenta (`Prisma config detected, skipping environment variable loading`). La carga queda a cargo del `import "dotenv/config"` de ese archivo. Eso aplica a la CLI de Prisma, no a `nest start`.

`prisma generate` falla si `DATABASE_URL` no está definida, aunque no conecte a la base (comprobado: `PrismaConfigEnvError`).

No hay scripts npm `prisma:migrate`, `prisma:seed` ni `postinstall`.

Variables que el código lee:

| Variable | Dónde | Obligatoria para arrancar |
| --- | --- | --- |
| `DATABASE_URL` | schema Prisma, `prisma.config.ts`, cliente en runtime | Sí, para CLI Prisma y para `PrismaService.onModuleInit` |
| `JWT_SECRET` | `src/auth/auth.module.ts`, `src/auth/strategies/jwt.strategies.ts` | Sí, antes de escuchar |
| `SEED_ADMIN_EMAIL` | `prisma/seed.ts` | No. Fallback `admin@supervision.local` |
| `SEED_ADMIN_PASSWORD` | `prisma/seed.ts` | No. Hay fallback en claro en `prisma/seed.ts` (línea 85) |

No hay `.env` commiteado (está en `.gitignore`) ni `.env.example`. El `README.md` no menciona ninguna de estas variables.

---

## 7. Funcionalidades ya implementadas

Estas piezas están escritas y conectadas de punta a punta en servicios (la validación de DTO no corre; ver sección 8):

- Login con bcrypt (cost 10), rechazo de inactivos y JWT de 8 h que se revalida contra la base.
- Alta de usuarios por un admin, con email único y hash. Listado y detalle sin devolver el hash.
- Cambio de password, de estado y de rol. El cambio de rol bloquea la autoedición y el no-op.
- Alta y listado de áreas operativas activas, con nombre único.
- Alta y listado de sectores, con número único por área y comprobación de área activa.
- Agentes: alta, listado general (incluye inactivos, para poder reactivarlos), listado por área solo activos, detalle, edición y cambio de estado. Al reactivar se exige que el área siga activa. Al mover de área se exige área activa.
- Catálogo de bloques y criterios: alta, edición, activar/desactivar el registro, listados ordenados. El seed carga el instrumento de 6 bloques.
- Alta de supervisión en transacción:
  - supervisor del token existe y está activo;
  - agente existe y está activo;
  - área existe, está activa y es la del agente;
  - sector existe, está activo y es de esa área;
  - al menos una evaluación;
  - criterios no repetidos;
  - cada criterio existe y está activo;
  - promedio con el mismo peso por criterio enviado, redondeo a 2 decimales, `Decimal(4,2)`;
  - clasificación por umbrales fijos en código (sección 16);
  - copia de nombre y descripción del criterio.
- Consultas de supervisiones separadas por rol (propias vs globales), detalle con ese mismo alcance, historial por agente (admin) y métricas (total, mes calendario del servidor, promedio, conteo por clasificación, últimas 5).
- El frontend de `main` consume estas rutas (login, usuarios, agentes, áreas, sectores por área, supervisiones, bloques, criterios). El PDF es cliente.

---

## 8. Funcionalidades incompletas o rotas

No implica que haya que implementarlas todas. Donde el código no dice la regla de negocio, queda en la sección 16.

### El validador no está activo

`src/main.ts` importa `ValidationPipe` y no llama `app.useGlobalPipes`. Efecto: se puede hacer login con body vacío o mal formado, crear usuarios sin los `@MinLength` / `@IsEmail` / `@IsEnum`, y mandar puntuaciones fuera de 1–5. Los DTO existen y están bien encaminados; no se aplican.

Además, cuando se active el pipe va a hacer falta `transform: true` para `@Type` de `CrearSupervisionDto.evaluaciones`. Hoy ese DTO no tiene `@IsArray()`.

### `PATCH /usuarios/:id/estado` sin DTO

`src/usuarios/usuarios.controller.ts` tipa el body como `{ activo: boolean }` inline. Aunque se encienda el pipe global, ese objeto no se valida. No hay clase en `src/usuarios/dto/`.

### Catálogo y territorio sin ciclo de vida completo

El modelo tiene `activo` en área y sector, pero no hay PATCH para editarlos ni para desactivarlos. Una vez creados, la API no los baja. El listado de áreas oculta los inactivos, así que tampoco hay cómo verlos.

No hay endpoints para editar o borrar una supervisión. Las evaluaciones solo se crean junto con la supervisión; no hay PATCH de una puntuación.

Desactivar un bloque (`ActualizarBloqueDto.activo`) no desactiva sus criterios. `SupervisionesService.crear` filtra `criterio.activo` y no mira `bloque.activo`. Un bloque inactivo puede seguir puntuándose.

`CriteriosEvaluacionService.listarPorBloque` no comprueba que el bloque exista.

`CriteriosEvaluacionService.crear` no exige bloque activo.

### Alta de supervisión más laxa que el instrumento del seed

El servicio exige “al menos una” evaluación, no “todos los criterios activos”. El promedio sale solo de las enviadas. Una sola puntuación 5 clasifica `EXCELENTE`. El comentario del servicio dice que todos los criterios tienen el mismo peso; no dice que el formulario deba estar completo. **DECISIÓN PENDIENTE DE CONFIRMAR** si el instrumento es obligatorio completo.

### Admin como supervisor de hecho

`POST /supervisiones` permite rol `ADMIN`. `supervisorId` es el id del token. El servicio no comprueba `rol === SUPERVISOR`. Queda una supervisión atribuida al admin.

### Tests que no prueban nada y además fallan

Specs de CLI sin mocks. Jest en esta revisión: **12 failed, 2 passed**.

Fallan porque el `TestingModule` no provee `PrismaService` y/o el servicio/controlador hijo, por ejemplo:

- `src/usuarios/usuarios.service.spec.ts`, `src/usuarios/usuarios.controller.spec.ts`
- `src/auth/auth.service.spec.ts`, `src/auth/auth.controller.spec.ts`
- `src/agentes/agentes.service.spec.ts`, `src/agentes/agentes.controller.spec.ts`
- `src/areas/areas.service.spec.ts`, `src/areas/areas.controller.spec.ts`
- `src/sectores/sectores.service.spec.ts`, `src/sectores/sectores.controller.spec.ts`
- `src/supervisiones/supervisiones.service.spec.ts`, `src/supervisiones/supervisiones.controller.spec.ts`

Pasan: `src/app.controller.spec.ts`, `src/prisma/prisma.service.spec.ts` (solo `toBeDefined`, no conecta).

`test/app.e2e-spec.ts` levanta `AppModule` entero. Sin `JWT_SECRET` y sin Postgres no puede pasar. No se ejecutó contra una base.

Bloques y criterios no tienen spec.

### Documentación de arranque

`README.md` es la plantilla de NestJS. No dice Postgres, Prisma, ni variables. Quien siga solo el README no llega a un servidor sano.

### Contrato de listado vs detalle

`SupervisionesService.listar` y `listarPorSupervisor` no incluyen `sector.numero`. El tipo del frontend lo marca opcional. La pantalla puede mostrar un sector sin número.

### Seed y catálogo

El upsert del admin no actualiza la password. Si se cambia `SEED_ADMIN_PASSWORD` y el email ya existe, la clave vieja sigue.

Textos de criterios con typos en `prisma/seed.ts` (bloques “PROGRAMAS PRIORITARIOS” y “VIGILANCIA Y RIESGO”).

---

## 9. Errores encontrados

### P0 — impide levantar el proceso

1. Sin `JWT_SECRET` el proceso muere al construir `JwtStrategy`: `JwtStrategy requires a secret or key`. Verificado con `nest start`.
2. Sin `DATABASE_URL` el proceso registra rutas y muere en `PrismaService.onModuleInit` (P1012). Verificado.
3. `nest start` no carga `.env`. Aunque exista el archivo, estas dos variables tienen que estar en el entorno del proceso, o hay que incorporar carga de entorno en una fase posterior. `prisma.config.ts` sí importa `dotenv/config`, pero solo para la CLI.
4. `npx prisma generate` también exige `DATABASE_URL` (`prisma.config.ts`), aunque no abra una conexión. Sin cliente generado, los imports de `@prisma/client` no sirven en un clone limpio. No hay `postinstall`.

No hay error de TypeScript en `main`: `tsc --noEmit` pasó.

### P1 — el servidor puede llegar a escuchar, pero el comportamiento es incorrecto o inseguro

1. `ValidationPipe` importado y no usado (`src/main.ts`). Toda la validación de DTO está muerta, incluidos login, password mínima y puntuación 1–5.
2. Password de admin por defecto escrita en `prisma/seed.ts` si no se define `SEED_ADMIN_PASSWORD`.
3. `PATCH /usuarios/:id/estado` acepta cualquier body (`src/usuarios/usuarios.controller.ts`).
4. Un admin puede desactivarse a sí mismo (`UsuariosService.cambiarEstado` no compara ids). No hay guarda del último admin.
5. Desactivar un bloque no saca sus criterios de la supervisión (`bloques-evaluacion.service.ts` + `supervisiones.service.ts`).
6. `npm test` queda en rojo (12 suites). No protege regresiones.
7. `dotenv` usado por `prisma.config.ts` y no declarado en `package.json`.
8. El README no documenta el arranque real. Riesgo operativo, no un throw en caliente.

### P2 — deuda que no tira el proceso

1. `noImplicitAny: false` y varias reglas estrictas apagadas en `tsconfig.json`.
2. `IsEmail` importado y no usado en `src/agentes/dto/crear-agente.dto.ts`.
3. Email de usuario comparado tal cual, sin normalizar. El único de Postgres distingue mayúsculas.
4. `documento` y `legajo` del agente no son únicos. Se pueden duplicar.
5. Nombre de área único solo por igualdad exacta (`Área` y `área` pueden coexistir).
6. Métricas de “mes” usan la zona horaria del proceso Node (`new Date(año, mes, 1)`), mientras `fecha` se guarda con `new Date(dto.fecha)`.
7. Listados sin paginación. `GET /supervisiones` y `GET /agentes` traen todo.
8. `GET /` no comprueba la base.
9. CORS y puerto fijos. No hay variable para otro origen.
10. `RolesGuard` devuelve `false` si no hay `request.user` en vez de 401. Hoy el JWT guard corre antes en los controladores que lo usan, así que no se vio en el arranque.
11. Specs y e2e de plantilla. `package.json#prisma` deprecado frente a `prisma.config.ts`.
12. `npm audit` del lockfile reportó 10 avisos (1 moderate, 9 high) en dependencias transitivas. No se revisó cada CVE en esta pasada.
13. Typos de textos en el seed.

---

## 10. Relaciones faltantes

En `main`, mirando el modelo que ya existe, estas relaciones **no están** y el código tampoco las usa. No son un bug de FK rota. Marcarlas como trabajo solo después de confirmar la regla (sección 16), sobre todo porque la rama territorial ya modela varias.

| Relación | Estado en `main` | Para qué serviría | Ya está en la rama no mergeada |
| --- | --- | --- | --- |
| `Usuario` → `AreaOperativa` | No existe. Un supervisor no tiene territorio. | Limitar altas y lecturas al área del supervisor. | Sí: `Usuario.areaOperativaId` opcional, migración `20260909151743_asignar_area_supervisor`. |
| `AgenteSanitario` → `Sector` | No existe. El sector vive solo en `Supervision`. | Saber el sector habitual del agente y validar la supervisión contra ese sector. | Sí: `AgenteSanitario.sectorId` opcional. |
| `Zona` → `AreaOperativa` | No existe la entidad `Zona`. | Agrupar áreas (dato territorial externo). | Sí: modelo `Zona` y `AreaOperativa.zonaId`. |
| `Ronda` → `Supervision` | No existe. `Supervision.rondaNumero` es un `Int?` suelto. | Catálogo de rondas en lugar de un número libre. | Sí: modelo `Ronda` y `Supervision.rondaId` opcional. `rondaNumero` se conserva. |
| `Supervision.sectorId` opcional | En `main` es obligatorio. | Supervisar sin sector. | Sí: pasa a `Int?` en `20260908124925_supervision_sector_opcional`. |
| Ids externos (`externalAreaId`, `externalSectorId`, `externalUserId`, `externalUuid`, etc.) | No existen. | Importar el padrón territorial sin pisar los ids internos. | Sí, en el schema de esa rama. |
| Criterio único por bloque | No hay `@@unique([bloqueId, nombre])`. El seed lo simula en aplicación. | Evitar criterios duplicados. | No aparece como cambio de unicidad en el schema leído de la rama. |
| Cascade al desactivar bloque → criterios | No es una FK; es una regla que el servicio no hace. | Coherencia del catálogo. | No revisado como cambio de schema. |

No hace falta una tabla intermedia para las relaciones actuales: son todas N a 1.

No borrar `EvaluacionCriterio.criterioNombre` / `criterioDescripcion`: son la foto histórica, no un duplicado accidental.

---

## 11. Endpoints faltantes

Solo se listan huecos que el propio modelo o el frontend de `main` dejan a la vista. El resto es **DECISIÓN PENDIENTE DE CONFIRMAR**.

Implícitos por el modelo (`activo` ya existe y no hay forma de operarlo):

- Editar y desactivar `AreaOperativa`.
- Editar y desactivar `Sector`.
- Listar áreas o sectores inactivos (hoy el GET de áreas los esconde).

El frontend de `main` no llama altas de área ni de sector: o se cargan por API/manual, o no hay pantalla. No hay un cliente roto por una ruta ausente en `main`. Las rutas que `frontend/src/services/` llama existen en los controladores de `main`.

`GET /auth/me` existe y el frontend no lo usa. No falta; sobra respecto del cliente actual. Conviene conservarlo: el comentario de `AuthContext` dice que el usuario sale del login.

No hay, y el código de `main` no los pide:

- refresh / logout / cambio de password del propio usuario;
- edición de nombre, apellido o email de usuario;
- edición o anulación de una supervisión;
- paginación y filtros de supervisiones;
- export PDF en el servidor (el PDF es del frontend).

Esos puntos sí aparecen en `origin/feature/integracion-datos-territoriales` (paginación, filtros por fecha y clasificación, `GET /supervisiones/exportacion`, `GET /zonas`, `GET /rondas`, `PATCH /usuarios/:id`, `PATCH /usuarios/:id/area-operativa`). No son “endpoints que `main` olvidó”: son trabajo de esa rama.

Ojo al merge, porque esa rama también **saca** contratos que `main` y su frontend sí usan:

- `PATCH /usuarios/:id/rol` no está en el controller de la rama (el comentario dice que el rol no se modifica por el PATCH general).
- `AgentesController` de la rama solo tiene GET (listar, por área, por id). No están POST, PATCH ni `PATCH :id/estado`.
- `AreasController` y `SectoresController` de la rama solo tienen GET.

Eso encaja con un padrón importado (`prisma/importar-datos-territoriales.ts`, script `import:territorial`), no con el ABM manual de `main`.

---

## 12. Validaciones faltantes

Las clases DTO ya declaran casi todas las reglas. El agujero principal es que **no hay pipe global**, así que ninguna corre.

Cuando se active, revisar además:

| Caso | Estado del código |
| --- | --- |
| Login email/password | DTO correcto (`login.dto.ts`). No corre. |
| Alta de usuario: nombre, apellido, email, password ≥ 8, rol enum | DTO correcto. No corre. No hay máximo de longitud ni normalización de email. |
| Cambio de password ≥ 8 | DTO correcto. No corre. No se pide la clave actual (es un admin cambiando la de otro; puede ser intencional). |
| Cambio de rol enum | DTO correcto. No corre. |
| Cambio de estado de usuario | **No hay DTO.** |
| Área: nombre requerido, descripción opcional | DTO correcto. No corre. No hay trim ni unicidad case-insensitive (la unicidad exacta sí está en el servicio). |
| Sector: `numero` y `areaOperativaId` enteros ≥ 1 | DTO correcto. No corre. |
| Agente alta/edición | DTO correcto salvo el import muerto de `IsEmail`. No corre. Documento y legajo sin formato. |
| Estado de agente `activo` boolean | DTO correcto. No corre. |
| Supervisión | DTO con ids, fecha ISO, enums, textos opcionales, evaluaciones anidadas, puntuación 1–5. Falta `@IsArray()` en `evaluaciones`. `@ValidateNested` no va a transformar instancias si el pipe no usa `transform: true`. No corre. |
| El servicio de supervisión, además del DTO | Sí corre, porque está en el service: agente activo, área activa y coincidente, sector activo y de esa área, evaluaciones no vacías, criterios únicos, criterios activos. Eso se mantiene aunque el pipe siga apagado. |
| Bloque y criterio | DTO de alta y de update correctos. No corren. Update de nombre de bloque no tiene `@IsNotEmpty()` (un string vacío pasaría el DTO). |
| Puntuación y fecha inválida | Sin pipe, `new Date(dto.fecha)` puede ser Invalid Date y Prisma rechaza o guarda mal. La puntuación puede ser cualquier número y el promedio se calcula igual. |
| Whitelist | No hay `whitelist` / `forbidNonWhitelisted`. Un cliente puede mandar `promedio` o `clasificacion` en el body; el service no los copia del DTO (los calcula), así que hoy no pisan el cálculo. Conviene cerrarlo igual al encender el pipe. |

No hay `ValidationPipe` a nivel de método en ningún controlador.

---

## 13. Authz gaps

Lo que ya está cerrado: usuarios solo admin; escrituras de catálogo (bloques, criterios, áreas, sectores) solo admin; supervisiones globales solo admin; un supervisor no lee la supervisión de otro.

Lo que sigue abierto en `main`:

1. **Sin territorio.** Cualquier `SUPERVISOR` (y cualquier `ADMIN`) lista todas las áreas, sectores, agentes y el catálogo, y puede crear agentes y supervisiones en cualquier área. No es un olvido de un `@Roles` que ya exista: el modelo no tiene área en el usuario.
2. **Admin crea supervisiones a su nombre** sin ser `SUPERVISOR`.
3. **Auto-desactivación** del admin y ausencia de “último admin”.
4. **Cambio de password de terceros** solo con rol admin, sin auditoría y sin confirmar la password del admin. El endpoint está protegido por rol; el gap es de control operativo, no de ruta pública.
5. **`GET /` público** no filtra datos. No es un agujero de datos; sí indica que no hay una política explícita de superficie pública más allá del login.
6. **JWT en `localStorage`** (frontend) y rol de UI tomado de ahí. Si el rol cambia en el servidor, el menú sigue el valor viejo hasta un nuevo login. Las APIs sí revalidan. `GET /auth/me` podría usarse para refrescar el perfil; hoy no se usa.
7. **No hay revocación** distinta de desactivar al usuario o esperar 8 h. No hay lista de tokens.
8. **`RolesGuard` no es global.** Un endpoint nuevo sin guard queda público. Hoy los controladores de dominio sí tienen `JwtAuthGuard` en la clase. `AppController` no, a propósito de la plantilla.
9. **CORS** abierto solo a `http://localhost:5173`. No es un agujero de autorización; un despliegue con otro origen queda bloqueado por el browser. La API sigue siendo llamable fuera del browser si alguien tiene el token.
10. Secreto JWT sin longitud mínima ni rotación. Si `JWT_SECRET` es corto, el arranque igual sigue.

La rama territorial agrega `ForbiddenException` cuando un supervisor no tiene área o cuando el agente no es de su área, y fuerza el `areaOperativaId` del supervisor. Eso no está en `main`. No copiarlo a ciegas: primero confirmar que esa rama es la base (sección 16).

---

## 14. Problemas de arquitectura y código

Mantener NestJS, TypeScript, módulos actuales y Prisma. No reescribir.

1. **Configuración dispersa.** Puerto, CORS, secreto JWT y URL de base se leen en sitios distintos, parte en tiempo de import. Un `ConfigModule` (paquete ya habitual de Nest, hoy no está en `package.json`) o una carga explícita de entorno al inicio de `main.ts` concentra eso sin mover módulos. Hoy `@nestjs/config` no es dependencia: agregarlo es un cambio de fase 2, no de este diagnóstico.
2. **`ValidationPipe` global** en `main.ts`, con `transform: true` y whitelist, más el DTO que falta de estado de usuario. Es un arreglo chico y de alto efecto. No hace falta tocar la forma de los módulos.
3. **`PrismaService` global está bien.** No hace falta un módulo de base distinto.
4. **Lógica de supervisión concentrada en un método `crear` largo** (`src/supervisiones/supervisiones.service.ts`). Se puede partir en funciones privadas del mismo servicio (existencia de agente, de área, de criterios, promedio). No hace falta un motor de reglas nuevo.
5. **Clasificación y promedio están hardcodeados** en el servicio (umbrales 2.5 / 3.5 / 4.5, peso igual). Si el negocio los confirma, dejarlos en un solo lugar con nombre, no repartirlos por el frontend.
6. **Denormalización de la evaluación** (nombre y descripción copiados) es intencional. Conservarla.
7. **Specs de plantilla** que instancian el servicio real sin Prisma. O se mockea `PrismaService` o se borran los `it('should be defined')` que no documentan comportamiento. No agregan una suite paralela.
8. **`README.md` de plantilla** convive con un sistema real. Actualizarlo es documentación, no un rediseño. Hoy miente por omisión sobre cómo se levanta.
9. **Dos orígenes de verdad de “prisma seed”** (`package.json` y `prisma.config.ts`). Dejar uno cuando se decida la versión de Prisma.
10. **Estilo desigual** (imports en una línea vs. un símbolo por línea, sobre todo en agentes y supervisiones). No cambia comportamiento. No vale un reformat masivo mezclado con correcciones.
11. **El frontend y el backend comparten repo** pero no comparten pipeline. El diagnóstico de fase 2 del backend no debería arrastrar un rediseño de React.
12. **No reemplazar el ABM de `main` por el import territorial** sin decidir la rama base. Son dos formas de cargar agentes y áreas.

---

## 15. Prioridad de trabajo recomendada

Fase 2, sin código en esta entrega. Orden sugerido:

1. **Confirmar la base** (sección 16, primera decisión): seguir desde `main` o desde `origin/feature/integracion-datos-territoriales`. No implementar zonas, rondas ni área del supervisor sobre `main` si esa rama ya es el trabajo vigente, ni mergearla sin revisar los endpoints que esa rama eliminó.
2. **Hacer que un clone arranque de forma repetible:** documentar variables, cargar entorno en el proceso Nest, declarar `dotenv` si la CLI lo sigue importando, `prisma generate` después de tener `DATABASE_URL`, una migración aplicada y el seed. Sacar el fallback de password del código o dejarlo solo detrás de una variable obligatoria.
3. **Encender `ValidationPipe`** (`transform`, `whitelist`) y agregar el DTO de `cambiarEstado` de usuario. Probar login, alta de usuario, alta de supervisión con puntuación fuera de rango y body de más.
4. **Revisar reglas que ya están a medias en `main`:** bloque inactivo vs criterios activos; admin que se desactiva a sí mismo; si el admin puede ser `supervisorId`.
5. **Arreglar o reemplazar los 12 specs rotos** antes de sumar features, para que `npm test` signifique algo. El e2e necesita Postgres y las dos variables.
6. **Recién ahí**, si la decisión de la sección 16 es “no vamos a usar la rama territorial”, diseñar área de supervisor, sector del agente y rondas como migración Prisma nueva, sin borrar las FK actuales.
7. Si la decisión es “la rama territorial es la base”, el trabajo pasa a ser revisión de esa rama (authz territorial, paginación, import, y el recorte de POST/PATCH de agentes y de cambio de rol), no reescribir `main`.
8. Deuda P2 (paginación en `main`, `sector.numero` en listados, normalización de email, unicidad de documento/legajo, typos del seed, README) después de los puntos 2 a 5.

---

## 16. Decisiones pendientes de confirmar

1. **¿La fase 2 parte de `main` o de `origin/feature/integracion-datos-territoriales`?** Esa rama (commits posteriores a `f26f7f8`, último visto `2a0d88a`) agrega zonas, rondas, área del supervisor, sector del agente, ids externos, sector de supervisión opcional, paginación, filtros, export de supervisiones e import (`import:territorial`, `prisma/datos-territoriales.sql`, `prisma/datos-users.sql`). También quita el cambio de rol dedicado y las escrituras de agentes, áreas y sectores. `main` no contiene ese código.
2. **¿Un supervisor debe quedar atado a un área operativa?** En `main` no. En la otra rama sí, y la alta de supervisión lo exige.
3. **¿El agente tiene un sector fijo?** En `main` no. En la otra rama, `sectorId` opcional, y la supervisión lo contrasta.
4. **¿Áreas, sectores y agentes se cargan a mano por la API o salen de un padrón externo?** `main` tiene ABM parcial. La otra rama se apoya en el import y deja esos recursos en solo lectura.
5. **¿Un `ADMIN` puede figurar como supervisor de una supervisión?** Hoy la ruta lo permite.
6. **¿La supervisión debe incluir todos los criterios activos o basta un subconjunto?** Hoy basta uno. Los umbrales del promedio están solo en `calcularClasificacion`: `<= 2.5` CRITICO, `<= 3.5` REGULAR, `<= 4.5` BUENO, si no EXCELENTE, sobre una escala de puntuación 1–5 declarada en el DTO. No están escritos en el README ni en el seed.
7. **¿Desactivar un bloque debe desactivar sus criterios y excluirlos de supervisiones nuevas?** Hoy no.
8. **¿Hace falta editar o anular una supervisión ya guardada?** No hay endpoint ni texto que lo pida.
9. **¿Hace falta que un usuario edite su propio perfil o su propia password?** No está implementado. El admin puede cambiar la password de cualquiera.
10. **¿El número de ronda sigue siendo un entero libre (`rondaNumero`) o pasa a ser la entidad `Ronda` de la otra rama?**
11. **¿Documento y legajo deben ser únicos?** El schema no lo dice.
12. **¿Se actualiza Prisma a 7?** El config actual ya advierte que `package.json#prisma` se elimina en Prisma 7. No hay decisión en el repo.
13. **Origen de CORS y puerto** para algo distinto de `localhost:5173` y `3000`. No hay variable ni comentario de despliegue.
14. **Textos con typos del seed:** si ya hay bases cargadas, corregirlos en el seed no reescribe criterios ya insertados (el seed solo actualiza `orden` y `activo` si el nombre coincide). Hace falta confirmar si esos textos ya están en producción.
15. No hay requisito de módulo “materias” en este repositorio. Si ese nombre viene de otro sistema, no corresponde mapearlo aquí sin una definición explícita.

---

## 17. Cómo levantar el backend hoy

Lo único que el `README.md` documenta es:

```bash
npm install
npm run start
npm run start:dev
npm run start:prod
```

Eso no alcanza. Con solo esos comandos el proceso no queda en pie: falta el cliente Prisma, `JWT_SECRET` y `DATABASE_URL`, y un Postgres con la migración. No hay `.env.example`. Los pasos de abajo están reconstruidos del código y comprobados en esta revisión; no son una guía oficial del repo.

Variables que el código lee:

- `DATABASE_URL` — URL de PostgreSQL. La usan el schema, `prisma.config.ts` y el cliente en runtime.
- `JWT_SECRET` — secreto HMAC del JWT. Sin valor, `JwtStrategy` lanza al arrancar.
- `SEED_ADMIN_EMAIL` — opcional. Si no está, el seed usa `admin@supervision.local`.
- `SEED_ADMIN_PASSWORD` — opcional. Si no está, el seed usa el literal de `prisma/seed.ts` línea 85. No dejar ese fallback en un entorno compartido.

Secuencia que el código soporta, con las variables ya exportadas en la shell (porque `nest start` no lee `.env`):

```bash
npm install
# DATABASE_URL y JWT_SECRET tienen que existir en el entorno
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Notas de esa secuencia:

- `prisma generate` falla si `DATABASE_URL` no está definida, aunque la base esté apagada.
- `prisma migrate deploy` aplica `prisma/migrations/20260812130015_inicio`. Hace falta un Postgres vacío o ya alineado con esa migración. No hay Docker Compose ni servicio descrito en el repo.
- `prisma db seed` corre `tsx prisma/seed.ts` (comprobado). Necesita la base alcanzable. Crea el admin y los 6 bloques. No crea áreas, sectores ni agentes: sin eso no se puede cargar una supervisión por API.
- El servidor escucha en el puerto **3000**. CORS solo acepta `http://localhost:5173`.
- Comprobar: `GET http://localhost:3000/` responde `Hello World!` si el proceso llegó a escuchar. El login es `POST http://localhost:3000/auth/login` con `{ "email", "password" }`.

El frontend, si se quiere ver junto, es otro paquete (`frontend/`, `npm run dev`, Vite). Su README también es plantilla. El cliente ya apunta a `http://localhost:3000`.

No usar la rama `feature/integracion-datos-territoriales` como si fuera el procedimiento de `main`: tiene migraciones extra y el script `import:territorial`.
