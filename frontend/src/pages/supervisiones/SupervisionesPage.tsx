import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  obtenerSupervisiones,
} from '../../services/supervisiones.service';

import type {
  SupervisionListado,
} from '../../types/supervision';

export default function SupervisionesPage() {
  const navigate = useNavigate();

  const [supervisiones, setSupervisiones] =
    useState<SupervisionListado[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError('');

        const datos =
          await obtenerSupervisiones();

        setSupervisiones(datos);
      } catch (error) {
        console.error(error);

        setError(
          'No se pudieron cargar las supervisiones.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Supervisiones
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Historial de supervisiones realizadas.
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/supervisiones/nueva')
          }
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Nueva supervisión
        </button>

      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {cargando ? (

          <div className="p-8 text-center text-slate-500">
            Cargando supervisiones...
          </div>

        ) : supervisiones.length === 0 ? (

          <div className="p-8 text-center text-slate-500">
            No hay supervisiones registradas.
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

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Supervisor
                  </th>

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
                      key={supervision.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 text-slate-600">
                        {formatearFecha(
                          supervision.fecha,
                        )}
                      </td>

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
                            .nombre ??
                            `Sector ${
                              supervision
                                .sector
                                .numero ?? ''
                            }`}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {
                          supervision.supervisor
                            .nombre
                        }{' '}
                        {
                          supervision.supervisor
                            .apellido
                        }
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {supervision.promedio ??
                          '-'}
                      </td>

                      <td className="px-6 py-4">
                        <ClasificacionBadge
                          clasificacion={
                            supervision.clasificacion
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatearDecision(
                          supervision
                            .decisionGestion,
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
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
  ).format(new Date(fecha));
}

function formatearDecision(
  decision: string,
): string {
  const etiquetas: Record<string, string> = {
    NO_REQUIERE: 'No requiere',
    SEGUIMIENTO: 'Seguimiento',
    CAPACITACION: 'Capacitación',
    SUPERVISION_INTENSIVA:
      'Supervisión intensiva',
  };

  return etiquetas[decision] ?? decision;
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[clasificacion] ??
        'bg-slate-100 text-slate-700'
      }`}
    >
      {clasificacion}
    </span>
  );
}