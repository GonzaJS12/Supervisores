import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = true,
  hover = false,
}: CardProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm ${padding ? 'p-5 sm:p-6' : ''} ${hover ? 'transition duration-150 hover:border-slate-300 hover:shadow-md' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className = '',
}: SectionCardProps) {
  return (
    <Card className={className} padding>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}
