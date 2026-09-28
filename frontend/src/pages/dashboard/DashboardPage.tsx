import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileDown,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';

import {
  obtenerMetricasGlobales,
  obtenerMisMetricas,
  obtenerSupervisionesParaExportacion,
  type MetricasSupervision,
} from '../../services/supervisiones.service';
import { exportarSupervisionesPdf } from '../../services/exportar-pdf.service';
import { useAuth } from '../../context/AuthContext';
import { obtenerMensajeError } from '../../utils/http-error';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
} from '../../components/ui/FeedbackBlock';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { ClasificacionBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import type { LucideIcon } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const [metricas, setMetricas] = useState<MetricasSupervision | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exportandoPdf, setExportandoPdf] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError('');
        const datosMetricas = esAdmin
          ? await obtenerMetricasGlobales()
          : await obtenerMisMetricas();
        setMetricas(datosMetricas);
      } catch (err) {
        console.error(err);
        setError(
          obtenerMensajeError(
            err,
            'No se pudieron cargar los datos del dashboard.',
          ),
        );
      } finally {
        setCargando(false);
      }
    };

    void cargarDatos();
  }, [esAdmin]);

  const handleExportarMisSupervisiones = async () => {
    if (esAdmin) return;

    try {
      setExportandoPdf(true);
      setError('');
      const supervisiones = await obtenerSupervisionesParaExportacion();

      if (supervisiones.length === 0) {
        setError('No tiene supervisiones para exportar.');
        return;
      }

      const nombreSupervisor = usuario
        ? `${usuario.nombre} ${usuario.apellido}`
        : undefined;

      exportarSupervisionesPdf({
        supervisiones,
        titulo: 'Reporte de mis supervisiones',
        nombreArchivo: 'mis-supervisiones',
        supervisor: nombreSupervisor,
      });
    } catch (err) {
      console.error(err);
      setError(
        obtenerMensajeError(
          err,
          'No se pudo generar el PDF de supervisiones.',
        ),
      );
    } finally {
      setExportandoPdf(false);
    }
  };

  if (cargando) {
    return (
      <LoadingState
        title="Cargando inicio…"
        message="Obteniendo el resumen de supervisiones."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inicio"
        description={
          esAdmin
            ? 'Resumen general del sistema de supervisión.'
            : 'Resumen de sus supervisiones realizadas.'
        }
      />

      {error ? (
        <ErrorBanner title="No se pudo cargar el inicio" message={error} />
      ) : null}

      {metricas && (
        <>
          <section
            className={`grid gap-4 sm:grid-cols-2 ${
              esAdmin ? 'xl:grid-cols-5' : 'xl:grid-cols-3'
            }`}
          >
            {esAdmin && (
              <>
                <MetricCard
                  titulo="Agentes"
                  valor={metricas.totalAgentes ?? 0}
                  descripcion="Registrados"
                  icon={Users}
                  tone="blue"
                />
                <MetricCard
                  titulo="Agentes activos"
                  valor={metricas.totalAgentesActivos ?? 0}
                  descripcion="Actualmente activos"
                  icon={UserCheck}
                  tone="green"
                />
              </>
            )}

            <MetricCard
              titulo={esAdmin ? 'Supervisiones' : 'Mis supervisiones'}
              valor={metricas.totalSupervisiones}
              descripcion={
                esAdmin ? 'Realizadas en total' : 'Realizadas por usted'
              }
              icon={ClipboardList}
              tone="blue"
            />
            <MetricCard
              titulo="Este mes"
              valor={metricas.supervisionesMes}
              descripcion={
                esAdmin
                  ? 'Supervisiones del mes'
                  : 'Sus supervisiones del mes'
              }
              icon={CalendarDays}
              tone="amber"
            />
            <MetricCard
              titulo="Promedio general"
              valor={
                metricas.promedioGeneral !== null
                  ? Number(metricas.promedioGeneral).toFixed(2)
                  : '-'
              }
              descripcion={
                esAdmin
                  ? 'Promedio global'
                  : 'Promedio de sus supervisiones'
              }
              icon={Star}
              tone="purple"
            />
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Resultados de las supervisiones
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {esAdmin
                  ? 'Distribución global según la clasificación obtenida.'
                  : 'Distribución de sus supervisiones según la clasificación obtenida.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ClasificacionCard
                titulo="Crítico"
                valor={metricas.clasificaciones.CRITICO}
                tone="red"
              />
              <ClasificacionCard
                titulo="Regular"
                valor={metricas.clasificaciones.REGULAR}
                tone="amber"
              />
              <ClasificacionCard
                titulo="Bueno"
                valor={metricas.clasificaciones.BUENO}
                tone="blue"
              />
              <ClasificacionCard
                titulo="Excelente"
                valor={metricas.clasificaciones.EXCELENTE}
                tone="green"
              />
            </div>
          </section>

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
                onClick={() => navigate('/supervisiones/nueva')}
              />
              <AccesoRapido
                titulo="Agentes sanitarios"
                descripcion="Consultar agentes registrados."
                onClick={() => navigate('/agentes')}
              />
              <AccesoRapido
                titulo={
                  esAdmin ? 'Todas las supervisiones' : 'Mis supervisiones'
                }
                descripcion={
                  esAdmin
                    ? 'Consultar todas las supervisiones registradas.'
                    : 'Consultar todas sus supervisiones realizadas.'
                }
                onClick={() => navigate('/supervisiones')}
              />
              {!esAdmin && (
                <AccesoRapido
                  titulo={
                    exportandoPdf
                      ? 'Generando PDF…'
                      : 'Exportar mis supervisiones'
                  }
                  descripcion="Descargar un reporte PDF con todas sus supervisiones realizadas."
                  onClick={() => {
                    void handleExportarMisSupervisiones();
                  }}
                  icon={FileDown}
                />
              )}
            </div>
          </section>

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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/supervisiones')}
                >
                  Ver todas
                </Button>
              )}
            </div>

            {metricas.ultimasSupervisiones.length === 0 ? (
              <EmptyState
                title="Sin supervisiones recientes"
                message={
                  esAdmin
                    ? 'Todavía no hay supervisiones registradas.'
                    : 'Todavía no ha realizado supervisiones.'
                }
              />
            ) : (
              <div className="grid gap-3">
                {metricas.ultimasSupervisiones.map((supervision) => (
                  <button
                    type="button"
                    key={supervision.id}
                    onClick={() =>
                      navigate(`/supervisiones/${supervision.id}`)
                    }
                    className="rounded-xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition duration-150 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {supervision.agenteSanitario.apellido},{' '}
                          {supervision.agenteSanitario.nombre}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatearFecha(supervision.fecha)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {supervision.areaOperativa.nombre}
                        </p>
                        {esAdmin && supervision.supervisor ? (
                          <p className="mt-1 text-xs text-slate-400">
                            Supervisor: {supervision.supervisor.nombre}{' '}
                            {supervision.supervisor.apellido}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Promedio</p>
                          <p className="text-xl font-bold text-slate-800">
                            {Number(supervision.promedio ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <ClasificacionBadge
                          clasificacion={supervision.clasificacion}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const toneStyles = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
} as const;

function MetricCard({
  titulo,
  valor,
  descripcion,
  icon: Icon,
  tone,
}: {
  titulo: string;
  valor: string | number;
  descripcion: string;
  icon: LucideIcon;
  tone: keyof typeof toneStyles;
}) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            {valor}
          </p>
          <p className="mt-1 text-xs text-slate-400">{descripcion}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </Card>
  );
}

function ClasificacionCard({
  titulo,
  valor,
  tone,
}: {
  titulo: string;
  valor: number;
  tone: 'red' | 'amber' | 'blue' | 'green';
}) {
  const styles = {
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${styles[tone]}`}>
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 opacity-70" aria-hidden />
        <p className="text-sm font-medium">{titulo}</p>
      </div>
      <p className="mt-2 text-3xl font-bold">{valor}</p>
      <p className="mt-1 text-xs opacity-70">supervisión(es)</p>
    </div>
  );
}

function AccesoRapido({
  titulo,
  descripcion,
  onClick,
  icon: Icon = ArrowRight,
}: {
  titulo: string;
  descripcion: string;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition duration-150 hover:border-blue-300 hover:shadow-md"
    >
      <p className="font-semibold text-slate-800">{titulo}</p>
      <p className="mt-2 text-sm text-slate-500">{descripcion}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
        Abrir
        <Icon className="h-4 w-4" aria-hidden />
      </p>
    </button>
  );
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(fecha));
}
