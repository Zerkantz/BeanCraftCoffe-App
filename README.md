# BeanCraft Coffee — App Móvil Interactiva

Prototipo web móvil interactivo para **BeanCraft Coffee** (clientes), alineado con los requerimientos funcionales **RF-01 a RF-11 y RF-22** y las reglas de negocio **RN-01 a RN-05** del documento `SRS BeanCraft Coffee v1.3.pdf`.

> **Nota sobre la tecnología del SRS:** El SRS v1.3 especifica **Figma** (prototipo interactivo sin lenguaje de código de interfaz) para el front-end y **MySQL 8.x** para el back-end. Esta versión web interactiva está construida en **HTML5, CSS3 y JavaScript (ES Modules)** para poder interactuar en vivo desde el navegador y exportarse/importarse en **Figma Make** o publicarse mediante **GitHub Pages**.

## Estructura

- `index.html` — Estructura semántica móvil (`<dialog>` nativos, carrusel accesible y vistas de la app).
- `styles.css` — Paleta inspirada en **Caffenio**, carrusel Hero difuminado y hoja de menú seleccionable inspirados en **Luma Boba Shop** en el Inicio, y tarjetas cristalinas de colores en el módulo **Menú**.
- `app.js` — Lógica interactiva completa:
  - **Splash** inicial y acceso directo.
  - **Inicio** con botón de *Iniciar sesión* en la parte superior derecha, selector de sucursal cercana (`RF-04`), carrusel Hero de 5 bebidas y hoja de menú seleccionable.
  - **Menú** con búsqueda, filtro por categorías, favoritos y tarjetas cristalinas de colores (`RF-02`).
  - **Personalizador en vivo** con fórmula `RN-02` (`base + tamaño + leche + endulzante + extras`) (`RF-03`).
  - **Carrito y Checkout** con cupones por código o simulación QR (`RN-01`), horario validado por sucursal (`RN-03`), recoger ahora o programado y pago en mostrador (`RF-05` a `RF-08`).
  - **Seguimiento en 4 estados**, notificaciones push y calificación única tras entrega (`RF-09` a `RF-11`, `RN-04`, `RN-05`).
  - **Perfil** editable y cierre de sesión (`RF-22`).
- `assets/` — Imágenes de bebidas.
- `beancraft-pantallas.pdf` / `beancraft-app-mockup.pdf` — Exportaciones vectoriales para importar pantallas estáticas a Figma Design.

## Cómo ejecutar localmente

```bash
python -m http.server 8080
```

Abre `http://localhost:8080` en Chrome o Edge (recomendado en vista móvil `390 × 844`).
