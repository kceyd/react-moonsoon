import { createContext, useContext, useEffect, useState } from 'react';
import { leerStorage, guardarStorage } from '../utils/format.js';

export const CLAVE_USUARIOS = 'moonsoon_usuarios';
export const CLAVE_SESION = 'moonsoon_sesion';

// Usuario administrador por defecto (para probar el panel /admin)
const ADMIN_POR_DEFECTO = {
  nombre: 'Administrador',
  correo: 'admin@moonsoon.cl',
  clave: 'Admin123!',
  telefono: '',
  region: 'rm',
  comuna: 'santiago',
  rol: 'admin',
};

function cargarUsuarios() {
  const usuarios = leerStorage(CLAVE_USUARIOS, []);
  if (!usuarios.some((u) => u.rol === 'admin')) {
    const conAdmin = [...usuarios, ADMIN_POR_DEFECTO];
    guardarStorage(CLAVE_USUARIOS, conAdmin);
    return conAdmin;
  }
  return usuarios;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(cargarUsuarios);
  const [sesion, setSesion] = useState(() => leerStorage(CLAVE_SESION, null));

  useEffect(() => {
    guardarStorage(CLAVE_USUARIOS, usuarios);
  }, [usuarios]);

  useEffect(() => {
    if (sesion) guardarStorage(CLAVE_SESION, sesion);
    else localStorage.removeItem(CLAVE_SESION);
  }, [sesion]);

  function correoExiste(correo) {
    return usuarios.some((u) => u.correo === correo.trim());
  }

  function registrar(datos) {
    if (correoExiste(datos.correo)) return { ok: false, error: 'Ese correo ya está registrado.' };
    setUsuarios((prev) => [...prev, { ...datos, rol: 'cliente' }]);
    return { ok: true };
  }

  function login(correo, clave) {
    const usuario = usuarios.find((u) => u.correo === correo.trim());
    if (!usuario) return { ok: false, error: 'No existe una cuenta con ese correo.' };
    if (usuario.clave !== clave) return { ok: false, error: 'La contraseña es incorrecta.' };
    const datosSesion = { correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol || 'cliente' };
    setSesion(datosSesion);
    return { ok: true, usuario: datosSesion };
  }

  function logout() {
    setSesion(null);
  }

  const value = { usuarios, sesion, esAdmin: sesion?.rol === 'admin', correoExiste, registrar, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
