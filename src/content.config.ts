import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog / notes — agent-drafted posts drop in as markdown files here.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
