import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  abrirSidebar: () => void;
}

interface RouteMeta {
  title: string;
  parent?: { label: string; to: string };
}

function resolveRouteMeta(pathname: string): RouteMeta {
  if (pathname.startsWith('/agentes/') && pathname !== '/agentes') {
    return {
      title: 'Detalle del agente',
      parent: { label: 'Agentes', to: '/agentes' },
    };
  }
  if (pathname === '/agentes') {
    return { title: 'Agentes sanitarios' };
  }
  if (pathname === '/supervisiones/nueva') {
    return {
      title: 'Nueva supervisión',
      parent: { label: 'Supervisiones', to: '/supervisiones' },
    };
  }
  if (
    pathname.startsWith('/supervisiones/') &&
    pathname !== '/supervisiones'
  ) {
    return {
      title: 'Detalle de supervisión',
      parent: { label: 'Supervisiones', to: '/supervisiones' },
    };
  }
  if (pathname === '/supervisiones') {
    return { title: 'Supervisiones' };
  }
  if (pathname === '/admin/usuarios/nuevo') {
    return {
      title: 'Nuevo usuario',
      parent: { label: 'Usuarios', to: '/admin/usuarios' },
    };
  }
  if (
    pathname.startsWith('/admin/usuarios/') &&
    pathname !== '/admin/usuarios'
  ) {
    return {
      title: 'Detalle de usuario',
      parent: { label: 'Usuarios', to: '/admin/usuarios' },
    };
  }
  if (pathname === '/admin/usuarios') {
    return { title: 'Usuarios' };
  }
  if (pathname === '/admin/territorio') {
    return { title: 'Territorio' };
  }
  if (pathname === '/admin/bloques') {
    return { title: 'Bloques de evaluación' };
  }
  if (pathname === '/admin/criterios') {
    return { title: 'Criterios' };
  }
  if (pathname === '/dashboard') {
    return { title: 'Inicio' };
  }
  return { title: 'Sistema de Supervisión' };
}

export default function Header({ abrirSidebar }: HeaderProps) {
  const { usuario } = useAuth();
  const location = useLocation();
  const meta = resolveRouteMeta(location.pathname);
  const rolLabel =
    usuario?.rol === 'ADMIN' ? 'Administrador' : 'Supervisor';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={abrirSidebar}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            {meta.parent ? (
              <nav
                className="mb-0.5 flex items-center gap-1 text-xs text-slate-400"
                aria-label="Breadcrumb"
              >
                <Link
                  to={meta.parent.to}
                  className="truncate transition hover:text-slate-600"
                >
                  {meta.parent.label}
                </Link>
                <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate text-slate-500">{meta.title}</span>
              </nav>
            ) : null}
            <h2 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
              {meta.title}
            </h2>
          </div>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-medium text-slate-700">
            {usuario?.nombre} {usuario?.apellido}
          </p>
          <p className="text-xs text-slate-500">
            {rolLabel}
            {usuario?.areaOperativa?.nombre
              ? ` · ${usuario.areaOperativa.nombre}`
              : ''}
          </p>
        </div>
      </div>
    </header>
  );
}
