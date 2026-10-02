import { getCollection, type CollectionEntry } from 'astro:content';
import { SHOW_DRAFTS } from 'astro:env/server';

export type Post = CollectionEntry<'blog'>;

// Drafts render under `astro dev` and in builds run with SHOW_DRAFTS=1 (PR
// previews). A plain production build never routes or lists them.
export const draftsEnabled = import.meta.env.DEV || SHOW_DRAFTS === '1';

/** Every post that should be built and listed, newest first. */
export async function getVisiblePosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => draftsEnabled || !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
