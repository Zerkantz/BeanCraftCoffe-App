# Diseño y mantenimiento de BeanCraft

Se conserva la estructura existente y el carrusel original. La personalización se abre con «Pedir ya»; ya no aparece una segunda ficha debajo del carrusel.

## Apariencia

Bricolage Grotesque es la tipografía principal; Instrument Serif cursiva acompaña los títulos. Las fuentes e imágenes se incluyen localmente.

Las categorías tienen un color y una mascota consistentes:

- Cafés: Miel y Taza.
- Bebidas frías: Menta y Hielito.
- Repostería: Lila y Croissant.

`layout.css` reúne los ajustes visuales nuevos. Para volver a las superficies con borde del carrito, seguimiento y sucursales, cambia `UI_CONFIG.openLayout` a `false` en `data/experience.js`. Los estilos anteriores siguen en `styles.css`.

## Contenido y datos

- `data/catalog.js`: productos y precios de personalización.
- `data/experience.js`: hojas originales del menú, quiz, frases del pie y apariencia por categoría. Las selecciones son de prueba; aún no se calculan con ventas reales.
- `data/mocks.js`: sucursales, cupones, cuenta de prueba y tiempos de simulación.
- `lib/rules.js`: precios, descuentos y validaciones.
- `lib/mock-orders.js`: estados cada 3 segundos; el pedido entregado permanece hasta confirmar Terminar pedido, con o sin reseña.
- `app.js`: navegación y comportamiento de las pantallas.

El pedido entregado conserva el botón Terminar pedido. El formulario permite omitir la calificación general, las estrellas de los productos y el comentario. Confirmarlo limpia el pedido actual y permite el siguiente. Cerrar el formulario conserva el pedido. Borrar los avisos tampoco elimina el pedido.

## Iconos y movimiento

Los estados recuperan las mascotas originales: Grano, Taza, Espuma y Croissant. Los iconos y colores de las insignias siguen la guía: bandeja/Menta, taza/Miel, check/Verde y bolsa/Tostado. Anime.js aplica una entrada suave de 420 ms al cambiar de estado. La preferencia de reducir movimiento deja la representación estática.

Las librerías se incluyen en la app; no se descargan de internet al abrir una pantalla. Sus licencias se conservan en `vendor/`. `scripts/prepare-design.cjs` actualiza las copias locales utilizadas por la interfaz.

## Expo

Las pantallas existentes se muestran dentro del contenedor de Expo. Cámara QR y ubicación usan funciones del teléfono. `scripts/prepare-web.cjs` prepara los recursos al iniciar Expo. No edites `mobile/generated/`.

Pruebas: `npm.cmd run check` y `npm.cmd run test:e2e`. Las capturas quedan en `tmp/playwright/`. La cámara, el GPS y los permisos deben revisarse además en un teléfono físico con Expo Go.

La foto del perfil abre un menú de selección de mascota. Tocar una opción la guarda y cierra el menú; cerrarlo sin elegir conserva la foto anterior.

Bebidas de la casa recupera las cuatro hojas de la versión Figma: dos productos en la lista superior, producto destacado a la derecha y otros tres con imagen debajo (cinco productos distintos por hoja), con pestañas, flechas y desplazamiento horizontal.

## Límites y promedios

Los límites se centralizan en data/limits.js y se validan tanto en los controles como al guardar. El máximo del carrito es de diez unidades sumando todas las líneas, incluidas las ediciones. Las reseñas enviadas se guardan en PRODUCT_REVIEWS y cada producto muestra la media aritmética de sus estrellas, sin contar campos omitidos ni ponderar cantidades.

## Avisos locales

mobile/localNotifications.js usa solo APIs locales de expo-notifications. No registra tokens ni solicita credenciales de un servicio remoto. El permiso se solicita como máximo una vez automáticamente por ejecución; si se deniega, se puede autorizar desde los ajustes del teléfono. Los avisos se presentan únicamente con el sistema del teléfono, tanto en primer plano como en segundo plano. El manejador permite banner, lista y sonido; no existe un banner superpuesto dentro de la app ni un sustituto si el permiso está denegado. La campana conserva únicamente el registro y la opción de borrarlo. Borrar los avisos también los descarta de la bandeja del teléfono.

La apariencia del aviso del sistema la controla Android/iOS. El icono y la configuración propios de BeanCraft requieren una compilación propia; Expo Go conserva su identidad. Los avisos locales proceden de la ejecución de la app, sin promesa de envío remoto cuando está cerrada. Para revisar permisos y avisos reales hace falta un teléfono físico.
