import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.jsx';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const usuarioNuevo = {
  nombre: 'Ana Pérez',
  correo: 'ana@gmail.com',
  clave: 'Clave123!',
  telefono: '',
  region: 'rm',
  comuna: 'santiago',
};

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());

  it('crea automáticamente un usuario administrador por defecto', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.usuarios.some((u) => u.rol === 'admin')).toBe(true);
  });

  it('registra un usuario nuevo con rol cliente', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      const r = result.current.registrar(usuarioNuevo);
      expect(r.ok).toBe(true);
    });
    const registrado = result.current.usuarios.find((u) => u.correo === usuarioNuevo.correo);
    expect(registrado).toBeDefined();
    expect(registrado.rol).toBe('cliente');
  });

  it('rechaza el registro si el correo ya existe', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.registrar(usuarioNuevo));

    let respuesta;
    act(() => {
      respuesta = result.current.registrar(usuarioNuevo);
    });
    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toMatch(/ya está registrado/i);
  });

  it('permite iniciar sesión con credenciales correctas', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.registrar(usuarioNuevo));

    let respuesta;
    act(() => {
      respuesta = result.current.login(usuarioNuevo.correo, usuarioNuevo.clave);
    });
    expect(respuesta.ok).toBe(true);
    expect(result.current.sesion.correo).toBe(usuarioNuevo.correo);
  });

  it('rechaza el login si la cuenta no existe', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let respuesta;
    act(() => {
      respuesta = result.current.login('no-existe@gmail.com', 'cualquiera');
    });
    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toMatch(/no existe/i);
  });

  it('rechaza el login si la contraseña es incorrecta', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.registrar(usuarioNuevo));

    let respuesta;
    act(() => {
      respuesta = result.current.login(usuarioNuevo.correo, 'ClaveMala1!');
    });
    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toMatch(/incorrecta/i);
  });

  it('cierra sesión correctamente', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.registrar(usuarioNuevo));
    act(() => result.current.login(usuarioNuevo.correo, usuarioNuevo.clave));
    expect(result.current.sesion).not.toBeNull();

    act(() => result.current.logout());
    expect(result.current.sesion).toBeNull();
  });
});
