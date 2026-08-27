# travelstorymaker.com — static site

A fully static, dependency-free site for <https://www.travelstorymaker.com>, built for fast indexing by Google and a clean AdSense review.

## What gets generated

| Route | Purpose |
| --- | --- |
| `/` | Home — presents the site |
| `/travelstories/` (+ `page/2` … `page/10`) | All 1,000 entries, 100 per page |
| `/travelstories/stories/`, `/quotes/`, `/fun-facts/` | Collections by type |
| `/guides/` + 12 article pages | Long-form travel guides |
| `/blog/` + 7 article pages | Practical articles: flights, car hire, stays, phones, cards, insurance |
| `/submit/` | Reader story submissions (mailto-based, no backend) |
| `/destinations/` | Continent and country hub |
| `/destinations/{europe,asia,…}/` | Collections by region |
| `/destinations/{japan,peru,…}/` | 36 per-country collections |
| `/about/`, `/contact/`, `/faq/`, `/editorial-policy/`, `/credits/` | Trust pages |
| `/terms/`, `/privacy/`, `/cookies/`, `/disclaimer/` | Legal pages |
| `/404.html` | Not found |
| `/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` | Machine files |
| `/og-image.png`, `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`, `/site.webmanifest` | Icons and social preview |

Every page is plain HTML: one stylesheet, one small script, no framework, no client-side rendering. Search and filtering operate on markup that is already in the document, so crawlers see all 1,000 entries.

## Commands

```powershell
node build.mjs      # generate ./dist
node serve.mjs      # preview ./dist on http://localhost:4173
```

## Content

Entries live in `src/data/entries-01.mjs` … `entries-10.mjs` as tuples:

```js
[type, title, place, region, text, author]
// type:   'fact' | 'quote' | 'story'
// region: 'europe' | 'asia' | 'africa' | 'americas' | 'oceania' | 'polar' | 'world'
// author: quotes only
```

Add a tuple to any file and rebuild — pagination, sitemap, counts, country and region pages all update automatically.

Long-form guides live in `src/articles/articles-0*.mjs`. Country pages and their intros live in `src/countries.mjs`.

## Assets

`tools/fetch-assets.mjs` is a one-off downloader, not part of the build:

```powershell
node tools/fetch-assets.mjs fonts    # Inter + Fraunces woff2 into public/assets/fonts
node tools/fetch-assets.mjs photos   # 60 CC-licensed photos into public/assets/img/photos
```

Photos come from Wikimedia Commons via the Openverse API, are self-hosted (never hotlinked), and every one is credited with its licence on `/credits/`. The manifest is `src/generated/photos.json`; delete a key and re-run to replace a single image. Wikimedia only serves a fixed set of thumbnail widths — the fetcher tries 1280, 1024 then 800.

There are no third-party requests at runtime apart from the AdSense script.

## Deployment

Vercel, from the `main` branch. [vercel.json](vercel.json) already declares everything:

- Build command: `node build.mjs`
- Output directory: `dist`
- Framework preset: none
- `trailingSlash: true`, so live URLs match the `<link rel="canonical">` values
- Long cache headers on `/assets/*`, `text/plain` on `ads.txt` and `llms.txt`
- 301 redirects from the old `/blog/*` guide URLs to `/guides/*`

No install step and no dependencies, so builds finish in seconds. Add `www.travelstorymaker.com` under Project → Settings → Domains and set the apex to redirect to `www`.

`dist/` is build output and is not committed; Vercel regenerates it on every deploy.

## Generated images

`src/png.mjs` is a dependency-free PNG/ICO writer with anti-aliased SDF drawing and a small geometric stroke font. `src/images.mjs` uses it to render the 1200×630 Open Graph image and every icon at build time, so there are no binary assets to keep in sync in the repo.

## AdSense

- `public/ads.txt` contains the publisher line and is copied to the site root.
- The AdSense script is injected in `<head>` on every page (`src/layout.mjs`, `SITE.adsenseClient`).
- `.ad-slot` placeholders mark where manual ad units go. With Auto ads enabled nothing further is needed; to place fixed units, replace the placeholder markup in `src/layout.mjs` → `adSlot()` with your `<ins class="adsbygoogle">` snippet.
