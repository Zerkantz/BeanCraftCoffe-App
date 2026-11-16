// BeanCraft Coffee — App Móvil Interactiva (ES Module)
// Implementa flujos RF-01 a RF-11, RF-22 y reglas RN-01 a RN-05 del SRS v1.3

const cupSvg = (sleeve, lid = "#3A2219", iced = false, size = 100) => {
  const h = Math.round(size * 1.32);
  const body = iced ? "#EAF4FB" : "#F7F3F0";
  const straw = iced
    ? `<rect x="70" y="-6" width="7" height="34" rx="3" fill="#2A1810" transform="rotate(12 73 10)"/>`
    : "";
  return `
    <svg width="${size}" height="${h}" viewBox="0 0 120 160" aria-hidden="true">
      <ellipse cx="60" cy="154" rx="38" ry="5" fill="#000" opacity=".12"/>
      ${straw}
      <path d="M16 34h88l-10 116a4 4 0 0 1-4 3.6H30a4 4 0 0 1-4-3.6z" fill="${body}"/>
      <path d="M16 34h14l9 119.6H30a4 4 0 0 1-4-3.6z" fill="#FFFFFF" opacity=".72"/>
      <path d="M19.8 64h80.4l-5 60H24.8z" fill="${sleeve}"/>
      <path d="M19.8 64h16l3.5 60H24.8z" fill="#FFFFFF" opacity=".18"/>
      <circle cx="60" cy="94" r="17" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>
      <ellipse cx="60" cy="94" rx="6.5" ry="9.5" transform="rotate(32 60 94)" fill="#FFFFFF"/>
      <path d="M64.5 86c-4.2 2-2.4 6.1-4.8 8.5-1.6 1.6-3.8 2-3.9 5.7" fill="none" stroke="${sleeve}" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="10" y="22" width="100" height="14" rx="7" fill="${lid}"/>
      <path d="M22 22l5-12a4 4 0 0 1 3.7-2.5h58.6A4 4 0 0 1 93 10l5 12z" fill="${lid}"/>
    </svg>`;
};

const conchaSvg = (top = "#5A3324", size = 96) => {
  const h = Math.round(size * 0.8);
  const lines = Array.from({ length: 7 }, (_, i) =>
    `<path d="M${18 + i * 12} ${38 - Math.abs(3 - i) * 4}c4 6 4 14 0 22" fill="none" stroke="#3B1F15" stroke-opacity=".35" stroke-width="2"/>`
  ).join("");
  return `
    <svg width="${size}" height="${h}" viewBox="0 0 110 88" aria-hidden="true">
      <ellipse cx="55" cy="80" rx="42" ry="5" fill="#000" opacity=".12"/>
      <path d="M10 62c0-24 20-42 45-42s45 18 45 42c0 9-8 14-45 14S10 71 10 62z" fill="#E9B97E"/>
      <path d="M14 56c0-20 18-34 41-34s41 14 41 34c-10 5-24 7-41 7s-31-2-41-7z" fill="${top}"/>
      ${lines}
    </svg>`;
};

const crystalFacets = (glow) => `
  <svg class="crystal-svg" viewBox="0 0 160 220" preserveAspectRatio="none" aria-hidden="true">
    <polygon points="0,0 94,0 44,82 0,56" fill="#FFFFFF" fill-opacity="0.34"/>
    <polygon points="94,0 160,0 160,72 108,96 44,82" fill="${glow}" fill-opacity="0.20"/>
    <polygon points="0,56 44,82 18,148 0,132" fill="#FFFFFF" fill-opacity="0.18"/>
    <polygon points="44,82 108,96 76,160 18,148" fill="#FFFFFF" fill-opacity="0.42"/>
    <polygon points="108,96 160,72 160,154 76,160" fill="${glow}" fill-opacity="0.24"/>
    <polygon points="0,132 76,160 160,154 160,220 0,220" fill="#FFFFFF" fill-opacity="0.24"/>
    <polyline points="0,56 44,82 94,0 M44,82 108,96 160,72 M44,82 18,148 76,160 108,96 M76,160 160,154"
      fill="none" stroke="#FFFFFF" stroke-opacity="0.62" stroke-width="1"/>
  </svg>`;

const PRODUCTS = [
  {
    id: "frappe_supremo",
    name: "Frappé Supremo",
    ghost: "SUPREMO",
    cat: "Frappés",
    menuGroup: "Bebidas frías",
    price: 65,
    rate: 5.0,
    desc: "Espresso doble frappeado con crema batida y caramelo de la casa.",
    img: "assets/frappe_helado.png",
    c1: "rgba(234,88,12,.30)",
    c2: "rgba(251,146,60,.10)",
    glow: "#FB923C",
    tint: "rgba(200,16,46,.52)",
    customizable: true
  },
  {
    id: "refresher_duo",
    name: "Refresher Dúo",
    ghost: "REFRESHER",
    cat: "Bebidas frías",
    menuGroup: "Bebidas frías",
    price: 62,
    rate: 4.9,
    desc: "Infusión frutal de frutos rojos y moras azules con perlas explosivas.",
    img: "assets/refresher.png",
    c1: "rgba(225,29,72,.30)",
    c2: "rgba(251,113,133,.10)",
    glow: "#FB7185",
    tint: "rgba(225,29,72,.52)",
    customizable: true
  },
  {
    id: "frappe_beancraft",
    name: "Frappé BeanCraft",
    ghost: "BEANCRAFT",
    cat: "Frappés",
    menuGroup: "Bebidas frías",
    price: 58,
    rate: 4.9,
    desc: "Mezcla clásica de café de altura tostado oscuro con hielo frappeado.",
    img: "assets/frappe.png",
    c1: "rgba(180,83,9,.28)",
    c2: "rgba(245,158,11,.10)",
    glow: "#F59E0B",
    tint: "rgba(217,119,6,.50)",
    customizable: true
  },
  {
    id: "latte_caramelo",
    name: "Latte de caramelo",
    ghost: "CARAMELO",
    cat: "Cafés",
    menuGroup: "Cafés",
    price: 55,
    rate: 4.8,
    desc: "Espresso doble, leche vaporizada y caramelo artesanal.",
    sleeve: "#E07A2E",
    c1: "rgba(217,119,6,.28)",
    c2: "rgba(251,191,36,.10)",
    glow: "#FBBF24",
    tint: "rgba(224,122,46,.48)",
    customizable: true
  },
  {
    id: "cold_brew",
    name: "Cold Brew",
    ghost: "COLD BREW",
    cat: "Bebidas frías",
    menuGroup: "Bebidas frías",
    price: 57,
    rate: 4.6,
    desc: "Extracción en frío por 16 horas con notas de cacao tostado.",
    sleeve: "#2F7FC1",
    iced: true,
    c1: "rgba(2,132,199,.28)",
    c2: "rgba(56,189,248,.10)",
    glow: "#38BDF8",
    tint: "rgba(2,132,199,.48)",
    customizable: true
  },
  {
    id: "mocha_blanco",
    name: "Mocha blanco",
    cat: "Cafés",
    menuGroup: "Cafés",
    price: 62,
    rate: 4.7,
    desc: "Espresso suave fundido con chocolate blanco y espuma sedosa.",
    sleeve: "#8A2D4B",
    c1: "rgba(190,24,93,.28)",
    c2: "rgba(244,114,182,.10)",
    glow: "#F472B6",
    customizable: true
  },
  {
    id: "capuchino",
    name: "Capuchino clásico",
    cat: "Cafés",
    menuGroup: "Cafés",
    price: 49,
    rate: 4.9,
    desc: "Proporción perfecta de espresso, leche cremosa y cacao espolvoreado.",
    sleeve: "#C99312",
    c1: "rgba(202,138,4,.26)",
    c2: "rgba(250,204,21,.10)",
    glow: "#FACC15",
    customizable: true
  },
  {
    id: "matcha_latte",
    name: "Matcha latte",
    cat: "Bebidas frías",
    menuGroup: "Bebidas frías",
    price: 64,
    rate: 4.6,
    desc: "Matcha ceremonial batido en frío sobre leche cremosa.",
    sleeve: "#3E9A62",
    iced: true,
    c1: "rgba(5,150,105,.28)",
    c2: "rgba(52,211,153,.10)",
    glow: "#34D399",
    customizable: true
  },
  {
    id: "taro_frappe",
    name: "Frappé de taro",
    cat: "Frappés",
    menuGroup: "Bebidas frías",
    price: 68,
    rate: 4.5,
    desc: "Crema dulce de taro con base frappé y toque de vainilla.",
    sleeve: "#6A4FC9",
    iced: true,
    c1: "rgba(124,58,237,.28)",
    c2: "rgba(167,139,250,.10)",
    glow: "#A78BFA",
    customizable: true
  },
  {
    id: "concha_choco",
    name: "Concha de chocolate",
    cat: "Repostería",
    menuGroup: "Repostería",
    price: 35,
    rate: 4.9,
    desc: "Pan artesanal recién horneado con costra crujiente de cacao.",
    bakery: "#5A3324",
    c1: "rgba(146,64,14,.25)",
    c2: "rgba(217,119,6,.10)",
    glow: "#D97706",
    customizable: false
  },
  {
    id: "rol_canela",
    name: "Rol de canela",
    cat: "Repostería",
    menuGroup: "Repostería",
    price: 42,
    rate: 4.8,
    desc: "Masa hojaldrada tibia con canela molida y glaseado de queso.",
    bakery: "#8C4A27",
    c1: "rgba(180,83,9,.24)",
    c2: "rgba(251,191,36,.10)",
    glow: "#F59E0B",
    customizable: false
  }
];

const BRANCHES = [
  { id: "centro", name: "BeanCraft Centro", addr: "Av. Obregón y Calle 5, San Luis R.C.", dist: "0.8 km", open: 7, close: 22, hours: "07:00 – 22:00", suggested: true },
  { id: "obregon", name: "BeanCraft Kino", addr: "Calz. Constitución y Calle 22, San Luis R.C.", dist: "2.3 km", open: 8, close: 21, hours: "08:00 – 21:00", suggested: false },
  { id: "bosque", name: "BeanCraft Bosque", addr: "Av. Revolución #1420, San Luis R.C.", dist: "3.7 km", open: 7, close: 20, hours: "07:00 – 20:00", suggested: false }
];

const COUPONS = {
  BIENVENIDA: { code: "BIENVENIDA", type: "fixed", value: 30, label: "$30 MXN de descuento", active: true, expires: "2027-03-31" },
  OTONO2X1: { code: "OTONO2X1", type: "percent", value: 20, label: "20% de descuento temporada", active: true, expires: "2027-03-31" },
  CAFE15: { code: "CAFE15", type: "fixed", value: 15, label: "$15 MXN de descuento", active: true, expires: "2027-03-31" },
  VENCIDO25: { code: "VENCIDO25", type: "fixed", value: 25, label: "Cupón expirado", active: false, expires: "2025-12-31" }
};

// Precios de referencia SRS (Sección 3.3 / RN-02)
const OPTIONS = {
  size: [
    { id: "chico", label: "Chico", cost: 0 },
    { id: "mediano", label: "Mediano", cost: 10 },
    { id: "grande", label: "Grande", cost: 18 }
  ],
  milk: [
    { id: "entera", label: "Entera", cost: 0 },
    { id: "deslac", label: "Deslac.", cost: 0 },
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
    { id: "shot", label: "Shot de espresso", cost: 15 },
    { id: "crema", label: "Crema batida", cost: 8 },
    { id: "caramelo", label: "Caramelo extra", cost: 8 }
  ]
};

const SHEET_PAGES = [
  {
    id: "frappes",
    tab: "Frappés y Especiales",
    title: "FRAPPÉS HOUSE",
    sub: "Textura cremosa y café de altura",
    heroId: "frappe_supremo",
    listIds: ["frappe_supremo", "frappe_beancraft", "taro_frappe", "latte_caramelo", "mocha_blanco"],
    tileIds: ["frappe_supremo", "frappe_beancraft", "taro_frappe"]
  },
  {
    id: "cafes",
    tab: "Cafés Calientes",
    title: "CAFÉ BARRA",
    sub: "Espresso recién molido al momento",
    heroId: "latte_caramelo",
    listIds: ["latte_caramelo", "mocha_blanco", "capuchino", "frappe_beancraft"],
    tileIds: ["latte_caramelo", "mocha_blanco", "capuchino"]
  },
  {
    id: "frias",
    tab: "Bebidas Frías",
    title: "REFRESHER & COLD",
    sub: "Frutas, cold brew y matcha frío",
    heroId: "refresher_duo",
    listIds: ["refresher_duo", "cold_brew", "matcha_latte", "taro_frappe"],
    tileIds: ["refresher_duo", "cold_brew", "matcha_latte"]
  },
  {
    id: "reposteria",
    tab: "Repostería",
    title: "HORNO ARTESANAL",
    sub: "Recién horneado para tu café",
    heroId: "concha_choco",
    listIds: ["concha_choco", "rol_canela", "capuchino", "latte_caramelo"],
    tileIds: ["concha_choco", "rol_canela", "capuchino"]
  }
];

const HERO_IDS = ["frappe_supremo", "refresher_duo", "frappe_beancraft", "latte_caramelo", "cold_brew"];

// ==================== ESTADO GLOBAL ====================
const state = {
  view: "home",
  heroIdx: 0,
  sheetIdx: 0,
  menuCat: "Todo",
  menuQuery: "",
  menuFavOnly: false,
  favorites: new Set(["frappe_supremo", "refresher_duo"]),
  branchId: "centro",
  user: null, // { name, email, phone, password }
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
  checkoutMode: "now", // 'now' | 'scheduled'
  scheduledHour: "20:00",
  payMethod: "tarjeta", // 'tarjeta' | 'efectivo'
  activeOrder: null, // { id, code, branchId, statusIdx, items, total, mode, scheduledHour, payMethod, rated }
  notifications: [
    { id: 1, title: "Bienvenido a BeanCraft", msg: "Usa el código BIENVENIDA para $30 de descuento.", time: "hoy" }
  ],
  cust: null // { productId, size, milk, sweet, extras: Set, qty }
};

const ORDER_STATES = ["Recibido", "Preparando", "Listo para recoger", "Entregado"];

const $ = (sel, root = document) => root.querySelector(sel);
const productById = (id) => PRODUCTS.find((p) => p.id === id);
const branchById = (id) => BRANCHES.find((b) => b.id === id);

function renderProductArt(p, size = 100) {
  if (p.img) return `<img src="${p.img}" alt="${p.name}">`;
  if (p.bakery) return conchaSvg(p.bakery, size);
  return cupSvg(p.sleeve, "#3A2219", Boolean(p.iced), size);
}

// ==================== SPLASH ====================
function initSplash() {
  const splash = $("#splashScreen");
  const hide = () => splash.classList.add("done");
  $("#skipSplashBtn").addEventListener("click", hide);
  setTimeout(hide, 1400);
}

// ==================== NAVEGACIÓN ENTRE VISTAS ====================
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

// ==================== NOTIFICACIONES (RF-10) ====================
let toastTimer;
function pushToast(title, msg) {
  state.notifications.unshift({ id: Date.now(), title, msg, time: "ahora" });
  $("#notifDot").hidden = false;
  $("#toastTitle").textContent = title;
  $("#toastMsg").textContent = msg;
  const toast = $("#pushToast");
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}

// ==================== CARRUSEL HERO (ESTILO LUMA BOBA SHOP) ====================
function renderHero() {
  const total = HERO_IDS.length;
  const idx = (state.heroIdx + total) % total;
  state.heroIdx = idx;
  const prevIdx = (idx - 1 + total) % total;
  const nextIdx = (idx + 1) % total;

  const cur = productById(HERO_IDS[idx]);
  const prev = productById(HERO_IDS[prevIdx]);
  const next = productById(HERO_IDS[nextIdx]);

  $("#heroCarousel").style.setProperty("--tint", cur.tint || "rgba(200,16,46,.5)");
  $("#heroGhost").textContent = cur.ghost || cur.name.toUpperCase();
  $("#heroStage").setAttribute("aria-label", `${idx + 1} de ${total}`);
  $("#heroPrevCup").innerHTML = renderProductArt(prev, 92);
  $("#heroCenterCup").innerHTML = renderProductArt(cur, 128);
  $("#heroNextCup").innerHTML = renderProductArt(next, 92);
  $("#heroCount").textContent = `${String(idx + 1).padStart(2, "0")} — ${String(total).padStart(2, "0")}`;
  $("#heroEyebrow").textContent = `— ${cur.cat.toUpperCase()} · SAN LUIS R.C.`;
  $("#heroTitle").textContent = cur.name;
  $("#heroPrice").textContent = `$${cur.price}`;
  $("#heroDesc").textContent = cur.desc;

  $("#heroIndexList").innerHTML = HERO_IDS.map((id, i) => {
    const item = productById(id);
    const short = {
      frappe_supremo: "Supremo",
      refresher_duo: "Refresher",
      frappe_beancraft: "Frappé",
      latte_caramelo: "Latte",
      cold_brew: "Cold Brew"
    }[id] || item.name.split(" ")[0];
    return `<button type="button" role="tab" aria-selected="${i === idx}" data-hero-idx="${i}"><i>0${i + 1}</i> ${short}</button>`;
  }).join("");

  $("#heroLive").textContent = `${cur.name}, ${cur.price} pesos (${idx + 1} de ${total})`;
}

function initHero() {
  renderHero();
  $("#heroPrevBtn").addEventListener("click", () => { state.heroIdx--; renderHero(); });
  $("#heroNextBtn").addEventListener("click", () => { state.heroIdx++; renderHero(); });
  $("#heroPrevCup").addEventListener("click", () => { state.heroIdx--; renderHero(); });
  $("#heroNextCup").addEventListener("click", () => { state.heroIdx++; renderHero(); });
  $("#heroIndexList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hero-idx]");
    if (!btn) return;
    state.heroIdx = Number(btn.dataset.heroIdx);
    renderHero();
  });
  $("#heroOrderBtn").addEventListener("click", () => openCustomizer(HERO_IDS[state.heroIdx]));
  $("#heroMenuBtn").addEventListener("click", () => navigate("menu"));

  // Soporte táctil para deslizar carrusel
  let startX = null;
  const stage = $("#heroStage");
  stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 34) {
      state.heroIdx += dx < 0 ? 1 : -1;
      renderHero();
    }
  });
}

// ==================== HOJA DE MENÚ SELECCIONABLE (INICIO, ESTILO LUMA) ====================
function renderMenuSheetSection() {
  // Tabs
  $("#sheetTabs").innerHTML = SHEET_PAGES.map((pg, i) =>
    `<button type="button" class="ls-tab" role="tab" aria-selected="${i === state.sheetIdx}" data-sheet-idx="${i}">${pg.tab}</button>`
  ).join("");

  // Poster Sheets
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
      <article class="poster-sheet" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${SHEET_PAGES.length}">
        <div class="poster-top">
          <div>
            <h3 class="poster-cat">${pg.title}</h3>
            <p class="poster-sub">${pg.sub}</p>
            <div class="poster-list">${listHtml}</div>
          </div>
          <button type="button" class="poster-hero-cup" data-pick-id="${heroProd.id}" style="background:none;border:none" aria-label="Elegir ${heroProd.name}">
            ${renderProductArt(heroProd, 96)}
            <span>Toca para pedir</span>
          </button>
        </div>
        <div class="poster-bottom">${tilesHtml}</div>
      </article>`;
  }).join("");

  syncSheetControls();
}

function syncSheetControls() {
  const idx = state.sheetIdx;
  $("#sheetPageCount").textContent = `${String(idx + 1).padStart(2, "0")} / ${String(SHEET_PAGES.length).padStart(2, "0")}`;
  document.querySelectorAll("#sheetTabs .ls-tab").forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === idx));
    if (i === idx) tab.scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  const pg = SHEET_PAGES[idx];
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
  if (card) {
    track.scrollTo({ left: card.offsetLeft - 18, behavior: "smooth" });
  }
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

  // Click en cualquier bebida de la hoja o chips abre el personalizador (como Luma)
  $("#homeMenuSheetSection").addEventListener("click", (e) => {
    const pick = e.target.closest("[data-pick-id]");
    if (pick) openCustomizer(pick.dataset.pickId);
  });

  // Sincroniza índice al deslizar la hoja manualmente
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

// ==================== MÓDULO MENÚ (TARJETAS CRISTALINAS + BEBIDAS GRANDES) ====================
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
    $("#crystalMenuGrid").innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:36px 12px;color:var(--mut);font-weight:600">No hay productos con ese filtro.</p>`;
    return;
  }

  $("#crystalMenuGrid").innerHTML = filtered.map((p) => {
    const isFav = state.favorites.has(p.id);
    return `
      <article class="ccard" style="--c1:${p.c1};--c2:${p.c2};--cg:${p.glow}">
        ${crystalFacets(p.glow)}
        <div class="cc-top">
          <span class="cc-rate">★ ${p.rate.toFixed(1)}</span>
          <button type="button" class="cc-fav" data-fav-id="${p.id}" aria-pressed="${isFav}" aria-label="Favorito ${p.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>
          </button>
        </div>
        <button type="button" class="cc-stage" data-open-id="${p.id}" aria-label="Personalizar ${p.name}">
          ${renderProductArt(p, 114)}
        </button>
        <div class="cc-glass">
          <span class="cc-cat">${p.cat}</span>
          <h3 class="cc-name">${p.name}</h3>
          <div class="cc-foot">
            <span class="cc-price">$${p.price}</span>
            <button type="button" class="cc-add" data-open-id="${p.id}" aria-label="Agregar ${p.name}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
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
  if (!p.customizable) return p.price;
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
      <strong style="font-size:13px;display:block;margin-bottom:6px">Tamaño</strong>
      <div class="opt-grid">
        ${OPTIONS.size.map((o) => `<button type="button" class="opt-btn" data-opt="size" data-val="${o.id}" aria-pressed="${c.size === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:13px;display:block;margin-bottom:6px">Tipo de leche</strong>
      <div class="opt-grid four">
        ${OPTIONS.milk.map((o) => `<button type="button" class="opt-btn" data-opt="milk" data-val="${o.id}" aria-pressed="${c.milk === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:13px;display:block;margin-bottom:6px">Endulzante</strong>
      <div class="opt-grid four">
        ${OPTIONS.sweet.map((o) => `<button type="button" class="opt-btn" data-opt="sweet" data-val="${o.id}" aria-pressed="${c.sweet === o.id}"><b>${o.label}</b><span>+$${o.cost}</span></button>`).join("")}
      </div>
    </div>
    <div>
      <strong style="font-size:13px;display:block;margin-bottom:6px">Extras</strong>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${OPTIONS.extras.map((o) => `
          <label class="extra-item">
            <span style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" data-extra="${o.id}" ${c.extras.has(o.id) ? "checked" : ""}>
              ${o.label}
            </span>
            <span style="color:var(--mut)">+$${o.cost}</span>
          </label>`).join("")}
      </div>
    </div>
  ` : `<p style="font-size:13px;color:var(--mut)">Producto de repostería artesanal listo para recoger.</p>`;

  $("#custBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="custTitle">${p.name}</h2>
      <button type="button" class="dlg-close" data-close-dlg="customizerDialog" aria-label="Cerrar">×</button>
    </div>
    <div class="cust-hero" style="background:linear-gradient(135deg var(--in-oklab), ${p.c1}, ${p.c2})">
      <span class="cust-price-burst">$${unit}</span>
      <div class="cust-hero-img">${renderProductArt(p, 84)}</div>
      <div>
        <span style="font-size:11px;font-weight:800;color:var(--red);text-transform:uppercase">${p.cat}</span>
        <p style="font-size:13px;color:var(--ink);margin-top:3px;line-height:1.35">${p.desc}</p>
      </div>
    </div>
    ${optsMarkup}
    <div class="qty-bar">
      <div class="stepper">
        <button type="button" id="custMinus" aria-label="Disminuir cantidad">−</button>
        <strong style="min-width:18px;text-align:center">${c.qty}</strong>
        <button type="button" id="custPlus" aria-label="Aumentar cantidad">+</button>
      </div>
      <button type="button" class="btn-primary" style="flex:1" id="custAddBtn">
        Agregar al pedido · $${total}
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
      pushToast("Agregado al carrito", `${c.qty} × ${productById(c.productId).name}`);
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

// ==================== CARRITO, CUPONES Y CHECKOUT (RF-05, RF-06, RF-07, RF-08) ====================
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
      <div class="pad" style="text-align:center;padding-top:40px">
        <p style="font-size:17px;font-weight:800">Tu carrito está vacío</p>
        <p style="font-size:13.5px;color:var(--mut);margin:6px 0 18px">Explora el menú o elige una bebida en la hoja de inicio.</p>
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
        <div class="c-art" style="background:rgba(255,255,255,.12)">${renderProductArt(p, 42)}</div>
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
          <strong style="font-size:13.5px">Cupón de descuento (RN-01)</strong>
          <button type="button" class="link" id="cartScanQrBtn">Escanear QR</button>
        </div>
        <div class="coupon-row">
          <input type="text" id="couponInput" placeholder="Ej. BIENVENIDA o OTONO2X1" value="${state.appliedCoupon ? state.appliedCoupon.code : ""}">
          <button type="button" class="btn-primary" style="height:40px;padding:0 14px;font-size:13px" id="applyCouponBtn">Aplicar</button>
        </div>
        <p id="couponFeedback" style="font-size:12px;color:${state.appliedCoupon ? "var(--green)" : "var(--mut)"};font-weight:600">
          ${state.appliedCoupon ? `Aplicado: ${state.appliedCoupon.label}` : "Prueba BIENVENIDA, OTONO2X1 o VENCIDO25"}
        </p>
      </div>

      <div class="totals-card">
        <div class="totals-line"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
        <div class="totals-line disc"><span>Descuento</span><strong>−$${discount.toFixed(2)}</strong></div>
        <div class="totals-line grand"><span>Total</span><strong>$${total.toFixed(2)} MXN</strong></div>
      </div>

      <div class="checkout-block">
        <strong style="font-size:14px">Recoger en ${branch.name} (${branch.hours})</strong>
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
          <p style="font-size:11.5px;color:var(--mut)">RN-03: solo horarios permitidos entre ${branch.open}:00 y ${branch.close}:00.</p>
        ` : ""}
        <strong style="font-size:13.5px;margin-top:4px">Pago al recoger en mostrador (S2)</strong>
        <div class="seg">
          <button type="button" data-pay="tarjeta" aria-pressed="${state.payMethod === "tarjeta"}">Tarjeta en mostrador</button>
          <button type="button" data-pay="efectivo" aria-pressed="${state.payMethod === "efectivo"}">Efectivo</button>
        </div>
        <button type="button" class="btn-primary full" id="placeOrderBtn" style="margin-top:4px">
          Confirmar pedido · $${total.toFixed(2)}
        </button>
      </div>
    </div>`;
}

function tryApplyCoupon(raw) {
  const code = raw.trim().toUpperCase();
  const fb = $("#couponFeedback");
  if (!code) {
    state.appliedCoupon = null;
    renderCartView();
    return;
  }
  const c = COUPONS[code];
  if (!c) {
    if (fb) { fb.style.color = "var(--red)"; fb.textContent = "Cupón no encontrado."; }
    return false;
  }
  if (!c.active) {
    if (fb) { fb.style.color = "var(--red)"; fb.textContent = `Cupón ${code} vencido o desactivado (RN-01).`; }
    return false;
  }
  if (state.usedCoupons.has(code)) {
    if (fb) { fb.style.color = "var(--red)"; fb.textContent = `Ya usaste el cupón ${code} anteriormente.`; }
    return false;
  }
  state.appliedCoupon = c;
  renderCartView();
  pushToast("Cupón aplicado", `${c.code}: ${c.label}`);
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
    if (e.target.id === "placeOrderBtn") {
      if (!state.user) {
        openAuthModal("Inicia sesión para confirmar tu pedido");
        return;
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
      pushToast(`Pedido #${state.activeOrder.id} recibido`, `Sucursal ${branchById(state.branchId).name} ya recibió tu orden.`);
      navigate("orders");
    }
  });
}

// ==================== SEGUIMIENTO Y CALIFICACIÓN (RF-09, RF-10, RF-11) ====================
function renderOrdersView() {
  const host = $("#ordersContent");
  const o = state.activeOrder;
  if (!o) {
    host.innerHTML = `
      <div class="track-card">
        <p style="font-size:17px;font-weight:800">Sin pedidos activos</p>
        <p style="font-size:13.5px;color:var(--mut);margin:8px 0 18px">Arma tu bebida y confirma desde el carrito para seguir su preparación en vivo.</p>
        <button type="button" class="btn-primary full" id="ordersToMenuBtn">Ir al menú</button>
      </div>`;
    $("#ordersToMenuBtn").addEventListener("click", () => navigate("menu"));
    return;
  }

  const branch = branchById(o.branchId);
  const statusName = ORDER_STATES[o.statusIdx];
  const digits = o.code.split("").map((d) => `<span>${d}</span>`).join("");
  const stepsHtml = ORDER_STATES.map((st, i) => {
    const cls = i < o.statusIdx ? "done" : i === o.statusIdx ? "now" : "";
    const mark = i < o.statusIdx ? "✓" : i === o.statusIdx ? "•" : "";
    return `
      <div class="step ${cls}">
        <span class="step-dot">${mark}</span>
        <div><b>${st}</b><span>${i <= o.statusIdx ? "Confirmado" : "Pendiente"}</span></div>
      </div>`;
  }).join("");

  const actionBtn = o.statusIdx < 3
    ? `<button type="button" class="btn-primary full" id="advanceOrderBtn">Simular avance de sucursal → ${ORDER_STATES[o.statusIdx + 1]}</button>`
    : o.rated
      ? `<p class="msg-ok">Gracias. Tu calificación de este pedido ya fue registrada (RN-05).</p>`
      : `<button type="button" class="btn-primary full" id="openRatingBtn">Calificar pedido y bebidas (RF-11)</button>`;

  host.innerHTML = `
    <div class="track-card">
      <span style="font-size:12px;font-weight:800;color:var(--red)">PEDIDO #${o.id} · ${branch.name}</span>
      <h2 style="font-size:24px;margin-top:4px">${statusName}</h2>
      <p style="font-size:13px;color:var(--mut);margin-top:2px">
        ${o.mode === "now" ? "Recoger ahora (10 min)" : `Programado para las ${o.scheduledHour}`} · Pago en mostrador (${o.payMethod})
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
      const st = ORDER_STATES[state.activeOrder.statusIdx];
      updateBadges();
      pushToast(`Pedido #${state.activeOrder.id}: ${st}`, `Tu pedido pasó a estado "${st}" en ${branchById(state.activeOrder.branchId).name}.`);
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
      <div style="display:flex;justify-content:center;gap:8px;padding:6px 0">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" style="background:none;border:none;font-size:32px;color:${n <= stars ? "#E0A21B" : "#DDD2CA"}" aria-label="${n} estrellas">★</button>`).join("")}
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
      pushToast("Calificación guardada", `Calificaste con ${stars}/5 estrellas.`);
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
    av.textContent = "Inv";
  }
}

function openAuthModal(subtitle = "Pide desde tu celular y recoge en sucursal sin fila.") {
  let mode = "login";
  const draw = (err = "") => {
    $("#authBody").innerHTML = `
      <div class="dlg-head">
        <h2 id="authTitle">${mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
        <button type="button" class="dlg-close" data-close-dlg="authDialog" aria-label="Cerrar">×</button>
      </div>
      <p style="font-size:13px;color:var(--mut)">${subtitle}</p>
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
      <button type="button" class="btn-ghost full" id="switchAuthModeBtn">
        ${mode === "login" ? "¿No tienes cuenta? Regístrate aquí" : "Ya tengo cuenta · Iniciar sesión"}
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
    if (!email.includes("@") || pass.length < 6) {
      draw("Ingresa un correo válido y contraseña de al menos 6 caracteres.");
      return;
    }
    if (mode === "register") {
      if (state.registeredEmails.has(email)) {
        draw("Ese correo ya está registrado (restricción UNIQUE RF-01).");
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
    pushToast("Sesión iniciada", `Bienvenido, ${state.user.name}`);
  };
  $("#authDialog").showModal();
}

function renderProfileView() {
  const host = $("#profileContent");
  if (!state.user) {
    host.innerHTML = `
      <div class="pad" style="padding-top:30px;text-align:center">
        <h2 style="font-size:22px">Inicia sesión en BeanCraft</h2>
        <p style="font-size:13.5px;color:var(--mut);margin:8px 0 18px">Guarda tus bebidas favoritas, consulta pedidos y edita tu perfil.</p>
        <button type="button" class="btn-primary full" id="profLoginBtn">Iniciar sesión o registrarme</button>
      </div>`;
    $("#profLoginBtn").addEventListener("click", () => openAuthModal());
    return;
  }

  const initials = state.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  host.innerHTML = `
    <div class="prof-top">
      <div class="topbar">
        <button type="button" class="rbtn" data-nav="home" aria-label="Volver">←</button>
        <h1 class="t-center">Mi perfil</h1>
        <div style="width:42px"></div>
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
      <button type="button" class="btn-ghost full" id="logoutBtn" style="color:var(--red)">Cerrar sesión</button>
    </form>`;

  $("#profileForm").onsubmit = (e) => {
    e.preventDefault();
    state.user.name = $("#profName").value.trim() || state.user.name;
    state.user.phone = $("#profPhone").value.trim() || state.user.phone;
    const np = $("#profNewPass").value;
    if (np.length >= 6) state.user.password = np;
    syncAuthUI();
    renderProfileView();
    pushToast("Perfil actualizado", "Tus datos quedaron guardados.");
  };
  $("#logoutBtn").onclick = () => {
    state.user = null;
    syncAuthUI();
    navigate("home");
    pushToast("Sesión cerrada", "Has salido de tu cuenta.");
  };
}

// ==================== MODALES SUCURSALES, QR, NOTIFICACIONES ====================
function openBranchModal() {
  $("#branchBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="branchTitle">Elige tu sucursal (RF-04)</h2>
      <button type="button" class="dlg-close" data-close-dlg="branchDialog" aria-label="Cerrar">×</button>
    </div>
    ${BRANCHES.map((b) => `
      <button type="button" class="extra-item" data-branch-pick="${b.id}" style="text-align:left;${b.id === state.branchId ? "border-color:var(--red);background:#FFF6F7" : ""}">
        <div>
          <strong style="display:block;font-size:14px">${b.name} ${b.suggested ? '<span style="color:var(--red);font-size:11px">· Más cercana</span>' : ""}</strong>
          <span style="font-size:12px;color:var(--mut)">${b.addr} · ${b.hours}</span>
        </div>
        <strong style="color:var(--red);font-size:12.5px">${b.dist}</strong>
      </button>`).join("")}`;
  $("#branchBody").onclick = (e) => {
    const pick = e.target.closest("[data-branch-pick]");
    if (!pick) return;
    state.branchId = pick.dataset.branchPick;
    const b = branchById(state.branchId);
    $("#homeBranchText").innerHTML = `<strong>${b.name}</strong> · ${b.dist} · Abierto hasta ${b.close}:00`;
    $("#branchDialog").close();
    if (state.view === "cart") renderCartView();
  };
  $("#branchDialog").showModal();
}

function openQrModal() {
  $("#qrBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="qrTitle">Escanear cupón QR (RF-06)</h2>
      <button type="button" class="dlg-close" data-close-dlg="qrDialog" aria-label="Cerrar">×</button>
    </div>
    <div class="qr-frame">
      <div class="qr-box">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>
      </div>
      <span style="font-size:12.5px;color:#E9C9B5">Simulación de lector QR · Elige un cupón de prueba</span>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" class="ls-chip" data-qr-code="BIENVENIDA">QR: BIENVENIDA (-$30)</button>
      <button type="button" class="ls-chip" data-qr-code="OTONO2X1">QR: OTONO2X1 (-20%)</button>
      <button type="button" class="ls-chip" data-qr-code="VENCIDO25">QR: VENCIDO25 (inválido)</button>
    </div>
    <p id="qrErrMsg" class="msg-err" hidden></p>`;
  $("#qrBody").onclick = (e) => {
    const btn = e.target.closest("[data-qr-code]");
    if (!btn) return;
    const code = btn.dataset.qrCode;
    const c = COUPONS[code];
    if (!c || !c.active) {
      $("#qrErrMsg").hidden = false;
      $("#qrErrMsg").textContent = `Cupón ${code} vencido o desactivado (RN-01).`;
      return;
    }
    state.appliedCoupon = c;
    $("#qrDialog").close();
    navigate("cart");
    pushToast("Cupón escaneado", `${c.code}: ${c.label}`);
  };
  $("#qrDialog").showModal();
}

function openNotifModal() {
  $("#notifDot").hidden = true;
  $("#notifBody").innerHTML = `
    <div class="dlg-head">
      <h2 id="notifTitle">Notificaciones (RF-10)</h2>
      <button type="button" class="dlg-close" data-close-dlg="notifDialog" aria-label="Cerrar">×</button>
    </div>
    ${state.notifications.map((n) => `
      <div style="padding:10px 12px;border-radius:14px;background:var(--cream);border:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between">
          <strong style="font-size:13.5px">${n.title}</strong>
          <span style="font-size:11px;color:var(--mut)">${n.time}</span>
        </div>
        <p style="font-size:12.5px;color:var(--mut);margin-top:3px">${n.msg}</p>
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
  initMenuSheet();
  initCrystalMenu();
  initCustomizerEvents();
  initCartEvents();
  initOrderEvents();
  initDialogs();
  syncAuthUI();
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
  $("#fabQrBtn").addEventListener("click", openQrModal);
  $("#homeNotifBtn").addEventListener("click", openNotifModal);
  $("#ordersNotifBtn").addEventListener("click", openNotifModal);
  $("#closeToastBtn").addEventListener("click", () => { $("#pushToast").hidden = true; });

  const initialView = new URLSearchParams(location.search).get("view");
  if (initialView && ["home", "menu", "cart", "orders", "profile"].includes(initialView)) {
    $("#splashScreen").classList.add("done");
    navigate(initialView);
  }
}

init();
