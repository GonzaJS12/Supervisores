import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  obtenerMisSupervisiones,
  obtenerSupervisiones,
  obtenerSupervisionesParaExportacion,
} from '../../services/supervisiones.service';

import {
  exportarSupervisionesPdf,
} from '../../services/exportar-pdf.service';

import type {
  SupervisionListado,
} from '../../types/supervision';

import {
  useAuth,
} from '../../context/useAuth';

const LIMITE_POR_PAGINA = 15;

export default function SupervisionesPage() {
  const navigate = useNavigate();

  const {
    usuario,
  } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  const [
    supervisiones,
    setSupervisiones,
  ] = useState<SupervisionListado[]>([]);

  const [
    pagina,
    setPagina,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPaginas,
    setTotalPaginas,
  ] = useState(0);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    exportandoPdf,
    setExportandoPdf,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    fechaDesde,
    setFechaDesde,
  ] = useState('');

  const [
    fechaHasta,
    setFechaHasta,
  ] = useState('');

  const [
    clasificacion,
    setClasificacion,
  ] = useState('');

  const handleFechaDesdeChange = (
    valor: string,
  ) => {
    setFechaDesde(valor);
    setPagina(1);
  };

  const handleFechaHastaChange = (
    valor: string,
  ) => {
    setFechaHasta(valor);
    setPagina(1);
  };

  const handleClasificacionChange = (
    valor: string,
  ) => {
    setClasificacion(valor);
    setPagina(1);
  };

  const handleLimpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setClasificacion('');
    setPagina(1);
  };

  const hayFiltros =
    fechaDesde !== '' ||
    fechaHasta !== '' ||
    clasificacion !== '';

  /*
   * El PDF conserva el comportamiento
   * actual: exporta todo el historial
   * permitido para el usuario.
   */
  const handleExportarPdf =
    async () => {
      try {
        setExportandoPdf(true);
        setError('');

        const datos =
          await obtenerSupervisionesParaExportacion();

        if (datos.length === 0) {
          setError(
            'No hay supervisiones para exportar.',
          );

          return;
        }

        const nombreSupervisor =
          !esAdmin && usuario
            ? `${usuario.nombre} ${usuario.apellido}`
            : undefined;

        exportarSupervisionesPdf({
          supervisiones:
            datos,

          titulo: esAdmin
            ? 'Reporte global de supervisiones'
            : 'Reporte de mis supervisiones',

          nombreArchivo: esAdmin
            ? 'supervisiones-global'
            : 'mis-supervisiones',

          supervisor:
            nombreSupervisor,
        });
      } catch (error) {
        console.error(error);

        setError(
          'No se pudo generar el PDF de supervisiones.',
        );
      } finally {
        setExportandoPdf(false);
      }
    };

  /*
   * LISTADO PAGINADO
   */
  useEffect(() => {
    const cargar =
      async () => {
        try {
          setCargando(true);
          setError('');

          const filtros = {
            fechaDesde:
              fechaDesde ||
              undefined,

            fechaHasta:
              fechaHasta ||
              undefined,

            clasificacion:
              clasificacion ||
              undefined,
          };

          const respuesta =
            esAdmin
              ? await obtenerSupervisiones(
                  pagina,
                  LIMITE_POR_PAGINA,
                  filtros,
                )
              : await obtenerMisSupervisiones(
                  pagina,
                  LIMITE_POR_PAGINA,
                  filtros,
                );

          setSupervisiones(
            respuesta.data,
          );

          setTotal(
            respuesta.meta.total,
          );

          setTotalPaginas(
            respuesta.meta.totalPages,
          );

          if (
            respuesta.meta.totalPages > 0 &&
            pagina >
              respuesta.meta.totalPages
          ) {
            setPagina(
              respuesta.meta.totalPages,
            );
          }
        } catch (error) {
          console.error(error);

          setError(
            esAdmin
              ? 'No se pudieron cargar las supervisiones.'
              : 'No se pudieron cargar sus supervisiones.',
          );
        } finally {
          setCargando(false);
        }
      };

    cargar();
  }, [
    esAdmin,
    pagina,
    fechaDesde,
    fechaHasta,
    clasificacion,
  ]);

  const desde =
    total === 0
      ? 0
      : (pagina - 1) *
          LIMITE_POR_PAGINA +
        1;

  const hasta =
    total === 0
      ? 0
      : Math.min(
          pagina *
            LIMITE_POR_PAGINA,
          total,
        );

  const puedeAnterior =
    pagina > 1 &&
    !cargando;

  const puedeSiguiente =
    pagina < totalPaginas &&
    !cargando;

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Seguimiento
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {esAdmin
              ? 'Supervisiones'
              : 'Mis supervisiones'}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {esAdmin
              ? 'Consulte y analice el historial de supervisiones realizadas a los agentes sanitarios.'
              : 'Consulte el historial de las supervisiones que usted ha realizado.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={
              handleExportarPdf
            }
            disabled={
              cargando ||
              exportandoPdf ||
              total === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exportandoPdf ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
            ) : (
              <IconoPdf />
            )}

            {exportandoPdf
              ? 'Generando PDF...'
              : 'Exportar PDF'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                '/supervisiones/nueva',
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <IconoAgregar />

            Nueva supervisión
          </button>
        </div>
      </section>

      {/* RESUMEN */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <IconoClipboard />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {hayFiltros
                ? 'Resultados'
                : esAdmin
                  ? 'Supervisiones registradas'
                  : 'Mis supervisiones'}
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {total}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <IconoPagina />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Página actual
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {totalPaginas > 0
                ? `${pagina} / ${totalPaginas}`
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <IconoFiltro />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Filtrar supervisiones
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Combine un rango de fechas con una clasificación.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* DESDE */}
            <div>
              <label
                htmlFor="fechaDesde"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Fecha desde
              </label>

              <input
                id="fechaDesde"
                type="date"
                value={
                  fechaDesde
                }
                max={
                  fechaHasta ||
                  undefined
                }
                onChange={event =>
                  handleFechaDesdeChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* HASTA */}
            <div>
              <label
                htmlFor="fechaHasta"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Fecha hasta
              </label>

              <input
                id="fechaHasta"
                type="date"
                value={
                  fechaHasta
                }
                min={
                  fechaDesde ||
                  undefined
                }
                onChange={event =>
                  handleFechaHastaChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* CLASIFICACIÓN */}
            <div>
              <label
                htmlFor="clasificacion"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Clasificación
              </label>

              <select
                id="clasificacion"
                value={
                  clasificacion
                }
                onChange={event =>
                  handleClasificacionChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  Todas las clasificaciones
                </option>

                <option value="CRITICO">
                  Crítico
                </option>

                <option value="REGULAR">
                  Regular
                </option>

                <option value="BUENO">
                  Bueno
                </option>

                <option value="EXCELENTE">
                  Excelente
                </option>
              </select>
            </div>

            {/* LIMPIAR */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={
                  handleLimpiarFiltros
                }
                disabled={
                  !hayFiltros ||
                  cargando
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconoLimpiar />

                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {hayFiltros && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}

              <span>
                {hayFiltros
                  ? `${total} supervisión${
                      total === 1
                        ? ''
                        : 'es'
                    } encontrada${
                      total === 1
                        ? ''
                        : 's'
                    }`
                  : `${total} supervisión${
                      total === 1
                        ? ''
                        : 'es'
                    } registrada${
                      total === 1
                        ? ''
                        : 's'
                    }`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <div className="mt-0.5 shrink-0">
            <IconoAlerta />
          </div>

          <p>{error}</p>
        </div>
      )}

      {/* LISTADO */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">
              Historial
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Seleccione una supervisión para consultar su evaluación completa.
            </p>
          </div>

          {cargando && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />

              Actualizando
            </div>
          )}
        </div>

        {cargando &&
        supervisiones.length === 0 ? (
          <EstadoCargando />
        ) : supervisiones.length === 0 ? (
          <EstadoVacio
            hayFiltros={
              hayFiltros
            }
            esAdmin={
              esAdmin
            }
          />
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>

                    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Agente
                    </th>

                    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Área / Sector
                    </th>

                    {esAdmin && (
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Supervisor
                      </th>
                    )}

                    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Promedio
                    </th>

                    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Clasificación
                    </th>

                    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Gestión
                    </th>

                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {supervisiones.map(
                    supervision => (
                      <tr
                        key={
                          supervision.id
                        }
                        className="group transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-600">
                          {formatearFecha(
                            supervision.fecha,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex min-w-48 items-center gap-3">
                            <AvatarAgente
                              nombre={
                                supervision
                                  .agenteSanitario
                                  .nombre
                              }
                              apellido={
                                supervision
                                  .agenteSanitario
                                  .apellido
                              }
                            />

                            <div>
                              <p className="font-semibold text-slate-800">
                                {
                                  supervision
                                    .agenteSanitario
                                    .apellido
                                }
                                ,{' '}
                                {
                                  supervision
                                    .agenteSanitario
                                    .nombre
                                }
                              </p>

                              {supervision
                                .agenteSanitario
                                .legajo && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Legajo{' '}
                                  {
                                    supervision
                                      .agenteSanitario
                                      .legajo
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">
                            {
                              supervision
                                .areaOperativa
                                .nombre
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {obtenerSector(
                              supervision,
                            )}
                          </p>
                        </td>

                        {esAdmin && (
                          <td className="px-5 py-4 text-slate-600">
                            {
                              supervision
                                .supervisor
                                .nombre
                            }{' '}
                            {
                              supervision
                                .supervisor
                                .apellido
                            }
                          </td>
                        )}

                        <td className="px-5 py-4">
                          <span className="text-lg font-bold text-slate-900">
                            {formatearPromedio(
                              supervision.promedio,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <ClasificacionBadge
                            clasificacion={
                              supervision
                                .clasificacion
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <DecisionBadge
                            decision={
                              supervision
                                .decisionGestion
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/supervisiones/${supervision.id}`,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            Ver detalle
                            <IconoChevron />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLET / MÓVIL */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {supervisiones.map(
                supervision => (
                  <button
                    type="button"
                    key={
                      supervision.id
                    }
                    onClick={() =>
                      navigate(
                        `/supervisiones/${supervision.id}`,
                      )
                    }
                    className="block w-full p-5 text-left transition active:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <AvatarAgente
                        nombre={
                          supervision
                            .agenteSanitario
                            .nombre
                        }
                        apellido={
                          supervision
                            .agenteSanitario
                            .apellido
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {
                                supervision
                                  .agenteSanitario
                                  .apellido
                              }
                              ,{' '}
                              {
                                supervision
                                  .agenteSanitario
                                  .nombre
                              }
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <IconoCalendario
                                className="h-3.5 w-3.5"
                              />

                              {formatearFecha(
                                supervision.fecha,
                              )}
                            </div>
                          </div>

                          <ClasificacionBadge
                            clasificacion={
                              supervision
                                .clasificacion
                            }
                          />
                        </div>

                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                          <DatoMovil
                            label="Área"
                            valor={
                              supervision
                                .areaOperativa
                                .nombre
                            }
                          />

                          <DatoMovil
                            label="Sector"
                            valor={
                              obtenerSector(
                                supervision,
                              )
                            }
                          />

                          {esAdmin && (
                            <DatoMovil
                              label="Supervisor"
                              valor={`${supervision.supervisor.nombre} ${supervision.supervisor.apellido}`}
                            />
                          )}

                          <DatoMovil
                            label="Gestión"
                            valor={
                              formatearDecision(
                                supervision
                                  .decisionGestion,
                              )
                            }
                          />
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Promedio
                            </p>

                            <p className="mt-0.5 text-xl font-bold text-slate-900">
                              {formatearPromedio(
                                supervision.promedio,
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                            Ver detalle
                            <IconoChevron />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ),
              )}
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-center text-sm text-slate-500 sm:text-left">
                Mostrando{' '}
                <span className="font-semibold text-slate-700">
                  {desde}
                </span>
                {' – '}
                <span className="font-semibold text-slate-700">
                  {hasta}
                </span>
                {' de '}
                <span className="font-semibold text-slate-700">
                  {total}
                </span>
              </p>

              <div className="flex items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={
                    !puedeAnterior
                  }
                  onClick={() =>
                    setPagina(
                      paginaActual =>
                        paginaActual - 1,
                    )
                  }
                  aria-label="Página anterior"
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconoAnterior />

                  <span className="hidden sm:inline">
                    Anterior
                  </span>
                </button>

                <div className="flex h-9 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
                  Página{' '}
                  <span className="mx-1 font-bold text-slate-900">
                    {pagina}
                  </span>
                  de{' '}
                  <span className="ml-1 font-bold text-slate-900">
                    {totalPaginas}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={
                    !puedeSiguiente
                  }
                  onClick={() =>
                    setPagina(
                      paginaActual =>
                        paginaActual + 1,
                    )
                  }
                  aria-label="Página siguiente"
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">
                    Siguiente
                  </span>

                  <IconoSiguiente />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function AvatarAgente({
  nombre,
  apellido,
}: {
  nombre: string;
  apellido: string;
}) {
  const iniciales =
    `${nombre?.[0] ?? ''}${
      apellido?.[0] ?? ''
    }`.toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
      {iniciales || 'A'}
    </div>
  );
}

function DatoMovil({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {valor}
      </p>
    </div>
  );
}

function obtenerSector(
  supervision: SupervisionListado,
): string {
  if (!supervision.sector) {
    return 'Sin sector asignado';
  }

  return (
    supervision.sector.nombre ??
    `Sector ${
      supervision.sector.numero ??
      ''
    }`
  );
}

function formatearPromedio(
  promedio:
    | number
    | string
    | null
    | undefined,
): string {
  if (
    promedio === null ||
    promedio === undefined
  ) {
    return '—';
  }

  const valor =
    Number(promedio);

  if (Number.isNaN(valor)) {
    return '—';
  }

  return valor.toFixed(2);
}

function formatearFecha(
  fecha: string,
): string {
  return new Intl.DateTimeFormat(
    'es-AR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(
    new Date(fecha),
  );
}

function formatearDecision(
  decision: string,
): string {
  const etiquetas:
    Record<string, string> = {
      NO_REQUIERE:
        'No requiere',

      SEGUIMIENTO:
        'Seguimiento',

      CAPACITACION:
        'Capacitación',

      SUPERVISION_INTENSIVA:
        'Supervisión intensiva',
    };

  return (
    etiquetas[decision] ??
    decision
  );
}

function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion?:
    | string
    | null;
}) {
  if (!clasificacion) {
    return (
      <span className="text-slate-400">
        —
      </span>
    );
  }

  const estilos:
    Record<string, string> = {
      CRITICO:
        'border-red-200 bg-red-50 text-red-700',

      REGULAR:
        'border-amber-200 bg-amber-50 text-amber-700',

      BUENO:
        'border-blue-200 bg-blue-50 text-blue-700',

      EXCELENTE:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    };

  const etiquetas:
    Record<string, string> = {
      CRITICO: 'Crítico',
      REGULAR: 'Regular',
      BUENO: 'Bueno',
      EXCELENTE: 'Excelente',
    };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        estilos[
          clasificacion
        ] ??
        'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      {etiquetas[
        clasificacion
      ] ?? clasificacion}
    </span>
  );
}

function DecisionBadge({
  decision,
}: {
  decision: string;
}) {
  const estilos:
    Record<string, string> = {
      NO_REQUIERE:
        'border-slate-200 bg-slate-50 text-slate-600',

      SEGUIMIENTO:
        'border-blue-200 bg-blue-50 text-blue-700',

      CAPACITACION:
        'border-amber-200 bg-amber-50 text-amber-700',

      SUPERVISION_INTENSIVA:
        'border-red-200 bg-red-50 text-red-700',
    };

  return (
    <span
      className={`inline-flex max-w-40 rounded-lg border px-2.5 py-1 text-xs font-medium ${
        estilos[decision] ??
        'border-slate-200 bg-slate-50 text-slate-600'
      }`}
    >
      {formatearDecision(
        decision,
      )}
    </span>
  );
}

function EstadoCargando() {
  return (
    <div className="space-y-3 p-5 sm:p-6">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />

          <div className="flex-1">
            <div className="h-4 w-52 max-w-full rounded bg-slate-200" />

            <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
          </div>

          <div className="hidden h-7 w-20 rounded-full bg-slate-100 sm:block" />
        </div>
      ))}
    </div>
  );
}

function EstadoVacio({
  hayFiltros,
  esAdmin,
}: {
  hayFiltros: boolean;
  esAdmin: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {hayFiltros
          ? <IconoFiltro />
          : <IconoClipboard />}
      </div>

      <p className="mt-4 font-semibold text-slate-700">
        {hayFiltros
          ? 'No se encontraron supervisiones'
          : esAdmin
            ? 'No hay supervisiones registradas'
            : 'Todavía no realizó supervisiones'}
      </p>

      <p className="mt-1 max-w-md text-sm leading-5 text-slate-500">
        {hayFiltros
          ? 'Pruebe modificando el rango de fechas o la clasificación seleccionada.'
          : esAdmin
            ? 'Las supervisiones realizadas aparecerán en este historial.'
            : 'Cuando realice una supervisión, podrá consultarla desde esta pantalla.'}
      </p>
    </div>
  );
}

interface IconoProps {
  className?: string;
}

function IconoPdf({
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
        d="M6 3h8l4 4v14H6z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 3v5h5M9 13h6M9 17h4"
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

function IconoClipboard({
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
        d="M9 5h6M9 3h6v4H9zM6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 13 2 2 5-5"
      />
    </svg>
  );
}

function IconoPagina({
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
        d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"
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
        d="M4 6h16M7 12h10M10 18h4"
      />
    </svg>
  );
}

function IconoLimpiar({
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
        d="m4 4 16 16M20 4 4 20"
      />
    </svg>
  );
}

function IconoCalendario({
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
        height="16"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 3v4M16 3v4M3 10h18"
      />
    </svg>
  );
}

function IconoChevron({
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
        d="m9 18 6-6-6-6"
      />
    </svg>
  );
}

function IconoAnterior({
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

function IconoSiguiente({
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
        d="m9 18 6-6-6-6"
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