import a01 from './articles-01.mjs';
import a02 from './articles-02.mjs';
import a03 from './articles-03.mjs';
import a04 from './articles-04.mjs';
import a05 from './articles-05.mjs';

export const ARTICLES = [...a01, ...a02, ...a03, ...a04, ...a05].sort(function (a, b) {
  return a.published < b.published ? 1 : -1;
});

export const ARTICLE_BY_SLUG = ARTICLES.reduce(function (acc, a) {
  acc[a.slug] = a;
  return acc;
}, {});
