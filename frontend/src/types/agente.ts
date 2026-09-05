export interface AreaOperativa {
  id: number;
  nombre: string;
}

export interface AgenteSanitario {
  id: number;
  areaOperativaId: number;
  nombre: string;
  apellido: string;
  documento?: string | null;
  legajo?: string | null;
  activo: boolean;
  areaOperativa?: AreaOperativa;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearAgenteRequest {
  nombre: string;
  apellido: string;
  documento?: string;
  legajo?: string;
  areaOperativaId: number;
}
export interface ActualizarAgenteRequest {
  nombre?: string;
  apellido?: string;
  documento?: string;
  legajo?: string;
  areaOperativaId?: number;
}