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
 * FILTROS DEL LISTADO
 *
 * nombre:
 * nombre o apellido del agente.
 *
 * sectorId:
 * sector seleccionado.
 *
 * areaOperativaId:
 * solamente se utiliza como
 * filtro seleccionable para ADMIN.
 *
 * El backend continúa siendo
 * responsable de limitar al
 * SUPERVISOR a su propia área.
 */
export interface FiltrosAgentes {
  nombre?: string;
  sectorId?: number;
  areaOperativaId?: number;
}

/*
 * LISTADO PRINCIPAL
 *
 * ADMIN:
 * todos los agentes y puede
 * filtrar por área.
 *
 * SUPERVISOR:
 * solamente agentes de su área.
 *
 * Ambos pueden filtrar por:
 * - nombre/apellido
 * - sector
 */
export const obtenerAgentes =
  async (
    page = 1,
    limit = 15,
    filtros: FiltrosAgentes = {},
  ): Promise<AgentesPaginados> => {
    const response =
      await api.get<AgentesPaginados>(
        '/agentes',
        {
          params: {
            page,
            limit,

            /*
             * Solamente enviamos
             * filtros que tengan
             * algún valor.
             */
            ...(filtros.nombre
              ? {
                  nombre:
                    filtros.nombre,
                }
              : {}),

            ...(filtros.sectorId
              ? {
                  sectorId:
                    filtros.sectorId,
                }
              : {}),

            ...(filtros.areaOperativaId
              ? {
                  areaOperativaId:
                    filtros.areaOperativaId,
                }
              : {}),
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