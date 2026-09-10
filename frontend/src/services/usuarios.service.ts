import {
  api,
} from './api';

import type {
  CrearUsuarioRequest,
  UsuarioAdmin,
} from '../types/usuario';

/*
 * LISTAR USUARIOS
 */
export const obtenerUsuarios =
  async (): Promise<UsuarioAdmin[]> => {
    const response =
      await api.get<UsuarioAdmin[]>(
        '/usuarios',
      );

    return response.data;
  };

/*
 * OBTENER USUARIO POR ID
 */
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

/*
 * CREAR USUARIO
 */
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

/*
 * DATOS QUE SE PUEDEN MODIFICAR.
 *
 * El rol NO forma parte de esta
 * interfaz porque ya no permitimos
 * modificarlo.
 */
export interface ModificarUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  areaOperativaId?: number;
}

/*
 * MODIFICAR USUARIO
 */
export const modificarUsuario =
  async (
    id: number,
    datos: ModificarUsuarioRequest,
  ): Promise<UsuarioAdmin> => {
    const response =
      await api.patch<UsuarioAdmin>(
        `/usuarios/${id}`,
        datos,
      );

    return response.data;
  };

/*
 * ACTIVAR / DESACTIVAR USUARIO
 */
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

/*
 * CAMBIAR CONTRASEÑA
 */
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