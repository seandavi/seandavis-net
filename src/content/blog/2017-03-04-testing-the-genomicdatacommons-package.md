---
title: "Matched tumor/normal pairs--a use case for the GenomicDataCommons Bioconductor package"
date: 2017-03-04
archived: true
aliases:
  - /post/2017-03-04-testing-the-genomicdatacommons-package/
  - /post/2017/03/2017-03-04-testing-the-genomicdatacommons-package/
  - /2017/03/matched-tumor-normal-pairs-a-use-case-for-the-genomicdatacommons-bioconductor-package/
---

# Introduction

The NCI Genomic Data Commons ([GDC](https://gdc.nci.nih.gov)) is a reboot of the approach that NCI uses to manage and expose genomic and associated clinical and experimental metadata. I have been working on a [Bioconductor](https://bioconductor.org) package that interfaces with the [GDC API](https://gdc-api.nci.nih.gov) to provide search and data retrieval from within R.

## testing

In the first of what will likely be a set of use cases for the [GenomicDataCommons](https://github.com/Bioconductor/GenomicDataCommons), I am going to address a question that came up on twitter from [@sleight82](https://twitter.com/sleight82)

> [Asking for a non-tweeter: can you find matched control samples?](https://twitter.com/sleight82/status/837898737540198400)

> asking for a non-tweeter: can you find matched control samples?
>
> — Kenneth Daily (@sleight82) [March 4, 2017](https://twitter.com/sleight82/status/837898737540198400)

The answer is, “Yes.” I am going to assume that what the “non-tweeter” friend meant was that he or she was interested in finding matched tumor/normal data related to, for example, gene expression, and that the interest is in a specific disease category or TCGA. So, I am going to answer the more specific question:

> Can you find matched primary tumor/solid tissue normal samples and associated RNA-Seq gene expression files from TCGA breast cancer cases?

``` r
library(GenomicDataCommons)
```

```
## Loading required package: magrittr
```

```
## 
## Attaching package: 'GenomicDataCommons'
```

```
## The following object is masked from 'package:stats':
## 
##     filter
```

``` r
library(dplyr)
```

```
## 
## Attaching package: 'dplyr'
```

```
## The following objects are masked from 'package:GenomicDataCommons':
## 
##     count, filter, select
```

```
## The following objects are masked from 'package:stats':
## 
##     filter, lag
```

```
## The following objects are masked from 'package:base':
## 
##     intersect, setdiff, setequal, union
```

The GDC API puts some constraints on what can be done directly. But, since we are working in R, we have a toolbox that allows us to build a solution out of component parts. The strategy that I am going to employ is a three-step approach

1.  Find RNA-Seq gene expression files derived from “Solid Tissue Normal”
2.  Find RNA-Seq gene expression files derived from “Primary Tumor”
3.  Limit cases from \#1 and \#2 that have gene expression results from both normal and tumor.

In this code block, find all “HTSeq - Counts” files that are derived from “Solid Tissue Normal” in the project “TCGA-BRCA”. I used a combination of `files() %>% select(available_fields('files') %>% results()` to get an overview of the data available in the `files()` endpoint, followed by `grep_fields()` and `available_values()` to determine how to build filters.

``` r
nl_ge_files = files() %>%
    GenomicDataCommons::filter(~   cases.samples.sample_type=='Solid Tissue Normal' &
               cases.project.project_id == 'TCGA-BRCA' &
               analysis.workflow_type == "HTSeq - Counts") %>%
    expand(c('cases','cases.samples')) %>%
    results_all() %>%
    as_tibble()
```

And do the same, but now looking for gene expression from tumors.

``` r
tm_ge_files = files() %>%
    GenomicDataCommons::filter(~   cases.samples.sample_type=='Primary Tumor' &
               cases.project.project_id == 'TCGA-BRCA' &
               analysis.workflow_type == "HTSeq - Counts") %>%
    expand(c('cases','cases.samples')) %>%
    results_all() %>%
    as_tibble()
```

Now, we have two data frames describing the normal- and tumor-derived TCGA-BRCA gene expression files. Note that I asked the GDC to provide `cases.case_id` as part of the record using `select()`. By looking for the intersection of cases between these two sets of files, we can find cases that contain files derived from both tumor and normal tissue.

``` r
nl_cases = bind_rows(nl_ge_files$cases, .id='file_id')
tm_cases = bind_rows(tm_ge_files$cases, .id='file_id')
matchedcases = intersect(nl_cases$case_id,
                         tm_cases$case_id)
# how many matched cases?
length(matchedcases)
```

```
## [1] 112
```

We can now create a `data.frame` that contains file information for only the matched samples. Note that the names of the matched cases are the file ids.

``` r
matched_nl_files = nl_cases[nl_cases$case_id %in% matchedcases, 'file_id']
matched_tm_files = tm_cases[tm_cases$case_id %in% matchedcases, 'file_id']

matched_tn_ge_file_info = rbind(subset(nl_ge_files,file_id %in% matched_nl_files),
                                subset(tm_ge_files,file_id %in% matched_tm_files))
head(matched_tn_ge_file_info)
```

```
## # A tibble: 6 x 17
##   data_type updated_datetime file_name submitter_id file_id file_size cases
##   <chr>     <chr>            <chr>     <chr>        <chr>       <int> <lis>
## 1 Gene Exp… 2018-09-08T01:0… 6598740f… 6598740f-64… 7d62fa…    261441 <dat…
## 2 Gene Exp… 2018-09-08T01:0… d7047346… d7047346-49… ec3848…    258388 <dat…
## 3 Gene Exp… 2018-09-08T01:0… e84e835c… e84e835c-ce… af091e…    252106 <dat…
## 4 Gene Exp… 2018-09-08T01:0… 2c6a02ee… 2c6a02ee-c8… eed6ce…    258278 <dat…
## 5 Gene Exp… 2018-09-08T01:0… 73bcbb60… 73bcbb60-38… bde7dd…    253859 <dat…
## 6 Gene Exp… 2018-09-08T01:0… f1afa28b… f1afa28b-fa… 61da65…    259028 <dat…
## # ... with 10 more variables: id <chr>, created_datetime <chr>,
## #   md5sum <chr>, data_format <chr>, acl <list>, access <chr>,
## #   state <chr>, data_category <chr>, type <chr>,
## #   experimental_strategy <chr>
```

Since the gene expression data are not that big, we can use the GDC API to download the data files directly. The GenomicDataCommons uses a cache for files, so the first time the code below is run, data will be downloaded. After that, if the cache is in place, the cached files will be used.

``` r
fnames = lapply(as.character(matched_tn_ge_file_info$file_id),
                  function(file_id) {
                      gdcdata(file_id, progress = FALSE)
                  })
```

Now, `fnames` should be a list of file names that can be read into and processed with R.

``` r
sessionInfo()
```

```
## R version 3.5.1 (2018-07-02)
## Platform: x86_64-apple-darwin15.6.0 (64-bit)
## Running under: macOS Sierra 10.12.6
## 
## Matrix products: default
## BLAS: /Library/Frameworks/R.framework/Versions/3.5/Resources/lib/libRblas.0.dylib
## LAPACK: /Library/Frameworks/R.framework/Versions/3.5/Resources/lib/libRlapack.dylib
## 
## locale:
## [1] en_US.UTF-8/en_US.UTF-8/en_US.UTF-8/C/en_US.UTF-8/en_US.UTF-8
## 
## attached base packages:
## [1] stats     graphics  grDevices utils     datasets  methods   base     
## 
## other attached packages:
## [1] dplyr_0.7.7              GenomicDataCommons_1.4.3
## [3] magrittr_1.5            
## 
## loaded via a namespace (and not attached):
##  [1] SummarizedExperiment_1.10.1 tidyselect_0.2.5           
##  [3] xfun_0.3                    purrr_0.2.5                
##  [5] lattice_0.20-35             htmltools_0.3.6            
##  [7] stats4_3.5.1                yaml_2.2.0                 
##  [9] utf8_1.1.4                  rlang_0.3.0.1              
## [11] pillar_1.3.0                glue_1.3.0                 
## [13] BiocParallel_1.14.2         rappdirs_0.3.1             
## [15] BiocGenerics_0.26.0         bindrcpp_0.2.2             
## [17] matrixStats_0.54.0          GenomeInfoDbData_1.1.0     
## [19] bindr_0.1.1                 stringr_1.3.1              
## [21] zlibbioc_1.26.0             blogdown_0.8               
## [23] evaluate_0.12               Biobase_2.40.0             
## [25] knitr_1.20                  IRanges_2.14.12            
## [27] GenomeInfoDb_1.16.0         parallel_3.5.1             
## [29] curl_3.2                    fansi_0.4.0                
## [31] Rcpp_0.12.19                readr_1.1.1                
## [33] backports_1.1.2             DelayedArray_0.6.6         
## [35] S4Vectors_0.18.3            jsonlite_1.5               
## [37] XVector_0.20.0              hms_0.4.2                  
## [39] digest_0.6.18               stringi_1.2.4              
## [41] bookdown_0.7                GenomicRanges_1.32.7       
## [43] grid_3.5.1                  rprojroot_1.3-2            
## [45] cli_1.0.1                   tools_3.5.1                
## [47] bitops_1.0-6                RCurl_1.95-4.11            
## [49] lazyeval_0.2.1              tibble_1.4.2               
## [51] crayon_1.3.4                pkgconfig_2.0.2            
## [53] Matrix_1.2-14               xml2_1.2.0                 
## [55] assertthat_0.2.0            rmarkdown_1.10             
## [57] httr_1.3.1                  R6_2.3.0                   
## [59] compiler_3.5.1
```
