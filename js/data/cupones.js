// Cupones del repo móvil (data/mocks.js, 21 nov 2026) con sus reglas. El panel suma usos y estado;
// el sitio muestra como promoción solo los activos y vigentes (RN-01), sin acción de pedido.
import { estadoCupon, fechaLarga, fechaCorta } from '../lib/reglas.js';

export const CUPONES = [
  { code: 'AVENA10', type: 'fixed', value: 10, label: '-$10 en tu latte de avena', description: 'Un latte suave, un antojo menos.', badge: '-$10', productId: 'latte_caramelo', milk: 'avena', terms: 'Solo Latte de caramelo con leche de avena. Un uso por cliente.', active: true, start: '2026-01-01', end: '2026-11-30', usos: 11, descuento: 110, mascota: 'taza' },
  { code: 'FRIO2X1', type: 'bogo', label: 'Jueves de cold brew', description: '2 × 1 para compartir o quedarte con los dos.', badge: '2 × 1', productId: 'cold_brew', days: [4], terms: 'Solo jueves. Dos Cold brew, gratis el de menor precio. Un uso por cliente.', active: true, start: '2026-11-01', end: '2026-11-30', usos: 6, descuento: 90, mascota: 'hielito' },
  { code: 'PRIMER15', type: 'percent', value: 15, label: 'Tu primer pedido, -15%', description: 'La primera ronda de antojos empieza contigo.', badge: '-15%', firstOrder: true, terms: 'Solo tu primer pedido. Un uso por cliente.', active: true, start: '2026-01-01', end: '2028-12-31', usos: 9, descuento: 96, mascota: 'grano' },
  { code: 'BIENVENIDA', type: 'fixed', value: 30, label: '-$30 en tu pedido', description: 'Un detalle para estrenar la app.', badge: '-$30', terms: 'Un uso por cliente.', active: true, start: '2026-01-01', end: '2028-12-31', usos: 5, descuento: 150, mascota: 'croissant' },
  { code: 'OTONO20', type: 'percent', value: 20, label: '-20% en tu pedido', description: 'Temporada de antojos de otoño.', badge: '-20%', terms: 'Un uso por cliente.', active: true, start: '2026-09-01', end: '2026-11-30', usos: 14, descuento: 182, mascota: 'espuma' },
  { code: 'VENCIDO25', type: 'fixed', value: 25, label: '-$25', description: 'Cupón de lanzamiento.', badge: '-$25', terms: 'Un uso por cliente.', active: true, start: '2025-01-01', end: '2025-12-31', usos: 37, descuento: 925, mascota: 'grano' },
  { code: 'INACTIVO', type: 'fixed', value: 15, label: '-$15', description: 'Cupón en pausa.', badge: '-$15', terms: 'Un uso por cliente.', active: false, start: '2026-01-01', end: '2028-12-31', usos: 0, descuento: 0, mascota: 'hielito' },
];

const TIPO = { fixed: 'Monto fijo', percent: 'Porcentaje', bogo: '2 × 1' };
const valorTxt = c => (c.type === 'fixed' ? `$${c.value.toFixed(2)}` : c.type === 'percent' ? `${c.value} %` : '2 × 1');

// Fila del panel (A-10): mismas claves que usaba la v1.
export const filaCupon = (c, fecha) => ({ codigo: c.code, desc: c.label, tipo: TIPO[c.type], valor: valorTxt(c), desde: fechaCorta(c.start), hasta: fechaCorta(c.end), usos: c.usos, estado: estadoCupon(c, fecha), ref: c });

// Promoción del sitio: solo cupones activos y en vigencia.
export function promosVigentes(fecha) {
  return CUPONES.filter(c => estadoCupon(c, fecha) === 'activo').map(c => ({
    id: c.code.toLowerCase(), titulo: c.label, texto: `${c.description} ${c.terms}`, codigo: c.code, etiqueta: c.badge, mascota: c.mascota,
    vigencia: c.end >= '2028-01-01' ? 'Vigente todo el año' : c.days ? `Jueves, hasta el ${fechaLarga(c.end)}` : `Hasta el ${fechaLarga(c.end)}`,
  }));
}
