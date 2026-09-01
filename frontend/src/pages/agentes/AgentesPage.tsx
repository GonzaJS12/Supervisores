import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { obtenerAgentes } from '../../services/agentes.service';
import type { AgenteSanitario } from '../../types/agente';

export default function AgentesPage() {
  const navigate = useNavigate();

  const [agentes, setAgentes] = useState<
    AgenteSanitario[]
  >([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    cargarAgentes();
  }, []);

  const cargarAgentes = async () => {
    try {
      setCargando(true);
      setError('');

      const datos =
        await obtenerAgentes();

      setAgentes(datos);
    } catch (error) {
      console.error(error);

      setError(
        'No se pudieron cargar los agentes sanitarios.',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>

      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Agentes sanitarios
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestión de los agentes sanitarios registrados.
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/agentes/nuevo')
          }
          className="self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:self-auto"
        >
          Nuevo agente
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {cargando ? (

          <div className="p-8 text-center text-slate-500">
            Cargando agentes...
          </div>

        ) : agentes.length === 0 ? (

          <div className="p-8 text-center text-slate-500">
            No hay agentes sanitarios registrados.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Agente
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Documento
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Legajo
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Área operativa
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Estado
                  </th>

                  {/* NUEVA COLUMNA */}
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">
                    Acciones
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {agentes.map((agente) => (

                  <tr
                    key={agente.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">

                      <div className="font-medium text-slate-800">
                        {agente.apellido},{' '}
                        {agente.nombre}
                      </div>

                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {agente.documento || '-'}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {agente.legajo || '-'}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {agente.areaOperativa?.nombre ||
                        `Área ${agente.areaOperativaId}`}
                    </td>

                    <td className="px-6 py-4">

                      {agente.activo ? (

                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Activo
                        </span>

                      ) : (

                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Inactivo
                        </span>

                      )}

                    </td>

                    {/* NUEVA CELDA */}
                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          navigate(
                            `/agentes/${agente.id}`,
                          )
                        }
                        className="font-medium text-blue-600 transition hover:text-blue-800"
                      >
                        Ver
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}