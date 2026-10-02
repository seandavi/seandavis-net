---
title: "A computable Bioconductor build report"
date: 2017-11-17
archived: true
aliases:
  - /post/2017-11-17-computable-bioc-build-reports/
  - /post/2017/11/a-computable-bioconductor-build-report/
  - /2017/11/a-computable-bioconductor-build-report/
---

[Bioconductor](https://bioconductor.org) spends a substantial amount of effort to build its catalog of software each day. Reporting of these results is critical for developers, users, and project leaders to understand the software “health” of the project.

The [Bioconductor build reports](http://bioconductor.org/checkResults/devel/bioc-LATEST/) are generally available as html pages that are navigable with bookmarks and link out to detailed reports of errors, etc. However, the build reports are not readily computable, so mining the reports, automated processing by developers, and learning about failure modes automatically is challenging. The [BiocPkgTools](https://github.com/seandavi/BiocPkgTools) package is a small, utilitarian toolkit for working with Bioconductor packages and the Bioconductor repository. Here, I wanted to present a new function for accessing a build report as a tidy `data.frame`.

Install the package, if necessary.

``` r
BiocInstaller::biocLite('seandavi/BiocPkgTools')
```

A one-liner returns the build report as a `data.frame`.

``` r
library(BiocPkgTools)
b_report = biocBuildReport()
library(DT)
datatable(b_report)
```

| pkg | version | author | commit | last_changed_date | node | stage | result | bioc_version |
|---|---|---|---|---|---|---|---|---|
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | malbec2 | install | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | malbec2 | buildsrc | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | malbec2 | checksrc | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | tokay2 | install | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | tokay2 | buildsrc | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | tokay2 | checksrc | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | tokay2 | buildbin | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | merida2 | install | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | merida2 | buildsrc | OK | 3.7 |
| a4 | 1.28.0 | Tobias Verbeke | e81a8c1 | 2018-04-30T14:35:18Z | merida2 | checksrc | OK | 3.7 |

*Static snapshot: the original post embedded an interactive table of all 16,903 rows of the build report; the first 10 rows, as that table showed by default, are reproduced here.*

Using dplyr and ggplot2 gives a quick overview of the number of packages on each build system for each build “stage”.

``` r
library(ggplot2)
library(dplyr)
b_report %>%
    select(result,node,stage) %>%
    ggplot(aes(x=result)) +
    facet_grid( node ~ stage) +
    geom_bar() +
    theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
    scale_y_log10()
```

![](./build-report-results.png)

The “schema” for the `data.frame` is designed to be “stackable” in tidy format to facilitate combining data from multiple build cycles (days) for longitudinal data collection and mining. In a future post, I may look at how to use the Bioconductor package dependency graph to discover how “broken” packages relate to each other to define “causative” package build problems.
