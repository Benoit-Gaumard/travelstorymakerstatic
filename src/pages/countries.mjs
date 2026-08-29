import { page, esc, breadcrumbs, breadcrumbJsonLd, SITE, storyCta } from '../layout.mjs';
import { heroBackdrop, hasPhoto } from '../photos.mjs';
import { flagImg } from '../flags.mjs';
import { toolbar, entryList, itemListJsonLd } from '../components.mjs';
import { ENTRIES } from '../data/index.mjs';
import { COUNTRIES, COUNTRY_BY_MATCH } from '../countries.mjs';
import { COUNTRY_FACTS } from '../country-facts.mjs';

const FIELDS = [
  ['capital', 'Capital', '\u{1F3DB}'],
  ['currency', 'Currency', '\u{1F4B6}'],
  ['languages', 'Official language', '\u{1F5E3}'],
  ['climate', 'Climate', '\u{1F324}'],
  ['bestTime', 'Best time to go', '\u{1F4C5}'],
  ['timezone', 'Time zone', '\u{1F551}'],
  ['driving', 'Driving side', '\u{1F6E3}'],
  ['power', 'Plugs and voltage', '\u{1F50C}'],
];

function factSheet(country) {
  const f = COUNTRY_FACTS[country.slug];
  if (!f) return '';

  const flag = f.flag ? flagImg(country.slug, country.title, { className: 'factsheet__flag' }) : '';

  const rows = FIELDS.filter(function (x) { return f[x[0]]; }).map(function (x) {
    return [
      '<div class="factsheet__item">',
      '<dt><span class="factsheet__icon" aria-hidden="true">' + x[2] + '</span>' + esc(x[1]) + '</dt>',
      '<dd>' + esc(f[x[0]]) + '</dd>',
      '</div>',
    ].join('');
  }).join('');

  return [
    '<section class="factsheet" aria-labelledby="factsheet-title">',
    '<div class="factsheet__head">',
    flag || '<span class="factsheet__flag factsheet__flag--none" aria-hidden="true">\u{1F30D}</span>',
    '<div><h2 id="factsheet-title">' + esc(country.title) + ' at a glance</h2>',
    '<p>The practical numbers, before the stories.</p></div>',
    '</div>',
    '<dl class="factsheet__grid">' + rows + '</dl>',
    f.note ? '<p class="factsheet__note"><strong>Worth knowing:</strong> ' + esc(f.note) + '</p>' : '',
    '</section>',
  ].join('');
}

function countryOf(entry) {
  const place = entry.place;
  const tail = place.includes(',') ? place.split(',').pop().trim() : place.trim();
  const found = [];
  for (const part of tail.split(' and ')) {
    const c = COUNTRY_BY_MATCH[part.trim()];
    if (c && !found.includes(c)) found.push(c);
  }
  return found;
}

export function entriesByCountry() {
  const map = {};
  COUNTRIES.forEach(function (c) { map[c.slug] = []; });
  ENTRIES.forEach(function (e) {
    countryOf(e).forEach(function (c) { map[c.slug].push(e); });
  });
  return map;
}

export function countryPages() {
  const grouped = entriesByCountry();
  const pages = [];

  COUNTRIES.forEach(function (c) {
    const items = grouped[c.slug];
    if (!items.length) return;
    const path = '/destinations/' + c.slug + '/';
    const crumbs = [
      { href: '/', label: 'Home' },
      { href: '/destinations/', label: 'Destinations' },
      { href: path, label: c.title },
    ];
    const slot = 'country-' + c.slug;
    const counts = items.reduce(function (acc, e) { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
    const breakdown = [
      counts.story ? counts.story + ' ' + (counts.story === 1 ? 'story' : 'stories') : '',
      counts.fact ? counts.fact + ' fun ' + (counts.fact === 1 ? 'fact' : 'facts') : '',
      counts.quote ? counts.quote + ' ' + (counts.quote === 1 ? 'quote' : 'quotes') : '',
    ].filter(Boolean).join(', ');

    const neighbours = COUNTRIES.filter(function (x) { return x.slug !== c.slug && grouped[x.slug].length; }).slice(0, 12);

    const body = [
      '<section class="hero hero--compact' + (hasPhoto(slot) ? ' hero--photo' : '') + '">',
      heroBackdrop(slot),
      '<div class="hero__blobs" aria-hidden="true"><span class="hero__blob hero__blob--a"></span></div>',
      '<div class="container hero__inner">',
      breadcrumbs(crumbs),
      '<h1>' + esc(c.title) + '</h1>',
      '<p class="hero__lede">' + esc(c.lede) + '</p>',
      '<div class="hero__cta"><span class="eyebrow" style="margin:0">' + items.length + ' entries &middot; ' + esc(breakdown) + '</span></div>',
      '</div>',
      '</section>',
      '<section class="section section--tight" style="padding-bottom:0">',
      '<div class="container">',
      '<div class="prose" style="margin-bottom:26px">' + c.intro + '</div>',
      factSheet(c),
      '</div>',
      '</section>',
      toolbar(items.length, items),
      '<section class="section section--tight">',
      '<div class="container">',
      entryList(items),
      '<div class="prose" style="margin-top:48px">',
      '<h2>More destinations</h2>',
      '<div class="chips">',
      neighbours.map(function (n) {
        return '<a class="chip" href="/destinations/' + n.slug + '/">' + esc(n.title) + ' (' + grouped[n.slug].length + ')</a>';
      }).join(''),
      '</div>',
      '<p style="margin-top:18px"><a href="/destinations/">See every destination &rarr;</a></p>',
      '</div>',
      '</div>',
      '</section>',
      storyCta({ tone: 'light', compact: true }),
    ].join('');

    pages.push({
      path,
      html: page({
        path,
        title: c.title + ': travel stories, quotes and fun facts | TravelStoryMaker',
        description: items.length + ' short travel stories, quotes and fun facts about ' + c.name + '. ' + c.lede,
        onDark: true,
        body,
        jsonLd: [
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(items, SITE.url + path),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: c.title + ' travel stories and fun facts',
            url: SITE.url + path,
            about: { '@type': 'Place', name: c.title },
            isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url + '/' },
          },
        ],
      }),
    });
  });

  return pages;
}
