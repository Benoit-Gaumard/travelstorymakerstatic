// Zero-dependency PNG/ICO writer with anti-aliased SDF drawing primitives.
import { deflateSync } from 'node:zlib';

const CRC_TABLE = (function () {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const tag = Buffer.from(type, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tag, data])), 0);
  return Buffer.concat([len, tag, data, crc]);
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (d) => clamp(0.5 - d, 0, 1);

export function hex(value) {
  const n = parseInt(value.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export class Canvas {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.px = new Float32Array(width * height * 4);
  }

  blend(x, y, r, g, b, a) {
    if (a <= 0 || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const p = this.px;
    const inv = 1 - a;
    p[i] = p[i] * inv + r * a;
    p[i + 1] = p[i + 1] * inv + g * a;
    p[i + 2] = p[i + 2] * inv + b * a;
    p[i + 3] = p[i + 3] * inv + 255 * a;
  }

  /** Paint every pixel with fn(x, y) -> [r,g,b,a] | null */
  paint(fn) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = fn(x + 0.5, y + 0.5);
        if (c) this.blend(x, y, c[0], c[1], c[2], c[3]);
      }
    }
  }

  /** Fill a shape defined by a signed distance function, with 1px anti-aliasing. */
  shape(box, sdf, color, alpha) {
    const a = alpha === undefined ? 1 : alpha;
    const x0 = Math.max(0, Math.floor(box[0]));
    const y0 = Math.max(0, Math.floor(box[1]));
    const x1 = Math.min(this.w, Math.ceil(box[2]));
    const y1 = Math.min(this.h, Math.ceil(box[3]));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const cov = smooth(sdf(x + 0.5, y + 0.5));
        if (cov > 0) this.blend(x, y, color[0], color[1], color[2], cov * a);
      }
    }
  }

  toPNG(withAlpha) {
    const alpha = withAlpha !== false;
    const channels = alpha ? 4 : 3;
    const stride = this.w * channels;
    const raw = Buffer.alloc((stride + 1) * this.h);
    for (let y = 0; y < this.h; y++) {
      const row = y * (stride + 1);
      raw[row] = 0;
      for (let x = 0; x < this.w; x++) {
        const s = (y * this.w + x) * 4;
        const d = row + 1 + x * channels;
        raw[d] = clamp(Math.round(this.px[s]), 0, 255);
        raw[d + 1] = clamp(Math.round(this.px[s + 1]), 0, 255);
        raw[d + 2] = clamp(Math.round(this.px[s + 2]), 0, 255);
        if (alpha) raw[d + 3] = clamp(Math.round(this.px[s + 3]), 0, 255);
      }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = alpha ? 6 : 2;
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

/* ---------- distance functions ---------- */

export function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay || 1), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h);
}

export function sdRoundRect(px, py, cx, cy, w, h, r) {
  const qx = Math.abs(px - cx) - (w / 2 - r);
  const qy = Math.abs(py - cy) - (h / 2 - r);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

/** Elliptical arc; span may be negative. Returns distance to the stroke centreline. */
export function sdArc(px, py, cx, cy, rx, ry, a0, span) {
  const dx = px - cx;
  const dy = py - cy;
  let ang = Math.atan2(dy / ry, dx / rx);
  const start = span >= 0 ? a0 : a0 + span;
  const sweep = Math.min(Math.abs(span), Math.PI * 2);
  let rel = ang - start;
  const TAU = Math.PI * 2;
  rel = ((rel % TAU) + TAU) % TAU;
  const scale = Math.min(rx, ry);
  if (rel <= sweep) {
    return Math.abs(Math.hypot(dx / rx, dy / ry) - 1) * scale;
  }
  const p0 = [cx + rx * Math.cos(start), cy + ry * Math.sin(start)];
  const p1 = [cx + rx * Math.cos(start + sweep), cy + ry * Math.sin(start + sweep)];
  return Math.min(Math.hypot(px - p0[0], py - p0[1]), Math.hypot(px - p1[0], py - p1[1]));
}

/* ---------- geometric stroke font (uppercase subset) ---------- */
// Unit box: x 0..0.62, y 0..1. s = segment, a = elliptical arc [cx,cy,rx,ry,a0,span], d = dot.
const PI = Math.PI;
const GLYPHS = {
  T: [['s', 0.0, 0.06, 0.62, 0.06], ['s', 0.31, 0.06, 0.31, 1]],
  R: [['s', 0.06, 0, 0.06, 1], ['s', 0.06, 0, 0.34, 0], ['s', 0.06, 0.5, 0.34, 0.5], ['a', 0.34, 0.25, 0.25, 0.25, -PI / 2, PI], ['s', 0.3, 0.5, 0.58, 1]],
  A: [['s', 0.31, 0, 0.02, 1], ['s', 0.31, 0, 0.6, 1], ['s', 0.13, 0.66, 0.49, 0.66]],
  V: [['s', 0.02, 0, 0.31, 1], ['s', 0.6, 0, 0.31, 1]],
  E: [['s', 0.06, 0, 0.06, 1], ['s', 0.06, 0, 0.54, 0], ['s', 0.06, 0.5, 0.46, 0.5], ['s', 0.06, 1, 0.54, 1]],
  L: [['s', 0.06, 0, 0.06, 1], ['s', 0.06, 1, 0.54, 1]],
  S: [['a', 0.31, 0.26, 0.25, 0.26, -PI / 6, -1.34 * PI], ['a', 0.31, 0.74, 0.25, 0.26, -PI / 2, 1.34 * PI]],
  O: [['a', 0.31, 0.5, 0.29, 0.5, 0, 2 * PI]],
  Y: [['s', 0.02, 0, 0.31, 0.5], ['s', 0.6, 0, 0.31, 0.5], ['s', 0.31, 0.5, 0.31, 1]],
  M: [['s', 0.05, 1, 0.05, 0], ['s', 0.05, 0, 0.31, 0.56], ['s', 0.57, 0, 0.31, 0.56], ['s', 0.57, 0, 0.57, 1]],
  K: [['s', 0.06, 0, 0.06, 1], ['s', 0.06, 0.56, 0.55, 0], ['s', 0.21, 0.4, 0.58, 1]],
  C: [['a', 0.31, 0.5, 0.29, 0.5, -0.3 * PI, -1.4 * PI]],
  '.': [['d', 0.14, 0.98]],
  ' ': [],
};

const ADVANCE = { '.': 0.3, ' ': 0.34 };
const advanceOf = (ch) => (ADVANCE[ch] === undefined ? 0.62 : ADVANCE[ch]);

export function textWidth(text, size, tracking) {
  const track = tracking === undefined ? 0.1 : tracking;
  let w = 0;
  for (const ch of text.toUpperCase()) w += size * (advanceOf(ch) + track);
  return w - size * track;
}

/**
 * Draws uppercase text built from geometric strokes. No font files involved.
 */
export function drawText(canvas, text, x, y, size, color, opts) {
  const o = opts || {};
  const weight = (o.weight || 0.13) * size;
  const track = (o.tracking === undefined ? 0.1 : o.tracking) * size;
  const alpha = o.alpha === undefined ? 1 : o.alpha;
  let cursor = x;
  for (const raw of text.toUpperCase()) {
    const glyph = GLYPHS[raw];
    if (glyph) {
      for (const part of glyph) {
        if (part[0] === 's') {
          const ax = cursor + part[1] * size;
          const ay = y + part[2] * size;
          const bx = cursor + part[3] * size;
          const by = y + part[4] * size;
          const pad = weight + 2;
          canvas.shape(
            [Math.min(ax, bx) - pad, Math.min(ay, by) - pad, Math.max(ax, bx) + pad, Math.max(ay, by) + pad],
            (px, py) => sdSegment(px, py, ax, ay, bx, by) - weight / 2,
            color,
            alpha
          );
        } else if (part[0] === 'a') {
          const cx = cursor + part[1] * size;
          const cy = y + part[2] * size;
          const rx = part[3] * size;
          const ry = part[4] * size;
          const pad = weight + rx * 0 + 2;
          canvas.shape(
            [cx - rx - pad - weight, cy - ry - pad - weight, cx + rx + pad + weight, cy + ry + pad + weight],
            (px, py) => sdArc(px, py, cx, cy, rx, ry, part[5], part[6]) - weight / 2,
            color,
            alpha
          );
        } else if (part[0] === 'd') {
          const cx = cursor + part[1] * size;
          const cy = y + part[2] * size;
          const r = weight * 0.62;
          canvas.shape(
            [cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2],
            (px, py) => Math.hypot(px - cx, py - cy) - r,
            color,
            alpha
          );
        }
      }
    }
    cursor += size * advanceOf(raw) + track;
  }
  return cursor - track;
}

/* ---------- ICO container (PNG-encoded entries) ---------- */

export function encodeICO(items) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(items.length, 4);
  let offset = 6 + items.length * 16;
  const dir = [];
  const blobs = [];
  for (const item of items) {
    const e = Buffer.alloc(16);
    e[0] = item.size >= 256 ? 0 : item.size;
    e[1] = item.size >= 256 ? 0 : item.size;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(item.png.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    blobs.push(item.png);
    offset += item.png.length;
  }
  return Buffer.concat([header, ...dir, ...blobs]);
}

export { clamp, mix, smooth };
