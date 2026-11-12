# Shasu Dev · diseño original

Esta rama conserva la apariencia y el contenido de **`Shasu Dev (5).html`**, separando sus estilos, scripts y logo. No aplica el rediseño violeta.

## Ramas

- **`main`**: diseño original, organizado en archivos independientes. Rama activa por defecto en este repositorio local.
- **`rediseno-violeta`**: la versión alternativa rediseñada, con la captura de Pandatec, nuevos bloques y paleta violeta.

Para cambiar de versión, primero guarda o confirma cualquier cambio pendiente:

```sh
git switch rediseno-violeta
git switch main
```

## Abrir

Abre `index.html` en el navegador, o con Node.js 18 o superior:

```sh
npm start
```

Visita `http://localhost:3000`. No requiere `npm install` ni compilación.

## Estructura

```text
index.html                  HTML del diseño original
css/reset.css               Estilos base originales
css/styles.css              Diseño, componentes, responsive y animaciones originales
js/language.js              Español/inglés y copiar usuario
js/editor.js                Animación del editor de código
js/interactions.js          Navegación, apariciones y cursor con partículas
js/scene.js                 Escena 3D con Three.js
js/logo-texture.js          Logo original incrustado para textura 3D en file://
js/terminal.js              Efecto de tarjetas y terminal interactiva
assets/logo.png             Logo original compartido, antes repetido en base64
assets/pandatec.png          Captura disponible; no insertada en el diseño original
scripts/serve.mjs           Servidor local de vista previa
scripts/check.mjs           Verificación de la separación y sintaxis
scripts/separate-original.mjs  Transformación reproducible del HTML original
Shasu Dev (5).html          Fuente original intacta
captura.png                Captura original intacta
```

## Qué se conserva

La paleta, tipografías, secciones, textos, elementos de ejemplo, orden, efectos, cursor, escena 3D y terminal del archivo original. El CSS y el JavaScript mantienen su orden de ejecución. El encabezado HTML se organizó con sus metadatos dentro de `head`.

**Compatibilidad al abrir con doble clic:** en `file://`, los navegadores pueden bloquear imágenes externas usadas en texturas WebGL. Para evitarlo, `js/scene.js` carga `js/logo-texture.js` únicamente en ese modo. Contiene exactamente el PNG incrustado del original, que no contamina el canvas. En HTTP/HTTPS sigue usando `assets/logo.png` y no descarga ese archivo adicional. No cambian el material, la iluminación ni la apariencia del cubo.

También se mantienen **Google Fonts y Three.js desde CDN**, como en el original. Se necesita conexión para descargar esas fuentes y el motor 3D. Si Three.js no está disponible, la escena no se inicia; no se introduce una dependencia de Node.js.

La captura de Pandatec está guardada, pero la tarjeta en `main` conserva la presentación original. El rediseño con la captura integrada está en `rediseno-violeta`.

## Verificar

```sh
npm run check
```

Comprueba sintaxis, referencias, logo, orden de scripts y coincidencia con el original, permitiendo únicamente la corrección de carga de textura en `file://`. Verifica también que la textura incrustada sea idéntica al logo original. Esto no sustituye pruebas en navegador ni una auditoría de accesibilidad.

Si más adelante personalizas el sitio, adapta las comprobaciones de igualdad: están pensadas para esta separación inicial. No ejecutes `scripts/separate-original.mjs` sobre cambios personalizados sin guardarlos; regenera `index.html`, los dos CSS, los cinco scripts y el logo a partir del original.

## Publicar

Publica `index.html`, `css/`, `js/` y `assets/` en un alojamiento estático. No necesita backend. El HTML original, las capturas de respaldo y `scripts/` no son necesarios en producción.
