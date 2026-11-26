// Utilidades compartidas por las pruebas de navegador.
export const BASE = process.argv[2] || process.env.BASE || 'http://localhost:5173/';
export const ANCHOS = [320, 390, 640, 834, 1024, 1100, 1280, 1920];
export const RUTAS_SITIO = ['#/', '#/?estado=quiz-pregunta', '#/?estado=quiz-resultado', '#/bebidas', '#/bebidas?estado=sin-resultados', '#/bebidas?estado=cargando', '#/producto/latte-de-caramelo', '#/producto/croissant-de-mantequilla', '#/producto/iced-latte?estado=no-disponible', '#/combinaciones', '#/promociones', '#/promociones?estado=vacio', '#/sucursales', '#/sucursales?estado=tarjetas', '#/sucursales?estado=ubicacion-denegada', '#/sucursales?estado=sin-resultados', '#/ayuda', '#/privacidad', '#/contacto', '#/contacto?estado=error', '#/contacto?estado=enviado', '#/no-existe', '#/design', '#/guia'];
export const RUTAS_PANEL = ['#/acceso?estado=error', '#/panel/resumen', '#/panel/pedidos', '#/panel/pedidos?pedido=1039', '#/panel/productos', '#/panel/producto?estado=edicion', '#/panel/opciones', '#/panel/opciones?estado=edicion-en-linea', '#/panel/sucursales', '#/panel/sucursal?estado=edicion', '#/panel/cupones', '#/panel/cupon?estado=edicion', '#/panel/calificaciones', '#/panel/notificaciones', '#/panel/usuarios', '#/panel/usuario', '#/panel/respaldo', '#/panel/perfil', '#/panel/contrasena', '#/panel/confirmacion?estado=desactivar-cupon'];

// Playwright puede estar instalado en el proyecto o de forma global.
export async function cargarPlaywright() {
  try { return await import('playwright'); } catch { /* sigue con la instalación global */ }
  const { execSync } = await import('node:child_process');
  const raiz = execSync('npm root -g').toString().trim();
  return import(`${raiz}/playwright/index.mjs`);
}

export async function entrarComo(pg, correo) {
  await pg.goto(`${BASE}#/guia`);
  await pg.waitForTimeout(150);
  const b = await pg.$(`[data-entrar-como="${correo}"]`);
  if (b) { await b.click(); await pg.waitForTimeout(150); }
}
