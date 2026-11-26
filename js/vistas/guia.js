// Guía de entrega (#/guia): todas las pantallas y estados agrupados como las páginas del archivo de Figma,
// con su URL para capturarlas con html.to.design a 1440, 834 y 390 px.
import * as C from '../componentes/base.js';
import { ic } from '../lib/iconos.js';
import { PRODUCTOS } from '../data/catalogo.js';
import { PANTALLAS_PANEL } from './panel/pantallas.js';
import { PERMISOS } from '../auth/permisos.js';
import { sesion } from '../auth/sesion.js';

const RUTAS = [
  ['P-01 Inicio (landing)', '#/', ['default', 'quiz-pregunta', 'quiz-resultado']],
  ['P-02 Bebidas', '#/bebidas', ['default', 'filtro-activo', 'sin-resultados', 'cargando']],
  ['P-03 Ficha de producto', '#/producto/iced-latte', ['default', 'no-disponible']],
  ['P-04 Combinaciones', '#/combinaciones', ['default']],
  ['P-05 Promociones', '#/promociones', ['default', 'vacio']],
  ['P-06 Sucursales', '#/sucursales', ['default', 'tarjetas', 'ubicacion-pedida', 'ubicacion-concedida', 'ubicacion-denegada', 'sin-resultados']],
  ['P-07 Preguntas frecuentes', '#/ayuda', ['default']],
  ['P-08 Privacidad', '#/privacidad', ['default']],
  ['P-09 Contacto', '#/contacto', ['vacio', 'error', 'enviado']],
  ['P-10 Página no encontrada', '#/no-existe', ['default']],
  ['P-11 Guía viva', '#/design', ['default']],
];
const url = (base, e, def) => (e === def ? base : `${base}${base.includes('?') ? '&' : '?'}estado=${e}`);
const fila = (nombre, base, estados, extra = '') => `<tr><th scope="row">${nombre}${extra}</th><td>${estados.map(e => `<a class="chip-ruta" href="${url(base, e, estados[0])}">${e}</a>`).join('')}</td></tr>`;

export function guia() {
  const s = sesion();
  const roles = p => (PERMISOS[p] || []).map(r => (r === 'admin' ? 'Admin' : 'Personal')).join(' · ');
  const sitio = RUTAS.map(([n, b, e]) => fila(n, b, e)).join('') + `<tr><th scope="row">P-03 · una ficha por producto</th><td>${PRODUCTOS.map(p => `<a class="chip-ruta" href="#/producto/${p.slug}">${p.slug}</a>`).join('')}</td></tr>`;
  const panel = PANTALLAS_PANEL.map(x => fila(`${x.id} ${x.nombre}`, x.acceso ? '#/acceso' : `#/panel/${x.slug}`, x.estados, x.acceso ? '' : ` <span class="roles">${roles(x.slug)}</span>`)).join('');
  const lib = [['01 Fundamentos', '01-fundamentos'], ['02 Átomos', '02-atomos'], ['03 Moléculas', '03-moleculas'], ['04 Organismos y plantillas', '04-organismos']].map(([n, f]) => `<a class="chip-ruta" href="#/libreria/${f}">${n}</a>`).join('');
  const acceso = s
    ? `<p>Sesión activa: <strong>${s.nombre}</strong> (${s.rolTxt}). ${C.Boton({ tipo: 'secundario', texto: 'Cerrar sesión', tam: 40, href: '#/panel/confirmacion?estado=cerrar-sesion' })}</p>`
    : `<div class="atajos">${C.Boton({ texto: 'Entrar como administrador', icono: 'candado', tam: 40, x: ' data-entrar-como="ricardo@beancraft.mx"' })}${C.Boton({ tipo: 'secundario', texto: 'Entrar como personal (Centro)', icono: 'candado', tam: 40, x: ' data-entrar-como="daniela@beancraft.mx"' })}</div>`;
  return `<div class="Guia"><header class="guia-cabeza">${C.Logo({ tam: 36, sub: 'Web v2' })}<div><h1>Guía de entrega para Figma</h1><p>Cada enlace abre una pantalla o un estado. Captúralos con html.to.design a 1440, 834 y 390 px de ancho; el diseño se adapta solo. El título de la pestaña es el nombre del frame.</p></div><a class="volver" href="#/">${ic('chevron-izq', 16)}Volver al sitio</a></header>
<section class="guia-bloque"><h2>Cómo capturar</h2><ol><li>Ejecuta <code>npm start</code> y abre <code>http://localhost:5173/#/guia</code> (o la versión publicada).</li><li>En html.to.design, pega la URL del enlace y elige el ancho: 1440 (escritorio), 834 (tablet) o 390 (móvil).</li><li>Para fijar la hora de las sucursales y las promociones, agrega <code>&amp;ahora=2026-11-20T08:15</code> a la URL.</li><li>Las pantallas del panel piden sesión: usa un atajo de abajo antes de capturarlas.</li></ol></section>
<section class="guia-bloque"><h2>Acceso al panel</h2>${acceso}<p>${C.Boton({ tipo: 'texto', texto: 'Restablecer datos iniciales', icono: 'base-datos', tam: 40, x: ' data-reiniciar-datos' })}</p></section>
<section class="guia-bloque"><h2>Librería de componentes</h2><div class="chips-rutas">${lib}</div></section>
<section class="guia-bloque"><h2>Sitio público</h2><table class="tabla-guia"><tbody>${sitio}</tbody></table></section>
<section class="guia-bloque"><h2>Panel · permisos por rol</h2><table class="tabla-guia"><tbody>${panel}</tbody></table></section></div>`;
}
