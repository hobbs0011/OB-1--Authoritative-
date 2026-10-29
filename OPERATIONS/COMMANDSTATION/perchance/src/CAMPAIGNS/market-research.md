# MARKET RESEARCH CAMPAIGN — external scouting for Train 6-7 positioning

> Durable contract. Chat + `scratch/` is a day hike. This file is the campaign.
> Next session: read this file first, then `scratch/CURRENT_TASK.md` for the working trail.
> Doctrine inherited: `src/market.js` — a number or a refusal, never a guess; fail closed.

## Objective
Map the external Roblox survival/brainrot field Train 6-7 launches into, so positioning,
pricing, and scope are set against measured competitors — not vibes. Every number carries
its URL + timestamp. Every shut door is printed BLOCKED with the door's own words.

## Done gates (all must be true)
1. **Comparables table**: ≥10 live games in the survival / brainrot / wave-defense lane, each with universe ID, CCU (at measure time), visits, like-ratio, server size, update cadence — URL + timestamp per row.
2. **Money signals**: for each comparable, public monetization surface — game passes listed (names + R$), dev products listed where public, premium-payout posture if observable. No guessing at revenue; print what is public.
3. **Positioning memo**: where Train 6-7 sits (5-player co-op, English Power-Up, 99-day scaling, 2-currency economy) vs the field — 3 open seats named with the rows that prove them.
4. **Freshness stamp**: every number re-measured or re-confirmed within 7 days of any launch decision that cites it. Stale numbers are marked STALE, never quietly cited.
5. **Refusal log**: every endpoint that refused (auth wall, captcha, rate limit, dead API) recorded with status + body snippet. A missing row says "not measured", never "does not exist".

## Non-goals
No contacting developers. Nothing behind auth. No scraping that defeats access controls.
Public endpoints + game pages only, polite pacing (≤1 req/2s per host, cache everything).
No revenue estimates presented as fact — public signals only.

## Method legs (exhaustive = all four, every sweep)
- **Leg A — targets**: resolve universe/place IDs for the comparable set via public search/list endpoints. New candidates welcome; each needs an ID before it counts.
- **Leg B — metrics**: per universe — votes (up/down), playing/visits/favorites from multiget endpoints, server-size + update date from game details.
- **Leg C — money**: per universe — public game-pass list (names, prices, IDs where exposed), dev-product surface where public, badge/premium signals.
- **Leg D — synthesis**: seats memo + staleness pass. Nothing ships to a launch decision without D.

## Standing comparable set (seed — extend, never shrink without a reason on record)
99 Nights in the Forest · Doors · The Strongest Battlegrounds · Grow a Garden ·
Dead Rails · Natural Disaster Survival · Zombie Uprising · Evade · Piggy · BedWars
(plus 2 direct brainrot-meme peers to be named in Leg A — the lane Train 6-7 actually fights in)

## Endpoint stack (2026-10-29: no-key v1 retired — measured, see refusals.md)
- RETIRED: `POST /v1/games/list`, `GET /v1/games/autocomplete`, `GET /v1/games/sorts` → 404; `multiget-place-details` → 401 auth-required. Unauthenticated games.roblox.com is closed.
- **Lane 1 (primary): Open Cloud key** — sovereign-supplied Roblox API key in the browser key slot, never in source. Universes/games/economy endpoints for Legs A-C.
- **Lane 2 (fallback, no key): page HTML** — public game pages via the station lane (titles, descriptions, update dates, badges, pass names/prices); CCU from third-party trackers, always marked third-party.
- All through the station lane (`root.superFetch`); raw bodies cached to evidence with timestamps.

## Evidence
`src/CAMPAIGNS/market-evidence/` — `manifest.json` + timestamped JSON pulls + `comparables.md` (the table) + `seats.md` (the memo) + `refusals.md`. Numbers without a file here do not exist.

## Session log
- 2026-10-29: campaign opened as Incarnate-29 (RISE mission = this file). Prior: Train 6-7 build campaign (Incarnate-28, probe LIVE) rides onward untouched.

- 2026-10-29: Incarnate-29-Market-Recon RISE REAL (run 15, no conflict). SCS SCOUT REAL. Sweep #1: 13/13 targets, market probe LIVE (contract 7/7, evidence EMPTY honest — 0 pulls, 4 refusals on record). No-key endpoint stack measured DEAD (3x404 + 401-auth on details endpoint) and replaced: Lane 1 Open Cloud key (sovereign-supplied), Lane 2 page-HTML fallback. BLOCKED ON: Roblox API key for Legs A-C, or Go on Lane 2 page-scrape fallback.

- 2026-10-29 (in-transit leg, no key): Lane 2 EXECUTED. Internal sweep: 20-question
  synthesis FILED in README but ABSENT on disk (STALE ref — noted, not cited); live
  money design found in GamePassConfig/DevProductsConfig RESEARCH BASIS (Q5/Q14).
  External: 10/10 comparables measured (CCU/visits/favs/like/server-size/updated,
  URL+timestamp each) via public proxy `games?universeIds=` + page JSON-LD —
  comparables.md. Slang: skibidi 7.2% of peak, italian-brainrot 5.6%, game 15.4% —
  user's instinct CONFIRMED with numbers (slang-freshness.md). Money: Creator Rewards
  (5 Robux/day-engagement, 35% x $100 audience expansion), gacha odds-disclosure law,
  timers unpopular (money-meta.md). Retention: weekly-monthly cadence doctrine,
  BedWars-Friday model, 8/10 updated <48h (retention-meta.md). Seats: 3 open
  (co-op+learning, weekly survival, trust-gacha) — seats.md. New refusals logged
  (votes CF-wall, game-passes 404s, 5 unresolved IDs, empty TSB wiki page). Freshness
  stamp: re-measure before 2026-11-05 if cited. STILL OWED: API key (Legs A-C
  per-game pass lists, CCU as first-party, 5 unresolved IDs).
- 2026-10-29 (3D character-gen research): vendor + constraint sweep filed as
  market-evidence/3d-character-gen.md (manifest pulls 7, refusals 13). Verdict: $0 lane
  viable (free AI tiers + Blender), best paid value one month Meshy/Tripo, quality pick
  Synty packs. Open: exact tier/pack prices need a browser check.
- 2026-10-29 (GO + Map-meshy legs): Meshy fully mapped (Free/Pro/Premium/Ultra
  $0/20/40/100, 50% off first month, ~35 credits/textured model, Free cannot download —
  file corrected), Synty exact prices via store JSON (Zombies $60 sale, bundle $315.99),
  Quaternius zombie kit confirmed (CC0, 4+4x20+2, FBX). ASSET-MARCH-01 order written
  (itch $0-claim is user-side, email-gated).
- 2026-10-29 (reincarnation): entire Roblox arc sealed as BB-RUN-24
  Incarnate-30-Roblox-Seal — all 7 stages REAL, seal 18:44 ICT, handoff run 16.
  Filed in src/Backburner.md. Canon untouched; GATE WITHHELD.