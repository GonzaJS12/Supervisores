# Supervisores

API NestJS (este paquete) y cliente React/Vite en `frontend/`. El backend usa Prisma contra PostgreSQL. Escucha en el puerto **3000**. CORS acepta `http://localhost:5173`.

## Backend

Requisitos: Node.js y un PostgreSQL alcanzable.

### Variables de entorno

Copiá `.env.example` a `.env`. No commitees `.env`.

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí, para Prisma y para arrancar | URL de PostgreSQL |
| `JWT_SECRET` | Sí, para arrancar | Secreto HMAC del JWT (8 h) |
| `SEED_ADMIN_EMAIL` | No | Email del admin del seed. Si falta: `admin@supervision.local` |
| `SEED_ADMIN_PASSWORD` | Sí, para el seed | Contraseña del admin. No hay valor por defecto en el código |

Si `DATABASE_URL` o `JWT_SECRET` faltan, el proceso termina al inicio con un error que nombra la variable. No uses secretos reales en `.env.example`.

### Puesta en marcha

```bash
npm install
cp .env.example .env
# completar DATABASE_URL, JWT_SECRET y SEED_ADMIN_PASSWORD

npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

`npm install` intenta `prisma generate` en `postinstall` solo si `DATABASE_URL` ya está definida (entorno o `.env`). En un clone nuevo, lo habitual es instalar, crear `.env` y correr `npx prisma generate` a mano.

- `npm run start` — arranque sin watch
- `npm run start:dev` — watch, puerto 3000
- `npm run start:prod` — `node dist/main` después de `npm run build`

Comprobación rápida: `GET http://localhost:3000/` responde `Hello World!`. El login es `POST http://localhost:3000/auth/login` con `{ "email", "password" }`.

El seed crea el administrador y el catálogo de bloques y criterios. No crea áreas, sectores ni agentes.

`POST /supervisiones` acepta rol `ADMIN` o `SUPERVISOR`, y la supervisión queda a nombre del usuario del token. Si un admin debe poder figurar como supervisor es una decisión de producto; el comportamiento actual se mantiene.

### Tests

```bash
npm test
```

Ejecuta las suites unitarias (`src/**/*.spec.ts`). No necesitan Postgres.

```bash
npm run test:e2e
```

El e2e levanta `AppModule` completo. Hace falta `.env` con `DATABASE_URL` y `JWT_SECRET`, y un Postgres con las migraciones aplicadas. Sin esa base, el e2e no puede pasar.

## Frontend

Paquete aparte. No entra en el build del backend. El cliente llama a `http://localhost:3000`.

```bash
cd frontend
npm install
npm run dev
```

Vite queda en `http://localhost:5173`.
