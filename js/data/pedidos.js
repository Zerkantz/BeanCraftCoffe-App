// Pedidos de prueba del panel (RF-16): hoy, viernes 20 nov 2026 por la mañana, en las tres sucursales.
// Totales con RN-02. El arreglo es la fuente viva: el tablero lo modifica al avanzar un pedido (RN-04).
import { precioLinea } from './catalogo.js';

export const ESTADOS = [
  { id: 'recibido', label: 'Recibido', icono: 'bandeja', mascota: 'grano', copy: 'Ya lo tenemos.', accion: 'Preparar' },
  { id: 'preparando', label: 'Preparando', icono: 'taza-vapor', mascota: 'taza', copy: 'Manos a la obra.', accion: 'Marcar listo' },
  { id: 'listo', label: 'Listo', icono: 'check', mascota: 'espuma', copy: 'Pasa por él.', accion: 'Entregar' },
  { id: 'entregado', label: 'Entregado', icono: 'bolsa', mascota: 'croissant', copy: 'Buen provecho.', accion: null },
];
export const CANCELADO = { id: 'cancelado', label: 'Cancelado', icono: 'x' };

const L = (prod, tam, leche, endu, extras = [], cant = 1) => ({ prod, tam, leche, endu, extras, cant });
export const PEDIDOS = [
  { id: 1042, hora: '8:12', cliente: 'Ana Lucía R.', tel: '653 128 4410', estado: 'recibido', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'centro', lineas: [L('latte_caramelo', 'mediano', 'avena', 'sin', [], 2)] },
  { id: 1041, hora: '8:10', cliente: 'Jorge M.', tel: '653 201 7788', estado: 'recibido', pago: 'Efectivo', recoger: 'Programado · hoy 9:30 am', programado: true, suc: 'centro', lineas: [L('iced_latte', 'grande', 'entera', 'stevia', ['shot']), L('concha_vainilla')] },
  { id: 1040, hora: '8:07', cliente: 'Karla P.', tel: '653 334 0921', estado: 'recibido', pago: 'Tarjeta al recoger', recoger: 'Ahora', cupon: { codigo: 'BIENVENIDA', monto: 30 }, suc: 'centro', lineas: [L('capuchino_duo', 'chico', 'deslactosada', 'azucar')] },
  { id: 1038, hora: '8:03', cliente: 'Luis F.', tel: '653 990 1203', estado: 'recibido', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('frappe_supremo', 'mediano', 'entera', 'sin', ['crema', 'caramelo'])] },
  { id: 1039, hora: '7:58', cliente: 'Mariana T.', tel: '653 402 5566', estado: 'preparando', pago: 'Tarjeta al recoger', recoger: 'Programado · hoy 8:30 am', programado: true, cupon: { codigo: 'PRIMER15', monto: 0, pct: 15 }, suc: 'centro', lineas: [L('chai_latte', 'grande', 'almendra', 'miel'), L('croissant_mantequilla')] },
  { id: 1036, hora: '7:55', cliente: 'Diego S.', tel: '653 118 3390', estado: 'preparando', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('matcha_latte', 'mediano', 'avena', 'stevia')] },
  { id: 1037, hora: '7:48', cliente: 'Sofía G.', tel: '653 776 2014', estado: 'listo', pago: 'Tarjeta al recoger', recoger: 'Ahora', cupon: { codigo: 'PRIMER15', monto: 0, pct: 15 }, suc: 'centro', lineas: [L('latte_caramelo', 'mediano', 'entera', 'sin', ['shot']), L('dona_fresa')] },
  { id: 1035, hora: '7:40', cliente: 'Andrés V.', tel: '653 450 8812', estado: 'entregado', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('flat_white', 'chico', 'entera', 'sin')], cal: 5, comentario: 'Rapidísimo y bien caliente.' },
  { id: 1034, hora: '7:38', cliente: 'Paola C.', tel: '653 207 6643', estado: 'entregado', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'centro', lineas: [L('cold_brew', 'grande', 'entera', 'sin')], cal: 4, comentario: 'Muy bueno, un poco aguado.' },
  { id: 1033, hora: '7:35', cliente: 'Ricardo M.', tel: '653 123 4567', estado: 'entregado', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('chocolate_cacao', 'mediano', 'deslactosada', 'azucar')] },
  { id: 1032, hora: '7:31', cliente: 'Valeria N.', tel: '653 889 2201', estado: 'entregado', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'centro', lineas: [L('iced_latte', 'mediano', 'avena', 'sin')] },
  { id: 1031, hora: '7:28', cliente: 'Héctor O.', tel: '653 667 1180', estado: 'entregado', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('oreja_hojaldrada', null, null, null, [], 2)] },
  { id: 1030, hora: '7:25', cliente: 'Elena R.', tel: '653 300 4417', estado: 'entregado', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'centro', lineas: [L('te_durazno', 'grande', 'entera', 'sin')] },
  { id: 1029, hora: '7:22', cliente: 'Iván L.', tel: '653 512 9938', estado: 'entregado', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('capuchino_duo', 'mediano', 'entera', 'azucar')] },
  { id: 1028, hora: '7:20', cliente: 'Fernanda Q.', tel: '653 245 7701', estado: 'entregado', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'centro', lineas: [L('frappe_beancraft', 'grande', 'entera', 'sin', ['crema'])] },
  { id: 1027, hora: '7:18', cliente: 'Tomás B.', tel: '653 678 0045', estado: 'entregado', pago: 'Efectivo', recoger: 'Ahora', suc: 'centro', lineas: [L('cuernito_mantequilla')] },
  { id: 1043, hora: '8:14', cliente: 'Renata A.', tel: '653 311 2090', estado: 'recibido', pago: 'Efectivo', recoger: 'Ahora', suc: 'universidad', lineas: [L('cold_brew', 'mediano', 'entera', 'sin', [], 2)] },
  { id: 1044, hora: '8:09', cliente: 'Gael H.', tel: '653 870 4412', estado: 'preparando', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'plaza', lineas: [L('refresher_duo', 'grande', 'entera', 'sin'), L('dona_fresa')] },
  { id: 1026, hora: '7:44', cliente: 'Camila Z.', tel: '653 502 7741', estado: 'listo', pago: 'Efectivo', recoger: 'Ahora', suc: 'universidad', lineas: [L('matcha_latte', 'chico', 'almendra', 'miel')] },
  { id: 1025, hora: '7:15', cliente: 'Bruno E.', tel: '653 260 1937', estado: 'entregado', pago: 'Tarjeta al recoger', recoger: 'Ahora', suc: 'plaza', lineas: [L('flat_white', 'mediano', 'avena', 'sin')] },
];
export function totales(ped) {
  const sub = ped.lineas.reduce((s, l) => s + precioLinea(l) * l.cant, 0);
  let desc = 0;
  if (ped.cupon) desc = ped.cupon.pct ? Math.round(sub * ped.cupon.pct) / 100 : ped.cupon.monto;
  return { sub, desc, total: sub - desc };
}