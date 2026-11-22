export const UI_CONFIG = { openLayout: true };
export const CATEGORY_STYLE = {
  'Cafés': { mascot: 'taza', color: 'var(--c-miel)', label: 'Café de la casa' },
  'Bebidas frías': { mascot: 'hielito', color: 'var(--c-menta)', label: 'Bien frío' },
  'Repostería': { mascot: 'croissant', color: 'var(--c-lila)', label: 'Del horno' }
};
export const FOOTER_QUOTES = [
  { id: 'taza', quote: 'Y recuerda… pide en la app y ahórrate la fila.' },
  { id: 'grano', quote: 'Y recuerda… tu café, a tu manera.' },
  { id: 'espuma', quote: 'Y recuerda… un poco de espuma le alegra el día a cualquiera.' },
  { id: 'hielito', quote: 'Y recuerda… con calma y con hielito sabe mejor.' },
  { id: 'croissant', quote: 'Y recuerda… siempre queda espacio para un antojo.' }
];

export const QUIZ_QUESTIONS = [
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
      { label: "Concha de vainilla", pick: "latte_caramelo" },
      { label: "Algo sin tanta azúcar", pick: "cold_brew" },
      { label: "Crema batida arriba", pick: "frappe_supremo" },
      { label: "Hielito extra", pick: "refresher_duo" }
    ]
  }
];

export const HOUSE_PAGES = [
  {
    id: "frappes",
    tab: "Frappés y Especiales",
    title: "Frappés House",
    sub: "Textura cremosa y café de altura",
    heroId: "frappe_supremo",
    mascota: "hielito",
    altVerde: false,
    listIds: ["protea_frappe", "mocha_blanco"],
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
    listIds: ["latte_caramelo", "chai_latte"],
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
    listIds: ["cold_brew", "te_durazno"],
    tileIds: ["refresher_duo", "tisana_frutos", "matcha_latte"]
  },
  {
    id: "reposteria",
    tab: "Repostería",
    title: "Horno Artesanal",
    sub: "Recién horneado para tu café",
    heroId: "croissant_mantequilla",
    mascota: "croissant",
    altVerde: true,
    listIds: ["croissant_mantequilla", "cuernito_mantequilla"],
    tileIds: ["concha_vainilla", "dona_fresa", "oreja_hojaldrada"]
  }
];
