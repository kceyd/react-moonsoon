import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    listar: vi.fn(), crear: vi.fn(), actualizar: vi.fn(),
    cambiarRol: vi.fn(), cambiarEstado: vi.fn(), eliminar: vi.fn(),
  },
}));

import { AuthProvider } from '../context/AuthContext';
import { usuariosService } from '../services/usuariosService';
import AdminUsuarios from './AdminUsuarios';

const ADMIN = { id: 1, nombre: 'Admin', email: 'admin@moonsoon.cl', rol: 'ADMIN', activo: true };
const CLIENTE = { id: 2, nombre: 'Cli', email: 'cliente@moonsoon.cl', rol: 'CLIENTE', activo: true };

const montar = () => render(<AuthProvider><AdminUsuarios /></AuthProvider>);

describe('AdminUsuarios', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('moonsoon_usuario', JSON.stringify(ADMIN));
    vi.clearAllMocks();
    usuariosService.listar.mockResolvedValue([ADMIN, CLIENTE]);
    [usuariosService.crear, usuariosService.actualizar, usuariosService.cambiarRol,
      usuariosService.cambiarEstado, usuariosService.eliminar].forEach((f) => f.mockResolvedValue({}));
  });

  it('muestra "cargando" y luego la lista que viene de la API', async () => {
    montar();
    expect(screen.getByText('Cargando usuarios…')).toBeTruthy();
    expect(await screen.findByText('cliente@moonsoon.cl')).toBeTruthy();
    expect(usuariosService.listar).toHaveBeenCalledTimes(1);
  });

  it('muestra el error cuando la API falla', async () => {
    usuariosService.listar.mockRejectedValue(new Error('No tienes permisos para esta acción'));
    montar();
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('No tienes permisos');
  });

  it('crea un usuario con los datos del formulario', async () => {
    montar();
    await screen.findByText('cliente@moonsoon.cl');
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'ana@x.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Clave (mín. 6)'), { target: { value: 'secreto1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(usuariosService.crear).toHaveBeenCalledWith(
      { nombre: 'Ana', email: 'ana@x.cl', password: 'secreto1', rol: 'CLIENTE', activo: true }));
    await waitFor(() => expect(usuariosService.listar).toHaveBeenCalledTimes(2));
  });

  it('edita un usuario existente', async () => {
    montar();
    const fila = (await screen.findByText('cliente@moonsoon.cl')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Editar' }));
    expect(screen.getByText('Editar usuario')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Cambiado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(usuariosService.actualizar).toHaveBeenCalledWith(
      2, expect.objectContaining({ nombre: 'Cambiado', email: 'cliente@moonsoon.cl' })));
  });

  it('elimina a otro usuario tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    montar();
    const fila = (await screen.findByText('cliente@moonsoon.cl')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(usuariosService.eliminar).toHaveBeenCalledWith(2));
  });

  it('no elimina si el admin cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    montar();
    const fila = (await screen.findByText('cliente@moonsoon.cl')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    expect(usuariosService.eliminar).not.toHaveBeenCalled();
  });

  it('el admin no puede eliminarse ni desactivarse a sí mismo', async () => {
    montar();
    const fila = (await screen.findByText('admin@moonsoon.cl')).closest('tr');
    expect(within(fila).getByRole('button', { name: 'Eliminar' }).disabled).toBe(true);
    expect(within(fila).getByRole('button', { name: 'Desactivar' }).disabled).toBe(true);
  });

  it('desactiva a otro usuario', async () => {
    montar();
    const fila = (await screen.findByText('cliente@moonsoon.cl')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(usuariosService.cambiarEstado).toHaveBeenCalledWith(2, false));
  });

  it('cambia el rol desde la tabla', async () => {
    montar();
    const fila = (await screen.findByText('cliente@moonsoon.cl')).closest('tr');
    fireEvent.change(within(fila).getByRole('combobox'), { target: { value: 'ADMIN' } });
    await waitFor(() => expect(usuariosService.cambiarRol).toHaveBeenCalledWith(2, 'ADMIN'));
  });

  it('muestra el error del backend si falla al crear', async () => {
    usuariosService.crear.mockRejectedValue(new Error('El correo ya está registrado'));
    montar();
    await screen.findByText('cliente@moonsoon.cl');
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'ana@x.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Clave (mín. 6)'), { target: { value: 'secreto1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect((await screen.findByRole('alert')).textContent).toContain('ya está registrado');
  });
});
