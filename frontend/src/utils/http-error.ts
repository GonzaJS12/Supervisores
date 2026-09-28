import axios from 'axios';

/**
 * Mensajes amigables según el status HTTP del backend.
 * No reemplaza la seguridad de NestJS: solo mejora la UX.
 */
export function obtenerMensajeError(
  error: unknown,
  mensajePorDefecto: string,
): string {
  if (!axios.isAxiosError(error)) {
    return mensajePorDefecto;
  }

  const status = error.response?.status;
  const data = error.response?.data as
    | { message?: string | string[] }
    | undefined;

  const mensajeBackend = Array.isArray(data?.message)
    ? data?.message.join(' ')
    : data?.message;

  if (status === 400) {
    return (
      mensajeBackend ||
      'Los datos enviados no son válidos. Revisá el formulario.'
    );
  }

  if (status === 401) {
    return 'Tu sesión expiró o no estás autorizado. Volvé a iniciar sesión.';
  }

  if (status === 403) {
    return (
      mensajeBackend ||
      'No tenés permisos suficientes para realizar esta acción.'
    );
  }

  if (status === 404) {
    return mensajeBackend || 'El recurso solicitado no existe.';
  }

  if (status === 500) {
    return 'Error del servidor. Intentá nuevamente más tarde.';
  }

  return mensajeBackend || mensajePorDefecto;
}
