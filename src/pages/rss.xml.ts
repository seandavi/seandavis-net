import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getVisiblePosts } from '../lib/blog';

// Newest first, archived posts included. Drafts are filtered explicitly so the
// feed never carries them, even in SHOW_DRAFTS=1 preview builds.
export async function GET(context: APIContext) {
  const posts = (await getVisiblePosts()).filter((p) => !p.data.draft);
  return rss({
    title: 'Sean Davis — Notes',
    description: 'Release notes, build logs, and short technical pieces.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      link: `/blog/${p.id}/`,
      pubDate: p.data.date,
      description: p.data.description,
    })),
  });
}
