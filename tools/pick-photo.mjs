// Throwaway: grab several candidates per query so a human can pick the best one.
import { mkdir, writeFile } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const OUT = 'tmp-candidates';

const REJECT = /\b(map|diagram|logo|coat of arms|flag|chart|plan|seal|banner|icon|screenshot|poster|stamp|graph|scheme|blueprint|panorama|topograph\w*|location|relief|satellite|schematic|drawing|engraving|painting|portrait|cover|scan|document|page|table|cockpit|crash|accident|wreck|museum)\b/i;

function thumbUrl(url, width) {
  const marker = '/commons/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const tail = url.slice(i + marker.length);
  const name = tail.split('/').pop();
  if (!/\.(jpe?g)$/i.test(name)) return null;
  return url.slice(0, i + marker.length) + 'thumb/' + tail + '/' + width + 'px-' + name;
}

const QUERIES = process.argv.slice(2);
await mkdir(OUT, { recursive: true });

for (const q of QUERIES) {
  const params = new URLSearchParams({
    q, source: 'wikimedia', extension: 'jpg',
    license: 'cc0,pdm,by,by-sa', mature: 'false', page_size: '20',
  });
  const res = await fetch('https://api.openverse.org/v1/images/?' + params, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  const results = (await res.json()).results || [];
  const slug = q.replace(/\W+/g, '-');
  let n = 0;
  for (const r of results) {
    if (n >= 4) break;
    if (REJECT.test(r.title || '')) continue;
    const w = r.width || 0, h = r.height || 0;
    if (w < 1000 || (h && (w / h < 1.3 || w / h > 2.4))) continue;
    const url = thumbUrl(r.url || '', 1280);
    if (!url) continue;
    try {
      const bin = Buffer.from(await (await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) })).arrayBuffer());
      if (bin.length < 20000 || bin.length > 1800000) continue;
      n++;
      await writeFile(OUT + '/' + slug + '-' + n + '.jpg', bin);
      console.log(slug + '-' + n + '  ' + (r.title || '').slice(0, 60) + '  [' + r.license + ' ' + r.creator + ']');
    } catch (e) { /* next */ }
  }
}
