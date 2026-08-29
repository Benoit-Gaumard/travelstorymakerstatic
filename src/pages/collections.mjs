import { page, esc, breadcrumbs, breadcrumbJsonLd, SITE, storyCta } from '../layout.mjs';
import { heroBackdrop, hasPhoto } from '../photos.mjs';
import { flagImg } from '../flags.mjs';
import { toolbar, entryList, pagination, itemListJsonLd, regionTile } from '../components.mjs';
import { ENTRIES, TYPES, REGIONS, COUNT_BY_TYPE, COUNT_BY_REGION, interleaveByType } from '../data/index.mjs';
import { COUNTRIES } from '../countries.mjs';
import { countryOf } from './countries.mjs';

const PER_PAGE = 100;

/*
 * A hundred entries in one column is about forty screens on a phone, and until now the only
 * routes onward sat underneath all of them. This puts the missing dimension at the top: the
 * countries actually represented on this page, linking to the country pages, which are the
 * surface a visitor with trip intent is looking for. `relatedLinks()` still closes the page with
 * types and continents; this is deliberately the one axis that block does not cover.
 */
function pageRoutes(entries) {
  const counts = {};
  entries.forEach(function (e) {
    countryOf(e).forEach(function (c) { counts[c.slug] = (counts[c.slug] || 0) + 1; });
  });

  const top = COUNTRIES
    .filter(function (c) { return counts[c.slug]; })
    .sort(function (a, b) { return counts[b.slug] - counts[a.slug]; })
    .slice(0, 10);

  if (top.length < 3) return '';

  return [
    '<section class="page-routes">',
    '<h2 style="font-size:1.3rem">Countries on this page</h2>',
    '<p>Every country page collects its entries in one place, with a fact sheet and the guides for going there.</p>',
    '<div class="chips">',
    top.map(function (c) {
      return '<a class="chip" href="/destinations/' + c.slug + '/">' + esc(c.title) + ' (' + counts[c.slug] + ')</a>';
    }).join(''),
    '</div>',
    '</section>',
  ].join('');
}

/** Builds an intro sentence from the actual contents of one page, so no two pages repeat. */
function pageSummary(slice, pageNo, totalPages) {
  const counts = slice.reduce(function (acc, e) { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
  const parts = [
    counts.story ? counts.story + ' ' + (counts.story === 1 ? 'story' : 'stories') : '',
    counts.fact ? counts.fact + ' fun ' + (counts.fact === 1 ? 'fact' : 'facts') : '',
    counts.quote ? counts.quote + ' ' + (counts.quote === 1 ? 'quote' : 'quotes') : '',
  ].filter(Boolean);

  const places = [];
  slice.forEach(function (e) {
    const tail = e.place.includes(',') ? e.place.split(',').pop().trim() : e.place.trim();
    if (tail && tail !== 'World' && !places.includes(tail)) places.push(tail);
  });
  const highlights = places.slice(0, 6).join(', ');

  return parts.join(', ') + ' on this page. It covers '
    + (highlights || 'destinations around the world')
    + (places.length > 6 ? ' and ' + (places.length - 6) + ' other places' : '')
    + (totalPages > 1 ? '. Page ' + pageNo + ' of ' + totalPages + '.' : '.');
}

/**
 * Renders a paginated collection of entries as static HTML pages.
 */
function collection(opts) {
  // Re-spread the types inside this subset so every page offers all three filters.
  const items = interleaveByType(opts.entries);
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const out = [];

  for (let p = 1; p <= totalPages; p++) {
    const slice = items.slice((p - 1) * PER_PAGE, p * PER_PAGE);
    const path = p === 1 ? opts.baseHref : opts.baseHref + 'page/' + p + '/';
    const suffix = p === 1 ? '' : ' — page ' + p + ' of ' + totalPages;
    const crumbs = opts.crumbs.concat(p === 1 ? [] : [{ href: path, label: 'Page ' + p }]);
    const summary = pageSummary(slice, p, totalPages);
    const heading = p === 1 ? opts.h1 : opts.h1 + ', part ' + p;
    const lede = p === 1 ? opts.lede : summary;

    const body = [
      '<section class="hero hero--compact' + (opts.photo ? ' hero--photo' : '') + '">',
      opts.photo ? heroBackdrop(opts.photo) : '',
      '<div class="hero__blobs" aria-hidden="true"><span class="hero__blob hero__blob--a"></span><span class="hero__blob hero__blob--b"></span></div>',
      opts.photo ? '' : '<div class="hero__grid" aria-hidden="true"></div>',
      '<div class="container hero__inner">',
      breadcrumbs(crumbs),
      '<h1>' + esc(heading) + '</h1>',
      '<p class="hero__lede">' + esc(lede) + '</p>',
      totalPages > 1
        ? '<div class="hero__cta"><span class="eyebrow" style="margin:0">Page ' + p + ' of ' + totalPages + '</span></div>'
        : '',
      '</div>',
      '</section>',
      toolbar(slice.length, slice),
      '<section class="section section--tight">',
      '<div class="container">',
      '<div class="prose" style="margin-bottom:26px">' + (p === 1 && opts.intro ? opts.intro : '<p>' + esc(summary) + '</p>') + '</div>',
      pageRoutes(slice),
      entryList(slice, 'Entries on this page'),
      pagination(opts.baseHref, p, totalPages),
      opts.related ? '<div style="margin-top:48px">' + opts.related + '</div>' : '',
      '</div>',
      '</section>',
      storyCta({ tone: 'light', compact: true }),
    ].join('');

    out.push({
      path,
      html: page({
        path,
        title: opts.title + suffix,
        description: p === 1 ? opts.description : summary,
        onDark: true,
        body,
        jsonLd: [
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(slice, SITE.url + path),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: heading,
            description: p === 1 ? opts.description : summary,
            url: SITE.url + path,
            isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url + '/' },
          },
        ],
      }),
    });
  }

  return out;
}

function relatedLinks(currentPath) {
  const links = [
    { href: '/travelstories/', label: 'All entries' },
    { href: '/travelstories/stories/', label: COUNT_BY_TYPE.story + ' travel stories' },
    { href: '/travelstories/quotes/', label: COUNT_BY_TYPE.quote + ' travel quotes' },
    { href: '/travelstories/fun-facts/', label: COUNT_BY_TYPE.fact + ' fun facts' },
  ].concat(
    Object.keys(REGIONS).map(function (key) {
      return { href: '/destinations/' + REGIONS[key].slug + '/', label: REGIONS[key].name + ' (' + COUNT_BY_REGION[key] + ')' };
    })
  ).filter(function (l) { return l.href !== currentPath; });

  return [
    '<h2 style="font-size:1.3rem">Keep reading</h2>',
    '<div class="chips">',
    links.map(function (l) { return '<a class="chip" href="' + l.href + '">' + esc(l.label) + '</a>'; }).join(''),
    '</div>',
  ].join('');
}

export function allCollections() {
  const pages = [];

  pages.push(...collection({
    entries: ENTRIES,
    baseHref: '/travelstories/',
    photo: 'hero-world',
    crumbs: [{ href: '/', label: 'Home' }, { href: '/travelstories/', label: 'Travel stories' }],
    h1: 'Travel stories, quotes and fun facts',
    lede: 'The complete library, one hundred entries per page. Filter by type or search any word to narrow the page instantly.',
    title: 'Travel Stories, Quotes & Fun Facts | TravelStoryMaker',
    description: 'Read free travel stories, travel quotes and fun facts about countries around the world. Searchable, ad-supported, no account needed.',
    intro: '<p>This is the whole collection: ' + COUNT_BY_TYPE.story + ' short travel stories, ' + COUNT_BY_TYPE.quote + ' quotes and proverbs, and ' + COUNT_BY_TYPE.fact + ' fun facts spanning every continent and both poles. Entries are numbered so you can point somebody at one directly.</p>',
    related: relatedLinks('/travelstories/'),
  }));

  Object.keys(TYPES).forEach(function (key) {
    const t = TYPES[key];
    const base = '/travelstories/' + t.slug + '/';
    pages.push(...collection({
      entries: ENTRIES.filter(function (e) { return e.type === key; }),
      baseHref: base,
      photo: hasPhoto(t.slug === 'fun-facts' ? 'facts' : t.slug) ? (t.slug === 'fun-facts' ? 'facts' : t.slug) : 'hero-world',
      crumbs: [
        { href: '/', label: 'Home' },
        { href: '/travelstories/', label: 'Travel stories' },
        { href: base, label: t.name },
      ],
      h1: COUNT_BY_TYPE[key] + ' ' + t.name.toLowerCase(),
      lede: t.blurb,
      title: COUNT_BY_TYPE[key] + ' ' + t.name + ' | TravelStoryMaker',
      description: t.blurb + ' ' + COUNT_BY_TYPE[key] + ' entries, free to read, searchable on the page.',
      intro: '<p>' + esc(t.blurb) + '</p>',
      related: relatedLinks(base),
    }));
  });

  Object.keys(REGIONS).forEach(function (key) {
    const r = REGIONS[key];
    const base = '/destinations/' + r.slug + '/';
    pages.push(...collection({
      entries: ENTRIES.filter(function (e) { return e.region === key; }),
      baseHref: base,
      photo: hasPhoto(key) ? key : 'hero-world',
      crumbs: [
        { href: '/', label: 'Home' },
        { href: '/destinations/', label: 'Destinations' },
        { href: base, label: r.name },
      ],
      h1: r.name + ': ' + COUNT_BY_REGION[key] + ' stories, quotes and facts',
      lede: r.blurb,
      title: r.name + ' Travel Stories & Fun Facts | TravelStoryMaker',
      description: COUNT_BY_REGION[key] + ' travel stories, quotes and fun facts about ' + r.name + '. ' + r.blurb,
      intro: '<p>' + esc(r.blurb) + '</p>',
      related: relatedLinks(base),
    }));
  });

  return pages;
}

export function destinationsHub(countryCounts) {
  const crumbs = [{ href: '/', label: 'Home' }, { href: '/destinations/', label: 'Destinations' }];
  const tiles = Object.keys(REGIONS).map(regionTile).join('');

  const countries = COUNTRIES
    .filter(function (c) { return (countryCounts[c.slug] || 0) > 0; })
    .sort(function (a, b) { return countryCounts[b.slug] - countryCounts[a.slug]; });

  const countryCards = countries.map(function (c) {
    return [
      '<a class="post-card" href="/destinations/' + c.slug + '/">',
      hasPhoto('country-' + c.slug) ? '<div class="post-card__media"><img class="thumb" src="/assets/img/photos/country-' + c.slug + '.jpg" alt="' + esc(c.title) + '" width="600" height="400" loading="lazy" decoding="async"></div>' : '',
      '<div class="post-card__body">',
      '<div class="post-card__meta">' + countryCounts[c.slug] + ' entries</div>',
      '<h3 class="post-card__title-flag">' + flagImg(c.slug, c.title, { className: 'flag flag--inline', width: 30, height: 20, decorative: true }) + '<span>' + esc(c.title) + '</span></h3>',
      '<p>' + esc(c.lede) + '</p>',
      '</div>',
      '</a>',
    ].join('');
  }).join('');

  const body = [
    '<section class="hero hero--compact hero--photo">',
    heroBackdrop('hero-world'),
    '<div class="hero__blobs" aria-hidden="true"><span class="hero__blob hero__blob--a"></span><span class="hero__blob hero__blob--c"></span></div>',
    '<div class="container hero__inner">',
    breadcrumbs(crumbs),
    '<h1>Read the world, <br><span class="grad-text">one place at a time</span></h1>',
    '<p class="hero__lede">Every entry is tagged to a region and, where we have enough of them, to a country. Pick somewhere and read straight through.</p>',
    '</div>',
    '</section>',
    '<section class="section">',
    '<div class="container">',
    '<div class="section-head"><h2>By continent</h2><p class="lead">Seven broad collections covering every entry in the library.</p></div>',
    '<div class="post-grid">' + tiles + '</div>',
    '<div class="section-head" id="by-country" style="margin-top:72px"><h2>By country</h2><p class="lead">' + countries.length + ' countries with enough entries to deserve a page of their own, each with its own introduction.</p></div>',
    '<div class="post-grid">' + countryCards + '</div>',
    '<div class="prose" style="margin-top:64px">',
    '<h2>How the regions are decided</h2>',
    '<p>We use the six continental groupings most travellers actually think in, plus one catch-all. Türkiye and the Russian Far East sit in Asia because that is where the road takes you. Greenland sits with the Americas because that is the plate it rides on. Entries about aviation, borders, time zones and the habits of travel itself live under <a href="/destinations/world/">Around the World</a>.</p>',
    '<h2>Browse by type instead</h2>',
    '<p>If you would rather read one kind of thing, start with the <a href="/travelstories/stories/">travel stories</a>, the <a href="/travelstories/quotes/">travel quotes</a> or the <a href="/travelstories/fun-facts/">fun facts</a>. For longer reading, the <a href="/guides/">guides</a> go into depth on planning, altitude, deserts and seasons.</p>',
    '</div>',
    '</div>',
    '</section>',
    storyCta({ tone: 'light' }),
  ].join('');

  return {
    path: '/destinations/',
    html: page({
      path: '/destinations/',
      title: 'Destinations — travel stories and fun facts by country | TravelStoryMaker',
      description: 'Browse travel stories, quotes and fun facts by continent and by country, from Japan and Peru to Namibia and Antarctica.',
      onDark: true,
      body,
      jsonLd: [breadcrumbJsonLd(crumbs)],
    }),
  };
}
