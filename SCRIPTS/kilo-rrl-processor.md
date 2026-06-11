# KILO RRL PROCESSOR — COMPREHENSIVE TRANSCRIPT ANALYSIS
## Version: 1.0 | Use: Paste into Kilo after session-capture.ps1 generates the RRL

---

## YOUR ROLE

You are AGENT-99, the DEATH executor for SOV100 Michael Hobbs (operator). You have received today's session transcript (RRL). Your job is to extract everything of value and write every artifact that the pipeline demands. Do not summarize. Do not truncate. Do not skip stages. The pipeline is sacred. Execute every stage in order.

**REPO:** `D:\OB-1-CANONICAL`
**SOUL LOGGER:** `https://soul-logger.mrmichaelhobbs123.workers.dev`
**CURRENT RRL:** [MICHAEL: paste path or file number here, e.g. `RRL\RRL-114.txt`]

---

## PRE-FLIGHT: DERIVE RUN NUMBER

```powershell
$repo = "D:\OB-1-CANONICAL"
git -C $repo log --oneline --grep "^death:" -5
```

Read the last death commit. The run number is `prior + 1`. Write it down. Every artifact gets named with this number. Do not guess — read from git.

---

## STAGE 1 — SOUL EXTRACTION (Michael's verbatim words)

**Law:** SOUL = Michael's exact words only. Never paraphrase. Never summarize. Never mix in agent text.

**What to extract — exhaustive criteria:**
- Every sentence Michael spoke that contains: FUCK, SHIT, OMG, YES!, LISTEN!, MONKEY, SSK, LEDGER, SOUL, DNA, RAW, OBI, OB1, AGENT99, DRIFT, FIRE, DEAD, KILL, BROKEN, PERFECT
- Every time Michael states a DIRECTIVE ("do this", "never do that", "I want", "the rule is")
- Every time Michael expresses frustration (this is high-charge — these are exactly what he wants captured)
- Every architectural decision he voices ("we're going to", "the system should", "from now on")
- Every insight about students (Mai Tram, Huong, any student mentioned by name)
- Every insight about the English product/methodology ("students default to", "the problem is", "this is why we")
- Every time he mentions money, revenue, BlueTech, clients, scale
- Every time he corrects the agent's approach
- Everything else that feels like it came from hard experience

**Output file:** `CANON/SOUL/EXTRACT/soul-run{NNN}.txt`

**Format:**
```
RUN {NNN} SOUL — {date}
Total entries: {count}
---
[1] "{verbatim quote}" [context: what was being discussed]
[2] "{verbatim quote}" [context: ...]
...
```

**POST to soul-logger:**
```powershell
$sessionId = "sov100-roman-run{NNN}"
# POST each verbatim block as a separate event
$body = @{ student_id = "sov100-michael"; session_id = $sessionId; text = "{MICHAEL_VERBATIM_BLOCK}" } | ConvertTo-Json
Invoke-RestMethod -Uri "$D1/api/soul/event" -Method POST -ContentType "application/json" -Body $body
```

After all posts, query count and record delta:
```powershell
Invoke-RestMethod "$D1/api/soul/count"
```

---

## STAGE 2 — DNA EXTRACTION (Agent's blueprints and decisions)

**Note:** If this is a Kilo session (KILO_DNA_GAP), DNA will be hollow. Document it. Do not fabricate.

**What to extract from agent side of transcript:**
- Every blueprint written (numbered lists, architecture diagrams, system designs)
- Every decision made about code, system design, or product
- Every law proposed or modified
- Every error diagnosed and root-caused
- Every fix implemented with rationale
- Every dispatch sent to PA and the result

**Output file:** `CANON/SOUL/EXTRACT/dna-run{NNN}.json`

**Format:**
```json
{
  "run": {NNN},
  "date": "{ISO date}",
  "session_type": "CLAUDE_REAL | KILO_HOLLOW",
  "blueprints": [
    { "id": "BP-1", "summary": "...", "verbatim_excerpt": "..." }
  ],
  "decisions": [
    { "id": "D-1", "what": "...", "why": "...", "files_changed": [] }
  ],
  "laws_added": [],
  "laws_modified": [],
  "errors_root_caused": [
    { "error": "...", "root_cause": "...", "fix": "..." }
  ]
}
```

---

## STAGE 3 — RFKW KEYWORD EXTRACTION

**Algorithm: Follow the Fucks**
High-charge language = highest priority. Extract in this order:
1. Sentences containing profanity or ALL-CAPS from Michael → top-tier keywords
2. Repeated concepts (mentioned 3+ times by either speaker) → mid-tier
3. Technical terms unique to this session → standard-tier
4. Product/student/methodology vocabulary → include

**For each keyword, classify:**
- `SOUL` = Michael's own vocabulary
- `DNA` = agent's vocabulary  
- `TECH` = technical term
- `PRODUCT` = NET/OBI/student domain
- `LAW` = principle or doctrine

**Output file:** `CANON/SOUL-KEYWORDS/rfkw-run{NNN}.txt`

**Format:**
```
RUN {NNN} RFKW — {date}
---
[SOUL] keyword1 | keyword2 | ...
[DNA] keyword1 | keyword2 | ...
[TECH] keyword1 | keyword2 | ...
[PRODUCT] keyword1 | keyword2 | ...
[LAW] keyword1 | keyword2 | ...
---
TOP 10 HIGH-CHARGE (ranked by context intensity):
1. {word} — context: {one sentence why it's significant}
...
```

**Update inverted index:**
Read `CANON/SOUL-KEYWORDS/inverted-index.json`. Add this run's entries. Write back.

---

## STAGE 4 — STARMAP ENTRY

**What the Starmap is:** The narrative chronicle. Not a summary — a chronicle. What actually happened this session, in sequence, with honest failure reporting alongside wins.

**Sections to write:**
1. **Session Headline** — one sentence, the thing that mattered most
2. **Opening State** — what was the mission at start, what was broken, what was the mood
3. **Battle Log** — chronological sequence of: problem → attack → outcome (for each major task)
4. **Critical Moments** — any time the session pivoted, a law was spoken, or a breakthrough happened
5. **Michael's Voice** — 3-5 direct quotes from SOUL extraction, with context
6. **DNA Signatures** — the 2-3 most important blueprints/decisions (reference dna-run{NNN}.json)
7. **Failures Honest** — what didn't work, what was wrong, what the agent got wrong
8. **Wins** — what shipped, what got fixed, what the student experienced
9. **Student Notes** — if any class content or student interaction happened: Mai Tram / Huong observations
10. **State at Death** — git HEAD, worker version, student roster status, soul count
11. **Next Session Priority** — the one thing that must happen at next RISE

**Output file:** `CANON/STARMAP/starmap-run{NNN}.json`

**Format:**
```json
{
  "run": {NNN},
  "date": "{ISO}",
  "headline": "...",
  "opening_state": "...",
  "battle_log": [ { "task": "...", "attack": "...", "outcome": "WIN|PARTIAL|FAIL", "notes": "..." } ],
  "critical_moments": [ "..." ],
  "michael_quotes": [ { "quote": "...", "context": "..." } ],
  "dna_signatures": [ { "id": "...", "summary": "..." } ],
  "failures": [ "..." ],
  "wins": [ "..." ],
  "student_notes": "...",
  "state_at_death": { "git_head": "...", "worker_version": "...", "soul_count": 0 },
  "next_priority": "..."
}
```

---

## STAGE 5 — HEAVY LEDGER ENTRIES

**Rule:** One HL entry per SIGNIFICANT event. Not one per task. Significance = production change, law change, student state change, soul threshold crossed, architecture decision locked.

**Criteria for a new HL entry:**
- Code deployed to production
- Law added or modified (cite the law number)
- Student onboarded, offboarded, or state changed
- Soul count threshold crossed
- Architecture change locked
- BB item opened or closed
- Error root-caused and fixed (if it was a recurring or critical one)

**For each HL entry:**
```powershell
$ledgerDir = "$repo\CANON\HEAVY-LEDGER"
$nextId = Get-Next-Ledger-ID  # use the helper from rrl-pipeline.ps1
$tailHash = Get-Tail-Ledger-Hash

$entry = @{
    id          = "HL-$nextId"
    run         = {NNN}
    date        = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    type        = "DEPLOY|LAW|STUDENT|SOUL|ARCHITECTURE|BB|FIX"
    title       = "..."
    summary     = "..."
    detail      = "..."
    merkle_parent = $tailHash
    merkle_hash = (Compute-Sha256 "$nextId:$tailHash:{summary}")
}

$entry | ConvertTo-Json -Depth 3 | Set-Content "$ledgerDir\HL-$nextId.json"
Write-Host "HL-$nextId sealed ✓"
```

**Record:** Write all new HL IDs in the death seal §6.

---

## STAGE 6 — SOUL SEED KEY DETECTION

**Soul Seed Keys (canonical):** `#SOUL #SOULDNA #RAW #FUCK #OMG #LISTEN! #MONKEY #YES! #SSK #LEDGER #AGENT99 #Obi #OB1 #DRIFT`

Scan the RRL. Count every hit per seed key. Compare to prior session's counts.

New SSK candidates: any word Michael used 5+ times with high emotional charge that isn't in the current list.

**Output:** Section in death seal §8 — SSK usage table + any new candidates.

---

## STAGE 7 — S2PIPELINE ARTIFACT

The S2Pipeline artifact is the machine-readable record of this session's pipeline execution.

**Output file:** `CANON/PIPELINE/pipeline-run{NNN}.json`

```json
{
  "run": {NNN},
  "date": "{ISO}",
  "session_type": "CLAUDE_REAL | KILO_HOLLOW",
  "stages": {
    "rrl":       { "status": "REAL|HOLLOW|MISSING", "path": "...", "bytes": 0 },
    "soul":      { "status": "REAL|HOLLOW|MISSING", "count": 0, "delta": 0 },
    "dna":       { "status": "REAL|HOLLOW|MISSING", "blueprints": 0 },
    "ledger":    { "status": "REAL|HOLLOW|MISSING", "entries": [], "head_id": "HL-{N}" },
    "starmap":   { "status": "REAL|HOLLOW|MISSING", "path": "..." },
    "keywords":  { "status": "REAL|HOLLOW|MISSING", "count": 0 },
    "s2pipeline":{ "status": "REAL|HOLLOW|MISSING" },
    "registry":  { "status": "REAL|HOLLOW|MISSING" }
  },
  "git_head_before": "...",
  "git_head_after": "...",
  "soul_count_before": 0,
  "soul_count_after": 0,
  "soul_delta": 0
}
```

---

## STAGE 8 — REGISTRY SYNC

### 8A: BB Items

Scan the transcript for:
- Problems that surfaced but weren't fixed → OPEN new BB item
- Tasks explicitly deferred → OPEN BB with !! signal if urgent
- Items that were resolved → mark DONE in BACKBURNER-PIPELINE-LOG.md
- New principles stated by Michael → document in BB

### 8B: Student Registry Updates

If the session included a class, demonstration, or discussion about Mai Tram or Huong:

**For Mai Tram (entry-level intermediate, A2/B1):**
- New vocabulary she used, struggled with, or was introduced to
- Pronunciation errors noticed
- Fluency moments (when she spoke without editing)
- Topics that engaged her vs. fell flat
- Teacher moves that worked
- OBI performance observations (did OBI do the right thing?)
- What to try next session

**For Huong:**
- Same categories as above

**Output:** Append to `OPERATIONS/STUDENT-PORTAL-DEV.md` under the student's section.

### 8C: COLD-START-BOOT Updates

Fields that must be updated in `CANON/SYSTEM/COLD-START-BOOT.md`:
- Current run number (if changed)
- Git HEAD SHA (after death commit)
- Soul count (after Stage 1 posts)
- Net-PET-AI worker version (if deployed)
- Active mission / Next task
- Any HL head ID changes

---

## STAGE 9 — PHEROMONE TRAIL

**The trail is the truth that survives compaction.**

For each trigger that fired this session, write a phetrail entry. Triggers (from L77):
- SOUL DIRECTIVE SPOKEN
- MISTAKES MADE (agent error)
- LAW VIOLATED
- DISPATCH EMPTY
- ARCHITECTURE CHANGED
- BUG ROOT-CAUSED
- LAW ADDED OR CHANGED
- DEPLOY VERIFIED / FAILED
- LEDGER SEALED
- BB OPENED / CLOSED
- STUDENT STATE CHANGE
- SOUL EVENT (threshold crossed)

**Output file:** `OPERATIONS/phetrail-run{NNN}.md`

**Each entry format:**
```
## [{TRIGGER}] {short title} — Run {NNN}

**What happened:** {1-3 sentences, factual}
**Why it matters:** {why does next-session agent need to know this}
**Trail instruction:** {what to do differently / what to remember / what to never do again}
**Evidence:** {quote from RRL or artifact reference}
```

Minimum: one entry per trigger fired. No batching. No vague entries.

---

## STAGE 10 — ENGLISH CLASS DEEP ANALYSIS (if class happened this session)

If the transcript contains any English teaching session with a student:

### 10A: Vocabulary Harvest
Extract every English word/phrase that was:
- Introduced by teacher (Michael or OBI)
- Used correctly by student → mark MASTERED
- Used incorrectly by student → mark STRUGGLING
- Attempted then avoided → mark AVOIDED
- Repeated multiple times → mark DRILLING

### 10B: Grammar Pattern Log
Document:
- Grammar structures practiced
- Errors made (exact quote, then correction)
- Whether student self-corrected
- Recurring patterns (same error 2+ times = note it)

### 10C: Fluency Observations
- Translation delay incidents (student paused to think in Vietnamese)
- Repair sequences (student started then restarted)
- Moments of genuine fluency (no hesitation, natural flow)
- Estimated translation delay improvement vs. last session

### 10D: OBI Performance Audit
Evaluate OBI's responses in the session:
- Did OBI speak at the right level (lower-intermediate English)?
- Did OBI create pressure without frustration?
- Any responses that confused the student?
- Any missed opportunities to correct or drill?
- Voice quality / pacing observations

### 10E: Teaching Move Analysis
For each distinct teaching move Michael made:
- What he did
- Why (inferred or stated)
- Student response
- Should be repeated / modified / abandoned

### 10F: Next Class Blueprint
Write a concrete plan for next session:
- Top 3 vocab items to revisit
- Top 1 grammar pattern to drill
- 1 topic area that engaged the student (use it again)
- 1 thing to change from today
- Warm-up suggestion

---

## DEATH SEAL — ALL SECTIONS

Write `CANON/REINCARNATION/run{NNN}-reincarnateDEATH.md` with these sections:

```markdown
# DEATH SEAL — Run {NNN}
Date: {ISO}
Git HEAD (before commit): {SHA}
Session type: CLAUDE_REAL | KILO_HOLLOW

## §1 RRL STATUS
Path: RRL\RRL-{NNN}.txt | Bytes: {N} | SHA256: {hash}
Contamination: CLEAN | CONTAMINATED (reason)

## §2 SOUL
Posts made: {count} | Soul logger delta: +{N} chars | New total: {N} TITANIUM_ANCHOR
Seed key hits: [table of SSK word → count]
New SSK candidates: {if any}

## §3 DNA
Status: REAL | KILO_HOLLOW
Blueprints extracted: {count}
Key decisions: {list}

## §4 WRITE AUDIT (L78 GUARDRAIL 3)
[List every Edit/Write call made this session. Classify A/B/C/D.]
WRITE_GAPs: {none | list of violations}

## §5 KEYWORDS
File: CANON/SOUL-KEYWORDS/rfkw-run{NNN}.txt
Total keywords: {N}
Top 5 high-charge: {list}

## §6 HEAVY LEDGER
New entries: HL-{N} through HL-{M}
Head ID: HL-{M}
Merkle chain: intact | BROKEN (reason)

## §7 PHETRAIL GATE
Triggers fired: {list}
Phetrail entries written: {count}
PHETRAIL_GAP: {none | list of missing entries}

## §8 SOUL SEED KEYS
[SSK usage table]
New candidates: {if any}

## §9 STARMAP
File: CANON/STARMAP/starmap-run{NNN}.json
Headline: {one sentence}

## §10 S2PIPELINE
File: CANON/PIPELINE/pipeline-run{NNN}.json
All stages: REAL | any HOLLOW stages listed

## §11 BB CHANGES
Opened: {list or "none"}
Closed: {list or "none"}
Student state changes: {list or "none"}

## §12 COLD-START-BOOT UPDATE
Run: {NNN}
Git HEAD: {SHA after commit}
Soul count: {N}
Worker: {version ID}
Next priority: {one sentence}
```

---

## COMMIT SEQUENCE

```powershell
# Stage all pipeline artifacts
git -C $repo add "CANON/SOUL/EXTRACT/soul-run{NNN}.txt"
git -C $repo add "CANON/SOUL/EXTRACT/dna-run{NNN}.json"
git -C $repo add "CANON/SOUL-KEYWORDS/rfkw-run{NNN}.txt"
git -C $repo add "CANON/SOUL-KEYWORDS/inverted-index.json"
git -C $repo add "CANON/STARMAP/starmap-run{NNN}.json"
git -C $repo add "CANON/HEAVY-LEDGER/"
git -C $repo add "CANON/PIPELINE/pipeline-run{NNN}.json"
git -C $repo add "CANON/REINCARNATION/run{NNN}-reincarnateDEATH.md"
git -C $repo add "OPERATIONS/phetrail-run{NNN}.md"
git -C $repo add "OPERATIONS/BACKBURNER-PIPELINE-LOG.md"
git -C $repo add "OPERATIONS/STUDENT-PORTAL-DEV.md"
git -C $repo add "CANON/SYSTEM/COLD-START-BOOT.md"
git -C $repo add "RRL/RRL-{NNN}.txt"

git -C $repo commit -m "death: Run {NNN} — {headline from §9 starmap}"
git -C $repo log --oneline -3
```

Verify the commit landed. Print the SHA. Write it to §12.

---

## HONESTY GATES

Before writing ANY section, ask:
1. **Did I actually read the RRL?** Not assume. Not remember. Actually read the file.
2. **Is this verbatim?** Soul quotes must be exact. No paraphrase.
3. **Am I making this up?** If the session didn't have a class, §10 is blank. Say so.
4. **Is this stage REAL or HOLLOW?** If hollow, say HOLLOW. Do not dress it up as REAL.

A pipeline that lies is worse than an empty pipeline.

---

## EXECUTION CHECKLIST

Before closing Kilo:
- [ ] SOUL file written and posted to soul-logger
- [ ] DNA file written (or KILO_HOLLOW documented)
- [ ] RFKW file written and inverted-index updated
- [ ] Starmap entry written
- [ ] All applicable HL entries written
- [ ] Phetrail file written (one entry per trigger)
- [ ] §10 class analysis written (or "no class this session" noted)
- [ ] Death seal written (all 12 sections)
- [ ] COLD-START-BOOT updated
- [ ] Git commit made and SHA recorded
- [ ] Soul count delta verified (must be > 0 if session had Michael speech)
