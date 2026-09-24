import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import type {
  UsuarioAdmin,
} from '../../types/usuario';

import {
  obtenerUsuarios,
} from '../../services/usuarios.service';

export default function UsuariosPage() {
  const navigate = useNavigate();

  const [
    usuarios,
    setUsuarios,
  ] = useState<UsuarioAdmin[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarUsuarios =
      async () => {
        try {
          const datos =
            await obtenerUsuarios();

          if (!activo) {
            return;
          }

          setUsuarios(datos);
        } catch (error) {
          console.error(error);

          if (!activo) {
            return;
          }

          setError(
            'No se pudieron cargar los usuarios.',
          );
        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      };

    void cargarUsuarios();

    return () => {
      activo = false;
    };
  }, []);

  const totalUsuarios =
    usuarios.length;

  const usuariosActivos =
    usuarios.filter(
      usuario => usuario.activo,
    ).length;

  const supervisores =
    usuarios.filter(
      usuario =>
        usuario.rol ===
        'SUPERVISOR',
    ).length;

  const administradores =
    usuarios.filter(
      usuario =>
        usuario.rol === 'ADMIN',
    ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            Administración
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Usuarios
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Administre las cuentas con
            acceso al sistema, sus roles,
            áreas operativas y estado.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/admin/usuarios/nuevo',
            )
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:self-auto"
        >
          <IconoAgregar />

          Nuevo usuario
        </button>
      </section>

      {/* RESUMEN */}
      {!cargando &&
        !error && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaResumen
              titulo="Usuarios"
              valor={totalUsuarios}
              descripcion="Cuentas registradas"
              icono={
                <IconoUsuarios />
              }
              estilo="azul"
            />

            <TarjetaResumen
              titulo="Activos"
              valor={usuariosActivos}
              descripcion="Con acceso habilitado"
              icono={
                <IconoActivo />
              }
              estilo="verde"
            />

            <TarjetaResumen
              titulo="Supervisores"
              valor={supervisores}
              descripcion="Usuarios territoriales"
              icono={
                <IconoSupervisor />
              }
              estilo="celeste"
            />

            <TarjetaResumen
              titulo="Administradores"
              valor={administradores}
              descripcion="Gestión del sistema"
              icono={
                <IconoAdministrador />
              }
              estilo="violeta"
            />
          </section>
        )}

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <div className="mt-0.5 shrink-0">
            <IconoAlerta />
          </div>

          <div>
            <p className="font-semibold">
              No se pudo cargar el
              listado
            </p>

            <p className="mt-0.5 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* LISTADO */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900 sm:text-lg">
              Usuarios registrados
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cuentas habilitadas para
              acceder y operar dentro del
              sistema.
            </p>
          </div>

          {!cargando &&
            usuarios.length >
              0 && (
              <span className="inline-flex self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:self-auto">
                {totalUsuarios}{' '}
                {totalUsuarios === 1
                  ? 'usuario'
                  : 'usuarios'}
              </span>
            )}
        </div>

        {cargando ? (
          <UsuariosSkeleton />
        ) : usuarios.length ===
          0 ? (
          <EstadoVacio
            onCrear={() =>
              navigate(
                '/admin/usuarios/nuevo',
              )
            }
          />
        ) : (
          <>
            {/* ESCRITORIO */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Usuario
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rol
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Área operativa
                    </th>

                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {usuarios.map(
                    usuario => (
                      <tr
                        key={
                          usuario.id
                        }
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <AvatarUsuario
                              nombre={
                                usuario.nombre
                              }
                              apellido={
                                usuario.apellido
                              }
                            />

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">
                                {
                                  usuario.apellido
                                }
                                ,{' '}
                                {
                                  usuario.nombre
                                }
                              </p>

                              <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
                                {
                                  usuario.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <RolBadge
                            rol={
                              usuario.rol
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          {usuario.rol ===
                          'SUPERVISOR' ? (
                            <div className="flex items-center gap-2 text-slate-600">
                              <span className="text-slate-400">
                                <IconoUbicacion />
                              </span>

                              <span className="max-w-[220px] truncate">
                                {usuario
                                  .areaOperativa
                                  ?.nombre ??
                                  'Sin área'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              No corresponde
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <EstadoBadge
                            activo={
                              usuario.activo
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/usuarios/${usuario.id}`,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <IconoEditar />

                            Modificar
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* MÓVIL */}
            <div className="divide-y divide-slate-100 md:hidden">
              {usuarios.map(
                usuario => (
                  <article
                    key={
                      usuario.id
                    }
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <AvatarUsuario
                        nombre={
                          usuario.nombre
                        }
                        apellido={
                          usuario.apellido
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800">
                          {
                            usuario.apellido
                          }
                          ,{' '}
                          {
                            usuario.nombre
                          }
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {usuario.email}
                        </p>
                      </div>

                      <EstadoBadge
                        activo={
                          usuario.activo
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <DatoMovil
                        label="Rol"
                        valor={
                          <RolBadge
                            rol={
                              usuario.rol
                            }
                          />
                        }
                      />

                      <DatoMovil
                        label="Área operativa"
                        valor={
                          <span className="text-sm font-medium text-slate-700">
                            {usuario.rol ===
                            'SUPERVISOR'
                              ? usuario
                                  .areaOperativa
                                  ?.nombre ??
                                'Sin área'
                              : 'No corresponde'}
                          </span>
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/usuarios/${usuario.id}`,
                        )
                      }
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <IconoEditar />

                      Modificar usuario
                    </button>
                  </article>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* =========================================================
 * COMPONENTES
 * ======================================================= */

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
  icono,
  estilo,
}: {
  titulo: string;
  valor: number;
  descripcion: string;
  icono: React.ReactNode;
  estilo:
    | 'azul'
    | 'verde'
    | 'celeste'
    | 'violeta';
}) {
  const estilos = {
    azul: {
      icono:
        'bg-blue-50 text-blue-600',
    },

    verde: {
      icono:
        'bg-emerald-50 text-emerald-600',
    },

    celeste: {
      icono:
        'bg-cyan-50 text-cyan-600',
    },

    violeta: {
      icono:
        'bg-violet-50 text-violet-600',
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {titulo}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {valor}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {descripcion}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${estilos[estilo].icono}`}
        >
          {icono}
        </div>
      </div>
    </div>
  );
}

function AvatarUsuario({
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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-4 ring-slate-100">
      {iniciales || 'U'}
    </div>
  );
}

function RolBadge({
  rol,
}: {
  rol: string;
}) {
  if (rol === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

        Administrador
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

      Supervisor
    </span>
  );
}

function EstadoBadge({
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
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
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
  valor: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      {valor}
    </div>
  );
}

function EstadoVacio({
  onCrear,
}: {
  onCrear: () => void;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <IconoUsuarios className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        No hay usuarios registrados
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Cree la primera cuenta para
        comenzar a administrar el acceso
        al sistema.
      </p>

      <button
        type="button"
        onClick={onCrear}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <IconoAgregar />

        Nuevo usuario
      </button>
    </div>
  );
}

function UsuariosSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map(
        item => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-4 px-6 py-5"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-slate-200" />

              <div className="mt-2 h-3 w-56 max-w-full rounded bg-slate-100" />
            </div>

            <div className="hidden h-7 w-24 rounded-full bg-slate-100 sm:block" />

            <div className="hidden h-8 w-20 rounded bg-slate-100 md:block" />
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

function IconoAgregar({
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
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

function IconoUsuarios({
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
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path
        strokeLinecap="round"
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

function IconoActivo({
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
        cy="12"
        r="9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 12 2.5 2.5L16 9"
      />
    </svg>
  );
}

function IconoSupervisor({
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
        d="M5 21c.6-4 3-6 7-6s6.4 2 7 6"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m17 12 1.5 1.5L21 11"
      />
    </svg>
  );
}

function IconoAdministrador({
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
        d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  );
}

function IconoUbicacion({
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
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function IconoEditar({
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
        d="M12 20h9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
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