---
title: "Build and deploy an NCBI GEO metadata fetch API"
date: 2020-03-05
description: "Build, containerize, and then deploy a simple serverless web API that returns json-formated metadata for any GEO accession."
archived: true
aliases:
  - /post/cloud-run-notes/
---

In this post, I want to demonstrate building a simple web API converts
an NCBI [GEO] accession and associated metadata to [json] format, and
then deploy that application as a web service on Google Cloud Platform
[Cloud Run].

I hear from GEOquery users that sometimes they just want to get the
metadata for one or more accessions rather than getting the entire GEO
record. My [omicidx-parser] library has functionality to do this
conversion. We will leverage this functionality to build a small web
application that we can deploy using [serverless] approach to stand up
an API that returns a [json] conversion of GEO metadata.

[GEO]: https://ncbi.nlm.nih.gov/geo
[json]: https://www.digitalocean.com/community/tutorials/an-introduction-to-json
[omicidx-parser]: https://github.com/omicidx/omicidx-parsers

## Tooling

- Google cloud platform, specifically [serverless] [Cloud Run]
- python programming language
- [fastapi] library for web API development
- [docker] containers
- git and github

- Code: https://github.com/seandavi/blog-code/

## What will I learn and do?

In this post, we will learn the basics of [Cloud Run] through
examples. Additionally, we will learn a bit about web app development
using the [fastapi] python web framework.

At the end of this post, you will have a containerized web application
running locally that can take a GEO accession and return a [json]
version of the metadata.

If you have a Google Cloud Platform account that allows you to create
projects, you should be able to run your application in Google Cloud
Run.

[fastapi]: https://fastapi.tiangolo.com/

## What is Cloud Run?

[Cloud Run] is a fully managed compute platform that automatically
scales your stateless containers. In other words, write a web
application, place it in a [docker container], and then deploy to the
cloud. Cloud Run is one of a family of technologies referred to as
[serverless] it abstracts away all infrastructure management. Cloud
Run is built upon an open standard, [Knative], enabling the
portability of your applications.

[serverless]: https://en.wikipedia.org/wiki/Serverless_computing
[docker container]: https://docker.io/
[Knative]: https://knative.dev/
[Cloud Run]: https://cloud.google.com/run

## Build your app 

Sorry, but I'm going to let the code do most of the talking here. In
short, Google Cloud Run supports any web development language or
framework that can be deployed as a docker container.

Here, I will use python and adopt [fastapi] a framework for building
performant REST APIs. 

The GEO parsing will leverage the [omicidx-parser] library. 

## Containers are front-and-center

Google's [Cloud Run] creates a "service" that accepts http requests
and returns responses. The requests and responses are not predefined
by Cloud Run, allowing any approach that your chosen programming
language supports. Once your web application is written and tested
locally, create a [Dockerfile] that generates a containerized version
of it. The generated docker container is what you will pass along to
[Cloud Run] as the application. [Cloud Run] will then create a
"service" by setting up your docker container to run "on demand" when
a web request is directed to it.

Any programming dependencies, operating system or system dependencies,
or necessary software are simply included in the [Dockerfile]
description to be incorporated into the container. Local testing is
straightforward by simply running the docker container locally.

[Dockerfile]: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/

## Example application and deployment

As of today, I am using [poetry] for python dependency management
(think pip and virtualenv replacement) and package building. To get
started with poetry, install:

```bash
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py \
  | python
```

[poetry]: https://python-poetry.org/

I'll leave the poetry parts of things out for now, but you will see
some poetry command lines to build the cloud run environment.

Next, checkout the [example repo](https://github.com/seandavi/blog-code).

```bash
git clone https://github.com/seandavi/blog-code
cd blog-code/geo-metadata-cloud-run/
```

To set up a local development environment and then test the app
locally, I use a couple of poetry commands (see poetry docs for what
these do, specifically).

```bash
poetry install
poetry run uvicorn app.main:app
```

Then, navigate to http://localhost:8000/docs. There, by default, you are redirected to the auto-generated [OpenAPI] API documentation (yes, you get this *for free*).

[OpenAPI]: https://swagger.io/docs/specification/about/ 

To see the results for a specific accession, click here: http://localhost:8000/geo/GSM48743. An example response will look like:

```json
{
    "GSM48743": {
        "title": "Patient sample ST163, Liposarcoma",
        "status": "Public on Oct 11 2005",
        "submission_date": "2005-04-21",
        "last_update_date": "2005-11-22",
        "type": "RNA",
        "anchor": null,
        "contact": {
            "city": "Bethesda",
            "name": {
                "first": "Sean",
                "middle": "",
                "last": "Davis"
            },
            "email": "sdavis2@mail.nih.gov",
            "state": "MD",
            "address": "37 Convent Drive, Room 6138",
            "department": null,
            "country": "USA",
            "web_link": null,
            "institute": "National Cancer Institute",
            "zip_postal_code": null,
            "phone": "301-435-2652"
        },
        "description": "Diagnosis: Liposarcoma\nKeywords = sarcoma, cDNA, Liposarcoma",
        "accession": "GSM48743",
        "biosample": null,
        "tag_count": null,
        "tag_length": null,
        "platform_id": "GPL1977",
        "hyb_protocol": null,
        "channel_count": 2,
        "scan_protocol": null,
        "data_row_count": 12600,
        "library_source": null,
        "overall_design": null,
        "sra_experiment": null,
        "data_processing": null,
        "supplemental_files": [
            "NONE"
        ],
        "channels": [
            {
                "label": null,
                "taxid": [
                    9606
                ],
                "molecule": "total RNA",
                "organism": "Homo sapiens",
                "source_name": "Liposarcoma",
                "label_protocol": null,
                "growth_protocol": null,
                "extract_protocol": null,
                "treatment_protocol": null,
                "characteristics": [
                    
                ]
            },
            {
                "label": null,
                "taxid": [
                    9606
                ],
                "molecule": "total RNA",
                "organism": "Homo sapiens",
                "source_name": "Pooled sarcoma cell lines",
                "label_protocol": null,
                "growth_protocol": null,
                "extract_protocol": null,
                "treatment_protocol": null,
                "characteristics": [
                    
                ]
            }
        ],
        "contributor": [
            
        ]
    }
}
```

At this point, the web application is running locally. We can
"containerize" the application by building the docker container. The
[associated Dockerfile](https://github.com/seandavi/blog-code/blob/master/geo-metadata-cloud-run/Dockerfile) has instructions for doing so. To actually
build the docker image, do the following, replacing `PROJECT_ID` below with
your GCP project ID. You can view your project ID by running the
command.

```bash
gcloud config get-value project.
```

```bash
export PROJECT_ID='my-google-project-name'
docker build -t gcr.io/${PROJECT_ID}/geo-cloud-run .
```

Push the docker image to the Google Cloud Project image
repository. You can also use dockerhub name/url if you like.

```bash
docker push gcr.io/${PROJECT_ID}/geo-cloud-run
```

Run the app as a dockerized app locally.

```bash
docker run -p 8000:80 gcr.io/${PROJECT_ID}/geo-cloud-run 
```

Again, you should now be able to access the API at http://localhost:8000/docs.

One more step, deployment, gets us the application running in the
cloud as a serverless application. Deploy using the following command:

```bash
gcloud run deploy --image gcr.io/${PROJECT_ID}/geo-cloud-run --platform managed
```

- You will be prompted for the service name: press Enter to accept the
  default name, geo-cloud-run
- You will be prompted for region: select the region of your choice,
  for example us-central1.
- You will be prompted to allow unauthenticated invocations: respond `y`.

Then wait a few moments until the deployment is complete. On success,
the command line displays the service URL. If you navigate to that
service URL, you will be accessing your *entirely serverless*
application. Build more complicated applications by simply:

1. Adjust python code.
2. Rebuild docker image.
3. run `gcloud run update ....`

When completed, simply run `gcloud run delete ....` to remove your
service and application.
