export type RolUsuario =
  | 'ADMIN'
  | 'SUPERVISOR';

export interface AreaOperativaUsuario {
  id: number;
  externalAreaId: number | null;
  nombre: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;

  areaOperativaId:
    number | null;

  areaOperativa?:
    AreaOperativaUsuario | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolUsuario;

  areaOperativaId?: number;
}