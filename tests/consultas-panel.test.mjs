import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fechaValida, rangoRapido, rangoPanel, fechaRegistro, filtrarPanel, resumenRegistros, serieVentas } from '../js/lib/consultas-panel.js';
import { PEDIDOS, totales } from '../js/data/pedidos.js';
import { COMENTARIOS } from '../js/data/panel.js';
import { Campo, Filtro, GraficaLinea } from '../js/componentes/base.js';
import { iniciarSesion, cerrarSesion } from '../js/auth/sesion.js';
import { armarPantalla } from '../js/app/pantallas.js';

test('Calendario: fechas válidas, años bisiestos y extremos inclusivos', () => {
  assert.equal(fechaValida('2024-02-29'), true);
  for (const f of ['2026-02-29', '2026-13-01', '', '1800-01-01']) assert.equal(fechaValida(f), false);
  const filas = [{ fecha: '2026-11-18' }, { fecha: '2026-11-19' }, { fecha: '2026-11-20' }];
  assert.equal(filtrarPanel(filas, { desde: '2026-11-19', hasta: '2026-11-20' }).length, 2);
  assert.equal(filtrarPanel(filas, { desde: '2026-12-01', hasta: '2026-12-02' }).length, 0);
});

test('Rangos rápidos usan la fecha actual y los predeterminados respetan la fecha de la fuente', () => {
  assert.deepEqual(rangoRapido('Ayer', '2026-03-01'), { desde: '2026-02-28', hasta: '2026-02-28' });
  assert.deepEqual(rangoRapido('Últimos 7 días', '2026-11-26'), { desde: '2026-11-20', hasta: '2026-11-26' });
  assert.deepEqual(rangoPanel({}, 1), { desde: '2026-11-20', hasta: '2026-11-20' });
  assert.deepEqual(rangoPanel({ desde: '2026-11-22', hasta: '2026-11-20' }, 1), rangoPanel({}, 1));
  assert.equal(fechaRegistro({ fecha: 'Ayer, 5:12 pm' }), '2026-11-19');
  assert.equal(fechaRegistro({ fecha: '18 nov, 6:20 pm' }), '2026-11-18');
});

test('Rango y sucursal cambian los registros y todas las cifras calculadas', () => {
  const rango = { desde: '2026-11-20', hasta: '2026-11-20' };
  const kino = filtrarPanel(PEDIDOS, rango, 'Kino');
  assert.equal(kino.length, 2);
  assert.ok(kino.every(p => p.suc === 'universidad'));
  const datos = resumenRegistros(kino, filtrarPanel(COMENTARIOS, rango, 'Kino'));
  assert.equal(datos.ventas, kino.reduce((s,p) => s + totales(p).total, 0));
  assert.equal(datos.ticket, datos.ventas / 2);
  assert.equal(datos.calificacion, null);
  assert.deepEqual(datos.sucursales, [['Kino', 2]]);
  assert.equal(datos.estados.reduce((s,[,n]) => s+n,0), 2);
  assert.equal(filtrarPanel(PEDIDOS, { desde: '2026-11-01', hasta: '2026-11-19' }).length, 0);
});

test('Ventas, cupones y gráfica proceden de los mismos pedidos sin alterar los datos', () => {
  const antes = JSON.stringify(PEDIDOS), datos = resumenRegistros(PEDIDOS);
  const rango = { desde: '2026-11-14', hasta: '2026-11-20' };
  for (const modo of ['dia', 'semana']) {
    const serie = serieVentas(PEDIDOS, rango, modo);
    assert.ok(Math.abs(serie.puntos.reduce((s,[,v]) => s+v,0) - datos.ventas) < .00001);
  }
  assert.equal(datos.cuponesUsados, PEDIDOS.filter(p => p.cupon).length);
  assert.equal(JSON.stringify(PEDIDOS), antes);
});

test('Una gráfica de un solo día o con ceros no genera NaN ni Infinity', () => {
  for (const puntos of [[['20 nov', 215]], [['20 nov', 0]]]) assert.doesNotMatch(GraficaLinea(puntos), /NaN|Infinity/);
  const serie = serieVentas(PEDIDOS, { desde: '2020-01-01', hasta: '2030-12-31' });
  assert.ok(serie.puntos.length <= 12);
});

test('Campos limitados y calendario nativo sin el botón Personalizado', () => {
  for (const [tipo, limite] of [['texto',100],['correo',100],['contrasena',50],['busqueda',50],['numero',50],['area',200]]) assert.match(Campo({tipo}), new RegExp(`maxlength="${limite}"`));
  const filtro = Filtro({ tipo: 'fechas', etiqueta: 'Fechas', valor: 'Período' });
  assert.equal((filtro.match(/type="date"/g) || []).length, 2);
  assert.doesNotMatch(filtro, /Personalizado/);
});

test('El rango conserva los permisos del personal y no expone otra sucursal por parámetros', () => {
  iniciarSesion('daniela@beancraft.mx', 'Barra1234');
  const render = params => armarPantalla({ partes: ['panel', 'pedidos'], params, hash: '#/panel/pedidos' }, 'movil').html;
  const dia = render({ desde: '2026-11-20', hasta: '2026-11-20', sucursal: 'Kino' });
  assert.equal((dia.match(/class="TarjetaPedido"/g) || []).length, 16);
  assert.doesNotMatch(dia, /Renata A\.|Camila Z\.|Gael H\.|Bruno E\./);
  assert.doesNotMatch(render({ desde: '2026-11-18', hasta: '2026-11-19' }), /class="TarjetaPedido"/);
  assert.doesNotMatch(render({ desde: '2026-11-20', hasta: '2026-11-20', pedido: '1043' }), /role="dialog"/);
  cerrarSesion();
});
