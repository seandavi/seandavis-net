---
title: "GenomicDataCommons Example: UUID to TCGA and TARGET Barcode Translation"
date: 2017-12-29
archived: true
aliases:
  - /post/2017-12-29-genomicdatacommons-id-mapping/
  - /post/2017/12/genomicdatacommons-example-uuid-to-tcga-and-target-barcode-translation/
  - /2017/12/genomicdatacommons-example-uuid-to-tcga-and-target-barcode-translation/
---

One of the features of the NCI Genomic Data Commons is that *everything* has a unique identifier in the form of a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). However, because *many* legacy projects and much of the literature do not use UUIDs but instead use [TCGA sample barcodes](https://wiki.nci.nih.gov/display/TCGA/TCGA+barcode), one simple use case for the GenomicDataCommons package is to map from the UUID for a file or a set of files back to the associated TCGA barcode(s).

Given a set of file ids (which I simulate here by fetching some from the GDC API), I build a small function that maps those file UUIDs back to the associated TCGA barcodes. Because the GDC also contains data from TARGET as well as Foundation Medicine, the same code will return associated legacy identifiers for those types of samples as well.

Get started by loading the [GenomicDataCommons](https://bioconductor.org/packages/GenomicDataCommons) library:

``` r
library(GenomicDataCommons)
```

Fetch some file IDs:

``` r
file_uuids = files() %>% results(size=15) %>% ids()
head(file_uuids)
```

```
## [1] "d86ea2f8-93bb-42f3-a195-1914a4839bb4"
## [2] "79e05e92-e616-4690-b507-3ffc531e9e79"
## [3] "a39afa84-fbfb-4f0f-8176-5975f589fc83"
## [4] "8fa12ac8-68c8-454f-95f0-11dcf996c06c"
## [5] "7248e30c-367a-401f-a52a-315b7add965d"
## [6] "ee877659-00fa-4e88-8293-16317bd337b4"
```

The TCGA barcodes are nested in the file records, but we can access them in the `cases.samples.submitter_id`. The `available_fields` and `available_values` functions are useful GenomicDataCommons package functions for examining available fields and their associated values to find information of interest. Another common approach is to fetch all available fields and then examine the results using `str`.

``` r
fres = files() %>%
    select(available_fields('files')) %>%
    results()
str(fres)
```

In the code below, I simply start with a `files()` query against the GenomicDataCommons API, filter to include only those files that match the supplied `file_ids`, and then gather the `cases.samples.submitter_id` and file UUIDs into a data frame. The most complicated (and fragile, since it will break if the GDC changes its data model) iw the lapply statement that accesses the barcodes in the nested results returned.

``` r
library(GenomicDataCommons)
library(magrittr)

TCGAtranslateID = function(file_ids, legacy = FALSE) {
    info = files(legacy = legacy) %>%
        filter( ~ file_id %in% file_ids) %>%
        select('cases.samples.submitter_id') %>%
        results_all()
    # The mess of code below is to extract TCGA barcodes
    # id_list will contain a list (one item for each file_id)
    # of TCGA barcodes of the form 'TCGA-XX-YYYY-ZZZ'
    id_list = lapply(info$cases,function(a) {
        a[[1]][[1]][[1]]})
    # so we can later expand to a data.frame of the right size
    barcodes_per_file = sapply(id_list,length)
    # And build the data.frame
    return(data.frame(file_id = rep(ids(info),barcodes_per_file),
                      submitter_id = unlist(id_list)))
    }
```

Now, we can translate our example `file_uuids`:

``` r
res = TCGAtranslateID(file_uuids)
```

``` r
head(res)
```

```
##                                file_id   submitter_id
## 1 d86ea2f8-93bb-42f3-a195-1914a4839bb4 AD16567_sample
## 2 79e05e92-e616-4690-b507-3ffc531e9e79 AD10500_sample
## 3 a39afa84-fbfb-4f0f-8176-5975f589fc83  AD6758_sample
## 4 8fa12ac8-68c8-454f-95f0-11dcf996c06c AD14707_sample
## 5 7248e30c-367a-401f-a52a-315b7add965d  AD1751_sample
## 6 ee877659-00fa-4e88-8293-16317bd337b4  AD4226_sample
```

This little function is a bit “niche”, but it does illustrate how one can leverage GenomicDataCommons package functionality to create useful higher-level functionality like ID mapping.

- EDIT \[01-02-2018\]: Added `legacy` flag to function to allow mapping of legacy file UUIDs. See [comment below](http://disq.us/p/1ozinq7) for rationale.
