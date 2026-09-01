/*
 * RSS 2.0 and Atom feeds for the two editorial sections.
 *
 * The audit found /feed.xml, /rss.xml and /atom.xml all returning 404, which is what an aggregator
 * or a reader looking for one will hit first. Only the guides and the trip reports belong in a
 * feed: they are dated, authored, and published one at a time. The 1000 library entries are not -
 * they shipped as a single dataset and would flood a feed with a thousand items that never change.
 *
 * Both formats are emitted from the same item list because feed readers are split between them and
 * neither costs anything to generate. /atom.xml is a copy of /feed.xml, since both names are
 * conventional and the audit probed for both.
 */
import { SITE, AUTHOR, esc } from './layout.mjs';
import { ARTICLES } from './articles/index.mjs';
import { POSTS } from './blog/index.mjs';

const MAX_ITEMS = 40;

function iso(date) {
  return date + 'T09:00:00Z';
}

function rfc822(date) {
  return new Date(iso(date)).toUTCString();
}

/** Newest first, across both sections. */
export function feedItems() {
  const items = [
    ...ARTICLES.map(function (a) { return { post: a, base: '/guides/', section: 'Travel guides' }; }),
    ...POSTS.map(function (p) { return { post: p, base: '/blog/', section: 'Trip reports' }; }),
  ].map(function (row) {
    const p = row.post;
    return {
      title: p.title,
      url: SITE.url + row.base + p.slug + '/',
      description: p.description,
      published: p.published,
      updated: p.updated || p.published,
      section: row.section,
      tags: p.tags || [],
    };
  });

  items.sort(function (a, b) {
    if (a.updated === b.updated) return a.title < b.title ? -1 : 1;
    return a.updated < b.updated ? 1 : -1;
  });

  return items.slice(0, MAX_ITEMS);
}

export function feedUpdated(items) {
  return items.reduce(function (latest, i) { return i.updated > latest ? i.updated : latest; }, items[0].updated);
}

export function rssXml(items) {
  const body = items.map(function (i) {
    return [
      '  <item>',
      '    <title>' + esc(i.title) + '</title>',
      '    <link>' + i.url + '</link>',
      '    <guid isPermaLink="true">' + i.url + '</guid>',
      '    <description>' + esc(i.description) + '</description>',
      '    <category>' + esc(i.section) + '</category>',
      i.tags.map(function (t) { return '    <category>' + esc(t) + '</category>'; }).join('\n'),
      '    <pubDate>' + rfc822(i.published) + '</pubDate>',
      '  </item>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    '  <title>' + esc(SITE.name) + ' - guides and trip reports</title>',
    '  <link>' + SITE.url + '/</link>',
    '  <atom:link href="' + SITE.url + '/rss.xml" rel="self" type="application/rss+xml"/>',
    '  <description>Long-form travel guides and day-by-day trip itineraries, written and checked by ' + esc(AUTHOR.name) + '.</description>',
    '  <language>en</language>',
    '  <lastBuildDate>' + rfc822(feedUpdated(items)) + '</lastBuildDate>',
    '  <ttl>1440</ttl>',
    body,
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function atomXml(items) {
  const body = items.map(function (i) {
    return [
      '  <entry>',
      '    <title>' + esc(i.title) + '</title>',
      '    <link rel="alternate" type="text/html" href="' + i.url + '"/>',
      '    <id>' + i.url + '</id>',
      '    <published>' + iso(i.published) + '</published>',
      '    <updated>' + iso(i.updated) + '</updated>',
      '    <category term="' + esc(i.section) + '"/>',
      '    <summary type="text">' + esc(i.description) + '</summary>',
      '  </entry>',
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
    '  <title>' + esc(SITE.name) + ' - guides and trip reports</title>',
    '  <subtitle>Long-form travel guides and day-by-day trip itineraries.</subtitle>',
    '  <link rel="alternate" type="text/html" href="' + SITE.url + '/"/>',
    '  <link rel="self" type="application/atom+xml" href="' + SITE.url + '/feed.xml"/>',
    '  <id>' + SITE.url + '/</id>',
    '  <updated>' + iso(feedUpdated(items)) + '</updated>',
    '  <author><name>' + esc(AUTHOR.name) + '</name><uri>' + AUTHOR.url + '</uri></author>',
    '  <rights>Copyright ' + esc(SITE.name) + '</rights>',
    body,
    '</feed>',
    '',
  ].join('\n');
}
