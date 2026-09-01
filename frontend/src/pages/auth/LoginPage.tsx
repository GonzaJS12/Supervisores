import { useState } from 'react';
import { useNavigate } from 'react-router';

import { login } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Supervisión Sanitaria
            </h1>

            <p className="mt-2 text-slate-500">
              Sistema de supervisión de agentes
              sanitarios
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {cargando
                ? 'Ingresando...'
                : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}