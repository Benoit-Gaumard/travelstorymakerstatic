# travelstorymaker.com - static site

A fully static, dependency-free site for <https://www.travelstorymaker.com>, built for fast indexing by Google and a clean AdSense review.

## What gets generated

| Route | Purpose |
| --- | --- |
| `/` | Home - presents the site |
| `/travelstories/` (+ `page/2` … `page/10`) | All 1,000 entries, 100 per page |
| `/travelstories/stories/`, `/quotes/`, `/fun-facts/` | Collections by type |
| `/guides/` + 19 article pages | Long-form travel guides |
| `/blog/` + 10 trip report pages | Day-by-day trip reports with practical itineraries |
| `/submit/` | Reader story submissions (mailto-based, no backend) |
| `/destinations/` | Continent and country hub |
| `/destinations/{europe,asia,…}/` | Collections by region |
| `/destinations/{japan,peru,…}/` | 36 per-country collections |
| `/about/`, `/contact/`, `/faq/`, `/editorial-policy/`, `/credits/` | Trust pages |
| `/terms/`, `/privacy/`, `/cookies/`, `/disclaimer/` | Legal pages |
| `/404.html` | Not found |
| `/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` | Machine files |
| `/feed.xml`, `/atom.xml`, `/rss.xml` | Atom and RSS feeds for the guides and trip reports |
| `/og/{page}.png` | One generated 1200×630 share card per page, carrying that page's own title |
| `/og-image.png`, `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`, `/site.webmanifest` | Icons and the site-wide social preview |

Every page is plain HTML: one stylesheet, one small script, no framework, no client-side rendering. Search and filtering operate on markup that is already in the document, so crawlers see all 1,000 entries.

## Commands

```powershell
node build.mjs      # generate ./dist
node serve.mjs      # preview ./dist on http://localhost:4173
```

Most of the build time is the 89 Open Graph cards. `$env:SKIP_OG_CARDS=1; node build.mjs` skips them
while iterating on markup locally - never for a deploy, or every share card 404s. Remember to clear
the variable afterwards (`Remove-Item Env:SKIP_OG_CARDS`); PowerShell keeps it for the session.

The build writes back to `src/generated/lastmod.json` whenever a page's content changed, and says so.
Commit that file with the change: it is what keeps `<lastmod>` honest instead of stamping every URL
with the deploy date.

## Content

Entries live in `src/data/entries-01.mjs` … `entries-10.mjs` as tuples:

```js
[type, title, place, region, text, author]
// type:   'fact' | 'quote' | 'story'
// region: 'europe' | 'asia' | 'africa' | 'americas' | 'oceania' | 'polar' | 'world'
// author: quotes only
```

Add a tuple to any file and rebuild - pagination, sitemap, counts, country and region pages all update automatically.

Long-form guides live in `src/articles/articles-0*.mjs`. Country pages and their intros live in `src/countries.mjs`.

## Assets

`tools/fetch-assets.mjs` is a one-off downloader, not part of the build:

```powershell
node tools/fetch-assets.mjs fonts    # Inter + Fraunces woff2 into public/assets/fonts
node tools/fetch-assets.mjs photos   # 97 CC / CC0 photos into public/assets/img/photos
```

Photos come from Wikimedia Commons via the Openverse API, are self-hosted (never hotlinked), and every one is credited with its licence on `/credits/`. The manifest is `src/generated/photos.json`; delete a key and re-run to replace a single image. Wikimedia only serves a fixed set of thumbnail widths - the fetcher tries 1280, 1024 then 800.

Each photo also ships as WebP at 320, 640 and 1280px wide (`src/generated/photo-variants.json`), and
the hero illustration as WebP and PNG at 320-880px. Those files are committed, not built: the build
never re-encodes an image. See §6.1 of `handoff.md` for how they are produced without adding a
dependency.

There are no third-party requests at runtime apart from AdSense and Google's consent/CMP resources.

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

`src/png.mjs` is a dependency-free PNG/ICO writer with anti-aliased SDF drawing and a small geometric stroke font. `src/images.mjs` uses it to render the 1200×630 Open Graph image and every icon at build time, so those generated images do not need binary assets committed separately.

## AdSense

- `public/ads.txt` contains the publisher line and is copied to the site root.
- The AdSense script is injected in `<head>` on every page (`src/layout.mjs`, `SITE.adsenseClient`).
- `.ad-slot` placeholders mark where manual ad units go. With Auto ads enabled nothing further is needed; to place fixed units, replace the placeholder markup in `src/layout.mjs` → `adSlot()` with your `<ins class="adsbygoogle">` snippet.
