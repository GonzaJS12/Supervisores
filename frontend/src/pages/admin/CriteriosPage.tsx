import {
  useEffect,
  useState,
  type ReactNode,
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

export default function CriteriosPage() {
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
  ] = useState<CriterioEvaluacion | null>(
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

  useEffect(() => {
    let activo = true;

    const cargarInicial =
      async () => {
        try {
          const [
            datosCriterios,
            datosBloques,
          ] = await Promise.all([
            obtenerCriterios(),
            obtenerBloques(),
          ]);

          if (!activo) {
            return;
          }

          setCriterios(
            datosCriterios,
          );

          setBloques(
            datosBloques,
          );
        } catch (error) {
          console.error(error);

          if (!activo) {
            return;
          }

          setError(
            'No se pudieron cargar los criterios.',
          );
        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      };

    void cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

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

  const handleEditar = (
    criterio: CriterioEvaluacion,
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

  const handleCambiarEstado =
    async (
      criterio:
        CriterioEvaluacion,
    ) => {
      const nuevoEstado =
        !criterio.activo;

      const accion =
        nuevoEstado
          ? 'activar'
          : 'desactivar';

      const confirmado =
        window.confirm(
          `¿Está seguro de ${accion} el criterio "${criterio.nombre}"?`,
        );

      if (!confirmado) {
        return;
      }

      try {
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

  const criteriosActivos =
    criterios.filter(
      criterio =>
        criterio.activo,
    ).length;

  const criteriosInactivos =
    criterios.length -
    criteriosActivos;

  const nombreBloqueFiltrado =
    filtroBloque
      ? buscarNombreBloque(
          bloques,
          Number(filtroBloque),
        )
      : '';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Configuración
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Criterios de evaluación
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Configure los aspectos
            específicos que serán
            evaluados durante cada
            supervisión y organícelos
            dentro de sus bloques.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleNuevoCriterio
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:self-auto"
        >
          <IconoAgregar />

          Nuevo criterio
        </button>
      </section>

      {/* RESUMEN */}
      {!cargando && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TarjetaResumen
            titulo="Criterios"
            valor={criterios.length}
            descripcion="Configurados"
            icono={
              <IconoCriterios />
            }
            estilo="azul"
          />

          <TarjetaResumen
            titulo="Activos"
            valor={criteriosActivos}
            descripcion="Disponibles para evaluar"
            icono={
              <IconoActivo />
            }
            estilo="verde"
          />

          <TarjetaResumen
            titulo="Inactivos"
            valor={criteriosInactivos}
            descripcion="Fuera de uso"
            icono={
              <IconoInactivo />
            }
            estilo="gris"
          />

          <TarjetaResumen
            titulo="Bloques activos"
            valor={bloquesActivos.length}
            descripcion="Disponibles para asignación"
            icono={
              <IconoBloques />
            }
            estilo="violeta"
          />
        </section>
      )}

      {/* MENSAJES */}
      {mensaje && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
          <div className="mt-0.5 shrink-0">
            <IconoExito />
          </div>

          <div>
            <p className="font-semibold">
              Operación realizada
            </p>

            <p className="mt-0.5 text-emerald-600">
              {mensaje}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <div className="mt-0.5 shrink-0">
            <IconoAlerta />
          </div>

          <div>
            <p className="font-semibold">
              Se produjo un inconveniente
            </p>

            <p className="mt-0.5 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {criterioEditando ? (
                  <IconoEditar />
                ) : (
                  <IconoAgregar />
                )}
              </div>

              <div>
                <h2 className="font-bold text-slate-900 sm:text-lg">
                  {criterioEditando
                    ? 'Editar criterio'
                    : 'Nuevo criterio'}
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {criterioEditando
                    ? 'Modifique la información y ubicación del criterio seleccionado.'
                    : 'Defina el criterio y seleccione el bloque de evaluación al que pertenecerá.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              {/* BLOQUE */}
              <div>
                <label
                  htmlFor="bloqueId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Bloque

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="bloqueId"
                  value={
                    bloqueId
                  }
                  onChange={event =>
                    setBloqueId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                        {bloque.orden}
                        {' - '}
                        {bloque.nombre}
                      </option>
                    ),
                  )}
                </select>

                <p className="mt-1.5 text-xs text-slate-400">
                  Solo se muestran
                  bloques activos.
                </p>
              </div>

              {/* ORDEN */}
              <div>
                <label
                  htmlFor="orden"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Orden

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="orden"
                  type="number"
                  min="1"
                  value={orden}
                  onChange={event =>
                    setOrden(
                      event.target.value,
                    )
                  }
                  placeholder="1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Posición dentro del
                  bloque seleccionado.
                </p>
              </div>

              {/* NOMBRE */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nombre del criterio

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={event =>
                    setNombre(
                      event.target.value,
                    )
                  }
                  placeholder="Ej.: Verifica correctamente la información de la familia"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  rows={3}
                  value={
                    descripcion
                  }
                  onChange={event =>
                    setDescripcion(
                      event.target.value,
                    )
                  }
                  placeholder="Detalle brevemente qué debe observar el supervisor al evaluar este criterio..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Este campo es opcional.
                </p>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  handleCancelar
                }
                disabled={
                  guardando
                }
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  handleGuardar
                }
                disabled={
                  guardando
                }
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <Spinner />

                    Guardando...
                  </>
                ) : (
                  <>
                    <IconoGuardar />

                    {criterioEditando
                      ? 'Guardar cambios'
                      : 'Crear criterio'}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FILTRO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-slate-400">
                <IconoFiltro />
              </div>

              <h2 className="font-bold text-slate-800">
                Filtrar criterios
              </h2>
            </div>

            <p className="mt-1.5 text-sm text-slate-500">
              Visualice los criterios
              pertenecientes a un bloque
              específico.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <label
              htmlFor="filtroBloque"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Bloque de evaluación
            </label>

            <div className="flex gap-2">
              <select
                id="filtroBloque"
                value={
                  filtroBloque
                }
                onChange={event =>
                  setFiltroBloque(
                    event.target.value,
                  )
                }
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                      {bloque.orden}
                      {' - '}
                      {bloque.nombre}
                    </option>
                  ),
                )}
              </select>

              {filtroBloque && (
                <button
                  type="button"
                  onClick={() =>
                    setFiltroBloque('')
                  }
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  title="Limpiar filtro"
                  aria-label="Limpiar filtro"
                >
                  <IconoCerrar />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900 sm:text-lg">
              Estructura de criterios
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {filtroBloque
                ? `Mostrando criterios de ${nombreBloqueFiltrado}.`
                : 'Todos los criterios configurados para las supervisiones.'}
            </p>
          </div>

          {!cargando && (
            <span className="inline-flex self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:self-auto">
              {
                criteriosFiltrados.length
              }{' '}
              {criteriosFiltrados.length ===
              1
                ? 'criterio'
                : 'criterios'}
            </span>
          )}
        </div>

        {cargando ? (
          <CriteriosSkeleton />
        ) : criteriosFiltrados.length ===
          0 ? (
          <EstadoVacio
            filtrado={
              Boolean(
                filtroBloque,
              )
            }
            onCrear={
              handleNuevoCriterio
            }
            onLimpiar={() =>
              setFiltroBloque('')
            }
          />
        ) : (
          <>
            {/* ESCRITORIO */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bloque
                    </th>

                    <th className="w-24 px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Orden
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Criterio
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                        className="transition hover:bg-slate-50/80"
                      >
                        {/* BLOQUE */}
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                            <IconoBloque />

                            {criterio.bloque
                              ?.nombre ??
                              buscarNombreBloque(
                                bloques,
                                criterio.bloqueId,
                              )}
                          </div>
                        </td>

                        {/* ORDEN */}
                        <td className="px-6 py-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                            {
                              criterio.orden
                            }
                          </div>
                        </td>

                        {/* CRITERIO */}
                        <td className="px-6 py-4">
                          <div className="max-w-xl">
                            <p className="font-semibold text-slate-800">
                              {
                                criterio.nombre
                              }
                            </p>

                            {criterio.descripcion ? (
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {
                                  criterio.descripcion
                                }
                              </p>
                            ) : (
                              <p className="mt-1 text-xs italic text-slate-400">
                                Sin descripción
                              </p>
                            )}
                          </div>
                        </td>

                        {/* ESTADO */}
                        <td className="px-6 py-4">
                          <EstadoBadge
                            activo={
                              criterio.activo
                            }
                          />
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEditar(
                                  criterio,
                                )
                              }
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <IconoEditar />

                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstado(
                                  criterio,
                                )
                              }
                              className={
                                criterio.activo
                                  ? 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100'
                                  : 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100'
                              }
                            >
                              {criterio.activo ? (
                                <IconoDesactivar />
                              ) : (
                                <IconoActivar />
                              )}

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

            {/* MÓVIL / TABLET */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {criteriosFiltrados.map(
                criterio => (
                  <article
                    key={
                      criterio.id
                    }
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                            <IconoBloque />

                            {criterio.bloque
                              ?.nombre ??
                              buscarNombreBloque(
                                bloques,
                                criterio.bloqueId,
                              )}
                          </span>

                          <EstadoBadge
                            activo={
                              criterio.activo
                            }
                          />
                        </div>

                        <h3 className="font-bold leading-6 text-slate-800">
                          {
                            criterio.nombre
                          }
                        </h3>

                        {criterio.descripcion ? (
                          <p className="mt-2 text-sm leading-5 text-slate-500">
                            {
                              criterio.descripcion
                            }
                          </p>
                        ) : (
                          <p className="mt-2 text-xs italic text-slate-400">
                            Sin descripción
                          </p>
                        )}
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                        {
                          criterio.orden
                        }
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditar(
                            criterio,
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <IconoEditar />

                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCambiarEstado(
                            criterio,
                          )
                        }
                        className={
                          criterio.activo
                            ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100'
                            : 'inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100'
                        }
                      >
                        {criterio.activo ? (
                          <IconoDesactivar />
                        ) : (
                          <IconoActivar />
                        )}

                        {criterio.activo
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* =========================================================
 * COMPONENTES
 * ======================================================= */

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
  icono,
  estilo,
}: {
  titulo: string;
  valor: number;
  descripcion: string;
  icono: ReactNode;
  estilo:
    | 'azul'
    | 'verde'
    | 'gris'
    | 'violeta';
}) {
  const estilos = {
    azul:
      'bg-blue-50 text-blue-600',

    verde:
      'bg-emerald-50 text-emerald-600',

    gris:
      'bg-slate-100 text-slate-600',

    violeta:
      'bg-violet-50 text-violet-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {titulo}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {valor}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {descripcion}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${estilos[estilo]}`}
        >
          {icono}
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({
  activo,
}: {
  activo: boolean;
}) {
  return activo ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

      Inactivo
    </span>
  );
}

function EstadoVacio({
  filtrado,
  onCrear,
  onLimpiar,
}: {
  filtrado: boolean;
  onCrear: () => void;
  onLimpiar: () => void;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <IconoCriterios className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        {filtrado
          ? 'No hay criterios en este bloque'
          : 'No hay criterios configurados'}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtrado
          ? 'El bloque seleccionado no contiene criterios o no hay criterios disponibles para mostrar.'
          : 'Cree el primer criterio para comenzar a definir los aspectos que serán evaluados durante las supervisiones.'}
      </p>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        {filtrado && (
          <button
            type="button"
            onClick={
              onLimpiar
            }
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver todos
          </button>
        )}

        <button
          type="button"
          onClick={
            onCrear
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <IconoAgregar />

          Nuevo criterio
        </button>
      </div>
    </div>
  );
}

function CriteriosSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map(
        item => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-4 px-6 py-5"
          >
            <div className="h-7 w-28 rounded-lg bg-slate-100" />

            <div className="h-9 w-9 rounded-lg bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-64 max-w-full rounded bg-slate-200" />

              <div className="mt-2 h-3 w-80 max-w-full rounded bg-slate-100" />
            </div>

            <div className="hidden h-7 w-20 rounded-full bg-slate-100 sm:block" />

            <div className="hidden h-8 w-24 rounded bg-slate-100 lg:block" />
          </div>
        ),
      )}
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
 * HELPERS
 * ======================================================= */

function buscarNombreBloque(
  bloques: BloqueEvaluacion[],
  bloqueId: number,
): string {
  const bloque =
    bloques.find(
      item =>
        item.id === bloqueId,
    );

  return (
    bloque?.nombre ??
    'Bloque no encontrado'
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

/* =========================================================
 * ICONOS
 * ======================================================= */

interface IconoProps {
  className?: string;
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

function IconoCriterios({
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
        d="M9 6h11M9 12h11M9 18h11"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"
      />
    </svg>
  );
}

function IconoBloques({
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
        x="3"
        y="4"
        width="18"
        height="6"
        rx="2"
      />

      <rect
        x="3"
        y="14"
        width="18"
        height="6"
        rx="2"
      />
    </svg>
  );
}

function IconoBloque({
  className = 'h-3.5 w-3.5',
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
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
      />

      <path
        strokeLinecap="round"
        d="M8 9h8M8 13h8M8 17h5"
      />
    </svg>
  );
}

function IconoActivo({
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
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 12 2.5 2.5L16 9"
      />
    </svg>
  );
}

function IconoInactivo({
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
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        d="M8 12h8"
      />
    </svg>
  );
}

function IconoEditar({
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
        d="M12 20h9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
      />
    </svg>
  );
}

function IconoGuardar({
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
        d="M5 3h12l2 2v16H5V3Z"
      />

      <path
        strokeLinecap="round"
        d="M8 3v6h8V3M8 21v-7h8v7"
      />
    </svg>
  );
}

function IconoFiltro({
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
        d="M4 5h16l-6 7v5l-4 2v-7L4 5Z"
      />
    </svg>
  );
}

function IconoCerrar({
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
        d="m7 7 10 10M17 7 7 17"
      />
    </svg>
  );
}

function IconoDesactivar({
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
        d="M8 12h8"
      />
    </svg>
  );
}

function IconoActivar({
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
        strokeLinejoin="round"
        d="m8 12 2.5 2.5L16 9"
      />
    </svg>
  );
}

function IconoExito({
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
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 12 2.5 2.5L16 9"
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