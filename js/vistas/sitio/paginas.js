// Combinaciones, Promociones, Sucursales, Ayuda, Privacidad, Contacto, 404 y Guía viva.
import * as C from '../../componentes/base.js';
import * as L from '../../componentes/landing.js';
import { ic } from '../../lib/iconos.js';
import { P } from '../../data/catalogo.js';
import { SUCURSALES, masCercana } from '../../data/sucursales.js';
import { promosVigentes } from '../../data/cupones.js';
import { COMBINACIONES, RESULTADOS_QUIZ, FAQ } from '../../data/experiencia.js';
import { ahora } from '../../lib/reglas.js';
import { libreriaViva } from '../libreria.js';
import { normal } from './catalogo.js';
import { T, B, cabeza, pagina } from './comun.js';

/* Combinaciones: explorador completo + sugeridas. ?base= viene del carrusel o de una ficha; ?combo= de una sugerida; ?quiz= del resultado. */
export function selDesdeParams(params) {
  if (params.combo) { const c = COMBINACIONES.find(x => x.id === params.combo); if (c) return { ...c.l, extras: [...c.l.extras] }; }
  if (params.quiz && RESULTADOS_QUIZ[params.quiz]) { const r = RESULTADOS_QUIZ[params.quiz]; return { prod: params.quiz, ...r.combo, extras: [...r.combo.extras] }; }
  if (params.base && P[params.base] && P[params.base].personalizable) return { ...L.SEL_INICIAL, prod: params.base, extras: [] };
  return { ...L.SEL_INICIAL, extras: [...L.SEL_INICIAL.extras] };
}
export function combinaciones(bp, estado, params) {
  const sel = selDesdeParams(params);
  const aviso = params.quiz ? C.Aviso('exito', `Tu resultado del quiz ya está cargado: ${P[params.quiz].nombre} con su combinación.`, { titulo: 'Listo' }) : '';
  return pagina(`${cabeza(T('h1', 'Arma tu ', 'combinación'), 'Elige la bebida base y ve cómo cambia con cada opción. El precio es de referencia; el pedido se hace en la app.')}${aviso}${L.Explorador(sel, { bp })}`, { fondo: 'menta' }) + L.PizarraCombos(COMBINACIONES);
}

/* Promociones: solo cupones activos y vigentes, como información (RN-01). */
export function promociones(bp, estado) {
  const vig = estado === 'vacio' ? [] : promosVigentes(ahora());
  const intro = cabeza(T('h1', 'Promociones ', 'vigentes'), 'Cada cupón se aplica en la app con su código, se usa una vez por cliente y se acepta uno por pedido.');
  if (!vig.length) return pagina(`${intro}${C.EstadoVacio({ mascota: 'hielito', titulo: 'Hoy no hay promociones activas', texto: 'Vuelve pronto: aquí aparecen en cuanto se activan.', accion: B({ tipo: 'secundario', texto: 'Ver el menú', href: '#/bebidas' }) })}`);
  return pagina(`${intro}<div class="mosaico" data-filas="2"${bp === 'movil' ? ' data-vista="lista"' : ''}>${vig.map((p, i) => C.MosaicoPromo(p, { tam: i === 0 ? 'grande' : 'mediano' })).join('')}</div>`);
}

/* Sucursales: horario en vivo, búsqueda por texto y "Usar mi ubicación" con el permiso del navegador. */
export function sucursales(bp, estado, params) {
  const vista = estado === 'tarjetas' ? 'tarjetas' : 'lista';
  const toggle = `<div class="filtros" role="radiogroup" aria-label="Vista">${C.Chip({ texto: 'Lista', sel: vista === 'lista', x: vista === 'lista' ? '' : ' data-ir="#/sucursales"' })}${C.Chip({ texto: 'Tarjetas grandes', sel: vista === 'tarjetas', x: vista === 'tarjetas' ? '' : ' data-ir="#/sucursales?estado=tarjetas"' })}</div>`;
  const intro = cabeza(T('h1', 'Pasa por ', 'tu', ' barra'), 'Horario de hoy, referencias para llegar y la sucursal más cercana.', toggle);
  const q = estado === 'sin-resultados' ? 'Col. Nueva Esperanza' : (params.q || '');
  const campo = C.Campo({ tipo: 'busqueda', valor: q, placeholder: 'Busca por nombre, calle o referencia', nombre: 'q', estado: estado === 'ubicacion-denegada' ? 'foco' : undefined });
  const ub = estado === 'ubicacion-pedida' ? B({ tipo: 'secundario', texto: 'Buscando tu ubicación…', estado: 'cargando' })
    : estado === 'ubicacion-concedida' ? B({ tipo: 'secundario', texto: 'Ubicación en uso', icono: 'check', href: '#/sucursales' })
    : B({ tipo: 'secundario', texto: 'Usar mi ubicación', icono: 'ubicacion', x: ' data-usar-ubicacion' });
  const avisos = { 'ubicacion-pedida': C.Aviso('info', 'Tu navegador te pedirá permiso. Solo la usamos para ordenar las sucursales y no la guardamos.'), 'ubicacion-concedida': C.Aviso('exito', 'Ordenamos las sucursales de la más cercana a la más lejana. No guardamos tu ubicación.'), 'ubicacion-denegada': C.Aviso('info', 'Activa el permiso en tu navegador o escribe una calle o referencia.', { titulo: 'No pudimos usar tu ubicación' }) };
  const busq = `<div class="busqueda"><div data-buscar-sucursal>${campo}</div>${ub}${avisos[estado] || ''}</div>`;
  const cercana = estado === 'ubicacion-concedida' ? masCercana() : null;
  const nq = normal(q);
  let lista = SUCURSALES.filter(s => !nq || normal(`${s.nombre} ${s.nombreCompleto} ${s.dir} ${s.ref}`).includes(nq));
  if (cercana) lista = [...lista].sort((a, b) => a.kmNum - b.kmNum);
  const res = lista.length
    ? `<p class="conteo" aria-live="polite">${lista.length} ${lista.length === 1 ? 'sucursal' : 'sucursales'}</p>${lista.map(s => C.TarjetaSucursal(s, { sugerida: cercana && s.id === cercana.id, grande: vista === 'tarjetas' })).join('')}`
    : `<p class="conteo" aria-live="polite">0 sucursales</p>${C.EstadoVacio({ mascota: 'hielito', titulo: `No encontramos sucursales con “${q}”`, texto: 'Prueba con otra calle o referencia, o usa tu ubicación.', accion: B({ tipo: 'secundario', texto: `Ver las ${SUCURSALES.length} sucursales`, href: '#/sucursales' }) })}`;
  if (vista === 'tarjetas') return pagina(`${intro}<div class="ListaSucursales" data-vista="lista" style="grid-template-columns:minmax(0,1fr);margin-bottom:var(--sp-5)"><div class="lista">${busq}</div></div><div class="ListaSucursales" data-vista="tarjetas" data-resultados-suc>${lista.map(s => C.TarjetaSucursal(s, { grande: true })).join('')}</div>`);
  return pagina(`${intro}<div class="ListaSucursales" data-vista="lista"><div class="lista">${busq}<div data-resultados-suc>${res}</div></div>${C.MapaIlustrado(SUCURSALES, { sugerida: cercana ? cercana.id : null })}</div>`);
}

export const ayuda = () => pagina(`${cabeza(T('h1', 'Preguntas ', 'frecuentes'), 'Lo que más nos preguntan en barra.')}<div class="faq"><div class="lista">${FAQ.map(([q, a], i) => `<details class="acordeon-item"${i === 0 ? ' open' : ''}><summary>${q}<span class="ic-mas">${ic('mas', 22)}</span><span class="ic-menos">${ic('menos', 22)}</span></summary><p>${a}</p></details>`).join('')}</div><aside class="aside-ayuda">${C.Mascota('grano', { tam: 120 })}<h2 class="titulo">¿No encontraste tu respuesta?</h2><p>Escríbenos y te contestamos al correo que nos dejes.</p>${B({ texto: 'Ir a contacto', href: '#/contacto' })}</aside></div>`);

export function privacidad() {
  const secciones = [
    ['quien', 'Quiénes somos', '<p>BeanCraft Coffee es responsable del uso de tus datos personales en este sitio y en la app.</p>'],
    ['datos', 'Qué datos usamos', '<p>El sitio no pide datos para navegar. Solo usamos lo que escribas en el formulario de contacto:</p><ul><li>Nombre</li><li>Correo electrónico</li><li>Sucursal y mensaje</li></ul><p>Los datos de las cuentas de clientes se manejan en la app.</p>'],
    ['para', 'Para qué los usamos', '<p>Para responder tu mensaje. No los usamos para publicidad ni los vendemos.</p>'],
    ['ubicacion', 'Tu ubicación', '<p>Solo la pedimos cuando eliges “Usar mi ubicación” en Sucursales. La usamos en ese momento para ordenar las sucursales y no la guardamos.</p>'],
    ['cookies', 'Sin rastreo', '<p>Este sitio no usa cookies de terceros, analítica externa ni mapas incrustados. El acceso del personal guarda su sesión solo mientras la pestaña está abierta.</p>'],
    ['derechos', 'Tus derechos', '<p>Puedes pedir acceso, corrección, cancelación u oposición sobre tus datos desde la <a href="#/contacto">página de contacto</a>.</p>'],
  ];
  return pagina(`${cabeza(T('h1', 'Aviso de ', 'privacidad'), 'Texto de ejemplo: lo valida el área legal antes de publicar.')}<div class="legal"><nav class="indice" aria-label="En esta página"><span class="titulo">En esta página</span>${secciones.map(([id, t], i) => `<a href="#/privacidad?ir=${id}"${i === 0 ? ' aria-current="true"' : ''}>${t}</a>`).join('')}</nav><div class="contenido">${secciones.map(([id, t, h]) => `<section id="${id}"><h2>${t}</h2>${h}</section>`).join('')}<p class="actualizado">Última actualización: 22 de noviembre de 2026.</p></div></div>`);
}

export function contacto(bp, estado) {
  const err = estado === 'error';
  const form = estado === 'enviado'
    ? `<div class="enviado" role="status">${C.Mascota('taza', { tam: 140, estado: 'feliz' })}<h2 class="titulo">Recibimos tu mensaje</h2><p>Te responderemos al correo que nos dejaste.</p>${B({ tipo: 'secundario', texto: 'Volver al inicio', href: '#/' })}</div>`
    : `<form class="form-sitio" novalidate data-form-contacto>${err ? C.Aviso('error', 'Revisa el campo marcado para poder enviar tu mensaje.') : ''}<div class="dos">${C.Campo({ etiqueta: 'Nombre', valor: err ? 'Mariana Torres' : '', placeholder: 'Cómo te llamas', nombre: 'nombre' })}${C.Campo({ tipo: 'correo', etiqueta: 'Correo', placeholder: 'tu@correo.com', nombre: 'correo', error: err ? 'Falta tu correo. Escríbelo para continuar.' : null })}</div><label class="SelectNativo" data-ancho="completo"><span class="etiqueta">Sucursal</span><select name="sucursal" aria-label="Sucursal"><option value="">Elige una sucursal</option>${SUCURSALES.map(s => `<option${err && s.id === 'centro' ? ' selected' : ''}>${s.nombre}</option>`).join('')}</select>${ic('chevron-abajo', 18)}</label>${C.Campo({ tipo: 'area', etiqueta: 'Mensaje', valor: err ? 'Hola, ¿tienen leche de coco para el Refresher?' : '', placeholder: 'Cuéntanos qué necesitas', nombre: 'mensaje' })}<p class="nota">Usamos tus datos solo para responderte. Lee el <a href="#/privacidad">aviso de privacidad</a>.</p>${B({ texto: 'Enviar mensaje', submit: true })}</form>`;
  return pagina(`${cabeza(T('h1', 'Escríbenos, ', 'te', ' leemos'), 'Dudas, sugerencias o algo que salió mal. Los pedidos se hacen en la app.')}<div class="contacto">${form}<aside class="lista-sucursales-mini">${SUCURSALES.map(s => C.TarjetaSucursal(s)).join('')}</aside></div>`);
}

export const noEncontrada = () => `<section class="contenedor error404">${C.Mascota('grano', { tam: 180, estado: 'triste' })}<span class="codigo">Error 404</span>${T('h1', 'Esta página se nos ', 'enfrió', '.')}<p class="bajada">Puede que el enlace esté mal escrito o que la página ya no exista.</p>${B({ texto: 'Volver al inicio', href: '#/' })}</section>`;

export const design = () => libreriaViva();
