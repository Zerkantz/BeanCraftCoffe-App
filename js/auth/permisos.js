// Matriz de permisos del panel (SRS v1.3: RF-12 a RF-21, RF-23). Única fuente de verdad: la usan la barra lateral,
// la guardia de rutas y las pruebas. Rol interno: 'admin' (Administrador) o 'personal' (Personal de sucursal).

export const ROLES = { Administrador: 'admin', Personal: 'personal' };

// pantalla → roles que la pueden abrir
export const PERMISOS = {
  resumen: ['admin'],                    // A-02 · RF-20, RF-21
  pedidos: ['admin', 'personal'],        // A-03 · RF-16 (personal: solo su sucursal)
  'detalle-pedido': ['admin', 'personal'], // A-04 · RF-16, RN-04
  productos: ['admin'], producto: ['admin'], // A-05, A-06 · RF-13
  opciones: ['admin'],                   // A-07 · RF-13
  sucursales: ['admin'], sucursal: ['admin'], // A-08, A-09 · RF-14
  cupones: ['admin'], cupon: ['admin'],  // A-10, A-11 · RF-15 (RF-12 lo excluye para personal)
  calificaciones: ['admin'],             // A-12 · RF-18
  notificaciones: ['admin'],             // A-13 · RF-10 (decisión D4)
  usuarios: ['admin'], usuario: ['admin'], // A-14, A-15 · RF-17 (RF-12 lo excluye para personal)
  respaldo: ['admin'],                   // A-16 · RF-19 (RF-12 lo excluye para personal)
  perfil: ['admin', 'personal'], contrasena: ['admin', 'personal'], // A-17, A-18 · RF-23
  'sin-permiso': ['admin', 'personal'],  // A-19
  confirmacion: ['admin', 'personal'],   // A-20 (cada diálogo se revisa abajo)
};

// Diálogos de confirmación (A-20) por rol: el personal solo puede cerrar sesión.
const DIALOGOS_PERSONAL = new Set(['cerrar-sesion']);

export function puedeVer(rol, pantalla, estado = '') {
  const roles = PERMISOS[pantalla];
  if (!roles || !roles.includes(rol)) return false;
  if (pantalla === 'confirmacion' && rol === 'personal') return DIALOGOS_PERSONAL.has(estado);
  return true;
}

// Pantalla de entrada después de iniciar sesión.
export const inicioDeRol = rol => (rol === 'admin' ? 'resumen' : 'pedidos');

// RF-16: el personal solo ve y cambia pedidos de su sucursal.
export const pedidosVisibles = (sesion, pedidos) => (sesion.rol === 'admin' ? pedidos : pedidos.filter(p => p.suc === sesion.sucId));
export const puedeCambiarPedido = (sesion, pedido) => sesion.rol === 'admin' || pedido.suc === sesion.sucId;
