import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Protege una ruta: solo deja pasar a usuarios con rol admin. */
export default function RutaAdmin({ children }) {
  const { sesion, esAdmin } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/" replace />;
  return children;
}
