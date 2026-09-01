import {
  useEffect,
  useState,
} from 'react';

import {
  actualizarBloque,
  crearBloque,
  obtenerBloques,
} from '../../services/bloques.service';

import type {
  BloqueEvaluacion,
} from '../../types/bloque';

export default function BloquesPage() {
  const [
    bloques,
    setBloques,
  ] = useState<BloqueEvaluacion[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    mensaje,
    setMensaje,
  ] = useState('');

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    bloqueEditando,
    setBloqueEditando,
  ] = useState<BloqueEvaluacion | null>(
    null,
  );

  const [
    nombre,
    setNombre,
  ] = useState('');

  const [
    descripcion,
    setDescripcion,
  ] = useState('');

  const [
    orden,
    setOrden,
  ] = useState('');

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  useEffect(() => {
    cargarBloques();
  }, []);

  const cargarBloques =
    async () => {
      try {
        setCargando(true);
        setError('');

        const datos =
          await obtenerBloques();

        setBloques(datos);
      } catch (error) {
        console.error(error);

        setError(
          'No se pudieron cargar los bloques.',
        );
      } finally {
        setCargando(false);
      }
    };

  const limpiarFormulario =
    () => {
      setNombre('');
      setDescripcion('');
      setOrden('');
      setBloqueEditando(null);
    };

  const handleNuevoBloque =
    () => {
      limpiarFormulario();

      setMensaje('');
      setError('');

      setMostrarFormulario(true);
    };

  const handleEditar =
    (
      bloque: BloqueEvaluacion,
    ) => {
      setBloqueEditando(bloque);

      setNombre(bloque.nombre);

      setDescripcion(
        bloque.descripcion ?? '',
      );

      setOrden(
        bloque.orden.toString(),
      );

      setMensaje('');
      setError('');

      setMostrarFormulario(true);
    };

  const handleCancelar =
    () => {
      limpiarFormulario();

      setMostrarFormulario(false);

      setError('');
    };

  const handleGuardar =
    async () => {
      setMensaje('');
      setError('');

      if (!nombre.trim()) {
        setError(
          'El nombre del bloque es obligatorio.',
        );

        return;
      }

      const numeroOrden =
        Number(orden);

      if (
        !Number.isInteger(
          numeroOrden,
        ) ||
        numeroOrden < 1
      ) {
        setError(
          'El orden debe ser un número entero mayor o igual a 1.',
        );

        return;
      }

      try {
        setGuardando(true);

        if (bloqueEditando) {
          await actualizarBloque(
            bloqueEditando.id,
            {
              nombre:
                nombre.trim(),

              descripcion:
                descripcion.trim(),

              orden:
                numeroOrden,
            },
          );

          setMensaje(
            'Bloque actualizado correctamente.',
          );
        } else {
          await crearBloque({
            nombre:
              nombre.trim(),

            descripcion:
              descripcion.trim(),

            orden:
              numeroOrden,
          });

          setMensaje(
            'Bloque creado correctamente.',
          );
        }

        limpiarFormulario();

        setMostrarFormulario(false);

        await cargarBloques();
      } catch (error) {
        console.error(error);

        setError(
          obtenerMensajeError(
            error,
            'No se pudo guardar el bloque.',
          ),
        );
      } finally {
        setGuardando(false);
      }
    };

  const handleCambiarEstado =
    async (
      bloque: BloqueEvaluacion,
    ) => {
      const nuevoEstado =
        !bloque.activo;

      const accion =
        nuevoEstado
          ? 'activar'
          : 'desactivar';

      const confirmado =
        window.confirm(
          `¿Está seguro de ${accion} el bloque "${bloque.nombre}"?`,
        );

      if (!confirmado) {
        return;
      }

      try {
        setMensaje('');
        setError('');

        await actualizarBloque(
          bloque.id,
          {
            activo:
              nuevoEstado,
          },
        );

        setBloques(
          bloquesActuales =>
            bloquesActuales.map(
              item =>
                item.id ===
                bloque.id
                  ? {
                      ...item,
                      activo:
                        nuevoEstado,
                    }
                  : item,
            ),
        );

        setMensaje(
          nuevoEstado
            ? 'Bloque activado correctamente.'
            : 'Bloque desactivado correctamente.',
        );
      } catch (error) {
        console.error(error);

        setError(
          obtenerMensajeError(
            error,
            'No se pudo cambiar el estado del bloque.',
          ),
        );
      }
    };

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Bloques de evaluación
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Administración de los
            bloques utilizados en las
            supervisiones.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleNuevoBloque
          }
          className="self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Nuevo bloque
        </button>

      </div>

      {/* MENSAJES */}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="text-lg font-semibold text-slate-800">
            {bloqueEditando
              ? 'Editar bloque'
              : 'Nuevo bloque'}
          </h2>

          <div className="mt-5 grid gap-5">

            <div>
              <label
                htmlFor="nombre"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={e =>
                  setNombre(
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="descripcion"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Descripción
              </label>

              <textarea
                id="descripcion"
                rows={3}
                value={
                  descripcion
                }
                onChange={e =>
                  setDescripcion(
                    e.target.value,
                  )
                }
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="max-w-xs">
              <label
                htmlFor="orden"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Orden
              </label>

              <input
                id="orden"
                type="number"
                min="1"
                value={orden}
                onChange={e =>
                  setOrden(
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={
                handleGuardar
              }
              disabled={
                guardando
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? 'Guardando...'
                : bloqueEditando
                  ? 'Guardar cambios'
                  : 'Crear bloque'}
            </button>

            <button
              type="button"
              onClick={
                handleCancelar
              }
              disabled={
                guardando
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

          </div>

        </section>
      )}

      {/* LISTADO */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {cargando ? (
          <div className="p-6 text-sm text-slate-500">
            Cargando bloques...
          </div>
        ) : bloques.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No hay bloques de
            evaluación registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-slate-200">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orden
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bloque
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Criterios
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {bloques.map(
                  bloque => (
                    <tr
                      key={
                        bloque.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {
                          bloque.orden
                        }
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {
                            bloque.nombre
                          }
                        </p>

                        {bloque.descripcion && (
                          <p className="mt-1 max-w-md text-sm text-slate-500">
                            {
                              bloque.descripcion
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {
                          bloque
                            .criterios
                            ?.length ??
                          0
                        }
                      </td>

                      <td className="px-4 py-4">
                        {bloque.activo ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditar(
                                bloque,
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCambiarEstado(
                                bloque,
                              )
                            }
                            className={
                              bloque.activo
                                ? 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100'
                                : 'rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100'
                            }
                          >
                            {bloque.activo
                              ? 'Desactivar'
                              : 'Activar'}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ),
                )}

              </tbody>
            </table>

          </div>
        )}

      </section>

    </div>
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