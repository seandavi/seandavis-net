---
title: "Extracting Clinical Information Using the Genomicdatacommons Package"
date: 2018-03-25
archived: true
aliases:
  - /post/2018-03-25-extracting-clinical-information-using-the-genomicdatacommons-package/
  - /post/2018/03/2018-03-25-extracting-clinical-information-using-the-genomicdatacommons-package/
  - /post/2018/03/extracting-clinical-information-using-the-genomicdatacommons-package/
  - /2018/03/extracting-clinical-information-using-the-genomicdatacommons-package/
---

This short post introducds the `gdc_clinical()` function recently added to the GenomicDataCommons package.

The [rich data model](https://gdc.cancer.gov/developers/gdc-data-model) at the NCI Genomic Data Commons (GDC) includes clinical and biospecimen details. A recently added feature to the NCI GDC Data Portal is the ability to download tab-delimited files or JSON files for clinical and biospecimen details of samples. The details available in these simplified formats are also available via the GDC API.

``` r
library(GenomicDataCommons)
```

The clinical infomation at the GDC is encapsulated in the `cases` records. Here, I introduce the `gdc_clinical()` function from the [GenomicDataCommons](https://bioconductor.org/packages/GenomicDataCommons) package that takes as input GDC case IDs and returns a set of four related `data.frame`s:

- main: important case metadata
- demographics: basic demographic information
- exposures: zero or more documented exposures
- diagnoses: zero or more diagnoses per case

As an example application, we will examine the clinical details for 100 lung adenocarcinoma patients from TCGA (“TCGA-LUAD”). The case ids are available through a basic `cases()` query, `filter`ed to include only samples that belong to the project from `TCGA-LUAD` (stored in the `project.project_id` field). The query to get these case_ids, then, looks like:

``` r
case_ids = cases() %>%
    filter(~ project.project_id == 'TCGA-LUAD') %>%
    results(size=100) %>%
    ids()
head(case_ids)
```

```
## [1] "ffb0c0b7-165e-4439-b3e6-62431f40b7fe"
## [2] "f98ecd8a-b878-4f53-b911-20cd8e17281c"
## [3] "ccfdad76-cc45-447f-bed8-ede8f6a8844d"
## [4] "9fcdccae-676e-4071-93c3-23d2d3ab0c00"
## [5] "0232d299-4cdf-4fd7-9a5e-8d13c208b40c"
## [6] "bc4c4079-b449-485d-84e4-a40496e563e8"
```

These case_ids, each representing a single case (patient) in the GDC, can be be fed directly to `gdc_clinical`.

``` r
clin_res = gdc_clinical(case_ids)
```

The result is a list of data.frames:

``` r
names(clin_res)
```

```
## [1] "demographic" "diagnoses"   "exposures"   "main"
```

The the dimensions of these data.frames is instructive.

``` r
sapply(clin_res, dim) %>%
    t() %>%
    data.frame() %>%
    set_names(c('rows','columns'))
```

```
##             rows columns
## demographic  100      11
## diagnoses     82      23
## exposures     82      13
## main         100       8
```

And the column names for each are helpful to examine:

``` r
sapply(clin_res, colnames)
```

```
## $demographic
##  [1] "updated_datetime" "created_datetime" "gender"          
##  [4] "year_of_birth"    "submitter_id"     "state"           
##  [7] "race"             "demographic_id"   "ethnicity"       
## [10] "year_of_death"    "case_id"         
## 
## $diagnoses
##  [1] "case_id"                          
##  [2] "classification_of_tumor"          
##  [3] "last_known_disease_status"        
##  [4] "updated_datetime"                 
##  [5] "primary_diagnosis"                
##  [6] "submitter_id"                     
##  [7] "tumor_stage"                      
##  [8] "age_at_diagnosis"                 
##  [9] "vital_status"                     
## [10] "morphology"                       
## [11] "days_to_death"                    
## [12] "days_to_last_known_disease_status"
## [13] "created_datetime"                 
## [14] "state"                            
## [15] "days_to_recurrence"               
## [16] "diagnosis_id"                     
## [17] "tumor_grade"                      
## [18] "tissue_or_organ_of_origin"        
## [19] "days_to_birth"                    
## [20] "progression_or_recurrence"        
## [21] "prior_malignancy"                 
## [22] "site_of_resection_or_biopsy"      
## [23] "days_to_last_follow_up"           
## 
## $exposures
##  [1] "case_id"            "cigarettes_per_day" "weight"            
##  [4] "updated_datetime"   "alcohol_history"    "alcohol_intensity" 
##  [7] "bmi"                "years_smoked"       "submitter_id"      
## [10] "created_datetime"   "state"              "exposure_id"       
## [13] "height"            
## 
## $main
## [1] "updated_datetime" "submitter_id"     "case_id"         
## [4] "id"               "disease_type"     "created_datetime"
## [7] "state"            "primary_site"
```

Note the each data.frame contains a `case_id` column by design to allow arbitrary joining of the tables to each other. In this case, the data relationships are not too complicated, but one might imagine situations arising that include many-to-many relationships that are hard to handle in a fully general way without some understanding of downstream use (what do we want to do with the clinical information?). In this relatively simple case, we can create a “master” data.frame by joining all the records from each data.frame.

``` r
library(dplyr)
full_clin = with(clin_res,
     main %>%
     left_join(demographic, by = "case_id") %>%
     left_join(exposures, by = "case_id") %>%
     left_join(diagnoses, by = "case_id"))
```

Above, I have used the tidyverse approach, applying `dplyr` `left_join()`s. Using base R `merge` would also work.

``` r
dim(full_clin)
```

```
## [1] 100  52
```

``` r
colnames(full_clin)
```

```
##  [1] "updated_datetime.x"               
##  [2] "submitter_id.x"                   
##  [3] "case_id"                          
##  [4] "id"                               
##  [5] "disease_type"                     
##  [6] "created_datetime.x"               
##  [7] "state.x"                          
##  [8] "primary_site"                     
##  [9] "updated_datetime.y"               
## [10] "created_datetime.y"               
## [11] "gender"                           
## [12] "year_of_birth"                    
## [13] "submitter_id.y"                   
## [14] "state.y"                          
## [15] "race"                             
## [16] "demographic_id"                   
## [17] "ethnicity"                        
## [18] "year_of_death"                    
## [19] "cigarettes_per_day"               
## [20] "weight"                           
## [21] "updated_datetime.x.x"             
## [22] "alcohol_history"                  
## [23] "alcohol_intensity"                
## [24] "bmi"                              
## [25] "years_smoked"                     
## [26] "submitter_id.x.x"                 
## [27] "created_datetime.x.x"             
## [28] "state.x.x"                        
## [29] "exposure_id"                      
## [30] "height"                           
## [31] "classification_of_tumor"          
## [32] "last_known_disease_status"        
## [33] "updated_datetime.y.y"             
## [34] "primary_diagnosis"                
## [35] "submitter_id.y.y"                 
## [36] "tumor_stage"                      
## [37] "age_at_diagnosis"                 
## [38] "vital_status"                     
## [39] "morphology"                       
## [40] "days_to_death"                    
## [41] "days_to_last_known_disease_status"
## [42] "created_datetime.y.y"             
## [43] "state.y.y"                        
## [44] "days_to_recurrence"               
## [45] "diagnosis_id"                     
## [46] "tumor_grade"                      
## [47] "tissue_or_organ_of_origin"        
## [48] "days_to_birth"                    
## [49] "progression_or_recurrence"        
## [50] "prior_malignancy"                 
## [51] "site_of_resection_or_biopsy"      
## [52] "days_to_last_follow_up"
```

In conclusion, the `gdc_clinical` functionality from the GenomicDataCommons is a high-level function for capturing unified and harmonized clinical information for *any* case in the NCI GDC repository.

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
## [3] magrittr_1.5             knitr_1.20              
## 
## loaded via a namespace (and not attached):
##  [1] SummarizedExperiment_1.10.1 tidyselect_0.2.5           
##  [3] xfun_0.3                    purrr_0.2.5                
##  [5] lattice_0.20-35             htmltools_0.3.6            
##  [7] stats4_3.5.1                yaml_2.2.0                 
##  [9] rlang_0.3.0.1               pillar_1.3.0               
## [11] glue_1.3.0                  BiocParallel_1.14.2        
## [13] rappdirs_0.3.1              BiocGenerics_0.26.0        
## [15] bindrcpp_0.2.2              matrixStats_0.54.0         
## [17] GenomeInfoDbData_1.1.0      bindr_0.1.1                
## [19] stringr_1.3.1               zlibbioc_1.26.0            
## [21] blogdown_0.8                codetools_0.2-15           
## [23] evaluate_0.12               Biobase_2.40.0             
## [25] IRanges_2.14.12             GenomeInfoDb_1.16.0        
## [27] parallel_3.5.1              curl_3.2                   
## [29] Rcpp_0.12.19                readr_1.1.1                
## [31] backports_1.1.2             DelayedArray_0.6.6         
## [33] S4Vectors_0.18.3            jsonlite_1.5               
## [35] XVector_0.20.0              hms_0.4.2                  
## [37] digest_0.6.18               stringi_1.2.4              
## [39] bookdown_0.7                GenomicRanges_1.32.7       
## [41] grid_3.5.1                  rprojroot_1.3-2            
## [43] tools_3.5.1                 bitops_1.0-6               
## [45] RCurl_1.95-4.11             lazyeval_0.2.1             
## [47] tibble_1.4.2                crayon_1.3.4               
## [49] pkgconfig_2.0.2             Matrix_1.2-14              
## [51] xml2_1.2.0                  assertthat_0.2.0           
## [53] rmarkdown_1.10              httr_1.3.1                 
## [55] R6_2.3.0                    compiler_3.5.1
```
