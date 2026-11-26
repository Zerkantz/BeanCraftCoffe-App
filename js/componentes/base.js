// Componentes BeanCraft Web v2. Cada función devuelve HTML con una clase raíz = nombre del componente en Figma
// y atributos data-* = propiedades de variante (data-tipo, data-estado, data-tam…). La app los monta en #app.
import { ic, logoSimbolo } from '../lib/iconos.js';
import { OPCIONES, P, resumenLinea } from '../data/catalogo.js';
import { ESTADOS, CANCELADO, totales } from '../data/pedidos.js';
import { SUC } from '../data/sucursales.js';
import { qrSvg } from '../lib/qr.js';
import { foto as ilustracion } from '../lib/foto.js';
import { puedeVer } from '../auth/permisos.js';

export const R = '';
export const mxn = (n, dec = 0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const attrs = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => ` data-${k}="${v}"`).join('');

/* ───────────── Átomos ───────────── */
export const Icono = (n, t = 24) => ic(n, t);

export function Logo({ fondo = 'claro', soloSimbolo = false, tam = 32, sub = '' } = {}) {
  return `<span class="Logo"${attrs({ fondo, 'solo-simbolo': soloSimbolo ? 'si' : null })}>${logoSimbolo(tam)}${soloSimbolo ? '' : `<span class="palabra">BEAN CRAFT</span>`}${sub ? `<span class="sub">${sub}</span>` : ''}</span>`;
}

const spinner = '<svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity=".3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';

export function Boton({ tipo = 'principal', texto, icono, iconoDer, estado = 'normal', tam = 46, ancho, href, aria, x = '', submit = false } = {}) {
  const tag = href ? 'a' : 'button';
  const dis = estado === 'deshabilitado' || estado === 'cargando';
  return `<${tag} class="Boton"${attrs({ tipo, estado, tam, ancho })}${href ? ` href="${href}"` : submit ? ' type="submit"' : ' type="button"'}${dis ? ' aria-disabled="true"' : ''}${aria ? ` aria-label="${aria}"` : ''}${x}>${estado === 'cargando' ? spinner : icono ? ic(icono, tam === 40 ? 18 : 20) : ''}<span class="texto">${texto}</span>${iconoDer ? ic(iconoDer, 18) : ''}</${tag}>`;
}

export function IconoCirculo({ icono, label, badge, estado = 'normal', tam = 44, href, x = '' } = {}) {
  const tag = href ? 'a' : 'button';
  return `<${tag} ${href ? `href="${href}"` : 'type="button"'} class="IconoCirculo"${attrs({ estado, tam })} aria-label="${label}"${estado === 'deshabilitado' ? ' aria-disabled="true"' : ''}${x}>${ic(icono, tam === 40 ? 18 : 20)}${badge ? `<span class="badge">${badge}</span>` : ''}</${tag}>`;
}

export function Chip({ texto, costo, sel = false, estado = 'normal', seleccion = 'unica', tam, x = '' } = {}) {
  const rol = seleccion === 'unica' ? ` role="radio" aria-checked="${sel}"` : ` aria-pressed="${sel}"`;
  return `<button type="button" class="Chip"${attrs({ seleccionado: sel ? 'si' : 'no', estado, seleccion, tam, costo: costo !== undefined ? costo : null })}${rol}${estado === 'deshabilitado' ? ' aria-disabled="true"' : ''}${x}>${seleccion === 'multiple' ? `<span class="marca"${sel ? '' : ' hidden'}>${ic('check', 16)}</span>` : ''}<span class="texto">${texto}</span>${costo !== undefined ? `<span class="costo">${costo === 0 ? '+$0' : '+' + mxn(costo)}</span>` : ''}</button>`;
}

export function Etiqueta({ tipo = 'descuento', texto, rot = 0, icono } = {}) {
  return `<span class="Etiqueta"${attrs({ tipo, rot: rot ? String(rot) : null })}>${icono ? ic(icono, 14) : ''}${texto}</span>`;
}

export function Marcatextos(texto, tam = 'normal') {
  return `<span class="Marcatextos"${attrs({ tam })}><svg class="forma" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M1.5 4 99 0l-1.2 37.5L0 40z" fill="var(--c-limon)"/></svg><span class="texto">${texto}</span></span>`;
}

export function InsigniaEstado(estado, densidad = 'sitio') {
  const e = ESTADOS.find(x => x.id === estado) || CANCELADO;
  return `<span class="InsigniaEstado"${attrs({ estado, densidad })}>${ic(e.icono, densidad === 'panel' ? 14 : 16)}${e.label}</span>`;
}

export function InsigniaHorario(abierta, texto) {
  return `<span class="InsigniaHorario"${attrs({ estado: abierta ? 'abierta' : 'cerrada' })}>${ic(abierta ? 'reloj' : 'x', 14)}${texto || (abierta ? 'Abierta' : 'Cerrada')}</span>`;
}

export function Campo({ tipo = 'texto', etiqueta, valor = '', placeholder = '', estado, ayuda, error, densidad = 'sitio', opcional, ancho, nombre = '' } = {}) {
  const st = estado || (error ? 'error' : valor ? 'lleno' : 'vacio');
  const icIzq = { busqueda: 'buscar', fecha: 'calendario', hora: 'reloj' }[tipo];
  const icDer = tipo === 'contrasena' ? 'ojo' : null;
  const tipoInput = { correo: 'email', contrasena: 'password', busqueda: 'search', numero: 'text' }[tipo] || 'text';
  const ro = st === 'deshabilitado' || st === 'solo-lectura' ? ' readonly' : '';
  const lab = etiqueta || placeholder;
  const control = tipo === 'area'
    ? `<textarea class="valor" rows="3" placeholder="${placeholder}" aria-label="${lab}"${nombre ? ` name="${nombre}"` : ''}${ro}>${valor}</textarea>`
    : `<input class="valor" type="${tipoInput}" value="${tipo === 'contrasena' && valor ? 'contrasena123' : valor}" placeholder="${placeholder}" aria-label="${lab}"${nombre ? ` name="${nombre}"` : ''}${ro}>`;
  return `<label class="Campo"${attrs({ tipo, estado: st, densidad, ancho })}>${etiqueta ? `<span class="etiqueta">${etiqueta}${opcional ? ' <span class="opcional">(opcional)</span>' : ''}</span>` : ''}<span class="control">${icIzq ? ic(icIzq, 18) : ''}${control}${icDer ? `<span class="accion" role="button" aria-label="Mostrar contraseña">${ic(icDer, 18)}</span>` : ''}</span>${error ? MensajeError(error) : ayuda ? `<span class="ayuda">${ayuda}</span>` : ''}</label>`;
}

export function Select({ etiqueta, valor, estado = 'cerrado', opciones = [], error, densidad = 'sitio', icono, ancho } = {}) {
  const ops = opciones.length ? opciones : [valor];
  return `<div class="Select"${attrs({ estado: error ? 'error' : estado, densidad, ancho })}>${etiqueta ? `<span class="etiqueta">${etiqueta}</span>` : ''}<button type="button" class="control" aria-expanded="${estado === 'abierto'}">${icono ? ic(icono, 18) : ''}<span class="valor">${valor}</span>${ic('chevron-abajo', 18)}</button><ul class="menu" role="listbox"${estado === 'abierto' ? '' : ' hidden'}>${ops.map(o => `<li class="opcion"${attrs({ seleccionada: o === valor ? 'si' : null })} role="option" tabindex="0">${o === valor ? ic('check', 16) : '<span class="hueco"></span>'}${o}</li>`).join('')}</ul>${error ? MensajeError(error) : ''}</div>`;
}

export function Casilla({ marcado = false, etiqueta, estado = 'normal', x = '' } = {}) {
  return `<span class="Casilla"${attrs({ marcado: marcado ? 'si' : 'no', estado })} role="checkbox" tabindex="0" aria-checked="${marcado}"${x}><span class="caja">${ic('check', 16)}</span>${etiqueta ? `<span class="texto">${etiqueta}</span>` : ''}</span>`;
}

export function Radio({ marcado = false, etiqueta, estado = 'normal', x = '' } = {}) {
  return `<span class="Radio"${attrs({ marcado: marcado ? 'si' : 'no', estado })} role="radio" tabindex="0" aria-checked="${marcado}"${x}><span class="circulo"><span class="punto"></span></span>${etiqueta ? `<span class="texto">${etiqueta}</span>` : ''}</span>`;
}

export function Interruptor({ marcado = false, etiqueta, estado = 'normal', x = '', etiquetas } = {}) {
  return `<span class="Interruptor"${attrs({ marcado: marcado ? 'si' : 'no', estado })} role="switch" tabindex="0" aria-checked="${marcado}"${etiquetas ? ` data-on="${etiquetas[0]}" data-off="${etiquetas[1]}"` : ''}${x}><span class="pista"><span class="perilla"></span></span>${etiqueta ? `<span class="texto">${etiqueta}</span>` : ''}</span>`;
}

export const Avatar = (ini, tam = 44) => `<span class="Avatar"${attrs({ tam })} aria-hidden="true">${ini}</span>`;

export function Estrellas(valor, { tam = 16, numero = true } = {}) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += `<svg class="estrella" data-llena="${i <= Math.round(valor) ? 'si' : 'no'}" width="${tam}" height="${tam}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z" stroke="var(--c-tostado)" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  return `<span class="Estrellas" role="img" aria-label="${valor} de 5">${s}${numero ? `<span class="numero">${Number(valor).toFixed(1)}</span>` : ''}</span>`;
}

export function Mascota(nombre, { tam = 96, estado = 'feliz', holo = false, fondo = 'claro', rot = 0, alt = '' } = {}) {
  const holoSvg = holo ? `<svg class="holo" viewBox="0 0 80 80" aria-hidden="true"><polygon points="8,18 22,8 26,18 14,28" fill="var(--c-limon)" stroke="var(--c-tostado)" stroke-width="1.6"/><polygon points="58,10 72,16 66,28 54,22" fill="var(--c-lila)" stroke="var(--c-tostado)" stroke-width="1.6"/><polygon points="10,60 22,56 26,68 12,72" fill="var(--c-fresa)" stroke="var(--c-tostado)" stroke-width="1.6"/><polygon points="62,56 74,60 70,72 58,66" fill="var(--c-menta)" stroke="var(--c-tostado)" stroke-width="1.6"/></svg>` : '';
  return `<span class="Mascota"${attrs({ nombre, estado, fondo, holo: holo ? 'si' : null, rot: rot ? String(rot) : null })} style="width:${tam}px;height:${tam}px">${holoSvg}<img src="${R}assets/mascotas/${nombre}.png" width="${tam}" height="${tam}" alt="${alt}"${alt ? '' : ' aria-hidden="true"'}></span>`;
}

/* ───────────── Moléculas ───────────── */
export function TituloMixto(nivel, antes, serif, despues = '', extra = '') {
  const tag = nivel === 'h1' ? 'h1' : 'h2';
  return `<${tag} class="TituloMixto"${attrs({ nivel })}${extra}>${antes}<em>${serif}</em>${despues}</${tag}>`;
}

export function GrupoOpciones(grupo, sel, { estado, nota } = {}) {
  const g = OPCIONES[grupo];
  const sels = Array.isArray(sel) ? sel : [sel];
  return `<div class="GrupoOpciones"${attrs({ grupo })} role="${g.unica ? 'radiogroup' : 'group'}" aria-label="${g.titulo}"><div class="cabeza"><span class="titulo">${g.titulo}</span><span class="nota">${nota || (g.unica ? 'Elige una' : 'Elige las que quieras')}</span></div><div class="chips">${g.items.map(([id, t, c]) => Chip({ texto: t, costo: c, sel: sels.includes(id), seleccion: g.unica ? 'unica' : 'multiple', estado: estado || 'normal', x: ` data-id="${id}"` })).join('')}</div></div>`;
}

export function GrupoBebidas(lista, selId) {
  return `<div class="GrupoOpciones" data-grupo="bebida" role="radiogroup" aria-label="Bebida"><div class="cabeza"><span class="titulo">Bebida</span><span class="nota">Precio base</span></div><div class="chips">${lista.map(p => Chip({ texto: p.nombre, sel: p.id === selId, x: ` data-base="${p.precio}" data-id="${p.id}" data-nombre="${p.nombre}"` }).replace('</button>', `<span class="costo">${mxn(p.precio)}</span></button>`)).join('')}</div></div>`;
}

const LECHES = [['entera', 'espuma'], ['deslactosada', 'blanco'], ['avena', 'miel'], ['almendra', 'fresa']];
export const fichaDe = p => `#/producto/${p.slug}`;
export function TarjetaBebida(p, { variante = 'normal', estado = 'normal', promo } = {}) {
  if (variante === 'promo') {
    return `<article class="TarjetaBebida"${attrs({ variante, estado })} data-categoria="promo"><div class="imagen" data-fondo="${p.fondo}">${ilustracion(p, 220)}${Etiqueta({ tipo: 'descuento', texto: promo.etiqueta, rot: -2 })}</div><div class="cuerpo"><p class="categoria">Promoción · ${promo.vigencia}</p><h3 class="titulo-promo">${promo.titulo}</h3><p class="texto">${promo.texto}</p><p class="precio">desde <span class="monto">${mxn(p.precio)}</span></p><p class="codigo">Código en la app: <strong>${promo.codigo}</strong></p></div>${Mascota(promo.mascota, { tam: 64, fondo: 'oscuro', rot: 2 })}</article>`;
  }
  const nd = variante === 'no-disponible';
  const link = fichaDe(p);
  const opciones = p.personalizable
    ? `<div class="leches">${LECHES.map(([l, c]) => `<span class="punto" data-color="${c}" title="${l}"></span>`).join('')}<span class="texto">3 tamaños · 4 leches · 4 endulzantes</span></div>`
    : `<div class="leches"><span class="texto">Pieza individual · recién horneada</span></div>`;
  return `<article class="TarjetaBebida"${attrs({ variante, estado })} data-categoria="${p.categoria}" data-nombre="${p.nombre.toLowerCase()}" data-ir="${link}"><div class="imagen" data-fondo="${p.fondo}">${ilustracion(p, 190)}${Mascota(p.mascota, { tam: 48, fondo: 'claro' }).replace('class="Mascota"', 'class="Mascota sticker"')}<span class="calificacion">${ic('estrella', 14)}${p.cal.toFixed(1)}</span>${p.frappe ? Etiqueta({ tipo: 'info', texto: 'Frappé' }) : ''}${nd ? Etiqueta({ tipo: 'agotado', texto: 'No disponible hoy' }) : ''}</div><div class="cuerpo"><p class="categoria">${p.categoria}</p><h3 class="nombre"><a href="${link}">${p.nombre}</a></h3><p class="desc">${p.desc}</p>${opciones}<div class="pie-tarjeta"><p class="precio">${p.personalizable ? 'desde ' : ''}<span class="monto">${mxn(p.precio)}</span></p><span class="ver">Ver ficha${ic('chevron-der', 16)}</span></div></div></article>`;
}

export function MosaicoPromo(pr, { tam = 'mediano' } = {}) {
  return `<article class="MosaicoPromo"${attrs({ tam })}>${Etiqueta({ tipo: 'descuento', texto: pr.etiqueta, rot: tam === 'grande' ? -2 : 2 })}<h3 class="titulo">${pr.titulo}</h3><p class="texto">${pr.texto}</p><p class="vigencia">${ic('calendario', 18)}<span>${pr.vigencia}</span></p><p class="codigo">Código en la app: <strong>${pr.codigo}</strong></p>${Mascota(pr.mascota, { tam: tam === 'grande' ? 120 : 84, fondo: 'oscuro', rot: 2 })}</article>`;
}

export function TarjetaSucursal(s, { sugerida = false, chipsHora = false, grande = false, estado = 'normal' } = {}) {
  return `<article id="sucursal-${s.id}" data-suc="${s.id}" class="TarjetaSucursal"${attrs({ estado: s.abierta ? 'abierta' : 'cerrada', sugerida: sugerida ? 'si' : null, grande: grande ? 'si' : null, interaccion: estado })}><div class="cabeza"><h3 class="nombre">${s.nombre}</h3>${InsigniaHorario(s.abierta)}</div>${sugerida ? Etiqueta({ tipo: 'info', texto: `La más cercana · ${s.km}`, icono: 'ubicacion' }) : ''}<p class="dato">${ic('pin', 18)}<span>${s.dir}</span></p><p class="dato">${ic('info', 18)}<span><strong>Referencia:</strong> ${s.ref}</span></p><p class="dato">${ic('reloj', 18)}<span><strong>Hoy:</strong> ${s.hoy} · ${s.estadoTxt}</span></p>${grande ? `<p class="dato">${ic('calendario', 18)}<span>${s.horario}</span></p>` : ''}${Boton({ tipo: 'texto', texto: 'Cómo llegar', iconoDer: 'flecha-externa', href: `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`, x: ' target="_blank" rel="noopener"' })}</article>`;
}

export function PasoPedido(e, estado) {
  return `<li class="PasoPedido"${attrs({ estado, paso: e.id })}><span class="nodo">${ic(estado === 'completado' ? 'check' : e.icono, 20)}</span><span class="etiqueta">${e.label}</span>${Mascota(e.mascota, { tam: 72 })}</li>`;
}

export function OpcionQuiz(texto, estado = 'normal') {
  return `<button type="button" class="OpcionQuiz"${attrs({ estado })} role="radio" aria-checked="${estado === 'seleccionada'}">${texto}</button>`;
}

export const BarraProgreso = (paso, total = 5) => `<div class="BarraProgreso" role="progressbar" aria-valuenow="${paso}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Progreso del quiz"><span class="relleno" style="width:${(paso / total) * 100}%"></span></div>`;

export function EstadoVacio({ mascota = 'hielito', estado = 'pensando', titulo, texto, accion, contexto = 'sitio' } = {}) {
  return `<div class="EstadoVacio"${attrs({ contexto })}>${Mascota(mascota, { tam: contexto === 'panel' ? 88 : 128, estado })}<h3 class="titulo">${titulo}</h3><p class="texto">${texto}</p>${accion || ''}</div>`;
}

export const MensajeError = texto => `<span class="MensajeError" role="alert">${ic('alerta', 16)}${texto}</span>`;

export function Aviso(tipo, texto, { titulo } = {}) {
  const icono = { error: 'alerta', info: 'info', exito: 'check' }[tipo];
  return `<div class="Aviso"${attrs({ tipo })} role="${tipo === 'error' ? 'alert' : 'status'}">${ic(icono, 20)}<div class="cuerpo">${titulo ? `<strong class="titulo">${titulo}</strong>` : ''}<span class="texto">${texto}</span></div></div>`;
}

export function Toast(tipo, texto) {
  const icono = { exito: 'check', error: 'alerta', info: 'info' }[tipo];
  return `<div class="Toast"${attrs({ tipo })} role="status" aria-live="polite"><span class="icono">${ic(icono, 18)}</span><span class="texto">${texto}</span><button type="button" class="cerrar" aria-label="Cerrar aviso">${ic('x', 16)}</button></div>`;
}

export function ItemSidebar({ icono, texto, estado = 'normal', colapsado = false, href = '#', badge } = {}) {
  return `<a class="ItemSidebar"${attrs({ estado, colapsado: colapsado ? 'si' : null })} href="${href}"${estado === 'activo' ? ' aria-current="page"' : ''}${colapsado ? ` aria-label="${texto}"` : ''}>${ic(icono, 20)}${colapsado ? '' : `<span class="texto">${texto}</span>`}${badge && !colapsado ? `<span class="badge">${badge}</span>` : ''}</a>`;
}

export function TarjetaKPI({ etiqueta, valor, tendencia = 'sin', delta, estado = 'normal', icono } = {}) {
  if (estado === 'cargando') return `<div class="TarjetaKPI" data-estado="cargando"><span class="esqueleto" style="width:40%"></span><span class="esqueleto alto" style="width:60%"></span><span class="esqueleto" style="width:70%"></span></div>`;
  return `<div class="TarjetaKPI"${attrs({ tendencia, estado })}><span class="etiqueta">${icono ? ic(icono, 18) : ''}${etiqueta}</span><span class="valor">${valor}</span>${delta ? `<span class="delta">${ic(tendencia === 'baja' ? 'tendencia-abajo' : 'tendencia-arriba', 16)}${delta}</span>` : ''}</div>`;
}

export function TarjetaPedido(ped, { estado = 'normal', mostrarSuc = false } = {}) {
  const t = totales(ped);
  const e = ESTADOS.find(x => x.id === ped.estado);
  return `<article class="TarjetaPedido"${attrs({ estado: ped.estado, programado: ped.programado ? 'si' : null, interaccion: estado })} data-id="${ped.id}" tabindex="0" aria-label="Pedido ${ped.id}, ${ped.cliente}"><div class="cabeza"><span class="numero">#${ped.id}</span><span class="hora">${ic('reloj', 14)}${ped.hora} am</span></div><p class="cliente">${ped.cliente}${mostrarSuc && ped.suc ? `<span class="suc-pedido">${ic('tienda', 14)}${SUC[ped.suc].nombre}</span>` : ''}</p><ul class="lineas">${ped.lineas.map(l => `<li><strong>${l.cant} × ${P[l.prod].nombre}</strong><span>${resumenLinea(l)}</span></li>`).join('')}</ul><div class="etiquetas">${ped.programado ? Etiqueta({ tipo: 'info', texto: ped.recoger.replace('Programado · ', 'Programado '), icono: 'reloj' }) : ''}${ped.cupon ? Etiqueta({ tipo: 'cupon', texto: ped.cupon.codigo, icono: 'cupon' }) : ''}</div><div class="pie"><div class="total"><span class="monto">${mxn(t.total, 2)}</span><span class="pago">${ped.pago}</span></div>${e.accion ? Boton({ tipo: ped.estado === 'listo' ? 'acento' : 'principal', texto: e.accion, tam: 40, ancho: 'completo', estado: estado === 'presionado' ? 'presionado' : 'normal', x: ' data-avanzar' }) : ped.cal ? Estrellas(ped.cal, { tam: 14 }) : '<span class="sin-cal">Sin calificar</span>'}</div></article>`;
}

export function Filtro({ tipo = 'sucursal', etiqueta, valor, estado = 'cerrado', opciones = [], icono = 'tienda', ir } = {}) {
  const abierto = estado === 'abierto';
  let pop;
  if (tipo === 'fechas') {
    pop = `<div class="popover fechas"${abierto ? '' : ' hidden'}><div class="chips" role="radiogroup" aria-label="Rango">${['Hoy', 'Ayer', 'Últimos 7 días', 'Este mes', 'Personalizado'].map(o => Chip({ texto: o, sel: o === valor || (o === 'Últimos 7 días' && !['Hoy', 'Ayer', 'Este mes', 'Personalizado'].includes(valor)), tam: 40, x: ` data-valor="${o}"` })).join('')}</div><div class="rango">${Campo({ tipo: 'fecha', etiqueta: 'Desde', valor: '14 nov 2026', densidad: 'panel' })}${Campo({ tipo: 'fecha', etiqueta: 'Hasta', valor: '20 nov 2026', densidad: 'panel' })}</div><div class="acciones">${Boton({ tipo: 'secundario', texto: 'Limpiar', tam: 40, x: ' data-cerrar-popover' })}${Boton({ tipo: 'principal', texto: 'Aplicar', tam: 40, x: ' data-aplicar' })}</div></div>`;
  } else {
    const ops = opciones.length ? opciones : [valor];
    pop = `<ul class="popover lista" role="listbox"${abierto ? '' : ' hidden'}>${ops.map(o => `<li class="opcion"${attrs({ seleccionada: o === valor ? 'si' : null })} role="option" tabindex="0">${o === valor ? ic('check', 16) : '<span class="hueco"></span>'}${o}</li>`).join('')}</ul>`;
  }
  return `<div class="Filtro"${attrs({ tipo, estado })}${ir ? ` data-ir="${ir}"` : ''}><button type="button" class="control" aria-expanded="${abierto}">${ic(icono, 18)}<span class="etiqueta">${etiqueta}:</span><span class="valor">${valor}</span>${estado === 'aplicado' ? ic('x', 16) : ic('chevron-abajo', 16)}</button>${pop}</div>`;
}

export function Paginacion({ desde = 1, hasta = 10, total = 25, pagina = 1, paginas = 3 } = {}) {
  let b = '';
  for (let i = 1; i <= paginas; i++) b += `<button type="button" class="num"${attrs({ actual: i === pagina ? 'si' : null })}${i === pagina ? ' aria-current="page"' : ''}>${i}</button>`;
  return `<nav class="Paginacion" aria-label="Paginación"><span class="rango">Mostrando ${desde}–${hasta} de ${total}</span><div class="botones">${IconoCirculo({ icono: 'chevron-izq', label: 'Anterior', tam: 40, estado: pagina === 1 ? 'deshabilitado' : 'normal' })}${b}${IconoCirculo({ icono: 'chevron-der', label: 'Siguiente', tam: 40, estado: pagina === paginas ? 'deshabilitado' : 'normal' })}</div></nav>`;
}

export function TarjetaQR(codigo, { generado = true } = {}) {
  return `<div class="TarjetaQR"${attrs({ generado: generado ? 'si' : 'no' })}>${generado ? qrSvg(codigo, 200) : `<div class="qr-vacio">${ic('qr', 48)}<span>El QR se genera al guardar el cupón</span></div>`}<span class="codigo">${codigo || 'SIN CÓDIGO'}</span><span class="nota">${generado ? `Este QR contiene el código ${codigo}. Se escanea en la app (RF-06).` : 'Escribe un código para ver la vista previa.'}</span><div class="acciones">${Boton({ tipo: 'secundario', texto: 'Descargar QR', icono: 'descargar', tam: 40, estado: generado ? 'normal' : 'deshabilitado' })}${Boton({ tipo: 'texto', texto: 'Copiar código', icono: 'copiar', tam: 40, estado: generado ? 'normal' : 'deshabilitado' })}</div></div>`;
}

/* ───────────── Organismos ───────────── */
export const BarraNovedad = (texto = 'Hoy el latte de avena va con $10 menos. Aprovéchalo.') => `<div class="BarraNovedad" role="note"><span class="texto">${texto}</span></div>`;

// Cabecera pública (v2): logo, navegación y "Iniciar sesión" solo para personal. Sin acciones de pedido ni cuentas de cliente.
export const NAV = [['Menú', '#/bebidas', 'menu'], ['Combinaciones', '#/combinaciones', 'combinaciones'], ['Promociones', '#/promociones', 'promos'], ['Sucursales', '#/sucursales', 'sucursales'], ['Quiz', '#/?ir=quiz', 'quiz']];
const accesoBoton = (sesion, compacto = false) => (sesion
  ? Boton({ tipo: 'principal', texto: compacto ? 'Panel' : 'Ir al panel', icono: 'grafica', tam: compacto ? 40 : 46, href: '#/panel', x: ' data-ir-panel' })
  : `<a class="BotonAcceso"${compacto ? ' data-tam="compacto"' : ''} href="#/acceso" aria-label="Iniciar sesión, solo personal">${ic('candado', 18)}<span class="textos"><span class="texto">Iniciar sesión</span><span class="nota">Solo personal</span></span></a>`);
export function Cabecera(bp = 'escritorio', activo = '', { menu = 'cerrado', sesion = null } = {}) {
  const enlaces = NAV.map(([t, h, k]) => `<a class="enlace"${k === activo ? ' aria-current="page"' : ''} href="${h}">${t}${bp === 'escritorio' ? '' : ic('chevron-der', 20)}</a>`).join('');
  if (bp !== 'escritorio') {
    const ab = menu === 'abierto';
    return `<header class="Cabecera"${attrs({ breakpoint: bp, menu })}><div class="fila"><a class="marca" href="#/" aria-label="BeanCraft Coffee, inicio">${Logo({ tam: bp === 'tablet' ? 32 : 28 })}</a><div class="lado">${accesoBoton(sesion, bp === 'movil')}<button type="button" class="IconoCirculo boton-menu" aria-label="${ab ? 'Cerrar menú' : 'Abrir menú'}" aria-expanded="${ab}" aria-controls="menu-movil" data-alternar-menu><span class="ic-abrir"${ab ? ' hidden' : ''}>${ic('menu', 20)}</span><span class="ic-cerrar"${ab ? '' : ' hidden'}>${ic('x', 20)}</span></button></div></div><nav class="menu-movil" id="menu-movil" aria-label="Principal"${ab ? '' : ' hidden'}>${enlaces}</nav></header>`;
  }
  return `<header class="Cabecera"${attrs({ breakpoint: bp })}><div class="fila"><a class="marca" href="#/" aria-label="BeanCraft Coffee, inicio">${Logo({ tam: 34 })}</a><nav class="nav" aria-label="Principal">${enlaces}</nav>${accesoBoton(sesion)}</div></header>`;
}

export function PieDePagina(bp = 'escritorio', { frase = { id: 'grano', quote: 'Y recuerda… tu café, a tu manera.' } } = {}) {
  const cols = [['Conoce', [['Menú', '#/bebidas'], ['Combinaciones', '#/combinaciones'], ['Promociones', '#/promociones'], ['Quiz', '#/?ir=quiz']]], ['Sucursales', [['Centro', '#/sucursales'], ['Kino', '#/sucursales'], ['Bosque', '#/sucursales']]], ['Ayuda', [['Preguntas frecuentes', '#/ayuda'], ['Privacidad', '#/privacidad'], ['Contacto', '#/contacto']]]];
  const redes = `<div class="redes">${['instagram', 'facebook', 'tiktok'].map(r => `<a class="red" href="#externo-${r}" aria-label="${r[0].toUpperCase() + r.slice(1)} de BeanCraft" data-externo="${r}">${ic(r, 20)}</a>`).join('')}</div>`;
  const app = `<a class="conoce-app" href="#externo-app" data-externo="app">${ic('qr', 18)}Conoce la app</a>`;
  const recuerda = `<div class="recuerda">${Mascota(frase.id, { tam: bp === 'movil' ? 88 : 112, estado: 'guino', fondo: 'oscuro' })}<p class="frase">${frase.quote}</p></div>`;
  const li = ls => `<ul>${ls.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>`;
  const columnas = bp === 'movil'
    ? `<div class="acordeon">${cols.map(([t, ls], i) => `<details class="grupo"${i === 0 ? ' open' : ''}><summary>${t}${ic('chevron-abajo', 20)}</summary>${li(ls)}</details>`).join('')}<div class="grupo"><span class="titulo">Síguenos</span>${redes}${app}</div></div>`
    : `<div class="columnas">${cols.map(([t, ls]) => `<div class="col"><span class="titulo">${t}</span>${li(ls)}</div>`).join('')}<div class="col"><span class="titulo">Síguenos</span>${redes}${app}</div></div>`;
  return `<footer class="PieDePagina"${attrs({ breakpoint: bp })}><div class="contenedor"><div class="superior">${columnas}${recuerda}</div><div class="inferior">${Logo({ fondo: 'oscuro', tam: 28 })}<span>© 2026 BeanCraft Coffee · San Luis Río Colorado, Son.</span><a class="acceso-personal" href="#/acceso">${ic('candado', 16)}Iniciar sesión (personal)</a></div></div></footer>`;
}

export function LineaPedido(actual, { animado = true, bp = 'escritorio', siguiente = false } = {}) {
  const idx = ESTADOS.findIndex(e => e.id === actual);
  const e = ESTADOS[idx];
  return `<div class="LineaPedido"${attrs({ actual, animado: animado ? 'si' : 'no', breakpoint: bp })}><div class="pasos-wrap"><span class="riel" aria-hidden="true"></span><ol class="pasos">${ESTADOS.map((x, i) => PasoPedido(x, i < idx ? 'completado' : i === idx ? 'actual' : 'pendiente')).join('')}</ol></div><div class="mensaje" aria-live="polite">${InsigniaEstado(actual)}<p class="copy">${e.copy}</p>${siguiente ? Boton({ tipo: 'secundario', texto: 'Siguiente estado', iconoDer: 'chevron-der', estado: actual === 'entregado' ? 'deshabilitado' : 'normal', x: ' data-siguiente' }) : ''}</div></div>`;
}

// Mapa ilustrado propio (sin mapas de terceros). Lienzo alto para ocupar la columna completa; las calles llevan su
// nombre real y cada pin se enlaza con su tarjeta (data-sucursal) para resaltarse al pasar o tocar.
const MAPA_POS = { centro: [262, 318], universidad: [430, 178], plaza: [318, 478] };
export function MapaIlustrado(sucursales, { sugerida } = {}) {
  const t = (x, y, txt, extra = '') => `<text x="${x}" y="${y}" font-family="Instrument Sans, sans-serif" font-size="12" font-weight="600" fill="var(--c-tostado)" ${extra}>${txt}</text>`;
  const pins = sucursales.map(s => {
    const [x, y] = MAPA_POS[s.id] || [s.x, s.y];
    const ancho = s.nombre.length * 8.6 + 22;
    const color = s.id === sugerida ? 'var(--c-miel)' : s.abierta ? 'var(--c-verde)' : 'var(--c-tostado)';
    return `<g class="pin" data-sucursal="${s.id}" tabindex="0" role="button" aria-label="${s.nombreCompleto}, ${s.abierta ? 'abierta' : 'cerrada'}"><circle class="halo" cx="${x}" cy="${y - 30}" r="30" fill="${color}" opacity="0"/><path d="M${x} ${y}c-13-15-20-24-20-33a20 20 0 0 1 40 0c0 9-7 18-20 33z" fill="${color}" stroke="var(--c-tostado)" stroke-width="2"/><circle cx="${x}" cy="${y - 33}" r="7" fill="var(--c-espuma)"/><rect x="${x + 16}" y="${y - 50}" width="${ancho}" height="30" rx="15" fill="var(--c-blanco)" stroke="var(--c-tostado)" stroke-width="2"/>${t(x + 27, y - 30, s.nombre, 'font-size="14"')}</g>`;
  }).join('');
  const calles = 'M-20 120h640M-20 250h640M-20 400h640M-20 540h640M110-20v680M300-20v680M480-20v680';
  return `<div class="MapaIlustrado"><svg viewBox="0 0 600 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa ilustrado de las sucursales en San Luis Río Colorado">
<rect width="600" height="640" fill="var(--c-menta)"/>
<path d="M-20 560C110 520 190 610 320 585S520 470 620 505v60C520 535 430 650 310 640S100 590-20 615z" fill="var(--c-lila)" opacity=".55"/>
<g fill="var(--c-verde)" opacity=".28"><circle cx="530" cy="300" r="26"/><circle cx="556" cy="330" r="18"/><circle cx="60" cy="460" r="22"/><circle cx="84" cy="486" r="14"/><circle cx="410" cy="600" r="16"/></g>
<g stroke="var(--c-blanco)" stroke-width="16" stroke-linecap="round" fill="none"><path d="${calles}"/><path d="M-10 640 610 0"/></g>
<g stroke="var(--c-tostado)" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round" fill="none" opacity=".45"><path d="${calles}"/></g>
<rect x="128" y="268" width="152" height="116" rx="18" fill="var(--c-limon)" stroke="var(--c-tostado)" stroke-width="2"/>${t(204, 330, 'Plaza principal', 'text-anchor="middle"')}
<rect x="330" y="40" width="196" height="50" rx="14" fill="var(--c-blanco)" stroke="var(--c-tostado)" stroke-width="2" stroke-dasharray="5 5"/>${t(428, 70, 'Campus universitario', 'text-anchor="middle"')}
<g>${t(124, 112, 'Av. Obregón')}${t(310, 242, 'Calle 5')}${t(318, 392, 'Calz. Constitución')}${t(124, 532, 'Av. Revolución')}${t(488, 232, 'Calle 22')}</g>
${sugerida ? `<g class="tu-ubicacion"><circle cx="232" cy="220" r="10" fill="var(--c-verde)" stroke="var(--c-espuma)" stroke-width="3"/><circle cx="232" cy="220" r="22" fill="none" stroke="var(--c-verde)" stroke-width="2" opacity=".5"/>${t(248, 225, 'Tú')}</g>` : ''}
${pins}</svg><p class="nota">Ilustración propia, sin mapas de terceros. Toca un pin para ver su sucursal.</p></div>`;
}

export function Sidebar({ rol = 'admin', activo = 'pedidos', ancho = 'expandido', usuario, badges = {} } = {}) {
  // Solo se listan las pantallas que el rol puede abrir (matriz de permisos, auth/permisos.js).
  const items = [['resumen', 'grafica', 'Resumen', '#/panel/resumen'], ['pedidos', 'recibo', 'Pedidos', '#/panel/pedidos'], ['productos', 'taza', 'Productos', '#/panel/productos'], ['opciones', 'filtro', 'Opciones', '#/panel/opciones'], ['sucursales', 'tienda', 'Sucursales', '#/panel/sucursales'], ['cupones', 'cupon', 'Cupones', '#/panel/cupones'], ['calificaciones', 'estrella', 'Calificaciones', '#/panel/calificaciones'], ['notificaciones', 'campana', 'Notificaciones', '#/panel/notificaciones'], ['usuarios', 'usuarios', 'Usuarios', '#/panel/usuarios'], ['respaldo', 'base-datos', 'Respaldo', '#/panel/respaldo']];
  const col = ancho === 'iconos';
  const u = usuario || (rol === 'admin' ? { nombre: 'Ricardo Martínez', rol: 'Administrador', ini: 'RM' } : { nombre: 'Daniela Ortiz', rol: 'Personal · Centro', ini: 'DO' });
  return `<aside class="Sidebar"${attrs({ rol, ancho })}><div class="marca">${col ? Logo({ soloSimbolo: true, tam: 36 }) : Logo({ tam: 30, sub: 'Panel' })}</div><nav class="nav" aria-label="Panel">${items.filter(([k]) => puedeVer(rol, k)).map(([k, icn, t, h]) => ItemSidebar({ icono: icn, texto: t, estado: k === activo ? 'activo' : 'normal', colapsado: col, href: h, badge: badges[k] })).join('')}</nav><div class="pie">${ItemSidebar({ icono: 'casa', texto: 'Ver sitio', colapsado: col, href: '#/' })}${ItemSidebar({ icono: 'usuario', texto: 'Mi perfil', estado: activo === 'perfil' ? 'activo' : 'normal', colapsado: col, href: '#/panel/perfil' })}<div class="usuario">${Avatar(u.ini, col ? 36 : 40)}${col ? '' : `<div class="datos"><span class="nombre">${u.nombre}</span><span class="rol">${u.rol}</span></div>`}<a class="salir" href="#/panel/confirmacion?estado=cerrar-sesion" aria-label="Cerrar sesión">${ic('salir', 20)}</a></div></div></aside>`;
}

export function BarraSuperiorPanel({ titulo, sub, filtros = '', accion = '' } = {}) {
  return `<div class="BarraSuperiorPanel"><div class="titulos"><h1 class="titulo">${titulo}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div><div class="herramientas">${filtros}${accion}</div></div>`;
}

export function TablaDatos({ columnas, filas, estado = 'datos', vacio = '', alinear = {}, pie = '', x = '', nombre = '' } = {}) {
  const head = `<thead><tr>${columnas.map((c, i) => `<th scope="col"${alinear[i] ? ` data-alinear="${alinear[i]}"` : ''}>${c}</th>`).join('')}</tr></thead>`;
  let body;
  if (estado === 'cargando') body = `<tbody>${[1, 2, 3, 4, 5].map(() => `<tr class="FilaTabla" data-estado="cargando">${columnas.map(() => '<td><span class="esqueleto"></span></td>').join('')}</tr>`).join('')}</tbody>`;
  else if (estado === 'vacia') body = `<tbody><tr><td colspan="${columnas.length}" class="vacia">${vacio}</td></tr></tbody>`;
  else body = `<tbody>${filas.map(f => `<tr class="FilaTabla"${attrs({ estado: f.estado || 'normal', grupo: f.grupo, ir: f.ir })}${f.oculta ? ' hidden' : ''}>${f.celdas.map((c, i) => `<td${alinear[i] ? ` data-alinear="${alinear[i]}"` : ''}${String(c).startsWith('§') ? ' class="sin-atenuar"' : ''}>${String(c).replace(/^§/, '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="TablaDatos"${nombre ? ` data-tabla="${nombre}"` : ''}${attrs({ estado })}${x}><table>${head}${body}</table>${pie}</div>`;
}

export function ColumnaPedidos(estado, pedidos, { vacia, interaccion, mostrarSuc = false } = {}) {
  const e = ESTADOS.find(x => x.id === estado);
  return `<section class="ColumnaPedidos"${attrs({ estado })} aria-label="${e.label}"><div class="cabeza">${InsigniaEstado(estado, 'panel')}<span class="conteo">${pedidos.length}</span></div><div class="tarjetas">${pedidos.length ? pedidos.map((p, i) => TarjetaPedido(p, { estado: interaccion && i === 0 ? interaccion : 'normal', mostrarSuc })).join('') : EstadoVacio({ mascota: 'hielito', titulo: vacia || 'Nada por aquí', texto: 'Los pedidos aparecen solos cuando cambian de estado.', contexto: 'panel' })}</div></section>`;
}

export function GraficaLinea(datos, { titulo, alto = 240, ancho = 640, estado = 'datos', formato = v => mxn(v) } = {}) {
  if (estado === 'sin-datos') return `<div class="GraficaLinea" data-estado="sin-datos">${EstadoVacio({ mascota: 'hielito', titulo: 'Sin ventas en este rango', texto: 'Prueba con otro rango de fechas o con todas las sucursales.', contexto: 'panel' })}</div>`;
  if (estado === 'cargando') return `<div class="GraficaLinea" data-estado="cargando"><span class="esqueleto bloque" style="height:${alto}px"></span></div>`;
  const pl = 64, pr = 24, pt = 24, pb = 36, W = ancho, H = alto;
  const max = Math.max(...datos.map(d => d[1])), top = Math.ceil(max / 500) * 500;
  const x = i => pl + (i * (W - pl - pr)) / (datos.length - 1), y = v => pt + (1 - v / top) * (H - pt - pb);
  const ticks = [0, top / 4, top / 2, (3 * top) / 4, top];
  const path = datos.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d[1]).toFixed(1)}`).join('');
  const last = datos.at(-1);
  return `<figure class="GraficaLinea" data-estado="datos"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${titulo}">${ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--borde-suave-color)"/><text x="${pl - 10}" y="${y(t) + 4}" text-anchor="end" font-size="12" font-family="Instrument Sans, sans-serif" fill="var(--c-tostado)">${formato(t)}</text>`).join('')}${datos.map((d, i) => `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="12" font-family="Instrument Sans, sans-serif" fill="var(--c-tostado)">${d[0]}</text>`).join('')}<path d="${path}" fill="none" stroke="var(--c-verde)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${datos.map((d, i) => `<circle cx="${x(i)}" cy="${y(d[1])}" r="${i === datos.length - 1 ? 6 : 4}" fill="${i === datos.length - 1 ? 'var(--c-verde)' : 'var(--c-blanco)'}" stroke="var(--c-verde)" stroke-width="2.5"/>`).join('')}<g><rect x="${x(datos.length - 1) - 92}" y="${y(last[1]) - 40}" width="84" height="26" rx="13" fill="var(--c-tostado)"/><text x="${x(datos.length - 1) - 50}" y="${y(last[1]) - 22}" text-anchor="middle" font-size="13" font-weight="700" font-family="Instrument Sans, sans-serif" fill="var(--c-espuma)">${formato(last[1])}</text></g></svg></figure>`;
}

export function GraficaBarras(datos, { estado = 'datos', formato = v => v, serie = 'verde', etiquetas } = {}) {
  if (estado === 'sin-datos') return `<div class="GraficaBarras" data-estado="sin-datos">${EstadoVacio({ mascota: 'hielito', titulo: 'Sin datos en este rango', texto: 'Cambia el filtro para ver resultados.', contexto: 'panel' })}</div>`;
  if (estado === 'cargando') return `<div class="GraficaBarras" data-estado="cargando">${[70, 55, 40, 30, 20].map(w => `<span class="esqueleto" style="width:${w}%;height:24px"></span>`).join('')}</div>`;
  const max = Math.max(...datos.map(d => d[1]));
  return `<div class="GraficaBarras" data-estado="datos" role="list">${datos.map((d, i) => `<div class="barra" role="listitem"><span class="nombre">${etiquetas ? etiquetas[i] : d[0]}</span><span class="pista"><span class="relleno" data-serie="${Array.isArray(serie) ? serie[i] : serie}" style="width:${(d[1] / max) * 100}%"></span></span><span class="valor">${formato(d[1])}</span></div>`).join('')}</div>`;
}

export function PanelLateral({ titulo, sub, cuerpo, pie, cabezaExtra = '', cerrar = '' } = {}) {
  return `<div class="Velo"${cerrar ? ` data-ir="${cerrar}"` : ''}></div><aside class="PanelLateral" role="dialog" aria-modal="true" aria-label="${titulo}"><div class="cabeza"><div><h2 class="titulo">${titulo}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${cabezaExtra}${IconoCirculo({ icono: 'x', label: 'Cerrar', tam: 40, href: cerrar || null, x: cerrar ? '' : ' data-cerrar-capa' })}</div><div class="cuerpo">${cuerpo}</div>${pie ? `<div class="pie">${pie}</div>` : ''}</aside>`;
}

export function Dialogo({ tipo = 'confirmar', titulo, texto, confirmar, cancelar = 'Cancelar', icono = 'alerta', extra = '', irConfirmar, irCancelar, sinCancelar = false } = {}) {
  return `<div class="Velo"${irCancelar ? ` data-ir="${irCancelar}"` : ''}></div><div class="Dialogo"${attrs({ tipo })} role="alertdialog" aria-modal="true" aria-label="${titulo}"><span class="icono">${ic(icono, 24)}</span><h2 class="titulo">${titulo}</h2><p class="texto">${texto}</p>${extra}<div class="acciones">${sinCancelar ? '' : Boton({ tipo: 'secundario', texto: cancelar, tam: 40, href: irCancelar })}${Boton({ tipo: 'principal', texto: confirmar, tam: 40, icono: tipo === 'destructivo' ? 'eliminar' : null, href: irConfirmar, x: irConfirmar ? '' : ' data-confirmar' })}</div></div>`;
}

export function Formulario({ titulo, sub, cuerpo, columnas = 1 } = {}) {
  return `<section class="Formulario"${attrs({ columnas })}><div class="cabeza"><h2 class="titulo">${titulo}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div><div class="campos">${cuerpo}</div></section>`;
}
