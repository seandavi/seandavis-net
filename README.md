# seandavis.net

Personal portfolio hub for Sean Davis — physician-scientist, open software and data for
cancer research. This site is the **superset front door** for the whole body of work;
`cancerdatasci.org` is the operational home for the data-infrastructure subset and will
`301`-redirect its apex here. Replaces the dormant `seandavi.github.io` (Hugo/HugoBlox).

## Stack

- **Astro 7** (static output), deployed as a **Cloudflare Worker with static assets** via
  wrangler — same pattern as the talks site (domain `seandavis.net` registered 2026-07-22;
  Worker wiring for this site still pending).
- **Markdown pipeline pinned to `unified()`** via `@astrojs/markdown-remark`, *not* the default
  Rust "Sätteri" engine — because Sätteri does not run remark/rehype plugins and we need them.
- **Citations:** `rehype-citation` (Pandoc-style `[@key]`, BibTeX, APA CSL, auto-bibliography).
- **Math:** `remark-math` + `rehype-katex`.

Heavy academic documents (papers, books, crossref-numbered Quarto docs) stay in **Quarto**,
published standalone and *linked* — not reproduced here. See the Writing/Talks sections.

## Commands

```
npm install       # install dependencies (first run)
npm run dev        # local dev server
npm run build      # static build -> dist/
npm run preview    # preview the build
```

## Structure

```
src/
  pages/
    index.astro          # the portfolio hub (one page)
    404.astro            # not-found page (wrangler serves the built 404.html)
    blog/index.astro     # notes listing
    blog/[...slug].astro # note rendering (citations + math work here)
  content/
    blog/                # markdown posts (agent-drafted posts drop in here)
    references.bib       # bibliography for citations
  content.config.ts      # blog collection schema
  layouts/Base.astro
  styles/global.css      # design tokens + styles
public/
  favicon.svg
  files/CV.pdf           # hosted CV (typst build from the curriculumvitae repo)
worker.js                # www → apex 301; serves dist/ assets otherwise
wrangler.jsonc           # Cloudflare Workers deploy config (see DEPLOY.md)
```

## Content model

- **Talks:** live entirely at [talks.seandavis.net](https://talks.seandavis.net) (the sibling
  talks Worker); this site just links there. The old native listing (`src/data/talks.json` +
  `/talks` page) was removed 2026-07-24 — it pointed at stale `seandavi.github.io/talks/` URLs.
- **Blog / notes:** markdown files in `src/content/blog/`. Citations and math render natively — see
  `rendering-citations-in-astro.md` for the proof-of-concept.

## TODO before / at launch

- ~~Register the domain~~ **Done 2026-07-22: registered `seandavis.net`** — note the final S:
  `seandavi` stays the username/handle; `seandavis` is the personal identity the site represents.
  Still to do: wire the Worker-with-assets deploy (wrangler) for this site.
- Add the Cloudflare adapter/deploy config and `301`s from `seandavi.github.io` and the
  `cancerdatasci.org` apex.
- **Self-host a display serif** (Source Serif 4 / Newsreader / Charter) instead of the system stack.
- **ORCID publications sync:** build-time fetch of `pub.orcid.org/v3.0/0000-0002-8991-6458/works`
  → generated publications page (keeps pubs current without hand-editing).
- Add `public/files/CV.pdf`.
- ~~Consider moving the talks site~~ **Done 2026-07-22: talks live at `talks.seandavis.net`**
  (Cloudflare Pages; talk sources committed upstream).

Decision record and rationale: vault note `notes/seandavi-net-personal-hub.md`.
