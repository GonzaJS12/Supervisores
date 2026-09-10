import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  crearUsuario,
} from '../../services/usuarios.service';

import {
  obtenerAreasOperativas,
} from '../../services/areas-operativas.service';

import type {
  AreaOperativa,
} from '../../services/areas-operativas.service';

import type {
  RolUsuario,
} from '../../types/usuario';

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();

  const [
    nombre,
    setNombre,
  ] = useState('');

  const [
    apellido,
    setApellido,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState('');

  const [
    rol,
    setRol,
  ] = useState<RolUsuario>(
    'SUPERVISOR',
  );

  const [
    areaOperativaId,
    setAreaOperativaId,
  ] = useState('');

  const [
    areas,
    setAreas,
  ] = useState<AreaOperativa[]>([]);

  const [
    cargandoAreas,
    setCargandoAreas,
  ] = useState(false);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  /*
   * CARGAR ÁREAS OPERATIVAS
   */
  useEffect(() => {
    const cargarAreas =
      async () => {
        try {
          setCargandoAreas(true);

          const datos =
            await obtenerAreasOperativas();

          setAreas(
            datos.filter(
              (area) =>
                area.activo,
            ),
          );
        } catch (error) {
          console.error(error);

          setError(
            'No se pudieron cargar las áreas operativas.',
          );
        } finally {
          setCargandoAreas(false);
        }
      };

    cargarAreas();
  }, []);

  /*
   * SI CAMBIA A ADMIN,
   * EL ÁREA NO CORRESPONDE
   */
  useEffect(() => {
    if (
      rol === 'ADMIN'
    ) {
      setAreaOperativaId('');
    }
  }, [rol]);

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

    /*
     * TODO SUPERVISOR DEBE
     * TENER UN ÁREA ASIGNADA
     */
    if (
      rol === 'SUPERVISOR' &&
      !areaOperativaId
    ) {
      setError(
        'Seleccione el área operativa del supervisor.',
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        'La contraseña debe tener al menos 8 caracteres.',
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
        nombre:
          nombre.trim(),

        apellido:
          apellido.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        password,

        rol,

        /*
         * SOLO LOS SUPERVISORES
         * RECIBEN ÁREA OPERATIVA
         */
        ...(rol ===
        'SUPERVISOR'
          ? {
              areaOperativaId:
                Number(
                  areaOperativaId,
                ),
            }
          : {}),
      });

      navigate(
        '/admin/usuarios',
      );
    } catch (error) {
      console.error(error);

      setError(
        obtenerMensajeError(
          error,
        ),
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* ENCABEZADO */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Nuevo usuario
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Crear una cuenta para acceder
          al sistema.
        </p>
      </div>

      {/* FORMULARIO */}

      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {/* NOMBRE */}

          <CampoTexto
            label="Nombre"
            value={nombre}
            onChange={
              setNombre
            }
            required
          />

          {/* APELLIDO */}

          <CampoTexto
            label="Apellido"
            value={apellido}
            onChange={
              setApellido
            }
            required
          />

          {/* EMAIL */}

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
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="usuario@correo.com"
            />
          </div>

          {/* ROL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rol
            </label>

            <select
              value={rol}
              onChange={(
                event,
              ) =>
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

          {/* ÁREA OPERATIVA */}

          {rol ===
          'SUPERVISOR' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Área operativa

                <span className="text-red-500">
                  {' '}*
                </span>
              </label>

              <select
                value={
                  areaOperativaId
                }
                onChange={(
                  event,
                ) =>
                  setAreaOperativaId(
                    event.target
                      .value,
                  )
                }
                required
                disabled={
                  cargandoAreas
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {cargandoAreas
                    ? 'Cargando áreas...'
                    : 'Seleccione un área'}
                </option>

                {areas.map(
                  (area) => (
                    <option
                      key={
                        area.id
                      }
                      value={
                        area.id
                      }
                    >
                      {
                        area.nombre
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Área operativa
              </label>

              <div className="flex min-h-[42px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                No corresponde
              </div>
            </div>
          )}

          {/* CONTRASEÑA */}

          <CampoPassword
            label="Contraseña"
            value={password}
            onChange={
              setPassword
            }
          />

          {/* CONFIRMAR CONTRASEÑA */}

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

        {/* BOTONES */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                '/admin/usuarios',
              )
            }
            disabled={
              guardando
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              guardando ||
              (
                rol ===
                  'SUPERVISOR' &&
                cargandoAreas
              )
            }
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

/*
 * CAMPO DE TEXTO
 */
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
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        required={
          required
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/*
 * CAMPO PASSWORD
 */
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
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        required
        minLength={8}
        autoComplete="new-password"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/*
 * MENSAJES DE ERROR
 */
function obtenerMensajeError(
  error: unknown,
): string {
  if (
    typeof error ===
      'object' &&
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
      response?.data
        ?.message;

    if (
      Array.isArray(
        mensaje,
      )
    ) {
      return mensaje.join(
        ', ',
      );
    }

    if (
      typeof mensaje ===
      'string'
    ) {
      return mensaje;
    }
  }

  return 'No se pudo crear el usuario.';
}