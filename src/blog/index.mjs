import t01 from './trips-01.mjs';
import t02 from './trips-02.mjs';
import t03 from './trips-03.mjs';

export const POSTS = [...t01, ...t02, ...t03].sort(function (a, b) {
  return a.published < b.published ? 1 : -1;
});

export const POST_BY_SLUG = POSTS.reduce(function (acc, p) {
  acc[p.slug] = p;
  return acc;
}, {});
