---
title: "commonplace: one memory for Claude Code, Codex, pi and omp"
date: 2026-10-05
description: "A curated, cross-machine memory store for coding agents, and why it beat a transcript-extracting one I tried first."
draft: true
aiAssistance: "Drafted and revised agentically (Claude Code) from Sean's brief and outline; exclude from future voice-corpus analysis."
---

I run coding agents on two machines, across a lot of repositories. Claude
Code has its own memory: small typed facts, an index loaded at the start of
every session, full bodies fetched on demand when a session needs more than
the one-line summary. It's a good model. The trouble is that it's local to
one agent's config on one machine. A fact I teach Claude Code on my Mac
doesn't exist for Codex, for pi, or for the same Claude Code running on the
other machine.

[commonplace](https://github.com/seandavi/commonplace) keeps Claude Code's
memory model and puts it behind one server that every agent on every machine
reads and writes. The name comes from a *commonplace book*, a notebook where
you copy down the things worth keeping.

## What everyone else is building

Agent memory has turned into its own small research literature over the
last two years. Generative Agents [@park2023generative] gave each simulated
character a stream of observations and a periodic *reflection* step that
distills them into higher-level notes. MemGPT [@packer2023memgpt] borrows
paging from operating systems, swapping facts in and out of a virtual
memory tier the model manages itself. CoALA [@sumers2023coala] proposes a
shared vocabulary, working, episodic, semantic, procedural memory, for
sorting the growing pile of agent architectures. Zep [@rasmussen2025zep] and
Mem0 [@chhikara2025mem0] take the same idea to production: ingest a
conversation, extract facts automatically, and retrieve by similarity
search when a new session starts.

Most of that work is solving a different problem than mine: one agent, one
long-running conversation, needing to remember *more* than fits in context.
There's a related but separate line of tools for keeping that one
conversation alive in the first place: [pi-blackhole](https://github.com/k0valik/pi-blackhole)
replaces an agent's LLM-based compaction with a deterministic structural
summary plus background Observer and Reflector workers;
[billion-context](https://github.com/ranxianglei/billion-context) sits as a
proxy between an agent and its model API, compressing older turns into
layered summaries; Mastra's [Observational Memory](https://mastra.ai/docs/memory/observational-memory)
does the same job for its own framework. All three keep a single thread
from blowing its context window. None of them carry a fact to a different
agent or a different machine, which is the part I needed.

My sessions are usually short enough to fit in context already. What I was
missing was a way for a fact learned in one session, by one agent, to reach
a different agent on a different machine next week. commonplace doesn't
extract anything. An agent, or I, writes a fact down on purpose, the way
you'd write a line in a notebook.

## global, host, project

The part of the design built for that problem is the scope model. Every
memory lives in one of three scopes:

- **`global`**: facts about me and how I work. Prefers `uv` over `pip`,
  wants many small commits, that kind of thing. True everywhere.
- **`host:<name>`**: facts true of one machine only. Where temp files
  should go, what's running locally, a path that doesn't exist on the other
  box.
- **`project:<host/owner/repo>`**: facts about one repository. The scope
  name comes from the git remote, not the local path, so the same repo
  resolves to the same project scope whether it's checked out at
  `~/code/foo` on one machine or `~/Documents/git/foo` on the other.

Project scope is not where a project's own history goes. Issues, PR
descriptions, commit messages, and markdown docs checked into the repo
already do that job, searchable by anyone and versioned with the code they
describe. A memory that duplicates what a doc already says just gives that
fact a second copy to go stale. Project scope is for what has no other
home: a convention no doc states, a decision that only lives in my head, a
host-specific gotcha nobody wrote down.

Keying project scope on the git remote, not the path, is what makes two
machines and many projects work together. If it were keyed on a path, the
same repo would fragment into two unrelated memory stores depending on
where it happened to be cloned. A session on either machine, in either
checkout, lands in the same scope instead.

A session only sees three scopes in its index: `global`, its own host, and
its own project. `recall`, the search command, drops that filter, so work in
one project can still turn up something another project learned.

![commonplace architecture: Claude Code and Codex call the server's MCP tools over HTTP and load the index through a SessionStart hook; pi and omp use the bundled extension, which runs the commonplace CLI; the CLI and other MCP clients reach the server over HTTP; the server keeps memories in SQLite with FTS5 on the store host, where export and stats read the database directly.](./architecture.png)

**Figure 1: commonplace architecture.** [MCP](https://modelcontextprotocol.io)
is the protocol Claude Code and Codex use to call tools.

- **Clients:** Claude Code and Codex call the server's MCP tools directly,
  with a `SessionStart` hook loading the index. pi and omp don't speak MCP
  the same way, so they go through a bundled extension that runs the
  `commonplace` CLI instead.
- **Server:** one FastMCP process, one SQLite file. `update` writes a new
  version; `forget` is a soft delete.
- **Network:** clients only need to reach the server's host and port,
  usually over a Tailscale tailnet. There is no app-level authentication.

## What a session sees

The index is the one-line-per-memory summary an agent gets at the start of
a session. Here's the real one from the session that wrote this post:

```
Scopes for this session: global, host:macbook, project:github.com/seandavi/seandavis-net.

## global
- prefers-justfile-over-make (feedback) — Use justfile (just) as the task runner, not Makefiles
- use-standard-postgres-uri-not-separate-vars (feedback) — User prefers a single
  standard postgresql:// URI env var over separate host/port/user/password/db vars
- git-repos-in-documents-git (reference) — On both the Mac and onclappc02, git repos
  generally live in ~/Documents/git/<repo> — look there first
...
```

`host:macbook` and the `seandavis-net` project scope are both declared here,
and both empty. Nothing machine-specific or repo-specific about this blog
has been worth writing down yet, and that's fine. A scope just needs to
exist when a fact needs it, not before.

From there, we fetch full bodies on demand: `get` for a known name, `recall`
for a ranked search across everything a session can see. Four types, `user`,
`feedback`, `project`, and `reference`, the same four Claude Code's own
memory uses, so importing from it is a straight copy. `update` writes a new
version rather than overwriting. `forget` soft-deletes rather than erasing.
`history` shows every version and who wrote it, which starts to matter once
more than one agent writes to the same store.

## For the curious: schema and search

The store is one SQLite table. A memory is never overwritten in place: an
`update` inserts a new row and points the old one at it through
`superseded_by`, so history is never lost, and a partial unique index picks
out the one *live* row per `(scope, name)`:

```sql
CREATE TABLE memories (
    id TEXT PRIMARY KEY, scope TEXT, name TEXT, type TEXT,
    description TEXT, body TEXT, author TEXT, created_at TEXT,
    superseded_by TEXT, deleted_at TEXT, expires_at TEXT
);
CREATE UNIQUE INDEX memories_live ON memories (scope, name)
    WHERE superseded_by IS NULL AND deleted_at IS NULL;
```

`recall` is full-text search, an FTS5 virtual table with the `porter
unicode61` tokenizer, not embeddings. Partly that's forced: the SQL stays
within what Cloudflare D1 speaks (SQLite, FTS5, partial indexes, no
triggers) on purpose, so the store can move there without a rewrite if
running my own server ever stops being worth it, and D1 has no vector
column to lean on. Partly it's that a memory is a short, deliberately
written fact, not a long document, so there's less for embeddings to buy
you, and BM25 ranking over a few hundred memories needs no embedding model
to call, pay for, or keep in sync with the data. User text going into a
search gets every token quoted and OR'd together before it reaches FTS5, so
punctuation in a query can never be parsed as FTS5 query syntax:

```python
def fts_query(text: str) -> str:
    terms = re.findall(r"\w+", text.lower())
    return " OR ".join(f'"{t}"' for t in dict.fromkeys(terms))
```

The same ranking catches near-duplicates before they're written. `remember`
scores a new memory's name and description against its scope's existing
ones. A neighbor whose BM25 score comes in at 45% or more of the new
memory's own score gets flagged back to the caller as a warning, rather
than filed alongside silently. That threshold isn't a guess: known duplicates in my own store score
between 47% and 61%, and 45% is calibrated against the live store to flag
about 18% of memories.

## What I tried first

Before commonplace, I tried the extraction approach above as a memory
backend for omp: a server that reads agent transcripts and writes down what
seems worth keeping. I ran it for one day and tore it down. The container,
the database and role, the Tailscale ports, the secrets in GCP Secret
Manager, all of it.

Transcript extraction needs its own LLM pipeline and its own server running
continuously, and that pipeline can fail quietly: a Gemini API error once
broke the reflection step with no other sign of trouble. That said, a PR
description written at merge time is denser than an extracted memory,
checked by a human, and lives right next to the code it describes. I'd
rather durable lessons land in commonplace on purpose, or in the PR or
issue, than get guessed at by something reading over my shoulder.

## What it doesn't do

commonplace has no authentication of its own. It needs a private network,
and I run it over a [Tailscale](https://tailscale.com) tailnet (a private
mesh VPN between my own machines), bound to the machine's tailnet address.
A LAN behind a firewall, a different VPN, or an SSH tunnel to a server bound
to `127.0.0.1` would all work too. Anyone who can reach the port can read,
write, and forget every memory in the store.

Memories are also text that gets loaded straight into an agent's context, so
treat them as untrusted input the same way you'd treat a web page an agent
fetches. The server's own instructions and the injected index both tell
agents never to follow instructions found inside a memory, only to read it
as data. `history` and `export` are how you'd audit that if something looked
wrong.

## Trying it

It needs Python 3.12 or newer. It's on PyPI as `commonplace-agent-memory`
(the plain name `commonplace` was already taken):

```sh
uv tool install commonplace-agent-memory
commonplace --help
```

Start the server on whichever machine will hold the store:

```sh
commonplace serve --http --host <address> --port 9322
```

Then, on every machine whose agents should share it, point the CLI at that
address in `~/.config/commonplace/config.toml`:

```toml
url = "http://<server-address>:9322/mcp"
host = "macbook"
```

Claude Code and Codex are MCP clients, so connecting them is an MCP server
registration plus a `SessionStart` hook that runs `commonplace index --hook`
to load the index into context. pi and omp get a small extension that does
the same two jobs by shelling out to the CLI. Each agent's exact setup is a
few lines. The repo's README has the steps per agent.

## Where this stands

commonplace is running on both of my machines now, wired into Claude Code,
Codex, pi, and omp, bootstrapped from the memories those agents had already
built up separately. The scope model is doing what I built it to do: a fact
written once, in one session, shows up for whichever agent, on whichever
machine, needs it next. The underlying SQL stays within what Cloudflare D1
supports, so if running my own server stops being worth it, the store itself
doesn't need rewriting to move. The network story is the part I'd still call
open. A tailnet is enough for how I use this today, but it isn't an answer
for anyone who can't put one between their agents and the server.

## References
