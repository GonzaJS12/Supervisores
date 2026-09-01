import type {
  BloqueEvaluacion,
} from './bloque';

export interface CriterioEvaluacion {
  id: number;
  bloqueId: number;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  activo: boolean;

  bloque?: BloqueEvaluacion;

  createdAt?: string;
  updatedAt?: string;
}

export interface CrearCriterioRequest {
  bloqueId: number;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export interface ActualizarCriterioRequest {
  bloqueId?: number;
  nombre?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}