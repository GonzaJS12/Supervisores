export type DecisionGestion =
  | 'NO_REQUIERE'
  | 'SEGUIMIENTO'
  | 'CAPACITACION'
  | 'SUPERVISION_INTENSIVA';

export interface Sector {
  id: number;
  areaOperativaId: number;
  numero: number;
  nombre?: string | null;
  activo: boolean;
}

export interface EvaluacionRequest {
  criterioId: number;
  puntuacion: number;
}

export interface CrearSupervisionRequest {
  agenteSanitarioId: number;
  areaOperativaId: number;
  sectorId: number;
  fecha: string;
  familiaNumero?: number;
  rondaNumero?: number;
  decisionGestion: DecisionGestion;
  fortalezas?: string;
  oportunidadesMejora?: string;
  situacionesCriticas?: string;
  recomendaciones?: string;
  evaluaciones: EvaluacionRequest[];
}
export interface SupervisionListado {
  id: number;
  fecha: string;
  familiaNumero?: number | null;
  rondaNumero?: number | null;

  decisionGestion:
    | 'NO_REQUIERE'
    | 'SEGUIMIENTO'
    | 'CAPACITACION'
    | 'SUPERVISION_INTENSIVA';

  promedio?: string | number | null;

  clasificacion?:
    | 'CRITICO'
    | 'REGULAR'
    | 'BUENO'
    | 'EXCELENTE'
    | null;

  agenteSanitario: {
    id: number;
    nombre: string;
    apellido: string;
    documento?: string | null;
    legajo?: string | null;
  };

  supervisor: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
  };

  areaOperativa: {
    id: number;
    nombre: string;
  };

  sector: {
    id: number;
    numero?: number;
    nombre?: string | null;
  };
}
export interface EvaluacionDetalle {
  id: number;
  criterioId: number;
  criterioNombre: string;
  criterioDescripcion?: string | null;
  puntuacion: number;
}

export interface SupervisionDetalle
  extends SupervisionListado {
  fortalezas?: string | null;
  oportunidadesMejora?: string | null;
  situacionesCriticas?: string | null;
  recomendaciones?: string | null;

  evaluaciones: EvaluacionDetalle[];
}