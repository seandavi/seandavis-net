# Deploy plan — seandavis.net (hub)

**Status:** LIVE as of 2026-07-24 — first deployed via `npx wrangler deploy`, both
custom domains attached (apex canonical, www → 301 apex). GitHub secrets for CI
set 2026-07-25; pushes to `main` deploy via `deploy.yml`, PRs get a
`workers.dev` preview via `pr-preview.yml`. `cancerdatasci.org` + `www`
(301 → `/projects`) deployed 2026-08-18; see item 2 below. Remaining:
`seandavi.github.io` retirement.
Domain `seandavis.net` is registered on Cloudflare (DNS lives there);
`talks.seandavis.net` is already live as a sibling Worker. This site deploys
the **same way**: build in GitHub Actions, serve the static `dist/` from
**Cloudflare Workers Static Assets**. Pattern and rationale mirror the talks
repo's ADR-0009 and `deploy` skill — read those first; this is the simpler
cousin (no Quarto, no Chrome, just Astro/npm).

**Deviation from the original plan:** Workers Static Assets `_redirects`
rejects host-based rules ("Only relative URLs are allowed" — that syntax is
Pages-only), so the www → apex 301 lives in a minimal `worker.js` fronting
the assets (`run_worker_first: true` in `wrangler.jsonc`), not in
`public/_redirects`.

Architecture context: [[site-family-placement-rule]] in the vault. This is a
distinct *property* → own repo + own Worker + apex domain.

## Deliverables (what to build, in order)

### 1. `wrangler.jsonc` (repo root)
Crib from `talks/wrangler.jsonc`, with three differences: `name` = `seandavis-net`,
assets `directory` = `./dist` (Astro's output, **not**
`_site`), and the route is the **apex + www**, not a subdomain:

```jsonc
{
  "$schema": "https://developers.cloudflare.com/workers/wrangler/configuration/schema.json",
  "name": "seandavis-net",
  "compatibility_date": "2026-07-24",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  },
  "routes": [
    { "pattern": "seandavis.net", "custom_domain": true },
    { "pattern": "www.seandavis.net", "custom_domain": true }
  ]
}
```
Decide apex vs. www-canonical: recommend apex canonical, `www` → `301` apex
(handled in the redirects file below).

### 2. `public/_redirects` — the 301s (the strategic payload)
Workers Static Assets serves a root `_redirects` file as real edge 301s. This
is where the "replace the old site" decision gets executed. Minimum set:

```
https://www.seandavis.net/*   https://seandavis.net/:splat   301
```
The two **cross-origin** retirements (`seandavi.github.io`, `cancerdatasci.org`
apex) can't be done from this file — they're different origins. Options, decide
per origin:
- **seandavi.github.io** → its Pages serving is in the `seandavi.github.io`
  repo (currently `master`). Retire by replacing that repo's content with a
  redirect stub (meta-refresh + canonical), OR point the GitHub Pages custom
  domain elsewhere. The CV it used to host now lives here at `/files/CV.pdf`;
  what remains is porting the old blog posts so their URLs can redirect.
- **cancerdatasci.org apex** → **wired 2026-08-17, deployed 2026-08-18** (verified
  301 → `https://seandavis.net/projects/` on 2026-10-02). The zone
  had *no apex record at all* (checked against the exported zone file), so the
  domain did not resolve and the homepage's two links to it were dead. Rather
  than stand up a separate property, the apex + `www` are attached to *this*
  Worker as custom domains (`wrangler.jsonc` routes) and `worker.js` 301s them
  to `https://seandavis.net/projects` — the directory that lists what actually
  runs on that domain. **Deploying creates the proxied DNS records in the
  cancerdatasci.org zone**; that's the only externally visible change.
  The tool subdomains (omicidx, cfde-atlas, cmgd, store, pubmed-grader,
  fda-approvals) keep their own records and are untouched — those URLs are
  cited and must keep resolving.

### 3. `.github/workflows/deploy.yml`
Much simpler than talks (no Quarto/uv/Chrome). Skeleton:
`checkout → setup-node 22 → npm ci → npm run build → cloudflare/wrangler-action@v4
(command: deploy)`. Trigger on push to `main` + `workflow_dispatch`, with the
same `concurrency` guard talks uses.

### 4. Content TODOs that gate a real launch (pre-existing, from README)
- ~~**`public/files/CV.pdf`**~~ **Done** — served at `seandavis.net/files/CV.pdf`.
- **ORCID publications sync** — build-time fetch of
  `pub.orcid.org/v3.0/0000-0002-8991-6458/works` → generated publications page.
  Today Writing just links to ORCID; fine for a soft launch, but this is the
  "pubs don't rot" promise.
- **Self-host a display serif** (Source Serif 4 / Newsreader / Charter) instead
  of the system stack.
- **Shared design-token CSS** — the family-of-sites brand-coherence mechanism:
  factor the tokens in `src/styles/global.css` into a file that can be mirrored
  into the talks theme. Low priority until a second visual drift appears.

## One-time manual setup (needs the Cloudflare account — Sean does this)
Identical to the talks `deploy` skill, reused token is fine:
1. Reuse (or create) the **"Edit Cloudflare Workers"** API token.
2. Add repo GitHub secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.
3. First deploy locally: `npx wrangler login` → `npm run build` → `npx wrangler deploy`.
4. Attach custom domain(s) in the dashboard: the Worker → Settings → Domains &
   Routes → add `seandavis.net` (+ `www`). DNS auto-creates (domain is on CF).

## Sequencing recommendation
1. Land items 1 + 3 (wrangler + workflow) and do a **first deploy to the apex** —
   this is architecture-identical work and gets the site live.
2. Then the CV + a soft ORCID page (item 4) so nothing links into the void.
3. **Only then** the cross-origin 301s (item 2) — retiring github.io is the
   irreversible-feeling step; do it once the hub genuinely supersedes it.

Resolved: apex canonical (www → 301 apex). Still open: `seandavi.github.io`
retirement — waits on porting the old blog posts here so their URLs can redirect.
