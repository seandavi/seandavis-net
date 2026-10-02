import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog / notes. A post is `<slug>.md`, or `<slug>/index.md` with co-located
// images referenced relatively; both route to /blog/<slug>/. Visibility
// (drafts) and ordering live in src/lib/blog.ts.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Original publication (or draft) date.
    date: z.coerce.date(),
    description: z.string().optional(),
    // Drafts render only under `astro dev` and SHOW_DRAFTS=1 builds (PR previews).
    draft: z.boolean().default(false),
    // Old post kept for the record: listed under "Archive" with a dated-content note.
    archived: z.boolean().default(false),
    // Former URL paths (e.g. on seandavi.github.io); data for future redirects.
    aliases: z.array(z.string()).default([]),
    // Disclosure rendered only as <meta name="ai-assistance">, never in the prose.
    aiAssistance: z.string().optional(),
  }),
});

// Projects — the single source of truth for the project directory. `/projects`
// renders every live entry; the homepage renders `featured: true` from the same
// data, so the two can't drift. Adding a project means adding one YAML file.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    // Shown verbatim on both the homepage and /projects.
    description: z.string(),
    url: z.string().url(),
    // Call-to-action wording — "Docs" for documentation sites, "Open" for apps.
    linkLabel: z.string().default('Open'),
    // Where the thing actually lives: cancerdatasci.org, Bioconductor, GitHub…
    home: z.string(),
    // Optional qualifier rendered after the home badge.
    meta: z.string().optional(),
    stars: z.number().optional(),
    group: z.enum(['flagship', 'apps', 'ai', 'bioc']),
    featured: z.boolean().default(false),
    // Lower sorts first; ties fall back to name.
    order: z.number().default(100),
    // `offline` entries are kept for the record but rendered nowhere. Flip back
    // to `live` once the host is reachable again.
    status: z.enum(['live', 'offline']).default('live'),
  }),
});

export const collections = { blog, projects };
