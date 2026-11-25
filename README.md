# BeanCraft Coffee

App del cliente para elegir bebidas, personalizarlas y recoger el pedido en una sucursal.

## Abrir la app

Desde esta carpeta, en PowerShell:

```powershell
npm.cmd install
npx.cmd expo start --clear
```

Conecta el teléfono y la computadora al mismo Wi-Fi. Abre Expo Go y escanea el QR. Si la red no permite conectarse, prueba `npx.cmd expo start --tunnel`.

## Cuenta para probar

Correo: `cliente@beancraft.mx`

Contraseña: `Cafe1234`

Puedes crear otra cuenta en Perfil. En esa pantalla también puedes editar tus datos, cambiar la contraseña y tocar tu foto para elegir una mascota.

## Qué puedes probar

- Inicio: carrusel con «Pedir ya», ofertas, Bebidas de la casa con cinco productos por hoja: dos arriba y tres abajo, quiz y pie con mascota cambiante.
- Menú: búsqueda, categorías y promedio de estrellas por producto. La ficha tiene las pestañas Especificaciones y Reseñas. En Reseñas aparecen el nombre de quien opinó, sus estrellas y su comentario.
- Carrito: hasta 10 unidades en total. Puedes editar productos, aplicar cupón, elegir sucursal, hora y pago al recoger. Revisa y desliza para confirmar.
- Pedido: cambia de estado cada 3 segundos. En «Entregado» pulsa «Terminar pedido». Las estrellas del pedido, de los productos y el comentario son opcionales: puedes terminar sin rellenar nada.
- Notificaciones: avisos locales en la barra del teléfono, también mientras usas BeanCraft. La campana de Inicio permite consultar avisos, terminar el pedido o borrar los avisos.

Las bebidas de la casa tienen imágenes sin marcos individuales, sombras y pequeños detalles de píxeles. En el menú, las tarjetas son compactas y la imagen tiene el protagonismo. Toca cualquier parte de la tarjeta para abrir las especificaciones; ahí eliges tamaño, leche, endulzante, extras y agregas el producto con su total. Los adornos combinan destellos, corazones, rombos y escalones pixelados.

Las mascotas, el carrusel y las entradas de pantalla tienen movimiento suave. Se respeta la opción de reducir movimiento del teléfono. Para abrir la app después de actualizar estas animaciones, ejecuta `npm.cmd install` y `npx.cmd expo start --clear`.

El carrito separa productos, descuento, recogida y pago con etiquetas claras y separadores suaves. El cupón, el resumen y la revisión usan fondos Blanco o Espuma y texto Tostado. Antes de confirmar puedes corregir los datos y usar el deslizador. En Pedido, el código de recogida aparece grande al principio; debajo están el estado y las etapas. El pedido entregado se conserva hasta que pulses Terminar pedido.

Cupones de ejemplo: `AVENA10` (Latte de caramelo con leche de avena, $10 menos), `FRIO2X1` (dos Cold brew por uno, solo jueves), `PRIMER15` (15% en el primer pedido), `BIENVENIDA` ($30 menos) y `OTONO20` (20%). Cada promoción muestra su vigencia y condiciones. Un cupón por pedido y un uso por cuenta.

Los datos son de prueba. Las cuentas, mascotas elegidas, pedidos, reseñas, avisos y cupones usados se conservan durante la ejecución y se reinician al recargar la app. El pago se hace al recoger; la app no cobra.

## Límites de texto

Nombre: 60 caracteres. Teléfono: 10 dígitos. Correo: 254 caracteres. Contraseña: entre 6 y 72 caracteres. Cupón: 24 caracteres. Búsqueda: 80 caracteres. Comentario: 140 caracteres.

## Avisos del teléfono

Al recibir el primer aviso puedes autorizar las notificaciones. Si las rechazas, puedes autorizarlas después en los ajustes de Expo Go del teléfono. Tocar un aviso abre la pantalla relacionada. La campana de Inicio conserva únicamente el historial y la opción de borrarlo.

Los avisos son locales, generados mientras la app ejecuta sus datos de prueba. No hay un servidor que envíe avisos con la app cerrada. La app no muestra banners propios: el teléfono presenta sus notificaciones con su formato habitual. En Expo Go, el icono del sistema pertenece a Expo Go.

Cada aviso lleva el nombre BeanCraft, el verde de la marca y una firma de Grano, Taza, Espuma, Hielito o Croissant con su frase. Android decide cómo colocar y mostrar estos elementos. El grano del logo como icono y la imagen de Taza están preparados para cuando se instale una versión propia de BeanCraft; esas imágenes no cambian dentro de Expo Go. Las notificaciones ya recibidas mantienen su apariencia.

Los promedios se calculan solo con las estrellas de producto enviadas durante esta ejecución. La cantidad comprada y las reseñas omitidas no alteran el promedio.

El comentario del pedido aparece en las reseñas de todos sus productos, identificado como «Comentario del pedido». Si no calificaste un producto, se muestra «Sin calificación del producto» y ese comentario no cambia sus estrellas. Puedes consultar reseñas de otras cuentas creadas en la misma ejecución. Al cambiar entre pestañas se conservan las especificaciones y la cantidad elegidas.

## Subir cambios a GitHub

La rama de trabajo es **AppMain**. Ejecuta estos comandos cuando quieras subir tus cambios:

```powershell
git switch AppMain
git status
git add .
git commit -m "Actualizar el frontend de BeanCraft"
git push origin AppMain
```

`git status` muestra qué archivos cambiaste. `git commit` guarda una versión local y `git push` la sube a GitHub. Si Git indica que hay cambios nuevos de otros colaboradores, resuélvelos antes de volver a subir; no uses `--force`.

## Comprobar cambios

```powershell
npm.cmd run check
npm.cmd run test:e2e
```

Las pruebas visuales usan Microsoft Edge. Para detalles del diseño y para recuperar los bordes de las tarjetas anteriores, consulta `docs/EXPO-MIGRATION.md`.
