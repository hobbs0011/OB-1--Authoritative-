# Roblox Studio Integration Guide — Skibidi Zombie: Survive the Brainrots

**GOAL: MAKE MONEY.**

> Step-by-step guide to get all code modules running in Roblox Studio.
> Estimated time: 15-30 minutes for a clean setup.

## Prerequisites

- Roblox Studio installed and logged in
- A new or existing Roblox place
- API Services enabled (Game Settings → Security → Enable Studio Access to API Services)
- HTTP Service enabled (Game Settings → Security → Allow HTTP Requests) — needed for DataStore testing

## Step 1: Create the Folder Structure

In Roblox Studio Explorer:

```
ServerStorage/
├── CombatSystem          (ModuleScript)
├── QuestionBank          (ModuleScript)
├── SecurityLayer         (ModuleScript)
├── EnemyFactory          (ModuleScript)
├── WaveManager           (ModuleScript)
├── DataStoreV2           (ModuleScript)
├── RewardBridge          (ModuleScript)
├── EconomyManager        (ModuleScript)
├── FTUEWiring            (ModuleScript)
├── GachaManager          (ModuleScript)
├── TradeManager          (ModuleScript)
├── ChallengeManager      (ModuleScript)
├── LeaderboardManager    (ModuleScript)
├── ReferralSystem        (ModuleScript)
├── BattlePass            (ModuleScript)
├── GuildManager          (ModuleScript)
├── WorldBoss             (ModuleScript)
├── PrestigeManager       (ModuleScript)
├── DevProductsConfig     (ModuleScript)
└── GamePassConfig        (ModuleScript)

ServerScriptService/
├── UnifiedServer         (Script — the ONLY server script)
└── AnomalyDetector       (ModuleScript)

StarterPlayerScripts/
└── HUDController_v2      (LocalScript)

ReplicatedStorage/
├── Remotes/              (Folder — created by UnifiedServer)
│   ├── SubmitAnswer      (RemoteEvent — auto-created)
│   ├── HealthUpdate      (RemoteEvent — auto-created)
│   ├── ComboUpdate       (RemoteEvent — auto-created)
│   ├── WaveUpdate        (RemoteEvent — auto-created)
│   └── ...               (all events auto-created by UnifiedServer boot)
└── DailyRewards          (ModuleScript)

Workspace/
├── SpawnPoints/          (Folder — add Part with SpawnLocation)
└── EnemyModels/          (Folder — add 5 enemy model dummies)
```

## Step 2: Copy Module Code

For each `.lua` file in `CANON/TRAIN-67/CODE/`:

1. Create the appropriate script type (ModuleScript, Script, or LocalScript)
2. Name it exactly as listed above (no `.lua` extension)
3. Paste the full code content
4. Place it in the correct service folder

**CRITICAL:** `UnifiedServer.lua` goes in `ServerScriptService` as a **Script** (not ModuleScript). Everything else in `ServerStorage` is a **ModuleScript**.

## Step 3: Create Placeholder Models

### Enemy Models (minimum viable)

For each of the 5 enemy types, create a simple model:

1. Insert → Part → rename to the enemy name
2. Add a `Humanoid` to each Part (Insert → Humanoid)
3. Add a `BillboardGui` with a `TextLabel` showing the enemy name
4. Group as Model, place in `Workspace/EnemyModels/`

Enemy names:
- `SkibidiZombie`
- `SigmaBoss`
- `OhioAnomaly`
- `RizzMerchant`
- `BrainrotMutant`

### Spawn Point

1. Insert → SpawnLocation in Workspace
2. Position at (0, 1, 0)

## Step 4: Create Remotes Folder

1. In ReplicatedStorage, create a Folder named `Remotes`
2. UnifiedServer will auto-create all RemoteEvents on boot
3. But if you want to pre-create them for testing:

Required RemoteEvents:
- SubmitAnswer
- HealthUpdate
- ComboUpdate
- PowerUpUpdate
- CurrencyUpdate
- WaveUpdate
- ServeQuestion
- AnswerResult
- RewardNotification
- FTUEUpdate
- EnemySpawned
- OpenShop

## Step 5: Enable API Services

1. File → Game Settings → Security
2. ✅ Enable Studio Access to API Services
3. ✅ Allow HTTP Requests
4. Click Save

This enables DataStoreV2 to work in Studio test mode.

## Step 6: Test

1. Click **Play** (F5) or **Play Here**
2. Check the Output window for boot sequence:
   ```
   [UnifiedServer] === SKIBIDI ZOMBIE BOOT SEQUENCE ===
   [UnifiedServer] GOAL: MAKE MONEY.
   [CombatSystem] Initialized...
   [QuestionBank] Initialized — 200+ questions loaded
   [SecurityLayer] Initialized...
   [EnemyFactory] Initialized — 5 brainrot types loaded
   [WaveManager] Initialized — infinite wave system ready
   [DataStoreV2] Initialized...
   [RewardBridge] Initialized — dopamine pipeline active
   [FTUEWiring] Initialized...
   [HUDController_v2] Initialized — mobile-first, thumb-friendly
   ```
3. If any module fails to load, check:
   - Correct script type (ModuleScript vs Script vs LocalScript)
   - Correct parent folder
   - No typos in script name

## Step 7: Quick Smoke Test

1. Run the game in Studio
2. FTUE should trigger automatically for new players
3. Wave 1 should start after intermission
4. Enemies should spawn (even without models, the logic runs)
5. Questions should appear in the HUD
6. Answering correctly should deal damage and award coins
7. Check Output for any errors

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Infinite yield` on WaitForChild | Create the Remotes folder manually |
| DataStore errors | Enable API Services in Game Settings |
| No enemies visible | Models are missing — logic still runs, just no visual |
| HUD not showing | Check HUDController_v2 is a LocalScript in StarterPlayerScripts |
| Questions not appearing | Check ServeQuestion RemoteEvent exists |
| "Module not found" | Check module names match exactly (case-sensitive) |

## Architecture Note

The **Two-Server Problem** is resolved. There is only ONE server script: `UnifiedServer.lua`. It boots all modules in sequence. No `ServerGateway` / `ServerBridge` split needed.

```
UnifiedServer (Script)
  └── boots all ModuleScripts from ServerStorage
       ├── CombatSystem
       ├── QuestionBank
       ├── SecurityLayer
       ├── EnemyFactory
       ├── WaveManager
       ├── DataStoreV2
       ├── RewardBridge
       ├── EconomyManager
       ├── FTUEWiring
       └── ... (20+ modules)
```

Every module follows the same pattern:
```lua
local Module = {}
function Module.Init() ... end
return Module
```

---
*Built for Skibidi Zombie: Survive the Brainrots. GOAL: MAKE MONEY.*
