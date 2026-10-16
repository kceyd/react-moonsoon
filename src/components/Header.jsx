import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Header() {
  const { sesion, esAdmin, logout } = useAuth();
  const { totalUnidades } = useCart();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate('/');
  }

  return (
    <header className="encabezado">
      <div className="encabezado__cuenta">
        {sesion ? (
          <>
            <span>Hola, {sesion.nombre}</span>
            {esAdmin && <Link to="/admin">Panel admin</Link>}
            <button type="button" className="enlace-boton" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Registrar usuario</Link>
          </>
        )}
      </div>
      <div className="encabezado__barra">
        <Link to="/" className="marca">moonsoon</Link>
        <nav className="nav-principal" aria-label="Menú principal">
          <ul>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            <li><NavLink to="/productos">Productos</NavLink></li>
            <li><NavLink to="/carrito">Carrito</NavLink></li>
          </ul>
        </nav>
        <div className="encabezado__acciones">
          <Link to="/carrito" className="carrito-indicador">Cart ({totalUnidades})</Link>
        </div>
      </div>
    </header>
  );
}
