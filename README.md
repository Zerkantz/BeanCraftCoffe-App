# BeanCraft Coffee · Web v2

Sitio de marca para visitantes y panel del personal (SRS v1.3), como app web ejecutable en JavaScript con módulos ES, sin compilación ni instalación de dependencias. Incluye Anime.js 4.5.0 como módulo local con su licencia MIT. Sigue la arquitectura del repo móvil (`data/`, `lib/`, CSS por capas, un solo `index.html`) y se puede llevar a Figma capturando cada ruta con html.to.design.

## Abrir la app

```bash
npm start            # http://localhost:5173/   ·   guía para Figma: http://localhost:5173/#/guia
```

Los módulos ES no cargan con doble clic (file://): hace falta `npm start` o cualquier servidor estático. En Figma Make basta con subir la carpeta comprimida.

## Ajustes del 26 nov 2026

- Movimiento con Anime.js local: entrada del inicio, flotación de bebidas y mascotas, respuesta al cursor y giro automático del carrusel cada 4.5 segundos, activo desde la apertura de la página. Se pausa al pasar el cursor, usar el teclado o salir de la vista. Se retiraron los controles añadidos del carrusel y el botón de activación, por indicación del usuario.
- «Qué es BeanCraft» integra Menta, Miel, Lila y Fresa, las mascotas y los píxeles de marca. Las fuentes se sirven desde `fonts/`.
- Panel sin tarjetas: cifras en franjas, secciones abiertas, gráficas rotuladas y comandas separadas con líneas discretas; campos y botones conservan sus bordes.
- Fechas con dos calendarios nativos y validación del intervalo. Resumen, Pedidos, Calificaciones y Notificaciones filtran sus registros; las cifras y gráficas se calculan desde esos mismos registros. Los parámetros `desde`, `hasta`, `sucursal` y `agrupar` conservan la consulta en la URL.
- Los registros originales sin fecha pertenecen al **20 nov 2026**, indicado en su fuente. La vista inicial abre ese período disponible. Los accesos rápidos «Hoy» y «Ayer» usan el reloj real (o `?ahora=`); un período sin registros muestra un estado vacío, sin generar historial ficticio.
- Límites de entrada: 50 caracteres para búsquedas, contraseñas y números; 100 para textos breves y correos; 200 para áreas de texto. El teléfono sigue validando diez dígitos. Las áreas de texto muestran un contador.

## Qué cambió respecto a la v1

- **El inicio es una landing de marca sin pedidos.** Contiene:
  - carrusel 3D adaptado del repo móvil;
  - qué es BeanCraft;
  - las hojas "Bebidas de la casa";
  - el explorador de combinaciones con precio de referencia;
  - combinaciones sugeridas;
  - promociones vigentes;
  - quiz;
  - sucursales con horario en vivo.

  No hay carrito, total, botón "Pedir en la app" ni seguimiento de pedidos (SRS 2.1: el pedido vive en la app).
- **"Iniciar sesión · Solo personal" en la barra superior**, en escritorio, tablet y móvil. El acceso valida correo y contraseña contra los usuarios de prueba y aplica la matriz de permisos del SRS.
- **Una sola app en lugar de 218 HTML.** Rutas por hash, un DOM por pantalla y se vuelve a dibujar al cruzar de breakpoint (móvil < 640 px, tablet < 1024 px, escritorio ≥ 1024 px).
- **Datos sincronizados con el repo del 21 nov 2026:**
  - sucursales Centro, Kino y Bosque, con direcciones, coordenadas y horarios reales;
  - cupones AVENA10, FRIO2X1, PRIMER15, BIENVENIDA y OTONO20, más VENCIDO25 e INACTIVO para probar errores;
  - catálogo de 25 productos.
- **Datos vivos en el panel.** Los pedidos avanzan un estado a la vez (RN-04). Cupones, usuarios y comentarios se activan, desactivan u ocultan. Todo se conserva en la pestaña al recargar.

## v2.1 (22 nov 2026)

- **Hero:** el título y el carrusel van lado a lado también en tablet; la ficha de la bebida pasa abajo a todo el ancho. En móvil (menos de 640 px) se apilan.
- **Sucursales:**
  - En escritorio el mapa ocupa 7 de 12 columnas y todo el alto de la ventana, y se queda fijo mientras bajas por la lista.
  - En tablet y móvil va arriba de la lista.
  - Las calles llevan su nombre. Tocar un pin resalta y muestra su tarjeta; pasar por una tarjeta resalta su pin.
- **Acceso a pantalla completa:**
  - A la izquierda va la escena de marca con mascotas flotantes y granos de café.
  - La Taza anfitriona reacciona a lo que pasa en el formulario: saluda, da indicaciones con el correo, se voltea con la contraseña, niega ante un error y salta al entrar.
  - A la derecha va el formulario.
  - Las animaciones se apagan si el sistema pide movimiento reducido.
- **Barra lateral compacta (1024–1279 px, tablet y móvil):** al pasar, enfocar o seleccionar un ícono aparece el nombre de la sección a su lado (debajo, en la barra superior móvil). Al entrar a una sección, su nombre se muestra en amarillo un momento.

## v3 (25 nov 2026) · distribución y presentación

- **Inicio:** queda solo el hero con el carrusel, Qué es BeanCraft, Las bebidas de la casa, el quiz y Pasa por tu barra. El explorador, las combinaciones y las promociones viven en sus pestañas.
  - **Hero nuevo:** a la izquierda el texto con dos acciones y tres cifras (productos, barras y calificación); a la derecha la vitrina con el carrusel.
  - **Carrusel:** flechas y contador sobre la vitrina; el nombre, el precio y las acciones van debajo como pie de foto, sin caja.
- **Navegación:** la pestaña "Bebidas" ahora se llama **Menú** (la ruta sigue siendo `#/bebidas`).
- **Arma tu combinación:**
  - Riel horizontal de bebidas base.
  - Vitrina fija con el nombre y la receta escrita.
  - Desglose como ticket de papel.
  - Pasos numerados para tamaño, leche, endulzante y extras.
- **Combinaciones de la barra:** pizarra verde a todo el ancho, columnas separadas por líneas, foto sobre un disco de color y la receta en cursiva. Sin tarjetas.
- **Menú:**
  - Categorías con su foto.
  - Búsqueda y orden a la derecha.
  - Con "Todas", el menú muestra una cuadrícula continua de productos, sin apartados por categoría ni promociones intercaladas. Se conservan los filtros, la búsqueda y el orden.
  - Tarjetas compactas: foto grande y centrada que sobresale del fondo, mascota original, nombre, estrellas y precio discreto. Toda la tarjeta es un enlace nativo a la ficha, con acceso por teclado y foco visible; la descripción y la personalización se conservan en la ficha.
  - Destellos, corazones, rombos y escalones en SVG pixelado, con los tokens Lila, Fresa, Limón y Miel. "Bebidas de la casa" sigue el cartel de la app móvil: cabecera Tostado o Verde con lista y foto destacada; debajo, tres imágenes libres con sombras y sin marcos individuales.
  - La ficha incluye "Pedir en la app" como botón inactivo, sin enlace ni acción de pedido. La personalización y el cálculo del precio siguen funcionando.
  - Animaciones de entrada y al desplazarse en el inicio, flotación del vaso frontal del carrusel y respuestas al pasar el cursor por los productos. Se respeta la preferencia de movimiento reducido.
- **Acceso:**
  - Formulario abierto sobre crema.
  - Escena con una comanda que cambia sola de estado y las mascotas sobre un mostrador; reaccionan al formulario.
- **Panel:**
  - Encabezado más grande con línea inferior y tablas con más aire.
  - El Resumen se agrupa en tres bloques rotulados (Ventas y productos, Pedidos, Clientes y cupones), con superficies claras, cifras separadas y accesos directos. Los pedidos tienen contadores por estado y comandas con separación visual; los contadores también responden a la búsqueda.
  - Las pantallas del panel y del acceso usan textos de producto, sin referencias a requisitos ni notas de datos de prueba. Se conservan los permisos, las rutas y las operaciones existentes.
- **Corrección:** el sitio elegía la versión de escritorio con el ancho de la ventana incluida la barra de desplazamiento; entre 1024 y 1040 px eso causaba desplazamiento horizontal en Windows. Ahora usa el ancho útil.

## v2.2 (24 nov 2026) · panel sin tarjetas

El panel de administración deja de ser una rejilla de tarjetas blancas sobre fondo menta. El sitio público no cambia. Se conservan los colores, la tipografía y los componentes; los cambios están en `css/panel.css` y en las reglas del panel de `css/componentes.css`, sin `::before` ni `::after`, para el export a Figma.

- **Fondo:** el área de trabajo pasa a crema y la barra lateral a menta, separada por una línea café.
- **Bloques** (gráficas, tablas, formularios): ya no son cajas. Cada uno abre con una línea café y su título, con más aire entre bloques.
- **Cifras del resumen:** una franja entre dos líneas, con divisiones verticales. En tablet, en móvil y entre 1024 y 1279 px, las divisiones pasan a horizontales.
- **Tablas:** abiertas, con encabezado subrayado y renglones divididos por líneas finas. Al pasar el cursor, el renglón se pinta de menta.
- **Pedidos:** las cuatro columnas son carriles separados por líneas. Cada pedido es una comanda dividida por un corte punteado; al pasar o seleccionarla se pinta de menta. Los programados conservan su franja lila.
- **Formularios del panel:** sin recuadro. El desglose del pedido es un ticket con cortes punteados.
- **Sin cambios:** los campos, el área para subir la foto, los avisos, el detalle lateral, los diálogos y la vista previa del menú, que reproduce la tarjeta del sitio.

## Usuarios de prueba

| Correo | Contraseña | Rol |
| --- | --- | --- |
| ricardo@beancraft.mx | Admin1234 | Administrador · todas las sucursales |
| daniela@beancraft.mx | Barra1234 | Personal · Centro |
| julian@beancraft.mx | Barra1234 | Personal · Kino |
| montse@beancraft.mx | Barra1234 | Personal · Bosque (desactivada: no puede entrar) |

Los clientes entran solo por la app; en la web su acceso se rechaza. Es un control del prototipo, en el navegador: la seguridad real la dan MySQL y sus privilegios por rol (RF-12, RNF-02).

## Permisos por rol

| Pantalla | Administrador | Personal |
| --- | --- | --- |
| A-02 Resumen | Sí | No |
| A-03 / A-04 Pedidos y detalle | Todas las sucursales | Solo su sucursal (RF-16) |
| A-05 a A-16 (productos, opciones, sucursales, cupones, calificaciones, notificaciones, usuarios, respaldo) | Sí | No → A-19 |
| A-17 / A-18 Perfil y contraseña | Sí | Sí |
| A-20 Confirmaciones | Todas | Solo cerrar sesión |

La matriz vive en `js/auth/permisos.js` y la usan la barra lateral, la guardia de rutas y las pruebas.

## Estructura

```text
index.html            único HTML: contenedor #app, versión sin JavaScript (carta, sucursales, preguntas)
404.html              devuelve a la app en alojamientos estáticos
css/                  tokens · componentes · sitio · panel · libreria · landing
js/main.js            arranque y redibujado por ruta y por breakpoint
js/app/               router · pantallas (marcos y guardia) · interacciones · acciones · estado · enlaces
js/auth/              permisos (matriz) · sesion · guardia
js/data/              catalogo · sucursales · cupones · usuarios · pedidos · panel · experiencia
js/lib/               reglas (RN-01, RN-02, RN-04, horario de Hermosillo) · iconos · qr · foto
js/componentes/       base (librería de la v1) · landing (Carrusel3D, Explorador, HojasCasa…)
js/vistas/            sitio/ · panel/ · libreria · guia
tests/                pruebas unitarias (node --test) y de navegador (tests/e2e)
scripts/              servir · proporcion
```

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `#/` | Landing |
| `#/bebidas?cat=&q=&orden=` | Catálogo |
| `#/producto/<slug>` | Ficha con sus opciones |
| `#/combinaciones?base=` · `?combo=` · `?quiz=` | Explorador de combinaciones |
| `#/promociones`, `#/sucursales`, `#/ayuda`, `#/privacidad`, `#/contacto` | Páginas del sitio |
| `#/design` | Guía viva |
| `#/acceso` | Inicio de sesión del personal |
| `#/panel/<pantalla>?estado=` | Panel |
| `#/libreria/01-fundamentos` … `04-organismos` | Librería de componentes |
| `#/guia` | Guía de entrega para Figma |

- `?estado=` abre cualquier estado de una pantalla.
- `?ahora=2026-11-20T08:15` fija la hora de referencia.
- `?bp=movil` fuerza un breakpoint.

## Llevarlo a Figma

1. `npm start` y abre `#/guia`.
2. Usa el atajo "Entrar como administrador" antes de capturar las pantallas del panel.
3. En html.to.design pega la URL de cada enlace y captúrala a 1440, 834 y 390 px. El título de la pestaña es el nombre del frame.
4. Importa `tokens/beancraft.tokens.json` como variables. Las clases raíz siguen siendo los nombres de componente (`TarjetaBebida`, `Carrusel3D`…) y las variantes van en `data-*`.

## Pruebas

```bash
npm test                         # 23 pruebas: reglas, permisos, sesión, vistas sin pedidos, enlaces
npm start & npm run e2e          # 12 recorridos en navegador y rastreo de todos los enlaces internos
node tests/e2e/desbordes.mjs     # desbordes y textos cortados en 7 anchos (320–1920 px)
npm run proporcion               # proporción de código por lenguaje
```

Las pruebas de navegador usan Playwright (local o global) y Chrome; cambia la ruta con `CHROME=/ruta/al/navegador`.

## Proporción de lenguajes

| Lenguaje | Meta | v3 |
| --- | --- | --- |
| JavaScript | 71.9 % | 67.5 % |
| CSS | 23.5 % | 30.7 % |
| HTML | 4.6 % | 1.8 % |

La v2.1 sumó la escena animada del acceso, el mapa grande y el hero lado a lado, que son sobre todo estilo, así que CSS subió. CSS queda 4.8 puntos arriba: ya se quitaron las reglas de piezas que ya no existen (armador, escenario del hero, botón de pedir), y el resto está en uso. HTML queda 2.6 puntos abajo porque la interfaz se arma en JavaScript; el HTML real es la versión sin JavaScript de `index.html` y `404.html`. No se agregó código de relleno para cuadrar las cifras.

## Decisiones aplicadas

- **D1.** P-06 "¿Cómo va mi pedido?" sale del sitio; el estado del pedido vive en el panel.
- **D2.** Un solo enlace neutro, "Conoce la app", en el pie de página. La frase del repo que invitaba a pedir se cambió por una de marca.
- **D3.** Se mantienen los nombres renombrados: "Helado batido Berry & Nuez" y "Frappé proteico de mango".
- **D4.** A-13 Notificaciones es solo para el administrador.
- **D5.** El explorador muestra un "precio de referencia" con desglose RN-02 y sin botón de pedir.

## Pendiente

- **Fotos de producto.** Las del repo traen logos de Caffenio, Ciel y Protea; conviene sustituirlas por fotos con vasos de BeanCraft. Basta con usar el mismo nombre de archivo en `assets/productos/`.
- **Mascotas.** Faltan los estados sorprendido, triste, pensando y guiño de las cinco mascotas.
- **Redes sociales.** Faltan los glifos oficiales de Instagram, Facebook y TikTok.
- **Backend.** Conectar `js/auth/sesion.js` y `js/data/` con la API y MySQL cuando exista.
