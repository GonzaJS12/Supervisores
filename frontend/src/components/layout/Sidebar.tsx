import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardPlus,
  ClipboardList,
  FileCheck2,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Users,
  UserRound,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  abierto: boolean;
  cerrar: () => void;
}

function linkClass({ isActive }: { isActive: boolean }) {
  return `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-150 ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
  }`;
}

function NavItem({
  to,
  end,
  onClick,
  icon: Icon,
  children,
}: {
  to: string;
  end?: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  children: ReactNode;
}) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className={linkClass}>
      {({ isActive }) => (
        <>
          <Icon
            className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="truncate">{children}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ abierto, cerrar }: SidebarProps) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const handleLogout = () => {
    cerrar();
    logout();
    navigate('/login', { replace: true });
  };

  const rolLabel =
    usuario?.rol === 'ADMIN' ? 'Administrador' : 'Supervisor';

  return (
    <>
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] transition lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white shadow-xl transition-transform duration-200 ease-out lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Shield className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">
                Supervisión Sanitaria
              </p>
              <p className="truncate text-[11px] text-slate-400">
                Panel de gestión
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Principal
          </p>

          <NavItem to="/dashboard" onClick={cerrar} icon={LayoutDashboard}>
            Inicio
          </NavItem>
          <NavItem to="/agentes" onClick={cerrar} icon={UserRound}>
            Agentes
          </NavItem>
          <NavItem
            to="/supervisiones"
            end
            onClick={cerrar}
            icon={ClipboardList}
          >
            {esAdmin ? 'Todas las supervisiones' : 'Mis supervisiones'}
          </NavItem>
          <NavItem
            to="/supervisiones/nueva"
            onClick={cerrar}
            icon={ClipboardPlus}
          >
            Nueva supervisión
          </NavItem>

          {esAdmin && (
            <div className="pt-5">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Administración
              </p>

              <NavItem to="/admin/usuarios" onClick={cerrar} icon={Users}>
                Usuarios
              </NavItem>
              <NavItem to="/admin/territorio" onClick={cerrar} icon={MapPinned}>
                Territorio
              </NavItem>
              <NavItem to="/admin/bloques" onClick={cerrar} icon={Layers}>
                Bloques de evaluación
              </NavItem>
              <NavItem
                to="/admin/criterios"
                onClick={cerrar}
                icon={FileCheck2}
              >
                Criterios
              </NavItem>
            </div>
          )}
        </nav>

        <div className="border-t border-slate-800/80 p-3">
          <div className="mb-2 rounded-lg bg-slate-800/60 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{rolLabel}</p>
            {usuario?.areaOperativa?.nombre ? (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {usuario.areaOperativa.nombre}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
