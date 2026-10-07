---
title: "bioconductor.org moved, and the machines are gone"
date: 2026-10-08
draft: true
description: "What bioconductor.org was running on, the incidents that forced a change, the stack that replaced it on 2026-09-28, and what one day of request logs says the site is for."
aiAssistance: "Drafted with Claude Code from Sean's notes, the TAB deck, and the bioc-infrastructure docs; reviewed and edited by Sean."
---


Bioconductor is many things to many people, but it is perhaps most recognizable by its website, bioconductor.org. In this first of a series of posts, I'm going to outline changes to the site and several other related pieces of infrastructure that were tied to the site. bioconductor.org is no longer served by a virtual machine in AWS. Since about 20:09 UTC on 2026-09-28 it has been served by a Cloudflare Worker reading from object storage, and `BiocManager::install()` kept working through the switch. In this post I describe what the old site was, why it had become hard to keep running, what replaced it, and what the first days of request logs say about what bioconductor.org is for. Later posts will take the pieces one at a time.


The numbers here come from the project's documentation site, [seandavi.github.io/bioc-infrastructure](https://seandavi.github.io/bioc-infrastructure/), and where one is an estimate I say so. I'm adjacent to the Bioconductor core team and have done this work with their cooperation. The content of the site still belongs to Bioconductor, and decisions about it are theirs.

## What the old site was

The simplest way to describe bioconductor.org is that it is a package repository with a website attached. Every `BiocManager::install()` reads `config.yaml`, `PACKAGES` and `VIEWS` from it. Mirror operators rsync the whole tree. Package maintainers read build reports under `checkResults/`. `renv` and `install_version()` read `Archive/`. The pages a person reads in a browser are the smallest share of the load.

[](#fig-legacy) shows how it was put together when I did a read-only survey of the two servers on 2026-08-03.

<div class="wide">

![Diagram of the legacy bioconductor.org estate, titled by its parts. At the top left, git.bioconductor.org holds the site content repository, which feeds the staging build box. Staging runs Nanoc and Rake as an hourly full rebuild with no incremental step, plus about twenty other cron jobs, on an operating system that is out of support, with SPB daemons that are never restarted. Staging rsyncs the built site to master.bioconductor.org, a single EC2 VM running Apache that serves static files for the whole site and every repository from one EBS volume of 1.35 million files and 447 GB, which is IOPS-bound. The same VM holds checkResults build reports and a Solr search index; /packages/stats goes to a separate webstats host and old releases redirect to an OSN archive. Below, the package builds are separate: BBS build machines (nebbiolo1 and nebbiolo2 on Linux, plus macOS builders) push tarballs, binaries and build reports directly to master, while r-universe supplies Windows and macOS binaries that core-team propagation publishes only if they match BBS. CloudFront sits in front of master as a CDN, and its cache misses go to the VM. Clients are browsers, R and BiocManager, rsync mirrors and crawlers. A footer notes about \$5,000 a month in AWS cost, before builders and staff time.](/images/bioc-migration/legacy.svg)

Figure: The legacy estate, as surveyed read-only on 2026-08-03. {#fig-legacy}

</div>

Two machines did everything a visitor saw. *Staging* was a build box. Every hour, a cron job pulled the website repository, did a full clean rebuild of a Ruby static-site generator (Nanoc, no incremental step), and rsynced the output over SSH to the other machine. About twenty other cron jobs on the same box generated landing-page JSON, badge images, build-result feeds and the search index. The results-tracking app for the single package builder ran there too, as three Python daemons started from `@reboot` cron with `nohup`. If one crashed, nothing restarted it. Its logs had been growing unbounded since about 2024, and the operating system was past end of standard support.

*Master* was one EC2 instance running plain Apache. Everything a visitor got was a file already sitting on its disk, put there either by staging's hourly push or by a build machine writing check reports directly into `checkResults/`. The URL logic lived in a 19 KB `.htaccess` with hundreds of redirect and rewrite rules accumulated over about twenty years. Two things were proxied rather than served from disk: site search, to an unmaintained Solr, and the download statistics, to a separate host. CloudFront sat in front, so every cache miss landed on that one VM and its EBS volume.

Behind those two were the build machines themselves, named hosts (`nebbiolo1`, `nebbiolo2`, a few Macs) that run `R CMD check` across the whole repository every night and have done so for as long as the project has existed, with older names (`moscato`, `zin`, `morelia`, `oaxaca`) still in the configuration from earlier generations of hardware.

The site's repository still carries traces of its earlier lives. A `migration/` directory documents the previous move, from Plone to Nanoc, wget script and all. A file of 331 more rewrite rules has redirects for a 2002 workshop in Heidelberg among its oldest entries, though no build step refers to it. And the statistics crontab still has the Squid logs from the old Fred Hutch proxies in it, commented out rather than deleted.

<!-- Sean: I wrote the paragraph above from the audit notes (bioc-infrastructure audit/review/architecture.md) and ADR 0003, not from your memory, so swap in better ones. I don't have dates for the Fred Hutch to AWS move; if you remember the year or who did it, one sentence would be worth more than all three. A spare: the repo vendors a PHP/Python CAPTCHA (Securimage) that includes a Flash file, in a Ruby site that never builds it. -->

A static-file server behind a CDN is a sound design for a package repository, and this system served the community reliably for a long time. What it had become by accretion was harder to run: three operating systems to patch, a build box whose daemons nobody supervised, a hardware refresh cycle for the builders, hundreds of rewrite rules nobody could safely edit, and essentially no written description of how any of it fit together. Each piece was bespoke, each lived on a particular machine, and the knowledge of how to operate it lived in a small number of people's heads. That made it hard to migrate, because you couldn't move a piece without first finding out what it did.

## The incidents

What forced the issue was crawlers. The origin ran off an EBS volume, and crawlers exhausted its IOPS. [](#fig-crisis) shows the path.

<div class="wide">

![Diagram of how crawler traffic overloaded one disk. On the left, six bot icons labelled crawlers request unique URLs and large files. Those requests pass through CloudFront, where misses go to origin, and reach one VM running Apache that serves site pages, package repositories and build reports. The VM's EBS volume is marked IOPS exhausted, with a note that raising IOPS is the stopgap and not the fix, because one disk sits behind pages, installs and build reports together. A side panel for /help/course-materials/ compares two years of materials: 711 MB of .mp4 video against 2 MB of HTML, about 400 to 1.](/images/bioc-migration/crisis.svg)

Figure: How crawler traffic reached a single disk. {#fig-crisis}

</div>

The requests that hurt were not page views. They were bots pulling hundred-megabyte lecture videos from `/help/course-materials/`, where two years of materials are 711 MB of `.mp4` against 2 MB of HTML (the panel on the right of [](#fig-crisis)), and bots walking unique URLs that no CDN could ever have cached. That one directory was taking more than 500,000 requests a day, and when we looked on 2026-07-27 CloudFront was answering `/help/course-materials/` with `X-Cache: Miss`, so all of it went to origin. Because one disk sat behind everything, a crawler pulling videos slowed `BiocManager::install()` for everyone. This came to a head over the four days up to 2026-07-27, the day of the first commit in `bioc-edge`, the repository for the Worker described below. During those days the site was often unresponsive or took a very long time to load. Lori Shepherd spent four days working with AWS staff to try to stop the bot traffic.

<!-- Sean: the dates are from your note: four days up to and including the first commit in bioc-edge (2026-07-27, 14:20 MDT), so 2026-07-24 to 2026-07-27. I put Lori's four days with AWS staff on the same window; the repos don't record it, so confirm they're the same four days and that she's happy to be named for it. The 500,000 requests a day and the cache-miss observation are from bioc-edge MIGRATION.md (measured 2026-07-27). I could NOT find anything on redirect loops on help pages before the cutover; the only loop in the docs is the /talks one after the flip (bioc-edge#32). If there was an earlier loop, add a sentence. Still missing: who noticed first. -->

The stopgap was to buy more IOPS, which cost more every time and fixed nothing structural. The reasonable question was whether a bigger VM would do. I don't think it would have, for reasons that have little to do with the disk. Pages, installs, mirrors and build reports shared one failure domain. Nobody could see the traffic: the request logs fed statistics jobs, and nobody read them request by request. The download statistics have never filtered bots; the code that would do it has been commented out for years. Most of the roughly \$5,000 a month in AWS was egress, which is hard to avoid when the job is sending tarballs to the world. And nothing was written down where a newcomer could find it.

## The new architecture

The decision was to move serving to object storage plus edge compute, and to replace the legacy pieces one at a time behind the live site, with every choice written up as an architecture decision record. The pattern is sometimes called a strangler migration: the new system sits in front, answers what it can, and falls back to the old one for everything else, until there is nothing left to fall back to.

<div class="wide">

![Diagram of how the new bioconductor.org answers a request. Clients (browsers, R and BiocManager, mirror operators, crawlers) reach Cloudflare's WAF and edge cache, which carries one narrow rule for the /talks crawler. Requests then go to the Worker, whose code is in bioc-edge. The Worker applies five steps: a route table that tries the site build first and then the mirror; a symlink map such as release to 3.23; one-to-one redirects (ADR 0013); 404s cached for ten minutes per build; and one log record per request. The Worker reads a private 5.1 TB R2 bucket holding site/<sha>/, the immutable build made by bioc-website, and the mirror, a copy of master containing packages and checkResults. Only /packages/stats/ is passed through, uncached, to master. Every request is also written by Logpush to Google Cloud Storage, with all fields, and gap-checked daily. Daily probes from GitHub Actions check health and parity with master. Footer notes: no servers, no EBS, no egress fees, HTTP/2 and brotli, and four hostnames served by one Worker.](/images/bioc-migration/new-arch.svg)

Figure: How a request is answered now. {#fig-new-arch}

</div>

As [](#fig-new-arch) shows, a request now goes through Cloudflare's firewall and edge cache, then to a Worker, a small TypeScript program that runs in Cloudflare's data centres. The Worker looks up the path first in the latest build of the website and then in a mirror of master's files, both stored in an R2 bucket of about 5.1 TB (1.65 million objects, including 4.66 TB of old releases). Object storage has no symlinks, so the 145 symlinks in the old docroot (`packages/release` pointing at `3.23`, for instance) are a JSON file the Worker reads. The hundreds of `.htaccess` rules became a generated redirect table. A release roll is a data change, not a deploy.

Packages still come from where they always did. The Bioconductor Build System builds the source tarballs, r-universe builds most of the Windows and macOS binaries, and the core team's propagation puts them on master. An hourly job copies master into R2 and purges exactly the URLs that changed. The website is built separately, by Astro, on every merge to the website repository, into an immutable folder named by commit. Rolling back a site change is writing an older commit id into one pointer. Every pull request gets a preview on the real worker, and the response carries a header saying which build answered it. Packages and the website meet only in storage; neither waits on the other.


## The cutover

The migration ran for about two months before DNS moved, and the mirror was live and checked long before anyone depended on it. [](#fig-timeline) gives the dates.

<div class="wide">

![Horizontal timeline of the migration with eight markers. July 2026: audits of findability, performance and accessibility. August 3: reconnaissance of both servers, and R2 loaded with 5.1 TB. August 13: hourly sync and weekly reconcile running, with Logpush on. September 4: ADR 0011 establishes one propagation gate. September 28 has two markers inside a shaded box: the first notes that the nameservers moved at 17:30 and the site flipped to the new stack at 20:09, and the second notes that the crawler redirect loop was cut at 20:58 and a WAF rule was added at 22:34. September 29: a parity probe against master, with fixes made the same day. October 5 and October 12: the monitoring week ends, and the Route53 freeze, which keeps the old DNS zone as the rollback, ends.](/images/bioc-migration/timeline.svg)

Figure: The cutover, July to October 2026. {#fig-timeline}

</div>

R2 was loaded on 2026-08-03 and verified against the archive with zero differences. By 2026-08-13 the hourly sync, a weekly checksum reconcile and request logging were running with alerts. On 2026-09-28 the nameservers moved to Cloudflare at 17:30 UTC and the site flipped at about 20:09. The `BiocManager::install()` acceptance checks, eight of them, passed on release 3.23 and devel 3.24 after the flip. The old DNS zone is kept, frozen, as the rollback until 2026-10-12. The next day a probe compared 13,271 paths from real traffic against master, and the differences it found (a nine-byte 404 body, package files skipping the edge cache, double-slash links, landing pages missing their Windows and macOS download links) were fixed the same day.

On cost, two numbers that are not estimates of the same thing. The AWS estate being retired is about \$5,000 a month, for CloudFront, S3 and the two servers, not counting the builder hardware or anyone's time. The new stack, at Cloudflare's list prices applied to measured traffic, is roughly \$240 to \$500 a month, of which storage is about \$77. That is a projection, not a bill, and until the AWS side is switched off the project pays for both. The difference is mostly egress, which R2 does not charge for.

We also read the request logs within the hour of the flip, which the old setup had never let anyone do. <div class="wide">

In the first nineteen minutes, 75% of all requests were one crawler: 1,130 addresses on two cloud networks in Singapore, rotating three Mac Chrome user agents. It was stuck in a loop we were feeding it. The old site redirected anything under `/talks` to the course-materials index, we had copied that rule, and the index has 392 relative links that the crawler resolved against the URL it had asked for. Every redirect minted 392 new URLs that redirected back. No human had ever used that redirect. We removed it at 20:58, and when the crawler kept working through its queue at 3,700 requests a minute, added one firewall rule at 22:34 scoped to those two networks and that one path prefix ([](#fig-crawler)).

![Bar chart of crawler requests per minute on the evening of the cutover, 2026-09-28 UTC, drawn to a time scale with the vertical axis from 0 to 9,000; rates are approximate. Three vertical markers show the site flip at 20:09, the redirect loop removed at 20:58, and the WAF rule at 22:34. From the flip to 20:58 the crawler ran at about 8,300 requests a minute. Just after the loop was removed the rate was about 3,400, then it held near 3,700 a minute until 22:34 as the crawler worked through URLs it had already queued, which now returned 404s. After the narrow WAF rule the rate fell to between 0 and 15 requests a minute, too small to see as a bar.](/images/bioc-migration/crawler.svg)

Figure: The crawler's request rate on 2026-09-28 UTC, before and after each fix. Rates are approximate, from minutes of logs. {#fig-crawler}

</div>

The old site almost certainly had the same crawler, since production had the identical rule, but nobody could see it.

## What bioconductor.org is for

Two days after the cutover, 2026-09-30, was the first full UTC day with clean logs. [](#fig-traffic-day) shows what it looked like.

<div class="wide">

![Dashboard of one day of bioconductor.org traffic, 2026-09-30 UTC. Four headline numbers: 5.8 million requests, 8.1 TB served, 215 countries, and about 21,000 R installations. Below them, a single stacked bar of who is asking, by share of requests: R and package clients 33%, other automation 32%, browser-like 21%, search and AI crawlers 8%, mirrors about 3%, and CI, monitoring and other about 3%. In the lower left, an area chart of requests per hour across the UTC day, rising to a peak at 09:00 of 388 thousand and falling to a lower plateau in the evening. In the lower right, horizontal bars of R installations by operating system: Linux 12,347, Windows 6,303 and macOS 2,650, with a note that R 4.6 accounts for 56% of them.](/images/bioc-migration/traffic-day.svg)

Figure: One full day of bioconductor.org traffic, 2026-09-30 UTC, classified by bioc-traffic v0. {#fig-traffic-day}

</div>

5.8 million requests, 8.1 TB sent, from 215 countries, with the busiest hour at 09:00 UTC when Europe is at work and Asia's afternoon overlaps. About 21,000 distinct addresses sent R's own user agent that day, split by operating system in the last panel of [](#fig-traffic-day). Addresses are not people (one university behind NAT counts once, one laptop on three networks counts three times), but it is the first time the project has had a number like that measured directly rather than inferred from tarball downloads.

A third of the requests came from R and package clients, the first bar in [](#fig-traffic-day). Another third came from what our first-pass classifier calls other automation, which is mostly machines in clouds presenting browser user agents: half of that is about 740 Google Cloud addresses whose browser string carries Google's front-end marker, and most of the rest is browser-shaped traffic from hosting networks. A fifth was browser-like, and I would not present even that as a count of humans; the top countries by distinct address in that class look more like crawlers on residential connections than people. Build reports, the pages maintainers check each morning, took 1.27 million requests from 242,000 addresses, about 22% of all traffic. Declared search and AI crawlers were 8%.

One machine downloaded 162,163 package files that day, every one of them for Bioconductor 3.19, a release two years old. That was 40% of everything R clients downloaded. It is almost certainly a CI job or a script reinstalling in a loop, and the published download statistics would have counted every one of those as a download. August and September 2025 in the published tables show downloads roughly quadrupling with no change in distinct addresses, for what is almost certainly the same reason. Those months are still inflated, and cannot be corrected, because the pipelines that produced them discarded the user agent before storing anything.

So by request count, about two thirds of the traffic is machines talking to machines, and a good part of the rest looks like automation using browser user agents. ## Where things stand

bioconductor.org is served by the new stack. Packages are still built where they always were and copied hourly from master. The download statistics are still generated by the legacy pipeline and proxied through. A registry built on r-universe, which applies one propagation gate to every package and would let the site serve packages with no dependency on the old servers, is running but not yet in the serving path. The data, experiment and workflow packages that r-universe does not build need a build system of their own, which is designed and not built. The content of the website still comes from the Bioconductor/bioconductor.org repository through a snapshot; who owns it long term is a core team decision. The old DNS zone goes away after 2026-10-12. All of this, with dates, is on the [roadmap](https://seandavi.github.io/bioc-infrastructure/roadmap.html).

The posts that follow will take on some of the components in turn, such as the request logs and what a traffic classifier for a package repository should look like, the edge and how a release roll became a data change, the website as a pull-request workflow, the registry and its gate, and how the agentic workflow was set up. If you run infrastructure for a scientific software project and any of this is useful, or wrong, I'd like to hear about it: [seandavi@gmail.com](mailto:seandavi@gmail.com), or an issue on [bioc-infrastructure](https://github.com/seandavi/bioc-infrastructure/issues).

Thanks to the army of volunteers and contributors who built the site and to the Bioconductor core team, in particular Lori Shepherd, Jennifer Wokaty, Hervé Pagès and Marcel Ramos, for access to the servers, patience with the questions, and the propagation and build systems that still do the hard part, and to Jeroen Ooms, whose r-universe builds most of the binaries bioconductor.org ships.
