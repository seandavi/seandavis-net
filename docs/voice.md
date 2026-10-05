# Voice guide for blog posts

How posts on seandavis.net should sound. Written for two readers: an agent drafting a
post, and Sean reviewing it.

## Where this comes from

- **Blog corpus.** Sean's own posts from the old Hugo blog (2017–2020), the unpublished
  2023 Quarto blog, and the 2025 `blog.cancerdatasci.org` drafts. Quotes below are
  verbatim, typos included, and tagged with the post slug.
- **LinkedIn profile.** An earlier voice profile derived from Sean's LinkedIn posts.
  That is a different register (short, public, persuasive). The blog corpus confirms
  most of it and overrides a few parts. Each override is stated.
- **Not used as evidence.** Four items in the corpus are not Sean's voice. See
  [Excluded from the corpus](#excluded-from-the-corpus). Two of them are useful as
  examples of what to avoid.

Sections A and B are evidence. Section C is editorial judgment.

Quote tags are post slugs, shortened where long. Hugo posts live in `content/post/` on
the `source` branch of `seandavi/seandavi.github.io`; shortened tags drop the date
prefix and the tail (`create-a-basic-apache-spark-cluster` is
`2018-02-02-create-a-basic-apache-spark-cluster-in-the-cloud-in-5-minutes`). Quarto
posts are in `seandavi/seandavi-blog` under `posts/`.

## The one-paragraph version

Write a worked example by a working scientist for a smart colleague. Open with the
problem or the question that prompted the post, say plainly what the post will do, then
walk through it. Use "I" for your own choices, "we" while working through code with the
reader, and "you" for instructions. Name tools, versions, costs, and times. Say what you
haven't figured out. Credit people by name. End with where things stand and where they
could go next, not with a sales pitch.

## A. Profile rules the blog confirms

**First person, modest about his own work.** He calls things small, little, or niche,
and says when a post is only notes.
- "This little function is a bit "niche", but it does illustrate how one can leverage
  GenomicDataCommons package functionality" (genomicdatacommons-id-mapping)
- "This blog post simply serves as notes to myself about details of using that system."
  (using-google-cloud-registry)

**Honest about limits and what went wrong.**
- "Choosing the appropriate size and number of machines while balancing costs is an art
  form that I have not mastered." (create-a-basic-apache-spark-cluster)
- "I made a mistake and am going to share it here. Please be gentle when judging me."
  (protect-against-secrets-in-git-repositories)

**Specific over vague.** Numbers, versions, instance types, times, and counts, including
honest imprecision.
- "we expect to have >150 participants, each with his/her own machine" (infrastructure-as-code-packer)
- "Within minutes (or maybe it was an hour--not sure) of when I pushed the code to
  github" (protect-against-secrets-in-git-repositories)

**Friction details up front: prerequisites, cost, time.**
- "If you do not have an AWS account, you will not be able to actually build the AMI."
  (infrastructure-as-code-packer)
- "This build takes quite some time (perhaps 20 minutes or so)." (infrastructure-as-code-packer)

**Charitable before critical.** Acknowledge the common or simpler option before
recommending another.
- "While setting up and running Airflow locally on a laptop or desktop is not too
  challenging, once resources become limited ... a managed service like Google Cloud
  Composer ... becomes useful." (test-driving-google-cloud-composer)
- "Above, I have used the tidyverse approach, applying `dplyr` `left_join()`s. Using base
  R `merge` would also work." (extracting-clinical-information)

**Translator for mixed audiences.** Define a term inline, in plain words, the first time
it appears.
- "The data model (how data are described and linked to each other) is quite
  complicated" (leveraging-bioconductor-for-somatic-variant-analysis)
- "These case_ids, each representing a single case (patient) in the GDC" (extracting-clinical-information)

**Community framing and credit.** Name the people whose work made the post possible,
and the person whose question prompted it.
- "Thanks to Levi Waldron, Lori Shepherd, Marcel Ramos, Martin Morgan, and multiple
  workshop authors for their contributions." (infrastructure-as-code-packer)
- "a question that came up on twitter from @sleight82" (testing-the-genomicdatacommons-package)

**Endings invite, they don't sell.**
- "That said, I always appreciate comments and suggestions for improvements"
  (learning-github-actions)

## B. Blog-register rules (additions and overrides)

**Open with the prompt or the problem, then state what the post does.** Three openings
recur: a real question someone asked, a problem he hit, or a one-line statement of the
post's job.
- "I hear from GEOquery users that sometimes they just want to get the metadata for one
  or more accessions rather than getting the entire GEO record." (cloud-run-notes)
- "One challenge I ran into was the need to have multiple interactive python buffers,
  typically one per project." (directory-local-variables-for-custom-emacs-projects)
- "In this post, I will quickly build a docker image containing the sra-toolkit and a
  key for dbGaP downloads." (using-google-cloud-registry)

**Scope the post honestly near the top.** Say what it is not.
- "This is not a recommendation of AWS over other potential providers and choices in the
  following workflow are *not* meant as best practices." (create-a-basic-apache-spark-cluster)

**The worked example is the point.** Posts are operational on purpose. Explain enough to
follow along, then let the code carry the rest.
- "This post, like many of my posts, is very operational, but I have found that a worked
  example is usually more valuable than long expository posts." (learning-github-actions)
- "Sorry, but I'm going to let the code do most of the talking here." (cloud-run-notes)

**Person shifts by job.** "I" for choices and opinions, "we" while working through code
together, "you" or the bare imperative for steps the reader performs.
- "I switch to the directory that is mapped back to the host so that I can keep the
  binary packages around" (build-linux-R-binary-packages)
- "Now, we have two data frames describing the normal- and tumor-derived TCGA-BRCA gene
  expression files." (testing-the-genomicdatacommons-package)
- "Login to your AWS console." (create-a-basic-apache-spark-cluster)

**Introduce every code block with one short sentence that says what it does.** Usually
ends in a colon. Show the output after it when the output matters.
- "Building the container is one line:" (using-google-cloud-registry)
- "And the output will be something along the lines of:" (test-driving-google-cloud-composer)

**After code, point at the one thing worth noticing.** "Note" is the usual word.
- "After logging into Rstudio, execute the following command. Note the `INSTALL_opts`."
  (build-linux-R-binary-packages)
- "Note the `%20` that represents a url-encoded `space` character." (learning-github-actions)

**Explain every placeholder** the reader must replace.
- "The `PATH_TO_LOCAL_STORAGE_DIRECTORY` should be replaced with the local directlry
  where the binary packages will land" (build-linux-R-binary-packages)

**Date anything that will age.** Versions, beta features, and personal tool choices get
an "as of" marker. Say when output may differ.
- "As of this writing, GitHub Actions are available as a _beta_ feature" (learning-github-actions)
- "As of today, I am using poetry for python dependency management" (cloud-run-notes)
- "Your version of limma may differ." (build-linux-R-binary-packages)

**Corrections are visible and dated.** Don't silently rewrite a published claim.
- "EDIT [01-02-2018]: Added `legacy` flag to function to allow mapping of legacy file
  UUIDs." (genomicdatacommons-id-mapping)

**Cost and cleanup warnings are loud and repeated.** This is the one place bold and
callouts are normal.
- "**Note:** This blog post creates resources on a commercial cloud which will continue
  to cost money until they are terminated." (create-a-basic-apache-spark-cluster)
- "**Remember to kill the docker container after you are done**." (build-linux-R-binary-packages)

**Headings: plain section labels for tutorials.** Recurring ones: Background,
Preliminaries or Prerequisites, Walkthrough, Usage, Best practices, From here or
Conclusion, References. Short prose posts need no headings.
- Evidence: using-google-cloud-registry (Background, Preliminaries, Usage, Best
  practices, From here); build-linux-R-binary-packages (Background, Walkthrough).

**Override of the profile's "no bullet lists" rule.** Lists are allowed in blog posts for
things that are naturally a list: install prerequisites, numbered procedures, CLI
prompts, enumerated outputs, and link collections. The argument, the explanation, and
the conclusion stay in prose. No bold lead-ins on list items.
- Procedure: "The strategy that I am going to employ is a three-step approach" followed
  by a numbered list (testing-the-genomicdatacommons-package)
- Enumerated output: "returns a set of four related `data.frame`s:" followed by one line
  per table (extracting-clinical-information)
- Link collection: "Additional links" (protect-against-secrets-in-git-repositories)
- Tables are fine for reference material: a key-binding table (vscode-neovim-keys).

**Light, dry humor in asides.** Parentheticals and self-deprecation, never jokes for
their own sake.
- "The Bioconductor package ecosystem continues to grow at an exponential rate (check
  it--I am right)." (single-cell-package-dependencies)
- "There, by default, you are redirected to the auto-generated OpenAPI API documentation
  (yes, you get this *for free*)." (cloud-run-notes)

**Emphasis: italics on the single word that carries the point.**
- "*everything* has a unique identifier" (genomicdatacommons-id-mapping)
- "In other words, *prevent* keys and secrets from *ever* entering the git history."
  (protect-against-secrets-in-git-repositories)

**Endings: where things stand, then what's next.** Summarize what the reader now has,
state the limit that still applies, and point to a next step or related tool.
- "This image can be used anywhere a docker image can run, but only if google
  authentication has been tied into docker." (using-google-cloud-registry)
- "This little post is just to whet the appetite." (omicidx_bigquery_python)

**Recurring connectives that sound like him:** "That said," / "At this point," / "In this
case," / "Note that" / "In short," / "Here, I ...".
- "That said, code for Spark need not be written on a large cluster."
  (create-a-basic-apache-spark-cluster)
- "At this point, the docker image has been created." (using-google-cloud-registry)

## C. Old habits not to repeat (editorial judgment, not evidence)

- **Typos and dropped sentence endings.** The old posts have many ("introducds",
  "infomation", "poing", "enought", "straightford", "directlry", "intalled") and two
  sentences that stop mid-thought (directory-local-variables, omicidx_bigquery_python).
  Proofread every post. Don't imitate these to sound authentic.
- **Double hyphen as a dash.** Old posts use `--` often. Prefer a comma, a period, or
  parentheses. At most one dash per post.
- **Hedge-word padding.** "simply", "just", "easy", "quite", and trailing "etc." pile up
  in the old posts. Cut them unless they mean something. "Simply" in instructions reads
  as dismissive when the step fails.
- **"Leverage" and "facilitate".** Sean used both often. Prefer "use" and "help".
- **Promised follow-ups that never came** ("In a future post, I may look at ...",
  "That will need to wait for another post"). Only mention a next post if it is drafted.
- **Pointers to a comment section** ("see comment below", "(see below)"). This site has
  no comments. Point to a real channel (email, a GitHub issue) or leave it out.
- **Dated phrasing.** "his/her" becomes "their". "Login to" (verb) becomes "Log in to".
  Don't embed tweets; quote and link instead.
- **Dated tech presented as current.** `biocLite`, Python 2.7, beta-only features. When
  porting or citing an old post, mark the date or update the code.

## Avoid-list (from the profile, unchanged)

These words read as machine-written to Sean's audience. Don't use them in post prose:

actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance,
fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective),
landscape (abstract noun), pivotal, showcase, tapestry, testament, underscore, valuable,
vibrant, groundbreaking, transformative, revolutionary, unprecedented, seamless

Sean's old posts use a few of these ("enhance reproducibility", "valuable", "delve").
The list still applies to new prose.

## Patterns to eliminate (from the profile, unchanged)

- Significance inflation: "marking a pivotal moment", "represents a shift", "reshaping
  the landscape"
- Superficial -ing endings: "highlighting X", "underscoring Y", "contributing to Z"
- Negative parallelisms: "It's not just X, it's Y". State the point directly.
- Copula avoidance: use "is/are/has", not "serves as", "stands as", "boasts"
- Em dash overuse
- Generic conclusions: "exciting times ahead", "looking forward to seeing where this goes"
- Persuasive authority tropes: "at its core", "what really matters", "the real question is"
- Rule of three: don't force ideas into groups of three
- Signposting: "let's dive in", "here's what you need to know"
- Refrain repetition: reusing the same distinctive phrase twice in one post ("guessing
  at what mattered" showing up twice in a draft) to sound clever. Say it once.
- Aphoristic closers: a short declarative sentence built to be quotable ("My problem is
  the opposite shape.", "Each agent, on each host, starts from nothing."). State the
  fact and move on; don't reach for rhythm.
- Negative parallelism dressed as contrast: "not X, but Y" or "X rather than Y" used
  more than once in a post. One is fine if it's the clearest way to say it; a second or
  third reads like a template.

Two more, added from the corpus's machine-generated drafts (see below):

- **Unsourced numbers.** Every statistic is either measured by Sean or cited. No
  benchmark figures, percentages, or dollar savings without a source he has checked.
- **Report voice.** No "This report presents", "Three critical next steps emerge", or
  numbered lists of benefits with bold headers. A post is one person explaining
  something, not a white paper.

## Attribution rule

Post prose never contains AI attribution. No "written with the help of ChatGPT", no
"generated by", no thank-you to a model. If disclosure is wanted, it goes in HTML
metadata only (for example a `<meta>` tag), never in the body, title, or a visible
byline. A frontmatter field that the layout renders on the page counts as visible.

Counter-example from the corpus: "This article was written with the help of ChatGPT."
(retrieval-augmented-generation-1, with "ChatGPT" also listed as an author).

## Drafting checklist

1. First paragraph names the problem or question and what the post will do.
2. Scope or "this is not" sentence if readers could over-read it.
3. Prerequisites, cost, and time stated before the first command.
4. Every code block has a one-line lead-in; every placeholder is explained.
5. Versions and beta features carry an "as of" date.
6. Lists only for steps, prerequisites, outputs, and links. Argument in prose.
7. People and projects credited by name with links.
8. Ending says where things stand and what's next. No hype, no generic sign-off.
9. Nothing from the avoid-list or patterns-to-eliminate; no unsourced numbers.
10. No AI attribution anywhere in the visible post.
11. For design/explainer posts, section D's structural notes; optionally, an adversarial
    authorship check per "Checking a draft against this guide".

## D. Design and explainer posts (no direct corpus evidence)

The blog corpus is entirely operational tutorials: a problem, a worked example, a
walkthrough. It has no design essay, no "here's a tool I built and why it's shaped this
way" post. For that genre (a project writeup, an architecture explainer), the
sentence-level habits in sections A and B still apply, prefer plain transitions over
essayist ones, charitable-before-critical, person shifts by job, italics on one word, and
"That said," / "At this point," over built-up framing, but the structural habits don't
transfer directly:

- Headings can be functional labels for the design's own parts (what a tutorial's
  Background/Walkthrough/Conclusion become here), not a question-and-answer tutorial
  shape. Avoid literary headings ("The detour", "The honest limit") in favor of plain
  ones ("What I tried first", "What it doesn't do").
- Prior art (other tools, other papers) gets named and credited, per the community-
  framing rule, but don't compress it into a survey paragraph that reads like a related-
  work section: one sentence per system, five systems in a row, is a tell. Spend more
  room on fewer of them, or fold the comparison into the design rationale instead of
  giving it its own section.
- A failure story (something tried and dropped) should still read like old-3's
  mistake post: plain and specific about what happened, not a tidy abstract reason
  followed by a lesson. Keep the shape even if the content is a project decision rather
  than a personal mistake.

## Checking a draft against this guide

A useful check beyond re-reading: hand a fresh model or agent, with no context on how
the draft was produced, three to five real old posts plus the new draft, and ask it to
judge bluntly whether the draft was written by the same person, quoting specifics. It
will find real problems (refrains, aphoristic closers, essay-shaped surveys). It will
also flag the absence of things this guide deliberately excludes, typos, "simply"/"etc."
padding, double-hyphens as dashes. Fix the first kind. Don't restore the second kind
just because a critic missed it; section C says why those are excluded on purpose.

## Excluded from the corpus

- `blog.cancerdatasci.org/posts/welcome` and `posts/post-with-code`: Quarto blog template
  defaults. Authors are "Tristan O'Malley" and "Harlow Malloc", the placeholder names
  the Quarto template ships with, and the text is the template's ("This is the first
  post in a Quarto blog. Welcome!").
- `blog.cancerdatasci.org/posts/modern-data-engineering`: no author, and it reads as a
  machine-generated research report: "presents both unprecedented opportunities",
  "This report presents", unsourced benchmarks ("73% faster hypothesis generation
  cycles"), and 45 search-result citations. Used here only as a counter-example.
- `seandavi-blog/posts/retrieval-augmented-generation-1`: ChatGPT is listed as an author
  and the text says it was written with ChatGPT's help. Counter-example only.

Partly used:

- `using-github-for-gathering-software-requirments` (2025 draft): the opening is Sean's
  ("I'm sitting in a 60-minute meeting to discuss "a new website."" plus a footnote
  admitting the scenario is hypothetical). The body shifts to avoid-list language
  ("Harnessing", "Perhaps most crucially", "This transparency fosters trust") and a
  bulleted benefits list. Only the opening informs this guide.
- `new-genomic-technologies-for-multicancer-early-detection` (2023): journal-club notes
  written as summary bullets. Too little connected prose to judge voice.
- Hugo posts with little or no prose: `an-introduction-to-aws-lambda-functions` (draft
  command notes), `google-kubernetes-autoscale-with-preemptible-instances` (code only),
  `aws-website-with-cloud-cdn` (empty stub), `elasticsearch-strings-runthrough`
  ("just a brain-dump post").
