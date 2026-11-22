const { test } = require('node:test');
const assert = require('node:assert/strict');
const modules = Promise.all([import('../lib/rules.js'), import('../data/catalog.js'), import('../data/mocks.js')]);
const now = new Date('2026-11-23T12:00:00-07:00');
const item = { productId: 'latte_caramelo', size: 'grande', milk: 'avena', sweet: 'miel', extras: ['shot', 'crema', 'caramelo'], qty: 2 };

test('precios del SRS, cantidad y descuento único por pedido', async () => {
  const [r, { PRODUCTS, OPTIONS }, { COUPONS }] = await modules;
  assert.deepEqual(OPTIONS.size.map(o=>o.cost), [0,10,18]);
  assert.deepEqual(OPTIONS.milk.map(o=>o.cost), [0,0,12,12]);
  assert.deepEqual(OPTIONS.sweet.map(o=>o.cost), [0,0,0,5]);
  assert.deepEqual(OPTIONS.extras.map(o=>o.cost), [15,8,8]);
  const base = PRODUCTS.find(p=>p.id===item.productId).price;
  assert.equal(r.unitPrice(item), base+18+12+5+15+8+8);
  const subtotal=r.unitPrice(item)*2;
  assert.deepEqual(r.totals([item],COUPONS.BIENVENIDA), {subtotal,discount:30,total:subtotal-30});
  assert.equal(r.totals([item],COUPONS.OTONO20).discount, Math.round(subtotal*20)/100);
  assert.equal(r.totals([item],{type:'fixed',value:1000}).total,0);
  assert.throws(()=>r.unitPrice({...item,qty:0}));
  assert.throws(()=>r.unitPrice({...item,milk:'invalid'}));
  const bakery=PRODUCTS.find(p=>p.cat==='Repostería');
  assert.equal(r.unitPrice({productId:bakery.id,qty:1}),bakery.price);
  const p=PRODUCTS.find(p=>p.id===item.productId);p.active=false;
  try { assert.throws(()=>r.unitPrice(item)); } finally { p.active=true; }
});

test('cupones: vigente, vencido, inactivo, sesión, usado y otro cliente', async () => {
  const [r] = await modules;
  const user={usedCoupons:[]};
  assert.equal(r.couponError(' bienvenida ',user,now),'');
  assert.match(r.couponError('X',user,now),/no encontrado/);
  assert.match(r.couponError('VENCIDO25',user,now),/vigencia/);
  assert.match(r.couponError('INACTIVO',user,now),/desactivado/);
  assert.match(r.couponError('BIENVENIDA',null,now),/sesión/);
  assert.match(r.couponError('BIENVENIDA',{usedCoupons:['BIENVENIDA']},now),/utilizaste/);
  assert.equal(r.couponError('BIENVENIDA',user,now),'');
  assert.match(r.couponError('OTONO20',user,new Date('2026-12-01T00:00:00-07:00')),/vigencia/);
});

test('horarios: zona de Sonora, cierre, días cerrados, fechas reales y futuras', async () => {
  const [r,,{BRANCHES}] = await modules;
  const b=BRANCHES[0], weekday=BRANCHES[1];
  assert.equal(r.pickupError(b,'now',null,null,now),'');
  for(const [date,time] of [['2026-11-22','12:00'],['2026-11-24','22:00'],['2026-11-24','06:59'],['2026-02-30','10:00'],['2026-11-24','25:00']]) assert.ok(r.pickupError(b,'scheduled',date,time,now));
  assert.equal(r.pickupError(b,'scheduled','2026-11-24','07:00',now),'');
  assert.ok(r.pickupError(weekday,'scheduled','2026-11-28','10:00',now));
  const closed=new Date('2026-11-27T23:00:00-07:00');
  assert.ok(r.pickupError(weekday,'now',null,null,closed));
  assert.deepEqual(r.nextPickup(weekday,closed),{date:'2026-11-30',time:'08:00'});
  assert.equal(r.localDate(new Date('2026-11-24T03:00:00Z')),'2026-11-23');
  assert.equal(r.nearestBranch(BRANCHES,{latitude:32.456,longitude:-114.756}).id,'universidad');
});

test('perfil y evaluación: entrega obligatoria, todos los productos y una sola vez', async () => {
  const [r] = await modules;
  assert.ok(r.profileError('','6531234567'));
  assert.ok(r.profileError('Ana','123'));
  assert.equal(r.profileError('Ana','6531234567'),'');
  const order={statusIdx:0,items:[item],rating:null};
  const rating={stars:5,products:{latte_caramelo:4},comment:'Bien'};
  assert.match(r.ratingError(order,rating),/entregado/);
  order.statusIdx=3;
  assert.ok(r.ratingError(order,{...rating,products:{}}));
  assert.ok(r.ratingError(order,{...rating,stars:6}));
  assert.ok(r.ratingError(order,{...rating,comment:'a'.repeat(141)}));
  assert.equal(r.ratingError(order,rating),'');
  order.rating=rating;
  assert.match(r.ratingError(order,rating),/ya tiene/);
});
