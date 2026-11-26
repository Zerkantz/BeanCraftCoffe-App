// Piezas comunes de las páginas del sitio público.
import * as C from '../../componentes/base.js';

export const T = C.TituloMixto;
export const B = C.Boton;
export const mxn = C.mxn;

export const cabeza = (titulo, bajada, derecha = '') => `<div class="cabeza-seccion"><div class="titulos">${titulo}${bajada ? `<p class="bajada">${bajada}</p>` : ''}</div>${derecha}</div>`;

// Sección con el relleno superior de una página interna (debajo de la cabecera).
export const pagina = (cuerpo, { fondo } = {}) => `<section class="seccion pagina"${fondo ? ` data-fondo="${fondo}"` : ''}><div class="contenedor">${cuerpo}</div></section>`;

export const CATS = [['Todas', 'todas'], ['Cafés', 'cafes'], ['Bebidas frías', 'bebidas-frias'], ['Repostería', 'reposteria']];
export const slugCat = c => (CATS.find(x => x[0] === c) || [, 'todas'])[1];
export const catDeSlug = s => (CATS.find(x => x[1] === s) || ['Todas'])[0];
