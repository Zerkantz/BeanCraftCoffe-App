// Datos escolares ficticios. Horarios en America/Hermosillo (UTC-07:00).
export const BRANCHES = [
  { id: 'centro', name: 'BeanCraft Centro', addr: 'Av. Obregón y Calle 5, San Luis R.C.', ref: 'Junto a la plaza principal', lat: 32.477, lon: -114.778, days: [0,1,2,3,4,5,6], open: 7, close: 22 },
  { id: 'universidad', name: 'BeanCraft Kino', addr: 'Calz. Constitución y Calle 22, San Luis R.C.', ref: 'Frente a la entrada del campus', lat: 32.456, lon: -114.756, days: [1,2,3,4,5], open: 8, close: 21 },
  { id: 'plaza', name: 'BeanCraft Bosque', addr: 'Av. Revolución #1420, San Luis R.C.', ref: 'Segundo nivel, junto a las escaleras', lat: 32.449, lon: -114.77, days: [0,1,2,3,4,5,6], open: 7, close: 20 }
];
export const COUPONS = {
  BIENVENIDA: { code: 'BIENVENIDA', type: 'fixed', value: 30, label: '-$30 en tu pedido', active: true, start: '2026-01-01', end: '2028-12-31' },
  OTONO20: { code: 'OTONO20', type: 'percent', value: 20, label: '-20% en tu pedido', active: true, start: '2026-09-01', end: '2026-11-30' },
  VENCIDO25: { code: 'VENCIDO25', type: 'fixed', value: 25, label: '-$25', active: true, start: '2025-01-01', end: '2025-12-31' },
  INACTIVO: { code: 'INACTIVO', type: 'fixed', value: 15, label: '-$15', active: false, start: '2026-01-01', end: '2028-12-31' }
};
export const USERS = [{ email: 'cliente@beancraft.mx', password: 'Cafe1234', name: 'Cliente BeanCraft', phone: '6531234567', usedCoupons: [], order: null }];
export const ORDER_META = [
  { key: 'recibido', label: 'Recibido', mascota: 'grano', copy: 'Ya lo tenemos.' },
  { key: 'preparando', label: 'Preparando', mascota: 'taza', copy: 'Manos a la obra.' },
  { key: 'listo', label: 'Listo', mascota: 'espuma', copy: 'Pasa por él.' },
  { key: 'entregado', label: 'Entregado', mascota: 'croissant', copy: 'Buen provecho.' }
];
// Simulación separada: cada etapa dura 20 segundos. No hay controles de personal.
export const MOCK_CONFIG = { autoProgress: true, stageMs: 20000 };
