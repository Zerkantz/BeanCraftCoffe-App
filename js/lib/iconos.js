// Íconos de línea BeanCraft: 24 × 24, trazo 2, extremos redondeados, currentColor.
// Los 18 primeros son copia exacta de los SVG del repo móvil (index.html / app.js).
export const ICONOS = {
  // Heredados del repo
  campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  'chevron-izq': '<path d="M15 18 9 12l6-6"/>',
  'chevron-der': '<path d="m9 6 6 6-6 6"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  corazon: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  casa: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  taza: '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5v2.5M12 2.5v2.5"/>',
  carrito: '<path d="M3 4h2.2l2.3 11a1 1 0 0 0 1 .8h9.3a1 1 0 0 0 1-.8L20.5 8H6"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  recibo: '<path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  bandeja: '<path d="M4 13h16l-1.5 6h-13z"/><path d="M7 13V9a5 5 0 0 1 10 0v4"/>',
  'taza-vapor': '<path d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v3M12 3v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  bolsa: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  'bolsa-agregar': '<path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  // Nuevos para la web (mismo estilo)
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  'flecha-externa': '<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
  'mas-vertical': '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  salir: '<path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3"/><path d="m16 16 4-4-4-4"/><path d="M20 12H10"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  eliminar: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'ojo-tachado': '<path d="m3 3 18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9"/><path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  filtro: '<path d="M4 5h16l-6 7.5V19l-4 1v-7.5z"/>',
  ordenar: '<path d="M7 4v16M3 8l4-4 4 4"/><path d="M17 20V4M13 16l4 4 4-4"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'tendencia-arriba': '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  'tendencia-abajo': '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  grafica: '<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-7"/>',
  cupon: '<path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z"/><path d="M10 6v2M10 11v2M10 16v2"/>',
  tienda: '<path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M10 20v-5h4v5"/>',
  usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/>',
  estrella: '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z"/>',
  'base-datos': '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  alerta: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V13M12 16.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  ubicacion: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  descargar: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
  subir: '<path d="M12 20V9"/><path d="m7 14 5-5 5 5"/><path d="M5 4h14"/>',
  'chevron-abajo': '<path d="m6 9 6 6 6-6"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  // Redes (marcadores monocromos; reemplazar por los glifos del kit de cada marca)
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>',
  facebook: '<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7H18V2.7A22 22 0 0 0 15.4 2.5C12.7 2.5 11 4.1 11 7v2.5H8V13h3v8"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.8 2.4 4.6 5 4.8"/>',
};

export const HEREDADOS = Object.keys(ICONOS).slice(0, 18);
export const REDES = ['instagram', 'facebook', 'tiktok'];
export const NUEVOS = Object.keys(ICONOS).slice(18).filter(k => !REDES.includes(k));

export function ic(nombre, tam = 24, extra = '') {
  return `<svg class="Icono" data-icono="${nombre}" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${ICONOS[nombre]}</svg>`;
}

// Logotipo del repo (símbolo 48 × 48) + palabra.
export function logoSimbolo(tam = 32) {
  return `<svg class="logo-simbolo" width="${tam}" height="${tam}" viewBox="0 0 48 48" aria-hidden="true"><rect x="1.25" y="1.25" width="45.5" height="45.5" rx="14" fill="var(--c-verde)" stroke="var(--c-tostado)" stroke-width="2.5"/><ellipse cx="24" cy="24" rx="10" ry="13.5" transform="rotate(32 24 24)" fill="var(--c-espuma)"/><path d="M30.5 13c-6.5 3.2-3.6 9.4-7.4 13.1-2.4 2.4-5.8 3-5.9 8.7" fill="none" stroke="var(--c-tostado)" stroke-width="2.6" stroke-linecap="round"/></svg>`;
}
