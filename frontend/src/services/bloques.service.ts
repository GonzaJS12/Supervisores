import { api } from './api';

import type {
  ActualizarBloqueRequest,
  BloqueEvaluacion,
  CrearBloqueRequest,
} from '../types/bloque';

export const obtenerBloques =
  async (): Promise<BloqueEvaluacion[]> => {
    const response =
      await api.get<BloqueEvaluacion[]>(
        '/bloques-evaluacion',
      );

    return response.data;
  };

export const obtenerBloquePorId =
  async (
    id: number,
  ): Promise<BloqueEvaluacion> => {
    const response =
      await api.get<BloqueEvaluacion>(
        `/bloques-evaluacion/${id}`,
      );

    return response.data;
  };

export const crearBloque =
  async (
    datos: CrearBloqueRequest,
  ): Promise<BloqueEvaluacion> => {
    const response =
      await api.post<BloqueEvaluacion>(
        '/bloques-evaluacion',
        datos,
      );

    return response.data;
  };

export const actualizarBloque =
  async (
    id: number,
    datos: ActualizarBloqueRequest,
  ): Promise<BloqueEvaluacion> => {
    const response =
      await api.patch<BloqueEvaluacion>(
        `/bloques-evaluacion/${id}`,
        datos,
      );

    return response.data;
  };