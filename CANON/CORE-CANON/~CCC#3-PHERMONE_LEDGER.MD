# ~CCC#3-PHERMONE_LEDGER.MD — PaiS Central Core Canon

> **Status:** CORE CANON — SOV100 AUTHORITY — SEALED
> **Origin:** Created by SOV100 Michael Hobbs as part of the Core Canon.
> **Nature:** SCORING. MEMORY. COLONY. PHEROMONE.

## PURPOSE

The Pheromone Ledger governs colony scoring — POS/NEG × BIG/LITTLE, 0–110 only.

This is the scoring/memory layer of the PaiS CentralCoreCanon. It records what worked (positive pheromones) and what failed (negative pheromones), enabling the colony to learn without repeating dead ends.

## SCORING MODEL

- **POS/NEG** × **BIG/LITTLE**
- Range: 0–110 only
- No parallel scoring systems permitted
- Colony scoring only — never individual agent scoring that bypasses the colony model

## AUTHORITATIVE LOCATION

`CANON/PHEROMONES/PheTrail-{RunNumber}.json` — pheromone trail files written at DEATH, read at RISE.

This CCC#3 document points to the pheromone ledger implementation.

---
**DO NOT EDIT.** SOV100 authority only.
