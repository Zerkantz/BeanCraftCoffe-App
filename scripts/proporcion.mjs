// Mide la proporción de código por lenguaje (bytes de .js/.mjs, .css y .html), como las estadísticas de GitHub.
// Meta del proyecto: JavaScript ~71.9 %, CSS ~23.5 %, HTML ~4.6 %.
import { readdir, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const IGNORAR = new Set(['node_modules', 'assets', 'fonts', '.git']);
const LENG = { '.js': 'JavaScript', '.mjs': 'JavaScript', '.css': 'CSS', '.html': 'HTML' };
const META = { JavaScript: 71.9, CSS: 23.5, HTML: 4.6 };

async function recorrer(dir, tot) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await recorrer(p, tot);
    else if (LENG[extname(e.name)]) tot[LENG[extname(e.name)]] = (tot[LENG[extname(e.name)]] || 0) + (await stat(p)).size;
  }
  return tot;
}
const tot = await recorrer(RAIZ, {});
const suma = Object.values(tot).reduce((a, b) => a + b, 0);
console.log('Lenguaje     Bytes     Real    Meta   Diferencia');
for (const l of ['JavaScript', 'CSS', 'HTML']) {
  const pct = (100 * (tot[l] || 0)) / suma;
  console.log(`${l.padEnd(11)} ${String(tot[l] || 0).padStart(7)}  ${pct.toFixed(1).padStart(5)} %  ${META[l].toFixed(1).padStart(5)} %  ${(pct - META[l] >= 0 ? '+' : '') + (pct - META[l]).toFixed(1)} pts`);
}
