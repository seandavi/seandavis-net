# seandavis.net

Personal portfolio hub for Sean Davis — physician-scientist, open software and data for
cancer research. This site is the **superset front door** for the whole body of work;
`cancerdatasci.org` is the operational home for the data-infrastructure subset and its apex
`301`-redirects here (to `/projects`). Replaces the dormant `seandavi.github.io` (Hugo/HugoBlox).

## Stack

- **Astro 7** (static output), deployed as a **Cloudflare Worker with static assets** via
  wrangler — same pattern as the talks site (domain `seandavis.net` registered 2026-07-22;
  live since 2026-07-24; CI deploys on push to `main`, PRs get a `workers.dev` preview).
- **Markdown pipeline pinned to `unified()`** via `@astrojs/markdown-remark`, *not* the default
  Rust "Sätteri" engine — because Sätteri does not run remark/rehype plugins and we need them.
- **Citations:** `rehype-citation` (Pandoc-style `[@key]`, BibTeX, APA CSL, auto-bibliography).
- **Math:** `remark-math` + `rehype-katex`.
- **Type:** Source Serif 4 (SIL OFL), self-hosted from `@fontsource-variable/source-serif-4`
  (variable `opsz` + `wght`, upright and italic, `font-display: swap`); the old system serif
  stack stays as fallback in `--serif`. Unicode-range subsets mean browsers fetch only Latin.
- **Analytics:** GA4 `G-KLLV1GCF4E`, `content_group: 'seandavis-net'`, hand-written gtag in
  `Base.astro` that loads only when the host is exactly `seandavis.net` (no previews/localhost).

Heavy academic documents (papers, books, crossref-numbered Quarto docs) stay in **Quarto**,
published standalone and *linked* — not reproduced here. See the Writing/Talks sections.

## Commands

```
npm install       # install dependencies (first run)
npm run dev        # local dev server
npm run build      # static build -> dist/
npm run preview    # preview the build
npm run update:bioc-stats  # refresh src/data/bioc-stats.json (last complete year); commit it
```

## Structure

```
src/
  pages/
    index.astro          # the portfolio hub (one page)
    projects.astro       # the full project directory (cancerdatasci.org apex 301s here)
    publications.astro   # selected publications + current funding (from src/data/cv/)
    404.astro            # not-found page (wrangler serves the built 404.html)
    blog/index.astro     # notes listing
    blog/[...slug].astro # note rendering (citations + math work here)
  content/
    blog/                # markdown posts (agent-drafted posts drop in here)
    projects/            # one YAML file per project — source of truth for / and /projects
    references.bib       # bibliography for citations
  content.config.ts      # blog + projects collection schemas
  data/bioc-stats.json   # generated Bioconductor download stats (npm run update:bioc-stats)
  data/cv/               # CV exports (meta, publications, grants); written by `just publish-site`
  lib/projects.ts        # shared sorting/grouping/meta line for the projects collection
  lib/blog.ts            # which posts are built/listed (drafts), newest first
  lib/cv.ts              # reads src/data/cv/ for /publications, the funding line, and CV dates
  layouts/Base.astro
  styles/global.css      # design tokens + styles
public/
  favicon.svg
  files/CV.pdf           # hosted CV, written by `just publish-site` in the curriculumvitae repo
scripts/
  update-bioc-stats.mjs  # writes src/data/bioc-stats.json from bioconductor.org stats files
worker.js                # www → apex 301, cancerdatasci.org → /projects 301; serves dist/ otherwise
wrangler.jsonc           # Cloudflare Workers deploy config (see DEPLOY.md)
```

## Content model

- **Talks:** live entirely at [talks.seandavis.net](https://talks.seandavis.net) (the sibling
  talks Worker); this site just links there. The old native listing (`src/data/talks.json` +
  `/talks` page) was removed 2026-07-24 — it pointed at stale `seandavi.github.io/talks/` URLs.
- **Blog / notes:** `src/content/blog/<slug>.md`, or `<slug>/index.md` with co-located images
  referenced relatively; both publish at `/blog/<slug>/`. Frontmatter: `title`, `date` (original
  publication date), optional `description`, and:
  - `draft` (default `false`): drafts render under `npm run dev` and in PR previews (built with
    `SHOW_DRAFTS=1`) with a banner and `noindex`; production builds give them no URL.
  - `archived` (default `false`): listed under "Archive" with a "written in <year>" note.
  - `aliases` (default `[]`): old URL paths (e.g. on `seandavi.github.io`), kept for future redirects.
  - `aiAssistance` (optional): rendered only as `<meta name="ai-assistance">`, never in the prose.

  Citations and math render natively; `rendering-citations-in-astro.md` is the (draft) rendering
  fixture. Fenced code is highlighted by Shiki.
- **Projects:** one YAML file per project in `src/content/projects/`. `/projects` renders every
  entry grouped by `group`; the homepage renders `featured: true` from the *same* collection, so the
  two can't drift. `status: offline` keeps an entry on record without rendering it anywhere.
  Adding a project is one new file; no page edits. Optional fields, all from public data:
  - `bioc: <Package>`: Bioconductor package name. The meta line shows its downloads for the year
    in `src/data/bioc-stats.json` in place of stars. `npm run update:bioc-stats` (optionally
    `-- <year>`, default the last complete calendar year) fetches
    `bioconductor.org/packages/stats/{bioc,data-experiment}/<pkg>/<pkg>_<year>_stats.tab` for
    every `bioc` entry and rewrites the JSON; commit the result. The build only reads it and fails
    if a `bioc` package is missing from it.
  - `role`: `created | maintains | co-maintains | contributed`, from the package's DESCRIPTION
    Author/Maintainer, GitHub ownership and commit history, or the CV. Leave it out when the
    record doesn't settle it. Shown on `/projects` as Creator / Maintainer / Co-maintainer /
    Contributor.
  - `lifecycle`: `active` (default) `| maintained-elsewhere | retired`, plus optional
    `successor: { name, url }`. Set only on hard evidence: Bioconductor deprecation or removal, an
    archived repo, or an explicit README statement; never from inactivity. Non-active entries get
    a badge on `/projects`; `retired` ones move to a "Retired" group at the bottom and drop out of
    the homepage lists.
  - `paper: { title, url }`: the paper to cite (DOI link), from the package CITATION or the CV.
    Rendered as a "Paper" link on `/projects` and in homepage Selected work.
- **CV, publications, funding:** generated from Sean's private `curriculumvitae` repo so the CV
  and the site can't drift. To update them, edit the CV data there, then run
  `just publish-site SITE=../seandavis-net` from that repo and commit the results here. It builds
  the CV PDF, copies it to `public/files/CV.pdf`, and writes `src/data/cv/meta.json` (the CV
  build date shown on the CV links), `publications.json` (selected publications and Google
  Scholar totals), and `grants.json` (current grants only, linked to NIH RePORTER). The export is
  limited to what the public CV PDF already prints: no dollar amounts, no pending or completed
  grants, no other-support data. Don't edit these files by hand.

## Writing

- **Backlog:** post topics are GitHub issues labelled
  [`post-idea`](https://github.com/seandavi/seandavis-net/issues?q=is%3Aopen+label%3Apost-idea);
  add one with the "Post idea" issue form.
- **Process:** the `blog-post` skill (`.claude/skills/blog-post/SKILL.md`) walks a topic from
  backlog through brief, outline, draft PR (`post/<slug>`), voice pass, review, and publish.
- **Voice:** `docs/voice.md` is the style guide every draft is checked against.

## TODO before / at launch

- ~~Register the domain~~ **Done 2026-07-22: registered `seandavis.net`** — note the final S:
  `seandavi` stays the username/handle; `seandavis` is the personal identity the site represents.
- ~~Wire the Worker-with-assets deploy~~ **Done 2026-07-24** (wrangler; see DEPLOY.md).
- ~~`cancerdatasci.org` apex 301~~ **Deployed 2026-08-18** (apex + www attached to this Worker,
  redirecting to `/projects`; verified 301 → `https://seandavis.net/projects/` 2026-10-02).
- **Retire `seandavi.github.io`** — waits on porting the old blog posts here so their URLs can
  redirect.
- ~~Self-host a display serif~~ **Done 2026-10-03:** Source Serif 4 via `@fontsource-variable/source-serif-4`.
- **ORCID publications sync:** build-time fetch of `pub.orcid.org/v3.0/0000-0002-8991-6458/works`
  → generated publications page (keeps pubs current without hand-editing).
- ~~Consider moving the talks site~~ **Done 2026-07-22: talks live at `talks.seandavis.net`**
  (Cloudflare Pages; talk sources committed upstream).

Decision record and rationale: vault note `notes/seandavi-net-personal-hub.md`.
