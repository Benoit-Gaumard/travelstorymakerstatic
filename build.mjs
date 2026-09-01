import { mkdir, writeFile, rm, readdir, copyFile, stat, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, ogRegistry } from './src/layout.mjs';
import { TOTAL, COUNT_BY_TYPE, REGIONS, TYPES, COUNT_BY_REGION } from './src/data/index.mjs';
import { ogImage, ogCard, iconPNG, faviconICO } from './src/images.mjs';
import { resolveLastmod, writeManifest } from './src/lastmod.mjs';
import { feedItems, rssXml, atomXml } from './src/feeds.mjs';
import { minifyCss } from './src/minify.mjs';
import { homePage } from './src/pages/home.mjs';
import { allCollections, destinationsHub } from './src/pages/collections.mjs';
import { countryPages, entriesByCountry } from './src/pages/countries.mjs';
import { guidesIndex, guidePages, blogIndex, blogPages } from './src/pages/sections.mjs';
import { submitPage } from './src/pages/submit.mjs';
import { creditsPage } from './src/pages/credits.mjs';
import { ARTICLES } from './src/articles/index.mjs';
import { POSTS } from './src/blog/index.mjs';
import { COUNTRIES } from './src/countries.mjs';
import {
  aboutPage, contactPage, faqPage, editorialPolicyPage,
  termsPage, privacyPage, cookiesPage, disclaimerPage, notFoundPage,
} from './src/pages/statics.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(ROOT, 'dist');
const PUBLIC = resolve(ROOT, 'public');
const LASTMOD_FILE = resolve(ROOT, 'src', 'generated', 'lastmod.json');

/** Copies public/ into dist/, minifying stylesheets on the way through. */
async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  const items = await readdir(from, { withFileTypes: true });
  for (const item of items) {
    const src = join(from, item.name);
    const dest = join(to, item.name);
    if (item.isDirectory()) await copyDir(src, dest);
    else if (item.name.endsWith('.css')) await writeFile(dest, minifyCss(await readFile(src, 'utf8')), 'utf8');
    else await copyFile(src, dest);
  }
}

function outFileFor(routePath) {
  if (routePath.endsWith('.html')) return join(DIST, routePath.replace(/^\//, ''));
  const clean = routePath.replace(/^\/|\/$/g, '');
  return clean ? join(DIST, clean, 'index.html') : join(DIST, 'index.html');
}

async function emit(pages) {
  for (const p of pages) {
    const file = outFileFor(p.path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, p.html, 'utf8');
  }
}

function sitemapXml(pages) {
  const urls = pages.map(function (p) {
    const priority = p.path === '/' ? '1.0' : p.path.startsWith('/travelstories') || p.path.startsWith('/destinations') || p.path.startsWith('/guides') || p.path.startsWith('/blog') ? '0.8' : '0.5';
    const freq = p.path === '/' || p.path.startsWith('/travelstories') ? 'weekly' : 'monthly';
    return [
      '  <url>',
      '    <loc>' + SITE.url + p.path + '</loc>',
      '    <lastmod>' + p.lastmod + '</lastmod>',
      '    <changefreq>' + freq + '</changefreq>',
      '    <priority>' + priority + '</priority>',
      '  </url>',
    ].join('\n');
  }).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Advertising and search crawlers',
    'User-agent: Mediapartners-Google',
    'Allow: /',
    '',
    'User-agent: AdsBot-Google',
    'Allow: /',
    '',
    'Sitemap: ' + SITE.url + '/sitemap.xml',
    '',
  ].join('\n');
}

function llmsTxt() {
  const regionLinks = Object.keys(REGIONS).map(function (key) {
    const r = REGIONS[key];
    return '- [' + r.name + '](' + SITE.url + '/destinations/' + r.slug + '/): ' + COUNT_BY_REGION[key] + ' entries. ' + r.blurb;
  });
  const typeLinks = Object.keys(TYPES).map(function (key) {
    const t = TYPES[key];
    return '- [' + t.name + '](' + SITE.url + '/travelstories/' + t.slug + '/): ' + COUNT_BY_TYPE[key] + ' entries. ' + t.blurb;
  });

  return [
    '# ' + SITE.name,
    '',
    '> A free, independent library of short travel stories, travel quotes and fun facts about places around the world, plus long-form travel guides. Every page is static HTML with no account, no paywall and no JavaScript required to read it.',
    '',
    'Written and edited by Benoit Ga. Facts are checked against public sources; corrections are welcome.',
    'Entries are numbered and grouped by type (story, quote, fun fact), by region and by country.',
    'Readers can submit their own travel stories at ' + SITE.url + '/submit/.',
    'Content is published in English. Attribution and a link back are required if you reuse an entry.',
    '',
    '## Main pages',
    '',
    '- [Home](' + SITE.url + '/): Overview of the site and a sample of entries.',
    '- [All entries](' + SITE.url + '/travelstories/): The complete library, 100 entries per page.',
    '- [Travel guides](' + SITE.url + '/guides/): Long-form practical guides on flights, car hire, accommodation, phones, cards, insurance, altitude, deserts and seasons.',
    '- [Blog](' + SITE.url + '/blog/): Day-by-day trip reports with full itineraries and real transfer times.',
    '- [Destinations](' + SITE.url + '/destinations/): Hub page linking every region and country collection.',
    '- [Propose a story](' + SITE.url + '/submit/): Reader submission guidelines.',
    '',
    '## Guides',
    '',
    ARTICLES.map(function (a) {
      return '- [' + a.title + '](' + SITE.url + '/guides/' + a.slug + '/): ' + a.description;
    }).join('\n'),
    '',
    '## Blog',
    '',
    POSTS.map(function (a) {
      return '- [' + a.title + '](' + SITE.url + '/blog/' + a.slug + '/): ' + a.description;
    }).join('\n'),
    '',
    '## Collections by type',
    '',
    typeLinks.join('\n'),
    '',
    '## Collections by region',
    '',
    regionLinks.join('\n'),
    '',
    '## Collections by country',
    '',
    COUNTRIES.map(function (c) {
      return '- [' + c.title + '](' + SITE.url + '/destinations/' + c.slug + '/): ' + c.lede;
    }).join('\n'),
    '',
    '## About and policies',
    '',
    '- [About](' + SITE.url + '/about/): What the site is, who writes it and how it is funded.',
    '- [Editorial policy](' + SITE.url + '/editorial-policy/): Sourcing, verification, corrections and use of AI tools.',
    '- [Photo credits](' + SITE.url + '/credits/): Attribution and licences for every image.',
    '- [FAQ](' + SITE.url + '/faq/): How the site works and what may be reused.',
    '- [Contact](' + SITE.url + '/contact/): Corrections, permissions and privacy requests.',
    '- [Terms of use](' + SITE.url + '/terms/): Reuse rules, including restrictions on bulk extraction and model training.',
    '- [Privacy policy](' + SITE.url + '/privacy/)',
    '- [Cookie policy](' + SITE.url + '/cookies/)',
    '- [Disclaimer](' + SITE.url + '/disclaimer/)',
    '',
    '## Optional',
    '',
    '- [Sitemap](' + SITE.url + '/sitemap.xml): Machine-readable list of every indexable URL.',
    '- [Atom feed](' + SITE.url + '/feed.xml): New and updated guides and trip reports.',
    '- [RSS feed](' + SITE.url + '/rss.xml): The same items in RSS 2.0.',
    '',
  ].join('\n');
}

/*
 * RFC 9116. `Expires` is generated rather than hardcoded because a stale date makes the file
 * invalid, and a hand-written one always goes stale. One year from the build keeps it valid for
 * as long as the site is being deployed, which is exactly the signal the field is meant to carry.
 */
function securityTxt() {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return [
    '# Security contact for ' + SITE.url,
    '# If you believe you have found a vulnerability, please email us before disclosing it.',
    '',
    'Contact: mailto:' + SITE.email,
    'Expires: ' + expires,
    'Preferred-Languages: en, fr',
    'Canonical: ' + SITE.url + '/.well-known/security.txt',
    'Policy: ' + SITE.url + '/contact/',
    '',
    '# This site is static HTML with no backend, no accounts and no user data store.',
    '# Reports about the published content itself belong on the contact page.',
    '',
  ].join('\n');
}

function webmanifest() {
  return JSON.stringify({
    name: SITE.name,
    short_name: 'TravelStory',
    description: 'A free library of travel stories, quotes and fun facts.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#070b1a',
    theme_color: '#070b1a',
    lang: 'en',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2) + '\n';
}

async function main() {
  const start = Date.now();

  if (existsSync(DIST)) await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const byCountry = entriesByCountry();
  const counts = Object.keys(byCountry).reduce(function (acc, slug) {
    acc[slug] = byCountry[slug].length;
    return acc;
  }, {});

  const pages = [
    { path: '/', html: homePage() },
    destinationsHub(counts),
    ...allCollections(),
    ...countryPages(),
    guidesIndex(),
    ...guidePages(),
    blogIndex(),
    ...blogPages(),
    submitPage(),
    creditsPage(),
    aboutPage(),
    contactPage(),
    faqPage(),
    editorialPolicyPage(),
    termsPage(),
    privacyPage(),
    cookiesPage(),
    disclaimerPage(),
    notFoundPage(),
  ];

  await emit(pages);

  /*
   * <lastmod> is resolved from what each page actually contains - see src/lastmod.mjs. The manifest
   * it compares against is committed, so a build only moves a date when the page moved.
   */
  const today = new Date().toISOString().slice(0, 10);
  const indexable = pages.filter(function (p) { return !p.path.endsWith('.html'); });
  const tracked = resolveLastmod(indexable, { file: LASTMOD_FILE, today, seedDate: SITE.contentUpdated });
  if (tracked.dirty) writeManifest(LASTMOD_FILE, tracked.serialised);

  const sitemapPages = indexable.map(function (p) {
    return { path: p.path, lastmod: tracked.dates[p.path] };
  });
  await writeFile(join(DIST, 'sitemap.xml'), sitemapXml(sitemapPages), 'utf8');
  await writeFile(join(DIST, 'robots.txt'), robotsTxt(), 'utf8');
  await writeFile(join(DIST, 'llms.txt'), llmsTxt(), 'utf8');
  await writeFile(join(DIST, 'site.webmanifest'), webmanifest(), 'utf8');

  await mkdir(join(DIST, '.well-known'), { recursive: true });
  await writeFile(join(DIST, '.well-known', 'security.txt'), securityTxt(), 'utf8');

  const items = feedItems();
  const atom = atomXml(items);
  await writeFile(join(DIST, 'feed.xml'), atom, 'utf8');
  await writeFile(join(DIST, 'atom.xml'), atom, 'utf8');
  await writeFile(join(DIST, 'rss.xml'), rssXml(items), 'utf8');

  await writeFile(join(DIST, 'og-image.png'), ogImage());
  await writeFile(join(DIST, 'favicon.ico'), faviconICO());
  await writeFile(join(DIST, 'apple-touch-icon.png'), iconPNG(180));
  await writeFile(join(DIST, 'icon-192.png'), iconPNG(192));
  await writeFile(join(DIST, 'icon-512.png'), iconPNG(512));

  // Per-page share cards. The registry is filled while the pages above are rendered.
  const cards = ogRegistry();
  await mkdir(join(DIST, 'og'), { recursive: true });
  let ogBytes = 0;
  /*
   * Rendering 89 cards costs about 20s of the build, which is most of it. SKIP_OG_CARDS=1 is for
   * iterating on markup locally; never set it for a deploy, or every share card 404s.
   */
  const skipCards = process.env.SKIP_OG_CARDS === '1';
  if (!skipCards) {
    for (const [url, card] of cards) {
      const png = ogCard(card);
      ogBytes += png.length;
      await writeFile(join(DIST, url.replace(/^\//, '')), png);
    }
  }

  if (existsSync(PUBLIC)) await copyDir(PUBLIC, DIST);

  const adsPath = join(DIST, 'ads.txt');
  const adsInfo = existsSync(adsPath) ? (await stat(adsPath)).size : 0;

  console.log('Built ' + pages.length + ' pages from ' + TOTAL + ' entries in ' + (Date.now() - start) + 'ms');
  console.log('Output: ' + DIST);
  console.log('ads.txt: ' + (adsInfo > 0 ? 'present (' + adsInfo + ' bytes)' : 'MISSING'));
  console.log('Share cards: ' + (skipCards ? cards.size + ' SKIPPED (SKIP_OG_CARDS=1)' : cards.size + ' (' + Math.round(ogBytes / 1024) + ' KB)'));
  console.log('Feeds: /feed.xml, /atom.xml, /rss.xml (' + items.length + ' items)');

  if (tracked.seeding) {
    console.log('lastmod: manifest created for ' + indexable.length + ' URLs - commit src/generated/lastmod.json');
  } else if (tracked.changed.length || tracked.added.length) {
    console.log('lastmod: ' + tracked.changed.length + ' changed, ' + tracked.added.length + ' new - dated ' + today
      + '. Commit src/generated/lastmod.json or the next build will re-date them.');
    for (const path of tracked.changed.concat(tracked.added).slice(0, 12)) console.log('  ' + path);
  } else {
    console.log('lastmod: no page content changed; every date reused from the manifest');
  }
}

main().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
