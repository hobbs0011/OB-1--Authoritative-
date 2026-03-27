# Train 6-7 — Survive a Brainrot — Launch Pipeline (10 Steps)

**Mission:** ship a playable demo, publish safely, then iterate fast.
**Rule:** NO API SECRETS IN REPO. We will wire keys later.

## Step 1 — Single entry point (server boot)
- Use `UnifiedServer.lua` as the only server entry.
- Verify Studio output shows `BOOT COMPLETE`.

## Step 2 — Module placement contract (Studio)
- `ServerScriptService/UnifiedServer.lua` (Script)
- `ServerStorage/*.lua` (ModuleScripts): `ServerGateway`, `SecurityLayer`, `DataStoreV2`, `QuestionBankV2`, `EnemyFactory`, `CombatSystem`, `WaveManager`
- Optional: `AnalyticsService`, `MonetizationServer`, `DailyRewards`, `BattlePass`, `GachaManager`

## Step 3 — Fix syntax-hard blockers
- Zero HTML entities in Lua (`&gt;`, `&lt;`, etc.).
- Run Play Solo once with Output visible.

## Step 4 — Minimal playable loop (demo definition)
- Spawn → RequestQuestion → SubmitAnswer → DealDamage/KillEnemy → WaveProgress.
- Confirm the loop works with 1 player.

## Step 5 — 5-player lobby gate (viral mechanic)
- Enforce the 5/5 gate and countdown.
- Confirm game will not start with <5.

## Step 6 — Question Bank V2 sanity
- Confirm `QuestionBankV2.Init()` prints total question count.
- Confirm one question payload renders to client.

## Step 7 — FTUE sanity (optional but recommended)
- Ensure FTUE does not soft-lock.
- Confirm skip / fast path exists.

## Step 8 — Analytics (safe, no keys)
- Roblox AnalyticsService events should fire automatically.
- DataStore aggregation is safe (no external keys).

## Step 9 — Monetization wiring (NO product IDs yet)
- Keep all DevProduct/GamePass IDs as placeholders until you set them in Roblox Creator Dashboard.
- Confirm there is **no** `MarketplaceService.ProcessReceipt` conflict (use ReceiptRouter pattern if needed).

## Step 10 — Publish checklist (manual operator)
- Game title, description, icon, thumbnail.
- Basic policy text (no claims, no guarantees).
- Test on PC + mobile.
- Publish demo.

## Output of this pipeline
- A Studio-bootable demo that does not crash.
- A repo state that is safe to share (no secrets).
- A clean place to wire API/product IDs next.
