// Almacén de los datos vivos del prototipo. Las pantallas leen los arreglos de data/ directamente; aquí se guardan
// y se restauran los cambios (estado de pedidos, cupones, usuarios, comentarios y productos eliminados) en
// sessionStorage, para que sobrevivan a una recarga mientras la pestaña siga abierta.
import { PEDIDOS } from '../data/pedidos.js';
import { CUPONES } from '../data/cupones.js';
import { USUARIOS } from '../data/usuarios.js';
import { COMENTARIOS } from '../data/panel.js';
import { PRODUCTOS } from '../data/catalogo.js';

const CLAVE = 'beancraft.datos';
const suscriptores = new Set();

export const suscribir = fn => { suscriptores.add(fn); return () => suscriptores.delete(fn); };

function instantanea() {
  return {
    pedidos: PEDIDOS.map(p => [p.id, p.estado]),
    cupones: CUPONES.map(c => [c.code, c.active]),
    usuarios: USUARIOS.map(u => [u.correo, u.activo, u.clave || null, u.nombre, u.tel, u.ini]),
    comentarios: COMENTARIOS.map(c => [c.pedido, c.visible]),
    eliminados: PRODUCTOS.filter(p => p.eliminado).map(p => p.id),
  };
}

export function guardar() {
  try { sessionStorage.setItem(CLAVE, JSON.stringify(instantanea())); } catch { /* sin almacenamiento: los cambios viven en memoria */ }
  suscriptores.forEach(fn => fn());
}

export function restaurar() {
  let d = null;
  try { d = JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); } catch { d = null; }
  if (!d) return false;
  const por = (arr, k) => Object.fromEntries(arr.map(x => [x[0], x.slice(1)]));
  const ped = por(d.pedidos || [], 'id'), cup = por(d.cupones || []), usu = por(d.usuarios || []), com = por(d.comentarios || []);
  PEDIDOS.forEach(p => { if (ped[p.id]) p.estado = ped[p.id][0]; });
  CUPONES.forEach(c => { if (cup[c.code]) c.active = cup[c.code][0]; });
  USUARIOS.forEach(u => { const x = usu[u.correo]; if (x) { [u.activo] = x; if (x[1]) u.clave = x[1]; if (x[2]) u.nombre = x[2]; if (x[3]) u.tel = x[3]; if (x[4]) u.ini = x[4]; } });
  COMENTARIOS.forEach(c => { if (com[c.pedido]) c.visible = com[c.pedido][0]; });
  (d.eliminados || []).forEach(id => { const p = PRODUCTOS.find(x => x.id === id); if (p) p.eliminado = true; });
  return true;
}

// Vuelve a los datos de prueba originales (botón de la guía).
export function reiniciarDatos() {
  try { sessionStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
}
