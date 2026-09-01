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

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  SupervisionListado,
} from '../../types/supervision';

export default function DetalleAgentePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agente, setAgente] =
    useState<AgenteSanitario | null>(null);

  const [supervisiones, setSupervisiones] =
    useState<SupervisionListado[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        setError('No se indicó un agente.');
        setCargando(false);
        return;
      }

      try {
        const agenteId = Number(id);

        const [
          agenteData,
          supervisionesData,
        ] = await Promise.all([
          obtenerAgente(agenteId),
          obtenerSupervisionesPorAgente(
            agenteId,
          ),
        ]);

        setAgente(agenteData);
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
  }, [id]);

  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando agente...
      </div>
    );
  }

  if (error || !agente) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

        <button
          onClick={() =>
            navigate('/agentes')
          }
          className="mt-4 text-sm font-medium text-blue-600"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {agente.apellido},{' '}
            {agente.nombre}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Historial del agente sanitario
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/agentes')
          }
          className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Volver
        </button>

      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Datos del agente
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <Dato
            label="Documento"
            valor={
              agente.documento ?? '-'
            }
          />

          <Dato
            label="Legajo"
            valor={agente.legajo ?? '-'}
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
            label="Estado"
            valor={
              agente.activo
                ? 'Activo'
                : 'Inactivo'
            }
          />

        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Supervisiones
          </h2>

          <p className="text-sm text-slate-500">
            {supervisiones.length}{' '}
            supervisión(es) registradas.
          </p>
        </div>

        {supervisiones.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            El agente todavía no tiene
            supervisiones.
          </div>
        ) : (
          <div className="grid gap-4">

            {supervisiones.map(
              (supervision) => (
                <button
                  key={supervision.id}
                  onClick={() =>
                    navigate(
                      `/supervisiones/${supervision.id}`,
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="font-semibold text-slate-800">
                        {formatearFecha(
                          supervision.fecha,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
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
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="text-sm text-slate-500">
                        Promedio
                      </span>

                      <span className="text-xl font-bold text-slate-800">
                        {Number(
                          supervision.promedio ??
                          0,
                        ).toFixed(2)}
                      </span>

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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
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