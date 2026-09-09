import { api } from './api';
import type { AgenteSanitario } from '../types/agente';

export const obtenerAgentes =
  async (): Promise<
    AgenteSanitario[]
  > => {
    const response =
      await api.get<AgenteSanitario[]>(
        '/agentes',
      );

    return response.data;
  };

export const obtenerAgente =
  async (
    id: number,
  ): Promise<AgenteSanitario> => {
    const response =
      await api.get<AgenteSanitario>(
        `/agentes/${id}`,
      );

    return response.data;
  };

export const obtenerAgentesPorArea =
  async (
    areaOperativaId: number,
  ): Promise<AgenteSanitario[]> => {
    const response =
      await api.get<AgenteSanitario[]>(
        `/agentes/area/${areaOperativaId}`,
      );

    return response.data;
  };