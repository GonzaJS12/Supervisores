import {
  useEffect,
  useState,
} from 'react';

import {
  actualizarCriterio,
  crearCriterio,
  obtenerCriterios,
} from '../../services/criterios.service';

import {
  obtenerBloques,
} from '../../services/bloques.service';

import type {
  BloqueEvaluacion,
} from '../../types/bloque';

import type {
  CriterioEvaluacion,
} from '../../types/criterio';
import { obtenerMensajeError } from '../../utils/http-error';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
} from '../../components/ui/FeedbackBlock';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function CriteriosPage() {
  const [pendienteConfirmacion, setPendienteConfirmacion] =
    useState<CriterioEvaluacion | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const [
    criterios,
    setCriterios,
  ] = useState<CriterioEvaluacion[]>([]);

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
    criterioEditando,
    setCriterioEditando,
  ] =
    useState<CriterioEvaluacion | null>(
      null,
    );

  const [
    bloqueId,
    setBloqueId,
  ] = useState('');

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

  const [
    filtroBloque,
    setFiltroBloque,
  ] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos =
    async () => {
      try {
        setCargando(true);
        setError('');

        const [
          datosCriterios,
          datosBloques,
        ] = await Promise.all([
          obtenerCriterios(),
          obtenerBloques(),
        ]);

        setCriterios(
          datosCriterios,
        );

        setBloques(
          datosBloques,
        );
      } catch (error) {
        console.error(error);

        setError(
          'No se pudieron cargar los criterios.',
        );
      } finally {
        setCargando(false);
      }
    };

  const limpiarFormulario =
    () => {
      setBloqueId('');
      setNombre('');
      setDescripcion('');
      setOrden('');
      setCriterioEditando(null);
    };

  const handleNuevoCriterio =
    () => {
      limpiarFormulario();

      setError('');
      setMensaje('');

      setMostrarFormulario(true);
    };

  const handleEditar =
    (
      criterio:
        CriterioEvaluacion,
    ) => {
      setCriterioEditando(
        criterio,
      );

      setBloqueId(
        criterio.bloqueId.toString(),
      );

      setNombre(
        criterio.nombre,
      );

      setDescripcion(
        criterio.descripcion ?? '',
      );

      setOrden(
        criterio.orden.toString(),
      );

      setError('');
      setMensaje('');

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

      const numeroBloqueId =
        Number(bloqueId);

      const numeroOrden =
        Number(orden);

      if (
        !Number.isInteger(
          numeroBloqueId,
        ) ||
        numeroBloqueId < 1
      ) {
        setError(
          'Debe seleccionar un bloque.',
        );

        return;
      }

      if (!nombre.trim()) {
        setError(
          'El nombre del criterio es obligatorio.',
        );

        return;
      }

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

        if (criterioEditando) {
          await actualizarCriterio(
            criterioEditando.id,
            {
              bloqueId:
                numeroBloqueId,

              nombre:
                nombre.trim(),

              descripcion:
                descripcion.trim(),

              orden:
                numeroOrden,
            },
          );

          setMensaje(
            'Criterio actualizado correctamente.',
          );
        } else {
          await crearCriterio({
            bloqueId:
              numeroBloqueId,

            nombre:
              nombre.trim(),

            descripcion:
              descripcion.trim(),

            orden:
              numeroOrden,
          });

          setMensaje(
            'Criterio creado correctamente.',
          );
        }

        limpiarFormulario();

        setMostrarFormulario(false);

        await cargarDatos();
      } catch (error) {
        console.error(error);

        setError(
          obtenerMensajeError(
            error,
            'No se pudo guardar el criterio.',
          ),
        );
      } finally {
        setGuardando(false);
      }
    };

  const solicitarCambioEstado = (criterio: CriterioEvaluacion) => {
    setPendienteConfirmacion(criterio);
  };

  const handleCambiarEstado = async () => {
    const criterio = pendienteConfirmacion;
    if (!criterio) return;
    const nuevoEstado = !criterio.activo;

    try {
      setConfirmando(true);

        setMensaje('');
        setError('');

        await actualizarCriterio(
          criterio.id,
          {
            activo:
              nuevoEstado,
          },
        );

        setCriterios(
          criteriosActuales =>
            criteriosActuales.map(
              item =>
                item.id ===
                criterio.id
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
            ? 'Criterio activado correctamente.'
            : 'Criterio desactivado correctamente.',
        );
      } catch (error) {
        console.error(error);

        setError(
          obtenerMensajeError(
            error,
            'No se pudo cambiar el estado del criterio.',
          ),
        );
      } finally {
        setConfirmando(false);
        setPendienteConfirmacion(null);
      }
    };

  const criteriosFiltrados =
    filtroBloque
      ? criterios.filter(
          criterio =>
            criterio.bloqueId ===
            Number(
              filtroBloque,
            ),
        )
      : criterios;

  const bloquesActivos =
    bloques.filter(
      bloque =>
        bloque.activo,
    );

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={pendienteConfirmacion !== null}
        title={
          pendienteConfirmacion?.activo
            ? 'Desactivar criterio'
            : 'Activar criterio'
        }
        message={
          pendienteConfirmacion
            ? `¿Está seguro de ${pendienteConfirmacion.activo ? 'desactivar' : 'activar'} el criterio "${pendienteConfirmacion.nombre}"?`
            : ''
        }
        confirmLabel={
          pendienteConfirmacion?.activo ? 'Desactivar' : 'Activar'
        }
        danger={Boolean(pendienteConfirmacion?.activo)}
        loading={confirmando}
        onCancel={() => {
          if (!confirmando) setPendienteConfirmacion(null);
        }}
        onConfirm={() => {
          void handleCambiarEstado();
        }}
      />


      <PageHeader
        title="Criterios"
        description="Administración de los criterios de evaluación."
        actions={
          <Button variant="primary" onClick={handleNuevoCriterio}>
            Nuevo criterio
          </Button>
        }
      />


      {/* MENSAJES */}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {error && (
        <ErrorBanner
          title="No se pudieron cargar los criterios"
          message={error}
        />
      )}

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="text-lg font-semibold text-slate-800">
            {criterioEditando
              ? 'Editar criterio'
              : 'Nuevo criterio'}
          </h2>

          <div className="mt-5 grid gap-5">

            <div>
              <label
                htmlFor="bloqueId"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Bloque
              </label>

              <select
                id="bloqueId"
                value={
                  bloqueId
                }
                onChange={e =>
                  setBloqueId(
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Seleccione un bloque
                </option>

                {bloquesActivos.map(
                  bloque => (
                    <option
                      key={
                        bloque.id
                      }
                      value={
                        bloque.id
                      }
                    >
                      {bloque.orden} -{' '}
                      {bloque.nombre}
                    </option>
                  ),
                )}

              </select>
            </div>

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
                : criterioEditando
                  ? 'Guardar cambios'
                  : 'Crear criterio'}
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

      {/* FILTRO */}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="max-w-sm">
          <label
            htmlFor="filtroBloque"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Filtrar por bloque
          </label>

          <select
            id="filtroBloque"
            value={
              filtroBloque
            }
            onChange={e =>
              setFiltroBloque(
                e.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Todos los bloques
            </option>

            {bloques.map(
              bloque => (
                <option
                  key={
                    bloque.id
                  }
                  value={
                    bloque.id
                  }
                >
                  {bloque.orden} -{' '}
                  {bloque.nombre}
                </option>
              ),
            )}

          </select>
        </div>

      </section>

      {/* LISTADO */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {cargando ? (
          <LoadingState
            className="border-0 shadow-none"
            title="Cargando criterios…"
          />
        ) : criteriosFiltrados.length === 0 ? (
          <EmptyState
            className="m-4 border-0 bg-transparent"
            title="Sin criterios"
            message="No hay criterios de evaluación registrados."
          />
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-slate-200">

              <thead className="bg-slate-50">
                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bloque
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orden
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Criterio
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

                {criteriosFiltrados.map(
                  criterio => (
                    <tr
                      key={
                        criterio.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {criterio.bloque
                          ?.nombre ??
                          buscarNombreBloque(
                            bloques,
                            criterio.bloqueId,
                          )}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {
                          criterio.orden
                        }
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {
                            criterio.nombre
                          }
                        </p>

                        {criterio.descripcion && (
                          <p className="mt-1 max-w-md text-sm text-slate-500">
                            {
                              criterio.descripcion
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge activo={criterio.activo} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditar(
                                criterio,
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              solicitarCambioEstado(
                                criterio,
                              )
                            }
                            className={
                              criterio.activo
                                ? 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100'
                                : 'rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100'
                            }
                          >
                            {criterio.activo
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

function buscarNombreBloque(
  bloques: BloqueEvaluacion[],
  bloqueId: number,
): string {
  const bloque =
    bloques.find(
      item =>
        item.id === bloqueId,
    );

  return bloque?.nombre ??
    'Bloque no encontrado';
}

