import { useAuth } from '../../context/useAuth';

interface HeaderProps {
  abrirSidebar: () => void;
}

export default function Header({
  abrirSidebar,
}: HeaderProps) {
  const { usuario } = useAuth();

  const esAdmin =
    usuario?.rol === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={abrirSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Sistema de Supervisión
            </h2>

            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Gestión y seguimiento de agentes
              sanitarios
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {!esAdmin &&
            usuario?.areaOperativa && (
              <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right md:block">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Área operativa
                </p>

                <p className="max-w-52 truncate text-xs font-semibold text-slate-700">
                  {usuario.areaOperativa.nombre}
                </p>
              </div>
            )}

          <div className="hidden text-right sm:block">
            <p className="max-w-48 truncate text-sm font-semibold text-slate-800">
              {usuario?.nombre}{' '}
              {usuario?.apellido}
            </p>

            <p className="text-xs text-slate-500">
              {esAdmin
                ? 'Administrador'
                : 'Supervisor'}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100 sm:hidden">
            {`${usuario?.nombre?.[0] ?? ''}${
              usuario?.apellido?.[0] ?? ''
            }`.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}