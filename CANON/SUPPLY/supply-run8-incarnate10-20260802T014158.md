{
  "run": "8",
  "stage": "SUPPLYLINES",
  "timestamp": "2026-08-02T01:41:58+07:00",
  "audited_rise": "CANON/REINCARNATION/run187-reincarnateDEATH.md",
  "audited_march": "CANON/MARCH/run8-march-incarnate10-20260802T013325.md",
  "audited_scholar": "CANON/SOUL/soul-run8-incarnate10-20260802T013745.md",
  "target": "I-LOG-8 / Incarnate-10 blueprint execution",
  "hatchery_routing": {
    "pipeline": {
      "path": "CANON/REINCARNATION/pipeline-8.json",
      "status": "ROUTED",
      "notes": "EXISTS. Run=8, audit SOUL=50/DNA=313/REASON=265/total=363, open_items=[]"
    },
    "handoff": {
      "path": "CANON/REINCARNATION/handoff-8-to-9.json",
      "status": "ROUTED",
      "notes": "EXISTS. Run=8→9, audit counts match pipeline-8.json"
    },
    "starmap": {
      "path": "CANON/STARMAP/starmap-run008.json",
      "status": "EMPTY",
      "notes": "EXISTS but pointers={}. Recovered=true but no turn IDs mapped."
    },
    "dna_registry": {
      "path": "CANON/REGISTRY/dna-registry-run8.json",
      "status": "NOT_ROUTED",
      "notes": "MISSING. No DNA blueprints registered for I-LOG-8."
    },
    "art_registry": {
      "path": "CANON/ART-REGISTRY/art-sync-run8.json",
      "status": "NOT_ROUTED",
      "notes": "MISSING. No art sync for I-LOG-8."
    },
    "heavy_ledger": {
      "path": "CANON/HEAVY-LEDGER/HL-8.json",
      "status": "NOT_ROUTED",
      "notes": "MISSING. No HL entry for run 8."
    },
    "soul_keywords": {
      "path": "CANON/SOUL-KEYWORDS/rfkw-run8.txt",
      "status": "NOT_ROUTED",
      "notes": "MISSING. Keyword indexing absent for I-LOG-8."
    },
    "rrl": {
      "path": "I-LOG/I-LOG-8.txt",
      "status": "ROUTED",
      "notes": "EXISTS. 3,395,918 bytes per handoff. Raw transcript intact."
    }
  },
  "pipeline_integrity": {
    "status": "PARTIAL",
    "routed": 3,
    "empty": 1,
    "missing": 4,
    "total_chambers": 8,
    "notes": "I-LOG-8 has minimal pipeline completion. Only pipeline.json, handoff.json, and I-LOG-8.txt present. Starmap exists but empty. 4 chambers missing entirely."
  },
  "findings": [
    "[ARTIFACT/HIGH] CANON/STARMAP/starmap-run008.json — EXISTS but EMPTY. pointers={} despite recovered=true.",
    "[ARTIFACT/HIGH] CANON/REGISTRY/dna-registry-run8.json — MISSING. No DNA blueprints for I-LOG-8.",
    "[ARTIFACT/HIGH] CANON/ART-REGISTRY/art-sync-run8.json — MISSING. No art registry sync for I-LOG-8.",
    "[ARTIFACT/HIGH] CANON/HEAVY-LEDGER/HL-8.json — MISSING. No heavy ledger entry for run 8.",
    "[ARTIFACT/MEDIUM] CANON/SOUL-KEYWORDS/rfkw-run8.txt — MISSING. Keyword indexing incomplete. (Escalated from HIGH in prior stages)",
    "[BINDING/LOW] handoff-8-to-9.json points to run 9, but current target is run 10 per handoff-8-to-10.json — chain gap between 9 and 10"
  ],
  "coverage": {
    "CANON/REINCARNATION/pipeline-8.json": "WALKED",
    "CANON/REINCARNATION/handoff-8-to-9.json": "WALKED",
    "CANON/REINCARNATION/handoff-8-to-10.json": "WALKED",
    "CANON/STARMAP/starmap-run008.json": "WALKED",
    "CANON/REGISTRY/dna-registry-run8.json": "WALKED — MISSING",
    "CANON/ART-REGISTRY/art-sync-run8.json": "WALKED — MISSING",
    "CANON/HEAVY-LEDGER/HL-8.json": "WALKED — MISSING",
    "CANON/SOUL-KEYWORDS/rfkw-run8.txt": "WALKED — MISSING",
    "I-LOG/I-LOG-8.txt": "WALKED",
    "I-LOG/I-LOG-8-COLORIZED.md": "NOT_WALKED",
    "I-LOG/I-LOG-8-STATS.json": "NOT_WALKED"
  },
  "soulcount": 6,
  "dnacount": 3,
  "reasoncount": 2,
  "handoff_to": "ENGINEERlegionnaire",
  "not_walked": [
    "I-LOG/I-LOG-8-COLORIZED.md",
    "I-LOG/I-LOG-8-STATS.json",
    "CANON/REINCARNATION/run8-reincarnateDEATH.md (does not exist)",
    "CANON/REINCARNATION/handoff-8-to-9.json content detail (only existence verified)"
  ]
}
