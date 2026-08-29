import { page, esc, breadcrumbs, breadcrumbJsonLd, SITE, AUTHOR, storyCta } from '../layout.mjs';
import { heroBackdrop, thumb, hasPhoto, figure } from '../photos.mjs';

function readableDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

/** Expands {{PHOTO:slot|caption}} markers in a post body into real figures. */
function renderBody(body) {
  return body.replace(/\{\{PHOTO:([a-z0-9-]+)(?:\|([^}]*))?\}\}/gi, function (_, slot, caption) {
    return figure(slot, (caption || '').trim());
  });
}

export function postCard(post, base) {
  const kicker = post.destination
    ? esc(post.destination) + ' &middot; ' + post.days + ' days'
    : esc(post.tags[0] || 'Article') + ' &middot; ' + post.minutes + ' min read';
  return [
    '<a class="post-card" href="' + base + post.slug + '/">',
    hasPhoto(post.photo) ? '<div class="post-card__media">' + thumb(post.photo, post.title) + '</div>' : '',
    '<div class="post-card__body">',
    '<div class="post-card__meta">' + kicker + '</div>',
    '<h3>' + esc(post.title) + '</h3>',
    '<p>' + esc(post.description) + '</p>',
    '<span class="post-card__more">Read more &rarr;</span>',
    '</div>',
    '</a>',
  ].join('');
}

/**
 * @param {{base:string,label:string,posts:object[],heroPhoto:string,h1:string,lede:string,
 *          title:string,description:string,aboutHtml:string}} cfg
 */
export function postIndex(cfg) {
  const crumbs = [{ href: '/', label: 'Home' }, { href: cfg.base, label: cfg.label }];
  const body = [
    '<section class="hero hero--compact hero--photo">',
    heroBackdrop(cfg.heroPhoto),
    '<div class="hero__blobs" aria-hidden="true"><span class="hero__blob hero__blob--a"></span></div>',
    '<div class="container hero__inner">',
    breadcrumbs(crumbs),
    '<h1>' + cfg.h1 + '</h1>',
    '<p class="hero__lede">' + esc(cfg.lede) + '</p>',
    '</div>',
    '</section>',
    '<section class="section">',
    '<div class="container">',
    '<div class="section-head"><h2>' + esc(cfg.indexHeading) + '</h2></div>',
    '<div class="post-grid">' + cfg.posts.map(function (p) { return postCard(p, cfg.base); }).join('') + '</div>',
    '<div class="prose" style="margin-top:56px">' + cfg.aboutHtml + '</div>',
    '</div>',
    '</section>',
    storyCta({ tone: 'light' }),
  ].join('');

  return {
    path: cfg.base,
    lastmod: cfg.posts.reduce(function (latest, p) {
      const d = p.updated || p.published;
      return d && d > latest ? d : latest;
    }, ''),
    html: page({
      path: cfg.base,
      title: cfg.title,
      description: cfg.description,
      onDark: true,
      body,
      jsonLd: [
        breadcrumbJsonLd(crumbs),
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: cfg.label,
          url: SITE.url + cfg.base,
          description: cfg.description,
          publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url + '/' },
          blogPost: cfg.posts.map(function (p) {
            return {
              '@type': 'BlogPosting',
              headline: p.title,
              url: SITE.url + cfg.base + p.slug + '/',
              datePublished: p.published,
              dateModified: p.updated || p.published,
              author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
            };
          }),
        },
      ],
    }),
  };
}

export function postPages(cfg) {
  return cfg.posts.map(function (post) {
    const path = cfg.base + post.slug + '/';
    const crumbs = [
      { href: '/', label: 'Home' },
      { href: cfg.base, label: cfg.label },
      { href: path, label: post.title },
    ];
    const others = cfg.posts.filter(function (x) { return x.slug !== post.slug; }).slice(0, 3);

    const body = [
      '<article>',
      '<section class="hero hero--compact hero--photo">',
      heroBackdrop(post.photo),
      '<div class="container hero__inner">',
      breadcrumbs(crumbs),
      '<h1>' + esc(post.h1) + '</h1>',
      '<p class="hero__lede">' + esc(post.description) + '</p>',
      '<div class="byline">',
      '<img class="byline__avatar" src="/assets/img/logo.svg" alt="" width="40" height="40" loading="lazy" decoding="async">',
      '<div><strong>' + esc(AUTHOR.name) + '</strong><br>',
      '<span>Published <time datetime="' + post.published + '">' + readableDate(post.published) + '</time>',
      post.updated && post.updated !== post.published
        ? ' &middot; updated <time datetime="' + post.updated + '">' + readableDate(post.updated) + '</time>'
        : '',
      ' &middot; ' + post.minutes + ' min read',
      post.days ? ' &middot; ' + post.days + '-day trip' : '',
      '</span></div>',
      '</div>',
      /*
       * Said where the reader forms the belief, not only in the small print at the bottom. The
       * itineraries read in the first person; the site must not let that be mistaken for a record
       * of a journey the author made.
       */
      cfg.provenanceNote ? '<p class="provenance-note">' + esc(cfg.provenanceNote) + '</p>' : '',
      '</div>',
      '</section>',
      '<section class="section">',
      '<div class="container">',
      '<div class="prose prose--article">',
      renderBody(post.body),
      '<div class="tagline">' + post.tags.map(function (t) { return '<span class="chip chip--static">' + esc(t) + '</span>'; }).join('') + '</div>',
      '</div>',
      '<aside class="author-box">',
      '<img src="/assets/img/logo.svg" alt="" width="64" height="64" loading="lazy" decoding="async">',
      '<div><h2>' + esc(AUTHOR.name) + '</h2>',
      '<p>' + esc(AUTHOR.bio) + '</p>',
      '<p><a href="/about/">More about this site</a> &middot; <a href="/contact/">Get in touch</a></p></div>',
      '</aside>',
      '<h2 style="margin-top:56px">Keep reading</h2>',
      '<div class="post-grid post-grid--small">' + others.map(function (p) { return postCard(p, cfg.base); }).join('') + '</div>',
      '</div>',
      '</section>',
      storyCta({ tone: 'light', compact: true }),
      '</article>',
    ].join('');

    return {
      path,
      lastmod: post.updated || post.published,
      html: page({
        path,
        title: post.title + ' | TravelStoryMaker',
        description: post.description,
        onDark: true,
        body,
        jsonLd: [
          breadcrumbJsonLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': cfg.schemaType || 'Article',
            headline: post.title,
            description: post.description,
            datePublished: post.published,
            dateModified: post.updated || post.published,
            inLanguage: 'en',
            mainEntityOfPage: { '@type': 'WebPage', '@id': SITE.url + path },
            image: SITE.url + (hasPhoto(post.photo) ? '/assets/img/photos/' + post.photo + '.jpg' : '/og-image.png'),
            author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
            publisher: {
              '@type': 'Organization',
              name: SITE.name,
              url: SITE.url + '/',
              logo: { '@type': 'ImageObject', url: SITE.url + '/icon-512.png' },
            },
            keywords: post.tags.join(', '),
          },
        ],
      }),
    };
  });
}
