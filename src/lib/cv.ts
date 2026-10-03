// Data exported from Sean's CV repo by `just publish-site` (see README).
// Do not edit the JSON by hand; rerun the export instead.
import meta from '../data/cv/meta.json';
import pubData from '../data/cv/publications.json';
import grantData from '../data/cv/grants.json';

export const ORCID_URL = 'https://orcid.org/0000-0002-8991-6458';
export const SCHOLAR_URL = 'https://scholar.google.co.uk/citations?user=hLFc29kAAAAJ';

const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

// "built" is when the PDF was last regenerated from the CV data, so it tracks
// the newest grant, talk, or publication entry; "updated" only tracks the
// Google Scholar refresh.
export const cvDate = monthYear(meta.built);

export const metrics = pubData.metrics;
export const metricsLine = `${metrics.total_citations.toLocaleString('en-US')} citations; h-index ${metrics.h_index} (${metrics.source}, ${monthYear(metrics.updated)})`;

export const pubGroups = pubData.categories
  .map((c) => ({
    ...c,
    pubs: pubData.publications
      .filter((p) => p.category === c.id)
      .sort((a, b) => b.year - a.year),
  }))
  .filter((g) => g.pubs.length > 0);

export const grants = grantData.grants;

