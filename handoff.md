# Handoff — travelstorymaker.com (static site)

Context transfer for continuing work in another AI tool. Written 2026-08-28.
Everything below was verified against the repo, not recalled from memory.

---

## 1. What this project is

A **fully static** website for `https://www.travelstorymaker.com`: a free reading library of
short travel stories, travel quotes and fun facts, plus long-form guides and trip reports.

It was built from scratch to replace a Next.js app (which still lives at `c:\REPOS\VIBE\travelstorymaker`
and, at time of writing, is still what the domain actually serves).

**Why static:** the two driving requirements from the owner were
(a) maximum Google indexability and (b) getting approved by Google AdSense.
Both favour plain HTML that renders without JavaScript.

**Design brief:** "moderne et incite au voyage" — modern, and it should make you want to travel.

---

## 2. Hard constraints — do not break these

| Constraint | Why |
| --- | --- |
| **Zero npm dependencies** | Deliberate. `package.json` has no `dependencies` and no `devDependencies`. Do not add any without asking. |
| **ESM only** | `"type": "module"`. Use `.mjs`, `import`, top-level `await`. |
| **No client-side framework** | One small stylesheet, one small script. Pages must be readable with JS disabled. |
| **Every page is a real HTML file** | No client-side routing, no hydration. |
| **Self-hosted assets** | Fonts and photos are served from our own origin. The only third-party request is AdSense. |
| **English only** | All site copy, metadata and UI text is in English. Never introduce French or any other language into the site, the source, or repo documentation. The owner writes to you in French; you still produce English. |

Node version in use locally: **22.14.0**. Vercel builds on its own Node runtime — avoid bleeding-edge syntax.

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
│   └── assets/{css/style.css, js/app.js, fonts/*.woff2, img/{logo.svg, photos/, flags/}}
├── src/
│   ├── layout.mjs             SITE + AUTHOR config, page shell, nav, footer, esc(), page()
│   ├── components.mjs         entryCard(), entryList(), toolbar(), pagination(), regionTile()
│   ├── photos.mjs             photo(), hasPhoto(), heroBackdrop(), figure(), thumb()
│   ├── flags.mjs              hasFlag(), flagImg()  — scans public/assets/img/flags at build time
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

- 1000 entries — 506 `fact`, 294 `story`, 200 `quote`
- by region — europe 185, asia 215, africa 149, americas 189, oceania 64, polar 14, world 184
- 36 country pages, 19 guides, 10 trip reports, 98 photos, 35 flags, 466 fact links
- **114 pages**, 113 URLs in `sitemap.xml`

### `interleaveByType()` — the single most important function

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
| `fonts.json` | array of 6 `@font-face` descriptors (family, style, weight, unicode-range, src) | woff2 files live in `public/assets/fonts/`. Both a full and a `-latin` variant exist per face; the Latin ones are ~10 KB vs ~48 KB. |
| `photos.json` | 98 slots → `{ src, alt, author, license, sourceUrl }` | Wikimedia Commons, CC / CC0 |
| `factlinks.json` | 466 keys `"title\|place"` → `{ title, url }` | Wikipedia "Read more" links on fun facts |

`factlinks.json` is keyed by **`title|place`, never by numeric id** — ids shift whenever entry data is
reordered, which would silently mis-assign links.

The fetcher caches: existing keys/files are skipped. To re-resolve one fact, delete its key and re-run.
To force a specific link, hand-edit the value — it will be preserved.

---

## 7. Hard-won gotchas

These all cost real debugging time. Do not rediscover them.

1. **HTML `width`/`height` attributes beat CSS `aspect-ratio`.** A card was rendering 815px tall
   instead of 271px. `.collage__card img` needs an explicit `height: auto` for `aspect-ratio` to win.
   Keep the attributes anyway — they prevent layout shift.

2. **Media queries do not add specificity.** `.site-header--on-dark .nav a` (0,2,1) beat `.nav a`
   (0,1,1) inside a media query, giving a white-on-white mobile menu. Fix by matching specificity,
   not by wrapping in a media query.

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

8. **`requestAnimationFrame` is frozen in background tabs**, so an rAF-throttled scroll handler meant
   the back-to-top button never appeared. Throttling removed.

9. **Naive Wikipedia matching produces absurd links.** "Switzerland has bunkers *everywhere*" matched
   the article "To Be Everywhere Is to Be Nowhere" on one shared generic word. `score()` in
   `fetch-assets.mjs` now requires either a token shared with the **place** or at least two shared
   tokens, and ranks place-matches higher. 40 facts resolve to nothing rather than to something wrong.

---

## 8. Deployment

**Vercel, from the `main` branch of the GitHub repo.** Nothing else. There is no GitHub Pages site,
no Netlify, no manual upload.

`vercel.json` declares everything:

- `buildCommand: node build.mjs`, `outputDirectory: dist`, `framework: null`
- In the Vercel dashboard the **Framework Preset must be `Other`**. Anything else makes Vercel try to
  detect a framework and the build fails or produces the wrong output directory.
- `trailingSlash: true`, `cleanUrls: false` — every route is a directory containing `index.html`,
  so URLs end with `/`. Changing this would break every internal link and every sitemap entry.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, HSTS).
- Cache headers: `/assets/*` immutable for a year, icons for a week, `ads.txt` for an hour.
- Explicit `Content-Type` for `ads.txt`, `llms.txt` and `site.webmanifest`.
- **Seven permanent 301 redirects** from old `/blog/*` guide URLs to their new `/guides/*` homes.
  These preserve inbound links and search rankings for content published under the old structure —
  do not remove them.

A `.github/workflows/deploy.yml` that published to GitHub Pages existed until 2026-08-28. It was
deleted because nothing was ever deployed from it; it only consumed Actions minutes and duplicated
the Vercel build with a config that lacked the redirects above. The `.nojekyll` file that `build.mjs`
used to emit was removed at the same time — it only ever mattered to GitHub Pages.

**DNS has not been switched.** `travelstorymaker.com` still resolves to the old Next.js app in
`c:\REPOS\VIBE\travelstorymaker`. Cutting over is an outstanding task.

---

## 9. Git state

```
remote  https://github.com/Benoit-Gaumard/travelstorymakerstatic.git
branch  main  (last commit at handoff: 2eedf24 "feat: new version")
```

**Uncommitted at handoff time:**

```
 D .github/workflows/deploy.yml     removed: GitHub Pages was never used
 M .gitignore                       added dist/
 M public/assets/css/style.css      hero collage styles
 M src/pages/home.mjs               split hero + collage markup
?? handoff.md                       this file
D  dist/**                          ~275 files removed from the git index only
```

The `dist/` deletions are index-only. The directory is intact on disk and the preview server still
works. Do not be alarmed by the size of the diff.

The homepage hero work is complete and verified at 1440 / 1024 / 390 px, just not committed.

---

## 10. Recently completed work

**Fun-fact reference links.** Every fun fact card can render `Read more: <Article> ↗` linking to
Wikipedia. 466 of 506 resolved. Rendered by `entryCard()` in `src/components.mjs`, styled `.entry__ref`.
The label says "Read more", not "Source" — deliberately, because Wikipedia is a starting point, not a
citation, and a minority of links point at the general country article rather than the specific fact.
Do not relabel these as sources.

**Country flags.** `src/flags.mjs` was extracted so both the `/destinations/` country cards
(`.post-card__title-flag`, 30×20) and the country page fact sheets (`.factsheet__flag`, 72×48) share
one implementation. On the cards the flag is `alt=""` + `aria-hidden` because the country name sits
right beside it; on fact sheets it keeps a descriptive `alt`.

**Homepage hero.** Rebuilt as a two-column `hero--split`: copy left, a 2×2 tilted photo collage right
(Greece, Norway aurora, Peru, Thailand), over a navy→violet radial gradient with blurred colour blobs.
Inspired by tripkygo.com. The old washed-out aeroplane-wing backdrop was removed. Cards drift 12px on
a 9s loop, disabled under `prefers-reduced-motion`; two of four are hidden below 560px.

---

## 11. Open items the owner has not decided

1. **`AUTHOR.sameAs` still exposes the full surname.** The display name was changed to "Benoit Ga"
   across 65 occurrences, but `sameAs: ['https://github.com/Benoit-Gaumard']` in `src/layout.mjs`
   still reveals it, and it is emitted into ~20 JSON-LD blocks. Keep / replace / remove — unanswered.

2. **The 10 trip reports are written in the first person but are not the owner's actual trips.**
   This was flagged as a Google "helpful content" and AdSense authenticity risk. Options offered:
   reframe as suggested itineraries in the third person, or replace with real trips. Unanswered.

3. **`home-hero.jpg` (~300 KB) is now unreferenced** after the hero redesign, but is still shipped in
   `public/` and still listed on `/credits/` — a credits page naming a photo that appears nowhere.
   Remove it from `photos.json`, `public/assets/img/photos/`, and the `GENERIC` slot list in
   `tools/fetch-assets.mjs`, or find it a use.

4. **Image sizing.** All photos are served at 1280px wide. The hero collage displays them at 222px.
   No responsive `srcset` anywhere. If Lighthouse LCP becomes a problem, generating 480px variants is
   the real fix, not more `fetchpriority` hints.

---

## 12. Working agreement with the owner

- **Language.** The owner writes to you in French. Every artefact you produce — site copy, metadata,
  code comments, commit messages, repo documentation — is in **English**. Verified on 2026-08-28:
  the only French-looking strings in `src/` are proper nouns (La Paz, La Tomatina, Piton de la
  Fournaise) and one quote entry that cites the phrase "Bon voyage" and explains it in English.
  Keep it that way.
- He explicitly and repeatedly asks for honest critique ("il manque quoi selon toi ?", "quel est
  l'avantage ?") and acts on it. **Do not oversell finished work.** State what is not done, what is
  approximate, and what carries risk — that is what he is paying attention to.
- He will correct you on facts about his own infrastructure. When he does, fix the record rather than
  defending the earlier guess.
- Verify in the browser before claiming something works. Playwright is available; note that entry
  listing pages produce ~94 KB accessibility snapshots, so use targeted `page.evaluate()` counts and
  screenshots rather than full snapshots.
- A `serve.mjs` instance may still be running on port 4173 (`EADDRINUSE` on restart). Kill it or reuse it.
