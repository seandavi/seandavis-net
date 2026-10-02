---
title: "Using directory-local variables to customize the emacs project experience"
date: 2018-12-08
archived: true
aliases:
  - /post/2018-12-08-directory-local-variables-for-custom-emacs-projects/
  - /post/2018/12/2018-12-08-directory-local-variables-for-custom-emacs-projects/
  - /2018/12/using-directory-local-variables-to-customize-the-emacs-project-experience/
---

I use [emacs] for nearly all my editing and interactive analysis. As
one typically does, more than one project is the norm, not the
exception. Discovering [projectile] for project-specific buffers and
controls, combined with [helm] for very fast, fuzzy completions, makes
emacs a very convenient and efficient environment for most task.

One challenge I ran into was the need to have multiple interactive
python buffers, typically one per project. However, the out-of-the-box
behavior of [python-mode] is to have only one python interactive
buffer named "Python". In order to localize the python interactive
shell, I found it necessary to assign a custom name to the python
buffer and to associate that name with the project. Using
[directory-local variables] turned out to be the trick. It is also the
current [recommendation from the projectile project] for customizing
things in the current project. 

To set a directory variable, one first needs to know what variable to
set. A simple way to see what is available for customization is to
perform `M-x customize` followed by the mode to customize. In this
case, `python` suffices. The variable of interest is the
`python-shell-buffer-name`. With projectile-mode active and in a
project, `C-c p E` will prompt for the variable to customize, in this
case `python-shell-buffer-name`.

Then, supply the custom name. In my case, I am going with the
convention of "Python[MyProjectName]". Note that no `*` are used around
the name. The result will be a new `.dir-locals.el` file in the
project root directory. This new variable will only become active on
opening new files; it does not affect previously-opened files.
After this process, activating a new python shell will result in that
shell taking on the customized name and all python editor buffers in
the project will use the same project-specific 

The resulting `.dir-locals.el` file will look like:

```
;;; Directory Local Variables
;;; For more information see (info "(emacs) Directory Variables")

((python-mode
  (python-shell-buffer-name . "Python[MyProjectName]")))
```

[emacs]: https://www.gnu.org/software/emacs/
[directory-local variables]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Directory-Variables.html
[recommendation from the projectile project]: https://github.com/bbatsov/projectile/issues/139#issuecomment-48897066
[python-mode]: https://www.emacswiki.org/emacs/PythonProgrammingInEmacs
[projectile]: https://github.com/bbatsov/projectile
[helm]: https://emacs-helm.github.io/helm/
