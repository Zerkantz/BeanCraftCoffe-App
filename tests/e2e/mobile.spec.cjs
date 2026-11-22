const { test, expect } = require('@playwright/test');
const { buildHtml } = require('../../scripts/prepare-web.cjs');
const { html } = buildHtml();
async function load(page) {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-11-23T12:00:00-07:00')});
 await page.addInitScript(()=>{window.nativeMessages=[];window.ReactNativeWebView={postMessage:s=>window.nativeMessages.push(JSON.parse(s))};});
 await page.route('https://beancraft.local/**',r=>r.fulfill({contentType:'text/html',body:html}));
 await page.goto('https://beancraft.local/');await expect(page.locator('#view-home')).toBeVisible();return errors;
}
const nav=(p,v)=>p.locator(`.nav-item[data-nav="${v}"]`).click();
async function dragConfirm(page) {
 const knob=page.locator('#slideKnob');await knob.scrollIntoViewIfNeeded();
 const k=await knob.boundingBox(),t=await page.locator('#slideCheckout').boundingBox();
 await page.mouse.move(k.x+k.width/2,k.y+k.height/2);await page.mouse.down();
 await page.mouse.move(t.x+t.width-k.width/2-6,k.y+k.height/2,{steps:12});await page.mouse.up();
}
async function login(p,email='cliente@beancraft.mx',pass='Cafe1234') {
 await nav(p,'profile');await p.locator('#profLoginBtn').click();await p.locator('#authEmail').fill(email);await p.locator('#authPass').fill(pass);await p.locator('#authForm button[type="submit"]').click();
}
async function add(p,id='latte_caramelo') {await nav(p,'menu');await p.locator(`.cc-add[data-open-id="${id}"]`).click();await p.locator('#custAddBtn').click();await nav(p,'cart');}
async function confirm(p) {await p.locator('#reviewOrderBtn').click();await expect(p.locator('#slideKnob')).toBeVisible();await p.locator('#slideKnob').press('Enter');await expect(p.locator('#view-orders')).toBeVisible();}

test('recorrido completo, precios, edición, revisión, entrega y evaluación por producto',async({page},info)=>{
 const errors=await load(page);await login(page);await add(page);
 await page.locator('[data-edit]').click();await page.locator('[data-opt="size"][data-val="grande"]').click();await page.locator('[data-opt="milk"][data-val="avena"]').click();await page.locator('[data-extra="shot"]').check();await expect(page.locator('#custAddBtn')).toContainText('$100');await page.screenshot({path:info.outputPath('customizer.png'),animations:'disabled'});await page.locator('#custAddBtn').click();
 await page.locator('#couponInput').fill('BIENVENIDA');await page.locator('#applyCouponBtn').click();await expect(page.locator('.totals-line.grand')).toContainText('$70.00');
 await page.locator('[data-mode="scheduled"]').click();await page.locator('#pickupDate').fill('2026-11-24');await page.locator('#pickupTime').fill('10:00');await page.locator('[data-pay="tarjeta"]').click();
 await page.locator('#reviewOrderBtn').click();await expect(page.locator('.checkout-block')).toContainText('2026-11-24 a las 10:00');await page.screenshot({path:info.outputPath('review.png'),animations:'disabled'});await dragConfirm(page);await expect(page.locator('#view-orders')).toBeVisible();
 await expect(page.locator('#ordersContent .totals-line.grand')).toContainText('$70.00');await expect(page.locator('#ordersContent')).toContainText('tarjeta');await expect(page.locator('#openRatingBtn')).toHaveCount(0);await expect(page.locator('#advanceOrderBtn')).toHaveCount(0);
 await page.clock.runFor(61000);if(await page.locator('#closeToastBtn').isVisible()) await page.locator('#closeToastBtn').click();await page.locator('#openRatingBtn').click();await page.locator('#ratingForm button').click();await expect(page.locator('#ratingError')).toContainText('cada producto');
 await page.screenshot({path:info.outputPath('rating.png'),animations:'disabled'});await page.locator('#orderStars').selectOption('4');await page.locator('#rating-latte_caramelo').selectOption('5');await page.locator('#rateComment').fill('Buen café');await page.locator('#ratingForm button').click();await expect(page.locator('.msg-ok')).toContainText('guardada');await expect(page.locator('#openRatingBtn')).toHaveCount(0);
 await add(page);await page.locator('#couponInput').fill('BIENVENIDA');await page.locator('#applyCouponBtn').click();await expect(page.locator('#couponFeedback')).toContainText('Ya utilizaste');expect(errors).toEqual([]);
});
test('registro, validación de credenciales, perfil y nueva contraseña',async({page})=>{
 const errors=await load(page);await login(page,'cliente@beancraft.mx','incorrecta');await expect(page.locator('#authError')).toContainText('no coinciden');
 await page.locator('#switchAuthModeBtn').click();await page.locator('#authName').fill('Ana');await page.locator('#authPhone').fill('6531234567');await page.locator('#authEmail').fill('cliente@beancraft.mx');await page.locator('#authPass').fill('Nueva123');await page.locator('#authForm button').click();await expect(page.locator('#authError')).toContainText('registrado');
 await page.locator('#authEmail').fill('ana@example.com');await page.locator('#authForm button').click();await expect(page.locator('#authDialog')).not.toBeVisible();
 await page.locator('#profName').fill('Ana López');await page.locator('#profPhone').fill('1');await page.locator('#profileForm button').click();await expect(page.locator('#profileFeedback')).toContainText('10 dígitos');await page.locator('#profPhone').fill('6537654321');await page.locator('#profileForm button').click();await expect(page.locator('#profileFeedback')).toContainText('guardados');
 await page.locator('summary').click();await page.locator('#currentPass').fill('Nueva123');await page.locator('#newPass').fill('Cambio456');await page.locator('#repeatPass').fill('Cambio456');await page.locator('#passwordForm button').click();await expect(page.locator('#passwordFeedback')).toContainText('actualizada');await page.locator('#logoutBtn').click();
 await login(page,'ana@example.com','Nueva123');await expect(page.locator('#authError')).toContainText('no coinciden');await page.locator('#authPass').fill('Cambio456');await page.locator('#authForm button').click();await expect(page.locator('#profName')).toHaveValue('Ana López');expect(errors).toEqual([]);
});
test('carrito vacío, categorías, eliminación y ausencia de extras fuera del alcance',async({page})=>{
 const errors=await load(page);await nav(page,'cart');await expect(page.locator('#cartContent')).toContainText('vacío');await nav(page,'menu');await expect(page.locator('.ccard')).toHaveCount(25);await page.locator('[data-cat="Repostería"]').click();await expect(page.locator('.ccard')).toHaveCount(5);await page.locator('.cc-add').first().click();await expect(page.locator('[data-opt]')).toHaveCount(0);await page.locator('#custAddBtn').click();await nav(page,'cart');await page.locator('[data-remove]').click();await expect(page.locator('#cartContent')).toContainText('vacío');
 expect(html).not.toMatch(/view-design|quizContainer|advanceOrderBtn|menuFavFilterBtn|notifDialog|site-footer/);
 await page.evaluate(()=>window.BeanCraftNative.back());expect(errors).toEqual([]);
});
test('cupones y QR usan la misma validación; cámara y ubicación denegadas',async({page})=>{
 const errors=await load(page);await login(page);await add(page);
 for(const [code,message] of [['X','no encontrado'],['VENCIDO25','vigencia'],['INACTIVO','desactivado']]){await page.locator('#couponInput').fill(code);await page.locator('#applyCouponBtn').click();await expect(page.locator('#couponFeedback')).toContainText(message);}
 await page.locator('#cartScanQrBtn').click();await page.locator('#startCameraBtn').click();expect(await page.evaluate(()=>window.nativeMessages.some(m=>m.type==='scanQr'))).toBe(true);
 await page.evaluate(()=>window.BeanCraftNative.qrResult({error:'Permiso de cámara denegado. Usa captura manual.'}));await expect(page.locator('#qrErrMsg')).toContainText('denegado');
 await page.evaluate(()=>window.BeanCraftNative.qrResult({code:'VENCIDO25'}));await expect(page.locator('#couponFeedback')).toContainText('vigencia');await page.locator('#cartScanQrBtn').click();await page.evaluate(()=>window.BeanCraftNative.qrResult({code:'BIENVENIDA'}));await expect(page.locator('#couponFeedback')).toContainText('-$30');
 await page.locator('[data-open-branch]:visible').click();await page.locator('#useGeoBtn').click();let id=await page.evaluate(()=>window.nativeMessages.filter(m=>m.type==='location').at(-1).id);await page.evaluate(id=>window.BeanCraftNative.locationResult({id,error:{code:1}}),id);await expect(page.locator('#geoFeedback')).toContainText('manualmente');
 await page.locator('#useGeoBtn').click();id=await page.evaluate(()=>window.nativeMessages.filter(m=>m.type==='location').at(-1).id);await page.evaluate(id=>window.BeanCraftNative.locationResult({id,position:{coords:{latitude:32.456,longitude:-114.756}}}),id);await expect(page.locator('#geoFeedback')).toContainText('Kino');await page.locator('[data-branch-pick="centro"]').click();expect(errors).toEqual([]);
});
test('horarios inválidos, cierre de sucursal y revisión corregible',async({page})=>{
 await load(page);await login(page);await add(page);await page.locator('[data-mode="scheduled"]').click();await page.locator('#pickupDate').fill('2026-11-22');await page.locator('#pickupTime').fill('12:00');await page.locator('#reviewOrderBtn').click();await expect(page.locator('#checkoutFeedback')).toContainText('futuras');
 await page.locator('#pickupDate').fill('2026-11-24');await page.locator('#pickupTime').fill('23:00');await page.locator('#reviewOrderBtn').click();await expect(page.locator('#checkoutFeedback')).toContainText('fuera');await page.locator('#pickupTime').fill('10:00');await page.locator('#reviewOrderBtn').click();await page.locator('#editCheckoutBtn').click();await expect(page.locator('#pickupDate')).toHaveValue('2026-11-24');
 await page.clock.setSystemTime(new Date('2026-11-23T23:00:00-07:00'));await nav(page,'cart');await expect(page.locator('[data-mode="now"]')).toBeDisabled();
});
test('cinco pantallas a 360px sin desbordamiento ni recursos rotos',async({page},info)=>{
 await page.setViewportSize({width:360,height:800});const errors=await load(page);
 for(const view of ['home','menu','cart','orders','profile']){await nav(page,view);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`${view}.png`),animations:'disabled'});}
 expect(await page.locator('img').evaluateAll(images=>images.every(i=>i.naturalWidth>0))).toBe(true);expect(errors).toEqual([]);
});

test('cantidades, regreso nativo, movimiento reducido e identificadores únicos',async({page})=>{
 await page.setViewportSize({width:320,height:700});const errors=await load(page);
 await page.evaluate(()=>window.BeanCraftNative.reducedMotion(true));await expect(page.locator('#native-reduced-motion')).toHaveCount(1);
 await nav(page,'menu');await page.locator('.cc-add').first().click();await page.evaluate(()=>window.BeanCraftNative.back());await expect(page.locator('#customizerDialog')).not.toBeVisible();
 await login(page);await add(page);await page.locator('[data-cqty="1"]').click();await expect(page.locator('.totals-line.grand')).toContainText('$110.00');await page.locator('[data-cqty="-1"]').click();await expect(page.locator('.totals-line.grand')).toContainText('$55.00');
 await page.locator('#couponInput').fill('BIENVENIDA');await page.locator('#applyCouponBtn').click();await page.locator('#couponInput').fill('OTONO20');await page.locator('#applyCouponBtn').click();await expect(page.locator('.totals-line.grand')).toContainText('$44.00');
 await page.locator('[data-open-branch]:visible').click();await page.locator('[data-branch-pick="plaza"]').click();await confirm(page);await expect(page.locator('#ordersContent')).toContainText('BeanCraft Bosque');
 const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(ids).size).toBe(ids.length);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});

test('carrusel original, armado con precios SRS y confirmación por arrastre',async({page},info)=>{
 const errors=await load(page);await expect(page.locator('.lh-cup')).toHaveCount(5);
 await expect(page.locator('#heroTitle')).toHaveText('Frappé Supremo');await page.locator('#heroNextBtn').click();await expect(page.locator('#heroTitle')).toHaveText('Refresher Dúo');
 const stage=await page.locator('#heroStage').boundingBox();await page.mouse.move(stage.x+stage.width/2,stage.y+70);await page.mouse.down();await page.mouse.move(stage.x+stage.width/2-100,stage.y+70,{steps:10});await page.mouse.up();await expect(page.locator('#heroTitle')).toHaveText('Frappé BeanCraft');
 await page.locator('[data-hero-idx="3"]').click();await expect(page.locator('#heroTitle')).toHaveText('Latte de caramelo');
 await page.locator('[data-hb-size="grande"]').click();await page.locator('[data-hb-milk="avena"]').click();await page.locator('[data-hb-sweet="miel"]').click();await page.locator('[data-hb-extra="shot"]').click();await expect(page.locator('#heroLiveTotal')).toHaveText('$105.00');
 await page.locator('.lh-cup.is-front').click();await expect(page.locator('#customizerDialog')).toBeVisible();await expect(page.locator('[data-opt="sweet"][data-val="miel"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#custAddBtn')).toContainText('$105.00');await page.locator('[data-close-dlg="customizerDialog"]').click();
 await page.locator('#heroOrderBtn').click();await nav(page,'cart');await expect(page.locator('#cartContent')).toContainText('Grande · Avena · Miel · Shot extra');await expect(page.locator('.totals-line.grand')).toContainText('$105.00');
 await login(page);await nav(page,'cart');await page.locator('#reviewOrderBtn').click();
 await page.locator('#slideKnob').scrollIntoViewIfNeeded();const k=await page.locator('#slideKnob').boundingBox();await page.mouse.move(k.x+25,k.y+20);await page.mouse.down();await page.mouse.move(k.x+40,k.y+20);await page.mouse.up();await expect(page.locator('#view-cart')).toBeVisible();
 await page.screenshot({path:info.outputPath('slider.png'),animations:'disabled'});await dragConfirm(page);await expect(page.locator('#view-orders')).toBeVisible();await expect(page.locator('#ordersContent .totals-line.grand')).toContainText('$105.00');
 expect(errors).toEqual([]);
});
