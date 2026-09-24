import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/useAuth';

interface SidebarProps {
  abierto: boolean;
  cerrar: () => void;
}

interface IconoProps {
  className?: string;
}

function IconoInicio({
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
        d="M3 11.5 12 4l9 7.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 10v10h13V10"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 20v-6h5v6"
      />
    </svg>
  );
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

function IconoSupervisiones({
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
        d="M8 5.5h8"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6v4H9z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 13 2 2 5-5"
      />
    </svg>
  );
}

function IconoNueva({
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
        d="M12 5v14M5 12h14"
      />

      <circle
        cx="12"
        cy="12"
        r="9"
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
      <circle cx="9" cy="8" r="3" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19c.4-3.4 2.3-5.5 5.5-5.5s5.1 2.1 5.5 5.5"
      />

      <circle cx="17" cy="9" r="2" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 14c2.8 0 4.3 1.7 4.5 4"
      />
    </svg>
  );
}

function IconoBloques({
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
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
    </svg>
  );
}

function IconoCriterios({
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
        d="M9 6h11M9 12h11M9 18h11"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
      />
    </svg>
  );
}

function IconoSalir({
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
        d="M14 8V5H5v14h9v-3"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 12h10m-3-3 3 3-3 3"
      />
    </svg>
  );
}

export default function Sidebar({
  abierto,
  cerrar,
}: SidebarProps) {
  const { usuario, logout } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    [
      'group flex items-center gap-3 rounded-xl px-3 py-2.5',
      'text-sm font-medium transition',
      isActive
        ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
        : 'text-slate-400 hover:bg-white/5 hover:text-white',
    ].join(' ');

  const handleLogout = () => {
    cerrar();
    logout();
  };

  const iniciales = `${usuario?.nombre?.[0] ?? ''}${
    usuario?.apellido?.[0] ?? ''
  }`.toUpperCase();

  return (
    <>
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrar}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-slate-950 text-white
          shadow-2xl shadow-slate-950/20
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${
            abierto
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <div className="flex h-full flex-col">
          {/* MARCA */}
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-300/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6 text-cyan-300"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v18M3 12h18"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-white">
                  Supervisión
                </p>

                <p className="truncate text-xs text-slate-500">
                  Agentes Sanitarios
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar menú"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Principal
            </p>

            <div className="space-y-1">
              <NavLink
                to="/dashboard"
                onClick={cerrar}
                className={linkClass}
              >
                <IconoInicio />
                <span>Inicio</span>
              </NavLink>

              <NavLink
                to="/agentes"
                onClick={cerrar}
                className={linkClass}
              >
                <IconoAgentes />
                <span>Agentes</span>
              </NavLink>

              <NavLink
                to="/supervisiones"
                onClick={cerrar}
                className={linkClass}
              >
                <IconoSupervisiones />

                <span>
                  {esAdmin
                    ? 'Supervisiones'
                    : 'Mis supervisiones'}
                </span>
              </NavLink>

              <NavLink
                to="/supervisiones/nueva"
                onClick={cerrar}
                className={linkClass}
              >
                <IconoNueva />
                <span>Nueva supervisión</span>
              </NavLink>
            </div>

            {esAdmin && (
              <div className="mt-7 border-t border-white/5 pt-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Administración
                </p>

                <div className="space-y-1">
                  <NavLink
                    to="/admin/usuarios"
                    onClick={cerrar}
                    className={linkClass}
                  >
                    <IconoUsuarios />
                    <span>Usuarios</span>
                  </NavLink>

                  <NavLink
                    to="/admin/bloques"
                    onClick={cerrar}
                    className={linkClass}
                  >
                    <IconoBloques />

                    <span>
                      Bloques de evaluación
                    </span>
                  </NavLink>

                  <NavLink
                    to="/admin/criterios"
                    onClick={cerrar}
                    className={linkClass}
                  >
                    <IconoCriterios />
                    <span>Criterios</span>
                  </NavLink>
                </div>
              </div>
            )}
          </nav>

          {/* USUARIO */}
          <div className="shrink-0 border-t border-white/10 p-3">
            <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200 ring-1 ring-white/10">
                {iniciales || 'U'}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">
                  {usuario?.nombre}{' '}
                  {usuario?.apellido}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {esAdmin
                    ? 'Administrador'
                    : 'Supervisor'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <IconoSalir />

              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}