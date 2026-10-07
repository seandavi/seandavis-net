---
title: "Measuring Bioconductor: usage, publications, funding, and what they say about sustainability"
date: 2026-10-07
draft: true
description: "A dashboard for Bioconductor's impact, built from public data, and what 17 years of download logs, a thousand linked papers and 668 NIH awards say about where the project stands."
---

Bioconductor is 24 years old, has 3,810 packages, and is used by tens of millions of distinct IP addresses a year. Numbers like that get quoted in grant renewals and keynote slides, but the evidence behind them is scattered across release manifests, download logs, CITATION files, PubMed, iCite and NIH RePORTER, and nobody has the afternoon it takes to join them. So the questions that matter for the project's future go unanswered: which packages carry the ecosystem's usage, how much of the publication record is linked to the software, which funders underwrite the work, where the authors are, and whether the growth is broad or concentrated in a few load-bearing pieces. In this post I describe a site that joins those sources, [impact.bioconductor.org](https://impact.bioconductor.org), and I go through what the data say about Bioconductor's impact and, more tentatively, about its sustainability.

I maintain the site, the definitions on it are documented, and both are open to correction. The numbers below are from the 2026-10-07 snapshot, and every one carries a caveat that I have tried to keep on the page rather than in a footnote.

## Where the data come from

Everything is public. The package metadata come from the `VIEWS` files that bioconductor.org publishes for every release since 1.8 in 2006 (the release announcements page fills in package counts back to 1.0 in May 2002). Download statistics come from the monthly tables the project has published since January 2009, which report distinct IP addresses and raw downloads per package per month. Each package's own `CITATION` file, read from the package source, says which paper the authors want cited. Those DOIs are joined to OpenAlex for citation counts, to NIH iCite for the Relative Citation Ratio, to NIH RePORTER for the grants a paper acknowledges, and to OpenAlex author affiliations for institutions and countries. Patent citations come from the Reliance on Science dataset.

The joining is done once a month by a small Python pipeline into a single DuckDB file. The site itself has no server. It is a static page that loads a handful of Parquet files and runs SQL in the browser with DuckDB-WASM, so every chart is computed from the same tables you can download. I will come back to that at the end, because it turns out to be the most useful property of the whole thing.

![How the site is built: Bioconductor.org and the cdsci-lake feed a monthly Python pipeline into one DuckDB file; Parquet marts on GitHub Pages serve the dashboard, R and Python clients, and static JSON.](/images/bioc-impact/data-flow.svg)

The snapshot refreshes monthly, so the figures below will drift.

## Growth

Bioconductor 1.0 shipped with 15 software packages. Release 3.23, in April 2026, has 2,418, plus 928 annotation packages, 436 experiment-data packages and 28 workflows, for 3,810 in all. The growth is not quite exponential any more, but it has not flattened either: the software repository has added between 40 and 120 packages per release for the last decade, and the net count has never gone down between releases in that span. Thirty-six packages in the current release are marked deprecated, which is the project's orderly way of letting things go.

Usage grew faster than the package count. In 2009 the software repository saw 1.56 million distinct downloading IP addresses, summed over the twelve months. In 2015 it was 5.9 million, in 2020 15.0 million, and in 2025 36.0 million. Two cautions. The collection method changed in October 2015, so the series before and after are not strictly comparable, and the site draws a shaded band at that boundary rather than a continuous line. And a distinct IP per month is a proxy, not a user: a university NAT gateway is one address and a laptop on three networks is three. I use it because it is the least gameable of the numbers the project publishes, and because the shape of the curve is the same under either measure.

![Distinct downloading IP addresses per year for the software repository, 2009 to 2025, with the pre-October-2015 collection era shaded.](/images/bioc-impact/distinct-ips.svg)

Usage is concentrated. Of the 2,418 software packages, 68 account for half of the distinct IP addresses in the last twelve months, and 1,472 account for 90 percent. The top of that list is infrastructure that everything else imports: `BiocVersion`, `BiocGenerics`, `S4Vectors`, `IRanges`, `Biobase`. That is not a criticism of the long tail. A package used by thirty labs that need exactly it is doing its job. But it does mean that any headline usage number for the project is mostly a statement about a few dozen packages, and that the project's sustainability depends on a small number of maintainers of infrastructure that everyone else builds on. The site lets you exclude the infrastructure tier to see the rest, and the dependency data now in it make the load-bearing packages visible.

## Publications

952 packages (a quarter of the total, and about 37 percent of software packages) point at a paper through a DOI in their `CITATION` file or DESCRIPTION. Those resolve to 1,167 distinct papers. Together the papers have been cited about 664,000 times according to OpenAlex. The median Relative Citation Ratio across the 838 papers that iCite scores is 1.84, where 1.0 is the NIH average for a paper of that age and field, and 260 of them sit in the top decile of NIH-funded papers. 212 of the papers are cited by at least one patent.

A quarter sounds low, and it is lower than the real publication rate, for a reason that took me a while to see. A `CITATION` file reflects what the authors want cited *now*. When edgeR's authors published the v4 paper in 2025, the file was updated to point at it, and the 2010 *Bioinformatics* paper that most of the field cites disappeared from view. Because bioconductor.org keeps the rendered citation page for every past release, the pipeline now reads all of them and keeps the union. That single change took edgeR from one linked paper to five and added 167 papers across 143 packages. Packages that never shipped a DOI are still invisible to this method, on purpose: I tried matching package names against paper titles and it produced about 1,500 matches, most of them wrong, because `muscle`, `gage` and `tuberculosis` are also English words.

The method also has a second edge. Some packages ask you to cite the method or the data rather than the software. The `muscle` package cites Edgar's 2004 alignment paper; the two AlphaMissense annotation packages cite the DeepMind paper in *Science*. That is the right thing for those packages to do, and the site reports it faithfully, but it means a leaderboard sorted by citation ratio puts a wrapper package next to a landmark paper. The site now defaults to the authors' own DOI and `CITATION` links, marks papers shared by several packages, and lets you opt in to the lower-confidence links found in package descriptions. I would rather show you the knob than pick a side quietly.

## Funding and geography

The 1,167 papers acknowledge 668 NIH awards across 26 Institutes and Centers. The direction of that statement matters: these are the grants that funded the paper a package asks you to cite, not the grants whose research *used* the package. The second number is much larger and is the one a funder usually wants. Computing it needs the citing papers, which means scanning OpenAlex's 1.3 billion reference edges. That scan was running as I wrote this, and the site will grow a column when it lands.

The papers come from everywhere. Using the senior author's affiliation for the 1,067 papers where OpenAlex has one, 399 are from the United States, 116 from Germany, 98 from the United Kingdom, 85 from Australia, 54 from Switzerland and 42 from Spain. Walter and Eliza Hall, EMBL and the European Bioinformatics Institute sit alongside Johns Hopkins, Harvard and Fred Hutch in the top institutions. The point for an NIH-centred view is that most of Bioconductor's funding is invisible to RePORTER. The `Authors@R` field in a package DESCRIPTION can declare funders, and 136 packages do, which is a start.

## People

Parsing `Authors@R` without evaluating it gives 4,786 distinct people credited across the packages, 1,171 of them with an ORCID. The identity is the ORCID when there is one and a normalised name otherwise, so homonyms may merge and name variants may split; the site says so on the page. 596 packages list a shared project mailbox as maintainer, which is worth knowing when counting "maintainers" as people, and which is itself a sustainability fact: a sixth of the ecosystem is maintained by the core team rather than by the people who wrote it.

## Using the data yourself

The part I expect to be most useful is also the smallest. Because the site is Parquet files on a static host, the dashboard is one of three ways to read the data, and the other two need no browser.

If you use DuckDB in R or Python, one line attaches a views-only database over the published files, with a definition on every column:

```sql
ATTACH 'https://impact.bioconductor.org/data/bioc-intelligence.duckdb' AS bi (READ_ONLY);
SELECT * FROM bi.package_impact WHERE package_name = 'limma';
```

The same from R:

```r
library(duckdb)
con <- dbConnect(duckdb())
dbExecute(con, "INSTALL httpfs; LOAD httpfs")
dbExecute(con, "ATTACH 'https://impact.bioconductor.org/data/bioc-intelligence.duckdb' AS bi (READ_ONLY)")
dbGetQuery(con, "SELECT * FROM bi.package_pubs_confident WHERE package_name = 'edgeR'")
```

Note the `package_pubs_confident` view. The database encodes the methodology choices as views, so the default you get is the one the dashboard uses, and the raw tables are there if you disagree. For people who do not want SQL there is a JSON file per package at `api/v1/package/<name>.json` and a shields.io badge endpoint, so a README can show its own usage or citation count. The [Data page](https://impact.bioconductor.org/#/data) lists all of it with a column dictionary.

## What it does not do yet

The citing-literature side is the big gap. Until the reference scan finishes, "citations" on the site means citations *of* the paper a package asks you to cite, not uses of the package. Full-text mentions of package names in methods sections, which would recover usage from papers that never cite anything, are a larger job still; I have the corpus and a plan for judging name collisions, and nothing running. Download numbers are a proxy with a known seam in 2015. And the pipeline depends on package authors shipping a DOI: if your package has a paper and the site does not show it, the fix is a line in `inst/CITATION`, and there is a correction form on the About page for everything else.

What the data support so far is a project whose usage has grown faster than its package count for 17 years, whose publication record sits well above the NIH average in citation terms, whose funding and authorship are more international than an NIH-centred view suggests, and whose weight rests on a few dozen infrastructure packages and a core team that maintains a sixth of everything. Growth is the easy half of that story. The harder half, who maintains the load-bearing pieces and who pays for it, is where I hope the site becomes useful to the people making those decisions.

The code is at [github.com/seandavi/bioc-intelligence](https://github.com/seandavi/bioc-intelligence). The project owes a debt to the people who have published Bioconductor's download statistics and release manifests in machine-readable form for seventeen years, and to OpenAlex, NIH iCite and RePORTER for making the enrichment possible without a single API key. If you have a question about Bioconductor that the site should answer and does not, I would like to hear it.
