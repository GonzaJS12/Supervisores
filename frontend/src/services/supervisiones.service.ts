import { api } from './api';

import type {
  CrearSupervisionRequest,
  SupervisionDetalle,
  SupervisionListado,
} from '../types/supervision';

export interface MetricasSupervision {
  totalSupervisiones: number;
  supervisionesMes: number;
  promedioGeneral: number | null;

  clasificaciones: {
    CRITICO: number;
    REGULAR: number;
    BUENO: number;
    EXCELENTE: number;
  };

  ultimasSupervisiones: SupervisionListado[];
}

export const crearSupervision = async (
  datos: CrearSupervisionRequest,
) => {
  const response = await api.post(
    '/supervisiones',
    datos,
  );

  return response.data;
};

/*
 * ADMIN
 * Todas las supervisiones.
 */
export const obtenerSupervisiones =
  async (): Promise<
    SupervisionListado[]
  > => {
    const response =
      await api.get<
        SupervisionListado[]
      >('/supervisiones');

    return response.data;
  };

/*
 * SUPERVISOR
 * Solamente sus supervisiones.
 */
export const obtenerMisSupervisiones =
  async (): Promise<
    SupervisionListado[]
  > => {
    const response =
      await api.get<
        SupervisionListado[]
      >(
        '/supervisiones/mis-supervisiones',
      );

    return response.data;
  };

/*
 * SUPERVISOR
 * Métricas personales.
 */
export const obtenerMisMetricas =
  async (): Promise<
    MetricasSupervision
  > => {
    const response =
      await api.get<
        MetricasSupervision
      >(
        '/supervisiones/mis-metricas',
      );

    return response.data;
  };

/*
 * ADMIN
 * Métricas globales.
 */
export const obtenerMetricasGlobales =
  async (): Promise<
    MetricasSupervision
  > => {
    const response =
      await api.get<
        MetricasSupervision
      >(
        '/supervisiones/metricas',
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

/*
 * ADMIN
 * Historial completo de un agente.
 */
export const obtenerSupervisionesPorAgente =
  async (
    agenteId: number,
  ) => {
    const response =
      await api.get(
        `/supervisiones/agente/${agenteId}`,
      );

    return response.data;
  };