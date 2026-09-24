import axios from 'axios';

/*
 * URL base del backend.
 *
 * Se obtiene desde las variables
 * de entorno de Vite.
 */
const apiUrl =
  import.meta.env.VITE_API_URL?.trim();

if (!apiUrl) {
  throw new Error(
    'VITE_API_URL no está configurado',
  );
}

export const api = axios.create({
  baseURL: apiUrl,

  headers: {
    'Content-Type': 'application/json',
  },
});

/*
 * Antes de cada petición agregamos
 * automáticamente el JWT si existe.
 */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

/*
 * Si el backend responde 401,
 * eliminamos la sesión local
 * y redirigimos al login.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        'accessToken',
      );

      localStorage.removeItem(
        'usuario',
      );

      const estaEnLogin =
        window.location.pathname ===
        '/login';

      if (!estaEnLogin) {
        window.location.href =
          '/login';
      }
    }

    return Promise.reject(error);
  },
);