// Reglas de negocio: RN-01 (vigencia de cupones), RN-02 (precio), RN-04 (orden de estados) y horario en vivo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { precioLinea, resumenLinea, PRODUCTOS } from '../js/data/catalogo.js';
import { siguienteEstado, puedeCambiar, estadoSucursal, estadoCupon, rangoDias, hora12, distanciaKm, fijarAhora, ahora, partes } from '../js/lib/reglas.js';
import { SUCURSALES, refrescarSucursales, masCercana } from '../js/data/sucursales.js';
import { CUPONES, promosVigentes, filaCupon } from '../js/data/cupones.js';
import { PEDIDOS, totales } from '../js/data/pedidos.js';

const fecha = t => new Date(Date.parse(`${t}-07:00`));

test('RN-02: base + tamaño + leche + endulzante + extras', () => {
  assert.equal(precioLinea({ prod: 'latte_caramelo', tam: 'chico', leche: 'entera', endu: 'sin', extras: [] }), 55);
  assert.equal(precioLinea({ prod: 'latte_caramelo', tam: 'grande', leche: 'avena', endu: 'sin', extras: ['shot', 'caramelo'] }), 55 + 18 + 12 + 0 + 15 + 8);
  assert.equal(precioLinea({ prod: 'matcha_latte', tam: 'mediano', leche: 'almendra', endu: 'miel', extras: [] }), 64 + 10 + 12 + 5);
  assert.equal(precioLinea({ prod: 'concha_vainilla' }), 35, 'la repostería no suma opciones');
  assert.equal(resumenLinea({ prod: 'concha_vainilla' }), 'Pieza individual');
});

test('Catálogo: 25 productos, 3 categorías del SRS y slugs únicos', () => {
  assert.equal(PRODUCTOS.length, 25);
  assert.deepEqual([...new Set(PRODUCTOS.map(p => p.categoria))].sort(), ['Bebidas frías', 'Cafés', 'Repostería']);
  assert.equal(new Set(PRODUCTOS.map(p => p.slug)).size, 25);
  assert.ok(!PRODUCTOS.some(p => /kfreeze|protea/i.test(p.nombre)), 'nombres sin marca ajena (D3)');
});

test('RN-04: un pedido solo avanza al estado siguiente', () => {
  assert.equal(siguienteEstado('recibido'), 'preparando');
  assert.equal(siguienteEstado('listo'), 'entregado');
  assert.equal(siguienteEstado('entregado'), null);
  assert.equal(puedeCambiar('recibido', 'entregado'), false);
  assert.equal(puedeCambiar('preparando', 'listo'), true);
});

test('Totales de pedido con cupón (RN-02 a nivel pedido)', () => {
  const p = PEDIDOS.find(x => x.id === 1039);
  const t = totales(p);
  assert.equal(t.sub, 93 + 46);
  assert.equal(t.desc, Math.round(139 * 15) / 100);
});

test('Horario en vivo en hora de Hermosillo', () => {
  const [centro, kino, bosque] = SUCURSALES;
  assert.equal(estadoSucursal(centro, fecha('2026-11-20T08:15')).abierta, true);
  assert.equal(estadoSucursal(centro, fecha('2026-11-20T06:30')).estadoTxt, 'Cerrada, abre hoy a las 7:00 am');
  assert.equal(estadoSucursal(bosque, fecha('2026-11-20T20:30')).estadoTxt, 'Cerrada, abre mañana a las 7:00 am');
  const domingo = estadoSucursal(kino, fecha('2026-11-22T12:00'));
  assert.equal(domingo.abierta, false, 'Kino no abre en fin de semana');
  assert.equal(domingo.hoy, 'Cerrada hoy');
  assert.equal(domingo.estadoTxt, 'Cerrada, abre mañana a las 8:00 am');
  assert.equal(estadoSucursal(kino, fecha('2026-11-21T12:00')).estadoTxt, 'Cerrada, abre el lunes a las 8:00 am');
  assert.equal(rangoDias([1, 2, 3, 4, 5]), 'Lun–Vie');
  assert.equal(rangoDias([0, 1, 2, 3, 4, 5, 6]), 'Lun–Dom');
  assert.equal(hora12(22), '10:00 pm');
  assert.equal(hora12(12, 5), '12:05 pm');
});

test('?ahora= fija la fecha de referencia', () => {
  fijarAhora('2026-11-20T08:15');
  assert.equal(partes(ahora()).iso, '2026-11-20');
  assert.equal(partes(ahora()).min, 8 * 60 + 15);
  fijarAhora(null);
});

test('Sucursal más cercana con la ubicación del visitante', () => {
  refrescarSucursales(fecha('2026-11-20T08:15'), { lat: 32.455, lon: -114.757 });
  assert.equal(masCercana().id, 'universidad');
  assert.ok(distanciaKm(SUCURSALES[0], SUCURSALES[1]) > 2 && distanciaKm(SUCURSALES[0], SUCURSALES[1]) < 4);
  refrescarSucursales(fecha('2026-11-20T08:15'), null);
  assert.equal(masCercana(), null);
});

test('RN-01: cupones activos y vigentes; el sitio solo muestra esos', () => {
  const hoy = fecha('2026-11-20T08:15');
  const estado = c => estadoCupon(CUPONES.find(x => x.code === c), hoy);
  assert.equal(estado('AVENA10'), 'activo');
  assert.equal(estado('VENCIDO25'), 'vencido');
  assert.equal(estado('INACTIVO'), 'desactivado');
  assert.equal(estadoCupon(CUPONES.find(x => x.code === 'OTONO20'), fecha('2026-12-01T09:00')), 'vencido');
  const codigos = promosVigentes(hoy).map(p => p.codigo);
  assert.deepEqual(codigos, ['AVENA10', 'FRIO2X1', 'PRIMER15', 'BIENVENIDA', 'OTONO20']);
  assert.equal(filaCupon(CUPONES[0], hoy).valor, '$10.00');
  assert.ok(!CUPONES.some(c => c.code === 'OTONO2X1'), 'sin el cupón contradictorio de la v1');
});
