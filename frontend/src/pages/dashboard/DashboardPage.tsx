import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  useNavigate,
} from 'react-router-dom';

import {
  obtenerMetricasGlobales,
  obtenerMisMetricas,
  obtenerSupervisionesParaExportacion,
} from '../../services/supervisiones.service';

import {
  exportarSupervisionesPdf,
} from '../../services/exportar-pdf.service';

import type {
  MetricasSupervision,
} from '../../services/supervisiones.service';

import {
  useAuth,
} from '../../context/useAuth';

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
            const datosMetricas =
              await obtenerMetricasGlobales();

            setMetricas(
              datosMetricas,
            );
          } else {
            const datosMetricas =
              await obtenerMisMetricas();

            setMetricas(
              datosMetricas,
            );
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

  const handleExportarMisSupervisiones =
    async () => {
      if (esAdmin) {
        return;
      }

      try {
        setExportandoPdf(true);
        setError('');

        const supervisiones =
          await obtenerSupervisionesParaExportacion();

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
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Panel de control
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {esAdmin
              ? 'Resumen general'
              : 'Mi actividad'}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {esAdmin
              ? 'Información general sobre agentes y supervisiones registradas en el sistema.'
              : 'Resumen de las supervisiones que ha realizado y sus resultados.'}
          </p>
        </div>

        {!esAdmin && (
          <button
            type="button"
            onClick={
              handleExportarMisSupervisiones
            }
            disabled={exportandoPdf}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <IconoDocumento />

            {exportandoPdf
              ? 'Generando PDF...'
              : 'Exportar reporte'}
          </button>
        )}
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

      {metricas && (
        <>
          {/* MÉTRICAS PRINCIPALES */}
          <section
            className={`grid gap-4 sm:grid-cols-2 ${
              esAdmin
                ? 'xl:grid-cols-5'
                : 'lg:grid-cols-3'
            }`}
          >
            {esAdmin && (
              <>
                <TarjetaResumen
                  titulo="Agentes"
                  valor={
                    metricas.totalAgentes ??
                    0
                  }
                  descripcion="Registrados"
                  icono={
                    <IconoPersonas />
                  }
                />

                <TarjetaResumen
                  titulo="Agentes activos"
                  valor={
                    metricas.totalAgentesActivos ??
                    0
                  }
                  descripcion="Actualmente activos"
                  icono={
                    <IconoActivo />
                  }
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
              icono={
                <IconoClipboard />
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
                  ? 'Supervisiones realizadas'
                  : 'Sus supervisiones'
              }
              icono={
                <IconoCalendario />
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
                  : 'Promedio de sus evaluaciones'
              }
              icono={
                <IconoPromedio />
              }
            />
          </section>

          {/* RESULTADOS */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-slate-900">
                Resultados de las supervisiones
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {esAdmin
                  ? 'Distribución global de las supervisiones según su clasificación.'
                  : 'Distribución de sus supervisiones según la clasificación obtenida.'}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TarjetaClasificacion
                  titulo="Crítico"
                  rango="1.0 – 2.5"
                  valor={
                    metricas
                      .clasificaciones
                      .CRITICO
                  }
                  tipo="critico"
                />

                <TarjetaClasificacion
                  titulo="Regular"
                  rango="2.6 – 3.5"
                  valor={
                    metricas
                      .clasificaciones
                      .REGULAR
                  }
                  tipo="regular"
                />

                <TarjetaClasificacion
                  titulo="Bueno"
                  rango="3.6 – 4.5"
                  valor={
                    metricas
                      .clasificaciones
                      .BUENO
                  }
                  tipo="bueno"
                />

                <TarjetaClasificacion
                  titulo="Excelente"
                  rango="4.6 – 5.0"
                  valor={
                    metricas
                      .clasificaciones
                      .EXCELENTE
                  }
                  tipo="excelente"
                />
              </div>

              <DistribucionClasificaciones
                critico={
                  metricas
                    .clasificaciones
                    .CRITICO
                }
                regular={
                  metricas
                    .clasificaciones
                    .REGULAR
                }
                bueno={
                  metricas
                    .clasificaciones
                    .BUENO
                }
                excelente={
                  metricas
                    .clasificaciones
                    .EXCELENTE
                }
              />
            </div>
          </section>

          {/* ACCESOS RÁPIDOS */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Accesos rápidos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Acceda a las funciones más
                utilizadas del sistema.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AccesoRapido
                titulo="Nueva supervisión"
                descripcion="Registrar una nueva evaluación de un agente sanitario."
                icono={
                  <IconoNuevaSupervision />
                }
                onClick={() =>
                  navigate(
                    '/supervisiones/nueva',
                  )
                }
              />

              <AccesoRapido
                titulo="Agentes sanitarios"
                descripcion="Consultar los agentes disponibles y su información territorial."
                icono={
                  <IconoPersonas />
                }
                onClick={() =>
                  navigate(
                    '/agentes',
                  )
                }
              />

              <AccesoRapido
                titulo={
                  esAdmin
                    ? 'Supervisiones'
                    : 'Mis supervisiones'
                }
                descripcion={
                  esAdmin
                    ? 'Consultar todas las supervisiones registradas en el sistema.'
                    : 'Consultar el historial de supervisiones que ha realizado.'
                }
                icono={
                  <IconoClipboard />
                }
                onClick={() =>
                  navigate(
                    '/supervisiones',
                  )
                }
              />
            </div>
          </section>

          {/* ÚLTIMAS SUPERVISIONES */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {esAdmin
                    ? 'Últimas supervisiones'
                    : 'Mis últimas supervisiones'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {esAdmin
                    ? 'Supervisiones registradas recientemente en el sistema.'
                    : 'Sus supervisiones realizadas más recientemente.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/supervisiones',
                  )
                }
                className="inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-600 transition hover:text-blue-800 sm:self-auto"
              >
                Ver todas

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 18 6-6-6-6"
                  />
                </svg>
              </button>
            </div>

            {metricas
              .ultimasSupervisiones
              .length === 0 ? (
              <EstadoVacio
                mensaje={
                  esAdmin
                    ? 'Todavía no hay supervisiones registradas.'
                    : 'Todavía no ha realizado supervisiones.'
                }
              />
            ) : (
              <div className="divide-y divide-slate-100">
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
                        className="group block w-full px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                                {obtenerIniciales(
                                  supervision
                                    .agenteSanitario
                                    .nombre,
                                  supervision
                                    .agenteSanitario
                                    .apellido,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900 transition group-hover:text-blue-700">
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

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {formatearFecha(
                                    supervision.fecha,
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 pl-0 text-xs text-slate-500 sm:pl-[52px]">
                              <span>
                                Área:{' '}
                                <strong className="font-medium text-slate-700">
                                  {
                                    supervision
                                      .areaOperativa
                                      .nombre
                                  }
                                </strong>
                              </span>

                              {esAdmin &&
                                supervision
                                  .supervisor && (
                                  <span>
                                    Supervisor:{' '}
                                    <strong className="font-medium text-slate-700">
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
                                    </strong>
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
                            <div className="text-left lg:text-right">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Promedio
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-slate-900">
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

                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="hidden h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500 sm:block"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m9 18 6-6-6-6"
                              />
                            </svg>
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
  icono,
}: {
  titulo: string;
  valor: string | number;
  descripcion: string;
  icono: ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {valor}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          {icono}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {descripcion}
      </p>
    </div>
  );
}

type TipoClasificacion =
  | 'critico'
  | 'regular'
  | 'bueno'
  | 'excelente';

function TarjetaClasificacion({
  titulo,
  rango,
  valor,
  tipo,
}: {
  titulo: string;
  rango: string;
  valor: number;
  tipo: TipoClasificacion;
}) {
  const estilos: Record<
    TipoClasificacion,
    {
      punto: string;
      valor: string;
    }
  > = {
    critico: {
      punto: 'bg-red-500',
      valor: 'text-red-700',
    },

    regular: {
      punto: 'bg-amber-500',
      valor: 'text-amber-700',
    },

    bueno: {
      punto: 'bg-blue-500',
      valor: 'text-blue-700',
    },

    excelente: {
      punto: 'bg-emerald-500',
      valor: 'text-emerald-700',
    },
  };

  const estilo = estilos[tipo];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${estilo.punto}`}
        />

        <p className="text-sm font-semibold text-slate-700">
          {titulo}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p
          className={`text-3xl font-bold ${estilo.valor}`}
        >
          {valor}
        </p>

        <p className="pb-1 text-xs text-slate-400">
          {rango}
        </p>
      </div>
    </div>
  );
}

function DistribucionClasificaciones({
  critico,
  regular,
  bueno,
  excelente,
}: {
  critico: number;
  regular: number;
  bueno: number;
  excelente: number;
}) {
  const total =
    critico +
    regular +
    bueno +
    excelente;

  const porcentaje = (
    valor: number,
  ) => {
    if (total === 0) {
      return 0;
    }

    return (valor / total) * 100;
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Distribución
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Proporción según clasificación
          </p>
        </div>

        <p className="text-xs font-medium text-slate-500">
          {total}{' '}
          {total === 1
            ? 'supervisión'
            : 'supervisiones'}
        </p>
      </div>

      {total === 0 ? (
        <div className="h-3 overflow-hidden rounded-full bg-slate-100" />
      ) : (
        <div
          className="flex h-3 overflow-hidden rounded-full bg-slate-100"
          aria-label="Distribución de clasificaciones"
        >
          {critico > 0 && (
            <div
              className="bg-red-500"
              style={{
                width: `${porcentaje(
                  critico,
                )}%`,
              }}
              title={`Crítico: ${critico}`}
            />
          )}

          {regular > 0 && (
            <div
              className="bg-amber-500"
              style={{
                width: `${porcentaje(
                  regular,
                )}%`,
              }}
              title={`Regular: ${regular}`}
            />
          )}

          {bueno > 0 && (
            <div
              className="bg-blue-500"
              style={{
                width: `${porcentaje(
                  bueno,
                )}%`,
              }}
              title={`Bueno: ${bueno}`}
            />
          )}

          {excelente > 0 && (
            <div
              className="bg-emerald-500"
              style={{
                width: `${porcentaje(
                  excelente,
                )}%`,
              }}
              title={`Excelente: ${excelente}`}
            />
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
        <Leyenda
          estilo="bg-red-500"
          texto="Crítico"
        />

        <Leyenda
          estilo="bg-amber-500"
          texto="Regular"
        />

        <Leyenda
          estilo="bg-blue-500"
          texto="Bueno"
        />

        <Leyenda
          estilo="bg-emerald-500"
          texto="Excelente"
        />
      </div>
    </div>
  );
}

function Leyenda({
  estilo,
  texto,
}: {
  estilo: string;
  texto: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${estilo}`}
      />

      {texto}
    </span>
  );
}

function AccesoRapido({
  titulo,
  descripcion,
  icono,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  icono: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-40 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
        {icono}
      </div>

      <p className="mt-4 font-bold text-slate-900">
        {titulo}
      </p>

      <p className="mt-1.5 flex-1 text-sm leading-5 text-slate-500">
        {descripcion}
      </p>

      <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
        Abrir

        <span className="transition-transform group-hover:translate-x-1">
          →
        </span>
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
      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
        Sin clasificación
      </span>
    );
  }

  const estilos: Record<
    string,
    string
  > = {
    CRITICO:
      'border-red-200 bg-red-50 text-red-700',

    REGULAR:
      'border-amber-200 bg-amber-50 text-amber-700',

    BUENO:
      'border-blue-200 bg-blue-50 text-blue-700',

    EXCELENTE:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  const nombres: Record<
    string,
    string
  > = {
    CRITICO: 'Crítico',
    REGULAR: 'Regular',
    BUENO: 'Bueno',
    EXCELENTE: 'Excelente',
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
        estilos[
          clasificacion
        ] ??
        'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      {nombres[clasificacion] ??
        clasificacion}
    </span>
  );
}

function EstadoVacio({
  mensaje,
}: {
  mensaje: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <IconoClipboard />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-600">
        {mensaje}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-56 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

function obtenerIniciales(
  nombre: string,
  apellido: string,
) {
  return `${nombre?.[0] ?? ''}${
    apellido?.[0] ?? ''
  }`.toUpperCase();
}

interface IconoProps {
  className?: string;
}

function IconoPersonas({
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
      <circle cx="9" cy="8" r="3" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19c.4-3.4 2.3-5.5 5.5-5.5s5.1 2.1 5.5 5.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7.5a2.5 2.5 0 0 1 0 5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 14c2.2.5 3.3 2.1 3.5 4.5"
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
        d="M9 5h6"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6v4H9z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 13 2 2 5-5"
      />
    </svg>
  );
}

function IconoCalendario({
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

function IconoPromedio({
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
        d="M5 19V9M12 19V5M19 19v-7"
      />
    </svg>
  );
}

function IconoNuevaSupervision({
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
        d="M12 8v8M8 12h8"
      />
    </svg>
  );
}

function IconoDocumento({
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
        d="M6 3h8l4 4v14H6z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 3v5h5M9 13h6M9 17h6"
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