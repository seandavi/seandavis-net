import { defineConfig, envField } from 'astro/config';
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
  env: {
    schema: {
      // Build-time flag: SHOW_DRAFTS=1 routes and lists draft posts (PR previews).
      // Unset in production deploys. `astro dev` shows drafts regardless.
      SHOW_DRAFTS: envField.enum({
        context: 'server',
        access: 'public',
        values: ['0', '1'],
        default: '0',
      }),
    },
  },
  markdown: {
    // Shiki highlights fenced code inside the unified() pipeline. A light theme
    // sits on the paper palette; global.css swaps its background for --paper-2.
    shikiConfig: { theme: 'github-light' },
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
