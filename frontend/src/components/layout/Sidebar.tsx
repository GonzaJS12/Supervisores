import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  abierto: boolean;
  cerrar: () => void;
}

export default function Sidebar({
  abierto,
  cerrar,
}: SidebarProps) {
  const { usuario, logout } = useAuth();

  const esAdmin = usuario?.rol === 'ADMIN';

  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `block rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const handleLogout = () => {
    cerrar();
    logout();
  };

  return (
    <>
      {/* Fondo oscuro móvil */}
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrar}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-slate-900 text-white
          transition-transform duration-200
          lg:translate-x-0
          ${
            abierto
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <div className="flex h-full flex-col">

          <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">

            <div>
              <h1 className="text-lg font-bold">
                Supervisión
              </h1>

              <p className="text-xs text-slate-400">
                Sanitaria
              </p>
            </div>

            <button
              type="button"
              onClick={cerrar}
              className="text-xl text-slate-400 hover:text-white lg:hidden"
            >
              ×
            </button>

          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">

            <NavLink
              to="/dashboard"
              onClick={cerrar}
              className={linkClass}
            >
              Inicio
            </NavLink>

            <NavLink
              to="/agentes"
              onClick={cerrar}
              className={linkClass}
            >
              Agentes
            </NavLink>

            <NavLink
              to="/supervisiones"
              onClick={cerrar}
              className={linkClass}
            >
              Supervisiones
            </NavLink>

            <NavLink
              to="/supervisiones/nueva"
              onClick={cerrar}
              className={linkClass}
            >
              Nueva supervisión
            </NavLink>

            {esAdmin && (
              <div className="pt-6">

                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Administración
                </p>

                <NavLink
                  to="/admin/usuarios"
                  onClick={cerrar}
                  className={linkClass}
                >
                  Usuarios
                </NavLink>

                <NavLink
                  to="/admin/bloques"
                  onClick={cerrar}
                  className={linkClass}
                >
                  Bloques de evaluación
                </NavLink>

                <NavLink
                  to="/admin/criterios"
                  onClick={cerrar}
                  className={linkClass}
                >
                  Criterios
                </NavLink>

              </div>
            )}

          </nav>

          <div className="border-t border-slate-800 p-4">

            <div className="mb-3 px-2">
              <p className="text-sm font-medium">
                {usuario?.nombre}{' '}
                {usuario?.apellido}
              </p>

              <p className="text-xs text-slate-400">
                {usuario?.rol}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-4 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cerrar sesión
            </button>

          </div>

        </div>
      </aside>
    </>
  );
}