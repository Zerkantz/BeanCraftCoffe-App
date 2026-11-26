// Vistas: el sitio público no ofrece pedir, la landing tiene carrusel y explorador, y todas las pantallas se dibujan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarPantalla, RUTAS_SITIO } from '../js/app/pantallas.js';
import { PANTALLAS_PANEL } from '../js/vistas/panel/pantallas.js';
import { PAGINAS_LIBRERIA } from '../js/vistas/libreria.js';
import { iniciarSesion, cerrarSesion } from '../js/auth/sesion.js';
import { rutaDeArchivo } from '../js/app/enlaces.js';
import { PRODUCTOS } from '../js/data/catalogo.js';

const ruta = (partes, params = {}) => ({ partes, params, hash: '#/' + partes.join('/') });
const PROHIBIDO = /Pedir en la app|BotonPedir|Agregar al carrito|Mi pedido|data-calcula[^>]*data-total|Pídela|pide en la app/i;

test('El sitio público no tiene acciones de pedido en ningún breakpoint', () => {
  for (const bp of ['escritorio', 'tablet', 'movil']) {
    for (const [clave, def] of Object.entries(RUTAS_SITIO)) {
      for (const estado of def[4]) {
        const partes = clave === 'producto' ? ['producto', 'latte-de-caramelo'] : clave ? [clave] : [];
        const r = armarPantalla(ruta(partes, { estado }), bp);
        assert.ok(r.html, `${clave} ${estado} ${bp}`);
        assert.doesNotMatch(r.html, PROHIBIDO, `${clave || 'inicio'} · ${estado} · ${bp}`);
      }
    }
  }
});

test('La landing solo presenta hero con carrusel, marca, casa, quiz y sucursales', () => {
  const { html } = armarPantalla(ruta([]), 'escritorio');
  for (const pieza of ['Carrusel3D', 'FichaCarrusel', 'Pilares', 'HojasCasa', 'data-quiz', 'TarjetaSucursal', 'BotonAcceso']) assert.match(html, new RegExp(pieza), pieza);
  for (const fuera of ['class="Explorador', 'TarjetaCombinacion', 'MosaicoPromo']) assert.doesNotMatch(html, new RegExp(fuera), `${fuera} vive en su pestaña`);
  assert.match(html, /Solo personal/);
  assert.match(html, />Menú</, 'la pestaña se llama Menú');
});

test('Combinaciones tiene el explorador y la pizarra de sugeridas', () => {
  const { html } = armarPantalla(ruta(['combinaciones']), 'escritorio');
  for (const pieza of ['class="Explorador', 'rail-bases', 'PizarraCombos', 'TarjetaCombinacion']) assert.match(html, new RegExp(pieza), pieza);
});

test('Cada producto tiene su ficha y un slug que no existe da 404', () => {
  for (const p of PRODUCTOS) assert.match(armarPantalla(ruta(['producto', p.slug]), 'movil').titulo, /^P-03/);
  assert.match(armarPantalla(ruta(['producto', 'no-existe']), 'movil').titulo, /^P-10/);
  assert.match(armarPantalla(ruta(['pagina-rara']), 'movil').titulo, /^P-10/);
});

test('El panel sin sesión manda al acceso con regreso', () => {
  cerrarSesion();
  assert.equal(armarPantalla(ruta(['panel', 'cupones']), 'escritorio').redirigir, '#/acceso?volver=%23%2Fpanel%2Fcupones');
});

test('Todas las pantallas del panel se dibujan para el administrador', () => {
  iniciarSesion('ricardo@beancraft.mx', 'Admin1234');
  for (const s of PANTALLAS_PANEL.filter(x => !x.acceso)) {
    for (const estado of s.estados) {
      const r = armarPantalla(ruta(['panel', s.slug], { estado }), 'escritorio');
      assert.ok(r.html && !r.redirigir, `${s.id} ${estado}`);
      assert.doesNotMatch(r.html, /href="[^"#]*\.html/, `${s.id} ${estado}: enlace sin traducir`);
    }
  }
  cerrarSesion();
});

test('El personal ve A-19 en las pantallas del administrador', () => {
  iniciarSesion('daniela@beancraft.mx', 'Barra1234');
  assert.match(armarPantalla(ruta(['panel', 'usuarios']), 'escritorio').titulo, /^A-19/);
  assert.match(armarPantalla(ruta(['panel', 'pedidos']), 'escritorio').titulo, /^A-03/);
  cerrarSesion();
});

test('La librería de componentes se dibuja', () => {
  for (const f of Object.values(PAGINAS_LIBRERIA)) { const p = f(); assert.ok(p.html.startsWith('<div class="Lib"') && p.html.length > 20000, p.frame); }
});

test('Traducción de enlaces de la v1 a rutas', () => {
  assert.equal(rutaDeArchivo('P-02-menu--default.html#cat-cafes'), '#/bebidas?cat=cafes');
  assert.equal(rutaDeArchivo('P-03-producto--default.html'), '#/producto/iced-latte');
  assert.equal(rutaDeArchivo('A-10-cupones--default.html#hecho-cupon'), '#/panel/cupones?hecho=cupon');
  assert.equal(rutaDeArchivo('A-06-producto--edicion.html'), '#/panel/producto?estado=edicion');
  assert.equal(rutaDeArchivo('../panel-escritorio/A-01-login--vacio.html'), '#/acceso');
  assert.equal(rutaDeArchivo('A-03-pedidos--rol-personal.html'), '#/panel/pedidos');
});
