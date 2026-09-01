import { createContext, useContext, useEffect, useState,type ReactNode } from 'react';

import type { Usuario } from '../types/auth';

interface AuthContextType {
  usuario: Usuario | null;
  accessToken: string | null;
  loginUsuario: (
    token: string,
    usuario: Usuario,
  ) => void;
  logout: () => void;
  estaAutenticado: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] =
    useState<string | null>(() =>
      localStorage.getItem('accessToken'),
    );

  const [usuario, setUsuario] =
    useState<Usuario | null>(() => {
      const usuarioGuardado =
        localStorage.getItem('usuario');

      if (!usuarioGuardado) {
        return null;
      }

      try {
        return JSON.parse(usuarioGuardado);
      } catch {
        return null;
      }
    });

  const loginUsuario = (
    token: string,
    usuario: Usuario,
  ) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario),
    );

    setAccessToken(token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usuario');

    setAccessToken(null);
    setUsuario(null);
  };

  useEffect(() => {
    // Por ahora no necesitamos realizar ninguna petición.
    // El usuario ya viene incluido en la respuesta del login.
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        accessToken,
        loginUsuario,
        logout,
        estaAutenticado:
          !!accessToken && !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider',
    );
  }

  return context;
}