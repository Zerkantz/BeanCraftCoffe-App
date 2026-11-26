// Recorridos de punta a punta en navegador. Uso: npm start (en otra terminal) y luego npm run e2e
import assert from 'node:assert/strict';
import { cargarPlaywright, BASE } from './comun.mjs';

const { chromium } = await cargarPlaywright();
const navegador = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
const errores = [];
let ok = 0;
async function caso(nombre, fn, opciones = {}) {
  const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 }, ...opciones });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errores.push(`${nombre}: ${e.message}`));
  try { await fn(pg, ctx); ok++; console.log(`ok  ${nombre}`); } catch (e) { console.log(`MAL ${nombre}\n    ${e.message.split('\n')[0]}`); process.exitCode = 1; }
  await ctx.close();
}
const ir = async (pg, r) => { await pg.goto(`${BASE}${r}`); await pg.waitForTimeout(250); };
const texto = (pg, s) => pg.textContent(s).then(t => t.replace(/\s+/g, ' ').trim());
const aviso = pg => texto(pg, '.zona-toast-proto').catch(() => '');
const entrar = async (pg, correo, clave) => { await ir(pg, '#/acceso'); await pg.fill('input[name="correo"]', correo); await pg.fill('input[name="clave"]', clave); await pg.click('button[type="submit"]'); await pg.waitForTimeout(500); };

await caso('Carrusel: flechas, teclado, arrastre y vaso al frente', async pg => {
  await ir(pg, '#/');
  assert.equal(await texto(pg, '.FichaCarrusel .nombre'), 'Frappé Supremo');
  await pg.click('[data-girar="1"]'); await pg.waitForTimeout(150);
  assert.equal(await texto(pg, '.FichaCarrusel .nombre'), 'Refresher Dúo');
  await pg.focus('[data-escenario]'); await pg.keyboard.press('ArrowLeft'); await pg.waitForTimeout(150);
  assert.equal(await texto(pg, '.FichaCarrusel .nombre'), 'Frappé Supremo');
  const caja = await pg.locator('[data-escenario]').boundingBox();
  await pg.mouse.move(caja.x + caja.width / 2, caja.y + 100); await pg.mouse.down();
  await pg.mouse.move(caja.x + caja.width / 2 - 170, caja.y + 100, { steps: 8 }); await pg.mouse.up(); await pg.waitForTimeout(150);
  assert.equal(await texto(pg, '.FichaCarrusel .nombre'), 'Frappé BeanCraft', 'arrastrar 170 px gira dos lugares');
  assert.match(await texto(pg, '[data-anuncio]'), /Frappé BeanCraft, desde \$58/);
  await pg.click('.vaso.al-frente'); await pg.waitForTimeout(300);
  assert.equal(await pg.evaluate(() => location.hash), '#/producto/frappe-beancraft');
});

await caso('Hojas de la casa y explorador con precio de referencia (RN-02)', async pg => {
  await ir(pg, '#/');
  await pg.click('[data-hoja="reposteria"]');
  assert.equal(await pg.isVisible('#hoja-reposteria'), true);
  assert.equal(await pg.isVisible('#hoja-frappes'), false);
  assert.equal(await pg.$('.Explorador'), null, 'el explorador ya no está en el inicio');
  await ir(pg, '#/combinaciones');
  await pg.click('.opcion-bebida[data-base-id="matcha_latte"]');
  await pg.click('.Explorador .GrupoOpciones[data-grupo="tamano"] .Chip[data-id="grande"]');
  await pg.click('.Explorador .GrupoOpciones[data-grupo="leche"] .Chip[data-id="almendra"]');
  await pg.click('.Explorador .GrupoOpciones[data-grupo="endulzante"] .Chip[data-id="miel"]');
  assert.equal(await texto(pg, '.Explorador [data-total]'), '$114.00 MXN', '64 + 18 + 12 + 5 + 15');
  await pg.click('.Explorador .GrupoOpciones[data-grupo="extras"] .Chip[data-id="shot"]');
  assert.equal(await texto(pg, '.Explorador [data-total]'), '$99.00 MXN', 'quitar el shot resta 15');
  await pg.click('[data-cargar-combo="antojo-total"]'); await pg.waitForTimeout(200);
  assert.equal(await texto(pg, '.Explorador [data-total]'), '$99.00 MXN');
  assert.match(await texto(pg, '.Explorador [data-fila="base"]'), /Frappé Supremo/);
  assert.equal(await pg.$('text=Pedir en la app'), null);
});

await caso('Quiz completo y resultado al explorador', async pg => {
  await ir(pg, '#/?ir=quiz');
  await pg.click('[data-quiz-empezar]');
  for (let i = 0; i < 5; i++) { await pg.click('.OpcionQuiz[data-voto="cold_brew"]'); await pg.waitForTimeout(60); }
  assert.match(await texto(pg, '.Quiz[data-paso="resultado"] .TituloMixto'), /Cold brew/);
  await pg.click('text=Ver mi combinación'); await pg.waitForTimeout(300);
  assert.match(await texto(pg, '.Explorador [data-fila="base"]'), /Americano & Cold Brew/);
});

await caso('Bebidas: categoría, búsqueda sin acentos, orden y URL', async pg => {
  await ir(pg, '#/bebidas');
  await pg.click('.Chip[data-filtro="Repostería"]'); await pg.waitForTimeout(150);
  assert.equal(await texto(pg, '[data-conteo]'), '5 productos');
  assert.match(await pg.evaluate(() => location.hash), /cat=reposteria/);
  await pg.click('.Chip[data-filtro="Todas"]'); await pg.fill('[data-buscar] input', 'te'); await pg.waitForTimeout(350);
  assert.ok(Number((await texto(pg, '[data-conteo]')).split(' ')[0]) >= 3);
  await pg.fill('[data-buscar] input', 'cafe de altura'); await pg.waitForTimeout(350);
  assert.equal(await texto(pg, '[data-conteo]'), '1 producto', '“café” sin acento encuentra el Frappé BeanCraft');
  await pg.fill('[data-buscar] input', 'pan de elote'); await pg.waitForTimeout(350);
  assert.match(await texto(pg, '.EstadoVacio'), /No encontramos “pan de elote”/);
  await pg.fill('[data-buscar] input', ''); await pg.waitForTimeout(350);
  await pg.selectOption('[data-orden-menu]', 'precio-menor'); await pg.waitForTimeout(150);
  const precios = await pg.$$eval('[data-menu-grid] .TarjetaBebida:not([data-variante="promo"]) .precio .monto', xs => xs.map(x => Number(x.textContent.replace(/[^0-9.]/g, ''))));
  assert.deepEqual(precios, [...precios].sort((a, b) => a - b), 'orden por precio menor');
  assert.equal(await pg.$('.TarjetaBebida[data-nombre="agua purificada"]'), null, 'los productos inactivos no salen en el sitio');
});

await caso('Ficha de producto: precio de referencia en vivo', async pg => {
  await ir(pg, '#/producto/latte-de-caramelo');
  assert.equal(await texto(pg, '[data-total]'), '$65.00 MXN');
  await pg.click('.GrupoOpciones[data-grupo="leche"] .Chip[data-id="avena"]');
  await pg.click('.GrupoOpciones[data-grupo="extras"] .Chip[data-id="shot"]');
  assert.equal(await texto(pg, '[data-total]'), '$92.00 MXN');
  assert.equal(await texto(pg, '[data-fila="extras"] span:first-child'), 'Extras · Shot de espresso');
});

await caso('Sucursales: búsqueda y ubicación concedida', async (pg, ctx) => {
  await ctx.grantPermissions(['geolocation']);
  await ctx.setGeolocation({ latitude: 32.455, longitude: -114.757 });
  await ir(pg, '#/sucursales');
  await pg.fill('[data-buscar-sucursal] input', 'campus'); await pg.waitForTimeout(350);
  assert.equal(await pg.$$eval('[data-resultados-suc] .TarjetaSucursal', x => x.length), 1);
  await pg.fill('[data-buscar-sucursal] input', ''); await pg.waitForTimeout(350);
  await pg.click('[data-usar-ubicacion]'); await pg.waitForTimeout(800);
  assert.match(await pg.evaluate(() => location.hash), /ubicacion-concedida/);
  assert.match(await texto(pg, '.TarjetaSucursal[data-sugerida="si"]'), /Kino/);
}, { permissions: [] });

await caso('Sucursales: ubicación denegada', async pg => {
  await ir(pg, '#/sucursales');
  await pg.click('[data-usar-ubicacion]'); await pg.waitForTimeout(800);
  assert.match(await pg.evaluate(() => location.hash), /ubicacion-denegada/);
});

await caso('Contacto: validación y envío', async pg => {
  await ir(pg, '#/contacto');
  await pg.click('button[type="submit"]');
  assert.match(await texto(pg, '.form-sitio .Aviso'), /Revisa los 3 campos/);
  await pg.fill('[name="nombre"]', 'Mariana'); await pg.fill('[name="correo"]', 'mariana@correo'); await pg.fill('[name="mensaje"]', 'Hola');
  await pg.click('button[type="submit"]');
  assert.match(await texto(pg, '.Campo[data-estado="error"]'), /Revisa tu correo/);
  await pg.fill('[name="correo"]', 'mariana@correo.com'); await pg.click('button[type="submit"]'); await pg.waitForTimeout(300);
  assert.match(await texto(pg, '.enviado'), /Recibimos tu mensaje/);
});

await caso('Cabecera: acceso del personal visible y cambio de breakpoint al redimensionar', async pg => {
  await ir(pg, '#/');
  assert.match(await texto(pg, '.Cabecera .BotonAcceso'), /Iniciar sesión\s*Solo personal/);
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(500);
  assert.equal(await pg.evaluate(() => document.body.classList.contains('bp-movil')), true);
  assert.equal(await pg.isVisible('.Cabecera .BotonAcceso'), true, 'en móvil el acceso sigue en la barra superior');
  await pg.click('[data-alternar-menu]');
  assert.equal(await pg.isVisible('.menu-movil'), true);
  await pg.click('.menu-movil a[href="#/promociones"]'); await pg.waitForTimeout(300);
  assert.match(await pg.title(), /P-05 Promociones · Móvil/);
});

await caso('Panel: guardia, RN-04, cupón que sale del sitio y avance automático', async pg => {
  await ir(pg, '#/panel/cupones');
  assert.match(await pg.evaluate(() => location.hash), /^#\/acceso\?volver=/);
  await pg.fill('input[name="correo"]', 'ricardo@beancraft.mx'); await pg.fill('input[name="clave"]', 'Admin1234'); await pg.click('button[type="submit"]'); await pg.waitForTimeout(600);
  assert.match(await pg.title(), /^A-10 Cupones/);
  await pg.click('tr:has-text("AVENA10") .Interruptor'); await pg.click('.Dialogo [data-tipo="principal"]'); await pg.waitForTimeout(300);
  await ir(pg, '#/promociones?ahora=2026-11-20T08:15');
  assert.ok(!(await texto(pg, 'main')).includes('AVENA10'), 'el cupón desactivado sale de las promociones');
  await ir(pg, '#/panel/pedidos');
  await pg.click('.ColumnaPedidos[data-estado="recibido"] .TarjetaPedido [data-avanzar]'); await pg.waitForTimeout(200);
  assert.match(await aviso(pg), /pasó a Preparando/);
  await ir(pg, '#/panel/respaldo?estado=generando'); await pg.waitForTimeout(2600);
  assert.match(await pg.title(), /A-16 Respaldo y restauración · Escritorio · exito/);
});

await caso('Panel: el personal solo ve su sucursal y A-19 en lo demás', async pg => {
  await entrar(pg, 'daniela@beancraft.mx', 'Barra1234');
  assert.match(await pg.title(), /^A-03 Pedidos/);
  assert.equal(await pg.$$eval('.Sidebar .nav .ItemSidebar', x => x.length), 1);
  assert.equal(await pg.$$eval('.suc-pedido', x => x.length), 0);
  await ir(pg, '#/panel/usuarios');
  assert.match(await pg.title(), /^A-19 Sin permiso/);
});

await caso('Todos los enlaces internos llevan a una pantalla existente', async pg => {
  await entrar(pg, 'ricardo@beancraft.mx', 'Admin1234');
  const vistos = new Set(), pendientes = ['#/', '#/guia', '#/libreria/04-organismos'];
  const rotos = [];
  while (pendientes.length && vistos.size < 400) {
    const r = pendientes.shift();
    if (vistos.has(r) || /cerrar-sesion|hecho=sesion/.test(r)) continue;
    vistos.add(r);
    await pg.goto(`${BASE}${r}`); await pg.waitForTimeout(60);
    if (/^P-10/.test(await pg.title()) && !r.includes('no-existe')) rotos.push(r);
    const enlaces = await pg.$$eval('a[href^="#/"], [data-ir^="#/"]', xs => xs.map(x => x.getAttribute('href') || x.dataset.ir));
    enlaces.forEach(e => { const [ruta, qs = ''] = e.split('?'); const q = new URLSearchParams(qs); q.delete('hecho'); const limpio = ruta + (q.toString() ? `?${q}` : ''); if (!vistos.has(limpio)) pendientes.push(limpio); });
  }
  assert.deepEqual(rotos, [], `rutas rotas: ${rotos.join(', ')}`);
  console.log(`    ${vistos.size} rutas recorridas`);
});

await navegador.close();
console.log(`\n${ok} recorridos correctos${errores.length ? `\nErrores de JavaScript:\n${errores.join('\n')}` : ', sin errores de JavaScript.'}`);
if (errores.length) process.exitCode = 1;
