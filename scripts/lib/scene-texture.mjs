// Keep the original scene intact except for local-file texture loading.
export function fixLocalTexture(source) {
  const original = 'img.src = brandImg.currentSrc || brandImg.src;';
  if (!source.includes(original)) throw new Error('Original texture assignment not found');
  const replacement = `// file:// images taint a canvas, so use the original embedded PNG locally.
  // HTTP/HTTPS keep using the shared image without loading an extra asset.
  if (window.location.protocol === "file:") {
    var textureLoader = document.createElement("script");
    textureLoader.src = new URL("logo-texture.js", document.currentScript.src).href;
    textureLoader.onload = function () {
      img.src = window.__shasuLogoTexture;
      delete window.__shasuLogoTexture;
      textureLoader.remove();
    };
    textureLoader.onerror = function () {
      console.warn("Shasu Dev: no se pudo cargar js/logo-texture.js para la textura 3D.");
      textureLoader.remove();
    };
    document.head.appendChild(textureLoader);
  } else {
    img.src = brandImg.currentSrc || brandImg.src;
  }`;
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  return source.replace(original, replacement.replace(/\n/g, eol));
}

export function buildLogoTextureScript(logo) {
  return '// Generated from assets/logo.png. Only loaded for file:// WebGL compatibility.\n'
    + 'window.__shasuLogoTexture = "data:image/png;base64,' + logo.toString('base64') + '";\n';
}
