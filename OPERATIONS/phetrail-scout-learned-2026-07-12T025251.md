# Phetrail Scout Learned — 2026-07-12T025251

- [SCOUT-DRIFT-001] Frontmatter model fields override body-text retirement notices. Never trust a "DEAD" notice unless the model string itself is updated.
- [SCOUT-DRIFT-002] Dead provider references in agent specs are active routing poison — dispatch to a dead endpoint wastes tokens and breaks the mission.
- [SCOUT-DRIFT-003] High-speed modes like SuperSaiyan inherit dead-model risk because fewer validation checks run before dispatch.
- [SCOUT-DRIFT-004] Conflicting frontmatter/body model declarations create silent dispatch drift — agent may route to dead alias despite apparent safeguards.
- [SCOUT-CONFIG-001] Stale plans referencing renamed files (kilo.jsonc vs kilo.json) are the leading cause of config drift in .kilo/.
- [SCOUT-CONFIG-002] Plan-tier tables are often copied forward into new configs, cementing retired-alias drift.
- [SCOUT-DOMAIN-001] Legacy operator domain references (mrmichaelhobbs1234) in plans indicate plans that predate domain consolidation and should be audited before use.
- [SCOUT-DOCTRINE-001] Doctrinal files that reference retired aliases propagate dead-model routing into every subsequent run unless explicitly updated.
