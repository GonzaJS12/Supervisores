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
} from '../../context/AuthContext';

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
  ] =
    useState<SupervisionListado[]>([]);

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
  ] =
    useState(true);

  const [
    exportandoPdf,
    setExportandoPdf,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  /*
   * FILTROS
   */
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

  /*
   * Cada vez que cambia un filtro
   * volvemos a la primera página.
   */
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

  /*
   * LIMPIAR FILTROS
   */
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
   * EXPORTACIÓN PDF
   *
   * El listado visual está paginado,
   * pero el PDF debe contener todas
   * las supervisiones permitidas
   * para el usuario autenticado.
   *
   * Por ahora mantenemos el
   * comportamiento existente:
   * exporta el historial completo.
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
   * CARGA DEL LISTADO PAGINADO
   *
   * ADMIN:
   * todas las supervisiones.
   *
   * SUPERVISOR:
   * solamente las propias.
   *
   * Ambos pueden filtrar por:
   * - fecha desde
   * - fecha hasta
   * - clasificación
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

          /*
           * Si por algún motivo estamos
           * parados en una página que ya
           * no existe, volvemos a la última.
           */
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

  /*
   * Cuando cambia el rol,
   * comenzamos nuevamente
   * desde la primera página
   * y limpiamos los filtros.
   */
  useEffect(() => {
    setPagina(1);
    setFechaDesde('');
    setFechaHasta('');
    setClasificacion('');
  }, [esAdmin]);

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
    <div>

      {/* ENCABEZADO */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            {esAdmin
              ? 'Supervisiones'
              : 'Mis supervisiones'}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {esAdmin
              ? 'Historial de todas las supervisiones realizadas.'
              : 'Historial de sus supervisiones realizadas.'}
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

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
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportandoPdf
              ? 'Generando PDF...'
              : esAdmin
                ? 'Exportar PDF'
                : 'Exportar mis supervisiones'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                '/supervisiones/nueva',
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Nueva supervisión
          </button>

        </div>

      </div>

      {/* FILTROS */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-4">

          <h2 className="font-semibold text-slate-800">
            Filtrar supervisiones
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Puede combinar el rango de fechas con la clasificación.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* FECHA DESDE */}

          <div>

            <label
              htmlFor="fechaDesde"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Fecha desde
            </label>

            <input
              id="fechaDesde"
              type="date"
              value={fechaDesde}
              max={
                fechaHasta ||
                undefined
              }
              onChange={(event) =>
                handleFechaDesdeChange(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* FECHA HASTA */}

          <div>

            <label
              htmlFor="fechaHasta"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Fecha hasta
            </label>

            <input
              id="fechaHasta"
              type="date"
              value={fechaHasta}
              min={
                fechaDesde ||
                undefined
              }
              onChange={(event) =>
                handleFechaHastaChange(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* CLASIFICACIÓN */}

          <div>

            <label
              htmlFor="clasificacion"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Clasificación
            </label>

            <select
              id="clasificacion"
              value={
                clasificacion
              }
              onChange={(event) =>
                handleClasificacionChange(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Todas
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
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar filtros
            </button>

          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* INFORMACIÓN DE PAGINACIÓN */}

      {!cargando &&
        total > 0 && (
          <div className="mb-4 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Mostrando{' '}
              <span className="font-semibold text-slate-700">
                {desde}
              </span>
              {' - '}
              <span className="font-semibold text-slate-700">
                {hasta}
              </span>
              {' de '}
              <span className="font-semibold text-slate-700">
                {total}
              </span>
              {' '}
              supervisiones
            </p>

            <p>
              Página{' '}
              <span className="font-semibold text-slate-700">
                {pagina}
              </span>
              {' de '}
              <span className="font-semibold text-slate-700">
                {totalPaginas}
              </span>
            </p>

          </div>
        )}

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {cargando ? (

          <div className="p-8 text-center text-slate-500">
            {esAdmin
              ? 'Cargando supervisiones...'
              : 'Cargando sus supervisiones...'}
          </div>

        ) : supervisiones.length === 0 ? (

          <div className="p-8 text-center text-slate-500">
            {hayFiltros
              ? 'No se encontraron supervisiones con los filtros seleccionados.'
              : esAdmin
                ? 'No hay supervisiones registradas.'
                : 'Todavía no ha realizado supervisiones.'}
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Fecha
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Agente
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Área / Sector
                  </th>

                  {esAdmin && (
                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Supervisor
                    </th>
                  )}

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Promedio
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Clasificación
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Gestión
                  </th>

                  <th className="px-6 py-4">
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {supervisiones.map(
                  (supervision) => (

                    <tr
                      key={
                        supervision.id
                      }
                      className="hover:bg-slate-50"
                    >

                      {/* FECHA */}

                      <td className="px-6 py-4 text-slate-600">
                        {formatearFecha(
                          supervision.fecha,
                        )}
                      </td>

                      {/* AGENTE */}

                      <td className="px-6 py-4">

                        <p className="font-medium text-slate-800">
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

                          <p className="text-xs text-slate-500">
                            Legajo:{' '}
                            {
                              supervision
                                .agenteSanitario
                                .legajo
                            }
                          </p>

                        )}

                      </td>

                      {/* ÁREA / SECTOR */}

                      <td className="px-6 py-4 text-slate-600">

                        <p>
                          {
                            supervision
                              .areaOperativa
                              .nombre
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          {supervision.sector
                            ? supervision.sector.nombre ??
                              `Sector ${
                                supervision
                                  .sector
                                  .numero ??
                                ''
                              }`
                            : 'Sin sector asignado'}
                        </p>

                      </td>

                      {/* SUPERVISOR */}

                      {esAdmin && (

                        <td className="px-6 py-4 text-slate-600">
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

                      {/* PROMEDIO */}

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {supervision.promedio ??
                          '-'}
                      </td>

                      {/* CLASIFICACIÓN */}

                      <td className="px-6 py-4">

                        <ClasificacionBadge
                          clasificacion={
                            supervision
                              .clasificacion
                          }
                        />

                      </td>

                      {/* GESTIÓN */}

                      <td className="px-6 py-4 text-slate-600">

                        {formatearDecision(
                          supervision
                            .decisionGestion,
                        )}

                      </td>

                      {/* DETALLE */}

                      <td className="px-6 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/supervisiones/${supervision.id}`,
                            )
                          }
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </button>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* PAGINACIÓN */}

      {!cargando &&
        totalPaginas > 1 && (

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

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
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>

            <span className="text-center text-sm text-slate-500">
              Página{' '}
              <span className="font-semibold text-slate-700">
                {pagina}
              </span>
              {' de '}
              <span className="font-semibold text-slate-700">
                {totalPaginas}
              </span>
            </span>

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
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>

          </div>

        )}

    </div>
  );
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
        -
      </span>
    );
  }

  const estilos:
    Record<string, string> = {
      CRITICO:
        'bg-red-100 text-red-700',

      REGULAR:
        'bg-amber-100 text-amber-700',

      BUENO:
        'bg-blue-100 text-blue-700',

      EXCELENTE:
        'bg-green-100 text-green-700',
    };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[
          clasificacion
        ] ??
        'bg-slate-100 text-slate-700'
      }`}
    >
      {clasificacion}
    </span>
  );
}