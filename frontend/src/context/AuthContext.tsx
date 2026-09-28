import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Usuario } from '../types/auth';
import {
  mapearSesionAUsuario,
  obtenerUsuarioActual,
} from '../services/auth.service';
import { obtenerAreasOperativas } from '../services/areas-operativas.service';

interface AuthContextType {
  usuario: Usuario | null;
  accessToken: string | null;
  cargandoSesion: boolean;
  loginUsuario: (token: string, usuario: Usuario) => void;
  logout: () => void;
  estaAutenticado: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

function leerUsuarioLocal(): Usuario | null {
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado) as Usuario;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('accessToken'),
  );

  const [usuario, setUsuario] = useState<Usuario | null>(() =>
    leerUsuarioLocal(),
  );

  const [cargandoSesion, setCargandoSesion] = useState<boolean>(
    () => !!localStorage.getItem('accessToken'),
  );

  const loginUsuario = (token: string, usuarioActual: Usuario) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioActual));

    setAccessToken(token);
    setUsuario(usuarioActual);
    setCargandoSesion(false);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usuario');

    setAccessToken(null);
    setUsuario(null);
    setCargandoSesion(false);
  };

  useEffect(() => {
    let cancelado = false;

    const sincronizarSesion = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        if (!cancelado) {
          setCargandoSesion(false);
        }
        return;
      }

      try {
        const sesion = await obtenerUsuarioActual();

        let areaOperativa = leerUsuarioLocal()?.areaOperativa ?? null;

        if (
          sesion.areaOperativaId &&
          (!areaOperativa ||
            areaOperativa.id !== sesion.areaOperativaId)
        ) {
          try {
            const areas = await obtenerAreasOperativas();
            const encontrada = areas.find(
              (area) => area.id === sesion.areaOperativaId,
            );

            areaOperativa = encontrada
              ? {
                  id: encontrada.id,
                  externalAreaId: encontrada.externalAreaId ?? null,
                  nombre: encontrada.nombre,
                }
              : null;
          } catch {
            // Si falla el catálogo de áreas, conservamos lo local.
          }
        }

        if (sesion.areaOperativaId == null) {
          areaOperativa = null;
        }

        const usuarioActualizado = mapearSesionAUsuario(
          sesion,
          areaOperativa,
        );

        if (!cancelado) {
          localStorage.setItem(
            'usuario',
            JSON.stringify(usuarioActualizado),
          );
          setUsuario(usuarioActualizado);
          setAccessToken(token);
        }
      } catch {
        if (!cancelado) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('usuario');
          setAccessToken(null);
          setUsuario(null);
        }
      } finally {
        if (!cancelado) {
          setCargandoSesion(false);
        }
      }
    };

    void sincronizarSesion();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        accessToken,
        cargandoSesion,
        loginUsuario,
        logout,
        estaAutenticado: !!accessToken && !!usuario,
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
