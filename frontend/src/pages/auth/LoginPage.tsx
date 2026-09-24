import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../../services/auth.service';
import { useAuth } from '../../context/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUsuario } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      const respuesta = await login({
        email,
        password,
      });

      loginUsuario(
        respuesta.accessToken,
        respuesta.usuario,
      );

      navigate('/dashboard');
    } catch (error) {
      console.error(error);

      setError(
        'Correo o contraseña incorrectos.',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* PANEL INSTITUCIONAL */}
      <section className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between">
        {/* Decoración */}
        <div
          aria-hidden="true"
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-blue-500/10"
        />

        <div
          aria-hidden="true"
          className="absolute right-24 top-1/3 h-48 w-48 rounded-full border border-white/5"
        />

        {/* Contenido */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="mx-auto w-full max-w-xl px-12 xl:px-16">
            <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-8 w-8 text-cyan-300"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v18M3 12h18"
                />
              </svg>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Gestión sanitaria
            </p>

            <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Sistema de Supervisión de Agentes Sanitarios
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Plataforma para el registro, seguimiento y
              evaluación de las supervisiones realizadas a
              los agentes sanitarios.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 text-cyan-300"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3 4.5 6v5.25c0 4.6 3.2 8.9 7.5 9.75 4.3-.85 7.5-5.15 7.5-9.75V6L12 3Z"
                    />
                  </svg>
                </div>

                <p className="font-medium text-white">
                  Supervisión
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Registro estructurado de evaluaciones.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 text-blue-300"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 19V9m5 10V5m5 14v-7m5 7V3"
                    />
                  </svg>
                </div>

                <p className="font-medium text-white">
                  Seguimiento
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Información organizada para la gestión.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-8 text-xs text-slate-500 xl:px-16">
          Acceso exclusivo para usuarios autorizados
        </div>
      </section>

      {/* LOGIN */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Encabezado móvil */}
          <div className="mb-10 lg:hidden">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7 text-cyan-300"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v18M3 12h18"
                />
              </svg>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
              Supervisión sanitaria
            </p>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-blue-600">
              Bienvenido
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Iniciar sesión
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Ingresá tus credenciales para acceder al
              sistema de supervisión.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                disabled={cargando}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="nombre@correo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={cargando}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="Ingresá tu contraseña"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="M12 7v6" />
                  <path d="M12 17h.01" />
                </svg>

                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                    />
                  </svg>

                  Ingresando...
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-center text-xs leading-5 text-slate-400">
              Sistema de Supervisión de Agentes Sanitarios
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}