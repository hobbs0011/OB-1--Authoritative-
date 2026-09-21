# Doctrine amendment — the I-LOG, ONE AUTHORITY, PHOENIXOMEGAPROTOCOL

- **Proposed by**: the perchance Command Station — https://perchance.org/prais-command-station
- **Proposed at**: 2026-09-21T20:11:51.161Z
- **On whose instruction**: SOV100 (Michael Hobbs)
- **Status**: PROPOSED — takes effect when Sov100 merges it into the sealed canon (GOSPEL-999 is never rewritten in place here).
- **Gate**: PHOENIXOMEGAPROTOCOL — this file was pushed with the gate armed (`/omega`), or not at all.

## What is being added

1. **ONE AUTHORITY** — `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only authoritative repo; everything we build lives under it (`OPERATIONS/COMMANDSTATION/`), and no mirror may be presented as the canon. `OMEGA.001`
2. **THE I-LOG IS THE RECORD** — every operation is an I-LOG entry (append-only, sha-256 chained); the transcript rides in canon Schema V2 line shape (`content[].data.{text,tool,state}`, SOUL/DNA/REASON per SCS). The VS Code vault (`RRL/`) stays authoritative for incarnations; this station only appends its own sessions beneath `OPERATIONS/COMMANDSTATION/ILOG/`. `OMEGA.002`
3. **ANCHOR, OR IT DID NOT HAPPEN** — every push freezes the head in a commit and records it as an anchor; the unanchored count is always shown, and 'backed up' cannot be claimed while it is above zero. `OMEGA.003`
4. **SEAL, NEVER DELETE** — `/ilog reset` seals and names, it never truncates (I.050). `OMEGA.004`
5. **PHOENIXOMEGAPROTOCOL** — no Canon change without Sov100's password: `/omega <password>` arms the gate for 15 minutes, never past a reload; only a sha-256 is stored; the password is never logged, captured or exported; 5 failures lock the gate for 10 minutes; every attempt is recorded. `OMEGA.005`
6. **SECRETS NEVER ENTER THE RECORD** — credential commands are redacted on the way in and scrubbed from every export. `OMEGA.006`
7. **HONEST LIMITS** — the chain is verified in the sovereign's browser; the commit is the only outside witness, and enrolments/arms/refusals are recorded so nothing happens quietly. `OMEGA.007`

## The exact text to merge

- `DOCTRINE/copies/GOSPEL-999.md` — the amended mandate block (`OMEGA.001`–`OMEGA.007`) appended after System III. Provisional numbering; Sov100 assigns final numbers.
- `DOCTRINE/copies/LEGIONNAIRE-FIELD-GUIDE.md` — section 11, *I-LOG OPERATIONS & THE OMEGA GATE* (what an I-LOG is, the anchor rule, the seal rule, the gate, and the I-LOG AUDIT step for the SCS).
- The station's own copies in its shipped source are the same files: `src/canon/GOSPEL-999.md`, `src/canon/LEGIONNAIRE-FIELD-GUIDE.md`.

## Why it must be merged, not assumed

GOSPEL-999 is `SEALED | SOV100_ONLY` and "may be extended but never reduced" (I.091). This amendment extends; it removes nothing, renumbers nothing, and does not touch the sealed header. Until Sov100 merges it, the station's behaviour follows it while the canon text does not yet say it — that gap is recorded here rather than hidden.

_Pushed by `/canon doctrine` through PHOENIXOMEGAPROTOCOL. The commit that carries this file is the anchor._