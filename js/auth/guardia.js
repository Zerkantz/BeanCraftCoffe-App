// Guardia de rutas del panel: sin sesión → login (y regreso a la ruta pedida); sin permiso → A-19.
import { sesion } from './sesion.js';
import { puedeVer } from './permisos.js';

export function revisarAcceso(pantalla, estado) {
  const s = sesion();
  if (!s) return { tipo: 'login' };
  if (!puedeVer(s.rol, pantalla, estado)) return { tipo: 'sin-permiso', sesion: s };
  return { tipo: 'ok', sesion: s };
}
