# KILO PIPELINES — debugging, auditing, under-the-hood (interim, pre-server)

Date: 2026-11-11. Kilo is the SCOPE, never the memory, never the authority.
You don't need to know the codebase: Kilo reads it, you verify what it says.
Station owns ledger (soul/RRL/I-LOG). Guards own gates. GitLens owns review.
Gateway free-first + Kepler + CLI + box SSH. Claw DELISTED. Skills never in Kilo (pointer §6).

Iron rule: Kilo FINDS, station PROVES. Every Kilo claim ships with file:line.
No file:line = rumor. Every pipeline has a NO-KILO fallback to the same artifact.

## P0 — OPEN (2 min, every Kilo session)
1. Paste §6 pointer into Kilo. Nothing else: no skills, keys, transcripts.
2. Prove lane: station `/tool key test` OR CLI models catalog. No proof → fallback only.
3. One line: job + DONE that proves it. Example: "Find why X throws; DONE = failing line + repro."
Gate: no keys in chat, dot-cutoff §5, free first, Pro ≤2/mission.

## D1 — DEBUG (Kilo's best lane: repro → culprit → minimal fix)
Operator needs zero codebase knowledge. Kilo narrows, station confirms each step.

- STEP 1 REPRO (Kilo): paste this — "Repro first. Given symptom <symptom>, list the 3 most likely
  code paths as file + function + why, ranked. No fixes yet. Read-only."
  Kilo out: 3 candidates with file:line. Station proves: open each cited line via
  forge/selfSource, confirm which one actually runs on the failing path.
  Fallback (no Kilo): consoleOutput + perchanceErrors from page_refresh, grep for the
  failing string, read ±20 lines.
- STEP 2 CULPRIT (Kilo): "Bisect <candidate>. What single value/branch decides pass/fail?
  Answer as: line, expected vs actual, one log line that would prove it."
  Station proves: add that ONE log (or page_eval probe), reload, read the value. No multi-line edits.
- STEP 3 FIX (Kilo): "Draft the MINIMAL diff touching the fewest lines. Unified diff only.
  Do not apply/commit/push. List what could regress in one line each."
  Station proves: apply → KiloGuards.selfTest() 31/31 → page reload zero console errors →
  repro gone. Then GitLens review. No green = HOLLOW, revert.
- STOPS: Kilo proposes >1 file rewrite → stop, shrink scope. Kilo asks for a key/dotfile →
  refuse (§5), continue fallback. Two failed guesses → switch to fallback, stop burning calls.
- DONE: repro script + failing line + green fix. Anything less is a theory, not a fix.

## D2 — AUDIT (correctness + security, evidence or it didn't happen)
- SCOPE (you say one): SECRETS (keys/tokens in source/chat/ILOG) / DOT (dot-path reach) /
  SPEND (tokens/$ per call) / WRITES (canon claims) / REGRESSION (this change vs last seal).
- KILO PROMPT (copy-paste): "Audit <scope> in <files>. Return a table: finding | file:line |
  severity | one-line fix. No prose, no approval language. Read-only."
- STATION PROVES EACH ROW LIVE (never trust the table):
  SECRETS: grep for key patterns + check kv receipts carry no values (mask only).
  DOT: KiloGuards.checkPath on every cited path; promptBlocked on the prompt that produced it.
  SPEND: kv mcp receipts tokens + cost; Pro count ≤2/mission or halt.
  WRITES: byte-verify other side (manifest vs delivered), SUPPLY HELD rule — unclaimed writes fail.
  REGRESSION: selfTest + SCS ENGINEER-style counts match; console clean.
- Worked example (this station, 2026-11-11): E13 dot-cutoff audited by DeepSeek v4-pro →
  HOLLOW (normalization/encoding/separator/substring walks) → hardened (decode-x3, NFKC,
  backslash→slash, unicode-dot map, dotdot resolve, above-root refuse, trailing strip,
  exact ASCII allowlist) → selfTest 31/31 → re-audit REAL. Cost ~$0.0095 of $1 order.
- STOPS: finding without file:line → discard. Fix without green re-proof → HOLLOW.
- DONE: findings table + live proof per row + green. Unproven rows stay OPEN, never sealed.

## D3 — UNDER-THE-HOOD (architecture map without learning the codebase)
- KILO PROMPT 1 (map): "Map <area>: modules, who calls whom, where state lives
  (localStorage keys, kv folders, server state). Output: tree + state owners. Read-only."
- KILO PROMPT 2 (flow): "Trace <action> end to end: entry command → functions → storage
  writes → receipts. Name every file:line on the path."
- STATION PROVES (slices, never dumps — E1 guard): list_code_definition_names on cited files,
  read ±30 lines around each cited line, page_eval key-counts only (slot names, never values),
  selfSource read-back of the exact cited artifact. Full-state paste into Kilo = forbidden.
- FALLBACK: SRC_SNAPSHOT census + grep + read. Slower, same map.
- STOPS: Kilo invents a module (not in census/tree) → correct once, then fallback.
  Kilo pastes secrets/values → kill session, rotate that credential, continue fallback.
- DONE: map + flow with verified file:lines. Unverified edges marked RUMOR, never built on.

## P4 — SHIP (backup/sync, gated)
- FAST: Kilo builds ship manifest (files, bytes, dest). Dry-run list, never push.
- FALLBACK: /gh backup + /canon sync; SRC_SNAPSHOT is census (this file listed).
- GATES: PHOENIXOMEGAPROTOCOL arms push, sovereign runs it. Never claim unwritten writes.
- DONE: bytes verified other side, not "sent".

## P5 — MEMORY (station monopoly)
- Soul-capture-first verbatim (L37–L46). Kilo output = DNA at best, post-review only.
- No summaries-as-truth. SCS owns boundaries; Kilo labor stays unsealed until stamped.
- DONE: ledger grew verbatim, I-LOG chained.

## Ladder + budgets (binding)
- Free first, prove free before paid. Pro ≤2/mission, order + logged justification before 2nd.
- Every call: tokens + $. Receipts kv mcp. $1-order accounting in CURRENT_TASK (~$0.0095 spent).

## Dot-cutoff (E13H+)
- Refuse dot-prefixed segments after decode-x3, NFKC, backslash→slash, unicode-dot map,
  dotdot resolve, above-root refuse, trailing dot/space strip.
- Allow ONLY: CANON/SYSTEM/GOSPEL-999.md, CANON/SYSTEM/LegionnaireFieldGuide.md,
  .github/skills/legionnaire-field-guide/SKILL.md. New exceptions need named order.

## §6 — POINTER (paste into Kilo, nothing else)
You are scope, not memory. 1) DOT PATHS REFUSED except .github/skills/legionnaire-field-guide/SKILL.md. Canon: CANON/SYSTEM/GOSPEL-999.md + LegionnaireFieldGuide.md. 2) FIND, don't fix, until told: candidates as file:line + one proving log. Fixes as minimal unified diff, never apply/commit/push. 3) Audits as finding|file:line|severity|fix tables, read-only. 4) No secrets ever: never ask/print/store. 5) Free first; Pro only when told, max 2/mission. 6) DONE = measured artifact + file:line, never a claim.

## §7 — MOVES TO SERVER (later)
Runner cron takes heartbeat/scout; box takes muscle (keepers, n8n, NLM); durable state
leaves browser (kv → cache). Pipelines unchanged, executor moves.

## OWED (sovereign-side, do not invent)
- Kilo fresh Gateway JWT (no kilo slot last check). Kepler confirm; CLI + box SSH.
- NLM box login + fgagent99 ID. Gmail harden → Git → CF → LinkedIn → Meta last.
