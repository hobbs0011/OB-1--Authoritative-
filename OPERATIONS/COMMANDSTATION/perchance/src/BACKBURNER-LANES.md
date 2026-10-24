# UNIFIED RUN — Kilo drives, git + cf integrated (least-token path)

One run, not three lanes. Kilo drives all coding/execution; git and cf are
integrated tools inside that run, not separate lanes. Secrets never enter
source. Backburner (src/Backburner.md, 6 retirements QUEUED) is input only —
this run retires nothing, aims nothing, merges nothing from the subs.

## HOW IT RUNS (cheapest-token order)

1. KILO PROOF (once, cheap) — `/tool key test` proves the held JWT by a
   free-lane inference (kilo-auto/free, max 300 so the reasoning lane can finish). `/models` catalog is public
   (200 no-auth) so it proves nothing — skip it unless the count is needed.
   One receipt in kv `mcp`, done. Key already held in this browser.
2. KILO CODES — `/forge brain kilo` (default when a kilo key is held) +
   `/forge do <instruction>` stages edits. Read windows, exact-string
   `replace`, small `max_tokens`, stop when the staged diff already shows
   the change. Receipts land in kv `mcp` like any other tool call.
3. GIT PERSISTS (inside the same run) — Backburner + this file are already
   in SRC_SNAPSHOT (src/app.js). `/ilog verify` + `/ilog export` here, then
   `/canon sync` + `/gh backup` carry Backburner + SCS + I-LOG. Needs the
   omega password ONCE per session + gh PAT held in the vault (entered live,
   never filed). 11 I-LOG files stay in scratch/message-attachments/ (private).
4. CF SERVES (inside the same run, only if ordered) — src/mcp-server/
   (worker.js, wrangler.toml, package.json, DEPLOY.md — staged, NOT
   deployed). `wrangler secret put KILO_KEY` (typed live, never in code) +
   deploy per DEPLOY.md, then prove: GET /health, POST /mcp tools/list,
   tools/call gateway_chat. Only then flip `cloud_mcp` in src/mcp-tools.js
   from DOWN to LIVE with the Worker URL. Any probe fail = stays DOWN + reason.
5. GATE: ONE ARM PER SESSION — `/phoenixomegaprotocol <password>` arms every
   gated write at once (/ilog push, /canon sync, /canon doctrine, /gh backup,
   /vault escrow, /vault push, /forge apply/hotswap/eval). No re-arming
   mid-session. Never survives a reload; every refusal is an I-LOG entry.

## TOKEN DISCIPLINE (why this is cheap)

- Free lane first: kilo-auto/free, max_tokens small (5 for proof, ≤800 for brains).
- No duplicate proof: ONE inference proves the key; catalog calls are optional.
- Batch reads: windows (read_file start/end), never whole-tree re-reads.
- Stage diff is the stop signal: if the diff already shows the change, `done`.
- Receipts, not re-runs: `/tool log` quotes ids; never re-call to "check".

## DONE = all quoted verbatim

- Kilo receipt id + reply + usage (or BLOCKED named, key never filed).
- Git digests: Backburner + head on canon matching, or the refusal verbatim.
- CF: Worker URL + three probe proofs, or BLOCKED named (stays DOWN).
- QUEUED verdicts untouched: no /relay, no re-aim, no merge, no sub deploy.
