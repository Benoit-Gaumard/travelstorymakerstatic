import { esc, fmt } from './layout.mjs';
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

const TYPE_CHIPS = [
  { key: 'story', label: 'Stories' },
  { key: 'quote', label: 'Quotes' },
  { key: 'fact', label: 'Fun facts' },
];

/**
 * @param {number} total  entries rendered on this page
 * @param {object[]} [entries]  the entries themselves, used to derive the type filters
 */
export function toolbar(total, entries) {
  /*
   * Only offer a filter for types that are actually on the page. Country pages used to render
   * all three chips unconditionally, so /destinations/japan/ - which has 10 fun facts, 8
   * stories and no quotes - showed a "Quotes" chip that filtered the list down to the empty
   * state. The page's own navigation led to a dead end on the highest-intent surface on the
   * site. Below two types the group carries no information at all, so it is dropped entirely.
   */
  const present = new Set((entries || []).map(function (e) { return e.type; }));
  const available = TYPE_CHIPS.filter(function (t) { return present.has(t.key); });
  const chips = available.length > 1
    ? [
      '<div class="chips" role="group" aria-label="Filter by type">',
      '<button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>',
      available.map(function (t) {
        return '<button class="chip" type="button" data-filter="' + t.key + '" aria-pressed="false">' + esc(t.label) + '</button>';
      }).join(''),
      '</div>',
    ].join('')
    : '';

  /*
   * Name the scope. The search only filters the entries already rendered on this page, never
   * the other 900, and saying "Search this page" did not make that concrete enough: someone
   * searching a term that lives on page 4 concludes the site does not have it.
   */
  const scope = 'Search these ' + fmt(total) + ' entries';

  return [
    '<div class="toolbar">',
    '<div class="container">',
    '<div class="toolbar__row">',
    '<div class="search"><label class="visually-hidden" for="entry-search">' + esc(scope) + ' by country, theme or word</label>',
    '<input id="entry-search" type="search" placeholder="' + esc(scope) + '&hellip;" autocomplete="off"></div>',
    chips,
    '<button class="chip" type="button" id="entry-shuffle">Surprise me</button>',
    '<p style="margin:0;font-size:var(--fs-meta);color:var(--text-faint);font-weight:600"><span id="entry-count">' + total + '</span> shown</p>',
    '</div>',
    '</div>',
    '</div>',
  ].join('');
}

/**
 * @param {object[]} entries
 * @param {string} [heading]  section heading for the list. Rendered visually hidden: the hero
 *   and the toolbar already carry the visible hierarchy, but without a real h2 the outline
 *   jumps straight from the page h1 to the h3 on each card, so heading navigation skips the
 *   structural level a screen-reader user moves between sections with.
 */
export function entryList(entries, heading) {
  return [
    heading ? '<h2 class="visually-hidden">' + esc(heading) + '</h2>' : '',
    '<div class="entries" id="entry-list">',
    entries.map(entryCard).join(''),
    '</div>',
    '<p class="empty-state" id="entry-empty">Nothing matched that search on this page. Try a shorter word, or browse <a href="/destinations/">by destination</a>.</p>',
  ].join('');
}

/**
 * Pagination that keeps every archive page one click away.
 *
 * The window used to be {first, last, current±1}, so from page 1 of the ten-page /travelstories/
 * archive the only routes onward were pages 2 and 10: page 5 took four clicks and sat four levels
 * deep for a crawler. No collection here runs past ten pages, so below the threshold every number
 * is rendered and the archive is flat. Above it the window is kept, because a strip of forty
 * numbers is not navigation either.
 */
const FLAT_UP_TO = 12;

export function pagination(baseHref, current, totalPages) {
  if (totalPages <= 1) return '';
  const href = function (n) { return n === 1 ? baseHref : baseHref + 'page/' + n + '/'; };
  const parts = [];
  if (current > 1) parts.push('<a href="' + href(current - 1) + '" rel="prev">&larr; Previous</a>');
  const shown = totalPages <= FLAT_UP_TO
    ? new Set(Array.from({ length: totalPages }, function (_, i) { return i + 1; }))
    : new Set([1, 2, totalPages - 1, totalPages, current, current - 1, current + 1]);
  let last = 0;
  for (let n = 1; n <= totalPages; n++) {
    if (!shown.has(n)) continue;
    if (n - last > 1) parts.push('<span aria-hidden="true">…</span>');
    parts.push(n === current
      ? '<span aria-current="page">' + n + '</span>'
      : '<a href="' + href(n) + '" aria-label="Page ' + n + '">' + n + '</a>');
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
