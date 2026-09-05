import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  obtenerAgentes,
} from '../../services/agentes.service';

import {
  obtenerMetricasGlobales,
  obtenerMisMetricas,
  obtenerMisSupervisiones,
} from '../../services/supervisiones.service';

import {
  exportarSupervisionesPdf,
} from '../../services/exportar-pdf.service';

import type {
  MetricasSupervision,
} from '../../services/supervisiones.service';

import type {
  AgenteSanitario,
} from '../../types/agente';

import {
  useAuth,
} from '../../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();

  const {
    usuario,
  } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  const [
    metricas,
    setMetricas,
  ] =
    useState<MetricasSupervision | null>(
      null,
    );

  const [
    agentes,
    setAgentes,
  ] = useState<
    AgenteSanitario[]
  >([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    exportandoPdf,
    setExportandoPdf,
  ] = useState(false);

  useEffect(() => {
    const cargarDatos =
      async () => {
        try {
          setCargando(true);
          setError('');

          if (esAdmin) {
            const [
              datosMetricas,
              datosAgentes,
            ] = await Promise.all([
              obtenerMetricasGlobales(),
              obtenerAgentes(),
            ]);

            setMetricas(
              datosMetricas,
            );

            setAgentes(
              datosAgentes,
            );
          } else {
            const datosMetricas =
              await obtenerMisMetricas();

            setMetricas(
              datosMetricas,
            );

            setAgentes([]);
          }
        } catch (error) {
          console.error(error);

          setError(
            'No se pudieron cargar los datos del dashboard.',
          );
        } finally {
          setCargando(false);
        }
      };

    cargarDatos();
  }, [esAdmin]);

  const agentesActivos =
    agentes.filter(
      agente => agente.activo,
    ).length;
  
  const handleExportarMisSupervisiones =
    async () => {
      if (esAdmin) {
        return;
      }

      try {
        setExportandoPdf(true);
        setError('');

        const supervisiones =
          await obtenerMisSupervisiones();

        if (
          supervisiones.length === 0
        ) {
          setError(
            'No tiene supervisiones para exportar.',
          );

          return;
        }

        const nombreSupervisor =
          usuario
            ? `${usuario.nombre} ${usuario.apellido}`
            : undefined;

        exportarSupervisionesPdf({
          supervisiones,
          titulo:
            'Reporte de mis supervisiones',
          nombreArchivo:
            'mis-supervisiones',
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

  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ENCABEZADO */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Inicio
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {esAdmin
            ? 'Resumen general del sistema de supervisión.'
            : 'Resumen de sus supervisiones realizadas.'}
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {metricas && (
        <>
          {/* TARJETAS */}

          <section
            className={`grid gap-4 sm:grid-cols-2 ${
              esAdmin
                ? 'xl:grid-cols-5'
                : 'xl:grid-cols-3'
            }`}
          >
            {esAdmin && (
              <>
                <TarjetaResumen
                  titulo="Agentes"
                  valor={
                    agentes.length
                  }
                  descripcion="Registrados"
                />

                <TarjetaResumen
                  titulo="Agentes activos"
                  valor={
                    agentesActivos
                  }
                  descripcion="Actualmente activos"
                />
              </>
            )}

            <TarjetaResumen
              titulo={
                esAdmin
                  ? 'Supervisiones'
                  : 'Mis supervisiones'
              }
              valor={
                metricas
                  .totalSupervisiones
              }
              descripcion={
                esAdmin
                  ? 'Realizadas en total'
                  : 'Realizadas por usted'
              }
            />

            <TarjetaResumen
              titulo="Este mes"
              valor={
                metricas
                  .supervisionesMes
              }
              descripcion={
                esAdmin
                  ? 'Supervisiones del mes'
                  : 'Sus supervisiones del mes'
              }
            />

            <TarjetaResumen
              titulo="Promedio general"
              valor={
                metricas
                  .promedioGeneral !==
                null
                  ? Number(
                      metricas
                        .promedioGeneral,
                    ).toFixed(2)
                  : '-'
              }
              descripcion={
                esAdmin
                  ? 'Promedio global'
                  : 'Promedio de sus supervisiones'
              }
            />
          </section>

          {/* CLASIFICACIONES */}

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Resultados de las
                supervisiones
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {esAdmin
                  ? 'Distribución global según la clasificación obtenida.'
                  : 'Distribución de sus supervisiones según la clasificación obtenida.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <TarjetaClasificacion
                titulo="Crítico"
                valor={
                  metricas
                    .clasificaciones
                    .CRITICO
                }
                estilo="bg-red-50 text-red-700 border-red-200"
              />

              <TarjetaClasificacion
                titulo="Regular"
                valor={
                  metricas
                    .clasificaciones
                    .REGULAR
                }
                estilo="bg-amber-50 text-amber-700 border-amber-200"
              />

              <TarjetaClasificacion
                titulo="Bueno"
                valor={
                  metricas
                    .clasificaciones
                    .BUENO
                }
                estilo="bg-blue-50 text-blue-700 border-blue-200"
              />

              <TarjetaClasificacion
                titulo="Excelente"
                valor={
                  metricas
                    .clasificaciones
                    .EXCELENTE
                }
                estilo="bg-green-50 text-green-700 border-green-200"
              />
            </div>
          </section>

          {/* ACCESOS RÁPIDOS */}

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Accesos rápidos
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <AccesoRapido
                titulo="Nueva supervisión"
                descripcion="Registrar una nueva evaluación."
                onClick={() =>
                  navigate(
                    '/supervisiones/nueva',
                  )
                }
              />

              <AccesoRapido
                titulo="Agentes sanitarios"
                descripcion="Consultar agentes registrados."
                onClick={() =>
                  navigate(
                    '/agentes',
                  )
                }
              />
              {esAdmin ? (

                <AccesoRapido
                  titulo="Todas las supervisiones"
                  descripcion="Consultar todas las supervisiones registradas."
                  onClick={() =>
                    navigate(
                      '/supervisiones',
                    )
                  }
                />

              ) : (

                <AccesoRapido
                  titulo="Mis supervisiones"
                  descripcion="Consultar todas sus supervisiones realizadas."
                  onClick={() =>
                    navigate(
                      '/supervisiones',
                    )
                  }
                />

              )}

              {!esAdmin && (
                <AccesoRapido
                  titulo={
                    exportandoPdf
                      ? 'Generando PDF...'
                      : 'Exportar mis supervisiones'
                    }
                    descripcion="Descargar un reporte PDF con todas sus supervisiones realizadas."
                    onClick={
                      handleExportarMisSupervisiones
                    }
                  />
                )}

            </div>
          </section>

          {/* ÚLTIMAS SUPERVISIONES */}

          <section>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {esAdmin
                    ? 'Últimas supervisiones'
                    : 'Mis últimas supervisiones'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {esAdmin
                    ? 'Supervisiones más recientes registradas en el sistema.'
                    : 'Sus supervisiones realizadas más recientemente.'}
                </p>
              </div>

              {esAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/supervisiones',
                    )
                  }
                  className="self-start text-sm font-semibold text-blue-600 hover:text-blue-800 sm:self-auto"
                >
                  Ver todas
                </button>
              )}

            </div>

            {metricas
              .ultimasSupervisiones
              .length === 0 ? (

              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                {esAdmin
                  ? 'Todavía no hay supervisiones registradas.'
                  : 'Todavía no ha realizado supervisiones.'}
              </div>

            ) : (

              <div className="grid gap-4">

                {metricas
                  .ultimasSupervisiones
                  .map(
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
                      className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

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

                          <p className="mt-1 text-sm text-slate-500">
                            {formatearFecha(
                              supervision.fecha,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              supervision
                                .areaOperativa
                                .nombre
                            }
                          </p>

                          {esAdmin &&
                            supervision
                              .supervisor && (
                              <p className="mt-1 text-xs text-slate-400">
                                Supervisor:{' '}
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
                              </p>
                            )}

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                          <div>
                            <p className="text-xs text-slate-400">
                              Promedio
                            </p>

                            <p className="text-xl font-bold text-slate-800">
                              {Number(
                                supervision
                                  .promedio ??
                                  0,
                              ).toFixed(
                                2,
                              )}
                            </p>
                          </div>

                          <ClasificacionBadge
                            clasificacion={
                              supervision
                                .clasificacion
                            }
                          />

                        </div>

                      </div>

                    </button>

                  ),
                )}

              </div>
            )}

          </section>
        </>
      )}

    </div>
  );
}

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
}: {
  titulo: string;
  valor: string | number;
  descripcion: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-800">
        {valor}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {descripcion}
      </p>

    </div>
  );
}

function TarjetaClasificacion({
  titulo,
  valor,
  estilo,
}: {
  titulo: string;
  valor: number;
  estilo: string;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${estilo}`}
    >
      <p className="text-sm font-medium">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {valor}
      </p>

      <p className="mt-1 text-xs opacity-70">
        supervisión(es)
      </p>
    </div>
  );
}

function AccesoRapido({
  titulo,
  descripcion,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
    >
      <p className="font-semibold text-slate-800">
        {titulo}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {descripcion}
      </p>

      <p className="mt-4 text-sm font-semibold text-blue-600">
        Abrir →
      </p>
    </button>
  );
}

function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion?: string | null;
}) {
  if (!clasificacion) {
    return (
      <span className="text-sm text-slate-400">
        Sin clasificación
      </span>
    );
  }

  const estilos: Record<
    string,
    string
  > = {
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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

function formatearFecha(
  fecha: string,
) {
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