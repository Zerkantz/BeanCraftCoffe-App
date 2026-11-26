// Usuarios del panel (RF-12, RF-17). Solo Administrador y Personal de sucursal pueden iniciar sesión en la web;
// los clientes existen para que el administrador los active o desactive, pero entran solo por la app.
// Contraseñas de prueba: Admin1234 (administrador) y Barra1234 (personal). Se guardan en memoria durante la sesión.

export const USUARIOS = [
  { nombre: 'Ricardo Martínez', correo: 'ricardo@beancraft.mx', tel: '653 123 4567', rol: 'Administrador', suc: 'Todas', sucId: null, activo: true, acceso: 'Hoy, 8:02 am', ini: 'RM', clave: 'Admin1234' },
  { nombre: 'Daniela Ortiz', correo: 'daniela@beancraft.mx', tel: '653 220 1144', rol: 'Personal', suc: 'Centro', sucId: 'centro', activo: true, acceso: 'Hoy, 7:30 am', ini: 'DO', clave: 'Barra1234' },
  { nombre: 'Julián Pérez', correo: 'julian@beancraft.mx', tel: '653 781 0023', rol: 'Personal', suc: 'Kino', sucId: 'universidad', activo: true, acceso: 'Hoy, 7:25 am', ini: 'JP', clave: 'Barra1234' },
  { nombre: 'Montserrat Ruiz', correo: 'montse@beancraft.mx', tel: '653 459 3301', rol: 'Personal', suc: 'Bosque', sucId: 'plaza', activo: false, acceso: '2 nov 2026', ini: 'MR', clave: 'Barra1234' },
  { nombre: 'Ana Lucía R.', correo: 'analucia@correo.com', tel: '653 128 4410', rol: 'Cliente', suc: '—', sucId: null, activo: true, acceso: 'Hoy, 8:11 am', ini: 'AR' },
  { nombre: 'Jorge M.', correo: 'jorge.m@correo.com', tel: '653 201 7788', rol: 'Cliente', suc: '—', sucId: null, activo: true, acceso: 'Hoy, 8:09 am', ini: 'JM' },
  { nombre: 'Karla P.', correo: 'karla.p@correo.com', tel: '653 334 0921', rol: 'Cliente', suc: '—', sucId: null, activo: true, acceso: 'Ayer, 6:40 pm', ini: 'KP' },
  { nombre: 'Luis F.', correo: 'luisf@correo.com', tel: '653 990 1203', rol: 'Cliente', suc: '—', sucId: null, activo: false, acceso: '12 oct 2026', ini: 'LF' },
];
export const usuarioPorCorreo = correo => USUARIOS.find(u => u.correo.toLowerCase() === correo.trim().toLowerCase());
