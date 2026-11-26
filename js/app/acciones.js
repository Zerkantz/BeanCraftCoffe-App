// Acciones confirmadas del panel (?hecho=…): cada una cambia los datos vivos y devuelve el aviso para el usuario.
// Solo corren cuando la guardia ya permitió la pantalla, así que el personal no puede dispararlas por URL.
import { P, PRODUCTOS } from '../data/catalogo.js';
import { CUPONES } from '../data/cupones.js';
import { USUARIOS, usuarioPorCorreo } from '../data/usuarios.js';
import { COMENTARIOS } from '../data/panel.js';
import { PEDIDOS, ESTADOS } from '../data/pedidos.js';
import { cerrarSesion } from '../auth/sesion.js';
import { siguienteEstado } from '../lib/reglas.js';
import { puedeCambiarPedido } from '../auth/permisos.js';
import { guardar } from './estado.js';

const SOLO_AVISO = {
  opcion: 'Costo de Avena guardado. La app ya usa el precio nuevo.',
  sucursal: 'Sucursal guardada.',
  cupon: 'Cupón guardado.',
  usuario: 'Cambios del usuario guardados.',
  producto: 'Producto guardado.',
  restaurado: 'Respaldo del 19 nov 2026 restaurado.',
  contrasena: 'Contraseña actualizada.',
  perfil: 'Guardamos tus datos.',
};

export function ejecutarHecho(codigo, params) {
  switch (codigo) {
    case 'eliminado': {
      const p = P[params.id] || P.agua_purificada;
      p.eliminado = true; guardar();
      return { texto: `${p.nombre} eliminado del menú del sitio y del panel.` };
    }
    case 'cupon-desactivado': {
      const c = CUPONES.find(x => x.code === params.codigo);
      if (!c) return null;
      c.active = false; guardar();
      return { texto: `${c.code} desactivado: ya no se acepta en la app y salió de las promociones del sitio.` };
    }
    case 'usuario-desactivado': {
      const u = usuarioPorCorreo(params.correo || '');
      if (!u) return null;
      u.activo = false; guardar();
      return { texto: `${u.nombre} desactivado: ya no puede iniciar sesión.` };
    }
    case 'comentario': {
      const c = COMENTARIOS.find(x => String(x.pedido) === String(params.pedido));
      if (!c) return null;
      c.visible = false; guardar();
      return { texto: 'Comentario oculto: ya no se ve en la app.' };
    }
    case 'sesion':
      cerrarSesion();
      return { texto: 'Cerraste sesión.' };
    default:
      return SOLO_AVISO[codigo] ? { texto: SOLO_AVISO[codigo] } : null;
  }
}

// Interruptores directos (activar no pide confirmación; desactivar sí, por A-20).
export function activarCupon(codigo) { const c = CUPONES.find(x => x.code === codigo); if (!c) return null; c.active = true; guardar(); return `${c.code} activado: la app lo vuelve a aceptar mientras siga vigente.`; }
export function activarUsuario(correo) { const u = usuarioPorCorreo(correo); if (!u) return null; u.activo = true; guardar(); return `${u.nombre} activado: ya puede iniciar sesión.`; }
export function mostrarComentario(pedido) { const c = COMENTARIOS.find(x => String(x.pedido) === String(pedido)); if (!c) return null; c.visible = true; guardar(); return 'Comentario visible otra vez en la app.'; }

// RN-04 + RF-16: avanza un pedido un solo estado, y solo si es de la sucursal del personal.
export function avanzarPedido(sesion, id) {
  const p = PEDIDOS.find(x => String(x.id) === String(id));
  if (!p) return { ok: false, texto: 'No encontramos ese pedido.' };
  if (!puedeCambiarPedido(sesion, p)) return { ok: false, texto: 'Ese pedido es de otra sucursal.' };
  const sig = siguienteEstado(p.estado);
  if (!sig) return { ok: false, texto: `El pedido #${p.id} ya fue entregado.` };
  p.estado = sig; guardar();
  const e = ESTADOS.find(x => x.id === sig);
  return { ok: true, texto: `Pedido #${p.id} pasó a ${e.label}. Avisamos al cliente.`, pedido: p };
}

export { PRODUCTOS, USUARIOS };
