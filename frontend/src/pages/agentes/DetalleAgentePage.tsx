import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  actualizarAgente,
  cambiarEstadoAgente,
  obtenerAgente,
} from '../../services/agentes.service';

import {
  obtenerMisSupervisiones,
  obtenerSupervisionesPorAgente,
} from '../../services/supervisiones.service';

import {
  obtenerAreasOperativas,
} from '../../services/areas-operativas.service';

import type {
  AreaOperativa,
} from '../../services/areas-operativas.service';

import {
  useAuth,
} from '../../context/AuthContext';

import type {
  AgenteSanitario,
} from '../../types/agente';

import type {
  SupervisionListado,
} from '../../types/supervision';

export default function DetalleAgentePage() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const { usuario } =
    useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  const [
    agente,
    setAgente,
  ] =
    useState<AgenteSanitario | null>(
      null,
    );

  const [
    supervisiones,
    setSupervisiones,
  ] =
    useState<
      SupervisionListado[]
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
   * EDICIÓN
   */

  const [
    editando,
    setEditando,
  ] = useState(false);

  const [
    nombre,
    setNombre,
  ] = useState('');

  const [
    apellido,
    setApellido,
  ] = useState('');

  const [
    documento,
    setDocumento,
  ] = useState('');

  const [
    legajo,
    setLegajo,
  ] = useState('');

  const [
    areas,
    setAreas,
  ] =
    useState<
      AreaOperativa[]
    >([]);

  const [
    areaOperativaId,
    setAreaOperativaId,
  ] = useState('');

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    errorEdicion,
    setErrorEdicion,
  ] = useState('');

  const [
    mensaje,
    setMensaje,
  ] = useState('');

  const [
    cambiandoEstado,
    setCambiandoEstado,
  ] = useState(false);

  useEffect(() => {
    const cargar =
      async () => {
        if (!id) {
          setError(
            'No se indicó un agente.',
          );

          setCargando(false);

          return;
        }

        try {
          setCargando(true);
          setError('');

          const agenteId =
            Number(id);

          /*
           * CARGAMOS AGENTE
           * Y ÁREAS OPERATIVAS
           */

          const [
            agenteData,
            areasData,
          ] =
            await Promise.all([
              obtenerAgente(
                agenteId,
              ),
              obtenerAreasOperativas(),
            ]);

          setAgente(
            agenteData,
          );

          /*
           * Dejamos solamente
           * áreas activas.
           *
           * Si activo no viene,
           * también la mostramos.
           */

          setAreas(
            areasData.filter(
              area =>
                area.activo !==
                false,
            ),
          );

          cargarFormulario(
            agenteData,
          );

          /*
           * ADMIN:
           * historial completo
           * del agente.
           *
           * SUPERVISOR:
           * solamente sus propias
           * supervisiones.
           */

          if (esAdmin) {
            const supervisionesData =
              await obtenerSupervisionesPorAgente(
                agenteId,
              );

            setSupervisiones(
              supervisionesData,
            );
          } else {
            const misSupervisiones =
              await obtenerMisSupervisiones();

            const delAgente =
              misSupervisiones.filter(
                supervision =>
                  supervision
                    .agenteSanitario
                    .id ===
                  agenteId,
              );

            setSupervisiones(
              delAgente,
            );
          }
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
  }, [id, esAdmin]);

  const cargarFormulario = (
    datos: AgenteSanitario,
  ) => {
    setNombre(
      datos.nombre,
    );

    setApellido(
      datos.apellido,
    );

    setDocumento(
      datos.documento ?? '',
    );

    setLegajo(
      datos.legajo ?? '',
    );

    setAreaOperativaId(
      String(
        datos.areaOperativaId,
      ),
    );
  };

  const handleEditar = () => {
    if (!agente) {
      return;
    }

    cargarFormulario(
      agente,
    );

    setErrorEdicion('');
    setMensaje('');
    setEditando(true);
  };

  const handleCancelar = () => {
    if (agente) {
      cargarFormulario(
        agente,
      );
    }

    setErrorEdicion('');
    setMensaje('');
    setEditando(false);
  };

  const handleGuardar =
    async () => {
      if (!agente) {
        return;
      }

      const nombreLimpio =
        nombre.trim();

      const apellidoLimpio =
        apellido.trim();

      if (!nombreLimpio) {
        setErrorEdicion(
          'El nombre es obligatorio.',
        );

        return;
      }

      if (!apellidoLimpio) {
        setErrorEdicion(
          'El apellido es obligatorio.',
        );

        return;
      }

      if (!areaOperativaId) {
        setErrorEdicion(
          'Debe seleccionar un área operativa.',
        );

        return;
      }

      try {
        setGuardando(true);
        setErrorEdicion('');
        setMensaje('');

        const actualizado =
          await actualizarAgente(
            agente.id,
            {
              nombre:
                nombreLimpio,

              apellido:
                apellidoLimpio,

              documento:
                documento.trim(),

              legajo:
                legajo.trim(),

              areaOperativaId:
                Number(
                  areaOperativaId,
                ),
            },
          );

        setAgente(
          actualizado,
        );

        cargarFormulario(
          actualizado,
        );

        setEditando(false);

        setMensaje(
          'Los datos del agente se actualizaron correctamente.',
        );
      } catch (error: any) {
        console.error(error);

        const mensajeBackend =
          error.response?.data
            ?.message;

        if (
          Array.isArray(
            mensajeBackend,
          )
        ) {
          setErrorEdicion(
            mensajeBackend.join(
              ', ',
            ),
          );
        } else {
          setErrorEdicion(
            mensajeBackend ||
              'No se pudieron actualizar los datos del agente.',
          );
        }
      } finally {
        setGuardando(false);
      }
    };

    const handleCambiarEstado =
      async () => {
        if (!agente) {
          return;
        }

        const nuevoEstado =
          !agente.activo;

        /*
        * Para DESACTIVAR pedimos
        * confirmación.
        *
        * Para ACTIVAR no hace falta.
        */
        if (!nuevoEstado) {
          const confirmado =
            window.confirm(
              `¿Está seguro de que desea desactivar al agente ${agente.nombre} ${agente.apellido}?`,
            );

          if (!confirmado) {
            return;
          }
        }

        try {
          setCambiandoEstado(true);
          setErrorEdicion('');
          setMensaje('');

          const actualizado =
            await cambiarEstadoAgente(
              agente.id,
              nuevoEstado,
            );

       /*
       * Actualizamos el agente
       * localmente.
       *
       * No hace falta recargar
       * toda la página.
       */
          setAgente(
            actualizado,
          );

          if (nuevoEstado) {
            setMensaje(
              'El agente fue activado correctamente.',
            );
          } else {
            setMensaje(
              'El agente fue desactivado correctamente.',
            );
          }
        } catch (error: any) {
          console.error(error);

          const mensajeBackend =
            error.response?.data
              ?.message;

          if (
            Array.isArray(
              mensajeBackend,
            )
          ) {
            setErrorEdicion(
              mensajeBackend.join(
                ', ',
              ),
            );
          } else {
            setErrorEdicion(
              mensajeBackend ||
                'No se pudo cambiar el estado del agente.',
            );
          }
        } finally {
          setCambiandoEstado(
            false,
          );
        }
      };

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
            navigate(
              '/agentes',
            )
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

      {/* ENCABEZADO */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {agente.apellido},{' '}
            {agente.nombre}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Datos e historial del agente sanitario
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          {!editando && (
            <>
              <button
              type="button"
              onClick={
                handleEditar
              }
              disabled={
                cambiandoEstado
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Editar datos
            </button>

            <button
              type="button"
              onClick={
                handleCambiarEstado
              }
              disabled={
                cambiandoEstado
              }
              className={
                agente.activo
                  ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                  : 'rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
              }
            >
              {cambiandoEstado
                ? 'Procesando...'
                : agente.activo
                ? 'Desactivar agente'
                : 'Activar agente'}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() =>
            navigate(
              '/agentes',
            )
          }
          disabled={
            cambiandoEstado
          }
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Volver
        </button>

</div>
      </div>

      {/* MENSAJES */}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {errorEdicion && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorEdicion}
        </div>
      )}

      {/* DATOS DEL AGENTE */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h2 className="text-lg font-semibold text-slate-800">
            Datos del agente
          </h2>

          {editando && (
            <span className="text-sm font-medium text-blue-600">
              Modo edición
            </span>
          )}

        </div>

        {editando ? (

          <div className="space-y-5">

            <div className="grid gap-5 sm:grid-cols-2">

              <Campo
                label="Nombre"
                value={nombre}
                onChange={
                  setNombre
                }
                requerido
              />

              <Campo
                label="Apellido"
                value={
                  apellido
                }
                onChange={
                  setApellido
                }
                requerido
              />

              <Campo
                label="Documento"
                value={
                  documento
                }
                onChange={
                  setDocumento
                }
              />

              <Campo
                label="Legajo"
                value={legajo}
                onChange={
                  setLegajo
                }
              />

              {/* ÁREA OPERATIVA */}

              <label className="block sm:col-span-2">

                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Área operativa

                  <span className="text-red-500">
                    {' '}*
                  </span>
                </span>

                <select
                  value={
                    areaOperativaId
                  }
                  onChange={event =>
                    setAreaOperativaId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Seleccione un área operativa
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

              </label>

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  handleCancelar
                }
                disabled={
                  guardando
                }
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  handleGuardar
                }
                disabled={
                  guardando
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando
                  ? 'Guardando...'
                  : 'Guardar cambios'}
              </button>

            </div>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <Dato
              label="Documento"
              valor={
                agente.documento ??
                '-'
              }
            />

            <Dato
              label="Legajo"
              valor={
                agente.legajo ??
                '-'
              }
            />

            <Dato
              label="Área operativa"
              valor={
                agente
                  .areaOperativa
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
        )}

      </section>

      {/* SUPERVISIONES */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-slate-800">
            {esAdmin
              ? 'Supervisiones'
              : 'Mis supervisiones a este agente'}
          </h2>

          <p className="text-sm text-slate-500">
            {supervisiones.length}{' '}
            supervisión(es) registrada(s).
          </p>

        </div>

        {supervisiones.length ===
        0 ? (

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">

            {esAdmin
              ? 'El agente todavía no tiene supervisiones.'
              : 'Usted todavía no ha supervisado a este agente.'}

          </div>

        ) : (

          <div className="grid gap-4">

            {supervisiones.map(
              supervision => (

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
                        supervision
                          .promedio ??
                          0,
                      ).toFixed(
                        2,
                      )}
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

            ))}

          </div>
        )}

      </section>

    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  requerido = false,
}: {
  label: string;
  value: string;
  onChange: (
    valor: string,
  ) => void;
  requerido?: boolean;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}

        {requerido && (
          <span className="text-red-500">
            {' '}*
          </span>
        )}
      </span>

      <input
        type="text"
        value={value}
        onChange={event =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

    </label>
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
  clasificacion?:
    string | null;
}) {
  if (!clasificacion) {
    return <span>-</span>;
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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
  ).format(
    new Date(fecha),
  );
}