/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

/**
 * Post-build emitter:
 * - Copies server JS from ../out to ../dist and renames .js -> .gs
 * - Builds Index.html by injecting client bundle into src/client/index.html.tmpl
 * - Ensures dist structure exists
 */

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => path.join(dir, name));
}

function copyServerJsAsGs() {
  const serverEntries = ['Code.js', 'GeminiService.js', 'SheetsService.js', 'SharedTypes.js', 'Validation.js'];
  ensureDir(DIST);
  serverEntries.forEach((file) => {
    const from = path.join(OUT, file);
    if (!fs.existsSync(from)) return;
    const base = path.basename(file, '.js');
    const to = path.join(DIST, base + '.gs');
    const code = fs.readFileSync(from, 'utf8');

    // Phased cleanup to convert webpack+CommonJS output into plain GAS-safe script
    let transformed = code;

    // 0) Remove webpackBootstrap IIFE wrapper lines and "use strict"
    transformed = transformed
      // remove the exact first line like "/******/ (() => { // webpackBootstrap"
      .replace(/^\s*\/\*{2,}\/\s*\(\(\)\s*=>\s*\{\s*\/\/\s*webpackBootstrap\s*$/m, '')
      // also handle when comment moves next line: "/******/  (() => { // webpackBootstrap"
      .replace(/^\s*\/\*{2,}\/.*\n\s*\(\(\)\s*=>\s*\{\s*\/\/\s*webpackBootstrap\s*$/m, '')
      // fallback: remove any sole "(()=>{" at BOF
      .replace(/^\s*\(\(\)\s*=>\s*\{\s*$/m, '')
      // remove top-level "use strict";
      .replace(/^\s*["']use strict["'];\s*$/m, '')
      // remove webpack banner block lines like /*! ... */
      .replace(/^\s*\/\*!\s*.*\*\/\s*$/gm, '')
      // remove trailing "})();"
      .replace(/^\s*\}\)\(\);\s*$/m, '');

    // 1) Remove webpack banners and meta lines
    transformed = transformed
      .replace(/^\s*var\s+__webpack_exports__\s*=\s*\{\s*\};\s*$/m, '')
      .replace(/^\s*\/\/\s*This entry needs to be wrapped.*$/m, '')
      // remove any "Object.defineProperty(exports,__esModule...)" that might still linger
      .replace(/^\s*Object\.defineProperty\(exports?,\s*["']__esModule["']\s*,\s*\{\s*value:\s*true\s*\}\);\s*$/gm, '');

    // 2) Strip TS 'export ' keywords (idempotent)
    transformed = transformed.replace(/\bexport\s+/g, '');

    // 3) Drop CommonJS boilerplate causing 'exports is not defined'
    //    Be aggressive: the line can appear with leading/trailing spaces or comments.
    transformed = transformed
      // kill Object.defineProperty(exports,"__esModule",...)
      .replace(/^\s*Object\.defineProperty\(exports?,\s*["']__esModule["']\s*,\s*\{\s*value:\s*true\s*\}\);\s*$/gm, '')
      // kill any "exports.name = name;" style lines
      .replace(/^\s*exports\.[A-Za-z0-9_$]+\s*=\s*[A-Za-z0-9_$]+\s*;\s*$/gm, '')
      // kill "module.exports = ..."
      .replace(/^\s*module\.exports\s*=\s*.*;?\s*$/gm, '');

    // 4) Remove library var prelude and tail assignment produced by output.library
    transformed = transformed.replace(new RegExp(`^\\s*var\\s+${base}\\s*;\\s*$`, 'm'), '');
    transformed = transformed.replace(new RegExp(`\\n\\s*${base}\\s*=\\s*__webpack_exports__\\s*;[\\s\\S]*$`), '');

    // 5) Defensive: remove any lingering single-line references to __webpack_exports__ / exports
    transformed = transformed
      .replace(/^\s*__webpack_exports__\s*=.*$/gm, '')
      .replace(/^\s*var\s+exports\s*=\s*__webpack_exports__\s*;?\s*$/gm, '')
      .replace(/^\s*exports\s*=.*$/gm, '');

    // 6) Final sanitation: remove any leftover 'exports' or __webpack_exports__ occurrences on their own lines
    transformed = transformed
      .replace(/^\s*exports\b.*$/gm, (m) => (/^\s*exports\s*;?\s*$/.test(m) ? '' : m))
      .replace(/^\s*__webpack_exports__\b.*$/gm, (m) => (/^\s*__webpack_exports__\s*;?\s*$/.test(m) ? '' : m));

    // 7) Final sanity: if we stripped too much, fall back to original content
    const candidate = (transformed || '').trim();
    if (!candidate || candidate.split('\n').length < 2) {
      transformed = code;
    } else {
      transformed = candidate + '\n';
    }

    fs.writeFileSync(to, transformed, 'utf8');
    console.log(`[emit] ${from} -> ${to}`);
  });
}

function buildIndexHtml() {
  const tmplPath = path.join(SRC, 'client', 'index.html.tmpl');
  if (!fs.existsSync(tmplPath)) {
    console.warn('[emit] template not found:', tmplPath);
    return;
  }
  const clientBundle = path.join(OUT, 'client.js');
  const bundleCode = fs.existsSync(clientBundle) ? fs.readFileSync(clientBundle, 'utf8') : '';
  const tmpl = fs.readFileSync(tmplPath, 'utf8');

  // Replace placeholder <!-- INJECT:CLIENT --> with bundled code inside <script> tag
  const html = tmpl.replace(
    /<!--\s*INJECT:CLIENT\s*-->/,
    `<script>\n${bundleCode}\n</script>`
  );

  const indexOut = path.join(DIST, 'Index.html');
  fs.writeFileSync(indexOut, html, 'utf8');
  console.log(`[emit] Index.html generated at ${indexOut}`);
}

function copyManifest() {
  const manifestSrc = path.join(ROOT, 'appsscript.json');
  const manifestDst = path.join(DIST, 'appsscript.json');
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDst);
    console.log(`[emit] appsscript.json copied to ${manifestDst}`);
  } else {
    console.warn('[emit] appsscript.json not found at project root:', manifestSrc);
  }
}

function main() {
  ensureDir(DIST);
  copyServerJsAsGs();
  buildIndexHtml();
  copyManifest();
}

if (require.main === module) {
  main();
}