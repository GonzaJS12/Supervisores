export interface CriterioEvaluacion {
  id: number;
  bloqueId: number;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  activo: boolean;
}

export interface BloqueEvaluacion {
  id: number;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  activo: boolean;
  criterios: CriterioEvaluacion[];
}