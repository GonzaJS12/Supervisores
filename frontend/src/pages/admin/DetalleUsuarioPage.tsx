import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cambiarEstadoUsuario, cambiarPasswordUsuario, cambiarRolUsuario, obtenerUsuarioPorId,} from '../../services/usuarios.service';
import type { RolUsuario, UsuarioAdmin } from '../../types/usuario';

export default function DetalleUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] =
    useState<UsuarioAdmin | null>(null);

  const [cargando, setCargando] =
    useState(true);

  // Error exclusivo para la carga inicial
  const [error, setError] =
    useState('');

  // Estados para cambiar rol
  const [
    cambiandoRol,
    setCambiandoRol,
  ] = useState(false);

  // Estados para activar/desactivar
  const [
    cambiandoEstado,
    setCambiandoEstado,
  ] = useState(false);

  // Estados para cambiar contraseña
  const [
    mostrarCambioPassword,
    setMostrarCambioPassword,
  ] = useState(false);

  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState('');

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState('');

  const [
    cambiandoPassword,
    setCambiandoPassword,
  ] = useState(false);

  // Mensajes generales de las acciones
  const [mensaje, setMensaje] =
    useState('');

  const [
    errorAccion,
    setErrorAccion,
  ] = useState('');

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!id) {
        setError(
          'No se indicó un usuario.',
        );

        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError('');

        const datos =
          await obtenerUsuarioPorId(
            Number(id),
          );

        setUsuario(datos);
      } catch (error) {
        console.error(error);

        setError(
          'No se pudo cargar el usuario.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, [id]);

  const handleCambiarEstado =
    async () => {
      if (!usuario) {
        return;
      }

      const nuevoEstado =
        !usuario.activo;

      const accion =
        nuevoEstado
          ? 'activar'
          : 'desactivar';

      const confirmado =
        window.confirm(
          `¿Está seguro de ${accion} al usuario ${usuario.nombre} ${usuario.apellido}?`,
        );

      if (!confirmado) {
        return;
      }

      try {
        setCambiandoEstado(true);

        setMensaje('');
        setErrorAccion('');

        const usuarioActualizado =
          await cambiarEstadoUsuario(
            usuario.id,
            nuevoEstado,
          );

        setUsuario(
          usuarioActualizado,
        );

        setMensaje(
          nuevoEstado
            ? 'Usuario activado correctamente.'
            : 'Usuario desactivado correctamente.',
        );
      } catch (error) {
        console.error(error);

        setErrorAccion(
          obtenerMensajeError(
            error,
            'No se pudo cambiar el estado del usuario.',
          ),
        );
      } finally {
        setCambiandoEstado(false);
      }
    };

  const handleCambiarRol =
    async () => {
      if (!usuario) {
        return;
      }

      const nuevoRol: RolUsuario =
        usuario.rol === 'ADMIN'
          ? 'SUPERVISOR'
          : 'ADMIN';

      const nombreNuevoRol =
        nuevoRol === 'ADMIN'
          ? 'Administrador'
          : 'Supervisor';

      const confirmado =
        window.confirm(
          `¿Está seguro de cambiar el rol de ${usuario.nombre} ${usuario.apellido} a ${nombreNuevoRol}?`,
        );

      if (!confirmado) {
        return;
      }

      try {
        setCambiandoRol(true);
        setMensaje('');
        setErrorAccion('');

        const usuarioActualizado =
          await cambiarRolUsuario(
            usuario.id,
            nuevoRol,
          );

        setUsuario(
          usuarioActualizado,
        );

        setMensaje(
          `Rol actualizado correctamente a ${nombreNuevoRol}.`,
        );
      } catch (error) {
        console.error(error);

        setErrorAccion(
          obtenerMensajeError(
            error,
            'No se pudo cambiar el rol del usuario.',
          ),
        );
      } finally {
        setCambiandoRol(false);
      }
    };

  const handleCambiarPassword =
    async () => {
      if (!usuario) {
        return;
      }

      setMensaje('');
      setErrorAccion('');

      if (!nuevaPassword.trim()) {
        setErrorAccion(
          'Ingrese una nueva contraseña.',
        );
        return;
      }

      if (
        nuevaPassword !==
        confirmarPassword
      ) {
        setErrorAccion(
          'Las contraseñas no coinciden.',
        );
        return;
      }

      try {
        setCambiandoPassword(true);

        await cambiarPasswordUsuario(
          usuario.id,
          nuevaPassword,
        );

        setNuevaPassword('');
        setConfirmarPassword('');
        setMostrarCambioPassword(false);

        setMensaje(
          'Contraseña actualizada correctamente.',
        );
      } catch (error) {
        console.error(error);

        setErrorAccion(
          obtenerMensajeError(
            error,
            'No se pudo cambiar la contraseña.',
          ),
        );
      } finally {
        setCambiandoPassword(false);
      }
    };

  const handleMostrarCambioPassword =
    () => {
      setMostrarCambioPassword(
        !mostrarCambioPassword,
      );

      setNuevaPassword('');
      setConfirmarPassword('');
      setMensaje('');
      setErrorAccion('');
    };

  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando usuario...
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ||
            'El usuario no existe.'}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/admin/usuarios',
            )
          }
          className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* ENCABEZADO */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {usuario.nombre}{' '}
            {usuario.apellido}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Información de la cuenta.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/admin/usuarios',
            )
          }
          className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Volver
        </button>
      </div>

      {/* MENSAJE DE ÉXITO */}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {/* ERROR DE ACCIÓN */}

      {errorAccion && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorAccion}
        </div>
      )}

      {/* DATOS DEL USUARIO */}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Datos del usuario
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <Dato
            label="Nombre"
            valor={usuario.nombre}
          />

          <Dato
            label="Apellido"
            valor={usuario.apellido}
          />

          <Dato
            label="Email"
            valor={usuario.email}
          />

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Rol
            </p>

            <div className="mt-2">
              <RolBadge
                rol={usuario.rol}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Estado
            </p>

            <div className="mt-2">
              {usuario.activo ? (
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Activo
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Inactivo
                </span>
              )}
            </div>
          </div>

          <Dato
            label="ID"
            valor={
              usuario.id.toString()
            }
          />
        </div>
      </section>

      {/* ADMINISTRACIÓN */}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Administración
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Desde aquí podremos modificar el
          estado, rol y contraseña del usuario.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          {/* CAMBIAR ROL */}

          <button
            type="button"
            onClick={handleCambiarRol}
            disabled={
              cambiandoRol ||
              cambiandoEstado ||
              cambiandoPassword
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cambiandoRol
              ? 'Cambiando rol...'
              : usuario.rol ===
                  'ADMIN'
                ? 'Cambiar a Supervisor'
                : 'Cambiar a Administrador'}
          </button>

          {/* CAMBIAR CONTRASEÑA */}

          <button
            type="button"
            onClick={
              handleMostrarCambioPassword
            }
            disabled={
              cambiandoPassword ||
              cambiandoRol ||
              cambiandoEstado
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mostrarCambioPassword
              ? 'Cancelar cambio'
              : 'Cambiar contraseña'}
          </button>

          {/* ACTIVAR / DESACTIVAR */}

          {usuario.activo ? (
            <button
              type="button"
              onClick={
                handleCambiarEstado
              }
              disabled={
                cambiandoEstado ||
                cambiandoRol ||
                cambiandoPassword
              }
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cambiandoEstado
                ? 'Desactivando...'
                : 'Desactivar usuario'}
            </button>
          ) : (
            <button
              type="button"
              onClick={
                handleCambiarEstado
              }
              disabled={
                cambiandoEstado ||
                cambiandoRol ||
                cambiandoPassword
              }
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cambiandoEstado
                ? 'Activando...'
                : 'Activar usuario'}
            </button>
          )}
        </div>

        {/* FORMULARIO CAMBIO DE CONTRASEÑA */}

        {mostrarCambioPassword && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="font-semibold text-slate-800">
              Cambiar contraseña
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ingrese la nueva contraseña para{' '}
              {usuario.nombre}{' '}
              {usuario.apellido}.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nuevaPassword"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Nueva contraseña
                </label>

                <input
                  id="nuevaPassword"
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) =>
                    setNuevaPassword(
                      e.target.value,
                    )
                  }
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmarPassword"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Confirmar contraseña
                </label>

                <input
                  id="confirmarPassword"
                  type="password"
                  value={
                    confirmarPassword
                  }
                  onChange={(e) =>
                    setConfirmarPassword(
                      e.target.value,
                    )
                  }
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={
                  handleCambiarPassword
                }
                disabled={
                  cambiandoPassword
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cambiandoPassword
                  ? 'Guardando...'
                  : 'Guardar nueva contraseña'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Dato({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-800">
        {valor}
      </p>
    </div>
  );
}

function RolBadge({
  rol,
}: {
  rol: string;
}) {
  if (rol === 'ADMIN') {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Administrador
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      Supervisor
    </span>
  );
}

function obtenerMensajeError(
  error: unknown,
  mensajeDefault: string,
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

    if (Array.isArray(mensaje)) {
      return mensaje.join(', ');
    }

    if (
      typeof mensaje === 'string'
    ) {
      return mensaje;
    }
  }

  return mensajeDefault;
}
