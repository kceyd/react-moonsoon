export function formatearCLP(valor) {
  return Number(valor).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

/** Lee un JSON de localStorage; si falla o no existe devuelve el valor por defecto. */
export function leerStorage(clave, porDefecto) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardarStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}
