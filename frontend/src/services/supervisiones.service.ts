import { api } from './api';
import type { CrearSupervisionRequest,SupervisionDetalle, SupervisionListado } from '../types/supervision';

export const crearSupervision = async (
  datos: CrearSupervisionRequest,
) => {
  const response = await api.post(
    '/supervisiones',
    datos,
  );

  return response.data;
};

export const obtenerSupervisiones =
  async (): Promise<SupervisionListado[]> => {
    const response =
      await api.get<SupervisionListado[]>(
        '/supervisiones',
      );

    return response.data;
  };
export const obtenerSupervisionPorId =
  async (
    id: number,
  ): Promise<SupervisionDetalle> => {
    const response =
      await api.get<SupervisionDetalle>(
        `/supervisiones/${id}`,
      );

    return response.data;
  };
  export const obtenerSupervisionesPorAgente =
  async (agenteId: number) => {
    const response = await api.get(
      `/supervisiones/agente/${agenteId}`,
    );

    return response.data;
  };