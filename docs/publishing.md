# Publishing architecture

This site has two publishing jobs with different needs:

1. a portfolio and notes site with structured project, publication, and CV data; and
2. occasional scholarly or computational documents with citations, numbered artifacts, and executable code.

Astro remains the site framework. Quarto is an authoring and rendering tool for documents that need its computational or multi-format features, not a replacement for the whole site.

## What Astro owns

Astro owns the homepage, project directory, publications, biography, notes index, routes, shared layout, RSS, image optimization, and Cloudflare build. Ordinary notes stay in `src/content/blog` as Markdown.

The Markdown pipeline is pinned to Unified in `astro.config.mjs`. It currently provides:

- Pandoc-style citations through `rehype-citation` and `src/content/references.bib`;
- math through `remark-math`, `rehype-katex`, and KaTeX;
- fenced-code highlighting through Shiki;
- GitHub-Flavored Markdown tables; and
- optimized co-located images through Astro's asset pipeline.

This is enough for prose, static code examples, equations, citations, ordinary tables, and figures whose outputs can be committed as assets. Keeping these posts Astro-native preserves the site's layout, draft handling, RSS, lightbox, fast Node-only build, and single content model.

Captions and basic figure/table cross-references are feasible as another Unified transform. Add them only when a real post needs them, and protect the syntax with rendering fixtures. A small plugin is appropriate for document-local figures and tables; it should not grow into a local reimplementation of Pandoc's cross-reference system.

## What Quarto owns

Use Quarto when execution is part of the document's reproducibility contract, or when the output needs document features substantially beyond a blog post. Examples include:

- R, Python, Julia, or Jupyter/Knitr execution;
- inline computed values;
- computed figures and tables tied to code-cell labels;
- extensive figure, table, equation, theorem, or section cross-references;
- subfigures, chapter-aware numbering, or complex float layouts; and
- output to PDF, Word, EPUB, or another format in addition to HTML.

Large papers, books, reports, courses, and cross-reference-heavy documents should remain standalone Quarto publications linked from this site. This is the cleanest seam: Quarto owns execution, dependencies, citations, cross-references, and document assets; Astro owns discovery and the portfolio.

A shared Quarto HTML format may reuse this site's colors, typography, analytics, and navigation conventions. Sharing a theme is preferable to making Astro parse and restyle Quarto's complete HTML output.

## Computational notes inside the site

If a future note needs literate programming but should still appear as a normal Astro article, use Quarto as an explicit preprocessor:

```text
computations/<slug>/index.qmd
        |
        | quarto render --to gfm
        v
generated blog Markdown + generated assets
        |
        | Astro content collection
        v
normal Astro article route
```

This path should begin as a one-post pilot. Quarto's GFM output resolves captions and cross-references, but it also emits raw HTML containers and Quarto-specific classes. Asset paths, bibliography output, raw HTML handling, RSS, and image behavior therefore need end-to-end fixtures before this becomes a supported authoring path.

Keep source and generated files separate. Generated Markdown must not be edited by hand. Use a repository-owned render script rather than an implicit content loader, so the build boundary and failure modes remain visible.

Do not execute R or Python silently during every ordinary Astro build. Prefer one of these policies:

- run an explicit `render:computations` command and commit its generated artifacts; or
- execute in a dedicated CI job with locked `renv`, `uv`, or equivalent environments, then build Astro from the results.

Network access and expensive computations should be opt-in. A site build should not depend on a live API returning the same result indefinitely.

## Capability guide

| Need | Astro Markdown | Quarto |
|---|---|---|
| Prose, code examples, math, static figures and tables | Default | Unnecessary overhead |
| BibTeX/CSL citations in an HTML note | Already supported | Also supported |
| Simple document-local figure/table captions and references | Add a focused Unified plugin | Built in |
| Computed figures, tables, and inline values | Separate preprocessing required | Built in through Knitr/Jupyter |
| Extensive or chapter-aware cross-references | Poor fit | Built in |
| Interactive tables or visualizations | Astro/MDX component or client island | Computational HTML output/widgets |
| PDF, Word, EPUB, or book output | Poor fit | Built in |
| Portfolio pages and typed project/CV data | Native fit | Poorer fit |

## Decision rule

- If code is illustrative and its outputs can be committed, use Astro Markdown.
- If executing the code is part of what the document promises, use Quarto.
- If a document needs multiple output formats or a large cross-reference graph, let Quarto own the complete document.
- Do not migrate the portfolio site to Quarto solely to gain document features that apply to a minority of pages.

Revisit this boundary after the first computational-note pilot. Evaluate the generated files, local authoring loop, CI time, asset handling, and long-term dependency cost from that concrete example before generalizing the pipeline.
