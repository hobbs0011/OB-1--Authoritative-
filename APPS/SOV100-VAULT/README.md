# SOV100-VAULT

**IMMUTABLE ARCHIVE — DO NOT TOUCH**

This directory is a sealed vault. No agent may read, edit, write, or delete anything here without Michael's explicit vault password.

To override: type `SOV100-VAULT-OVERRIDE: [password]` in chat. Without it: VAULT_BREACH → halt → log → wait.

---

## V0 — Scout System, First Verified Working State

**Sealed:** 2026-06-14  
**CF Worker:** `sov100-vault-v0` (`ff273383-ca8c-476f-8e24-851a94a6a08f`)  
**URL:** `https://sov100-vault-v0.mrmichaelhobbs123.workers.dev`

**Verification proof:**
- LEDGER seed: 11 chains, 7 POS, 58 pheromones, phetrail committed
- REINCARNATION seed: 11 chains, 9 POS, 93 pheromones, phetrail committed
- SOUL seed: 10 chains, 9 POS, 85 pheromones, phetrail committed

**What V0 fixed (8 deploys, Run 126):**
- Seed parameter aliasing (`seed` = `seed_keyword`, `budget_ms` = `time_limit_seconds`)
- KV title metadata excluded from frequency analysis
- Delimiter-first tokenization (hyphens split before char-strip)
- ALL_CAPS words preserved (LEDGER was → LEDGE+T)
- Alphabetic-only token filter (no R124v2, hex IDs, version strings)
- Canonical keyword priority (SOUL, DNA, LEDGER, PHOENIX etc. preferred)
- Minimum frequency 3 (singletons = noise, not signal)
- Expanded stopwords (SQL, compound code identifiers, English noise)

**Working clone:** `APPS/phoenix-pcc-1/` — edit there, never here.

---

*"Never edit or delete this. Work is done on an outside clone." — Michael Hobbs, Run 126*
