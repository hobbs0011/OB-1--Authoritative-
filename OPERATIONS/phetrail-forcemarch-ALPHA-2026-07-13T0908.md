# PheTrail — PhoenixScout FORCE MARCH ALPHA (CANON zone) — ROUTING LEARNED
**Run:** 161 sweep | **Scout:** SC-2026-07-13T0908A | **Date:** 2026-07-13T09:08 ICT
**Lens axis added:** `LEGACY-DOMAIN` (mrmichaelhobbs1234 vs live mrmichaelhobbs123)

## What changed scout routing/lenses
1. **CANON is 6901 files — DO NOT full-walk.** A FORCE MARCH must narrow. Priority subtrees for SOUL/LEDGER/HEAD/DRIFT lenses:
   - WALK: `CANON/SYSTEM` (boot + gospel + queen), `CANON/HEAVY-LEDGER` (sample top + STATE-SNAPSHOT), `CANON/REINCARNATION` (death seals + log), `CANON/CONFIG`, `CANON/SOUL` (top + BIBLE-OF-THE-SYSTEM.json).
   - DEFER (NOT_WALKED): `TRAIN-67` (157, product specs), `SOUL-SEGMENTS` (84), `SOUL-KEYWORDS` (150), `STARMAP` (178), `PIPELINE` (121), `REGISTRY` (22), `ARTWORK` (30), `RESEARCH` (4), `VAULT-DUMPS` (1).
   - SAMPLE-ONLY: `SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05` (925) — SOUL-dense but legacy-domain noisy.

2. **Phantom-signal trap: `mrmichaelhobbs1234` (the "4" variant).** ~3800 grep hits across the recapture dir. LIVE canonical identity is `mrmichaelhobbs123` (no 4). Any workers.dev URL grep in the recapture dir is PHANTOM unless cross-checked. Add LEGACY-DOMAIN as a distinct flag axis; never act on 1234 URLs.

3. **HEAD-of-truth split:** `STATE-SNAPSHOT.json` IS correctly synced to HEAD (Run 161 / 3a070fa67). `COLD-START-BOOT.md` is the STALE outlier (fingerprint frozen at Run 151, self-violates I.030). Future DRIFT sweeps should diff COLD-START-BOOT.md FINGERPRINT vs STATE-SNAPSHOT.json, not vs git log alone.

4. **Ledger attestation gap:** only 73/693 HEAVY-LEDGER json files carry `no_fabrication`. New lens default: report attestation COVERAGE %, not per-file (would blow 200-flag cap).

## Routing recommendation for next CANON scout
- Start at STATE-SNAPSHOT.json (run + head_sha) as authoritative cursor; walk SYSTEM + REINCARNATION + HEAVY-LEDGER top 100 with DRIFT/LEDGER/SOUL lenses.
- Treat `.kilo/command` + `.kilo/agent-manager.json` as a SEPARATE zone (config authority lives outside CANON).
- Cap: 24 flags this sweep; plenty of headroom under 200. Bulk NOT_WALKED notes are valid given 6901-file scale.
