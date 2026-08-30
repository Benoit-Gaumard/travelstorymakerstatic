import { page, esc, breadcrumbs, breadcrumbJsonLd, SITE } from '../layout.mjs';
import { heroBackdrop, hasPhoto } from '../photos.mjs';
import { flagImg } from '../flags.mjs';
import { toolbar, entryList, itemListJsonLd } from '../components.mjs';
import { ENTRIES, REGIONS } from '../data/index.mjs';
import { COUNTRIES, COUNTRY_BY_MATCH } from '../countries.mjs';
import { COUNTRY_FACTS } from '../country-facts.mjs';
import { ARTICLES } from '../articles/index.mjs';
import { POSTS } from '../blog/index.mjs';

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

/*
 * Guides that are specifically right for a country but that tag matching cannot find, because the
 * guide is tagged by the feature rather than by the country: the altitude guide says "Andes", the
 * desert guide says "Sahara". Peru getting four generic guides while a guide about travelling at
 * 3,400m sits unlinked is exactly the kind of miss this page exists to avoid.
 */
const COUNTRY_GUIDES = {
  peru: ['travelling-at-altitude'],
  bolivia: ['travelling-at-altitude'],
  nepal: ['travelling-at-altitude'],
  ecuador: ['travelling-at-altitude'],
  chile: ['desert-travel'],
  namibia: ['desert-travel'],
  morocco: ['desert-travel'],
  mali: ['desert-travel'],
  egypt: ['desert-travel'],
  norway: ['see-the-northern-lights'],
  greece: ['island-hopping'],
  philippines: ['island-hopping'],
  indonesia: ['island-hopping'],
  japan: ['crossing-a-continent-by-train'],
  china: ['crossing-a-continent-by-train'],
};

/*
 * Guides that help with any trip, used as the fallback for the majority of countries that have
 * no guide tagged to them specifically. Capped deliberately: a country page is a decision point,
 * and offering seven equally-weighted guides is the same as offering none.
 */
const ESSENTIAL_GUIDES = [
  'how-to-book-a-cheap-flight',
  'where-to-stay-while-traveling',
  'which-travel-insurance-to-choose',
  'use-your-phone-while-traveling-abroad',
];

/** Every name this country is known by in article and trip-report tags. */
function namesOf(country) {
  return [country.title, country.name]
    .concat(country.match || [])
    .map(function (s) { return String(s).toLowerCase().replace(/^the /, ''); });
}

function isAbout(item, names) {
  const hay = (item.tags || []).map(function (t) { return String(t).toLowerCase(); });
  if (item.destination) hay.push(String(item.destination).toLowerCase());
  return hay.some(function (t) { return names.indexOf(t) !== -1; });
}

function planLink(href, kind, title, meta) {
  return [
    '<li><a class="plan__link" href="' + href + '">',
    '<span class="plan__kind">' + esc(kind) + '</span>',
    '<span class="plan__title">' + esc(title) + '</span>',
    meta ? '<span class="plan__meta">' + esc(meta) + '</span>' : '',
    '</a></li>',
  ].join('');
}

/*
 * The reason this page exists. Someone planning a trip lands here from a search for the country,
 * and until now the page answered with a filtered slice of the reading library and then asked them
 * to submit a story of their own. This block gives them the one thing they came for: where to go
 * next. Country-specific writing wins; the essentials are the fallback so no country is a dead end.
 * Total links are capped at four — past that it stops being a decision and becomes a list.
 */
function planBlock(country) {
  const names = namesOf(country);
  const trips = POSTS.filter(function (p) { return isAbout(p, names); }).slice(0, 2);
  const cap = 4 - trips.length;

  /*
   * Country-specific guides first, then top up with the essentials. Topping up matters: Namibia
   * is tagged on exactly one guide, and without the fallback its planning block was a single link.
   */
  const own = ARTICLES.filter(function (a) {
    return isAbout(a, names) || (COUNTRY_GUIDES[country.slug] || []).indexOf(a.slug) !== -1;
  });
  const guides = own.slice(0, cap);
  for (const slug of ESSENTIAL_GUIDES) {
    if (guides.length >= cap) break;
    const a = ARTICLES.find(function (x) { return x.slug === slug; });
    if (a && guides.indexOf(a) === -1) guides.push(a);
  }

  if (!trips.length && !guides.length) return '';

  const links = [
    trips.map(function (p) {
      return planLink('/blog/' + p.slug + '/', 'Trip report', p.title, p.days + ' days \u00b7 ' + p.minutes + ' min read');
    }).join(''),
    guides.map(function (a) {
      return planLink('/guides/' + a.slug + '/', 'Guide', a.title, a.minutes + ' min read');
    }).join(''),
  ].join('');

  const lede = trips.length
    ? 'A day-by-day itinerary, and the guides that cover the decisions you make before you go.'
    : 'The decisions that determine whether the trip works, whichever country you are going to.';

  return [
    '<section class="plan" aria-labelledby="plan-title">',
    '<h2 id="plan-title">Planning a trip to ' + esc(country.title) + '</h2>',
    '<p class="plan__lede">' + esc(lede) + '</p>',
    '<ul class="plan__links">' + links + '</ul>',
    '</section>',
  ].join('');
}

/*
 * Country pages used to close on "Propose your travel story". That is the wrong thing to ask a
 * visitor who arrived to plan a trip, and it was the last thing on the page — the point where the
 * session either continues or ends. It now closes on the two places they might actually want:
 * the continent, and every other country we have.
 */
function countryCta(country, regionKey) {
  const region = REGIONS[regionKey];
  return [
    '<section class="cta-band cta-band--compact">',
    '<div class="container cta-band__inner">',
    '<div class="cta-band__text">',
    '<h2>Still deciding?</h2>',
    '<p>' + esc(country.title) + ' is one of ' + COUNTRIES.length + ' countries in the library. Read straight through a continent, or start from the map of everywhere we have written about.</p>',
    '</div>',
    '<div class="cta-band__actions">',
    region
      ? '<a class="btn btn--primary" href="/destinations/' + region.slug + '/">Read all of ' + esc(region.name) + '</a>'
      : '<a class="btn btn--primary" href="/destinations/">Browse every destination</a>',
    '<a class="btn btn--outline" href="/destinations/#by-country">Pick another country</a>',
    '<span class="cta-band__note">Free &middot; No account &middot; Nothing to install</span>',
    '</div>',
    '</div>',
    '</section>',
  ].join('');
}

/*
 * Build a meta description that leads with the country and stays inside Google's 160-character
 * display budget. The entry count is credibility, so it is kept whenever there is room, and
 * dropped rather than allowed to push the distinctive part of the sentence out of the snippet.
 */
export function fitMetaDescription(subject, lede, tail) {
  const head = subject + ': ' + lede;
  return head.length + 1 + tail.length <= 160 ? head + ' ' + tail : head;
}

function countryDescription(c, count) {
  return fitMetaDescription(
    c.title,
    c.lede,
    count + ' stories, quotes and fun facts.'
  );
}

export function countryOf(entry) {
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

    /* The continent this country's entries actually sit in, used for the closing route out. */
    const regionCounts = items.reduce(function (acc, e) { acc[e.region] = (acc[e.region] || 0) + 1; return acc; }, {});
    const regionKey = Object.keys(regionCounts)
      .filter(function (k) { return k !== 'world'; })
      .sort(function (a, b) { return regionCounts[b] - regionCounts[a]; })[0];

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
      /*
       * Fact sheet first, then the planning routes, then the prose. It used to be prose first,
       * which put two long paragraphs between a trip planner on a phone and the only practical
       * information on the page.
       */
      factSheet(c),
      planBlock(c),
      '<div class="prose" style="margin-top:44px">' + c.intro + '</div>',
      '</div>',
      '</section>',
      toolbar(items.length, items),
      '<section class="section section--tight">',
      '<div class="container">',
      entryList(items, 'Entries from ' + c.title),
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
      countryCta(c, regionKey),
    ].join('');

    pages.push({
      path,
      html: page({
        path,
        title: c.title + ': travel stories, quotes and fun facts | TravelStoryMaker',
        /*
         * Country name first, then the lede, then the count only when it fits inside 160
         * characters. The old shape — "15 short travel stories, quotes and fun facts about
         * Canada. <lede>" — spent 59 characters on boilerplate before saying anything specific,
         * which pushed twelve country pages past 160 and buried the country name mid-string.
         * fitDescription() could not rescue them either: cutting the lede left only the
         * boilerplate, below its 120-character floor, so it kept the whole thing.
         */
        description: countryDescription(c, items.length),
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
