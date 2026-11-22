import { PRODUCTS, OPTIONS } from '../data/catalog.js';
import { COUPONS } from '../data/mocks.js';

export const localDate = (now = new Date()) => new Date(+now - 7 * 3600000).toISOString().slice(0,10);
export const localTime = (now = new Date()) => new Date(+now - 7 * 3600000).toISOString().slice(11,16);
export const dayOfWeek = (date) => new Date(`${date}T12:00:00-07:00`).getUTCDay();
export function unitPrice(item) {
  const p = PRODUCTS.find(p => p.id === item.productId);
  if (!p || !p.active) throw new Error('Este producto no está disponible.');
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99) throw new Error('Elige una cantidad entre 1 y 99.');
  if (!p.customizable) return p.price;
  const option = (key, id) => {
    const found = OPTIONS[key].find(o => o.id === id);
    if (!found) throw new Error('Revisa las opciones del producto.');
    return found.cost;
  };
  return p.price + ['size','milk','sweet'].reduce((sum,key)=>sum+option(key,item[key]),0) + [...new Set(item.extras)].reduce((sum,id)=>sum+option('extras',id),0);
}
export function couponError(code, user, now = new Date()) {
  const c = COUPONS[String(code).trim().toUpperCase()];
  if (!c) return 'Cupón no encontrado. Revisa el código.';
  if (!c.active) return 'Este cupón está desactivado.';
  if (localDate(now) < c.start || localDate(now) > c.end) return 'Este cupón está fuera de vigencia.';
  if (!user) return 'Inicia sesión para aplicar un cupón.';
  if (user.usedCoupons.includes(c.code)) return 'Ya utilizaste este cupón.';
  return '';
}
export function totals(items, coupon) {
  const subtotal = items.reduce((sum,item)=>sum+unitPrice(item)*item.qty,0);
  const discount = coupon ? Math.min(subtotal, coupon.type === 'percent' ? Math.round(subtotal*coupon.value)/100 : coupon.value) : 0;
  return { subtotal, discount, total: subtotal-discount };
}
export function pickupError(branch, mode, date, time, now = new Date()) {
  if (!branch) return 'Elige una sucursal.';
  if (mode === 'now') {
    const minute = localTime(now);
    return branch.days.includes(dayOfWeek(localDate(now))) && minute >= `${String(branch.open).padStart(2,'0')}:00` && minute < `${branch.close}:00` ? '' : 'La sucursal está cerrada. Programa una fecha y hora.';
  }
  if (mode !== 'scheduled' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return 'Selecciona fecha y hora de recogida.';
  const instant = new Date(`${date}T${time}:00-07:00`);
  if (!Number.isFinite(+instant) || localDate(instant) !== date || localTime(instant) !== time || +instant <= +now) return 'Elige una fecha y hora futuras válidas.';
  const minutes = Number(time.slice(0,2))*60 + Number(time.slice(3));
  if (!branch.days.includes(dayOfWeek(date)) || minutes < branch.open*60 || minutes >= branch.close*60) return 'La hora elegida está fuera del horario de la sucursal.';
  return '';
}
export function nextPickup(branch, now = new Date()) {
  for (let d=0;d<14;d++) {
    const date = localDate(new Date(+now+d*86400000));
    for(let m=branch.open*60;m<branch.close*60;m+=30) {
      const time = `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
      if(!pickupError(branch,'scheduled',date,time,now)) return {date,time};
    }
  }
}
export function nearestBranch(branches, coords) {
  const radians = n => n*Math.PI/180;
  return branches.map(branch => {
    const a=Math.sin(radians(branch.lat-coords.latitude)/2)**2+Math.cos(radians(coords.latitude))*Math.cos(radians(branch.lat))*Math.sin(radians(branch.lon-coords.longitude)/2)**2;
    return {...branch, distance:6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))};
  }).sort((a,b)=>a.distance-b.distance)[0];
}
export const profileError = (name,phone) => !name.trim() ? 'Escribe tu nombre.' : !/^\d{10}$/.test(phone) ? 'Escribe un teléfono de 10 dígitos.' : '';
export function ratingError(order, rating) {
  if(!order || order.statusIdx!==3) return 'Solo puedes calificar un pedido entregado.';
  if(order.rating) return 'Este pedido ya tiene una calificación.';
  const valid = n => Number.isInteger(n) && n>=1 && n<=5;
  if(!valid(rating.stars) || [...new Set(order.items.map(i=>i.productId))].some(id=>!valid(rating.products[id]))) return 'Califica el pedido y cada producto del 1 al 5.';
  if(rating.comment.length>140) return 'El comentario debe tener hasta 140 caracteres.';
  return '';
}
