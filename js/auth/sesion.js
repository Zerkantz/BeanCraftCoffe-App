// Sesión del panel. Verifica correo y contraseña contra los usuarios de prueba (data/usuarios.js) y guarda en
// sessionStorage solo nombre, rol y sucursal. Es un control del prototipo: la seguridad real la da MySQL (RF-12, RNF-02).
import { usuarioPorCorreo } from '../data/usuarios.js';
import { ROLES } from './permisos.js';
import { correoValido, contrasenaValida, LIMITES } from '../lib/reglas.js';

const CLAVE = 'beancraft.sesion';
let actual = null;

function leer() {
  try { const t = sessionStorage.getItem(CLAVE); return t ? JSON.parse(t) : null; } catch { return null; }
}
function guardar(s) {
  try { s ? sessionStorage.setItem(CLAVE, JSON.stringify(s)) : sessionStorage.removeItem(CLAVE); } catch { /* sin almacenamiento: la sesión vive en memoria */ }
}

export function sesion() {
  if (actual === null) actual = leer();
  // Un usuario desactivado mientras tenía sesión la pierde en la siguiente navegación (RF-17).
  if (actual) { const u = usuarioPorCorreo(actual.correo); if (!u || !u.activo) { cerrarSesion(); return null; } }
  return actual;
}

// Devuelve { ok, sesion } o { ok: false, codigo, mensaje, campo }.
export function iniciarSesion(correo, clave) {
  const c = (correo || '').trim();
  if (!c) return { ok: false, codigo: 'falta-correo', campo: 'correo', mensaje: 'Escribe tu correo.' };
  if (!correoValido(c)) return { ok: false, codigo: 'correo-invalido', campo: 'correo', mensaje: `Escribe un correo válido de hasta ${LIMITES.correo} caracteres.` };
  if (!clave) return { ok: false, codigo: 'falta-clave', campo: 'clave', mensaje: 'Escribe tu contraseña.' };
  if (!contrasenaValida(clave)) return { ok: false, codigo: 'clave-invalida', campo: 'clave', mensaje: `La contraseña tiene entre ${LIMITES.contrasenaMin} y ${LIMITES.contrasena} caracteres.` };
  const u = usuarioPorCorreo(c);
  if (!u || !u.clave || u.clave !== clave) return { ok: false, codigo: 'no-coinciden', mensaje: 'El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.' };
  if (!ROLES[u.rol]) return { ok: false, codigo: 'no-personal', mensaje: 'Este acceso es solo para administradores y personal de sucursal. Los clientes entran desde la app.' };
  if (!u.activo) return { ok: false, codigo: 'desactivado', titulo: 'Tu usuario está desactivado', mensaje: 'Pide a un administrador que lo active para poder entrar.' };
  actual = { correo: u.correo, nombre: u.nombre, ini: u.ini, rol: ROLES[u.rol], rolTxt: u.rol === 'Administrador' ? 'Administrador' : `Personal · ${u.suc}`, sucId: u.sucId, suc: u.suc };
  u.acceso = 'Ahora';
  guardar(actual);
  return { ok: true, sesion: actual };
}

export function cerrarSesion() { actual = null; guardar(null); }

// RF-23: nombre y teléfono editables; el rol no.
export function actualizarPerfil({ nombre, tel }) {
  const u = usuarioPorCorreo(actual.correo);
  if (nombre !== undefined) { u.nombre = nombre; actual.nombre = nombre; actual.ini = nombre.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase(); u.ini = actual.ini; }
  if (tel !== undefined) u.tel = tel;
  guardar(actual);
}

// RF-23: la contraseña anterior deja de funcionar.
export function cambiarContrasena(actualClave, nueva, confirma) {
  const u = usuarioPorCorreo(actual.correo);
  if (u.clave !== actualClave) return { ok: false, codigo: 'error-actual', mensaje: 'La contraseña actual no es correcta.' };
  if (!contrasenaValida(nueva)) return { ok: false, codigo: 'clave-invalida', mensaje: `Usa entre ${LIMITES.contrasenaMin} y ${LIMITES.contrasena} caracteres.` };
  if (nueva !== confirma) return { ok: false, codigo: 'no-coinciden', mensaje: 'Las contraseñas nuevas no coinciden.' };
  u.clave = nueva;
  return { ok: true };
}
