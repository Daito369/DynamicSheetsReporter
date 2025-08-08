/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

/**
 * Post-build emitter:
 * - Transpiles server TS sources to .gs for GAS
 * - Builds Index.html by injecting client bundle into src/client/index.html.tmpl
 * - Ensures dist structure exists
 */

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');

// Matches CommonJS __esModule declarations such as
// Object.defineProperty(exports, "__esModule", ({ value: true }));
// The object literal may optionally be wrapped in parentheses.
const ES_MODULE_REGEX = /^\s*Object\.defineProperty\(exports?,\s*["']__esModule["']\s*,\s*\(?\{\s*value:\s*true\s*\}\)?\);\s*$/gm;

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyServerJsAsGs() {
  // Transpile TS sources directly to .gs without bundling to avoid CommonJS artifacts
  const entries = [
    ['server/Code.ts', 'Code.gs'],
    ['server/GeminiService.ts', 'GeminiService.gs'],
    ['server/SheetsService.ts', 'SheetsService.gs'],
    ['server/LoggingService.ts', 'LoggingService.gs'],
    ['shared/types.ts', 'SharedTypes.gs'],
    ['shared/validation.ts', 'Validation.gs'],
  ];
  ensureDir(DIST);
  entries.forEach(([srcRel, outName]) => {
    const srcPath = path.join(SRC, srcRel);
    if (!fs.existsSync(srcPath)) return;
    const tsCode = fs.readFileSync(srcPath, 'utf8');
    const js = ts.transpileModule(tsCode, {
      compilerOptions: { target: 'ES2019', module: ts.ModuleKind.CommonJS },
    }).outputText;

    let transformed = js
      // strip "use strict" and __esModule declarations
      .replace(/^\s*"use strict";\s*$/m, '')
      .replace(ES_MODULE_REGEX, '')
      // drop exports and module.exports lines
      .replace(/^\s*exports\.[A-Za-z0-9_$]+\s*=\s*[^;]+;\s*$/gm, '')
      .replace(/^\s*module\.exports\s*=\s*.*;?\s*$/gm, '')
      // drop commonjs require statements
      .replace(/^\s*const\s+[A-Za-z0-9_$]+\s*=\s*require\([^\)]+\);?\s*$/gm, '')
      // LoggingService import: replace "X.withTrace" -> "withTrace"
      .replace(/\b[A-Za-z0-9_$]+\.withTrace\b/g, 'withTrace')
      .trim();

    if (transformed) transformed += '\n';
    fs.writeFileSync(path.join(DIST, outName), transformed, 'utf8');
    console.log(`[emit] ${srcPath} -> ${path.join(DIST, outName)}`);
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