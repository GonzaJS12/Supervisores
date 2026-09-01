import { api } from './api';

import type {
  ActualizarCriterioRequest,
  CriterioEvaluacion,
  CrearCriterioRequest,
} from '../types/criterio';

export const obtenerCriterios =
  async (): Promise<
    CriterioEvaluacion[]
  > => {
    const response =
      await api.get<
        CriterioEvaluacion[]
      >(
        '/criterios-evaluacion',
      );

    return response.data;
  };

export const obtenerCriteriosPorBloque =
  async (
    bloqueId: number,
  ): Promise<
    CriterioEvaluacion[]
  > => {
    const response =
      await api.get<
        CriterioEvaluacion[]
      >(
        `/criterios-evaluacion/bloque/${bloqueId}`,
      );

    return response.data;
  };

export const obtenerCriterioPorId =
  async (
    id: number,
  ): Promise<CriterioEvaluacion> => {
    const response =
      await api.get<CriterioEvaluacion>(
        `/criterios-evaluacion/${id}`,
      );

    return response.data;
  };

export const crearCriterio =
  async (
    datos: CrearCriterioRequest,
  ): Promise<CriterioEvaluacion> => {
    const response =
      await api.post<CriterioEvaluacion>(
        '/criterios-evaluacion',
        datos,
      );

    return response.data;
  };

export const actualizarCriterio =
  async (
    id: number,
    datos: ActualizarCriterioRequest,
  ): Promise<CriterioEvaluacion> => {
    const response =
      await api.patch<CriterioEvaluacion>(
        `/criterios-evaluacion/${id}`,
        datos,
      );

    return response.data;
  };