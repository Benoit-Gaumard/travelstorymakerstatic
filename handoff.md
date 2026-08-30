# Handoff - travelstorymaker.com (static site)

Context transfer for continuing work in another AI tool. Written 2026-08-28, revised through
2026-08-29 after the site went live on `travelstorymaker.com`.
Everything below was verified against the repo or against production, not recalled from memory.

**If you are picking this up cold, read §2.1 (post-deploy checks), §8.1 (the CSP - it can silently
break both ads and the consent message) and §9.1 (commit identity) before touching anything.
The one outstanding action that needs a human is §11 item 9: publishing the GDPR message in
AdSense.**

---

## 1. What this project is

A **fully static** website for `https://www.travelstorymaker.com`: a free reading library of
short travel stories, travel quotes and fun facts, plus long-form guides and trip reports.

It was built from scratch to replace a Next.js app (which still lives at `c:\REPOS\VIBE\travelstorymaker`
and, at time of writing, is still what the domain actually serves).

**Why static:** the two driving requirements from the owner were
(a) maximum Google indexability and (b) getting approved by Google AdSense.
Both favour plain HTML that renders without JavaScript.

**Design brief:** "moderne et incite au voyage" - modern, and it should make you want to travel.

---

## 2. Hard constraints - do not break these

| Constraint | Why |
| --- | --- |
| **Zero npm dependencies** | Deliberate. `package.json` has no `dependencies` and no `devDependencies`. Do not add any without asking. |
| **ESM only** | `"type": "module"`. Use `.mjs`, `import`, top-level `await`. |
| **No client-side framework** | One small stylesheet, one small script. Pages must be readable with JS disabled. |
| **Every page is a real HTML file** | No client-side routing, no hydration. |
| **Self-hosted assets** | Fonts and photos are served from our own origin. The only third-party request is AdSense. |
| **English only** | All site copy, metadata and UI text is in English. Never introduce French or any other language into the site, the source, or repo documentation. The owner writes to you in French; you still produce English. |

Node version in use locally: **22.14.0**. Vercel builds on its own Node runtime - avoid bleeding-edge syntax.

---

## 2.1 Deploy checklist

Run through this before pushing a deploy. Everything here has bitten this project at least once.

**In the repo, before you push:**

- [ ] `node build.mjs` completes and reports **114 pages from 1000 entries**. A different page count
      means something silently dropped out of the data.
- [ ] `git status` is clean and `dist/` is *not* in the diff - it is gitignored on purpose.
- [ ] No `.env` file has crept in. The repo is public.
- [ ] `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` both show
      `Benoit-Gaumard <b.gaumard@outlook.com>` - see §9.1.

**In the Vercel dashboard, first deploy only:**

- [ ] Framework Preset is **`Other`**. Anything else breaks the build or the output directory.
- [ ] The apex `travelstorymaker.com` **301s to `www`**. Every canonical, sitemap URL and `og:url`
      says `www`; if the apex serves the site directly, the entire site is duplicated. (§11 item 8)

**Immediately after the deploy goes live - none of these can be checked from the repo:**

- [ ] `curl -sSI https://www.travelstorymaker.com/` actually returns `Content-Security-Policy`,
      `Permissions-Policy`, `X-Frame-Options: DENY` and HSTS. Vercel silently ignores a malformed
      `vercel.json` header block.
- [ ] **Load a page and confirm ads render, then open the console and confirm there are no CSP
      violations.** A CSP that blocks AdSense produces no visible symptom on the page. (§8.1)
- [ ] Once the GDPR message is published in AdSense (§11 item 9), confirm the consent message
      actually appears from an EEA IP and that nothing from `fundingchoicesmessages.google.com`
      is blocked in the console.
- [ ] `/sitemap.xml`, `/robots.txt`, `/ads.txt` and `/llms.txt` all return 200 with the right
      `Content-Type`.
- [ ] Submit the sitemap in Google Search Console and re-check `ads.txt` in AdSense - AdSense caches
      it and can take a day to re-read.

**Known state at time of writing:** the cutover happened on 2026-08-28 and every "after deploy" item
above was verified against production, except the two that need a dashboard: submitting the sitemap
in Search Console, and re-checking `ads.txt` in AdSense. All 113 sitemap URLs were crawled live and
every one returns 200, is self-canonical to its own `https://www.` URL, is indexable, has exactly one
`<h1>` and a unique `<title>`.

### 2.2 The sitemap's `lastmod` is deliberately not the build date

`sitemapXml()` in `build.mjs` used `new Date()`, so every deploy stamped all 113 URLs with today -
telling Google the entire site had changed when nothing had. Google discounts `lastmod` it judges
unreliable, which then devalues the signal for pages that genuinely did change.

Now: guide and trip-report pages use their own `updated`/`published` field, the two section indexes
use the newest date among their posts, and everything else falls back to **`SITE.contentUpdated`** in
`src/layout.mjs`. **Bump that constant by hand when content actually changes. Never wire it to the
clock.** The sitemap is byte-identical across consecutive builds - if it stops being, something has
reintroduced a build-time date.

---

## 3. Commands
```powershell
cd C:\REPOS\VIBE\travelstorymakerstatic

node build.mjs          # wipes dist/, regenerates everything (~3-4 s, 114 pages)
node serve.mjs 4173     # static preview server on http://localhost:4173
npm run dev             # build + serve
```

There is no test suite, no linter, no bundler. `npm install` does nothing useful.

### Windows PowerShell gotchas hit repeatedly during the build

- The agent terminal tool **silently strips a leading `Set-Location`** from commands.
  Always chain it: `cd C:\REPOS\VIBE\travelstorymakerstatic; node build.mjs`.
- Nested double quotes inside `powershell -NoProfile -Command "..."` frequently break the parser
  and drop you into a `>>` continuation prompt. Prefer assigning to a variable across two statements
  over one deeply-quoted one-liner.
- **`node build.mjs` must be re-run after editing anything in `public/`.** The preview server serves
  `dist/`, and `public/` is copied into `dist/` at build time. Editing CSS without rebuilding looks
  like "my change did nothing".

---

## 4. Repository layout

```
travelstorymakerstatic/
├── build.mjs                  entry point: assembles pages, writes dist/, generates machine files
├── serve.mjs                  dev-only static server
├── vercel.json                build command, output dir, headers, redirects, trailingSlash
├── handoff.md                 this file
├── public/                    copied verbatim into dist/ after page generation
│   ├── ads.txt
│   ├── favicon.svg
│   └── assets/{css/style.css, js/app.js, fonts/*.woff2, img/{logo.svg, hero-travelstorymaker.png, photos/, flags/}}
├── src/
│   ├── layout.mjs             SITE + AUTHOR config, page shell, nav, footer, esc(), page()
│   ├── components.mjs         entryCard(), entryList(), toolbar(), pagination(), regionTile()
│   ├── photos.mjs             photo(), hasPhoto(), heroBackdrop(), figure(), thumb()
│   ├── flags.mjs              hasFlag(), flagImg()  - scans public/assets/img/flags at build time
│   ├── countries.mjs          36 countries: slug, title, match[], query, lede, intro
│   ├── country-facts.mjs      per-country fact sheet data (capital, currency, plugs, ...)
│   ├── images.mjs             hand-rolled PNG/ICO encoders for og-image and favicons
│   ├── png.mjs                zlib-based PNG writer used by images.mjs
│   ├── data/
│   │   ├── entries-01..10.mjs 1000 entries as tuples [type, title, place, region, text, author]
│   │   └── index.mjs          merges, validates, assigns ids, exports interleaveByType()
│   ├── articles/              19 guides (articles-01..05.mjs + index.mjs)
│   ├── blog/                  10 trip reports (trips-01..03.mjs + index.mjs)
│   ├── generated/             photos.json, fonts.json, factlinks.json  (committed, not built)
│   └── pages/                 home, collections, countries, sections, posts, statics, submit, credits
└── tools/
    ├── fetch-assets.mjs       ONE-OFF asset fetcher. NOT part of the build.
    └── pick-photo.mjs
```

`dist/` is **build output and is not tracked in git**. It is listed in `.gitignore`. Vercel regenerates
it on every deploy, so it never needs to be committed. (It was tracked by mistake early in the project
and was untracked on 2026-08-28 with `git rm -r --cached dist`; the files remain on disk.)

---

## 5. Content model

`src/data/entries-*.mjs` export arrays of tuples:

```js
['fact', 'Iceland has no mosquitoes', 'Iceland', 'europe', 'Body text...', null]
//  type    title                       place      region     text            author (quotes only)
```

`src/data/index.mjs` merges all ten files, validates, and assigns sequential `id`s.

**Current counts (verified):**

- 1000 entries - 506 `fact`, 294 `story`, 200 `quote`
- by region - europe 185, asia 215, africa 149, americas 189, oceania 64, polar 14, world 184
- 36 country pages, 19 guides, 10 trip reports, 97 photos, 35 flags, 466 fact links
- **114 pages**, 113 URLs in `sitemap.xml`

### `interleaveByType()` - the single most important function

The source files are grouped by type, so a naive slice gives you a page that is 100% fun facts and
makes the type filter look broken. `interleaveByType()` does a smooth weighted round-robin.

It must be applied **twice**: once globally in `data/index.mjs` (before ids are assigned) and again
per-collection inside `collection()` in `src/pages/collections.mjs`. Removing either one silently
regresses the browsing experience.

---

## 6. Generated data files (`src/generated/`)

These are **committed** and produced by `tools/fetch-assets.mjs`, which is **not** run by the build.

```powershell
node tools/fetch-assets.mjs fonts | photos | flags | links | all
```

| File | Contents | Notes |
| --- | --- | --- |
| `fonts.json` | array of 3 `@font-face` descriptors (family, style, weight, unicode-range, src) | woff2 files live in `public/assets/fonts/`. **Public Sans is one variable file covering 400-800 (26KB); Newsreader is two static faces (48KB).** 75KB total. Both request shapes were measured, not assumed - see the comment above `FONT_CSS` in `tools/fetch-assets.mjs` before changing either URL. |
| `photos.json` | 97 slots → `{ src, alt, author, license, link, ... }` | Wikimedia Commons, CC / CC0 |
| `factlinks.json` | 466 keys `"title\|place"` → `{ title, url }` | Wikipedia "Read more" links on fun facts |

`factlinks.json` is keyed by **`title|place`, never by numeric id** - ids shift whenever entry data is
reordered, which would silently mis-assign links.

The fetcher caches: existing keys/files are skipped. To re-resolve one fact, delete its key and re-run.
To force a specific link, hand-edit the value - it will be preserved.

### 6.1 Image assets are pre-generated and committed, never built

Everything under `public/assets/img/` is a committed binary. `build.mjs` only copies `public/` into
`dist/`; it never resizes or re-encodes anything, and it must stay that way - Vercel's build has no
image toolchain and the repo has no dependencies.

The hero illustration ships as six files: PNG and WebP at 560, 720 and 880px wide. They were produced
by two one-off scripts run locally, not by the build:

- **Resizing**: a box filter in premultiplied alpha, re-encoded with `node:zlib` using the same
  approach as `src/png.mjs`. Premultiplying matters - resizing straight RGBA bleeds dark fringes into
  the transparent edges.
- **WebP**: encoded by **Chromium's own `canvas.toDataURL('image/webp', 0.9)`**, driven over CDP.
  Node has no WebP encoder and adding one would break the zero-dependency rule, but a headless
  Chromium is already on this machine for testing. It cut the hero by 73-76% (233KB → 62KB at 560w)
  with transparency intact.

If you add another hero-sized image, do the same and commit the output. Do not add `sharp`.

---

## 7. Hard-won gotchas

These all cost real debugging time. Do not rediscover them.

1. **HTML `width`/`height` attributes beat CSS `aspect-ratio`.** A card was rendering 815px tall
   instead of 271px. An image whose displayed size is driven by CSS needs an explicit `height: auto`
   for the CSS to win. Keep the attributes anyway - they prevent layout shift.

2. **Media queries do not add specificity.** `.site-header--on-dark .nav a` (0,2,1) beat `.nav a`
   (0,1,1) inside a media query, giving a white-on-white mobile menu. Fix by matching specificity,
   not by wrapping in a media query.

   This bit twice. The second time, the `@media (max-width: 900px)` block at the end of the file
   set `.site-header .nav a:hover { background: rgba(16,22,44,.06) }` - (0,3,1), the *same*
   specificity as `.nav a.nav__cta:hover` (0,3,1) but **later in the file**, so it won on source
   order and stripped the CTA's gradient. The colour rule immediately after it kept the text
   `#fff`, so "Propose a story" rendered white on a pale grey at 1.13:1 contrast. When a generic
   `:hover` and a component `:hover` tie on specificity, restate the component rule in the block
   with a higher one - do not rely on where it happens to sit in the file.

3. **Emoji flags do not render on Windows.** 🇯🇵 relies on regional indicator symbols; Windows ships
   no glyphs for the pairs, so Chrome and Edge on Windows show bare "JP". All flags are **PNG images**
   for this reason. Never substitute emoji.

4. **Wikimedia thumbnails only accept whitelisted widths.** Requesting 1200px returns HTTP 400
   ("Use thumbnail sizes listed on w.wiki/GHai"). Use 1280 / 1024 / 800.

5. **Wikimedia rate-limits bursts with HTTP 429.** The flag fetch needs retry-with-backoff and
   skip-if-exists. A custom `User-Agent` with a contact URL is required.

6. **`fetch()` hangs forever without a timeout.** Always pass `AbortSignal.timeout(20000)`.

7. **Google Fonts serves multiple subsets.** The naive parse picked the Vietnamese subset for Inter.
   Only accept `@font-face` blocks whose `unicode-range` starts with `U+0000-00FF`.

   **The request shape decides the file size, by a factor of three.** Measured on 2026-08-30 when
   the typefaces changed: asking Newsreader for its `opsz@6..72` axis makes Google serve 125KB for
   two faces; pinning the weight instead serves 48KB with no visible difference at the sizes this
   site sets. Conversely, asking Public Sans for a **variable** `wght@400..800` range serves one
   26KB file covering every weight, where four static weights cost 105KB. Measure before choosing;
   the intuitive request is the expensive one in both directions.

8. **`requestAnimationFrame` is frozen in background tabs**, so an rAF-throttled scroll handler meant
   the back-to-top button never appeared. Throttling removed.

9. **Naive Wikipedia matching produces absurd links.** "Switzerland has bunkers *everywhere*" matched
   the article "To Be Everywhere Is to Be Nowhere" on one shared generic word. `score()` in
   `fetch-assets.mjs` now requires either a token shared with the **place** or at least two shared
   tokens, and ranks place-matches higher. 40 facts resolve to nothing rather than to something wrong.

10. **A CSS animation on `translate` silently kills `translate: -50%` centring.** The hero
    illustration is centred with `inset: 0 0 0 auto` + flexbox rather than a transform, because its
    float animation animates the `translate` property and would otherwise reset the centring offset
    to zero on the first keyframe.

---

## 8. Deployment

**Vercel, from the `main` branch of the GitHub repo.** Nothing else. There is no GitHub Pages site,
no Netlify, no manual upload.

`vercel.json` declares everything:

- `buildCommand: node build.mjs`, `outputDirectory: dist`, `framework: null`
- In the Vercel dashboard the **Framework Preset must be `Other`**. Anything else makes Vercel try to
  detect a framework and the build fails or produces the wrong output directory.
- `trailingSlash: true`, `cleanUrls: false` - every route is a directory containing `index.html`,
  so URLs end with `/`. Changing this would break every internal link and every sitemap entry.
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, HSTS,
  `Permissions-Policy`, and a full `Content-Security-Policy`. See §8.1 before touching the CSP.
- Cache headers: `/assets/img/*` and `/assets/fonts/*` immutable for a year; `/assets/css/*` and
  `/assets/js/*` only `max-age=3600, must-revalidate` - **deliberately not immutable**, because those
  filenames carry no content hash, so a year-long immutable cache would make an emergency fix to
  `app.js` undeliverable to returning visitors. Icons for a week, `ads.txt` for an hour.
- Explicit `Content-Type` for `ads.txt`, `llms.txt` and `site.webmanifest`.
- **Seven permanent 301 redirects** from old `/blog/*` guide URLs to their new `/guides/*` homes.
  These preserve inbound links and search rankings for content published under the old structure -
  do not remove them.

A `.github/workflows/deploy.yml` that published to GitHub Pages existed until 2026-08-28. It was
deleted because nothing was ever deployed from it; it only consumed Actions minutes and duplicated
the Vercel build with a config that lacked the redirects above. The `.nojekyll` file that `build.mjs`
used to emit was removed at the same time - it only ever mattered to GitHub Pages.

**DNS was switched on 2026-08-28 and this build is now live on `travelstorymaker.com`.** The old
Next.js app in `c:\REPOS\VIBE\travelstorymaker` no longer serves the domain. Verified live after the
cutover: `https://travelstorymaker.com/` 301s to `https://www.travelstorymaker.com/`, `http://`
308s to `https://` on both hosts, and all six security headers arrive intact.

### 8.1 The CSP and AdSense - do not edit this by eye

The `Content-Security-Policy` in `vercel.json` was **tested in a real browser, not reasoned about**,
and three rounds of testing were needed before it stopped breaking things silently:

1. The first version blocked `ep1.adtrafficquality.google` in `connect-src`.
2. The second still blocked `ep2.adtrafficquality.google/sodar/sodar2.js` in `script-src`.
3. When consent moved to Google's CMP, `fundingchoicesmessages.google.com` had to be added to
   `script-src`, `connect-src` and `frame-src` - otherwise our own policy blocks Google's consent
   message and no banner ever appears.

The `adtrafficquality.google` hosts are **Sodar, Google's invalid-traffic detection for AdSense**.
Blocking them does not break the page and produces no visible symptom - it silently degrades
click-fraud protection, which is an AdSense account risk. Blocking the CMP host is worse: it leaves
EEA visitors with no consent message at all while ads still load.

Any future change to the CSP must be re-verified by loading real pages with the header applied and
reading the console, not by reviewing the string.

The current policy allows `'unsafe-inline'` in `script-src` and `style-src`. That is unavoidable
with AdSense Auto Ads, which injects inline script and style. The parts that are *not* negotiable and
cost nothing - `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'none'`
- are what actually contain a future injection bug in a hand-rolled string-concatenation templating
engine. Keep them.

`form-action 'none'` is correct **today** because there are zero `<form>` elements in all 114 pages
(the `/submit/` flow is a `mailto:` link). If a real form is ever added, this must change to `'self'`
or the submission will be blocked.

---

## 9. Git state

```
remote  https://github.com/Benoit-Gaumard/travelstorymakerstatic.git
branch  origin/main   (baseline; current worktree has unmerged local commits)
head    b7c8ca2 = origin/main   2026-08-28
```

Recent history, newest first:

```
b7c8ca2  docs(handoff): record the Lighthouse pass and where the weight now sits
248fabb  perf(fonts): serve the Inter latin subsets instead of the full faces
74d4938  perf: serve the hero as WebP with a PNG fallback
4c9a5ab  perf/a11y: unblock the consent dialog fonts, preconnect, responsive hero, heading order
c49cce6  docs(handoff): retract a wrong HSTS claim and record the state after launch
0ffb2c7  seo: cap titles at 60 chars, and drop the HSTS preload token
e992d35  feat(consent): hand over to Google's certified CMP and allow it in the CSP
b1e7791  docs(handoff): record the required commit identity for this repo
3036079  docs(handoff): record the cutover, the sitemap lastmod rule and the CMP gap
d6b0060  fix(sitemap): make lastmod meaningful instead of the build date
43b990a  fix(cache): stop the icon rule stealing the immutable cache from /assets/img
38f7d3e  docs(handoff): bring the handoff up to date for the first deploy
ecd9245  fix(nav): keep the CTA gradient on hover in the mobile menu
f9e9822  security: add CSP and Permissions-Policy, tighten caching, ignore .env
```

`dist/` is gitignored and has never been tracked in this history. `.gitignore` now also covers
`.env`, `.env.*` and `.vercel/` - **this repository is public**, so a secret committed here is
world-readable and is not undone by a later `git rm`.

### 9.1 Commit identity - set this first in any fresh clone

Commits must be authored as **`Benoit-Gaumard <b.gaumard@outlook.com>`**. That is the GitHub account
and the identity Vercel matches for deploy attribution. The machine's *global* git identity is
`Benoit Gaumard <begaumar@microsoft.com>`, which is a different person as far as GitHub is concerned.

This repo therefore carries a local override:

```powershell
git config --local user.name  "Benoit-Gaumard"
git config --local user.email "b.gaumard@outlook.com"
```

**`.git/config` is not versioned, so a fresh clone silently reverts to the Microsoft identity.** Run
the two commands above before the first commit in any new checkout. Verify with
`git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` - check *both*, and see the warning
below.

**Do not use `git commit --amend --author=...` as the routine fix.** It rewrites only the *author*
and leaves the *committer* as the global identity, so the commit still carries the wrong address in
half the metadata, and it forces a `--force-with-lease` push every time. Setting the local config
fixes both fields with no history rewriting.

Commits `0b3233c`, `2f1bc33`, `fd88f32` and `38f7d3e` were amended that way before the local config
existed: their author is correct but their committer is still the Microsoft address. The remaining
commits up to `3036079` are wrong in both fields. This was left as-is deliberately - rewriting would
have changed every SHA, including the ones cited in §9 above, for a cosmetic gain.

### 9.2 There were briefly two clones - only one is real

Until 2026-08-28 a second clone existed at `C:\Users\begaumar\.copilot\repos\travelstorymakerstatic`,
created by the Copilot app when the project was registered against the wrong path. Its local `main`
was `29a4c4c`, an **unrelated root commit with no merge base** against the real `main` - an old
snapshot with `dist/` committed and no `handoff.md`. It was deleted, and the app project now points
at `C:\REPOS\VIBE\travelstorymakerstatic`. If a tool ever offers you a checkout under `.copilot\repos`,
it is wrong; this directory is the only source of truth.

---

## 10. Recently completed work

**Fun-fact reference links.** Every fun fact card can render `Read more: <Article> ↗` linking to
Wikipedia. 466 of 506 resolved. Rendered by `entryCard()` in `src/components.mjs`, styled `.entry__ref`.
The label says "Read more", not "Source" - deliberately, because Wikipedia is a starting point, not a
citation, and a minority of links point at the general country article rather than the specific fact.
Do not relabel these as sources.

**Country flags.** `src/flags.mjs` was extracted so both the `/destinations/` country cards
(`.post-card__title-flag`, 30×20) and the country page fact sheets (`.factsheet__flag`, 72×48) share
one implementation. On the cards the flag is `alt=""` + `aria-hidden` because the country name sits
right beside it; on fact sheets it keeps a descriptive `alt`.

**Homepage hero.** Rebuilt as `hero--split`: copy on the left, a single transparent-background 3D
travel illustration (`public/assets/img/hero-travelstorymaker.png`, 880×660, ~499 KB) on the right,
over a navy→violet radial gradient with blurred colour blobs. Inspired by tripkygo.com. The old
washed-out aeroplane-wing backdrop and the four-photo tilted collage that briefly replaced it are
both gone.

From 1001px up the illustration is `position: absolute` inside `.hero__split` and flex-centred
against the copy, so **it contributes nothing to the hero's height**. Below 1001px it drops back
into the flow underneath the copy at 340px, and 260px below 560px. Copy and art are sized `58%` /
`38%` so the CTA row can never run under the illustration - a fixed 660px copy column did exactly
that between 1001 and 1100px. The image drifts 12px on a 9s loop, disabled under
`prefers-reduced-motion`.

`.hero--split h1` is capped at `clamp(2rem, 4.4vw, 3.4rem)`, below the global `3.9rem`. At the
global size "Stories that make you" wrapped to a second line and added ~90px to the hero.
Verified 320–1920px: hero is 629px at 1440 (was 828), 981px at 390, with no horizontal overflow.

**Item counts removed from fast-moving sections.** `/guides/` and `/blog/` no longer state how many
guides or trip reports exist, in the lede, the `<title>` or the meta description. A count in a meta
description churns the SERP snippet on every publication and reads thin at small numbers. The same
counts were also being injected into `llms.txt` by `build.mjs` and were missed on the first pass -
check `build.mjs` as well as `src/pages/sections.mjs` if this ever comes up again. A hard-coded
"and seven more" on the guides page was removed at the same time; unlike the others it was not
derived from the data and would simply have become false.

Counts elsewhere were deliberately **kept**: `294 stories`, `200 quotes`, `506 fun facts`,
`36 countries`, `97 images` are all computed from the data, so they cannot drift, and they sit on a
fixed 1000-entry dataset that does not move. Large numbers there are a credibility argument.

**SEO audit, 2026-08-28.** The built output was cross-checked programmatically rather than by eye:
114 pages, 113 indexable, 113 sitemap URLs. `404.html` is correctly excluded from the sitemap *and*
carries `noindex`. Zero missing or duplicate canonicals, zero duplicate titles or descriptions,
exactly one `<h1>` per page, `html lang` everywhere, and **292 JSON-LD blocks, all of which parse**.
`og-image.png` really is 1200×630 as declared. The `ads.txt` publisher ID matches `SITE.adsenseClient`
in `layout.mjs`. The audit found 66 titles over 60 characters and 24 descriptions over 160; both were
addressed afterwards - see §11 item 10.

**Measure title length with entities decoded.** The first version of the audit counted `&amp;` as
five characters and flagged titles that Google sees as four characters shorter. Anything that
measures `<title>` or a `meta` description must decode entities first or it will "fix" titles that
were already fine.

**Sitemap, cache and title work after the cutover.** `lastmod` stopped being the build date (§2.2).
An icon cache rule was matching everything under `/assets/img/`, so flags, the logo and the hero PNG
were served with a one-week cache instead of a year while `.jpg` photos correctly kept `immutable` -
the two `vercel.json` rules overlapped and the later one won. Titles are now capped at 60 characters
by `fitTitle()`, taking the over-long count from 66 to 0 with no duplicates introduced.

**Consent handed to Google's certified CMP.** The hand-rolled cookie banner was removed and
`fundingchoicesmessages.google.com` was allowlisted in the CSP - without that our own policy would
have blocked Google's consent message and it would have failed silently. See §11 item 9 for the
remaining dashboard step. While editing the policy pages, two false statements were corrected: they
described a `localStorage` value the site no longer writes, and the cookie page claimed "we load two
typefaces from Google Fonts" when fonts are self-hosted and `font-src` is `'self'` - a privacy page
should not describe a third-party data transfer that does not happen.

**Lighthouse pass, 2026-08-28.** Mobile went from Performance 62 / Best Practices 77 to
Best Practices 100 and Accessibility 96, with SEO already at 100. What was actually wrong:

- **The CSP was breaking Google's own consent dialog.** `font-src 'self'` and `style-src 'self'`
  blocked `fonts.gstatic.com` and `fonts.googleapis.com`, which the CMP uses for Material Icons and
  Open Sans. Every entry in `errors-in-console` and `inspector-issues` came from this, and the
  dialog rendered with fallback fonts and missing icons. A regression introduced with the CSP in
  `f9e9822`, invisible until the CMP went live.
- **The hero was the LCP element** at 499 KB, shipped at 880px to phones that render it at 260px.
  Now `<picture>` with WebP at 560/720/880w: **62 KB on mobile**.
- **The four Inter faces were the full woff2 files** (47 KB each) while `unicode-range` only ever
  allowed the latin glyphs. Switched to the `-latin` subsets already on disk: **188 KB → 40 KB**,
  no visual change.
- Missing `preconnect` to the two Google origins, costed at ~308 ms.
- Footer headings were `<h4>` directly after an `<h2>`, failing `heading-order`.

The remaining Performance cost is third-party - see §11 item 4.

**That Lighthouse pass missed two real defects, both fixed on 2026-08-29 (`c0e9586`).** They are
recorded here because both are the kind a good score actively hides:

- **`--text-faint` failed WCAG AA everywhere it was used.** The old `#79839c` measured 3.79:1 on
  `--paper`, 3.45:1 on `--sand` and 3.14:1 on `--sand-2`, against the 4.5:1 required at those sizes.
  It colours `.entry__meta` on **every card**, so `/travelstories/` alone carried 431 failing text
  nodes. An earlier revision of this file claimed the residual `color-contrast` failures were inside
  Google's consent dialog; that was wrong - they were in our own stylesheet. It is now `#5c6477`,
  same hue, worst case 4.91:1. Verified in the browser: 431 failures to 0.
- **The closed mobile menu kept its seven links in the tab order.** `.nav` was hidden with `opacity`
  and `pointer-events: none` only, which hides it from a mouse but not from the keyboard or the
  accessibility tree. That is exactly why it survived both visual testing and a score of 96.
  `app.js` now applies `inert` below 900px while the menu is closed, and re-evaluates on breakpoint
  change so the desktop nav is never inert; `visibility: hidden` is the CSS fallback.

**Do not trust an accessibility score to find either class of bug.** Re-measure contrast from the
computed styles, and test the closed mobile menu with the Tab key.

**Security review, 2026-08-28.** Adversarial read-only review of this repo. Result: no secrets in the
working tree or in any of the commits, no exposed API key, no DOM XSS in `app.js`, `esc()` correct and
applied, JSON-LD escaping verified empirically (240 entries contain HTML-special characters; zero raw
`<` in any built JSON-LD block), `serve.mjs` resistant to ten path-traversal payloads, zero
`console.log` shipped to the browser. The zero-dependency claim was verified rather than assumed.

Four things were fixed: the missing CSP and `Permissions-Policy` (see §8.1), `X-Frame-Options`
raised to `DENY`, the over-broad `immutable` cache on unhashed CSS/JS, `.env*` added to `.gitignore`,
and a crash in `serve.mjs` where `decodeURIComponent` threw on a malformed escape such as `/%zz` and
killed the process through an unhandled rejection in the async handler.

**Mobile menu CTA contrast.** See gotcha 2 - "Propose a story" rendered white-on-near-white at
1.13:1 when hovered in the burger menu. Fixed by restating the CTA hover inside the mobile media
query at a higher specificity.

---

## 11. Open items the owner has not decided

1. **`AUTHOR.sameAs` still exposes the full surname.** The display name was changed to "Benoit Ga"
   across 65 occurrences, but `sameAs: ['https://github.com/Benoit-Gaumard']` in `src/layout.mjs`
   still reveals it, and it is emitted into ~20 JSON-LD blocks. Keep / replace / remove - unanswered.

2. **The 10 trip reports are written in the first person but are not the owner's actual trips.**
   This was flagged as a Google "helpful content" and AdSense authenticity risk. Options offered:
   reframe as suggested itineraries in the third person, or replace with real trips. Unanswered.

3. ~~`home-hero.jpg` was credited but unreferenced.~~ **Resolved.** Verified again on 2026-08-29:
   there were no live references in `src/`, `public/assets/css/` or `public/assets/js/`. Removed
   `public/assets/img/photos/home-hero.jpg`, the `home-hero` slot from `src/generated/photos.json`,
   and the matching `GENERIC` fetch slot in `tools/fetch-assets.mjs`.

4. **Page weight is now dominated by AdSense and the consent dialog, not by us.** Measured on
   production with Lighthouse after the optimisation pass: **first-party 133 KB, third-party 470 KB**
   - `pagead2.googlesyndication.com` 219 KB, `fundingchoicesmessages.google.com` 144 KB, and
   `fonts.gstatic.com` 101 KB which is Google's consent dialog pulling its own webfonts. Blocking
   time was 3,944 ms for FundingChoices and 903 ms for Ads; first-party contributes essentially none
   of it.

   The first-party side has been taken about as far as it goes without a build toolchain: the hero
   is 62 KB of WebP instead of 499 KB of PNG, and the fonts are 40 KB instead of 188 KB. **A poor
   mobile Performance score is now a consequence of running ads, not of a fixable defect.** Do not
   let a future pass chase it by making the LCP image lazy - that games the metric and makes the
   real experience worse.

   Note that the Performance number is extremely noisy run to run: local runs during this work
   produced TBT between 620 ms and 3,950 ms on the same commit. Judge changes by bytes and by the
   deterministic audits, not by the score.

5. **The old Next.js app is no longer serving the domain, but it still exists.** Before 2026-08-28,
   `travelstorymaker.com` served a Next.js app with `/login`, `/planner`, `/create`, `/export` and a
   client-side MapTiler key. DNS now points here, so that attack surface is off the public domain -
   but the code still lives in `c:\REPOS\VIBE\travelstorymaker` and was never audited. If any part of
   it is ever redeployed, or if its Supabase project and MapTiler key are still active, they need a
   review of their own. A clean security report on *this* repo says nothing about that one.

6. ~~Header regression on cutover.~~ **Resolved.** Verified live 2026-08-28: `Content-Security-Policy`,
   `Permissions-Policy`, `X-Frame-Options: DENY`, HSTS, `X-Content-Type-Options` and `Referrer-Policy`
   all arrive on `https://www.travelstorymaker.com/`.

7. **HSTS `preload` was removed, and on Vercel it cannot be earned without moving the site to the
   apex.** `www` sends `max-age=63072000; includeSubDomains`, which is real protection. The
   `preload` token was dropped on 2026-08-28 because it can never take effect here.

   The reason is a **Vercel platform limitation, proven empirically on this site**: Vercel cannot
   attach custom response headers to *any* redirect. This is not specific to the dashboard-level
   apex redirect - a redirect declared in our own `vercel.json` behaves identically. Verified live:

   ```
   curl -sSI https://www.travelstorymaker.com/blog/how-to-book-a-cheap-flight
   HTTP/1.1 308 Permanent Redirect
   Strict-Transport-Security: max-age=63072000     <- Vercel's default only
   ```

   No CSP, no `X-Frame-Options`, no `Permissions-Policy` on that response, even though all three
   are configured for `/(.*)`. An earlier draft of this handoff claimed the fix was to move the
   apex redirect into `vercel.json` with a `has: host` rule - **that is wrong and was retracted.**
   See Vercel issue #10964, still open.

   Since hstspreload.org tests the apex directly and does not follow redirects, the only Vercel-native
   route to preload is to invert the hosts: serve the site on `travelstorymaker.com` (200, so headers
   apply) and redirect `www` to it. That means changing `SITE.url`, and with it all 113 canonicals,
   all 113 sitemap URLs, every `og:url`, `robots.txt` and `llms.txt`. It was considered and declined
   on 2026-08-28: the site has no login, no accounts, no payments and no personal data, so preload -
   which only protects the very first visit against an active network attacker - is not worth
   rewriting every canonical immediately before submitting the sitemap for indexing. Revisit only if
   the site ever handles credentials. The goal of "both hosts send the full header" is not
   achievable on Vercel at all: whichever host redirects cannot carry it.

8. ~~Confirm the apex redirects to `www`.~~ **Resolved.** Verified live: apex 301s to `www`, and
   plain HTTP 308s to HTTPS on both hosts.

9. **Consent is handled by Google's certified CMP - the hand-rolled banner is gone.** The old banner
   (`layout.mjs`, `app.js`, `.cookie-notice` in the stylesheet) was notice-only: one "Got it" button
   writing `tsm-cookie-notice-v1` to localStorage, no reject option, and no signal passed to Google.
   That is not valid consent under GDPR and is not a Google-certified CMP, which Google has required
   since January 2024 for serving ads to EEA/UK users. It was removed, and `vercel.json` now
   allowlists `https://fundingchoicesmessages.google.com` in `script-src`, `connect-src` and
   `frame-src` - **without that the CMP would have been blocked by our own CSP and failed silently.**

   **Remaining manual step, in the AdSense dashboard: Privacy & messaging → GDPR message → publish.**
   Until that is done there is no consent notice on the site at all, because the homemade one is
   gone. The privacy and cookie pages already describe a consent message as being present, so the
   copy is only accurate once the message is live.

10. **Titles are capped at 60 characters automatically; descriptions now fit too.** `fitTitle()` in
    `src/layout.mjs` drops the " | TravelStoryMaker" suffix whenever keeping it would push a title
    past 60, which took the over-long count from 66 to 0. Titles stay unique - verified - and
    Google still gets the site name from the `WebSite` JSON-LD.

    **Resolved on 2026-08-30: 22 over-long descriptions are now 0.** The earlier note here said
    shortening them was editorial work on `countries.mjs` ledes. That was the wrong diagnosis. The
    real cost was the boilerplate: country pages read "15 short travel stories, quotes and fun
    facts about Canada. \<lede\>", spending 59 characters before saying anything specific and
    burying the country name mid-string. `fitDescription()` could not help either - cutting the
    lede left only the boilerplate, below its 120-character floor, so it kept the whole thing.

    `fitMetaDescription()` in `src/pages/countries.mjs` now builds them as "Canada: \<lede\>" and
    appends the entry count only when it fits inside 160. Twelve country and region pages were
    fixed by that formula alone; the remaining ten were hand-written descriptions on guides, one
    trip report and `/submit/`, each shortened individually. No description is under 70 characters,
    and none is duplicated.

---

## 12. Working agreement with the owner

- **Language.** The owner writes to you in French. Every artefact you produce - site copy, metadata,
  code comments, commit messages, repo documentation - is in **English**. Verified on 2026-08-28:
  the only French-looking strings in `src/` are proper nouns (La Paz, La Tomatina, Piton de la
  Fournaise) and one quote entry that cites the phrase "Bon voyage" and explains it in English.
  Keep it that way.
- He explicitly and repeatedly asks for honest critique ("il manque quoi selon toi ?", "quel est
  l'avantage ?") and acts on it. **Do not oversell finished work.** State what is not done, what is
  approximate, and what carries risk - that is what he is paying attention to.
- He will correct you on facts about his own infrastructure. When he does, fix the record rather than
  defending the earlier guess.
- Verify in the browser before claiming something works. Playwright is available; note that entry
  listing pages produce ~94 KB accessibility snapshots, so use targeted `page.evaluate()` counts and
  screenshots rather than full snapshots.
- A `serve.mjs` instance may still be running on port 4173 (`EADDRINUSE` on restart). Kill it or reuse it.
