// Enrutador por hash: #/ruta/partes?param=valor. Las anclas internas (#contenido) no cambian de pantalla.

export function leerRuta(hash = location.hash) {
  const h = hash.replace(/^#/, '');
  if (h && !h.startsWith('/')) return null; // ancla dentro de la página
  const [ruta, qs = ''] = (h || '/').split('?');
  const partes = ruta.split('/').filter(Boolean).map(decodeURIComponent);
  return { partes, params: Object.fromEntries(new URLSearchParams(qs)), hash: `#${h || '/'}` };
}

export function construir(partes, params = {}) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  return `#/${partes.map(encodeURIComponent).join('/')}${q.toString() ? `?${q}` : ''}`;
}

// Cambia de pantalla. reemplazar: sin dejar entrada en el historial.
export function ir(hash, { reemplazar = false } = {}) {
  if (reemplazar) { history.replaceState(null, '', hash); window.dispatchEvent(new HashChangeEvent('hashchange')); return; }
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

// Actualiza la URL sin volver a dibujar (búsquedas en vivo, filtros, carrusel).
export function actualizarParams(cambios) {
  const r = leerRuta();
  if (!r) return;
  const params = { ...r.params, ...cambios };
  Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k]; });
  history.replaceState(null, '', construir(r.partes, params));
}

// Breakpoint por ancho de ventana (mismos cortes que la Guía: móvil < 640, tablet < 1024).
// Ancho útil sin la barra de desplazamiento (en Windows mide ~17 px y causaba desplazamiento horizontal entre 1024 y 1040 px).
export const bpDeAncho = (w = document.documentElement.clientWidth || window.innerWidth) => (w < 640 ? 'movil' : w < 1024 ? 'tablet' : 'escritorio');
