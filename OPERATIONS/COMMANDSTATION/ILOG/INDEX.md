# I-LOG — perchance command station

Written by the perchance Command Station (https://perchance.org/phoenix-ai-solutions-command-mastermind).

## The ONE authority

`Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only authoritative repo:
everything we build is stored there and read from there. This directory is where the perchance station's
I-LOG lands inside it. No mirror may be presented as the canon.

## The gate

Nothing here is written to the authority without **PHOENIXOMEGAPROTOCOL**: Sov100's password entered in the
session (`/phoenixomegaprotocol <password>`, armed for 15 minutes, never past a reload). The password is never stored (only a
sha-256 of it, in the browser's kv), never logged, never captured, never exported. Every attempt — armed,
refused, failed — is itself an I-LOG entry, so an unarmed attempt leaves a mark.

## The canon I-LOG this sits beside

The canon already holds an I-LOG: the RRL vault was renamed **I-LOG (Incarnation Log)** and its
`RRL/INDEX.md` declares **Schema V2 JSONL** — one line per utterance, `content[].data.{text,tool,state}`,
colour coded per LFG §SCS (🟣 SOUL sovereign-verbatim · ❤️ DNA assistant · 💛 REASON reasoning/tool).
The VS Code station is the authority for that vault (incarnation numbering, `RRL-CURRENT.txt`,
`CANON/I-LOG-UNAUDITED/`). The perchance station does not renumber or rewrite any of it: it appends its
own sessions here, in the same line shape, so one reader can walk both stations' records.

## Files in this directory

| file | what it is |
|---|---|
| `rrl-<ts>-run<N>.jsonl` | this session's transcript, canon I-LOG Schema V2 lines (SOUL/DNA from the run's raw record + one REASON line per station operation) |
| `ilog-<ts>-seg<N>.jsonl` · `latest.jsonl` | the station's operation chain — append-only, sha-256 chained, one JSON object per entry |
| `STATUS.md` | head, chain verification result, kinds, and the anchor history at push time |
| `anchor-<ts>.json` | the exact head + verification result that this push froze |
| `session-<ts>-run<N>.md` (parent dir) | the human session record |

## Verification

Operation-chain entry hash = sha-256 over
`JSON.stringify([v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev])` (`ok` 1/0),
chaining `prev` to the previous entry's `hash`. Recompute in order and compare to each `hash`; then
compare the chain head to the newest `anchor-*.json`. A Git commit is the only witness outside the browser.
