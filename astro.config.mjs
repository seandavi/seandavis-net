import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeCitation from 'rehype-citation';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Astro 7 ships the Rust "Sätteri" Markdown engine by default-eligible, which
// does NOT run remark/rehype plugins. We pin the classic unified() processor so
// our academic plugins work: rehype-citation (Pandoc-style [@key] + bibliography)
// and remark-math/rehype-katex (equations). See README for the rationale.
export default defineConfig({
  site: 'https://seandavis.net',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeCitation,
          {
            bibliography: './src/content/references.bib',
            csl: 'apa',
            linkCitations: true,
          },
        ],
      ],
    }),
  },
});
