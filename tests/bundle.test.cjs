const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { buildHtml, ROOT } = require('../scripts/prepare-web.cjs');

test('el paquete conserva las 5 pantallas, 7 diálogos y todos los recursos locales', () => {
  const { html, resources } = buildHtml();
  assert.equal((html.match(/class="view(?: active)?"/g) || []).length, 5);
  assert.equal((html.match(/<dialog /g) || []).length, 7);
  assert.equal(resources.length, 39);
  for (const name of resources) {
    const base64 = fs.readFileSync(path.join(ROOT, name)).toString('base64');
    assert.ok(html.includes(base64), `Falta el contenido exacto de ${name}`);
  }
  assert.doesNotMatch(html, /(?:src|href)="(?:\.\/)?(?:assets|fonts)\//);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"/);
  // String.replace replacement strings would consume $$ from money templates.
  assert.ok(html.includes('`$${n.toFixed(2)}`'));
});

test('los scripts empaquetados son válidos sin importaciones ES ni servidor', () => {
  const { html } = buildHtml();
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 3);
  scripts.forEach(([, script]) => new vm.Script(script));
});

test('el empaquetado es determinista', () => {
  assert.equal(buildHtml().html, buildHtml().html);
});
