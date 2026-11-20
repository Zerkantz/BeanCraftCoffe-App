# BeanCraft Coffee App

Aplicación web móvil interactiva para **BeanCraft Coffee** con arquitectura **híbrida**: cumple estrictamente las reglas visuales, tipográficas, de accesibilidad y tokens de la **Guía de diseño front-end BeanCraft v1.0**, integrando en los módulos móviles los flujos e interacciones del **SRS v1.3** (`RF-01`–`RF-11`, `RF-22`, `RN-01`–`RN-05`).

## Arquitectura y archivos principales

- [`tokens.css`](tokens.css): Fuente única de verdad con los 10 tokens de color (`--c-tostado`, `--c-verde`, `--c-espuma`, `--c-menta`, `--c-miel`, `--c-fresa`, `--c-lila`, `--c-limon`, `--c-cereza`, `--c-blanco`), escalas de espaciado y radios, bordes duros (`2px solid var(--c-tostado)`), sombra dura (`4px 4px 0 var(--c-tostado)`), `@media (prefers-reduced-motion: reduce)` y declaraciones `@font-face` locales.
- [`fonts/`](fonts/): Tipografías auto-hospedadas en formato `.woff2` (`Instrument Serif`, `Bricolage Grotesque`, `Instrument Sans`) para funcionar sin CDNs ni dependencias externas.
- [`mascotas.js`](mascotas.js) y [`assets/mascotas/`](assets/mascotas/): Exporta `MASCOTAS_INFO`, `MASCOTA_ESTADOS`, `MASCOTA_FAMILIA_SRC` y `renderMascota(nombre, estado, opts)` conectando las **5 ilustraciones PNG transparentes estilo vintage rubber-hose** (`grano.png`, `taza.png`, `espuma.png`, `hielito.png`, `croissant.png` y `beancraft_mascotas_familia.png`) con soporte de respaldo claro en superficies oscuras (`onDark`), fondos de acento (`accentBg`) y capa `holo` con tokens CSS.
- [`index.html`](index.html), [`styles.css`](styles.css), [`app.js`](app.js): Aplicación SPA móvil (`max-width: 430px`) con 6 vistas (`home`, `menu`, `cart`, `orders`, `profile`, `design`), modales nativos `<dialog>` y catálogo completo de **25 productos** (`20` bebidas + `5` piezas de repostería recortadas sin fondo en [`assets/`](assets/): `concha_vainilla.png`, `dona_fresa.png`, `croissant_mantequilla.png`, `oreja_hojaldrada.png` y `cuernito_mantequilla.png`).

## Reglas de diseño e integración híbrida

- **Estricta fidelidad visual**: Cero colores hex fuera de `tokens.css`, cero degradados CSS, cero sombras difuminadas o `backdrop-filter`, cero `text-transform: uppercase`, cero mapas o librerías de terceros y `--c-cereza` reservado para promociones, etiquetas de descuento, estado `Cancelado` y mensajes de error.
- **Hero giratorio + Armador en vivo**: Carrusel 3D orbital en escenario plano (`Menta`/`Espuma`) flanqueado de forma protagónica por `Grano` (`96 px`), `Espuma` (`90 px`) y `Taza` (`76 px` holo), más la barra dinámica `#heroMascotCallout` en el armador de `Tamaño`, `Leche` y `Extras` con precio destacado en `.marcatextos`.
- **Inicio y módulos interactivos**:
  - `BarraNovedad` fija superior, `MosaicoPromo` (`RN-01`) con stickers `onDark`, **hoja de menú seleccionable** (incluye `Horno Artesanal` y banner dinámico `#sheetMascotBanner`) y barra de navegación inferior con botón central `Cupón QR`.
  - **Quiz inline de 5 preguntas** con alineación de las 5 mascotas (`66–84 px`), anfitriones por pregunta y cierre con `Hielito` (`112 px`) y botón `"Armarla"`.
  - **Sucursales** con indicador `Abierta`/`Cerrada`, referencia, horarios por cápsula, enlace `"Cómo llegar"`, botón `"Usar mi ubicación"` bajo clic y mapa SVG ilustrado propio.
  - **Menú (`?view=menu`)**: Tarjetas con fondo geométrico facetado en SVG plano pastel (`Menta`, `Miel`, `Fresa`, `Lila`, `Limón`), banner guía `#menuMascotBanner`, sellos coleccionables de mascota (`52 px onDark`), fotografías grandes de bebidas y panadería, búsqueda, favoritos y personalizador `RN-02`.
  - **Carrito (`?view=cart`), Pedido (`?view=orders`) y Splash/Perfil**: Cupones `RN-01` (`BIENVENIDA`, `OTONO2X1`, `VENCIDO25`), acompañante de checkout, confirmación **Desliza para confirmar** y vitrinas protagonistas de mascotas (`120–136 px`).
  - **Guía viva (`?view=design`)**: Muestra los 10 tokens de color, las 5 insignias de estado (`Recibido`, `Preparando`, `Listo`, `Entregado`, `Cancelado`), el póster oficial de la familia (`beancraft_mascotas_familia.png`) y las tarjetas de las 5 mascotas con roles y usos.

## Ejecución local

Al usar módulos ES (`<script type="module" src="app.js">`), sírvelo mediante HTTP local desde la raíz del repositorio:

```bash
python -m http.server 8000
```

Rutas útiles:

- App principal: `http://localhost:8000/?view=home`
- Menú de bebidas: `http://localhost:8000/?view=menu`
- Guía viva /design: `http://localhost:8000/?view=design`
