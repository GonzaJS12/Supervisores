# Supervisión de agentes sanitarios

API NestJS con Prisma y PostgreSQL para usuarios, áreas operativas, sectores, zonas, rondas, agentes sanitarios y supervisiones.

El frontend de Vite corre en `http://localhost:5173`. La API escucha en el puerto **3000** y habilita CORS hacia ese origen con credenciales.

## Requisitos

- Node.js 22
- PostgreSQL

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores. La API no arranca si faltan `DATABASE_URL` o `JWT_SECRET`.

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí, para la API, Prisma y el import | Conexión PostgreSQL |
| `JWT_SECRET` | Sí, para la API | Firma de los access tokens |
| `SEED_ADMIN_EMAIL` | No | Email del administrador inicial. Por defecto `admin@supervision.local` |
| `SEED_ADMIN_PASSWORD` | Sí, para el seed | Contraseña del administrador. No hay valor por defecto |

`npm run import:territorial` no define variables propias: usa `DATABASE_URL` y los volcados `prisma/datos-territoriales.sql` y `prisma/datos-users.sql`.

## Instalación

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

`npm install` ejecuta `prisma generate` solo si `DATABASE_URL` ya está definida.

El seed crea el administrador y los bloques de evaluación. Exige `SEED_ADMIN_PASSWORD`:

```bash
npx prisma db seed
```

Import territorial, opcional, después de migrar:

```bash
npm run import:territorial
```

## Ejecutar

```bash
npm run start:dev
```

También están `npm run start` y `npm run start:prod` (`node dist/main` después de `npm run build`).

## Tests

```bash
npm test
```

Los tests unitarios no necesitan PostgreSQL.

```bash
npm run test:e2e
```

El e2e levanta `AppModule` y sí necesita PostgreSQL accesible con `DATABASE_URL` (y `JWT_SECRET` si el arranque pasa por `src/main.ts`). No forma parte de la suite unitaria.

## Datos territoriales

Zonas, rondas, áreas, sectores y el alcance del supervisor (área operativa y sector del agente) se mantienen en los módulos `ZonasModule` y `RondasModule`, en los modelos Prisma y en la autorización de supervisiones y agentes.
