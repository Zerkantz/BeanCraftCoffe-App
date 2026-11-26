// Traduce los enlaces con nombre de archivo de la v1 (P-02-menu--default.html, A-10-cupones--default.html#hecho-cupon)
// a rutas de la app (#/bebidas, #/panel/cupones?hecho=cupon). Así las pantallas heredadas navegan sin reescribirse.

const SITIO = { inicio: '', menu: 'bebidas', producto: 'producto', promociones: 'promociones', sucursales: 'sucursales', ayuda: 'ayuda', privacidad: 'privacidad', contacto: 'contacto', 404: 'no-existe', design: 'design' };
const ESTADO_POR_DEFECTO = new Set(['default', 'vacio', 'ver']);

export function rutaDeArchivo(archivo) {
  const m = archivo.match(/(?:\.\.\/[a-z-]+\/)?([AP])-(\d\d)-([a-z0-9-]+)--([a-z0-9-]+)\.html(?:#([\w-]+))?/);
  if (!m) return null;
  const [, zona, , slug, estado, hash] = m;
  const q = new URLSearchParams();
  if (zona === 'A') {
    if (slug === 'login') { if (!ESTADO_POR_DEFECTO.has(estado)) q.set('estado', estado); }
    else if (!ESTADO_POR_DEFECTO.has(estado) && estado !== 'rol-personal') q.set('estado', estado);
    if (hash && hash.startsWith('hecho-')) q.set('hecho', hash.slice(6));
    const base = slug === 'login' ? '#/acceso' : `#/panel/${slug}`;
    return base + (q.toString() ? `?${q}` : '');
  }
  if (slug === 'producto') {
    if (estado === 'no-disponible') return '#/producto/iced-latte?estado=no-disponible';
    return `#/producto/${estado === 'default' ? 'iced-latte' : estado}`;
  }
  if (slug === 'pedido') return '#/';
  if (!ESTADO_POR_DEFECTO.has(estado)) q.set('estado', estado);
  if (hash && hash.startsWith('cat-')) q.set('cat', hash.slice(4));
  else if (hash && hash.startsWith('hecho-')) q.set('hecho', hash.slice(6));
  else if (hash) q.set('ir', hash);
  const base = `#/${SITIO[slug] ?? slug}`;
  return base + (q.toString() ? `?${q}` : '');
}

// Reemplaza en el HTML todos los href / data-ir / data-auto-ir que apunten a un archivo de la v1.
export function traducirEnlaces(html) {
  return html.replace(/(href|data-ir|data-auto-ir)="([^"]*?[AP]-\d\d-[a-z0-9-]+--[a-z0-9-]+\.html(?:#[\w-]+)?)"/g, (t, at, archivo) => {
    const r = rutaDeArchivo(archivo);
    return r ? `${at}="${r}"` : t;
  });
}
