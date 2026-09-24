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
} from '../../context/useAuth';

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  Sector,
} from '../../types/supervision';

const LIMITE_POR_PAGINA = 15;

export default function AgentesPage() {
  const navigate =
    useNavigate();

  const {
    usuario,
  } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

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

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  /*
   * DEBOUNCE DEL NOMBRE
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

  /*
   * ÁREAS PARA ADMIN
   */
  useEffect(() => {
    if (!esAdmin) {
      return;
    }

    let activo = true;

    const cargarAreas =
      async () => {
        try {
          const datos =
            await obtenerAreasOperativas();

          if (!activo) {
            return;
          }

          setAreas(
            datos.filter(
              area => area.activo,
            ),
          );
        } catch (error) {
          console.error(error);

          if (!activo) {
            return;
          }

          setAreas([]);

          setError(
            'No se pudieron cargar las áreas operativas.',
          );
        }
      };

    void cargarAreas();

    return () => {
      activo = false;
    };
  }, [esAdmin]);

  /*
   * SECTORES PARA ADMIN
   */
  useEffect(() => {
    if (
      !esAdmin ||
      !areaOperativaId
    ) {
      return;
    }

    let activo = true;

    const cargarSectores =
      async () => {
        try {
          const datos =
            await obtenerSectoresPorArea(
              Number(
                areaOperativaId,
              ),
            );

          if (!activo) {
            return;
          }

          setSectores(
            datos,
          );
        } catch (error) {
          console.error(error);

          if (!activo) {
            return;
          }

          setSectores([]);
          setSectorId('');

          setError(
            'No se pudieron cargar los sectores.',
          );
        }
      };

    void cargarSectores();

    return () => {
      activo = false;
    };
  }, [
    areaOperativaId,
    esAdmin,
  ]);

  /*
   * SECTORES PARA SUPERVISOR
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

  const cambiarNombre = (
    valor: string,
  ) => {
    setNombre(valor);
  };

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

  const cambiarSector = (
    valor: string,
  ) => {
    setSectorId(valor);
    setPagina(1);
  };

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
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Gestión territorial
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Agentes sanitarios
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {esAdmin
              ? 'Consulte los agentes sanitarios registrados en las distintas áreas operativas.'
              : 'Consulte los agentes sanitarios pertenecientes a su área operativa.'}
          </p>
        </div>

        <div className="inline-flex self-start items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:self-auto">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconoAgentes />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="text-sm font-bold text-slate-800">
              {total}{' '}
              {total === 1
                ? 'agente'
                : 'agentes'}
            </p>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <IconoFiltro />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Filtrar agentes
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Busque por nombre, apellido o ubicación territorial.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div
            className={
              esAdmin
                ? 'grid gap-5 md:grid-cols-3'
                : 'grid gap-5 md:grid-cols-2'
            }
          >
            {/* NOMBRE */}
            <div>
              <label
                htmlFor="filtroNombre"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Agente
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <IconoBuscar />
                </div>

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
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* ÁREA - ADMIN */}
            {esAdmin && (
              <div>
                <label
                  htmlFor="filtroArea"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {hayFiltros && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}

              <span>
                {hayFiltros
                  ? `${total} agente${
                      total === 1
                        ? ''
                        : 's'
                    } encontrado${
                      total === 1
                        ? ''
                        : 's'
                    }`
                  : `${total} agente${
                      total === 1
                        ? ''
                        : 's'
                    } registrado${
                      total === 1
                        ? ''
                        : 's'
                    }`}
              </span>
            </div>

            <button
              type="button"
              onClick={
                limpiarFiltros
              }
              disabled={
                !hayFiltros
              }
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
            >
              <IconoLimpiar />

              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <div className="mt-0.5 shrink-0">
            <IconoAlerta />
          </div>

          <p>{error}</p>
        </div>
      )}

      {/* LISTADO */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">
              Listado de agentes
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Seleccione un agente para consultar su información e historial.
            </p>
          </div>

          {cargando && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />

              Actualizando
            </div>
          )}
        </div>

        {cargando &&
        agentes.length === 0 ? (
          <EstadoCargando />
        ) : agentes.length === 0 ? (
          <EstadoVacio
            hayFiltros={
              hayFiltros
            }
          />
        ) : (
          <>
            {/* TABLA DESKTOP */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Agente
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Documento
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Área operativa
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sector
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cobertura
                    </th>

                    <th className="whitespace-nowrap px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acción
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
                        className="group transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex min-w-48 items-center gap-3">
                            <AvatarAgente
                              nombre={
                                agente.nombre
                              }
                              apellido={
                                agente.apellido
                              }
                            />

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {
                                  agente.apellido
                                }
                                ,{' '}
                                {
                                  agente.nombre
                                }
                              </p>

                              {agente.legajo && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Legajo{' '}
                                  {
                                    agente.legajo
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
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
                            : (
                              <span className="text-slate-400">
                                Sin sector
                              </span>
                            )}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {agente.cobertura ||
                            '-'}
                        </td>

                        <td className="px-6 py-4">
                          <EstadoAgente
                            activo={
                              agente.activo
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/agentes/${agente.id}`,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            Ver detalle

                            <IconoChevron />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* TARJETAS MÓVIL */}
            <div className="divide-y divide-slate-100 md:hidden">
              {agentes.map(
                agente => (
                  <button
                    type="button"
                    key={
                      agente.id
                    }
                    onClick={() =>
                      navigate(
                        `/agentes/${agente.id}`,
                      )
                    }
                    className="block w-full p-4 text-left transition active:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <AvatarAgente
                        nombre={
                          agente.nombre
                        }
                        apellido={
                          agente.apellido
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {
                                agente.apellido
                              }
                              ,{' '}
                              {
                                agente.nombre
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {agente.documento
                                ? `DNI ${agente.documento}`
                                : 'Documento no informado'}
                            </p>
                          </div>

                          <EstadoAgente
                            activo={
                              agente.activo
                            }
                          />
                        </div>

                        <div className="mt-3 grid gap-2 text-xs text-slate-500">
                          <DatoMovil
                            label="Área"
                            valor={
                              agente
                                .areaOperativa
                                ?.nombre ||
                              `Área ${agente.areaOperativaId}`
                            }
                          />

                          <DatoMovil
                            label="Sector"
                            valor={
                              agente.sector
                                ? agente
                                    .sector
                                    .nombre ||
                                  `Sector ${agente.sector.numero}`
                                : 'Sin sector asignado'
                            }
                          />

                          {agente.cobertura && (
                            <DatoMovil
                              label="Cobertura"
                              valor={
                                agente.cobertura
                              }
                            />
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-blue-600">
                          Ver detalle
                          <IconoChevron />
                        </div>
                      </div>
                    </div>
                  </button>
                ),
              )}
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="text-center text-sm text-slate-500 sm:text-left">
                Mostrando{' '}
                <span className="font-semibold text-slate-700">
                  {desde}
                </span>
                {' – '}
                <span className="font-semibold text-slate-700">
                  {hasta}
                </span>
                {' de '}
                <span className="font-semibold text-slate-700">
                  {total}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={
                    irPaginaAnterior
                  }
                  disabled={
                    pagina <= 1 ||
                    cargando
                  }
                  aria-label="Página anterior"
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconoAnterior />

                  <span className="hidden sm:inline">
                    Anterior
                  </span>
                </button>

                <div className="flex h-9 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
                  Página{' '}
                  <span className="mx-1 font-bold text-slate-900">
                    {pagina}
                  </span>
                  de{' '}
                  <span className="ml-1 font-bold text-slate-900">
                    {totalPaginas}
                  </span>
                </div>

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
                  aria-label="Página siguiente"
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">
                    Siguiente
                  </span>

                  <IconoSiguiente />
                </button>
              </div>
            </div>
          </>
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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
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
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Inactivo
    </span>
  );
}

function DatoMovil({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 font-medium text-slate-400">
        {label}:
      </span>

      <span className="text-slate-600">
        {valor}
      </span>
    </div>
  );
}

function EstadoCargando() {
  return (
    <div className="space-y-3 p-5 sm:p-6">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />

          <div className="flex-1">
            <div className="h-4 w-44 max-w-full rounded bg-slate-200" />

            <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EstadoVacio({
  hayFiltros,
}: {
  hayFiltros: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {hayFiltros
          ? <IconoBuscar />
          : <IconoAgentes />}
      </div>

      <p className="mt-4 font-semibold text-slate-700">
        {hayFiltros
          ? 'No se encontraron agentes'
          : 'No hay agentes registrados'}
      </p>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {hayFiltros
          ? 'Pruebe modificando o eliminando alguno de los filtros seleccionados.'
          : 'Actualmente no existen agentes sanitarios disponibles.'}
      </p>
    </div>
  );
}

interface IconoProps {
  className?: string;
}

function IconoAgentes({
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
      <circle cx="9" cy="8" r="3" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19c.4-3.4 2.3-5.5 5.5-5.5s5.1 2.1 5.5 5.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7.5a2.5 2.5 0 0 1 0 5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 14c2.2.5 3.3 2.1 3.5 4.5"
      />
    </svg>
  );
}

function IconoFiltro({
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
        d="M4 6h16M7 12h10M10 18h4"
      />
    </svg>
  );
}

function IconoBuscar({
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
        cx="11"
        cy="11"
        r="6"
      />

      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </svg>
  );
}

function IconoLimpiar({
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
        d="m4 4 16 16M20 4 4 20"
      />
    </svg>
  );
}

function IconoChevron({
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
        d="m9 18 6-6-6-6"
      />
    </svg>
  );
}

function IconoAnterior({
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

function IconoSiguiente({
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