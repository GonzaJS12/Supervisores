import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

import { login } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { obtenerMensajeError } from '../../utils/http-error';
import Button from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/FeedbackBlock';
import { Field, Input } from '../../components/ui/FormField';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUsuario, estaAutenticado, cargandoSesion } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    document.title = 'Ingresar | Supervisión Sanitaria';
  }, []);

  if (cargandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Validando sesión…
      </div>
    );
  }

  if (estaAutenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await login({ email, password });
      loginUsuario(respuesta.accessToken, respuesta.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'Correo o contraseña incorrectos.'),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-100 to-blue-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Supervisión Sanitaria
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sistema de supervisión de agentes sanitarios
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Correo electrónico" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="correo@ejemplo.com"
              />
            </Field>

            <Field label="Contraseña" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>

            {error ? (
              <ErrorBanner title="No se pudo ingresar" message={error} />
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={cargando}
              loadingText="Ingresando…"
            >
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
