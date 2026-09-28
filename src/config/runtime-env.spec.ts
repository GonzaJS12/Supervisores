import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_SUPERVISIONES_EXPORT_MAX,
  resolveCorsOrigin,
  resolveJwtExpiresIn,
  resolveSupervisionesExportMax,
} from './runtime-env';

describe('runtime-env', () => {
  it('usa 8h por defecto para JWT', () => {
    expect(resolveJwtExpiresIn(undefined)).toBe(DEFAULT_JWT_EXPIRES_IN);
    expect(resolveJwtExpiresIn('')).toBe(DEFAULT_JWT_EXPIRES_IN);
    expect(resolveJwtExpiresIn('   ')).toBe(DEFAULT_JWT_EXPIRES_IN);
  });

  it('respeta JWT_EXPIRES_IN válido', () => {
    expect(resolveJwtExpiresIn('1d')).toBe('1d');
    expect(resolveJwtExpiresIn(' 12h ')).toBe('12h');
  });

  it('usa el origen Vite por defecto para CORS', () => {
    expect(resolveCorsOrigin(undefined)).toBe(DEFAULT_CORS_ORIGIN);
    expect(resolveCorsOrigin('')).toBe(DEFAULT_CORS_ORIGIN);
  });

  it('acepta un origen o varios separados por coma', () => {
    expect(resolveCorsOrigin('https://app.example.com')).toBe(
      'https://app.example.com',
    );
    expect(
      resolveCorsOrigin('http://localhost:5173, https://app.example.com'),
    ).toEqual(['http://localhost:5173', 'https://app.example.com']);
  });

  it('usa 500 por defecto para exportación', () => {
    expect(resolveSupervisionesExportMax(undefined)).toBe(
      DEFAULT_SUPERVISIONES_EXPORT_MAX,
    );
    expect(resolveSupervisionesExportMax('0')).toBe(
      DEFAULT_SUPERVISIONES_EXPORT_MAX,
    );
    expect(resolveSupervisionesExportMax('abc')).toBe(
      DEFAULT_SUPERVISIONES_EXPORT_MAX,
    );
  });

  it('respeta SUPERVISIONES_EXPORT_MAX entero positivo', () => {
    expect(resolveSupervisionesExportMax('100')).toBe(100);
    expect(resolveSupervisionesExportMax(' 250 ')).toBe(250);
  });
});
