// Consultas de presentación sobre los registros disponibles; no modifica los datos.
import { partes, fechaCorta } from './reglas.js';
import { totales, ESTADOS } from '../data/pedidos.js';
import { SUC } from '../data/sucursales.js';
import { P } from '../data/catalogo.js';

// Los registros originales sin fecha pertenecen a la jornada indicada en su fuente.
export const FECHA_DATOS = '2026-11-20';
export function fechaValida(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso || '') && Number(iso.slice(0, 4)) >= 1900 && Number(iso.slice(0, 4)) <= 2100 && !Number.isNaN(Date.parse(iso)) && new Date(iso).toISOString().slice(0, 10) === iso;
}
export const moverFecha = (iso, dias) => new Date(Date.parse(iso + 'T12:00:00Z') + dias * 86400000).toISOString().slice(0, 10);
export function rangoRapido(nombre, hoy = partes().iso) {
  const inicio = { Hoy: hoy, Ayer: moverFecha(hoy, -1), 'Últimos 7 días': moverFecha(hoy, -6), 'Últimos 30 días': moverFecha(hoy, -29), 'Este mes': hoy.slice(0, 8) + '01' };
  return { desde: inicio[nombre] || hoy, hasta: nombre === 'Ayer' ? moverFecha(hoy, -1) : hoy };
}
export function rangoPanel(params = {}, dias = 7) {
  const valido = fechaValida(params.desde) && fechaValida(params.hasta) && params.desde <= params.hasta;
  return valido ? { desde: params.desde, hasta: params.hasta } : { desde: moverFecha(FECHA_DATOS, 1 - dias), hasta: FECHA_DATOS };
}
export const textoRango = ({ desde, hasta }) => desde === hasta ? fechaCorta(desde) : `${fechaCorta(desde)} – ${fechaCorta(hasta)}`;
export function fechaRegistro(r) {
  if (fechaValida(r.fechaISO)) return r.fechaISO;
  if (fechaValida(r.fecha)) return r.fecha;
  if (/^Ayer/.test(r.fecha || '')) return moverFecha(FECHA_DATOS, -1);
  const m = /^(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)(?:\s+(\d{4}))?/.exec(r.fecha || '');
  if (m) return `${m[3] || FECHA_DATOS.slice(0, 4)}-${String(['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'].indexOf(m[2]) + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return FECHA_DATOS;
}
export function filtrarPanel(registros, rango, sucursal = 'Todas') {
  return registros.filter(r => {
    const fecha = fechaRegistro(r);
    return fecha >= rango.desde && fecha <= rango.hasta && (sucursal === 'Todas' || r.suc === sucursal || SUC[r.suc]?.nombre === sucursal);
  });
}
export function resumenRegistros(pedidos, comentarios = []) {
  const ventas = pedidos.reduce((s, p) => s + totales(p).total, 0);
  const productos = new Map(), cupones = new Map();
  pedidos.forEach(p => {
    p.lineas.forEach(l => productos.set(l.prod, (productos.get(l.prod) || 0) + l.cant));
    if (p.cupon) { const [n, d] = cupones.get(p.cupon.codigo) || [0, 0]; cupones.set(p.cupon.codigo, [n + 1, d + totales(p).desc]); }
  });
  return {
    cantidad: pedidos.length, ventas, ticket: pedidos.length ? ventas / pedidos.length : 0,
    calificacion: comentarios.length ? comentarios.reduce((s, c) => s + c.cal, 0) / comentarios.length : null,
    cuponesUsados: pedidos.filter(p => p.cupon).length,
    top: [...productos].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => [P[id]?.nombre || id, n]),
    cupones: [...cupones].map(([codigo, [n, d]]) => [codigo, n, d]),
    estados: ESTADOS.map(e => [e.id, pedidos.filter(p => p.estado === e.id).length]),
    sucursales: [...new Set(pedidos.map(p => p.suc))].map(id => [SUC[id]?.nombre || id, pedidos.filter(p => p.suc === id).length]),
  };
}
export function serieVentas(pedidos, rango, agrupar = 'dia') {
  const dias = Math.round((Date.parse(rango.hasta) - Date.parse(rango.desde)) / 86400000) + 1;
  const tipo = dias > 366 ? 'ano' : dias > 93 ? 'mes' : agrupar === 'semana' || dias > 31 ? 'semana' : 'dia';
  const anioBase = Number(rango.desde.slice(0, 4)), pasoAnios = Math.max(1, Math.ceil((Number(rango.hasta.slice(0, 4)) - anioBase + 1) / 12));
  const clave = iso => tipo === 'ano' ? String(anioBase + Math.floor((Number(iso.slice(0, 4)) - anioBase) / pasoAnios) * pasoAnios) + '-01-01' : tipo === 'mes' ? iso.slice(0, 7) + '-01' : tipo === 'semana' ? moverFecha(iso, -((new Date(iso + 'T12:00Z').getUTCDay() + 6) % 7)) : iso;
  const ventas = new Map();
  // Agrupa intervalos largos para mantener legible la gráfica.
  for (let dia = rango.desde; dia <= rango.hasta; dia = moverFecha(dia, 1)) ventas.set(clave(dia), 0);
  pedidos.forEach(p => { const k = clave(fechaRegistro(p)); ventas.set(k, (ventas.get(k) || 0) + totales(p).total); });
  return { tipo, puntos: [...ventas].map(([iso, total]) => [tipo === 'ano' ? iso.slice(0, 4) : fechaCorta(iso).replace(/ \d{4}$/, ''), total]) };
}
