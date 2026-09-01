import { readdir, readFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SITE = 'https://www.travelstorymaker.com';

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const one = (re, s) => { const m = s.match(re); return m ? m[1].trim() : null; };
const all = (re, s) => [...s.matchAll(re)].map((m) => m[1].trim());
const dec = (s) => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const rows = [];
for (const f of await walk(DIST)) {
  const html = await readFile(f, 'utf8');
  let url = '/' + f.slice(DIST.length + 1).replace(/\\/g, '/');
  url = url.endsWith('/index.html') ? url.slice(0, -10) : url;
  const head = html.slice(0, html.indexOf('</head>') + 7);
  const body = html.slice(html.indexOf('<body'));
  const text = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
  rows.push({
    url,
    words: text.split(' ').filter(Boolean).length,
    title: dec(one(/<title[^>]*>([\s\S]*?)<\/title>/i, head) || ''),
    desc: dec(one(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i, head) || ''),
    canon: one(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i, head),
    ogUrl: one(/<meta[^>]+property="og:url"[^>]+content="([^"]*)"/i, head),
    robots: one(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i, head),
    h1s: all(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, body),
    jsonld: all(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi, html),
    imgs: [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]),
    links: all(/<a\b[^>]+href="([^"]+)"/gi, body),
    ga: /googletagmanager|gtag\(/.test(html),
  });
}

const idx = rows.filter((r) => r.url !== '/404.html');
const out = [];
const say = (...a) => out.push(a.join(' '));
const L = (a) => (a.length ? JSON.stringify(a) : 'none');

say('PAGES: ' + rows.length + ' html, ' + idx.length + ' indexable\n');
say('== MUST BE CLEAN ==');
say('missing title       :', L(idx.filter((r) => !r.title).map((r) => r.url)));
say('missing description :', L(idx.filter((r) => !r.desc).map((r) => r.url)));
say('bad canonical       :', L(idx.filter((r) => r.canon !== SITE + r.url).map((r) => r.url)));
say('og:url != canonical :', L(idx.filter((r) => r.ogUrl !== r.canon).map((r) => r.url)));
say('h1 count != 1       :', L(idx.filter((r) => r.h1s.length !== 1).map((r) => r.url)));
say('no JSON-LD          :', L(idx.filter((r) => !r.jsonld.length).map((r) => r.url)));
say('noindex pages       :', L(rows.filter((r) => /noindex/.test(r.robots || '')).map((r) => r.url)));
say('img missing alt     :', idx.reduce((a, r) => a + r.imgs.filter((t) => !/\balt=/.test(t)).length, 0));
say('img missing w/h     :', idx.reduce((a, r) => a + r.imgs.filter((t) => !/\bwidth=/.test(t) || !/\bheight=/.test(t)).length, 0));
let bad = 0;
idx.forEach((r) => r.jsonld.forEach((s) => { try { JSON.parse(s); } catch { bad++; } }));
say('JSON-LD parse errors:', bad);
say('GA tag emitted on   :', idx.filter((r) => r.ga).length + '/' + idx.length + '  (0 expected until an ID is configured)');

const dupOf = (k) => {
  const m = new Map();
  idx.forEach((r) => { if (r[k]) m.set(r[k], [...(m.get(r[k]) || []), r.url]); });
  return [...m].filter(([, u]) => u.length > 1);
};
say('duplicate titles    :', L(dupOf('title')));
say('duplicate descs     :', L(dupOf('desc')));

say('\n== LENGTHS (decoded) ==');
const tl = idx.map((r) => r.title.length).sort((a, b) => a - b);
const dl = idx.map((r) => r.desc.length).sort((a, b) => a - b);
say('title min/max       :', tl[0] + '/' + tl[tl.length - 1], '| over 60:', idx.filter((r) => r.title.length > 60).length);
say('desc  min/max       :', dl[0] + '/' + dl[dl.length - 1], '| over 160:', idx.filter((r) => r.desc.length > 160).length,
  '| under 120:', idx.filter((r) => r.desc.length < 120).length);

say('\n== CONTENT ==');
const wv = idx.map((r) => ({ u: r.url, w: r.words })).sort((a, b) => a.w - b.w);
say('pages < 300 words   :', L(wv.filter((x) => x.w < 300)));
say('thinnest page       :', wv[0].w + ' words (' + wv[0].u + ')');
say('median words        :', wv[Math.floor(wv.length / 2)].w);
say('RICH / INDEXABLE    :', idx.filter((r) => r.words >= 300).length + '/' + idx.length);

say('\n== LINKING ==');
const known = new Set(idx.map((r) => r.url));
const inbound = new Map([...known].map((u) => [u, 0]));
const graph = new Map();
const broken = new Set();
idx.forEach((r) => {
  const outs = new Set();
  r.links.forEach((h) => {
    let p = h;
    if (/^https?:/.test(h)) { if (!h.startsWith(SITE)) return; p = h.slice(SITE.length) || '/'; }
    else if (/^(mailto:|tel:|#)/.test(h)) return;
    p = p.split('#')[0].split('?')[0];
    if (!p) return;
    if (known.has(p)) outs.add(p);
    else if (!/\.(png|jpg|jpeg|webp|svg|ico|xml|txt|css|js|woff2?|json|webmanifest|html)$/.test(p)) broken.add(r.url + ' -> ' + p);
  });
  graph.set(r.url, outs);
  outs.forEach((o) => { if (o !== r.url) inbound.set(o, inbound.get(o) + 1); });
});
say('broken internal     :', L([...broken]));
say('orphans             :', L([...inbound].filter(([, n]) => n === 0).map(([u]) => u)));
const low = [...inbound].filter(([, n]) => n < 3).sort((a, b) => a[1] - b[1]);
say('pages < 3 inbound   :', low.length, L(low.map(([u, n]) => u + '=' + n)));
const depth = new Map([['/', 0]]); const q = ['/'];
while (q.length) { const c = q.shift(); for (const n of graph.get(c) || []) if (!depth.has(n)) { depth.set(n, depth.get(c) + 1); q.push(n); } }
const byDepth = {};
[...depth].forEach(([, d]) => { byDepth[d] = (byDepth[d] || 0) + 1; });
say('depth from /        :', JSON.stringify(byDepth), '| unreachable:', L([...known].filter((u) => !depth.has(u))));

console.log(out.join('\n'));
