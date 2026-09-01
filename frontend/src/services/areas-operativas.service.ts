import { api } from './api';

export interface AreaOperativa {
  id: number;
  nombre: string;
  activo?: boolean;
}

export const obtenerAreasOperativas = async (): Promise<
  AreaOperativa[]
> => {
  const response = await api.get<AreaOperativa[]>(
    '/areas',
  );

  return response.data;
};