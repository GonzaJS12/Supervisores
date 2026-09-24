import {
  useState,
  type ReactNode,
} from 'react';

import type {
  Usuario,
} from '../types/auth';

import {
  AuthContext,
} from './AuthContextDefinition';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        'accessToken',
      ),
    );

  const [usuario, setUsuario] =
    useState<Usuario | null>(() => {
      const usuarioGuardado =
        localStorage.getItem(
          'usuario',
        );

      if (!usuarioGuardado) {
        return null;
      }

      try {
        return JSON.parse(
          usuarioGuardado,
        ) as Usuario;
      } catch {
        return null;
      }
    });

  const loginUsuario = (
    token: string,
    usuario: Usuario,
  ) => {
    localStorage.setItem(
      'accessToken',
      token,
    );

    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario),
    );

    setAccessToken(token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem(
      'usuario',
    );

    setAccessToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        accessToken,
        loginUsuario,
        logout,

        estaAutenticado:
          !!accessToken &&
          !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}