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

import type {
  AgenteSanitario,
} from '../../types/agente';

const LIMITE_POR_PAGINA = 15;

export default function AgentesPage() {
  const navigate =
    useNavigate();

  const [
    agentes,
    setAgentes,
  ] = useState<
    AgenteSanitario[]
  >([]);

  const [
    pagina,
    setPagina,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPaginas,
    setTotalPaginas,
  ] = useState(0);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  /*
   * CARGAR AGENTES
   *
   * Cada vez que cambia "pagina"
   * se realiza una nueva petición
   * al backend.
   */
  useEffect(() => {
    const cargarAgentes =
      async () => {
        try {
          setCargando(true);
          setError('');

          const respuesta =
            await obtenerAgentes(
              pagina,
              LIMITE_POR_PAGINA,
            );

          setAgentes(
            respuesta.data,
          );

          setTotal(
            respuesta.meta.total,
          );

          setTotalPaginas(
            respuesta.meta
              .totalPages,
          );
        } catch (error) {
          console.error(error);

          setAgentes([]);
          setTotal(0);
          setTotalPaginas(0);

          setError(
            'No se pudieron cargar los agentes sanitarios.',
          );
        } finally {
          setCargando(false);
        }
      };

    cargarAgentes();
  }, [pagina]);

  /*
   * PAGINACIÓN
   */
  const irPaginaAnterior =
    () => {
      if (pagina > 1) {
        setPagina(
          pagina - 1,
        );
      }
    };

  const irPaginaSiguiente =
    () => {
      if (
        pagina <
        totalPaginas
      ) {
        setPagina(
          pagina + 1,
        );
      }
    };

  /*
   * RANGO QUE SE ESTÁ
   * MOSTRANDO
   *
   * Ejemplo:
   * Mostrando 16 - 30 de 460
   */
  const desde =
    total === 0
      ? 0
      : (
          pagina - 1
        ) *
          LIMITE_POR_PAGINA +
        1;

  const hasta =
    Math.min(
      pagina *
        LIMITE_POR_PAGINA,
      total,
    );

  return (
    <div>
      {/* ENCABEZADO */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Agentes sanitarios
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Agentes sanitarios obtenidos
          del sistema territorial.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando agentes...
          </div>
        ) : agentes.length ===
          0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay agentes sanitarios
            registrados.
          </div>
        ) : (
          <>
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
                      Área operativa
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Sector
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Cobertura
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Estado
                    </th>

                    <th className="px-6 py-4 text-right font-semibold text-slate-600">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {agentes.map(
                    (agente) => (
                      <tr
                        key={
                          agente.id
                        }
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">
                            {
                              agente.apellido
                            }
                            ,{' '}
                            {
                              agente.nombre
                            }
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {agente.documento ||
                            '-'}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {agente
                            .areaOperativa
                            ?.nombre ||
                            `Área ${agente.areaOperativaId}`}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {agente.sector
                            ? agente
                                .sector
                                .nombre ||
                              `Sector ${agente.sector.numero}`
                            : 'Sin sector asignado'}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {agente.cobertura ||
                            '-'}
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

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
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
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Mostrando{' '}
                <span className="font-medium text-slate-700">
                  {desde}
                </span>
                {' - '}
                <span className="font-medium text-slate-700">
                  {hasta}
                </span>
                {' de '}
                <span className="font-medium text-slate-700">
                  {total}
                </span>
                {' agentes'}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={
                    irPaginaAnterior
                  }
                  disabled={
                    pagina <= 1 ||
                    cargando
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="whitespace-nowrap text-sm text-slate-600">
                  Página{' '}
                  <span className="font-semibold text-slate-800">
                    {pagina}
                  </span>
                  {' de '}
                  <span className="font-semibold text-slate-800">
                    {
                      totalPaginas
                    }
                  </span>
                </span>

                <button
                  type="button"
                  onClick={
                    irPaginaSiguiente
                  }
                  disabled={
                    pagina >=
                      totalPaginas ||
                    cargando
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}