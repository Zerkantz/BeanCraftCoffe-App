// Contenido de la landing tomado de data/experience.js del repo móvil (hojas de la casa, quiz y frases de mascota),
// más las combinaciones sugeridas y las preguntas frecuentes del sitio. Sin acciones de pedido.

export const CATEGORIA_ESTILO = {
  'Cafés': { mascota: 'taza', fondo: 'miel', etiqueta: 'Café de la casa' },
  'Bebidas frías': { mascota: 'hielito', fondo: 'menta', etiqueta: 'Bien frío' },
  'Repostería': { mascota: 'croissant', fondo: 'lila', etiqueta: 'Del horno' },
};

// "Aprobado por …" en la ficha del carrusel.
export const MASCOTAS = {
  grano: { nombre: 'Grano', frase: 'Café de altura, tostado en casa.' },
  taza: { nombre: 'Taza', frase: 'Calientito y hecho al momento.' },
  espuma: { nombre: 'Espuma', frase: 'Suave como una nube de leche.' },
  hielito: { nombre: 'Hielito', frase: 'Bien helado, directo a tu vaso.' },
  croissant: { nombre: 'Croissant', frase: 'Recién salido del horno.' },
};

// Frases del pie. La del repo que invita a pedir se cambió por una de marca (decisión D2: sin llamados a pedir).
export const FRASES_PIE = [
  { id: 'taza', quote: 'Y recuerda… cada taza se prepara al momento.' },
  { id: 'grano', quote: 'Y recuerda… tu café, a tu manera.' },
  { id: 'espuma', quote: 'Y recuerda… un poco de espuma le alegra el día a cualquiera.' },
  { id: 'hielito', quote: 'Y recuerda… con calma y con hielito sabe mejor.' },
  { id: 'croissant', quote: 'Y recuerda… siempre queda espacio para un antojo.' },
];

// Hojas "Bebidas de la casa" (HOUSE_PAGES del repo): cinco productos por hoja, dos arriba y tres abajo.
export const CASA = [
  { id: 'frappes', tab: 'Frappés y Especiales', titulo: 'Frappés House', sub: 'Textura cremosa y café de altura', heroId: 'frappe_supremo', mascota: 'hielito', verde: false, listIds: ['protea_frappe', 'mocha_blanco'], tileIds: ['frappe_supremo', 'frappe_beancraft', 'taro_frappe'] },
  { id: 'cafes', tab: 'Cafés Calientes', titulo: 'Café Barra', sub: 'Espresso recién molido al momento', heroId: 'flat_white', mascota: 'taza', verde: true, listIds: ['latte_caramelo', 'chai_latte'], tileIds: ['flat_white', 'capuchino_duo', 'iced_latte'] },
  { id: 'frias', tab: 'Bebidas Frías', titulo: 'Refresher & Té', sub: 'Frutas, tisanas, matcha y cold brew', heroId: 'refresher_duo', mascota: 'espuma', verde: false, listIds: ['cold_brew', 'te_durazno'], tileIds: ['refresher_duo', 'tisana_frutos', 'matcha_latte'] },
  { id: 'reposteria', tab: 'Repostería', titulo: 'Horno Artesanal', sub: 'Recién horneado para tu café', heroId: 'croissant_mantequilla', mascota: 'croissant', verde: true, listIds: ['croissant_mantequilla', 'cuernito_mantequilla'], tileIds: ['concha_vainilla', 'dona_fresa', 'oreja_hojaldrada'] },
];

// Quiz del repo (QUIZ_QUESTIONS): cada respuesta suma un voto a una bebida.
export const QUIZ = [
  { q: '¿Cómo es tu plan ideal de sábado?', opts: [['Cine y palomitas', 'frappe_supremo'], ['Salir a caminar', 'cold_brew'], ['Maratón de series', 'latte_caramelo'], ['Brunch con amigos', 'matcha_latte']] },
  { q: '¿Qué temperatura prefieres hoy?', opts: [['Bien frío con hielo', 'cold_brew'], ['Frappeado y cremoso', 'frappe_supremo'], ['Calentito y suave', 'latte_caramelo'], ['Frutal y ligero', 'refresher_duo']] },
  { q: '¿Qué sabor te llama más?', opts: [['Café directo y tostado', 'cold_brew'], ['Caramelo dulce', 'latte_caramelo'], ['Matcha herbal', 'matcha_latte'], ['Frutos rojos', 'refresher_duo']] },
  { q: '¿Cuánta energía necesitas?', opts: [['Mucha, voy con prisa', 'cold_brew'], ['Media, paso a paso', 'latte_caramelo'], ['Tranquilo y balanceado', 'matcha_latte'], ['Un antojo dulce', 'frappe_supremo']] },
  { q: '¿Con qué acompañarías tu bebida?', opts: [['Concha de vainilla', 'latte_caramelo'], ['Algo sin tanta azúcar', 'cold_brew'], ['Crema batida arriba', 'frappe_supremo'], ['Hielito extra', 'refresher_duo']] },
];
export const RESULTADOS_QUIZ = {
  frappe_supremo: { titulo: 'Frappé Supremo', frase: 'Dulce, intenso y sin pedir permiso.', mascota: 'hielito', combo: { tam: 'grande', leche: 'entera', endu: 'sin', extras: ['crema', 'caramelo'] } },
  cold_brew: { titulo: 'Cold brew', frase: 'Tranquilo, directo y con carácter.', mascota: 'grano', combo: { tam: 'mediano', leche: 'entera', endu: 'sin', extras: [] } },
  latte_caramelo: { titulo: 'Latte de caramelo', frase: 'Cálido, suave y siempre de buenas.', mascota: 'taza', combo: { tam: 'mediano', leche: 'avena', endu: 'sin', extras: ['caramelo'] } },
  matcha_latte: { titulo: 'Matcha latte', frase: 'Balanceado, curioso y con buena vibra.', mascota: 'espuma', combo: { tam: 'mediano', leche: 'almendra', endu: 'miel', extras: [] } },
  refresher_duo: { titulo: 'Refresher Dúo', frase: 'Frutal, ligero y lleno de color.', mascota: 'hielito', combo: { tam: 'grande', leche: 'entera', endu: 'sin', extras: [] } },
};

// Combinaciones sugeridas: cada una precarga el explorador.
export const COMBINACIONES = [
  { id: 'caramelo-energia', nombre: 'Caramelo con energía', nota: 'Avena y un shot extra para la mañana.', mascota: 'taza', l: { prod: 'latte_caramelo', tam: 'mediano', leche: 'avena', endu: 'sin', extras: ['shot'] } },
  { id: 'antojo-total', nombre: 'Antojo total', nota: 'Grande, con crema batida y caramelo.', mascota: 'hielito', l: { prod: 'frappe_supremo', tam: 'grande', leche: 'entera', endu: 'sin', extras: ['crema', 'caramelo'] } },
  { id: 'matcha-suave', nombre: 'Matcha suave', nota: 'Leche de almendra y un toque de miel.', mascota: 'espuma', l: { prod: 'matcha_latte', tam: 'mediano', leche: 'almendra', endu: 'miel', extras: [] } },
  { id: 'frio-ligero', nombre: 'Frío y ligero', nota: 'Deslactosada, stevia y carga doble.', mascota: 'grano', l: { prod: 'iced_latte', tam: 'grande', leche: 'deslactosada', endu: 'stevia', extras: ['shot'] } },
  { id: 'chai-tarde', nombre: 'Chai de la tarde', nota: 'Chico, con avena y miel.', mascota: 'taza', l: { prod: 'chai_latte', tam: 'chico', leche: 'avena', endu: 'miel', extras: [] } },
];

export const FAQ = [
  ['¿Puedo pedir o pagar en esta página?', 'No. El sitio sirve para conocer la marca, el menú, las combinaciones y las sucursales. Los pedidos se hacen en la app BeanCraft y se pagan en el mostrador al recoger.'],
  ['¿Qué es el precio de referencia?', 'Es la suma de la bebida base más el tamaño, la leche, el endulzante y los extras que elijas. Los cupones se aplican en la app y pueden bajar el total.'],
  ['¿Cómo se usa un cupón?', 'En la app, escaneando el QR del cupón o escribiendo su código. Se acepta un cupón por pedido y cada cupón se usa una vez por cliente.'],
  ['¿Qué leches y endulzantes tienen?', 'Leche entera, deslactosada, de avena y de almendra. Endulzantes: azúcar, stevia y miel, o sin endulzante.'],
  ['¿Hacen envíos a domicilio?', 'Por ahora no. Todo se recoge en sucursal.'],
  ['Trabajo en BeanCraft, ¿dónde entro?', 'Usa “Iniciar sesión” en la parte superior. El acceso es solo para administradores y personal de sucursal.'],
];
