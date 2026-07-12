# seandavi.net

Personal portfolio hub for Sean Davis — physician-scientist, open software and data for
cancer research. This site is the **superset front door** for the whole body of work;
`cancerdatasci.org` is the operational home for the data-infrastructure subset and will
`301`-redirect its apex here. Replaces the dormant `seandavi.github.io` (Hugo/HugoBlox).

## Stack

- **Astro 7** (static output), deployed to **Cloudflare Pages** (planned; domain not yet registered).
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
    talks/index.astro    # talks LISTING (data-driven); talks themselves live at linked sites
    blog/index.astro     # notes listing
    blog/[...slug].astro # note rendering (citations + math work here)
  content/
    blog/                # markdown posts (agent-drafted posts drop in here)
    references.bib       # bibliography for citations
  content.config.ts      # blog collection schema
  data/talks.json        # curated/deduped talk listing (seed; keep current here)
  layouts/Base.astro
  styles/global.css      # design tokens + styles
public/
  favicon.svg
  files/CV.pdf           # TODO: add the hosted CV
```

## Content model

- **Talks:** the *listing* is native (`src/data/talks.json`); each entry links out to its rendered
  Quarto page. Seeded from the `seandavi/talks` archive and deduped (the archive repeats the same
  course lectures each semester). Append new talks here as they happen.
- **Blog / notes:** markdown files in `src/content/blog/`. Citations and math render natively — see
  `rendering-citations-in-astro.md` for the proof-of-concept.

## TODO before / at launch

- Register **seandavi.net** (Cloudflare Registrar); add zone; wire Cloudflare Pages.
- Add the Cloudflare adapter/deploy config and `301`s from `seandavi.github.io` and the
  `cancerdatasci.org` apex.
- **Self-host a display serif** (Source Serif 4 / Newsreader / Charter) instead of the system stack.
- **ORCID publications sync:** build-time fetch of `pub.orcid.org/v3.0/0000-0002-8991-6458/works`
  → generated publications page (keeps pubs current without hand-editing).
- Add `public/files/CV.pdf`.
- Consider moving the talks site to `talks.seandavi.net` (needs the talk sources committed upstream).

Decision record and rationale: vault note `notes/seandavi-net-personal-hub.md`.
