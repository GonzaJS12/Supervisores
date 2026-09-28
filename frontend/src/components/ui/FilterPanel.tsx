import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';
import Button from './Button';

export interface FilterPanelProps {
  title?: string;
  description?: string;
  children: ReactNode;
  onClear?: () => void;
  clearDisabled?: boolean;
  clearLabel?: string;
  footerLeft?: ReactNode;
  className?: string;
}

export default function FilterPanel({
  title = 'Filtros',
  description,
  children,
  onClear,
  clearDisabled = false,
  clearLabel = 'Limpiar filtros',
  footerLeft,
  className = '',
}: FilterPanelProps) {
  return (
    <div
      className={`mb-6 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 ${className}`.trim()}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Filter className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>

      <div>{children}</div>

      {(onClear || footerLeft) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="text-sm text-slate-500">{footerLeft}</div>
          {onClear ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClear}
              disabled={clearDisabled}
            >
              {clearLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
