import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,50}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_CLAVE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!.*]).{8,}$/;
const REGEX_TELEFONO = /^(\+?56\s?)?9\s?\d{4}\s?\d{4}$/;

const REGIONES = [
  { valor: 'rm', nombre: 'Región Metropolitana de Santiago' },
  { valor: 'araucania', nombre: 'Región de la Araucanía' },
  { valor: 'nuble', nombre: 'Región de Ñuble' },
];

const COMUNAS_POR_REGION = {
  rm: ['Santiago', 'Providencia', 'Las Condes'],
  araucania: ['Temuco', 'Villarrica', 'Angol'],
  nuble: ['Chillán', 'San Carlos'],
};

const FORM_VACIO = {
  nombre: '', correo: '', correoConfirmar: '', password: '', passwordConfirmar: '',
  telefono: '', region: '', comuna: '',
};

export default function Registro() {
  const { registrar, correoExiste } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_VACIO);
  const [errores, setErrores] = useState({});

  function cambiar(e) {
    const { name, value } = e.target;
    setForm((prev) => (name === 'region' ? { ...prev, region: value, comuna: '' } : { ...prev, [name]: value }));
  }

  function validar() {
    const e = {};
    if (form.nombre.trim() === '') e.nombre = 'Ingresa tu nombre completo.';
    else if (!REGEX_NOMBRE.test(form.nombre)) e.nombre = 'Solo letras y espacios, máximo 50 caracteres.';

    if (form.correo.trim() === '') e.correo = 'Ingresa un correo electrónico.';
    else if (!REGEX_CORREO.test(form.correo)) e.correo = 'El formato del correo no es válido.';
    else if (correoExiste(form.correo)) e.correo = 'Ese correo ya está registrado.';

    if (form.correoConfirmar !== form.correo) e.correoConfirmar = 'Los correos no coinciden.';
    if (!REGEX_CLAVE.test(form.password)) e.password = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@#$%!.*).';
    if (form.passwordConfirmar !== form.password) e.passwordConfirmar = 'Las contraseñas no coinciden.';
    if (form.telefono.trim() !== '' && !REGEX_TELEFONO.test(form.telefono)) e.telefono = 'Formato esperado: +56 9 1234 5678.';
    if (form.region === '') e.region = 'Selecciona una región.';
    if (form.comuna === '') e.comuna = 'Selecciona una comuna.';
    return e;
  }

  function manejarSubmit(ev) {
    ev.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    const resultado = registrar({
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      clave: form.password,
      telefono: form.telefono.trim(),
      region: form.region,
      comuna: form.comuna,
    });
    if (!resultado.ok) {
      setErrores({ correo: resultado.error });
      return;
    }
    navigate('/login');
  }

  function renderCampo(id, label, tipo = 'text', auto) {
    return (
      <div className="campo">
        <label htmlFor={id}>{label}</label>
        <input type={tipo} id={id} name={id} autoComplete={auto} value={form[id]} onChange={cambiar} />
        {errores[id] && <p className="error-msg">{errores[id]}</p>}
      </div>
    );
  }

  const comunas = COMUNAS_POR_REGION[form.region] || [];

  return (
    <main className="pagina-centrada">
      <section className="caja-form caja-form--ancha">
        <h2>Registro de usuario</h2>
        <form onSubmit={manejarSubmit} noValidate>
          {renderCampo('nombre', 'Nombre completo', 'text', 'name')}
          {renderCampo('correo', 'Correo', 'email', 'email')}
          {renderCampo('correoConfirmar', 'Confirmar correo', 'email', 'email')}
          {renderCampo('password', 'Contraseña', 'password', 'new-password')}
          {renderCampo('passwordConfirmar', 'Confirmar contraseña', 'password', 'new-password')}
          {renderCampo('telefono', 'Teléfono (opcional)', 'tel', 'tel')}

          <div className="campo">
            <label htmlFor="region">Región</label>
            <select id="region" name="region" value={form.region} onChange={cambiar}>
              <option value="" disabled>-- Seleccione la región --</option>
              {REGIONES.map((r) => (
                <option key={r.valor} value={r.valor}>{r.nombre}</option>
              ))}
            </select>
            {errores.region && <p className="error-msg">{errores.region}</p>}
          </div>

          <div className="campo">
            <label htmlFor="comuna">Comuna</label>
            <select id="comuna" name="comuna" value={form.comuna} onChange={cambiar}>
              <option value="" disabled>-- Seleccione la comuna --</option>
              {comunas.map((c) => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
            {errores.comuna && <p className="error-msg">{errores.comuna}</p>}
          </div>

          <button type="submit" className="btn-form btn-form--primario">Registrar</button>
        </form>
      </section>
    </main>
  );
}
