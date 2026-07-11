# PheTrail Scout Learned — 2026-07-02T012901

## Zone
CANON/HEAVY-LEDGER/

## Learnings

1. Phantom IDs must be validated against actual HL-NNN naming before ingest.
   - Scout flagged HL-.json and 6 missing phantom IDs (HL-127,128,131,132,136,137).
   - Future routing: check filesystem for HL-{NNN}.json before declaring phantom gaps.

2. Attestation coverage is a drift indicator, not just compliance.
   - 614/676 (90.8%) of HEAVY-LEDGER JSON files lack 
o_fabrication attestation.
   - Future routing: batch attest via /api/ledger/attest or script; treat low coverage as pipeline drift.

3. Domain references are drift pheromones for identity cleanup.
   - 10 files contain legacy operator domain mrmichaelhobbs1234.
   - Future routing: regex-scan all zones for legacy domains; update to mrmichaelhobbs123 or archive as historical.

4. JSON parse failure indicates write interruption or encoding corruption.
   - 2 corrupted files found: HL-113-mss-v5-security-authority.json, VAULT-MM-MASTERMIND-CONSOLIDATED-2.json.
   - Future routing: quarantine malformed JSON; repair before ledger ingest.

## Role Upgrade
PhoenixScout now validates phantom IDs against filesystem and aggregates bulk attestation/domain findings into summary flags (not per-file spam).
