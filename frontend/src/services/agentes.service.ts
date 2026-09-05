import { api } from './api';

import type {
  ActualizarAgenteRequest,
  AgenteSanitario,
  CrearAgenteRequest,
} from '../types/agente';

export const obtenerAgentes =
  async (): Promise<
    AgenteSanitario[]
  > => {
    const response =
      await api.get<
        AgenteSanitario[]
      >('/agentes');

    return response.data;
  };

export const obtenerAgente =
  async (
    id: number,
  ): Promise<AgenteSanitario> => {
    const response =
      await api.get<
        AgenteSanitario
      >(
        `/agentes/${id}`,
      );

    return response.data;
  };

export const crearAgente =
  async (
    datos: CrearAgenteRequest,
  ): Promise<AgenteSanitario> => {
    const response =
      await api.post<
        AgenteSanitario
      >(
        '/agentes',
        datos,
      );

    return response.data;
  };

export const actualizarAgente =
  async (
    id: number,
    datos: ActualizarAgenteRequest,
  ): Promise<AgenteSanitario> => {
    const response =
      await api.patch<
        AgenteSanitario
      >(
        `/agentes/${id}`,
        datos,
      );

    return response.data;
  };

/*
 * ACTIVAR / DESACTIVAR
 */
export const cambiarEstadoAgente =
  async (
    id: number,
    activo: boolean,
  ): Promise<AgenteSanitario> => {
    const response =
      await api.patch<
        AgenteSanitario
      >(
        `/agentes/${id}/estado`,
        {
          activo,
        },
      );

    return response.data;
  };