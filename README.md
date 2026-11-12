# Shasu Dev

Portafolio estático, responsive y bilingüe. HTML, CSS y JavaScript nativos: sin framework, compilación, fuentes externas, WebGL ni dependencias de producción.

## Abrir

Abre `index.html` directamente en el navegador, o usa Node.js 18 o superior:

```sh
npm start
```

Visita `http://localhost:3000`. No hace falta ejecutar `npm install`.

```sh
npm run check
```

Comprueba sintaxis, referencias locales, identificadores, imágenes y estructura de traducciones. No sustituye pruebas visuales ni de accesibilidad en navegador.

## Archivos

```text
index.html             Contenido, SEO básico y estructura accesible
css/styles.css         Paleta, componentes y adaptación móvil
js/main.js             Menú, idioma, navegación y terminal
assets/logo.png        Logo recuperado del HTML original
assets/pandatec.png     Captura proporcionada de Pandatec
assets/favicon.svg     Icono del sitio
scripts/serve.mjs      Servidor de vista previa local
scripts/check.mjs      Comprobaciones sin dependencias
```

`Shasu Dev (5).html` y `captura.png` se conservan intactos como originales. No son necesarios para publicar el sitio nuevo.

## Editar

- **Colores:** variables al inicio de `css/styles.css`. Negro `#09090B`, blanco `#F4F4F5`, violeta `#A78BFA`; gris `#A1A1AA` como apoyo.
- **Textos:** español dentro de los elementos de `index.html`; inglés en `data-en`. Mantén esos elementos sin etiquetas anidadas. Los textos de la terminal están en `js/main.js`.
- **Proyectos:** tarjeta real de Pandatec en `#proyectos`. No se publican proyectos, estudios ni testimonios ficticios.
- **Contacto:** busca `51989168816` en HTML y JavaScript para cambiar WhatsApp. Revisa también perfiles sociales antes de publicar.
- **Imágenes:** sustituye `assets/pandatec.png` y actualiza `width`, `height` y el texto alternativo si cambia la captura.

## Rendimiento y accesibilidad

- Sin solicitudes a CDNs, fuentes externas, analítica ni cookies de seguimiento.
- Imágenes con dimensiones para reservar espacio; captura con carga diferida.
- Sin cursores artificiales, partículas ni bucles permanentes de animación.
- Menú con estado accesible, Escape y cierre al salir; foco visible y enlace para saltar al contenido.
- FAQ con `details` nativo; contenido principal y enlaces utilizables sin JavaScript.
- Respeta `prefers-reduced-motion`. El idioma elegido se recuerda localmente si el navegador lo permite.
- La terminal es una simulación con comandos permitidos; no ejecuta código ni accede al sistema.

## Publicar

Sube **solo `index.html`, `css/`, `js/` y `assets/`** a un alojamiento estático (GitHub Pages, Netlify, Cloudflare Pages o similar). No necesita backend.

Al tener dominio definitivo, agrega la URL canónica y las URLs absolutas `og:url` y `og:image` para las vistas previas sociales. No se incluye una URL inventada. El servidor de `scripts/serve.mjs` es únicamente para desarrollo local.
