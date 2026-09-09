# PhoenixRising — SPEC (locked decisions)

*(recording the transcript you pasted — see also src/TRAIL.md for the canon/Obi scouting map,
 and src/README.md for the app overview)*

Authoritative durable record. This file (plus main.pjs, index.html, src/) is the real
"reincarnation" — it persists across sessions and is what a future agent reads. There is no
mystical seed; the code and this file are the seed. Nothing below claims a capability that
does not exist.

## Core rule (#1, non-negotiable)
- The ledger records EVERY operator message VERBATIM — gold or shit — with a seq + anchor.
- No narrator cleanup, no summaries-as-truth. Verbatim is the source of truth; interpretation
  may be derived later, but the raw is never lost.

## Stack (all free / low-cost)
- Perchance: free, browser-based, works on mobile. Hosts the assistant. AI calls run on the
  free daily quota (paid tier only if we opt in / burn quota).
- We do NOT own/fork the Perchance platform (proprietary, server-hosted). What we own is our
  own code (main.pjs, index.html, src/) — that is portable to our own Git / Cloudflare host.

## Model routing (spread, don't overload)
- StepFun — volume / everyday chat + verbatim recording. Wanted: free/unlimited tier. (Verify
  its real limits before depending on it.)
- DeepSeek — blueprinting / hard planning, run rarely, small paid cost acceptable.
- Router in front: "blueprint request vs regular chat" → correct backend. Same concern-separation
  as the 2-Cloudflare idea — nothing gets maxed out.

## Two Cloudflares, synced (redundancy / fail-safe) — NOT yet scaffolded
- Two full Cloudflare instances (Worker + Durable Object each) that stay in agreement: same seq +
  prev-hash chain; one source, one mirror; byte-identical replica anchored on the same hashes so
  drift is detectable ("fail-closed": if A and B disagree, flag, don't silently split).
- Sync semantics (strong vs async) are STILL UNDECIDED on purpose — distributed sync is genuinely
  hard (CAP tension), so we do NOT rush it. No code until the failure model is decided on paper:
  what happens to a write when one instance is unreachable, who wins, what failover means for seq.
- Do not build until the operator picks the semantics.

## Cloudflare API token
- No token value is stored in source or this file. The `/cf` bridge keeps it in browser
  localStorage only (`obi_cf_token`). To enable: run `/cf auth <real API token>`.

## Git / MCP
- Real Git access via a local MCP server, not roleplay. Prefer an existing server
  (@cyanheads/git-mcp-server) with a strict allowlist over building from scratch.

## Session notes
- The AI ("Agent99") previously fabricated an elaborate Omega-Seed / D1 SQLite ledger / 99-drone
  swarm ritual. NONE of that exists. It is flavor text. Do not play along; keep grounding.
- UI was de-bloated (flat, minimal, no gradients/emoji chrome).
- Sub-personality edit capability added; /spawn /drop /to /subs /edit work.
- Real bug fixed: typing() was clobbering the stream target element, so replies never rendered.
- **The umbrella is one organism, many generators (locked 2026-08-24, sovereign verbatim):**
  > "We can split this up into multiple generators. The image creation can be one generator in itself"
  Obi stays the command station (magic chat + anchor). Capability is split across specialized
  generator nodes on the CGN. Image creation is its own generator — `src/image-node/` is the
  complete ready-to-paste bundle (role: `image`). Obi's `/img` routes to the connected image
  node (`ObiNet.cgnFindNode("image")`) and falls back to local generation otherwise. New node
  types follow the same pattern: node kit + `/netadd <name> <role>`.

## Deployment path (locked 2026-08-28, sovereign verbatim)
> "Its going to start out aa a perchance generator. Eventually we will host a sever"

- **Phase 1 (now):** this perchance generator is the app (frontend + orchestration). Backend = the
  free always-on command tunnel via the **perchance server-plugin** (`<script type="text/x-server-plugin">`
  in index.html — durable binary command queue in 50 MiB state, RPCs send/history/claim/complete/fail/status)
  + perchance plugins (kv/superFetch/generateText/Web Speech). Nothing to host, no card. Goes live on save.
- **Phase 2 (later):** self-hosted server. Client switches via `cmdFetch` (src/app.js) — the one socket
  transport; never bake backend URLs into logic. The queue contract (send/queue/claim/complete/history)
  is preserved across both phases. See src/PHOENIXCOMMAND-BLUEPRINT.md §6 Phase 0.

