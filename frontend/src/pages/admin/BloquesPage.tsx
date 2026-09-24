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

  useEffect(() => {
    let activo = true;

    const cargarInicial =
      async () => {
        try {
          const datos =
            await obtenerBloques();

          if (!activo) {
            return;
          }

          setBloques(datos);
        } catch (error) {
          console.error(error);

          if (!activo) {
            return;
          }

          setError(
            'No se pudieron cargar los bloques.',
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

  const handleEditar = (
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

  const totalBloques =
    bloques.length;

  const bloquesActivos =
    bloques.filter(
      bloque => bloque.activo,
    ).length;

  const bloquesInactivos =
    totalBloques -
    bloquesActivos;

  const totalCriterios =
    bloques.reduce(
      (total, bloque) =>
        total +
        (
          bloque.criterios
            ?.length ?? 0
        ),
      0,
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Configuración
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bloques de evaluación
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Organice las secciones que
            componen el formulario de
            supervisión y defina el orden
            en que serán presentadas.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleNuevoBloque
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:self-auto"
        >
          <IconoAgregar />

          Nuevo bloque
        </button>
      </section>

      {/* RESUMEN */}
      {!cargando && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TarjetaResumen
            titulo="Bloques"
            valor={totalBloques}
            descripcion="Configurados"
            icono={
              <IconoBloques />
            }
            estilo="azul"
          />

          <TarjetaResumen
            titulo="Activos"
            valor={bloquesActivos}
            descripcion="Disponibles para evaluar"
            icono={
              <IconoActivo />
            }
            estilo="verde"
          />

          <TarjetaResumen
            titulo="Inactivos"
            valor={bloquesInactivos}
            descripcion="Fuera de uso"
            icono={
              <IconoInactivo />
            }
            estilo="gris"
          />

          <TarjetaResumen
            titulo="Criterios"
            valor={totalCriterios}
            descripcion="Asociados a los bloques"
            icono={
              <IconoCriterios />
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
                {bloqueEditando ? (
                  <IconoEditar />
                ) : (
                  <IconoAgregar />
                )}
              </div>

              <div>
                <h2 className="font-bold text-slate-900 sm:text-lg">
                  {bloqueEditando
                    ? 'Editar bloque'
                    : 'Nuevo bloque'}
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {bloqueEditando
                    ? 'Modifique la información y el orden del bloque seleccionado.'
                    : 'Complete la información para agregar una nueva sección al formulario de evaluación.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
              {/* NOMBRE */}
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nombre

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
                  placeholder="Ej.: Desempeño en terreno"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
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
                  Posición en el formulario.
                </p>
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
                  placeholder="Describa brevemente qué aspectos agrupa este bloque de evaluación..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Este campo es opcional.
                </p>
              </div>
            </div>

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
                className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <Spinner />

                    Guardando...
                  </>
                ) : (
                  <>
                    <IconoGuardar />

                    {bloqueEditando
                      ? 'Guardar cambios'
                      : 'Crear bloque'}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* LISTADO */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900 sm:text-lg">
              Estructura de evaluación
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Bloques configurados y
              cantidad de criterios
              asociados a cada uno.
            </p>
          </div>

          {!cargando &&
            bloques.length > 0 && (
              <span className="inline-flex self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:self-auto">
                {totalBloques}{' '}
                {totalBloques === 1
                  ? 'bloque'
                  : 'bloques'}
              </span>
            )}
        </div>

        {cargando ? (
          <BloquesSkeleton />
        ) : bloques.length === 0 ? (
          <EstadoVacio
            onCrear={
              handleNuevoBloque
            }
          />
        ) : (
          <>
            {/* ESCRITORIO */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="w-24 px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Orden
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bloque
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Criterios
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
                  {bloques.map(
                    bloque => (
                      <tr
                        key={
                          bloque.id
                        }
                        className="transition hover:bg-slate-50/80"
                      >
                        {/* ORDEN */}
                        <td className="px-6 py-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                            {
                              bloque.orden
                            }
                          </div>
                        </td>

                        {/* BLOQUE */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <IconoBloque />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {
                                  bloque.nombre
                                }
                              </p>

                              {bloque.descripcion ? (
                                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                  {
                                    bloque.descripcion
                                  }
                                </p>
                              ) : (
                                <p className="mt-1 text-xs italic text-slate-400">
                                  Sin descripción
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CRITERIOS */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
                            <IconoLista />

                            {bloque
                              .criterios
                              ?.length ??
                              0}
                          </span>
                        </td>

                        {/* ESTADO */}
                        <td className="px-6 py-4">
                          <EstadoBadge
                            activo={
                              bloque.activo
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
                                  bloque,
                                )
                              }
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <IconoEditar className="h-3.5 w-3.5" />

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
                                  ? 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100'
                                  : 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100'
                              }
                            >
                              {bloque.activo ? (
                                <IconoDesactivar />
                              ) : (
                                <IconoActivar />
                              )}

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

            {/* MÓVIL */}
            <div className="divide-y divide-slate-100 md:hidden">
              {bloques.map(
                bloque => (
                  <article
                    key={
                      bloque.id
                    }
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <IconoBloque />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-800">
                            {
                              bloque.nombre
                            }
                          </h3>

                          <EstadoBadge
                            activo={
                              bloque.activo
                            }
                          />
                        </div>

                        {bloque.descripcion ? (
                          <p className="mt-2 text-sm leading-5 text-slate-500">
                            {
                              bloque.descripcion
                            }
                          </p>
                        ) : (
                          <p className="mt-2 text-xs italic text-slate-400">
                            Sin descripción
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <DatoMovil
                        label="Orden"
                        valor={
                          bloque.orden
                        }
                      />

                      <DatoMovil
                        label="Criterios"
                        valor={
                          bloque
                            .criterios
                            ?.length ??
                          0
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditar(
                            bloque,
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
                            bloque,
                          )
                        }
                        className={
                          bloque.activo
                            ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100'
                            : 'inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100'
                        }
                      >
                        {bloque.activo ? (
                          <IconoDesactivar />
                        ) : (
                          <IconoActivar />
                        )}

                        {bloque.activo
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
  icono: React.ReactNode;
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

function DatoMovil({
  label,
  valor,
}: {
  label: string;
  valor:
    | string
    | number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-700">
        {valor}
      </p>
    </div>
  );
}

function EstadoVacio({
  onCrear,
}: {
  onCrear: () => void;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <IconoBloques className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        No hay bloques configurados
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Cree el primer bloque para
        comenzar a estructurar el
        formulario de supervisión.
      </p>

      <button
        type="button"
        onClick={onCrear}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <IconoAgregar />

        Nuevo bloque
      </button>
    </div>
  );
}

function BloquesSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map(
        item => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-4 px-6 py-5"
          >
            <div className="h-9 w-9 rounded-lg bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-48 max-w-full rounded bg-slate-200" />

              <div className="mt-2 h-3 w-72 max-w-full rounded bg-slate-100" />
            </div>

            <div className="hidden h-7 w-20 rounded-full bg-slate-100 sm:block" />

            <div className="hidden h-8 w-24 rounded bg-slate-100 md:block" />
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
 * ERROR BACKEND
 * ======================================================= */

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

function IconoLista({
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
        d="M9 6h11M9 12h11M9 18h11"
      />

      <circle
        cx="4"
        cy="6"
        r="1"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="4"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="4"
        cy="18"
        r="1"
        fill="currentColor"
        stroke="none"
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