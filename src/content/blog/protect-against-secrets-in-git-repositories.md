---
title: "Protect Against Secrets in Git Repositories"
date: 2017-12-02
description: "I recently got burned by inadvertently committing secrets to a github repository. This post just outlines one potential solution to avoiding repeating that experience."
archived: true
aliases:
  - /post/protect-against-secrets-in-git-repositories/
  - /post/2017/12/protect-against-secrets-in-git-repositories/
  - /2017/12/protect-against-secrets-in-git-repositories/
---

I made a mistake and am going to share it here. Please be gentle when
judging me. As penance, I spent some time to learn how to
systematically avoid making the same mistake and share that solution
here.

## The prelude

I had been working on some code that I thought was
going to be throw-away example code for loading a large dataset into
[ElasticSearch]. That said, I have been saved often enough by using a
version control system (now, *always* [git]), that I use it all the
time. "Knowing" that this code would never be shared, I was careless
and included my [Amazon Web Service (AWS)] [keys] in the code while I sorted out whether
[logstash] would pick up the keys from a central config file. At some
point, I committed the file that included the keys to git. As these
things go, several days passed and I found that I had a useful project
worthy of a push to github. No keys
present in the code, etc.--I checked. 

Within minutes (or maybe it was an hour--not sure) of when I pushed the code
to github, I got an email from [AWS] that, paraphrased, read:

> "We have
> found your AWS keys in a github repository. Please fix
> the problem and **DON'T DO THAT AGAIN**." 

Almost immediately after, I
got another email from AWS thanking me for deleting my keys. AWS
apparently scans GitHub repositories for AWS keys and has a system (I
suspect somewhat automated) for removing the exposed keys. I deleted
the GitHub repo and did some local checking and, in
retrospect, realized my mistake. Git had dutifully saved the entire
history of my project including a version of one file with AWS keys in
it. Upon pushing to GitHub, the keys were there in the history. I
breathed a sigh of relief that no harm had been done. 

Thankfully, I use AWS often. I logged in the next day and found that I
had about 100 servers running, in many different regions even, that I
hadn't started. In the short period of time that the keys had been
exposed, someone had been able to create two ssh keypairs and started
the machines. Needless to say, I spent quite a bit of time working to
clean up any instances and to remove keys, etc. that could have been
exposed (all of them, of course). The speed with which someone was
able to capitalize on my mistake was simply astonishing to me. That
said, I do want to hand it to the AWS folks who take a proactive role
in protecting my account security.

## Don't do that again

While I probably will not forget to check my code for "secrets" again
anytime soon, I started to look into ways to systematically check and
then preempt such occurrences. Ironically (or not), the folks at [AWS
Labs] have created a nice little project called [git-secrets] that
purports to:

> Prevent you from committing secrets and credentials into git repositories

And in more detail: 

> `git-secrets` scans commits, commit messages, and `--no-ff` merges
> to prevent adding secrets into your git repositories. If a commit,
> commit message, or any commit in a `--no-ff` merge history matches
> one of your configured prohibited regular expression patterns, then
> the commit is rejected. 

In other words, *prevent* keys and secrets from *ever* entering the git history.

## Example walkthrough with git-secrets

In this section, I just document for myself what it takes to get and
use `git-secrets` to protect a repository from inadvertently
committing keys to a git repository.

[Installation instructions] include both simple `Makefile`-based installation or using [homebrew] on my Mac. 

```sh
brew install git-secrets
```

At this point, the `git-secrets` executable should be in the
`PATH`. In typical git style, one can use either `git-secrets` or `git
secrets` to access functionality.

To play, I create a simple git repo and "install" the `git-secrets`
[git hooks]. Before any commit can succeed, these hook
scripts must exit successfully. 

```sh
# create an example git repo
mkdir secrets_example
cd secrets_example
git init
# now "install" the git-secrets hook
git secrets --install
```

And the result:

```sh
Installed commit-msg hook to .git/hooks/commit-msg
Installed pre-commmit hook to .git/hooks/pre-commit
Installed prepare-commit-msg hook to .git/hooks/prepare-commit-msg
```

At this point, the `secrets_example` git repository has been created
and the `git-secrets` pre-commit hook added. However, `git-secrets`
needs to be told about what secrets to look for. We can check what
`git-secrets` thinks is a secret.

```sh
git secrets --list
```

This will return "nothing" at this poing. In my case, I want to
have `git-secrets` check for AWS keys. `git-secrets` has a special
function for doing just that

```sh
git secrets --register-aws
git secrets --list
```

And now the result:

```sh
secrets.providers git secrets --aws-provider
secrets.patterns [A-Z0-9]{20}
secrets.patterns ("|')?(AWS|aws|Aws)?_?(SECRET|secret|Secret)?_?(ACCESS|access|Access)?_?(KEY|key|Key)("|')?\s*(:|=>|=)\s*("|')?[A-Za-z0-9/\+=]{40}("|')?
secrets.patterns ("|')?(AWS|aws|Aws)?_?(ACCOUNT|account|Account)_?(ID|id|Id)?("|')?\s*(:|=>|=)\s*("|')?[0-9]{4}\-?[0-9]{4}\-?[0-9]{4}("|')?
secrets.allowed AKIAIOSFODNN7EXAMPLE
secrets.allowed wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

`git-secrets` has added a set of patterns (regular expressions) that
will be matched against text before a commit can succeed. Adding a
specific pattern for another password is also straightford. 

```sh
git secrets --add 'MyPASSWORD[0-9]+'
```

Trying to commit a file with `MyPASSWORD123` fails.

```sh
echo 'MyPASSWORD123' >> test.file
git add test.file
git commit -m 'test file with password'
```
And the output 

```sh
test.file:1:MyPASSWORD123

[ERROR] Matched one or more prohibited patterns

Possible mitigations:
- Mark false positives as allowed using: git config --add secrets.allowed ...
- Mark false positives as allowed by adding regular expressions to .gitallowed at repository's root directory
- List your configured patterns: git config --get-all secrets.patterns
- List your configured allowed patterns: git config --get-all secrets.allowed
- List your configured allowed patterns in .gitallowed at repository's root directory
- Use --no-verify if this is a one-time false positive
```

`git-secrets` has a number of other [features and functions], but the
walkthrough above is enought to get me started.

## Additional links

- [Cloudwatch alarms] can be set to alert you about spending above a
  threshold.
- The ironically-named [gitrob tool] can scan existing GitHub repositories
- [AWS access keys best practices]
- Follow the principle of [least privileges] on cloud accounts

[ElasticSearch]: https://elastic.co/
[git]: https://git-scm.com/
[AWS Labs]: https://github.com/awslabs
[git-secrets]: https://github.com/awslabs/git-secrets
[homebrew]: https://brew.sh/
[AWS]: https://aws.amazon.com/
[Installation instructions]: https://github.com/awslabs/git-secrets#installing-git-secrets
[git hooks]: https://git-scm.com/book/gr/v2/Customizing-Git-Git-Hooks
[features and functions]: https://github.com/awslabs/git-secrets#options
[Cloudwatch alarms]: https://console.aws.amazon.com/cloudwatch/home
[gitrob tool]: https://github.com/michenriksen/gitrob
[AWS access keys best practices]: http://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html
[least privileges]: http://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege
