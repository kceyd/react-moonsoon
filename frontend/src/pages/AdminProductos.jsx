import { useCallback, useEffect, useState } from 'react';
import { productosService } from '../services/productosService';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '' };

export default function AdminProductos() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try { setLista(await productosService.listar()); }
    catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const accion = async (fn) => {
    setError('');
    try { await fn(); await cargar(); }
    catch (e) { setError(e.message); }
  };

  const guardar = (e) => {
    e.preventDefault();
    const datos = { ...form, precio: Number(form.precio), stock: Number(form.stock) };
    accion(async () => {
      if (editId) await productosService.actualizar(editId, datos);
      else await productosService.crear(datos);
      setForm(VACIO);
      setEditId(null);
    });
  };

  const editar = (p) => {
    setEditId(p.id);
    setForm({
      nombre: p.nombre, descripcion: p.descripcion ?? '', precio: p.precio, stock: p.stock,
      categoria: p.categoria ?? '', imagen: p.imagen ?? '',
    });
  };

  const cancelar = () => { setEditId(null); setForm(VACIO); };

  return (
    <section>
      <h2>Productos</h2>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={guardar} style={{ display: 'grid', gap: '.5rem', maxWidth: 360, marginBottom: '1rem' }}>
        <h3>{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={cambiar} />
        <input name="precio" type="number" min="0.01" step="0.01" placeholder="Precio" value={form.precio} onChange={cambiar} required />
        <input name="stock" type="number" min="0" step="1" placeholder="Stock" value={form.stock} onChange={cambiar} required />
        <input name="categoria" placeholder="Categoría" value={form.categoria} onChange={cambiar} />
        <input name="imagen" placeholder="URL de la imagen" value={form.imagen} onChange={cambiar} />
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button type="submit">{editId ? 'Guardar cambios' : 'Crear'}</button>
          {editId && <button type="button" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {cargando ? <p>Cargando productos…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{p.precio}</td>
                  <td>{p.stock}</td>
                  <td style={{ display: 'flex', gap: '.25rem' }}>
                    <button onClick={() => editar(p)}>Editar</button>
                    <button onClick={() => window.confirm(`¿Eliminar "${p.nombre}"?`) && accion(() => productosService.eliminar(p.id))}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
