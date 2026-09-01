import { api } from './api';
import type { AgenteSanitario, CrearAgenteRequest } from '../types/agente';

export const obtenerAgentes = async (): Promise<
  AgenteSanitario[]
> => {
  const response = await api.get<AgenteSanitario[]>(
    '/agentes',
  );

  return response.data;
};

export const obtenerAgente = async (
  id: number,
): Promise<AgenteSanitario> => {
  const response =
    await api.get<AgenteSanitario>(
      `/agentes/${id}`,
    );

  return response.data;
};

export const crearAgente = async (
  datos: CrearAgenteRequest,
): Promise<AgenteSanitario> => {
  const response =
    await api.post<AgenteSanitario>(
      '/agentes',
      datos,
    );

  return response.data;
};