import { assertStartupEnv, requireEnv } from './env';

describe('env', () => {
  const original = process.env;

  beforeEach(() => {
    process.env = { ...original };
  });

  afterAll(() => {
    process.env = original;
  });

  it('requireEnv devuelve el valor cuando está definido', () => {
    process.env.JWT_SECRET = 'secreto-de-prueba';

    expect(requireEnv('JWT_SECRET')).toBe('secreto-de-prueba');
  });

  it('assertStartupEnv nombra las variables que faltan', () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;

    expect(() => assertStartupEnv()).toThrow(
      /DATABASE_URL, JWT_SECRET/,
    );
  });
});
