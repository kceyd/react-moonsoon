import { API_USUARIOS, request } from './http';

const BASE = '/api/usuarios';

export const usuariosService = {
  listar: () => request(API_USUARIOS, BASE),
  obtener: (id) => request(API_USUARIOS, `${BASE}/${id}`),
  crear: (u) => request(API_USUARIOS, BASE, { method: 'POST', body: u }),
  actualizar: (id, u) => request(API_USUARIOS, `${BASE}/${id}`, { method: 'PUT', body: u }),
  cambiarRol: (id, rol) => request(API_USUARIOS, `${BASE}/${id}/rol`, { method: 'PATCH', body: { rol } }),
  cambiarEstado: (id, activo) =>
    request(API_USUARIOS, `${BASE}/${id}/estado`, { method: 'PATCH', body: { activo } }),
  eliminar: (id) => request(API_USUARIOS, `${BASE}/${id}`, { method: 'DELETE' }),
};
