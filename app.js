import { renderMascota } from './mascotas.js';
import { PRODUCTS, OPTIONS, FEATURED_IDS } from './data/catalog.js';
import { BRANCHES, COUPONS, USERS, ORDER_META, MOCK_CONFIG } from './data/mocks.js';
import { unitPrice, totals, couponError, pickupError, nextPickup, localDate, nearestBranch, profileError, ratingError } from './lib/rules.js';
import { startMockUpdates } from './lib/mock-orders.js';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => `$${n.toFixed(2)}`;
const productById = id => PRODUCTS.find(p=>p.id===id);
const branchById = id => BRANCHES.find(b=>b.id===id);
const state = {view:'home', user:null, cart:[], appliedCoupon:null, branchId:'centro', checkoutMode:'now', scheduledDate:'', scheduledHour:'', menuCat:'Todo', menuQuery:'', cust:null, payMethod:'efectivo', review:false, submitting:false, feedback:'', geoNote:''};
const HERO_IDS = FEATURED_IDS.filter(id => productById(id)?.active);
Object.assign(state, { heroStep: 0, heroIdx: 0, heroBuilder: { size: "chico", milk: "entera", sweet: "sin", extras: new Set() } });
const activeOrder = () => state.user?.order;
const calcUnitPrice = unitPrice;
const calcCartSummary = () => totals(state.cart,state.appliedCoupon);
const renderProductArt = p => `<img src="${p.img}" alt="${esc(p.name)}">`;
const closeButton = id => `<button class="dlg-close" data-close-dlg="${id}" aria-label="Cerrar">×</button>`;
const field = (id,label,type='text',value='',extra='') => `<div class="form-field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${extra}></div>`;
const hours = b => `${b.days.length===7?'Todos los días':'Lunes a viernes'} · ${b.open}:00 a ${b.close}:00`;
function detail(item) {
  const p=productById(item.productId);
  return p.customizable ? ['size','milk','sweet'].map(k=>OPTIONS[k].find(o=>o.id===item[k])?.label).concat(item.extras.map(id=>OPTIONS.extras.find(o=>o.id===id)?.label)).join(' · ') : p.cat;
}
function navigate(view) {
  if(!['home','menu','cart','orders','profile'].includes(view)) view='home';
  state.view=view;
  document.querySelectorAll('.view').forEach(el=>{el.hidden=el.id!==`view-${view}`;el.classList.toggle('active',!el.hidden)});
  document.querySelectorAll('.nav-item').forEach(btn=>{const on=btn.dataset.nav===view;btn.classList.toggle('on',on);if(on)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
  ({home:renderHome,menu:renderCrystalMenu,cart:renderCartView,orders:renderOrdersView,profile:renderProfileView})[view]();
  window.scrollTo(0,0);
}
let toastTimer;
function pushToast(title,msg,mascota='taza') {
  $('#toastTitle').textContent=title;$('#toastMsg').textContent=msg;$('#toastMascot').innerHTML=renderMascota(mascota,'feliz',{size:44});
  $('#pushToast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#pushToast').hidden=true,4500);
}
function updateBadges() {const n=state.cart.reduce((s,i)=>s+i.qty,0);$('#cartBadge').textContent=n;$('#cartBadge').hidden=!n;$('#orderBadge').hidden=!activeOrder()||activeOrder().statusIdx===3;}
function renderHome() {
  const b=branchById(state.branchId), o=activeOrder();
  $('#homeContent').innerHTML=`<header class="home-topbar"><button type="button" class="brand-lockup" data-nav="home" aria-label="BeanCraft Inicio">
              <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                <rect width="48" height="48" rx="14" fill="var(--c-verde)" stroke="var(--c-tostado)" stroke-width="2.5"/>
                <ellipse cx="24" cy="24" rx="10" ry="13.5" transform="rotate(32 24 24)" fill="var(--c-espuma)"/>
                <path d="M30.5 13c-6.5 3.2-3.6 9.4-7.4 13.1-2.4 2.4-5.8 3-5.9 8.7" fill="none" stroke="var(--c-tostado)" stroke-width="2.6" stroke-linecap="round"/>
              </svg>
              <span class="logo-word">BEAN CRAFT</span>
            </button><button class="login-pill" data-nav="profile">${state.user?'Mi perfil':'Iniciar sesión'}</button></header>
    <button class="branch-bar" data-open-branch="true">${esc(b.name)} · Cambiar sucursal</button>
    ${o?`<section class="track-card"><h2>Tu pedido #${o.id}</h2><p>${ORDER_META[o.statusIdx].label} · ${ORDER_META[o.statusIdx].copy}</p><button class="btn-secondary full" data-nav="orders">Ver pedido</button></section>`:''}`;
  $('#homePromos').innerHTML=`    <section class="promos"><h2 class="titulo-mixto">Para tu <em>antojo</em></h2><div class="promo-track">${Object.values(COUPONS).filter(c=>c.active&&localDate()>=c.start&&localDate()<=c.end).map(c=>`<article class="promo-card"><h3>${c.label}</h3><p>Código ${c.code}</p><p>Vigente hasta ${c.end}. Un uso por cliente.</p><button class="btn-secondary" data-promo="${c.code}">Usar en carrito</button></article>`).join('')}</div></section>`;
}
function renderCrystalMenu() {
  const cats=['Todo','Cafés','Bebidas frías','Repostería'];
  $('#menuFilterChips').innerHTML=cats.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${state.menuCat===c}">${c}</button>`).join('');
  $('#menuAvatarBtn').textContent=state.user?state.user.name.slice(0,2).toUpperCase():'Inv';
  const list=PRODUCTS.filter(p=>p.active&&(state.menuCat==='Todo'||p.cat===state.menuCat)&&`${p.name} ${p.desc}`.toLowerCase().includes(state.menuQuery.toLowerCase()));
  $('#menuCountLabel').textContent=`${list.length} productos`;
  $('#crystalMenuGrid').innerHTML=list.length?list.map(p=>`<article class="ccard">${crystalFacets(p.crystalToken)}<h2 class="cc-name">${p.name}</h2><button class="cc-stage" data-open-id="${p.id}" aria-label="Ver ${p.name}">${renderProductArt(p)}</button><div class="cc-glass-foot"><span class="cc-price">${money(p.price)}</span><button class="cc-add" data-open-id="${p.id}" aria-label="Agregar ${p.name}">+</button></div></article>`).join(''):'<p>No encontramos productos. Prueba otra búsqueda o categoría.</p>';
}
function openCustomizer(id,editUid=null) {
  const p=productById(id);if(!p?.active)return;
  const old=state.cart.find(i=>i.uid===editUid);
  state.cust=old?{...old,extras:new Set(old.extras),editUid}:{productId:id,size:'chico',milk:'entera',sweet:'sin',extras:new Set(),qty:1,editUid:null};
  renderCustomizer();$('#customizerDialog').showModal();
}
function saveCustomizer() {
  const c=state.cust;unitPrice(c);
  const item={...c,uid:c.editUid||`item-${Date.now()}-${Math.random()}`,extras:[...c.extras]};delete item.editUid;
  if(c.editUid) state.cart=state.cart.map(i=>i.uid===c.editUid?item:i);else state.cart.push(item);
  state.review=false;$('#customizerDialog').close();updateBadges();if(state.view==='cart')renderCartView();pushToast('Carrito actualizado',`${c.qty} × ${productById(c.productId).name}`);
}
function itemsMarkup(items,editable=false) {
  return items.map(item=>`<article class="citem"><div class="c-art">${renderProductArt(productById(item.productId))}</div><div class="c-info"><b>${esc(productById(item.productId).name)}</b><span>${esc(detail(item))}</span><span>${item.qty} × ${money(item.unit??unitPrice(item))}</span>${editable?`<div class="c-qty"><button data-cqty="-1" data-uid="${item.uid}" aria-label="Restar">−</button><span>${item.qty}</span><button data-cqty="1" data-uid="${item.uid}" aria-label="Sumar">+</button></div><button class="link" data-edit="${item.uid}">Editar</button><button class="link" data-remove="${item.uid}">Eliminar</button>`:''}</div><strong>${money((item.unit??unitPrice(item))*item.qty)}</strong></article>`).join('');
}
function totalsMarkup(t) {return `<div class="totals-card"><div class="totals-line">Subtotal <strong>${money(t.subtotal)}</strong></div><div class="totals-line">Descuento <strong>−${money(t.discount)}</strong></div><div class="totals-line grand">Total <strong>${money(t.total)} MXN</strong></div></div>`;}
function ensureSchedule() {const b=branchById(state.branchId);if(state.checkoutMode==='now'&&pickupError(b,'now'))state.checkoutMode='scheduled';if(!state.scheduledDate){const next=nextPickup(b);state.scheduledDate=next.date;state.scheduledHour=next.time;}}
function renderCartView() {
  ensureSchedule();const host=$('#cartContent');
  if(!state.cart.length){host.innerHTML=`<div class="empty">${renderMascota('hielito','pensando',{size:100})}<h2>Tu carrito está vacío</h2><button class="btn-primary" data-nav="menu">Ver menú</button></div>`;return;}
  const b=branchById(state.branchId), t=calcCartSummary();
  host.innerHTML=`<div class="pad flow"><div class="cart-dark">${itemsMarkup(state.cart,!state.review)}</div>${totalsMarkup(t)}
    <p class="msg-err" id="checkoutFeedback" role="alert">${esc(state.feedback)}</p>
    ${state.review?`<section class="checkout-block"><h2>Revisa tu pedido</h2><p>${esc(b.name)}<br>${esc(b.addr)}</p><p>${state.checkoutMode==='now'?'Recoger ahora':`${state.scheduledDate} a las ${state.scheduledHour}`} · Hora de Sonora</p><p>Pago: ${state.payMethod==='efectivo'?'efectivo':'tarjeta'} en mostrador</p><p>${state.appliedCoupon?`Cupón: ${state.appliedCoupon.code}`:'Sin cupón'}</p><button class="btn-secondary" id="editCheckoutBtn">Corregir datos</button><div class="slide-checkout" id="slideCheckout" data-total="${t.total.toFixed(2)}"><div class="slide-fill" id="slideFill"></div><button type="button" class="slide-knob" id="slideKnob" aria-label="Desliza a la derecha o presiona Enter para confirmar pedido de ${t.total.toFixed(2)} pesos"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button><span class="slide-label" id="slideLabel">Desliza para confirmar<br>${money(t.total)}</span><span class="slide-chevrons" aria-hidden="true">›››</span></div></section>`:
    `<section class="coupon-card"><label for="couponInput">Cupón de descuento</label><div class="coupon-row"><input id="couponInput" value="${state.appliedCoupon?.code||''}" placeholder="Código del cupón"><button class="btn-primary" id="applyCouponBtn">Aplicar</button></div><p id="couponFeedback" role="status">${state.appliedCoupon?esc(state.appliedCoupon.label):'Un cupón por pedido'}</p><button class="btn-secondary" id="cartScanQrBtn">Escanear QR</button>${state.appliedCoupon?'<button class="link" id="removeCouponBtn">Quitar cupón</button>':''}</section>
    <section class="checkout-block"><h2>Recogida y pago</h2><button class="branch-bar" data-open-branch="true">${esc(b.name)} · Cambiar</button><p>${hours(b)} (hora de Sonora)</p><div class="seg"><button data-mode="now" aria-pressed="${state.checkoutMode==='now'}" ${pickupError(b,'now')?'disabled':''}>Ahora${pickupError(b,'now')?' · Cerrada':''}</button><button data-mode="scheduled" aria-pressed="${state.checkoutMode==='scheduled'}">Programar</button></div>
    ${state.checkoutMode==='scheduled'?`${field('pickupDate','Fecha','date',state.scheduledDate,`min="${localDate()}"`)}${field('pickupTime','Hora','time',state.scheduledHour)}`:''}
    <p>El pago se realiza en mostrador al recoger.</p><div class="seg"><button data-pay="efectivo" aria-pressed="${state.payMethod==='efectivo'}">Efectivo</button><button data-pay="tarjeta" aria-pressed="${state.payMethod==='tarjeta'}">Tarjeta al recoger</button></div><button class="btn-primary full" id="reviewOrderBtn">Revisar pedido</button></section>`}</div>`;
  if(state.review)bindCheckoutSlider();
}
function tryApplyCoupon(raw) {
  const code=String(raw).trim().toUpperCase(), error=couponError(code,state.user);
  if(error){$('#couponFeedback').textContent=error;$('#couponFeedback').className='msg-err';return false;}
  state.appliedCoupon=COUPONS[code];state.review=false;renderCartView();return true;
}
function checkoutError() {
  if(!state.user)return 'Inicia sesión para confirmar tu pedido.';
  if(!state.cart.length)return 'Agrega un producto al carrito.';
  if(activeOrder()&&activeOrder().statusIdx<3)return 'Ya tienes un pedido en curso. Consulta su seguimiento.';
  try{state.cart.forEach(unitPrice);}catch(e){return e.message;}
  if(!['efectivo','tarjeta'].includes(state.payMethod))return 'Elige un método de pago.';
  return pickupError(branchById(state.branchId),state.checkoutMode,state.scheduledDate,state.scheduledHour)||(state.appliedCoupon?couponError(state.appliedCoupon.code,state.user):'');
}
function reviewOrder() {
  state.feedback=checkoutError();
  if(!state.user){openAuthModal();return;}
  state.review=!state.feedback;renderCartView();window.scrollTo(0,0);
}
function confirmCheckoutOrder() {
  if(state.submitting||!state.review)return false;
  state.feedback=checkoutError();if(state.feedback){state.review=false;renderCartView();return false;}
  state.submitting=true;
  const t=calcCartSummary();
  state.user.order={id:Date.now().toString().slice(-7),code:String(Math.floor(1000+Math.random()*9000)),statusIdx:0,createdAt:Date.now(),items:state.cart.map(i=>({...i,extras:[...i.extras],unit:unitPrice(i)})),...t,branchId:state.branchId,date:state.checkoutMode==='now'?localDate():state.scheduledDate,time:state.checkoutMode==='now'?'Ahora':state.scheduledHour,payMethod:state.payMethod,coupon:state.appliedCoupon?.code||null,rating:null};
  if(state.appliedCoupon)state.user.usedCoupons.push(state.appliedCoupon.code);
  state.cart=[];state.appliedCoupon=null;state.review=false;state.submitting=false;updateBadges();navigate('orders');pushToast('Pedido registrado',`Pedido #${activeOrder().id}`);return true;
}
function renderOrdersView() {
  const o=activeOrder();
  if(!o){$('#ordersContent').innerHTML=`<div class="empty">${renderMascota('hielito','pensando',{size:100})}<h2>No tienes un pedido actual</h2><button class="btn-primary" data-nav="menu">Ver menú</button></div>`;return;}
  const m=ORDER_META[o.statusIdx],b=branchById(o.branchId);
  $('#ordersContent').innerHTML=`<section class="track-card">${renderMascota(m.mascota,'feliz',{size:100})}<h2>Pedido #${o.id}</h2><p class="insignia-estado ${m.key}">${stateIconSvg(m.key)} ${m.label}</p><p aria-live="polite">${m.copy}</p><div class="code-digits">${o.code.split('').map(d=>`<span>${d}</span>`).join('')}</div><ol class="order-steps">${ORDER_META.map((s,i)=>`<li ${i===o.statusIdx?'aria-current="step"':''}>${i<o.statusIdx?'✓':i===o.statusIdx?'●':'○'} ${s.label}</li>`).join('')}</ol><p>${b.name}<br>${b.addr}<br>${o.date} · ${o.time}<br>Pago en mostrador: ${o.payMethod}</p><p class="note">Pedido de prueba. Los estados se simulan automáticamente; los avisos se muestran dentro de la app.</p>${o.rating?'<p class="msg-ok">Calificación guardada. Gracias por tu opinión.</p>':o.statusIdx===3?'<button class="btn-primary full" id="openRatingBtn">Calificar pedido y productos</button>':''}</section><div class="cart-dark">${itemsMarkup(o.items)}</div>${totalsMarkup(o)}`;
}
function openRatingModal() {
  const o=activeOrder();if(!o||o.statusIdx!==3||o.rating)return;
  const ids=[...new Set(o.items.map(i=>i.productId))];
  const score=(id,label)=>`<div class="form-field"><label for="${id}">${esc(label)}</label><select id="${id}"><option value="">Elige de 1 a 5</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n} estrella${n===1?'':'s'}</option>`).join('')}</select></div>`;
  $('#ratingBody').innerHTML=`<div class="dlg-head"><h2 id="ratingTitle">Califica tu pedido</h2>${closeButton('ratingDialog')}</div><form id="ratingForm" class="flow">${score('orderStars','Pedido')}${ids.map(id=>score('rating-'+id,productById(id).name)).join('')}<label for="rateComment">Comentario (hasta 140 caracteres)</label><textarea id="rateComment" maxlength="140" rows="3"></textarea><p class="msg-err" id="ratingError" role="alert"></p><button class="btn-primary" type="submit">Guardar calificación</button></form>`;
  $('#ratingForm').onsubmit=e=>{e.preventDefault();const rating={stars:Number($('#orderStars').value),products:Object.fromEntries(ids.map(id=>[id,Number($('#rating-'+id).value)])),comment:$('#rateComment').value.trim()};const error=ratingError(o,rating);if(error){$('#ratingError').textContent=error;return;}o.rating=rating;$('#ratingDialog').close();renderOrdersView();};$('#ratingDialog').showModal();
}
function openAuthModal() {
  let mode='login';
  const draw=()=>{$('#authBody').innerHTML=`<div class="dlg-head"><h2 id="authTitle">${mode==='login'?'Iniciar sesión':'Crear cuenta'}</h2>${closeButton('authDialog')}</div><form id="authForm" class="flow" novalidate>${mode==='register'?field('authName','Nombre')+field('authPhone','Teléfono','tel','','inputmode="tel"'):''}${field('authEmail','Correo electrónico','email','','autocomplete="email"')}${field('authPass','Contraseña (mínimo 6 caracteres)','password','','autocomplete="off"')}<p id="authError" class="msg-err" role="alert"></p><button class="btn-primary" type="submit">${mode==='login'?'Entrar':'Registrarme'}</button></form><button class="btn-secondary" id="switchAuthModeBtn">${mode==='login'?'Crear cuenta':'Ya tengo cuenta'}</button>`;
    $('#switchAuthModeBtn').onclick=()=>{mode=mode==='login'?'register':'login';draw();};
    $('#authForm').onsubmit=e=>{e.preventDefault();const email=$('#authEmail').value.trim().toLowerCase(),password=$('#authPass').value;let error='';const found=USERS.find(u=>u.email===email);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<6)error='Escribe un correo válido y una contraseña de al menos 6 caracteres.';
      else if(mode==='login'&&(!found||found.password!==password))error='El correo o la contraseña no coinciden.';
      else if(mode==='register')error=found?'Ese correo ya está registrado.':profileError($('#authName').value,$('#authPhone').value.trim());
      if(error){$('#authError').textContent=error;return;}
      if(mode==='register'){state.user={email,password,name:$('#authName').value.trim(),phone:$('#authPhone').value.trim(),usedCoupons:[],order:null};USERS.push(state.user);}else state.user=found;
      state.appliedCoupon=null;state.review=false;$('#authDialog').close();navigate(state.view);updateBadges();pushToast('Sesión iniciada',`Hola, ${state.user.name}.`);
    };};draw();$('#authDialog').showModal();
}
function renderProfileView() {
  const u=state.user;
  if(!u){$('#profileContent').innerHTML=`<div class="empty">${renderMascota('taza','feliz',{size:100})}<h1 class="titulo-mixto">Mi <em>perfil</em></h1><p>Inicia sesión para pedir y editar tus datos.</p><button class="btn-primary" id="profLoginBtn">Iniciar sesión o crear cuenta</button></div>`;$('#profLoginBtn').onclick=openAuthModal;return;}
  $('#profileContent').innerHTML=`<div class="pad flow"><h1 class="titulo-mixto">Mi <em>perfil</em></h1><p>${esc(u.email)}</p><form id="profileForm" class="flow" novalidate>${field('profName','Nombre','text',u.name)}${field('profPhone','Teléfono','tel',u.phone)}<p id="profileFeedback" role="status"></p><button class="btn-primary" type="submit">Guardar datos</button></form><details><summary>Cambiar contraseña</summary><form id="passwordForm" class="flow" novalidate>${field('currentPass','Contraseña actual','password')}${field('newPass','Nueva contraseña (mínimo 6 caracteres)','password')}${field('repeatPass','Repite la nueva contraseña','password')}<p id="passwordFeedback" role="status"></p><button class="btn-primary" type="submit">Cambiar contraseña</button></form></details><button class="btn-secondary" id="logoutBtn">Cerrar sesión</button></div>`;
  $('#profileForm').onsubmit=e=>{e.preventDefault();const name=$('#profName').value.trim(),phone=$('#profPhone').value.trim(),error=profileError(name,phone);$('#profileFeedback').textContent=error||'Datos guardados.';if(!error){u.name=name;u.phone=phone;}};
  $('#passwordForm').onsubmit=e=>{e.preventDefault();const pass=$('#newPass').value;const error=$('#currentPass').value!==u.password?'La contraseña actual es incorrecta.':pass.length<6?'Usa al menos 6 caracteres.':pass!==$('#repeatPass').value?'Las contraseñas nuevas no coinciden.':'';$('#passwordFeedback').textContent=error||'Contraseña actualizada.';if(!error){u.password=pass;$('#passwordForm').reset();}};
  $('#logoutBtn').onclick=()=>{state.user=null;state.appliedCoupon=null;state.cart=[];state.review=false;state.feedback='';updateBadges();navigate('home');};
}
function openBranchModal() {
  $('#branchBody').innerHTML=`<div class="dlg-head"><h2 id="branchTitle">Elige tu sucursal</h2>${closeButton('branchDialog')}</div><button class="btn-secondary" id="useGeoBtn">Usar mi ubicación</button><p id="geoFeedback" role="status">${esc(state.geoNote)}</p>${BRANCHES.map(b=>`<button class="branch-card" data-branch-pick="${b.id}" aria-pressed="${b.id===state.branchId}"><strong>${b.name}</strong><span>${b.addr}</span><span>${b.ref}</span><span>${hours(b)}</span><span>${pickupError(b,'now')?'Cerrada':'Abierta'}${b.id===state.branchId?' · Seleccionada':''}</span></button>`).join('')}`;
  $('#useGeoBtn').onclick=()=>{const button=$('#useGeoBtn');button.disabled=true;$('#geoFeedback').textContent='Buscando tu ubicación…';const fail=()=>{button.disabled=false;state.geoNote='No pudimos usar tu ubicación. Elige una sucursal manualmente.';$('#geoFeedback').textContent=state.geoNote;};if(!navigator.geolocation){fail();return;}navigator.geolocation.getCurrentPosition(position=>{const b=nearestBranch(BRANCHES,position.coords);state.geoNote=`Más cercana: ${b.name} (${b.distance.toFixed(1)} km). Ubicaciones de prueba.`;$('#branchDialog').close();openBranchModal();},fail,{timeout:15000});};$('#branchDialog').showModal();
}
function openQrModal() {
  navigate('cart');if(!state.cart.length)return;
  $('#qrBody').innerHTML=`<div class="dlg-head"><h2 id="qrTitle">Cupón QR</h2>${closeButton('qrDialog')}</div><p>Escanea el QR de tu cupón. También puedes escribir su código en el carrito.</p><button class="btn-primary" id="startCameraBtn">Abrir cámara</button><p id="qrErrMsg" role="alert"></p><button class="btn-secondary" data-close-dlg="qrDialog">Escribir código manualmente</button>`;
  $('#startCameraBtn').onclick=()=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:'scanQr'}));else $('#qrErrMsg').textContent='Abre la app en Expo Go para usar la cámara, o escribe el código en el carrito.';};$('#qrDialog').showModal();
}
function receiveQr(result) {
  if(result.error){$('#qrErrMsg').textContent=result.error;return;}
  $('#qrDialog').close();tryApplyCoupon(result.code||'');
}
function init() {
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.nav){navigate(b.dataset.nav);return;}
    if(b.dataset.openBranch){openBranchModal();return;}
    if(b.dataset.closeDlg){document.getElementById(b.dataset.closeDlg).close();return;}
    if(b.dataset.cat){state.menuCat=b.dataset.cat;renderCrystalMenu();return;}
    if(b.dataset.openId){openCustomizer(b.dataset.openId);return;}
    if(b.dataset.edit){const i=state.cart.find(i=>i.uid===b.dataset.edit);openCustomizer(i.productId,i.uid);return;}
    if(b.dataset.remove){state.cart=state.cart.filter(i=>i.uid!==b.dataset.remove);state.review=false;updateBadges();renderCartView();return;}
    if(b.dataset.cqty){const i=state.cart.find(i=>i.uid===b.dataset.uid);i.qty=Math.min(99,i.qty+Number(b.dataset.cqty));state.cart=state.cart.filter(i=>i.qty>0);state.review=false;updateBadges();renderCartView();return;}
    if(b.dataset.opt){state.cust[b.dataset.opt]=b.dataset.val;renderCustomizer();return;}
    if(b.dataset.mode){state.checkoutMode=b.dataset.mode;state.feedback='';renderCartView();return;}
    if(b.dataset.pay){state.payMethod=b.dataset.pay;renderCartView();return;}
    if(b.dataset.branchPick){state.branchId=b.dataset.branchPick;state.scheduledDate='';state.review=false;$('#branchDialog').close();navigate(state.view);return;}
    if(b.dataset.promo){navigate('cart');if(state.cart.length)tryApplyCoupon(b.dataset.promo);return;}
    const actions={menuAvatarBtn:()=>navigate('profile'),cartScanQrBtn:openQrModal,applyCouponBtn:()=>tryApplyCoupon($('#couponInput').value),removeCouponBtn:()=>{state.appliedCoupon=null;renderCartView();},reviewOrderBtn:reviewOrder,editCheckoutBtn:()=>{state.review=false;renderCartView();},openRatingBtn:openRatingModal,custMinus:()=>{state.cust.qty=Math.max(1,state.cust.qty-1);renderCustomizer();},custPlus:()=>{state.cust.qty=Math.min(99,state.cust.qty+1);renderCustomizer();},custAddBtn:saveCustomizer,closeToastBtn:()=>$('#pushToast').hidden=true};actions[b.id]?.();
  });
  $('#custBody').addEventListener('change',e=>{const id=e.target.dataset.extra;if(id){if(e.target.checked)state.cust.extras.add(id);else state.cust.extras.delete(id);renderCustomizer();}});
  $('#menuSearchInput').addEventListener('input',e=>{state.menuQuery=e.target.value;renderCrystalMenu();});
  $('#cartContent').addEventListener('input',e=>{if(e.target.id==='pickupDate')state.scheduledDate=e.target.value;if(e.target.id==='pickupTime')state.scheduledHour=e.target.value;});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  initHero();
  updateBadges();navigate(new URLSearchParams(location.search).get('view')||'home');
  startMockUpdates(USERS, MOCK_CONFIG, (user, order) => {
    if (user !== state.user) return;
    updateBadges();
    if (state.view === 'orders') renderOrdersView();
    if (state.view === 'home') renderHome();
    pushToast(`Pedido #${order.id}: ${ORDER_META[order.statusIdx].label}`, ORDER_META[order.statusIdx].copy);
  });
}
const crystalFacets = (tintToken) => `
  <svg class="crystal-svg" viewBox="0 0 160 220" preserveAspectRatio="none" aria-hidden="true">
    <polygon points="0,0 94,0 44,82 0,56" fill="${tintToken}" fill-opacity="0.34"/>
    <polygon points="94,0 160,0 160,72 108,96 44,82" fill="${tintToken}" fill-opacity="0.18"/>
    <polygon points="0,56 44,82 18,148 0,132" fill="${tintToken}" fill-opacity="0.24"/>
    <polygon points="44,82 108,96 76,160 18,148" fill="var(--c-espuma)" fill-opacity="0.48"/>
    <polygon points="108,96 160,72 160,154 76,160" fill="${tintToken}" fill-opacity="0.38"/>
    <polygon points="0,132 76,160 160,154 160,220 0,220" fill="${tintToken}" fill-opacity="0.24"/>
    <polyline points="0,56 44,82 94,0 M44,82 108,96 160,72 M44,82 18,148 76,160 108,96 M76,160 160,154"
      fill="none" stroke="var(--c-blanco)" stroke-opacity="0.88" stroke-width="1.4"/>
  </svg>`;

const stateIconSvg = (key) => {
  const map = {
    recibido: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 13h16l-1.5 6h-13z"/><path d="M7 13V9a5 5 0 0 1 10 0v4"/></svg>`,
    preparando: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v3M12 3v3"/></svg>`,
    listo: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>`,
    entregado: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
  };
  return map[key] || map.recibido;
};


function renderCustomizer() {
  const c = state.cust;
  const p = productById(c.productId);
  const unit = calcUnitPrice(c);
  const total = unit * c.qty;

  const optsMarkup = p.customizable ? `
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Tamaño</strong>
      <div class="opt-grid">
        ${OPTIONS.size.map((o) => `<button type="button" class="opt-btn" data-opt="size" data-val="${o.id}" aria-pressed="${c.size === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Tipo de leche</strong>
      <div class="opt-grid four">
        ${OPTIONS.milk.map((o) => `<button type="button" class="opt-btn" data-opt="milk" data-val="${o.id}" aria-pressed="${c.milk === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Endulzante</strong>
      <div class="opt-grid four">
        ${OPTIONS.sweet.map((o) => `<button type="button" class="opt-btn" data-opt="sweet" data-val="${o.id}" aria-pressed="${c.sweet === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Extras</strong>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${OPTIONS.extras.map((o) => `
          <label class="extra-item">
            <span style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" data-extra="${o.id}" ${c.extras.has(o.id) ? "checked" : ""}>
              ${o.label}
            </span>
            <span>+$${o.cost}</span>
          </label>`).join("")}
      </div>
    </div>
  ` : `<p style="font-size:16px">Producto listo para recoger.</p>`;

  $("#custBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="custTitle">${p.name}</h2>
      <button type="button" class="dlg-close" data-close-dlg="customizerDialog" aria-label="Cerrar">×</button>
    </div>
    <div class="cust-hero">
      <span class="marcatextos cust-price-burst">$${unit}</span>
      <div class="cust-hero-img">${renderProductArt(p, 84)}</div>
      <div>
        <span style="font-size:13px;font-weight:700;color:var(--c-verde)">${p.cat}</span>
        <p style="font-size:14px;margin-top:4px;line-height:1.4">${p.desc}</p>
      </div>
      <div>${renderMascota(p.mascota, "feliz", { size: 64 })}</div>
    </div>
    ${optsMarkup}
    <div class="qty-bar">
      <div class="stepper">
        <button type="button" id="custMinus" aria-label="Disminuir cantidad">−</button>
        <strong style="min-width:20px;text-align:center">${c.qty}</strong>
        <button type="button" id="custPlus" aria-label="Aumentar cantidad">+</button>
      </div>
      <button type="button" class="btn-primary" style="flex:1" id="custAddBtn">
        ${c.editUid ? "Guardar cambios" : "Agregar al carrito"} · ${money(total)}
      </button>
    </div>
  `;
}

function calcBuilderPrice(productId, builder) {
  return calcUnitPrice({
    productId,
    size: builder.size,
    milk: builder.milk,
    sweet: builder.sweet,
    qty: 1,
    extras: builder.extras
  });
}

function positionHeroRing(dragDeltaSteps = 0) {
  const total = HERO_IDS.length;
  const ring = $("#heroRing");
  const cups = [...ring.children];
  const activeLogical = ((Math.round(state.heroStep) % total) + total) % total;

  cups.forEach((cupBtn, i) => {
    let diff = i - (state.heroStep - dragDeltaSteps);
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;

    const rad = (diff * 2 * Math.PI) / total;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = sin * 124;
    const y = (1 - cos) * 18;
    const scale = 0.56 + (cos + 1) * 0.22;
    const tilt = sin * 6;
    const opacity = 0.28 + (cos + 1) * 0.36;
    const zIndex = Math.round((cos + 1) * 10);

    cupBtn.classList.toggle("dragging", dragDeltaSteps !== 0);
    cupBtn.classList.toggle("is-front", i === activeLogical && dragDeltaSteps === 0);
    cupBtn.style.zIndex = String(zIndex);
    cupBtn.style.opacity = opacity.toFixed(3);
    cupBtn.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), ${-y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
  });
}

function renderHero() {
  const total = HERO_IDS.length;
  const idx = ((state.heroStep % total) + total) % total;
  state.heroIdx = idx;

  const cur = productById(HERO_IDS[idx]);
  const liveTotal = calcBuilderPrice(cur.id, state.heroBuilder);

  const heroSpeech = {
    grano: ["Grano te recomienda", "Puro café de altura, listo para armar."],
    taza: ["Taza en barra", "Recién molido y con espuma cremosa."],
    espuma: ["Tip de Espuma", "Suave, fresco y con toque dulce."],
    hielito: ["Aprobado por Hielito", "Bien helado, directo a tu vaso."],
    croissant: ["Horno de Croissant", "Recién salido del horno para tu café."]
  }[cur.mascota] || ["Tip BeanCraft", "Personaliza tamaño, leche y extras al instante."];

  $("#heroMascotCallout").innerHTML = `
    ${renderMascota(cur.mascota, "feliz", { size: 62 })}
    <div>
      <strong style="display:block;font-family:var(--font-display);font-size:15px">${heroSpeech[0]}</strong>
      <span style="font-size:14px">${heroSpeech[1]}</span>
    </div>`;

  $("#heroStage").setAttribute("aria-label", cur.name);
  $("#heroCategoryLabel").textContent = cur.cat;
  $("#heroTitle").textContent = cur.name;
  $("#heroLiveTotal").textContent = money(liveTotal);
  $("#heroDesc").textContent = cur.desc;

  $("#heroDrinkChips").innerHTML = HERO_IDS.map((id, i) => {
    const item = productById(id);
    const short = {
      frappe_supremo: "Supremo",
      refresher_duo: "Refresher",
      frappe_beancraft: "Frappé",
      latte_caramelo: "Latte",
      cold_brew: "Cold brew"
    }[id] || item.name;
    return `<button type="button" class="pill-opt" aria-pressed="${i === idx}" data-hero-idx="${i}">${short}</button>`;
  }).join("");

  $("#heroSizeChips").innerHTML = OPTIONS.size.map((s) =>
    `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.size === s.id}" data-hb-size="${s.id}">${s.label} +${money(s.cost)}</button>`
  ).join("");

  $("#heroMilkChips").innerHTML = OPTIONS.milk.map((m) =>
    `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.milk === m.id}" data-hb-milk="${m.id}">${m.label} +${money(m.cost)}</button>`
  ).join("");

  $("#heroSweetChips").innerHTML = OPTIONS.sweet.map(o => `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.sweet === o.id}" data-hb-sweet="${o.id}">${o.label} +${money(o.cost)}</button>`).join("");
  $("#heroExtraChips").innerHTML = OPTIONS.extras.map((ex) =>
    `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.extras.has(ex.id)}" data-hb-extra="${ex.id}">${ex.label} +${money(ex.cost)}</button>`
  ).join("");

  $("#heroLive").textContent = `${cur.name}, precio actual ${liveTotal} pesos.`;
  positionHeroRing(0);
}

function spinHeroTo(targetIdx) {
  const total = HERO_IDS.length;
  const curIdx = ((state.heroStep % total) + total) % total;
  let delta = targetIdx - curIdx;
  if (delta > total / 2) delta -= total;
  if (delta < -total / 2) delta += total;
  state.heroStep += delta;
  renderHero();
}

function initHero() {
  // Mascotas alrededor del Armador (Sección 6)
  $("#heroMascotLeft").innerHTML = renderMascota("grano", "feliz", { size: 96, rotation: -2 });
  $("#heroMascotRight").innerHTML = renderMascota("espuma", "guino", { size: 90, rotation: 2 });
  $("#heroMascotTop").innerHTML = renderMascota("taza", "sorprendido", { size: 76, holo: true, rotation: 2 });

  const ring = $("#heroRing");
  ring.innerHTML = HERO_IDS.map((id, i) => {
    const p = productById(id);
    return `<button type="button" class="lh-cup" data-ring-idx="${i}" aria-label="Elegir ${p.name}">${renderProductArt(p, 134)}</button>`;
  }).join("");

  renderHero();
  $("#heroPrevBtn").addEventListener("click", () => { state.heroStep--; renderHero(); });
  $("#heroNextBtn").addEventListener("click", () => { state.heroStep++; renderHero(); });

  ring.addEventListener("click", (e) => {
    if (ring.dataset.moved === "1") return;
    const cup = e.target.closest("[data-ring-idx]");
    if (!cup) return;
    const target = Number(cup.dataset.ringIdx);
    if (target === state.heroIdx) {
      openCustomizer(HERO_IDS[target]);
      Object.assign(state.cust, state.heroBuilder, { extras: new Set(state.heroBuilder.extras) });
      renderCustomizer();
    }
    else spinHeroTo(target);
  });

  $("#heroCarousel").addEventListener("click", (e) => {
    const idxBtn = e.target.closest("[data-hero-idx]");
    if (idxBtn) { spinHeroTo(Number(idxBtn.dataset.heroIdx)); return; }
    const sBtn = e.target.closest("[data-hb-size]");
    if (sBtn) { state.heroBuilder.size = sBtn.dataset.hbSize; renderHero(); return; }
    const mBtn = e.target.closest("[data-hb-milk]");
    if (mBtn) { state.heroBuilder.milk = mBtn.dataset.hbMilk; renderHero(); return; }
    const swBtn = e.target.closest("[data-hb-sweet]");
    if (swBtn) { state.heroBuilder.sweet = swBtn.dataset.hbSweet; renderHero(); return; }
    const exBtn = e.target.closest("[data-hb-extra]");
    if (exBtn) {
      const id = exBtn.dataset.hbExtra;
      if (state.heroBuilder.extras.has(id)) state.heroBuilder.extras.delete(id);
      else state.heroBuilder.extras.add(id);
      renderHero();
    }
  });

  $("#heroOrderBtn").addEventListener("click", () => {
    const pid = HERO_IDS[state.heroIdx];
    const p = productById(pid);
    state.cart.push({
      uid: `hero-${Date.now()}`,
      productId: pid,
      size: state.heroBuilder.size,
      milk: state.heroBuilder.milk,
      sweet: state.heroBuilder.sweet,
      extras: [...state.heroBuilder.extras],
      qty: 1
    });
    state.review = false;
    updateBadges();
    pushToast("Bebida armada al carrito", `${p.name} · ${money(calcBuilderPrice(pid, state.heroBuilder))} MXN`, p.mascota);
  });
  $("#heroMenuBtn").addEventListener("click", () => navigate("menu"));

  let startX = null;
  let lastDx = 0;
  const stage = $("#heroStage");
  stage.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    lastDx = 0;
    ring.dataset.moved = "0";

  });
  stage.addEventListener("pointermove", (e) => {
    if (startX === null) return;
    lastDx = e.clientX - startX;
    if (Math.abs(lastDx) > 8) { ring.dataset.moved = "1"; stage.setPointerCapture(e.pointerId); }
    positionHeroRing(lastDx / 140);
  });
  const endDrag = () => {
    if (startX === null) return;
    startX = null;
    const stepShift = Math.round(-lastDx / 75);
    if (stepShift !== 0) state.heroStep += stepShift;
    renderHero();
    setTimeout(() => { ring.dataset.moved = "0"; }, 40);
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
}


function bindCheckoutSlider() {
  const track = $("#slideCheckout");
  const knob = $("#slideKnob");
  const fill = $("#slideFill");
  const label = $("#slideLabel");
  if (!track || !knob) return;

  let completing = false;
  let startX = null;
  let maxDist = 0;
  let currentX = 0;

  const setPos = (x) => {
    currentX = Math.max(0, Math.min(maxDist, x));
    knob.style.transform = `translateX(${currentX}px)`;
    fill.style.width = `${60 + currentX}px`;
  };

  const reset = () => {
    completing = false;
    knob.classList.remove("dragging");
    track.classList.remove("confirmed");
    setPos(0);
    label.innerHTML = `Desliza para confirmar<br>${money(Number(track.dataset.total))}`;
  };

  const complete = () => {
    if (completing) return;
    completing = true;
    knob.classList.remove("dragging");
    track.classList.add("confirmed");
    setPos(maxDist);
    label.textContent = "Confirmando…";
    setTimeout(() => {
      if (!confirmCheckoutOrder()) reset();
    }, 160);
  };

  knob.addEventListener("pointerdown", (e) => {
    if (completing) return;
    maxDist = track.clientWidth - knob.offsetWidth - 8;
    startX = e.clientX - currentX;
    knob.classList.add("dragging");
    knob.setPointerCapture(e.pointerId);
  });

  knob.addEventListener("pointermove", (e) => {
    if (startX === null) return;
    setPos(e.clientX - startX);
  });

  const release = () => {
    if (startX === null) return;
    startX = null;
    if (maxDist > 0 && currentX >= maxDist * 0.72) complete();
    else reset();
  };

  knob.addEventListener("pointerup", release);
  knob.addEventListener("pointercancel", () => { startX = null; if (!completing) reset(); });
  knob.addEventListener("click", e => { if (e.detail === 0) { maxDist = track.clientWidth - knob.offsetWidth - 8; complete(); } });
  knob.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      maxDist = track.clientWidth - knob.offsetWidth - 8;
      complete();
    }
  });
}


init();
