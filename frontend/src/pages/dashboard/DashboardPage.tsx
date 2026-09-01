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
  obtenerSupervisiones,
} from '../../services/supervisiones.service';

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  SupervisionListado,
} from '../../types/supervision';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [agentes, setAgentes] =
    useState<AgenteSanitario[]>([]);

  const [supervisiones, setSupervisiones] =
    useState<SupervisionListado[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError('');

        const [
          agentesData,
          supervisionesData,
        ] = await Promise.all([
          obtenerAgentes(),
          obtenerSupervisiones(),
        ]);

        setAgentes(agentesData);

        setSupervisiones(
          supervisionesData,
        );
      } catch (error) {
        console.error(error);

        setError(
          'No se pudieron cargar los datos del dashboard.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const agentesActivos =
    useMemo(() => {
      return agentes.filter(
        (agente) => agente.activo,
      ).length;
    }, [agentes]);

  const promedioGeneral =
    useMemo(() => {
      if (
        supervisiones.length === 0
      ) {
        return 0;
      }

      const valores =
        supervisiones
          .map((supervision) =>
            Number(
              supervision.promedio,
            ),
          )
          .filter(
            (promedio) =>
              !Number.isNaN(promedio),
          );

      if (valores.length === 0) {
        return 0;
      }

      const suma =
        valores.reduce(
          (acumulado, valor) =>
            acumulado + valor,
          0,
        );

      return suma / valores.length;
    }, [supervisiones]);

  const estadisticasClasificacion =
    useMemo(() => {
      return {
        CRITICO:
          supervisiones.filter(
            (supervision) =>
              supervision.clasificacion ===
              'CRITICO',
          ).length,

        REGULAR:
          supervisiones.filter(
            (supervision) =>
              supervision.clasificacion ===
              'REGULAR',
          ).length,

        BUENO:
          supervisiones.filter(
            (supervision) =>
              supervision.clasificacion ===
              'BUENO',
          ).length,

        EXCELENTE:
          supervisiones.filter(
            (supervision) =>
              supervision.clasificacion ===
              'EXCELENTE',
          ).length,
      };
    }, [supervisiones]);

  const ultimasSupervisiones =
    useMemo(() => {
      return [...supervisiones]
        .sort(
          (a, b) =>
            new Date(
              b.fecha,
            ).getTime() -
            new Date(
              a.fecha,
            ).getTime(),
        )
        .slice(0, 5);
    }, [supervisiones]);

  if (cargando) {
    return (
      <div className="text-slate-500">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ENCABEZADO */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Resumen general del sistema
          de supervisión.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TARJETAS PRINCIPALES */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <TarjetaResumen
          titulo="Agentes"
          valor={agentes.length}
          descripcion="Registrados"
        />

        <TarjetaResumen
          titulo="Agentes activos"
          valor={agentesActivos}
          descripcion="Actualmente activos"
        />

        <TarjetaResumen
          titulo="Supervisiones"
          valor={
            supervisiones.length
          }
          descripcion="Realizadas"
        />

        <TarjetaResumen
          titulo="Promedio general"
          valor={
            supervisiones.length >
            0
              ? promedioGeneral.toFixed(
                  2,
                )
              : '-'
          }
          descripcion="Resultado promedio"
        />

      </section>

      {/* CLASIFICACIONES */}

      <section>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Resultados de las
            supervisiones
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Distribución según la
            clasificación obtenida.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <TarjetaClasificacion
            titulo="Crítico"
            valor={
              estadisticasClasificacion.CRITICO
            }
            estilo="bg-red-50 text-red-700 border-red-200"
          />

          <TarjetaClasificacion
            titulo="Regular"
            valor={
              estadisticasClasificacion.REGULAR
            }
            estilo="bg-amber-50 text-amber-700 border-amber-200"
          />

          <TarjetaClasificacion
            titulo="Bueno"
            valor={
              estadisticasClasificacion.BUENO
            }
            estilo="bg-blue-50 text-blue-700 border-blue-200"
          />

          <TarjetaClasificacion
            titulo="Excelente"
            valor={
              estadisticasClasificacion.EXCELENTE
            }
            estilo="bg-green-50 text-green-700 border-green-200"
          />

        </div>

      </section>

      {/* ACCESOS RÁPIDOS */}

      <section>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Accesos rápidos
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <AccesoRapido
            titulo="Nueva supervisión"
            descripcion="Registrar una nueva evaluación."
            onClick={() =>
              navigate(
                '/supervisiones/nueva',
              )
            }
          />

          <AccesoRapido
            titulo="Agentes sanitarios"
            descripcion="Consultar agentes registrados."
            onClick={() =>
              navigate('/agentes')
            }
          />

          <AccesoRapido
            titulo="Historial"
            descripcion="Consultar supervisiones realizadas."
            onClick={() =>
              navigate(
                '/supervisiones',
              )
            }
          />

        </div>

      </section>

      {/* ÚLTIMAS SUPERVISIONES */}

      <section>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Últimas supervisiones
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Supervisiones más
              recientes registradas.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                '/supervisiones',
              )
            }
            className="self-start text-sm font-semibold text-blue-600 hover:text-blue-800 sm:self-auto"
          >
            Ver todas
          </button>

        </div>

        {ultimasSupervisiones.length ===
        0 ? (

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Todavía no hay
            supervisiones registradas.
          </div>

        ) : (

          <div className="grid gap-4">

            {ultimasSupervisiones.map(
              (supervision) => (

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
                  className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="font-semibold text-slate-800">
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

                      <p className="mt-1 text-sm text-slate-500">
                        {formatearFecha(
                          supervision.fecha,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          supervision
                            .areaOperativa
                            .nombre
                        }
                      </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <div>
                        <p className="text-xs text-slate-400">
                          Promedio
                        </p>

                        <p className="text-xl font-bold text-slate-800">
                          {Number(
                            supervision.promedio ??
                              0,
                          ).toFixed(2)}
                        </p>
                      </div>

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

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
}: {
  titulo: string;
  valor: string | number;
  descripcion: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-800">
        {valor}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {descripcion}
      </p>

    </div>
  );
}

function TarjetaClasificacion({
  titulo,
  valor,
  estilo,
}: {
  titulo: string;
  valor: number;
  estilo: string;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${estilo}`}
    >

      <p className="text-sm font-medium">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {valor}
      </p>

      <p className="mt-1 text-xs opacity-70">
        supervisión(es)
      </p>

    </div>
  );
}

function AccesoRapido({
  titulo,
  descripcion,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
    >
      <p className="font-semibold text-slate-800">
        {titulo}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {descripcion}
      </p>

      <p className="mt-4 text-sm font-semibold text-blue-600">
        Abrir →
      </p>
    </button>
  );
}

function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion?: string | null;
}) {
  if (!clasificacion) {
    return (
      <span className="text-sm text-slate-400">
        Sin clasificación
      </span>
    );
  }

  const estilos: Record<
    string,
    string
  > = {
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