import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { setToken } from '../services/http';

const USER_KEY = 'moonsoon_usuario';
const AuthContext = createContext(null);

function leerUsuario() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuario);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, usuario: u } = await authService.login(email, password);
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);

  const registrar = useCallback(
    (nombre, email, password) => authService.registro(nombre, email, password),
    []
  );

  // Si el backend responde 401 con un token guardado (expiró), se cierra la sesión.
  useEffect(() => {
    window.addEventListener('moonsoon:unauthorized', logout);
    return () => window.removeEventListener('moonsoon:unauthorized', logout);
  }, [logout]);

  const value = useMemo(
    () => ({ usuario, esAdmin: usuario?.rol === 'ADMIN', login, logout, registrar }),
    [usuario, login, logout, registrar]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
