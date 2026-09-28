import { api } from './api';

export interface Zona {
  id: number;
  externalZonaId?: number | null;
  nombre: string;
  codigo?: string | null;
  activo?: boolean;
}

export const obtenerZonas = async (): Promise<Zona[]> => {
  const response = await api.get<Zona[]>('/zonas');
  return response.data;
};
