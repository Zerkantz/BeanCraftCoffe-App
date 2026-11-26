// Catálogo BeanCraft: 25 productos del repo móvil (data/catalog.js, mismos id, precios base y fotos).
// Categorías del SRS: los frappés pasan a Bebidas frías con etiqueta "Frappé". Dos nombres con marca ajena
// se mantienen renombrados (decisión D3): Kfreeze → Helado batido; Protea → Frappé proteico.
// Opciones y costos: SRS v1.3, RN-02 (iguales a OPTIONS del repo).

export const CATEGORIAS = ['Cafés', 'Bebidas frías', 'Repostería'];

const raw = [
  ['frappe_supremo', 'Frappé Supremo', 'Frappés', 65, 5.0, 'frappe_helado.png', 'hielito', 'miel', true, 'Espresso doble frappeado con crema batida y caramelo de la casa.'],
  ['refresher_duo', 'Refresher Dúo', 'Bebidas frías', 62, 4.9, 'refresher.png', 'hielito', 'fresa', true, 'Infusión frutal de frutos rojos y moras azules con perlas explosivas.'],
  ['frappe_beancraft', 'Frappé BeanCraft', 'Frappés', 58, 4.9, 'frappe.png', 'hielito', 'miel', true, 'Mezcla clásica de café de altura tostado oscuro con hielo frappeado.'],
  ['latte_caramelo', 'Latte de caramelo', 'Cafés', 55, 4.8, 'latte_duo.png', 'taza', 'miel', true, 'Espresso doble, leche vaporizada y caramelo artesanal.'],
  ['cold_brew', 'Americano & Cold Brew', 'Bebidas frías', 57, 4.6, 'americano_duo.png', 'grano', 'menta', true, 'Tranquilo, directo y con carácter. Extracción en frío de 16 horas.'],
  ['mocha_blanco', 'Helado batido Berry & Nuez', 'Frappés', 66, 4.8, 'kfreeze_duo.png', 'espuma', 'fresa', true, 'Helado suave artesanal con cobertura de frutos rojos o nuez.'],
  ['capuchino', 'Frappé Galleta & Fresa', 'Frappés', 62, 4.9, 'frappe_duo.png', 'hielito', 'fresa', true, 'Dúo de frappé cremoso con galleta triturada y fresa natural.'],
  ['matcha_latte', 'Matcha latte', 'Bebidas frías', 64, 4.6, 'matcha_duo.webp', 'espuma', 'menta', true, 'Matcha ceremonial batido en frío o caliente sobre leche cremosa.'],
  ['taro_frappe', 'Nieve Crunch & Berry', 'Frappés', 59, 4.7, 'nieve_duo.png', 'hielito', 'lila', true, 'Nieve cremosa con crumble de caramelo o coulis de frutos rojos.'],
  ['te_helado_rojo', 'Té rojo helado', 'Bebidas frías', 48, 4.7, 'te_rojo_helado.webp', 'hielito', 'fresa', true, 'Infusión fría de frutos rojos y jamaica sobre hielo cristalino.'],
  ['agua_purificada', 'Agua purificada', 'Bebidas frías', 22, 4.9, 'agua_ciel.webp', 'hielito', 'menta', false, 'Agua natural embotellada de 600 ml bien fría.'],
  ['capuchino_duo', 'Capuchino clásico', 'Cafés', 52, 4.9, 'capuchino_duo.webp', 'espuma', 'limon', true, 'Espresso doble con leche vaporizada, crema suave o versión con hielo.'],
  ['flat_white', 'Flat White', 'Cafés', 49, 4.8, 'latte_caliente.png', 'taza', 'miel', true, 'Taza caliente de espresso intenso con microespuma sedosa.'],
  ['iced_latte', 'Iced Latte', 'Cafés', 56, 4.9, 'iced_latte.png', 'taza', 'limon', true, 'Leche fría con carga de espresso y hielos cristalinos.'],
  ['chai_latte', 'Chai Latte', 'Cafés', 58, 4.8, 'chai_duo.webp', 'taza', 'miel', true, 'Té negro especiado con canela, cardamomo y leche cremosa.'],
  ['chocolate_cacao', 'Chocolate de cacao', 'Cafés', 54, 4.8, 'chocolate_duo.webp', 'grano', 'lila', true, 'Cacao artesanal caliente o frío en las rocas.'],
  ['te_durazno', 'Té de durazno', 'Bebidas frías', 46, 4.7, 'te_durazno_duo.webp', 'hielito', 'limon', true, 'Té negro frío con durazno natural.'],
  ['tisana_frutos', 'Tisana frutos rojos', 'Bebidas frías', 56, 4.9, 'tisana_frutos.png', 'hielito', 'fresa', true, 'Infusión de frutos rojos sin cafeína, fría o caliente.'],
  ['refresher_fresa', 'Refresher Coco & Fresa', 'Bebidas frías', 60, 4.8, 'refresher_coco_fresa.png', 'espuma', 'fresa', true, 'Fresa natural con leche de coco sobre hielo.'],
  ['protea_frappe', 'Frappé proteico de mango', 'Frappés', 68, 4.9, 'protea_duo.png', 'hielito', 'miel', true, 'Frappé de proteína con mango natural.'],
  ['concha_vainilla', 'Concha de vainilla', 'Repostería', 35, 4.9, 'concha_vainilla.png', 'croissant', 'miel', false, 'Pan dulce suave con costra de vainilla.'],
  ['dona_fresa', 'Dona glaseada de fresa', 'Repostería', 38, 4.9, 'dona_fresa.png', 'croissant', 'fresa', false, 'Dona esponjosa con glaseado de fresa y chispas.'],
  ['croissant_mantequilla', 'Croissant de mantequilla', 'Repostería', 46, 5.0, 'croissant_mantequilla.png', 'croissant', 'miel', false, 'Hojaldre de mantequilla horneado cada mañana.'],
  ['oreja_hojaldrada', 'Oreja hojaldrada', 'Repostería', 32, 4.8, 'oreja_hojaldrada.png', 'croissant', 'limon', false, 'Hojaldre caramelizado, crujiente y ligero.'],
  ['cuernito_mantequilla', 'Cuernito horneado', 'Repostería', 40, 4.8, 'cuernito_mantequilla.png', 'croissant', 'lila', false, 'Cuernito dorado de mantequilla.'],
];
// Productos inactivos en el panel (para mostrar el estado inactivo de RF-13).
const INACTIVOS = new Set(['protea_frappe', 'agua_purificada']);

export const slugDe = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'y').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const PRODUCTOS = raw.map(([id, nombre, cat, precio, cal, img, mascota, fondo, personalizable, desc]) => ({
  id, nombre, precio, cal, img, mascota, fondo, personalizable, desc,
  categoria: cat === 'Frappés' ? 'Bebidas frías' : cat,
  frappe: cat === 'Frappés',
  activo: !INACTIVOS.has(id),
  slug: slugDe(nombre),
}));
export const P = Object.fromEntries(PRODUCTOS.map(p => [p.id, p]));
export const porSlug = slug => PRODUCTOS.find(p => p.slug === slug);

// Bebidas que gira el carrusel del inicio: FEATURED_IDS del repo.
export const DESTACADOS = ['frappe_supremo', 'refresher_duo', 'frappe_beancraft', 'latte_caramelo', 'cold_brew'];

// SRS v1.3 · RN-02
export const OPCIONES = {
  tamano: { titulo: 'Tamaño', unica: true, items: [['chico', 'Chico', 0], ['mediano', 'Mediano', 10], ['grande', 'Grande', 18]] },
  leche: { titulo: 'Leche', unica: true, items: [['entera', 'Entera', 0], ['deslactosada', 'Deslactosada', 0], ['avena', 'Avena', 12], ['almendra', 'Almendra', 12]] },
  endulzante: { titulo: 'Endulzante', unica: true, items: [['sin', 'Sin endulzante', 0], ['azucar', 'Azúcar', 0], ['stevia', 'Stevia', 0], ['miel', 'Miel', 5]] },
  extras: { titulo: 'Extras', unica: false, items: [['shot', 'Shot de espresso', 15], ['crema', 'Crema batida', 8], ['caramelo', 'Caramelo', 8]] },
};
export const costo = (grupo, id) => OPCIONES[grupo].items.find(i => i[0] === id)[2];
export const etiqueta = (grupo, id) => OPCIONES[grupo].items.find(i => i[0] === id)[1];

// RN-02: base + tamaño + leche + endulzante + extras (el cupón se descuenta a nivel pedido)
export function precioLinea(l) {
  const p = P[l.prod];
  if (!p.personalizable) return p.precio;
  return p.precio + costo('tamano', l.tam) + costo('leche', l.leche) + costo('endulzante', l.endu) + (l.extras || []).reduce((s, e) => s + costo('extras', e), 0);
}
export function resumenLinea(l) {
  const p = P[l.prod];
  if (!p.personalizable) return 'Pieza individual';
  return [etiqueta('tamano', l.tam), etiqueta('leche', l.leche), etiqueta('endulzante', l.endu), ...(l.extras || []).map(e => etiqueta('extras', e))].join(' · ');
}
