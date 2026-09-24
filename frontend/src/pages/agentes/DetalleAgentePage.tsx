import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  obtenerAgente,
} from '../../services/agentes.service';

import {
  obtenerSupervisionesPorAgente,
} from '../../services/supervisiones.service';

import {
  useAuth,
} from '../../context/useAuth';

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  SupervisionListado,
} from '../../types/supervision';

export default function DetalleAgentePage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { usuario } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  const [
    agente,
    setAgente,
  ] = useState<AgenteSanitario | null>(
    null,
  );

  const [
    supervisiones,
    setSupervisiones,
  ] = useState<SupervisionListado[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        setError(
          'No se indicó un agente.',
        );

        setCargando(false);

        return;
      }

      try {
        setCargando(true);
        setError('');

        const agenteId =
          Number(id);

        const agenteData =
          await obtenerAgente(
            agenteId,
          );

        setAgente(
          agenteData,
        );

        const supervisionesData =
          await obtenerSupervisionesPorAgente(
            agenteId,
          );

        setSupervisiones(
          supervisionesData,
        );
      } catch (error) {
        console.error(error);

        setError(
          'No se pudo cargar la información del agente.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id, esAdmin]);

  if (cargando) {
    return <DetalleAgenteSkeleton />;
  }

  if (error || !agente) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() =>
            navigate('/agentes')
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <IconoVolver />
          Volver a agentes
        </button>

        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          <div className="mt-0.5 shrink-0">
            <IconoAlerta />
          </div>

          <div>
            <p className="font-semibold">
              No se pudo mostrar el agente
            </p>

            <p className="mt-1 text-red-600">
              {error ||
                'No se encontró el agente.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NAVEGACIÓN */}
      <button
        type="button"
        onClick={() =>
          navigate('/agentes')
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <IconoVolver />

        Volver a agentes
      </button>

      {/* ENCABEZADO DEL AGENTE */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <AvatarAgente
                nombre={
                  agente.nombre
                }
                apellido={
                  agente.apellido
                }
              />

              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Agente sanitario
                </p>

                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {agente.apellido},{' '}
                  {agente.nombre}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Información territorial e historial de supervisiones
                </p>
              </div>
            </div>

            <EstadoAgente
              activo={
                agente.activo
              }
            />
          </div>
        </div>

        {/* RESUMEN TERRITORIAL */}
        <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <ResumenDato
            icono={
              <IconoDocumento />
            }
            label="Documento"
            valor={
              agente.documento ??
              'No informado'
            }
          />

          <ResumenDato
            icono={
              <IconoLegajo />
            }
            label="Legajo"
            valor={
              agente.legajo ??
              'No informado'
            }
          />

          <ResumenDato
            icono={
              <IconoUbicacion />
            }
            label="Área operativa"
            valor={
              agente.areaOperativa
                ?.nombre ??
              `Área ${agente.areaOperativaId}`
            }
          />

          <ResumenDato
            icono={
              <IconoSector />
            }
            label="Sector"
            valor={
              agente.sector
                ? agente.sector.nombre ??
                  `Sector ${agente.sector.numero}`
                : 'Sin sector asignado'
            }
          />
        </div>
      </section>

      {/* INFORMACIÓN */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconoInformacion />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Información del agente
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Datos obtenidos del sistema territorial.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <Dato
            label="Nombre"
            valor={
              agente.nombre
            }
          />

          <Dato
            label="Apellido"
            valor={
              agente.apellido
            }
          />

          <Dato
            label="Documento"
            valor={
              agente.documento ??
              'No informado'
            }
          />

          <Dato
            label="Legajo"
            valor={
              agente.legajo ??
              'No informado'
            }
          />

          <Dato
            label="Área operativa"
            valor={
              agente.areaOperativa
                ?.nombre ??
              `Área ${agente.areaOperativaId}`
            }
          />

          <Dato
            label="Sector"
            valor={
              agente.sector
                ? agente.sector.nombre ??
                  `Sector ${agente.sector.numero}`
                : 'Sin sector asignado'
            }
          />

          <Dato
            label="Cobertura"
            valor={
              agente.cobertura ??
              'No informada'
            }
          />

          <Dato
            label="Estado"
            valor={
              agente.activo
                ? 'Activo'
                : 'Inactivo'
            }
          />
        </div>
      </section>

      {/* HISTORIAL */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {esAdmin
                ? 'Historial de supervisiones'
                : 'Mis supervisiones a este agente'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {esAdmin
                ? 'Supervisiones registradas para este agente sanitario.'
                : 'Supervisiones que usted ha realizado a este agente.'}
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:self-auto">
            <IconoClipboard />

            <span className="text-sm font-bold text-slate-700">
              {supervisiones.length}
            </span>

            <span className="text-xs text-slate-500">
              {supervisiones.length === 1
                ? 'supervisión'
                : 'supervisiones'}
            </span>
          </div>
        </div>

        {supervisiones.length === 0 ? (
          <EstadoVacio
            esAdmin={
              esAdmin
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
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
                  className="group block w-full px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* IZQUIERDA */}
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                        <IconoCalendario />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 transition group-hover:text-blue-700">
                          Supervisión del{' '}
                          {formatearFecha(
                            supervision.fecha,
                          )}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Supervisor:{' '}
                          <span className="font-medium text-slate-700">
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
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* DERECHA */}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:border-0 lg:pt-0">
                      <div className="min-w-20">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Promedio
                        </p>

                        <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
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

                      <div className="hidden text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500 sm:block">
                        <IconoChevron />
                      </div>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>
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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-base font-bold text-white shadow-sm ring-4 ring-blue-50 sm:h-16 sm:w-16 sm:text-lg">
      {iniciales || 'A'}
    </div>
  );
}

function EstadoAgente({
  activo,
}: {
  activo: boolean;
}) {
  return activo ? (
    <span className="inline-flex self-start items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Agente activo
    </span>
  ) : (
    <span className="inline-flex self-start items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      Agente inactivo
    </span>
  );
}

function ResumenDato({
  icono,
  label,
  valor,
}: {
  icono: React.ReactNode;
  label: string;
  valor: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icono}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {valor}
        </p>
      </div>
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
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
        {valor}
      </p>
    </div>
  );
}

function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion?:
    string | null;
}) {
  if (!clasificacion) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
        Sin clasificación
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

  const nombres:
    Record<string, string> = {
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
      {nombres[
        clasificacion
      ] ?? clasificacion}
    </span>
  );
}

function EstadoVacio({
  esAdmin,
}: {
  esAdmin: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <IconoClipboard />
      </div>

      <p className="mt-4 font-semibold text-slate-700">
        Sin supervisiones
      </p>

      <p className="mt-1 max-w-md text-sm leading-5 text-slate-500">
        {esAdmin
          ? 'Este agente todavía no tiene supervisiones registradas.'
          : 'Usted todavía no ha realizado supervisiones a este agente.'}
      </p>
    </div>
  );
}

function DetalleAgenteSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-32 rounded bg-slate-200" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-4 p-6">
          <div className="h-16 w-16 rounded-2xl bg-slate-200" />

          <div className="flex-1">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-64 max-w-full rounded bg-slate-200" />
            <div className="mt-2 h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>
        </div>

        <div className="grid border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-20 border-slate-100 p-5 sm:border-r"
            >
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-60 rounded-2xl border border-slate-200 bg-white" />

      <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

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
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
      />

      <circle
        cx="9"
        cy="11"
        r="2"
      />

      <path
        strokeLinecap="round"
        d="M7 16c.5-1.5 1.2-2 2-2s1.5.5 2 2M14 10h3M14 14h3"
      />
    </svg>
  );
}

function IconoLegajo({
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
        d="M14 3v5h5M9 13h6M9 17h4"
      />
    </svg>
  );
}

function IconoUbicacion({
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
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function IconoSector({
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
        d="m12 3 8 4-8 4-8-4 8-4Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 12 8 4 8-4M4 17l8 4 8-4"
      />
    </svg>
  );
}

function IconoInformacion({
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
        d="M12 11v6M12 7h.01"
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

function IconoChevron({
  className = 'h-5 w-5',
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