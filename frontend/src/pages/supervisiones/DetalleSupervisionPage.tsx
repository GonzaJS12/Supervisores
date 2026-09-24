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

  const [
    supervision,
    setSupervision,
  ] =
    useState<SupervisionDetalle | null>(
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

  useEffect(() => {
    const cargar =
      async () => {
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
      <EstadoCargando />
    );
  }

  if (
    error ||
    !supervision
  ) {
    return (
      <EstadoError
        mensaje={
          error ||
          'La supervisión no existe.'
        }
        onVolver={() =>
          navigate(
            '/supervisiones',
          )
        }
      />
    );
  }

  const promedio =
    supervision.promedio != null
      ? Number(
          supervision.promedio,
        )
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Registro de supervisión
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Detalle de supervisión
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Consulte la información
            territorial, evaluación,
            observaciones y resultado de
            la supervisión realizada.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/supervisiones',
            )
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:self-auto"
        >
          <IconoVolver />

          Volver al historial
        </button>
      </section>

      {/* RESUMEN PRINCIPAL */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
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

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Agente sanitario
                </p>

                <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">
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
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <IconoCalendario />

                    {formatearFecha(
                      supervision.fecha,
                    )}
                  </span>

                  <span>
                    {
                      supervision
                        .areaOperativa
                        .nombre
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:text-right">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Resultado
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {promedio !== null &&
                  !Number.isNaN(
                    promedio,
                  )
                    ? promedio.toFixed(
                        2,
                      )
                    : '—'}
                </p>
              </div>

              <ClasificacionBadge
                clasificacion={
                  supervision.clasificacion
                }
                grande
              />
            </div>
          </div>
        </div>
      </section>

      {/* IDENTIFICACIÓN */}
      <Seccion
        titulo="Identificación"
        descripcion="Datos generales asociados a la supervisión."
        icono={<IconoUsuario />}
      >
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              supervision
                .areaOperativa
                .nombre
            }
          />

          <Dato
            label="Sector"
            valor={
              obtenerSector(
                supervision,
              )
            }
          />

          <Dato
            label="Familia N°"
            valor={
              supervision.familiaNumero?.toString() ??
              'No especificado'
            }
          />

          <Dato
            label="Ronda"
            valor={
              supervision.ronda
                ?.nombre ??
              supervision.rondaNumero?.toString() ??
              'No especificada'
            }
          />

          {supervision
            .agenteSanitario
            .documento && (
            <Dato
              label="Documento"
              valor={
                supervision
                  .agenteSanitario
                  .documento
              }
            />
          )}

          {supervision
            .agenteSanitario
            .legajo && (
            <Dato
              label="Legajo"
              valor={
                supervision
                  .agenteSanitario
                  .legajo
              }
            />
          )}
        </div>
      </Seccion>

      {/* EVALUACIÓN */}
      <Seccion
        titulo="Evaluación"
        descripcion="Puntuaciones registradas para cada criterio de evaluación."
        icono={<IconoEvaluacion />}
      >
        <EscalaReferencia />

        {supervision
          .evaluaciones.length ===
        0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No hay evaluaciones
            registradas.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <div className="divide-y divide-slate-100">
              {supervision.evaluaciones.map(
                evaluacion => (
                  <div
                    key={
                      evaluacion.id
                    }
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-sm font-semibold leading-6 text-slate-800">
                          {
                            evaluacion.criterioNombre
                          }
                        </p>

                        {evaluacion.criterioDescripcion && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {
                              evaluacion.criterioDescripcion
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                        ].map(
                          valor => (
                            <span
                              key={
                                valor
                              }
                              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold ${
                                evaluacion.puntuacion ===
                                valor
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-4 ring-blue-50'
                                  : 'border-slate-200 bg-white text-slate-400'
                              }`}
                            >
                              {
                                valor
                              }
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </Seccion>

      {/* OBSERVACIONES */}
      <Seccion
        titulo="Observaciones del supervisor"
        descripcion="Aspectos cualitativos registrados durante la supervisión."
        icono={<IconoObservaciones />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Observacion
            titulo="Fortalezas observadas"
            valor={
              supervision.fortalezas
            }
            tipo="positivo"
          />

          <Observacion
            titulo="Oportunidades de mejora"
            valor={
              supervision
                .oportunidadesMejora
            }
            tipo="mejora"
          />

          <Observacion
            titulo="Situaciones críticas"
            valor={
              supervision
                .situacionesCriticas
            }
            tipo="critico"
          />

          <Observacion
            titulo="Recomendaciones"
            valor={
              supervision.recomendaciones
            }
            tipo="recomendacion"
          />
        </div>
      </Seccion>

      {/* RESULTADO */}
      <Seccion
        titulo="Resultado general"
        descripcion="Resultado calculado a partir de las puntuaciones registradas."
        icono={<IconoResultado />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {/* PROMEDIO */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Promedio
            </p>

            <div className="mt-3 flex items-end gap-2">
              <p className="text-4xl font-bold tracking-tight text-slate-900">
                {promedio !== null &&
                !Number.isNaN(
                  promedio,
                )
                  ? promedio.toFixed(
                      2,
                    )
                  : '—'}
              </p>

              <span className="mb-1 text-sm font-medium text-slate-400">
                / 5.00
              </span>
            </div>
          </div>

          {/* CLASIFICACIÓN */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Clasificación
            </p>

            <div className="mt-4">
              <ClasificacionBadge
                clasificacion={
                  supervision.clasificacion
                }
                grande
              />
            </div>
          </div>

          {/* DECISIÓN */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Decisión de gestión
            </p>

            <div className="mt-4">
              <DecisionBadge
                decision={
                  supervision.decisionGestion
                }
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {descripcionDecision(
                supervision.decisionGestion,
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Escala de clasificación
          </p>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Rango
              titulo="Crítico"
              rango="1.0 – 2.5"
              estilo="border-red-200 bg-red-50 text-red-700"
            />

            <Rango
              titulo="Regular"
              rango="2.6 – 3.5"
              estilo="border-amber-200 bg-amber-50 text-amber-700"
            />

            <Rango
              titulo="Bueno"
              rango="3.6 – 4.5"
              estilo="border-blue-200 bg-blue-50 text-blue-700"
            />

            <Rango
              titulo="Excelente"
              rango="4.6 – 5.0"
              estilo="border-emerald-200 bg-emerald-50 text-emerald-700"
            />
          </div>
        </div>
      </Seccion>

      {/* ACCIÓN FINAL */}
      <div className="flex justify-end pb-8">
        <button
          type="button"
          onClick={() =>
            navigate(
              '/supervisiones',
            )
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
        >
          <IconoVolver />

          Volver a supervisiones
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 * COMPONENTES
 * ======================================================= */

function Seccion({
  titulo,
  descripcion,
  icono,
  children,
}: {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icono}
          </div>

          <div>
            <h2 className="font-bold text-slate-900 sm:text-lg">
              {titulo}
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {descripcion}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold leading-5 text-slate-800">
        {valor}
      </p>
    </div>
  );
}

function Observacion({
  titulo,
  valor,
  tipo,
}: {
  titulo: string;
  valor?: string | null;
  tipo:
    | 'positivo'
    | 'mejora'
    | 'critico'
    | 'recomendacion';
}) {
  const estilos = {
    positivo: {
      contenedor:
        'border-emerald-100 bg-emerald-50/60',
      icono:
        'bg-emerald-100 text-emerald-700',
    },

    mejora: {
      contenedor:
        'border-amber-100 bg-amber-50/60',
      icono:
        'bg-amber-100 text-amber-700',
    },

    critico: {
      contenedor:
        'border-red-100 bg-red-50/60',
      icono:
        'bg-red-100 text-red-700',
    },

    recomendacion: {
      contenedor:
        'border-blue-100 bg-blue-50/60',
      icono:
        'bg-blue-100 text-blue-700',
    },
  };

  const estilo =
    estilos[tipo];

  return (
    <div
      className={`rounded-xl border p-5 ${estilo.contenedor}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${estilo.icono}`}
        >
          <IconoNota />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">
            {titulo}
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {valor?.trim()
              ? valor
              : 'Sin observaciones registradas.'}
          </p>
        </div>
      </div>
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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white ring-4 ring-white/10">
      {iniciales || 'A'}
    </div>
  );
}

function EscalaReferencia() {
  const valores = [
    {
      valor: 1,
      texto: 'Muy deficiente',
    },
    {
      valor: 2,
      texto: 'Deficiente',
    },
    {
      valor: 3,
      texto: 'Regular',
    },
    {
      valor: 4,
      texto: 'Bueno',
    },
    {
      valor: 5,
      texto: 'Excelente',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Escala utilizada
      </p>

      <div className="grid gap-2 sm:grid-cols-5">
        {valores.map(
          item => (
            <div
              key={
                item.valor
              }
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-700">
                {item.valor}
              </span>

              <span className="text-xs font-medium text-slate-600">
                {item.texto}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ClasificacionBadge({
  clasificacion,
  grande = false,
}: {
  clasificacion?:
    | string
    | null;
  grande?: boolean;
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
      CRITICO:
        'Crítico',

      REGULAR:
        'Regular',

      BUENO:
        'Bueno',

      EXCELENTE:
        'Excelente',
    };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border font-bold ${
        grande
          ? 'px-4 py-2 text-sm'
          : 'px-3 py-1 text-xs'
      } ${
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
        'border-slate-200 bg-white text-slate-700',

      SEGUIMIENTO:
        'border-blue-200 bg-blue-50 text-blue-700',

      CAPACITACION:
        'border-amber-200 bg-amber-50 text-amber-700',

      SUPERVISION_INTENSIVA:
        'border-red-200 bg-red-50 text-red-700',
    };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${
        estilos[decision] ??
        'border-slate-200 bg-white text-slate-700'
      }`}
    >
      {formatearDecision(
        decision,
      )}
    </span>
  );
}

function Rango({
  titulo,
  rango,
  estilo,
}: {
  titulo: string;
  rango: string;
  estilo: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${estilo}`}
    >
      <p className="text-xs font-bold">
        {titulo}
      </p>

      <p className="mt-0.5 text-[11px] opacity-80">
        {rango}
      </p>
    </div>
  );
}

function EstadoCargando() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="animate-pulse">
        <div className="h-3 w-36 rounded bg-slate-200" />

        <div className="mt-3 h-8 w-72 max-w-full rounded bg-slate-200" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />
      </div>

      <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

      {[1, 2, 3].map(
        item => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-6 w-48 rounded bg-slate-200" />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="h-12 rounded bg-slate-100" />
              <div className="h-12 rounded bg-slate-100" />
              <div className="h-12 rounded bg-slate-100" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function EstadoError({
  mensaje,
  onVolver,
}: {
  mensaje: string;
  onVolver: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <IconoAlerta />
        </div>

        <h1 className="mt-4 text-lg font-bold text-slate-900">
          No se pudo mostrar la
          supervisión
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {mensaje}
        </p>

        <button
          type="button"
          onClick={onVolver}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <IconoVolver />

          Volver a supervisiones
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 * HELPERS
 * ======================================================= */

function obtenerSector(
  supervision: SupervisionDetalle,
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
  const valores:
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
    valores[decision] ??
    decision
  );
}

function descripcionDecision(
  decision: string,
): string {
  const valores:
    Record<string, string> = {
      NO_REQUIERE:
        'No se indicó una intervención adicional.',

      SEGUIMIENTO:
        'Se indicó realizar seguimiento del agente.',

      CAPACITACION:
        'Se indicó una acción de capacitación.',

      SUPERVISION_INTENSIVA:
        'Se indicó una supervisión intensiva.',
    };

  return (
    valores[decision] ??
    ''
  );
}

/* =========================================================
 * ICONOS
 * ======================================================= */

interface IconoProps {
  className?: string;
}

function IconoVolver({
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

function IconoUsuario({
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
        cy="8"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6"
      />
    </svg>
  );
}

function IconoEvaluacion({
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

function IconoObservaciones({
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
        d="M4 5h16v11H8l-4 4V5Z"
      />

      <path
        strokeLinecap="round"
        d="M8 9h8M8 12h5"
      />
    </svg>
  );
}

function IconoResultado({
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
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
      />
    </svg>
  );
}

function IconoNota({
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
        d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"
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