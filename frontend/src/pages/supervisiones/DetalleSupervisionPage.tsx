import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  obtenerSupervisionPorId,
} from '../../services/supervisiones.service';

import type {
  SupervisionDetalle,
} from '../../types/supervision';

export default function DetalleSupervisionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [supervision, setSupervision] =
    useState<SupervisionDetalle | null>(
      null,
    );

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        setError(
          'No se indicó una supervisión.',
        );
        setCargando(false);
        return;
      }

      try {
        const datos =
          await obtenerSupervisionPorId(
            Number(id),
          );

        setSupervision(datos);
      } catch (error) {
        console.error(error);

        setError(
          'No se pudo cargar la supervisión.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando supervisión...
      </div>
    );
  }

  if (error || !supervision) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ||
            'La supervisión no existe.'}
        </div>

        <button
          onClick={() =>
            navigate('/supervisiones')
          }
          className="mt-4 text-sm font-medium text-blue-600"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* ENCABEZADO */}

      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Detalle de supervisión
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Supervisión #{supervision.id}
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/supervisiones')
          }
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Volver
        </button>

      </div>

      {/* DATOS GENERALES */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Identificación
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <Dato
            label="Agente sanitario"
            valor={`${supervision.agenteSanitario.apellido}, ${supervision.agenteSanitario.nombre}`}
          />

          <Dato
            label="Supervisor"
            valor={`${supervision.supervisor.nombre} ${supervision.supervisor.apellido}`}
          />

          <Dato
            label="Fecha"
            valor={formatearFecha(
              supervision.fecha,
            )}
          />

          <Dato
            label="Área operativa"
            valor={
              supervision.areaOperativa
                .nombre
            }
          />

          <Dato
            label="Sector"
            valor={
              supervision.sector.nombre ??
              `Sector ${
                supervision.sector.numero ??
                ''
              }`
            }
          />

          <Dato
            label="Familia N°"
            valor={
              supervision.familiaNumero?.toString() ??
              '-'
            }
          />

          <Dato
            label="Ronda N°"
            valor={
              supervision.rondaNumero?.toString() ??
              '-'
            }
          />

        </div>
      </section>

      {/* EVALUACIONES */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Evaluación
        </h2>

        <div className="divide-y divide-slate-100">

          {supervision.evaluaciones.map(
            (evaluacion) => (
              <div
                key={evaluacion.id}
                className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
              >

                <div>
                  <p className="font-medium text-slate-800">
                    {
                      evaluacion.criterioNombre
                    }
                  </p>

                  {evaluacion
                    .criterioDescripcion && (
                    <p className="mt-1 text-sm text-slate-500">
                      {
                        evaluacion
                          .criterioDescripcion
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">

                  {[1, 2, 3, 4, 5].map(
                    (valor) => (
                      <span
                        key={valor}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold ${
                          evaluacion.puntuacion ===
                          valor
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        {valor}
                      </span>
                    ),
                  )}

                </div>

              </div>
            ),
          )}

        </div>
      </section>

      {/* OBSERVACIONES */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Observaciones del supervisor
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <Observacion
            label="Fortalezas observadas"
            valor={supervision.fortalezas}
          />

          <Observacion
            label="Oportunidades de mejora"
            valor={
              supervision
                .oportunidadesMejora
            }
          />

          <Observacion
            label="Situaciones críticas"
            valor={
              supervision
                .situacionesCriticas
            }
          />

          <Observacion
            label="Recomendaciones"
            valor={
              supervision.recomendaciones
            }
          />

        </div>
      </section>

      {/* RESULTADO */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Resultado general
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <div>
            <p className="text-sm text-slate-500">
              Promedio
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {Number(
                supervision.promedio ?? 0,
              ).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Clasificación
            </p>

            <div className="mt-2">
              <ClasificacionBadge
                clasificacion={
                  supervision.clasificacion
                }
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Decisión de gestión
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {formatearDecision(
                supervision
                  .decisionGestion,
              )}
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

function Dato({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-800">
        {valor}
      </p>
    </div>
  );
}

function Observacion({
  label,
  valor,
}: {
  label: string;
  valor?: string | null;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">

      <p className="text-sm font-semibold text-slate-700">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
        {valor || 'Sin observaciones.'}
      </p>

    </div>
  );
}

function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion?: string | null;
}) {
  if (!clasificacion) {
    return <span>-</span>;
  }

  const estilos: Record<string, string> = {
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
      className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
        estilos[clasificacion] ??
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
  ).format(new Date(fecha));
}

function formatearDecision(
  decision: string,
) {
  const valores: Record<string, string> = {
    NO_REQUIERE:
      'No requiere intervención',
    SEGUIMIENTO:
      'Seguimiento',
    CAPACITACION:
      'Capacitación',
    SUPERVISION_INTENSIVA:
      'Supervisión intensiva',
  };

  return valores[decision] ?? decision;
}