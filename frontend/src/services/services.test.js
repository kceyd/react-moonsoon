import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./http', () => ({
  request: vi.fn().mockResolvedValue({}),
  API_USUARIOS: 'http://usuarios',
  API_PRODUCTOS: 'http://productos',
}));

import { request } from './http';
import { authService } from './authService';
import { usuariosService } from './usuariosService';
import { productosService } from './productosService';

describe('servicios de la API', () => {
  beforeEach(() => request.mockClear());

  it('authService.login hace POST a /api/auth/login', async () => {
    await authService.login('a@a.cl', 'clave');
    expect(request).toHaveBeenCalledWith('http://usuarios', '/api/auth/login',
      { method: 'POST', body: { email: 'a@a.cl', password: 'clave' } });
  });

  it('authService.registro hace POST a /api/auth/registro', async () => {
    await authService.registro('Ana', 'a@a.cl', 'clave123');
    expect(request).toHaveBeenCalledWith('http://usuarios', '/api/auth/registro',
      { method: 'POST', body: { nombre: 'Ana', email: 'a@a.cl', password: 'clave123' } });
  });

  it('usuariosService cubre el CRUD completo', async () => {
    await usuariosService.listar();
    await usuariosService.obtener(3);
    await usuariosService.crear({ nombre: 'A' });
    await usuariosService.actualizar(3, { nombre: 'B' });
    await usuariosService.eliminar(3);
    const llamadas = request.mock.calls.map(([, ruta, opts]) => [opts?.method ?? 'GET', ruta]);
    expect(llamadas).toEqual([
      ['GET', '/api/usuarios'],
      ['GET', '/api/usuarios/3'],
      ['POST', '/api/usuarios'],
      ['PUT', '/api/usuarios/3'],
      ['DELETE', '/api/usuarios/3'],
    ]);
  });

  it('usuariosService cambia rol y estado con PATCH', async () => {
    await usuariosService.cambiarRol(2, 'ADMIN');
    await usuariosService.cambiarEstado(2, false);
    expect(request).toHaveBeenNthCalledWith(1, 'http://usuarios', '/api/usuarios/2/rol',
      { method: 'PATCH', body: { rol: 'ADMIN' } });
    expect(request).toHaveBeenNthCalledWith(2, 'http://usuarios', '/api/usuarios/2/estado',
      { method: 'PATCH', body: { activo: false } });
  });

  it('productosService cubre el CRUD completo contra ms-productos', async () => {
    await productosService.listar();
    await productosService.obtener(9);
    await productosService.crear({ nombre: 'P' });
    await productosService.actualizar(9, { nombre: 'Q' });
    await productosService.eliminar(9);
    const llamadas = request.mock.calls.map(([base, ruta, opts]) => [base, opts?.method ?? 'GET', ruta]);
    expect(llamadas).toEqual([
      ['http://productos', 'GET', '/api/productos'],
      ['http://productos', 'GET', '/api/productos/9'],
      ['http://productos', 'POST', '/api/productos'],
      ['http://productos', 'PUT', '/api/productos/9'],
      ['http://productos', 'DELETE', '/api/productos/9'],
    ]);
  });
});
