// 5 mascotas originales de BeanCraft Coffee (Sección 6 de la Guía v1.0)
// Cero hex sueltos: todos los trazos y rellenos usan tokens CSS.

export const MASCOTAS_INFO = [
  { id: "grano", nombre: "Grano", base: "Grano de café con surco central", rol: "Curioso, guía del sitio y estado Recibido" },
  { id: "taza", nombre: "Taza", base: "Taza con asa y vapor", rol: "Cálida, acompaña pedidos y estado Preparando" },
  { id: "espuma", nombre: "Espuma", base: "Nube de espuma con corazón de latte", rol: "Dulce, soñadora y estado Listo" },
  { id: "hielito", nombre: "Hielito", base: "Cubo de hielo", rol: "Fresco, burlón, bebidas frías y estados vacíos" },
  { id: "croissant", nombre: "Croissant", base: "Croissant curvo", rol: "Antojadizo, repostería y estado Entregado" }
];

export const MASCOTA_ESTADOS = ["feliz", "sorprendido", "triste", "pensando", "guino"];

function renderFace(estado, cx = 40, cy = 44, lightInk = false) {
  const stroke = lightInk ? "var(--c-espuma)" : "var(--c-tostado)";
  const eyeFill = lightInk ? "var(--c-espuma)" : "var(--c-tostado)";
  const shine = lightInk ? "var(--c-tostado)" : "var(--c-blanco)";
  const blush = "var(--c-fresa)";

  const leftEye = `
    <circle cx="${cx - 9}" cy="${cy - 3}" r="4.6" fill="${eyeFill}"/>
    <circle cx="${cx - 7.5}" cy="${cy - 4.6}" r="1.7" fill="${shine}"/>`;

  let rightEye = `
    <circle cx="${cx + 9}" cy="${cy - 3}" r="4.6" fill="${eyeFill}"/>
    <circle cx="${cx + 10.5}" cy="${cy - 4.6}" r="1.7" fill="${shine}"/>`;

  let brows = "";
  let mouth = `<path d="M${cx - 5.5} ${cy + 5} Q${cx} ${cy + 10.5} ${cx + 5.5} ${cy + 5}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/>`;
  let extra = "";

  if (estado === "guino") {
    rightEye = `<path d="M${cx + 4.5} ${cy - 3} Q${cx + 9} ${cy - 7} ${cx + 13.5} ${cy - 3}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round"/>`;
    mouth = `<path d="M${cx - 5} ${cy + 4.5} Q${cx + 0.5} ${cy + 10} ${cx + 6.5} ${cy + 3.5}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/>`;
  } else if (estado === "sorprendido") {
    brows = `
      <path d="M${cx - 13} ${cy - 11} Q${cx - 9} ${cy - 13.5} ${cx - 5} ${cy - 11}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      <path d="M${cx + 5} ${cy - 11} Q${cx + 9} ${cy - 13.5} ${cx + 13} ${cy - 11}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`;
    mouth = `<ellipse cx="${cx}" cy="${cy + 6.5}" rx="3.4" ry="4.4" fill="${blush}" stroke="${stroke}" stroke-width="2"/>`;
  } else if (estado === "triste") {
    brows = `
      <path d="M${cx - 13} ${cy - 9} L${cx - 5} ${cy - 11.5}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      <path d="M${cx + 5} ${cy - 11.5} L${cx + 13} ${cy - 9}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`;
    mouth = `<path d="M${cx - 5.5} ${cy + 9} Q${cx} ${cy + 4} ${cx + 5.5} ${cy + 9}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/>`;
    extra = `<path d="M${cx - 13} ${cy + 2} Q${cx - 15} ${cy + 7} ${cx - 13} ${cy + 8.5} Q${cx - 11} ${cy + 7} ${cx - 13} ${cy + 2}Z" fill="var(--c-menta)" stroke="${stroke}" stroke-width="1.3"/>`;
  } else if (estado === "pensando") {
    brows = `
      <path d="M${cx - 13} ${cy - 9.5} L${cx - 5} ${cy - 9.5}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      <path d="M${cx + 5} ${cy - 12} Q${cx + 9} ${cy - 14} ${cx + 13} ${cy - 11}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`;
    mouth = `<path d="M${cx - 4} ${cy + 6} Q${cx + 1} ${cy + 4.5} ${cx + 5.5} ${cy + 6.5}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/>`;
    extra = `
      <circle cx="${cx + 17}" cy="${cy - 15}" r="2" fill="var(--c-espuma)" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="${cx + 22}" cy="${cy - 21}" r="3.2" fill="var(--c-limon)" stroke="${stroke}" stroke-width="1.5"/>`;
  }

  return `
    <ellipse cx="${cx - 14}" cy="${cy + 2}" rx="3.4" ry="2" fill="${blush}" opacity="0.75"/>
    <ellipse cx="${cx + 14}" cy="${cy + 2}" rx="3.4" ry="2" fill="${blush}" opacity="0.75"/>
    ${brows}
    ${leftEye}
    ${rightEye}
    ${mouth}
    ${extra}`;
}

function holoLayer() {
  return `
    <polygon points="8,18 22,8 26,18 14,28" fill="var(--c-limon)" stroke="var(--c-tostado)" stroke-width="1.6"/>
    <polygon points="58,10 72,16 66,28 54,22" fill="var(--c-lila)" stroke="var(--c-tostado)" stroke-width="1.6"/>
    <polygon points="10,60 22,56 26,68 12,72" fill="var(--c-fresa)" stroke="var(--c-tostado)" stroke-width="1.6"/>
    <polygon points="62,56 74,60 70,72 58,66" fill="var(--c-menta)" stroke="var(--c-tostado)" stroke-width="1.6"/>`;
}

function bodyGrano(estado) {
  return `
    <g>
      <ellipse cx="40" cy="41" rx="22" ry="28" fill="var(--c-tostado)" stroke="var(--c-tostado)" stroke-width="2.4"/>
      <ellipse cx="40" cy="41" rx="17" ry="23" fill="var(--c-miel)" stroke="var(--c-tostado)" stroke-width="2.2"/>
      <path d="M40 13 C33 25, 47 32, 40 42 C34 51, 44 60, 40 69" fill="none" stroke="var(--c-tostado)" stroke-width="2.4" stroke-linecap="round" opacity="0.45"/>
      ${renderFace(estado, 40, 43)}
    </g>`;
}

function bodyTaza(estado) {
  return `
    <g>
      <path d="M31 15 Q28 10 32 6" fill="none" stroke="var(--c-tostado)" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M41 14 Q38 8 43 4" fill="none" stroke="var(--c-tostado)" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M51 15 Q48 10 52 6" fill="none" stroke="var(--c-tostado)" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M57 31 H64 C70 31, 70 50, 62 50 H56" fill="none" stroke="var(--c-tostado)" stroke-width="5.6" stroke-linecap="round"/>
      <path d="M57 31 H64 C69 31, 69 50, 62 50 H56" fill="none" stroke="var(--c-espuma)" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M18 24 H58 L55 56 C54 64, 48 68, 38 68 C28 68, 22 64, 21 56 Z" fill="var(--c-verde)" stroke="var(--c-tostado)" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="20" y="32" width="36" height="25" rx="8" fill="var(--c-espuma)" stroke="var(--c-tostado)" stroke-width="2"/>
      <ellipse cx="38" cy="24" rx="20" ry="4.5" fill="var(--c-espuma)" stroke="var(--c-tostado)" stroke-width="2.2"/>
      ${renderFace(estado, 38, 45)}
    </g>`;
}

function bodyEspuma(estado) {
  return `
    <g>
      <path d="M20 58 C12 58, 10 47, 17 42 C15 32, 24 24, 34 26 C38 17, 52 17, 56 27 C65 27, 70 37, 65 45 C70 52, 65 59, 57 59 Z"
        fill="var(--c-espuma)" stroke="var(--c-tostado)" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M18 54 C24 58, 54 58, 62 53 C64 57, 60 59, 55 59 H22 C18 59, 17 56, 18 54 Z"
        fill="var(--c-lila)" stroke="var(--c-tostado)" stroke-width="1.6"/>
      <path d="M40 27 C37.5 23.5, 33 25, 34.5 28.5 C36 31.5, 40 34, 40 34 C40 34, 44 31.5, 45.5 28.5 C47 25, 42.5 23.5, 40 27 Z"
        fill="var(--c-fresa)" stroke="var(--c-tostado)" stroke-width="1.6"/>
      ${renderFace(estado, 40, 44)}
    </g>`;
}

function bodyHielito(estado) {
  return `
    <g>
      <polygon points="18,22 50,14 66,26 64,58 32,68 16,54" fill="var(--c-menta)" stroke="var(--c-tostado)" stroke-width="2.4" stroke-linejoin="round"/>
      <polygon points="50,14 66,26 64,58 51,50" fill="var(--c-lila)" stroke="var(--c-tostado)" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="21,24 46,18 42,26 23,31" fill="var(--c-blanco)"/>
      ${renderFace(estado, 36, 44)}
    </g>`;
}

function bodyCroissant(estado) {
  return `
    <g>
      <path d="M10 47 C12 24, 68 24, 70 47 C70 55, 61 57, 56 50 C49 54, 31 54, 24 50 C19 57, 10 55, 10 47 Z"
        fill="var(--c-miel)" stroke="var(--c-tostado)" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M23 30 C27 38, 27 44, 24 50" fill="none" stroke="var(--c-tostado)" stroke-width="2" stroke-linecap="round"/>
      <path d="M57 30 C53 38, 53 44, 56 50" fill="none" stroke="var(--c-tostado)" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 36 C19 42, 19 46, 16 52" fill="none" stroke="var(--c-tostado)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M64 36 C61 42, 61 46, 64 52" fill="none" stroke="var(--c-tostado)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M33 27 Q40 24.5 47 27" fill="none" stroke="var(--c-espuma)" stroke-width="2.2" stroke-linecap="round"/>
      ${renderFace(estado, 40, 41)}
    </g>`;
}

export function renderMascota(nombre, estado = "feliz", opts = {}) {
  const { size = 56, rotation = 0, holo = false, label = "", className = "" } = opts;
  const bodies = {
    grano: bodyGrano,
    taza: bodyTaza,
    espuma: bodyEspuma,
    hielito: bodyHielito,
    croissant: bodyCroissant
  };
  const fn = bodies[nombre] || bodyGrano;
  const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`;
  const rotStyle = rotation ? `style="transform:rotate(${Math.max(-2, Math.min(2, rotation))}deg)"` : "";
  return `
    <svg class="mascota-svg ${className}" width="${size}" height="${size}" viewBox="0 0 80 80" ${a11y} ${rotStyle}>
      ${holo ? holoLayer() : ""}
      ${fn(estado)}
    </svg>`;
}
