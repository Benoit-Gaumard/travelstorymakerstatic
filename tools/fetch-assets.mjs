// One-off asset fetcher. Run manually: node tools/fetch-assets.mjs
// Downloads webfonts and the photo library into public/, so the site has zero third-party requests.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA_MODERN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function get(url, headers) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA_MODERN, ...(headers || {}) },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(url + ' -> ' + res.status);
  return res;
}

async function save(relPath, buffer) {
  const file = join(ROOT, relPath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buffer);
  return { relPath, bytes: buffer.length };
}

/* ---------------- fonts ---------------- */

const FONT_CSS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&display=swap',
];

async function fonts() {
  const faces = [];
  for (const cssUrl of FONT_CSS) {
    const css = await (await get(cssUrl)).text();
    for (const block of css.split('@font-face').slice(1)) {
      const family = (block.match(/font-family:\s*'([^']+)'/) || [])[1];
      const style = (block.match(/font-style:\s*([a-z]+)/) || [])[1] || 'normal';
      const weight = ((block.match(/font-weight:\s*([^;]+)/) || [])[1] || '400').trim();
      const src = (block.match(/src:\s*url\(([^)]+)\)/) || [])[1];
      const range = ((block.match(/unicode-range:\s*([^;]+)/) || [])[1] || '').trim();
      // Google serves one @font-face per subset; U+0000-00FF marks the base latin one.
      if (!src || !family || !range.startsWith('U+0000-00FF')) continue;
      faces.push({ family, style, weight, src, range });
    }
  }

  const out = [];
  const seen = new Set();
  for (const f of faces) {
    const slug = (f.family + '-' + f.style + '-' + f.weight.replace(/\s+/g, '')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (seen.has(slug)) continue;
    seen.add(slug);
    const bin = Buffer.from(await (await get(f.src)).arrayBuffer());
    await save('public/assets/fonts/' + slug + '.woff2', bin);
    out.push({
      family: f.family,
      style: f.style,
      weight: f.weight,
      range: f.range,
      href: '/assets/fonts/' + slug + '.woff2',
      bytes: bin.length,
    });
  }
  await save('src/generated/fonts.json', Buffer.from(JSON.stringify(out, null, 2)));
  return out;
}

/* ---------------- photos (Openverse -> Wikimedia Commons thumbnails) ---------------- */

const GENERIC = [
  ['hero-world', 'mountain lake sunrise landscape'],
  ['europe', 'italy coastal village'],
  ['asia', 'japan pagoda mountain'],
  ['africa', 'african savanna acacia sunset'],
  ['americas', 'patagonia mountains'],
  ['oceania', 'new zealand coast landscape'],
  ['polar', 'iceberg antarctica'],
  ['world', 'airport terminal window aircraft'],
  ['stories', 'night train railway'],
  ['quotes', 'empty road horizon'],
  ['facts', 'antique world map globe'],
  ['credits', 'photographer camera landscape'],
  ['art-aurora', 'aurora borealis norway'],
  ['art-solo', 'hiking trail mountain path'],
  ['art-train', 'train window mountain railway'],
  ['art-shoulder', 'autumn coast mediterranean'],
  ['art-packing', 'suitcase luggage'],
  ['art-market', 'street food market stall'],
  ['art-altitude', 'himalaya trekking high mountain'],
  ['art-desert', 'sahara sand dunes'],
  ['art-jetlag', 'airplane wing clouds sunset'],
  ['art-island', 'ferry boat island sea'],
  ['art-photo', 'photographer taking photograph mountain'],
  ['art-responsible', 'rainforest canopy nature'],
  ['blog-flights', 'airport departure board terminal'],
  ['blog-car-rental', 'road trip highway car'],
  ['blog-stay', 'hotel room interior window'],
  ['blog-phone', 'smartphone hand outdoors'],
  ['blog-money', 'euro banknotes'],
  ['blog-insurance', 'mountain rescue helicopter'],
  ['blog-tips', 'backpacker walking street'],

  ['trip-thailand-1', 'wat arun bangkok'],
  ['trip-thailand-2', 'chiang mai temple'],
  ['trip-thailand-3', 'phi phi islands'],
  ['trip-japan-1', 'shibuya crossing tokyo'],
  ['trip-japan-2', 'fushimi inari kyoto'],
  ['trip-japan-3', 'miyajima torii'],
  ['trip-usa-1', 'zion'],
  ['trip-usa-2', 'monument valley'],
  ['trip-usa-3', 'grand canyon south rim'],
  ['trip-cuba-1', 'havana'],
  ['trip-cuba-2', 'tobacco field cuba'],
  ['trip-cuba-3', 'trinidad cuba'],
  ['trip-greece-1', 'acropolis athens'],
  ['trip-greece-2', 'naxos island'],
  ['trip-greece-3', 'naxos'],
  ['trip-spain-1', 'alicante spain'],
  ['trip-spain-2', 'alhambra granada'],
  ['trip-spain-3', 'seville plaza'],
  ['trip-slovenia-1', 'ljubljana slovenia'],
  ['trip-slovenia-2', 'lake bled'],
  ['trip-slovenia-3', 'slovenian coast adriatic'],
  ['trip-dubai-1', 'dubai skyline'],
  ['trip-dubai-2', 'desert dunes emirates'],
  ['trip-dubai-3', 'sheikh zayed mosque'],
  ['trip-moscow-1', 'red square moscow'],
  ['trip-moscow-2', 'moscow metro station'],
  ['trip-moscow-3', 'moscow river'],
  ['trip-lisbon-1', 'lisbon tram'],
  ['trip-lisbon-2', 'belem tower lisbon'],
  ['trip-lisbon-3', 'sintra palace'],
];

function thumbUrl(originalUrl, width) {
  const marker = '/commons/';
  const idx = originalUrl.indexOf(marker);
  if (idx === -1) return null;
  const tail = originalUrl.slice(idx + marker.length);
  const name = tail.split('/').pop();
  if (!/\.(jpe?g)$/i.test(name)) return null;
  return originalUrl.slice(0, idx + marker.length) + 'thumb/' + tail + '/' + width + 'px-' + name;
}

async function openverse(term, page) {
  const params = new URLSearchParams({
    q: term,
    source: 'wikimedia',
    extension: 'jpg',
    license: 'cc0,pdm,by,by-sa',
    mature: 'false',
    page_size: '20',
    page: String(page || 1),
  });
  const res = await get('https://api.openverse.org/v1/images/?' + params.toString(), { accept: 'application/json' });
  const json = await res.json();
  return json.results || [];
}

const REJECT = /\b(map|diagram|logo|coat of arms|flag|chart|seal|banner|icon|screenshot|poster|stamp|graph|scheme|blueprint|topograph\w*|satellite|schematic|drawing|engraving|painting|portrait|scan|document|page|table)\b/i;

function usable(r) {
  if (!r || !r.url) return false;
  if (REJECT.test(r.title || '')) return false;
  if (!/\.(jpe?g)$/i.test(r.url)) return false;
  const w = r.width || 0;
  const h = r.height || 0;
  if (w < 1000) return false;
  if (h && (w / h < 1.2 || w / h > 3.2)) return false;
  return true;
}

function shorten(term) {
  const words = term.split(/\s+/);
  return words.length > 2 ? words.slice(0, 2).join(' ') : words[0];
}

async function fetchOne(slot, term) {
  const queries = [...new Set([term, shorten(term), term.split(/\s+/)[0]])];
  for (const q of queries) {
    for (const pageNo of [1, 2, 3]) {
      let results = [];
      try {
        results = await openverse(q, pageNo);
      } catch (e) {
        break;
      }
      if (!results.length) break;
      for (const r of results.filter(usable)) {
        // Wikimedia only generates a fixed set of thumbnail widths.
        for (const width of [1280, 1024, 800]) {
          const url = thumbUrl(r.url, width);
          if (!url) break;
          try {
            const bin = Buffer.from(await (await get(url)).arrayBuffer());
            if (bin.length < 15000 || bin.length > 1800000) continue;
            await save('public/assets/img/photos/' + slot + '.jpg', bin);
            return {
              slot,
              src: '/assets/img/photos/' + slot + '.jpg',
              alt: (r.title || term).replace(/\s+/g, ' ').replace(/^File:/, '').replace(/\.(jpe?g)$/i, '').slice(0, 140),
              author: (r.creator || 'Unknown').split(/,| at | from /)[0].trim().slice(0, 70),
              authorUrl: r.creator_url || r.foreign_landing_url || '',
              source: 'Wikimedia Commons',
              link: r.foreign_landing_url || '',
              license: (r.license || '').toUpperCase(),
              licenseVersion: r.license_version || '',
              licenseUrl: r.license_url || '',
              bytes: bin.length,
            };
          } catch (e) {
            /* try a smaller width, then the next candidate */
          }
        }
      }
    }
  }
  return null;
}

async function photos() {
  const { COUNTRIES } = await import('../src/countries.mjs');
  const slots = GENERIC.concat(COUNTRIES.map((c) => ['country-' + c.slug, c.query]));
  let manifest = {};
  try {
    const existing = await import('../src/generated/photos.json', { with: { type: 'json' } });
    manifest = { ...existing.default };
  } catch (e) {
    manifest = {};
  }
  let miss = 0;
  for (const [slot, term] of slots) {
    if (manifest[slot]) continue;
    let picked = null;
    try {
      picked = await fetchOne(slot, term);
    } catch (e) {
      console.warn('search failed ' + slot + ': ' + e.message);
    }
    if (picked) {
      manifest[slot] = picked;
      console.log('ok   ' + slot.padEnd(26) + Math.round(picked.bytes / 1024) + 'KB  ' + picked.license + '  ' + picked.author);
    } else {
      miss++;
      console.warn('MISS ' + slot + '  (' + term + ')');
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  await save('src/generated/photos.json', Buffer.from(JSON.stringify(manifest, null, 2)));
  console.log('still missing: ' + miss);
  return manifest;
}

/* ---------------- flags ---------------- */

// Special:FilePath resolves a Commons file name and rasterises SVGs at the requested width.
async function flags() {
  const { COUNTRY_FACTS } = await import('../src/country-facts.mjs');
  const { existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  let saved = 0;
  let miss = 0;

  for (const slug of Object.keys(COUNTRY_FACTS)) {
    const file = COUNTRY_FACTS[slug].flag;
    if (!file) continue;
    const rel = 'public/assets/img/flags/' + slug + '.png';
    if (existsSync(join(ROOT, rel))) continue;

    const url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=240';
    let done = false;
    for (let attempt = 0; attempt < 4 && !done; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 2000 * attempt));
      try {
        const bin = Buffer.from(await (await get(url)).arrayBuffer());
        if (bin.length < 300) throw new Error('suspiciously small');
        await save(rel, bin);
        saved++;
        done = true;
        console.log('ok   ' + slug.padEnd(16) + bin.length + ' bytes');
      } catch (e) {
        if (attempt === 3) {
          miss++;
          console.warn('MISS ' + slug + '  (' + file + ') ' + e.message);
        }
      }
    }
    await new Promise((r) => setTimeout(r, 900));
  }
  console.log('flags: ' + saved + ' saved, ' + miss + ' missing');
}

/* ---------------- reference links for fun facts ---------------- */

const WIKI_UA = 'TravelStoryMaker/1.0 (https://www.travelstorymaker.com; travelstorymaker@gmail.com)';
const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'and', 'is', 'are', 'has', 'have', 'was', 'were', 'its', 'it', 'to', 'for', 'that', 'this', 'than', 'more', 'most', 'no', 'not', 'you', 'your']);

function tokens(text) {
  return new Set(
    String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter(function (w) { return w.length > 2 && !STOP.has(w); })
  );
}

/** How well a Wikipedia article title matches the entry it should illustrate. */
function score(candidate, wanted, placeTokens) {
  const c = tokens(candidate);
  if (!c.size) return null;
  let hit = 0;
  let placeHit = 0;
  c.forEach(function (w) {
    if (wanted.has(w)) hit++;
    if (placeTokens.has(w)) placeHit++;
  });
  // A single shared word is usually coincidence unless it names the place.
  if (!placeHit && hit < 2) return null;
  return { ratio: hit / c.size, placeHit: placeHit, hit: hit };
}

// Articles too broad to illustrate anything specific.
const GENERIC_ARTICLES = new Set([
  'world', 'earth', 'water', 'salt', 'air', 'sea', 'ocean', 'time', 'travel', 'tourism',
  'country', 'city', 'town', 'village', 'island', 'mountain', 'river', 'lake', 'desert',
  'food', 'language', 'money', 'history', 'climate', 'weather', 'nature', 'human', 'people',
  'europe', 'asia', 'africa', 'americas', 'oceania', 'continent', 'list of countries',
]);

function isGeneric(title) {
  return GENERIC_ARTICLES.has(String(title).trim().toLowerCase());
}

async function wikiSearch(query, limit) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch='
    + encodeURIComponent(query) + '&srlimit=' + limit + '&format=json';
  const res = await get(url, { accept: 'application/json', 'user-agent': WIKI_UA });
  const json = await res.json();
  return ((json.query && json.query.search) || []).map(function (s) { return s.title; });
}

async function links() {
  const { ENTRIES } = await import('../src/data/index.mjs');
  let manifest = {};
  try {
    const existing = await import('../src/generated/factlinks.json', { with: { type: 'json' } });
    manifest = { ...existing.default };
  } catch (e) {
    manifest = {};
  }

  const facts = ENTRIES.filter(function (e) { return e.type === 'fact'; });
  let resolved = 0;
  let skipped = 0;
  let miss = 0;

  for (const entry of facts) {
    const key = entry.title + '|' + entry.place;
    if (manifest[key]) { skipped++; continue; }

    const wanted = tokens(entry.title + ' ' + entry.place + ' ' + entry.text);
    const placeTokens = tokens(entry.place);
    let best = null;

    for (const query of [entry.title + ' ' + entry.place, entry.place]) {
      let candidates = [];
      try {
        candidates = await wikiSearch(query, 3);
      } catch (e) {
        continue;
      }
      for (const title of candidates) {
        if (isGeneric(title)) continue;
        const s = score(title, wanted, placeTokens);
        if (!s) continue;
        // Prefer titles naming the place, then overall relevance.
        const rank = s.placeHit * 2 + s.ratio;
        if (!best || rank > best.rank) best = { title, rank, ratio: s.ratio };
      }
      await new Promise((r) => setTimeout(r, 120));
      if (best && best.rank >= 2) break;
    }

    if (best && best.ratio >= 0.34) {
      manifest[key] = {
        title: best.title,
        url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(best.title.replace(/ /g, '_')),
      };
      resolved++;
      if (resolved % 25 === 0) console.log('  resolved ' + resolved + '...');
    } else {
      miss++;
      console.warn('MISS ' + entry.title);
    }
  }

  await save('src/generated/factlinks.json', Buffer.from(JSON.stringify(manifest, null, 2)));
  console.log('links: ' + resolved + ' resolved, ' + skipped + ' cached, ' + miss + ' missing, ' + Object.keys(manifest).length + ' total');
}

const what = process.argv[2] || 'all';
if (what === 'fonts' || what === 'all') {
  const f = await fonts();
  console.log('fonts: ' + f.length + ' files, ' + Math.round(f.reduce((a, b) => a + b.bytes, 0) / 1024) + 'KB total');
}
if (what === 'photos' || what === 'all') {
  const p = await photos();
  console.log('photos: ' + Object.keys(p).length + ' saved');
}
if (what === 'flags' || what === 'all') {
  await flags();
}
if (what === 'links' || what === 'all') {
  await links();
}
