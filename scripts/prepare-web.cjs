const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'mobile/generated/web-content.js');
const SOURCES = ['index.html', 'tokens.css', 'styles.css', 'app.js', 'mascotas.js',
  'mobile/bootstrap.js', 'mobile/bridge.js', 'mobile/mobile.css', 'data/catalog.js', 'data/mocks.js', 'lib/rules.js', 'lib/mock-orders.js'];
const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };

function resourceFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const name = `${dir}/${entry.name}`;
    return entry.isDirectory() ? resourceFiles(name) : [name];
  }).sort();
}

function read(name) { return fs.readFileSync(path.join(ROOT, name), 'utf8'); }
function scriptTag(js) { return `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`; }

function buildHtml() {
  const resources = [...resourceFiles('assets'), ...resourceFiles('fonts')];
  const assets = Object.fromEntries(resources.map((name) => {
    const mime = MIME[path.extname(name)];
    if (!mime) throw new Error(`Formato de recurso no reconocido: ${name}`);
    return [name, `data:${mime};base64,${fs.readFileSync(path.join(ROOT, name)).toString('base64')}`];
  }));

  const css = `${read('tokens.css')}\n${read('styles.css')}\n${read('mobile/mobile.css')}`
    .replace(/url\(['"]?(?:\.\/)?([^)'"\s]+)['"]?\)/g, (_, name) => {
      if (!assets[name]) throw new Error(`Recurso CSS ausente: ${name}`);
      return `url("${assets[name]}")`;
    });

  // One copy per image, including photographs reused in multiple screens.
  const imageAssets = Object.fromEntries(Object.entries(assets).filter(([name]) => name.startsWith('assets/')));
  let js = ['mascotas.js', 'data/catalog.js', 'data/mocks.js', 'lib/rules.js', 'lib/mock-orders.js', 'app.js', 'mobile/bridge.js']
    .map(name => read(name).replace(/^\uFEFF/, '').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
  js = js.replace(/(["'])(assets\/[\w./-]+\.(?:png|webp))\1/g, (_, quote, name) => {
    if (!assets[name]) throw new Error(`Imagen ausente: ${name}`);
    return `__beanAssets[${JSON.stringify(name)}]`;
  });
  js = `(() => {\n'use strict';\nconst __beanAssets = ${JSON.stringify(imageAssets)};\n${js}\n})();`;

  const html = read('index.html')
    .replace(/\s*<link rel="stylesheet" href="(?:tokens|styles)\.css">/g, '')
    .replace('</head>', () => `<style>${css}</style>${scriptTag(read('mobile/bootstrap.js'))}</head>`)
    .replace('<script type="module" src="app.js"></script>', () => scriptTag(js));
  if (/<(?:script|link)[^>]+(?:src|href)="(?:\.\/)?(?:app\.js|.*\.css)"/.test(html)) {
    throw new Error('Quedaron dependencias web externas en el paquete.');
  }
  return { html, resources };
}

function prepareWeb() {
  const { html, resources } = buildHtml();
  const output = `// Generado por scripts/prepare-web.cjs. Edita los archivos fuente.\nexport default ${JSON.stringify(html)};\n`;
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT, 'utf8') !== output) {
    fs.writeFileSync(OUTPUT, output);
    console.log(`BeanCraft: interfaz local preparada (${resources.length} recursos).`);
  }
  return { html, resources };
}

let watchers;
function watchWeb() {
  if (watchers) return;
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { prepareWeb(); } catch (error) { console.error('BeanCraft:', error.message); }
    }, 150);
    timer.unref();
  };
  // Watch directories, so editor saves that replace a file keep working.
  const dirs = ['.', 'mobile', 'assets', 'fonts', 'assets/mascotas', 'data', 'lib'];
  watchers = dirs.map((dir) => fs.watch(path.join(ROOT, dir), { persistent: false }, (_, name) => {
    if (!name) return;
    const relative = dir === '.' ? String(name) : `${dir}/${name}`;
    if (SOURCES.includes(relative) || /^(assets|fonts)\/.+\.(png|webp|woff2)$/.test(relative)) rebuild();
  }));
}

module.exports = { buildHtml, prepareWeb, watchWeb, ROOT, OUTPUT };
if (require.main === module) prepareWeb();
