import { createContext, useContext, useEffect, useState } from 'react';
import { leerStorage, guardarStorage } from '../utils/format.js';
import { PRODUCTOS_INICIALES } from '../data/productosIniciales.js';

export const CLAVE_PRODUCTOS = 'moonsoon_productos';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [productos, setProductos] = useState(() => leerStorage(CLAVE_PRODUCTOS, PRODUCTOS_INICIALES));

  useEffect(() => {
    guardarStorage(CLAVE_PRODUCTOS, productos);
  }, [productos]);

  function crear({ nombre, precio, imagen }) {
    const nuevo = { id: 'prod-' + Date.now(), nombre, precio: Number(precio), imagen };
    setProductos((prev) => [...prev, nuevo]);
  }

  function actualizar(id, cambios) {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cambios, precio: Number(cambios.precio ?? p.precio) } : p))
    );
  }

  function eliminar(id) {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }

  function restaurar() {
    setProductos(PRODUCTOS_INICIALES);
  }

  const value = { productos, crear, actualizar, eliminar, restaurar };
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductsProvider>');
  return ctx;
}
