const { test } = require('node:test');
const assert = require('node:assert/strict');
const modules = Promise.all([import('../lib/rules.js'),import('../data/limits.js'),import('../data/mocks.js')]);
const item = {productId:'latte_caramelo',size:'chico',milk:'entera',sweet:'sin',extras:[],qty:1};

test('máximo de diez unidades entre todas las líneas del carrito',async()=>{
 const [r]=await modules;
 assert.equal(r.cartError([{...item,qty:6},{...item,qty:4}]),'');
 assert.match(r.cartError([{...item,qty:6},{...item,qty:5}]),/10 unidades/);
 assert.equal(r.cartCount([{...item,qty:3},{...item,qty:7}]),10);
 for(const qty of [0,-1,11,1.5,NaN])assert.ok(r.cartError([{...item,qty}]));
});

test('límites de nombre, teléfono, correo, contraseña y cupón',async()=>{
 const [r,{LIMITS}]=await modules;
 assert.equal(r.profileError('a'.repeat(LIMITS.name),'6531234567'),'');
 assert.ok(r.profileError('a'.repeat(LIMITS.name+1),'6531234567'));
 assert.ok(r.profileError('Ana','65312345678'));
 assert.equal(r.passwordError('a'.repeat(LIMITS.password)),'');
 assert.ok(r.passwordError('a'.repeat(LIMITS.password+1)));
 assert.ok(r.passwordError('abc'));
 const email='a'.repeat(249)+'@a.mx';
 assert.equal(email.length,254);assert.equal(r.credentialsError(email,'Cafe1234'),'');
 assert.ok(r.credentialsError('a'+email,'Cafe1234'));
 assert.match(r.couponError('x'.repeat(LIMITS.coupon+1),null),/24 caracteres/);
});

test('terminar sin reseña, con reseña parcial o solo comentario; promedio sin ceros inventados',async()=>{
 const [r,,{PRODUCT_REVIEWS}]=await modules;
 PRODUCT_REVIEWS.length=0;
 const finish=(id,rating)=>{const order={id,statusIdx:3,items:[{...item,qty:3}],rating:null};const user={order};assert.equal(r.saveOrderRating(user,order,rating),'');assert.equal(user.order,null);return order;};
 finish('empty',{stars:null,products:{},comment:''});assert.deepEqual(r.productRating(item.productId),{count:0,average:null});
 finish('comment',{stars:null,products:{},comment:'Gracias'});assert.equal(r.productRating(item.productId).count,0);
 finish('general',{stars:2,products:{},comment:''});assert.equal(r.productRating(item.productId).count,0);
 const first=finish('one',{stars:null,products:{latte_caramelo:5},comment:''});
 assert.deepEqual(r.productRating(item.productId),{count:1,average:5});
 assert.ok(r.saveOrderRating({order:null},first,{stars:null,products:{latte_caramelo:1},comment:''}));
 finish('two',{stars:5,products:{latte_caramelo:3},comment:''});
 assert.deepEqual(r.productRating(item.productId),{count:2,average:4});
 assert.deepEqual(r.productRating('frappe_supremo'),{count:0,average:null});
 const delivered={id:'invalid',statusIdx:3,items:[item],rating:null};
 for(const rating of [{stars:0,products:{},comment:''},{stars:null,products:{frappe_supremo:5},comment:''},{stars:null,products:{latte_caramelo:6},comment:''},{stars:null,products:{},comment:'a'.repeat(141)}]){
  const user={order:delivered};assert.ok(r.saveOrderRating(user,delivered,rating));assert.equal(user.order,delivered);
 }
 PRODUCT_REVIEWS.length=0;
});
