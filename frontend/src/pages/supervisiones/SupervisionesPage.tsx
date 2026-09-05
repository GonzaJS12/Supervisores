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
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  /*
   * EXPORTACIÓN PDF
   *
   * La misma información que el usuario
   * puede visualizar en pantalla es la
   * información que se exportará.
   *
   * ADMIN:
   * todas las supervisiones.
   *
   * SUPERVISOR:
   * solamente sus supervisiones.
   */
  const handleExportarPdf = () => {
    if (supervisiones.length === 0) {
      setError(
        'No hay supervisiones para exportar.',
      );

      return;
    }

    setError('');

    const nombreSupervisor =
      !esAdmin && usuario
        ? `${usuario.nombre} ${usuario.apellido}`
        : undefined;

    exportarSupervisionesPdf({
      supervisiones,

      titulo: esAdmin
        ? 'Reporte global de supervisiones'
        : 'Reporte de mis supervisiones',

      nombreArchivo: esAdmin
        ? 'supervisiones-global'
        : 'mis-supervisiones',

      supervisor:
        nombreSupervisor,
    });
  };

  /*
   * CARGA DEL LISTADO SEGÚN ROL
   *
   * No usamos el mismo endpoint para
   * ambos usuarios.
   *
   * Esto mantiene la seguridad que ya
   * implementamos en el backend.
   */
  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError('');

        const datos =
          esAdmin
            ? await obtenerSupervisiones()
            : await obtenerMisSupervisiones();

        setSupervisiones(
          datos,
        );
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
  }, [esAdmin]);

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
              supervisiones.length === 0
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {esAdmin
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

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
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
            {esAdmin
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
                          {
                            supervision
                              .sector
                              .nombre ??
                            `Sector ${
                              supervision
                                .sector
                                .numero ?? ''
                            }`
                          }
                        </p>

                      </td>

                      {/* SUPERVISOR
                          Solo tiene sentido
                          mostrarlo al ADMIN.
                      */}

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