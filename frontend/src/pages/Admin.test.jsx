import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./AdminUsuarios', () => ({ default: () => <p>Vista usuarios</p> }));
vi.mock('./AdminProductos', () => ({ default: () => <p>Vista productos</p> }));

import Admin from './Admin';

describe('Admin', () => {
  it('abre en la pestaña Usuarios y permite cambiar a Productos', () => {
    render(<Admin />);
    expect(screen.getByText('Vista usuarios')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Productos' }));
    expect(screen.getByText('Vista productos')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Usuarios' }));
    expect(screen.getByText('Vista usuarios')).toBeTruthy();
  });
});
