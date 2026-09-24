import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
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
              area =>
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

    void cargarAreas();
  }, []);

  const handleSubmit = async (
    event: FormEvent,
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

  const esSupervisor =
    rol === 'SUPERVISOR';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Administración
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Nuevo usuario
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Cree una nueva cuenta y
            defina el nivel de acceso
            que tendrá dentro del
            sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/admin/usuarios',
            )
          }
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <IconoVolver />

          Volver a usuarios
        </button>
      </section>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <div className="mt-0.5 shrink-0">
            <IconoAlerta />
          </div>

          <div>
            <p className="font-semibold">
              No se pudo crear el
              usuario
            </p>

            <p className="mt-0.5 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* DATOS PERSONALES */}
        <SeccionFormulario
          titulo="Datos personales"
          descripcion="Información básica para identificar al usuario."
          icono={<IconoUsuario />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto
              label="Nombre"
              value={nombre}
              onChange={
                setNombre
              }
              placeholder="Ingrese el nombre"
              required
            />

            <CampoTexto
              label="Apellido"
              value={apellido}
              onChange={
                setApellido
              }
              placeholder="Ingrese el apellido"
              required
            />

            <div className="sm:col-span-2">
              <Etiqueta
                texto="Correo electrónico"
                required
              />

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <IconoEmail />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={event =>
                    setEmail(
                      event.target
                        .value,
                    )
                  }
                  required
                  autoComplete="email"
                  placeholder="usuario@correo.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Se utilizará para
                iniciar sesión en el
                sistema.
              </p>
            </div>
          </div>
        </SeccionFormulario>

        {/* ACCESO */}
        <SeccionFormulario
          titulo="Acceso y permisos"
          descripcion="Seleccione el rol y, cuando corresponda, el área operativa asignada."
          icono={<IconoPermisos />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {/* ROL */}
            <div>
              <Etiqueta
                texto="Rol"
                required
              />

              <select
                value={rol}
                onChange={event => {
                  const nuevoRol =
                    event.target
                      .value as RolUsuario;

                  setRol(nuevoRol);

                  if (
                    nuevoRol ===
                    'ADMIN'
                  ) {
                    setAreaOperativaId(
                      '',
                    );
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="SUPERVISOR">
                  Supervisor
                </option>

                <option value="ADMIN">
                  Administrador
                </option>
              </select>
            </div>

            {/* ÁREA */}
            {esSupervisor ? (
              <div>
                <Etiqueta
                  texto="Área operativa"
                  required
                />

                <select
                  value={
                    areaOperativaId
                  }
                  onChange={event =>
                    setAreaOperativaId(
                      event.target
                        .value,
                    )
                  }
                  required
                  disabled={
                    cargandoAreas
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    {cargandoAreas
                      ? 'Cargando áreas...'
                      : 'Seleccione un área'}
                  </option>

                  {areas.map(
                    area => (
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
                <Etiqueta
                  texto="Área operativa"
                />

                <div className="flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500">
                  <IconoInformacion />

                  No corresponde para
                  administradores
                </div>
              </div>
            )}
          </div>

          {/* EXPLICACIÓN DEL ROL */}
          <div
            className={`mt-5 rounded-xl border p-4 ${
              esSupervisor
                ? 'border-blue-100 bg-blue-50/60'
                : 'border-violet-100 bg-violet-50/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  esSupervisor
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-violet-100 text-violet-700'
                }`}
              >
                {esSupervisor ? (
                  <IconoSupervisor />
                ) : (
                  <IconoAdministrador />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {esSupervisor
                    ? 'Cuenta de supervisor'
                    : 'Cuenta de administrador'}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {esSupervisor
                    ? 'El supervisor quedará asociado al área operativa seleccionada y trabajará dentro de ese ámbito territorial.'
                    : 'El administrador tendrá acceso a las funciones administrativas del sistema y no requiere un área operativa asignada.'}
                </p>
              </div>
            </div>
          </div>
        </SeccionFormulario>

        {/* SEGURIDAD */}
        <SeccionFormulario
          titulo="Seguridad de la cuenta"
          descripcion="Defina la contraseña inicial que utilizará el usuario."
          icono={<IconoSeguridad />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoPassword
              label="Contraseña"
              value={password}
              onChange={
                setPassword
              }
              placeholder="Mínimo 8 caracteres"
            />

            <CampoPassword
              label="Confirmar contraseña"
              value={
                confirmarPassword
              }
              onChange={
                setConfirmarPassword
              }
              placeholder="Repita la contraseña"
            />
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mt-0.5 text-slate-400">
              <IconoInformacion />
            </div>

            <p className="text-xs leading-5 text-slate-500">
              La contraseña debe
              contener al menos{' '}
              <span className="font-semibold text-slate-700">
                8 caracteres
              </span>
              . Ambos campos deben
              coincidir antes de crear
              la cuenta.
            </p>
          </div>
        </SeccionFormulario>

        {/* ACCIONES */}
        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="hidden text-xs text-slate-400 sm:block">
            Los campos marcados con * son
            obligatorios.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/admin/usuarios',
                )
              }
              disabled={guardando}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                guardando ||
                (
                  esSupervisor &&
                  cargandoAreas
                )
              }
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Spinner />

                  Creando...
                </>
              ) : (
                <>
                  <IconoAgregar />

                  Crear usuario
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
 * COMPONENTES
 * ======================================================= */

function SeccionFormulario({
  titulo,
  descripcion,
  icono,
  children,
}: {
  titulo: string;
  descripcion: string;
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icono}
          </div>

          <div>
            <h2 className="font-bold text-slate-900 sm:text-lg">
              {titulo}
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {descripcion}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Etiqueta({
  texto,
  required = false,
}: {
  texto: string;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {texto}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}

interface CampoTextoProps {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: CampoTextoProps) {
  return (
    <div>
      <Etiqueta
        texto={label}
        required={required}
      />

      <input
        type="text"
        value={value}
        onChange={event =>
          onChange(
            event.target.value,
          )
        }
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
  placeholder?: string;
}

function CampoPassword({
  label,
  value,
  onChange,
  placeholder,
}: CampoPasswordProps) {
  return (
    <div>
      <Etiqueta
        texto={label}
        required
      />

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <IconoCandado />
        </div>

        <input
          type="password"
          value={value}
          onChange={event =>
            onChange(
              event.target.value,
            )
          }
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );
}

/* =========================================================
 * MENSAJES DE ERROR
 * ======================================================= */

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

/* =========================================================
 * ICONOS
 * ======================================================= */

interface IconoProps {
  className?: string;
}

function IconoVolver({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15 18-6-6 6-6"
      />
    </svg>
  );
}

function IconoAgregar({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function IconoUsuario({
  className = 'h-5 w-5',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6"
      />
    </svg>
  );
}

function IconoEmail({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7 8 6 8-6"
      />
    </svg>
  );
}

function IconoPermisos({
  className = 'h-5 w-5',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  );
}

function IconoSupervisor({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M5 21c.6-4 3-6 7-6s6.4 2 7 6"
      />
    </svg>
  );
}

function IconoAdministrador({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z"
      />
    </svg>
  );
}

function IconoSeguridad({
  className = 'h-5 w-5',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 10V7a4 4 0 0 1 8 0v3"
      />

      <circle
        cx="12"
        cy="15"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function IconoCandado({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 10V7a4 4 0 0 1 8 0v3"
      />
    </svg>
  );
}

function IconoInformacion({
  className = 'h-4 w-4',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        d="M12 11v5M12 8h.01"
      />
    </svg>
  );
}

function IconoAlerta({
  className = 'h-5 w-5',
}: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4 3 20h18L12 4Z"
      />

      <path
        strokeLinecap="round"
        d="M12 9v5M12 17h.01"
      />
    </svg>
  );
}