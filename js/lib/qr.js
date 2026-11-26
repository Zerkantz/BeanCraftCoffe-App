// Codificador QR mínimo (versión 2, corrección M, modo byte, máscara 0), basado en el algoritmo de referencia de Nayuki.
// Suficiente para códigos de cupón de hasta 26 caracteres.
const SIZE = 25, DATA_CW = 28, ECC_CW = 16;

function gfMul(x, y) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 0xff; }
function rsDivisor(deg) { const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1; for (let i = 0; i < deg; i++) { for (let j = 0; j < r.length; j++) { r[j] = gfMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = gfMul(root, 2); } return r; }
function rsRemainder(data, div) { const res = div.map(() => 0); for (const b of data) { const f = b ^ res.shift(); res.push(0); div.forEach((c, i) => { res[i] ^= gfMul(c, f); }); } return res; }

export function qrMatrix(text) {
  const bytes = [...new TextEncoder().encode(text)];
  const bits = [];
  const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
  push(4, 4); push(bytes.length, 8); bytes.forEach(b => push(b, 8));
  const cap = DATA_CW * 8;
  push(0, Math.min(4, cap - bits.length));
  while (bits.length % 8) bits.push(0);
  for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  const all = data.concat(rsRemainder(data, rsDivisor(ECC_CW)));

  const m = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const fn = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const set = (x, y, d) => { m[y][x] = d; fn[y][x] = true; };
  for (let i = 0; i < SIZE; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); set(x, y, d !== 2 && d !== 4); } };
  finder(3, 3); finder(SIZE - 4, 3); finder(3, SIZE - 4);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(18 + dx, 18 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  // Formato: corrección M (00), máscara 0
  let rem = 0; const fdata = (0 << 3) | 0; rem = fdata; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const fbits = ((fdata << 10) | rem) ^ 0x5412;
  const gb = i => ((fbits >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, gb(i));
  set(8, 7, gb(6)); set(8, 8, gb(7)); set(7, 8, gb(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, gb(i));
  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, gb(i));
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, gb(i));
  set(8, SIZE - 8, true);
  // Datos en zigzag
  let k = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < SIZE; v++) for (let j = 0; j < 2; j++) {
      const x = right - j, up = ((right + 1) & 2) === 0, y = up ? SIZE - 1 - v : v;
      if (!fn[y][x] && k < all.length * 8) { m[y][x] = ((all[k >>> 3] >>> (7 - (k & 7))) & 1) === 1; k++; }
    }
  }
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (!fn[y][x] && (x + y) % 2 === 0) m[y][x] = !m[y][x];
  return m;
}

export function qrSvg(text, px = 200) {
  const mtx = qrMatrix(text), q = 4, n = SIZE + q * 2;
  let d = '';
  mtx.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + q} ${y + q}h1v1h-1z`; }));
  return `<svg class="qr" width="${px}" height="${px}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="Código QR del cupón ${text}"><rect width="${n}" height="${n}" fill="var(--c-blanco)"/><path d="${d}" fill="var(--c-tostado)"/></svg>`;
}
