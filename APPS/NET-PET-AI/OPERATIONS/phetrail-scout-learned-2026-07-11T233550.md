# PheTrail Scout — 2026-07-11T233550

## Learned Rules
1. **Index Maintenance Rule**: New KV-backed modules must maintain existing indexes (employer:index, orders:index, etc.) or risk stats/admin inconsistencies.
2. **Handler Definition Rule**: Every route handler referenced in the dispatch table must have a corresponding sync function definition in the same file.
3. **Attestation Rule**: JSON files in production code paths should carry 
o_fabrication attestation for audit compliance.
4. **Migration Rule**: Durable Object bindings require explicit [[migrations]] entries; missing migrations cause silent state loss on deploy.
5. **Monolith Rule**: Files exceeding 5000 lines with mixed concerns (legacy + new) should be flagged for modularization.

## Next Scout Actions
- Route HL-724 to Heavy Ledger zone for proper ledger audit
- Verify handleMemorySummary is either implemented or removed
- Add employer:index write to src/seats.js
- Add 
o_fabrication to all JSON test fixtures
