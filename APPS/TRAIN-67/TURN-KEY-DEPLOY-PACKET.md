# Turn-Key Deployment Packet — Survive a Brainrot

**Status:** 🟡 Awaiting API keys only — all code files present
**Last updated:** 2026-03-25 19:43 ICT

---

## 🔑 API Keys Needed

| Key | Source | Destination | Status |
|-----|--------|-------------|--------|
| Roblox Open Cloud API Key | create.roblox.com → Credentials | Game Settings → Security | ⏳ Michael |
| Place ID | Auto on publish | GameMain config | ⏳ After publish |
| Universe ID | create.roblox.com → Creations | DataStore API | ⏳ After publish |

---

## 📦 Script Placement Map

### ServerScriptService (Server Scripts)

| # | Script Name         | Source File                  | Status   |
|---|---------------------|------------------------------|----------|
| 1 | GameMain            | GameMain_PHASE1_REVISED.lua  | ✅ Ready |
| 2 | MonetizationServer  | MonetizationServer.lua       | ✅ Ready |

### StarterPlayerScripts (Client Scripts)

| # | Script Name    | Source File                       | Status   |
|---|----------------|-----------------------------------|----------|
| 3 | HUDController  | HUDController_PHASE1_REVISED.lua  | ✅ Ready |

### ReplicatedStorage (Module Scripts)

| # | Script Name   | Source File     | Status   |
|---|---------------|-----------------|----------|
| 4 | CodexData     | CodexData.lua   | ✅ Ready |
| 5 | CodexClient   | CodexClient.lua | ✅ Ready |
| 6 | LedgerSchema  | LedgerSchema.lua| ✅ Ready |

---

## 🚀 Deploy Steps

### Step 1: Roblox Account
1. Log in as **PhoenixRisingGames**
2. Go to `create.roblox.com`
3. Create new experience: **Survive a Brainrot**
4. Set max players: **5**
5. Copy Place ID + Universe ID

### Step 2: API Key
1. create.roblox.com → Credentials → API Keys
2. Name: **Phoenix Rising Gaming**
3. Enable: DataStore API, MessagingService API
4. Allowed experience: your Place ID
5. Copy key

### Step 3: Studio Settings
1. Open Roblox Studio → your place
2. Game Settings:
   - ✅ Allow HTTP Requests
   - ✅ Enable Studio Access to API Services

### Step 4: Script Deployment
For each row in the Script Placement Map:
1. Right-click target folder → Insert Object → Script/LocalScript/ModuleScript
2. Rename
3. Paste code from `CANON/TRAIN-67/CODE/`
4. Save

### Step 5: Config
```lua
-- In GameMain, update:
Config.PlaceId = YOUR_PLACE_ID
Config.UniverseId = YOUR_UNIVERSE_ID
```

### Step 6: Assets (Manual in Studio)
- Map: Train environment
- Enemies: Shambler, Crawler, Bloater, Spitter, Brainrot Boss
- Boss: Baron Skibidi (1.5x scale, purple/gold particles)
- Weapons: Bat, Pistol, Shotgun, SMG

### Step 7: Test & Ship
1. F5 → single player test
2. Start Server → 3+ players → lobby gate test
3. File → Publish to Roblox
4. Game Settings → Public

---

## ⚠️ Known Issues

1. MainServer.lua v2.0.0 truncated — use GameMain_PHASE1_REVISED.lua for Phase 1
2. Boss roster mismatch between v2.0.0 and Branding Monolith — Phase 1 = Baron Skibidi
3. `Config.Gameplay.DifficultyScale` referenced but undefined — add to Config
4. `CampaignState` used before declaration — fix in ZombieModule
5. No v2.0.0 HUDController — use Phase 1 Revised HUD

---

## 🔴 Re-Paste Checklist

Michael: paste these 5 files and they get pushed to GitHub instantly:

- [ ] GameMain_PHASE1_REVISED.lua (~865 lines)
- [ ] HUDController_PHASE1_REVISED.lua (~625 lines)
- [ ] CodexData.lua (~80 lines, Timmy wiped)
- [ ] CodexClient.lua (~100 lines, Timmy wiped)
- [ ] MainServer.lua v2.0.0 (full, untruncated)
