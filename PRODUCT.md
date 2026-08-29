# Product

<!-- impeccable:product-schema 1 -->

Product truth for travelstorymaker.com. Confirmed with the owner on 2026-08-29 and cross-checked
against the repository. Visual decisions do not belong in this file — see `handoff.md` for the
engineering record.

## Platform

web

## Users

**Primary — confirmed by the owner:** someone preparing a trip who is looking for information about
a specific country. They arrive from a Google search on a country or a travel topic, usually on a
phone, sometimes on a slow connection, and they land directly on an interior page rather than the
homepage.

**Also served, by construction:** a casual reader who arrives on a single entry, reads one story,
quote or fun fact, and may browse a few more.

**Known tension, recorded deliberately:** the implementation today is a reading library — 1,000
short entries organised by type and region — while the primary user is stated to be someone with
trip intent. The 36 country pages and the 19 guides are the only surfaces that currently serve that
intent directly. Future product work should close this gap rather than assume it is already closed.

## Product Purpose

A free, independent library of travel writing — short travel stories, travel quotes, fun facts, plus
long-form guides and trip reports — published as plain, fast, static web pages.

**Success, as defined by the owner: advertising revenue.** Concretely, that means maximising pages
viewed per visit and time on site. Every product decision is therefore judged on whether it gets a
search visitor to a second and third page, and whether it keeps the site eligible for and compliant
with Google AdSense.

Nothing is sold, there is no account, no paywall, and no email is collected to read anything.

## Positioning

Free travel reading that renders as real HTML, indexes completely, and loads on a bad connection —
where the comparable content elsewhere sits behind app shells, cookie walls, newsletter gates or
listicle-grade SEO filler.

What a neighbouring product could not truthfully copy without rebuilding:

- Every one of the 114 pages is a real HTML file. There is no client-side routing and no hydration;
  search and filtering operate on markup already in the document, so a crawler sees all 1,000
  entries without executing JavaScript.
- Zero npm dependencies, in production and in development. The only third-party runtime request is
  the AdSense script.
- Fun facts are written in-house and checked, and 466 of the 506 carry a "Read more" link to a
  reference article — a starting point, deliberately not labelled as a source.
- Photography is CC-licensed, self-hosted rather than hotlinked, and credited with its licence on
  `/credits/`.

## Operating Context

- **Discovery is search.** Google is the distribution channel; the site has no app, no feed and no
  logged-in surface. Indexability is not an SEO chore here, it is the entire top of funnel.
- **Reading happens on a phone, often on poor wifi.** The stated design target is a page of text
  that loads in under a second on hotel wifi "in a valley somewhere".
- **AdSense is an operating constraint, not just a revenue line.** Publisher policy compliance,
  `ads.txt`, a Google-certified consent message for EEA/UK visitors, and visible separation between
  ads and editorial are all product requirements. Losing the AdSense account would remove the
  product's only source of revenue.
- **Deployment is Vercel from `main`.** Every deploy rebuilds the whole site from source; there is
  no CMS, no database and no admin interface. Publishing means editing a data file and pushing.
- **Editing is done by one person**, the owner, with AI assistance. There is no editorial team and
  no review queue.

## Capabilities and Constraints

**What exists today (verified against the build):**

- 1,000 entries — 506 fun facts, 294 stories, 200 quotes — across seven regions.
- 36 country pages with fact sheets and flags, 6 continent pages, 19 guides, 10 trip reports.
- Type collections, paginated listings (100 per page), and in-page search and filtering that work
  on already-rendered markup.
- Trust and legal pages: about, contact, FAQ, editorial policy, credits, terms, privacy, cookies,
  disclaimer.
- Machine files: `sitemap.xml`, `robots.txt`, `ads.txt`, `llms.txt`, plus a generated Open Graph
  image and icon set.
- Story submission is a `mailto:` flow. There is no form, no backend and no database anywhere in
  the product.

**Durable constraints future work must respect:**

- **Zero npm dependencies.** No `dependencies`, no `devDependencies`. Adding one requires the
  owner's agreement.
- **ESM only**, `.mjs`, no bundler, no transpiler, no test runner, no linter.
- **No client-side framework.** One stylesheet, one small script. Pages must be readable with
  JavaScript disabled.
- **Every route is a real HTML file** in its own directory; `trailingSlash: true`, `cleanUrls:
  false`. Changing this breaks every internal link, every canonical and every sitemap entry.
- **Assets are self-hosted and pre-generated.** Fonts, photos, flags and the hero images are
  committed binaries; the build only copies them. There is no image toolchain on the Vercel builder.
- **English only.** All site copy, metadata, code comments, commit messages and repository
  documentation are in English. The owner writes in French; the artefacts are English.
- **Content freshness is signalled by hand.** `SITE.contentUpdated` is a manual constant and must
  never be wired to the build clock.
- **The Content-Security-Policy is empirical.** It has silently broken AdSense and Google's consent
  message before. Any change to it must be verified by loading real pages in a browser and reading
  the console, never by reviewing the string.
- **`form-action 'none'`** is correct only because the product has zero `<form>` elements. Adding a
  real form is a policy change, not just a markup change.

**Explicitly undecided — do not resolve these by inference:**

1. **Trip-planning tools are intended to return to this domain.** The owner confirmed the intent;
   scope, timing and shape are undecided. The domain previously served a Next.js app with
   `/planner`, `/create`, `/export`, accounts and a client-side map key. This intent sits in direct
   tension with the zero-dependency static architecture, the no-form CSP, and the "no account, no
   paywall" promise made in the current site copy. When it is taken up it is an architecture
   decision, not a feature request.
2. **The 10 trip reports are written in the first person but are not the owner's own trips.**
   Flagged as a Google "helpful content" and AdSense authenticity risk. Reframe in the third person,
   or replace with real trips — unanswered.
3. **`AUTHOR.sameAs` still exposes the full surname** while the display name is "Benoit Ga", and it
   is emitted into around 20 JSON-LD blocks. Keep, replace or remove — unanswered.
4. **The GDPR consent message has not been published in the AdSense dashboard.** Until it is, EEA
   and UK visitors get no consent notice at all, because the hand-rolled banner was removed. The
   privacy and cookie pages already describe a consent message as present, so the copy is only
   accurate once it is live.

## Brand Commitments

- **Name:** TravelStoryMaker. **Tagline:** "Stories that make you pack a bag."
- **Author identity:** published as "Benoit Ga", founder and editor. The full surname is a privacy
  decision still open (above).
- **Voice:** plain, checked, free of preamble. Written for someone reading on a small screen with
  limited patience. British-leaning English spelling is used throughout.
- **Editorial promises made publicly on the site**, and therefore binding: no sponsored entries
  disguised as editorial, no affiliate links inside entries, advertisers have no influence or right
  of veto, ad units are visually distinct from entries, and confirmed factual errors are fixed.
- **Reference links on fun facts are labelled "Read more", never "Source"** — deliberate, because a
  minority point at a general country article rather than at the specific fact.
- **Flags are PNG images, never emoji.** Regional-indicator emoji do not render on Windows.
- Existing assets: logo (`public/assets/img/logo.svg`), hero illustration, favicon set.
- Social accounts exist on TikTok, Instagram, Facebook, X and YouTube and are linked in the footer.

## Evidence on Hand

Real, in the repository:

- 1,000 written entries, ten data files, `src/data/`.
- 98 CC / CC0 photographs from Wikimedia Commons, self-hosted, each credited with its licence on
  `/credits/` — manifest at `src/generated/photos.json`.
- 35 country flags, 466 resolved reference links (`src/generated/factlinks.json`).
- 19 guides (`src/articles/`), 10 trip reports (`src/blog/`), 36 country profiles with fact sheets
  (`src/countries.mjs`, `src/country-facts.mjs`).
- A verified programmatic SEO audit and security review, both dated 2026-08-28, recorded in
  `handoff.md`.

Deliberately absent — future work must not invent these:

- No testimonials, no named customers, no partner or press mentions.
- No published traffic, revenue or audience figures.
- No first-hand reportage: the trip reports are not the owner's trips, and the stories are narrative
  vignettes rather than verified accounts. The FAQ already says so; keep it that way.
- One photo, `home-hero.jpg`, is credited on `/credits/` but appears nowhere on the site. It is
  either given a use or removed from the manifest — it must not stay credited and unused.

## Product Principles

1. **Indexability is distribution.** If a crawler cannot read it without running JavaScript, it does
   not exist. This outranks any architectural convenience.
2. **Ad revenue is the business, so ad policy is a product requirement.** Consent, `ads.txt`,
   editorial separation and content authenticity are not compliance chores; they protect the only
   income the product has.
3. **Depth of visit is the metric that matters.** Success is a search visitor reaching a second and
   third page. Internal routes between entries, countries and guides earn their place; dead ends do
   not.
4. **Fast on a bad connection, on a cheap phone.** Byte budgets and deterministic audits are the
   judge, never a noisy Lighthouse score — and never by making the LCP image lazy to game a number.
5. **Say what the content actually is.** Stories are vignettes, facts are checked, reference links
   are starting points. Overclaiming is both an AdSense risk and a breach of what the site already
   tells its readers.
6. **No dependencies, no toolchain.** Every capability is either written here or pre-generated and
   committed. This is a deliberate constraint, not an oversight.

## Accessibility & Inclusion

No formal conformance target has been set by the owner. The following are established product
behaviours and are treated as the floor:

- Every page must be fully readable and navigable with JavaScript disabled.
- Motion respects `prefers-reduced-motion`; the hero animation disables itself.
- Country flags are images with appropriate `alt` handling — descriptive on fact sheets, `alt=""`
  and `aria-hidden` on cards where the country name sits alongside.
- The site is written for slow connections and small screens as the default case, not the edge case.
- Lighthouse accessibility measured at 96 on mobile (2026-08-28); the residual failures come from
  inside Google's consent dialog markup, not from this codebase.
