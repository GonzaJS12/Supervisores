import type { ReactNode } from 'react';

type Tone =
  | 'slate'
  | 'blue'
  | 'green'
  | 'red'
  | 'amber'
  | 'purple';

const toneClasses: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
  purple: 'bg-purple-100 text-purple-700',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({
  children,
  tone = 'slate',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export function RoleBadge({ rol }: { rol: string }) {
  if (rol === 'ADMIN') {
    return <Badge tone="purple">Administrador</Badge>;
  }
  return <Badge tone="blue">Supervisor</Badge>;
}

export function StatusBadge({ activo }: { activo: boolean }) {
  return activo ? (
    <Badge tone="green">Activo</Badge>
  ) : (
    <Badge tone="slate">Inactivo</Badge>
  );
}

const clasificacionTone: Record<string, Tone> = {
  CRITICO: 'red',
  REGULAR: 'amber',
  BUENO: 'blue',
  EXCELENTE: 'green',
};

const clasificacionLabel: Record<string, string> = {
  CRITICO: 'Crítico',
  REGULAR: 'Regular',
  BUENO: 'Bueno',
  EXCELENTE: 'Excelente',
};

export function ClasificacionBadge({
  clasificacion,
}: {
  clasificacion?: string | null;
}) {
  if (!clasificacion) {
    return <span className="text-sm text-slate-400">Sin clasificación</span>;
  }

  return (
    <Badge tone={clasificacionTone[clasificacion] ?? 'slate'}>
      {clasificacionLabel[clasificacion] ?? clasificacion}
    </Badge>
  );
}
