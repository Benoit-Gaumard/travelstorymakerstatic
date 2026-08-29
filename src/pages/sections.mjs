import { esc, AUTHOR } from '../layout.mjs';
import { postIndex, postPages } from './posts.mjs';
import { ARTICLES } from '../articles/index.mjs';
import { POSTS } from '../blog/index.mjs';

/*
 * Said once, plainly, in the same voice the FAQ already uses about the short stories. The
 * itineraries are written in the first person because that is how the routes read best, but the
 * site must not claim they are a record of journeys the author made: they are not, and a monetised
 * site that implies otherwise is both dishonest to the reader and an authenticity risk with
 * Google's helpful-content guidance and with AdSense. Shown on /blog/ and on every trip report.
 */
const PROVENANCE_HTML = [
  '<h2>How to read these</h2>',
  '<p>These itineraries are written in the first person because a route reads better that way, ',
  'but they are not a diary. They are constructed itineraries — assembled routes, distances and ',
  'timings, put together to be followed rather than to record a particular journey. Treat the days ',
  'and the transfer times as a plan you can copy, and check anything time-sensitive, such as ',
  'opening hours, permits and prices, before you rely on it.</p>',
].join('');

const GUIDES = {
  base: '/guides/',
  label: 'Guides',
  posts: ARTICLES,
  heroPhoto: 'art-train',
  schemaType: 'Article',
  h1: 'Travel guides <br><span class="grad-text">written by someone who got it wrong first</span>',
  indexHeading: 'Every guide',
  lede: 'Long-form guides on the decisions that actually determine whether a trip works: flights, cars, rooms, money, insurance, altitude, deserts, weather windows and what to leave at home.',
  title: 'Travel guides — practical long-form advice | TravelStoryMaker',
  description: 'In-depth travel guides: booking cheap flights, renting a car abroad, choosing insurance, seeing the northern lights, altitude, deserts, packing light and more.',
  aboutHtml: [
    '<h2>How these are written</h2>',
    '<p>Every guide here is written by ' + esc(AUTHOR.name) + ', checked against public sources where it makes factual claims, and updated when things change. There are no affiliate links inside them and no sponsored placements, and we deliberately avoid naming specific banks, insurers or booking sites — products change every year, the principles behind them do not.</p>',
    '<p>Where a subject touches on health, money or insurance, the guide carries a plain note that it is general information rather than professional advice, because it is. If you find an error, <a href="/contact/">tell us</a>; our <a href="/editorial-policy/">editorial policy</a> explains how corrections are handled.</p>',
    '<h2>Looking for real trips?</h2>',
    '<p>The <a href="/blog/">blog</a> is where the day-by-day trip reports live — Thailand, Japan, Cuba, the American Southwest and more, with the routes and the timings.</p>',
  ].join(''),
};

const BLOG = {
  base: '/blog/',
  label: 'Blog',
  posts: POSTS,
  heroPhoto: 'trip-japan-1',
  schemaType: 'BlogPosting',
  h1: 'Trip itineraries, <br><span class="grad-text">day by day</span>',
  indexHeading: 'Every trip report',
  lede: 'Day-by-day itineraries with the full route: which place on which day, how long each leg really takes, and what is worth changing if you have less time.',
  title: 'Travel itineraries — day-by-day trip reports | TravelStoryMaker',
  description: 'Day-by-day travel itineraries: Thailand, Japan, Cuba, the American Southwest, Greece, Spain, Slovenia, Dubai, Moscow and Lisbon.',
  aboutHtml: [
    '<h2>Why day by day</h2>',
    '<p>Most trip write-ups tell you a place was beautiful. That is not useful when you are trying to work out whether four days is enough for Slovenia, or how long the drive from Bryce to Moab actually takes. So these are structured as itineraries: what happens on day one, day two, day three, with real transfer times in a table at the end.</p>',
    '<p>They also include the mistakes worth avoiding — the permit that is easy not to know about, the four hours that the Alhambra does not fit into, the island to skip. Those are usually the most useful part.</p>',
    PROVENANCE_HTML,
    '<h2>Planning your own?</h2>',
    '<p>The <a href="/guides/">guides section</a> covers the mechanics that apply everywhere — <a href="/guides/how-to-book-a-cheap-flight/">booking flights</a>, <a href="/guides/how-to-rent-a-car-while-traveling/">renting a car</a>, <a href="/guides/where-to-stay-while-traveling/">where to stay</a>, <a href="/guides/which-travel-insurance-to-choose/">insurance</a> and <a href="/guides/shoulder-season/">choosing the season</a>.</p>',
  ].join(''),
  provenanceNote: 'A constructed itinerary, written in the first person. Not a travel diary.',
};

export function guidesIndex() { return postIndex(GUIDES); }
export function guidePages() { return postPages(GUIDES); }
export function blogIndex() { return postIndex(BLOG); }
export function blogPages() { return postPages(BLOG); }
