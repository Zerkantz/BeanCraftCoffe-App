// BeanCraft Coffee — App Móvil Híbrida (ES Module)
// Cumplimiento estricto de Guía de Diseño v1.0 + Carrusel 3D / Hoja Luma / Tarjetas cristalinas / Checkout deslizable
// Flujos SRS: RF-01 a RF-11, RF-22 y RN-01 a RN-05

import { renderMascota, MASCOTAS_INFO, MASCOTA_ESTADOS } from "./mascotas.js";

const conchaSvg = (topToken = "var(--c-tostado)", size = 96) => {
  const h = Math.round(size * 0.8);
  const lines = Array.from({ length: 7 }, (_, i) =>
    `<path d="M${18 + i * 12} ${38 - Math.abs(3 - i) * 4}c4 6 4 14 0 22" fill="none" stroke="var(--c-tostado)" stroke-opacity=".35" stroke-width="2"/>`
  ).join("");
  return `
    <svg width="${size}" height="${h}" viewBox="0 0 110 88" aria-hidden="true">
      <path d="M10 62c0-24 20-42 45-42s45 18 45 42c0 9-8 14-45 14S10 71 10 62z" fill="var(--c-miel)" stroke="var(--c-tostado)" stroke-width="2.4"/>
      <path d="M14 56c0-20 18-34 41-34s41 14 41 34c-10 5-24 7-41 7s-31-2-41-7z" fill="${topToken}" stroke="var(--c-tostado)" stroke-width="2"/>
      ${lines}
    </svg>`;
};

// Textura cristalina facetada 100% plana (cero degradados, cero blur) usando tokens de la guía
const crystalFacets = (tintToken) => `
  <svg class="crystal-svg" viewBox="0 0 160 220" preserveAspectRatio="none" aria-hidden="true">
    <polygon points="0,0 94,0 44,82 0,56" fill="${tintToken}" fill-opacity="0.34"/>
    <polygon points="94,0 160,0 160,72 108,96 44,82" fill="${tintToken}" fill-opacity="0.18"/>
    <polygon points="0,56 44,82 18,148 0,132" fill="${tintToken}" fill-opacity="0.24"/>
    <polygon points="44,82 108,96 76,160 18,148" fill="var(--c-espuma)" fill-opacity="0.48"/>
    <polygon points="108,96 160,72 160,154 76,160" fill="${tintToken}" fill-opacity="0.38"/>
    <polygon points="0,132 76,160 160,154 160,220 0,220" fill="${tintToken}" fill-opacity="0.24"/>
    <polyline points="0,56 44,82 94,0 M44,82 108,96 160,72 M44,82 18,148 76,160 108,96 M76,160 160,154"
      fill="none" stroke="var(--c-blanco)" stroke-opacity="0.88" stroke-width="1.4"/>
  </svg>`;

const stateIconSvg = (key) => {
  const map = {
    recibido: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 13h16l-1.5 6h-13z"/><path d="M7 13V9a5 5 0 0 1 10 0v4"/></svg>`,
    preparando: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v3M12 3v3"/></svg>`,
    listo: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>`,
    entregado: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
    cancelado: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`
  };
  return map[key] || map.recibido;
};

const ORDER_META = [
  { key: "recibido", label: "Recibido", mascota: "grano", copy: "Ya lo tenemos." },
  { key: "preparando", label: "Preparando", mascota: "taza", copy: "Manos a la obra." },
  { key: "listo", label: "Listo", mascota: "espuma", copy: "Pasa por él." },
  { key: "entregado", label: "Entregado", mascota: "croissant", copy: "Buen provecho." }
];

const PRODUCTS = [
  {
    id: "frappe_supremo",
    name: "Frappé Supremo",
    cat: "Frappés",
    price: 65,
    rate: 5.0,
    desc: "Espresso doble frappeado con crema batida y caramelo de la casa.",
    img: "assets/frappe_helado.png",
    mascota: "hielito",
    crystalToken: "var(--c-miel)",
    customizable: true
  },
  {
    id: "refresher_duo",
    name: "Refresher Dúo",
    cat: "Bebidas frías",
    price: 62,
    rate: 4.9,
    desc: "Infusión frutal de frutos rojos y moras azules con perlas explosivas.",
    img: "assets/refresher.png",
    mascota: "hielito",
    crystalToken: "var(--c-fresa)",
    customizable: true
  },
  {
    id: "frappe_beancraft",
    name: "Frappé BeanCraft",
    cat: "Frappés",
    price: 58,
    rate: 4.9,
    desc: "Mezcla clásica de café de altura tostado oscuro con hielo frappeado.",
    img: "assets/frappe.png",
    mascota: "hielito",
    crystalToken: "var(--c-miel)",
    customizable: true
  },
  {
    id: "latte_caramelo",
    name: "Latte de caramelo",
    cat: "Cafés",
    price: 55,
    rate: 4.8,
    desc: "Espresso doble, leche vaporizada y caramelo artesanal.",
    img: "assets/latte_duo.png",
    mascota: "taza",
    crystalToken: "var(--c-miel)",
    customizable: true
  },
  {
    id: "cold_brew",
    name: "Americano & Cold Brew",
    cat: "Bebidas frías",
    price: 57,
    rate: 4.6,
    desc: "Tranquilo, directo y con carácter. Extracción en frío de 16 horas.",
    img: "assets/americano_duo.png",
    mascota: "grano",
    crystalToken: "var(--c-menta)",
    customizable: true
  },
  {
    id: "mocha_blanco",
    name: "Kfreeze Berry & Nuez",
    cat: "Frappés",
    price: 66,
    rate: 4.8,
    desc: "Helado suave artesanal con cobertura de frutos rojos o nuez.",
    img: "assets/kfreeze_duo.png",
    mascota: "espuma",
    crystalToken: "var(--c-fresa)",
    customizable: true
  },
  {
    id: "capuchino",
    name: "Frappé Galleta & Fresa",
    cat: "Frappés",
    price: 62,
    rate: 4.9,
    desc: "Dúo de frappé cremoso con galleta triturada y fresa natural.",
    img: "assets/frappe_duo.png",
    mascota: "hielito",
    crystalToken: "var(--c-fresa)",
    customizable: true
  },
  {
    id: "matcha_latte",
    name: "Matcha latte",
    cat: "Bebidas frías",
    price: 64,
    rate: 4.6,
    desc: "Matcha ceremonial batido en frío o caliente sobre leche cremosa.",
    img: "assets/matcha_duo.webp",
    mascota: "espuma",
    crystalToken: "var(--c-menta)",
    customizable: true
  },
  {
    id: "taro_frappe",
    name: "Nieve Crunch & Berry",
    cat: "Frappés",
    price: 59,
    rate: 4.7,
    desc: "Nieve cremosa con crumble de caramelo o coulis de frutos rojos.",
    img: "assets/nieve_duo.png",
    mascota: "hielito",
    crystalToken: "var(--c-lila)",
    customizable: true
  },
  {
    id: "te_helado_rojo",
    name: "Té rojo helado",
    cat: "Bebidas frías",
    price: 48,
    rate: 4.7,
    desc: "Infusión fría de frutos rojos y jamaica sobre hielo cristalino.",
    img: "assets/te_rojo_helado.webp",
    mascota: "hielito",
    crystalToken: "var(--c-fresa)",
    customizable: true
  },
  {
    id: "agua_purificada",
    name: "Agua purificada",
    cat: "Bebidas frías",
    price: 22,
    rate: 4.9,
    desc: "Agua natural embotellada de 600 ml bien fría.",
    img: "assets/agua_ciel.webp",
    mascota: "hielito",
    crystalToken: "var(--c-menta)",
    customizable: false
  },
  {
    id: "capuchino_duo",
    name: "Capuchino clásico",
    cat: "Cafés",
    price: 52,
    rate: 4.9,
    desc: "Espresso doble con leche vaporizada, crema suave o versión con hielo.",
    img: "assets/capuchino_duo.webp",
    mascota: "espuma",
    crystalToken: "var(--c-limon)",
    customizable: true
  },
  {
    id: "flat_white",
    name: "Flat White",
    cat: "Cafés",
    price: 49,
    rate: 4.8,
    desc: "Taza caliente de espresso intenso con microespuma sedosa.",
    img: "assets/latte_caliente.png",
    mascota: "taza",
    crystalToken: "var(--c-miel)",
    customizable: true
  },
  {
    id: "iced_latte",
    name: "Iced Latte",
    cat: "Cafés",
    price: 56,
    rate: 4.9,
    desc: "Leche fría con carga de espresso y hielos cristalinos.",
    img: "assets/iced_latte.png",
    mascota: "taza",
    crystalToken: "var(--c-limon)",
    customizable: true
  },
  {
    id: "chai_latte",
    name: "Chai Latte",
    cat: "Cafés",
    price: 58,
    rate: 4.8,
    desc: "Té negro especiado con canela, cardamomo y leche cremosa.",
    img: "assets/chai_duo.webp",
    mascota: "taza",
    crystalToken: "var(--c-miel)",
    customizable: true
  },
  {
    id: "chocolate_cacao",
    name: "Chocolate de cacao",
    cat: "Cafés",
    price: 54,
    rate: 4.8,
    desc: "Cacao artesanal caliente o frío en las rocas.",
    img: "assets/chocolate_duo.webp",
    mascota: "grano",
    crystalToken: "var(--c-lila)",
    customizable: true
  },
  {
    id: "te_durazno",
    name: "Té de durazno",
    cat: "Bebidas frías",
    price: 46,
    rate: 4.7,
    desc: "Infusión dorada de durazno natural fría o caliente.",
    img: "assets/te_durazno_duo.webp",
    mascota: "hielito",
    crystalToken: "var(--c-limon)",
    customizable: true
  },
  {
    id: "tisana_frutos",
    name: "Tisana frutos rojos",
    cat: "Bebidas frías",
    price: 56,
    rate: 4.9,
    desc: "Frutos deshidratados de arándano, fresa y jamaica.",
    img: "assets/tisana_frutos.png",
    mascota: "hielito",
    crystalToken: "var(--c-fresa)",
    customizable: true
  },
  {
    id: "refresher_fresa",
    name: "Refresher Coco & Fresa",
    cat: "Bebidas frías",
    price: 60,
    rate: 4.8,
    desc: "Refrescantes bebidas de coco tropical o fresa silvestre.",
    img: "assets/refresher_coco_fresa.png",
    mascota: "espuma",
    crystalToken: "var(--c-fresa)",
    customizable: true
  },
  {
    id: "protea_frappe",
    name: "Protea Frappé & Mango",
    cat: "Frappés",
    price: 68,
    rate: 4.9,
    desc: "Bebida proteica de café o smoothie tropical energizante.",
    img: "assets/protea_duo.png",
    mascota: "hielito",
    crystalToken: "var(--c-miel)",
    customizable: true
  },
  {
    id: "concha_choco",
    name: "Concha de chocolate",
    cat: "Repostería",
    price: 35,
    rate: 4.9,
    desc: "Pan artesanal recién horneado con costra crujiente de cacao.",
    bakeryToken: "var(--c-tostado)",
    mascota: "croissant",
    crystalToken: "var(--c-miel)",
    customizable: false
  },
  {
    id: "rol_canela",
    name: "Rol de canela",
    cat: "Repostería",
    price: 42,
    rate: 4.8,
    desc: "Masa hojaldrada tibia con canela molida y glaseado de queso.",
    bakeryToken: "var(--c-fresa)",
    mascota: "croissant",
    crystalToken: "var(--c-fresa)",
    customizable: false
  }
];

const BRANCHES = [
  {
    id: "centro",
    name: "BeanCraft Centro",
    addr: "Av. Obregón y Calle 5, San Luis R.C.",
    ref: "Junto a la plaza principal",
    dist: "0.8 km",
    open: 7,
    close: 22,
    hours: "Lun–Dom 7:00 am a 10:00 pm",
    openNow: true,
    suggested: true,
    mapPos: { x: 86, y: 64 }
  },
  {
    id: "universidad",
    name: "BeanCraft Kino",
    addr: "Calz. Constitución y Calle 22, San Luis R.C.",
    ref: "Frente a la entrada principal del campus",
    dist: "2.3 km",
    open: 8,
    close: 21,
    hours: "Lun–Vie 8:00 am a 9:00 pm",
    openNow: true,
    suggested: false,
    mapPos: { x: 198, y: 42 }
  },
  {
    id: "plaza",
    name: "BeanCraft Bosque",
    addr: "Av. Revolución #1420, San Luis R.C.",
    ref: "Segundo nivel, junto a las escaleras",
    dist: "3.7 km",
    open: 7,
    close: 20,
    hours: "Lun–Dom 7:00 am a 8:00 pm",
    openNow: false,
    suggested: false,
    mapPos: { x: 282, y: 94 }
  }
];

const COUPONS = {
  BIENVENIDA: { code: "BIENVENIDA", type: "fixed", value: 30, label: "-$30 MXN en tu pedido", vig: "Una vez por cliente", active: true },
  OTONO2X1: { code: "OTONO2X1", type: "percent", value: 20, label: "-20% en bebidas de temporada", vig: "Hasta el 30 de noviembre", active: true },
  CAFE15: { code: "CAFE15", type: "fixed", value: 15, label: "-$15 MXN en cafés y lattes", vig: "Jueves, todo el mes", active: true },
  VENCIDO25: { code: "VENCIDO25", type: "fixed", value: 25, label: "Cupón expirado", vig: "Vencido", active: false }
};

// Precios de referencia SRS v1.3 (RN-02)
const OPTIONS = {
  size: [
    { id: "chico", label: "Chico", cost: 0 },
    { id: "mediano", label: "Mediano", cost: 10 },
    { id: "grande", label: "Grande", cost: 18 }
  ],
  milk: [
    { id: "entera", label: "Entera", cost: 0 },
    { id: "deslac", label: "Deslactosada", cost: 0 },
    { id: "avena", label: "Avena", cost: 12 },
    { id: "almendra", label: "Almendra", cost: 12 }
  ],
  sweet: [
    { id: "sin", label: "Sin", cost: 0 },
    { id: "azucar", label: "Azúcar", cost: 0 },
    { id: "stevia", label: "Stevia", cost: 0 },
    { id: "miel", label: "Miel", cost: 5 }
  ],
  extras: [
    { id: "shot", label: "Shot extra", cost: 15 },
    { id: "crema", label: "Crema batida", cost: 8 },
    { id: "caramelo", label: "Caramelo extra", cost: 8 }
  ]
};

const SHEET_PAGES = [
  {
    id: "frappes",
    tab: "Frappés y Especiales",
    title: "Frappés House",
    sub: "Textura cremosa y café de altura",
    heroId: "frappe_supremo",
    mascota: "hielito",
    altVerde: false,
    listIds: ["frappe_supremo", "frappe_beancraft", "taro_frappe", "protea_frappe", "mocha_blanco"],
    tileIds: ["frappe_supremo", "frappe_beancraft", "taro_frappe"]
  },
  {
    id: "cafes",
    tab: "Cafés Calientes",
    title: "Café Barra",
    sub: "Espresso recién molido al momento",
    heroId: "flat_white",
    mascota: "taza",
    altVerde: true,
    listIds: ["flat_white", "latte_caramelo", "capuchino_duo", "iced_latte", "chai_latte"],
    tileIds: ["flat_white", "capuchino_duo", "iced_latte"]
  },
  {
    id: "frias",
    tab: "Bebidas Frías",
    title: "Refresher & Té",
    sub: "Frutas, tisanas, matcha y cold brew",
    heroId: "refresher_duo",
    mascota: "espuma",
    altVerde: false,
    listIds: ["refresher_duo", "cold_brew", "tisana_frutos", "matcha_latte", "te_durazno"],
    tileIds: ["refresher_duo", "tisana_frutos", "matcha_latte"]
  },
  {
    id: "reposteria",
    tab: "Repostería",
    title: "Horno Artesanal",
    sub: "Recién horneado para tu café",
    heroId: "concha_choco",
    mascota: "croissant",
    altVerde: true,
    listIds: ["concha_choco", "rol_canela", "chocolate_cacao", "capuchino_duo"],
    tileIds: ["concha_choco", "rol_canela", "chocolate_cacao"]
  }
];

const HERO_IDS = ["frappe_supremo", "refresher_duo", "frappe_beancraft", "latte_caramelo", "cold_brew"];

const QUIZ_QUESTIONS = [
  {
    q: "¿Cómo es tu plan ideal de sábado?",
    opts: [
      { label: "Cine y palomitas", pick: "frappe_supremo" },
      { label: "Salir a caminar", pick: "cold_brew" },
      { label: "Maratón de series", pick: "latte_caramelo" },
      { label: "Brunch con amigos", pick: "matcha_latte" }
    ]
  },
  {
    q: "¿Qué temperatura prefieres hoy?",
    opts: [
      { label: "Bien frío con hielo", pick: "cold_brew" },
      { label: "Frappeado y cremoso", pick: "frappe_supremo" },
      { label: "Calentito y suave", pick: "latte_caramelo" },
      { label: "Frutal y ligero", pick: "refresher_duo" }
    ]
  },
  {
    q: "¿Qué sabor te llama más?",
    opts: [
      { label: "Café directo y tostado", pick: "cold_brew" },
      { label: "Caramelo dulce", pick: "latte_caramelo" },
      { label: "Matcha herbal", pick: "matcha_latte" },
      { label: "Frutos rojos", pick: "refresher_duo" }
    ]
  },
  {
    q: "¿Cuánta energía necesitas?",
    opts: [
      { label: "Mucha, voy con prisa", pick: "cold_brew" },
      { label: "Media, paso a paso", pick: "latte_caramelo" },
      { label: "Tranquilo y balanceado", pick: "matcha_latte" },
      { label: "Un antojo dulce", pick: "frappe_supremo" }
    ]
  },
  {
    q: "¿Con qué acompañarías tu bebida?",
    opts: [
      { label: "Concha de chocolate", pick: "latte_caramelo" },
      { label: "Algo sin tanta azúcar", pick: "cold_brew" },
      { label: "Crema batida arriba", pick: "frappe_supremo" },
      { label: "Hielito extra", pick: "refresher_duo" }
    ]
  }
];

// ==================== ESTADO GLOBAL ====================
const state = {
  view: "home",
  heroStep: 0,
  heroIdx: 0,
  heroBuilder: {
    size: "mediano",
    milk: "deslac",
    extras: new Set()
  },
  sheetIdx: 0,
  menuCat: "Todo",
  menuQuery: "",
  menuFavOnly: false,
  favorites: new Set(["frappe_supremo", "refresher_duo"]),
  branchId: "centro",
  branchSearch: "",
  branchGeoNote: "",
  user: null,
  registeredEmails: new Set(["cliente@beancraft.mx"]),
  usedCoupons: new Set(),
  appliedCoupon: null,
  cart: [
    {
      uid: "init-1",
      productId: "latte_caramelo",
      size: "mediano",
      milk: "avena",
      sweet: "sin",
      extras: ["shot"],
      qty: 1
    }
  ],
  checkoutMode: "now",
  scheduledHour: "20:00",
  payMethod: "tarjeta",
  activeOrder: null,
  quizStep: -1, // -1 portada, 0..4 preguntas, 5 resultado
  quizScores: {},
  quizResultId: "cold_brew",
  notifications: [
    { id: 1, title: "Hoy hay promo", msg: "Usa el código BIENVENIDA para -$30 MXN en tu pedido.", time: "hoy" }
  ],
  cust: null,
  designMood: "feliz"
};

const $ = (sel, root = document) => root.querySelector(sel);
const productById = (id) => PRODUCTS.find((p) => p.id === id);
const branchById = (id) => BRANCHES.find((b) => b.id === id);

function renderProductArt(p, size = 100) {
  if (p.img) return `<img src="${p.img}" alt="${p.name}">`;
  return conchaSvg(p.bakeryToken || "var(--c-tostado)", size);
}

// ==================== SPLASH ====================
function initSplash() {
  $("#splashMascot").innerHTML = renderMascota("grano", "feliz", { size: 92 });
  const splash = $("#splashScreen");
  const hide = () => splash.classList.add("done");
  $("#skipSplashBtn").addEventListener("click", hide);
  setTimeout(hide, 1400);
}

// ==================== NAVEGACIÓN ====================
function navigate(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach((sec) => {
    const isTarget = sec.id === `view-${view}`;
    sec.hidden = !isTarget;
    sec.classList.toggle("active", isTarget);
  });
  document.querySelectorAll(".nav-item[data-nav]").forEach((btn) => {
    const active = btn.dataset.nav === view;
    btn.classList.toggle("on", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  if (view === "cart") renderCartView();
  if (view === "orders") renderOrdersView();
  if (view === "profile") renderProfileView();
  if (view === "design") renderDesignView();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateBadges() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = $("#cartBadge");
  badge.textContent = String(count);
  badge.hidden = count === 0;

  const ob = $("#orderBadge");
  ob.hidden = !state.activeOrder || state.activeOrder.statusIdx === 3;
}

// ==================== TOAST ====================
let toastTimer;
function pushToast(title, msg, mascota = "taza") {
  state.notifications.unshift({ id: Date.now(), title, msg, time: "ahora" });
  $("#notifDot").hidden = false;
  $("#toastMascot").innerHTML = renderMascota(mascota, "feliz", { size: 36 });
  $("#toastTitle").textContent = title;
  $("#toastMsg").textContent = msg;
  const toast = $("#pushToast");
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}

// ==================== 1. HERO ARMADOR + CARRUSEL 3D GIRATORIO ====================
function calcBuilderPrice(productId, builder) {
  return calcUnitPrice({
    productId,
    size: builder.size,
    milk: builder.milk,
    sweet: "sin",
    extras: builder.extras
  });
}

function positionHeroRing(dragDeltaSteps = 0) {
  const total = HERO_IDS.length;
  const ring = $("#heroRing");
  const cups = [...ring.children];
  const activeLogical = ((Math.round(state.heroStep) % total) + total) % total;

  cups.forEach((cupBtn, i) => {
    let diff = i - (state.heroStep - dragDeltaSteps);
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;

    const rad = (diff * 2 * Math.PI) / total;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = sin * 124;
    const y = (1 - cos) * 18;
    const scale = 0.56 + (cos + 1) * 0.22;
    const tilt = sin * 6;
    const opacity = 0.28 + (cos + 1) * 0.36;
    const zIndex = Math.round((cos + 1) * 10);

    cupBtn.classList.toggle("dragging", dragDeltaSteps !== 0);
    cupBtn.classList.toggle("is-front", i === activeLogical && dragDeltaSteps === 0);
    cupBtn.style.zIndex = String(zIndex);
    cupBtn.style.opacity = opacity.toFixed(3);
    cupBtn.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), ${-y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
  });
}

function renderHero() {
  const total = HERO_IDS.length;
  const idx = ((state.heroStep % total) + total) % total;
  state.heroIdx = idx;

  const cur = productById(HERO_IDS[idx]);
  const liveTotal = calcBuilderPrice(cur.id, state.heroBuilder);

  $("#heroStage").setAttribute("aria-label", cur.name);
  $("#heroCategoryLabel").textContent = cur.cat;
  $("#heroTitle").textContent = cur.name;
  $("#heroLiveTotal").textContent = `$${liveTotal}`;
  $("#heroDesc").textContent = cur.desc;

  $("#heroDrinkChips").innerHTML = HERO_IDS.map((id, i) => {
    const item = productById(id);
    const short = {
      frappe_supremo: "Supremo",
      refresher_duo: "Refresher",
      frappe_beancraft: "Frappé",
      latte_caramelo: "Latte",
      cold_brew: "Cold brew"
    }[id] || item.name;
    return `<button type="button" class="pill-opt" role="tab" aria-selected="${i === idx}" data-hero-idx="${i}">${short}</button>`;
  }).join("");

  $("#heroSizeChips").innerHTML = OPTIONS.size.map((s) =>
    `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.size === s.id}" data-hb-size="${s.id}">${s.label} +$${s.cost}</button>`
  ).join("");

  $("#heroMilkChips").innerHTML = OPTIONS.milk.map((m) =>
    `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.milk === m.id}" data-hb-milk="${m.id}">${m.label} +$${m.cost}</button>`
  ).join("");

  $("#heroExtraChips").innerHTML = OPTIONS.extras.map((ex) =>
    `<button type="button" class="pill-opt" aria-pressed="${state.heroBuilder.extras.has(ex.id)}" data-hb-extra="${ex.id}">${ex.label} +$${ex.cost}</button>`
  ).join("");

  $("#heroLive").textContent = `${cur.name}, precio actual ${liveTotal} pesos.`;
  positionHeroRing(0);
}

function spinHeroTo(targetIdx) {
  const total = HERO_IDS.length;
  const curIdx = ((state.heroStep % total) + total) % total;
  let delta = targetIdx - curIdx;
  if (delta > total / 2) delta -= total;
  if (delta < -total / 2) delta += total;
  state.heroStep += delta;
  renderHero();
}

function initHero() {
  // Mascotas alrededor del Armador (Sección 6)
  $("#heroMascotLeft").innerHTML = renderMascota("grano", "feliz", { size: 54, rotation: -2 });
  $("#heroMascotRight").innerHTML = renderMascota("espuma", "guino", { size: 54, rotation: 2 });
  $("#heroMascotTop").innerHTML = renderMascota("taza", "sorprendido", { size: 50, holo: true, rotation: 2 });

  const ring = $("#heroRing");
  ring.innerHTML = HERO_IDS.map((id, i) => {
    const p = productById(id);
    return `<button type="button" class="lh-cup" data-ring-idx="${i}" aria-label="Elegir ${p.name}">${renderProductArt(p, 134)}</button>`;
  }).join("");

  renderHero();
  $("#heroPrevBtn").addEventListener("click", () => { state.heroStep--; renderHero(); });
  $("#heroNextBtn").addEventListener("click", () => { state.heroStep++; renderHero(); });

  ring.addEventListener("click", (e) => {
    if (ring.dataset.moved === "1") return;
    const cup = e.target.closest("[data-ring-idx]");
    if (!cup) return;
    const target = Number(cup.dataset.ringIdx);
    if (target === state.heroIdx) openCustomizer(HERO_IDS[target]);
    else spinHeroTo(target);
  });

  $("#heroCarousel").addEventListener("click", (e) => {
    const idxBtn = e.target.closest("[data-hero-idx]");
    if (idxBtn) { spinHeroTo(Number(idxBtn.dataset.heroIdx)); return; }
    const sBtn = e.target.closest("[data-hb-size]");
    if (sBtn) { state.heroBuilder.size = sBtn.dataset.hbSize; renderHero(); return; }
    const mBtn = e.target.closest("[data-hb-milk]");
    if (mBtn) { state.heroBuilder.milk = mBtn.dataset.hbMilk; renderHero(); return; }
    const exBtn = e.target.closest("[data-hb-extra]");
    if (exBtn) {
      const id = exBtn.dataset.hbExtra;
      if (state.heroBuilder.extras.has(id)) state.heroBuilder.extras.delete(id);
      else state.heroBuilder.extras.add(id);
      renderHero();
    }
  });

  $("#heroOrderBtn").addEventListener("click", () => {
    const pid = HERO_IDS[state.heroIdx];
    const p = productById(pid);
    state.cart.push({
      uid: `hero-${Date.now()}`,
      productId: pid,
      size: state.heroBuilder.size,
      milk: state.heroBuilder.milk,
      sweet: "sin",
      extras: [...state.heroBuilder.extras],
      qty: 1
    });
    updateBadges();
    pushToast("Bebida armada al carrito", `${p.name} · $${calcBuilderPrice(pid, state.heroBuilder)} MXN`, p.mascota);
  });
  $("#heroMenuBtn").addEventListener("click", () => navigate("menu"));

  let startX = null;
  let lastDx = 0;
  const stage = $("#heroStage");
  stage.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    lastDx = 0;
    ring.dataset.moved = "0";
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (startX === null) return;
    lastDx = e.clientX - startX;
    if (Math.abs(lastDx) > 8) ring.dataset.moved = "1";
    positionHeroRing(lastDx / 140);
  });
  const endDrag = () => {
    if (startX === null) return;
    startX = null;
    const stepShift = Math.round(-lastDx / 75);
    if (stepShift !== 0) state.heroStep += stepShift;
    renderHero();
    setTimeout(() => { ring.dataset.moved = "0"; }, 40);
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
}

// ==================== 2. MOSAICO DE PROMOCIONES (CEREZA + LIMÓN) ====================
function renderPromos() {
  const promos = [
    { code: "BIENVENIDA", title: "Primer pedido -$30", desc: "Cupón de bienvenida aplicable en tu carrito.", vig: "Vigencia: una vez por cliente" },
    { code: "OTONO2X1", title: "-20% en temporada", desc: "Aplica en frappés y bebidas calientes de la casa.", vig: "Hasta el 30 de noviembre" },
    { code: "CAFE15", title: "-$15 en cafés", desc: "Descuento directo en latte, capuchino o americano.", vig: "Jueves, todo el mes" }
  ];
  $("#promoTrack").innerHTML = promos.map((pr) => `
    <button type="button" class="promo-card" data-promo-code="${pr.code}">
      <span class="promo-card-title">${pr.title}</span>
      <p class="promo-card-desc">${pr.desc}</p>
      <span class="promo-card-vig">${pr.vig} · Código ${pr.code}</span>
    </button>`).join("");

  $("#promoTrack").addEventListener("click", (e) => {
    const card = e.target.closest("[data-promo-code]");
    if (!card) return;
    const code = card.dataset.promoCode;
    if (tryApplyCoupon(code)) navigate("cart");
  });
}

// ==================== 3. HOJA DE MENÚ SELECCIONABLE (INICIO) ====================
function renderMenuSheetSection() {
  $("#sheetTabs").innerHTML = SHEET_PAGES.map((pg, i) =>
    `<button type="button" class="chip" role="tab" aria-selected="${i === state.sheetIdx}" data-sheet-idx="${i}">${pg.tab}</button>`
  ).join("");

  $("#sheetBookTrack").innerHTML = SHEET_PAGES.map((pg, i) => {
    const heroProd = productById(pg.heroId);
    const listHtml = pg.listIds.map((pid) => {
      const p = productById(pid);
      return `
        <button type="button" class="poster-row" data-pick-id="${p.id}">
          <span>${p.name}</span>
          <strong>$${p.price}</strong>
        </button>`;
    }).join("");

    const tilesHtml = pg.tileIds.map((pid) => {
      const p = productById(pid);
      return `
        <button type="button" class="poster-tile" data-pick-id="${p.id}">
          <div class="poster-tile-art">${renderProductArt(p, 52)}</div>
          <b>${p.name}</b>
          <span>$${p.price} MXN</span>
        </button>`;
    }).join("");

    return `
      <article class="poster-sheet" role="group" aria-roledescription="slide" aria-label="${pg.title}">
        <div class="poster-top ${pg.altVerde ? "alt-verde" : ""}">
          <div>
            <h3 class="poster-cat">${pg.title}</h3>
            <p class="poster-sub">${pg.sub}</p>
            <div class="poster-list">${listHtml}</div>
          </div>
          <button type="button" class="poster-hero-cup" data-pick-id="${heroProd.id}" aria-label="Armar ${heroProd.name}">
            ${renderProductArt(heroProd, 92)}
            <span>Toca para pedir</span>
            <div style="margin-top:4px">${renderMascota(pg.mascota, "feliz", { size: 36 })}</div>
          </button>
        </div>
        <div class="poster-bottom">${tilesHtml}</div>
      </article>`;
  }).join("");

  syncSheetControls();
}

function syncSheetControls() {
  const idx = state.sheetIdx;
  const pg = SHEET_PAGES[idx];
  $("#sheetPageName").textContent = pg.tab;
  document.querySelectorAll("#sheetTabs .chip").forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === idx));
    if (i === idx) tab.scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  const uniqueIds = [...new Set([...pg.listIds, ...pg.tileIds])];
  $("#sheetQuickChips").innerHTML = uniqueIds.map((pid) => {
    const p = productById(pid);
    return `<button type="button" class="ls-chip" data-pick-id="${p.id}">${p.name} · $${p.price}</button>`;
  }).join("");
}

function goToSheet(idx) {
  const total = SHEET_PAGES.length;
  state.sheetIdx = (idx + total) % total;
  const track = $("#sheetBookTrack");
  const card = track.children[state.sheetIdx];
  if (card) track.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  syncSheetControls();
}

function initMenuSheet() {
  renderMenuSheetSection();
  $("#sheetTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sheet-idx]");
    if (btn) goToSheet(Number(btn.dataset.sheetIdx));
  });
  $("#sheetPrevBtn").addEventListener("click", () => goToSheet(state.sheetIdx - 1));
  $("#sheetNextBtn").addEventListener("click", () => goToSheet(state.sheetIdx + 1));

  $("#homeMenuSheetSection").addEventListener("click", (e) => {
    const pick = e.target.closest("[data-pick-id]");
    if (pick) openCustomizer(pick.dataset.pickId);
  });

  let scrollT;
  $("#sheetBookTrack").addEventListener("scroll", () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(() => {
      const track = $("#sheetBookTrack");
      const cards = [...track.children];
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== state.sheetIdx) {
        state.sheetIdx = best;
        syncSheetControls();
      }
    }, 80);
  });
}

// ==================== 4. QUIZ DE BEBIDAS EN PÁGINA (SEC. 9.5) ====================
function renderQuiz() {
  const box = $("#quizContainer");
  if (state.quizStep === -1) {
    box.innerHTML = `
      <div class="quiz-card">
        <h2 class="titulo-mixto">El quiz de las <em>Bebidas</em></h2>
        <p style="font-size:16px">Descubre cuál eres en 5 preguntas rápidas.</p>
        <div class="quiz-collage">
          ${renderMascota("grano", "feliz", { size: 46, rotation: -2 })}
          ${renderMascota("espuma", "guino", { size: 46 })}
          ${renderMascota("hielito", "feliz", { size: 52, holo: true, rotation: 2 })}
          ${renderMascota("croissant", "feliz", { size: 46 })}
          ${renderMascota("taza", "sorprendido", { size: 46, rotation: -1 })}
        </div>
        <button type="button" class="btn-primary full" id="startQuizBtn">¡Llévame ya!</button>
      </div>`;
    return;
  }

  if (state.quizStep >= 0 && state.quizStep < QUIZ_QUESTIONS.length) {
    const q = QUIZ_QUESTIONS[state.quizStep];
    const pct = Math.round(((state.quizStep + 1) / QUIZ_QUESTIONS.length) * 100);
    box.innerHTML = `
      <div class="quiz-card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <strong style="font-size:14px">Pregunta ${state.quizStep + 1} de ${QUIZ_QUESTIONS.length}</strong>
          <span class="marcatextos" style="font-size:13px">${pct}%</span>
        </div>
        <div class="quiz-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="quiz-progress-fill" style="width:${pct}%"></div>
        </div>
        <h3 style="font-family:var(--font-display);font-size:22px;line-height:1.15">${q.q}</h3>
        <div class="quiz-options" role="radiogroup" aria-label="${q.q}">
          ${q.opts.map((o, idx) => `<button type="button" class="quiz-opt" role="radio" aria-checked="false" data-qopt="${idx}">${o.label}</button>`).join("")}
        </div>
        <div>
          <button type="button" class="link" id="quizBackBtn">← Atrás</button>
        </div>
      </div>`;
    return;
  }

  const resProd = productById(state.quizResultId) || productById("cold_brew");
  const isCold = resProd.id === "cold_brew";
  const quote = isCold
    ? "Tranquilo, directo y con carácter."
    : resProd.desc;

  box.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-result-box">
        ${renderMascota("hielito", "guino", { size: 64, label: "Hielito guiñando" })}
        <div>
          <h3 class="titulo-mixto" style="font-size:22px">Eres un <em>${resProd.name}</em></h3>
          <p style="font-size:14px;margin-top:4px">${quote}</p>
          <span class="marcatextos" style="font-size:14px;margin-top:6px">Desde $${resProd.price} MXN</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-2)">
        <button type="button" class="btn-primary" id="quizArmarBtn">Armarla</button>
        <button type="button" class="btn-secondary" id="quizPedirBtn">Pedir en la app</button>
      </div>
      <button type="button" class="link" id="quizResetBtn">Repetir quiz</button>
    </div>`;
}

function initQuiz() {
  renderQuiz();
  $("#quizContainer").addEventListener("click", (e) => {
    if (e.target.id === "startQuizBtn") {
      state.quizStep = 0;
      state.quizScores = {};
      renderQuiz();
      return;
    }
    if (e.target.id === "quizBackBtn") {
      state.quizStep = Math.max(-1, state.quizStep - 1);
      renderQuiz();
      return;
    }
    if (e.target.id === "quizResetBtn") {
      state.quizStep = -1;
      state.quizScores = {};
      renderQuiz();
      return;
    }
    if (e.target.id === "quizArmarBtn") {
      const idx = HERO_IDS.indexOf(state.quizResultId);
      if (idx >= 0) spinHeroTo(idx);
      $("#heroCarousel").scrollIntoView({ behavior: "smooth" });
      openCustomizer(state.quizResultId);
      return;
    }
    if (e.target.id === "quizPedirBtn") {
      openCustomizer(state.quizResultId);
      return;
    }
    const optBtn = e.target.closest("[data-qopt]");
    if (optBtn) {
      const q = QUIZ_QUESTIONS[state.quizStep];
      const pick = q.opts[Number(optBtn.dataset.qopt)].pick;
      state.quizScores[pick] = (state.quizScores[pick] || 0) + 1;
      state.quizStep++;
      if (state.quizStep >= QUIZ_QUESTIONS.length) {
        const ranked = Object.entries(state.quizScores).sort((a, b) => b[1] - a[1]);
        state.quizResultId = ranked[0]?.[0] || "cold_brew";
      }
      renderQuiz();
    }
  });
}

// ==================== 5. LÍNEA DE PEDIDO EN INICIO (SEC. 9.6) ====================
function renderHomeOrderTimeline() {
  const curIdx = state.activeOrder ? state.activeOrder.statusIdx : 1;
  const meta = ORDER_META[curIdx];
  $("#homeOrderTimeline").innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span class="insignia-estado ${meta.key}">
        ${stateIconSvg(meta.key)}
        <span>${meta.label}</span>
      </span>
      <span style="font-size:14px;font-weight:600">${state.activeOrder ? `Pedido #${state.activeOrder.id}` : "Vista previa del pedido"}</span>
    </div>
    <div class="estado-steps">
      ${ORDER_META.map((m, i) => `
        <div class="estado-step ${i === curIdx ? "activo" : ""}">
          ${renderMascota(m.mascota, i === curIdx ? "feliz" : "pensando", { size: 40 })}
          <span>${m.label}</span>
        </div>`).join("")}
    </div>
    <p style="font-size:16px;font-weight:600" aria-live="polite">"${meta.copy}"</p>
    <button type="button" class="btn-secondary full" data-nav="orders">Ir a Mi pedido</button>`;
}

// ==================== 6. SUCURSALES + MAPA SVG PROPIO (SEC. 9.4) ====================
function renderBranchesSection() {
  const q = state.branchSearch.trim().toLowerCase();
  const list = BRANCHES.filter((b) =>
    !q || `${b.name} ${b.addr} ${b.ref}`.toLowerCase().includes(q)
  );

  $("#branchesContainer").innerHTML = `
    <h2 class="titulo-mixto">Pasa por <em>tu</em> barra</h2>
    <p style="font-size:16px;margin-top:4px">Elige la más cercana y aparta tu hora de recogida.</p>

    <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
      <label class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-tostado)" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input type="search" id="branchSearchInput" value="${state.branchSearch}" placeholder="Busca por C.P., colonia o dirección">
      </label>
      <button type="button" class="btn-secondary full" id="useGeoBtn">Usar mi ubicación</button>
      ${state.branchGeoNote ? `<p style="font-size:14px;color:var(--c-verde);font-weight:600">${state.branchGeoNote}</p>` : ""}
    </div>

    <div class="branch-list">
      ${list.map((b) => `
        <article class="branch-card ${b.id === state.branchId ? "selected" : ""}">
          <div class="branch-card-top">
            <strong style="font-family:var(--font-display);font-size:18px">${b.name}</strong>
            <span class="branch-status ${b.openNow ? "open" : "closed"}">${b.openNow ? "Abierta" : "Cerrada"}</span>
          </div>
          <p style="font-size:14px">${b.addr}</p>
          <p style="font-size:14px"><strong>Referencia:</strong> ${b.ref}</p>
          <p style="font-size:14px">Hoy: ${b.hours}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <button type="button" class="link" data-how-branch="${b.id}">Cómo llegar ↗</button>
            <button type="button" class="chip" aria-pressed="${b.id === state.branchId}" data-pick-branch="${b.id}">
              ${b.id === state.branchId ? "Seleccionada" : "Elegir barra"}
            </button>
          </div>
          <div class="branch-slots">
            ${["11:00", "12:00", "13:00"].map((h) => `<button type="button" class="slot-btn" data-quick-slot="${h}" data-pick-branch="${b.id}">${h}</button>`).join("")}
          </div>
        </article>`).join("")}
    </div>

    <div class="svg-map-card">
      <strong style="display:block;font-size:14px;margin-bottom:6px">Mapa ilustrado de barras BeanCraft</strong>
      <svg viewBox="0 0 340 130" width="100%" height="130" role="img" aria-label="Mapa ilustrado con ubicaciones de las 3 sucursales">
        <rect width="340" height="130" rx="12" fill="var(--c-espuma)" stroke="var(--c-tostado)" stroke-width="2"/>
        <path d="M12 40 H328 M12 88 H328 M110 10 V120 M240 10 V120" stroke="var(--c-menta)" stroke-width="8" stroke-linecap="round"/>
        <path d="M12 40 H328 M12 88 H328 M110 10 V120 M240 10 V120" stroke="var(--c-tostado)" stroke-width="1.2" stroke-dasharray="4 4"/>
        ${BRANCHES.map((b) => {
          const active = b.id === state.branchId;
          return `
            <g transform="translate(${b.mapPos.x},${b.mapPos.y})">
              <circle cx="0" cy="0" r="${active ? 10 : 7}" fill="${active ? "var(--c-miel)" : "var(--c-verde)"}" stroke="var(--c-tostado)" stroke-width="2"/>
              <text x="12" y="4" fill="var(--c-tostado)" font-size="11" font-weight="700" font-family="var(--font-body)">${b.name.replace("BeanCraft ", "")}</text>
            </g>`;
        }).join("")}
      </svg>
    </div>`;
}

function initBranchesSection() {
  renderBranchesSection();
  $("#branchesContainer").addEventListener("input", (e) => {
    if (e.target.id === "branchSearchInput") {
      state.branchSearch = e.target.value;
      renderBranchesSection();
      const inp = $("#branchSearchInput");
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  });
  $("#branchesContainer").addEventListener("click", (e) => {
    if (e.target.id === "useGeoBtn") {
      if (!navigator.geolocation) {
        state.branchId = "centro";
        state.branchGeoNote = "Sugerida más cercana: BeanCraft Centro (0.8 km).";
        renderBranchesSection();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          state.branchId = "centro";
          state.branchGeoNote = "Ubicación detectada: BeanCraft Centro es la más cercana (0.8 km).";
          updateBranchHeader();
          renderBranchesSection();
        },
        () => {
          state.branchId = "centro";
          state.branchGeoNote = "Sugerida por zona: BeanCraft Centro (0.8 km).";
          updateBranchHeader();
          renderBranchesSection();
        }
      );
      return;
    }
    const how = e.target.closest("[data-how-branch]");
    if (how) {
      const b = branchById(how.dataset.howBranch);
      pushToast(`Ruta a ${b.name}`, `${b.addr} (${b.ref})`, "grano");
      return;
    }
    const pick = e.target.closest("[data-pick-branch]");
    if (pick) {
      state.branchId = pick.dataset.pickBranch;
      if (pick.dataset.quickSlot) {
        state.checkoutMode = "scheduled";
        state.scheduledHour = pick.dataset.quickSlot;
      }
      updateBranchHeader();
      renderBranchesSection();
    }
  });
}

function updateBranchHeader() {
  const b = branchById(state.branchId);
  $("#homeBranchText").innerHTML = `<strong>${b.name}</strong> · ${b.openNow ? `Abierta hasta ${b.close}:00` : "Cerrada por ahora"}`;
}

// ==================== MÓDULO MENÚ: TARJETAS CRISTALINAS PLANAS ====================
function renderCrystalMenu() {
  const cats = ["Todo", "Cafés", "Bebidas frías", "Frappés", "Repostería"];
  $("#menuFilterChips").innerHTML = cats.map((c) =>
    `<button type="button" class="chip" role="tab" aria-selected="${state.menuCat === c}" data-cat="${c}">${c}</button>`
  ).join("");

  const q = state.menuQuery.trim().toLowerCase();
  const filtered = PRODUCTS.filter((p) => {
    if (state.menuCat !== "Todo" && p.cat !== state.menuCat) return false;
    if (state.menuFavOnly && !state.favorites.has(p.id)) return false;
    if (q && !`${p.name} ${p.cat} ${p.desc}`.toLowerCase().includes(q)) return false;
    return true;
  });

  $("#menuCountLabel").textContent = `${filtered.length} producto${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    $("#crystalMenuGrid").innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:32px 12px;display:flex;flex-direction:column;align-items:center;gap:10px">
        ${renderMascota("hielito", "pensando", { size: 72 })}
        <p style="font-size:16px;font-weight:700">No encontramos bebidas con ese filtro.</p>
        <button type="button" class="btn-secondary" id="clearMenuFilterBtn">Ver todas las bebidas</button>
      </div>`;
    $("#clearMenuFilterBtn").addEventListener("click", () => {
      state.menuCat = "Todo";
      state.menuQuery = "";
      state.menuFavOnly = false;
      $("#menuSearchInput").value = "";
      $("#menuFavFilterBtn").setAttribute("aria-pressed", "false");
      renderCrystalMenu();
    });
    return;
  }

  $("#crystalMenuGrid").innerHTML = filtered.map((p) => {
    const isFav = state.favorites.has(p.id);
    return `
      <article class="ccard">
        ${crystalFacets(p.crystalToken)}
        <div class="cc-head">
          <div class="cc-title-col">
            <h3 class="cc-name">${p.name}</h3>
            <span class="cc-rate">★ ${p.rate.toFixed(1)}</span>
          </div>
          <button type="button" class="cc-fav" data-fav-id="${p.id}" aria-pressed="${isFav}" aria-label="Favorito ${p.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>
          </button>
        </div>
        <div class="cc-sticker">${renderMascota(p.mascota, "feliz", { size: 32, rotation: 2 })}</div>
        <button type="button" class="cc-stage" data-open-id="${p.id}" aria-label="Personalizar ${p.name}">
          ${renderProductArt(p, 130)}
        </button>
        <div class="cc-glass-foot">
          <span class="cc-price">$${p.price.toFixed(2)}</span>
          <button type="button" class="cc-add" data-open-id="${p.id}" aria-label="Agregar ${p.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>
          </button>
        </div>
      </article>`;
  }).join("");
}

function initCrystalMenu() {
  renderCrystalMenu();
  $("#menuFilterChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.menuCat = btn.dataset.cat;
    renderCrystalMenu();
  });
  $("#menuSearchInput").addEventListener("input", (e) => {
    state.menuQuery = e.target.value;
    renderCrystalMenu();
  });
  $("#menuFavFilterBtn").addEventListener("click", (e) => {
    state.menuFavOnly = !state.menuFavOnly;
    e.currentTarget.setAttribute("aria-pressed", String(state.menuFavOnly));
    renderCrystalMenu();
  });
  $("#crystalMenuGrid").addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav-id]");
    if (favBtn) {
      const id = favBtn.dataset.favId;
      if (state.favorites.has(id)) state.favorites.delete(id);
      else state.favorites.add(id);
      renderCrystalMenu();
      return;
    }
    const openBtn = e.target.closest("[data-open-id]");
    if (openBtn) openCustomizer(openBtn.dataset.openId);
  });
}

// ==================== PERSONALIZADOR (RF-03, RN-02) ====================
function calcUnitPrice(item) {
  const p = productById(item.productId);
  if (!p || !p.customizable) return p ? p.price : 0;
  const s = OPTIONS.size.find((x) => x.id === item.size)?.cost || 0;
  const m = OPTIONS.milk.find((x) => x.id === item.milk)?.cost || 0;
  const sw = OPTIONS.sweet.find((x) => x.id === item.sweet)?.cost || 0;
  const ex = [...item.extras].reduce((sum, id) => sum + (OPTIONS.extras.find((x) => x.id === id)?.cost || 0), 0);
  return p.price + s + m + sw + ex;
}

function openCustomizer(productId) {
  const p = productById(productId);
  state.cust = {
    productId,
    size: "mediano",
    milk: "deslac",
    sweet: "sin",
    extras: new Set(),
    qty: 1
  };
  renderCustomizer();
  $("#customizerDialog").showModal();
}

function renderCustomizer() {
  const c = state.cust;
  const p = productById(c.productId);
  const unit = calcUnitPrice(c);
  const total = unit * c.qty;

  const optsMarkup = p.customizable ? `
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Tamaño</strong>
      <div class="opt-grid">
        ${OPTIONS.size.map((o) => `<button type="button" class="opt-btn" data-opt="size" data-val="${o.id}" aria-pressed="${c.size === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Tipo de leche</strong>
      <div class="opt-grid four">
        ${OPTIONS.milk.map((o) => `<button type="button" class="opt-btn" data-opt="milk" data-val="${o.id}" aria-pressed="${c.milk === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Endulzante</strong>
      <div class="opt-grid four">
        ${OPTIONS.sweet.map((o) => `<button type="button" class="opt-btn" data-opt="sweet" data-val="${o.id}" aria-pressed="${c.sweet === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:14px;display:block;margin-bottom:6px">Extras</strong>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${OPTIONS.extras.map((o) => `
          <label class="extra-item">
            <span style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" data-extra="${o.id}" ${c.extras.has(o.id) ? "checked" : ""}>
              ${o.label}
            </span>
            <span>+$${o.cost}</span>
          </label>`).join("")}
      </div>
    </div>
  ` : `<p style="font-size:16px">Producto de repostería listo para recoger.</p>`;

  $("#custBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="custTitle">${p.name}</h2>
      <button type="button" class="dlg-close" data-close-dlg="customizerDialog" aria-label="Cerrar">×</button>
    </div>
    <div class="cust-hero">
      <span class="marcatextos cust-price-burst">$${unit}</span>
      <div class="cust-hero-img">${renderProductArt(p, 84)}</div>
      <div>
        <span style="font-size:13px;font-weight:700;color:var(--c-verde)">${p.cat}</span>
        <p style="font-size:14px;margin-top:4px;line-height:1.4">${p.desc}</p>
      </div>
      <div>${renderMascota(p.mascota, "feliz", { size: 42 })}</div>
    </div>
    ${optsMarkup}
    <div class="qty-bar">
      <div class="stepper">
        <button type="button" id="custMinus" aria-label="Disminuir cantidad">−</button>
        <strong style="min-width:20px;text-align:center">${c.qty}</strong>
        <button type="button" id="custPlus" aria-label="Aumentar cantidad">+</button>
      </div>
      <button type="button" class="btn-primary" style="flex:1" id="custAddBtn">
        Agregar · $${total}
      </button>
    </div>
  `;
}

function initCustomizerEvents() {
  $("#custBody").addEventListener("click", (e) => {
    const optBtn = e.target.closest("[data-opt]");
    if (optBtn) {
      state.cust[optBtn.dataset.opt] = optBtn.dataset.val;
      renderCustomizer();
      return;
    }
    if (e.target.id === "custMinus" && state.cust.qty > 1) {
      state.cust.qty--;
      renderCustomizer();
    } else if (e.target.id === "custPlus") {
      state.cust.qty++;
      renderCustomizer();
    } else if (e.target.id === "custAddBtn") {
      const c = state.cust;
      const p = productById(c.productId);
      state.cart.push({
        uid: `item-${Date.now()}`,
        productId: c.productId,
        size: c.size,
        milk: c.milk,
        sweet: c.sweet,
        extras: [...c.extras],
        qty: c.qty
      });
      updateBadges();
      $("#customizerDialog").close();
      pushToast("Agregado al carrito", `${c.qty} × ${p.name}`, p.mascota);
    }
  });
  $("#custBody").addEventListener("change", (e) => {
    if (e.target.dataset.extra) {
      const id = e.target.dataset.extra;
      if (e.target.checked) state.cust.extras.add(id);
      else state.cust.extras.delete(id);
      renderCustomizer();
    }
  });
}

// ==================== CARRITO Y CHECKOUT DESLIZABLE ====================
function calcCartSummary() {
  const subtotal = state.cart.reduce((s, item) => s + calcUnitPrice(item) * item.qty, 0);
  let discount = 0;
  if (state.appliedCoupon && subtotal > 0) {
    discount = state.appliedCoupon.type === "percent"
      ? Math.round((subtotal * state.appliedCoupon.value) / 100)
      : Math.min(subtotal, state.appliedCoupon.value);
  }
  return { subtotal, discount, total: Math.max(0, subtotal - discount) };
}

function renderCartView() {
  const host = $("#cartContent");
  if (state.cart.length === 0) {
    host.innerHTML = `
      <div class="pad" style="text-align:center;padding-top:32px;display:flex;flex-direction:column;align-items:center;gap:12px">
        ${renderMascota("hielito", "pensando", { size: 80 })}
        <p style="font-size:18px;font-weight:800">Tu carrito está vacío</p>
        <p style="font-size:16px">Elige una bebida desde el Armador o el Menú completo.</p>
        <button type="button" class="btn-primary" id="emptyGoMenuBtn">Explorar menú</button>
      </div>`;
    $("#emptyGoMenuBtn").addEventListener("click", () => navigate("menu"));
    return;
  }

  const branch = branchById(state.branchId);
  const slots = [];
  for (let h = branch.open; h < branch.close; h += 1) {
    if (h >= 12) slots.push(`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`);
  }
  const visibleSlots = slots.slice(0, 6);
  if (!visibleSlots.includes(state.scheduledHour)) state.scheduledHour = visibleSlots[0];

  const { subtotal, discount, total } = calcCartSummary();

  const itemsHtml = state.cart.map((item) => {
    const p = productById(item.productId);
    const linePrice = calcUnitPrice(item) * item.qty;
    const subText = p.customizable
      ? `${OPTIONS.size.find((x) => x.id === item.size).label}, ${OPTIONS.milk.find((x) => x.id === item.milk).label}` +
        (item.extras.length ? ` + ${item.extras.length} extra` : "")
      : p.cat;
    return `
      <div class="citem">
        <div class="c-art">${renderProductArt(p, 42)}</div>
        <div class="c-info">
          <b>${p.name}</b>
          <span>${subText}</span>
          <div class="c-qty">
            <button type="button" data-cqty="-1" data-uid="${item.uid}" aria-label="Restar">−</button>
            <span>${item.qty}</span>
            <button type="button" data-cqty="1" data-uid="${item.uid}" aria-label="Sumar">+</button>
          </div>
        </div>
        <span class="c-price">$${linePrice}</span>
      </div>`;
  }).join("");

  host.innerHTML = `
    <div class="cart-dark">${itemsHtml}</div>
    <div class="pad">
      <div class="coupon-card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="font-size:14px">Cupón de descuento (RN-01)</strong>
          <button type="button" class="link" id="cartScanQrBtn">Escanear QR</button>
        </div>
        <div class="coupon-row">
          <input type="text" id="couponInput" placeholder="BIENVENIDA o OTONO2X1" value="${state.appliedCoupon ? state.appliedCoupon.code : ""}">
          <button type="button" class="btn-primary" id="applyCouponBtn">Aplicar</button>
        </div>
        <p id="couponFeedback" style="font-size:14px;font-weight:600;color:${state.appliedCoupon ? "var(--c-verde)" : "var(--c-tostado)"}">
          ${state.appliedCoupon ? `Aplicado: ${state.appliedCoupon.label}` : "Prueba BIENVENIDA, OTONO2X1 o VENCIDO25"}
        </p>
      </div>

      <div class="totals-card">
        <div class="totals-line"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
        <div class="totals-line disc"><span>Descuento</span><strong>−$${discount.toFixed(2)}</strong></div>
        <div class="totals-line grand"><span>Total</span><span class="marcatextos">$${total.toFixed(2)} MXN</span></div>
      </div>

      <div class="checkout-block">
        <strong style="font-size:16px">Recoger en ${branch.name} (${branch.hours})</strong>
        <div class="seg">
          <button type="button" data-mode="now" aria-pressed="${state.checkoutMode === "now"}">
            Ahora<small>Listo en 10 min</small>
          </button>
          <button type="button" data-mode="scheduled" aria-pressed="${state.checkoutMode === "scheduled"}">
            Programado<small>Dentro de horario</small>
          </button>
        </div>
        ${state.checkoutMode === "scheduled" ? `
          <div class="slots">
            ${visibleSlots.map((sl) => `<button type="button" class="slot-btn" data-slot="${sl}" aria-pressed="${state.scheduledHour === sl}">${sl}</button>`).join("")}
          </div>
          <p style="font-size:14px">Solo horarios entre ${branch.open}:00 y ${branch.close}:00 (RN-03).</p>
        ` : ""}
        <strong style="font-size:14px">Pago al recoger en mostrador</strong>
        <div class="seg">
          <button type="button" data-pay="tarjeta" aria-pressed="${state.payMethod === "tarjeta"}">Tarjeta en mostrador</button>
          <button type="button" data-pay="efectivo" aria-pressed="${state.payMethod === "efectivo"}">Efectivo</button>
        </div>
        <div class="slide-checkout" id="slideCheckout" data-total="${total.toFixed(2)}">
          <div class="slide-fill" id="slideFill"></div>
          <button type="button" class="slide-knob" id="slideKnob" aria-label="Desliza a la derecha o presiona Enter para confirmar pedido de ${total.toFixed(2)} pesos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
          <span class="slide-label" id="slideLabel">Desliza para confirmar · $${total.toFixed(2)}</span>
          <span class="slide-chevrons" aria-hidden="true">›››</span>
        </div>
      </div>
    </div>`;
  bindCheckoutSlider();
}

function tryApplyCoupon(raw) {
  const code = raw.trim().toUpperCase();
  const fb = $("#couponFeedback");
  if (!code) {
    state.appliedCoupon = null;
    if (state.view === "cart") renderCartView();
    return false;
  }
  const c = COUPONS[code];
  if (!c) {
    if (fb) { fb.style.color = "var(--c-cereza)"; fb.textContent = "Cupón no encontrado. Revisa el código."; }
    return false;
  }
  if (!c.active) {
    if (fb) { fb.style.color = "var(--c-cereza)"; fb.textContent = `El cupón ${code} ya venció o está desactivado.`; }
    return false;
  }
  if (state.usedCoupons.has(code)) {
    if (fb) { fb.style.color = "var(--c-cereza)"; fb.textContent = `Ya usaste el cupón ${code} en un pedido anterior.`; }
    return false;
  }
  state.appliedCoupon = c;
  if (state.view === "cart") renderCartView();
  pushToast("Cupón aplicado", `${c.code}: ${c.label}`, "espuma");
  return true;
}

function initCartEvents() {
  $("#cartContent").addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-cqty]");
    if (qtyBtn) {
      const uid = qtyBtn.dataset.uid;
      const delta = Number(qtyBtn.dataset.cqty);
      const item = state.cart.find((x) => x.uid === uid);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) state.cart = state.cart.filter((x) => x.uid !== uid);
      updateBadges();
      renderCartView();
      return;
    }
    if (e.target.id === "applyCouponBtn") {
      tryApplyCoupon($("#couponInput").value);
      return;
    }
    if (e.target.id === "cartScanQrBtn") {
      openQrModal();
      return;
    }
    const modeBtn = e.target.closest("[data-mode]");
    if (modeBtn) { state.checkoutMode = modeBtn.dataset.mode; renderCartView(); return; }
    const slotBtn = e.target.closest("[data-slot]");
    if (slotBtn) { state.scheduledHour = slotBtn.dataset.slot; renderCartView(); return; }
    const payBtn = e.target.closest("[data-pay]");
    if (payBtn) { state.payMethod = payBtn.dataset.pay; renderCartView(); return; }
  });
}

function confirmCheckoutOrder() {
  if (!state.user) {
    openAuthModal("Inicia sesión para confirmar tu pedido.");
    return false;
  }
  const { total } = calcCartSummary();
  if (state.appliedCoupon) state.usedCoupons.add(state.appliedCoupon.code);
  state.activeOrder = {
    id: Math.floor(1050 + Math.random() * 8900),
    code: String(Math.floor(1000 + Math.random() * 8999)),
    branchId: state.branchId,
    statusIdx: 0,
    items: state.cart.map((x) => ({ ...x, unit: calcUnitPrice(x) })),
    total,
    mode: state.checkoutMode,
    scheduledHour: state.scheduledHour,
    payMethod: state.payMethod,
    rated: false
  };
  state.cart = [];
  state.appliedCoupon = null;
  updateBadges();
  renderHomeOrderTimeline();
  pushToast(`Pedido #${state.activeOrder.id} recibido`, ORDER_META[0].copy, "grano");
  navigate("orders");
  return true;
}

function bindCheckoutSlider() {
  const track = $("#slideCheckout");
  const knob = $("#slideKnob");
  const fill = $("#slideFill");
  const label = $("#slideLabel");
  if (!track || !knob) return;

  let startX = null;
  let maxDist = 0;
  let currentX = 0;

  const setPos = (x) => {
    currentX = Math.max(0, Math.min(maxDist, x));
    knob.style.transform = `translateX(${currentX}px)`;
    fill.style.width = `${60 + currentX}px`;
  };

  const reset = () => {
    knob.classList.remove("dragging");
    track.classList.remove("confirmed");
    setPos(0);
    label.textContent = `Desliza para confirmar · $${track.dataset.total}`;
  };

  const complete = () => {
    knob.classList.remove("dragging");
    track.classList.add("confirmed");
    setPos(maxDist);
    label.textContent = "¡Pedido confirmado!";
    setTimeout(() => {
      if (!confirmCheckoutOrder()) reset();
    }, 160);
  };

  knob.addEventListener("pointerdown", (e) => {
    maxDist = track.clientWidth - knob.offsetWidth - 8;
    startX = e.clientX - currentX;
    knob.classList.add("dragging");
    knob.setPointerCapture(e.pointerId);
  });

  knob.addEventListener("pointermove", (e) => {
    if (startX === null) return;
    setPos(e.clientX - startX);
  });

  const release = () => {
    if (startX === null) return;
    startX = null;
    if (maxDist > 0 && currentX >= maxDist * 0.72) complete();
    else reset();
  };

  knob.addEventListener("pointerup", release);
  knob.addEventListener("pointercancel", release);
  knob.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      maxDist = track.clientWidth - knob.offsetWidth - 8;
      complete();
    }
  });
}

// ==================== SEGUIMIENTO Y CALIFICACIÓN (RF-09, RF-10, RF-11) ====================
function renderOrdersView() {
  const host = $("#ordersContent");
  const o = state.activeOrder;
  if (!o) {
    host.innerHTML = `
      <div class="track-card" style="display:flex;flex-direction:column;align-items:center;gap:12px">
        ${renderMascota("hielito", "pensando", { size: 78 })}
        <p style="font-size:18px;font-weight:800">No tienes pedidos activos</p>
        <p style="font-size:16px">Arma tu bebida y desliza en el carrito para seguir tu pedido.</p>
        <button type="button" class="btn-primary full" id="ordersToMenuBtn">Ir al menú</button>
      </div>`;
    $("#ordersToMenuBtn").addEventListener("click", () => navigate("menu"));
    return;
  }

  const branch = branchById(o.branchId);
  const curMeta = ORDER_META[o.statusIdx];
  const digits = o.code.split("").map((d) => `<span>${d}</span>`).join("");

  const stepsHtml = ORDER_META.map((m, i) => {
    const cls = i < o.statusIdx ? "done" : i === o.statusIdx ? "now" : "";
    const mark = i < o.statusIdx ? "✓" : i === o.statusIdx ? "•" : "";
    return `
      <div class="step ${cls}">
        <span class="step-dot">${mark}</span>
        <div><b>${m.label}</b><span>${i <= o.statusIdx ? "Listo" : "Pendiente"}</span></div>
      </div>`;
  }).join("");

  const nextMeta = ORDER_META[o.statusIdx + 1];
  const actionBtn = o.statusIdx < 3
    ? `<button type="button" class="btn-primary full" id="advanceOrderBtn">Avanzar estado: ${nextMeta.label}</button>`
    : o.rated
      ? `<p class="msg-ok">Tu calificación ya quedó registrada (RN-05).</p>`
      : `<button type="button" class="btn-accent full" id="openRatingBtn">Calificar pedido y bebidas</button>`;

  host.innerHTML = `
    <div class="track-card">
      <div style="display:flex;justify-content:center;margin-bottom:8px">
        ${renderMascota(curMeta.mascota, "feliz", { size: 72, label: curMeta.label })}
      </div>
      <span class="insignia-estado ${curMeta.key}">
        ${stateIconSvg(curMeta.key)}
        <span>${curMeta.label}</span>
      </span>
      <h2 style="font-family:var(--font-display);font-size:24px;margin-top:8px" aria-live="polite">Pedido #${o.id} · "${curMeta.copy}"</h2>
      <p style="font-size:14px;margin-top:4px">
        ${branch.name} · ${o.mode === "now" ? "Recoger ahora" : `Programado ${o.scheduledHour}`} · Pago: ${o.payMethod}
      </p>
      <div class="code-digits">${digits}</div>
      <div class="steps-grid">${stepsHtml}</div>
      ${actionBtn}
    </div>`;
}

function initOrderEvents() {
  $("#ordersContent").addEventListener("click", (e) => {
    if (e.target.id === "advanceOrderBtn" && state.activeOrder && state.activeOrder.statusIdx < 3) {
      state.activeOrder.statusIdx++;
      const m = ORDER_META[state.activeOrder.statusIdx];
      updateBadges();
      renderHomeOrderTimeline();
      pushToast(`Pedido #${state.activeOrder.id}: ${m.label}`, m.copy, m.mascota);
      renderOrdersView();
    } else if (e.target.id === "openRatingBtn") {
      openRatingModal();
    }
  });
}

function openRatingModal() {
  const o = state.activeOrder;
  if (!o || o.statusIdx !== 3 || o.rated) return;
  let stars = 5;
  const draw = () => {
    $("#ratingBody").innerHTML = `
      <div class="dlg-head">
        <h2 id="ratingTitle">Califica tu pedido #${o.id}</h2>
        <button type="button" class="dlg-close" data-close-dlg="ratingDialog" aria-label="Cerrar">×</button>
      </div>
      <div style="display:flex;justify-content:center;gap:6px">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" style="min-width:44px;min-height:44px;background:none;border:none;font-size:32px;color:${n <= stars ? "var(--c-miel)" : "var(--c-menta)"}" aria-label="${n} estrellas">★</button>`).join("")}
      </div>
      <div class="form-field">
        <label for="rateComment">Comentario corto (máx. 140 caracteres)</label>
        <textarea id="rateComment" maxlength="140" rows="3" placeholder="¿Qué tal estuvo tu café y la entrega?"></textarea>
      </div>
      <button type="button" class="btn-primary full" id="submitRatingBtn">Enviar calificación</button>`;
  };
  draw();
  $("#ratingBody").onclick = (e) => {
    if (e.target.dataset.star) {
      stars = Number(e.target.dataset.star);
      draw();
    } else if (e.target.id === "submitRatingBtn") {
      o.rated = true;
      $("#ratingDialog").close();
      pushToast("Calificación guardada", `Gracias por tus ${stars} estrellas.`, "croissant");
      renderOrdersView();
    }
  };
  $("#ratingDialog").showModal();
}

// ==================== AUTH & PERFIL (RF-01, RF-22) ====================
function syncAuthUI() {
  const btn = $("#homeAuthBtn");
  const label = $("#homeAuthLabel");
  const av = $("#menuAvatarBtn");
  if (state.user) {
    const initials = state.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    label.textContent = state.user.name.split(" ")[0];
    btn.classList.add("signed");
    av.textContent = initials;
  } else {
    label.textContent = "Iniciar sesión";
    btn.classList.remove("signed");
    av.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>`;
  }
}

function openAuthModal(subtitle = "Pide en la app y ahórrate la fila.") {
  let mode = "login";
  const draw = (err = "") => {
    $("#authBody").innerHTML = `
      <div class="dlg-head">
        <h2 id="authTitle">${mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
        <button type="button" class="dlg-close" data-close-dlg="authDialog" aria-label="Cerrar">×</button>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        ${renderMascota("grano", err ? "triste" : "feliz", { size: 48 })}
        <p style="font-size:15px">${subtitle}</p>
      </div>
      <form id="authForm" style="display:flex;flex-direction:column;gap:10px" novalidate>
        ${mode === "register" ? `
          <div class="form-field"><label for="authName">Nombre completo</label><input id="authName" required placeholder="Ricardo Martínez"></div>
          <div class="form-field"><label for="authPhone">Teléfono</label><input id="authPhone" type="tel" required placeholder="653 123 4567"></div>
        ` : ""}
        <div class="form-field"><label for="authEmail">Correo electrónico</label><input id="authEmail" type="email" required value="${mode === "login" ? "ricardo@beancraft.mx" : ""}" placeholder="correo@ejemplo.com"></div>
        <div class="form-field"><label for="authPass">Contraseña (mín. 6 caracteres)</label><input id="authPass" type="password" required value="${mode === "login" ? "123456" : ""}"></div>
        ${err ? `<p class="msg-err">${err}</p>` : ""}
        <button type="submit" class="btn-primary full">${mode === "login" ? "Entrar" : "Registrarme"}</button>
      </form>
      <button type="button" class="btn-secondary full" id="switchAuthModeBtn">
        ${mode === "login" ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta · Iniciar sesión"}
      </button>`;
  };
  draw();
  $("#authBody").onclick = (e) => {
    if (e.target.id === "switchAuthModeBtn") {
      mode = mode === "login" ? "register" : "login";
      draw();
    }
  };
  $("#authBody").onsubmit = (e) => {
    e.preventDefault();
    const email = $("#authEmail").value.trim().toLowerCase();
    const pass = $("#authPass").value;
    if (!email) {
      draw("Falta tu correo. Escríbelo para continuar.");
      return;
    }
    if (!email.includes("@") || pass.length < 6) {
      draw("Revisa tu correo y usa una contraseña de al menos 6 caracteres.");
      return;
    }
    if (mode === "register") {
      if (state.registeredEmails.has(email)) {
        draw("Ese correo ya existe. Inicia sesión para continuar.");
        return;
      }
      const name = $("#authName").value.trim() || "Cliente BeanCraft";
      const phone = $("#authPhone").value.trim() || "653 000 0000";
      state.registeredEmails.add(email);
      state.user = { name, email, phone, password: pass };
    } else {
      state.user = { name: "Ricardo Martínez", email, phone: "653 123 4567", password: pass };
    }
    syncAuthUI();
    $("#authDialog").close();
    pushToast("Sesión iniciada", `Bienvenido, ${state.user.name}.`, "taza");
  };
  $("#authDialog").showModal();
}

function renderProfileView() {
  const host = $("#profileContent");
  if (!state.user) {
    host.innerHTML = `
      <div class="pad" style="padding-top:30px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px">
        ${renderMascota("taza", "guino", { size: 78 })}
        <h1 class="titulo-mixto" style="font-size:26px">Inicia sesión en <em>BeanCraft</em></h1>
        <p style="font-size:16px">Guarda tus bebidas favoritas, consulta pedidos y edita tu perfil.</p>
        <button type="button" class="btn-primary full" id="profLoginBtn">Iniciar sesión o registrarme</button>
        <button type="button" class="btn-secondary full" data-nav="design">Ver Guía viva /design</button>
      </div>`;
    $("#profLoginBtn").addEventListener("click", () => openAuthModal());
    return;
  }

  const initials = state.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  host.innerHTML = `
    <div class="prof-top">
      <div class="topbar">
        <button type="button" class="rbtn" data-nav="home" aria-label="Volver">←</button>
        <h1 class="titulo-mixto t-center" style="font-size:22px;color:var(--c-espuma)">Mi <em>perfil</em></h1>
        <div style="width:44px"></div>
      </div>
      <div class="prof-id">
        <div class="avatar lg">${initials}</div>
        <div>
          <h2>${state.user.name}</h2>
          <p>${state.user.email}</p>
          <p>${state.user.phone}</p>
        </div>
      </div>
    </div>
    <form class="prof-list" id="profileForm">
      <div class="form-field"><label for="profName">Nombre</label><input id="profName" value="${state.user.name}"></div>
      <div class="form-field"><label for="profPhone">Teléfono</label><input id="profPhone" value="${state.user.phone}"></div>
      <div class="form-field"><label for="profNewPass">Nueva contraseña (opcional)</label><input id="profNewPass" type="password" placeholder="Dejar vacío para conservar"></div>
      <button type="submit" class="btn-primary full">Guardar cambios (RF-22)</button>
      <button type="button" class="btn-secondary full" data-nav="design">Ver Guía viva /design</button>
      <button type="button" class="btn-secondary full" id="logoutBtn">Cerrar sesión</button>
    </form>`;

  $("#profileForm").onsubmit = (e) => {
    e.preventDefault();
    state.user.name = $("#profName").value.trim() || state.user.name;
    state.user.phone = $("#profPhone").value.trim() || state.user.phone;
    const np = $("#profNewPass").value;
    if (np.length >= 6) state.user.password = np;
    syncAuthUI();
    renderProfileView();
    pushToast("Perfil actualizado", "Tus datos quedaron guardados.", "taza");
  };
  $("#logoutBtn").onclick = () => {
    state.user = null;
    syncAuthUI();
    navigate("home");
    pushToast("Sesión cerrada", "Has salido de tu cuenta.", "grano");
  };
}

// ==================== GUÍA VIVA /design ====================
function renderDesignView() {
  const tokens = [
    ["Tostado", "var(--c-tostado)"],
    ["Verde", "var(--c-verde)"],
    ["Espuma", "var(--c-espuma)"],
    ["Menta", "var(--c-menta)"],
    ["Miel", "var(--c-miel)"],
    ["Fresa", "var(--c-fresa)"],
    ["Lila", "var(--c-lila)"],
    ["Limón", "var(--c-limon)"],
    ["Cereza", "var(--c-cereza)"],
    ["Blanco", "var(--c-blanco)"]
  ];

  $("#designContent").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:18px;padding-bottom:24px">
      <div>
        <h2 class="titulo-mixto" style="font-size:24px">Tokens de <em>color</em></h2>
        <div class="design-grid">
          ${tokens.map(([name, tok]) => `
            <div class="swatch-card">
              <span class="swatch-chip" style="background:${tok}"></span>
              <div><strong style="font-size:14px">${name}</strong><small style="display:block;font-size:13px">${tok.replace("var(", "").replace(")", "")}</small></div>
            </div>`).join("")}
        </div>
      </div>

      <div>
        <h2 class="titulo-mixto" style="font-size:24px">Insignias de <em>estado</em></h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${[...ORDER_META, { key: "cancelado", label: "Cancelado" }].map((st) => `
            <span class="insignia-estado ${st.key}">${stateIconSvg(st.key)}<span>${st.label}</span></span>
          `).join("")}
        </div>
      </div>

      <div>
        <h2 class="titulo-mixto" style="font-size:24px">Las 5 <em>Mascotas</em> SVG</h2>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          ${MASCOTA_ESTADOS.map((m) => `<button type="button" class="chip" aria-pressed="${state.designMood === m}" data-mood="${m}">${m === "guino" ? "guiño" : m}</button>`).join("")}
        </div>
        <div class="mascota-gallery">
          ${MASCOTAS_INFO.map((m, idx) => `
            <article class="mascota-card">
              ${renderMascota(m.id, state.designMood, { size: 74, holo: idx === 2, label: `${m.nombre} ${state.designMood}` })}
              <strong style="font-family:var(--font-display);font-size:16px">${m.nombre}</strong>
              <p style="font-size:13px">${m.base}</p>
            </article>`).join("")}
        </div>
      </div>
    </div>`;

  $("#designContent").onclick = (e) => {
    const moodBtn = e.target.closest("[data-mood]");
    if (moodBtn) {
      state.designMood = moodBtn.dataset.mood;
      renderDesignView();
    }
  };
}

// ==================== MODALES SUCURSALES, QR, NOTIFICACIONES ====================
function openBranchModal() {
  $("#branchBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="branchTitle">Elige tu sucursal</h2>
      <button type="button" class="dlg-close" data-close-dlg="branchDialog" aria-label="Cerrar">×</button>
    </div>
    ${BRANCHES.map((b) => `
      <button type="button" class="extra-item" data-branch-pick="${b.id}" style="text-align:left;${b.id === state.branchId ? "background:var(--c-menta)" : ""}">
        <div>
          <strong style="display:block;font-size:15px">${b.name} ${b.suggested ? "· Más cercana" : ""}</strong>
          <span style="font-size:13px">${b.addr} · ${b.hours}</span>
        </div>
        <span class="branch-status ${b.openNow ? "open" : "closed"}">${b.openNow ? "Abierta" : "Cerrada"}</span>
      </button>`).join("")}`;
  $("#branchBody").onclick = (e) => {
    const pick = e.target.closest("[data-branch-pick]");
    if (!pick) return;
    state.branchId = pick.dataset.branchPick;
    updateBranchHeader();
    renderBranchesSection();
    $("#branchDialog").close();
    if (state.view === "cart") renderCartView();
  };
  $("#branchDialog").showModal();
}

function openQrModal() {
  $("#qrBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="qrTitle">Escanear cupón QR</h2>
      <button type="button" class="dlg-close" data-close-dlg="qrDialog" aria-label="Cerrar">×</button>
    </div>
    <div class="qr-frame">
      <div class="qr-box">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="var(--c-espuma)" stroke-width="1.9"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>
      </div>
      <span style="font-size:14px">Simulador de lector QR · Elige un cupón</span>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" class="ls-chip" data-qr-code="BIENVENIDA">QR: BIENVENIDA (-$30)</button>
      <button type="button" class="ls-chip" data-qr-code="OTONO2X1">QR: OTONO2X1 (-20%)</button>
      <button type="button" class="ls-chip" data-qr-code="VENCIDO25">QR: VENCIDO25 (vencido)</button>
    </div>
    <p id="qrErrMsg" class="msg-err" hidden></p>`;
  $("#qrBody").onclick = (e) => {
    const btn = e.target.closest("[data-qr-code]");
    if (!btn) return;
    const code = btn.dataset.qrCode;
    const c = COUPONS[code];
    if (!c || !c.active) {
      $("#qrErrMsg").hidden = false;
      $("#qrErrMsg").textContent = `El cupón ${code} ya venció o está desactivado (RN-01).`;
      return;
    }
    state.appliedCoupon = c;
    $("#qrDialog").close();
    navigate("cart");
    pushToast("Cupón escaneado", `${c.code}: ${c.label}`, "espuma");
  };
  $("#qrDialog").showModal();
}

function openNotifModal() {
  $("#notifDot").hidden = true;
  $("#notifBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="notifTitle">Notificaciones</h2>
      <button type="button" class="dlg-close" data-close-dlg="notifDialog" aria-label="Cerrar">×</button>
    </div>
    ${state.notifications.map((n) => `
      <div style="padding:12px;border-radius:var(--r-campo);background:var(--c-espuma);border:var(--borde)">
        <div style="display:flex;justify-content:space-between">
          <strong style="font-size:15px">${n.title}</strong>
          <span style="font-size:13px">${n.time}</span>
        </div>
        <p style="font-size:14px;margin-top:4px">${n.msg}</p>
      </div>`).join("")}`;
  $("#notifDialog").showModal();
}

// ==================== DIALOG LIGHT-DISMISS FALLBACK Y ARRANQUE ====================
function initDialogs() {
  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close-dlg]");
    if (closeBtn) document.getElementById(closeBtn.dataset.closeDlg).close();
  });

  document.querySelectorAll("dialog").forEach((dlg) => {
    dlg.addEventListener("close", () => { dlg.returnValue = ""; });
  });

  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener("pointerup", (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
    }
  }
}

function init() {
  initSplash();
  initHero();
  renderPromos();
  initMenuSheet();
  initQuiz();
  renderHomeOrderTimeline();
  initBranchesSection();
  $("#footerMascot").innerHTML = renderMascota("taza", "guino", { size: 60 });

  initCrystalMenu();
  initCustomizerEvents();
  initCartEvents();
  initOrderEvents();
  initDialogs();
  syncAuthUI();
  updateBranchHeader();
  updateBadges();

  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-nav]");
    if (navBtn) navigate(navBtn.dataset.nav);
  });

  $("#homeAuthBtn").addEventListener("click", () => {
    if (state.user) navigate("profile");
    else openAuthModal();
  });
  $("#menuAvatarBtn").addEventListener("click", () => {
    if (state.user) navigate("profile");
    else openAuthModal();
  });
  $("#openBranchBtn").addEventListener("click", openBranchModal);
  $("#openQrBtn").addEventListener("click", openQrModal);
  $("#fabQrBtn").addEventListener("click", openQrModal);
  $("#homeNotifBtn").addEventListener("click", openNotifModal);
  $("#ordersNotifBtn").addEventListener("click", openNotifModal);
  $("#closeToastBtn").addEventListener("click", () => { $("#pushToast").hidden = true; });

  const initialView = new URLSearchParams(location.search).get("view");
  if (initialView && ["home", "menu", "cart", "orders", "profile", "design"].includes(initialView)) {
    $("#splashScreen").classList.add("done");
    navigate(initialView);
  }
}

init();
