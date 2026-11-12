import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'css/styles.css'), 'utf8');
const js = await readFile(resolve(root, 'js/main.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
assert.match(html, /<html lang="es">/);
assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'One main heading');
assert.match(css, /prefers-reduced-motion/);
assert(!/\beval\s*\(|requestAnimationFrame|setInterval/.test(js), 'No eval or animation loops');
let references = 0;
for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
  if (/^https?:/.test(value)) continue;
  if (value.startsWith('#')) {
    assert(ids.includes(value.slice(1)), `Broken fragment: ${value}`);
  } else {
    assert((await stat(resolve(root, value))).isFile(), `Missing ${attribute}: ${value}`);
  }
  references++;
}
for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  assert.match(match[0], /rel="[^"]*noopener/, 'External links need noopener');
}
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  for (const attribute of ['alt=', 'width=', 'height=']) assert(match[0].includes(attribute), `Image missing ${attribute}`);
}
for (const match of html.matchAll(/<([a-z0-9]+)\b[^>]*\bdata-en="[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)) {
  assert(!/<[a-z]/i.test(match[2]), 'Translated text must not contain nested elements');
}
console.log(`OK: ${ids.length} unique IDs, ${references} local references, image dimensions, safe links and translation structure.`);
const files = ['index.html', 'css/styles.css', 'js/main.js', 'assets/logo.png', 'assets/pandatec.png', 'assets/favicon.svg'];
const total = (await Promise.all(files.map((file) => stat(resolve(root, file))))).reduce((sum, info) => sum + info.size, 0);
console.log(`Public site: ${(total / 1024).toFixed(1)} KB uncompressed. No external runtime dependencies.`);
