import FONTS from './generated/fonts.json' with { type: 'json' };

export const SITE = {
  url: 'https://www.travelstorymaker.com',
  name: 'TravelStoryMaker',
  tagline: 'Stories that make you pack a bag',
  adsenseClient: 'ca-pub-6636684537203477',
  /*
   * Manual ad units, by name. Each value is the `data-ad-slot` of a unit created in
   * AdSense > Ads > By ad unit. They are deliberately empty until those units exist:
   * adSlot() renders nothing for an unset slot, because an <ins> pointing at a
   * non-existent slot is a permanently unfilled 0x0 box, and a run of empty ad
   * containers is exactly the "no content" pattern AdSense penalises.
   *
   * Fill these in and nothing else needs to change - the markup, the labels and the
   * reserved height are already wired up at every call site.
   *
   *   display    - responsive block used on the homepage and the prose/policy pages.
   *   inArticle  - fluid in-article unit, dropped mid-body on guides and trip reports.
   *   articleEnd - responsive block after the article body, before the author box.
   */
  adsenseSlots: {
    display: '',
    inArticle: '',
    articleEnd: '',
  },
  /*
   * GA4 measurement ID, in the form 'G-XXXXXXXXXX'. Empty is a supported state and the current
   * one: no tag is emitted, no third-party request is made, and the analytics paragraphs of
   * /privacy/ and /cookies/ describe the site as analytics-free.
   *
   * Put a real ID here and rebuild - the tag, the Consent Mode defaults, the preconnect, and the
   * policy wording all switch on together. Never put an example or a staging ID here: this value
   * ships to every page in production.
   */
  analyticsId: '',
  email: 'travelstorymaker@gmail.com',
  locale: 'en',
  /*
   * Seed date for the very first run of the <lastmod> tracker (src/lastmod.mjs), and nothing else.
   * It used to be the fallback <lastmod> for every page that carried no date of its own, which
   * meant 93 of 113 URLs shared it and it was only ever correct if somebody remembered to bump it.
   * Dates now come from the committed manifest in src/generated/lastmod.json, which the build
   * updates when a page's content actually changes. Do not bump this by hand, and do not wire it
   * to the clock.
   */
  contentUpdated: '2026-08-28',
};

export const AUTHOR = {
  name: 'Benoit Ga',
  role: 'Founder and editor',
  short: 'Benoit Ga',
  bio: 'Benoit Ga is a software engineer and lifelong traveller. He founded TravelStoryMaker to collect the kind of travel writing he wanted to read on a slow connection in a place he could not pronounce: short, checked, and free of preamble.',
  url: 'https://www.travelstorymaker.com/about/#author',
  /*
   * There is deliberately no `sameAs`. It used to point at github.com/Benoit-Gaumard, which put
   * the full surname into roughly twenty JSON-LD blocks while every visible byline on the site
   * says "Benoit Ga". Publishing under a shortened name and then linking a profile that spells it
   * out is not a half-measure, it is no measure. If an external identity is wanted later, add a
   * profile that carries the published name.
   */
};

export function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * True when a real GA4 measurement ID is configured. Page modules use this so that the analytics
 * wording in /privacy/ and /cookies/ can never claim a tag the build did not actually emit.
 */
export function hasAnalytics() {
  return /^G-[A-Z0-9]{4,}$/.test(String(SITE.analyticsId || '').trim());
}

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/*
 * Ordered for the visitor, not for the site. Destinations first, because the confirmed primary
 * user arrives with a country in mind. "Home" is gone because the logo already goes there, and
 * seven items was past the point where a menu gets scanned rather than read. "Propose a story"
 * held the most prominent slot on every page for an action almost no visitor came to perform;
 * it now lives in the footer and in the call-to-action band, where it is still well linked.
 */
const NAV = [
  { href: '/destinations/', label: 'Destinations' },
  { href: '/guides/', label: 'Guides' },
  { href: '/blog/', label: 'Trip reports' },
  { href: '/travelstories/', label: 'Stories' },
  { href: '/about/', label: 'About' },
];

export const SOCIALS = [
  { name: 'TikTok', href: 'https://www.tiktok.com/@travelstorymakert', icon: 'M21 8.2a6.9 6.9 0 0 1-4.3-1.5v7.1a5.9 5.9 0 1 1-5-5.8v2.7a3.2 3.2 0 1 0 2.3 3V2h2.7a4.2 4.2 0 0 0 4.3 3.7z' },
  { name: 'Instagram', href: 'https://www.instagram.com/travelstorymaker/', icon: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.9 3.9 0 0 1-2.3 2.3c-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-2.3-2.3c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.1A6.7 6.7 0 1 0 18.7 12 6.7 6.7 0 0 0 12 5.3zm0 11A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.2a1.6 1.6 0 1 1-1.6-1.6 1.6 1.6 0 0 1 1.6 1.6z' },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590448396110', icon: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z' },
  { name: 'X', href: 'https://x.com/travelstorymake', icon: 'M17.5 3h3.1l-6.8 7.8L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.2 3h6.3l4.4 5.8zm-1.1 16.1h1.7L7.7 4.8H5.9z' },
  { name: 'YouTube', href: 'https://www.youtube.com/@travelstorymaker', icon: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.1V8.9l5.2 3.1z' },
];

function socialLinks() {
  return [
    '<ul class="socials" aria-label="Follow TravelStoryMaker">',
    SOCIALS.map(function (s) {
      return '<li><a href="' + s.href + '" rel="me noopener" target="_blank" title="' + esc(s.name) + '" aria-label="' + esc(s.name) + '">'
        + '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + s.icon + '"/></svg>'
        + '</a></li>';
    }).join(''),
    '</ul>',
  ].join('');
}

function navMarkup(current, onDark) {
  const links = NAV.map(function (item) {
    const active = item.href === current ? ' aria-current="page"' : '';
    const cls = item.cta ? ' class="nav__cta"' : '';
    return '<a href="' + item.href + '"' + cls + active + '>' + esc(item.label) + '</a>';
  }).join('');
  return [
    '<header class="site-header' + (onDark ? ' site-header--on-dark' : '') + '" id="top">',
    '<div class="container">',
    '<a class="brand" href="/">',
    '<img class="brand__mark" src="/assets/img/logo.svg" alt="" width="34" height="34" loading="eager" decoding="async">',
    '<span>TravelStory<span style="opacity:.65">Maker</span></span>',
    '</a>',
    '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav"><span></span></button>',
    '<nav class="nav" id="primary-nav" aria-label="Main">' + links + '</nav>',
    '</div>',
    '</header>',
  ].join('');
}

function footerMarkup() {
  return [
    '<footer class="site-footer">',
    '<div class="container">',
    '<div class="footer-grid">',
    '<div>',
    '<a class="brand" href="/"><img class="brand__mark" src="/assets/img/logo.svg" alt="" width="34" height="34" loading="lazy" decoding="async"><span>TravelStoryMaker</span></a>',
    '<p style="font-size:var(--fs-meta);max-width:34ch">A free, independent library of travel stories, quotes and fun facts. No account, no paywall, no app.</p>',
    '<p style="font-size:var(--fs-meta)"><a href="/submit/">Propose your travel story &rarr;</a></p>',
    socialLinks(),
    '</div>',
    '<div><h2 class="footer-col__title">Read</h2><ul>',
    '<li><a href="/travelstories/">All entries</a></li>',
    '<li><a href="/guides/">Travel guides</a></li>',
    '<li><a href="/blog/">Blog</a></li>',
    '<li><a href="/travelstories/stories/">Travel stories</a></li>',
    '<li><a href="/travelstories/quotes/">Travel quotes</a></li>',
    '<li><a href="/travelstories/fun-facts/">Fun facts</a></li>',
    '<li><a href="/destinations/">Destinations</a></li>',
    '</ul></div>',
    '<div><h2 class="footer-col__title">Site</h2><ul>',
    '<li><a href="/submit/">Propose a story</a></li>',
    '<li><a href="/about/">About</a></li>',
    '<li><a href="/contact/">Contact</a></li>',
    '<li><a href="/faq/">FAQ</a></li>',
    '<li><a href="/credits/">Photo credits</a></li>',
    '<li><a href="/sitemap.xml">Sitemap</a></li>',
    '<li><a href="/feed.xml">RSS feed</a></li>',
    '</ul></div>',
    '<div><h2 class="footer-col__title">Legal</h2><ul>',
    '<li><a href="/privacy/">Privacy policy</a></li>',
    '<li><a href="/terms/">Terms of use</a></li>',
    '<li><a href="/cookies/">Cookie policy</a></li>',
    '<li><a href="/disclaimer/">Disclaimer</a></li>',
    '<li><a href="/editorial-policy/">Editorial policy</a></li>',
    '</ul></div>',
    '</div>',
    '<div class="footer-bottom">',
    '<span>&copy; <span data-year>2026</span> TravelStoryMaker. All rights reserved.</span>',
    '<span>Made for people who read timetables for fun.</span>',
    '</div>',
    '</div>',
    '</footer>',
    '<a class="back-to-top" href="#top" aria-label="Back to top" title="Back to top">',
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6"/></svg>',
    '</a>',
    /*
     * No hand-rolled cookie banner. Consent is handled by Google's certified CMP
     * (AdSense > Privacy & messaging), which adsbygoogle.js loads from
     * fundingchoicesmessages.google.com. A second homemade notice would show two banners,
     * and a notice-only "Got it" button is not valid consent under GDPR anyway.
     */
  ].join('');
}

/**
 * Google truncates titles at roughly 60 characters, so anything past that is invisible in the
 * SERP and the brand suffix is what usually gets cut. Rather than hand-tuning 66 titles, drop
 * " | TravelStoryMaker" whenever keeping it would push the title over the limit.
 *
 * This only ever shortens: a title that does not already carry the brand is left untouched, and
 * the site name is still available to Google through the WebSite JSON-LD, which is what it uses
 * to render the site name beside the title anyway.
 */
export function fitTitle(raw) {
  const brand = ' | ' + SITE.name;
  if (!String(raw).includes(brand)) return raw;
  const bare = String(raw).split(brand).join('');
  return bare.length + brand.length <= 60 ? bare + brand : bare;
}

/**
 * Google renders roughly 155-160 characters of a description. Over-long ones are not an error,
 * but the tail is invisible, so the snippet ends mid-thought.
 *
 * This trims only at a sentence boundary, never mid-sentence, and only when what remains is
 * still a usable description. Country pages read "N stories, quotes and fun facts about X. <lede>",
 * where cutting the lede leaves a thin 59-character stub - worse in the SERP than a 179-character
 * description Google simply truncates. So a cut that lands under 120 characters is discarded and
 * the original text is kept.
 */
export function fitDescription(raw) {
  const text = String(raw);
  if (text.length <= 160) return text;
  const head = text.slice(0, 161);
  const cut = Math.max(head.lastIndexOf('. '), head.lastIndexOf('? '), head.lastIndexOf('! '));
  if (cut < 0) return text;
  const trimmed = text.slice(0, cut + 1);
  return trimmed.length >= 120 ? trimmed : text;
}

/*
 * Open Graph cards, one per page.
 *
 * `page()` registers the card it needs and returns the URL for it; `build.mjs` drains the registry
 * afterwards and renders the PNGs. The alternative was threading an `og:` option through all
 * eleven page modules by hand, which is more code and one more thing to forget when a page is
 * added. The trade-off is that `page()` now has a side effect - it is a build-time generator, and
 * the registry is write-once per path, so rendering the same page twice is harmless.
 *
 * What does NOT get its own card:
 *   - the homepage, which keeps the detailed painterly /og-image.png;
 *   - paginated collection pages, which point at their own page 1 - "part 4 of 10" is not a
 *     distinctive share image, and it would be nine extra renders per collection;
 *   - 404, which is noindex.
 */
const OG_REGISTRY = new Map();

export function ogRegistry() {
  return OG_REGISTRY;
}

const OG_SECTIONS = [
  { test: /^\/guides\//, theme: 'guide', kicker: 'Travel guide' },
  { test: /^\/blog\//, theme: 'trip', kicker: 'Trip report' },
  { test: /^\/destinations\//, theme: 'country', kicker: 'Destination' },
  { test: /^\/travelstories\//, theme: 'library', kicker: 'Collection' },
];

function ogCardFor(path, title) {
  if (path === '/' || path.endsWith('.html')) return null;

  const canonicalPath = path.replace(/page\/\d+\/$/, '');
  const section = OG_SECTIONS.find(function (s) { return s.test.test(canonicalPath); });
  const slug = canonicalPath.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
  const url = '/og/' + slug + '.png';

  if (!OG_REGISTRY.has(url) && canonicalPath === path) {
    OG_REGISTRY.set(url, {
      title: String(title).split(' | ')[0].split(' - part ')[0],
      kicker: section ? section.kicker : '',
      theme: section ? section.theme : 'page',
    });
  }
  return url;
}

/**
 * @param {{title:string,description:string,path:string,body:string,onDark?:boolean,jsonLd?:object[],noindex?:boolean,image?:string,preload?:string}} opts
 */
export function page(opts) {
  const canonical = SITE.url + opts.path;
  const title = fitTitle(opts.title);
  const description = fitDescription(opts.description);
  const image = SITE.url + (opts.image || ogCardFor(opts.path, opts.title) || '/og-image.png');
  /* fitTitle() keeps the brand on short titles and drops it on long ones, so only add it when it went. */
  const imageAlt = title.includes(SITE.name) ? title : title + ' - ' + SITE.name;
  const jsonLd = (opts.jsonLd || [])
    .map(function (obj) {
      return '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
    })
    .join('');

  /*
   * A noindex page carries no ads. In practice that is the 404, and running the ad stack there
   * means requesting ads against a page whose entire content is "this does not exist" - a page
   * with no content to match against, which is the sort of inventory AdSense asks publishers not
   * to create. It also spares the visitor who just hit a dead link ~390KB of third-party
   * JavaScript and a consent dialog on a page they are about to leave.
   */
  const monetised = !opts.noindex;

  return [
    '<!DOCTYPE html>',
    '<html lang="' + SITE.locale + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + esc(title) + '</title>',
    '<meta name="description" content="' + esc(description) + '">',
    opts.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">',
    '<link rel="canonical" href="' + esc(canonical) + '">',
    '<meta name="author" content="' + esc(SITE.name) + '">',
    '<meta property="og:type" content="' + (opts.path === '/' ? 'website' : 'article') + '">',
    '<meta property="og:site_name" content="' + esc(SITE.name) + '">',
    '<meta property="og:locale" content="en_US">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(description) + '">',
    '<meta property="og:url" content="' + esc(canonical) + '">',
    '<meta property="og:image" content="' + image + '">',
    '<meta property="og:image:secure_url" content="' + image + '">',
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="' + esc(imageAlt) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(title) + '">',
    '<meta name="twitter:description" content="' + esc(description) + '">',
    '<meta name="twitter:image" content="' + image + '">',
    '<meta name="twitter:image:alt" content="' + esc(imageAlt) + '">',
    '<meta name="theme-color" content="#070b1a">',
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    '<link rel="alternate" type="application/rss+xml" title="' + esc(SITE.name) + ' - guides and trip reports" href="/rss.xml">',
    '<link rel="alternate" type="application/atom+xml" title="' + esc(SITE.name) + ' - guides and trip reports" href="/feed.xml">',
    /*
     * The AdSense loader and Google's consent message are the two blocking third-party origins on
     * every monetised page. Warming their connections early is worth roughly 300ms of LCP on mobile.
     * fonts.gstatic.com is here because Google's consent dialog pulls its own webfonts from it, so
     * all three go away together when the page carries no ads.
     */
    monetised ? '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>' : '',
    monetised ? '<link rel="preconnect" href="https://fundingchoicesmessages.google.com" crossorigin>' : '',
    monetised ? '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' : '',
    /*
     * Analytics is not monetisation: the tag ships on every page, including the unmonetised ones,
     * so this preconnect is gated on the measurement ID alone rather than on `monetised`.
     */
    hasAnalytics() ? '<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>' : '',
    opts.preload || '',
    fontPreloads(),
    '<style>' + fontFaceCss() + '</style>',
    '<link rel="stylesheet" href="/assets/css/style.css">',
    analyticsLoader(),
    monetised ? adsLoader() : '',
    jsonLd,
    '</head>',
    '<body>',
    '<a class="skip-link" href="#main">Skip to content</a>',
    navMarkup(opts.path, !!opts.onDark),
    '<main id="main">',
    opts.body,
    '</main>',
    footerMarkup(),
    '<script src="/assets/js/app.js" defer></script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

/*
 * Google Analytics 4, consent-aware and off the critical path.
 *
 * Returns an empty string unless SITE.analyticsId holds a real G- measurement ID, so the default
 * build ships no analytics at all rather than a broken or example tag.
 *
 * Two parts, and the order matters:
 *
 *  1. An inline stub that creates dataLayer and sets Consent Mode v2 *defaults* before any Google
 *     script exists. Storage is denied by default across the EEA, the UK and Switzerland, so no
 *     analytics or advertising cookie is written there until Google's certified CMP - the same one
 *     AdSense already loads - calls consent update with the visitor's choice. Outside those
 *     regions the defaults are granted, matching how the ad stack already behaves. Setting the
 *     defaults inline is mandatory: a default that arrives after gtag.js has run is ignored, which
 *     is the usual way a "consent-gated" tag turns out not to be gated at all.
 *
 *  2. The gtag.js request itself, deferred exactly like adsLoader() below, because it is a third
 *     party competing with the stylesheet, the font and the LCP image for a phone's first
 *     connections. Deferring costs nothing in accuracy: the page_view is queued in dataLayer at
 *     parse time and sent as soon as the library arrives.
 *
 * `ads_data_redaction` keeps ad clicks cookieless while consent is denied. There is no route-change
 * page_view handler because there are no client-side routes - every page is a document load.
 */
function analyticsLoader() {
  if (!hasAnalytics()) return '';
  const id = String(SITE.analyticsId).trim();
  const eea = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS',
    'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    'GB', 'CH'];
  const js = [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'gtag("consent","default",{region:' + JSON.stringify(eea) + ',',
    'ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",',
    'analytics_storage:"denied",wait_for_update:500});',
    'gtag("consent","default",{ad_storage:"granted",ad_user_data:"granted",',
    'ad_personalization:"granted",analytics_storage:"granted"});',
    'gtag("set","ads_data_redaction",true);',
    'gtag("js",new Date());',
    'gtag("config","' + id + '");',
    '(function(){var done=false;function go(){if(done)return;done=true;',
    'var s=document.createElement("script");s.async=true;',
    's.src="https://www.googletagmanager.com/gtag/js?id=' + id + '";',
    'document.head.appendChild(s);}',
    'if(document.readyState==="complete")go();',
    'else window.addEventListener("load",go,{once:true});',
    'setTimeout(go,3000);})();',
  ].join('');
  return '<script>' + js + '</script>';
}

/*
 * AdSense, off the critical path.
 *
 * `adsbygoogle.js` used to sit in <head> as a plain async script. Async does not mean free: the
 * request is issued during the initial parse, it competes with the stylesheet, the font and the
 * LCP image for a phone's first connections, and it pulls in the Funding Choices bundle plus the
 * ad-quality script behind it - roughly 390KB and 130ms of main-thread work measured by
 * PageSpeed, all of it before the hero has painted.
 *
 * This injects exactly the same tag, unmodified, once the page has loaded. Nothing about consent
 * changes: the consent message is still served by Google's certified CMP, which this script loads
 * itself, in the same order as before, only later. It is deliberately NOT gated on consent by us -
 * that decision belongs to Google's CMP, and gating it here would break the ad stack for the
 * majority of visitors who are outside the EEA and never see a message at all.
 *
 * The three triggers are belt and braces: load, first interaction, and a hard ceiling so that a
 * visitor on a stalled connection still gets the consent dialog in a reasonable time.
 *
 * The delays used to be 1s after load with a 4s ceiling. That protected the LCP well and cost
 * impressions: every visitor who left before the tag fired counted as a page view with no ad
 * request behind it, and on mobile that is a real share of sessions. 200ms still clears the
 * critical path - load has already fired, so the stylesheet, the font and the LCP image are in -
 * while the 2s ceiling bounds the loss on a slow connection. Do not push these back up without
 * checking what it does to impressions, and do not drop them to zero either: moving the tag back
 * into the parse is what cost ~390KB and ~130ms of main-thread work before the hero painted.
 */
function adsLoader() {
  const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + SITE.adsenseClient;
  const js = [
    '(function(){var done=false;function go(){if(done)return;done=true;',
    'var s=document.createElement("script");s.async=true;s.crossOrigin="anonymous";',
    's.src="' + src + '";document.head.appendChild(s);}',
    'function soon(){setTimeout(go,200);}',
    'if(document.readyState==="complete")soon();',
    'else window.addEventListener("load",soon,{once:true});',
    'var ev=["pointerdown","keydown","touchstart","wheel","scroll"];',
    'for(var i=0;i<ev.length;i++)window.addEventListener(ev[i],go,{once:true,passive:true});',
    'setTimeout(go,2000);})();',
  ].join('');
  return '<script>' + js + '</script>';
}

export function fontFaceCss() {
  return FONTS.map(function (f) {
    return [
      '@font-face{',
      "font-family:'" + f.family + "';",
      'font-style:' + f.style + ';',
      'font-weight:' + f.weight + ';',
      'font-display:swap;',
      "src:url('" + f.href + "') format('woff2');",
      'unicode-range:' + f.range + ';',
      '}',
    ].join('');
  }).join('\n');
}

function fontPreloads() {
  /*
   * Public Sans ships as one variable file covering 400-800, so a single preload now covers every
   * weight above the fold - the body copy, the nav and the h1 - instead of the two static faces
   * this used to list. Newsreader is deliberately not preloaded: it is a display face, it appears
   * below the h1 on most pages, and preloading it would compete with the LCP image for bandwidth.
   */
  return FONTS.filter(function (f) {
    return f.family === 'Public Sans';
  }).map(function (f) {
    return '<link rel="preload" href="' + f.href + '" as="font" type="font/woff2" crossorigin>';
  }).join('');
}

export function breadcrumbs(items, light) {
  const parts = items.map(function (item, i) {
    if (i === items.length - 1) return '<span aria-current="page">' + esc(item.label) + '</span>';
    return '<a href="' + item.href + '">' + esc(item.label) + '</a>';
  });
  return '<nav class="crumbs' + (light ? ' crumbs--light' : '') + '" aria-label="Breadcrumb">' + parts.join(' <span aria-hidden="true">/</span> ') + '</nav>';
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(function (item, i) {
      return { '@type': 'ListItem', position: i + 1, name: item.label, item: SITE.url + item.href };
    }),
  };
}

/*
 * One manual ad unit.
 *
 * Returns an empty string unless the named slot carries a real `data-ad-slot`, so the site
 * degrades to "no ad" rather than to an empty box - see SITE.adsenseSlots.
 *
 * The container reserves its height in CSS before the ad arrives. That matters more here than
 * on a normal site: adsbygoogle.js is injected late (see adsLoader), so an unreserved slot
 * would push the article down several hundred pixels well after the text has been painted,
 * which is the worst kind of CLS. The label is there because AdSense requires ads to be
 * distinguishable from content; it is deliberately the neutral wording Google asks for, with
 * nothing that could read as an invitation to click.
 *
 * `(adsbygoogle = window.adsbygoogle || []).push({})` queues into a plain array when the
 * library has not loaded yet, and adsbygoogle.js drains that queue on arrival. The deferred
 * loader is therefore safe: the push runs at parse time, the fill happens later.
 *
 * @param {'display'|'inArticle'|'articleEnd'} name
 */
export function adSlot(name) {
  const slot = SITE.adsenseSlots[name || 'display'];
  if (!slot) return '';

  const inArticle = name === 'inArticle';
  const ins = [
    '<ins class="adsbygoogle"',
    ' style="display:block' + (inArticle ? ';text-align:center' : '') + '"',
    inArticle ? ' data-ad-layout="in-article" data-ad-format="fluid"' : ' data-ad-format="auto" data-full-width-responsive="true"',
    ' data-ad-client="' + SITE.adsenseClient + '"',
    ' data-ad-slot="' + slot + '"></ins>',
  ].join('');

  return [
    '<div class="ad-slot ad-slot--' + (inArticle ? 'in-article' : 'block') + '">',
    '<span class="ad-slot__label">Advertisement</span>',
    ins,
    '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    '</div>',
  ].join('');
}

const SUBMIT_SUBJECT = 'Travel story submission';
const SUBMIT_BODY = [
  'Where it happened (town and country):',
  '',
  'When (roughly):',
  '',
  'Your story (a few sentences is plenty):',
  '',
  '',
  'A name to publish it under (or say "anonymous"):',
  '',
  '---',
  'I confirm this story is my own, that it is true to the best of my memory,',
  'and that TravelStoryMaker may edit it for length and publish it for free on the site.',
].join('\n');

export const SUBMIT_MAILTO =
  'mailto:' + SITE.email +
  '?subject=' + encodeURIComponent(SUBMIT_SUBJECT) +
  '&body=' + encodeURIComponent(SUBMIT_BODY);

/**
 * "Propose your travel story" call to action.
 * @param {{tone?: 'light'|'dark', compact?: boolean, current?: string}} [opts]
 */
export function storyCta(opts) {
  const o = opts || {};
  if (o.current === '/submit/') return '';
  const dark = o.tone === 'dark';
  const primaryHref = o.current === '/submit/' ? SUBMIT_MAILTO : '/submit/';
  return [
    '<section class="cta-band' + (dark ? ' cta-band--dark' : '') + (o.compact ? ' cta-band--compact' : '') + '">',
    '<div class="container cta-band__inner">',
    '<div class="cta-band__text">',
    '<span class="eyebrow ' + (dark ? '' : 'eyebrow--light') + '"><span class="dot"></span>Your turn</span>',
    '<h2>Propose your travel story</h2>',
    '<p>The missed ferry. The stranger who handed over a key. The meal that ran until midnight. If something happened to you on the road and you still think about it, send it - a few sentences is plenty, and we do the tidying up.</p>',
    '</div>',
    '<div class="cta-band__actions">',
    '<a class="btn btn--primary" href="' + primaryHref + '">Propose your travel story</a>',
    '<a class="btn ' + (dark ? 'btn--ghost' : 'btn--outline') + '" href="' + SUBMIT_MAILTO + '">Email it straight away</a>',
    '<span class="cta-band__note">Free &middot; No account &middot; You keep the copyright</span>',
    '</div>',
    '</div>',
    '</section>',
  ].join('');
}
