import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatearCLP } from '../utils/format.js';

export default function ProductCard({ producto }) {
  const { agregar } = useCart();
  const [agregado, setAgregado] = useState(false);

  function manejarClick() {
    agregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  }

  return (
    <article className="tarjeta-producto">
      <div className="tarjeta-producto__imagen">
        <img src={producto.imagen} alt={producto.nombre} />
      </div>
      <div className="tarjeta-producto__contenido">
        <h3>{producto.nombre}</h3>
        <p className="tarjeta-producto__precio">{formatearCLP(producto.precio)}</p>
        <button type="button" className="boton boton-primario" onClick={manejarClick}>
          {agregado ? 'Agregado ✓' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  );
}
