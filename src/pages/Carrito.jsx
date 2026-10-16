import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatearCLP } from '../utils/format.js';

const CUPONES_VALIDOS = {
  MOONSOON10: 0.1, // 10% de descuento
  BIENVENIDO: 5000, // $5.000 de descuento fijo
};

export default function Carrito() {
  const { carrito, cambiarCantidad, vaciar, subtotal } = useCart();
  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState('');
  const [mensajePago, setMensajePago] = useState('');

  const total = Math.max(subtotal - descuento, 0);

  function aplicarCupon() {
    const codigo = cupon.trim().toUpperCase();
    if (!(codigo in CUPONES_VALIDOS)) {
      setDescuento(0);
      setMensajeCupon('Cupón inválido.');
      return;
    }
    const valor = CUPONES_VALIDOS[codigo];
    const monto = valor < 1 ? Math.round(subtotal * valor) : valor;
    setDescuento(monto);
    setMensajeCupon(`Cupón aplicado: -${formatearCLP(monto)}`);
  }

  function pagar() {
    if (carrito.length === 0) {
      setMensajePago('Tu carrito está vacío: agrega productos antes de pagar.');
      return;
    }
    setMensajePago('Pago simulado con éxito. ¡Gracias por tu compra!');
    setDescuento(0);
    setMensajeCupon('');
    setCupon('');
    vaciar();
  }

  return (
    <main className="carrito-section">
      <h1>Mi carrito de compras</h1>

      <div className="carrito-layout">
        <div className="lista-items">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>Tu carrito está vacío por ahora.</p>
              <Link to="/productos" className="boton boton-primario">Ver catálogo</Link>
            </div>
          ) : (
            carrito.map((item) => (
              <article key={item.id}>
                <img src={item.imagen} alt={item.nombre} className="item-imagen" />
                <div className="item-info">
                  <p>{item.nombre}</p>
                  <p>{formatearCLP(item.precio)}</p>
                </div>
                <div className="item-cantidad">
                  <button type="button" onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} aria-label="Disminuir cantidad">−</button>
                  <input
                    type="number"
                    min="0"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.id, parseInt(e.target.value, 10) || 0)}
                    aria-label="Cantidad"
                  />
                  <button type="button" onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} aria-label="Aumentar cantidad">+</button>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="resumen-carrito">
          <p className="total-linea">TOTAL: <span>{formatearCLP(total)}</span></p>

          <div className="cupon-box">
            <label htmlFor="cupon">Cupón de descuento</label>
            <input
              type="text"
              id="cupon"
              placeholder="Ingrese el cupón de descuento"
              value={cupon}
              onChange={(e) => setCupon(e.target.value)}
            />
            <button type="button" className="btn-cupon" onClick={aplicarCupon}>Aplicar</button>
            {mensajeCupon && <p className="error-msg" role="alert">{mensajeCupon}</p>}
          </div>

          <button type="button" className="btn-pagar" onClick={pagar}>Pagar</button>
          {mensajePago && <p className="error-msg" role="alert">{mensajePago}</p>}
        </aside>
      </div>
    </main>
  );
}
