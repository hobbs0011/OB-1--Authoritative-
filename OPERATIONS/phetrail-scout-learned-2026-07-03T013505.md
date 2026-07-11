# phetrail-scout-learned-2026-07-03T013505.md
Scout focus: student portals → most recent Oktava company portal (`APPS/NET-PET-AI/public/oktava-login/`)
Serves as pheromone for future scout runs, command behavior, and routing.

## Findings → Rules Upgraded

1. **Raw transcripts are soul territory.** Any `.txt` >40KB under `public/*/login` or `public/*/classroom` is treated as SOUL UNMINED until sov100 attribution is verified. Prior scout lens marked `SOUL` too narrowly (only blockquotes).

2. **Public dir operational copy-paste risk.** Run-spec metadata, raw transcripts, and class artifacts often get copied into public routes by accident. Added check: scan first 20 lines for run-state keywords (`RUN \d+`, `Death aborted`, `McAfee`, `blocked on`, etc.).

3. **Snapshot drift is portal-relevant.** `CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json` is a fast proxy for mission/head/runtime drift. Any portal sweep must re-read this file before child asset scan, not just `git rev-parse`.

4. **Fingerprint mismatch tolerance is zero.** L30 fires on ANY mismatch. Flag as STALE even if only one run behind.

5. **Audio/video orphans.** Binary assets in portal dirs without manifest references are noise. Future scout lens adds asset manifest check.

## Routing Impact

- **/reincarnateRise** → must cross-check STATE-SNAPSHOT + BOOT fingerprint before stage audit.
- **DEATH** → must sanitize public portal dirs and remove operational transcripts before seal.
- **Soul intake** → transcripts need speaker attribution + student vs sov100 split before append.
- **Backburner** → `/soulsearch` should index `public/*` transcript directories only, never ingest automatically.
