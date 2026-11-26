// Fotos de producto del repo móvil (assets/productos/*.png), recortadas a su contenido.
// DIM guarda el tamaño original de cada foto para no ampliarla más de 1.6×.
const DIM = {"agua_ciel.png":[130,435],"americano_duo.png":[184,233],"capuchino_duo.png":[382,486],"chai_duo.png":[359,462],"chocolate_duo.png":[412,486],"concha_vainilla.png":[393,323],"croissant_mantequilla.png":[415,259],"cuernito_mantequilla.png":[466,298],"dona_fresa.png":[383,263],"frappe.png":[363,600],"frappe_duo.png":[519,600],"frappe_helado.png":[281,600],"iced_latte.png":[369,600],"kfreeze_duo.png":[461,600],"latte_caliente.png":[329,600],"latte_duo.png":[203,247],"matcha_duo.png":[377,486],"nieve_duo.png":[599,600],"oreja_hojaldrada.png":[529,297],"protea_duo.png":[233,230],"refresher.png":[395,465],"refresher_coco_fresa.png":[476,600],"te_durazno_duo.png":[404,486],"te_rojo_helado.png":[300,484],"tisana_frutos.png":[491,600]};

export const fotoDe = p => p.img.replace(/\.\w+$/, '.png');

export function foto(p, alto = 172, clase = 'foto') {
  const f = fotoDe(p);
  const [w, h] = DIM[f];
  const k = Math.min(1, Math.round(((h * 1.6) / alto) * 100) / 100);
  const a = Math.round(alto * k);
  return `<img class="${clase} FotoProducto" src="assets/productos/${f}" width="${Math.round((a * w) / h)}" height="${a}" alt="${p.nombre}"${k < 1 ? ` style="--k:${k}"` : ''}>`;
}
