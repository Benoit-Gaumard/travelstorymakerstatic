import { esc } from './layout.mjs';
import PHOTOS from './generated/photos.json' with { type: 'json' };

export function photo(slot) {
  return PHOTOS[slot] || null;
}

export function hasPhoto(slot) {
  return Boolean(PHOTOS[slot]);
}

export const ALL_PHOTOS = PHOTOS;

/** Full-bleed hero background image with a dark scrim, used behind hero text. */
export function heroBackdrop(slot) {
  const p = photo(slot);
  if (!p) return '';
  return '<div class="hero__photo" aria-hidden="true"><img src="' + p.src + '" alt="" width="1200" height="675" loading="eager" fetchpriority="high" decoding="async"></div>';
}

/** Inline figure for article bodies and section headers. */
export function figure(slot, caption, opts) {
  const p = photo(slot);
  if (!p) return '';
  const o = opts || {};
  return [
    '<figure class="figure' + (o.wide ? ' figure--wide' : '') + '">',
    '<img src="' + p.src + '" alt="' + esc(p.alt) + '" width="1200" height="800" loading="' + (o.eager ? 'eager' : 'lazy') + '" decoding="async">',
    '<figcaption>',
    caption ? '<span>' + esc(caption) + '</span> ' : '',
    '<a href="/credits/">Photo: ' + esc(p.author) + '</a>',
    '</figcaption>',
    '</figure>',
  ].join('');
}

/** Small thumbnail used on cards and list tiles. */
export function thumb(slot, alt) {
  const p = photo(slot);
  if (!p) return '';
  return '<img class="thumb" src="' + p.src + '" alt="' + esc(alt || p.alt) + '" width="600" height="400" loading="lazy" decoding="async">';
}

export function licenseLabel(p) {
  if (!p.license) return 'Wikimedia Commons';
  if (p.license === 'CC0' || p.license === 'PDM') return p.license === 'CC0' ? 'CC0' : 'Public domain';
  return 'CC ' + p.license + (p.licenseVersion ? ' ' + p.licenseVersion : '');
}
