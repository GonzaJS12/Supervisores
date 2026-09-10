import {
  api,
} from './api';

import type {
  AgenteSanitario,
} from '../types/agente';

/*
 * METADATOS DE PAGINACIÓN
 */
export interface AgentesMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/*
 * RESPUESTA DEL LISTADO
 * PRINCIPAL PAGINADO
 */
export interface AgentesPaginados {
  data: AgenteSanitario[];
  meta: AgentesMeta;
}

/*
 * LISTADO PRINCIPAL
 *
 * El backend determina según
 * el JWT si el usuario es:
 *
 * ADMIN:
 * todos los agentes.
 *
 * SUPERVISOR:
 * solamente agentes de su área.
 */
export const obtenerAgentes =
  async (
    page = 1,
    limit = 15,
  ): Promise<AgentesPaginados> => {
    const response =
      await api.get<AgentesPaginados>(
        '/agentes',
        {
          params: {
            page,
            limit,
          },
        },
      );

    return response.data;
  };

/*
 * OBTENER AGENTE POR ID
 */
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

/*
 * AGENTES ACTIVOS DE UN ÁREA
 *
 * Este endpoint continúa SIN
 * paginación porque se utiliza
 * en formularios, por ejemplo
 * Nueva Supervisión.
 */
export const obtenerAgentesPorArea =
  async (
    areaOperativaId: number,
  ): Promise<AgenteSanitario[]> => {
    const response =
      await api.get<
        AgenteSanitario[]
      >(
        `/agentes/area/${areaOperativaId}`,
      );

    return response.data;
  };