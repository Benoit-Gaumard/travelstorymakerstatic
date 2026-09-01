// Generates the Open Graph image and all favicons as real PNG files at build time.
import { Canvas, hex, sdSegment, sdRoundRect, drawText, textWidth, wrapText, encodeICO, clamp, mix } from './png.mjs';

function stopsAt(t, stops) {
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = b[0] - a[0] || 1;
  const k = clamp((t - a[0]) / span, 0, 1);
  const ca = hex(a[1]);
  const cb = hex(b[1]);
  return [mix(ca[0], cb[0], k), mix(ca[1], cb[1], k), mix(ca[2], cb[2], k)];
}

// Deterministic hash noise - keeps builds reproducible and kills gradient banding.
function noise(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function ridgeHeight(x, width, seed, amplitude, sharpness) {
  const u = x / width;
  let h = 0;
  let amp = 1;
  let freq = 1.6;
  for (let o = 0; o < 4; o++) {
    h += amp * Math.sin(u * freq * Math.PI * 2 + seed * (o + 1) * 2.1);
    amp *= 0.5;
    freq *= 2.05;
  }
  h = h / 1.87;
  return Math.pow(Math.abs(h), sharpness) * Math.sign(h) * amplitude;
}

export function ogImage() {
  const W = 1200;
  const H = 630;
  const HORIZON = 438;
  const c = new Canvas(W, H);

  const sky = [
    [0.0, '#04061a'],
    [0.3, '#0e1746'],
    [0.5, '#232063'],
    [0.62, '#4a2c66'],
    [0.695, '#8d4a55'],
  ];

  const sunX = 838;
  const sunY = 402;
  const sunR = 82;

  c.paint(function (x, y) {
    if (y > HORIZON) return null;
    const rgb = stopsAt(y / H, sky);

    // aurora-style glows
    const g1 = Math.max(0, 1 - Math.hypot(x - 150, y - 90) / 470);
    const g2 = Math.max(0, 1 - Math.hypot(x - 1080, y - 60) / 430);
    const glow = [
      rgb[0] + g1 * g1 * 46 + g2 * g2 * 62,
      rgb[1] + g1 * g1 * 84 + g2 * g2 * 32,
      rgb[2] + g1 * g1 * 150 + g2 * g2 * 120,
    ];

    // sun halo
    const sd = Math.hypot(x - sunX, y - sunY);
    const halo = Math.max(0, 1 - sd / 320);
    glow[0] += halo * halo * 110;
    glow[1] += halo * halo * 58;
    glow[2] += halo * halo * 24;

    const d = noise(x, y) - 0.5;
    return [glow[0] + d, glow[1] + d, glow[2] + d, 1];
  });

  // stars
  for (let i = 0; i < 210; i++) {
    const sx = noise(i * 3.7, 11.2) * W;
    const sy = noise(i * 5.1, 27.8) * (HORIZON - 120);
    const r = 0.5 + noise(i * 7.3, 3.4) * 1.1;
    const a = (0.25 + noise(i * 2.9, 9.1) * 0.6) * (1 - sy / (HORIZON - 60));
    c.shape([sx - 3, sy - 3, sx + 3, sy + 3], (px, py) => Math.hypot(px - sx, py - sy) - r, [255, 250, 235], a);
  }

  // sun disc
  c.shape([sunX - sunR - 2, sunY - sunR - 2, sunX + sunR + 2, sunY + sunR + 2], (px, py) => {
    if (py > HORIZON) return 99;
    return Math.hypot(px - sunX, py - sunY) - sunR;
  }, [255, 210, 150], 1);
  c.paint(function (x, y) {
    if (y > HORIZON) return null;
    const d = Math.hypot(x - sunX, y - sunY);
    if (d > sunR) return null;
    const t = clamp((y - (sunY - sunR)) / (sunR * 2), 0, 1);
    const rgb = stopsAt(t, [[0, '#ffe9bd'], [0.55, '#ffab5e'], [1, '#ff6a45']]);
    return [rgb[0], rgb[1], rgb[2], 1];
  });

  // dashed flight path
  const path = (t) => [mix(70, 1130, t), 236 - Math.sin(t * Math.PI) * 120 + t * -70];
  for (let i = 0; i < 62; i++) {
    const t0 = i / 62;
    const t1 = t0 + 0.0072;
    const [ax, ay] = path(t0);
    const [bx, by] = path(t1);
    c.shape([Math.min(ax, bx) - 4, Math.min(ay, by) - 4, Math.max(ax, bx) + 4, Math.max(ay, by) + 4],
      (px, py) => sdSegment(px, py, ax, ay, bx, by) - 1.6, [255, 255, 255], 0.34);
  }
  const [tipX, tipY] = path(1);
  c.shape([tipX - 16, tipY - 16, tipX + 16, tipY + 16], (px, py) => {
    const a = sdSegment(px, py, tipX - 13, tipY + 7, tipX + 9, tipY - 3);
    const b = sdSegment(px, py, tipX - 13, tipY - 8, tipX + 9, tipY - 3);
    return Math.min(a, b) - 2.4;
  }, [255, 255, 255], 0.9);

  // mountain ridges (far to near)
  const ridges = [
    { base: HORIZON + 4, amp: 132, seed: 1.7, sharp: 1.15, color: '#3a3470', alpha: 1 },
    { base: HORIZON + 4, amp: 104, seed: 4.3, sharp: 1.3, color: '#1d2050', alpha: 1 },
    { base: HORIZON + 4, amp: 74, seed: 8.9, sharp: 1.5, color: '#0b0e2c', alpha: 1 },
  ];
  const profiles = ridges.map((r) => {
    const arr = new Float32Array(W);
    for (let x = 0; x < W; x++) arr[x] = r.base - Math.abs(ridgeHeight(x, W, r.seed, r.amp, r.sharp)) - r.amp * 0.22;
    return arr;
  });
  ridges.forEach(function (r, idx) {
    const rgb = hex(r.color);
    const prof = profiles[idx];
    c.paint(function (x, y) {
      if (y > HORIZON) return null;
      const top = prof[Math.min(W - 1, Math.floor(x))];
      const cov = clamp(y - top + 0.5, 0, 1);
      if (cov <= 0) return null;
      const shade = 1 - (y - top) / 400;
      return [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade, cov * r.alpha];
    });
  });

  // water with reflection
  const nearest = profiles[2];
  c.paint(function (x, y) {
    if (y <= HORIZON) return null;
    const t = (y - HORIZON) / (H - HORIZON);
    const rgb = stopsAt(0.7 - t * 0.34, sky);
    const mx = HORIZON - (y - HORIZON) * 0.62;
    const top = nearest[Math.min(W - 1, Math.floor(x + Math.sin(y * 0.18) * 6))];
    const inRidge = mx > top ? 1 : 0;
    const ridgeRGB = hex('#0b0e2c');
    const base = inRidge
      ? [mix(rgb[0], ridgeRGB[0], 0.55), mix(rgb[1], ridgeRGB[1], 0.55), mix(rgb[2], ridgeRGB[2], 0.55)]
      : rgb;
    // sun glitter path
    const glitter = Math.max(0, 1 - Math.abs(x - sunX) / 130) * Math.max(0, 1 - t * 1.5);
    const band = (Math.sin(y * 0.9) * 0.5 + 0.5) * (Math.sin(x * 0.06 + y * 0.3) * 0.5 + 0.5);
    const g = glitter * band * 150;
    const d = noise(x, y + 77) - 0.5;
    return [base[0] * 0.82 + g + d, base[1] * 0.82 + g * 0.6 + d, base[2] * 0.86 + g * 0.35 + d, 1];
  });

  // legibility scrim
  c.paint(function (x, y) {
    const t = clamp((y - 430) / (H - 430), 0, 1);
    if (t <= 0) return null;
    return [4, 6, 20, Math.pow(t, 1.5) * 0.86];
  });

  // brand badge
  const bx = 68;
  const by = 494;
  const bs = 84;
  c.paint(function (x, y) {
    const d = sdRoundRect(x, y, bx + bs / 2, by + bs / 2, bs, bs, bs * 0.27);
    if (d > 0.5) return null;
    const t = clamp(((x - bx) / bs + (y - by) / bs) / 2, 0, 1);
    const rgb = stopsAt(t, [[0, '#2f84ff'], [0.55, '#7c3aed'], [1, '#ff7a45']]);
    return [rgb[0], rgb[1], rgb[2], clamp(0.5 - d, 0, 1)];
  });
  const mk = (fx, fy) => [bx + fx * bs, by + fy * bs];
  const p1 = mk(0.22, 0.7);
  const p2 = mk(0.45, 0.33);
  const p3 = mk(0.78, 0.7);
  c.shape([bx, by, bx + bs, by + bs], (px, py) => {
    const a = sdSegment(px, py, p1[0], p1[1], p2[0], p2[1]);
    const b = sdSegment(px, py, p2[0], p2[1], p3[0], p3[1]);
    return Math.min(a, b) - bs * 0.045;
  }, [255, 255, 255], 0.97);
  const dot = mk(0.66, 0.27);
  c.shape([dot[0] - 12, dot[1] - 12, dot[0] + 12, dot[1] + 12],
    (px, py) => Math.hypot(px - dot[0], py - dot[1]) - bs * 0.075, [255, 255, 255], 0.97);

  // wordmark
  const size = 46;
  const label = 'TRAVELSTORYMAKER.COM';
  drawText(c, label, bx + bs + 30, by + 20, size, [255, 255, 255], { weight: 0.135, tracking: 0.085 });

  // rule + small caption bar
  const ruleY = by + 20 + size + 22;
  const ruleW = textWidth(label, size, 0.085);
  c.shape([bx, ruleY - 3, bx + bs + 30 + ruleW, ruleY + 3],
    (px, py) => Math.max(Math.abs(py - ruleY) - 1.2, Math.max(bx - px, px - (bx + bs + 30 + ruleW))), [255, 255, 255], 0.28);

  return c.toPNG(false);
}

/* ---------- per-page Open Graph cards ---------- */

/*
 * One generic /og-image.png was shared by the homepage, every guide, every trip report and every
 * country page, so a link to "How to book a cheap flight" and a link to "Japan" arrived in a feed
 * looking like the same link. These cards carry the page's own title.
 *
 * The design is deliberately flat - two-stop gradient, one soft glow, one ridge silhouette, no
 * per-pixel noise. That is not an aesthetic decision: the detailed painterly card used for the
 * site-wide image takes 790ms and deflates to 465KB, which is fine once per build and absurd 70
 * times. A flat card reuses a cached background buffer and compresses to a fraction of that.
 *
 * Text is drawn with the stroke font in png.mjs, so no font file is involved and the result is
 * identical on every machine.
 */
const OG_W = 1200;
const OG_H = 630;

const THEMES = {
  guide: { stops: [[0, '#061033'], [0.55, '#1b2a6b'], [1, '#3d2a72']], glow: '#2f84ff', accent: [147, 197, 253] },
  trip: { stops: [[0, '#0a0722'], [0.5, '#3a1d5c'], [1, '#7a2f4a']], glow: '#ff7a45', accent: [253, 186, 140] },
  country: { stops: [[0, '#04121f'], [0.55, '#0d3b52'], [1, '#1f5f5a']], glow: '#22d3ee', accent: [153, 246, 228] },
  library: { stops: [[0, '#0a0620'], [0.55, '#2b1a5e'], [1, '#5b2b7a']], glow: '#a855f7', accent: [216, 180, 254] },
  page: { stops: [[0, '#070b1a'], [0.55, '#16204a'], [1, '#2c2360']], glow: '#7c3aed', accent: [191, 199, 255] },
};

const baseCache = new Map();

/** Paints the reusable background for a theme once and keeps the pixel buffer. */
function themeBase(name) {
  if (baseCache.has(name)) return baseCache.get(name);
  const theme = THEMES[name] || THEMES.page;
  const c = new Canvas(OG_W, OG_H);
  const glow = hex(theme.glow);

  c.paint(function (x, y) {
    const t = clamp((x / OG_W) * 0.3 + (y / OG_H) * 0.7, 0, 1);
    const rgb = stopsAt(t, theme.stops);
    const g1 = Math.max(0, 1 - Math.hypot(x - 1010, y - 96) / 620);
    const g2 = Math.max(0, 1 - Math.hypot(x - 40, y - 620) / 520);
    const k1 = g1 * g1 * 0.5;
    const k2 = g2 * g2 * 0.22;
    return [
      mix(rgb[0], glow[0], k1) + k2 * 30,
      mix(rgb[1], glow[1], k1) + k2 * 20,
      mix(rgb[2], glow[2], k1) + k2 * 40,
      1,
    ];
  });

  // A single ridge silhouette along the bottom edge, so the card reads as travel rather than as a slide.
  const seed = name.length * 2.7 + 1.3;
  const prof = new Float32Array(OG_W);
  for (let x = 0; x < OG_W; x++) prof[x] = OG_H - 58 - Math.abs(ridgeHeight(x, OG_W, seed, 96, 1.35));
  c.paint(function (x, y) {
    const top = prof[Math.min(OG_W - 1, Math.floor(x))];
    const cov = clamp(y - top + 0.5, 0, 1);
    if (cov <= 0) return null;
    return [6, 9, 26, cov * 0.62];
  });

  const buffer = c.snapshot();
  baseCache.set(name, buffer);
  return buffer;
}

/** Largest size at which the title fits the card, so short titles are big and long ones still fit. */
function fitLines(title) {
  const attempts = [[62, 3], [54, 3], [46, 4], [40, 4], [34, 5]];
  for (const [size, maxLines] of attempts) {
    const lines = wrapText(title, size, 0.06, 1010, maxLines);
    if (lines) return { size, lines };
  }
  return { size: 30, lines: wrapText(title, 30, 0.06, 1010, 6) || ['TRAVELSTORYMAKER'] };
}

/**
 * @param {{title:string, kicker?:string, theme?:string}} opts
 * @returns {Buffer} 1200x630 PNG
 */
export function ogCard(opts) {
  const themeName = THEMES[opts.theme] ? opts.theme : 'page';
  const theme = THEMES[themeName];
  const c = new Canvas(OG_W, OG_H);
  c.restore(themeBase(themeName));

  // Brand badge and wordmark, top left.
  const bx = 72;
  const by = 56;
  const bs = 54;
  c.paintBox([bx - 2, by - 2, bx + bs + 2, by + bs + 2], function (x, y) {
    const d = sdRoundRect(x, y, bx + bs / 2, by + bs / 2, bs, bs, bs * 0.27);
    if (d > 0.5) return null;
    const t = clamp(((x - bx) / bs + (y - by) / bs) / 2, 0, 1);
    const rgb = stopsAt(t, [[0, '#2f84ff'], [0.55, '#7c3aed'], [1, '#ff7a45']]);
    return [rgb[0], rgb[1], rgb[2], clamp(0.5 - d, 0, 1)];
  });
  const mk = (fx, fy) => [bx + fx * bs, by + fy * bs];
  const p1 = mk(0.22, 0.7);
  const p2 = mk(0.45, 0.33);
  const p3 = mk(0.78, 0.7);
  c.shape([bx, by, bx + bs, by + bs], (px, py) => {
    const a = sdSegment(px, py, p1[0], p1[1], p2[0], p2[1]);
    const b = sdSegment(px, py, p2[0], p2[1], p3[0], p3[1]);
    return Math.min(a, b) - bs * 0.05;
  }, [255, 255, 255], 0.97);
  const dot = mk(0.66, 0.27);
  c.shape([dot[0] - 10, dot[1] - 10, dot[0] + 10, dot[1] + 10],
    (px, py) => Math.hypot(px - dot[0], py - dot[1]) - bs * 0.075, [255, 255, 255], 0.97);
  drawText(c, 'TRAVELSTORYMAKER.COM', bx + bs + 20, by + 17, 24, [255, 255, 255], { weight: 0.14, tracking: 0.09, alpha: 0.92 });

  // Section label.
  if (opts.kicker) {
    drawText(c, opts.kicker, bx, 214, 21, theme.accent, { weight: 0.16, tracking: 0.22, alpha: 0.95 });
  }

  // Title.
  const fitted = fitLines(opts.title);
  const lineHeight = fitted.size * 1.44;
  let y = opts.kicker ? 268 : 250;
  for (const line of fitted.lines) {
    drawText(c, line, bx, y, fitted.size, [255, 255, 255], { weight: 0.135, tracking: 0.06 });
    y += lineHeight;
  }

  // Accent rule under the block.
  const ruleY = Math.min(566, y + 26);
  c.shape([bx, ruleY - 4, bx + 168, ruleY + 4],
    (px, py) => Math.max(Math.abs(py - ruleY) - 2.4, Math.max(bx - px, px - (bx + 168))), theme.accent, 0.9);

  /*
   * Level 6, not 9. On a flat gradient the extra effort buys about 2% at three times the cost, and
   * this runs once per indexable page.
   */
  return c.toPNG(false, 6);
}

export function iconPNG(size) {  const c = new Canvas(size, size);
  const r = size * 0.24;
  c.paint(function (x, y) {
    const d = sdRoundRect(x, y, size / 2, size / 2, size, size, r);
    if (d > 0.5) return null;
    const t = clamp((x / size + y / size) / 2, 0, 1);
    const rgb = stopsAt(t, [[0, '#2f84ff'], [0.55, '#7c3aed'], [1, '#ff7a45']]);
    return [rgb[0], rgb[1], rgb[2], clamp(0.5 - d, 0, 1)];
  });
  const p = (fx, fy) => [fx * size, fy * size];
  const a = p(0.18, 0.72);
  const b = p(0.44, 0.32);
  const d = p(0.82, 0.72);
  c.shape([0, 0, size, size], (px, py) => {
    const s1 = sdSegment(px, py, a[0], a[1], b[0], b[1]);
    const s2 = sdSegment(px, py, b[0], b[1], d[0], d[1]);
    return Math.min(s1, s2) - size * 0.05;
  }, [255, 255, 255], 1);
  const dot = p(0.68, 0.26);
  c.shape([0, 0, size, size], (px, py) => Math.hypot(px - dot[0], py - dot[1]) - size * 0.082, [255, 255, 255], 1);
  return c.toPNG(true);
}

export function faviconICO() {
  return encodeICO([16, 32, 48].map((size) => ({ size, png: iconPNG(size) })));
}
