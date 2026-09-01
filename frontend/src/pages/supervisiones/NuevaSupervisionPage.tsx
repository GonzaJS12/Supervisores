import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  obtenerAgentes,
} from '../../services/agentes.service';

import {
  obtenerSectoresPorArea,
} from '../../services/sectores.service';

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
  BloqueEvaluacion,
} from '../../types/evaluacion';

export default function NuevaSupervisionPage() {
  const navigate = useNavigate();

  const [agentes, setAgentes] =
    useState<AgenteSanitario[]>([]);

  const [sectores, setSectores] =
    useState<Sector[]>([]);

  const [bloques, setBloques] =
    useState<BloqueEvaluacion[]>([]);

  const [agenteId, setAgenteId] =
    useState('');

  const [sectorId, setSectorId] =
    useState('');

  const [fecha, setFecha] =
    useState(
      new Date().toISOString().slice(0, 10),
    );

  const [familiaNumero, setFamiliaNumero] =
    useState('');

  const [rondaNumero, setRondaNumero] =
    useState('');

  const [decisionGestion, setDecisionGestion] =
    useState<DecisionGestion>('NO_REQUIERE');

  const [fortalezas, setFortalezas] =
    useState('');

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
  ] = useState<Record<number, number>>({});

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const [
          agentesData,
          bloquesData,
        ] = await Promise.all([
          obtenerAgentes(),
          obtenerBloquesEvaluacion(),
        ]);

        setAgentes(agentesData);

        setBloques(
          bloquesData
            .filter((bloque) => bloque.activo)
            .map((bloque) => ({
              ...bloque,
              criterios:
                bloque.criterios.filter(
                  (criterio) =>
                    criterio.activo,
                ),
            })),
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

  const agenteSeleccionado = useMemo(
    () =>
      agentes.find(
        (agente) =>
          agente.id === Number(agenteId),
      ),
    [agentes, agenteId],
  );

  useEffect(() => {
    const cargarSectores = async () => {
      if (!agenteSeleccionado) {
        setSectores([]);
        setSectorId('');
        return;
      }

      try {
        const datos =
          await obtenerSectoresPorArea(
            agenteSeleccionado
              .areaOperativaId,
          );

        setSectores(datos);
        setSectorId('');
      } catch (error) {
        console.error(error);

        setError(
          'No se pudieron cargar los sectores.',
        );
      }
    };

    cargarSectores();
  }, [agenteSeleccionado]);

  const criteriosActivos =
    bloques.flatMap(
      (bloque) => bloque.criterios,
    );

  const formularioCompleto =
    criteriosActivos.length > 0 &&
    criteriosActivos.every(
      (criterio) =>
        puntuaciones[criterio.id] !==
        undefined,
    );

  const promedio = useMemo(() => {
    const valores =
      Object.values(puntuaciones);

    if (valores.length === 0) {
      return null;
    }

    const suma =
      valores.reduce(
        (total, valor) =>
          total + valor,
        0,
      );

    return Number(
      (suma / valores.length).toFixed(2),
    );
  }, [puntuaciones]);

  const clasificacion = useMemo(() => {
    if (promedio === null) {
      return '';
    }

    if (promedio <= 2.5) {
      return 'CRITICO';
    }

    if (promedio <= 3.5) {
      return 'REGULAR';
    }

    if (promedio <= 4.5) {
      return 'BUENO';
    }

    return 'EXCELENTE';
  }, [promedio]);

  const handlePuntuacion = (
    criterioId: number,
    puntuacion: number,
  ) => {
    setPuntuaciones((anterior) => ({
      ...anterior,
      [criterioId]: puntuacion,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');

    if (!agenteSeleccionado) {
      setError(
        'Debe seleccionar un agente sanitario.',
      );
      return;
    }

    if (!sectorId) {
      setError(
        'Debe seleccionar un sector.',
      );
      return;
    }

    if (!formularioCompleto) {
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
          agenteSeleccionado
            .areaOperativaId,

        sectorId:
          Number(sectorId),

        fecha: new Date(
          `${fecha}T12:00:00`,
        ).toISOString(),

        familiaNumero:
          familiaNumero
            ? Number(familiaNumero)
            : undefined,

        rondaNumero:
          rondaNumero
            ? Number(rondaNumero)
            : undefined,

        decisionGestion,

        fortalezas:
          fortalezas || undefined,

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
            (criterio) => ({
              criterioId:
                criterio.id,
              puntuacion:
                puntuaciones[
                  criterio.id
                ],
            }),
          ),
      });

      navigate('/supervisiones');
    } catch (error) {
      console.error(error);

      setError(
        'No se pudo guardar la supervisión.',
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando formulario...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Nueva supervisión
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Formulario de supervisión del agente sanitario.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* DATOS GENERALES */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          1. Identificación
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <CampoSelect
            label="Agente sanitario"
            value={agenteId}
            onChange={setAgenteId}
          >
            <option value="">
              Seleccione un agente
            </option>

            {agentes.map((agente) => (
              <option
                key={agente.id}
                value={agente.id}
              >
                {agente.apellido},{' '}
                {agente.nombre}
              </option>
            ))}
          </CampoSelect>

          <CampoTexto
            label="Área operativa"
            value={
              agenteSeleccionado
                ?.areaOperativa?.nombre ??
              ''
            }
            readOnly
          />

          <CampoSelect
            label="Sector"
            value={sectorId}
            onChange={setSectorId}
            disabled={!agenteSeleccionado}
          >
            <option value="">
              Seleccione un sector
            </option>

            {sectores.map((sector) => (
              <option
                key={sector.id}
                value={sector.id}
              >
                {sector.nombre ??
                  `Sector ${sector.numero}`}
              </option>
            ))}
          </CampoSelect>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </div>

          <CampoTexto
            label="Familia N°"
            value={familiaNumero}
            onChange={setFamiliaNumero}
            type="number"
          />

          <CampoTexto
            label="Ronda N°"
            value={rondaNumero}
            onChange={setRondaNumero}
            type="number"
          />

        </div>
      </section>

      {/* EVALUACIÓN */}

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            2. Evaluación
          </h2>

          <p className="text-sm text-slate-500">
            1 = Muy deficiente · 2 = Deficiente ·
            3 = Regular · 4 = Bueno ·
            5 = Excelente
          </p>
        </div>

        {bloques.map((bloque) => (
          <div
            key={bloque.id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 font-semibold text-slate-800">
              {bloque.nombre}
            </h3>

            <div className="divide-y divide-slate-100">
              {bloque.criterios.map(
                (criterio) => (
                  <div
                    key={criterio.id}
                    className="py-4"
                  >
                    <p className="mb-3 text-sm font-medium text-slate-700">
                      {criterio.nombre}
                    </p>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(
                        (valor) => (
                          <button
                            key={valor}
                            type="button"
                            onClick={() =>
                              handlePuntuacion(
                                criterio.id,
                                valor,
                              )
                            }
                            className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                              puntuaciones[
                                criterio.id
                              ] === valor
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {valor}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </section>

      {/* OBSERVACIONES */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          3. Observaciones del supervisor
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <AreaTexto
            label="Fortalezas observadas"
            value={fortalezas}
            onChange={setFortalezas}
          />

          <AreaTexto
            label="Oportunidades de mejora"
            value={oportunidadesMejora}
            onChange={
              setOportunidadesMejora
            }
          />

          <AreaTexto
            label="Situaciones críticas detectadas"
            value={situacionesCriticas}
            onChange={
              setSituacionesCriticas
            }
          />

          <AreaTexto
            label="Recomendaciones"
            value={recomendaciones}
            onChange={setRecomendaciones}
          />

        </div>
      </section>

      {/* DECISIÓN */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          4. Decisión de gestión
        </h2>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          ¿Requiere intervención?
        </label>

        <select
          value={decisionGestion}
          onChange={(e) =>
            setDecisionGestion(
              e.target
                .value as DecisionGestion,
            )
          }
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5"
        >
          <option value="NO_REQUIERE">
            No requiere
          </option>

          <option value="SEGUIMIENTO">
            Seguimiento
          </option>

          <option value="CAPACITACION">
            Capacitación
          </option>

          <option value="SUPERVISION_INTENSIVA">
            Supervisión intensiva
          </option>
        </select>
      </section>

      {/* RESULTADO */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          5. Resultado general
        </h2>

        {promedio === null ? (
          <p className="text-sm text-slate-500">
            Complete la evaluación para obtener el resultado.
          </p>
        ) : (
          <div className="flex flex-wrap gap-8">

            <div>
              <p className="text-sm text-slate-500">
                Promedio
              </p>

              <p className="text-3xl font-bold text-slate-800">
                {promedio.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Clasificación
              </p>

              <p className="text-xl font-bold text-slate-800">
                {clasificacion}
              </p>
            </div>

          </div>
        )}
      </section>

      {/* BOTONES */}

      <div className="flex justify-end gap-3 pb-10">

        <button
          type="button"
          onClick={() =>
            navigate('/supervisiones')
          }
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            guardando ||
            !formularioCompleto
          }
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar supervisión'}
        </button>

      </div>
    </form>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  readOnly = false,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        readOnly={readOnly}
        min={type === 'number' ? 1 : undefined}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 ${
          readOnly
            ? 'bg-slate-100 text-slate-600'
            : 'bg-white'
        }`}
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
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 disabled:bg-slate-100"
      >
        {children}
      </select>
    </div>
  );
}

function AreaTexto({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        rows={4}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
      />
    </div>
  );
}