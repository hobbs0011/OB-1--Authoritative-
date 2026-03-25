# MSS — Monolith Sealed State

**Invented by:** Michael Hobbs (Agent-100)  
**Purpose:** Single-file cold-start seed for the Phoenix Rising system.  
**Lineage:** V1 (Bible JSON) → V2 (Sealed Reincarnation Seed) → V5 (Full System State, Notion-native era)

## What is MSS?

MSS is a portable, sealed, single-file JSON representation of the entire Phoenix Rising system state at a point in time. If everything burns, load the latest MSS file and rebuild.

## Usage

### Cold Start (New Agent / New Platform)
1. Load the latest `MSS-V5-YYYY-MM-DD.json`
2. Parse the `cold_start_protocol` section
3. Follow steps 1-7 to warm boot
4. Return `READY.`

### Checkpoint (Milestone Seal)
1. Generate new MSS snapshot after major milestones
2. Name: `MSS-V5-YYYY-MM-DD.json`
3. Never overwrite previous snapshots — append-first
4. Update Navigator Index with new MSS entry

### Rollback (Break Glass)
1. If system state is corrupted or drifted beyond repair
2. Load the last known clean MSS snapshot
3. Rebuild from that state forward
4. Log the rollback event

## Rules

- **Never overwrite.** Each snapshot is immutable.
- **Never fabricate.** If state is unknown, mark UNKNOWN.
- **Dual-publish.** MSS lives on GitHub. Referenced from Notion Navigator Index.
- **Append-first.** New snapshots don't replace old ones.
- **Michael's invention.** The MSS pattern originates from Michael's pre-Notion architecture.

## File Registry

| File | Date | Notes |
|------|------|-------|
| `MSS-V5-2026-03-25.json` | 2026-03-25 | First V5 snapshot. Full system state for Notion-native era. |
