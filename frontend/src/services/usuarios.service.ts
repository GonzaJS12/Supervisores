import { api } from './api';

import type {
  CrearUsuarioRequest,
  UsuarioAdmin,
  RolUsuario,
} from '../types/usuario';

export const obtenerUsuarios =
  async (): Promise<UsuarioAdmin[]> => {
    const response =
      await api.get<UsuarioAdmin[]>(
        '/usuarios',
      );

    return response.data;
  };

export const obtenerUsuarioPorId =
  async (
    id: number,
  ): Promise<UsuarioAdmin> => {
    const response =
      await api.get<UsuarioAdmin>(
        `/usuarios/${id}`,
      );

    return response.data;
  };

export const crearUsuario =
  async (
    datos: CrearUsuarioRequest,
  ): Promise<UsuarioAdmin> => {
    const response =
      await api.post<UsuarioAdmin>(
        '/usuarios',
        datos,
      );

    return response.data;
  };
  export const cambiarEstadoUsuario =
  async (
    id: number,
    activo: boolean,
  ): Promise<UsuarioAdmin> => {
    const response =
      await api.patch<UsuarioAdmin>(
        `/usuarios/${id}/estado`,
        {
          activo,
        },
      );

    return response.data;
  };
  export const cambiarRolUsuario =
  async (
    id: number,
    rol: RolUsuario,
  ): Promise<UsuarioAdmin> => {
    const response =
      await api.patch<UsuarioAdmin>(
        `/usuarios/${id}/rol`,
        {
          rol,
        },
      );

    return response.data;
  };
  export const cambiarPasswordUsuario =
  async (
    id: number,
    password: string,
  ): Promise<UsuarioAdmin> => {
    const response =
      await api.patch<UsuarioAdmin>(
        `/usuarios/${id}/password`,
        {
          password,
        },
      );

    return response.data;
  };