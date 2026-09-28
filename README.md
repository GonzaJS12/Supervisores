# Supervisión de agentes sanitarios

API **NestJS** + **Prisma** + **PostgreSQL** para usuarios, áreas operativas, sectores, zonas, rondas, agentes sanitarios y supervisiones.

- API: `http://localhost:3000`
- CORS por defecto hacia el frontend Vite: `http://localhost:5173` (configurable con `CORS_ORIGIN`)

Rama de trabajo de este desarrollo: **`mati-rama`** (sobre `feature/integracion-datos-territoriales`).

## Requisitos

| Herramienta | Versión |
| --- | --- |
| Node.js | **20 o superior** (recomendado 22 LTS; el campo `engines` pide `>=20`) |
| npm | El que viene con Node |
| PostgreSQL | 14+ (en esta PC suele escuchar en el puerto **5433**) |

## Instalación rápida (desde cero)

```bash
git clone https://github.com/GonzaJS12/Supervisores.git
cd Supervisores
git checkout mati-rama
npm install
```

Si ya tenés el repo clonado:

```bash
cd C:\Users\Matia_g1ho56o\Supervisores
git checkout mati-rama
npm install
```

> **Nota:** `npm install` ejecuta `prisma generate` automáticamente **solo si** ya existe `DATABASE_URL` en el entorno. Si todavía no creaste el `.env`, corré `npx prisma generate` después de configurarlo.

## Configuración (`.env`)

```bash
copy .env.example .env
```

Editá `.env` y completá al menos:

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | **Sí** (API, Prisma, import) | Conexión PostgreSQL. Ejemplo con puerto **5433**: `postgresql://postgres:TU_PASSWORD@localhost:5433/supervisores?schema=public` |
| `JWT_SECRET` | **Sí** (API) | Secreto largo y aleatorio para firmar JWT. No lo subas al repo. |
| `JWT_EXPIRES_IN` | No | Default `8h` |
| `CORS_ORIGIN` | No | Default `http://localhost:5173`. Varios orígenes: separados por coma |
| `SUPERVISIONES_EXPORT_MAX` | No | Default `500` (tope de `GET /supervisiones/exportacion`) |
| `SEED_ADMIN_EMAIL` | No | Default `admin@supervision.local` |
| `SEED_ADMIN_PASSWORD` | **Sí para el seed** | Contraseña del admin. No hay default. Re-ejecutar el seed actualiza el hash |

La API **no arranca** si faltan `DATABASE_URL` o `JWT_SECRET` (`src/config/load-env.ts`).

## Base de datos

1. Creá la base (una vez), por ejemplo en `psql` o pgAdmin:

```sql
CREATE DATABASE supervisores;
```

2. Generá el client, aplicá migraciones y sembrá datos:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

- `migrate deploy` aplica las migraciones de `prisma/migrations` (no borra datos; no uses `migrate reset` en una DB con datos que quieras conservar).
- El seed crea/actualiza el **administrador** y los **bloques/criterios de evaluación**. Exige `SEED_ADMIN_PASSWORD` en `.env`.
- El comando de seed está definido en `prisma.config.ts` (`tsx prisma/seed.ts`).

### Importación territorial (opcional)

Después de migrar (y normalmente después del seed):

```bash
npm run import:territorial
```

Carga zonas, áreas, sectores, rondas y agentes sanitarios desde `prisma/datos-territoriales.sql` y `prisma/datos-users.sql` (solo filas con `role=agente`) usando `DATABASE_URL`. No crea usuarios de login del sistema: el admin sale del seed (`SEED_ADMIN_*`). No es obligatorio solo para levantar la API vacía.

El importador lee los `.sql` como **UTF-8** (tolera BOM) y aplica una reparación de mojibake histórico; ver sección **Encoding de dumps SQL** más abajo.



## Encoding de dumps SQL

Los archivos `prisma/datos-territoriales.sql` y `prisma/datos-users.sql` deben guardarse en **UTF-8** (idealmente sin BOM).

### Causa raíz de nombres corruptos (ø, ¥, Ã…)

Históricamente el dump territorial salió de un origen en **CP850** (DOS latino / MySQL antiguo). Esos bytes se interpretaron como **Latin-1 / Windows-1252** y después se regrabaron como UTF-8. Ejemplos con evidencia en hex:

| En el dump corrupto | Bytes UTF-8 | Origen CP850 | Correcto |
| --- | --- | --- | --- |
| `Bø EL TRIANGULO` | `C3 B8` (ø) | `0xF8` = ° | `B° EL TRIANGULO` |
| `CA¥AVERAL` | `C2 A5` (¥) | `0xA5` = Ñ | `CAÑAVERAL` |
| `R§ LERMA` | `C2 A7` (§) | `0xA7` = º | `Rº LERMA` |

En `datos-users.sql` el problema es **UTF-8 doblado**: p.ej. `MontaÃ±ez` (`C3 83 C2 B1`) en lugar de `Montañez` (`C3 B1`).

**No** es un bug del frontend ni de Postgres (`server_encoding`/`client_encoding` = UTF8). El importador (`fs.readFileSync(..., 'utf8')`) leía bien; la corrupción ya venía en el `.sql`.

### Qué hace el importador

`prisma/encoding-utils.ts` (usado por `prisma/importar-datos-territoriales.ts`):

1. Lee el archivo como UTF-8 (strip BOM si existe).
2. **Territorial:** remapea solo codepoints inequívocos del mojibake CP850→Latin-1 (ø→°, ¥→Ñ, §→º, µ→Á, Ö→Í, etc.). No recodifica el archivo entero a CP850 porque convive texto ya correcto (`°`, `Ñ`, `ORÁN`, `San José`).
3. **Users:** si un texto trae el telltale `Ã`, reinterpreta Latin-1→UTF-8 (deshace el doble encode).

Los `.sql` del repo ya fueron normalizados a UTF-8 correcto; la reparación en el importador queda como red de seguridad si alguien reintroduce un dump viejo.

Tras cambiar encoding o dumps:

```bash
npm run import:territorial
```

(re-upserta nombres; no hace falta `migrate reset` ni tocar el seed de admin).

## Ejecutar la API

```bash
npm run start:dev
```

Queda en **`http://localhost:3000`**.

Otros scripts: `npm run start`, `npm run build` + `npm run start:prod`.

### Comprobar que responde

```bash
curl http://localhost:3000/
```

Debería responder `Hello World!`.

### Login y JWT

Endpoint real: **`POST /auth/login`**

Body JSON:

```json
{
  "email": "admin@supervision.local",
  "password": "LA_MISMA_QUE_PUSISTE_EN_SEED_ADMIN_PASSWORD"
}
```

Respuesta (forma real del código): `{ "accessToken": "...", "usuario": { ... } }`.

Usuario autenticado: **`GET /auth/me`** con header:

```text
Authorization: Bearer <accessToken>
```

## Tests

```bash
npm test
```

Unitarios con Jest. **No** necesitan PostgreSQL.

```bash
npm run test:e2e
```

Necesitan `.env` válido con `DATABASE_URL` + `JWT_SECRET` y PostgreSQL accesible (el e2e importa `load-env` y levanta `AppModule`).

Chequeo de tipos:

```bash
npx tsc --noEmit
```

## Scripts (`package.json`)

| Script | Uso |
| --- | --- |
| `npm install` | Dependencias (+ `prisma generate` si hay `DATABASE_URL`) |
| `npm run start:dev` | API en watch (puerto 3000) |
| `npm run build` / `start:prod` | Build y producción |
| `npm test` / `test:e2e` | Tests |
| `npm run import:territorial` | Import de datos territoriales |

Prisma CLI (no son scripts npm, se invocan con `npx`):

| Comando | Uso |
| --- | --- |
| `npx prisma generate` | Client |
| `npx prisma migrate deploy` | Aplicar migraciones |
| `npx prisma db seed` | Seed admin + bloques |

## Exportación

`GET /supervisiones/exportacion` no pagina con `page`/`limit`, pero aplica un tope (default **500**, `SUPERVISIONES_EXPORT_MAX`). Si se supera → **400**.

## Licencia

UNLICENSED (privado).
