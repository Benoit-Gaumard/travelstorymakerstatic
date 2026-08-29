import { page, SITE, esc, adSlot, storyCta, SOCIALS } from '../layout.mjs';
import { entryCard, regionTile } from '../components.mjs';
import { ENTRIES, COUNT_BY_TYPE, REGIONS, COUNT_BY_REGION } from '../data/index.mjs';
import { COUNTRIES } from '../countries.mjs';

const HERO_ART = {
  src: '/assets/img/hero-travelstorymaker.png',
  width: 880,
  height: 660,
  alt: 'Illustration of a departing aeroplane, a globe, a suitcase, a folded map, a camera and a compass',
  /*
   * The illustration is the LCP element. It renders at 260px on phones, 340px on tablets and at
   * most 440px on desktop, so shipping the 880px file to every device wasted ~365KB on mobile and
   * was the single biggest cost in the mobile Lighthouse run. The widths below mirror the
   * breakpoints in .hero__art.
   *
   * WebP first, PNG fallback. The .webp files were produced from the .png ones with Chromium's own
   * canvas encoder rather than by adding an image dependency, and they are committed like every
   * other asset — the build does not generate them. See §6 of handoff.md.
   */
  webpSrcset: [
    '/assets/img/hero-travelstorymaker-560.webp 560w',
    '/assets/img/hero-travelstorymaker-720.webp 720w',
    '/assets/img/hero-travelstorymaker.webp 880w',
  ].join(', '),
  srcset: [
    '/assets/img/hero-travelstorymaker-560.png 560w',
    '/assets/img/hero-travelstorymaker-720.png 720w',
    '/assets/img/hero-travelstorymaker.png 880w',
  ].join(', '),
  sizes: '(max-width: 560px) 260px, (max-width: 1000px) 340px, 440px',
};

/** Single illustration that carries the hero. It is the LCP element, so it loads eagerly. */
function heroArt() {
  return [
    '<div class="hero__art">',
    '<span class="hero__art-glow" aria-hidden="true"></span>',
    '<picture>',
    '<source type="image/webp" srcset="' + HERO_ART.webpSrcset + '" sizes="' + HERO_ART.sizes + '">',
    '<img class="hero__art-img" src="' + HERO_ART.src + '" alt="' + esc(HERO_ART.alt) + '"',
    ' srcset="' + HERO_ART.srcset + '" sizes="' + HERO_ART.sizes + '"',
    ' width="' + HERO_ART.width + '" height="' + HERO_ART.height + '"',
    ' loading="eager" fetchpriority="high" decoding="async">',
    '</picture>',
    '</div>',
  ].join('');
}

const FAQS = [
  {
    q: 'What is TravelStoryMaker?',
    a: 'A free, independent reading library of short travel stories, quotes and fun facts, organised by continent and by type. Everything is on a plain web page: no account, no app, no paywall.',
  },
  {
    q: 'Does it cost anything?',
    a: 'No. The site is free to read and funded by advertising. There is nothing to sign up for and no email is collected to read an entry.',
  },
  {
    q: 'Where do the fun facts come from?',
    a: 'Each fact is written in-house and checked against public reference sources such as national statistics agencies, UNESCO listings, national park services and reputable encyclopaedias. Our editorial policy explains how we handle corrections.',
  },
  {
    q: 'Are the travel stories real?',
    a: 'They are short narrative vignettes based on the kinds of things that genuinely happen on the road: missed ferries, borrowed keys, meals that went on too long. They are written as reading material, not as verified reportage.',
  },
  {
    q: 'Can I use a quote or fact on my own site?',
    a: 'Quotes belong to the people who said them and are attributed here. Our own writing is protected by copyright, but a short excerpt with a visible link back to the page is welcome. See the terms of use for detail.',
  },
  {
    q: 'How do I find something specific?',
    a: 'Use the search box on any collection page. It filters the entries already on that page instantly, without a reload, because everything is rendered as plain HTML.',
  },
  {
    q: 'Why is the site so simple?',
    a: 'Because a page of text should load in under a second on a hotel wifi connection in a valley somewhere. Every page here is a static HTML file with one small stylesheet and one small script.',
  },
  {
    q: 'How do I report a mistake?',
    a: 'Send the entry number and the correction through the contact page. Confirmed factual errors are fixed and noted.',
  },
];

export function homePage() {
  const featured = [ENTRIES[16], ENTRIES[1004] || ENTRIES[520], ENTRIES[905] || ENTRIES[700], ENTRIES[311], ENTRIES[640], ENTRIES[820]].filter(Boolean).slice(0, 6);

  const regionTiles = ['europe', 'asia', 'africa', 'americas', 'oceania', 'polar']
    .map(regionTile)
    .join('');

  const faqMarkup = FAQS.map(function (f) {
    return '<details class="faq"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
  }).join('');

  const body = [
    '<section class="hero hero--split">',
    '<div class="hero__blobs" aria-hidden="true"><span class="hero__blob hero__blob--a"></span><span class="hero__blob hero__blob--b"></span><span class="hero__blob hero__blob--c"></span></div>',
    '<div class="hero__grid" aria-hidden="true"></div>',
    '<div class="container hero__inner hero__split">',
    '<div class="hero__copy">',
    '<span class="eyebrow"><span class="dot"></span>Free to read &middot; no account</span>',
    '<h1>Stories that make you <br><span class="grad-text">pack a bag</span></h1>',
    '<p class="hero__lede">Travel stories from the road, quotes that have been pushing people out of the door for two thousand years, and fun facts you will repeat at dinner. All on one page, all free, all loading in under a second.</p>',
    '<div class="hero__cta">',
    '<a class="btn btn--primary" href="/travelstories/">Read all &rarr;</a>',
    '<a class="btn btn--ghost" href="/destinations/">Browse by continent</a>',
    '<a class="btn btn--ghost" href="/destinations/#by-country">Browse by country</a>',
    '</div>',
    '</div>',
    heroArt(),
    '</div>',
    '<div class="container">',
    '<div class="stats">',
    '<div class="stat"><div class="stat__n">' + COUNT_BY_TYPE.story + '</div><div class="stat__l">Stories</div></div>',
    '<div class="stat"><div class="stat__n">' + COUNT_BY_TYPE.quote + '</div><div class="stat__l">Quotes</div></div>',
    '<div class="stat"><div class="stat__n">' + COUNT_BY_TYPE.fact + '</div><div class="stat__l">Fun facts</div></div>',
    '<div class="stat"><div class="stat__n">' + COUNTRIES.length + '</div><div class="stat__l">Countries</div></div>',
    '</div>',
    '</div>',
    '</section>',

    '<section class="section section--tight">',
    '<div class="container">',
    adSlot(),
    '</div>',
    '</section>',

    '<section class="section" style="padding-top:0">',
    '<div class="container">',
    '<div class="section-head section-head--center">',
    '<span class="eyebrow eyebrow--light">Three kinds of reading</span>',
    '<h2>Pick your mood, not your itinerary</h2>',
    '<p class="lead" style="margin-inline:auto">Some days you want a fact to win an argument. Some days you want a line that makes you open a flight search. Some days you just want somebody else\'s bad night at a bus station.</p>',
    '</div>',
    '<div class="grid grid--3">',
    '<a class="card" href="/travelstories/stories/" style="text-decoration:none;color:inherit">',
    '<div class="card__icon">🧭</div><h3>' + COUNT_BY_TYPE.story + ' travel stories</h3>',
    '<p>The missed ferry, the stranger who handed over a key, the meal that ran until midnight. Short, true to life, and over in thirty seconds.</p></a>',
    '<a class="card" href="/travelstories/quotes/" style="text-decoration:none;color:inherit">',
    '<div class="card__icon">✒️</div><h3>' + COUNT_BY_TYPE.quote + ' travel quotes</h3>',
    '<p>Stevenson, Twain, Basho, Rumi, Freya Stark, plus proverbs and the untranslatable words every traveller ends up needing.</p></a>',
    '<a class="card" href="/travelstories/fun-facts/" style="text-decoration:none;color:inherit">',
    '<div class="card__icon">🌍</div><h3>' + COUNT_BY_TYPE.fact + ' fun facts</h3>',
    '<p>Why Iceland has no mosquitoes, why Venice stands on a petrified forest, and why airline food tastes of nothing at altitude.</p></a>',
    '</div>',
    '</div>',
    '</section>',

    '<section class="section section--sand">',
    '<div class="container">',
    '<div class="section-head">',
    '<span class="eyebrow eyebrow--light">A taste of it</span>',
    '<h2>Six at random</h2>',
    '<p class="lead">A fair sample of what is waiting on the full page.</p>',
    '</div>',
    '<div class="entries">' + featured.map(entryCard).join('') + '</div>',
    '<p class="center mt-24"><a class="btn btn--outline" href="/travelstories/">Open the full library &rarr;</a></p>',
    '</div>',
    '</section>',

    storyCta({ tone: 'light' }),

    '<section class="section">',
    '<div class="container">',
    '<div class="section-head">',
    '<span class="eyebrow eyebrow--light">By continent</span>',
    '<h2>Where do you want to be right now?</h2>',
    '<p class="lead">Every entry is tagged to a continent, so you can read your way through one part of the world at a time.</p>',
    '</div>',
    '<div class="post-grid">' + regionTiles + '</div>',
    '<p class="center mt-24"><a class="btn btn--outline" href="/destinations/">See all destinations &rarr;</a></p>',
    '</div>',
    '</section>',

    '<section class="section section--ink">',
    '<div class="container">',
    '<div class="section-head section-head--center" style="max-width:760px">',
    '<span class="eyebrow">How it works</span>',
    '<h2>Three clicks, no sign-up, no app</h2>',
    '</div>',
    '<div class="grid grid--3 steps">',
    '<div class="step"><h3 style="color:#fff">Open a collection</h3><p>Everything, or just stories, quotes or fun facts, or a single continent.</p></div>',
    '<div class="step"><h3 style="color:#fff">Filter as you type</h3><p>The search box narrows the page instantly. No loading spinner, because nothing is loading.</p></div>',
    '<div class="step"><h3 style="color:#fff">Take one with you</h3><p>Copy a quote for a caption, keep a fact for a quiz, or let a story decide your next trip.</p></div>',
    '</div>',
    '</div>',
    '</section>',

    '<section class="section section--sand">',
    '<div class="container narrow">',
    '<div class="section-head section-head--center">',
    '<span class="eyebrow eyebrow--light">Questions</span>',
    '<h2>Frequently asked</h2>',
    '</div>',
    faqMarkup,
    '<p class="center mt-24"><a class="btn btn--outline" href="/faq/">Read the full FAQ &rarr;</a></p>',
    '</div>',
    '</section>',

    '<section class="section">',
    '<div class="container center">',
    adSlot(),
    '<h2 class="mt-24">Ready when you are</h2>',
    '<p class="lead" style="margin-inline:auto">One page. The whole library. Nothing to install.</p>',
    '<p class="mt-24"><a class="btn btn--primary" href="/travelstories/">Start reading &rarr;</a></p>',
    '</div>',
    '</section>',
  ].join('');

  return page({
    path: '/',
    title: 'TravelStoryMaker — travel stories, quotes and fun facts',
    description: 'A free library of short travel stories, travel quotes and fun facts about countries around the world, free to read with no account, no app and no paywall.',
    onDark: true,
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.url + '/',
        description: 'A free library of travel stories, quotes and fun facts.',
        inLanguage: 'en',
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url + '/', logo: SITE.url + '/assets/img/logo.svg' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url + '/',
        logo: SITE.url + '/icon-512.png',
        email: 'mailto:' + SITE.email,
        sameAs: SOCIALS.map(function (s) { return s.href; }),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(function (f) {
          return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } };
        }),
      },
    ],
  });
}

export { FAQS };
