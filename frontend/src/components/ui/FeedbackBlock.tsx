import type { ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import Button from './Button';

interface FeedbackAction {
  label: string;
  onClick: () => void;
}

interface CommonProps {
  title?: string;
  message?: string;
  action?: FeedbackAction;
  className?: string;
  children?: ReactNode;
}

export function LoadingState({
  title = 'Cargando…',
  message,
  className = '',
}: CommonProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {message ? (
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title = 'Sin resultados',
  message,
  action,
  className = '',
  children,
}: CommonProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center ${className}`.trim()}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Inbox className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {message ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {message}
        </p>
      ) : null}
      {children}
      {action ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorBanner({
  title = 'Ocurrió un error',
  message,
  action,
  className = '',
}: CommonProps) {
  return (
    <div
      className={`flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`.trim()}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {message ? <p className="mt-1">{message}</p> : null}
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-sm font-semibold text-red-800 underline-offset-2 hover:underline"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
