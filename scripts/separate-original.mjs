// Mechanical extraction, not a redesign. The untouched HTML is the source of truth.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'Shasu Dev (5).html'), 'utf8');
const styleFiles = ['css/reset.css', 'css/styles.css'];
const scriptFiles = ['js/language.js', 'js/editor.js', 'js/interactions.js', 'js/scene.js', 'js/terminal.js'];
const styles = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
const scripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter((match) => !/\bsrc\s*=/.test(match[1]));
assert.equal(styles.length, styleFiles.length, 'Unexpected number of original styles');
assert.equal(scripts.length, scriptFiles.length, 'Unexpected number of original scripts');

for (const folder of ['css', 'js', 'assets']) await mkdir(resolve(root, folder), { recursive: true });
for (const [index, match] of styles.entries()) await writeFile(resolve(root, styleFiles[index]), match[1], 'utf8');
for (const [index, match] of scripts.entries()) await writeFile(resolve(root, scriptFiles[index]), match[2], 'utf8');

let html = source;
let styleIndex = 0;
html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, () => `<link rel="stylesheet" href="${styleFiles[styleIndex++]}">`);
let scriptIndex = 0;
html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attributes) => {
  if (/\bsrc\s*=/.test(attributes)) return full;
  // Keep synchronous execution at the original position and in the original order.
  return `<script src="${scriptFiles[scriptIndex++]}"></script>`;
});

const embeddedImages = [...html.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)];
assert.equal(embeddedImages.length, 3);
assert(embeddedImages.every((match) => match[1] === embeddedImages[0][1]), 'Unexpected different embedded images');
await writeFile(resolve(root, 'assets/logo.png'), Buffer.from(embeddedImages[0][1], 'base64'));
html = html.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, 'assets/logo.png');

// Move the existing metadata and stylesheets into a valid head, without changing the body.
const bodyStart = html.indexOf('<div class="progress"');
assert(bodyStart > 0, 'Original content start not found');
const oldHead = html.slice(0, bodyStart);
const metadata = [...oldHead.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map((match) => match[0]);
const title = oldHead.match(/<title>[\s\S]*?<\/title>/i)[0];
const head = `<!doctype html>\n<html lang="es">\n<head>\n${metadata.slice(0, 2).join('\n')}\n${title}\n${metadata.slice(2).join('\n')}\n</head>\n<body>\n`;
await writeFile(resolve(root, 'index.html'), head + html.slice(bodyStart), 'utf8');
console.log('Original design separated: index.html, 2 stylesheets, 5 scripts and one shared logo.');
console.log('No content, palette, animation or project changes applied.');
