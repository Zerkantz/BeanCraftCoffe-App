import { initMotion, animateScreen, animateHeroLabel } from './lib/motion.js';
import { LIMITS } from './data/limits.js';
import { UI_CONFIG, CATEGORY_STYLE, HOUSE_PAGES, FOOTER_QUOTES, QUIZ_QUESTIONS } from './data/experience.js';
import { ICONS } from './lib/icons.js';
import { MASCOTAS_INFO, renderMascota } from './mascotas.js';
import { PRODUCTS, OPTIONS, FEATURED_IDS } from './data/catalog.js';
import { BRANCHES, COUPONS, USERS, ORDER_META, MOCK_CONFIG } from './data/mocks.js';
import { unitPrice, totals, couponError, pickupError, nextPickup, localDate, nearestBranch, profileError, saveOrderRating, couponItemError, cartCount, cartError, productRating, productReviews, credentialsError, passwordError } from './lib/rules.js';
import { startMockUpdates } from './lib/mock-orders.js';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => `$${n.toFixed(2)}`;
const productById = id => PRODUCTS.find(p=>p.id===id);
const branchById = id => BRANCHES.find(b=>b.id===id);
const state = {view:'home', user:null, cart:[], appliedCoupon:null, branchId:'centro', checkoutMode:'now', scheduledDate:'', scheduledHour:'', menuCat:'Todo', menuQuery:'', cust:null, payMethod:'efectivo', review:false, submitting:false, feedback:'', geoNote:''};
const HERO_IDS = FEATURED_IDS.filter(id => productById(id)?.active);
Object.assign(state, { footerIdx: 0, sheetIdx: 0, quizStep: -1, quizAnswers: [], quizResultId: "cold_brew", reducedMotion: false, heroStep: 0, heroIdx: 0 });
const activeOrder = () => state.user?.order;
const calcUnitPrice = unitPrice;
const calcCartSummary = () => totals(state.cart,state.appliedCoupon);
const renderProductArt = p => `<img src="${p.img}" alt="${esc(p.name)}">`;
const closeButton = id => `<button class="dlg-close" data-close-dlg="${id}" aria-label="Cerrar">×</button>`;
const field = (id,label,type='text',value='',extra='') => {
  const limit=type==='email'?LIMITS.email:type==='password'?LIMITS.password:type==='tel'?LIMITS.phone:type==='date'?10:type==='time'?5:LIMITS.name;
  return `<div class="form-field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" maxlength="${limit}" ${extra}></div>`;
};
const hours = b => `${b.days.length===7?'Todos los días':'Lunes a viernes'} · ${b.open}:00 a ${b.close}:00`;
function detail(item) {
  const p=productById(item.productId);
  return p.customizable ? ['size','milk','sweet'].map(k=>OPTIONS[k].find(o=>o.id===item[k])?.label).concat(item.extras.map(id=>OPTIONS.extras.find(o=>o.id===id)?.label)).join(' · ') : p.cat;
}
function navigate(view) {
  stopStatusAnimation();
  if(view === "home" && state.view !== "home") state.footerIdx = (state.footerIdx + 1) % FOOTER_QUOTES.length;
  if(!['home','menu','cart','orders','profile'].includes(view)) view='home';
  state.view=view;
  document.querySelectorAll('.view').forEach(el=>{el.hidden=el.id!==`view-${view}`;el.classList.toggle('active',!el.hidden)});
  document.querySelectorAll('.nav-item').forEach(btn=>{const on=btn.dataset.nav===view;btn.classList.toggle('on',on);if(on)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
  ({home:renderHome,menu:renderCrystalMenu,cart:renderCartView,orders:renderOrdersView,profile:renderProfileView})[view]();
  window.scrollTo(0,0);
  animateScreen($('#view-'+view));
}
function sendPhoneNotice(title,msg,mascota='taza',targetView=state.view) {
  window.ReactNativeWebView?.postMessage(JSON.stringify({type:'notify',title,body:msg,mascot:mascota,view:targetView}));
}
function updateBadges() {const n=cartCount(state.cart);$('#cartBadge').textContent=n;$('#cartBadge').hidden=!n;$('#orderBadge').hidden=!activeOrder();}

function renderHome() {
  const b=branchById(state.branchId), o=activeOrder(), notices=state.user?.notifications||[];
  const promo = COUPONS.AVENA10;
  const showPromo=localDate()>=promo.start&&localDate()<=promo.end;
  $('#homeContent').innerHTML=`<div class="news-strip">${showPromo?'Hoy el latte de avena va con $10 menos. Código AVENA10.':'Tu café favorito, hecho a tu manera.'}</div>
    <header class="home-topbar"><button type="button" class="brand-lockup" data-nav="home" aria-label="BeanCraft Inicio">
              <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                <rect width="48" height="48" rx="14" fill="var(--c-verde)" stroke="var(--c-tostado)" stroke-width="2.5"/>
                <ellipse cx="24" cy="24" rx="10" ry="13.5" transform="rotate(32 24 24)" fill="var(--c-espuma)"/>
                <path d="M30.5 13c-6.5 3.2-3.6 9.4-7.4 13.1-2.4 2.4-5.8 3-5.9 8.7" fill="none" stroke="var(--c-tostado)" stroke-width="2.6" stroke-linecap="round"/>
              </svg>
              <span class="logo-word">BEAN CRAFT</span>
            </button><button class="notice-trigger rbtn" id="homeNotifBtn" aria-label="Ver notificaciones">${ICONS.bell}${notices.some(n=>!n.read)?'<span class="notice-dot"></span>':''}</button><button class="avatar sm home-avatar" data-nav="profile" aria-label="Mi perfil">${state.user?renderMascota(state.user.avatar||'taza','feliz',{size:32}):'Entrar'}</button></header>
    <button class="branch-banner" data-open-branch="true">${ICONS['map-pin']}<span><small>Recoge en tu barra</small><strong>${esc(b.name)}</strong><small>${pickupError(b,'now')?'Cerrada · Programa tu recogida':'Abierta hasta las '+b.close+':00'} · Cambiar sucursal</small></span><span class="branch-arrow">↗</span></button>
    ${o?`<button class="home-order-link" data-nav="orders">${stateIconSvg(ORDER_META[o.statusIdx].key)}<span>Pedido #${o.id} · ${ORDER_META[o.statusIdx].label}</span><span>→</span></button>`:''}`;
  $('#homePromos').innerHTML=`<section class="promos"><div class="section-heading"><h2 class="titulo-mixto">Un sorbo de <em>ofertas</em></h2><span class="etiqueta-nueva rot-pos">Para ti</span></div><div class="promo-track">${Object.values(COUPONS).filter(c=>c.active&&localDate()>=c.start&&localDate()<=c.end).map((c,i)=>`<article class="promo-card"><span class="promo-stamp">${c.badge||'Tu cupón'}</span><h3>${esc(c.label)}</h3><p>${esc(c.description||'Un descuento para tu próximo antojo.')}</p><p class="promo-valid">${esc(c.terms||'Un uso por cliente.')} Hasta ${c.end}.</p><button class="btn-secondary btn-accent" data-promo="${c.code}">Usar ${c.code}</button>${renderMascota(['grano','taza','hielito','espuma'][i%4],'feliz',{size:60})}</article>`).join('')}</div></section>`;
  $('.hero-tag-left').textContent=localDate()<=COUPONS.OTONO20.end?'-20% con OTONO20':'A tu gusto';
  renderHouse();renderQuiz();renderFooter();
}
function renderFooter() {
  const f=FOOTER_QUOTES[state.footerIdx];
  $('#homeFooter').innerHTML=`<div class="footer-copy"><span class="logo-word">BEAN CRAFT</span><p>${esc(f.quote)}</p><button class="footer-link" data-nav="menu">Ver menú →</button></div>${renderMascota(f.id,'guino',{size:104})}<small>Hecho a tu manera. Recoge en tu barra.</small>`;
  $('#homeFooter').dataset.mascot=f.id;
}
function renderHouse() {
  $('#houseSection').innerHTML=`<header class="ls-header"><h2 class="titulo-mixto">Las <em>Bebidas</em> de la casa</h2><p class="ls-sub">Tu antojo favorito, de la barra a tu mano.</p></header><div class="ls-tabs" id="sheetTabs" role="group" aria-label="Categorías de la casa">${HOUSE_PAGES.map((pg,i)=>`<button class="chip" data-sheet-idx="${i}" aria-pressed="${i===state.sheetIdx}">${pg.tab}</button>`).join('')}</div><div class="ls-book-wrap"><div class="ls-book-track" id="sheetBookTrack">${HOUSE_PAGES.map(pg=>{
    const hero=productById(pg.heroId);
    return `<article class="poster-sheet" role="group" aria-roledescription="diapositiva" aria-label="${pg.title}"><div class="poster-top ${pg.altVerde?'alt-verde':''}"><div><h3 class="poster-cat">${pg.title}</h3><p class="poster-sub">${pg.sub}</p><div class="poster-list">${pg.listIds.map(id=>{const p=productById(id);return `<button class="poster-row" data-open-id="${id}"><span>${p.name}</span><strong>${money(p.price)}</strong></button>`;}).join('')}</div></div><button class="poster-hero-cup" data-open-id="${hero.id}" aria-label="Personalizar ${hero.name}">${renderProductArt(hero)}<span>Toca para pedir</span>${renderMascota(pg.mascota,'feliz',{size:64})}</button></div><div class="poster-bottom">${pg.tileIds.map((id,i)=>{const p=productById(id);return `<button class="poster-tile" data-open-id="${id}"><span class="poster-tile-art">${pixelSprinkles(['spark','heart','diamond'][i%3])}${renderProductArt(p)}</span><b>${p.name}</b><span>${money(p.price)}</span></button>`;}).join('')}</div></article>`;
  }).join('')}</div></div><div class="ls-pager"><button class="ls-arr" id="sheetPrevBtn" aria-label="Hoja anterior">←</button><span class="ls-page-name" id="sheetPageName"></span><button class="ls-arr" id="sheetNextBtn" aria-label="Hoja siguiente">→</button></div>`;
  const track=$('#sheetBookTrack');
  track.scrollLeft=track.children[state.sheetIdx].offsetLeft-track.offsetLeft-16;
  let timer;
  track.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(()=>{
    const center=track.scrollLeft+track.clientWidth/2;
    const cards=[...track.children];
    state.sheetIdx=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-track.offsetLeft+card.offsetWidth/2-center)<Math.abs(cards[best].offsetLeft-track.offsetLeft+cards[best].offsetWidth/2-center)?i:best,0);
    syncHouseControls();
  },80);});
  syncHouseControls();
}
function syncHouseControls() {
  $('#sheetPageName').textContent=HOUSE_PAGES[state.sheetIdx].tab;
  document.querySelectorAll('[data-sheet-idx]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===state.sheetIdx)));
  const tabs=$('#sheetTabs'), active=tabs.children[state.sheetIdx];
  if(active.offsetLeft<tabs.scrollLeft) tabs.scrollLeft=active.offsetLeft;
  else if(active.offsetLeft+active.offsetWidth>tabs.scrollLeft+tabs.clientWidth) tabs.scrollLeft=active.offsetLeft+active.offsetWidth-tabs.clientWidth;
}
function goToSheet(idx) {
  state.sheetIdx=(idx+HOUSE_PAGES.length)%HOUSE_PAGES.length;
  const track=$('#sheetBookTrack');
  const card=track.children[state.sheetIdx];
  track.scrollTo({left:card.offsetLeft-track.offsetLeft-16,behavior:state.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  syncHouseControls();
}
function renderQuiz(focus=false) {
  const box=$('#quizContainer'), step=state.quizStep;
  if(step<0){box.innerHTML=`<span class="etiqueta-nueva rot-neg">Encuentra tu match</span><h2 class="titulo-mixto">El quiz de las <em>Bebidas</em></h2><p>Descubre cuál eres en 5 preguntas.</p><div class="quiz-collage">${MASCOTAS_INFO.map((m,i)=>renderMascota(m.id,'feliz',{size:i===2?82:56,holo:i===2})).join('')}</div><button class="btn-primary full" id="startQuizBtn">¡Llévame ya!</button>`;}
  else if(step<QUIZ_QUESTIONS.length){
    const q=QUIZ_QUESTIONS[step],pct=Math.round(step/5*100);
    box.innerHTML=`<div class="section-heading"><span>Pregunta ${step+1} de 5</span>${renderMascota(MASCOTAS_INFO[step].id,'pensando',{size:54})}</div><div class="quiz-progress" role="progressbar" aria-label="Preguntas respondidas" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div><h2 class="quiz-question" tabindex="-1">${q.q}</h2><div class="quiz-options">${q.opts.map((o,i)=>`<button class="quiz-opt" data-qopt="${i}" aria-pressed="${state.quizAnswers[step]===i}">${o.label}<span>↗</span></button>`).join('')}</div><button class="link" id="quizBackBtn">← Atrás</button>`;
  }else{
    const scores={};state.quizAnswers.forEach((answer,i)=>{const id=QUIZ_QUESTIONS[i].opts[answer].pick;scores[id]=(scores[id]||0)+1;});
    state.quizResultId=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0]||'cold_brew';
    const p=productById(state.quizResultId);
    box.innerHTML=`<span class="etiqueta-nueva">Tu match está listo</span><div class="quiz-result">${renderMascota(CATEGORY_STYLE[p.cat].mascot,'guino',{size:102,holo:true})}<h2 class="titulo-mixto" tabindex="-1">Eres un <em>${p.name}</em></h2></div><p>${p.id==='cold_brew'?'Tranquilo, directo y con carácter.':p.desc}</p><p><span class="marcatextos">Desde ${money(p.price)}</span></p><button class="btn-primary full" id="quizArmarBtn">Armarla</button><button class="link" id="quizResetBtn">Repetir quiz</button>`;
  }
  if(focus){box.querySelector('h2')?.focus({preventScroll:true});}
}

function ratingMarkup(id) {
  const r=productRating(id),count=productReviews(id).length;
  const label=r.count?'Promedio '+r.average.toFixed(1)+' de 5, '+r.count+' '+(r.count===1?'calificación':'calificaciones'):count?count+' reseña'+(count===1?'':'s')+' sin calificación':'Todavía sin reseñas';
  return `<span class="cc-rating" aria-label="${label}"><span aria-hidden="true">${r.count?'★':'☆'}</span> ${r.count?r.average.toFixed(1)+' · '+r.count:count?count+' reseña'+(count===1?'':'s'):'Sin reseñas'}</span>`;
}
function renderCrystalMenu() {
  const cats=['Todo','Cafés','Bebidas frías','Repostería'];
  $('#menuFilterChips').innerHTML=cats.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${state.menuCat===c}">${c}</button>`).join('');
  $('#menuAvatarBtn').textContent=state.user?state.user.name.slice(0,2).toUpperCase():'Inv';
  const list=PRODUCTS.filter(p=>p.active&&(state.menuCat==='Todo'||p.cat===state.menuCat)&&`${p.name} ${p.desc}`.toLowerCase().includes(state.menuQuery.toLowerCase()));

  $('#crystalMenuGrid').innerHTML=list.length?list.map((p,i)=>`<button type="button" class="ccard" data-product-id="${p.id}" data-open-id="${p.id}" data-category="${p.cat}" aria-label="Personalizar ${esc(p.name)}, desde ${money(p.price)}" aria-haspopup="dialog" aria-controls="customizerDialog" style="--category-color:${CATEGORY_STYLE[p.cat].color}"><span class="cc-sticker">${renderMascota(CATEGORY_STYLE[p.cat].mascot,'feliz',{size:40})}</span>${crystalFacets(CATEGORY_STYLE[p.cat].color)}${pixelSprinkles(['spark','heart','diamond','steps'][i%4])}<span class="cc-stage">${renderProductArt(p)}</span><span class="cc-heading"><strong class="cc-name">${p.name}</strong>${ratingMarkup(p.id)}</span><span class="cc-glass-foot"><span class="cc-price">${money(p.price)}</span></span></button>`).join(''):'<p>No encontramos productos. Prueba otra búsqueda o categoría.</p>';
}
function openCustomizer(id,editUid=null) {
  const p=productById(id);if(!p?.active)return;
  const old=state.cart.find(i=>i.uid===editUid);
  state.cust=old?{...old,extras:new Set(old.extras),editUid}:{productId:id,size:'chico',milk:'entera',sweet:'sin',extras:new Set(),qty:1,editUid:null};
  state.custTab='details';
  renderCustomizer();$('#customizerDialog').showModal();
}
function saveCustomizer() {
  const c=state.cust;
  const item={...c,uid:c.editUid||`item-${Date.now()}-${Math.random()}`,extras:[...c.extras]};delete item.editUid;
  const next=c.editUid?state.cart.map(i=>i.uid===c.editUid?item:i):[...state.cart,item];
  const error=cartError(next);if(error){$('#custFeedback').textContent=error;return;}
  state.cart=next;
  state.review=false;$('#customizerDialog').close();updateBadges();if(state.view==='cart')renderCartView();sendPhoneNotice('Carrito actualizado',`${c.qty} × ${productById(c.productId).name}`,CATEGORY_STYLE[productById(c.productId).cat].mascot,'cart');
}
function pixelSprinkles(shape='spark') {
  const shapes={spark:'M3 0H4V2H5V3H7V4H5V5H4V7H3V5H2V4H0V3H2V2H3Z',heart:'M0 1H1V0H3V1H4V0H6V1H7V3H6V4H5V5H4V6H3V5H2V4H1V3H0Z',diamond:'M3 0H4V1H5V2H6V3H7V4H6V5H5V6H4V7H3V6H2V5H1V4H0V3H1V2H2V1H3Z M3 2V3H2V4H3V5H4V4H5V3H4V2Z',steps:'M0 0H2V2H0Z M2 2H4V4H2Z M4 4H6V6H4Z'};
  const kinds=[shape,shape==='heart'?'steps':'heart'];
  return '<span class="pixel-cluster" aria-hidden="true">'+kinds.map(kind=>`<svg class="pixel-shape pixel-${kind}" viewBox="0 0 7 7" shape-rendering="crispEdges"><path d="${shapes[kind]||shapes.spark}" fill="currentColor" fill-rule="evenodd"/></svg>`).join('')+'</span>';
}
function orderPath(step) {
  return '<ol class="order-path" aria-label="Etapas del pedido">'+['Arma','Revisa','Disfruta'].map((label,i)=>`<li ${step===i?'aria-current="step"':''} class="${i<step?'is-done':''}"><span>0${i+1}</span>${label}</li>`).join('')+'</ol>';
}
function pickupSummary(branch,time,payment,coupon='') {
  return `<dl class="pickup-summary"><div><dt>${ICONS['map-pin']} Recoge en</dt><dd>${esc(branch.name)}<small>${esc(branch.addr)}</small></dd></div><div><dt>${ICONS.tray} Cuándo</dt><dd>${esc(time)}<small>Hora de Sonora</small></dd></div><div><dt>${ICONS.tote} Pago en mostrador</dt><dd>${payment==='efectivo'?'Efectivo':'Tarjeta al recoger'}<small>Pagas cuando recojas tu pedido.</small></dd></div>${coupon?`<div><dt>Tu cupón</dt><dd>${esc(coupon)}</dd></div>`:''}</dl>`;
}
function itemsMarkup(items,editable=false) {
  return items.map(item=>{
    const p=productById(item.productId),price=item.unit??unitPrice(item);
    return `<article class="citem" style="--category-color:${CATEGORY_STYLE[p.cat].color}"><div class="c-art">${renderProductArt(p)}</div><div class="c-info"><div class="c-item-heading"><b>${esc(p.name)}</b><strong>${money(price*item.qty)}</strong></div><ul class="c-details" aria-label="Especificaciones de ${esc(p.name)}">${detail(item).split(' · ').filter(Boolean).map(label=>`<li>${esc(label)}</li>`).join('')}</ul><span class="c-unit">${item.qty} × ${money(price)}</span></div>${editable?`<div class="c-line-controls"><div class="c-qty" role="group" aria-label="Cantidad de ${esc(p.name)}"><button data-cqty="-1" data-uid="${item.uid}" aria-label="Restar ${esc(p.name)}">−</button><span>${item.qty}</span><button data-cqty="1" ${cartCount(state.cart)>=LIMITS.cartUnits?'disabled':''} data-uid="${item.uid}" aria-label="Sumar ${esc(p.name)}">+</button></div><div class="c-actions"><button class="link" data-edit="${item.uid}">Editar</button><button class="link" data-remove="${item.uid}">Eliminar</button></div></div>`:''}</article>`;
  }).join('');
}
function totalsMarkup(t) {
  return `<section class="totals-card" aria-label="Resumen del pago"><p class="section-kicker">La cuenta</p><div class="totals-line">Subtotal <strong>${money(t.subtotal)}</strong></div><div class="totals-line">Descuento <strong>−${money(t.discount)}</strong></div><div class="totals-line grand"><span>Total<small>Pagas al recoger</small></span><strong>${money(t.total)} MXN</strong></div></section>`;
}
function ensureSchedule() {const b=branchById(state.branchId);if(state.checkoutMode==='now'&&pickupError(b,'now'))state.checkoutMode='scheduled';if(!state.scheduledDate){const next=nextPickup(b);state.scheduledDate=next.date;state.scheduledHour=next.time;}}
function renderCartView() {
  ensureSchedule();const host=$('#cartContent');
  if(!state.cart.length){host.innerHTML=`<div class="empty">${renderMascota('hielito','pensando',{size:112})}<h2>Tu carrito está vacío</h2><p>Un café, algo frío o un antojo… ¿qué se te antoja hoy?</p><button class="btn-primary" data-nav="menu">Ver menú</button></div>`;return;}
  const b=branchById(state.branchId),t=calcCartSummary();
  const pickupTime=state.checkoutMode==='now'?'Recoger ahora':state.scheduledDate+' a las '+state.scheduledHour;
  host.innerHTML=`<div class="pad flow cart-flow"><header class="cart-intro">${pixelSprinkles()}<p class="section-kicker">${state.review?'Un último vistazo':'Hecho a tu manera'}</p><h2>${state.review?'¿Todo a tu gusto?':'Tu antojo empieza aquí.'}</h2><p>${state.review?'Comprueba tus productos y dónde vas a recogerlos.':'Ajusta tus productos y elige cómo recogerlos.'}</p>${orderPath(state.review?1:0)}</header><section class="cart-products"><h3>${state.review?'Lo que vas a pedir':'Tus productos'}</h3><div class="cart-dark">${itemsMarkup(state.cart,!state.review)}</div></section>${totalsMarkup(t)}
    <p class="msg-err" id="checkoutFeedback" role="alert">${esc(state.feedback)}</p>
    ${state.review?`<section class="checkout-block review-block"><div class="checkout-heading"><span class="section-number">02</span><div><p class="section-kicker">Listo para confirmar</p><h2>Revisa tu pedido</h2></div></div>${pickupSummary(b,pickupTime,state.payMethod,state.appliedCoupon?.code)}<button class="btn-secondary" id="editCheckoutBtn">Corregir datos</button><div class="slide-checkout" id="slideCheckout" data-total="${t.total.toFixed(2)}"><div class="slide-fill" id="slideFill"></div><button type="button" class="slide-knob" id="slideKnob" aria-label="Desliza a la derecha o presiona Enter para confirmar pedido de ${t.total.toFixed(2)} pesos"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button><span class="slide-label" id="slideLabel">Desliza para confirmar<br>${money(t.total)}</span><span class="slide-chevrons" aria-hidden="true">›››</span></div></section>`:
    `<section class="coupon-card"><div class="coupon-heading">${ICONS['seal-percent']}<label for="couponInput">¿Traes un cupón?</label></div><div class="coupon-row"><input id="couponInput" maxlength="${LIMITS.coupon}" autocapitalize="characters" value="${state.appliedCoupon?.code||''}" placeholder="Código del cupón"><button class="btn-primary" id="applyCouponBtn">Aplicar</button></div><p id="couponFeedback" role="status">${state.appliedCoupon?esc(state.appliedCoupon.label):'Un descuento para tu antojo. Un cupón por pedido.'}</p><div class="coupon-actions"><button class="btn-secondary" id="cartScanQrBtn">Escanear QR</button>${state.appliedCoupon?'<button class="link" id="removeCouponBtn">Quitar cupón</button>':''}</div></section>
    <section class="checkout-block"><div class="checkout-heading"><span class="section-number">02</span><div><p class="section-kicker">Nos vemos en la barra</p><h2>Recogida y pago</h2></div></div><button class="branch-bar" data-open-branch="true"><span>${ICONS['map-pin']}<strong>${esc(b.name)}</strong></span><small>Cambiar sucursal →</small></button><p class="pickup-hours">${hours(b)} · Hora de Sonora</p><h3>¿Cuándo pasas?</h3><div class="seg"><button data-mode="now" aria-pressed="${state.checkoutMode==='now'}" ${pickupError(b,'now')?'disabled':''}>Ahora${pickupError(b,'now')?' · Cerrada':''}</button><button data-mode="scheduled" aria-pressed="${state.checkoutMode==='scheduled'}">Programar</button></div>
    ${state.checkoutMode==='scheduled'?`<div class="pickup-fields">${field('pickupDate','Fecha','date',state.scheduledDate,`min="${localDate()}"`)}${field('pickupTime','Hora','time',state.scheduledHour)}</div>`:''}
    <h3>¿Cómo pagarás?</h3><p class="payment-hint">El pago se realiza en mostrador al recoger.</p><div class="seg"><button data-pay="efectivo" aria-pressed="${state.payMethod==='efectivo'}">Efectivo</button><button data-pay="tarjeta" aria-pressed="${state.payMethod==='tarjeta'}">Tarjeta al recoger</button></div><button class="btn-primary full" id="reviewOrderBtn">Revisar pedido →</button></section>`}</div>`;
  if(state.review)bindCheckoutSlider();
}
function tryApplyCoupon(raw) {
  const code=String(raw).trim().toUpperCase(), error=couponError(code,state.user)||couponItemError(COUPONS[code],state.cart);
  if(error){$('#couponFeedback').textContent=error;$('#couponFeedback').className='msg-err';return false;}
  state.appliedCoupon=COUPONS[code];state.review=false;renderCartView();return true;
}
function checkoutError() {
  if(!state.user)return 'Inicia sesión para confirmar tu pedido.';
  if(!state.cart.length)return 'Agrega un producto al carrito.';
  if(activeOrder())return activeOrder().statusIdx===3?'Termina tu pedido entregado antes de confirmar el siguiente.':'Ya tienes un pedido en curso. Consulta su seguimiento.';
  const itemError=cartError(state.cart);if(itemError)return itemError;
  if(!['efectivo','tarjeta'].includes(state.payMethod))return 'Elige un método de pago.';
  return pickupError(branchById(state.branchId),state.checkoutMode,state.scheduledDate,state.scheduledHour)||(state.appliedCoupon?couponError(state.appliedCoupon.code,state.user)||couponItemError(state.appliedCoupon,state.cart):'');
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
  state.user.orderCount=(state.user.orderCount||0)+1;
  state.user.order={id:Date.now().toString().slice(-7),code:String(Math.floor(1000+Math.random()*9000)),statusIdx:0,createdAt:Date.now(),items:state.cart.map(i=>({...i,extras:[...i.extras],unit:unitPrice(i)})),...t,branchId:state.branchId,date:state.checkoutMode==='now'?localDate():state.scheduledDate,time:state.checkoutMode==='now'?'Ahora':state.scheduledHour,payMethod:state.payMethod,coupon:state.appliedCoupon?.code||null,rating:null};
  if(state.appliedCoupon)state.user.usedCoupons.push(state.appliedCoupon.code);
  addNotice(state.user, state.user.order, 'Pedido registrado', 'Ya lo tenemos.');
  state.cart=[];state.appliedCoupon=null;state.review=false;state.submitting=false;updateBadges();navigate('orders');sendPhoneNotice('Pedido registrado',`Pedido #${activeOrder().id}`,'grano','orders');return true;
}
let statusAnimation = null;
function stopStatusAnimation() {
  statusAnimation?.revert();statusAnimation=null;
}
function animateOrderState() {
  stopStatusAnimation();
  const node=$('#orderArtwork');
  if(!node || state.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  statusAnimation=window.anime.animate(node,{scale:[.92,1],translateY:[8,0],opacity:[.4,1],duration:420,ease:'outBack'});
}
function orderArtwork(meta) {
  return `<div class="order-mascot" id="orderArtwork" data-state="${meta.key}" aria-hidden="true">${renderMascota(meta.mascota,'feliz',{size:88})}</div>`;
}
function addNotice(user, order, title, text) {
  user.notifications ||= [];
  user.notifications.unshift({id:'notice-'+Date.now()+'-'+Math.random().toString(36).slice(2),title,text,mascot:ORDER_META[order.statusIdx].mascota,at:Date.now(),read:false,order:order.statusIdx===3?order:null});
  user.notifications=user.notifications.slice(0,30);
}
function openNotifications() {
  state.user?.notifications?.forEach(n=>n.read=true);
  renderNotifications();renderHome();$('#notifDialog').showModal();
}
function renderNotifications() {
  const list=state.user?.notifications||[];
  $('#notifBody').innerHTML=`<div class="dlg-head"><h2 id="notifTitle">Tus notificaciones</h2>${closeButton('notifDialog')}</div><button class="link" id="clearNoticesBtn">${ICONS.trash} Borrar todas</button>${list.length?`<div class="notice-list">${list.map(n=>`<article class="notice-item">${renderMascota(n.mascot,'feliz',{size:48})}<div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><time>${new Date(n.at).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',timeZone:'America/Hermosillo'})}</time>${n.order? n.order.rating?'<p class="msg-ok">Pedido terminado.</p>':`<button class="link" data-rate-order="${n.order.id}">Terminar pedido</button>`:''}</div></article>`).join('')}</div>`:`<div class="empty">${renderMascota('hielito','pensando',{size:100})}<h3>No tienes notificaciones</h3><p>Los avisos de tu pedido aparecerán aquí.</p></div>`}`;
}
function renderOrdersView() {
  stopStatusAnimation();const o=activeOrder();
  if(!o){$('#ordersContent').innerHTML=`<div class="empty">${renderMascota('hielito','pensando',{size:112})}<h2>No tienes un pedido actual</h2><p>Cuando pidas, aquí te acompañamos hasta el último sorbo.</p><button class="btn-primary" data-nav="menu">Ver menú</button></div>`;return;}
  const m=ORDER_META[o.statusIdx],b=branchById(o.branchId);
  const next=['Ya recibimos tu antojo. Pronto empieza la preparación.','Estamos preparando todo. Te avisaremos cuando esté listo.','Tu antojo te espera. Acércate a la barra con tu código.','Que lo disfrutes. Puedes terminar sin dejar una reseña.'][o.statusIdx];
  $('#ordersContent').innerHTML=`<section class="track-card"><header class="tracking-heading">${pixelSprinkles()}<p class="section-kicker">Tu antojo, paso a paso</p><h2>Pedido #${o.id}</h2></header><section class="pickup-code" aria-label="Código de recogida"><p class="section-kicker">Tu código de recogida</p><div class="code-digits">${o.code.split('').map(d=>`<span>${d}</span>`).join('')}</div><p>Muéstralo en la barra al recoger.</p></section><div class="tracking-stage">${orderArtwork(m)}</div><p class="insignia-estado ${m.key}">${stateIconSvg(m.key)} ${m.label}</p><p class="tracking-copy" aria-live="polite">${m.copy}</p><ol class="order-steps" style="--order-progress:${o.statusIdx/3*100}%" aria-label="Estado del pedido">${ORDER_META.map((s,i)=>`<li data-state="${s.key}" data-step-state="${i<o.statusIdx?'complete':i===o.statusIdx?'current':'upcoming'}" ${i===o.statusIdx?'aria-current="step"':''}><span class="step-symbol">${stateIconSvg(s.key)}</span>${renderMascota(s.mascota,'feliz',{size:36})}<span class="step-label">${s.label}</span><small>${i<o.statusIdx?'Hecho':i===o.statusIdx?'Ahora':'Después'}</small></li>`).join('')}</ol><p class="order-next" aria-live="polite">${next}</p>${o.statusIdx===3&&!o.rating?'<button class="btn-primary full" id="openRatingBtn">Terminar pedido</button>':''}${pickupSummary(b,o.date+' · '+o.time,o.payMethod,o.coupon)}</section><section class="ordered-products"><h3>Lo que pediste</h3><div class="cart-dark">${itemsMarkup(o.items)}</div></section>${totalsMarkup(o)}`;
  animateOrderState();
}
function openRatingModal(orderId=null) {
  const o=orderId?state.user?.notifications?.find(n=>n.order?.id===orderId)?.order:activeOrder();if(!o||o.statusIdx!==3||o.rating)return;
  const ids=[...new Set(o.items.map(i=>i.productId))];
  const score=(id,label)=>`<div class="form-field"><label for="${id}">${esc(label)} <span class="optional">(opcional)</span></label><select id="${id}"><option value="">Sin calificación</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n} estrella${n===1?'':'s'}</option>`).join('')}</select></div>`;
  $('#ratingBody').innerHTML=`<div class="dlg-head"><h2 id="ratingTitle">Terminar pedido</h2>${closeButton('ratingDialog')}</div><p>Tu opinión es opcional. Puedes terminar sin dejar una reseña.</p><form id="ratingForm" class="flow">${score('orderStars','Pedido')}<div class="flow"><h3>Productos <span class="optional">(opcional)</span></h3>${ids.map(id=>score('rating-'+id,productById(id).name)).join('')}</div><label for="rateComment">Comentario <span class="optional">(opcional, hasta ${LIMITS.comment} caracteres)</span></label><textarea id="rateComment" maxlength="${LIMITS.comment}" rows="3"></textarea><p class="msg-err" id="ratingError" role="alert"></p><button class="btn-primary" type="submit">Terminar pedido</button></form>`;
  $('#ratingForm').onsubmit=e=>{
    e.preventDefault();
    const rating={stars:$('#orderStars').value?Number($('#orderStars').value):null,products:Object.fromEntries(ids.filter(id=>$('#rating-'+id).value!=='').map(id=>[id,Number($('#rating-'+id).value)])),comment:$('#rateComment').value.trim()};
    const error=saveOrderRating(state.user,o,rating);if(error){$('#ratingError').textContent=error;return;}
    $('#ratingDialog').close();updateBadges();renderOrdersView();if(state.view==='home')renderHome();if(state.view==='menu')renderCrystalMenu();if($('#notifDialog').open)renderNotifications();sendPhoneNotice('Pedido terminado',rating.stars||Object.keys(rating.products).length||rating.comment?'Gracias por compartir tu opinión.':'Gracias por visitarnos.');
  };$('#ratingDialog').showModal();
}
function openAuthModal() {
  let mode='login';
  const draw=()=>{$('#authBody').innerHTML=`<div class="dlg-head"><h2 id="authTitle">${mode==='login'?'Iniciar sesión':'Crear cuenta'}</h2>${closeButton('authDialog')}</div><form id="authForm" class="flow" novalidate>${mode==='register'?field('authName','Nombre')+field('authPhone','Teléfono','tel','','inputmode="tel"'):''}${field('authEmail','Correo electrónico','email','','autocomplete="email"')}${field('authPass','Contraseña (mínimo 6 caracteres)','password','','autocomplete="off"')}<p id="authError" class="msg-err" role="alert"></p><button class="btn-primary" type="submit">${mode==='login'?'Entrar':'Registrarme'}</button></form><button class="btn-secondary" id="switchAuthModeBtn">${mode==='login'?'Crear cuenta':'Ya tengo cuenta'}</button>`;
    $('#switchAuthModeBtn').onclick=()=>{mode=mode==='login'?'register':'login';draw();};
    $('#authForm').onsubmit=e=>{e.preventDefault();const email=$('#authEmail').value.trim().toLowerCase(),password=$('#authPass').value;let error='';const found=USERS.find(u=>u.email===email);
      if(credentialsError(email,password))error=credentialsError(email,password);
      else if(mode==='login'&&(!found||found.password!==password))error='El correo o la contraseña no coinciden.';
      else if(mode==='register')error=found?'Ese correo ya está registrado.':profileError($('#authName').value,$('#authPhone').value.trim());
      if(error){$('#authError').textContent=error;return;}
      if(mode==='register'){state.user={email,password,name:$('#authName').value.trim(),phone:$('#authPhone').value.trim(),usedCoupons:[],order:null};USERS.push(state.user);}else state.user=found;
      state.appliedCoupon=null;state.review=false;$('#authDialog').close();navigate(state.view);updateBadges();sendPhoneNotice('Sesión iniciada',`Hola, ${state.user.name}.`);
    };};draw();$('#authDialog').showModal();
}
function openAvatarMenu() {
  if(!state.user)return;
  $('#avatarBody').innerHTML=`<div class="dlg-head"><h2 id="avatarTitle">Elige tu mascota</h2>${closeButton('avatarDialog')}</div><p>¿Quién te acompaña hoy?</p><div class="avatar-picker" role="group" aria-label="Mascotas para tu foto"><div>${MASCOTAS_INFO.map(m=>`<button type="button" data-avatar="${m.id}" aria-label="Usar a ${m.nombre}" aria-pressed="${(state.user.avatar||'taza')===m.id}">${renderMascota(m.id,'feliz',{size:64})}<span>${m.nombre}</span></button>`).join('')}</div></div>`;
  $('#avatarDialog').showModal();
}
function renderProfileView() {
  const u=state.user;
  if(!u){$('#profileContent').innerHTML=`<div class="empty profile-welcome">${renderMascota('taza','feliz',{size:100})}<h1 class="titulo-mixto">Mi <em>perfil</em></h1><p>Inicia sesión para pedir y editar tus datos.</p><button class="btn-primary" id="profLoginBtn">Iniciar sesión o crear cuenta</button></div>`;$('#profLoginBtn').onclick=openAuthModal;return;}
  $('#profileContent').innerHTML=`<div class="pad flow"><header class="profile-banner"><span class="etiqueta-nueva rot-neg">Hecho a tu gusto</span><button type="button" class="profile-portrait" id="profilePortrait" aria-label="Cambiar foto de perfil" aria-haspopup="dialog" aria-controls="avatarDialog">${renderMascota(u.avatar||'taza','feliz',{size:116})}<span class="portrait-edit">Cambiar</span></button><h1 class="titulo-mixto">Hola, <em>${esc(u.name.split(' ')[0])}</em></h1><p>${esc(u.email)}</p></header><p id="avatarFeedback" role="status"></p><form id="profileForm" class="flow" novalidate>${field('profName','Nombre','text',u.name)}${field('profPhone','Teléfono','tel',u.phone)}<p id="profileFeedback" role="status"></p><button class="btn-primary" type="submit">Guardar datos</button></form><details><summary>Cambiar contraseña</summary><form id="passwordForm" class="flow" novalidate>${field('currentPass','Contraseña actual','password')}${field('newPass','Nueva contraseña (mínimo 6 caracteres)','password')}${field('repeatPass','Repite la nueva contraseña','password')}<p id="passwordFeedback" role="status"></p><button class="btn-primary" type="submit">Cambiar contraseña</button></form></details><button class="btn-secondary" id="logoutBtn">Cerrar sesión</button></div>`;
  $('#profileForm').onsubmit=e=>{e.preventDefault();const name=$('#profName').value.trim(),phone=$('#profPhone').value.trim(),error=profileError(name,phone);$('#profileFeedback').textContent=error||'Datos guardados.';if(!error){u.name=name;u.phone=phone;sendPhoneNotice('Perfil actualizado','Tus datos se guardaron.','taza','profile');}};
  $('#passwordForm').onsubmit=e=>{e.preventDefault();const pass=$('#newPass').value;const error=$('#currentPass').value!==u.password?'La contraseña actual es incorrecta.':passwordError(pass)?passwordError(pass):pass!==$('#repeatPass').value?'Las contraseñas nuevas no coinciden.':'';$('#passwordFeedback').textContent=error||'Contraseña actualizada.';if(!error){u.password=pass;$('#passwordForm').reset();sendPhoneNotice('Contraseña actualizada','Tu próxima sesión usará la nueva contraseña.','taza','profile');}};
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
    if(b.dataset.productTab){setProductTab(b.dataset.productTab);return;}
    if(b.dataset.avatar && state.user && MASCOTAS_INFO.some(m=>m.id===b.dataset.avatar)){
      state.user.avatar=b.dataset.avatar;
      $('#profilePortrait').innerHTML=renderMascota(state.user.avatar,'feliz',{size:116})+'<span class="portrait-edit">Cambiar</span>';
      $('#avatarDialog').close();$('#avatarFeedback').textContent='Mascota guardada.';sendPhoneNotice('Nueva mascota','Tu foto de perfil se actualizó.',state.user.avatar,'profile');return;
    }
    if(b.dataset.sheetIdx!==undefined){goToSheet(Number(b.dataset.sheetIdx));return;}
    if(b.dataset.qopt!==undefined){state.quizAnswers[state.quizStep]=Number(b.dataset.qopt);state.quizAnswers=state.quizAnswers.slice(0,state.quizStep+1);state.quizStep++;renderQuiz(true);return;}
    if(b.dataset.rateOrder){openRatingModal(b.dataset.rateOrder);return;}
    if(b.dataset.openBranch){openBranchModal();return;}
    if(b.dataset.closeDlg){document.getElementById(b.dataset.closeDlg).close();return;}
    if(b.dataset.cat){state.menuCat=b.dataset.cat;renderCrystalMenu();return;}
    if(b.dataset.openId){openCustomizer(b.dataset.openId);return;}
    if(b.dataset.edit){const i=state.cart.find(i=>i.uid===b.dataset.edit);openCustomizer(i.productId,i.uid);return;}
    if(b.dataset.remove){state.cart=state.cart.filter(i=>i.uid!==b.dataset.remove);state.review=false;updateBadges();renderCartView();return;}
    if(b.dataset.cqty){const i=state.cart.find(i=>i.uid===b.dataset.uid);const qty=i.qty+Number(b.dataset.cqty);const error=cartError(state.cart.filter(x=>x!==i).concat(qty>0?{...i,qty}:[]));if(error){sendPhoneNotice('Límite del carrito',error);return;}i.qty=qty;state.cart=state.cart.filter(i=>i.qty>0);state.review=false;updateBadges();renderCartView();return;}
    if(b.dataset.opt){state.cust[b.dataset.opt]=b.dataset.val;renderCustomizer();return;}
    if(b.dataset.mode){state.checkoutMode=b.dataset.mode;state.feedback='';renderCartView();return;}
    if(b.dataset.pay){state.payMethod=b.dataset.pay;renderCartView();return;}
    if(b.dataset.branchPick){state.branchId=b.dataset.branchPick;state.scheduledDate='';state.review=false;$('#branchDialog').close();navigate(state.view);return;}
    if(b.dataset.promo){navigate('cart');if(state.cart.length)tryApplyCoupon(b.dataset.promo);else sendPhoneNotice('Cupón '+b.dataset.promo,'Agrega una bebida y escribe este código en el carrito.');return;}
    const actions={profilePortrait:openAvatarMenu,sheetPrevBtn:()=>goToSheet(state.sheetIdx-1),sheetNextBtn:()=>goToSheet(state.sheetIdx+1),homeNotifBtn:openNotifications,clearNoticesBtn:()=>{if(state.user)state.user.notifications=[];window.ReactNativeWebView?.postMessage(JSON.stringify({type:'clearPhoneNotices'}));renderNotifications();renderHome();},startQuizBtn:()=>{state.quizStep=0;state.quizAnswers=[];renderQuiz(true);},quizBackBtn:()=>{state.quizStep--;renderQuiz(true);},quizResetBtn:()=>{state.quizStep=-1;state.quizAnswers=[];renderQuiz();},quizArmarBtn:()=>openCustomizer(state.quizResultId),menuAvatarBtn:()=>navigate('profile'),cartScanQrBtn:openQrModal,applyCouponBtn:()=>tryApplyCoupon($('#couponInput').value),removeCouponBtn:()=>{state.appliedCoupon=null;renderCartView();},reviewOrderBtn:reviewOrder,editCheckoutBtn:()=>{state.review=false;renderCartView();},openRatingBtn:()=>openRatingModal(),custMinus:()=>{state.cust.qty=Math.max(1,state.cust.qty-1);renderCustomizer();},custPlus:()=>{if(cartCount(state.cart.filter(i=>i.uid!==state.cust.editUid))+state.cust.qty<LIMITS.cartUnits)state.cust.qty++;renderCustomizer();},custAddBtn:saveCustomizer};actions[b.id]?.();
  });
  $('#custBody').addEventListener('keydown',e=>{const tab=e.target.closest('[data-product-tab]');if(!tab)return;const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();setProductTab(e.key==='Home'?'details':e.key==='End'?'reviews':tab.dataset.productTab==='details'?'reviews':'details',true);});
  $('#custBody').addEventListener('change',e=>{const id=e.target.dataset.extra;if(id){if(e.target.checked)state.cust.extras.add(id);else state.cust.extras.delete(id);renderCustomizer();}});
  $('#menuSearchInput').maxLength=LIMITS.search;
  $('#menuSearchInput').addEventListener('input',e=>{state.menuQuery=e.target.value.slice(0,LIMITS.search);renderCrystalMenu();});
  $('#cartContent').addEventListener('input',e=>{if(e.target.id==='pickupDate')state.scheduledDate=e.target.value;if(e.target.id==='pickupTime')state.scheduledHour=e.target.value;});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  document.body.classList.toggle("layout-airy",UI_CONFIG.openLayout);
  initHero();
  initMotion();
  updateBadges();navigate(new URLSearchParams(location.search).get('view')||'home');
  startMockUpdates(USERS, MOCK_CONFIG, (user, order) => {
    addNotice(user,order,'Pedido #'+order.id+': '+ORDER_META[order.statusIdx].label,ORDER_META[order.statusIdx].copy);
    if(user!==state.user)return;
    updateBadges();
    if(state.view==='orders')renderOrdersView();
    if(state.view==='home')renderHome();
    if($('#notifDialog').open)renderNotifications();
    sendPhoneNotice(ORDER_META[order.statusIdx].label,ORDER_META[order.statusIdx].copy,ORDER_META[order.statusIdx].mascota,'orders');
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

const stateIconSvg = key => ICONS[({recibido:'tray',preparando:'coffee',listo:'check-circle',entregado:'tote'})[key]]||ICONS.tray;

function productReviewsMarkup(product) {
  const reviews=productReviews(product.id),rating=productRating(product.id);
  if(!reviews.length)return `<div class="product-reviews-empty">${renderMascota('hielito','pensando',{size:82})}<h3>Aún no hay reseñas</h3><p>Tu opinión puede ser la primera. Al terminar tu pedido puedes dejar estrellas y un comentario; es opcional.</p></div>`;
  const starsMarkup=stars=>Number.isInteger(stars)?`<span class="review-stars" role="img" aria-label="${stars} de 5 estrellas"><span aria-hidden="true">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</span><b aria-hidden="true">${stars}/5</b></span>`:'<span class="review-unrated">Sin calificación del producto</span>';
  return `<div class="reviews-summary"><strong>${rating.count?rating.average.toFixed(1):'—'}<small> / 5</small></strong><div><h3>Opiniones de la barra</h3><p>${reviews.length} reseña${reviews.length===1?'':'s'} · ${rating.count} ${rating.count===1?'calificación':'calificaciones'}</p></div></div><div class="product-review-list">${reviews.map(review=>`<article class="product-review"><header>${renderMascota(review.avatar||'taza','feliz',{size:40})}<div><h4>${esc(review.authorName||'Cliente BeanCraft')}</h4>${review.createdAt?`<time datetime="${new Date(review.createdAt).toISOString()}">${new Date(review.createdAt).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'America/Hermosillo'})}</time>`:''}</div></header>${starsMarkup(review.stars)}${review.comment?`<p class="review-context">Comentario del pedido</p><p class="review-comment">${esc(review.comment)}</p>`:'<p class="review-no-comment">Dejó una calificación sin comentario.</p>'}</article>`).join('')}</div>`;
}
function setProductTab(tab,focus=false) {
  if(!['details','reviews'].includes(tab)||!state.cust)return;
  state.custTab=tab;
  document.querySelectorAll('[data-product-tab]').forEach(button=>{const selected=button.dataset.productTab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;if(selected&&focus)button.focus({preventScroll:true});});
  $('#productDetailsPanel').hidden=tab!=='details';$('#productReviewsPanel').hidden=tab!=='reviews';
  $('#custBody .qty-bar').hidden=tab!=='details';
}
function renderCustomizer() {
  const c=state.cust, p=productById(c.productId), unit=calcUnitPrice(c), total=unit*c.qty;
  const reviewsCount=productReviews(p.id).length,tab=state.custTab||'details';
  const active=document.activeElement, opt=active?.dataset.opt, val=active?.dataset.val, extra=active?.dataset.extra;
  const scroll=$('#customizerDialog').scrollTop;
  const choiceGroup=(key,label,number)=>`<fieldset class="cust-option-group"><legend><span>${number}</span>${label}</legend><div class="opt-grid ${key==='size'?'':'four'}">${OPTIONS[key].map(o=>`<button type="button" class="opt-btn" data-opt="${key}" data-val="${o.id}" aria-pressed="${c[key]===o.id}"><b>${o.label}</b><span>${o.cost?'+'+money(o.cost):'Incluido'}</span></button>`).join('')}</div></fieldset>`;
  const optsMarkup=p.customizable?`<div class="cust-options">${choiceGroup('size','Elige tu tamaño','01')}${choiceGroup('milk','Tu tipo de leche','02')}${choiceGroup('sweet','El toque dulce','03')}<fieldset class="cust-option-group"><legend><span>04</span>Algo extra <small>(opcional)</small></legend><div class="cust-extras">${OPTIONS.extras.map(o=>`<label class="extra-item"><span class="extra-choice"><input type="checkbox" data-extra="${o.id}" ${c.extras.has(o.id)?'checked':''}>${o.label}</span><span>+${money(o.cost)}</span></label>`).join('')}</div></fieldset></div>`:'<p>Listo para disfrutar. Elige cuántos se te antojan.</p>';
  $('#custBody').innerHTML=`
    <div class="dlg-head"><span class="cust-eyebrow">${c.editUid?'Dale tu toque':'Hecho a tu manera'}</span>${closeButton('customizerDialog')}</div>
    <div class="cust-intro" style="--category-color:${CATEGORY_STYLE[p.cat].color}">
      <div class="cust-product-art">${renderProductArt(p)}</div>
      <div class="cust-copy"><span class="cust-eyebrow">${p.cat}</span><h2 id="custTitle">${p.name}</h2><p>${p.desc}</p><strong class="cust-unit-price">${money(unit)} por unidad</strong></div>
      <span class="cust-mascot">${renderMascota(CATEGORY_STYLE[p.cat].mascot,'guino',{size:44})}</span>
    </div>
    <div class="product-tabs" role="tablist" aria-label="Información del producto"><button type="button" id="productDetailsTab" role="tab" data-product-tab="details" aria-selected="${tab==='details'}" aria-controls="productDetailsPanel" tabindex="${tab==='details'?0:-1}">Especificaciones</button><button type="button" id="productReviewsTab" role="tab" data-product-tab="reviews" aria-selected="${tab==='reviews'}" aria-controls="productReviewsPanel" tabindex="${tab==='reviews'?0:-1}">Reseñas <span class="review-tab-count" aria-hidden="true">${reviewsCount}</span></button></div>
    <section id="productDetailsPanel" class="product-details-panel" role="tabpanel" aria-labelledby="productDetailsTab" ${tab!=='details'?'hidden':''}>${optsMarkup}
    <p class="cust-limit">Máximo ${LIMITS.cartUnits} unidades en total en el carrito.</p><p class="msg-err" id="custFeedback" role="alert"></p></section>
    <section id="productReviewsPanel" role="tabpanel" aria-labelledby="productReviewsTab" ${tab!=='reviews'?'hidden':''}>${productReviewsMarkup(p)}</section>
    <div class="qty-bar" ${tab!=='details'?'hidden':''}><div class="stepper"><button type="button" id="custMinus" aria-label="Disminuir cantidad">−</button><strong>${c.qty}</strong><button type="button" id="custPlus" aria-label="Aumentar cantidad" ${cartCount(state.cart.filter(i=>i.uid!==c.editUid))+c.qty>=LIMITS.cartUnits?'disabled':''}>+</button></div><button type="button" class="btn-primary" id="custAddBtn"><span>${c.editUid?'Guardar cambios':'Agregar al carrito'}</span><strong>${money(total)}</strong></button></div>`;
  $('#customizerDialog').scrollTop=scroll;
  if(opt)$('#custBody').querySelector(`[data-opt="${opt}"][data-val="${val}"]`)?.focus({preventScroll:true});
  else if(extra)$('#custBody').querySelector(`[data-extra="${extra}"]`)?.focus({preventScroll:true});
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
  $('#heroStage').setAttribute('aria-label',cur.name);
  $('#heroTitle').textContent=cur.name;
  $('#heroPrice').textContent='Desde '+money(cur.price);
  $('#heroLive').textContent=cur.name+', desde '+money(cur.price);
  positionHeroRing(0);
  animateHeroLabel();
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
    }
    else spinHeroTo(target);
  });

  $('#heroOrderBtn').addEventListener('click',()=>openCustomizer(HERO_IDS[state.heroIdx]));

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
