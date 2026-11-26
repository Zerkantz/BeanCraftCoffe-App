// Pantallas del panel web A-01 a A-20 (alcance SRS: RF-12 a RF-21, RF-23).
// Cada pantalla es una función (estado) → HTML. Leen los datos vivos: el tablero, los cupones, los usuarios y los
// comentarios cambian con las acciones y la sesión decide qué ve cada rol (auth/permisos.js).
import * as C from '../../componentes/base.js';
import { ic } from '../../lib/iconos.js';
import { P, PRODUCTOS, OPCIONES, precioLinea, resumenLinea } from '../../data/catalogo.js';
import { PEDIDOS, ESTADOS, totales } from '../../data/pedidos.js';
import { SUCURSALES, SUC } from '../../data/sucursales.js';
import { CUPONES, filaCupon } from '../../data/cupones.js';
import { USUARIOS, usuarioPorCorreo } from '../../data/usuarios.js';
import { COMENTARIOS, RESPALDOS, DASH, NOTIFICACIONES } from '../../data/panel.js';
import { foto as ilustracion } from '../../lib/foto.js';
import { ahora } from '../../lib/reglas.js';
import { pedidosVisibles } from '../../auth/permisos.js';

// Contexto de la pantalla que se está dibujando: sesión y parámetros de la ruta (?pedido=, ?codigo=, ?correo=…).
let CTX = { sesion: null, params: {} };
export const fijarContexto = ctx => { CTX = ctx; };
const SES = () => CTX.sesion || { rol: 'admin', nombre: 'Ricardo Martínez', ini: 'RM', rolTxt: 'Administrador', correo: 'ricardo@beancraft.mx', sucId: null, suc: 'Todas' };
const PAR = k => CTX.params[k] || '';

const { Boton: B, mxn } = C;
const card = (titulo, cuerpo, { sub, derecha = '', estilo = '' } = {}) => `<section class="tarjeta-panel"${estilo ? ` style="${estilo}"` : ''}><div class="cabeza"><div><h2>${titulo}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${derecha}</div>${cuerpo}</section>`;
const ins = (texto, tono, icono) => `<span class="insignia-simple" data-tono="${tono}">${icono ? ic(icono, 14) : ''}${texto}</span>`;
// [icono, etiqueta, destino] · destino = archivo o "toast:texto"
const accionesFila = (...xs) => `§<div class="acciones-fila">${xs.map(([icn, lab, dest]) => C.IconoCirculo({ icono: icn, label: lab, tam: 40, href: dest && !dest.startsWith('toast:') ? dest : null, x: dest && dest.startsWith('toast:') ? ` data-toast="${dest.slice(6)}" data-toast-tipo="info"` : '' })).join('')}</div>`;
const mini = p => `<div class="celda-producto"><span class="mini imagen-fondo" data-fondo="${p.fondo}">${ilustracion(p, 36, 'ilus-mini')}</span><span>${p.nombre}</span>${p.frappe ? C.Etiqueta({ tipo: 'info', texto: 'Frappé' }) : ''}</div>`;
const persona = u => `<div class="celda-persona">${C.Avatar(u.ini, 36)}<div class="datos"><strong>${u.nombre}</strong><span>${u.correo}</span></div></div>`;
const filtroSuc = (valor = 'Todas', estado) => C.Filtro({ etiqueta: 'Sucursal', valor, estado, opciones: ['Todas', 'Centro', 'Kino', 'Bosque'] });
const filtroFechas = (valor = 'Últimos 7 días', estado) => C.Filtro({ tipo: 'fechas', etiqueta: 'Fechas', valor, estado, icono: 'calendario' });
const chipsFiltro = (ops, atributo = 'grupo') => `<div class="chips-panel" role="radiogroup" aria-label="Filtrar">${ops.map(([t, n, v], i) => C.Chip({ texto: `${t} · ${n}`, sel: i === 0, tam: 40, x: ` data-filtro-fila="${v}" data-atributo="${atributo}"` })).join('')}</div>`;

/* A-01 Iniciar sesión */
function login(estado) {
  const err = estado === 'error', des = estado === 'desactivado', carg = estado === 'cargando';
  const aviso = err ? C.Aviso('error', 'El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.') : des ? C.Aviso('error', 'Pide a un administrador que lo active para poder entrar.', { titulo: 'Tu usuario está desactivado' }) : '';
  const fEst = carg ? 'deshabilitado' : undefined;
  const correo = estado === 'vacio' ? (PAR('correo') || '') : des ? 'montse@beancraft.mx' : err ? 'daniela@beancrft.mx' : 'daniela@beancraft.mx';
  return `<form class="tarjeta-acceso" novalidate data-login>${C.Logo({ tam: 36, sub: 'Panel' })}<div class="encabezado"><p class="antetitulo">Acceso del personal</p><h1 class="titulo">Bienvenido a la barra</h1><p class="nota">Entra con el correo que te dio de alta tu administrador.</p></div>${aviso}<div class="campos">${C.Campo({ tipo: 'correo', etiqueta: 'Correo', valor: correo, placeholder: 'tu@beancraft.mx', estado: err ? 'error' : fEst, nombre: 'correo' })}${C.Campo({ tipo: 'contrasena', etiqueta: 'Contraseña', valor: estado === 'vacio' ? '' : 'x', placeholder: 'Tu contraseña', estado: err ? 'error' : fEst, nombre: 'clave' })}</div>${B({ texto: carg ? 'Entrando…' : 'Iniciar sesión', ancho: 'completo', estado: carg ? 'cargando' : 'normal', submit: true })}<p class="nota olvido">${ic('candado', 16)}<span>¿Olvidaste tu contraseña? Pide a un administrador que la restablezca.</span></p><p class="pista-proto">${ic('info', 14)}<span>Usuarios de prueba: <strong>ricardo@beancraft.mx</strong> · Admin1234 (administrador) y <strong>daniela@beancraft.mx</strong> · Barra1234 (personal, Centro).</span></p></form>`;
}

/* A-02 Resumen */
function resumen(estado) {
  const sin = estado === 'sin-datos', carg = estado === 'cargando';
  const kEst = carg ? 'cargando' : 'normal';
  const kpis = sin
    ? [['Pedidos', '0', 'recibo'], ['Ventas', '$0', 'grafica'], ['Ticket promedio', '—', 'recibo'], ['Calificación promedio', '—', 'estrella'], ['Cupones usados', '0', 'cupon']].map(([e, v, i]) => C.TarjetaKPI({ etiqueta: e, valor: v, icono: i }))
    : [C.TarjetaKPI({ etiqueta: 'Pedidos', valor: '128', tendencia: 'sube', delta: '+8 % vs. semana anterior', icono: 'recibo', estado: kEst }), C.TarjetaKPI({ etiqueta: 'Ventas', valor: '$9,840', tendencia: 'sube', delta: '+11 % vs. semana anterior', icono: 'grafica', estado: kEst }), C.TarjetaKPI({ etiqueta: 'Ticket promedio', valor: '$76.88', tendencia: 'sube', delta: '+2 % vs. semana anterior', icono: 'recibo', estado: kEst }), C.TarjetaKPI({ etiqueta: 'Calificación promedio', valor: '4.6 de 5', icono: 'estrella', estado: kEst }), C.TarjetaKPI({ etiqueta: 'Cupones usados', valor: '40', tendencia: 'baja', delta: '−3 vs. semana anterior', icono: 'cupon', estado: kEst })];
  const gEst = sin ? 'sin-datos' : carg ? 'cargando' : 'datos';
  const toggle = `<div class="chips-panel" role="radiogroup" aria-label="Agrupar">${C.Chip({ texto: 'Por día', sel: true, tam: 40 })}${C.Chip({ texto: 'Por semana', tam: 40, x: ' data-toast="Vista por semana: 26 oct a 16 nov." data-toast-tipo="info"' })}</div>`;
  const ultimos = C.TablaDatos({ columnas: ['Pedido', 'Sucursal', 'Total', 'Estado'], alinear: { 2: 'der' }, estado: sin ? 'vacia' : carg ? 'cargando' : 'datos', vacio: C.EstadoVacio({ titulo: 'Sin pedidos en este rango', texto: 'Prueba con otro rango o sucursal.', contexto: 'panel' }), filas: PEDIDOS.slice(0, 6).map(p => ({ ir: 'A-03-pedidos--default.html', celdas: [`<strong>#${p.id}</strong> · ${p.hora} am`, SUC[p.suc].nombre, mxn(totales(p).total, 2), C.InsigniaEstado(p.estado, 'panel')] })) });
  const cupones = C.TablaDatos({ columnas: ['Cupón', 'Usos', 'Descuento'], alinear: { 1: 'der', 2: 'der' }, estado: sin ? 'vacia' : carg ? 'cargando' : 'datos', vacio: C.EstadoVacio({ titulo: 'Sin cupones usados', texto: 'Nadie usó cupones en este rango.', contexto: 'panel' }), filas: DASH.cupones.map(([c, u, d]) => ({ ir: 'A-10-cupones--default.html', celdas: [`<span class="codigo-texto">${c}</span>`, u, '−' + mxn(d)] })) });
  const barra = C.BarraSuperiorPanel({ titulo: 'Resumen', sub: sin ? 'Hoy · viernes 20 nov 2026 · Bosque' : 'Últimos 7 días · 14 al 20 nov 2026 · todas las sucursales', filtros: filtroSuc(sin ? 'Bosque' : 'Todas', sin ? 'aplicado' : undefined) + filtroFechas(sin ? 'Hoy' : 'Últimos 7 días', estado === 'filtros-abiertos' ? 'abierto' : sin ? 'aplicado' : undefined) });
  const bVentas = card('Ventas', C.GraficaLinea(DASH.dias, { titulo: 'Ventas por día, últimos 7 días', ancho: 540, estado: gEst }), { sub: 'MXN por día', derecha: toggle });
  const bTop = card('Productos más pedidos', C.GraficaBarras(DASH.top, { estado: gEst, formato: v => `${v} pedidos` }), { sub: 'Top 5 del rango', derecha: B({ tipo: 'texto', texto: 'Ver productos', iconoDer: 'chevron-der', tam: 40, href: 'A-05-productos--default.html' }) });
  const bEstado = card('Pedidos por estado', C.GraficaBarras(DASH.porEstado, { estado: gEst, serie: ['menta', 'miel', 'verde', 'tostado'], etiquetas: DASH.porEstado.map(([e]) => C.InsigniaEstado(e, 'panel')) }), { sub: 'Del rango elegido' });
  const bSucursal = card('Pedidos por sucursal', C.GraficaBarras(DASH.porSucursal, { estado: gEst, serie: ['verde', 'miel', 'lila'] }), { sub: 'Del rango elegido' });
  const bCal = card('Calificación promedio', `${C.GraficaBarras(DASH.calProd, { estado: gEst, serie: 'miel', formato: v => v.toFixed(1) + ' ★' })}<p class="nota">Por producto. Por sucursal: Centro 4.7 · Kino 4.5 · Bosque 4.6.</p>`, { sub: 'Escala de 1 a 5', derecha: B({ tipo: 'texto', texto: 'Ver comentarios', iconoDer: 'chevron-der', tam: 40, href: 'A-12-calificaciones--default.html' }) });
  const bCupones = card('Uso de cupones', cupones, { sub: 'Usos y descuento aplicado' });
  const bUltimos = card('Últimos pedidos', ultimos, { derecha: B({ tipo: 'texto', texto: 'Ver todos', iconoDer: 'chevron-der', tam: 40, href: 'A-03-pedidos--default.html' }) });
  const bloque = (titulo, html) => `<div class="bloque-resumen"><p class="rotulo-bloque">${titulo}</p>${html}</div>`;
  return `${barra}<div class="grid-kpi">${kpis.join('')}</div>${bloque('Ventas y productos', `<div class="grid-2 grid-ancha">${bVentas}${bTop}</div>`)}${bloque('Pedidos', `<div class="grid-2">${bEstado}${bSucursal}</div>${bUltimos}`)}${bloque('Clientes y cupones', `<div class="grid-2">${bCal}${bCupones}</div>`)}<p class="leyenda-dato">Datos de ejemplo. Cada número sale de los pedidos de prueba cargados en MySQL (RF-20).</p>`;
}

/* A-04 Detalle de pedido (panel lateral) */
function detalle(ped, { cerrar = '', irAccion = '' } = {}) {
  const t = totales(ped);
  const idx = ESTADOS.findIndex(e => e.id === ped.estado);
  const base = Number(ped.hora.split(':')[1]);
  const horas = ESTADOS.map((_, i) => `${ped.hora.split(':')[0]}:${String(Math.min(59, base + i * 4)).padStart(2, '0')}`);
  const cuerpo = `<div class="seccion-panel"><div style="display:flex;gap:8px;flex-wrap:wrap">${C.InsigniaEstado(ped.estado, 'panel')}${ped.programado ? C.Etiqueta({ tipo: 'info', texto: ped.recoger, icono: 'reloj' }) : ins('Recoger ahora', 'espuma', 'reloj')}</div><dl class="lista-def"><dt>Cliente</dt><dd>${ped.cliente}</dd><dt>Teléfono</dt><dd>${ped.tel}</dd><dt>Sucursal</dt><dd>${SUC[ped.suc].nombre}</dd><dt>Recoger</dt><dd>${ped.recoger}</dd><dt>Pago</dt><dd>${ped.pago} · se cobra en mostrador</dd></dl></div><div class="seccion-panel"><h3>Productos</h3><div class="lineas-detalle">${ped.lineas.map(l => `<div class="linea"><span class="mini imagen-fondo" data-fondo="${P[l.prod].fondo}" style="display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:8px;border:1.5px solid var(--c-tostado)">${ilustracion(P[l.prod], 44, 'ilus-mini')}</span><div class="detalle"><strong>${l.cant} × ${P[l.prod].nombre}</strong><span>${resumenLinea(l)}</span></div><span class="monto">${mxn(precioLinea(l) * l.cant, 2)}</span></div>`).join('')}</div><div class="desglose"><div class="fila"><span>Subtotal</span><span>${mxn(t.sub, 2)}</span></div><div class="fila"><span>Descuento${ped.cupon ? ` · cupón ${ped.cupon.codigo}` : ''}</span><span>−${mxn(t.desc, 2)}</span></div><div class="total"><span>Total</span><span>${mxn(t.total, 2)}</span></div></div></div><div class="seccion-panel"><h3>Historial de estados</h3><ol class="historial">${ESTADOS.map((e, i) => `<li${i > idx ? ' data-pendiente="si"' : ''}>${C.InsigniaEstado(e.id, 'panel')}<span>${i <= idx ? `${horas[i]} am · aviso enviado al cliente` : 'Pendiente'}</span></li>`).join('')}</ol></div>${ped.cal ? `<div class="seccion-panel"><h3>Calificación del cliente</h3>${C.Estrellas(ped.cal)}<p class="comentario"><span class="txt">“${ped.comentario}”</span></p><p class="leyenda-dato">${ped.lineas.map(l => `${P[l.prod].nombre}: ${ped.cal} ★`).join(' · ')}</p></div>` : `<div class="seccion-panel"><h3>Calificación del cliente</h3><p class="leyenda-dato">Se habilita cuando el pedido está entregado (RN-05).</p></div>`}`;
  const e = ESTADOS[idx];
  const cerrarBtn = B({ tipo: 'secundario', texto: 'Cerrar', tam: 40, href: cerrar || null, x: cerrar ? '' : ' data-cerrar-capa' });
  const pie = e.accion ? `${cerrarBtn}${B({ tipo: ped.estado === 'listo' ? 'acento' : 'principal', texto: e.accion, tam: 40, iconoDer: 'chevron-der', href: irAccion || null, x: irAccion ? '' : ` data-avanzar-detalle data-id="${ped.id}"` })}` : cerrarBtn;
  return C.PanelLateral({ titulo: `Pedido #${ped.id}`, sub: `${SUC[ped.suc].nombre} · hoy, ${ped.hora} am`, cuerpo, pie, cerrar });
}

/* A-03 Pedidos: tablero con los pedidos vivos. Avanza solo al siguiente estado (RN-04).
   Administrador: las tres sucursales. Personal: solo la suya (RF-16). */
function tablero(estado, { rol } = {}) {
  const ses = rol === 'personal' && SES().rol !== 'personal' ? { rol: 'personal', sucId: 'centro', suc: 'Centro' } : SES();
  let ps = pedidosVisibles(ses, PEDIDOS);
  // Estados fijos solo para capturar en Figma: no tocan los datos vivos.
  if (estado === 'toast' || estado === 'columna-vacia') {
    ps = ps.map(p => ({ ...p }));
    if (estado === 'toast') { const x = ps.find(p => p.id === 1039); if (x) x.estado = 'listo'; }
    if (estado === 'columna-vacia') ps.filter(p => p.estado === 'listo').forEach(p => { p.estado = 'entregado'; });
  }
  const col = e => ps.filter(p => p.estado === e);
  const personal = ses.rol === 'personal';
  const lugar = personal ? `${ses.suc}` : 'Todas las sucursales';
  const barra = C.BarraSuperiorPanel({ titulo: 'Pedidos', sub: `${lugar} · hoy, viernes 20 de noviembre`, filtros: `<div data-buscar-pedido>${C.Campo({ tipo: 'busqueda', placeholder: '#pedido o cliente', densidad: 'panel' })}</div>` + (personal ? C.Filtro({ etiqueta: 'Sucursal', valor: `${ses.suc} (tu sucursal)`, icono: 'candado', ir: '#/panel/sin-permiso' }) : filtroSuc('Todas')) + filtroFechas('Hoy') });
  const regla = `<p class="leyenda-dato">${ic('info', 14)} Toca una tarjeta para ver el detalle. Cada tarjeta solo ofrece el siguiente estado: recibido → preparando → listo → entregado (RN-04).</p>`;
  return `${barra}${regla}<div class="tablero" data-tablero>${ESTADOS.map(e => C.ColumnaPedidos(e.id, col(e.id), { vacia: 'Nada por aquí', mostrarSuc: !personal })).join('')}</div>`;
}
export const detallePedido = id => { const p = PEDIDOS.find(x => String(x.id) === String(id)); return p ? detalle(p, { cerrar: '#/panel/pedidos' }) : ''; };

/* A-05 Productos */
function productos(estado) {
  const filtro = estado === 'filtro', vacio = estado === 'vacio';
  const todos = [...PRODUCTOS].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const visibles = filtro ? todos.filter(p => p.categoria === 'Cafés' && /latte/i.test(p.nombre)) : todos;
  const tabla = C.TablaDatos({
    nombre: 'productos', columnas: ['Producto', 'Categoría', 'Precio base', 'Personalizable', 'Calificación', 'Activo', ''], alinear: { 2: 'der', 6: 'der' },
    estado: vacio ? 'vacia' : 'datos', vacio: C.EstadoVacio({ titulo: 'No hay productos con “pan dulce”', texto: 'Revisa la búsqueda o quita los filtros.', accion: B({ tipo: 'secundario', texto: 'Limpiar filtros', icono: 'x', tam: 40, href: 'A-05-productos--default.html' }), contexto: 'panel' }),
    filas: visibles.map((p, i) => ({ estado: p.activo ? 'normal' : 'inactiva', oculta: !filtro && i >= 10, celdas: [mini(p), p.categoria, mxn(p.precio, 2), p.personalizable ? 'Sí' : 'No', `${p.cal.toFixed(1)} ★`, '§' + C.Interruptor({ marcado: p.activo, x: ` data-toast="${p.nombre}: disponibilidad actualizada en la app."` }), accionesFila(['editar', `Editar ${p.nombre}`, 'A-06-producto--edicion.html'], ['eliminar', `Eliminar ${p.nombre}`, 'A-20-confirmacion--eliminar-producto.html'])] })),
    pie: filtro || vacio ? '' : C.Paginacion({ pagina: 1 }),
    x: filtro || vacio ? ' data-filas' : ' data-filas data-paginada',
  });
  const barra = C.BarraSuperiorPanel({ titulo: 'Productos', sub: '25 productos · 23 activos · 3 categorías', accion: B({ texto: 'Nuevo producto', icono: 'mas', tam: 40, href: 'A-06-producto--alta.html' }) });
  const filtros = `<div class="barra-filtros"><div data-buscar-tabla>${C.Campo({ tipo: 'busqueda', valor: filtro ? 'latte' : vacio ? 'pan dulce' : '', placeholder: 'Buscar producto', densidad: 'panel' })}</div>${C.Filtro({ tipo: 'categoria', etiqueta: 'Categoría', valor: filtro ? 'Cafés' : 'Todas', estado: filtro ? 'aplicado' : undefined, icono: 'filtro', ir: filtro ? 'A-05-productos--default.html' : 'A-05-productos--filtro.html' })}${chipsFiltro([['Todos', 25, 'todos'], ['Activos', 23, 'normal'], ['Inactivos', 2, 'inactiva']], 'estado')}${C.Filtro({ etiqueta: 'Ordenar', valor: 'Nombre A–Z', icono: 'ordenar', opciones: ['Nombre A–Z', 'Precio menor', 'Precio mayor', 'Mejor calificados'] })}</div>`;
  return `${barra}${filtros}${filtro ? `<p class="leyenda-dato">3 resultados para “latte” en Cafés.</p>` : ''}${tabla}`;
}

/* A-06 Producto · formulario */
function productoForm(estado) {
  const alta = estado === 'alta', err = estado === 'errores';
  const p = P.iced_latte;
  const v = x => (alta ? '' : x);
  const datos = C.Formulario({ titulo: 'Datos generales', columnas: 2, cuerpo: `${C.Campo({ etiqueta: 'Nombre del producto', valor: err ? '' : v(p.nombre), placeholder: 'Ej. Latte de vainilla', densidad: 'panel', error: err ? 'Falta el nombre del producto.' : null })}${C.Select({ etiqueta: 'Categoría', valor: alta ? 'Elige una categoría' : 'Cafés', densidad: 'panel', opciones: ['Elige una categoría', 'Cafés', 'Bebidas frías', 'Repostería'] })}${C.Campo({ tipo: 'numero', etiqueta: 'Precio base (MXN)', valor: err ? '0.00' : v('56.00'), placeholder: '0.00', densidad: 'panel', error: err ? 'El precio debe ser mayor a $0.' : null, ayuda: 'El precio final suma tamaño, leche, endulzante y extras (RN-02).' })}${C.Select({ etiqueta: 'Mascota del sticker', valor: alta ? 'Elige una mascota' : 'Taza', densidad: 'panel', opciones: ['Elige una mascota', 'Grano', 'Taza', 'Espuma', 'Hielito', 'Croissant'] })}<div class="ocupa-2">${C.Campo({ tipo: 'area', etiqueta: 'Descripción', valor: v(p.desc), placeholder: 'Qué lleva y cómo sabe, en una o dos frases', densidad: 'panel' })}</div><div class="ocupa-2 subida"><span class="vista">${alta ? ic('subir', 28) : ilustracion(p, 80, 'ilus-mini')}</span><div class="textos"><strong>${alta ? 'Sube la foto del producto' : 'iced_latte.png'}</strong><span>PNG o WebP con fondo transparente, mínimo 600 px de alto.</span>${B({ tipo: 'secundario', texto: alta ? 'Elegir archivo' : 'Cambiar foto', icono: 'subir', tam: 40, x: ' data-toast="Aquí se abre el selector de archivos." data-toast-tipo="info"' })}</div></div>` });
  const pers = C.Formulario({ titulo: 'Personalización', sub: 'Qué grupos de opciones puede elegir el cliente (RF-03).', cuerpo: `${C.Interruptor({ marcado: !alta, etiqueta: 'Se puede personalizar' })}<div class="casillas">${['Tamaño', 'Leche', 'Endulzante', 'Extras'].map(g => C.Casilla({ marcado: !alta, etiqueta: g })).join('')}</div>` });
  const disp = C.Formulario({ titulo: 'Disponibilidad', cuerpo: `${C.Interruptor({ marcado: true, etiqueta: 'Activo en el menú', etiquetas: ['Activo en el menú', 'Oculto en el menú'] })}<div class="casillas">${SUCURSALES.map(s => C.Casilla({ marcado: !alta || s.id !== 'plaza', etiqueta: s.nombre })).join('')}</div>` });
  const prev = card('Vista previa en el menú', alta ? C.EstadoVacio({ mascota: 'taza', titulo: 'Aún no hay vista previa', texto: 'Aparece al escribir el nombre, el precio y subir la foto.', contexto: 'panel' }) : `<div class="bp-escritorio">${C.TarjetaBebida(p).replace(/ data-ir="[^"]*"/, '')}</div>`, { sub: 'Así se ve en la app y en el sitio.' });
  const destino = alta ? 'A-06-producto--errores.html' : 'A-06-producto--guardado.html';
  const barra = C.BarraSuperiorPanel({ titulo: alta ? 'Nuevo producto' : `Editar ${p.nombre}`, sub: alta ? 'Productos' : 'Productos · Cafés', accion: B({ tipo: 'secundario', texto: estado === 'guardado' ? 'Volver a productos' : 'Cancelar', tam: 40, href: 'A-05-productos--default.html' }) + B({ texto: 'Guardar', icono: 'check', tam: 40, href: destino }) });
  return `${barra}${err ? C.Aviso('error', 'Revisa los 2 campos marcados para poder guardar.') : ''}<div class="grid-form"><div class="columna">${datos}${pers}${disp}</div><div class="columna">${prev}</div></div>`;
}

/* A-07 Opciones */
function opciones(estado) {
  const grupos = Object.entries(OPCIONES).map(([k, g]) => {
    const items = k === 'extras' ? [...g.items, ['vainilla', 'Jarabe de vainilla', 10, false]] : g.items;
    return card(g.titulo, C.TablaDatos({ columnas: ['Opción', 'Costo extra', 'Activa', ''], alinear: { 1: 'der', 3: 'der' }, filas: items.map(([id, t, c, act = true]) => {
      const edit = estado === 'edicion-en-linea' && k === 'leche' && id === 'avena';
      return { estado: edit ? 'edicion' : act ? 'normal' : 'inactiva', celdas: [t, edit ? `<div style="display:flex;justify-content:flex-end"><div style="width:120px">${C.Campo({ tipo: 'numero', valor: '12.00', estado: 'foco', densidad: 'panel' })}</div></div>` : '+' + mxn(c, 2), '§' + C.Interruptor({ marcado: act, x: ` data-toast="${t}: ${act ? 'desactivada' : 'activada'} en la app."` }), edit ? accionesFila(['x', `Cancelar cambio de ${t}`, 'A-07-opciones--default.html'], ['check', `Guardar costo de ${t}`, 'A-07-opciones--default.html#hecho-opcion']) : accionesFila(['editar', `Editar ${t}`, 'A-07-opciones--edicion-en-linea.html'], ['eliminar', `Eliminar ${t}`, `toast:Para quitar ${t}, mejor desactívala: hay pedidos que la usan.`])] };
    }) }), { sub: g.unica ? 'El cliente elige una' : 'El cliente elige varias', derecha: B({ tipo: 'texto', texto: 'Agregar opción', icono: 'mas', tam: 40, href: 'A-07-opciones--edicion-en-linea.html' }) });
  });
  const cats = card('Categorías', C.TablaDatos({ columnas: ['Categoría', 'Productos', 'Activa', ''], alinear: { 1: 'der', 3: 'der' }, filas: [['Cafés', 6, 'cafes'], ['Bebidas frías', 14, 'frias'], ['Repostería', 5, 'reposteria']].map(([c, n]) => ({ celdas: [c, n, '§' + C.Interruptor({ marcado: true, x: ` data-toast="${c}: visibilidad actualizada."` }), accionesFila(['editar', `Editar ${c}`, `toast:Renombrar ${c} se hace aquí mismo (prototipo).`])] })) }), { sub: 'RF-02: cafés, bebidas frías y repostería', derecha: B({ tipo: 'texto', texto: 'Agregar categoría', icono: 'mas', tam: 40, x: ' data-toast="La v1 trabaja con las 3 categorías del SRS." data-toast-tipo="info"' }) });
  return `${C.BarraSuperiorPanel({ titulo: 'Categorías y opciones', sub: 'Un cambio de costo se refleja en el siguiente precio que calcule la app (RF-13).' })}${cats}<div class="grid-2 grid-tablas">${grupos.join('')}</div>`;
}

/* A-08 Sucursales */
function sucursalesPanel(estado) {
  const tabla = C.TablaDatos({ columnas: ['Sucursal', 'Dirección', 'Horario de hoy', 'Ahora', 'Pedidos hoy', 'Activa', ''], alinear: { 4: 'der', 6: 'der' }, estado: estado === 'vacio' ? 'vacia' : 'datos', vacio: C.EstadoVacio({ mascota: 'grano', titulo: 'Aún no hay sucursales', texto: 'Agrega la primera para que aparezca en la app.', accion: B({ texto: 'Nueva sucursal', icono: 'mas', tam: 40, href: 'A-09-sucursal--alta.html' }), contexto: 'panel' }), filas: SUCURSALES.map(s => ({ celdas: [`<strong>${s.nombre}</strong>`, `${s.dir}<br><span class="leyenda-dato">${s.ref}</span>`, s.hoy, C.InsigniaHorario(s.abierta), s.pedidosHoy, '§' + C.Interruptor({ marcado: true, x: ` data-toast="${s.nombre}: visibilidad en la app actualizada."` }), accionesFila(['editar', `Editar ${s.nombre}`, 'A-09-sucursal--edicion.html'], ['eliminar', `Eliminar ${s.nombre}`, `toast:${s.nombre} tiene pedidos: desactívala en lugar de eliminarla.`])] })) });
  return `${C.BarraSuperiorPanel({ titulo: 'Sucursales', sub: estado === 'vacio' ? '0 sucursales' : '3 sucursales · hoy viernes, 8:15 am', accion: B({ texto: 'Nueva sucursal', icono: 'mas', tam: 40, href: 'A-09-sucursal--alta.html' }) })}${tabla}`;
}

/* A-09 Sucursal · formulario */
function sucursalForm(estado) {
  const alta = estado === 'alta', err = estado === 'errores';
  const s = SUCURSALES[1];
  const v = x => (alta ? '' : x);
  const dias = [['Lunes', '7:30 am', '8:00 pm', true], ['Martes', '7:30 am', '8:00 pm', true], ['Miércoles', '7:30 am', '8:00 pm', true], ['Jueves', '7:30 am', '8:00 pm', true], ['Viernes', '7:30 am', '8:00 pm', true], ['Sábado', '9:00 am', err ? '8:00 am' : '3:00 pm', true], ['Domingo', '', '', false]];
  const horario = `<div class="horario">${dias.map(([d, a, c, ab]) => `<div class="dia"><span class="nombre">${d}</span>${C.Interruptor({ marcado: alta ? true : ab, etiqueta: (alta || ab) ? 'Abre' : 'Cerrado', etiquetas: ['Abre', 'Cerrado'] })}${(alta || ab) ? C.Campo({ tipo: 'hora', valor: alta ? '' : a, placeholder: 'Abre', densidad: 'panel' }) + C.Campo({ tipo: 'hora', valor: alta ? '' : c, placeholder: 'Cierra', densidad: 'panel', error: err && d === 'Sábado' ? 'Debe ser después de la apertura.' : null }) : '<span class="leyenda-dato">No abre este día</span><span></span>'}</div>`).join('')}</div>`;
  const datos = C.Formulario({ titulo: 'Datos de la sucursal', columnas: 2, cuerpo: `${C.Campo({ etiqueta: 'Nombre', valor: v(s.nombre), placeholder: 'Ej. Centro', densidad: 'panel' })}${C.Campo({ etiqueta: 'Coordenadas', valor: s.lat ? v(`${s.lat}, ${s.lon}`) : '', placeholder: '32.477, -114.778', densidad: 'panel', ayuda: 'Latitud y longitud para “Cómo llegar”.' })}<div class="ocupa-2">${C.Campo({ etiqueta: 'Dirección', valor: v(s.dir), placeholder: 'Calle, número y colonia', densidad: 'panel' })}</div><div class="ocupa-2">${C.Campo({ etiqueta: 'Referencia', valor: v(s.ref), placeholder: 'Cómo encontrarla', densidad: 'panel', ayuda: 'Se muestra como “Referencia” en el sitio y en la app.' })}</div>` });
  const ubic = C.Formulario({ titulo: 'Ubicación', sub: 'Se usa para sugerir la sucursal más cercana (RF-04).', columnas: 2, cuerpo: `${C.Campo({ tipo: 'numero', etiqueta: 'Latitud', valor: v('32.4612'), placeholder: '32.4560', densidad: 'panel' })}${C.Campo({ tipo: 'numero', etiqueta: 'Longitud', valor: v('-114.7633'), placeholder: '-114.7710', densidad: 'panel' })}` });
  const hor = C.Formulario({ titulo: 'Horario', sub: 'Los pedidos programados solo se aceptan dentro de este horario (RN-03).', cuerpo: horario });
  const prev = card('Vista previa', alta ? C.EstadoVacio({ mascota: 'grano', titulo: 'Aún no hay vista previa', texto: 'Aparece al llenar nombre, dirección y horario.', contexto: 'panel' }) : `<div class="bp-escritorio">${C.TarjetaSucursal(s)}</div>${C.MapaIlustrado([s])}`, { sub: 'Así aparece en el sitio y en la app.' });
  const barra = C.BarraSuperiorPanel({ titulo: alta ? 'Nueva sucursal' : `Editar ${s.nombre}`, sub: 'Sucursales', accion: B({ tipo: 'secundario', texto: 'Cancelar', tam: 40, href: 'A-08-sucursales--default.html' }) + B({ texto: 'Guardar', icono: 'check', tam: 40, href: alta ? 'A-09-sucursal--errores.html' : 'A-08-sucursales--default.html#hecho-sucursal' }) });
  return `${barra}${err ? C.Aviso('error', 'El horario del sábado cierra antes de abrir. Corrígelo para guardar.') : ''}<div class="grid-form"><div class="columna">${datos}${ubic}${hor}</div><div class="columna">${prev}</div></div>`;
}

/* A-10 Cupones */
function cupones(estado) {
  const tono = { activo: ['Activo', 'verde', 'check'], desactivado: ['Desactivado', 'espuma', 'x'], vencido: ['Vencido', 'tostado', 'reloj'] };
  const tabla = C.TablaDatos({ nombre: 'cupones', columnas: ['Código', 'Descripción', 'Tipo', 'Valor', 'Vigencia', 'Usos', 'Estado', 'Activo', ''], alinear: { 3: 'der', 5: 'der', 8: 'der' }, estado: estado === 'vacio' ? 'vacia' : 'datos', vacio: C.EstadoVacio({ mascota: 'croissant', titulo: 'Aún no hay cupones', texto: 'Crea uno y comparte su QR en barra o en redes.', accion: B({ texto: 'Nuevo cupón', icono: 'mas', tam: 40, href: 'A-11-cupon--alta.html' }), contexto: 'panel' }), x: ' data-filas', filas: CUPONES.map(x => filaCupon(x, ahora())).map(c => ({ estado: c.estado === 'activo' ? 'normal' : 'inactiva', grupo: c.estado, celdas: [`<span class="codigo-texto">${c.codigo}</span>`, c.desc, c.tipo, c.valor, `${c.desde} – ${c.hasta}`, c.usos, '§' + ins(...tono[c.estado]), '§' + C.Interruptor({ marcado: c.estado === 'activo', estado: c.estado === 'vencido' ? 'deshabilitado' : 'normal', x: c.estado === 'activo' ? ` data-ir="#/panel/confirmacion?estado=desactivar-cupon&codigo=${c.codigo}"` : c.estado === 'desactivado' ? ` data-activar-cupon="${c.codigo}"` : '' }), accionesFila(['qr', `Ver QR de ${c.codigo}`, `#/panel/cupon?estado=edicion&codigo=${c.codigo}`], ['editar', `Editar ${c.codigo}`, 'A-11-cupon--edicion.html'], ['eliminar', `Eliminar ${c.codigo}`, `toast:${c.codigo} ya tiene usos: desactívalo para conservar el historial.`])] })) });
  const chips = `<div class="barra-filtros"><div data-buscar-tabla>${C.Campo({ tipo: 'busqueda', placeholder: 'Buscar código', densidad: 'panel' })}</div>${chipsFiltro([['Todos', 6, 'todos'], ['Activos', 4, 'activo'], ['Desactivados', 1, 'desactivado'], ['Vencidos', 1, 'vencido']])}</div>`;
  return `${C.BarraSuperiorPanel({ titulo: 'Cupones', sub: 'Un cupón por pedido · cada cupón se usa una vez por cliente (RN-01)', accion: B({ texto: 'Nuevo cupón', icono: 'mas', tam: 40, href: 'A-11-cupon--alta.html' }) })}${estado === 'vacio' ? '' : chips}${tabla}`;
}

/* A-11 Cupón · formulario y QR */
function cuponForm(estado) {
  const cup = CUPONES.find(c => c.code === PAR('codigo')) || CUPONES.find(c => c.code === 'OTONO20');
  const alta = estado === 'alta', err = estado === 'errores';
  const v = x => (alta ? '' : x);
  const datos = C.Formulario({ titulo: 'Datos del cupón', columnas: 2, cuerpo: `${C.Campo({ etiqueta: 'Código', valor: err ? 'AVENA10' : v(cup.code), placeholder: 'Ej. VERANO10', densidad: 'panel', error: err ? 'Ese código ya existe. Usa otro.' : null, ayuda: 'Es lo que contiene el QR.' })}${C.Campo({ etiqueta: 'Descripción', valor: v(cup.label), placeholder: 'Qué descuenta y en qué', densidad: 'panel' })}<div class="seccion-panel"><span class="etiqueta" style="font-size:13px;font-weight:600">Tipo</span><div class="casillas" role="radiogroup">${C.Radio({ marcado: !alta, etiqueta: 'Porcentaje' })}${C.Radio({ etiqueta: 'Monto fijo (MXN)' })}</div></div>${C.Campo({ tipo: 'numero', etiqueta: 'Valor', valor: v(filaCupon(cup).valor), placeholder: '0', densidad: 'panel' })}${C.Campo({ tipo: 'fecha', etiqueta: 'Vigente desde', valor: v(filaCupon(cup).desde), placeholder: 'dd mmm aaaa', densidad: 'panel' })}${C.Campo({ tipo: 'fecha', etiqueta: 'Vigente hasta', valor: err ? '25 oct 2026' : v(filaCupon(cup).hasta), placeholder: 'dd mmm aaaa', densidad: 'panel', error: err ? 'La fecha final debe ser después de la inicial.' : null })}` });
  const reglas = C.Formulario({ titulo: 'Reglas', cuerpo: `<p class="leyenda-dato">Se acepta un cupón por pedido y cada cliente lo usa una sola vez. Un cupón desactivado deja de aceptarse de inmediato (RF-15).</p>${C.Interruptor({ marcado: true, etiqueta: 'Activo', etiquetas: ['Activo', 'Desactivado'] })}` });
  const qr = card('Código QR', C.TarjetaQR(alta || err ? '' : cup.code, { generado: !(alta || err) }).replace('<span class="texto">Descargar QR</span>', '<span class="texto">Descargar QR</span>').replace('class="Boton" data-tipo="secundario" data-estado="normal" data-tam="40" type="button"', 'class="Boton" data-tipo="secundario" data-estado="normal" data-tam="40" type="button" data-toast="Descargando ${cup.code}.png (prototipo)."').replace('class="Boton" data-tipo="texto" data-estado="normal" data-tam="40" type="button"', 'class="Boton" data-tipo="texto" data-estado="normal" data-tam="40" type="button" data-toast="Código copiado."'), { sub: 'El cliente lo escanea en la app (RF-06).' });
  const barra = C.BarraSuperiorPanel({ titulo: alta ? 'Nuevo cupón' : `Editar ${cup.code}`, sub: 'Cupones', accion: B({ tipo: 'secundario', texto: 'Cancelar', tam: 40, href: 'A-10-cupones--default.html' }) + B({ texto: alta ? 'Guardar y generar QR' : 'Guardar', icono: 'check', tam: 40, href: alta ? 'A-11-cupon--edicion.html#hecho-cupon' : 'A-10-cupones--default.html#hecho-cupon' }) });
  return `${barra}${err ? C.Aviso('error', 'Revisa los 2 campos marcados para poder guardar.') : ''}<div class="grid-form"><div class="columna">${datos}${reglas}</div><div class="columna">${qr}</div></div>`;
}

/* A-12 Calificaciones */
function calificaciones(estado) {
  const vacio = estado === 'vacio';
  const kpis = `<div class="grid-kpi" style="grid-template-columns:repeat(4,minmax(0,1fr))">${C.TarjetaKPI({ etiqueta: 'Promedio general', valor: vacio ? '—' : '4.6 de 5', icono: 'estrella' })}${DASH.calSuc.map(([s, v]) => C.TarjetaKPI({ etiqueta: s, valor: vacio ? '—' : `${v.toFixed(1)} de 5`, icono: 'tienda' })).join('')}</div>`;
  const filtros = `<div class="barra-filtros">${C.Filtro({ tipo: 'producto', etiqueta: 'Producto', valor: 'Todos', icono: 'taza', opciones: ['Todos', 'Frappé Supremo', 'Iced Latte', 'Matcha latte', 'Concha de vainilla'] })}${filtroSuc()}${chipsFiltro([['Todos', COMENTARIOS.length, 'todos'], ['Visibles', COMENTARIOS.filter(c => c.visible).length, 'visible'], ['Ocultos', COMENTARIOS.filter(c => !c.visible).length, 'oculto']])}</div>`;
  const tabla = C.TablaDatos({ columnas: ['Cliente', 'Pedido', 'Producto', 'Calificación', 'Comentario', 'Fecha', 'Estado', ''], alinear: { 7: 'der' }, estado: vacio ? 'vacia' : 'datos', x: ' data-filas', vacio: C.EstadoVacio({ mascota: 'espuma', titulo: 'Aún no hay calificaciones', texto: 'Llegan cuando los clientes califican pedidos entregados (RN-05).', contexto: 'panel' }), filas: COMENTARIOS.map(c => ({ estado: c.visible ? 'normal' : 'oculta', grupo: c.visible ? 'visible' : 'oculto', celdas: [c.cliente, `#${c.pedido}`, c.prod, C.Estrellas(c.cal, { tam: 14 }), `<div class="comentario" data-visible="${c.visible ? 'si' : 'no'}"><span class="txt">${c.txt}</span></div>`, c.fecha, '§' + (c.visible ? ins('Visible', 'verde', 'ojo') : ins('Oculto', 'tostado', 'ojo-tachado')), `§<div class="acciones-fila">${c.visible ? C.IconoCirculo({ icono: 'ojo-tachado', label: 'Ocultar comentario', tam: 40, href: `#/panel/confirmacion?estado=ocultar-comentario&pedido=${c.pedido}` }) : C.IconoCirculo({ icono: 'ojo', label: 'Mostrar comentario', tam: 40, x: ` data-mostrar-comentario="${c.pedido}"` })}${C.IconoCirculo({ icono: 'eliminar', label: 'Eliminar comentario', tam: 40, x: ' data-toast="Para conservar el promedio, los comentarios se ocultan en lugar de eliminarse." data-toast-tipo="info"' })}</div>`] })) });
  return `${C.BarraSuperiorPanel({ titulo: 'Calificaciones y comentarios', sub: 'Un comentario oculto deja de verse en la app (RF-18).', filtros: filtroFechas('Últimos 30 días') })}${kpis}${filtros}${tabla}`;
}

/* A-13 Notificaciones */
function notificaciones(estado) {
  const vacio = estado === 'vacio';
  const filas = NOTIFICACIONES.map(p => { const e = ESTADOS.find(x => x.id === p.estado); return { ir: 'A-03-pedidos--default.html', celdas: [`Hoy, ${p.cuando} am`, `<strong>#${p.id}</strong>`, p.cliente, C.InsigniaEstado(p.estado, 'panel'), `“Tu pedido #${p.id}: ${e.copy}”`, 'Push (registro)', ins('Registrada', 'menta', 'check')] }; });
  return `${C.BarraSuperiorPanel({ titulo: 'Notificaciones', sub: 'Cada cambio de estado genera un aviso al cliente (RF-10).', filtros: filtroSuc('Centro', 'aplicado') + filtroFechas('Hoy') })}${C.Aviso('info', 'En el prototipo cada aviso queda como registro en MySQL (trigger). El envío push al teléfono llega en la versión final (S4).')}${C.TablaDatos({ columnas: ['Fecha y hora', 'Pedido', 'Cliente', 'Estado nuevo', 'Mensaje', 'Canal', 'Resultado'], estado: vacio ? 'vacia' : 'datos', vacio: C.EstadoVacio({ mascota: 'taza', titulo: 'Sin avisos hoy', texto: 'Aparecen cuando un pedido cambia de estado.', contexto: 'panel' }), filas })}`;
}

/* A-14 Usuarios */
function usuarios(estado) {
  const soloPersonal = estado === 'filtro-rol';
  const rolIns = { Administrador: ['Administrador', 'miel'], Personal: ['Personal', 'lila'], Cliente: ['Cliente', 'espuma'] };
  const chips = `<div class="barra-filtros"><div data-buscar-tabla>${C.Campo({ tipo: 'busqueda', placeholder: 'Buscar por nombre o correo', densidad: 'panel' })}</div><div class="chips-panel" role="radiogroup" aria-label="Rol">${[['Todos', USUARIOS.length, 'todos'], ['Administradores', USUARIOS.filter(u => u.rol === 'Administrador').length, 'Administrador'], ['Personal', USUARIOS.filter(u => u.rol === 'Personal').length, 'Personal'], ['Clientes', USUARIOS.filter(u => u.rol === 'Cliente').length, 'Cliente']].map(([t, n, v]) => C.Chip({ texto: `${t} · ${n}`, sel: soloPersonal ? v === 'Personal' : v === 'todos', tam: 40, x: ` data-filtro-fila="${v}" data-atributo="grupo"` })).join('')}</div></div>`;
  const tabla = C.TablaDatos({ columnas: ['Usuario', 'Teléfono', 'Rol', 'Sucursal', 'Estado', 'Último acceso', ''], alinear: { 6: 'der' }, x: ' data-filas', filas: USUARIOS.map(u => ({ estado: u.activo ? 'normal' : 'inactiva', grupo: u.rol, oculta: soloPersonal && u.rol !== 'Personal', ir: `#/panel/usuario?correo=${u.correo}`, celdas: [persona(u), u.tel, '§' + ins(...rolIns[u.rol]), u.suc, '§' + (u.activo ? ins('Activo', 'verde', 'check') : ins('Desactivado', 'tostado', 'x')), u.acceso, accionesFila(['editar', `Editar rol de ${u.nombre}`, `#/panel/usuario?correo=${u.correo}`])] })) });
  return `${C.BarraSuperiorPanel({ titulo: 'Usuarios', sub: 'Un usuario desactivado no puede iniciar sesión (RF-17).' })}${chips}${tabla}`;
}
function usuarioDetalle() {
  const u = usuarioPorCorreo(PAR('correo')) || USUARIOS[2];
  const cuerpo = `<div class="perfil-cabeza">${C.Avatar(u.ini, 72)}<div><p class="nombre">${u.nombre}</p><p class="leyenda-dato">${u.correo} · ${u.tel}</p></div></div><div class="seccion-panel"><h3>Rol</h3><div class="casillas" role="radiogroup" style="flex-direction:column">${C.Radio({ etiqueta: 'Cliente', marcado: u.rol === 'Cliente' })}${C.Radio({ etiqueta: 'Personal de sucursal', marcado: u.rol === 'Personal' })}${C.Radio({ etiqueta: 'Administrador', marcado: u.rol === 'Administrador' })}</div></div>${C.Select({ etiqueta: 'Sucursal asignada', valor: u.suc === '—' || u.suc === 'Todas' ? 'Centro' : u.suc, densidad: 'panel', opciones: ['Centro', 'Kino', 'Bosque'] })}<div class="seccion-panel"><h3>Estado</h3>${u.correo === SES().correo ? C.Aviso('info', 'No puedes desactivar tu propio usuario.') : C.Interruptor({ marcado: u.activo, etiqueta: u.activo ? 'Activo' : 'Desactivado', x: u.activo ? ` data-ir="#/panel/confirmacion?estado=desactivar-usuario&correo=${u.correo}"` : ` data-activar-usuario="${u.correo}"` }) + C.Aviso('info', u.activo ? 'Si lo desactivas, ya no podrá iniciar sesión (RF-17).' : 'Está desactivado: no puede iniciar sesión hasta que lo actives.')}</div><dl class="lista-def"><dt>Alta</dt><dd>3 ago 2026</dd><dt>Último acceso</dt><dd>${u.acceso}</dd></dl>`;
  return C.PanelLateral({ titulo: 'Usuario y rol', sub: 'Usuarios', cuerpo, cerrar: 'A-14-usuarios--default.html', pie: B({ tipo: 'secundario', texto: 'Cancelar', tam: 40, href: 'A-14-usuarios--default.html' }) + B({ texto: 'Guardar cambios', icono: 'check', tam: 40, href: 'A-14-usuarios--default.html#hecho-usuario' }) });
}

/* A-16 Respaldo */
function respaldo(estado) {
  const gen = estado === 'generando', ok = estado === 'exito', err = estado === 'error';
  const filas = [...(ok ? [{ fecha: '20 nov 2026, 10:42 am', tam: '4.9 MB', por: 'Ricardo Martínez', tablas: 14, nuevo: true }] : []), ...RESPALDOS].map(r => ({ estado: r.nuevo ? 'seleccionada' : 'normal', celdas: [`<strong>${r.fecha}</strong>${r.nuevo ? ' ' + C.Etiqueta({ tipo: 'cupon', texto: 'Nuevo' }) : ''}`, r.tam, r.por, r.tablas, `§<div class="acciones-fila">${B({ tipo: 'secundario', texto: 'Descargar', icono: 'descargar', tam: 40, x: ' data-toast="Descargando respaldo .sql (prototipo)."' })}${B({ tipo: 'texto', texto: 'Restaurar', icono: 'subir', tam: 40, href: 'A-20-confirmacion--restaurar-respaldo.html' })}</div>`] }));
  const generar = card('Generar respaldo', `<p>Exporta toda la base de datos (14 tablas) con Data Export de MySQL Workbench.</p>${gen ? `<div class="progreso-respaldo"><div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600"><span>Exportando tablas… 9 de 14</span><span>64 %</span></div><div class="BarraProgreso" role="progressbar" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100"><span class="relleno" style="width:64%"></span></div><p class="leyenda-dato">No cierres esta ventana hasta que termine.</p></div><span hidden data-auto-ir="A-16-respaldo--exito.html" data-ms="2600"></span>` : ''}${B({ texto: gen ? 'Generando respaldo…' : 'Generar respaldo ahora', icono: 'descargar', tam: 40, estado: gen ? 'cargando' : 'normal', href: gen ? null : 'A-16-respaldo--generando.html' })}`, { sub: 'Recomendado: uno al día, al cerrar.' });
  const restaurar = card('Restaurar', `<div class="subida"><span class="vista">${ic('subir', 28)}</span><div class="textos"><strong>Arrastra un archivo .sql</strong><span>o elige uno de la lista de abajo.</span>${B({ tipo: 'secundario', texto: 'Elegir archivo', tam: 40, x: ' data-toast="Aquí se abre el selector de archivos." data-toast-tipo="info"' })}</div></div><p class="leyenda-dato">${ic('alerta', 14)} Restaurar reemplaza todos los datos actuales por los del respaldo.</p>`, { sub: 'Data Import de MySQL Workbench (RF-19).' });
  const aviso = ok ? C.Aviso('exito', 'Respaldo generado: 20 nov 2026, 10:42 am · 4.9 MB.') : err ? `${C.Aviso('error', 'Revisa la conexión con la base de datos e intenta de nuevo.', { titulo: 'No pudimos generar el respaldo' })}` : '';
  return `${C.BarraSuperiorPanel({ titulo: 'Respaldo y restauración', sub: 'Solo administradores · RNF-05' })}${aviso}<div class="grid-2">${generar}${restaurar}</div>${card('Respaldos guardados', C.TablaDatos({ columnas: ['Fecha', 'Tamaño', 'Generado por', 'Tablas', ''], alinear: { 3: 'der', 4: 'der' }, filas }))}`;
}

/* A-17 Mi perfil */
function perfil(estado) {
  const yo = usuarioPorCorreo(SES().correo) || USUARIOS[0];
  const ed = estado === 'editar';
  const ro = ed ? undefined : 'solo-lectura';
  const datos = C.Formulario({ titulo: 'Datos personales', columnas: 2, cuerpo: `${C.Campo({ etiqueta: 'Nombre', valor: yo.nombre, densidad: 'panel', estado: ed ? undefined : ro, nombre: 'nombre' })}${C.Campo({ etiqueta: 'Teléfono', valor: yo.tel, densidad: 'panel', estado: ro, nombre: 'tel' })}${C.Campo({ tipo: 'correo', etiqueta: 'Correo', valor: yo.correo, densidad: 'panel', estado: 'deshabilitado', ayuda: 'Es tu usuario para entrar; no se cambia aquí.' })}${C.Campo({ etiqueta: 'Rol', valor: yo.rol === 'Administrador' ? 'Administrador' : `Personal de sucursal · ${yo.suc}`, densidad: 'panel', estado: 'deshabilitado', ayuda: 'El rol no se edita desde el perfil (RF-23).' })}` });
  const seg = card('Seguridad', `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px"><div><strong>Contraseña</strong><p class="leyenda-dato">Último cambio: 2 nov 2026</p></div>${B({ tipo: 'secundario', texto: 'Cambiar contraseña', icono: 'candado', tam: 40, href: 'A-18-contrasena--vacio.html' })}</div>`);
  const cab = `<section class="tarjeta-panel"><div class="perfil-cabeza">${C.Avatar(yo.ini, 72)}<div><p class="nombre">${yo.nombre}</p><p>${yo.rol === 'Administrador' ? ins('Administrador', 'miel') + ' · Todas las sucursales' : ins('Personal', 'lila') + ` · ${yo.suc}`}</p></div></div></section>`;
  const acc = ed ? B({ tipo: 'secundario', texto: 'Cancelar', tam: 40, href: 'A-17-perfil--ver.html' }) + B({ texto: 'Guardar', icono: 'check', tam: 40, x: ' data-guardar-perfil' }) : B({ tipo: 'secundario', texto: 'Editar datos', icono: 'editar', tam: 40, href: 'A-17-perfil--editar.html' });
  return `${C.BarraSuperiorPanel({ titulo: 'Mi perfil', accion: acc })}<div class="grid-form"${ed ? ' data-form-perfil' : ''}><div class="columna">${cab}${datos}</div><div class="columna">${seg}</div></div>`;
}
function dialogoContrasena(estado) {
  if (estado === 'exito') return C.Dialogo({ titulo: 'Listo, tu contraseña cambió', texto: 'La anterior ya no funciona. Usa la nueva la próxima vez que entres.', confirmar: 'Entendido', icono: 'check', irConfirmar: '#/panel/perfil', irCancelar: '#/panel/perfil', sinCancelar: true });
  const ea = estado === 'error-actual', nc = estado === 'no-coinciden';
  const lleno = estado !== 'vacio';
  const campos = `<div class="campos-contrasena" data-form-contrasena>${C.Campo({ tipo: 'contrasena', etiqueta: 'Contraseña actual', valor: lleno ? 'x' : '', densidad: 'panel', nombre: 'actual', error: ea ? 'La contraseña actual no es correcta.' : null })}${C.Campo({ tipo: 'contrasena', etiqueta: 'Contraseña nueva', valor: lleno ? 'x' : '', densidad: 'panel', nombre: 'nueva', ayuda: 'Entre 6 y 72 caracteres.' })}${C.Campo({ tipo: 'contrasena', etiqueta: 'Confirma la nueva', valor: lleno ? 'x' : '', densidad: 'panel', nombre: 'confirma', error: nc ? 'Las contraseñas nuevas no coinciden.' : null })}</div>`;
  return C.Dialogo({ titulo: 'Cambiar contraseña', texto: 'Al guardar, la contraseña anterior deja de funcionar.', confirmar: 'Guardar contraseña', icono: 'candado', extra: campos, irCancelar: '#/panel/perfil' });
}

/* A-19 Sin permiso: se muestra cuando el rol abre una ruta que no le corresponde (RF-12). */
const sinPermiso = () => `${C.BarraSuperiorPanel({ titulo: 'Sin permiso' })}<section class="tarjeta-panel" style="align-items:center;padding:64px 24px">${C.EstadoVacio({ mascota: 'grano', estado: 'triste', titulo: 'Esta sección es solo para administradores', texto: `Tu usuario es de personal de sucursal${SES().suc && SES().rol === 'personal' ? ` (${SES().suc})` : ''}. Si necesitas entrar, pídele acceso a un administrador.`, accion: B({ texto: 'Ir a Pedidos', iconoDer: 'chevron-der', href: '#/panel/pedidos' }) })}</section>`;

/* A-20 Diálogos sobre su pantalla de origen. Reciben el registro afectado por la ruta (?codigo=, ?correo=, ?pedido=). */
const DIALOGOS = {
  'eliminar-producto': () => { const p = P[PAR('id')] || P.agua_purificada; return { base: () => productos('default'), activo: 'productos', d: { tipo: 'destructivo', titulo: `¿Eliminar ${p.nombre}?`, texto: 'Se quita del menú del sitio, de la app y del panel. Esta acción no se puede deshacer. Si solo quieres ocultarlo, desactívalo.', confirmar: 'Sí, eliminar', icono: 'eliminar', irCancelar: '#/panel/productos', irConfirmar: `#/panel/productos?hecho=eliminado&id=${p.id}` } }; },
  'desactivar-cupon': () => { const c = CUPONES.find(x => x.code === PAR('codigo')) || CUPONES.find(x => x.code === 'OTONO20'); return { base: () => cupones('default'), activo: 'cupones', d: { titulo: `¿Desactivar ${c.code}?`, texto: 'Deja de aceptarse de inmediato en la app y sale de las promociones del sitio. Puedes volver a activarlo mientras siga vigente.', confirmar: 'Desactivar cupón', icono: 'cupon', irCancelar: '#/panel/cupones', irConfirmar: `#/panel/cupones?hecho=cupon-desactivado&codigo=${c.code}` } }; },
  'desactivar-usuario': () => { const u = usuarioPorCorreo(PAR('correo')) || USUARIOS[2]; return { base: () => usuarios('default'), activo: 'usuarios', d: { titulo: `¿Desactivar a ${u.nombre}?`, texto: 'Ya no podrá iniciar sesión. Sus pedidos y registros se conservan.', confirmar: 'Desactivar usuario', icono: 'usuario', irCancelar: `#/panel/usuario?correo=${u.correo}`, irConfirmar: `#/panel/usuarios?hecho=usuario-desactivado&correo=${u.correo}` } }; },
  'ocultar-comentario': () => { const c = COMENTARIOS.find(x => String(x.pedido) === PAR('pedido')) || COMENTARIOS[4]; return { base: () => calificaciones('default'), activo: 'calificaciones', d: { titulo: '¿Ocultar este comentario?', texto: `“${c.txt}” dejará de verse en la app. La calificación sigue contando en el promedio.`, confirmar: 'Ocultar', icono: 'ojo-tachado', irCancelar: '#/panel/calificaciones', irConfirmar: `#/panel/calificaciones?hecho=comentario&pedido=${c.pedido}` } }; },
  'restaurar-respaldo': () => ({ base: () => respaldo('default'), activo: 'respaldo', d: { tipo: 'destructivo', titulo: '¿Restaurar el respaldo del 19 nov 2026?', texto: 'Todos los datos actuales se reemplazan por los de ese respaldo, incluidos los pedidos de hoy. Genera un respaldo nuevo antes si los necesitas.', confirmar: 'Sí, restaurar', icono: 'base-datos', irCancelar: '#/panel/respaldo', irConfirmar: '#/panel/respaldo?hecho=restaurado' } }),
  'cerrar-sesion': () => ({ base: () => (SES().rol === 'admin' ? resumen('default') : tablero('default')), activo: SES().rol === 'admin' ? 'resumen' : 'pedidos', d: { titulo: '¿Cerrar sesión?', texto: 'Tendrás que escribir tu correo y contraseña para volver a entrar.', confirmar: 'Cerrar sesión', icono: 'salir', irCancelar: '#/panel', irConfirmar: '#/acceso?hecho=sesion' } }),
};

const toastCapa = t => `<div class="zona-toast">${t}</div>`;
// Mapa de pantallas: el enrutador busca por slug y pasa el estado (?estado=).
export const PANTALLAS_PANEL = [
  { id: 'A-01', slug: 'login', nombre: 'Iniciar sesión', estados: ['vacio', 'error', 'desactivado', 'cargando'], acceso: true, fn: login },
  { id: 'A-02', slug: 'resumen', nombre: 'Resumen', activo: 'resumen', estados: ['default', 'filtros-abiertos', 'sin-datos', 'cargando'], fn: resumen, tablet: true },
  { id: 'A-03', slug: 'pedidos', nombre: 'Pedidos', activo: 'pedidos', estados: ['default', 'toast', 'columna-vacia', 'rol-personal'], fn: e => tablero(e, { rol: e === 'rol-personal' ? 'personal' : 'admin' }), capa: e => (e === 'toast' ? toastCapa(C.Toast('exito', 'Pedido #1039 pasó a Listo. Avisamos al cliente.')) : ''), tablet: true },
  { id: 'A-04', slug: 'detalle-pedido', nombre: 'Detalle de pedido', activo: 'pedidos', estados: ['entregado', 'preparando'], fn: () => tablero('default'), capa: e => detalle(PEDIDOS.find(p => p.id === (e === 'entregado' ? 1035 : 1039)), { cerrar: '#/panel/pedidos' }) },
  { id: 'A-05', slug: 'productos', nombre: 'Productos', activo: 'productos', estados: ['default', 'filtro', 'vacio'], fn: productos, tablet: true },
  { id: 'A-06', slug: 'producto', nombre: 'Producto · formulario', activo: 'productos', estados: ['alta', 'edicion', 'errores', 'guardado'], fn: e => productoForm(e), capa: e => (e === 'guardado' ? toastCapa(C.Toast('exito', 'Guardamos los cambios de Iced Latte.')) : '') },
  { id: 'A-07', slug: 'opciones', nombre: 'Categorías y opciones', activo: 'opciones', estados: ['default', 'edicion-en-linea'], fn: opciones },
  { id: 'A-08', slug: 'sucursales', nombre: 'Sucursales', activo: 'sucursales', estados: ['default', 'vacio'], fn: sucursalesPanel },
  { id: 'A-09', slug: 'sucursal', nombre: 'Sucursal · formulario', activo: 'sucursales', estados: ['alta', 'edicion', 'errores'], fn: sucursalForm },
  { id: 'A-10', slug: 'cupones', nombre: 'Cupones', activo: 'cupones', estados: ['default', 'vacio'], fn: cupones },
  { id: 'A-11', slug: 'cupon', nombre: 'Cupón · formulario y QR', activo: 'cupones', estados: ['alta', 'edicion', 'errores'], fn: cuponForm },
  { id: 'A-12', slug: 'calificaciones', nombre: 'Calificaciones y comentarios', activo: 'calificaciones', estados: ['default', 'vacio'], fn: calificaciones },
  { id: 'A-13', slug: 'notificaciones', nombre: 'Notificaciones', activo: 'notificaciones', estados: ['default', 'vacio'], fn: notificaciones },
  { id: 'A-14', slug: 'usuarios', nombre: 'Usuarios', activo: 'usuarios', estados: ['default', 'filtro-rol'], fn: usuarios },
  { id: 'A-15', slug: 'usuario', nombre: 'Usuario · detalle y rol', activo: 'usuarios', estados: ['default'], fn: () => usuarios('default'), capa: () => usuarioDetalle() },
  { id: 'A-16', slug: 'respaldo', nombre: 'Respaldo y restauración', activo: 'respaldo', estados: ['default', 'generando', 'exito', 'error'], fn: respaldo },
  { id: 'A-17', slug: 'perfil', nombre: 'Mi perfil', activo: 'perfil', estados: ['ver', 'editar', 'guardado'], fn: e => perfil(e === 'guardado' ? 'ver' : e), capa: e => (e === 'guardado' ? toastCapa(C.Toast('exito', 'Guardamos tus datos.')) : '') },
  { id: 'A-18', slug: 'contrasena', nombre: 'Cambiar contraseña', activo: 'perfil', estados: ['vacio', 'error-actual', 'no-coinciden', 'exito'], fn: () => perfil('ver'), capa: e => dialogoContrasena(e) },
  { id: 'A-19', slug: 'sin-permiso', nombre: 'Sin permiso', activo: '', estados: ['default'], fn: sinPermiso },
  { id: 'A-20', slug: 'confirmacion', nombre: 'Diálogo de confirmación', estados: Object.keys(DIALOGOS), fn: e => DIALOGOS[e]().base(), activoFn: e => DIALOGOS[e]().activo, capa: e => C.Dialogo(DIALOGOS[e]().d) },
];
export { login, tablero, detalle };
