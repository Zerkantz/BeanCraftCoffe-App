# BeanCraft Coffee App

Aplicación web móvil interactiva para **BeanCraft Coffee** con arquitectura **híbrida**: cumple estrictamente las reglas visuales, tipográficas, de accesibilidad y tokens de la **Guía de diseño front-end BeanCraft v1.0**, integrando en los módulos móviles los flujos e interacciones del **SRS v1.3** (`RF-01`–`RF-11`, `RF-22`, `RN-01`–`RN-05`).

## Arquitectura y archivos principales

- [`tokens.css`](tokens.css): Fuente única de verdad con los 10 tokens de color (`--c-tostado`, `--c-verde`, `--c-espuma`, `--c-menta`, `--c-miel`, `--c-fresa`, `--c-lila`, `--c-limon`, `--c-cereza`, `--c-blanco`), escalas de espaciado y radios, bordes duros (`2px solid var(--c-tostado)`), sombra dura (`4px 4px 0 var(--c-tostado)`), `@media (prefers-reduced-motion: reduce)` y declaraciones `@font-face` locales.
- [`fonts/`](fonts/): Tipografías auto-hospedadas en formato `.woff2` (`Instrument Serif`, `Bricolage Grotesque`, `Instrument Sans`) para funcionar sin CDNs ni dependencias externas.
- [`mascotas.js`](mascotas.js): Exporta `MASCOTAS_INFO`, `MASCOTA_ESTADOS` y `renderMascota(nombre, estado, opts)` con las **5 mascotas SVG originales** (`Grano`, `Taza`, `Espuma`, `Hielito`, `Croissant`) en **5 estados** (`feliz`, `sorprendido`, `triste`, `pensando`, `guino`) trazadas con tokens CSS y contorno Tostado.
- [`index.html`](index.html), [`styles.css`](styles.css), [`app.js`](app.js): Aplicación SPA móvil (`max-width: 430px`) con 6 vistas (`home`, `menu`, `cart`, `orders`, `profile`, `design`), modales nativos `<dialog>` y catálogo completo en [`assets/`](assets/).

## Reglas de diseño e integración híbrida

- **Estricta fidelidad visual**: Cero colores hex fuera de `tokens.css`, cero degradados CSS, cero sombras difuminadas o `backdrop-filter`, cero `text-transform: uppercase`, cero mapas o librerías de terceros y `--c-cereza` reservado para promociones, etiquetas de descuento, estado `Cancelado` y mensajes de error.
- **Hero giratorio + Armador en vivo**: Carrusel 3D orbital en escenario plano (`Menta`/`Espuma`) acompañado por `Grano`, `Espuma` y `Taza`, conectado en tiempo real al armador de `Tamaño`, `Leche` y `Extras` con precio destacado en `.marcatextos`.
- **Inicio y módulos interactivos**:
  - `BarraNovedad` fija superior, `MosaicoPromo` (`RN-01`), **hoja de menú seleccionable** y barra de navegación inferior con botón central `Cupón QR`.
  - **Quiz inline de 5 preguntas** (cierra con `Hielito` en estado `guiño` y botón `"Armarla"`).
  - **Sucursales** con indicador `Abierta`/`Cerrada`, referencia, horarios por cápsula, enlace `"Cómo llegar"`, botón `"Usar mi ubicación"` bajo clic y mapa SVG ilustrado propio.
  - **Menú (`?view=menu`)**: Tarjetas con fondo geométrico facetado en SVG plano pastel (`Menta`, `Miel`, `Fresa`, `Lila`, `Limón`), fotografía grande de bebidas, búsqueda, favoritos y personalizador `RN-02`.
  - **Carrito (`?view=cart`)**: Cupones `RN-01` (`BIENVENIDA`, `OTONO2X1`, `VENCIDO25`), escáner QR simulado y confirmación tipo **Desliza para confirmar**.
  - **Guía viva (`?view=design`)**: Muestra los 10 tokens de color, las 5 insignias de estado (`Recibido`, `Preparando`, `Listo`, `Entregado`, `Cancelado`) y el selector interactivo de las 5 mascotas SVG.

## Ejecución local

Al usar módulos ES (`<script type="module" src="app.js">`), sírvelo mediante HTTP local desde la raíz del repositorio:

```bash
python -m http.server 8000
```

Rutas útiles:

- App principal: `http://localhost:8000/?view=home`
- Menú de bebidas: `http://localhost:8000/?view=menu`
- Guía viva /design: `http://localhost:8000/?view=design`
