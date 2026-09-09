import { api } from './api';
import type { Ronda } from '../types/ronda';

export const obtenerRondas =
  async (): Promise<Ronda[]> => {
    const response =
      await api.get<Ronda[]>(
        '/rondas',
      );

    return response.data;
  };