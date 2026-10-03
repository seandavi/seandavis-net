---
title: "Creating this blog using Quarto, Github, and Netlify"
date: 2023-12-20
draft: true
---

This blog uses the [Quarto](https://quarto.org) static site generator to create a blog that is hosted on [Github](https://github.com) and deployed using [Netlify](https://netlify.com). The source for this blog is available at [github](https://github.com/seandavi/seandavi-blog).

In short, the process is:

1.  Create a new quarto blog project
2.  Create a new github repository with the contents of the quarto blog project
3.  Create a new netlify site that is linked to the github repository using the process [here](https://quarto.org/docs/publishing/netlify.html#github-action)
4.  Push changes to the github repository and netlify will automatically deploy the changes

I chose not to [execute code on github](https://quarto.org/docs/publishing/netlify.html#executing-code) and instead opted for a simpler approach of using the `quarto render` command to render the blog locally and then push the rendered content to github.
