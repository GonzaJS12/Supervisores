import { api } from './api';
import type {
  LoginRequest,
  LoginResponse,
  Usuario,
  UsuarioSesion,
} from '../types/auth';

export const login = async (
  datos: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    datos,
  );

  return response.data;
};

/**
 * GET /auth/me
 * Respuesta real del backend: id, nombre, apellido, email,
 * rol, activo y areaOperativaId (sin objeto areaOperativa).
 */
export const obtenerUsuarioActual = async (): Promise<UsuarioSesion> => {
  const response = await api.get<UsuarioSesion>('/auth/me');
  return response.data;
};

export function mapearSesionAUsuario(
  sesion: UsuarioSesion,
  areaOperativa: Usuario['areaOperativa'] = null,
): Usuario {
  return {
    id: sesion.id,
    nombre: sesion.nombre,
    apellido: sesion.apellido,
    email: sesion.email,
    rol: sesion.rol,
    areaOperativaId: sesion.areaOperativaId,
    areaOperativa,
  };
}
