import { deflateSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';

/*
 * Decode dist/og-image.png back to raw pixels, then compare every whole-image filter strategy
 * against the adaptive one, for both size and encode time.
 */
const png = await readFile(new URL('../dist/og-image.png', import.meta.url));
const { inflateSync } = await import('node:zlib');

let off = 8; let idat = null;
while (off < png.length) {
  const len = png.readUInt32BE(off);
  const type = png.toString('ascii', off + 4, off + 8);
  if (type === 'IDAT') idat = png.subarray(off + 8, off + 8 + len);
  off += 12 + len;
}
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
const channels = png[25] === 6 ? 4 : 3;
const stride = w * channels;
const raw = inflateSync(idat);

const pixels = Buffer.alloc(stride * h);
for (let y = 0; y < h; y++) {
  const ft = raw[y * (stride + 1)];
  const src = y * (stride + 1) + 1;
  const dst = y * stride;
  for (let i = 0; i < stride; i++) {
    const a = i >= channels ? pixels[dst + i - channels] : 0;
    const b = y > 0 ? pixels[dst - stride + i] : 0;
    const c = y > 0 && i >= channels ? pixels[dst - stride + i - channels] : 0;
    const x = raw[src + i];
    let v;
    if (ft === 0) v = x;
    else if (ft === 1) v = x + a;
    else if (ft === 2) v = x + b;
    else if (ft === 3) v = x + ((a + b) >> 1);
    else {
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
    }
    pixels[dst + i] = v & 0xff;
  }
}
console.log('decoded', w + 'x' + h, channels + 'ch');

function filterRow(out, at, y, type) {
  const row = y * stride;
  const up = row - stride;
  for (let i = 0; i < stride; i++) {
    const r = pixels[row + i];
    const a = i >= channels ? pixels[row + i - channels] : 0;
    const b = y > 0 ? pixels[up + i] : 0;
    const c = y > 0 && i >= channels ? pixels[up + i - channels] : 0;
    let v;
    if (type === 0) v = r;
    else if (type === 1) v = r - a;
    else if (type === 2) v = r - b;
    else if (type === 3) v = r - ((a + b) >> 1);
    else {
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      v = r - (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
    }
    out[at + i] = v & 0xff;
  }
}

const encodeWith = (type) => {
  const out = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) { const at = y * (stride + 1); out[at] = type; filterRow(out, at + 1, y, type); }
  return out;
};
const encodeAdaptive = () => {
  const out = Buffer.alloc((stride + 1) * h);
  const trial = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const at = y * (stride + 1);
    let best = 0, bestScore = Infinity;
    for (let f = 0; f <= 4; f++) {
      filterRow(trial, 0, y, f);
      let score = 0;
      for (let i = 0; i < stride; i++) { const v = trial[i]; score += v < 128 ? v : 256 - v; }
      if (score < bestScore) { bestScore = score; best = f; }
    }
    out[at] = best;
    filterRow(out, at + 1, y, best);
  }
  return out;
};

const names = ['None(0)', 'Sub(1)', 'Up(2)', 'Avg(3)', 'Paeth(4)'];
for (let f = 0; f <= 4; f++) {
  const t0 = Date.now(); const buf = encodeWith(f); const tf = Date.now() - t0;
  const t1 = Date.now(); const z = deflateSync(buf, { level: 9 }); const tz = Date.now() - t1;
  console.log(names[f].padEnd(9), String(Math.round(z.length / 1024)).padStart(4) + 'KB',
    '| filter ' + String(tf).padStart(5) + 'ms | deflate ' + String(tz).padStart(5) + 'ms');
}
const t0 = Date.now(); const buf = encodeAdaptive(); const tf = Date.now() - t0;
const t1 = Date.now(); const z = deflateSync(buf, { level: 9 }); const tz = Date.now() - t1;
console.log('Adaptive '.padEnd(9), String(Math.round(z.length / 1024)).padStart(4) + 'KB',
  '| filter ' + String(tf).padStart(5) + 'ms | deflate ' + String(tz).padStart(5) + 'ms');
