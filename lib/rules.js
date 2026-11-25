import { PRODUCTS, OPTIONS } from '../data/catalog.js';
import { COUPONS, PRODUCT_REVIEWS } from '../data/mocks.js';
import { LIMITS } from '../data/limits.js';

export const localDate = (now = new Date()) => new Date(+now - 7 * 3600000).toISOString().slice(0,10);
export const localTime = (now = new Date()) => new Date(+now - 7 * 3600000).toISOString().slice(11,16);
export const dayOfWeek = (date) => new Date(`${date}T12:00:00-07:00`).getUTCDay();
export function unitPrice(item) {
  const p = PRODUCTS.find(p => p.id === item.productId);
  if (!p || !p.active) throw new Error('Este producto no está disponible.');
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > LIMITS.cartUnits) throw new Error('Elige una cantidad entre 1 y 10.');
  if (!p.customizable) return p.price;
  const option = (key, id) => {
    const found = OPTIONS[key].find(o => o.id === id);
    if (!found) throw new Error('Revisa las opciones del producto.');
    return found.cost;
  };
  return p.price + ['size','milk','sweet'].reduce((sum,key)=>sum+option(key,item[key]),0) + [...new Set(item.extras)].reduce((sum,id)=>sum+option('extras',id),0);
}
export function couponError(code, user, now = new Date()) {
  if (String(code).length > LIMITS.coupon) return `El código admite hasta ${LIMITS.coupon} caracteres.`;
  const c = COUPONS[String(code).trim().toUpperCase()];
  if (!c) return 'Cupón no encontrado. Revisa el código.';
  if (!c.active) return 'Este cupón está desactivado.';
  if (localDate(now) < c.start || localDate(now) > c.end) return 'Este cupón está fuera de vigencia.';
  if (c.days && !c.days.includes(dayOfWeek(localDate(now)))) return 'Este cupón solo se aplica los jueves.';
  if (!user) return 'Inicia sesión para aplicar un cupón.';
  if (user.usedCoupons.includes(c.code)) return 'Ya utilizaste este cupón.';
  if (c.firstOrder && user.orderCount > 0) return 'Este cupón es solo para tu primer pedido.';
  return '';
}
export function couponItemError(coupon, items) {
  if (!coupon?.productId) return '';
  const eligible = items.filter(i => i.productId === coupon.productId && (!coupon.milk || i.milk === coupon.milk));
  if (!eligible.length) return 'Agrega el producto y la personalización indicados en este cupón.';
  if (coupon.type === 'bogo' && eligible.reduce((sum,i)=>sum+i.qty,0) < 2) return 'Agrega al menos dos Cold brew para aplicar el 2 × 1.';
  return '';
}
export function totals(items, coupon) {
  const subtotal = items.reduce((sum,item)=>sum+unitPrice(item)*item.qty,0);
  const eligible = coupon?.productId ? items.filter(i=>i.productId===coupon.productId && (!coupon.milk || i.milk===coupon.milk)) : items;
  const eligibleTotal = eligible.reduce((sum,i)=>sum+unitPrice(i)*i.qty,0);
  let amount = 0;
  if (coupon?.type === 'bogo') {
    const units = eligible.flatMap(i=>Array(i.qty).fill(unitPrice(i))).sort((a,b)=>a-b);
    amount = units.slice(0,Math.floor(units.length/2)).reduce((sum,n)=>sum+n,0);
  } else if (coupon) amount = coupon.type === 'percent' ? Math.round(eligibleTotal*coupon.value)/100 : coupon.value;
  const discount = Math.min(eligibleTotal, amount);
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
export const profileError = (name,phone) => !name.trim() ? 'Escribe tu nombre.' : name.length > LIMITS.name ? `El nombre admite hasta ${LIMITS.name} caracteres.` : !/^\d{10}$/.test(phone) ? 'Escribe un teléfono de 10 dígitos.' : '';
export const passwordError = password => password.length < LIMITS.passwordMin || password.length > LIMITS.password ? `Usa entre ${LIMITS.passwordMin} y ${LIMITS.password} caracteres para la contraseña.` : '';
export const credentialsError = (email, password) => email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `Escribe un correo válido de hasta ${LIMITS.email} caracteres.` : passwordError(password);
export const cartCount = items => items.reduce((sum,item)=>sum+item.qty,0);
export function cartError(items) {
  if (cartCount(items) > LIMITS.cartUnits) return `Tu carrito admite un máximo de ${LIMITS.cartUnits} unidades en total.`;
  try { items.forEach(unitPrice); } catch (e) { return e.message; }
  return '';
}
export const productRating = productId => {
  const scores = PRODUCT_REVIEWS.filter(r=>r.productId===productId&&Number.isInteger(r.stars)&&r.stars>=1&&r.stars<=5).map(r=>r.stars);
  return { count:scores.length, average:scores.length?scores.reduce((sum,n)=>sum+n,0)/scores.length:null };
};
export const productReviews = productId => PRODUCT_REVIEWS.filter(review=>review.productId===productId).slice().reverse().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
export function ratingError(order, rating) {
  if(!order || order.statusIdx!==3) return 'Solo puedes terminar un pedido entregado.';
  if(order.rating) return 'Este pedido ya está terminado.';
  const valid = n => Number.isInteger(n) && n>=1 && n<=5;
  if(rating.stars !== null && rating.stars !== undefined && !valid(rating.stars)) return 'Elige de 1 a 5 estrellas o deja la calificación vacía.';
  const ids=new Set(order.items.map(i=>i.productId));
  if(Object.entries(rating.products||{}).some(([id,stars])=>!ids.has(id)||!valid(stars))) return 'Revisa las estrellas de los productos (del 1 al 5).';
  if(typeof rating.comment!=='string'||rating.comment.length>LIMITS.comment) return `El comentario debe tener hasta ${LIMITS.comment} caracteres.`;
  return '';
}
export function saveOrderRating(user, order, rating) {
  const error = ratingError(order, rating);
  if (error) return error;
  order.rating = rating;
  const comment=rating.comment.trim();
  const authorName=String(user.name||'Cliente BeanCraft').trim().slice(0,LIMITS.name)||'Cliente BeanCraft';
  const avatar=['grano','taza','espuma','hielito','croissant'].includes(user.avatar)?user.avatar:'taza';
  const createdAt=Date.now();
  for (const productId of new Set(order.items.map(item=>item.productId))) {
    const stars=rating.products?.[productId]??null;
    if(stars!==null||comment)PRODUCT_REVIEWS.push({orderId:order.id,productId,stars,comment,authorName,avatar,createdAt});
  }
  if (user.order === order) user.order = null;
  return '';
}
