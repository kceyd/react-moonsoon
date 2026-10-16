import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [correo, setCorreo] = useState('');

  function suscribir(e) {
    e.preventDefault();
    setCorreo('');
  }

  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="pie__grid">
          <div>
            <h3>moonsoon</h3>
            <p>Gadgets útiles, garantía real y despacho a todo Chile.</p>
          </div>
          <div>
            <h3>Categorías</h3>
            <ul className="pie__categorias">
              <li><Link to="/productos">Audio</Link></li>
              <li><Link to="/productos">Computación</Link></li>
              <li><Link to="/productos">Accesorios gamer</Link></li>
            </ul>
            <div className="pie__medios">
              <span>Webpay</span>
              <span>Mastercard</span>
              <span>Visa</span>
            </div>
          </div>
          <div className="pie__boletin">
            <h3>Mantente al día</h3>
            <p>Suscríbete y recibe nuestras ofertas.</p>
            <form onSubmit={suscribir}>
              <label htmlFor="boletin-correo" className="oculto">Correo electrónico</label>
              <input
                type="email"
                id="boletin-correo"
                placeholder="tu@correo.com"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <button type="submit" className="boton boton-primario">Suscribir</button>
            </form>
          </div>
        </div>
        <p className="pie__legal">© 2026 moonsoon. Proyecto DSY1104.</p>
      </div>
    </footer>
  );
}
