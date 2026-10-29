# Refusal log — market research campaign

> A missing row says "not measured", never "does not exist". Recorded with status + the door's own words.

## 2026-10-29 — unauthenticated games.roblox.com v1 closed (Leg A/B)
- `POST /v1/games/list` (keyword search) → **404** `{"errors":[{"code":0,"message":""}]}`
- `GET /v1/games/autocomplete?prefix=99%20nights` → **404**, same body
- `GET /v1/games/sorts` → **404**, same body
- `GET /v1/games/multiget-place-details?placeIds=1` → **401** `code 9002 "Authentication token is missing"` — host alive, auth required even for public details.

Conclude: the no-key endpoint stack in the campaign draft is retired. Two lanes replace it:
1. **Open Cloud key lane** (primary) — sovereign-supplied Roblox API key, stored in the browser key slot like other secrets, never in source. Universes + games + economy endpoints.
2. **Page-HTML fallback** (no key) — public game pages via the station lane for titles, descriptions, update dates, badges, pass names/prices; CCU via third-party trackers marked as third-party, never first-party.

## 2026-10-29 — Lane 2 pull results (in-transit leg)
WORKING (first-party Roblox data, no key): `apis.roproxy.com/universes/v1/places/{id}/universe`
(10/10 place→universe resolutions) + `games.roproxy.com/v1/games?universeIds=` (batched,
CCU/visits/favorites/maxPlayers/updated/genre per game) + game-page JSON-LD
(like-ratio, vote counts, dateModified). 10/10 comparables measured.
- `GET .../v1/games/votes` → **403 Cloudflare block page** (transient bot-wall; like%
  covered instead via page JSON-LD — no data lost).
- `game-passes` paths on both hosts → **404** `{"errors":[{"code":0,"message":""}]}` —
  per-game pass/dev-product lists unmeasurable without key. Leg C rests on platform
  policy docs + public game descriptions (recorded in money-meta.md, not guessed).
- ID guesses that failed honestly: Piggy 4623383532 → wrong game (RB Battles orbit);
  99 Nights 7954620867 → 404; Arsenal 2860904294 → 404; `steal-a-brainrot.fandom.com`
  → wiki does not exist; TSB fandom Gamepasses page → 200 but EMPTY (rev 0).
  Unresolved, rows withheld: 99 Nights, Steal a Brainrot, Piggy, Evade, Zombie Uprising.
