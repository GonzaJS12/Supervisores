const STARTUP_ENV = ['DATABASE_URL', 'JWT_SECRET'] as const;

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env y definila antes de continuar.`,
    );
  }

  return value;
}

export function assertStartupEnv(): void {
  const missing = STARTUP_ENV.filter((name) => {
    const value = process.env[name];
    return value === undefined || value.trim() === '';
  });

  if (missing.length === 0) {
    return;
  }

  throw new Error(
    `Faltan variables de entorno: ${missing.join(', ')}. Copiá .env.example a .env y definilas antes de iniciar el servidor.`,
  );
}
