export type RolUsuario =
  | 'ADMIN'
  | 'SUPERVISOR';

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolUsuario;
}