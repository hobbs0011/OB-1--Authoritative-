# KILO — front door (Field Guide Agent 99 lane)

Repo: `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`, branch `master`.
This directory (`OPERATIONS/COMMANDSTATION/`) is the command station's whole state, kept so work continues with every browser shut.

## Map
| Path | What |
|---|---|
| `KILO.md` (this file) | front door: map + rules |
| `HANDOFF-OP-RUN-01-KILO.md` | prior Kilo op handoff |
| `LEDGER/ledger-<n>-run<run>.json` | full soul ledger, verbatim (newest wins) |
| `ILOG/latest.jsonl` | full operation chain (hash-chained, sha-256) |
| `ILOG/ilog-<ts>-seg<seg>.jsonl` | dated chain snapshots |
| `ILOG/rrl-<ts>-run<run>.jsonl` | dated RRL transcripts |
| `ILOG/anchors.json` | git commits witnessing chain heads |
| `ILOG/STATUS.md` | chain status at last sync |
| `session-<ts>-run<run>.md` | session records (newest = freshest state) |
| `perchance/` | generator sources: `main.pjs`, `index.html`, `src/` (whole app) |
| `perchance/src/SESSIONS/` | sealed session payloads (ledger + SCS sessions + manifests) |
| `perchance/src/canon/` | local canon mirrors (read-only here; authority is `CANON/` on the canon branch) |
| `DOCTRINE/` | proposed amendments (proposals, never merged here) |
| `MERGE-04/` | Vault-C + Vault-E mechanical stage merge (PROPOSED) |
| `BACKUP/` | raw chat backups |
| `PHONE-DROPS/` | runner inbox (box reports, heartbeats) |
| `PhoenixOmegaRecovery.md`, `README.md` | recovery pointer, lane readme |

## Freshness check (in order)
1. Newest `session-*-run38.md` — the latest state summary.
2. `ILOG/anchors.json` newest entry — the commit witnessing the chain head.
3. `LEDGER/` newest export — the soul count both sides must match.

## Command rule (binding)
Under Field Guide Agent 99, the only commands allowed with Kilo are **pointers to this canon** — read-only references of the form `path §section` (e.g. `CANON/SYSTEM/LegionnaireFieldGuide.md §SCS`, `GOSPEL-999.md OMEGA.003`).
- **Kilo-safe:** reading any file here; citing canon paths; verifying hashes/anchors; opening PRs/commits through the sovereign's git flow.
- **Never invoke from here:** browser-only initiators (`/canon sync`, `/ilog push`, `/gh backup`, `/forge apply`, `/vault seal`, any `/omega`-gated write, `/relay`, `/brain sync`, `/masterlink sync`). They run in the sovereign's browser session only. Their docs in `perchance/` describe them; description is not permission.
- **Never runnable anywhere:** `/halt`, `/stabilize`, `/supersaiyan`, `/SoulSearch`, `/dnaREGISTRY`, `/Centurion-Code`, `/netstock`, `/netvoice`, `/a2zmarketing` — not built (registry says so); any doc presenting them as runnable is stale.
- **Naming:** "Field Guide Agent 99" is the book's current name (rename of `CANON/SYSTEM/LegionnaireFieldGuide.md` adopted by sovereign word; file move rides the box lane). Until the move lands, the canon path above is the address; the name here is the authority.

## Must-not
No secrets in commits (tokens live in browser vault / worker secrets only). No rewriting sealed records (seal, never delete). No restamping other-session claims as station-verified.
