import { useState } from 'react';
import AdminUsuarios from './AdminUsuarios';
import AdminProductos from './AdminProductos';

export default function Admin() {
  const [tab, setTab] = useState('usuarios');
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Panel de administración</h1>
      <nav style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setTab('usuarios')} disabled={tab === 'usuarios'}>Usuarios</button>
        <button onClick={() => setTab('productos')} disabled={tab === 'productos'}>Productos</button>
      </nav>
      {tab === 'usuarios' ? <AdminUsuarios /> : <AdminProductos />}
    </main>
  );
}
