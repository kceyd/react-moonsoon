import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import RutaAdmin from './components/RutaAdmin.jsx';
import Home from './pages/Home.jsx';
import Productos from './pages/Productos.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Carrito from './pages/Carrito.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <div className="app__contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route
            path="/admin"
            element={
              <RutaAdmin>
                <Admin />
              </RutaAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
