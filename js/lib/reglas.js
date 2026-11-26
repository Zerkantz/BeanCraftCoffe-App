// Reglas de negocio compartidas por el sitio y el panel.
// Hora local: America/Hermosillo (UTC−07:00 todo el año, sin horario de verano), igual que lib/rules.js del repo.

const OFFSET_MS = 7 * 3600000;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Fecha de referencia. Por defecto, el reloj real; ?ahora=2026-11-20T08:15 la fija (útil para capturas de Figma).
let fijada = null;
export function fijarAhora(texto) {
  if (!texto) { fijada = null; return; }
  const ms = Date.parse(`${texto}${/[zZ]|[+-]\d\d:?\d\d$/.test(texto) ? '' : '-07:00'}`);
  fijada = Number.isNaN(ms) ? null : new Date(ms);
}
export const ahora = () => fijada || new Date();

// Partes de la fecha en hora de Hermosillo.
export function partes(fecha = ahora()) {
  const d = new Date(+fecha - OFFSET_MS);
  return { anio: d.getUTCFullYear(), mes: d.getUTCMonth(), dia: d.getUTCDate(), semana: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes(), iso: d.toISOString().slice(0, 10) };
}

export function hora12(h, m = 0) {
  const suf = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${suf}`;
}

export const fechaLarga = iso => { const [a, m, d] = iso.split('-').map(Number); return `${d} de ${MESES[m - 1]}${a !== partes().anio ? ` de ${a}` : ''}`; };
export const fechaCorta = iso => { const [a, m, d] = iso.split('-').map(Number); return `${d} ${MESES_CORTOS[m - 1]} ${a}`; };
export const nombreDia = n => DIAS[n];

// Rango de días legible: [1,2,3,4,5] → "Lun–Vie"; todos → "Lun–Dom".
export function rangoDias(dias) {
  if (dias.length === 7) return 'Lun–Dom';
  const orden = [...dias].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const consecutivos = orden.every((d, i) => i === 0 || (orden[i - 1] + 1) % 7 === d);
  return consecutivos ? `${DIAS_CORTOS[orden[0]]}–${DIAS_CORTOS[orden.at(-1)]}` : orden.map(d => DIAS_CORTOS[d]).join(', ');
}

// Estado de una sucursal en este momento: abierta o cerrada, horario de hoy y próximo cambio.
export function estadoSucursal(s, fecha = ahora()) {
  const { semana, min } = partes(fecha);
  const abreHoy = s.dias.includes(semana);
  const abre = s.abre * 60, cierra = s.cierra * 60;
  const abierta = abreHoy && min >= abre && min < cierra;
  const hoy = abreHoy ? `${hora12(s.abre)} a ${hora12(s.cierra)}` : 'Cerrada hoy';
  let estadoTxt;
  if (abierta) estadoTxt = `Abierta hasta las ${hora12(s.cierra)}`;
  else if (abreHoy && min < abre) estadoTxt = `Cerrada, abre hoy a las ${hora12(s.abre)}`;
  else {
    let k = 1;
    while (k < 8 && !s.dias.includes((semana + k) % 7)) k++;
    estadoTxt = k === 1 ? `Cerrada, abre mañana a las ${hora12(s.abre)}` : `Cerrada, abre el ${DIAS[(semana + k) % 7]} a las ${hora12(s.abre)}`;
  }
  return { abierta, hoy, estadoTxt };
}

// Distancia en km entre dos coordenadas (fórmula del haversine).
export function distanciaKm(a, b) {
  const rad = x => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// RN-04: un pedido solo avanza al estado siguiente, sin saltos.
export const ORDEN_ESTADOS = ['recibido', 'preparando', 'listo', 'entregado'];
export function siguienteEstado(estado) {
  const i = ORDEN_ESTADOS.indexOf(estado);
  return i >= 0 && i < ORDEN_ESTADOS.length - 1 ? ORDEN_ESTADOS[i + 1] : null;
}
export function puedeCambiar(de, a) { return siguienteEstado(de) === a; }

// RN-01: un cupón se acepta si está activo y la fecha cae en su vigencia.
export function estadoCupon(c, fecha = ahora()) {
  const { iso } = partes(fecha);
  if (!c.active) return 'desactivado';
  if (iso < c.start) return 'programado';
  if (iso > c.end) return 'vencido';
  return 'activo';
}

// Validaciones con los mismos límites que data/limits.js del repo.
export const LIMITES = { nombre: 100, telefono: 10, correo: 100, contrasenaMin: 6, contrasena: 50, busqueda: 50, mensaje: 200 };
export const correoValido = c => c.length <= LIMITES.correo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
export const contrasenaValida = c => c.length >= LIMITES.contrasenaMin && c.length <= LIMITES.contrasena;
export const telefonoValido = t => /^\d{10}$/.test(t.replace(/\s/g, ''));
