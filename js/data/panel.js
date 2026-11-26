// Datos de prueba del panel: comentarios (RF-18), respaldos (RF-19), resumen (RF-20) y notificaciones (RF-10).
import { PEDIDOS } from './pedidos.js';

export const COMENTARIOS = [
  { cliente: 'Andrés V.', pedido: 1035, prod: 'Flat White', suc: 'Centro', cal: 5, txt: 'Rapidísimo y bien caliente.', fecha: 'Hoy, 7:52 am', visible: true },
  { cliente: 'Paola C.', pedido: 1034, prod: 'Americano & Cold Brew', suc: 'Centro', cal: 4, txt: 'Muy bueno, un poco aguado.', fecha: 'Hoy, 7:49 am', visible: true },
  { cliente: 'Usuario 2291', pedido: 1011, prod: 'Frappé Supremo', suc: 'Bosque', cal: 1, txt: 'Mensaje con lenguaje ofensivo (oculto por moderación).', fecha: 'Ayer, 5:12 pm', visible: false },
  { cliente: 'Mariela S.', pedido: 1008, prod: 'Concha de vainilla', suc: 'Kino', cal: 5, txt: 'La concha estaba recién hecha, perfecta.', fecha: 'Ayer, 9:03 am', visible: true },
  { cliente: 'Óscar D.', pedido: 1002, prod: 'Matcha latte', suc: 'Kino', cal: 3, txt: 'Le faltó un poco de dulce.', fecha: '18 nov, 6:20 pm', visible: true },
  { cliente: 'Lucía H.', pedido: 997, prod: 'Iced Latte', suc: 'Centro', cal: 5, txt: 'Mi favorito de siempre.', fecha: '18 nov, 1:15 pm', visible: true },
];

export const RESPALDOS = [
  { fecha: '19 nov 2026, 11:00 pm', tam: '4.8 MB', por: 'Ricardo Martínez', tablas: 14 },
  { fecha: '18 nov 2026, 11:00 pm', tam: '4.7 MB', por: 'Ricardo Martínez', tablas: 14 },
  { fecha: '15 nov 2026, 6:30 pm', tam: '4.5 MB', por: 'Ricardo Martínez', tablas: 14 },
  { fecha: '8 nov 2026, 11:00 pm', tam: '4.1 MB', por: 'Ricardo Martínez', tablas: 14 },
];

// Resumen (RF-20). Rango: últimos 7 días, todas las sucursales.
export const DASH = {
  dias: [['Sáb 14', 1180], ['Dom 15', 1320], ['Lun 16', 980], ['Mar 17', 1410], ['Mié 18', 1500], ['Jue 19', 1620], ['Vie 20', 1830]],
  semanas: [['26 oct', 7420], ['2 nov', 8130], ['9 nov', 8890], ['16 nov', 9840]],
  top: [['Iced Latte', 24], ['Latte de caramelo', 19], ['Frappé Supremo', 17], ['Capuchino clásico', 14], ['Concha de vainilla', 12]],
  porSucursal: [['Centro', 58], ['Kino', 41], ['Bosque', 29]],
  porEstado: [['recibido', 4], ['preparando', 2], ['listo', 1], ['entregado', 121]],
  cupones: [['OTONO20', 14, 182], ['AVENA10', 11, 110], ['PRIMER15', 9, 96], ['FRIO2X1', 6, 90]],
  calSuc: [['Centro', 4.7], ['Kino', 4.5], ['Bosque', 4.6]],
  calProd: [['Frappé Supremo', 4.9], ['Iced Latte', 4.8], ['Capuchino clásico', 4.7], ['Chai Latte', 4.6], ['Matcha latte', 4.3]],
};


export const NOTIFICACIONES = PEDIDOS.slice(0, 9).map((p, i) => ({ ...p, cuando: ['8:12', '8:10', '8:07', '8:04', '8:01', '7:59', '7:56', '7:53', '7:50'][i] }));
