import e01 from './entries-01.mjs';
import e02 from './entries-02.mjs';
import e03 from './entries-03.mjs';
import e04 from './entries-04.mjs';
import e05 from './entries-05.mjs';
import e06 from './entries-06.mjs';
import e07 from './entries-07.mjs';
import e08 from './entries-08.mjs';
import e09 from './entries-09.mjs';
import e10 from './entries-10.mjs';

const RAW = [...e01, ...e02, ...e03, ...e04, ...e05, ...e06, ...e07, ...e08, ...e09, ...e10];

export const REGIONS = {
  europe: { slug: 'europe', name: 'Europe', blurb: 'Alpine tunnels, Atlantic cliffs, medieval squares and night trains that smell of oranges.' },
  asia: { slug: 'asia', name: 'Asia', blurb: 'From Himalayan passes to convenience-store dinners, the continent that keeps rewriting your assumptions.' },
  africa: { slug: 'africa', name: 'Africa', blurb: 'Deserts that were once green, rivers that never reach the sea, and a continent bigger than any map admits.' },
  americas: { slug: 'americas', name: 'The Americas', blurb: 'Ten thousand kilometres of mountain spine, from Arctic ferries to Patagonian wind.' },
  oceania: { slug: 'oceania', name: 'Oceania & the Pacific', blurb: 'Islands navigated by swell and starlight, reefs visible from orbit, and the emptiest ocean on Earth.' },
  polar: { slug: 'polar', name: 'The Poles', blurb: 'Deserts made of ice, valleys that have not seen rain in two million years, and nights that last for months.' },
  world: { slug: 'world', name: 'Around the World', blurb: 'The wisdom, quirks and hard-won habits that belong to no single country.' },
};

export const TYPES = {
  fact: { slug: 'fun-facts', name: 'Fun facts', singular: 'Fun fact', blurb: 'Verifiable, surprising and genuinely useful details about places worth going.' },
  quote: { slug: 'quotes', name: 'Travel quotes', singular: 'Quote', blurb: 'Lines from writers, explorers and proverbs that have been pushing people out of the door for centuries.' },
  story: { slug: 'stories', name: 'Travel stories', singular: 'Story', blurb: 'Short true-to-life road stories: the missed ferry, the stranger with a key, the meal you still think about.' },
};

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

/**
 * Source files are grouped by type, which would leave whole pages holding a single type
 * and make the on-page filters look broken. Smooth weighted round-robin spreads the three
 * types evenly while keeping each type's original order.
 */
export function interleaveByType(items, getType) {
  const typeOf = getType || function (x) { return x.type; };
  const queues = {};
  items.forEach(function (item) {
    const t = typeOf(item);
    (queues[t] = queues[t] || []).push(item);
  });

  const types = Object.keys(queues);
  if (types.length < 2) return items.slice();

  const total = items.length;
  const weight = {};
  const credit = {};
  types.forEach(function (t) {
    weight[t] = queues[t].length / total;
    credit[t] = 0;
  });

  const out = [];
  while (out.length < total) {
    let best = null;
    types.forEach(function (t) {
      if (!queues[t].length) return;
      credit[t] += weight[t];
      if (best === null || credit[t] > credit[best]) best = t;
    });
    credit[best] -= 1;
    out.push(queues[best].shift());
  }
  return out;
}

export const ENTRIES = interleaveByType(RAW, function (row) { return row[0]; }).map(function (row, index) {
  const [type, title, place, region, text, author] = row;
  if (!TYPES[type]) throw new Error('Unknown entry type "' + type + '" at index ' + index);
  if (!REGIONS[region]) throw new Error('Unknown region "' + region + '" at index ' + index);
  return {
    id: index + 1,
    type,
    title,
    place,
    region,
    text,
    author: author || '',
    slug: slugify(title) + '-' + (index + 1),
  };
});

export const TOTAL = ENTRIES.length;
export const COUNT_BY_TYPE = Object.keys(TYPES).reduce(function (acc, key) {
  acc[key] = ENTRIES.filter(function (e) { return e.type === key; }).length;
  return acc;
}, {});
export const COUNT_BY_REGION = Object.keys(REGIONS).reduce(function (acc, key) {
  acc[key] = ENTRIES.filter(function (e) { return e.region === key; }).length;
  return acc;
}, {});
