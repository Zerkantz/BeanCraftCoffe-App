// Control de acceso por rol (RF-12, RF-16, RF-17, RF-23).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERMISOS, puedeVer, inicioDeRol, pedidosVisibles, puedeCambiarPedido } from '../js/auth/permisos.js';
import { iniciarSesion, sesion, cerrarSesion, cambiarContrasena, actualizarPerfil } from '../js/auth/sesion.js';
import { revisarAcceso } from '../js/auth/guardia.js';
import { USUARIOS, usuarioPorCorreo } from '../js/data/usuarios.js';
import { PEDIDOS } from '../js/data/pedidos.js';

test('El administrador abre todas las pantallas del panel', () => {
  for (const p of Object.keys(PERMISOS)) assert.ok(puedeVer('admin', p, 'desactivar-cupon'), p);
});

test('El personal solo abre pedidos, detalle, perfil, contraseña y cerrar sesión', () => {
  const permitidas = Object.keys(PERMISOS).filter(p => puedeVer('personal', p, 'cerrar-sesion')).sort();
  assert.deepEqual(permitidas, ['confirmacion', 'contrasena', 'detalle-pedido', 'pedidos', 'perfil', 'sin-permiso']);
  for (const p of ['usuarios', 'respaldo', 'cupones']) assert.equal(puedeVer('personal', p), false, `RF-12 excluye ${p}`);
  assert.equal(puedeVer('personal', 'confirmacion', 'desactivar-cupon'), false);
  assert.equal(puedeVer('personal', 'inexistente'), false);
});

test('Pantalla de entrada por rol', () => {
  assert.equal(inicioDeRol('admin'), 'resumen');
  assert.equal(inicioDeRol('personal'), 'pedidos');
});

test('RF-16: el personal solo ve y cambia pedidos de su sucursal', () => {
  const daniela = { rol: 'personal', sucId: 'centro' };
  assert.ok(pedidosVisibles(daniela, PEDIDOS).every(p => p.suc === 'centro'));
  assert.equal(pedidosVisibles({ rol: 'admin' }, PEDIDOS).length, PEDIDOS.length);
  assert.equal(puedeCambiarPedido(daniela, PEDIDOS.find(p => p.suc === 'plaza')), false);
});

test('Inicio de sesión: errores y entradas', () => {
  cerrarSesion();
  assert.equal(iniciarSesion('', 'x').codigo, 'falta-correo');
  assert.equal(iniciarSesion('ricardo@', 'Admin1234').codigo, 'correo-invalido');
  assert.equal(iniciarSesion('ricardo@beancraft.mx', '123').codigo, 'clave-invalida');
  assert.equal(iniciarSesion('ricardo@beancraft.mx', 'Otra1234').codigo, 'no-coinciden');
  assert.equal(iniciarSesion('analucia@correo.com', 'Cafe1234').codigo, 'no-coinciden', 'los clientes no tienen acceso a la web');
  assert.equal(iniciarSesion('montse@beancraft.mx', 'Barra1234').codigo, 'desactivado');
  const r = iniciarSesion('DANIELA@beancraft.mx ', 'Barra1234');
  assert.ok(r.ok);
  assert.equal(r.sesion.rol, 'personal');
  assert.equal(r.sesion.sucId, 'centro');
  assert.equal(revisarAcceso('usuarios').tipo, 'sin-permiso');
  assert.equal(revisarAcceso('pedidos').tipo, 'ok');
  cerrarSesion();
  assert.equal(revisarAcceso('pedidos').tipo, 'login');
});

test('RF-17: un usuario desactivado pierde la sesión y no vuelve a entrar', () => {
  assert.ok(iniciarSesion('julian@beancraft.mx', 'Barra1234').ok);
  usuarioPorCorreo('julian@beancraft.mx').activo = false;
  assert.equal(sesion(), null);
  assert.equal(iniciarSesion('julian@beancraft.mx', 'Barra1234').codigo, 'desactivado');
  usuarioPorCorreo('julian@beancraft.mx').activo = true;
});

test('RF-23: perfil sin cambio de rol y contraseña anterior inválida', () => {
  iniciarSesion('ricardo@beancraft.mx', 'Admin1234');
  actualizarPerfil({ nombre: 'Ricardo M. Soto', tel: '6531234567' });
  assert.equal(sesion().nombre, 'Ricardo M. Soto');
  assert.equal(sesion().rol, 'admin');
  assert.equal(cambiarContrasena('mala', 'Nueva5678', 'Nueva5678').codigo, 'error-actual');
  assert.equal(cambiarContrasena('Admin1234', 'Nueva5678', 'Distinta1').codigo, 'no-coinciden');
  assert.ok(cambiarContrasena('Admin1234', 'Nueva5678', 'Nueva5678').ok);
  cerrarSesion();
  assert.equal(iniciarSesion('ricardo@beancraft.mx', 'Admin1234').codigo, 'no-coinciden');
  assert.ok(iniciarSesion('ricardo@beancraft.mx', 'Nueva5678').ok);
  usuarioPorCorreo('ricardo@beancraft.mx').clave = 'Admin1234';
  usuarioPorCorreo('ricardo@beancraft.mx').nombre = 'Ricardo Martínez';
  cerrarSesion();
  assert.equal(USUARIOS.filter(u => u.clave).length, 4, 'solo el personal tiene contraseña de panel');
});
