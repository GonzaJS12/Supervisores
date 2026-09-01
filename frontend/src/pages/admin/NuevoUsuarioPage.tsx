import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  crearUsuario,
} from '../../services/usuarios.service';

import type {
  RolUsuario,
} from '../../types/usuario';

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] =
    useState('');

  const [apellido, setApellido] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmarPassword, setConfirmarPassword] =
    useState('');

  const [rol, setRol] =
    useState<RolUsuario>('SUPERVISOR');

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError('');

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(
        'Complete todos los campos obligatorios.',
      );

      return;
    }

    if (
      password !==
      confirmarPassword
    ) {
      setError(
        'Las contraseñas no coinciden.',
      );

      return;
    }

    try {
      setGuardando(true);

      await crearUsuario({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email
          .trim()
          .toLowerCase(),
        password,
        rol,
      });

      navigate('/admin/usuarios');
    } catch (error) {
      console.error(error);

      setError(
        obtenerMensajeError(error),
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-slate-800">
          Nuevo usuario
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Crear una cuenta para acceder al sistema.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">

          <CampoTexto
            label="Nombre"
            value={nombre}
            onChange={setNombre}
            required
          />

          <CampoTexto
            label="Apellido"
            value={apellido}
            onChange={setApellido}
            required
          />

          <div className="sm:col-span-2">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
              <span className="text-red-500">
                {' '}*
              </span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="usuario@correo.com"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rol
            </label>

            <select
              value={rol}
              onChange={(event) =>
                setRol(
                  event.target
                    .value as RolUsuario,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="SUPERVISOR">
                Supervisor
              </option>

              <option value="ADMIN">
                Administrador
              </option>
            </select>

          </div>

          <div className="hidden sm:block" />

          <CampoPassword
            label="Contraseña"
            value={password}
            onChange={setPassword}
          />

          <CampoPassword
            label="Confirmar contraseña"
            value={
              confirmarPassword
            }
            onChange={
              setConfirmarPassword
            }
          />

        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/admin/usuarios',
              )
            }
            disabled={guardando}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? 'Guardando...'
              : 'Crear usuario'}
          </button>

        </div>

      </form>

    </div>
  );
}

interface CampoTextoProps {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  required?: boolean;
}

function CampoTexto({
  label,
  value,
  onChange,
  required = false,
}: CampoTextoProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="text-red-500">
            {' '}*
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}

interface CampoPasswordProps {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}

function CampoPassword({
  label,
  value,
  onChange,
}: CampoPasswordProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        <span className="text-red-500">
          {' '}*
        </span>
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        required
        minLength={6}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}

function obtenerMensajeError(
  error: unknown,
): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?:
              | string
              | string[];
          };
        };
      }
    ).response;

    const mensaje =
      response?.data?.message;

    if (
      Array.isArray(mensaje)
    ) {
      return mensaje.join(', ');
    }

    if (
      typeof mensaje === 'string'
    ) {
      return mensaje;
    }
  }

  return 'No se pudo crear el usuario.';
}