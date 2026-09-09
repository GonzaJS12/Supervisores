export interface AreaOperativaAgente {
  id: number;
  externalAreaId?: number | null;
  nombre: string;
}

export interface SectorAgente {
  id: number;
  externalSectorId?: number | null;
  numero: number;
  nombre?: string | null;
}

export interface AgenteSanitario {
  id: number;

  areaOperativaId: number;
  sectorId?: number | null;

  externalUserId?: number | null;
  externalUuid?: string | null;

  nombre: string;
  apellido: string;

  documento?: string | null;
  legajo?: string | null;
  cobertura?: string | null;

  activo: boolean;

  areaOperativa?: AreaOperativaAgente;
  sector?: SectorAgente | null;

  createdAt?: string;
  updatedAt?: string;
}