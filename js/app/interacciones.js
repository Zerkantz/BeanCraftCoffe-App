// Interacciones de la app. Los eventos se escuchan una vez en document (delegación) y montar() prepara lo que
// necesita cada pantalla recién dibujada (carrusel, paginación, puntos de promos).
import { ic } from '../lib/iconos.js';
import { mxn, fichaDe } from '../componentes/base.js';
import * as L from '../componentes/landing.js';
import { P, costo, etiqueta } from '../data/catalogo.js';
import { COMBINACIONES } from '../data/experiencia.js';
import { usuarioPorCorreo } from '../data/usuarios.js';
import { quiz } from '../vistas/sitio/inicio.js';
import { bebidas } from '../vistas/sitio/catalogo.js';
import { sucursales } from '../vistas/sitio/paginas.js';
import { iniciarSesion, sesion, actualizarPerfil, cambiarContrasena } from '../auth/sesion.js';
import { inicioDeRol } from '../auth/permisos.js';
import { correoValido, telefonoValido, LIMITES } from '../lib/reglas.js';
import { avanzarPedido, activarCupon, activarUsuario, mostrarComentario } from './acciones.js';
import { reiniciarDatos } from './estado.js';
import { FRASES_ACCESO } from '../vistas/acceso.js';
import { leerRuta, ir, actualizarParams } from './router.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let CTX = { bp: 'escritorio', ruta: null, render: () => {}, coords: null };

/* ───────────── Avisos ───────────── */
const zona = () => $('.zona-toast-proto');
let tToast;
export function toast(texto, tipo = 'exito') {
  const icono = { exito: 'check', error: 'alerta', info: 'info' }[tipo];
  zona().innerHTML = `<div class="Toast" data-tipo="${tipo}" role="status"><span class="icono">${ic(icono, 18)}</span><span class="texto">${texto}</span><button type="button" class="cerrar" aria-label="Cerrar aviso">${ic('x', 16)}</button></div>`;
  clearTimeout(tToast); tToast = setTimeout(() => { zona().innerHTML = ''; }, 4600);
}
const EXTERNOS = { app: 'Aquí se abre la ficha de la app BeanCraft en la tienda (marcador de posición).', instagram: 'Aquí se abre el Instagram de BeanCraft.', facebook: 'Aquí se abre el Facebook de BeanCraft.', tiktok: 'Aquí se abre el TikTok de BeanCraft.' };

/* ───────────── Formularios ───────────── */
function errorCampo(campo, texto) {
  campo.dataset.estado = 'error';
  let m = $('.MensajeError', campo);
  if (!m) { m = document.createElement('span'); m.className = 'MensajeError'; m.setAttribute('role', 'alert'); campo.appendChild(m); }
  m.innerHTML = ic('alerta', 16) + texto;
}
function limpiarErrores(raiz) {
  $$('.Campo', raiz).forEach(c => { const i = $('input,textarea', c); c.dataset.estado = i && i.value ? 'lleno' : 'vacio'; const m = $('.MensajeError', c); if (m) m.remove(); });
  $$('.Aviso[data-proto]', raiz).forEach(a => a.remove());
}
function avisoForm(raiz, texto, titulo = '', antes = null) {
  const a = document.createElement('div');
  a.className = 'Aviso'; a.dataset.tipo = 'error'; a.dataset.proto = ''; a.setAttribute('role', 'alert');
  a.innerHTML = `${ic('alerta', 20)}<div class="cuerpo">${titulo ? `<span class="titulo">${titulo}</span>` : ''}<span class="texto">${texto}</span></div>`;
  if (antes) antes.before(a); else raiz.prepend(a);
}
const campoDe = (raiz, nombre) => { const i = $(`[name="${nombre}"]`, raiz); return { input: i, campo: i && i.closest('.Campo'), valor: i ? i.value : '' }; };

/* ───────────── Selección de chips y precio en vivo (RN-02) ───────────── */
function seleccionarChip(chip) {
  if (chip.getAttribute('aria-disabled') === 'true') return;
  if (chip.dataset.seleccion === 'multiple') {
    const on = chip.dataset.seleccionado !== 'si';
    chip.dataset.seleccionado = on ? 'si' : 'no'; chip.setAttribute('aria-pressed', on);
    const m = $('.marca', chip); if (m) m.hidden = !on;
  } else {
    const grupo = chip.closest('[role="radiogroup"], .chips, .filtros, .chips-panel') || chip.parentElement;
    $$('.Chip', grupo).forEach(c => { if (c.dataset.seleccion !== 'multiple') { c.dataset.seleccionado = 'no'; c.setAttribute('aria-checked', 'false'); } });
    chip.dataset.seleccionado = 'si'; chip.setAttribute('aria-checked', 'true');
  }
}
const GRUPOS = ['tamano', 'leche', 'endulzante', 'extras'];
function leerSel(raiz, prod) {
  const ids = g => $$(`.GrupoOpciones[data-grupo="${g}"] .Chip[data-seleccionado="si"]`, raiz).map(c => c.dataset.id);
  return { prod, tam: ids('tamano')[0], leche: ids('leche')[0], endu: ids('endulzante')[0], extras: ids('extras') };
}
// Ficha de producto: actualiza el desglose sin volver a dibujar.
function recalcularFicha(raiz) {
  const p = P[raiz.dataset.producto];
  if (!p || !p.personalizable) return;
  const s = leerSel(raiz, p.id);
  const ext = s.extras.reduce((t, e) => t + costo('extras', e), 0);
  const total = p.precio + costo('tamano', s.tam) + costo('leche', s.leche) + costo('endulzante', s.endu) + ext;
  const filas = { tamano: [`Tamaño · ${etiqueta('tamano', s.tam)}`, costo('tamano', s.tam)], leche: [`Leche · ${etiqueta('leche', s.leche)}`, costo('leche', s.leche)], endulzante: [`Endulzante · ${etiqueta('endulzante', s.endu)}`, costo('endulzante', s.endu)], extras: [`Extras · ${s.extras.length ? s.extras.map(e => etiqueta('extras', e)).join(', ') : 'Sin extras'}`, ext] };
  Object.entries(filas).forEach(([k, [t, c]]) => { const f = $(`[data-fila="${k}"]`, raiz); if (f) { f.children[0].textContent = t; f.children[1].textContent = '+' + mxn(c, 2); } });
  const tot = $('[data-total] .texto', raiz); if (tot) tot.textContent = mxn(total, 2) + ' MXN';
  const ab = $('[data-abrir-explorador]', raiz); if (ab) ab.setAttribute('href', `#/combinaciones?base=${p.id}`);
}

/* ───────────── Explorador de combinaciones ───────────── */
function redibujarExplorador(ex, sel, foco, recentrar = false) {
  const nuevo = document.createElement('div');
  nuevo.innerHTML = L.Explorador(sel, { bp: CTX.bp });
  const el = nuevo.firstElementChild;
  const railViejo = $('.tira-bebidas', ex), desplazado = railViejo && !recentrar ? railViejo.scrollLeft : null;
  ex.replaceWith(el);
  centrarBase(el, desplazado);
  if (foco) { const f = $(foco, el); if (f) f.focus({ preventScroll: true }); }
}
// Conserva el desplazamiento del riel de bebidas al redibujar; si no hay uno previo, centra la bebida elegida.
function centrarBase(ex, desplazado = null) {
  const rail = $('.tira-bebidas', ex); if (!rail) return;
  if (desplazado !== null) { rail.scrollLeft = desplazado; return; }
  const elegida = $('.opcion-bebida[aria-checked="true"]', rail);
  if (elegida) rail.scrollLeft = Math.max(0, elegida.offsetLeft - (rail.clientWidth - elegida.offsetWidth) / 2);
}
function explorador(ev, t) {
  const ex = t.closest('[data-explorador]');
  if (!ex) return false;
  const sel = JSON.parse(ex.dataset.explorador);
  const ob = t.closest('.opcion-bebida');
  if (ob) { sel.prod = ob.dataset.baseId; redibujarExplorador(ex, sel, `[data-base-id="${sel.prod}"]`); return true; }
  const chip = t.closest('.GrupoOpciones .Chip');
  if (chip) {
    const g = chip.closest('.GrupoOpciones').dataset.grupo, id = chip.dataset.id;
    if (g === 'extras') sel.extras = sel.extras.includes(id) ? sel.extras.filter(x => x !== id) : [...sel.extras, id];
    else sel[{ tamano: 'tam', leche: 'leche', endulzante: 'endu' }[g]] = id;
    redibujarExplorador(ex, sel, `.GrupoOpciones[data-grupo="${g}"] .Chip[data-id="${id}"]`);
    return true;
  }
  if (t.closest('[data-explorador-reiniciar]')) { redibujarExplorador(ex, { ...L.SEL_INICIAL, extras: [...L.SEL_INICIAL.extras] }, '.opcion-bebida[aria-checked="true"]', true); return true; }
  return false;
}
function cargarCombo(id) {
  const c = COMBINACIONES.find(x => x.id === id);
  const ex = $('[data-explorador]');
  if (!c) return;
  if (!ex) { ir(`#/combinaciones?combo=${id}`); return; }
  redibujarExplorador(ex, { ...c.l, extras: [...c.l.extras] }, null, true);
  $('#explorador').scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
  toast(`Cargamos “${c.nombre}” en el explorador.`, 'info');
}

/* ───────────── Carrusel 3D ───────────── */
function pintarCarrusel(car, arrastre = 0) {
  const ids = car.dataset.ids.split(','), total = ids.length, paso = Number(car.dataset.paso);
  const frente = L.indiceDe(paso, total);
  $$('.vaso', car).forEach((v, i) => {
    const pos = L.posicionVaso(i, paso, total, CTX.bp, arrastre);
    v.style.transform = pos.transform; v.style.opacity = pos.opacidad; v.style.zIndex = pos.z;
    const alFrente = i === frente && arrastre === 0;
    v.classList.toggle('al-frente', alFrente);
    v.classList.toggle('arrastrando', arrastre !== 0);
    v.setAttribute('aria-label', alFrente ? `Ver ficha de ${P[ids[i]].nombre}` : `Girar a ${P[ids[i]].nombre}`);
  });
  if (arrastre !== 0) return;
  const p = P[ids[frente]];
  const an = $('[data-anuncio]', car); if (an) an.textContent = `${p.nombre}, desde ${mxn(p.precio)}`;
  const cn = $('[data-contador]', car); if (cn) cn.innerHTML = `<strong>${String(frente + 1).padStart(2, '0')}</strong> / ${String(total).padStart(2, '0')}`;
  const ficha = $('[data-ficha-carrusel]');
  if (ficha && ficha.dataset.id !== p.id) { const n = document.createElement('div'); n.innerHTML = L.FichaCarrusel(p); ficha.replaceWith(n.firstElementChild); }
}
function girar(car, delta) { car.dataset.paso = String(Number(car.dataset.paso) + delta); pintarCarrusel(car); }
function girarA(car, idx) {
  const total = car.dataset.ids.split(',').length, paso = Number(car.dataset.paso);
  let d = idx - L.indiceDe(paso, total);
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  girar(car, d);
}
function montarCarrusel(car) {
  const esc = $('[data-escenario]', car);
  let x0 = null, dx = 0, movido = false;
  esc.addEventListener('pointerdown', e => { if (e.button !== 0) return; x0 = e.clientX; dx = 0; movido = false; });
  esc.addEventListener('pointermove', e => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    if (Math.abs(dx) > 8) { movido = true; esc.setPointerCapture(e.pointerId); }
    if (movido) pintarCarrusel(car, dx / 140);
  });
  const fin = () => {
    if (x0 === null) return;
    x0 = null;
    const pasos = Math.round(-dx / 75);
    if (pasos) car.dataset.paso = String(Number(car.dataset.paso) + pasos);
    pintarCarrusel(car);
    esc.dataset.movido = movido ? '1' : '0';
    setTimeout(() => { esc.dataset.movido = '0'; }, 40);
  };
  esc.addEventListener('pointerup', fin);
  esc.addEventListener('pointercancel', fin);
  esc.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); girar(car, -1); } if (e.key === 'ArrowRight') { e.preventDefault(); girar(car, 1); } });
}

/* ───────────── Resultados en vivo (Bebidas y Sucursales) ───────────── */
function refrescarZona(vista, selector, extra = []) {
  const r = leerRuta();
  const tmp = document.createElement('div');
  tmp.innerHTML = vista(CTX.bp, 'default', { ...r.params, slug: r.partes[1] });
  [selector, ...extra].forEach(s => { const nuevo = $(s, tmp), viejo = $(s); if (nuevo && viejo) viejo.innerHTML = nuevo.innerHTML; });
}
let tBusqueda;
const refrescarBebidas = () => refrescarZona(bebidas, '[data-resultados]', ['.barra-menu .filtros']);
const refrescarSucursales = () => refrescarZona(sucursales, '[data-resultados-suc]');

function usarUbicacion() {
  if (!navigator.geolocation) { ir('#/sucursales?estado=ubicacion-denegada'); return; }
  ir('#/sucursales?estado=ubicacion-pedida');
  navigator.geolocation.getCurrentPosition(
    pos => { CTX.coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }; CTX.alCoords(CTX.coords); ir('#/sucursales?estado=ubicacion-concedida', { reemplazar: true }); },
    () => ir('#/sucursales?estado=ubicacion-denegada', { reemplazar: true }),
    { timeout: 8000, maximumAge: 300000 },
  );
}

/* ───────────── Tablas del panel (heredado de la v1) ───────────── */
function filtrarFilas(chip) {
  const tabla = $('[data-filas]'); if (!tabla) return;
  const v = chip.dataset.filtroFila, attr = chip.dataset.atributo || 'grupo';
  $$('tbody .FilaTabla', tabla).forEach(f => { f.hidden = v !== 'todos' && f.dataset[attr] !== v; });
  const pag = $('.Paginacion', tabla); if (pag) pag.hidden = v !== 'todos';
}
function paginar(tabla, pagina) {
  const filas = $$('tbody .FilaTabla', tabla), por = 10, total = filas.length, paginas = Math.max(1, Math.ceil(total / por));
  filas.forEach((f, i) => { f.hidden = Math.floor(i / por) + 1 !== pagina; });
  const pag = $('.Paginacion', tabla); if (!pag) return;
  $('.rango', pag).textContent = `Mostrando ${(pagina - 1) * por + 1}–${Math.min(pagina * por, total)} de ${total}`;
  $$('.num', pag).forEach(b => { const on = Number(b.textContent) === pagina; b.dataset.actual = on ? 'si' : ''; if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); b.hidden = Number(b.textContent) > paginas; });
  const [ant, sig] = $$('.IconoCirculo', pag);
  ant.dataset.estado = pagina === 1 ? 'deshabilitado' : 'normal'; sig.dataset.estado = pagina >= paginas ? 'deshabilitado' : 'normal';
  tabla.dataset.pagina = pagina; tabla.dataset.paginas = paginas;
}
function alternar(el) {
  if (el.dataset.estado === 'deshabilitado') return;
  if (el.classList.contains('Radio')) {
    const grupo = el.closest('.casillas, [role="radiogroup"]') || el.parentElement;
    $$('.Radio', grupo).forEach(r => { r.dataset.marcado = 'no'; r.setAttribute('aria-checked', 'false'); });
    el.dataset.marcado = 'si'; el.setAttribute('aria-checked', 'true'); return;
  }
  const on = el.dataset.marcado !== 'si';
  el.dataset.marcado = on ? 'si' : 'no'; el.setAttribute('aria-checked', on);
  if (el.dataset.on) { const t = $('.texto', el); if (t) t.textContent = on ? el.dataset.on : el.dataset.off; }
  const fila = el.closest('.FilaTabla');
  if (fila && el.classList.contains('Interruptor')) fila.dataset.estado = on ? 'normal' : 'inactiva';
}
function filtrarTablero() {
  const q = ($('[data-buscar-pedido] input') || { value: '' }).value.trim().toLowerCase();
  const f = $('.BarraSuperiorPanel .Filtro .control .valor');
  const suc = f && !/Todas|tu sucursal/.test(f.textContent) ? f.textContent.trim() : '';
  $$('.TarjetaPedido').forEach(c => { const ok = (!q || c.textContent.toLowerCase().includes(q)) && (!suc || ($('.suc-pedido', c) || { textContent: '' }).textContent.includes(suc)); c.hidden = !ok; });
  $$('.ColumnaPedidos').forEach(col => { const n = $$('.TarjetaPedido', col).filter(c => !c.hidden).length; const k = $('.conteo', col); if (k) k.textContent = n; });
}


/* ───────── Acceso: la mascota anfitriona reacciona al formulario ───────── */
function animo(clave) {
  const esc = $('.EscenaAcceso'); if (!esc) return;
  esc.dataset.animo = clave;
  const b = $('[data-burbuja]', esc); if (b && FRASES_ACCESO[clave]) b.textContent = FRASES_ACCESO[clave];
}

/* ───────── Mapa de sucursales: pin ↔ tarjeta ───────── */
function resaltarSucursal(id, { desplazar = false } = {}) {
  $$('.MapaIlustrado .pin').forEach(p => p.classList.toggle('activo', p.dataset.sucursal === id));
  $$('.TarjetaSucursal[data-suc]').forEach(t => t.classList.toggle('resaltada', t.dataset.suc === id));
  if (desplazar) { const t = $(`#sucursal-${id}`); if (t) t.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'center' }); }
}

/* ───────── Barra lateral compacta: nombre de la sección ───────── */
let tTip;
function etiquetaItem(el) {
  const t = $('.texto', el);
  if (t && t.getBoundingClientRect().width > 1) return null; // la barra está expandida: el nombre ya se ve
  return (t && t.textContent.trim()) || el.getAttribute('aria-label');
}
function mostrarTip(el, { breve = false } = {}) {
  const texto = etiquetaItem(el);
  if (!texto) return;
  let tip = $('.TooltipSidebar');
  if (!tip) { tip = document.createElement('div'); tip.className = 'TooltipSidebar'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
  tip.textContent = texto;
  // En la barra superior móvil, el ícono fuera de la vista se desplaza al centro antes de mostrar su nombre.
  const barra = el.closest('.Sidebar');
  if (barra && barra.scrollWidth > barra.clientWidth) {
    const rb = barra.getBoundingClientRect(), ri = el.getBoundingClientRect();
    if (ri.left < rb.left || ri.right > rb.right) barra.scrollLeft += ri.left - rb.left - (rb.width - ri.width) / 2;
  }
  const r = el.getBoundingClientRect(), barraArriba = r.top < 90 && CTX.bp === 'movil';
  tip.dataset.lado = barraArriba ? 'abajo' : 'derecha';
  tip.style.left = `${barraArriba ? r.left + r.width / 2 : r.right + 12}px`;
  tip.style.top = `${barraArriba ? r.bottom + 10 : r.top + r.height / 2}px`;
  tip.dataset.activo = el.getAttribute('aria-current') === 'page' ? 'si' : 'no';
  tip.hidden = false;
  // Nunca fuera de la pantalla: se ajusta al borde y la flecha sigue apuntando al ícono.
  const rt = tip.getBoundingClientRect(), margen = 8;
  const corr = rt.right > innerWidth - margen ? innerWidth - margen - rt.right : rt.left < margen ? margen - rt.left : 0;
  if (corr) tip.style.left = `${parseFloat(tip.style.left) + corr}px`;
  tip.style.setProperty('--flecha', `${-corr}px`);
  clearTimeout(tTip);
  if (breve) tTip = setTimeout(ocultarTip, 1800);
}
function ocultarTip() { const tip = $('.TooltipSidebar'); if (tip) tip.hidden = true; }

/* ───────────── Escuchas globales (una vez) ───────────── */
export function iniciarInteracciones({ render, alCoords }) {
  CTX.render = render; CTX.alCoords = alCoords;

  document.addEventListener('click', ev => {
    const t = ev.target;
    if (t.closest('.zona-toast-proto .cerrar')) { zona().innerHTML = ''; return; }
    const saltar = t.closest('[data-saltar]');
    if (saltar) { ev.preventDefault(); const m = $('#contenido'); if (m) m.focus(); return; }
    const ext = t.closest('[data-externo]');
    if (ext) { ev.preventDefault(); toast(EXTERNOS[ext.dataset.externo], 'info'); return; }
    if (t.closest('[aria-disabled="true"]')) { ev.preventDefault(); return; }

    // Menú móvil
    const bm = t.closest('[data-alternar-menu]');
    if (bm) { const cab = bm.closest('.Cabecera'), nav = $('.menu-movil', cab), ab = nav.hidden; nav.hidden = !ab; cab.dataset.menu = ab ? 'abierto' : 'cerrado'; bm.setAttribute('aria-expanded', ab); bm.setAttribute('aria-label', ab ? 'Cerrar menú' : 'Abrir menú'); $('.ic-abrir', bm).hidden = ab; $('.ic-cerrar', bm).hidden = !ab; return; }

    // Carrusel
    const car = t.closest('[data-carrusel]');
    if (car) {
      const g = t.closest('[data-girar]');
      if (g) { girar(car, Number(g.dataset.girar)); return; }
      const v = t.closest('.vaso');
      if (v) { if ($('[data-escenario]', car).dataset.movido === '1') return; if (v.classList.contains('al-frente')) ir(fichaDe(P[v.dataset.id])); else girarA(car, Number(v.dataset.idx)); return; }
    }

    // Hojas de la casa
    const pes = t.closest('[data-hoja]');
    if (pes) { const caja = pes.closest('[data-hojas]'); $$('[data-hoja]', caja).forEach(b => { const on = b === pes; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; }); $$('.hoja', caja).forEach(h => { h.hidden = h.id !== `hoja-${pes.dataset.hoja}`; }); return; }

    // Explorador y combinaciones
    if (explorador(ev, t)) return;
    const combo = t.closest('[data-cargar-combo]');
    if (combo) { cargarCombo(combo.dataset.cargarCombo); return; }

    // Quiz
    const q = t.closest('[data-quiz]');
    if (q) {
      const resp = q.dataset.respuestas ? q.dataset.respuestas.split(',').filter(Boolean) : [];
      const poner = html => { const n = document.createElement('div'); n.innerHTML = html; q.replaceWith(n.firstElementChild); const f = $('#quiz .OpcionQuiz, #quiz [data-quiz-empezar]'); if (f) f.focus({ preventScroll: true }); };
      if (t.closest('[data-quiz-empezar]')) { poner(quiz(0, [])); return; }
      const op = t.closest('.OpcionQuiz[data-voto]');
      if (op) { const n = Number(q.dataset.pregunta), r = [...resp, op.dataset.voto]; poner(n + 1 < 5 ? quiz(n + 1, r) : quiz('resultado', r)); return; }
      if (t.closest('[data-quiz-atras]')) { const n = Number(q.dataset.pregunta); poner(n > 0 ? quiz(n - 1, resp.slice(0, -1)) : quiz('portada')); return; }
    }

    // Panel: tablero (RN-04, RF-16)
    const av = t.closest('[data-avanzar], [data-avanzar-detalle]');
    if (av) {
      ev.preventDefault();
      const id = av.dataset.id || av.closest('.TarjetaPedido').dataset.id;
      const r = avanzarPedido(sesion(), id);
      CTX.render({ conservarScroll: true });
      toast(r.texto, r.ok ? 'exito' : 'error');
      return;
    }
    const card = t.closest('.TarjetaPedido');
    if (card && t.closest('[data-tablero]')) { ir(`#/panel/pedidos?pedido=${card.dataset.id}`); return; }
    const ac = t.closest('[data-activar-cupon]'); if (ac) { toast(activarCupon(ac.dataset.activarCupon)); CTX.render({ conservarScroll: true }); return; }
    const au = t.closest('[data-activar-usuario]'); if (au) { toast(activarUsuario(au.dataset.activarUsuario)); CTX.render({ conservarScroll: true }); return; }
    const mc = t.closest('[data-mostrar-comentario]'); if (mc) { toast(mostrarComentario(mc.dataset.mostrarComentario)); CTX.render({ conservarScroll: true }); return; }

    // Perfil y contraseña (RF-23)
    if (t.closest('[data-guardar-perfil]')) {
      const f = $('[data-form-perfil]'); limpiarErrores(f);
      const n = campoDe(f, 'nombre'), tel = campoDe(f, 'tel');
      if (!n.valor.trim()) { errorCampo(n.campo, 'Escribe tu nombre.'); n.input.focus(); return; }
      if (n.valor.length > LIMITES.nombre) { errorCampo(n.campo, `El nombre admite hasta ${LIMITES.nombre} caracteres.`); n.input.focus(); return; }
      if (!telefonoValido(tel.valor)) { errorCampo(tel.campo, 'Escribe un teléfono de 10 dígitos.'); tel.input.focus(); return; }
      actualizarPerfil({ nombre: n.valor.trim(), tel: tel.valor.trim() });
      ir('#/panel/perfil?hecho=perfil');
      return;
    }
    const conf = t.closest('[data-confirmar]');
    if (conf && conf.closest('.Dialogo') && $('[data-form-contrasena]', conf.closest('.Dialogo'))) {
      const d = conf.closest('.Dialogo'), f = $('[data-form-contrasena]', d); limpiarErrores(f);
      const a = campoDe(f, 'actual'), n = campoDe(f, 'nueva'), c = campoDe(f, 'confirma');
      const r = cambiarContrasena(a.valor, n.valor, c.valor);
      if (!r.ok) { errorCampo((r.codigo === 'error-actual' ? a : r.codigo === 'no-coinciden' ? c : n).campo, r.mensaje); return; }
      ir('#/panel/contrasena?estado=exito');
      return;
    }

    // Guía: atajos de acceso y datos de prueba
    const como = t.closest('[data-entrar-como]');
    if (como) { const u = usuarioPorCorreo(como.dataset.entrarComo); const r = iniciarSesion(u.correo, u.clave); toast(r.ok ? `Sesión iniciada como ${u.nombre}.` : r.mensaje, r.ok ? 'exito' : 'error'); CTX.render({ conservarScroll: true }); return; }
    if (t.closest('[data-reiniciar-datos]')) { reiniciarDatos(); location.reload(); return; }

    // Sucursales
    if (t.closest('[data-usar-ubicacion]')) { usarUbicacion(); return; }
    const pin = t.closest('.MapaIlustrado .pin'); if (pin) { resaltarSucursal(pin.dataset.sucursal, { desplazar: true }); return; }

    // Chips sueltos (filtros del menú y de tablas)
    const chip = t.closest('.Chip');
    if (chip) {
      if (chip.dataset.ir) { ir(chip.dataset.ir); return; }
      seleccionarChip(chip);
      const calc = chip.closest('[data-calcula]'); if (calc) recalcularFicha(calc);
      if (chip.dataset.filtro !== undefined) { actualizarParams({ cat: chip.dataset.slug === 'todas' ? null : chip.dataset.slug }); refrescarBebidas(); }
      if (chip.dataset.filtroFila !== undefined) filtrarFilas(chip);
      const f = chip.closest('.Filtro'); if (f && chip.dataset.valor) f.dataset.rango = chip.dataset.valor;
      return;
    }
    // Casillas, radios, interruptores
    const tog = t.closest('.Casilla, .Radio, .Interruptor');
    if (tog) { if (tog.dataset.ir) { ir(tog.dataset.ir); return; } alternar(tog); if (tog.dataset.toast) toast(tog.dataset.toast, 'info'); return; }

    // Select y Filtro (popover)
    const ctl = t.closest('.Select > .control, .Filtro > .control');
    if (ctl) {
      const box = ctl.parentElement;
      if (box.dataset.ir) { ir(box.dataset.ir); return; }
      const pop = $('.menu, .popover', box), ab = pop.hidden;
      $$('.Select .menu, .Filtro .popover').forEach(p => { p.hidden = true; if (p.parentElement.dataset.estado === 'abierto') p.parentElement.dataset.estado = 'cerrado'; $('.control', p.parentElement).setAttribute('aria-expanded', 'false'); });
      pop.hidden = !ab; if (ab) box.dataset.estado = 'abierto'; ctl.setAttribute('aria-expanded', ab);
      return;
    }
    const op = t.closest('.Select .opcion, .Filtro .opcion');
    if (op) {
      const box = op.closest('.Select, .Filtro'), lista = op.parentElement;
      $$('.opcion', lista).forEach(o => { o.dataset.seleccionada = ''; const i = o.querySelector('svg'); if (i) i.outerHTML = '<span class="hueco"></span>'; });
      op.dataset.seleccionada = 'si'; const h = op.querySelector('.hueco'); if (h) h.outerHTML = ic('check', 16);
      $('.control .valor', box).textContent = op.textContent.trim();
      lista.hidden = true; box.dataset.estado = 'aplicado'; $('.control', box).setAttribute('aria-expanded', 'false');
      if ($('[data-tablero]')) filtrarTablero();
      else if (box.closest('.BarraSuperiorPanel')) toast(`Filtro aplicado: ${op.textContent.trim()}.`, 'info');
      return;
    }
    if (t.closest('[data-aplicar]')) { const f = t.closest('.Filtro'); $('.popover', f).hidden = true; f.dataset.estado = 'aplicado'; if (f.dataset.rango) $('.control .valor', f).textContent = f.dataset.rango; toast('Rango de fechas aplicado.', 'info'); return; }
    if (t.closest('[data-cerrar-popover]')) { const f = t.closest('.Filtro'); $('.popover', f).hidden = true; f.dataset.estado = 'cerrado'; return; }
    if (!t.closest('.Select, .Filtro')) $$('.Select .menu:not([hidden]), .Filtro .popover:not([hidden])').forEach(p => { p.hidden = true; const b = p.parentElement; if (b.dataset.estado === 'abierto') b.dataset.estado = 'cerrado'; });

    // Paginación
    const pag = t.closest('.Paginacion');
    if (pag) {
      const tabla = pag.closest('[data-paginada]'); if (!tabla) return;
      const actual = Number(tabla.dataset.pagina || 1), paginas = Number(tabla.dataset.paginas || 1), num = t.closest('.num');
      if (num) paginar(tabla, Number(num.textContent));
      else if (t.closest('.IconoCirculo')) { const [ant] = $$('.IconoCirculo', pag); paginar(tabla, t.closest('.IconoCirculo') === ant ? Math.max(1, actual - 1) : Math.min(paginas, actual + 1)); }
      return;
    }
    // Mostrar u ocultar contraseña
    const ojo = t.closest('.Campo .accion');
    if (ojo) { const i = $('input', ojo.closest('.Campo')); i.type = i.type === 'password' ? 'text' : 'password'; ojo.setAttribute('aria-label', i.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña'); return; }
    // Avisos simples
    const tst = t.closest('[data-toast]');
    if (tst) { ev.preventDefault(); toast(tst.dataset.toast, tst.dataset.toastTipo || 'exito'); return; }
    // Navegación por elemento completo (tarjetas, filas, velo)
    const nav = t.closest('[data-ir]');
    if (nav && !t.closest('a, button:not([data-ir]), .Chip, input, textarea, select')) { ir(nav.dataset.ir); }
  });

  const ITEMS = '.Sidebar .ItemSidebar, .Sidebar .salir';
  document.addEventListener('mouseover', ev => {
    const it = ev.target.closest(ITEMS); if (it) mostrarTip(it);
    const tarjeta = ev.target.closest('.TarjetaSucursal[data-suc]'); if (tarjeta && $('.MapaIlustrado')) resaltarSucursal(tarjeta.dataset.suc);
  });
  document.addEventListener('mouseout', ev => { if (ev.target.closest(ITEMS) && !ev.relatedTarget?.closest?.(ITEMS)) ocultarTip(); });
  document.addEventListener('focusin', ev => {
    const it = ev.target.closest(ITEMS); if (it) mostrarTip(it);
    if (ev.target.matches('[data-login] input[name="correo"]')) animo('correo');
    if (ev.target.matches('[data-login] input[name="clave"]')) animo('clave');
  });
  document.addEventListener('focusout', ev => { if (ev.target.closest(ITEMS)) ocultarTip(); });
  window.addEventListener('scroll', ocultarTip, { passive: true });

  document.addEventListener('submit', ev => {
    const form = ev.target;
    if (form.matches('[data-login]')) {
      ev.preventDefault(); limpiarErrores(form);
      const c = campoDe(form, 'correo'), k = campoDe(form, 'clave');
      const r = iniciarSesion(c.valor, k.valor);
      if (!r.ok) {
        animo('error'); form.classList.remove('sacude'); void form.offsetWidth; form.classList.add('sacude');
        if (r.campo) { errorCampo((r.campo === 'correo' ? c : k).campo, r.mensaje); (r.campo === 'correo' ? c : k).input.focus(); }
        else { avisoForm(form, r.mensaje, r.titulo, $('.campos', form)); }
        return;
      }
      const b = $('button[type="submit"]', form); b.dataset.estado = 'cargando'; $('.texto', b).textContent = 'Entrando…';
      animo('listo');
      const volver = leerRuta().params.volver;
      setTimeout(() => ir(volver && volver.startsWith('#/panel') ? volver : `#/panel/${inicioDeRol(r.sesion.rol)}`, { reemplazar: true }), 350);
      return;
    }
    if (form.matches('[data-form-contacto]')) {
      ev.preventDefault(); limpiarErrores(form);
      const n = campoDe(form, 'nombre'), c = campoDe(form, 'correo'), m = campoDe(form, 'mensaje');
      const err = [];
      if (!n.valor.trim()) err.push([n, 'Escribe tu nombre.']);
      if (!c.valor.trim()) err.push([c, 'Falta tu correo. Escríbelo para continuar.']);
      else if (!correoValido(c.valor.trim())) err.push([c, 'Revisa tu correo: le falta algo.']);
      if (!m.valor.trim()) err.push([m, 'Cuéntanos qué necesitas.']);
      else if (m.valor.length > LIMITES.mensaje) err.push([m, `El mensaje admite hasta ${LIMITES.mensaje} caracteres.`]);
      if (err.length) { avisoForm(form, err.length === 1 ? 'Revisa el campo marcado para poder enviar tu mensaje.' : `Revisa los ${err.length} campos marcados para poder enviar tu mensaje.`); err.forEach(([x, t]) => errorCampo(x.campo, t)); err[0][0].input.focus(); return; }
      ir('#/contacto?estado=enviado');
    }
  });

  document.addEventListener('input', ev => {
    const t = ev.target;
    if (t.closest('[data-buscar]')) { clearTimeout(tBusqueda); tBusqueda = setTimeout(() => { actualizarParams({ q: t.value.slice(0, LIMITES.busqueda) }); refrescarBebidas(); }, 160); return; }
    if (t.closest('[data-buscar-sucursal]')) { clearTimeout(tBusqueda); tBusqueda = setTimeout(() => { actualizarParams({ q: t.value.slice(0, LIMITES.busqueda), estado: null }); refrescarSucursales(); }, 160); return; }
    if (t.closest('[data-buscar-pedido]')) { filtrarTablero(); return; }
    const bt = t.closest('[data-buscar-tabla]');
    if (bt) {
      const q = t.value.trim().toLowerCase(), tabla = $('[data-filas]');
      const filas = $$('tbody .FilaTabla', tabla);
      if (!q) { if (tabla.dataset.paginada !== undefined) paginar(tabla, 1); else filas.forEach(f => { f.hidden = false; }); return; }
      filas.forEach(f => { f.hidden = !f.textContent.toLowerCase().includes(q); });
      const pag = $('.Paginacion', tabla); if (pag) pag.hidden = true;
    }
  });
  document.addEventListener('change', ev => {
    if (ev.target.matches('[data-orden-menu]')) { actualizarParams({ orden: ev.target.value === 'populares' ? null : ev.target.value }); refrescarBebidas(); }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { const velo = $('.Velo[data-ir]'); if (velo) { ir(velo.dataset.ir); return; } const menu = $('.Cabecera[data-menu="abierto"] [data-alternar-menu]'); if (menu) menu.click(); }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.Casilla, .Radio, .Interruptor, .opcion, .TarjetaPedido, .Campo .accion')) { ev.preventDefault(); ev.target.click(); }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest && ev.target.closest('.MapaIlustrado .pin')) { ev.preventDefault(); resaltarSucursal(ev.target.closest('.pin').dataset.sucursal, { desplazar: true }); }
    const tab = ev.target.closest('[data-hoja]');
    if (tab && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) { const tabs = $$('[data-hoja]', tab.parentElement); const i = (tabs.indexOf(tab) + (ev.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[i].click(); tabs[i].focus(); }
  });
}

/* ───────────── Después de cada render ───────────── */
let turno = 0;
export function montar(raiz, { ruta, bp, coords }) {
  CTX.ruta = ruta; CTX.bp = bp; CTX.coords = coords;
  // Estados de espera que avanzan solos (p. ej., "Generando respaldo" → "Éxito"), solo si la pantalla sigue abierta.
  const mio = ++turno;
  $$('[data-auto-ir]', raiz).forEach(el => setTimeout(() => { if (mio === turno) ir(el.dataset.autoIr, { reemplazar: true }); }, Number(el.dataset.ms || 2000)));
  $$('[data-carrusel]', raiz).forEach(montarCarrusel);
  $$('[data-explorador]', raiz).forEach(ex => requestAnimationFrame(() => centrarBase(ex)));
  $$('[data-paginada]', raiz).forEach(t => paginar(t, 1));
  $$('.mosaico[data-paginado]', raiz).forEach(m => {
    const puntos = $$('.puntos .punto', m.parentElement);
    if (!puntos.length) return;
    m.addEventListener('scroll', () => { const w = m.firstElementChild ? m.firstElementChild.getBoundingClientRect().width + 12 : 1; const i = Math.min(puntos.length - 1, Math.round(m.scrollLeft / w)); puntos.forEach((p, k) => { p.dataset.activo = k === i ? 'si' : ''; }); }, { passive: true });
  });
  ocultarTip();
  const activo = $('.Sidebar .ItemSidebar[aria-current="page"]', raiz);
  if (activo && ruta && (!CTX.ultimaSeccion || CTX.ultimaSeccion !== ruta.partes.join('/'))) { CTX.ultimaSeccion = ruta.partes.join('/'); requestAnimationFrame(() => mostrarTip(activo, { breve: true })); }

}
