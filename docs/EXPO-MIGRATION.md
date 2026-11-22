# Corrección del frontend móvil de BeanCraft

## Referencias y alcance

Se revisaron el SRS BeanCraft Coffee v1.3 (16 páginas) y la guía de diseño (14 páginas). El SRS define funciones y precios; la guía aporta identidad visual. Los prompts incluidos en los documentos no se ejecutaron como instrucciones adicionales. Se limita el trabajo a la aplicación del cliente.

## Revisión y cambios

| Antes | Decisión e implementación |
| --- | --- |
| Inicio con múltiples secciones comerciales y accesos duplicados | Se conservan carrusel orbital, armador en vivo y promociones desplazables; se retiran las secciones ajenas al flujo del cliente. |
| Seis vistas, incluida una guía de diseño | Cinco vistas: Inicio, Menú, Carrito, Pedido y Perfil. Ruta de diseño retirada. |
| Quiz, favoritos y bandeja de notificaciones | Eliminados junto con su implementación exclusiva; quedan avisos breves internos. |
| Datos y reglas mezclados en el archivo de interfaz | Catálogo/opciones y datos ficticios centralizados en `data/`; validaciones compartidas en `lib/`. |
| Personalización y carrito básicos | Conservados los productos y tarjetas originales; añadida edición completa del producto y validación de precio/cantidad. |
| Cupones sin comprobaciones completas | Activo, vigencia y uso por cuenta; un cupón por pedido, descuento aplicado una sola vez. |
| QR simulado con botones | Cámara real mediante `expo-camera`, permiso bajo demanda, bloqueo de lecturas duplicadas y alternativa manual. |
| Ubicación con sugerencia fija | Coordenadas nativas y cálculo Haversine para sugerir la sucursal más cercana. Selección manual siempre disponible. |
| Horarios insuficientemente validados | Fecha real y futura, días de apertura, límites de horario y propuesta de siguiente horario disponible al cerrar. |
| Confirmación deslizable | Se conserva el control original, después de la revisión integrada en Carrito, con corrección y validación final contra múltiples toques. |
| Controles para avanzar el pedido | Retirados del cliente; simulación temporal aislada en `lib/mock-orders.js`. |
| Calificación general incompleta | Pedido y cada producto de 1 a 5, comentario de hasta 140 caracteres, solo tras entrega y una vez. |
| Acceso y perfil superficiales | Cuentas ficticias con credenciales coherentes, correo duplicado, edición de nombre/teléfono y cambio de contraseña. |

Carrito combina cupón, sucursal, fecha/hora, pago y revisión, y termina con el deslizador original. Pedido combina confirmación y seguimiento. Perfil combina edición y cambio de contraseña; registro y acceso comparten un diálogo.

El carrusel conserva imágenes, escenario orbital, mascotas, gestos y flechas originales. Su armador añade endulzante y usa los cargos centralizados del SRS. La ficha completa mantiene las selecciones del armador al abrir la bebida del frente. Los rótulos de promociones fijas se sustituyen por textos neutrales para no anunciar descuentos inexistentes. La lista de promociones solo muestra cupones activos y vigentes. El deslizador permite teclado/activación asistida y cancela el gesto si se interrumpe.

Se eliminaron estilos exclusivos sin uso, el póster de mascotas de la guía visual y las dependencias de comparación de capturas `pixelmatch` y `pngjs`. Se mantienen las 25 fotografías de productos, las cinco mascotas, nueve fuentes WOFF2 y los tokens originales. `expo-camera` es la única dependencia de ejecución añadida para este alcance.

## Arquitectura conservada

La implementación existente es híbrida: React Native/Expo contiene una WebView con HTML/CSS/JavaScript local. No se presenta como una reescritura de cada pantalla con componentes nativos. Se conservaron estructura, tipografías, imágenes, tarjetas facetadas, botones y paleta Tostado/Verde/Espuma/Menta con sus acentos.

Metro genera `mobile/generated/web-content.js` a partir de las fuentes. Incluye 39 recursos (30 imágenes y 9 fuentes) sin CDN ni servidor web adicional. La cámara, ubicación, áreas seguras, barra de estado, recuperación de carga y botón Atrás están en el contenedor nativo. Se conserva reducción de movimiento y ajuste del teclado configurado en Android.

`.figma/` no es un sitio público independiente: sus scripts empaquetan la misma interfaz y ahora incluyen también `data/` y `lib/`. No se ejecutó ninguna publicación.

## Reglas y límites del modo escolar

- Tamaños: $0/$10/$18; leches: $0/$0/$12/$12; endulzantes: $0/$0/$0/$5; extras: $15/$8/$8, según SRS.
- Precio por unidad = base + opciones + extras. Subtotal = suma de unidades × cantidad. Total = subtotal − descuento del único cupón.
- Horarios expresados en Sonora, UTC−07:00, independientemente de la zona horaria del teléfono.
- No se crean pedidos si falta sesión, carrito, producto disponible, horario válido o cupón válido. Se consulta un pedido actual por usuario; mientras está en curso se impide sustituirlo.
- Pago en efectivo o tarjeta al recoger, sin pasarela ni datos bancarios.
- Todo el estado de prueba es temporal en memoria, incluidas credenciales ficticias y usos de cupones. Se pierde al recargar; no hay backend ni almacenamiento seguro de cuentas reales.
- Avance automático cada 20 segundos, incluso para pedidos programados, exclusivamente para demostración. Se desactiva con `MOCK_CONFIG.autoProgress = false`.
- Avisos dentro de la aplicación; sin notificaciones push, panel de personal, historial o funciones administrativas.

## Validación

`npm run check` comprueba recursos íntegros, cinco vistas/diálogos, scripts empaquetados, precios SRS, cupones, horarios y calificaciones. `npm run test:e2e` cubre el recorrido completo y errores con Edge en tamaños de teléfono. Incluye respuestas simuladas del puente para cámara/ubicación denegadas y ubicación correcta, sin asumir que eso prueba el hardware.

`expo install --check` confirma versiones compatibles. `expo-doctor` comprueba la configuración. `expo export --platform all` genera paquetes Android e iOS. Los archivos de prueba y exportación se guardan en `tmp/`, fuera de las fuentes.

Queda por ejecutar en un teléfono físico: apertura de cámara, lectura de QR impreso, permisos del sistema, GPS real, teclado, áreas seguras y gesto/botón Atrás en Expo Go. Las credenciales, recorrido y comandos están documentados en README.
