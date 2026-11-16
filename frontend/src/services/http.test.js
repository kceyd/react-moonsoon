import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getToken, request, setToken } from './http';

const BASE = 'http://api.test';
const respuesta = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (body === undefined ? '' : JSON.stringify(body)),
});

describe('http.request', () => {
  let fetchMock;
  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('hace GET a la URL base + ruta y devuelve el JSON', async () => {
    fetchMock.mockResolvedValue(respuesta(200, [{ id: 1 }]));
    const data = await request(BASE, '/api/x');
    expect(data).toEqual([{ id: 1 }]);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/x');
    expect(opts.method).toBe('GET');
    expect(opts.headers.Authorization).toBeUndefined();
  });

  it('envía el token JWT en el header Authorization', async () => {
    setToken('abc123');
    fetchMock.mockResolvedValue(respuesta(200, {}));
    await request(BASE, '/api/x');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc123');
  });

  it('serializa el body en POST', async () => {
    fetchMock.mockResolvedValue(respuesta(201, { id: 5 }));
    await request(BASE, '/api/x', { method: 'POST', body: { a: 1 } });
    expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}');
  });

  it('devuelve null cuando la respuesta no tiene cuerpo', async () => {
    fetchMock.mockResolvedValue(respuesta(200));
    expect(await request(BASE, '/api/x', { method: 'DELETE' })).toBeNull();
  });

  it('lanza ApiError con el mensaje que manda el backend', async () => {
    fetchMock.mockResolvedValue(respuesta(400, { mensaje: 'Datos inválidos' }));
    await expect(request(BASE, '/api/x')).rejects.toMatchObject({ status: 400, message: 'Datos inválidos' });
  });

  it('usa un mensaje por defecto para 403 y 404', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(403));
    await expect(request(BASE, '/api/x')).rejects.toThrow('No tienes permisos');
    fetchMock.mockResolvedValueOnce(respuesta(404));
    await expect(request(BASE, '/api/x')).rejects.toThrow('No se encontró');
  });

  it('avisa que no hay conexión cuando fetch falla', async () => {
    fetchMock.mockRejectedValue(new TypeError('fail'));
    const err = await request(BASE, '/api/x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });

  it('dispara el evento de sesión expirada con un 401 si había token', async () => {
    setToken('vencido');
    const handler = vi.fn();
    window.addEventListener('moonsoon:unauthorized', handler);
    fetchMock.mockResolvedValue(respuesta(401));
    await expect(request(BASE, '/api/x')).rejects.toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('moonsoon:unauthorized', handler);
  });

  it('setToken(null) borra el token guardado', () => {
    setToken('x');
    expect(getToken()).toBe('x');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});
