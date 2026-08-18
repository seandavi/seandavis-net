import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Human-readable heading for each group, used on both the homepage and /projects. */
export const GROUP_LABELS = {
  flagship: 'Selected work',
  apps: 'Apps',
  ai: 'AI & agentic tooling',
  bioc: 'Bioconductor & data tools',
} as const;

export type Group = keyof typeof GROUP_LABELS;

/** Every live project, sorted by `order` then name. Offline entries are dropped. */
export async function liveProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (p) => p.data.status === 'live');
  return all.sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}

/** Live projects in one group. */
export function inGroup(projects: Project[], group: Group): Project[] {
  return projects.filter((p) => p.data.group === group);
}

/** "3,789 stars · Bioconductor · uniformly processed" — the meta line under a name. */
export function metaLine(p: Project['data']): string[] {
  const bits: string[] = [];
  if (p.stars !== undefined) bits.push(`${p.stars.toLocaleString('en-US')} stars`);
  bits.push(p.home);
  if (p.meta) bits.push(p.meta);
  return bits;
}
