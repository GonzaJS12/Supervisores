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

import {
  obtenerAreasOperativas,
} from '../../services/areas-operativas.service';

import type {
  AreaOperativa,
} from '../../services/areas-operativas.service';

import {
  obtenerSectoresPorArea,
} from '../../services/sectores.service';

import {
  useAuth,
} from '../../context/AuthContext';

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  Sector,
} from '../../types/supervision';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
} from '../../components/ui/FeedbackBlock';
import PageHeader from '../../components/ui/PageHeader';
import FilterPanel from '../../components/ui/FilterPanel';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';

const LIMITE_POR_PAGINA = 15;

export default function AgentesPage() {
  const navigate =
    useNavigate();

  const {
    usuario,
  } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  /*
   * AGENTES
   */
  const [
    agentes,
    setAgentes,
  ] = useState<
    AgenteSanitario[]
  >([]);

  /*
   * PAGINACIÓN
   */
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

  /*
   * FILTROS
   */
  const [
    nombre,
    setNombre,
  ] = useState('');
  const [
    nombreDebounce,
    setNombreDebounce,
  ] = useState('');

  const [
    areaOperativaId,
    setAreaOperativaId,
  ] = useState('');

  const [
    sectorId,
    setSectorId,
  ] = useState('');

  /*
   * DATOS PARA SELECTORES
   */
  const [
    areas,
    setAreas,
  ] = useState<
    AreaOperativa[]
  >([]);

  const [
    sectores,
    setSectores,
  ] = useState<
    Sector[]
  >([]);

  /*
   * ESTADOS GENERALES
   */
  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  /*
   * CARGAR ÁREAS
   *
   * Solamente ADMIN necesita
   * seleccionar un área.
   */

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setNombreDebounce(
          nombre.trim(),
        );

        setPagina(1);
      }, 400);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [nombre]);
    useEffect(() => {
      if (!esAdmin) {
        setAreas([]);
        return;
      }

    const cargarAreas =
      async () => {
        try {
          const datos =
            await obtenerAreasOperativas();

          setAreas(
            datos.filter(
              area => area.activo,
            ),
          );
        } catch (error) {
          console.error(error);

          setAreas([]);

          setError(
            'No se pudieron cargar las áreas operativas.',
          );
        }
      };

    cargarAreas();
  }, [esAdmin]);

  /*
   * CARGAR SECTORES PARA ADMIN
   *
   * Los sectores dependen del
   * área seleccionada.
   */
  useEffect(() => {
    if (!esAdmin) {
      return;
    }

    if (!areaOperativaId) {
      setSectores([]);
      setSectorId('');
      return;
    }

    const cargarSectores =
      async () => {
        try {
          setSectores([]);
          setSectorId('');

          const datos =
            await obtenerSectoresPorArea(
              Number(
                areaOperativaId,
              ),
            );

          setSectores(
            datos,
          );
        } catch (error) {
          console.error(error);

          setSectores([]);
          setSectorId('');

          setError(
            'No se pudieron cargar los sectores.',
          );
        }
      };

    cargarSectores();
  }, [
    areaOperativaId,
    esAdmin,
  ]);

  /*
   * CARGAR SECTORES PARA SUPERVISOR
   *
   * El área no es seleccionable.
   * Utilizamos directamente el área
   * asignada al usuario autenticado.
   */
  useEffect(() => {
    if (
      esAdmin ||
      !usuario?.areaOperativaId
    ) {
      return;
    }

    const cargarSectores =
      async () => {
        try {
          setSectores([]);
          setSectorId('');

          const datos =
            await obtenerSectoresPorArea(
              usuario.areaOperativaId!,
            );

          setSectores(
            datos,
          );
        } catch (error) {
          console.error(error);

          setSectores([]);
          setSectorId('');

          setError(
            'No se pudieron cargar los sectores.',
          );
        }
      };

    cargarSectores();
  }, [
    esAdmin,
    usuario?.areaOperativaId,
  ]);

  /*
   * CARGAR AGENTES
   *
   * Cada cambio de página o filtro
   * genera una consulta al backend.
   *
   * El backend continúa siendo
   * responsable de aplicar la
   * seguridad territorial.
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
              {
                nombre:
                  nombreDebounce ||
                  undefined,

                sectorId:
                  sectorId
                    ? Number(
                        sectorId,
                      )
                    : undefined,

                areaOperativaId:
                  esAdmin &&
                  areaOperativaId
                    ? Number(
                        areaOperativaId,
                      )
                    : undefined,
              },
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
  }, [
    pagina,
    nombreDebounce,
    sectorId,
    areaOperativaId,
    esAdmin,
  ]);

  /*
   * CAMBIO DE NOMBRE
   *
   * Volvemos a página 1
   * cuando cambia el filtro.
   */
  const cambiarNombre = (
    valor: string,
  ) => {
    setNombre(valor);
  };

  /*
   * CAMBIO DE ÁREA
   *
   * Solo ADMIN.
   *
   * Al cambiar el área también
   * limpiamos el sector porque
   * pertenece al área anterior.
   */
  const cambiarArea = (
    valor: string,
  ) => {
    setAreaOperativaId(
      valor,
    );

    setSectorId('');
    setSectores([]);
    setPagina(1);
  };

  /*
   * CAMBIO DE SECTOR
   */
  const cambiarSector = (
    valor: string,
  ) => {
    setSectorId(valor);
    setPagina(1);
  };

  /*
   * LIMPIAR FILTROS
   */
  const limpiarFiltros =
    () => {
      setNombre('');
      setNombreDebounce('');
      setSectorId('');
      setPagina(1);

      if (esAdmin) {
        setAreaOperativaId('');
        setSectores([]);
      }
    };

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
   * RANGO MOSTRADO
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

  const hayFiltros =
    nombre.trim() !== '' ||
    sectorId !== '' ||
    (
      esAdmin &&
      areaOperativaId !== ''
    );

  return (
    <div>
      {/* ENCABEZADO */}

      <PageHeader
        title="Agentes sanitarios"
        description="Agentes sanitarios obtenidos del sistema territorial."
      />

      {/* FILTROS */}

      <FilterPanel
        title="Filtrar agentes"
        description="Busque por nombre, apellido o ubicación territorial."
        onClear={limpiarFiltros}
        clearDisabled={!hayFiltros}
        footerLeft={
          hayFiltros
            ? `${total} agente${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`
            : `${total} agentes registrados`
        }
      >

        <div
          className={
            esAdmin
              ? 'grid gap-4 md:grid-cols-3'
              : 'grid gap-4 md:grid-cols-2'
          }
        >
          {/* NOMBRE */}

          <div>
            <label
              htmlFor="filtroNombre"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Agente
            </label>

            <input
              id="filtroNombre"
              type="text"
              value={nombre}
              onChange={event =>
                cambiarNombre(
                  event.target.value,
                )
              }
              placeholder="Nombre o apellido"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ÁREA - SOLO ADMIN */}

          {esAdmin && (
            <div>
              <label
                htmlFor="filtroArea"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Área operativa
              </label>

              <select
                id="filtroArea"
                value={
                  areaOperativaId
                }
                onChange={event =>
                  cambiarArea(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Todas las áreas
                </option>

                {areas.map(
                  area => (
                    <option
                      key={
                        area.id
                      }
                      value={
                        area.id
                      }
                    >
                      {
                        area.nombre
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          )}

          {/* SECTOR */}

          <div>
            <label
              htmlFor="filtroSector"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Sector
            </label>

            <select
              id="filtroSector"
              value={sectorId}
              onChange={event =>
                cambiarSector(
                  event.target.value,
                )
              }
              disabled={
                esAdmin &&
                !areaOperativaId
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {esAdmin &&
                !areaOperativaId
                  ? 'Seleccione un área'
                  : 'Todos los sectores'}
              </option>

              {sectores.map(
                sector => (
                  <option
                    key={
                      sector.id
                    }
                    value={
                      sector.id
                    }
                  >
                    {sector.nombre ||
                      `Sector ${sector.numero}`}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

      </FilterPanel>

      {/* ERROR */}

      {error && (
        <ErrorBanner
          className="mb-4"
          title="No se pudieron cargar los agentes"
          message={error}
        />
      )}

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {cargando ? (
          <LoadingState
            className="border-0 shadow-none"
            title="Cargando agentes…"
          />
        ) : agentes.length ===
          0 ? (
          <EmptyState
            className="m-4 border-0 bg-transparent"
            title={
              hayFiltros
                ? 'Sin resultados'
                : 'Sin agentes'
            }
            message={
              hayFiltros
                ? 'No se encontraron agentes con los filtros seleccionados.'
                : 'No hay agentes sanitarios registrados.'
            }
          />
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
                      Territorio (Área → Sector)
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
                    agente => (
                      <tr
                        key={
                          agente.id
                        }
                        className="transition-colors hover:bg-slate-50/80"
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

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                              {agente.areaOperativa?.nombre ||
                                `Área ${agente.areaOperativaId}`}
                            </span>
                            <span className="text-slate-300" aria-hidden>
                              →
                            </span>
                            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">
                              {agente.sector
                                ? agente.sector.nombre ||
                                  `Sector ${agente.sector.numero}`
                                : 'Sin sector'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {agente.cobertura ||
                            '-'}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge activo={agente.activo} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/agentes/${agente.id}`)
                            }
                          >
                            Ver detalle
                          </Button>
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={irPaginaAnterior}
                  disabled={pagina <= 1 || cargando}
                >
                  Anterior
                </Button>

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

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={irPaginaSiguiente}
                  disabled={pagina >= totalPaginas || cargando}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}