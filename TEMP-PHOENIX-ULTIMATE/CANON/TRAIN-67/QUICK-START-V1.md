# ⚡ QUICK START GUIDE — 15 MINUTE SETUP

Get Train 6-7 demo running in 15 minutes or less.

---

## 🎯 GOAL

Working 5-player demo with:
- ✅ Lobby system (5-player requirement)
- ✅ Day 1-2 train defense
- ✅ Day 2 town stop + fuel collection
- ✅ Baron Skibidi boss fight
- ✅ Day 3 + cliffhanger ending

---

## ⏱️ TIME BREAKDOWN

- 5 min: Create basic workspace
- 5 min: Setup enemy models
- 3 min: Add scripts
- 2 min: Test & verify

---

## 📝 STEP 1: WORKSPACE (5 MINUTES)

### 1.1 Create Train (2 min)

1. Insert → Model → Name: "TrainModel"
2. Insert → Part into TrainModel
   - Name: "Engine"
   - Size: (10, 8, 20)
   - Anchored: TRUE
   - Position: (0, 5, 0)
3. Select TrainModel → Properties → PrimaryPart = Engine
4. Copy Engine twice, rename: ShieldCar, LivingQuarters
5. Position behind engine: (0, 5, -20), (0, 5, -40)

### 1.2 Create Lobby (1 min)

1. Insert → Folder → Name: "Lobby"
2. Insert → SpawnLocation into Lobby
   - Name: "SpawnPoint"
   - Position: (50, 5, 0)
   - Duration: 0

### 1.3 Create Town (1 min)

1. Insert → Part → Name: "TownSpawn"
   - Position: (200, 5, 0)
   - Transparency: 1
   - CanCollide: FALSE
2. Insert → Folder → Name: "FuelBarrels"
3. Insert → Part into FuelBarrels (3 times)
   - Names: FuelBarrel1, FuelBarrel2, FuelBarrel3
   - Positions: (190, 3, 10), (200, 3, 10), (210, 3, 10)
   - Shape: Cylinder (rotated)
   - Add ProximityPrompt to each:
     - ActionText: "Collect Fuel Barrel"
     - HoldDuration: 2
     - MaxActivationDistance: 8

### 1.4 Create Spawn Points (1 min)

1. Insert → Folder → Name: "SpawnPoints"
2. Insert → Part into SpawnPoints (4 times)
   - All: Size (5, 5, 5), Transparency: 1, CanCollide: FALSE
   - Positions:
     - SpawnPoint1: (-50, 5, 30)
     - SpawnPoint2: (50, 5, 30)
     - SpawnPoint3: (-50, 5, -30)
     - SpawnPoint4: (50, 5, -30)

---

## 🧟 STEP 2: ENEMY MODELS (5 MINUTES)

### 2.1 Setup Storage (30 sec)

1. ServerStorage → Insert → Folder → Name: "EnemyModels"

### 2.2 Create Skibidi Shambler (2 min)

**FAST METHOD:**
1. Avatar tab → Rig Builder → R15
2. Drag into ServerStorage > EnemyModels
3. Rename Model: "SkibidiShambler"
4. Select SkibidiShambler → PrimaryPart = HumanoidRootPart
5. Optional: Color purple/magenta

### 2.3 Create Sigma Walker (2 min)

1. Copy SkibidiShambler
2. Paste in EnemyModels
3. Rename: "SigmaWalker"
4. Scale up 1.2x (select all parts, resize)
5. Optional: Color grey/black

### 2.4 Verify (30 sec)

Both models must have:
- ✓ Humanoid
- ✓ HumanoidRootPart (as PrimaryPart)
- ✓ All R15 body parts

---

## 📜 STEP 3: ADD SCRIPTS (3 MINUTES)

### 3.1 Server Script (1.5 min)

1. ServerScriptService → Insert → Script
2. Rename: "GameMain_PHASE1_REVISED"
3. Delete default code
4. Paste GameMain_PHASE1_REVISED.lua code
5. Verify enabled (checkmark visible)

### 3.2 Client Script (1.5 min)

1. StarterPlayer → StarterPlayerScripts → Insert → LocalScript
2. Rename: "HUDController_PHASE1_REVISED"
3. Delete default code
4. Paste HUDController_PHASE1_REVISED.lua code
5. Verify enabled

---

## ✅ STEP 4: TEST (2 MINUTES)

### 4.1 Solo Test (1 min)

1. Press F5 (Play Solo)
2. Check Output (F9) for errors
3. Should see: "🚂 TRAIN 6-7 READY - Waiting for 5 players..."
4. Lobby UI should appear
5. Stop test

### 4.2 Multi-Player Test (1 min)

1. Test tab → Players dropdown → 5 Players
2. Press Play
3. Wait for all 5 players to load
4. Should see countdown: "Game starting in 10..."
5. Verify gameplay starts

---

## 🎮 WHAT TO EXPECT

**Lobby Phase:**
- "WAITING FOR FULL TRAIN... Players: X/5"
- Squad bonus preview visible
- 10-second countdown at 5 players

**Day 1:**
- Train moves forward
- Enemies spawn from SpawnPoints
- 3 waves of 10 enemies each
- Wave complete messages

**Day 2 - Town:**
- Train stops at Rusted Depot
- 5-minute timer starts
- "⛽ FUEL BARRELS: 0/3" counter
- Collect 3 barrels → Boss spawns

**Day 2 - Boss:**
- "👑 BARON SKIBIDI" health bar
- Purple charge telegraphs
- Gold shockwave stomps
- Summons zombie adds
- Defeat → Return to train

**Day 3:**
- Normal train defense (3 waves)
- After wave 3 → Cliffhanger
- "BARON CORN KING AWAKENS"
- "TO BE CONTINUED..."

---

## 🔧 QUICK FIXES

| Problem | Fix |
|---------|-----|
| Train doesn't move | TrainModel → PrimaryPart = Engine |
| Enemies don't spawn | Check ServerStorage/EnemyModels exists, verify Humanoid |
| Can't collect fuel barrels | Each barrel needs ProximityPrompt, MaxActivationDistance = 8 |
| No HUD | HUDController must be LocalScript in StarterPlayerScripts |
| Game won't start | Need EXACTLY 5 players — use Test → Players → 5 |

---

## 📋 MINIMAL REQUIREMENTS CHECKLIST

**Workspace:**
- [ ] TrainModel (with Engine as PrimaryPart)
- [ ] Lobby/SpawnPoint
- [ ] TownSpawn
- [ ] FuelBarrels (3 barrels with ProximityPrompts)
- [ ] SpawnPoints (4 spawn points)

**ServerStorage:**
- [ ] EnemyModels/SkibidiShambler
- [ ] EnemyModels/SigmaWalker

**Scripts:**
- [ ] GameMain in ServerScriptService
- [ ] HUDController in StarterPlayerScripts

**Test:**
- [ ] Solo test: No errors
- [ ] 5-player test: Lobby works

---

## 🎨 OPTIONAL POLISH

**Train Visuals (5 min):**
- Color engine dark with purple accents
- Add neon lights (purple/gold only)
- Create train details (wheels, windows)

**Town Atmosphere (5 min):**
- Add depot building
- Place broken tracks
- Add rust/decay details
- Wild West aesthetic

**Enemy Polish (5 min):**
- Color Skibidi purple/magenta
- Make Sigma grey/intimidating
- Add simple accessories

---

## 🎯 SUCCESS CRITERIA

Demo is successful if:
- ✅ 5 players can start game
- ✅ All 3 days complete
- ✅ Boss fight works
- ✅ Cliffhanger plays
- ✅ Players want to continue
- ✅ No major bugs

---

Built for speed. Designed for impact.
🚂 Get 5 friends. Start defending. Survive the Brain-Rot.
