import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/authService', () => ({
  authService: { login: vi.fn(), registro: vi.fn() },
}));

import { authService } from '../services/authService';
import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
const ADMIN = { id: 1, nombre: 'Admin', email: 'admin@moonsoon.cl', rol: 'ADMIN' };

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('empieza sin sesión', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.usuario).toBeNull();
    expect(result.current.esAdmin).toBe(false);
  });

  it('login guarda token y usuario, y marca esAdmin', async () => {
    authService.login.mockResolvedValue({ token: 'tok', usuario: ADMIN });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('admin@moonsoon.cl', 'Admin123!'); });
    expect(result.current.usuario.email).toBe('admin@moonsoon.cl');
    expect(result.current.esAdmin).toBe(true);
    expect(localStorage.getItem('moonsoon_token')).toBe('tok');
  });

  it('login fallido propaga el error y no deja sesión', async () => {
    authService.login.mockRejectedValue(new Error('Correo o clave incorrectos'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await expect(result.current.login('a@a.cl', 'mala')).rejects.toThrow('Correo o clave incorrectos');
    });
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('moonsoon_token')).toBeNull();
  });

  it('la sesión persiste al recargar (lee el usuario guardado)', () => {
    localStorage.setItem('moonsoon_usuario', JSON.stringify({ ...ADMIN, rol: 'CLIENTE' }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.usuario.rol).toBe('CLIENTE');
    expect(result.current.esAdmin).toBe(false);
  });

  it('logout borra token y usuario', async () => {
    localStorage.setItem('moonsoon_token', 'tok');
    localStorage.setItem('moonsoon_usuario', JSON.stringify(ADMIN));
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('moonsoon_token')).toBeNull();
    expect(localStorage.getItem('moonsoon_usuario')).toBeNull();
  });

  it('cierra la sesión cuando el backend responde 401 (token vencido)', () => {
    localStorage.setItem('moonsoon_usuario', JSON.stringify(ADMIN));
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => { window.dispatchEvent(new Event('moonsoon:unauthorized')); });
    expect(result.current.usuario).toBeNull();
  });

  it('registrar delega en authService.registro', async () => {
    authService.registro.mockResolvedValue({ id: 2 });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.registrar('Ana', 'a@a.cl', 'clave123'); });
    expect(authService.registro).toHaveBeenCalledWith('Ana', 'a@a.cl', 'clave123');
  });

  it('tolera un usuario guardado con JSON corrupto', () => {
    localStorage.setItem('moonsoon_usuario', '{no es json');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.usuario).toBeNull();
  });
});
