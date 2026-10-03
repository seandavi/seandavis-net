---
title: "Building R Binary Packages for Linux"
date: 2019-10-14
description: "And how Docker makes them useful"
archived: true
aliases:
  - /post/build-linux-r-binary-packages/
---

## Background

One of the challenges of producing a performant build environment for linux, such as what might
be used to have developers test software in *identical* environments, is the need to compile 
R packages from source on linux. If, however, one had an identical set of installed libraries, kernel
version, compiler, etc., we could use binary packages in linux as well. 

[Docker] provides just such a shareable and identical environment for linux. Recent work by 
Levi Waldron and Nitesh Turaga to produce the [bioconductor_full] docker image will allow for
nearly **all** bioconductor packages to be installed, as the underlying system dependencies
are all included. 

[Docker]: https://docker.io
[bioconductor_full]: https://hub.docker.com/r/bioconductor/bioconductor_full

## Docs from R on building binaries

[docs on building binary R packages](http://www.hep.by/gnu/r-patched/r-exts/R-exts_20.html)

> The recommended method of building binary packages is to use
> `R CMD INSTALL --build pkg` where `pkg` is either the name of a source tarball (in the usual `.tar.gz` format) or the location of the directory of the package source to be built.

> `R CMD INSTALL --build` operates by first installing the package and then packing the installed binaries into the appropriate binary package file for the particular platform.

> By default, `R CMD INSTALL --build` will attempt to install the package into the default library tree for the local installation of R. This has two implications:

> If the installation is successful, it will overwrite any existing installation of the same package. The default library tree must have write permission; if not, the package will not install and the binary will not be created. To prevent changes to the present working installation or to provide an install location with write access, create a suitably located directory with write access and use the -l option to build the package in the chosen location. The usage is then
```
R CMD INSTALL -l location --build pkg
```
> where `location` is the chosen directory with write access. The package will be installed as a subdirectory of `location`, and the package binary will be created in the current directory.

## Walkthrough

With that background in place, by starting a docker container from bioconductor_full, we can
build binary packages that can be shared with others who are also running using bioconductor_full.

The next command assumes that docker is running. 

```
docker run -v PATH_TO_LOCAL_STORAGE_DIRECTORY:/data \
  --name bioc_full \
  -e PASSWORD=<YOUR_PASSWORD_OF_CHOICE> \
  -p 8787:8787 \
  bioconductor/bioconductor_full:devel 
```

The `PATH_TO_LOCAL_STORAGE_DIRECTORY` should be replaced with the local directlry 
where the binary packages will land as they are built inside the container. Packages can
then be reused or copied somewhere else for installation as binaries.

After running the `docker run` command above, you should be able to navigate to 
https://localhost:8787/ (or whatever your docker host address is). You will be presented
with an Rstudio login. Login with username=`rstudio` and
password=`YOUR_PASSWORD_OF_CHOICE` as set above.

## Install and build binaries

Binary packages, after being installed and built, will be placed in the current working 
directory. I switch to the directory that is mapped back to the host so that I can 
keep the binary packages around after the container stops. 

```r
setwd('/data') # to drop binary tarballs into this directory
```

After logging into Rstudio, execute the following command. Note the `INSTALL_opts`.

```r
# Biocmanager will be installed already for bioconductor_full
BiocManager::install('limma', INSTALL_opts='--build')
```

These installation options will copy the installed binary package(s) to `/data`. These will end
up on the docker host machine in the `PATH_TO_LOCAL_STORAGE_DIRECTORY` 

```r
Bioconductor version 3.10 (BiocManager 1.30.4), R 3.6.1 (2019-07-05)
Installing package(s) 'limma'
trying URL 'https://bioconductor.org/packages/3.10/bioc/src/contrib/limma_3.41.18.tar.gz'
Content type 'application/x-gzip' length 1493044 bytes (1.4 MB)
==================================================
downloaded 1.4 MB

* installing *source* package ‘limma’ ...
** using staged installation
** libs
gcc -I"/usr/local/lib/R/include" -DNDEBUG   -I/usr/local/include  -fpic  -g -O2 -fstack-protector-strong -Wformat -Werror=format-security -Wdate-time -D_FORTIFY_SOURCE=2 -g  -c init.c -o init.o
gcc -I"/usr/local/lib/R/include" -DNDEBUG   -I/usr/local/include  -fpic  -g -O2 -fstack-protector-strong -Wformat -Werror=format-security -Wdate-time -D_FORTIFY_SOURCE=2 -g  -c normexp.c -o normexp.o
gcc -I"/usr/local/lib/R/include" -DNDEBUG   -I/usr/local/include  -fpic  -g -O2 -fstack-protector-strong -Wformat -Werror=format-security -Wdate-time -D_FORTIFY_SOURCE=2 -g  -c weighted_lowess.c -o weighted_lowess.o
gcc -shared -L/usr/local/lib/R/lib -L/usr/local/lib -o limma.so init.o normexp.o weighted_lowess.o -L/usr/local/lib/R/lib -lR
installing to /usr/local/lib/R/site-library/00LOCK-limma/00new/limma/libs
** R
** inst
** byte-compile and prepare package for lazy loading
** help
*** installing help indices
** building package indices
** installing vignettes
** testing if installed package can be loaded from temporary location
** checking absolute paths in shared objects and dynamic libraries
** testing if installed package can be loaded from final location
** testing if installed package keeps a record of temporary installation path
* creating tarball
packaged installation of ‘limma’ as ‘limma_3.41.18_R_x86_64-pc-linux-gnu.tar.gz’
* DONE (limma)
```

Check what we created:

```r
dir('/data')
```

Your version of limma may differ. 

```r
[1] "limma_3.41.18_R_x86_64-pc-linux-gnu.tar.gz"
```

These binary packages can be installed just like any `.tar.gz` package but will 
be intalled very quickly like on Mac OS and Windows.

**Remember to kill the docker container after you are done**.
