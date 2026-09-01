export type RolUsuario = 'ADMIN' | 'SUPERVISOR';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}