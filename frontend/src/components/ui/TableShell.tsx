import type { ReactNode } from 'react';

export interface TableShellProps {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export default function TableShell({
  children,
  className = '',
  footer,
}: TableShellProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`.trim()}
    >
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}

export function Table({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <table className={`w-full min-w-full text-left text-sm ${className}`.trim()}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
      {children}
    </thead>
  );
}

export function Th({
  children,
  className = '',
  align = 'left',
}: {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  return (
    <th
      className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6 ${alignClass} ${className}`.trim()}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function Tr({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-slate-50/80 ${onClick ? 'cursor-pointer' : ''} ${className}`.trim()}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  className = '',
  align = 'left',
}: {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  return (
    <td
      className={`px-4 py-4 text-slate-600 sm:px-6 ${alignClass} ${className}`.trim()}
    >
      {children}
    </td>
  );
}
