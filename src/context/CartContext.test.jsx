import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext.jsx';

const producto = { id: 'prod-1', nombre: 'Mouse gamer', precio: 29990, imagen: '/img/mouse-gamer.jpg' };
const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  it('agrega un producto y suma unidades si se repite', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.agregar(producto));
    act(() => result.current.agregar(producto));
    expect(result.current.carrito).toHaveLength(1);
    expect(result.current.totalUnidades).toBe(2);
    expect(result.current.subtotal).toBe(59980);
  });

  it('elimina el producto cuando la cantidad llega a 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.agregar(producto));
    act(() => result.current.cambiarCantidad('prod-1', 0));
    expect(result.current.carrito).toHaveLength(0);
  });

  it('guarda el carrito en localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.agregar(producto));
    expect(JSON.parse(localStorage.getItem('moonsoon_carrito'))).toHaveLength(1);
  });
});
