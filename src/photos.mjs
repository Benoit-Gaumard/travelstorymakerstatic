import { esc } from './layout.mjs';
import PHOTOS from './generated/photos.json' with { type: 'json' };
import VARIANTS from './generated/photo-variants.json' with { type: 'json' };

export function photo(slot) {
  return PHOTOS[slot] || null;
}

export function hasPhoto(slot) {
  return Boolean(PHOTOS[slot]);
}

export const ALL_PHOTOS = PHOTOS;

/*
 * Every photo ships as the original Wikimedia JPEG plus WebP copies at 320, 640 and 1280px wide.
 * The JPEGs were the site's real page weight: PageSpeed put "improve image delivery" at 1,846KB on
 * desktop, and a country page was sending a 400-600KB backdrop to a phone that painted it 412px
 * wide behind a 60% dark scrim. The WebP ladder averages 13KB / 53KB / 190KB.
 *
 * The variants are committed, produced with Chromium's canvas encoder exactly like the hero
 * illustration - the build never re-encodes anything. See handoff.md §6.1.
 *
 * The JPEG stays as the <img> fallback rather than being deleted: it is what the credits page
 * attributes, and a <picture> costs nothing for the browsers that cannot take WebP.
 */
function variantsFor(src) {
  const name = src.split('/').pop().replace(/\.jpg$/, '');
  return VARIANTS[name] || null;
}

/**
 * @param {string} src   original .jpg path
 * @param {number[]} widths  which committed widths to offer
 */
function webpSrcset(src, widths) {
  const list = variantsFor(src);
  if (!list) return null;
  const base = src.replace(/\.jpg$/, '');
  const picked = list.filter(function (v) { return widths.includes(v.width); });
  if (!picked.length) return null;
  return picked.map(function (v) { return base + '-' + v.width + '.webp ' + v.width + 'w'; }).join(', ');
}

/** Wraps an <img> in a <picture> with a WebP source. `picture { display: contents }` keeps layout identical. */
function picture(src, widths, sizes, img) {
  const srcset = webpSrcset(src, widths);
  if (!srcset) return img;
  return '<picture><source type="image/webp" srcset="' + srcset + '" sizes="' + sizes + '">' + img + '</picture>';
}

/**
 * Full-bleed hero background image with a dark scrim, used behind hero text.
 *
 * The `sizes` here deliberately under-declares on phones: 640px for any viewport up to 900px, even
 * at DPR 3. The image sits at 42% opacity under a near-opaque gradient with the h1 on top of it, so
 * the extra detail of the 1280 file is invisible and costs about 140KB on the LCP request of every
 * guide, trip report and country page. Do not "correct" this to 100vw.
 */
export function heroBackdrop(slot) {
  const p = photo(slot);
  if (!p) return '';
  const img = '<img src="' + p.src + '" alt="" width="1200" height="675" loading="eager" fetchpriority="high" decoding="async">';
  return '<div class="hero__photo" aria-hidden="true">'
    + picture(p.src, [640, 1280], '(max-width: 900px) 640px, 1280px', img)
    + '</div>';
}

/** Inline figure for article bodies and section headers. */
export function figure(slot, caption, opts) {
  const p = photo(slot);
  if (!p) return '';
  const o = opts || {};
  const img = '<img src="' + p.src + '" alt="' + esc(p.alt) + '" width="1200" height="800" loading="'
    + (o.eager ? 'eager' : 'lazy') + '" decoding="async">';
  return [
    '<figure class="figure' + (o.wide ? ' figure--wide' : '') + '">',
    picture(p.src, [640, 1280], '(max-width: 760px) 94vw, 720px', img),
    '<figcaption>',
    caption ? '<span>' + esc(caption) + '</span> ' : '',
    '<a href="/credits/">Photo: ' + esc(p.author) + '</a>',
    '</figcaption>',
    '</figure>',
  ].join('');
}

/** Small thumbnail used on cards and list tiles. Never larger than 640px wide. */
export function thumb(slot, alt) {
  const p = photo(slot);
  if (!p) return '';
  const img = '<img class="thumb" src="' + p.src + '" alt="' + esc(alt || p.alt) + '" width="600" height="400" loading="lazy" decoding="async">';
  return picture(p.src, [320, 640], '(max-width: 640px) 94vw, 380px', img);
}

/** 84x56 attribution thumbnail on the credits page, where 97 of them share one page. */
export function creditThumb(slot) {
  const p = photo(slot);
  if (!p) return '';
  const img = '<img src="' + p.src + '" alt="" width="84" height="56" loading="lazy" decoding="async">';
  return picture(p.src, [320], '84px', img);
}

export function licenseLabel(p) {
  if (!p.license) return 'Wikimedia Commons';
  if (p.license === 'CC0' || p.license === 'PDM') return p.license === 'CC0' ? 'CC0' : 'Public domain';
  return 'CC ' + p.license + (p.licenseVersion ? ' ' + p.licenseVersion : '');
}
