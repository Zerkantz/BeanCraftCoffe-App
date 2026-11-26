// Sucursales del repo móvil (data/mocks.js, 21 nov 2026): nombres, direcciones, referencias, coordenadas y horarios.
// "Abierta / Cerrada" y el horario de hoy se calculan en vivo con la hora de Hermosillo (refrescarSucursales).
import { estadoSucursal, rangoDias, hora12, distanciaKm } from '../lib/reglas.js';

export const SUCURSALES = [
  { id: 'centro', nombre: 'Centro', nombreCompleto: 'BeanCraft Centro', dir: 'Av. Obregón y Calle 5, San Luis R.C.', ref: 'Junto a la plaza principal', lat: 32.477, lon: -114.778, dias: [0, 1, 2, 3, 4, 5, 6], abre: 7, cierra: 22, pedidosHoy: 58, x: 210, y: 150 },
  { id: 'universidad', nombre: 'Kino', nombreCompleto: 'BeanCraft Kino', dir: 'Calz. Constitución y Calle 22, San Luis R.C.', ref: 'Frente a la entrada del campus', lat: 32.456, lon: -114.756, dias: [1, 2, 3, 4, 5], abre: 8, cierra: 21, pedidosHoy: 41, x: 410, y: 110 },
  { id: 'plaza', nombre: 'Bosque', nombreCompleto: 'BeanCraft Bosque', dir: 'Av. Revolución #1420, San Luis R.C.', ref: 'Segundo nivel, junto a las escaleras', lat: 32.449, lon: -114.77, dias: [0, 1, 2, 3, 4, 5, 6], abre: 7, cierra: 20, pedidosHoy: 29, x: 300, y: 300 },
];
export const SUC = Object.fromEntries(SUCURSALES.map(s => [s.id, s]));

// Completa los campos que muestran las tarjetas: abierta, hoy, estadoTxt, horario y distancia.
export function refrescarSucursales(fecha, coords = null) {
  for (const s of SUCURSALES) {
    Object.assign(s, estadoSucursal(s, fecha), { horario: `${rangoDias(s.dias)} ${hora12(s.abre)}–${hora12(s.cierra)}` });
    s.kmNum = coords ? distanciaKm(coords, s) : null;
    s.km = s.kmNum === null ? '' : `${s.kmNum.toFixed(1)} km`;
  }
  return SUCURSALES;
}
export const masCercana = () => [...SUCURSALES].filter(s => s.kmNum !== null).sort((a, b) => a.kmNum - b.kmNum)[0] || null;
