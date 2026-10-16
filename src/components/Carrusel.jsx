import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard.jsx';

export default function Carrusel({ productos }) {
  const viewportRef = useRef(null);
  const [sinPrev, setSinPrev] = useState(true);
  const [sinNext, setSinNext] = useState(false);

  function actualizarFlechas() {
    const v = viewportRef.current;
    if (!v) return;
    setSinPrev(v.scrollLeft <= 0);
    setSinNext(v.scrollLeft >= v.scrollWidth - v.clientWidth - 1);
  }

  useEffect(() => {
    actualizarFlechas();
    window.addEventListener('resize', actualizarFlechas);
    return () => window.removeEventListener('resize', actualizarFlechas);
  }, [productos]);

  function mover(direccion) {
    const v = viewportRef.current;
    if (v) v.scrollBy({ left: direccion * v.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="carrusel">
      <button type="button" className="carrusel__flecha" disabled={sinPrev} onClick={() => mover(-1)} aria-label="Ver productos anteriores">‹</button>
      <div className="carrusel__viewport" ref={viewportRef} onScroll={actualizarFlechas}>
        <div className="carrusel__pista">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </div>
      <button type="button" className="carrusel__flecha" disabled={sinNext} onClick={() => mover(1)} aria-label="Ver más productos">›</button>
    </div>
  );
}
