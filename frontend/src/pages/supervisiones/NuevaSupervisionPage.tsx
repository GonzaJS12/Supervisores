import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  obtenerAgentesPorArea,
} from '../../services/agentes.service';

import {
  obtenerAreasOperativas,
} from '../../services/areas-operativas.service';

import {
  obtenerSectoresPorArea,
} from '../../services/sectores.service';

import {
  obtenerRondas,
} from '../../services/rondas.service';

import {
  obtenerBloquesEvaluacion,
} from '../../services/evaluaciones.service';

import {
  crearSupervision,
} from '../../services/supervisiones.service';

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  Sector,
  DecisionGestion,
} from '../../types/supervision';

import type {
  Ronda,
} from '../../types/ronda';

import type {
  BloqueEvaluacion,
} from '../../types/evaluacion';

import type {
  AreaOperativa,
} from '../../services/areas-operativas.service';

import {
  useAuth,
} from '../../context/useAuth';

export default function NuevaSupervisionPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  const [
    areas,
    setAreas,
  ] = useState<AreaOperativa[]>([]);

  const [
    sectores,
    setSectores,
  ] = useState<Sector[]>([]);

  const [
    agentes,
    setAgentes,
  ] = useState<AgenteSanitario[]>([]);

  const [
    rondas,
    setRondas,
  ] = useState<Ronda[]>([]);

  const [
    bloques,
    setBloques,
  ] = useState<BloqueEvaluacion[]>([]);

  const [
    areaId,
    setAreaId,
  ] = useState(() =>
    usuario?.rol === 'SUPERVISOR' &&
    usuario.areaOperativaId != null
      ? String(
          usuario.areaOperativaId,
        )
      : '',
  );

  const [
    sectorId,
    setSectorId,
  ] = useState('');

  const [
    agenteId,
    setAgenteId,
  ] = useState('');

  const [
    rondaId,
    setRondaId,
  ] = useState('');

  const [
    fecha,
    setFecha,
  ] = useState(
    new Date()
      .toISOString()
      .slice(0, 10),
  );

  const [
    familiaNumero,
    setFamiliaNumero,
  ] = useState('');

  const [
    decisionGestion,
    setDecisionGestion,
  ] =
    useState<DecisionGestion>(
      'NO_REQUIERE',
    );

  const [
    fortalezas,
    setFortalezas,
  ] = useState('');

  const [
    oportunidadesMejora,
    setOportunidadesMejora,
  ] = useState('');

  const [
    situacionesCriticas,
    setSituacionesCriticas,
  ] = useState('');

  const [
    recomendaciones,
    setRecomendaciones,
  ] = useState('');

  const [
    puntuaciones,
    setPuntuaciones,
  ] =
    useState<
      Record<number, number>
    >({});

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    cargandoTerritorio,
    setCargandoTerritorio,
  ] = useState(false);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  /*
   * CARGA INICIAL
   */
  useEffect(() => {
    const cargarDatos =
      async () => {
        try {
          setCargando(true);

          const [
            areasData,
            rondasData,
            bloquesData,
          ] =
            await Promise.all([
              obtenerAreasOperativas(),
              obtenerRondas(),
              obtenerBloquesEvaluacion(),
            ]);

          setAreas(
            areasData.filter(
              area =>
                area.activo,
            ),
          );

          setRondas(
            rondasData.filter(
              ronda =>
                ronda.activo,
            ),
          );

          setBloques(
            bloquesData
              .filter(
                bloque =>
                  bloque.activo,
              )
              .map(
                bloque => ({
                  ...bloque,

                  criterios:
                    bloque.criterios.filter(
                      criterio =>
                        criterio.activo,
                    ),
                }),
              ),
          );
        } catch (error) {
          console.error(error);

          setError(
            'No se pudieron cargar los datos del formulario.',
          );
        } finally {
          setCargando(false);
        }
      };

    cargarDatos();
  }, []);

  /*
   * TERRITORIO
   */
  useEffect(() => {
    const cargarPorArea =
      async () => {
        setSectores([]);
        setAgentes([]);
        setSectorId('');
        setAgenteId('');
        setError('');

        if (!areaId) {
          return;
        }

        try {
          setCargandoTerritorio(
            true,
          );

          const [
            sectoresData,
            agentesData,
          ] =
            await Promise.all([
              obtenerSectoresPorArea(
                Number(areaId),
              ),

              obtenerAgentesPorArea(
                Number(areaId),
              ),
            ]);

          setSectores(
            sectoresData.filter(
              sector =>
                sector.activo,
            ),
          );

          setAgentes(
            agentesData.filter(
              agente =>
                agente.activo,
            ),
          );
        } catch (error) {
          console.error(error);

          setSectores([]);
          setAgentes([]);
          setSectorId('');
          setAgenteId('');

          setError(
            'No se pudieron cargar los sectores y agentes del área seleccionada.',
          );
        } finally {
          setCargandoTerritorio(
            false,
          );
        }
      };

    cargarPorArea();
  }, [areaId]);

  const agentesFiltrados =
    useMemo(() => {
      if (!sectorId) {
        return agentes;
      }

      if (
        sectorId ===
        'SIN_SECTOR'
      ) {
        return agentes.filter(
          agente =>
            agente.sectorId ==
            null,
        );
      }

      return agentes.filter(
        agente =>
          agente.sectorId ===
          Number(sectorId),
      );
    }, [
      agentes,
      sectorId,
    ]);

  const cantidadAgentesPorSector =
    useMemo(() => {
      const cantidades:
        Record<number, number> =
          {};

      agentes.forEach(
        agente => {
          if (
            agente.sectorId ==
            null
          ) {
            return;
          }

          cantidades[
            agente.sectorId
          ] =
            (cantidades[
              agente.sectorId
            ] ?? 0) + 1;
        },
      );

      return cantidades;
    }, [agentes]);

  const cantidadSinSector =
    useMemo(
      () =>
        agentes.filter(
          agente =>
            agente.sectorId ==
            null,
        ).length,
      [agentes],
    );

  const agenteSeleccionado =
    useMemo(
      () =>
        agentes.find(
          agente =>
            agente.id ===
            Number(agenteId),
        ),
      [
        agentes,
        agenteId,
      ],
    );

  const criteriosActivos =
    bloques.flatMap(
      bloque =>
        bloque.criterios,
    );

  const formularioCompleto =
    criteriosActivos.length >
      0 &&
    criteriosActivos.every(
      criterio =>
        puntuaciones[
          criterio.id
        ] !== undefined,
    );

  const cantidadEvaluada =
    criteriosActivos.filter(
      criterio =>
        puntuaciones[
          criterio.id
        ] !== undefined,
    ).length;

  const progreso =
    criteriosActivos.length > 0
      ? Math.round(
          (cantidadEvaluada /
            criteriosActivos.length) *
            100,
        )
      : 0;

  const promedio =
    useMemo(() => {
      const valores =
        Object.values(
          puntuaciones,
        );

      if (
        valores.length === 0
      ) {
        return null;
      }

      const suma =
        valores.reduce(
          (
            total,
            valor,
          ) =>
            total + valor,
          0,
        );

      return Number(
        (
          suma /
          valores.length
        ).toFixed(2),
      );
    }, [
      puntuaciones,
    ]);

  const clasificacion =
    useMemo(() => {
      if (
        promedio === null
      ) {
        return '';
      }

      if (
        promedio <= 2.5
      ) {
        return 'CRITICO';
      }

      if (
        promedio <= 3.5
      ) {
        return 'REGULAR';
      }

      if (
        promedio <= 4.5
      ) {
        return 'BUENO';
      }

      return 'EXCELENTE';
    }, [
      promedio,
    ]);

  const handlePuntuacion = (
    criterioId: number,
    puntuacion: number,
  ) => {
    setPuntuaciones(
      anterior => ({
        ...anterior,

        [criterioId]:
          puntuacion,
      }),
    );
  };

  const handleSubmit =
    async (
      e: React.FormEvent,
    ) => {
      e.preventDefault();

      setError('');

      if (!areaId) {
        setError(
          'Debe seleccionar un área operativa.',
        );

        return;
      }

      if (
        !agenteSeleccionado
      ) {
        setError(
          'Debe seleccionar un agente sanitario.',
        );

        return;
      }

      if (
        !agenteSeleccionado.activo
      ) {
        setError(
          'No se puede crear una supervisión para un agente inactivo.',
        );

        return;
      }

      if (!rondaId) {
        setError(
          'Debe seleccionar una ronda.',
        );

        return;
      }

      if (
        !formularioCompleto
      ) {
        setError(
          'Debe puntuar todos los criterios de evaluación.',
        );

        return;
      }

      try {
        setGuardando(true);

        await crearSupervision({
          agenteSanitarioId:
            agenteSeleccionado.id,

          areaOperativaId:
            Number(areaId),

          sectorId:
            agenteSeleccionado
              .sectorId ??
            undefined,

          rondaId:
            Number(rondaId),

          fecha:
            new Date(
              `${fecha}T12:00:00`,
            ).toISOString(),

          familiaNumero:
            familiaNumero
              ? Number(
                  familiaNumero,
                )
              : undefined,

          decisionGestion,

          fortalezas:
            fortalezas ||
            undefined,

          oportunidadesMejora:
            oportunidadesMejora ||
            undefined,

          situacionesCriticas:
            situacionesCriticas ||
            undefined,

          recomendaciones:
            recomendaciones ||
            undefined,

          evaluaciones:
            criteriosActivos.map(
              criterio => ({
                criterioId:
                  criterio.id,

                puntuacion:
                  puntuaciones[
                    criterio.id
                  ],
              }),
            ),
        });

        navigate(
          '/supervisiones',
        );
      } catch (error: unknown) {
        console.error(error);

        let mensajeBackend:
          | string
          | string[]
          | undefined;

        if (
          typeof error ===
            'object' &&
          error !== null &&
          'response' in error
        ) {
          const response = (
            error as {
              response?: {
                data?: {
                  message?:
                    | string
                    | string[];
                };
              };
            }
          ).response;

          mensajeBackend =
            response?.data
              ?.message;
        }

        if (
          Array.isArray(
            mensajeBackend,
          )
        ) {
          setError(
            mensajeBackend.join(
              ', ',
            ),
          );
        } else {
          setError(
            mensajeBackend ||
              'No se pudo guardar la supervisión.',
          );
        }
      } finally {
        setGuardando(false);
      }
    };

  if (cargando) {
    return (
      <EstadoCargaFormulario />
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="mx-auto max-w-7xl space-y-6"
    >
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Evaluación sanitaria
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Nueva supervisión
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Complete los datos del agente,
            evalúe todos los criterios y
            registre las observaciones de la
            supervisión.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/supervisiones',
            )
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 lg:self-auto"
        >
          <IconoVolver />

          Volver al historial
        </button>
      </section>

      {/* PROGRESO */}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Progreso de evaluación
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {cantidadEvaluada} de{' '}
              {criteriosActivos.length}{' '}
              criterios puntuados
            </p>
          </div>

          <span
            className={`text-sm font-bold ${
              formularioCompleto
                ? 'text-emerald-600'
                : 'text-blue-600'
            }`}
          >
            {progreso}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              formularioCompleto
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
            style={{
              width: `${progreso}%`,
            }}
          />
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

      {/* 1 IDENTIFICACIÓN */}
      <Seccion
        numero="1"
        titulo="Identificación"
        descripcion="Seleccione el territorio y los datos correspondientes al agente sanitario."
        icono={<IconoUsuario />}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {esAdmin ? (
            <CampoSelect
              label="Área operativa"
              value={areaId}
              onChange={
                setAreaId
              }
            >
              <option value="">
                Seleccione un área
              </option>

              {areas.map(
                area => (
                  <option
                    key={area.id}
                    value={area.id}
                  >
                    {area.nombre}
                  </option>
                ),
              )}
            </CampoSelect>
          ) : (
            <CampoTexto
              label="Área operativa"
              value={
                usuario
                  ?.areaOperativa
                  ?.nombre ??
                'Sin área asignada'
              }
              readOnly
            />
          )}

          <CampoSelect
            label="Sector"
            value={sectorId}
            onChange={valor => {
              setSectorId(valor);
              setAgenteId('');
            }}
            disabled={
              !areaId ||
              cargandoTerritorio
            }
          >
            <option value="">
              Todos los sectores (
              {agentes.length}{' '}
              agentes)
            </option>

            <option value="SIN_SECTOR">
              Sin sector asignado (
              {cantidadSinSector}{' '}
              {cantidadSinSector ===
              1
                ? 'agente'
                : 'agentes'}
              )
            </option>

            {sectores.map(
              sector => {
                const cantidad =
                  cantidadAgentesPorSector[
                    sector.id
                  ] ?? 0;

                return (
                  <option
                    key={
                      sector.id
                    }
                    value={
                      sector.id
                    }
                  >
                    {sector.nombre ??
                      `Sector ${sector.numero}`}{' '}
                    ({cantidad}{' '}
                    {cantidad === 1
                      ? 'agente'
                      : 'agentes'}
                    )
                  </option>
                );
              },
            )}
          </CampoSelect>

          <CampoSelect
            label="Agente sanitario"
            value={agenteId}
            onChange={valor => {
              setAgenteId(valor);

              const agente =
                agentes.find(
                  item =>
                    item.id ===
                    Number(valor),
                );

              if (!agente) {
                return;
              }

              setSectorId(
                agente.sectorId ==
                null
                  ? 'SIN_SECTOR'
                  : String(
                      agente.sectorId,
                    ),
              );
            }}
            disabled={
              !areaId ||
              cargandoTerritorio ||
              agentesFiltrados.length ===
                0
            }
          >
            <option value="">
              {!areaId
                ? 'Seleccione primero un área'
                : cargandoTerritorio
                  ? 'Cargando agentes...'
                  : agentesFiltrados.length ===
                      0
                    ? 'No hay agentes asignados'
                    : `Seleccione un agente (${agentesFiltrados.length} disponibles)`}
            </option>

            {agentesFiltrados.map(
              agente => (
                <option
                  key={
                    agente.id
                  }
                  value={
                    agente.id
                  }
                >
                  {agente.apellido},{' '}
                  {agente.nombre}
                  {agente.sectorId ==
                  null
                    ? ' - Sin sector'
                    : ''}
                </option>
              ),
            )}
          </CampoSelect>

          <CampoSelect
            label="Ronda"
            value={rondaId}
            onChange={
              setRondaId
            }
          >
            <option value="">
              Seleccione una ronda
            </option>

            {rondas.map(
              ronda => (
                <option
                  key={
                    ronda.id
                  }
                  value={
                    ronda.id
                  }
                >
                  {ronda.nombre}
                </option>
              ),
            )}
          </CampoSelect>

          <CampoFecha
            label="Fecha"
            value={fecha}
            onChange={
              setFecha
            }
          />

          <CampoTexto
            label="Familia N°"
            value={
              familiaNumero
            }
            onChange={
              setFamiliaNumero
            }
            type="number"
            placeholder="Ej. 125"
          />
        </div>

        {cargandoTerritorio && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

            Cargando sectores y agentes...
          </div>
        )}

        {agenteSeleccionado && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <AvatarAgente
                nombre={
                  agenteSeleccionado.nombre
                }
                apellido={
                  agenteSeleccionado.apellido
                }
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Agente seleccionado
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {
                    agenteSeleccionado.apellido
                  }
                  ,{' '}
                  {
                    agenteSeleccionado.nombre
                  }
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DatoAgente
                    label="Documento"
                    valor={
                      agenteSeleccionado.documento ??
                      'Sin información'
                    }
                  />

                  <DatoAgente
                    label="Cobertura"
                    valor={
                      agenteSeleccionado.cobertura ??
                      'Sin información'
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Seccion>

      {/* 2 EVALUACIÓN */}
      <Seccion
        numero="2"
        titulo="Evaluación"
        descripcion="Puntúe cada criterio utilizando la escala del 1 al 5."
        icono={<IconoEvaluacion />}
      >
        <EscalaReferencia />

        {bloques.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
            No hay bloques de evaluación
            activos.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {bloques.map(
              bloque => (
                <div
                  key={
                    bloque.id
                  }
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <h3 className="font-bold text-slate-800">
                      {bloque.nombre}
                    </h3>

                    {bloque.descripcion && (
                      <p className="mt-1 text-sm text-slate-500">
                        {
                          bloque.descripcion
                        }
                      </p>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100">
                    {bloque.criterios.map(
                      criterio => (
                        <div
                          key={
                            criterio.id
                          }
                          className="p-5"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="max-w-2xl">
                              <p className="text-sm font-semibold leading-6 text-slate-800">
                                {
                                  criterio.nombre
                                }
                              </p>

                              {criterio.descripcion && (
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {
                                    criterio.descripcion
                                  }
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-5 gap-2 sm:flex">
                              {[
                                1,
                                2,
                                3,
                                4,
                                5,
                              ].map(
                                valor => {
                                  const seleccionado =
                                    puntuaciones[
                                      criterio
                                        .id
                                    ] ===
                                    valor;

                                  return (
                                    <button
                                      key={
                                        valor
                                      }
                                      type="button"
                                      onClick={() =>
                                        handlePuntuacion(
                                          criterio.id,
                                          valor,
                                        )
                                      }
                                      aria-label={`Puntuar ${criterio.nombre} con ${valor}`}
                                      aria-pressed={
                                        seleccionado
                                      }
                                      className={`flex h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-bold transition ${
                                        seleccionado
                                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-4 ring-blue-50'
                                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                                      }`}
                                    >
                                      {
                                        valor
                                      }
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </Seccion>

      {/* 3 OBSERVACIONES */}
      <Seccion
        numero="3"
        titulo="Observaciones del supervisor"
        descripcion="Registre los aspectos relevantes identificados durante la supervisión."
        icono={<IconoObservaciones />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <AreaTexto
            label="Fortalezas observadas"
            descripcion="Aspectos positivos identificados durante la supervisión."
            value={
              fortalezas
            }
            onChange={
              setFortalezas
            }
            placeholder="Describa las fortalezas observadas..."
          />

          <AreaTexto
            label="Oportunidades de mejora"
            descripcion="Aspectos que pueden fortalecerse o corregirse."
            value={
              oportunidadesMejora
            }
            onChange={
              setOportunidadesMejora
            }
            placeholder="Describa las oportunidades de mejora..."
          />

          <AreaTexto
            label="Situaciones críticas detectadas"
            descripcion="Registre situaciones que requieran especial atención."
            value={
              situacionesCriticas
            }
            onChange={
              setSituacionesCriticas
            }
            placeholder="Describa las situaciones críticas..."
          />

          <AreaTexto
            label="Recomendaciones"
            descripcion="Acciones sugeridas a partir de la supervisión."
            value={
              recomendaciones
            }
            onChange={
              setRecomendaciones
            }
            placeholder="Ingrese las recomendaciones..."
          />
        </div>
      </Seccion>

      {/* 4 DECISIÓN */}
      <Seccion
        numero="4"
        titulo="Decisión de gestión"
        descripcion="Seleccione la acción que corresponde según los resultados y observaciones."
        icono={<IconoDecision />}
      >
        <p className="mb-4 text-sm font-semibold text-slate-700">
          ¿Requiere intervención?
        </p>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <OpcionDecision
            titulo="No requiere"
            descripcion="Sin intervención adicional."
            seleccionada={
              decisionGestion ===
              'NO_REQUIERE'
            }
            tono="slate"
            onClick={() =>
              setDecisionGestion(
                'NO_REQUIERE',
              )
            }
          />

          <OpcionDecision
            titulo="Seguimiento"
            descripcion="Requiere seguimiento posterior."
            seleccionada={
              decisionGestion ===
              'SEGUIMIENTO'
            }
            tono="blue"
            onClick={() =>
              setDecisionGestion(
                'SEGUIMIENTO',
              )
            }
          />

          <OpcionDecision
            titulo="Capacitación"
            descripcion="Requiere fortalecimiento o capacitación."
            seleccionada={
              decisionGestion ===
              'CAPACITACION'
            }
            tono="amber"
            onClick={() =>
              setDecisionGestion(
                'CAPACITACION',
              )
            }
          />

          <OpcionDecision
            titulo="Supervisión intensiva"
            descripcion="Requiere una intervención prioritaria."
            seleccionada={
              decisionGestion ===
              'SUPERVISION_INTENSIVA'
            }
            tono="red"
            onClick={() =>
              setDecisionGestion(
                'SUPERVISION_INTENSIVA',
              )
            }
          />
        </div>
      </Seccion>

      {/* 5 RESULTADO */}
      <Seccion
        numero="5"
        titulo="Resultado general"
        descripcion="El resultado se calcula automáticamente a partir de las puntuaciones registradas."
        icono={<IconoResultado />}
      >
        {promedio === null ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
              <IconoResultado />
            </div>

            <p className="mt-3 font-semibold text-slate-700">
              Evaluación pendiente
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Puntúe los criterios para
              comenzar a calcular el
              resultado.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_2fr]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Promedio actual
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {promedio.toFixed(
                  2,
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                sobre 5.00
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Clasificación
              </p>

              <div className="mt-3">
                <ClasificacionBadge
                  clasificacion={
                    clasificacion
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Escala de clasificación
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Rango
                  nombre="Crítico"
                  rango="1.0 – 2.5"
                  estilo="border-red-200 bg-red-50 text-red-700"
                />

                <Rango
                  nombre="Regular"
                  rango="2.6 – 3.5"
                  estilo="border-amber-200 bg-amber-50 text-amber-700"
                />

                <Rango
                  nombre="Bueno"
                  rango="3.6 – 4.5"
                  estilo="border-blue-200 bg-blue-50 text-blue-700"
                />

                <Rango
                  nombre="Excelente"
                  rango="4.6 – 5.0"
                  estilo="border-emerald-200 bg-emerald-50 text-emerald-700"
                />
              </div>
            </div>
          </div>
        )}
      </Seccion>

      {/* ACCIONES */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-2 lg:backdrop-blur-none">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            {!formularioCompleto
              ? `Faltan ${
                  criteriosActivos.length -
                  cantidadEvaluada
                } criterio${
                  criteriosActivos.length -
                    cantidadEvaluada ===
                  1
                    ? ''
                    : 's'
                } por puntuar.`
              : 'Todos los criterios fueron puntuados.'}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/supervisiones',
                )
              }
              disabled={
                guardando
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                guardando ||
                !formularioCompleto
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-white" />

                  Guardando...
                </>
              ) : (
                <>
                  <IconoGuardar />

                  Guardar supervisión
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* =========================================================
 * COMPONENTES
 * ======================================================= */

function Seccion({
  numero,
  titulo,
  descripcion,
  icono,
  children,
}: {
  numero: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icono}

            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {numero}
            </span>
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

function CampoTexto({
  label,
  value,
  onChange,
  readOnly = false,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (
    value: string,
  ) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        readOnly={
          readOnly
        }
        min={
          type === 'number'
            ? 1
            : undefined
        }
        placeholder={
          placeholder
        }
        onChange={e =>
          onChange?.(
            e.target.value,
          )
        }
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
          readOnly
            ? 'border-slate-200 bg-slate-100 text-slate-600'
            : 'border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
        }`}
      />
    </div>
  );
}

function CampoFecha({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={e =>
          onChange(
            e.target.value,
          )
        }
        required
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function CampoSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  children:
    React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        disabled={
          disabled
        }
        onChange={e =>
          onChange(
            e.target.value,
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {children}
      </select>
    </div>
  );
}

function AreaTexto({
  label,
  descripcion,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  descripcion: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {descripcion}
      </p>

      <textarea
        rows={5}
        value={value}
        placeholder={
          placeholder
        }
        onChange={e =>
          onChange(
            e.target.value,
          )
        }
        className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
      {iniciales || 'A'}
    </div>
  );
}

function DatoAgente({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {valor}
      </p>
    </div>
  );
}

function EscalaReferencia() {
  const valores = [
    {
      numero: 1,
      texto: 'Muy deficiente',
    },
    {
      numero: 2,
      texto: 'Deficiente',
    },
    {
      numero: 3,
      texto: 'Regular',
    },
    {
      numero: 4,
      texto: 'Bueno',
    },
    {
      numero: 5,
      texto: 'Excelente',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Escala de puntuación
      </p>

      <div className="grid gap-2 sm:grid-cols-5">
        {valores.map(
          item => (
            <div
              key={
                item.numero
              }
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-700">
                {item.numero}
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

function OpcionDecision({
  titulo,
  descripcion,
  seleccionada,
  tono,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  seleccionada: boolean;
  tono:
    | 'slate'
    | 'blue'
    | 'amber'
    | 'red';
  onClick: () => void;
}) {
  const estilos = {
    slate: seleccionada
      ? 'border-slate-500 bg-slate-50 ring-2 ring-slate-100'
      : '',
    blue: seleccionada
      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
      : '',
    amber: seleccionada
      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100'
      : '',
    red: seleccionada
      ? 'border-red-500 bg-red-50 ring-2 ring-red-100'
      : '',
  };

  const circulos = {
    slate:
      'border-slate-500 bg-slate-500',
    blue:
      'border-blue-500 bg-blue-500',
    amber:
      'border-amber-500 bg-amber-500',
    red:
      'border-red-500 bg-red-500',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={
        seleccionada
      }
      className={`rounded-xl border p-4 text-left transition ${
        seleccionada
          ? estilos[tono]
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            seleccionada
              ? circulos[tono]
              : 'border-slate-300 bg-white'
          }`}
        >
          {seleccionada && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>

        <div>
          <p className="text-sm font-bold text-slate-800">
            {titulo}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {descripcion}
          </p>
        </div>
      </div>
    </button>
  );
}

function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion: string;
}) {
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
      CRITICO: 'Crítico',
      REGULAR: 'Regular',
      BUENO: 'Bueno',
      EXCELENTE: 'Excelente',
    };

  return (
    <span
      className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${
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

function Rango({
  nombre,
  rango,
  estilo,
}: {
  nombre: string;
  rango: string;
  estilo: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${estilo}`}
    >
      <p className="text-xs font-bold">
        {nombre}
      </p>

      <p className="mt-0.5 text-[11px] opacity-80">
        {rango}
      </p>
    </div>
  );
}

function EstadoCargaFormulario() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="animate-pulse">
        <div className="h-3 w-28 rounded bg-slate-200" />

        <div className="mt-3 h-8 w-64 rounded bg-slate-200" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />
      </div>

      {[1, 2, 3].map(
        item => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-6 w-48 rounded bg-slate-200" />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="h-11 rounded-xl bg-slate-100" />
              <div className="h-11 rounded-xl bg-slate-100" />
              <div className="h-11 rounded-xl bg-slate-100" />
              <div className="h-11 rounded-xl bg-slate-100" />
            </div>
          </div>
        ),
      )}
    </div>
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

function IconoDecision({
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
        d="M12 3v18M12 6H5l3 3-3 3h7M12 12h7l-3 3 3 3h-7"
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

function IconoGuardar({
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
        d="M5 4h12l2 2v14H5V4Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4v6h8V4M8 20v-6h8v6"
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