import { createContext, useContext, useEffect, useState } from 'react';
import { leerStorage, guardarStorage } from '../utils/format.js';

export const CLAVE_CARRITO = 'moonsoon_carrito';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => leerStorage(CLAVE_CARRITO, []));

  useEffect(() => {
    guardarStorage(CLAVE_CARRITO, carrito);
  }, [carrito]);

  function agregar(producto) {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id);
      if (existente) {
        return prev.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
      }
      return [...prev, { id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, cantidad: 1 }];
    });
  }

  function cambiarCantidad(id, nuevaCantidad) {
    setCarrito((prev) =>
      nuevaCantidad <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item))
    );
  }

  function vaciar() {
    setCarrito([]);
  }

  const totalUnidades = carrito.reduce((t, item) => t + item.cantidad, 0);
  const subtotal = carrito.reduce((t, item) => t + item.precio * item.cantidad, 0);

  const value = { carrito, agregar, cambiarCantidad, vaciar, totalUnidades, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
