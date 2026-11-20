// 5 mascotas oficiales de BeanCraft Coffee (ilustraciones PNG transparentes estilo vintage rubber-hose)
// Cero hex sueltos: fondos, acentos y capa holo usan exclusivamente tokens CSS de tokens.css.

export const MASCOTA_FAMILIA_SRC = "assets/mascotas/beancraft_mascotas_familia.png";

export const MASCOTAS_INFO = [
  {
    id: "grano",
    src: "assets/mascotas/grano.png",
    nombre: "Grano",
    base: "Grano de café con surco central",
    rol: "Curioso, el guía del sitio",
    accent: "var(--c-limon)",
    usos: "Hero · Quiz · Recibido"
  },
  {
    id: "taza",
    src: "assets/mascotas/taza.png",
    nombre: "Taza",
    base: "Taza con asa y vapor",
    rol: "Cálida, acompaña pedidos",
    accent: "var(--c-menta)",
    usos: "Hero · Preparando · Footer"
  },
  {
    id: "espuma",
    src: "assets/mascotas/espuma.png",
    nombre: "Espuma",
    base: "Nube de espuma con corazón de latte",
    rol: "Dulce y soñadora",
    accent: "var(--c-lila)",
    usos: "Hero · Quiz · Listo"
  },
  {
    id: "hielito",
    src: "assets/mascotas/hielito.png",
    nombre: "Hielito",
    base: "Cubo de hielo facetado",
    rol: "Fresco, burlón",
    accent: "var(--c-limon)",
    usos: "Quiz · Bebidas frías · Estado vacío"
  },
  {
    id: "croissant",
    src: "assets/mascotas/croissant.png",
    nombre: "Croissant",
    base: "Croissant curvo con glaseado",
    rol: "Antojadizo",
    accent: "var(--c-menta)",
    usos: "Quiz · Repostería · Entregado"
  }
];

export const MASCOTA_ESTADOS = ["feliz", "sorprendido", "triste", "pensando", "guino"];

function holoLayer() {
  return `
    <svg class="mascota-holo" viewBox="0 0 80 80" aria-hidden="true">
      <polygon points="8,18 22,8 26,18 14,28" fill="var(--c-limon)" stroke="var(--c-tostado)" stroke-width="1.6"/>
      <polygon points="58,10 72,16 66,28 54,22" fill="var(--c-lila)" stroke="var(--c-tostado)" stroke-width="1.6"/>
      <polygon points="10,60 22,56 26,68 12,72" fill="var(--c-fresa)" stroke="var(--c-tostado)" stroke-width="1.6"/>
      <polygon points="62,56 74,60 70,72 58,66" fill="var(--c-menta)" stroke="var(--c-tostado)" stroke-width="1.6"/>
    </svg>`;
}

export function renderMascota(nombre, estado = "feliz", opts = {}) {
  const {
    size = 64,
    rotation = 0,
    holo = false,
    onDark = false,
    accentBg = false,
    label = "",
    className = ""
  } = opts;

  const info = MASCOTAS_INFO.find((m) => m.id === nombre) || MASCOTAS_INFO[0];
  const rot = rotation ? Math.max(-2, Math.min(2, rotation)) : 0;
  const classes = [
    "mascota-wrap",
    onDark ? "on-dark" : "",
    accentBg ? "accent-bg" : "",
    className
  ].filter(Boolean).join(" ");

  const styles = [
    `width:${size}px`,
    `height:${size}px`,
    accentBg ? `background:${info.accent}` : "",
    rot ? `transform:rotate(${rot}deg)` : ""
  ].filter(Boolean).join(";");

  const imgA11y = label
    ? `alt="${label}"`
    : `alt="" aria-hidden="true"`;

  return `
    <span class="${classes}" data-estado="${estado}" style="${styles}">
      ${holo ? holoLayer() : ""}
      <img class="mascota-img" src="${info.src}" width="${size}" height="${size}" ${imgA11y} decoding="async">
    </span>`;
}
