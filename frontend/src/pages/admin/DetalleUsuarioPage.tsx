import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  cambiarEstadoUsuario,
  cambiarPasswordUsuario,
  modificarUsuario,
  obtenerUsuarioPorId,
} from '../../services/usuarios.service';

import {
  obtenerAreasOperativas,
} from '../../services/areas-operativas.service';

import type {
  AreaOperativa,
} from '../../services/areas-operativas.service';

import type {
  UsuarioAdmin,
} from '../../types/usuario';

export default function DetalleUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [
    usuario,
    setUsuario,
  ] = useState<UsuarioAdmin | null>(
    null,
  );

  const [
    areas,
    setAreas,
  ] = useState<AreaOperativa[]>([]);

  /*
   * CAMPOS EDITABLES
   */
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
    areaOperativaId,
    setAreaOperativaId,
  ] = useState('');

  /*
   * ESTADOS DE CARGA
   */
  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    cambiandoEstado,
    setCambiandoEstado,
  ] = useState(false);

  /*
   * CAMBIO DE CONTRASEÑA
   */
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

  /*
   * MENSAJES
   */
  const [
    error,
    setError,
  ] = useState('');

  const [
    mensaje,
    setMensaje,
  ] = useState('');

  const [
    errorAccion,
    setErrorAccion,
  ] = useState('');

  /*
   * CARGAR USUARIO
   */
  useEffect(() => {
    const cargarDatos =
      async () => {
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

          setNombre(
            datos.nombre,
          );

          setApellido(
            datos.apellido,
          );

          setEmail(
            datos.email,
          );

          setAreaOperativaId(
            datos.areaOperativaId
              ? String(
                  datos.areaOperativaId,
                )
              : '',
          );

          /*
           * Solo necesitamos cargar
           * áreas si el usuario es
           * SUPERVISOR.
           */
          if (
            datos.rol ===
            'SUPERVISOR'
          ) {
            const areasDatos =
              await obtenerAreasOperativas();

            setAreas(
              areasDatos.filter(
                (area) =>
                  area.activo,
              ),
            );
          }
        } catch (error) {
          console.error(error);

          setError(
            'No se pudo cargar el usuario.',
          );
        } finally {
          setCargando(false);
        }
      };

    cargarDatos();
  }, [id]);

  /*
   * GUARDAR DATOS DEL USUARIO
   */
  const handleGuardar =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      if (!usuario) {
        return;
      }

      setMensaje('');
      setErrorAccion('');

      if (
        !nombre.trim() ||
        !apellido.trim() ||
        !email.trim()
      ) {
        setErrorAccion(
          'Complete nombre, apellido y email.',
        );

        return;
      }

      if (
        usuario.rol ===
          'SUPERVISOR' &&
        !areaOperativaId
      ) {
        setErrorAccion(
          'Seleccione un área operativa.',
        );

        return;
      }

      try {
        setGuardando(true);

        const usuarioActualizado =
          await modificarUsuario(
            usuario.id,
            {
              nombre:
                nombre.trim(),

              apellido:
                apellido.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              ...(usuario.rol ===
              'SUPERVISOR'
                ? {
                    areaOperativaId:
                      Number(
                        areaOperativaId,
                      ),
                  }
                : {}),
            },
          );

        setUsuario(
          usuarioActualizado,
        );

        setNombre(
          usuarioActualizado.nombre,
        );

        setApellido(
          usuarioActualizado.apellido,
        );

        setEmail(
          usuarioActualizado.email,
        );

        setAreaOperativaId(
          usuarioActualizado
            .areaOperativaId
            ? String(
                usuarioActualizado
                  .areaOperativaId,
              )
            : '',
        );

        setMensaje(
          'Usuario actualizado correctamente.',
        );
      } catch (error) {
        console.error(error);

        setErrorAccion(
          obtenerMensajeError(
            error,
            'No se pudo modificar el usuario.',
          ),
        );
      } finally {
        setGuardando(false);
      }
    };

  /*
   * ACTIVAR / DESACTIVAR
   */
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

  /*
   * MOSTRAR / OCULTAR
   * CAMBIO DE CONTRASEÑA
   */
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

  /*
   * CAMBIAR CONTRASEÑA
   */
  const handleCambiarPassword =
    async () => {
      if (!usuario) {
        return;
      }

      setMensaje('');
      setErrorAccion('');

      if (
        !nuevaPassword.trim()
      ) {
        setErrorAccion(
          'Ingrese una nueva contraseña.',
        );

        return;
      }

      if (
        nuevaPassword.length < 8
      ) {
        setErrorAccion(
          'La contraseña debe tener al menos 8 caracteres.',
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
        setCambiandoPassword(
          true,
        );

        await cambiarPasswordUsuario(
          usuario.id,
          nuevaPassword,
        );

        setNuevaPassword('');
        setConfirmarPassword('');

        setMostrarCambioPassword(
          false,
        );

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
        setCambiandoPassword(
          false,
        );
      }
    };

  /*
   * CARGANDO
   */
  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando usuario...
      </div>
    );
  }

  /*
   * ERROR DE CARGA
   */
  if (
    error ||
    !usuario
  ) {
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
            Modificar usuario
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Modifique los datos de la
            cuenta seleccionada.
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

      {/* MENSAJES */}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {errorAccion && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorAccion}
        </div>
      )}

      {/* FORMULARIO */}

      <form
        onSubmit={
          handleGuardar
        }
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-800">
          Datos del usuario
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          El rol del usuario no puede
          modificarse.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
            />
          </div>

          {/* ROL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rol
            </label>

            <div className="flex min-h-[42px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
              <RolBadge
                rol={
                  usuario.rol
                }
              />
            </div>
          </div>

          {/* ÁREA OPERATIVA */}

          {usuario.rol ===
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Seleccione un área
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

          {/* ESTADO */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Estado
            </label>

            <div className="flex min-h-[42px] items-center">
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
        </div>

        {/* GUARDAR */}

        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={
              guardando ||
              cambiandoEstado ||
              cambiandoPassword
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* ADMINISTRACIÓN */}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Administración
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Administración de contraseña
          y estado de la cuenta.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* CONTRASEÑA */}

          <button
            type="button"
            onClick={
              handleMostrarCambioPassword
            }
            disabled={
              guardando ||
              cambiandoPassword ||
              cambiandoEstado
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mostrarCambioPassword
              ? 'Cancelar cambio'
              : 'Cambiar contraseña'}
          </button>

          {/* ESTADO */}

          {usuario.activo ? (
            <button
              type="button"
              onClick={
                handleCambiarEstado
              }
              disabled={
                guardando ||
                cambiandoEstado ||
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
                guardando ||
                cambiandoEstado ||
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

        {/* CAMBIO DE CONTRASEÑA */}

        {mostrarCambioPassword && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="font-semibold text-slate-800">
              Cambiar contraseña
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ingrese la nueva
              contraseña para{' '}
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
                  value={
                    nuevaPassword
                  }
                  onChange={(
                    event,
                  ) =>
                    setNuevaPassword(
                      event.target
                        .value,
                    )
                  }
                  minLength={8}
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
                  onChange={(
                    event,
                  ) =>
                    setConfirmarPassword(
                      event.target
                        .value,
                    )
                  }
                  minLength={8}
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
 * BADGE DEL ROL
 */
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

/*
 * MENSAJES DE ERROR DEL BACKEND
 */
function obtenerMensajeError(
  error: unknown,
  mensajeDefault: string,
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
      response?.data?.message;

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

  return mensajeDefault;
}