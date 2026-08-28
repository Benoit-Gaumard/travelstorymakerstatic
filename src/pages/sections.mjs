import { esc, AUTHOR } from '../layout.mjs';
import { postIndex, postPages } from './posts.mjs';
import { ARTICLES } from '../articles/index.mjs';
import { POSTS } from '../blog/index.mjs';

const GUIDES = {
  base: '/guides/',
  label: 'Guides',
  posts: ARTICLES,
  heroPhoto: 'art-train',
  schemaType: 'Article',
  h1: 'Travel guides<br><span class="grad-text">written by someone who got it wrong first</span>',
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
  h1: 'Trips I actually took,<br><span class="grad-text">day by day</span>',
  lede: 'Trip reports with the full itinerary: where I went on which day, how long each leg really took, what it cost me in time, and the things I would change if I went back.',
  title: 'Travel blog — day-by-day trip reports and itineraries | TravelStoryMaker',
  description: 'Day-by-day travel itineraries: Thailand, Japan, Cuba, the American Southwest, Greece, Spain, Slovenia, Dubai, Moscow and Lisbon.',
  aboutHtml: [
    '<h2>Why day by day</h2>',
    '<p>Most trip write-ups tell you a place was beautiful. That is not useful when you are trying to work out whether four days is enough for Slovenia, or how long the drive from Bryce to Moab actually takes. So these are structured as itineraries: what happened on day one, day two, day three, with real transfer times in a table at the end.</p>',
    '<p>They also include the mistakes. The permit I did not know existed, the four hours I gave the Alhambra when it needed five, the island I should have skipped. Those are usually the most useful part.</p>',
    '<h2>Planning your own?</h2>',
    '<p>The <a href="/guides/">guides section</a> covers the mechanics that apply everywhere — <a href="/guides/how-to-book-a-cheap-flight/">booking flights</a>, <a href="/guides/how-to-rent-a-car-while-traveling/">renting a car</a>, <a href="/guides/where-to-stay-while-traveling/">where to stay</a>, <a href="/guides/which-travel-insurance-to-choose/">insurance</a> and <a href="/guides/shoulder-season/">choosing the season</a>.</p>',
  ].join(''),
};

export function guidesIndex() { return postIndex(GUIDES); }
export function guidePages() { return postPages(GUIDES); }
export function blogIndex() { return postIndex(BLOG); }
export function blogPages() { return postPages(BLOG); }
