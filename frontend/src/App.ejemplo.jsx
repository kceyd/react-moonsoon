// Ejemplo de cómo conectar todo en tu App.jsx / main.jsx actual.
// Ajusta los imports de Home, Productos, Login, Registro y Carrito a los tuyos.
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
// import Home from './pages/Home'; ... etc.

export default function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      {/* <Route path="/productos" element={<Productos />} /> */}
      {/* <Route path="/login" element={<Login />} /> */}
      {/* <Route path="/registro" element={<Registro />} /> */}
      <Route path="/carrito" element={<ProtectedRoute>{/* <Carrito /> */}</ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute rol="ADMIN"><Admin /></ProtectedRoute>} />
    </Routes>
  );
}

// En main.jsx: <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>
// Login: const { login } = useAuth(); await login(email, clave);  // lanza Error con mensaje si falla
