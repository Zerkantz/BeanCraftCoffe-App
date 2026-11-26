// Arma la pantalla de cada ruta: marco del sitio (cabecera y pie), del panel (barra lateral) o de acceso.
// Devuelve { html, titulo, zona, redirigir?, aviso? }. No toca el DOM: main.js lo monta.
import * as C from '../componentes/base.js';
import { ic } from '../lib/iconos.js';
import { inicio } from '../vistas/sitio/inicio.js';
import { bebidas, producto } from '../vistas/sitio/catalogo.js';
import { combinaciones, promociones, sucursales, ayuda, privacidad, contacto, noEncontrada, design } from '../vistas/sitio/paginas.js';
import { PANTALLAS_PANEL, fijarContexto, login, detallePedido } from '../vistas/panel/pantallas.js';
import { PAGINAS_LIBRERIA } from '../vistas/libreria.js';
import { guia } from '../vistas/guia.js';
import { escenaAcceso } from '../vistas/acceso.js';
import { sesion } from '../auth/sesion.js';
import { revisarAcceso } from '../auth/guardia.js';
import { inicioDeRol, pedidosVisibles } from '../auth/permisos.js';
import { PEDIDOS } from '../data/pedidos.js';
import { promosVigentes } from '../data/cupones.js';
import { FRASES_PIE } from '../data/experiencia.js';
import { ahora } from '../lib/reglas.js';
import { ejecutarHecho } from './acciones.js';
import { traducirEnlaces } from './enlaces.js';

const BPN = { escritorio: 'Escritorio', tablet: 'Tablet', movil: 'Móvil' };

// Rutas del sitio público: [id de frame, nombre, nav activo, vista, estados que acepta ?estado=]
export const RUTAS_SITIO = {
  '': ['P-01', 'Inicio', '', inicio, ['default', 'quiz-pregunta', 'quiz-resultado']],
  bebidas: ['P-02', 'Menú', 'menu', bebidas, ['default', 'filtro-activo', 'sin-resultados', 'cargando']],
  producto: ['P-03', 'Ficha de producto', 'menu', producto, ['default', 'no-disponible']],
  combinaciones: ['P-04', 'Combinaciones', 'combinaciones', combinaciones, ['default']],
  promociones: ['P-05', 'Promociones', 'promos', promociones, ['default', 'vacio']],
  sucursales: ['P-06', 'Sucursales', 'sucursales', sucursales, ['default', 'tarjetas', 'ubicacion-pedida', 'ubicacion-concedida', 'ubicacion-denegada', 'sin-resultados']],
  ayuda: ['P-07', 'Preguntas frecuentes', '', ayuda, ['default']],
  privacidad: ['P-08', 'Privacidad', '', privacidad, ['default']],
  contacto: ['P-09', 'Contacto', '', contacto, ['vacio', 'error', 'enviado']],
  design: ['P-11', 'Guía viva', '', design, ['default']],
};

let indiceFrase = 0;
function marcoSitio({ frame, bp, activo, main, estado }) {
  const s = sesion();
  const promo = promosVigentes(ahora())[0];
  const barra = promo ? C.BarraNovedad(`${promo.titulo} · código ${promo.codigo} en la app`) : '';
  const frase = FRASES_PIE[indiceFrase % FRASES_PIE.length];
  return `<div class="Frame" data-frame="${frame}">${barra}${C.Cabecera(bp, activo, { sesion: s })}<main id="contenido" tabindex="-1">${main}</main>${C.PieDePagina(bp, { frase })}</div>`;
}
export const rotarFrase = () => { indiceFrase += 1; };

function marcoPanel({ frame, bp, s, activo, main, capa }) {
  const recibidos = pedidosVisibles(s, PEDIDOS).filter(p => p.estado === 'recibido').length;
  const sidebar = C.Sidebar({ rol: s.rol, activo, ancho: bp === 'escritorio' ? 'expandido' : 'iconos', usuario: { nombre: s.nombre, rol: s.rolTxt, ini: s.ini }, badges: { pedidos: recibidos || undefined } });
  return `<div class="FramePanel" data-frame="${frame}">${sidebar}<main class="panel-main" id="contenido" tabindex="-1">${main}</main>${capa}</div>`;
}

export function armarPantalla(ruta, bp) {
  const { partes, params } = ruta;
  const [p0 = '', p1] = partes;
  let aviso = null;

  /* Acceso del personal */
  if (p0 === 'acceso') {
    if (params.hecho) aviso = ejecutarHecho(params.hecho, params);
    const s = sesion();
    if (s && !params.estado) return { redirigir: `#/panel/${inicioDeRol(s.rol)}` };
    const estado = ['vacio', 'error', 'desactivado', 'cargando'].includes(params.estado) ? params.estado : 'vacio';
    fijarContexto({ sesion: null, params });
    const frame = `A-01 Iniciar sesión · ${BPN[bp]} · ${estado}`;
    return { html: `<div class="FrameAcceso" data-diseno="pantalla" data-frame="${frame}">${escenaAcceso()}<div class="lado-form"><a class="volver-sitio" href="#/">${ic('chevron-izq', 16)}Volver al sitio</a>${login(estado)}</div></div>`, titulo: frame, zona: 'acceso', aviso, limpiar: ['hecho'] };
  }

  /* Panel */
  if (p0 === 'panel') {
    let pantalla = p1;
    const s0 = sesion();
    if (!pantalla) return { redirigir: s0 ? `#/panel/${inicioDeRol(s0.rol)}` : '#/acceso' };
    if (pantalla === 'detalle-pedido') pantalla = 'pedidos';
    const def = PANTALLAS_PANEL.find(x => x.slug === pantalla);
    if (!def || def.acceso) return pantallaSitio({ partes: ['no-existe'], params: {} }, bp);
    const estado = def.estados.includes(params.estado) ? params.estado : def.estados[0];
    const g = revisarAcceso(pantalla, estado);
    if (g.tipo === 'login') return { redirigir: `#/acceso?volver=${encodeURIComponent(ruta.hash)}` };
    const s = g.sesion;
    if (g.tipo === 'sin-permiso') {
      const sp = PANTALLAS_PANEL.find(x => x.slug === 'sin-permiso');
      fijarContexto({ sesion: s, params });
      const frame = `A-19 Sin permiso · ${BPN[bp]} · default`;
      return { html: traducirEnlaces(marcoPanel({ frame, bp, s, activo: '', main: sp.fn('default'), capa: '' })), titulo: frame, zona: 'panel' };
    }
    if (params.hecho) aviso = ejecutarHecho(params.hecho, params);
    fijarContexto({ sesion: s, params });
    let capa = def.capa ? def.capa(estado) : '';
    if (pantalla === 'pedidos' && params.pedido) capa = detallePedido(params.pedido);
    const activo = def.activoFn ? def.activoFn(estado) : def.activo;
    const frame = `${def.id} ${def.nombre} · ${BPN[bp]} · ${estado}`;
    return { html: traducirEnlaces(marcoPanel({ frame, bp, s, activo, main: def.fn(estado), capa })), titulo: frame, zona: 'panel', aviso, limpiar: ['hecho'] };
  }

  /* Librería de componentes y guía de entrega (Figma) */
  if (p0 === 'libreria') {
    const f = PAGINAS_LIBRERIA[p1] || PAGINAS_LIBRERIA['01-fundamentos'];
    const pg = f();
    return { html: pg.html, titulo: pg.frame, zona: 'libreria' };
  }
  if (p0 === 'guia') return { html: guia(), titulo: 'BeanCraft Web v2 · Guía de entrega', zona: 'guia' };

  return pantallaSitio(ruta, bp);
}

function pantallaSitio(ruta, bp) {
  const { partes, params } = ruta;
  const clave = partes[0] || '';
  const def = RUTAS_SITIO[clave];
  if (!def || (clave === 'producto' && !partes[1])) return paginaNoEncontrada(bp);
  const [id, nombre, activo, vista, estados] = def;
  const estado = estados.includes(params.estado) ? params.estado : estados[0];
  const main = vista(bp, estado, { ...params, slug: partes[1] });
  if (main === null) return paginaNoEncontrada(bp);
  const frame = `${id} ${nombre}${clave === 'producto' ? ` · ${partes[1]}` : ''} · ${BPN[bp]} · ${estado}`;
  return { html: marcoSitio({ frame, bp, activo, main, estado }), titulo: frame, zona: 'sitio' };
}

function paginaNoEncontrada(bp) {
  const frame = `P-10 Página no encontrada · ${BPN[bp]} · default`;
  return { html: marcoSitio({ frame, bp, activo: '', main: noEncontrada() }), titulo: frame, zona: 'sitio' };
}
