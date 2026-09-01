export interface CriterioResumen {
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
  criterios: CriterioResumen[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearBloqueRequest {
  nombre: string;
  descripcion?: string;
  orden: number;
}

export interface ActualizarBloqueRequest {
  nombre?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}