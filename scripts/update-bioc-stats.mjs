#!/usr/bin/env node
// Refresh src/data/bioc-stats.json from Bioconductor's public download stats.
//
//   npm run update:bioc-stats             # last complete calendar year
//   npm run update:bioc-stats -- 2024     # a specific year
//
// Every project YAML with a `bioc: <Package>` line gets the package's yearly
// total (the "all" row of <pkg>_<year>_stats.tab). The build only reads the
// JSON this writes; it never fetches, so stats change only when this is run
// and the result committed.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const projectsDir = join(root, 'src/content/projects');
const outFile = join(root, 'src/data/bioc-stats.json');

// Software packages live under stats/bioc, experiment-data packages
// (e.g. curatedMetagenomicData) under stats/data-experiment.
const REPOS = ['bioc', 'data-experiment'];

const year = Number(process.argv[2] ?? new Date().getUTCFullYear() - 1);
if (!Number.isInteger(year)) throw new Error(`Bad year: ${process.argv[2]}`);

async function packageNames() {
  const names = new Set();
  for (const file of await readdir(projectsDir)) {
    if (!file.endsWith('.yaml')) continue;
    const text = await readFile(join(projectsDir, file), 'utf8');
    const m = text.match(/^bioc:\s*([A-Za-z0-9.]+)\s*$/m);
    if (m) names.add(m[1]);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

async function yearTotal(pkg) {
  for (const repo of REPOS) {
    const url = `https://bioconductor.org/packages/stats/${repo}/${pkg}/${pkg}_${year}_stats.tab`;
    const res = await fetch(url);
    if (res.status === 404) continue;
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    // Columns: Year Month Nb_of_distinct_IPs Nb_of_downloads; Month "all" is the year.
    for (const line of (await res.text()).split('\n')) {
      const [y, month, ips, downloads] = line.trim().split('\t');
      if (y === String(year) && month === 'all') {
        return { downloads: Number(downloads), distinctIPs: Number(ips) };
      }
    }
    throw new Error(`${url}: no "all" row for ${year}`);
  }
  throw new Error(`${pkg}: no ${year} stats under ${REPOS.join(' or ')}`);
}

const packages = {};
for (const pkg of await packageNames()) {
  packages[pkg] = await yearTotal(pkg);
  console.log(`${pkg}: ${packages[pkg].downloads} downloads, ${packages[pkg].distinctIPs} distinct IPs`);
}

const fetched = new Date().toISOString().slice(0, 10);
await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify({ year, fetched, packages }, null, 2) + '\n');
console.log(`Wrote ${Object.keys(packages).length} packages (${year}) to src/data/bioc-stats.json`);
