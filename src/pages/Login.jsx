import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});

  function manejarSubmit(e) {
    e.preventDefault();
    const nuevos = {};

    if (correo.trim() === '') nuevos.correo = 'Ingresa tu correo.';
    else if (!REGEX_CORREO.test(correo)) nuevos.correo = 'El formato del correo no es válido.';
    if (contrasena === '') nuevos.contrasena = 'Ingresa tu contraseña.';

    if (Object.keys(nuevos).length > 0) {
      setErrores(nuevos);
      return;
    }

    const resultado = login(correo, contrasena);
    if (!resultado.ok) {
      setErrores({ general: resultado.error });
      return;
    }
    navigate(resultado.usuario.rol === 'admin' ? '/admin' : '/');
  }

  return (
    <main className="pagina-centrada">
      <h1 className="nombre-empresa">moonsoon</h1>
      <section className="caja-form">
        <h2>Inicio de sesión</h2>
        <form onSubmit={manejarSubmit} noValidate>
          <div className="campo">
            <label htmlFor="correo">Correo</label>
            <input
              type="email"
              id="correo"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <p className="sugerencia">Ej: nombre@correo.com</p>
            {errores.correo && <p className="error-msg" role="alert">{errores.correo}</p>}
          </div>

          <div className="campo">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            {errores.contrasena && <p className="error-msg" role="alert">{errores.contrasena}</p>}
          </div>

          {errores.general && <p className="error-msg" role="alert">{errores.general}</p>}

          <button type="submit" className="btn-form btn-form--primario">Iniciar sesión</button>
          <button type="button" className="btn-form btn-form--secundario" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </form>
      </section>
    </main>
  );
}
