import {
  createContext,
} from 'react';

import type {
  Usuario,
} from '../types/auth';

export interface AuthContextType {
  usuario: Usuario | null;

  accessToken: string | null;

  loginUsuario: (
    token: string,
    usuario: Usuario,
  ) => void;

  logout: () => void;

  estaAutenticado: boolean;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );