// Revisión de desbordes: recorre rutas y anchos y reporta lo que se sale de la ventana o queda cortado.
// Uso: npm start (en otra terminal) y luego node tests/e2e/desbordes.mjs [url-base]
import { cargarPlaywright, BASE, ANCHOS, RUTAS_SITIO, RUTAS_PANEL, entrarComo } from './comun.mjs';

const JS = W => {
  const out = [];
  document.querySelectorAll('body *').forEach(e => {
    if (e.closest('template,[hidden],.solo-lectores,.saltar,.visually-hidden,.zona-toast-proto')) return;
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const ce = getComputedStyle(e);
    if ((ce.clipPath && ce.clipPath !== 'none') || (ce.clip && ce.clip !== 'auto') || (r.width <= 1 && r.height <= 1)) return; // ocultos a propósito
    if (r.right > W + 1 || r.left < -1) {
      let a = e.parentElement, recortado = false;
      while (a && a !== document.body) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' && a.getBoundingClientRect().right <= W + 1) { recortado = true; break; } a = a.parentElement; }
      if (!recortado) out.push(`DESBORDA ${typeof e.className === 'string' ? e.className.split(' ')[0] : 'svg'} @${Math.round(r.right)}`);
    }
    const cs = getComputedStyle(e);
    if (cs.textOverflow !== 'ellipsis' && (cs.overflow === 'hidden' || cs.overflowX === 'hidden') && e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 2) out.push(`CORTA ${e.className}: ${e.textContent.trim().slice(0, 30)}`);
  });
  return { ancho: document.documentElement.scrollWidth, hallazgos: [...new Set(out)].slice(0, 6) };
};

const { chromium } = await cargarPlaywright();
const navegador = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
let total = 0;
for (const w of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: w, height: 900 } });
  await entrarComo(pg, 'ricardo@beancraft.mx');
  for (const r of [...RUTAS_SITIO, ...RUTAS_PANEL]) {
    await pg.goto(`${BASE}${r}`);
    await pg.waitForTimeout(120);
    const res = await pg.evaluate(JS, w);
    if (res.hallazgos.length || res.ancho > w + 1) { total++; console.log(w, r, res.ancho, res.hallazgos.join(' | ')); }
  }
  await pg.close();
}
await navegador.close();
console.log(total ? `${total} pantallas con hallazgos` : 'Sin desbordes ni textos cortados.');
process.exit(total ? 1 : 0);
