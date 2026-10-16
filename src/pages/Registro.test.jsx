import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registro from './Registro.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

function renderRegistro() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Registro />
      </AuthProvider>
    </MemoryRouter>
  );
}

function llenarCampo(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

describe('Registro', () => {
  beforeEach(() => localStorage.clear());

  it('muestra errores si se envía el formulario vacío', () => {
    renderRegistro();
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/ingresa tu nombre completo/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa un correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/selecciona una región/i)).toBeInTheDocument();
  });

  it('valida que la contraseña cumpla el formato exigido', () => {
    renderRegistro();
    llenarCampo(/^contraseña$/i, '1234');
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
  });

  it('valida que ambos correos coincidan', () => {
    renderRegistro();
    llenarCampo('Correo', 'ana@gmail.com');
    llenarCampo('Confirmar correo', 'otro@gmail.com');
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/los correos no coinciden/i)).toBeInTheDocument();
  });

  it('valida que ambas contraseñas coincidan', () => {
    renderRegistro();
    llenarCampo(/^contraseña$/i, 'Clave123!');
    llenarCampo('Confirmar contraseña', 'OtraClave123!');
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('registra correctamente con datos válidos', () => {
    renderRegistro();
    llenarCampo('Nombre completo', 'Ana Pérez');
    llenarCampo('Correo', 'ana@gmail.com');
    llenarCampo('Confirmar correo', 'ana@gmail.com');
    llenarCampo(/^contraseña$/i, 'Clave123!');
    llenarCampo('Confirmar contraseña', 'Clave123!');

    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'rm' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'santiago' } });

    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.queryByText(/ingresa tu nombre completo/i)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('moonsoon_usuarios'))).toEqual(
      expect.arrayContaining([expect.objectContaining({ correo: 'ana@gmail.com' })])
    );
  });
});
