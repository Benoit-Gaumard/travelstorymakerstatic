import { page, esc, breadcrumbs, breadcrumbJsonLd, SITE } from '../layout.mjs';
import { ALL_PHOTOS, licenseLabel } from '../photos.mjs';

export function creditsPage() {
  const crumbs = [{ href: '/', label: 'Home' }, { href: '/credits/', label: 'Photo credits' }];
  const items = Object.keys(ALL_PHOTOS)
    .map(function (slot) { return ALL_PHOTOS[slot]; })
    .sort(function (a, b) { return a.slot < b.slot ? -1 : 1; });

  const rows = items.map(function (p) {
    const title = esc(p.alt || p.slot);
    const author = p.authorUrl
      ? '<a href="' + esc(p.authorUrl) + '" rel="nofollow noopener" target="_blank">' + esc(p.author) + '</a>'
      : esc(p.author);
    const link = p.link
      ? '<a href="' + esc(p.link) + '" rel="nofollow noopener" target="_blank">' + esc(p.source) + '</a>'
      : esc(p.source);
    const lic = p.licenseUrl
      ? '<a href="' + esc(p.licenseUrl) + '" rel="nofollow noopener" target="_blank">' + esc(licenseLabel(p)) + '</a>'
      : esc(licenseLabel(p));
    return [
      '<div class="credit-row">',
      '<img src="' + p.src + '" alt="" width="84" height="56" loading="lazy" decoding="async">',
      '<div class="credit-row__meta"><strong>' + title + '</strong>' + author + ' &middot; ' + link + '</div>',
      '<div class="credit-row__lic">' + lic + '</div>',
      '</div>',
    ].join('');
  }).join('');

  const body = [
    '<section class="hero hero--compact">',
    '<div class="hero__blobs" aria-hidden="true"><span class="hero__blob hero__blob--a"></span><span class="hero__blob hero__blob--b"></span></div>',
    '<div class="container hero__inner">',
    breadcrumbs(crumbs),
    '<h1>Photo credits</h1>',
    '<p class="hero__lede">Every photograph on this site is freely licensed and credited to the person who took it. ' + items.length + ' images, all self-hosted.</p>',
    '</div>',
    '</section>',
    '<section class="section">',
    '<div class="container">',
    '<div class="prose">',
    '<h2>Where the photographs come from</h2>',
    '<p>We do not have a staff photographer, so the images on this site come from Wikimedia Commons under Creative Commons and public domain licences. Every file below is credited to its photographer, links back to its original page, and states the licence it was released under.</p>',
    '<p>Images are downloaded, resized and served from our own domain rather than hotlinked, which is faster for you and kinder to the source. No image has been altered beyond resizing and compression.</p>',
    '<h3>If you are one of the photographers</h3>',
    '<p>Thank you. If a credit is wrong, incomplete, or you would prefer your work not to appear here, email <a href="mailto:' + SITE.email + '">' + SITE.email + '</a> and we will correct or remove it promptly, no argument needed.</p>',
    '<h3>Our own artwork</h3>',
    '<p>The logo, the icons and the social preview image are generated at build time from code in this repository and are copyright TravelStoryMaker.</p>',
    '</div>',
    '<h2 style="margin-top:48px;font-size:1.3rem">All images</h2>',
    '<div class="credits-list">' + rows + '</div>',
    '<p style="font-size:var(--fs-meta);color:var(--text-faint)">Licence abbreviations: CC0 and Public domain mean no rights reserved. CC BY requires attribution. CC BY-SA requires attribution and that derivative works carry the same licence.</p>',
    '</div>',
    '</section>',
  ].join('');

  return {
    path: '/credits/',
    html: page({
      path: '/credits/',
      title: 'Photo credits — TravelStoryMaker',
      description: 'Attribution and licence details for every photograph used on TravelStoryMaker, all freely licensed via Wikimedia Commons.',
      onDark: true,
      body,
      jsonLd: [breadcrumbJsonLd(crumbs)],
    }),
  };
}
