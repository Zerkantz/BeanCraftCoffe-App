// Arranque de BeanCraft Web v2: restaura los datos vivos, dibuja la ruta actual y escucha la navegación.
import { leerRuta, ir, bpDeAncho, actualizarParams } from './app/router.js';
import { armarPantalla, rotarFrase } from './app/pantallas.js';
import { iniciarInteracciones, montar, toast } from './app/interacciones.js';
import { restaurar } from './app/estado.js';
import { fijarAhora, ahora } from './lib/reglas.js';
import { refrescarSucursales } from './data/sucursales.js';

const app = document.getElementById('app');
const estado = { ultima: null, bp: null, coords: null };
const BPS = ['escritorio', 'tablet', 'movil'];

export function render({ conservarScroll = false } = {}) {
  const ruta = leerRuta();
  if (!ruta) return; // ancla dentro de la página
  fijarAhora(ruta.params.ahora);
  refrescarSucursales(ahora(), estado.coords);
  const bp = BPS.includes(ruta.params.bp) ? ruta.params.bp : bpDeAncho();
  const r = armarPantalla(ruta, bp);
  if (r.redirigir) { ir(r.redirigir, { reemplazar: true }); return; }

  const cambioRuta = !estado.ultima || estado.ultima.partes.join('/') !== ruta.partes.join('/');
  const y = window.scrollY;
  estado.bp = bp;
  document.body.className = `bp-${bp} zona-${r.zona}`;
  document.documentElement.lang = 'es-MX';
  app.innerHTML = r.html;
  document.title = r.titulo;
  if (r.limpiar) actualizarParams(Object.fromEntries(r.limpiar.map(k => [k, null])));
  montar(app, { ruta, bp, coords: estado.coords });
  if (r.aviso) toast(r.aviso.texto, r.aviso.tipo || 'exito');

  if (conservarScroll) window.scrollTo(0, y);
  else if (ruta.params.ir && document.getElementById(ruta.params.ir)) document.getElementById(ruta.params.ir).scrollIntoView();
  else if (cambioRuta) {
    window.scrollTo(0, 0);
    if (estado.ultima) { const m = document.getElementById('contenido'); if (m) m.focus({ preventScroll: true }); }
  }
  if (cambioRuta) rotarFrase();
  estado.ultima = ruta;
}

restaurar();
iniciarInteracciones({ render, alCoords: c => { estado.coords = c; } });
window.addEventListener('hashchange', () => render());

// Al cambiar el ancho de la ventana (o el dispositivo de la vista previa) se vuelve a dibujar en el otro breakpoint.
let tAncho;
window.addEventListener('resize', () => {
  clearTimeout(tAncho);
  tAncho = setTimeout(() => { const r = leerRuta(); if (r && !BPS.includes(r.params.bp) && bpDeAncho() !== estado.bp) render({ conservarScroll: true }); }, 180);
});

if (!location.hash || !leerRuta()) history.replaceState(null, '', '#/');
render();
