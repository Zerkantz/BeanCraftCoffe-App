// Bebidas (catálogo con categorías y búsqueda) y ficha de producto con sus combinaciones. Sin acciones de pedido.
import * as C from '../../componentes/base.js';
import { ic } from '../../lib/iconos.js';
import { foto } from '../../lib/foto.js';
import { P, PRODUCTOS, porSlug, precioLinea, costo, etiqueta } from '../../data/catalogo.js';
import { promosVigentes } from '../../data/cupones.js';
import { ahora } from '../../lib/reglas.js';
import { T, B, mxn, cabeza, pagina, CATS, slugCat, catDeSlug } from './comun.js';

const esqueletoTarjeta = () => `<div class="TarjetaBebida" data-estado="cargando" aria-hidden="true"><span class="esqueleto" style="height:196px;border-radius:10px"></span><span class="esqueleto" style="width:70%;height:22px"></span><span class="esqueleto" style="width:40%"></span><span class="esqueleto" style="width:55%;height:22px"></span></div>`;
const visiblesEnSitio = () => PRODUCTOS.filter(p => p.activo && !p.eliminado);

// Normaliza para buscar sin acentos ni mayúsculas.
export const normal = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Foto o mascota que representa cada categoría en el selector del menú.
const PORTADA_CAT = { 'Todas': null, 'Cafés': 'capuchino_duo', 'Bebidas frías': 'iced_latte', 'Repostería': 'croissant_mantequilla' };
const chipCategoria = (t, s, n, sel) => {
  const id = PORTADA_CAT[t];
  const img = id ? `<span class="portada imagen-fondo" data-fondo="${P[id].fondo}">${foto(P[id], 56, 'foto-cat')}</span>` : `<span class="portada" data-fondo="limon">${C.Mascota('taza', { tam: 48 })}</span>`;
  return C.Chip({ texto: `${img}<span class="nombre-cat">${t}</span><span class="n">${n}</span>`, sel, x: ` data-filtro="${t}" data-slug="${s}"` }).replace('class="Chip"', 'class="Chip ChipCategoria"');
};

export function bebidas(bp, estado, params) {
  const lista = visiblesEnSitio();
  const conteo = c => (c === 'Todas' ? lista.length : lista.filter(p => p.categoria === c).length);
  const activa = estado === 'filtro-activo' ? 'Bebidas frías' : catDeSlug(params.cat || 'todas');
  const q = estado === 'sin-resultados' ? 'pan de elote' : (params.q || '');
  const busqueda = C.Campo({ tipo: 'busqueda', valor: q, placeholder: 'Busca un café, frappé o pan…', nombre: 'q' });
  const orden = params.orden || 'populares';
  const ORDENES = [['populares', 'Más populares'], ['precio-menor', 'Precio: menor a mayor'], ['precio-mayor', 'Precio: mayor a menor'], ['nombre', 'Nombre A–Z']];
  const selOrden = `<label class="SelectNativo">${ic('ordenar', 18)}<span class="solo-lectores">Ordenar</span><select data-orden-menu aria-label="Ordenar">${ORDENES.map(([v, t]) => `<option value="${v}"${v === orden ? ' selected' : ''}>${t}</option>`).join('')}</select>${ic('chevron-abajo', 18)}</label>`;
  const barra = `<div class="barra-menu"><div class="filtros" role="radiogroup" aria-label="Categoría">${CATS.map(([t, s]) => chipCategoria(t, s, conteo(t), t === activa)).join('')}</div><div class="herramientas"><div class="busqueda" data-buscar>${busqueda}</div>${selOrden}</div></div>`;
  let grid;
  if (estado === 'cargando') grid = `<p class="conteo" aria-live="polite">Cargando productos…</p><div class="grid-tarjetas">${Array.from({ length: 8 }, esqueletoTarjeta).join('')}</div>`;
  else {
    const nq = normal(q);
    const ordenar = { 'precio-menor': (a, b) => a.precio - b.precio, 'precio-mayor': (a, b) => b.precio - a.precio, nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'), populares: (a, b) => b.cal - a.cal }[orden];
    const visibles = lista.filter(p => (activa === 'Todas' || p.categoria === activa) && (!nq || normal(`${p.nombre} ${p.categoria} ${p.desc}`).includes(nq))).sort(ordenar);
    const promo = promosVigentes(ahora()).find(x => x.codigo === 'AVENA10');
    const vacio = C.EstadoVacio({ mascota: 'hielito', titulo: nq ? `No encontramos “${q}”` : 'No hay productos en esta categoría', texto: 'Revisa cómo lo escribiste o busca por categoría: cafés, bebidas frías o repostería.', accion: B({ tipo: 'secundario', texto: 'Ver todo el menú', icono: 'x', href: '#/bebidas' }) });
    const conteoTxt = `<p class="conteo" aria-live="polite" data-conteo>${visibles.length} ${visibles.length === 1 ? 'producto' : 'productos'}</p>`;
    // Con "Todas", sin búsqueda y por popularidad, el menú se lee por apartados como la carta de la barra.
    const porApartado = activa === 'Todas' && !nq && orden === 'populares';
    const bandaPromo = promo ? C.TarjetaBebida(P.latte_caramelo, { variante: 'promo', promo }) : '';
    let cuerpo;
    if (!visibles.length) cuerpo = `<div data-vacio>${vacio}</div>`;
    else if (porApartado) {
      cuerpo = CATS.slice(1).map(([c], k) => {
        const deCat = visibles.filter(p => p.categoria === c);
        if (!deCat.length) return '';
        return `<section class="apartado-menu" aria-labelledby="ap-${slugCat(c)}"><div class="cabeza-apartado"><h2 id="ap-${slugCat(c)}">${c}</h2><span class="n">${deCat.length}</span></div><div class="grid-tarjetas" data-menu-grid>${deCat.map(p => C.TarjetaBebida(p)).join('')}</div></section>${k === 0 && bandaPromo ? `<div class="banda-promo">${bandaPromo}</div>` : ''}`;
      }).join('');
    } else {
      const cards = visibles.map(p => C.TarjetaBebida(p));
      if (promo && activa === 'Todas' && !nq && cards.length > 3) cards.splice(4, 0, bandaPromo);
      cuerpo = `<div class="grid-tarjetas" data-menu-grid>${cards.join('')}</div>`;
    }
    grid = conteoTxt + cuerpo;
  }
  return pagina(`${cabeza(T('h1', 'El ', 'menú', ' de la casa'), `${lista.length} productos entre cafés, bebidas frías y repostería, con su precio base y sus opciones.`)}${barra}<div data-resultados>${grid}</div>`);
}

const SUGERENCIAS = { 'Cafés': ['latte_caramelo', 'capuchino_duo', 'flat_white', 'croissant_mantequilla'], 'Bebidas frías': ['iced_latte', 'frappe_supremo', 'te_durazno', 'dona_fresa'], 'Repostería': ['concha_vainilla', 'oreja_hojaldrada', 'iced_latte', 'capuchino_duo'] };

export function producto(bp, estado, params) {
  const p = porSlug(params.slug || '') || (estado === 'no-disponible' ? P.iced_latte : null);
  if (!p) return null; // el enrutador muestra el 404
  const nd = estado === 'no-disponible' || !p.activo;
  const sel = params.sel ? JSON.parse(params.sel) : { prod: p.id, tam: 'mediano', leche: 'entera', endu: 'sin', extras: [] };
  const total = precioLinea(sel);
  const ext = sel.extras.reduce((s, e) => s + costo('extras', e), 0);
  const st = nd ? { estado: 'deshabilitado' } : {};
  const filas = p.personalizable
    ? [['base', 'Precio base', mxn(p.precio, 2)], ['tamano', `Tamaño · ${etiqueta('tamano', sel.tam)}`, '+' + mxn(costo('tamano', sel.tam), 2)], ['leche', `Leche · ${etiqueta('leche', sel.leche)}`, '+' + mxn(costo('leche', sel.leche), 2)], ['endulzante', `Endulzante · ${etiqueta('endulzante', sel.endu)}`, '+' + mxn(costo('endulzante', sel.endu), 2)], ['extras', `Extras · ${sel.extras.length ? sel.extras.map(e => etiqueta('extras', e)).join(', ') : 'Sin extras'}`, '+' + mxn(ext, 2)]]
    : [['base', 'Precio por pieza', mxn(p.precio, 2)]];
  const grupos = p.personalizable ? `${C.GrupoOpciones('tamano', sel.tam, st)}${C.GrupoOpciones('leche', sel.leche, st)}${C.GrupoOpciones('endulzante', sel.endu, st)}${C.GrupoOpciones('extras', sel.extras, st)}` : C.Aviso('info', 'Se vende por pieza y no lleva opciones.', { titulo: p.categoria === 'Repostería' ? 'Recién horneado' : 'Producto sin personalización' });
  const regla = p.personalizable ? 'Precio de referencia: base + tamaño + leche + endulzante + extras (RN-02). El pedido y los cupones se manejan en la app.' : 'El pedido y los cupones se manejan en la app.';
  const sug = SUGERENCIAS[p.categoria].filter(x => x !== p.id).slice(0, 4);
  while (sug.length < 4) sug.push(['chai_latte', 'cuernito_mantequilla', 'matcha_latte'].find(x => !sug.includes(x) && x !== p.id));
  const acciones = `<div class="acciones-ficha">${p.personalizable && !nd ? B({ texto: 'Abrir en el explorador', iconoDer: 'chevron-der', href: `#/combinaciones?base=${p.id}`, x: ' data-abrir-explorador' }) : ''}${B({ tipo: 'secundario', texto: 'Volver al menú', icono: 'chevron-izq', href: `#/bebidas?cat=${slugCat(p.categoria)}` })}</div>`;
  return `<section class="seccion pagina"><div class="contenedor"><nav class="migas" aria-label="Ruta"><a href="#/bebidas">Menú</a>${ic('chevron-der', 16)}<a href="#/bebidas?cat=${slugCat(p.categoria)}">${p.categoria}</a>${ic('chevron-der', 16)}<span aria-current="page">${p.nombre}</span></nav><div class="ficha"><div class="galeria imagen-fondo" data-fondo="${p.fondo}" data-disponible="${nd ? 'no' : 'si'}">${foto(p, 480)}${nd ? C.Etiqueta({ tipo: 'agotado', texto: 'No disponible hoy' }) : C.Etiqueta({ tipo: 'nuevo', texto: p.cal >= 4.9 ? 'Favorito de la casa' : 'De la casa', rot: -2 })}${C.Mascota(p.mascota, { tam: 128, fondo: 'oscuro', rot: 2 })}</div><div class="info" data-calcula data-base="${p.precio}" data-producto="${p.id}"><div class="meta">${C.Etiqueta({ tipo: 'nuevo', texto: p.categoria })}${p.frappe ? C.Etiqueta({ tipo: 'info', texto: 'Frappé' }) : ''}${C.Estrellas(p.cal)}</div><h1 class="nombre">${p.nombre}</h1><p class="desc">${p.desc}</p>${nd ? C.Aviso('info', 'Prueba con un Latte de caramelo o vuelve mañana.', { titulo: `Hoy no hay ${p.nombre} en ninguna sucursal` }) : ''}${grupos}<div class="resumen-precio" aria-live="polite">${filas.map(([k, a, b]) => `<div class="fila" data-fila="${k}"><span>${a}</span><span class="monto">${b}</span></div>`).join('')}<div class="total"><span class="etq">${p.personalizable ? 'Precio de referencia' : 'Precio'}</span><span data-total>${C.Marcatextos(mxn(p.personalizable ? total : p.precio, 2) + ' MXN', 'grande')}</span></div><p class="regla">${regla}</p></div>${acciones}</div></div></div></section><section class="seccion" data-fondo="blanco"><div class="contenedor">${cabeza(T('h2', 'También te ', 'puede', ' gustar'))}<div class="grid-tarjetas">${sug.map(x => C.TarjetaBebida(P[x])).join('')}</div></div></section>`;
}
