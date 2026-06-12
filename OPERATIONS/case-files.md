# PHASE 0 — THREAD PIPELINE
# Every open thread from every run. Nothing filtered at intake.
# Log it when you find it. Analyze later.
# Format: [RUN] [WEIGHT: HIGH/MED/LOW] thread — source evidence

---

## OPEN THREADS

### FROM RUN A
- [A][HIGH] 19 Roman doctrine terms missing from inverted-index — CANON/SYSTEM/EXPLORATORES-SCOUT-DOCTRINE.md + S2PIPELINE-ROMAN-LEGION-NAMING.md exist but were never scanned by rebuild script
- [A][HIGH] `scouts` broken trail — count=2, runs=[] — entry exists but run attribution write failed somewhere between rfkw parse and index write
- [A][MED] `phoenix` is the only intact doctrine trail — runs=[61,64,66,70,73]. WHY did phoenix survive when nothing else did? Check those runs.
- [A][MED] Run 105 has no rfkw file — Roman doctrine origin session is completely dark to the index

### FROM RUN B
- [B][CRITICAL] rfkw extractor is top-30 unigram from RRL text only. Structurally cannot capture: multi-word phrases, alphanumeric IDs (agent99), vocabulary from non-session files. Not a bug — a design ceiling.
- [B][HIGH] 298 of 907 index entries have runs=[] — broken trail is not unique to `scouts`. Nearly 1/3 of the entire index has lost run attribution.
- [B][MED] Schema inconsistency in inverted-index — some entries are arrays `[{run,weight}]`, some are objects `{term,weight,runs,count,category}`. Two formats coexisting = rebuild script changed schema mid-run history.

### FROM RUNS C-V (BATCH)
- [C][CRITICAL] SOUL_INDEX near-empty. Score=0.25 on doctrine query = noise. PA v1.2.0 live but unfed.
- [C][HIGH] DNA_INDEX has 542 Run 116 fragments. Agent prose only. Not Michael's words.
- [E][HIGH] 65 CANON/SYSTEM docs. 20+ doctrine-heavy. None in Vectorize. Total estimated unmined: ~300KB of doctrine.
- [F][HIGH] 12 rfkw gaps: runs 8,9,11,14,15,27,74,89,90,94,95,105. Run 105 is double-gap (no rfkw AND no pipeline artifact).
- [H][MED] PHASE0-FINAL-SPEC.md = old Phase 0 (Run 046 battlefield census). DIFFERENT from current Phase 0 A-Z. Two systems sharing the same name — potential confusion for future runs.
- [N][HIGH] CANON/PIPELINE/phase0-scout-B-K.json = CONTAMINATED OUTPUT (premature batch, fake targets). Do not use. Flag for cleanup.
- [Q][CRITICAL] SoulSearch chain confirmed: inverted-index → starmap → RRL. Step 1 broken for all doctrine terms. L79 mandatory SoulSearch has been returning empty for doctrine queries every session since Run 0.
- [R][LOW] CANON/RESEARCH/ = 3 files only. Market research layer almost nonexistent. L79 human sources requirement has no infrastructure to land in.

### FROM RUN B (SOUL ARCHIVE DIVE)
- [B2][CRITICAL] 20 Genesis/Foundation terms missing: failclosed, ledgerislaw, shadowfirst, skeletononly, loreisproduct, driftisdeath, voiceiscanon, planconfirmexecute, architecture astronautics, faith navigation, velocity override, kenneth filter, genesis wound, anti-capture, triad, hyena principle, sovereign, spy drone, soul dna, diagnostic drift
- [B2][HIGH] "spy drones" = origin of drone concept. Raw verbatim SEGMENT-01 L00007: "after doing some research with our spy drones for a couple of weeks." Market recon scouts. Predates code execution drone concept.
- [B2][HIGH] "Architecture Astronautics" = named failure mode. Drone stops to dream up grand systems instead of executing. Source: 0011-05_TMST_THE_WEAPON.md. This term is not indexed anywhere.
- [B2][HIGH] 9 Genesis Axioms from DNA1 — FAILCLOSED through VOICEISCANON — never indexed. These are the founding laws and the index cannot find them.
- [B2][MED] SOUL-SEGMENTS/SEGMENT-01 contains raw Michael voice transcription from first-ever Gemini session. DNA-flagged line by line. SPY_DRONE|LEDGER|DRIFT|SURVIVAL|VIETNAM tagged at source. This is the origin layer — never processed into Vectorize.
- [B2][MED] VAULT-GENESIS has 15 files: EMPIRE-BLUEPRINT, BAMBOO-DOCTRINE, SOVEREIGNTY-MANIFESTO, ZERO-TRUST-FOUNDATION, VELOCITY-AWAKENING, etc. None of these appear in any index.
- [B2][LOW] ARCHIVE/Phoenix-Rise-Immortalize/SOUL-DNA-BIBLE = 45 files (deeper source layer for Bible chapters). Some content differs from CANON/ versions.
- [B2][LOW] "the number one truth is truth" — ALPHA-OMEGA-DNA4.txt. Michael's sovereignty declaration. Not indexed.

### THREADS REQUIRING FOLLOW-UP RUNS
- [NEXT-C] VAULT-GENESIS: Read THE-EMPIRE-BLUEPRINT and THE-BAMBOO-DOCTRINE. What terms appear there that aren't anywhere else?
- [NEXT-D] SOUL-SEGMENTS: Read SEGMENT-02 through SEGMENT-05. What does Michael say in the first 25% of his raw voice archive that isn't in any index?
- [NEXT-E] Why did `phoenix` survive in the index when `agent99` and `drones` didn't? Check rfkw-run61 through rfkw-run73 — what format were those runs using?
- [NEXT-F] 298 entries with runs=[] — when did the run attribution stop being written? Was there a schema change in rebuild-keyword-index.ps1?
- [NEXT-G] GOSPEL-999 actual mandates — what are the 9 systems? Are their names indexed?
- [NEXT-H] OP(ZEN)-1000-LAYERS-10.txt — this is the source for Faith Navigation and Architecture Astronautics. Does it exist in the repo? What else does it contain?
- [NEXT-I] CANON/REINCARNATION/run105-reincarnateDEATH.md — read it. Run 105 is the Roman doctrine origin session. What did that death seal say?

---

## CLOSED THREADS
- [A] Root cause of 19 missing terms → rfkw extractor top-30 unigram (CLOSED: confirmed Run B)
- [A] Does EXPLORATORES-SCOUT-DOCTRINE.md exist? → YES, CANON/SYSTEM/, 6.5KB, ratified Run 0 (CLOSED)

---
*Last updated: Run B (session 117)*
