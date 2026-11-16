import { API_PRODUCTOS, request } from './http';

const BASE = '/api/productos';

export const productosService = {
  listar: () => request(API_PRODUCTOS, BASE),
  obtener: (id) => request(API_PRODUCTOS, `${BASE}/${id}`),
  crear: (p) => request(API_PRODUCTOS, BASE, { method: 'POST', body: p }),
  actualizar: (id, p) => request(API_PRODUCTOS, `${BASE}/${id}`, { method: 'PUT', body: p }),
  eliminar: (id) => request(API_PRODUCTOS, `${BASE}/${id}`, { method: 'DELETE' }),
};
