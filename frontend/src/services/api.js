import axios from 'axios';

/**
 * Cliente único para las peticiones a Spring Boot.
 * El backend de Carlos expone las rutas bajo /api.
 */
export const TOKEN_KEY = 'irongym_jwt';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Antes de cada petición, adjuntamos el JWT cuando existe una sesión.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Traduce una respuesta de error HTTP a un mensaje comprensible.
 * No confundimos un 401 con un fallo de red.
 */
export function apiErrorMessage(error) {
  if (!error.response) {
    return 'No se pudo conectar con Spring Boot. Comprueba que el backend esté encendido.';
  }

  const message = error.response.data?.message;
  if (typeof message === 'string' && message.trim()) return message;

  switch (error.response.status) {
    case 400:
      return 'Revisa los datos introducidos.';
    case 401:
      return 'Correo o contraseña incorrectos, o sesión vencida.';
    case 403:
      return 'Tu usuario no tiene permiso para realizar esta acción.';
    case 404:
      return 'No se encontró el recurso solicitado.';
    case 422:
      return 'Los datos no cumplen con los requisitos.';
    default:
      return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
  }
}
