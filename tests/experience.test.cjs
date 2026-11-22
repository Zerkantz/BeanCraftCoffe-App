const { test } = require('node:test');
const assert = require('node:assert/strict');
const modules = Promise.all([import('../lib/rules.js'),import('../data/mocks.js'),import('../data/catalog.js'),import('../lib/mock-orders.js'),import('../data/experience.js')]);
const user = {usedCoupons:[],orderCount:0};
const latte = {productId:'latte_caramelo',size:'chico',milk:'avena',sweet:'sin',extras:[],qty:1};
const cold = {...latte,productId:'cold_brew',milk:'entera',qty:2};
test('promociones de la guía respetan producto, día, primer pedido y descuento único',async()=>{
 const [r,{COUPONS}]=await modules;
 assert.equal(r.couponItemError(COUPONS.AVENA10,[latte]),'');
 assert.ok(r.couponItemError(COUPONS.AVENA10,[{...latte,milk:'entera'}]));
 assert.equal(r.totals([latte,cold],COUPONS.AVENA10).discount,10);
 assert.ok(r.couponError('FRIO2X1',user,new Date('2026-11-23T12:00:00-07:00')));
 assert.equal(r.couponError('FRIO2X1',user,new Date('2026-11-26T12:00:00-07:00')),'');
 assert.ok(r.couponItemError(COUPONS.FRIO2X1,[{...cold,qty:1}]));
 const grand={...cold,size:'grande',qty:1};
 assert.equal(r.totals([{...cold,qty:1},grand],COUPONS.FRIO2X1).discount,r.unitPrice(cold));
 assert.equal(r.totals([{...cold,qty:3}],COUPONS.FRIO2X1).discount,r.unitPrice(cold));
 assert.ok(r.couponError('PRIMER15',{...user,orderCount:1},new Date('2026-11-21T12:00:00-07:00')));
 assert.equal(r.totals([latte],COUPONS.PRIMER15).discount,Math.round(r.unitPrice(latte)*15)/100);
});
test('el pedido entregado se conserva hasta guardar una calificación válida',async()=>{
 const [rules, {MOCK_CONFIG}, ,{tickMockOrders}]=await modules;
 assert.equal(MOCK_CONFIG.stageMs,3000);
 const order={createdAt:0,statusIdx:0,items:[latte],rating:null};const u={order},changes=[];
 const change=(u,o,event)=>changes.push([o.statusIdx,event]);
 tickMockOrders([u],MOCK_CONFIG,change,2999);assert.equal(order.statusIdx,0);
 for(const t of [3000,6000,9000])tickMockOrders([u],MOCK_CONFIG,change,t);
 assert.equal(order.statusIdx,3);assert.equal(u.order,order);
 tickMockOrders([u],MOCK_CONFIG,change,11999);assert.equal(u.order,order);
 tickMockOrders([u],MOCK_CONFIG,change,86400000);assert.equal(u.order,order);
 assert.deepEqual(changes,[[1,'updated'],[2,'updated'],[3,'updated']]);
 assert.ok(rules.saveOrderRating(u,order,{stars:6,products:{},comment:''}));assert.equal(u.order,order);
 const rating={stars:5,products:{latte_caramelo:4},comment:'Bien'};
 assert.equal(rules.saveOrderRating(u,order,rating),'');assert.equal(u.order,null);assert.equal(order.rating,rating);
 assert.ok(rules.saveOrderRating(u,order,rating));
 const next={statusIdx:0};u.order=next;const older={...order,rating:null};
 assert.equal(rules.saveOrderRating(u,older,rating),'');assert.equal(u.order,next);
});
test('hojas originales con productos válidos, frases y quiz',async()=>{
 const [,,{PRODUCTS},,{HOUSE_PAGES,FOOTER_QUOTES,QUIZ_QUESTIONS}]=await modules;
 assert.equal(HOUSE_PAGES.length,4);
 for(const page of HOUSE_PAGES){
  assert.equal(page.listIds.length,2);
  assert.equal(page.tileIds.length,3);
  assert.equal(new Set([...page.listIds,...page.tileIds]).size,5);
  assert.ok([page.heroId,...page.listIds,...page.tileIds].every(id=>PRODUCTS.some(p=>p.id===id&&p.active)));
 }
 assert.equal(FOOTER_QUOTES.length,5);
 assert.equal(new Set(FOOTER_QUOTES.map(f=>f.quote)).size,5);
 assert.equal(QUIZ_QUESTIONS.length,5);
 assert.ok(QUIZ_QUESTIONS.every(q=>q.opts.length===4&&q.opts.every(o=>PRODUCTS.some(p=>p.id===o.pick))));
});
