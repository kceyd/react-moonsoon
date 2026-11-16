import { useCallback, useEffect, useState } from 'react';
import { usuariosService } from '../services/usuariosService';
import { useAuth } from '../context/AuthContext';

const VACIO = { nombre: '', email: '', password: '', rol: 'CLIENTE', activo: true };

export default function AdminUsuarios() {
  const { usuario: yo } = useAuth();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try { setLista(await usuariosService.listar()); }
    catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const accion = async (fn) => {
    setError('');
    try { await fn(); await cargar(); }
    catch (e) { setError(e.message); }
  };

  const guardar = (e) => {
    e.preventDefault();
    accion(async () => {
      if (editId) await usuariosService.actualizar(editId, form);
      else await usuariosService.crear(form);
      setForm(VACIO);
      setEditId(null);
    });
  };

  const editar = (u) => {
    setEditId(u.id);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, activo: u.activo });
  };

  const cancelar = () => { setEditId(null); setForm(VACIO); };

  return (
    <section>
      <h2>Usuarios</h2>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={guardar} style={{ display: 'grid', gap: '.5rem', maxWidth: 360, marginBottom: '1rem' }}>
        <h3>{editId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required />
        <input name="email" type="email" placeholder="Correo" value={form.email} onChange={cambiar} required />
        <input
          name="password" type="password" value={form.password} onChange={cambiar}
          placeholder={editId ? 'Nueva clave (opcional)' : 'Clave (mín. 6)'} required={!editId}
        />
        <select name="rol" value={form.rol} onChange={cambiar}>
          <option value="CLIENTE">CLIENTE</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <label><input name="activo" type="checkbox" checked={form.activo} onChange={cambiar} /> Activo</label>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button type="submit">{editId ? 'Guardar cambios' : 'Crear'}</button>
          {editId && <button type="button" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {cargando ? <p>Cargando usuarios…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {lista.map((u) => {
                const soyYo = u.email === yo?.email;
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.rol} disabled={soyYo}
                        onChange={(e) => accion(() => usuariosService.cambiarRol(u.id, e.target.value))}
                      >
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                    <td style={{ display: 'flex', gap: '.25rem' }}>
                      <button onClick={() => editar(u)}>Editar</button>
                      <button disabled={soyYo} onClick={() => accion(() => usuariosService.cambiarEstado(u.id, !u.activo))}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        disabled={soyYo}
                        onClick={() => window.confirm(`¿Eliminar a ${u.email}?`) && accion(() => usuariosService.eliminar(u.id))}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
