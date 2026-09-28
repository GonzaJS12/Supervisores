export type RolUsuario =
  'ADMIN' | 'SUPERVISOR';

export interface AreaOperativaUsuario {
  id: number;
  externalAreaId: number | null;
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  areaOperativaId: number | null;
  areaOperativa: AreaOperativaUsuario | null;
}

/** Forma real de GET /auth/me (JwtStrategy.validate). */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  areaOperativaId: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}
