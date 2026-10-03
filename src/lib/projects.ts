import { getCollection, type CollectionEntry } from 'astro:content';
import biocStats from '../data/bioc-stats.json';

export type Project = CollectionEntry<'projects'>;

/** Human-readable heading for each group, used on both the homepage and /projects. */
export const GROUP_LABELS = {
  flagship: 'Selected work',
  apps: 'Apps',
  ai: 'AI & agentic tooling',
  bioc: 'Bioconductor & data tools',
} as const;

export type Group = keyof typeof GROUP_LABELS;

/** How Sean's part in a project reads in its meta line. */
export const ROLE_LABELS = {
  created: 'Creator',
  maintains: 'Maintainer',
  'co-maintains': 'Co-maintainer',
  contributed: 'Contributor',
} as const;

/** Badge text for any lifecycle other than `active`. */
export const LIFECYCLE_LABELS = {
  'maintained-elsewhere': 'Maintained elsewhere',
  retired: 'Retired',
} as const;

/** Every live project, sorted by `order` then name. Offline entries are dropped. */
export async function liveProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (p) => p.data.status === 'live');
  return all.sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}

/** Live, non-retired projects in one group. Retired entries are listed on their own. */
export function inGroup(projects: Project[], group: Group): Project[] {
  return projects.filter((p) => p.data.group === group && p.data.lifecycle !== 'retired');
}

/**
 * "314,396 downloads in 2025" from the committed Bioconductor stats, or
 * undefined for non-Bioconductor projects. A `bioc` package missing from the
 * JSON fails the build so a stale file can't silently drop a number.
 */
export function usage(p: Project['data']): string | undefined {
  if (!p.bioc) return undefined;
  const stats = (biocStats.packages as Record<string, { downloads: number }>)[p.bioc];
  if (!stats) {
    throw new Error(`No Bioconductor stats for ${p.bioc}; run npm run update:bioc-stats`);
  }
  return `${stats.downloads.toLocaleString('en-US')} downloads in ${biocStats.year}`;
}

/**
 * "314,396 downloads in 2025 · Bioconductor" or "3,789 stars · GitHub" — the
 * meta line under a name. Bioconductor usage replaces stars when both exist.
 */
export function metaLine(p: Project['data']): string[] {
  const bits: string[] = [];
  const used = usage(p);
  if (used) bits.push(used);
  else if (p.stars !== undefined) bits.push(`${p.stars.toLocaleString('en-US')} stars`);
  bits.push(p.home);
  if (p.meta) bits.push(p.meta);
  return bits;
}
