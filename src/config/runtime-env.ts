import type { StringValue } from 'ms';

export const DEFAULT_JWT_EXPIRES_IN: StringValue = '8h';
export const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

/** Máximo por defecto de GET /supervisiones/exportacion (reporte PDF). */
export const DEFAULT_SUPERVISIONES_EXPORT_MAX = 500;

/**
 * Expiración JWT. Por defecto 8h (sesión de jornada laboral).
 * Variable: JWT_EXPIRES_IN (ej. 8h, 1d, 3600).
 */
export function resolveJwtExpiresIn(
  value: string | undefined = process.env.JWT_EXPIRES_IN,
): StringValue {
  const trimmed = value?.trim();
  return (trimmed && trimmed.length > 0
    ? trimmed
    : DEFAULT_JWT_EXPIRES_IN) as StringValue;
}

/**
 * Origen(es) CORS. Por defecto el frontend Vite de desarrollo.
 * Variable: CORS_ORIGIN — un origen, o varios separados por coma.
 */
export function resolveCorsOrigin(
  value: string | undefined = process.env.CORS_ORIGIN,
): string | string[] {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_CORS_ORIGIN;
  }

  const parts = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return DEFAULT_CORS_ORIGIN;
  }

  return parts.length === 1 ? parts[0] : parts;
}

/**
 * Tope de registros para exportación de supervisiones.
 * Variable opcional: SUPERVISIONES_EXPORT_MAX (entero > 0).
 */
export function resolveSupervisionesExportMax(
  value: string | undefined = process.env.SUPERVISIONES_EXPORT_MAX,
): number {
  const trimmed = value?.trim();
  if (trimmed) {
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_SUPERVISIONES_EXPORT_MAX;
}
