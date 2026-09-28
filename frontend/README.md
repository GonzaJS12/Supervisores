# Frontend — Supervisión Sanitaria

Interfaz React + Vite del proyecto **Supervisores**.

Se conecta al backend NestJS en `http://localhost:3000` mediante la variable `VITE_API_URL`.

## Requisitos

- Node.js 20+
- Backend Supervisores en ejecución (`npm run start:dev` en la raíz del monorepo)

## Instalación

```bash
cd frontend
npm install
copy .env.example .env
```

En `.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`.

## Build

```bash
npm run build
```

## Flujo típico

1. Levantar PostgreSQL y el backend.
2. Ejecutar seed del backend (usuario admin).
3. `npm run dev` en `frontend`.
4. Iniciar sesión con el email/contraseña del seed.
5. Navegar dashboard, agentes, supervisiones y (ADMIN) usuarios / territorio / bloques / criterios.

## Autenticación

- Login: `POST /auth/login`
- Sesión: guarda `accessToken` y `usuario` en `localStorage`
- Al recargar: valida con `GET /auth/me`
- Requests protegidos: `Authorization: Bearer <accessToken>`
