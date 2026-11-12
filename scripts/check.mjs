import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script, runInNewContext } from 'node:vm';
import { fixLocalTexture } from './lib/scene-texture.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (name) => readFile(resolve(root, name), 'utf8');
const source = await load('Shasu Dev (5).html');
const html = await load('index.html');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
assert(!/<style\b/.test(html), 'Styles must be external');
assert(!/<script\b[^>]*>\s*[^\s<]/.test(html), 'Scripts must be external');
assert(!html.includes('data:image/png;base64,'), 'Embedded logo must be a shared asset');

let references = 0;
for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  if (/^https?:/.test(value)) continue;
  if (value.startsWith('#')) assert(ids.includes(value.slice(1)), `Broken anchor: ${value}`);
  else assert((await stat(resolve(root, value))).isFile(), `Missing file: ${value}`);
  references++;
}

const sourceStyles = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
const cssFiles = ['css/reset.css', 'css/styles.css'];
for (const [index, file] of cssFiles.entries()) {
  assert.equal(await load(file), sourceStyles[index], `Original CSS was changed: ${file}`);
}
const sourceScripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => !/\bsrc\s*=/.test(match[1])).map((match) => match[2]);
const scriptFiles = ['js/language.js', 'js/editor.js', 'js/interactions.js', 'js/scene.js', 'js/terminal.js'];
for (const [index, file] of scriptFiles.entries()) {
  const code = await load(file);
  const expected = file === 'js/scene.js' ? fixLocalTexture(sourceScripts[index]) : sourceScripts[index];
  const normalize = (value) => value.replace(/\r\n/g, '\n');
  assert.equal(normalize(code), normalize(expected), `Unexpected JavaScript change: ${file}`);
  new Script(code, { filename: file });
}

const normalizeBody = (input) => input.slice(input.indexOf('<div class="progress"'))
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, 'assets/logo.png');
assert.equal(normalizeBody(html), normalizeBody(source), 'The original body content/layout was changed');
const embeddedLogo = source.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)[1];
assert((await readFile(resolve(root, 'assets/logo.png'))).equals(Buffer.from(embeddedLogo, 'base64')), 'Logo differs from original');
const textureCode = await load('js/logo-texture.js');
const context = { window: {} };
runInNewContext(textureCode, context, { timeout: 1000 });
assert.equal(context.window.__shasuLogoTexture, `data:image/png;base64,${embeddedLogo}`, 'Local-file texture differs from the original logo');
const originalExternal = [...source.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
const allScripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(allScripts, [...originalExternal, ...scriptFiles], 'Script load order was changed');
console.log(`OK: ${ids.length} unique IDs and ${references} local references.`);
console.log('OK: original body, CSS, scene appearance, logo and script order preserved.');
console.log('OK: only the expected file:// texture-loading fix differs from the original scripts.');
