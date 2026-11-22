# BeanCraft Coffee · App del cliente

Proyecto escolar preparado para Expo Go. Conserva la arquitectura existente: contenedor React Native/Expo SDK 58 y pantallas HTML/CSS/JavaScript locales en WebView. Cámara QR, ubicación, áreas seguras y botón Atrás se integran mediante módulos nativos. No requiere una web publicada.

## Iniciar en Windows

```powershell
npm.cmd install
npx.cmd expo start --clear
```

En esta copia las dependencias ya están instaladas. `npx.cmd` evita el bloqueo de scripts `npx.ps1` de PowerShell sin cambiar la política del sistema. También funciona `npx expo start` en una terminal que lo permita.

Usa Node 22.13+ de la rama 22 o 24.3+ de la rama 24, y Expo Go compatible con SDK 58. Conecta teléfono y computadora a la misma red y escanea el QR. Si tu red bloquea Metro, puedes iniciar con `npx.cmd expo start --tunnel`.

## Cinco accesos principales

| Pantalla | Función |
| --- | --- |
| Inicio | Carrusel orbital original, armador de bebidas en vivo, sucursal, promociones vigentes y pedido actual. |
| Menú | Productos activos, búsqueda, filtros y detalle personalizable. |
| Carrito | Edición, cantidades, cupón manual/QR, recogida, pago en mostrador, revisión y deslizador original para confirmar. |
| Pedido | Confirmación, resumen, cuatro estados y evaluación tras la entrega. |
| Perfil | Acceso/registro, edición de nombre y teléfono, cambio de contraseña y cierre de sesión. |

Detalle, acceso, sucursal, cupón QR y evaluación usan diálogos. No hay navegación administrativa, quiz, favoritos, bandeja de notificaciones ni página de diseño.

## Probar el recorrido

Cuenta ficticia: **cliente@beancraft.mx** / **Cafe1234**. También puedes registrar otra cuenta.

1. Inicia sesión y abre Menú. Personaliza un Latte de caramelo: grande, avena, sin endulzante y shot extra = **$100 MXN**.
2. Revisa el carrito, modifica cantidades o edita el producto. Aplica `BIENVENIDA`: descuento de $30 por pedido, total $70 para una unidad.
3. Elige sucursal manualmente o solicita ubicación; la sugerencia usa distancia geográfica entre coordenadas de prueba. Selecciona una hora futura dentro del horario de esa sucursal (hora de Sonora).
4. Elige efectivo o tarjeta **al recoger**, revisa y desliza para confirmar. El deslizador conserva su gesto original y admite Enter/Espacio o activación asistida. No se solicitan datos bancarios.
5. La simulación avanza cada 20 segundos: recibido → preparando → listo → entregado. Al finalizar, califica el pedido y cada producto; solo se permite una evaluación.
6. En Perfil, modifica nombre/teléfono y cambia la contraseña. Cierra sesión y verifica el nuevo acceso.

Cupones de prueba centralizados en `data/mocks.js`:

| Código | Caso |
| --- | --- |
| BIENVENIDA | $30 menos, activo hasta 2028-12-31. |
| OTONO20 | 20% menos, del 2026-09-01 al 2026-11-30. |
| VENCIDO25 | Vencido. |
| INACTIVO | Desactivado. |

Un QR debe contener el código literal, por ejemplo `BIENVENIDA`. En Carrito → Escanear QR → Abrir cámara se solicita el permiso. Si lo deniegas, vuelve a la captura manual. La ubicación también pide permiso solo cuando pulsas “Usar mi ubicación”.

## Datos y simulación

No existe backend ni conexión a base de datos. Cuentas, contraseñas de prueba, cambios de perfil, carrito, cupones usados, pedido y evaluación viven en memoria y **se reinician al recargar o cerrar la ejecución**. Cerrar sesión conserva las cuentas en esa misma ejecución y vacía el carrito. Usa datos ficticios.

La simulación está separada en `lib/mock-orders.js` y se configura con `MOCK_CONFIG` en `data/mocks.js`. También acelera los pedidos programados para poder demostrar el flujo en clase. En una integración futura, los estados vendrán del servicio del personal. Los avisos actuales son internos; no son notificaciones push. Solo se conserva el pedido actual por cuenta.

## Continuar trabajando en la misma estructura

- `app.js`, `index.html`, `styles.css`, `tokens.css`: navegación, interfaz y diseño original corregidos.
- `data/catalog.js`: productos, imágenes y cargos de personalización del SRS.
- `data/mocks.js`: sucursales, horarios, coordenadas, cupones, usuarios y configuración de simulación.
- `lib/rules.js`: cálculo de precios, cupones, horarios, distancia y validaciones.
- `lib/mock-orders.js`: avance automático exclusivo del modo de prueba.
- `mascotas.js`, `assets/`, `fonts/`: ilustraciones, fotografías y fuentes locales originales.
- `mobile/`: contenedor Expo y puente con cámara, ubicación y navegación nativa.
- `scripts/prepare-web.cjs`: genera el contenido local al iniciar Metro y al guardar cambios. **No editar `mobile/generated/`.**

`npm.cmd run web` permite inspeccionar la misma interfaz en `http://localhost:8000`; la cámara QR nativa se prueba en Expo Go. `.figma/` se conserva como metadatos y herramientas de la exportación, sin publicar nada automáticamente.

## Verificación

```powershell
npm.cmd run check
npm.cmd run test:e2e
npx.cmd expo install --check
npx.cmd expo-doctor
npx.cmd expo export --platform all --output-dir tmp/expo-export
```

Las pruebas de interfaz usan Microsoft Edge instalado y guardan capturas en `tmp/playwright/`. Cubren acceso/registro, perfil/contraseña, precios, carrito, cupones, revisión/confirmación, seguimiento/evaluación, permisos denegados mediante el puente simulado, navegación y pantallas pequeñas.

También verifican el carrusel original, el precio del armador, el arrastre de confirmación y el regreso del deslizador cuando se suelta antes de completar el gesto.

La comprobación automatizada del puente no sustituye la prueba física de cámara, GPS, permisos del sistema, teclado y áreas seguras en Android/iPhone. El empaquetado Android/iOS comprueba la integración de módulos, sin abrir Expo Go en un teléfono.

Consulta `docs/EXPO-MIGRATION.md` para el alcance de la corrección y las decisiones técnicas.
