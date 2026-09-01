import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  abrirSidebar: () => void;
}

export default function Header({
  abrirSidebar,
}: HeaderProps) {
  const { usuario } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white">

      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={abrirSidebar}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
            Sistema de Supervisión
          </h2>

        </div>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-700">
            {usuario?.nombre} {usuario?.apellido}
          </p>

          <p className="text-xs text-slate-500">
            {usuario?.rol}
          </p>
        </div>

      </div>
    </header>
  );
}