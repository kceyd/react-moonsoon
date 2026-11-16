import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function montar(ruta) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/login" element={<p>Pantalla login</p>} />
          <Route path="/carrito" element={<ProtectedRoute><p>Carrito privado</p></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute rol="ADMIN"><p>Panel admin</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}
const sesion = (rol) =>
  localStorage.setItem('moonsoon_usuario', JSON.stringify({ id: 1, email: 'a@a.cl', rol }));

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('sin sesión redirige al login', () => {
    montar('/carrito');
    expect(screen.getByText('Pantalla login')).toBeTruthy();
  });

  it('con sesión muestra la ruta privada', () => {
    sesion('CLIENTE');
    montar('/carrito');
    expect(screen.getByText('Carrito privado')).toBeTruthy();
  });

  it('un CLIENTE no puede entrar a /admin', () => {
    sesion('CLIENTE');
    montar('/admin');
    expect(screen.getByText('Inicio')).toBeTruthy();
    expect(screen.queryByText('Panel admin')).toBeNull();
  });

  it('un ADMIN sí entra a /admin', () => {
    sesion('ADMIN');
    montar('/admin');
    expect(screen.getByText('Panel admin')).toBeTruthy();
  });

  it('sin sesión /admin también redirige al login', () => {
    montar('/admin');
    expect(screen.getByText('Pantalla login')).toBeTruthy();
  });
});
