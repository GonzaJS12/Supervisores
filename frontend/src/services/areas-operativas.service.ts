import { api } from './api';

export interface AreaOperativa {
  id: number;
  externalAreaId?: number | null;
  nombre: string;
  descripcion?: string | null;
  estabBase?: string | null;
  activo: boolean;

  zona?: {
    id: number;
    externalZonaId?: number | null;
    nombre: string;
    codigo?: string | null;
  } | null;
}

export const obtenerAreasOperativas =
  async (): Promise<AreaOperativa[]> => {
    const response =
      await api.get<AreaOperativa[]>('/areas');

    return response.data;
  };