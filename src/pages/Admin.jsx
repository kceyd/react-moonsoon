import { useState } from 'react';
import { useProducts } from '../context/ProductsContext.jsx';
import { formatearCLP } from '../utils/format.js';

const FORM_VACIO = { nombre: '', precio: '', imagen: '/img/audifonos.jpg' };

export default function Admin() {
  const { productos, crear, actualizar, eliminar, restaurar } = useProducts();
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});

  function cambiar(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validar() {
    const e = {};
    if (form.nombre.trim() === '') e.nombre = 'Ingresa el nombre del producto.';
    if (form.precio === '' || Number(form.precio) <= 0) e.precio = 'El precio debe ser mayor a 0.';
    if (form.imagen.trim() === '') e.imagen = 'Ingresa la ruta o URL de la imagen.';
    return e;
  }

  function guardar(ev) {
    ev.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    const datos = { nombre: form.nombre.trim(), precio: Number(form.precio), imagen: form.imagen.trim() };
    if (editandoId) actualizar(editandoId, datos);
    else crear(datos);
    cancelar();
  }

  function editar(producto) {
    setEditandoId(producto.id);
    setForm({ nombre: producto.nombre, precio: String(producto.precio), imagen: producto.imagen });
    setErrores({});
  }

  function cancelar() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrores({});
  }

  function borrar(producto) {
    if (window.confirm(`¿Eliminar "${producto.nombre}"?`)) {
      eliminar(producto.id);
      if (editandoId === producto.id) cancelar();
    }
  }

  return (
    <main className="admin">
      <h1>Panel de administración</h1>

      <section className="caja-form caja-form--ancha admin__form">
        <h2>{editandoId ? 'Editar producto' : 'Nuevo producto'}</h2>
        <form onSubmit={guardar} noValidate>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={cambiar} />
            {errores.nombre && <p className="error-msg">{errores.nombre}</p>}
          </div>
          <div className="campo">
            <label htmlFor="precio">Precio (CLP)</label>
            <input id="precio" name="precio" type="number" min="1" value={form.precio} onChange={cambiar} />
            {errores.precio && <p className="error-msg">{errores.precio}</p>}
          </div>
          <div className="campo">
            <label htmlFor="imagen">Imagen (ruta o URL)</label>
            <input id="imagen" name="imagen" value={form.imagen} onChange={cambiar} />
            {errores.imagen && <p className="error-msg">{errores.imagen}</p>}
          </div>
          <button type="submit" className="btn-form btn-form--primario">
            {editandoId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editandoId && (
            <button type="button" className="btn-form btn-form--secundario" onClick={cancelar}>Cancelar</button>
          )}
        </form>
      </section>

      <section className="admin__lista">
        <div className="admin__lista-encabezado">
          <h2>Productos ({productos.length})</h2>
          <button type="button" className="btn-form btn-form--secundario btn-auto" onClick={restaurar}>
            Restaurar catálogo inicial
          </button>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.imagen} alt={p.nombre} className="tabla__img" /></td>
                  <td>{p.nombre}</td>
                  <td>{formatearCLP(p.precio)}</td>
                  <td className="tabla__acciones">
                    <button type="button" className="btn-tabla" onClick={() => editar(p)}>Editar</button>
                    <button type="button" className="btn-tabla btn-tabla--peligro" onClick={() => borrar(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
