// Escena de la pantalla de acceso del personal: ocupa la mitad de la página (arriba en móvil) con las mascotas,
// el mensaje del panel y una mascota anfitriona que reacciona al formulario (data-animo).
import * as C from '../componentes/base.js';
import { ic } from '../lib/iconos.js';

export const FRASES_ACCESO = {
  saludo: '¡Hola! Qué gusto verte en la barra.',
  correo: 'Escribe el correo con el que te dio de alta tu administrador.',
  clave: 'Prometo no mirar mientras escribes tu contraseña.',
  error: 'Mmm, eso no coincidió. Revisa y lo intentamos otra vez.',
  listo: '¡Bienvenido! Preparando tu panel…',
};

export function escenaAcceso() {
  const rasgos = [['recibo', 'Pedidos de tu sucursal en vivo', 'Recibido, preparando, listo y entregado, un paso a la vez.'], ['cupon', 'Cupones con QR y vigencia', 'Cada código con su fecha y su límite de usos.'], ['grafica', 'Ventas y calificaciones', 'Lo del día y la semana, por sucursal.']];
  return `<section class="EscenaAcceso" data-animo="saludo" aria-label="Panel de BeanCraft">
<div class="granos" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<span class="grano g${i}"></span>`).join('')}</div>
<div class="contenido-escena">${C.Logo({ fondo: 'oscuro', tam: 40, sub: 'Panel' })}
<h2 class="titulo-escena">La barra, <em>en orden</em>.</h2>
<p class="bajada-escena">El panel donde el personal mueve los pedidos y el administrador cuida el menú, las sucursales y los cupones.</p>
<ul class="rasgos">${rasgos.map(([i, t, d]) => `<li>${ic(i, 22)}<span class="textos"><strong>${t}</strong><span>${d}</span></span></li>`).join('')}</ul></div>
<div class="barra-escena"><div class="anfitriona">${C.Mascota('taza', { tam: 150, estado: 'guino', fondo: 'oscuro' }).replace('class="Mascota"', 'class="Mascota anfitriona-taza"')}<p class="burbuja-acceso" aria-live="polite" data-burbuja>${FRASES_ACCESO.saludo}</p></div>
<div class="desfile" aria-hidden="true">${C.Mascota('grano', { tam: 84, rot: -4 }).replace('class="Mascota"', 'class="Mascota flota f1"')}${C.Mascota('espuma', { tam: 80, rot: 3, holo: true }).replace('class="Mascota"', 'class="Mascota flota f2"')}${C.Mascota('hielito', { tam: 76, rot: -3 }).replace('class="Mascota"', 'class="Mascota flota f3"')}${C.Mascota('croissant', { tam: 84, rot: 4 }).replace('class="Mascota"', 'class="Mascota flota f4"')}</div>
<span class="mostrador" aria-hidden="true"></span></div>
</section>`;
}
