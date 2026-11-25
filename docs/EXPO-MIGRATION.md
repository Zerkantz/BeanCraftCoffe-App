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

Las mejoras juveniles están en `polish.css`: profundidad y píxeles en las tres bebidas inferiores, imágenes superpuestas y precios discretos en el menú, y ficha de personalización. La paleta y las fuentes siguen los tokens originales. Retirar su enlace de `index.html` y su lectura en `scripts/prepare-web.cjs` permite recuperar las superficies anteriores sin perder la lógica de compra.

Los colores de los botones siguen las páginas 5 y 6 de la guía: principal Tostado/Espuma; secundario transparente con borde de 2 px y texto Tostado; acento Miel/Tostado en las promociones. Los chips seleccionados usan Tostado/Espuma. Las mejoras de distribución no sobrescriben las variantes principales con Verde. El Verde se conserva para enlaces, foco e indicadores de estado.

Las superficies del cupón, del resumen y de la revisión se ajustaron a Blanco/Espuma con texto Tostado. La guía no asigna un color específico al cupón o al código de recogida; se aplicó su base neutra. El código se coloca antes del personaje y de la línea de estados. El indicador actual mantiene Menta/Tostado, Miel/Tostado, Verde/Espuma o Tostado/Espuma según su estado.

Cada tarjeta del menú es un único botón accesible que abre el personalizador, sin botón de suma anidado. Las tarjetas conservan su mascota de categoría, estrellas y precio. Los píxeles usan cuatro dibujos SVG locales con bordes rectos; no se descargan imágenes adicionales.

`lib/motion.js` usa Anime.js para entradas de pantallas y diálogos. Las mascotas tienen movimiento suave solo cuando están visibles, y se pausa al enviar la app al fondo. El carrusel conserva el arrastre y los controles existentes. La preferencia de reducir movimiento cancela animaciones tanto desde el teléfono como desde el navegador.

El carrito, la revisión y el seguimiento comparten la presentación de productos, cantidades y datos de recogida. Sus controles e identificadores se conservan para mantener edición, cupones, horarios, deslizador y cierre con reseña opcional. `polish.css` amplía las imágenes del menú, integra el control de cantidad y sustituye los separadores negros de estos flujos por superficies de Menta y líneas suaves. Los píxeles son decorativos, no reciben el foco y no añaden imágenes externas.

Reanimated 4.7.1 y Worklets 0.13.0 se instalaron con `expo install`, usando las versiones compatibles con SDK 58. `mobile/BeanCraftLoader.js` anima a Taza durante la carga nativa y cancela la animación al desmontarse. La configuración de Babel la aporta `babel-preset-expo`. Se revisaron también Lottie y Moti: las imágenes actuales no requieren archivos de animación Lottie ni otra capa sobre Reanimated. Referencias: [Reanimated en Expo](https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/), [Moti](https://moti.fyi/), [Lottie React Native](https://github.com/lottie-react-native/lottie-react-native). La referencia visual para profundidad es [Luma](https://lumabobashop.com/); los personajes, fotografías y colores siguen siendo los de BeanCraft.

## Expo

Las pantallas existentes se muestran dentro del contenedor de Expo. Cámara QR y ubicación usan funciones del teléfono. `scripts/prepare-web.cjs` prepara los recursos al iniciar Expo. No edites `mobile/generated/`.

Pruebas: `npm.cmd run check` y `npm.cmd run test:e2e`. Las capturas quedan en `tmp/playwright/`. La cámara, el GPS y los permisos deben revisarse además en un teléfono físico con Expo Go.

La foto del perfil abre un menú de selección de mascota. Tocar una opción la guarda y cierra el menú; cerrarlo sin elegir conserva la foto anterior.

Bebidas de la casa recupera las cuatro hojas de la versión Figma: dos productos en la lista superior, producto destacado a la derecha y otros tres con imagen debajo (cinco productos distintos por hoja), con pestañas, flechas y desplazamiento horizontal.

## Límites y promedios

Los límites se centralizan en data/limits.js y se validan tanto en los controles como al guardar. El máximo del carrito es de diez unidades sumando todas las líneas, incluidas las ediciones. Las reseñas enviadas se guardan en PRODUCT_REVIEWS y cada producto muestra la media aritmética de sus estrellas, sin contar campos omitidos ni ponderar cantidades.

La ficha del producto añade dos pestañas con navegación de teclado: Especificaciones y Reseñas. `productReviews` entrega las entradas del producto de más reciente a más antigua. Al finalizar un pedido, `saveOrderRating` guarda una entrada por producto distinto si hay estrellas o comentario, con nombre y mascota del autor y fecha. El comentario es del pedido y se replica a todos sus productos; una estrella general no se copia a la bebida. `productRating` descarta las entradas sin estrellas. Nombre y comentario se escapan al renderizar. La selección de opciones se conserva al cambiar de pestaña y el botón de agregar se oculta en Reseñas.

## Avisos locales

mobile/localNotifications.js usa solo APIs locales de expo-notifications. No registra tokens ni solicita credenciales de un servicio remoto. El permiso se solicita como máximo una vez automáticamente por ejecución; si se deniega, se puede autorizar desde los ajustes del teléfono. Los avisos se presentan únicamente con el sistema del teléfono, tanto en primer plano como en segundo plano. El manejador permite banner, lista y sonido; no existe un banner superpuesto dentro de la app ni un sustituto si el permiso está denegado. La campana conserva únicamente el registro y la opción de borrarlo. Borrar los avisos también los descarta de la bandeja del teléfono.

La apariencia del aviso del sistema la controla Android/iOS. El icono y la configuración propios de BeanCraft requieren una compilación propia; Expo Go conserva su identidad. Los avisos locales proceden de la ejecución de la app, sin promesa de envío remoto cuando está cerrada. Para revisar permisos y avisos reales hace falta un teléfono físico.
