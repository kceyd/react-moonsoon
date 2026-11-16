const TOKEN_KEY = 'moonsoon_token';

export const API_USUARIOS = import.meta.env.VITE_API_USUARIOS_URL;
export const API_PRODUCTOS = import.meta.env.VITE_API_PRODUCTOS_URL;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const MENSAJES = {
  401: 'Tu sesión expiró o no iniciaste sesión',
  403: 'No tienes permisos para esta acción',
  404: 'No se encontró el recurso',
};

export async function request(baseUrl, path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  const texto = await res.text();
  let data = null;
  try { data = texto ? JSON.parse(texto) : null; } catch { data = null; }

  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('moonsoon:unauthorized'));
    throw new ApiError(data?.mensaje || MENSAJES[res.status] || `Error ${res.status}`, res.status);
  }
  return data;
}
