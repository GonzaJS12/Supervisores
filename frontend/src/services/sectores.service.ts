import { api } from './api';
import type { Sector } from '../types/supervision';

export const obtenerSectoresPorArea = async (
  areaOperativaId: number,
): Promise<Sector[]> => {
  const response = await api.get<Sector[]>(
    `/sectores/area/${areaOperativaId}`,
  );

  return response.data;
};