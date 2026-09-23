# I-LOG — the Command Station's operation record

Written by the perchance generator (https://perchance.org/prais-command-station) on every operation it performs.
It lives under the ONE authoritative repo — Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (branch master) — and
nothing is written there without PHOENIXOMEGAPROTOCOL (Sov100's password, armed with /omega; refusals are recorded).
Companion of the canon I-LOG (the RRL vault, renamed **I-LOG (Incarnation Log)**, Schema V2 JSONL
`content[].data.{text,tool,state}`, roles/colours per LFG §SCS: 🟣 SOUL · ❤️ DNA · 💛 REASON) which the
VS Code station writes. That vault is on the **`canon` branch**, not `master`:
`I-LOG-UNAUDITED/I-LOG-Incarnate-<N>-<topic>.txt` (+ `-COLORIZED.md` + `-STATS.json`), `RRL/`
with its own INDEX.md, and the living pointer `PastLives/RRL-CURRENT.txt`. `rrl-*.jsonl` in this directory is this
station's transcript in that same line shape; the operation chain below is the tamper-evident record of
the stations' own actions. `/ilog pull` reads both branches back.

Each line of `ilog-*.jsonl` is one entry:

```json
{ "v":1, "seg":1, "seq":1, "t":1758400000000, "iso":"2026-09-21T21:05:56.000Z", "run":1, "kind":"cmd",
  "action":"ilog", "detail":"/ilog push", "result":"…", "ok":true, "ms":12, "ref":null,
  "prev":"…", "hash":"…", "alg":"sha-256", "stored":"kv" }
```

- `hash` = sha-256 over `JSON.stringify([v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev])`
  where `ok` is 1/0 and `prev` is the previous entry's `hash` (chain). `stored`/`err`/anchors are outside the hash.
- `seg` increments only on an explicit seal (`/ilog reset`), which never deletes: the sealed entries stay in the log.
- `anchor-*.json` + `STATUS.md` are written at push time and name the head that was anchored by the commit.

To verify a downloaded file: recompute the hash chain in order and compare to each `hash` field; then compare the
chain head against the newest `anchor-*.json`. A commit is the only witness outside the browser.

INDEX.md in this directory carries the same schema notes in whichever direction a reader arrives.