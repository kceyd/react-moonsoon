import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** <ProtectedRoute>…</ProtectedRoute> exige sesión; con rol="ADMIN" exige ese rol. */
export default function ProtectedRoute({ children, rol }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />;
  return children;
}
