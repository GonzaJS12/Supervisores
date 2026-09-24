import { api } from './api';

import type {
  BloqueEvaluacion,
} from '../types/evaluacion';

export const obtenerBloquesEvaluacion =
  async (): Promise<BloqueEvaluacion[]> => {
    const response =
      await api.get<BloqueEvaluacion[]>(
        '/bloques-evaluacion/activos',
      );

    return response.data;
  };