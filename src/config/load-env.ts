import 'dotenv/config';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'] as const;

const missing = REQUIRED_ENV.filter((name) => {
  const value = process.env[name];
  return value === undefined || value.trim() === '';
});

if (missing.length > 0) {
  console.error(
    `Faltan variables de entorno obligatorias: ${missing.join(', ')}. Copiá .env.example a .env y completá los valores antes de iniciar la API.`,
  );
  process.exit(1);
}
