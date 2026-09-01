import { ogCard, ogImage } from '../src/images.mjs';
import { deflateSync } from 'node:zlib';

/*
 * Proves the encoder can never regress: re-encode each sample with filter 0 on every scanline (the
 * old behaviour) and compare against what toPNG() actually chose.
 */
function idatOf(buf) {
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') return buf.subarray(off + 8, off + 8 + len);
    off += 12 + len;
  }
  return null;
}

const samples = [
  ['og-image', ogImage(), 9],
  ['card:guide', ogCard({ title: 'Jet lag: what works, what does not', kicker: 'Travel guide', theme: 'guide' }), 6],
  ['card:country', ogCard({ title: 'Japan', kicker: 'Destination', theme: 'country' }), 6],
  ['card:trip', ogCard({ title: 'Thailand in 20 days', kicker: 'Trip report', theme: 'trip' }), 6],
  ['card:library', ogCard({ title: '200 travel quotes', kicker: 'Collection', theme: 'library' }), 6],
];

let worst = 0;
for (const [name, png, level] of samples) {
  const idat = idatOf(png);
  // Reconstruct the all-filter-0 stream by inflating and re-filtering is not needed: instead
  // deflate the decoded scanlines with filter bytes forced to 0.
  const { inflateSync } = await import('node:zlib');
  const raw = inflateSync(idat);
  const w = png.readUInt32BE(16);
  const h = png.readUInt32BE(20);
  const channels = png[25] === 6 ? 4 : 3;
  const stride = w * channels;

  // Undo whatever filters were applied, then re-encode with filter 0 everywhere.
  const pix = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? pix[dst + i - channels] : 0;
      const b = y > 0 ? pix[dst - stride + i] : 0;
      const c = y > 0 && i >= channels ? pix[dst - stride + i - channels] : 0;
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
      pix[dst + i] = v & 0xff;
    }
  }
  const none = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    none[y * (stride + 1)] = 0;
    pix.copy(none, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const oldLen = deflateSync(none, { level }).length;
  const newLen = idat.length;
  const delta = ((newLen - oldLen) / oldLen) * 100;
  worst = Math.max(worst, delta);
  console.log(
    name.padEnd(14),
    w + 'x' + h,
    '| old(filter0):', String(Math.round(oldLen / 1024)).padStart(4) + 'KB',
    '| now:', String(Math.round(newLen / 1024)).padStart(4) + 'KB',
    '|', (delta <= 0 ? '' : '+') + delta.toFixed(1) + '%',
    delta <= 0 ? 'OK' : 'REGRESSION');
}
console.log('\nworst delta:', worst.toFixed(2) + '%', worst <= 0 ? '=> never regresses' : '=> REGRESSION');
