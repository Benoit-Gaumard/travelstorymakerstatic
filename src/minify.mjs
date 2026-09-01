/*
 * A deliberately small CSS minifier, applied when public/ is copied into dist/.
 *
 * PageSpeed flags the stylesheet as unminified. It is 40KB of hand-written CSS carrying a lot of
 * explanatory comments, and those comments are the reason the file is the way it is - they belong
 * in the source and not in the response body.
 *
 * The rules here are the safe subset only. It does not touch colours, does not merge or reorder
 * rules, does not drop units and does not try to understand selectors. In particular it never
 * removes whitespace around `-` or `+`, because `calc(100% - 60px)` breaks without them, and it
 * tracks strings and url() so a `/*` inside `content: '...'` is never mistaken for a comment.
 *
 * Verified by counting the parsed CSSOM rules of the original and the minified file in the browser:
 * if the two do not match, the minifier has eaten something.
 */

/*
 * Whitespace may be dropped when it touches one of these. `)` is deliberately absent from
 * TIGHT_BEFORE and `(` from TIGHT_AFTER: `@media (max-width:900px) and (min-width:600px)` needs
 * the space around `and`, and squeezing it out is the classic way a hand-rolled minifier breaks a
 * media query. A leading space before `:` is kept too, because `.card :focus` is a descendant
 * selector and `.card:focus` is not.
 */
const TIGHT_BEFORE = new Set(['{', '}', ';', ',', ':', '>', '(']);
const TIGHT_AFTER = new Set(['{', '}', ';', ',', '>', ')']);

export function minifyCss(css) {
  let out = '';
  let i = 0;
  const n = css.length;

  while (i < n) {
    const ch = css[i];

    // Comment
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }

    // String literal - copied verbatim, escapes included
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      /*
       * Count the backslash run, do not just look at the previous character: in `content: "\\"`
       * the quote is a real terminator, and treating it as escaped runs the scanner on to the next
       * quote in the file. That flips quote parity for everything after it, and the *following*
       * string literal then gets its whitespace collapsed as if it were code.
       */
      while (j < n) {
        if (css[j] === '\\') { j += 2; continue; }
        if (css[j] === quote) break;
        j++;
      }
      out += css.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }

    // Whitespace run - collapses to a single space, then dropped if it sits beside a tight token
    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r' || ch === '\f') {
      let j = i;
      while (j < n && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1];
      const next = css[j];
      if (prev !== undefined && next !== undefined && !TIGHT_BEFORE.has(prev) && !TIGHT_AFTER.has(next)) out += ' ';
      i = j;
      continue;
    }

    // Drop the final semicolon of a block
    if (ch === ';') {
      let j = i + 1;
      while (j < n && /\s/.test(css[j])) j++;
      if (css[j] === '}') {
        i = j;
        continue;
      }
      out += ';';
      i++;
      continue;
    }

    out += ch;
    i++;
  }

  return out.trim() + '\n';
}
