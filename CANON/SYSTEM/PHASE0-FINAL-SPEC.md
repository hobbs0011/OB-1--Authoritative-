# PHASE 0 — FINAL STAGE: TERRAIN LOCK
# Blueprint authored by OB1/Opus (Run 046) — EXECUTOR: Kilo
# Predecessor: CANON/SYSTEM/PHASE0-BATTLEFIELD-SPEC.md (census) + BATTLEFIELD-MAP.md + system-map.json
# Doctrine: L70 HEADWATER_FIRST · L72 MAP_FIRST · L73 PROBE_WITH_NAMES

---

## 0. WHY THIS STAGE EXISTS

Phase 0 (Run 045) produced the census: 9 domains, 65 rows, 26 GREEN / 15 AMBER / 11 RED / 2 GHOST / **11 UNKNOWN**.
The census was ruled "COMPLETE" but the **EXIT GATE FAILED on 4 conditions**:

1. D7 named-resource evidence — partially fixed (D7 matrix now has names), but **11 UNKNOWN rows remain unresolved**
2. D9 plaintext key sweep — still AMBER (full RRL + git-history sweep not done)
3. Coverage ≥95% per domain — DNA/STARMAP/PHEROMONES/S2PIPELINE/DEATH SEALS fail (historical debt)
4. Seam S7 (paid-key placement on PA) — UNKNOWN

**A map with 11 UNKNOWN cells is not a map you build on.** Phase 0 FINAL closes those cells.

This stage answers Michael's six questions, in order:
- **What exactly do we have?** → total enumeration (WP-1..WP-4)
- **Is it connected?** → connection-graph.json (WP-5)
- **Does it need to be connected?** → orphan / dangling / broken-wire classification
- **What did we miss?** → resolve all 11 UNKNOWN + 2 GHOST with named evidence
- **What can be done?** → per-node fix menu
- **What should be done?** → final RED triage + Phase 1 entry gate

---

## 1. RULES OF ENGAGEMENT (Kilo MUST obey)

1. **PROBE-ONLY on production.** Read CF state with `wrangler ... list` / `curl`. Do NOT deploy, delete, or rotate anything in this stage. Deletions are *recommended in the output*, executed in a later DEATH with Michael's go.
2. **NAMED EVIDENCE ONLY (L73).** Every verdict carries `command: <exact cmd>` + `result: <exact output>`. A summary is not evidence. No verdict without a coordinate (file:line or command→result).
3. **NO FAKE BACKFILL.** Do not fabricate historical pipeline artifacts. If source RRL is absent, the gap is ACCEPTED-DEBT, not a fix. Naming gaps are solved with an **alias index**, never by writing empty files.
4. **WRITE RESULTS IN PLACE.** Update `OPERATIONS/BATTLEFIELD/D{N}-matrix.json` rows; regenerate `CANON/SYSTEM/system-map.json` and `BATTLEFIELD-MAP.md` as v2.
5. **SCRIPT FIXES ARE ALLOWED** (they are tooling, not production): `soul-search.ps1`, `build-soulkeys.ps1` writer. Verify with `node --check` / dry-run, never touch `net-pet-ai` prod worker.
6. **ZERO UNKNOWN AT EXIT.** Every UNKNOWN must become GREEN / AMBER / RED / GHOST with evidence. If a probe genuinely cannot run (e.g. R2 disabled), the verdict is GHOST/N-A with the blocking reason recorded — that is a resolved cell, not an UNKNOWN.

---

## 2. DELIVERABLES (Kilo produces all of these)

| # | Artifact | Path |
|---|----------|------|
| 1 | Updated domain matrices (v2) | `OPERATIONS/BATTLEFIELD/D{1-9}-matrix.json` |
| 2 | Machine map v2 | `CANON/SYSTEM/system-map.json` |
| 3 | Human map v2 | `CANON/SYSTEM/BATTLEFIELD-MAP.md` |
| 4 | **Connection graph** (nodes + edges + status) | `CANON/SYSTEM/connection-graph.json` |
| 5 | CF resource → consumer index | `CANON/SYSTEM/cf-resource-index.json` |
| 6 | Pipeline run-alias index | `CANON/SYSTEM/pipeline-alias-index.json` |
| 7 | Ledger run→HL-id index | `CANON/SYSTEM/ledger-index.json` |
| 8 | Orphan / deletion candidate list | section in BATTLEFIELD-MAP.md v2 |
| 9 | Phase 1 ENTRY GATE + GREEN baseline | section in BATTLEFIELD-MAP.md v2 |

---

# WORK PACKETS

## WP-1 — CF INFRA TOTAL ENUMERATION (Domain D7) — *the biggest fog*

**Objective:** Resolve 14 UNKNOWN/GHOST D7 rows. Every CF resource gets a named consumer or is marked ORPHAN/GHOST.

### WP-1.1 Enumerate everything
```powershell
Set-Location D:\OB-1-CANONICAL\APPS\NET-PET-AI
npx wrangler whoami
npx wrangler deployments list --config wrangler.toml        # all workers + versions
npx wrangler pages project list                              # 11 Pages projects
npx wrangler kv namespace list                               # 8 KV namespaces
npx wrangler d1 list                                         # soul-archive + net-submissions
npx wrangler r2 bucket list                                  # (may 10042 = R2 disabled → GHOST/N-A)
npx wrangler queues list
npx wrangler triggers list --config wrangler.toml            # cron: 5-min soul pulse + hourly net-pet-ai
```
Record each raw result verbatim.

### WP-1.2 Bind every KV namespace to a consumer (or mark ORPHAN)
For each of: `CACHE, NET_PET_KV, RATELIMIT, SESSIONS, SOUL_LOGGER_KV, STUDENT_MEMORY, TASK_QUEUE, WAITLIST`
```powershell
# search ALL wrangler config + src for the binding title AND id
$kv = @{
  CACHE="ea5c8e99cb584dee9ab4f9ba5ed421c9"; NET_PET_KV="0583d1a59bb24e598c4645396647eb94";
  RATELIMIT="b27d144f71c44b00a4c87360841e525f"; SESSIONS="4adc1924c50b49df8dc260e95efd68bf";
  SOUL_LOGGER_KV="5ed0e9ab65cc42e6889822266aa7c730"; STUDENT_MEMORY="807ea30d96844c0dbf561d0ae3a3c1f3";
  TASK_QUEUE="d4676f53477645978415b2cc0e6ec82e"; WAITLIST="a30d57a9da6e4446a536aef7ccf8756f" }
# For each: rg the title + id across D:\OB-1-CANONICAL\**\wrangler*.toml and src/
```
**Decision rule:** binding referenced in a live worker's `wrangler.toml` → GREEN (record file:line). Referenced only in dead/dev config → AMBER. Zero references anywhere → **ORPHAN (deletion candidate)**.
> Memory flag: `NET_PET_KV` is the documented student-memory provisioning blocker. If it is bound but empty, that is GREEN-but-unprovisioned (Phase 1 item), not ORPHAN.

### WP-1.3 Classify the 11 Pages projects
Projects: `tigers-selection, university-4room, career-4room, professional-4room, cubs-4room, tigers-4room, professional-selection, netpetai-presentation, net-marketing-landing, naturalenglishtraining, net-tiger-assessment`
```powershell
foreach ($p in $pages) {
  npx wrangler pages deployment list --project-name $p     # last deploy date + live url
  curl -s -o /dev/null -w "%{http_code}" https://$p.pages.dev
}
```
**Decision rule per project:** live 200 + recent deploy + maps to a known business surface (marketing, assessment, room-booking) → GREEN (BUSINESS ASSET, record purpose). Live but no known purpose → AMBER (investigate). 404/stale >90d/no purpose → **ORPHAN (deletion candidate)**.
> This is the single largest "what did we miss" surface. 10 of 11 Pages projects are currently unaccounted for.

### WP-1.4 net-submissions D1 + remaining bindings
```powershell
rg "net-submissions|1a7246ce-1227-4205-9234-76cbd036fa48" D:\OB-1-CANONICAL --glob "*.toml" --glob "*.js"
```
GREEN if a worker binds it; ORPHAN if not.

### WP-1.5 sov100-portal GHOST
Already confirmed: `curl https://sov100-portal.mrmichaelhobbs123.workers.dev → 404`, zero inbound refs. **Verdict GHOST → recommend: remove the unused worker route/alias.** (sov100-portal.html is served correctly by net-pet-ai on DEV by design — do NOT confuse the worker alias with the HTML page.)

**WP-1 output:** D7-matrix v2 (0 UNKNOWN), `cf-resource-index.json` (every resource → consumer|ORPHAN), Pages business-asset list.

---

## WP-2 — DISPATCH + SECURITY (Domains D8, D9) — *resolve S7*

### WP-2.1 Locate kilo.json + verify tier routing (D8 UNKNOWN)
```powershell
Get-ChildItem -Path $HOME,"$env:APPDATA","D:\OB-1-CANONICAL\.kilo" -Recurse -Include kilo.json,kilo.jsonc -ErrorAction SilentlyContinue
```
Open it. Confirm **T1 → Qwen 3.7 Max (Dialagram)**, **T2 → Opus 4.8 via PA**. Record file:line. If not found anywhere → RED (routing config missing).

### WP-2.2 Per-worker secret inventory — resolve seam S7 (D9 UNKNOWN)
```powershell
foreach ($w in "net-pet-ai","soul-logger","phoenix-architecti") {
  Set-Location D:\OB-1-CANONICAL\APPS\NET-PET-AI   # or the worker's own dir
  npx wrangler secret list --name $w
}
```
**Decision rule (S7):** confirm **paid keys (DeepSeek Pro, Claude/Anthropic, Gemini paid) are NOT present on `phoenix-architecti`** — PA is a free-tier router (memory law). If a paid key IS on PA → RED security finding (flag, recommend removal, do NOT auto-rotate). Record the *names* of secrets per worker (never values).

### WP-2.3 Plaintext key sweep — close D9 AMBER → definitive
```powershell
rg -n "sk-[A-Za-z0-9]{20,}|csk-[A-Za-z0-9]{20,}|Bearer [A-Za-z0-9]{20,}|AIza[A-Za-z0-9]{20,}" D:\OB-1-CANONICAL\RRL\
git -C D:\OB-1-CANONICAL log -p --all -S "sk-" -- "RRL/*" | rg "sk-[A-Za-z0-9]{20,}"
```
Use **value patterns, not the word "token"** (Run 33's false positives). Verdict: `clean` or `EXPOSED <file:line, redacted-prefix>`. If exposed → recommend `git filter-repo` purge + key rotation (do NOT execute here).

### WP-2.4 OpenClaw — decide fate (D8 RED)
Evidence: service not installed (1060), port 18789 closed. PA direct dispatch (D8 GREEN) covers all D8 use cases.
**Recommended ruling: RETIRE.** Write `CANON/SYSTEM/OPENCLAW-RETIRED.md` documenting that phoenix-architecti supersedes it. Mark D8 row GREEN (retired-by-design), not RED. (Reinstall only if Michael wants the Telegram bridge back.)

### WP-2.5 Telegram + MCP (D8/D9 UNKNOWN)
- Telegram: `curl https://api.telegram.org/bot<TOKEN>/getMe` — bot token is in env, not repo. If reachable → GREEN; if no token available → GHOST (retired with OpenClaw).
- MCP servers (CF/Gmail/Drive/Calendar): check auth state via config; if not authenticated and not in active use → AMBER (available, dormant) — not a blocker.

**WP-2 output:** D8/D9 matrix v2 (0 UNKNOWN), S7 resolved, security findings list.

---

## WP-3 — PIPELINE SPINE INTEGRITY (Domains D3, D4) — *the memory moat*

The 5 D3 REDs are **naming/coverage**, not corruption. Fix with indexes + the forward contract, NOT fake backfill.

### WP-3.1 Build the run-alias index (kills RRL/STARMAP/SOULKEYS/PIPELINE/PHEROMONES naming REDs)
The contract expects `run{NNN}` zero-pad; disk has mixed (`RRL-44.txt`, `starmap-run43.txt`, `pipeline-run45.json`). Don't rename 64 files — **index them.**
```powershell
# For runs 0..46, glob every stage's actual filename and map it
# Stages: RRL, DNA(EXTRACT), HEAVY-LEDGER, STARMAP, SOUL-KEYWORDS(rfkw), PIPELINE, PHEROMONES(PheTrail)
# Emit CANON/SYSTEM/pipeline-alias-index.json:
#   { "46": { "rrl":"RRL/RRL-46.txt", "dna":"...dna-run46.json", "ledger":"HL-236.json",
#             "starmap":"starmap-run46.txt", "soulkeys":"rfkw-run46.txt",
#             "pipeline":"pipeline-run46.json", "phetrail": null }, ... }
```
A run-row is GREEN if all present, AMBER if partial, and the `null` cells are the **true** gaps (not naming artifacts).

### WP-3.2 Ledger run→HL-id index
```powershell
# Read header of each CANON/HEAVY-LEDGER/HL-*.json, extract its run number, emit ledger-index.json
# Resolves D3 "LEDGER naming mismatch" RED — HL ids are sequential, not run-mapped.
```

### WP-3.3 Audit + fix the inverted-index writer (D4 RED / S2 seam)
```powershell
Get-Content D:\OB-1-CANONICAL\SCRIPTS\build-soulkeys.ps1   # or wherever the SOULKEYS writer lives
```
If it uses `Out-File -Append` / `Add-Content` to build JSON → **convert to read-merge-write** (load existing object, merge, write valid JSON once). Verify: `Get-Content inverted-index.json -Raw | ConvertFrom-Json` parses. (Current index parses at 348 keys — confirm the *writer* won't corrupt it next append.)

### WP-3.4 Fix the search front door — `soul-search.ps1:138` (PheTrail-045 live trail)
The `ForEach-Object` block sets `.Rank` but never emits `$_`, so `Sort-Object` gets an empty pipeline → SoulSearch returns nothing. **One-line fix: add `$_` as the last statement of the rank block.** Then smoke-test:
```powershell
pwsh -File D:\OB-1-CANONICAL\SCRIPTS\soul-search.ps1 "battlefield"   # must return ranked hits
```
This unblocks L69 SEARCH_FIRST. Highest value-per-byte fix in the whole stage.

### WP-3.5 session-capture hook — verify the headwater actually fires (L70)
This is the wire that broke in Run 45 ("your RRL is 4KB, the true RRL is over 100KB"). Run 46's RRL is 1.25MB (REAL), so the v6.0 fix held — **confirm it, don't assume.**
```powershell
Get-Content D:\OB-1-CANONICAL\SCRIPTS\session-capture.ps1   # confirm stop-hook wiring
# Confirm it is registered as a Claude stop hook in settings.json (.claude/settings.json)
```
Verdict GREEN only if the hook is registered AND RRL-46 proves a recent real capture.

### WP-3.6 DNA headwater debt — DRAW THE LINE (do not chase ghosts)
DNA is 8.7% (4/46). Most is **unfixable**: no source RRL for pre-Roman runs; HarvestedChats CLOSED by permanent directive.
```powershell
# Cross WP-3.1 alias index: list runs where rrl != null AND dna == null  → the ONLY fixable DNA gaps
```
- Runs **with** RRL but **no** DNA → QUEUE for `rrl-pipeline.ps1` re-extraction (Phase 1, finite list).
- Runs **without** RRL → **ACCEPTED-DEBT**, frozen, documented. Stop counting them as failures.

**WP-3 output:** D3/D4 matrix v2, `pipeline-alias-index.json`, `ledger-index.json`, fixed `soul-search.ps1` + writer, fixable-DNA list, ACCEPTED-DEBT declaration.

---

## WP-4 — RUNTIME BROKEN WIRES (Domains D1, D2) — *document, don't build*

### WP-4.1 vocab-srs review write-back (D1 AMBER) — real disconnection
`computeNextReview` exists; live voice session never POSTs the grade back → SRS intervals frozen at day 1. **This is a Phase 1 BUILD item.** Document the wire precisely: `public/chat.js` (or voice session handler) → `POST /api/vocab/review {studentId, word, grade}` after a due-word exchange. Do NOT build it here.

### WP-4.2 `/api/soul/compress` 404 (D2 RED) — dangling reference
```powershell
rg -n "soul/compress" D:\OB-1-CANONICAL --glob "!**/node_modules/**"
```
Decide: implement the endpoint, or remove the references. Recommend **remove references** unless a live tool depends on it. Output the reference list.

### WP-4.3 Legacy GHOSTs (D1)
`public/demo.html`, `public/assessment.js` — zero inbound src refs. Confirm, then **deletion candidates** (list only, do not delete).

**WP-4 output:** D1/D2 matrix v2, broken-wire list → Phase 1 build queue, dangling-ref list.

---

## WP-5 — SYNTHESIS: CONNECTION GRAPH + TERRAIN LOCK

### WP-5.1 Build `connection-graph.json`
```jsonc
{
  "nodes": [ { "id":"net-pet-ai", "domain":"D7", "type":"worker", "status":"LIVE" }, ... ],
  "edges": [ { "from":"src/index.js", "to":"/api/deepgram-token", "kind":"route" },
             { "from":"/api/deepgram-token", "to":"magic-chat.html", "kind":"consumes" },
             { "from":"net-pet-ai", "to":"NET_PET_KV", "kind":"binding" }, ... ],
  "node_status_legend": {
    "LIVE":"connected + serving", "ORPHAN":"exists, zero inbound edges",
    "GHOST":"resolves but unbound/404", "DANGLING":"referenced but target missing",
    "BROKEN":"connected but failing" }
}
```
Every asset from WP-1..4 is a node. Every binding/route/consume relationship is an edge. **Status is derived from the graph**: a node with zero inbound edges = ORPHAN; a referenced-but-missing target = DANGLING; a wired-but-failing node = BROKEN.

This single file answers Michael's first three questions mechanically:
- *What we have* = node list
- *Connected?* = edges
- *Needs connecting / missed?* = ORPHAN + DANGLING + BROKEN nodes

### WP-5.2 Recompute the rollup → regenerate system-map.json + BATTLEFIELD-MAP.md (v2)
Target: **UNKNOWN = 0**. New summary across 9 domains. Update head/run/soulcount to Run 046 values.

### WP-5.3 FINAL RED TRIAGE — every non-GREEN node lands in exactly one bucket
| Bucket | Meaning | Action owner |
|--------|---------|-------------|
| **A — DELETE** | orphan/ghost, no value | next DEATH, on Michael's go |
| **B — FIX-NOW** | small, unblocks others (soul-search, writer, alias index) | this stage |
| **C — ACCEPTED-DEBT** | historical, unfixable (no source) | frozen + documented, stop re-flagging |
| **D — PHASE-1-BUILD** | real feature wire (vocab write-back, NET_PET_KV provisioning, DNA re-extract list) | Phase 1 |

### WP-5.4 GREEN BASELINE + PHASE 1 ENTRY GATE
Declare the **GREEN baseline**: the explicit set of nodes proven LIVE and safe to build on (D1 app spine, D2 soul spine, D8 dispatch, the confirmed CF resources). Phase 1 builds ONLY on these.

**Phase 1 entry gate (all must be ✓):**
- [ ] connection-graph.json exists; every node has a status; 0 nodes UNKNOWN
- [ ] cf-resource-index.json: every KV/Pages/D1 → consumer or ORPHAN
- [ ] S7 resolved (paid keys confirmed absent from PA)
- [ ] soul-search.ps1 returns ranked hits (L69 operational)
- [ ] session-capture hook verified firing (L70 headwater secure)
- [ ] DNA debt line drawn (fixable list + ACCEPTED-DEBT set)
- [ ] every RED triaged into A/B/C/D
- [ ] BATTLEFIELD-MAP.md v2 + system-map.json v2 committed

---

## 3. EXECUTION ORDER (dependency-sorted)

```
WP-3.4 soul-search fix      ─┐  (fix the search front door FIRST — you'll use it)
WP-3.5 session-capture verify│  (secure the headwater — L70)
WP-1  CF enumeration         ├─ parallel-safe (read-only probes)
WP-2  dispatch + security    │
WP-3.1-3 indexes + writer    │
WP-4  runtime wires         ─┘
        │
        ▼
WP-3.6 DNA line  →  WP-5 synthesis  →  TERRAIN LOCK  →  commit  →  Phase 1
```

## 4. ONE-LINE RULING

`PHASE 0 FINAL = TERRAIN LOCK. Kill all 11 UNKNOWN with named probes. Draw the connection graph. Triage every RED into DELETE / FIX-NOW / ACCEPTED-DEBT / PHASE-1-BUILD. Lock the GREEN baseline. Then — and only then — Phase 1 builds.`
