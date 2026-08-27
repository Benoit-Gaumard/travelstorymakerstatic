import { esc } from './layout.mjs';
import { TYPES, REGIONS, COUNT_BY_REGION } from './data/index.mjs';
import { photo, thumb } from './photos.mjs';
import FACT_LINKS from './generated/factlinks.json' with { type: 'json' };

/** Continent card, shared by the home page and the destinations hub. */
export function regionTile(key) {
  const r = REGIONS[key];
  return [
    '<a class="post-card" href="/destinations/' + r.slug + '/">',
    photo(key) ? '<div class="post-card__media">' + thumb(key, r.name) + '</div>' : '',
    '<div class="post-card__body">',
    '<div class="post-card__meta">' + COUNT_BY_REGION[key] + ' entries</div>',
    '<h3>' + esc(r.name) + '</h3>',
    '<p>' + esc(r.blurb) + '</p>',
    '</div>',
    '</a>',
  ].join('');
}

export function entryCard(entry) {
  const badge = TYPES[entry.type].singular;
  const region = REGIONS[entry.region];
  const author = entry.author ? '<span class="entry__author">' + esc(entry.author) + '</span>' : '';
  const ref = entry.type === 'fact' ? FACT_LINKS[entry.title + '|' + entry.place] : null;
  return [
    '<article class="entry' + (entry.type === 'quote' ? ' entry--quote' : '') + '" data-type="' + entry.type + '" id="e' + entry.id + '">',
    '<div class="entry__top"><span class="badge">' + esc(badge) + '</span><span class="entry__num">#' + entry.id + '</span></div>',
    '<h3 class="entry__title">' + esc(entry.title) + '</h3>',
    '<p class="entry__text">' + esc(entry.text) + '</p>',
    ref
      ? '<p class="entry__ref"><a href="' + esc(ref.url) + '" target="_blank" rel="noopener">Read more: ' + esc(ref.title) + '<span aria-hidden="true"> \u2197</span></a></p>'
      : '',
    '<div class="entry__meta">',
    author,
    '<span>' + esc(entry.place) + '</span>',
    '<span aria-hidden="true">&middot;</span>',
    '<a href="/destinations/' + region.slug + '/">' + esc(region.name) + '</a>',
    '</div>',
    '</article>',
  ].join('');
}

export function toolbar(total) {
  return [
    '<div class="toolbar">',
    '<div class="container">',
    '<div class="toolbar__row">',
    '<div class="search"><label class="visually-hidden" for="entry-search">Search this page</label>',
    '<input id="entry-search" type="search" placeholder="Search country, theme or word…" autocomplete="off"></div>',
    '<div class="chips" role="group" aria-label="Filter by type">',
    '<button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>',
    '<button class="chip" type="button" data-filter="story" aria-pressed="false">Stories</button>',
    '<button class="chip" type="button" data-filter="quote" aria-pressed="false">Quotes</button>',
    '<button class="chip" type="button" data-filter="fact" aria-pressed="false">Fun facts</button>',
    '</div>',
    '<button class="chip" type="button" id="entry-shuffle">Surprise me</button>',
    '<p style="margin:0;font-size:.85rem;color:var(--text-faint);font-weight:600"><span id="entry-count">' + total + '</span> shown</p>',
    '</div>',
    '</div>',
    '</div>',
  ].join('');
}

export function entryList(entries) {
  return [
    '<div class="entries" id="entry-list">',
    entries.map(entryCard).join(''),
    '</div>',
    '<p class="empty-state" id="entry-empty">Nothing matched that search on this page. Try a shorter word, or browse <a href="/destinations/">by destination</a>.</p>',
  ].join('');
}

export function pagination(baseHref, current, totalPages) {
  if (totalPages <= 1) return '';
  const href = function (n) { return n === 1 ? baseHref : baseHref + 'page/' + n + '/'; };
  const parts = [];
  if (current > 1) parts.push('<a href="' + href(current - 1) + '" rel="prev">&larr; Previous</a>');
  const shown = new Set([1, totalPages, current, current - 1, current + 1]);
  let last = 0;
  for (let n = 1; n <= totalPages; n++) {
    if (!shown.has(n)) continue;
    if (n - last > 1) parts.push('<span aria-hidden="true">…</span>');
    parts.push(n === current
      ? '<span aria-current="page">' + n + '</span>'
      : '<a href="' + href(n) + '">' + n + '</a>');
    last = n;
  }
  if (current < totalPages) parts.push('<a href="' + href(current + 1) + '" rel="next">Next &rarr;</a>');
  return '<nav class="pagination" aria-label="Pagination">' + parts.join('') + '</nav>';
}

export function itemListJsonLd(entries, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url,
    numberOfItems: entries.length,
    itemListElement: entries.slice(0, 100).map(function (entry, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: entry.title,
        description: entry.text,
      };
    }),
  };
}
