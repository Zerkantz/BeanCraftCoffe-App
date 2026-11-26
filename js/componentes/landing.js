// Componentes de la landing v2. Igual que base.js: cada función devuelve HTML con la clase raíz = nombre en Figma
// y variantes en data-*. El carrusel adapta "Carrusel 3D giratorio" del repo móvil (positionHeroRing en app.js).
import { ic } from '../lib/iconos.js';
import { foto } from '../lib/foto.js';
import { P, PRODUCTOS, OPCIONES, precioLinea, costo, etiqueta } from '../data/catalogo.js';
import { MASCOTAS, CATEGORIA_ESTILO } from '../data/experiencia.js';
import { Boton, Chip, Etiqueta, Mascota, Marcatextos, GrupoOpciones, TituloMixto, mxn, fichaDe } from './base.js';

const attrs = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => ` data-${k}="${v}"`).join('');

/* ───────────── Carrusel 3D ───────────── */
// Radio y alto del vaso al frente por breakpoint. La geometría es la del repo: escala 0.56–1.0, opacidad 0.28–1, ±6°.
export const GEOMETRIA = { escritorio: { radio: 230, alto: 300, elevacion: 26 }, tablet: { radio: 132, alto: 210, elevacion: 18 }, movil: { radio: 124, alto: 190, elevacion: 18 } };

export function posicionVaso(i, paso, total, bp, arrastre = 0) {
  const g = GEOMETRIA[bp] || GEOMETRIA.escritorio;
  let diff = i - (paso - arrastre);
  while (diff > total / 2) diff -= total;
  while (diff < -total / 2) diff += total;
  const rad = (diff * 2 * Math.PI) / total;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const x = sin * g.radio, y = (1 - cos) * g.elevacion;
  const escala = 0.56 + (cos + 1) * 0.22;
  return {
    transform: `translate3d(calc(-50% + ${x.toFixed(1)}px), ${(-y).toFixed(1)}px, 0) scale(${escala.toFixed(3)}) rotate(${(sin * 6).toFixed(1)}deg)`,
    opacidad: (0.28 + (cos + 1) * 0.36).toFixed(3),
    z: Math.round((cos + 1) * 10),
  };
}

export const indiceDe = (paso, total) => ((Math.round(paso) % total) + total) % total;

export function Carrusel3D(ids, { bp = 'escritorio', paso = 0 } = {}) {
  const total = ids.length, g = GEOMETRIA[bp] || GEOMETRIA.escritorio;
  const frente = indiceDe(paso, total);
  const vasos = ids.map((id, i) => {
    const p = P[id], pos = posicionVaso(i, paso, total, bp);
    return `<button type="button" class="vaso${i === frente ? ' al-frente' : ''}" data-idx="${i}" data-id="${id}" aria-label="${i === frente ? `Ver ficha de ${p.nombre}` : `Girar a ${p.nombre}`}" style="transform:${pos.transform};opacity:${pos.opacidad};z-index:${pos.z}">${foto(p, g.alto, 'foto-vaso')}</button>`;
  }).join('');
  const m = bp === 'movil' ? 0.7 : bp === 'tablet' ? 0.85 : 1;
  const p = P[ids[frente]];
  return `<div class="Carrusel3D"${attrs({ breakpoint: bp })} data-carrusel data-paso="${paso}" data-ids="${ids.join(',')}" role="region" aria-roledescription="carrusel" aria-label="Bebidas de la casa">
<div class="escenario" data-escenario tabindex="0" aria-label="Gira o toca tu bebida. Usa las flechas izquierda y derecha del teclado para cambiar.">
<div class="plataforma" aria-hidden="true"><span class="aro"></span></div>
<div class="anillo" data-anillo>${vasos}</div>
${Mascota('grano', { tam: Math.round(96 * m), rot: -2 }).replace('class="Mascota"', 'class="Mascota m-izq"')}${Mascota('espuma', { tam: Math.round(90 * m), rot: 2 }).replace('class="Mascota"', 'class="Mascota m-der"')}${Mascota('taza', { tam: Math.round(76 * m), holo: true, rot: 2 }).replace('class="Mascota"', 'class="Mascota m-arriba"')}${Etiqueta({ tipo: 'nuevo', texto: '¡Nuevo!', rot: 2 }).replace('class="Etiqueta"', 'class="Etiqueta e-nuevo"')}
</div>
<div class="controles"><button type="button" class="IconoCirculo" data-tam="44" data-girar="-1" aria-label="Bebida anterior">${ic('chevron-izq', 20)}</button><span class="contador" data-contador><strong>${String(frente + 1).padStart(2, '0')}</strong> / ${String(total).padStart(2, '0')}</span><button type="button" class="IconoCirculo" data-tam="44" data-girar="1" aria-label="Bebida siguiente">${ic('chevron-der', 20)}</button><span class="instruccion">Arrastra o toca un vaso</span></div>
<p class="solo-lectores" aria-live="polite" data-anuncio>${p.nombre}, desde ${mxn(p.precio)}</p>
</div>`;
}

// Ficha de la bebida al frente (debajo del carrusel en móvil, a la derecha en escritorio).
export function FichaCarrusel(p) {
  const m = MASCOTAS[p.mascota];
  const acciones = `${p.personalizable ? Boton({ texto: 'Armar la mía', iconoDer: 'chevron-der', href: `#/combinaciones?base=${p.id}` }) : ''}${Boton({ tipo: 'texto', texto: 'Ver ficha', iconoDer: 'chevron-der', href: fichaDe(p) })}`;
  return `<article class="FichaCarrusel" data-ficha-carrusel data-id="${p.id}"><div class="info"><p class="categoria">${p.frappe ? 'Frappés' : p.categoria}<span class="aprobado">${Mascota(p.mascota, { tam: 30 })}Aprobado por ${m.nombre}</span></p><h2 class="nombre">${p.nombre}</h2><p class="desc">${p.desc}</p></div><div class="cierre"><p class="precio">${p.personalizable ? '<span class="desde">desde</span>' : ''}${Marcatextos(mxn(p.precio), 'grande')}</p><div class="acciones">${acciones}</div></div></article>`;
}

/* ───────────── Pilares de marca ───────────── */
export function Pilares(items) {
  return `<div class="Pilares">${items.map(([mascota, titulo, texto]) => `<article class="pilar">${Mascota(mascota, { tam: 104 })}<h3 class="titulo">${titulo}</h3><p class="texto">${texto}</p></article>`).join('')}</div>`;
}

/* ───────────── Bebidas de la casa (hojas del repo) ───────────── */
const filaCasa = p => `<a class="item-lista" href="${fichaDe(p)}"><span class="mini imagen-fondo" data-fondo="${p.fondo}">${foto(p, 88, 'foto-mini')}</span><span class="textos"><span class="nombre">${p.nombre}</span><span class="desc">${p.desc}</span><span class="precio">${p.personalizable ? 'desde ' : ''}<strong>${mxn(p.precio)}</strong></span></span>${ic('chevron-der', 20)}</a>`;
const tileCasa = (p, destacado) => `<a class="item-tile${destacado ? ' destacado' : ''}" href="${fichaDe(p)}"><span class="imagen imagen-fondo" data-fondo="${p.fondo}">${foto(p, destacado ? 220 : 170, 'foto-tile')}${destacado ? Etiqueta({ tipo: 'nuevo', texto: 'De la casa', rot: -2 }) : ''}</span><span class="nombre">${p.nombre}</span><span class="precio">${p.personalizable ? 'desde ' : ''}<strong>${mxn(p.precio)}</strong></span></a>`;

export function HojasCasa(hojas, { activa = hojas[0].id } = {}) {
  const tabs = `<div class="pestanas" role="tablist" aria-label="Bebidas de la casa">${hojas.map(h => `<button type="button" role="tab" class="pestana" id="tab-${h.id}" aria-controls="hoja-${h.id}" aria-selected="${h.id === activa}" data-hoja="${h.id}"${h.id === activa ? '' : ' tabindex="-1"'}>${h.tab}</button>`).join('')}</div>`;
  const hojasHtml = hojas.map(h => `<section class="hoja" id="hoja-${h.id}" role="tabpanel" aria-labelledby="tab-${h.id}" data-verde="${h.verde ? 'si' : 'no'}"${h.id === activa ? '' : ' hidden'}><div class="cabeza-hoja"><div><h3 class="titulo">${h.titulo}</h3><p class="sub">${h.sub}</p></div>${Mascota(h.mascota, { tam: 72, fondo: h.verde ? 'oscuro' : 'claro', rot: 2 })}</div><div class="arriba">${h.listIds.map(id => filaCasa(P[id])).join('')}</div><div class="abajo">${h.tileIds.map(id => tileCasa(P[id], id === h.heroId)).join('')}</div></section>`).join('');
  return `<div class="HojasCasa" data-hojas>${tabs}${hojasHtml}</div>`;
}

/* ───────────── Explorador de combinaciones ───────────── */
// Sin carrito ni botón de pedir: muestra la bebida, el desglose y un precio de referencia con RN-02 (decisión D5).
export const BASES = PRODUCTOS.filter(p => p.personalizable && p.activo);
export const SEL_INICIAL = { prod: 'latte_caramelo', tam: 'mediano', leche: 'avena', endu: 'sin', extras: ['shot'] };

export function Explorador(sel = SEL_INICIAL, { bp = 'escritorio', compacto = false } = {}) {
  const p = P[sel.prod];
  const total = precioLinea(sel);
  const ext = sel.extras.reduce((s, e) => s + costo('extras', e), 0);
  const filas = [
    ['base', `Bebida base · ${p.nombre}`, mxn(p.precio, 2)],
    ['tamano', `Tamaño · ${etiqueta('tamano', sel.tam)}`, '+' + mxn(costo('tamano', sel.tam), 2)],
    ['leche', `Leche · ${etiqueta('leche', sel.leche)}`, '+' + mxn(costo('leche', sel.leche), 2)],
    ['endulzante', `Endulzante · ${etiqueta('endulzante', sel.endu)}`, '+' + mxn(costo('endulzante', sel.endu), 2)],
    ['extras', `Extras · ${sel.extras.length ? sel.extras.map(e => etiqueta('extras', e)).join(', ') : 'Sin extras'}`, '+' + mxn(ext, 2)],
  ];
  const receta = [etiqueta('tamano', sel.tam), etiqueta('leche', sel.leche), etiqueta('endulzante', sel.endu), ...(sel.extras.length ? sel.extras.map(e => etiqueta('extras', e)) : ['sin extras'])];
  const tira = `<div class="GrupoOpciones rail-bases" data-grupo="bebida"><div class="cabeza"><span class="titulo"><span class="num">1</span>Elige tu bebida base</span><span class="nota">${BASES.length} bebidas personalizables · desliza para ver todas</span></div><div class="tira-bebidas" role="radiogroup" aria-label="Bebida base">${BASES.map(b => `<button type="button" class="opcion-bebida" role="radio" aria-checked="${b.id === sel.prod}" data-seleccionado="${b.id === sel.prod ? 'si' : 'no'}" data-base-id="${b.id}"><span class="mini imagen-fondo" data-fondo="${b.fondo}">${foto(b, 84, 'foto-mini')}</span><span class="nombre">${b.nombre}</span><span class="precio">${mxn(b.precio)}</span></button>`).join('')}</div></div>`;
  const paso = (n, grupo, valor) => `<div class="paso-opcion"><span class="num" aria-hidden="true">${n}</span>${GrupoOpciones(grupo, valor)}</div>`;
  const vista = `<div class="vista" aria-live="polite"><div class="imagen imagen-fondo" data-fondo="${p.fondo}">${foto(p, bp === 'movil' ? 220 : 320, 'foto-vista')}${Mascota(p.mascota, { tam: bp === 'movil' ? 64 : 84, fondo: 'oscuro', rot: 2 })}</div><div class="receta"><p class="etq">Tu combinación</p><h3 class="nombre">${p.nombre}</h3><p class="linea">${receta.join(' · ')}</p></div><div class="resumen-precio">${filas.map(([k, a, b]) => `<div class="fila" data-fila="${k}"><span>${a}</span><span class="monto">${b}</span></div>`).join('')}<div class="total"><span class="etq">Precio de referencia</span><span data-total>${Marcatextos(mxn(total, 2) + ' MXN', 'grande')}</span></div><p class="regla">${ic('info', 16)}<span>Base + tamaño + leche + endulzante + extras (RN-02). El pedido y los cupones se manejan en la app.</span></p></div>${Boton({ tipo: 'texto', texto: 'Empezar de nuevo', icono: 'x', x: ' data-explorador-reiniciar' })}</div>`;
  return `<div class="Explorador"${attrs({ breakpoint: bp, compacto: compacto ? 'si' : null })} data-explorador='${JSON.stringify(sel)}' id="explorador">${tira}<div class="mesa">${vista}<div class="controles">${paso(2, 'tamano', sel.tam)}${paso(3, 'leche', sel.leche)}${paso(4, 'endulzante', sel.endu)}${paso(5, 'extras', sel.extras)}</div></div></div>`;
}

/* ───────────── Combinaciones sugeridas ───────────── */
export function TarjetaCombinacion(c) {
  const p = P[c.l.prod];
  const partes = [etiqueta('tamano', c.l.tam), etiqueta('leche', c.l.leche), etiqueta('endulzante', c.l.endu), ...c.l.extras.map(e => etiqueta('extras', e))];
  return `<li class="TarjetaCombinacion" data-combo="${c.id}"><div class="imagen"><span class="disco imagen-fondo" data-fondo="${p.fondo}"></span>${foto(p, 190, 'foto-combo')}${Mascota(c.mascota, { tam: 48 }).replace('class="Mascota"', 'class="Mascota sticker"')}</div><p class="base">${p.nombre}</p><h3 class="nombre">${c.nombre}</h3><p class="nota">${c.nota}</p><p class="receta">${partes.join(' + ')}</p><div class="pie"><p class="precio"><span class="etq">Referencia</span><strong>${mxn(precioLinea(c.l))}</strong></p>${Boton({ tipo: 'texto', texto: 'Probarla', iconoDer: 'chevron-der', x: ` data-cargar-combo="${c.id}"` })}</div></li>`;
}

export function PizarraCombos(combos) {
  return `<section class="seccion PizarraCombos" id="sugeridas" aria-labelledby="titulo-sugeridas"><div class="contenedor"><div class="cabeza-pizarra">${TituloMixto('h2', 'Combinaciones ', 'de la barra', '', ' id="titulo-sugeridas"')}<p class="bajada">Las recetas que el equipo pide para sí. Cárgala en el explorador y cámbiale lo que quieras.</p></div><ol class="fila-combos">${combos.map(c => TarjetaCombinacion(c)).join('')}</ol></div></section>`;
}

/* ───────────── Acceso del personal (botón de la cabecera, para la librería) ───────────── */
export const BotonAcceso = () => `<a class="BotonAcceso" href="#/acceso">${ic('candado', 18)}<span class="textos"><span class="texto">Iniciar sesión</span><span class="nota">Solo personal</span></span></a>`;

export { CATEGORIA_ESTILO, OPCIONES, Chip };
