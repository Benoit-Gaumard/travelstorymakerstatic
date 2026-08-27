import { esc } from './layout.mjs';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FLAG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'img', 'flags');

const AVAILABLE = new Set(
  readdirSync(FLAG_DIR)
    .filter(function (name) { return name.endsWith('.png'); })
    .map(function (name) { return name.slice(0, -4); })
);

export function hasFlag(slug) {
  return AVAILABLE.has(slug);
}

/**
 * Flags are served as PNG rather than emoji: Windows Chrome and Edge ship no
 * regional-indicator glyphs, so emoji flags render as bare letter pairs there.
 */
export function flagImg(slug, countryTitle, opts) {
  if (!AVAILABLE.has(slug)) return '';
  const o = opts || {};
  const w = o.width || 72;
  const h = o.height || 48;
  return [
    '<img class="' + (o.className || 'flag') + '"',
    ' src="/assets/img/flags/' + slug + '.png"',
    ' alt="' + (o.decorative ? '' : 'Flag of ' + esc(countryTitle)) + '"',
    o.decorative ? ' aria-hidden="true"' : '',
    ' width="' + w + '" height="' + h + '"',
    ' loading="lazy" decoding="async">',
  ].join('');
}
