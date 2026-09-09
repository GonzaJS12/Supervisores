export interface Ronda {
  id: number;
  externalRondaId?: number | null;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}