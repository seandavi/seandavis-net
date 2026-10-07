---
name: blog-post
description: Drafting process for blog posts on seandavis.net, from backlog to publish. Use when Sean mentions a blog post, new post, draft a post, post idea, the backlog, or wants to brief, outline, draft, review, or publish a post.
---

# Blog posts on seandavis.net

A post moves through six stages: backlog, brief, outline, draft, voice pass, review and publish. Each stage leaves a record on GitHub (an issue or a PR) so work can stop and resume across sessions.

Ground rule for every stage: **ask, don't invent.** No claims, anecdotes, opinions, numbers, or experiences that Sean hasn't supplied or confirmed. When something is missing, ask him, or leave a `[confirm: …]` marker in the draft.

Voice rules live in `docs/voice.md`. Read it before writing any prose.

## 1. Backlog

The backlog is the set of open issues labelled `post-idea` in `seandavi/seandavis-net`.

- List it: `gh issue list --label post-idea`
- Add to it: file an issue from the "Post idea" form (`.github/ISSUE_TEMPLATE/post-idea.yml`), either in the GitHub UI or with `gh issue create --label post-idea` and a body that follows the form's headings (working title, the point, intended readers, what prompted it, material, Sean's notes). Fill only what Sean said.

## 2. Brief

Interview Sean before writing anything. Cover, one question at a time where it helps:

- The point, in one or two sentences.
- Who the readers are and what they already know.
- What prompted it.
- His material: repos, notebooks, talks, papers, notes, earlier posts. Read what he points to.
- What he wants readers to do next.

Record the brief as a comment on the issue (`gh issue comment <N> --body-file /tmp/brief-<N>.md`), using his wording where he gave it. Note open questions explicitly.

## 3. Outline

Propose an outline as an issue comment: section headings, one line each on what the section says, and which of Sean's material it draws on. Wait for Sean to approve or revise it. Don't start the draft until he does.

## 4. Draft

1. Worktree and branch from `origin/main`:
   `git fetch origin && git worktree add ../seandavis-net-post-<slug> -b post/<slug> origin/main`
2. Create the post as `src/content/blog/<slug>.md`, or `src/content/blog/<slug>/index.md` with images beside it referenced relatively (`![alt](./fig.png)`). Both publish at `/blog/<slug>/`. Frontmatter:

   ```yaml
   ---
   title: "…"
   date: YYYY-MM-DD        # draft date for now; set the publish date at the end
   description: "…"        # one sentence, used in the listing and <meta>
   draft: true
   ---
   ```

   `aiAssistance` is required (see below). Other fields (`archived`, `aliases`) are in `src/content.config.ts`; new posts normally don't set them.

   Set `aiAssistance` when you create the file, not at the end: a short sentence on what the AI did (for example `aiAssistance: "Drafted with Claude Code from Sean's notes and outline; reviewed and edited by Sean."`), or `aiAssistance: none` if there was none. An agent-drafted post says so. The build fails for non-archived posts dated 2026-10-08 or later without it.
3. Write in Sean's voice per `docs/voice.md`. His own material and wording come first; prefer quoting or adapting what he wrote over paraphrasing it. Give fenced code a language (```` ```r ````, ```` ```bash ````) so it highlights. Citations use `[@key]` against `src/content/references.bib`.
4. Mark anything that needs his confirmation inline: `[confirm: is this the 2024 or 2025 release?]`. Don't guess past a gap.
5. Commit and push, then open a draft PR that closes the issue:
   `gh pr create --draft --title "Post: <title>" --body "Closes #<N>"`
6. The PR-preview build includes drafts (banner + `noindex`); the `*.workers.dev` URL commented on the PR is where Sean reviews the rendered post. `npm run dev` shows drafts locally too.

Commits that touch only post content carry **no** `Co-Authored-By` trailer.

## 5. Voice pass

Before asking for review, check the draft against `docs/voice.md`, at minimum:

- Avoid-list words and the patterns-to-eliminate list.
- Em dashes.
- Bullets used for argument instead of prose (lists are for steps, prerequisites, outputs, links).
- Any AI attribution or "written with" phrasing in the title, body, or byline.
- The drafting checklist at the end of the guide.
- For a design or explainer post, `docs/voice.md`'s section D, and consider the adversarial
  authorship check it describes (a fresh model judges the draft against 3-5 real old posts
  with no context on provenance).

Fix what you find, then ask Sean to review on the PR, listing the open `[confirm: …]` markers.

## 6. Review and publish

Iterate on the PR until Sean is happy. Then:

1. No `[confirm:` markers remain (`grep -rn '\[confirm:' src/content/blog/<slug>*`).
2. Set `date` to the publish date and remove `draft: true`.
3. Confirm the `aiAssistance` wording with Sean. It renders only as `<meta name="ai-assistance">`; the prose never mentions it.
4. Mark the PR ready (`gh pr ready <PR>`), wait for green (`gh pr checks <PR> --watch`), and merge when Sean says so: `gh pr merge <PR> --squash --delete-branch`. Merging deploys to production and closes the issue.
5. Remove the worktree.
