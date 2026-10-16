import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => localStorage.clear());

  it('muestra errores si se envía el formulario vacío', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.getByText(/ingresa tu correo/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa tu contraseña/i)).toBeInTheDocument();
  });

  it('muestra error si el correo tiene un formato inválido', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'correo-no-valido' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'algo' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.getByText(/formato del correo no es válido/i)).toBeInTheDocument();
  });

  it('muestra un error general si la cuenta no existe', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'nadie@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'Clave123!' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.getByText(/no existe una cuenta/i)).toBeInTheDocument();
  });

  it('permite iniciar sesión con el administrador por defecto', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'admin@moonsoon.cl' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
