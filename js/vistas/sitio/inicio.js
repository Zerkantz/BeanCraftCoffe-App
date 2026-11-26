// Inicio: landing de marca para visitantes. Hero con carrusel, qué es BeanCraft, bebidas de la casa, quiz y sucursales.
// El explorador, las combinaciones y las promociones viven en sus pestañas.
// Sin carrito, total, botón de pedir ni seguimiento de pedidos (SRS 2.1: el pedido vive en la app).
import * as C from '../../componentes/base.js';
import * as L from '../../componentes/landing.js';
import { ic } from '../../lib/iconos.js';
import { P, PRODUCTOS, DESTACADOS } from '../../data/catalogo.js';
import { SUCURSALES } from '../../data/sucursales.js';
import { CASA, QUIZ, RESULTADOS_QUIZ } from '../../data/experiencia.js';
import { T, B, cabeza } from './comun.js';

/* Quiz "¿Qué bebida eres?" con las preguntas del repo. paso: portada | número de pregunta | resultado */
export function quiz(paso = 'portada', respuestas = []) {
  if (paso === 'portada') {
    return `<div class="Quiz" data-paso="portada" data-quiz><div class="texto-quiz">${T('h2', 'El quiz de las ', 'Bebidas')}<p class="bajada">Cinco preguntas rápidas y te decimos qué bebida de la casa va contigo.</p>${B({ texto: '¡Llévame ya!', iconoDer: 'chevron-der', x: ' data-quiz-empezar' })}<p class="nota-demo">${ic('info', 16)}No guardamos tus respuestas.</p></div><div class="collage">${C.Mascota('grano', { tam: 110, rot: -2 })}${C.Mascota('espuma', { tam: 110, rot: 2, holo: true })}${C.Mascota('hielito', { tam: 110, rot: -2 })}${C.Mascota('croissant', { tam: 110, rot: 2 })}${C.Mascota('taza', { tam: 110 })}</div></div>`;
  }
  if (paso === 'resultado') {
    const votos = {};
    respuestas.forEach(id => { votos[id] = (votos[id] || 0) + 1; });
    const gana = Object.entries(votos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'latte_caramelo';
    const r = RESULTADOS_QUIZ[gana], p = P[gana];
    return `<div class="Quiz" data-paso="resultado" data-quiz data-resultado="${gana}"><div class="texto-quiz">${C.Etiqueta({ tipo: 'info', texto: 'Tu resultado' })}${T('h2', 'Eres un ', r.titulo)}<p class="bajada">${r.frase}</p><p class="resultado-precio">${p.nombre} desde ${C.Marcatextos(C.mxn(p.precio))}</p><div class="acciones">${B({ texto: 'Ver mi combinación', iconoDer: 'chevron-der', href: `#/combinaciones?quiz=${gana}` })}${B({ tipo: 'secundario', texto: 'Ver la ficha', href: C.fichaDe(p) })}${B({ tipo: 'texto', texto: 'Repetir quiz', icono: 'x', x: ' data-quiz-empezar' })}</div></div><div class="anfitrion">${C.Mascota(r.mascota, { tam: 180, estado: 'guino', holo: true })}<p class="burbuja">${p.desc}</p></div></div>`;
  }
  const n = Number(paso);
  const { q, opts } = QUIZ[n];
  const pct = Math.round((n / QUIZ.length) * 100);
  return `<div class="Quiz" data-paso="pregunta" data-quiz data-pregunta="${n}" data-respuestas="${respuestas.join(',')}"><div class="texto-quiz"><div class="progreso"><div class="fila"><span>Pregunta ${n + 1} de ${QUIZ.length}</span><span>${pct} %</span></div>${C.BarraProgreso(n + 1, QUIZ.length)}</div><h3 class="pregunta">${q}</h3><div class="opciones" role="group" aria-label="${q}">${opts.map(([t, id]) => C.OpcionQuiz(t).replace('class="OpcionQuiz"', `class="OpcionQuiz" data-voto="${id}"`)).join('')}</div>${B({ tipo: 'texto', texto: 'Atrás', icono: 'chevron-izq', x: ' data-quiz-atras' })}</div><div class="anfitrion">${C.Mascota('grano', { tam: 150, estado: 'pensando' })}<p class="burbuja">No hay respuestas incorrectas. Elige la que más te late.</p></div></div>`;
}

export function inicio(bp, estado, params, { paso = 0 } = {}) {
  const ids = DESTACADOS;
  const frente = P[ids[L.indiceDe(paso, ids.length)]];
  const visibles = PRODUCTOS.filter(p => p.activo && !p.eliminado);
  const cal = (visibles.reduce((s, p) => s + p.cal, 0) / visibles.length).toFixed(1);
  const datos = [[String(visibles.length), 'productos en el menú'], [String(SUCURSALES.length), 'barras en la ciudad'], [`${cal} ${ic('estrella', 18)}`, 'calificación en la app']];
  const hero = `<section class="contenedor HeroInicio"><div class="texto-hero"><p class="antetitulo">Cafetería de barra · San Luis Río Colorado</p>${T('h1', 'Tu café,<br>', 'a tu manera')}<p class="subtitulo">Café de barra, bebidas frías y pan recién horneado. Conoce cada bebida y arma la tuya antes de pedirla en la app.</p><div class="acciones-hero">${B({ texto: 'Ver el menú', iconoDer: 'chevron-der', href: '#/bebidas' })}${B({ tipo: 'secundario', texto: 'Arma tu combinación', href: '#/combinaciones' })}</div><dl class="datos-hero">${datos.map(([v, t]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl></div><div class="vitrina">${L.Carrusel3D(ids, { bp, paso })}${L.FichaCarrusel(frente)}</div></section>`;

  const pilares = `<section class="seccion" data-fondo="blanco" id="marca"><div class="contenedor">${cabeza(T('h2', 'Qué es ', 'BeanCraft'), 'Una cafetería independiente con tres barras en San Luis Río Colorado.')}${L.Pilares([
    ['grano', 'Café de barra', 'Espresso recién molido y café de altura tostado oscuro, extraído al momento.'],
    ['espuma', 'A tu manera', 'Cada bebida admite 3 tamaños, 4 leches, 4 endulzantes y 3 extras. Tú decides.'],
    ['croissant', 'Recién horneado', 'Conchas, donas, croissants y orejas que salen del horno cada mañana.'],
  ])}</div></section>`;

  const casa = `<section class="seccion" id="casa"><div class="contenedor">${cabeza(T('h2', 'Las ', 'Bebidas', ' de la casa'), 'Lo que más sale de cada barra, por tipo de bebida.', B({ tipo: 'secundario', texto: 'Ver el menú completo', iconoDer: 'chevron-der', href: '#/bebidas' }))}${L.HojasCasa(CASA)}</div></section>`;

  const pasoQuiz = estado === 'quiz-pregunta' ? 1 : estado === 'quiz-resultado' ? 'resultado' : 'portada';
  const qz = `<section class="seccion" data-fondo="menta" id="quiz"><div class="contenedor">${quiz(pasoQuiz, pasoQuiz === 'resultado' ? ['cold_brew', 'cold_brew', 'latte_caramelo'] : pasoQuiz === 1 ? ['cold_brew'] : [])}</div></section>`;

  const sucs = `<section class="seccion" data-fondo="blanco" id="sucursales"><div class="contenedor">${cabeza(T('h2', 'Pasa por ', 'tu', ' barra'), `${SUCURSALES.length} sucursales en San Luis Río Colorado. Horario de hoy en vivo.`, B({ tipo: 'secundario', texto: 'Ver sucursales', iconoDer: 'chevron-der', href: '#/sucursales' }))}<div class="fila-sucursales">${SUCURSALES.map(s => C.TarjetaSucursal(s)).join('')}</div></div></section>`;

  return hero + pilares + casa + qz + sucs;
}
