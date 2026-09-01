/*
 * Per-URL <lastmod> that tracks the content, not the deploy.
 *
 * The problem this replaces: 93 of the 113 sitemap URLs carried the same date because everything
 * except guides and trip reports fell back to the hand-maintained SITE.contentUpdated constant.
 * A constant somebody has to remember to bump is only ever right by accident, and a date shared by
 * 93 URLs tells Google the same thing a build-time date does - nothing.
 *
 * How it works: every page is fingerprinted from its own rendered content, and the fingerprint is
 * compared against a committed manifest (src/generated/lastmod.json). Same fingerprint, same date
 * as last time. Different fingerprint, today's date, and the manifest is rewritten so the next
 * build is stable again. The manifest is committed like every other file in src/generated/.
 *
 * The fingerprint deliberately excludes shared chrome - navigation, breadcrumbs, pagination, the
 * search toolbar, the "propose a story" band and the "keep reading" chip lists. Those are on every
 * page, so hashing them would republish all 113 URLs the day somebody restyles a button, which is
 * exactly the failure mode being fixed. What is left is the hero copy, the headings, the entries,
 * the prose and the tables: the things a reader would call the page.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/** Blocks that are identical (or near-identical) across pages and must not drive a date change. */
const CHROME = [
  /<nav\b[^>]*>[\s\S]*?<\/nav>/gi,
  /<div class="toolbar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
  /<section class="cta-band[^"]*">[\s\S]*?<\/section>/gi,
  /<aside class="author-box">[\s\S]*?<\/aside>/gi,
  /<p class="empty-state"[\s\S]*?<\/p>/gi,
];

/** hero-world-640.webp, hero-world.jpg and hero-world-1280.webp are all the same picture. */
function imageIdentity(src) {
  return src.split('/').pop().replace(/\.(jpg|png|webp|svg)$/i, '').replace(/-\d{2,4}$/, '');
}

/**
 * Reduces a rendered page to the words a reader would see, plus the identity of the images shown.
 *
 * Hashing the markup instead was tried first and was wrong: wrapping every photo in a <picture>
 * changed 105 of 113 pages without changing a single word on any of them, and re-dating the whole
 * site for a markup refactor is the exact behaviour this file exists to prevent. Tag structure,
 * class names, image sizes and formats are all invisible here. Text and pictures are not.
 *
 * @param {string} html full page HTML
 */
export function fingerprint(html) {
  /*
   * Both indices are resolved before slicing. `indexOf('</main>') + 7` is 6 when the tag is absent,
   * which silently produced `"<!doct"` as the entire content of the page - a constant, so the page
   * would then keep its date forever no matter what was written on it.
   */
  const open = html.indexOf('<main id="main">');
  const close = html.indexOf('</main>');
  let text = open === -1 || close === -1 ? html : html.slice(open, close + 7);
  for (const re of CHROME) text = text.replace(re, '');

  text = text
    .replace(/<img\b[^>]*\bsrc="([^"]*)"[^>]*>/gi, function (_, src) { return ' [' + imageIdentity(src) + '] '; })
    .replace(/<(source|link|script|style)\b[\s\S]*?<\/\1>|<(source|link)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || ['', ''])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/i) || ['', ''])[1];
  return createHash('sha256').update(title + '\n' + desc + '\n' + text.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 20);
}

function laterOf(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

/**
 * @param {{path:string, html:string, lastmod?:string}[]} pages
 * @param {{file:string, today:string, seedDate:string}} opts
 * @returns {{dates:Record<string,string>, changed:string[], added:string[], manifest:object, dirty:boolean}}
 */
export function resolveLastmod(pages, opts) {
  const seeding = !existsSync(opts.file);
  const previous = seeding ? {} : JSON.parse(readFileSync(opts.file, 'utf8'));
  const manifest = {};
  const dates = {};
  const changed = [];
  const added = [];

  for (const p of pages) {
    const hash = fingerprint(p.html);
    const prev = previous[p.path];
    let date;

    if (prev && prev.hash === hash) {
      date = prev.date;
    } else if (prev) {
      date = opts.today;
      changed.push(p.path);
    } else if (seeding) {
      /*
       * First run only: adopt the dates the site already published rather than stamping the whole
       * library with the day this tracker was introduced. From the second run on, an unknown path
       * is a genuinely new page and gets today.
       */
      date = p.lastmod || opts.seedDate;
    } else {
      date = opts.today;
      added.push(p.path);
    }

    /*
     * A guide that declares `updated: 2026-08-27` in its own data is making an editorial claim, and
     * the reader sees that date in the byline. Never publish a <lastmod> older than it.
     */
    date = laterOf(date, p.lastmod);
    dates[p.path] = date;
    manifest[p.path] = { hash, date };
  }

  /* Sorted so the file diffs cleanly when a page is added or a date moves. */
  const sorted = {};
  for (const key of Object.keys(manifest).sort()) sorted[key] = manifest[key];
  const serialised = JSON.stringify(sorted, null, 2) + '\n';
  const dirty = seeding || serialised !== (existsSync(opts.file) ? readFileSync(opts.file, 'utf8') : '');

  return { dates, changed, added, serialised, dirty, seeding };
}

export function writeManifest(file, serialised) {
  writeFileSync(file, serialised, 'utf8');
}
