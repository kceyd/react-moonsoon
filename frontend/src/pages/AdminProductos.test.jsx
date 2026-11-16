import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/productosService', () => ({
  productosService: { listar: vi.fn(), crear: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn() },
}));

import { productosService } from '../services/productosService';
import AdminProductos from './AdminProductos';

const POLERA = { id: 1, nombre: 'Polera', descripcion: 'algodón', precio: 9990, stock: 5, categoria: 'ropa', imagen: '' };

describe('AdminProductos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productosService.listar.mockResolvedValue([POLERA]);
    [productosService.crear, productosService.actualizar, productosService.eliminar]
      .forEach((f) => f.mockResolvedValue({}));
  });

  it('carga y muestra los productos de la API', async () => {
    render(<AdminProductos />);
    expect(screen.getByText('Cargando productos…')).toBeTruthy();
    expect(await screen.findByText('Polera')).toBeTruthy();
    expect(screen.getByText('9990')).toBeTruthy();
  });

  it('muestra el error si la API falla', async () => {
    productosService.listar.mockRejectedValue(new Error('No se pudo conectar con el servidor'));
    render(<AdminProductos />);
    expect((await screen.findByRole('alert')).textContent).toContain('No se pudo conectar');
  });

  it('crea un producto convirtiendo precio y stock a número', async () => {
    render(<AdminProductos />);
    await screen.findByText('Polera');
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Gorro' } });
    fireEvent.change(screen.getByPlaceholderText('Precio'), { target: { value: '4990' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(productosService.crear).toHaveBeenCalledWith(
      { nombre: 'Gorro', descripcion: '', precio: 4990, stock: 8, categoria: '', imagen: '' }));
  });

  it('edita un producto', async () => {
    render(<AdminProductos />);
    const fila = (await screen.findByText('Polera')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(productosService.actualizar).toHaveBeenCalledWith(
      1, expect.objectContaining({ nombre: 'Polera', stock: 12, precio: 9990 })));
  });

  it('cancelar la edición limpia el formulario', async () => {
    render(<AdminProductos />);
    const fila = (await screen.findByText('Polera')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('Nuevo producto')).toBeTruthy();
  });

  it('elimina un producto tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AdminProductos />);
    const fila = (await screen.findByText('Polera')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(productosService.eliminar).toHaveBeenCalledWith(1));
  });

  it('muestra el error del backend si falla al eliminar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    productosService.eliminar.mockRejectedValue(new Error('No tienes permisos para esta acción'));
    render(<AdminProductos />);
    const fila = (await screen.findByText('Polera')).closest('tr');
    fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    expect((await screen.findByRole('alert')).textContent).toContain('No tienes permisos');
  });
});
