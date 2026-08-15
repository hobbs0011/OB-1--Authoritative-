# Batch-001: First 20 Assets — Core Prototypes
*Created: 2026-08-11 | Run 27 | Incarnate-27-Phoenix-RISING-GAME-DEVELOPMENT*

**Objective:** Generate the first 20 assets as low-poly prototypes using TripoSR (free local) to unblock gameplay testing.

**Tool:** TripoSR local inference
**Output:** GLB files, 500-1500 triangles each
**Timeline:** 3-5 days
**Priority:** P1 — unblocks all core gameplay loops

## Asset List

| # | ID | Name | Category | Prompt for TripoSR | Notes |
|---|-----|------|----------|-------------------|-------|
| 1 | ENEM-001 | Skibidi Zombie | Enemy | `"zombie, Skibidi Shambler, brainrot meme style, rotting flesh, torn clothes, low poly, game asset, roblox style, neutral background"` | Core enemy, spawns Day 1 |
| 2 | ENEM-002 | Ohio Anomaly | Enemy | `"zombie, Ohio Anomaly, fast erratic movement, tattered clothes, glowing eyes, low poly, game asset, roblox style, neutral background"` | Fast enemy, Day 6+ |
| 3 | ENEM-003 | Rizz Merchant | Enemy | `"zombie, Rizz Merchant, healer type, glowing aura, formal tattered suit, low poly, game asset, roblox style, neutral background"` | Healer enemy, Day 16+ |
| 4 | ENEM-004 | Brainrot Mutant | Enemy | `"zombie, Brainrot Mutant, large hulking figure, exposed muscles, mutated limbs, low poly, game asset, roblox style, neutral background"` | Heavy enemy, splits on death |
| 5 | ENEM-005 | Sigma Boss | Enemy | `"boss, Sigma Boss, massive imposing figure, glowing red eyes, armored, low poly, game asset, roblox style, neutral background"` | Boss enemy, boss waves |
| 6 | WPN-001 | Rusty Pipe | Melee | `"melee weapon, Rusty Pipe, metal pipe with rust texture, simple design, low poly, game asset, roblox style, neutral background"` | Starter weapon |
| 7 | WPN-002 | Wooden Bat | Melee | `"melee weapon, Wooden Bat, baseball bat with nails, weathered wood, low poly, game asset, roblox style, neutral background"` | Starter weapon |
| 8 | WPN-003 | Machete | Melee | `"melee weapon, Machete, large curved blade, blood stains, low poly, game asset, roblox style, neutral background"` | Uncommon weapon |
| 9 | WPN-004 | Fire Axe | Melee | `"melee weapon, Fire Axe, red axe head with fire damage, wooden handle, low poly, game asset, roblox style, neutral background"` | Uncommon weapon |
| 10 | WPN-005 | Katana | Melee | `"melee weapon, Katana, Japanese sword, curved blade, glowing edge, low poly, game asset, roblox style, neutral background"` | Rare weapon |
| 11 | ENV-001 | Engine Car | Environment | `"train car, Engine Car, front locomotive, steam vents, metal plates, control panel, low poly, game asset, roblox style, neutral background"` | Front train car |
| 12 | ENV-002 | Shield Car | Environment | `"train car, Shield Car, middle car, defensive turrets, metal plating, low poly, game asset, roblox style, neutral background"` | Middle train car |
| 13 | ENV-003 | Living Quarters | Environment | `"train car, Living Quarters, back car, windows, bunk beds, shop terminal, low poly, game asset, roblox style, neutral background"` | Back train car |
| 14 | UI-001 | Shop Terminal | UI | `"prop, Shop Terminal, computer terminal, screen, counter, low poly, game asset, roblox style, neutral background"` | World-space UI |
| 15 | UI-002 | Crate Opener | UI | `"prop, Crate Opener, wooden crate with lock, opening mechanism, low poly, game asset, roblox style, neutral background"` | World-space UI |
| 16 | UI-003 | HUD Coin Counter | UI | `"ui element, HUD Coin Counter, gold coin icon, number display, low poly, game asset, roblox style, neutral background"` | HUD element |
| 17 | UI-004 | HUD Wave Timer | UI | `"ui element, HUD Wave Timer, clock icon, countdown numbers, low poly, game asset, roblox style, neutral background"` | HUD element |
| 18 | UI-005 | HUD Combo Counter | UI | `"ui element, HUD Combo Counter, combo text, multiplier display, low poly, game asset, roblox style, neutral background"` | HUD element |
| 19 | COS-001 | Basic Mouse Pet | Cosmetic | `"pet, Basic Mouse, small gray mouse, cute, low poly, game asset, roblox style, neutral background"` | Common pet |
| 20 | COS-002 | Starter Cub Pet | Cosmetic | `"pet, Starter Cub, small bear cub, brown fur, cute, low poly, game asset, roblox style, neutral background"` | Uncommon pet |

## Execution Steps

1. **Prepare environment:**
   ```bash
   git clone https://github.com/VAST-AI-Research/TripoSR.git
   cd TripoSR
   pip install -r requirements.txt
   python app.py
   ```

2. **Generate prompts:** Use prompts above, one per asset.

3. **Batch process:** Submit 5 assets at a time to TripoSR API.

4. **Validate outputs:**
   - Check GLB file integrity
   - Verify poly count < 1500 triangles
   - Verify file size < 500KB
   - Import test into Roblox Studio

5. **Iterate:** Refine prompts for failed generations.

6. **Commit:** Store final GLBs in `CANON/TRAIN-67/ASSETS/prototypes/`.

## Success Criteria

- [ ] All 20 assets generated as GLB files
- [ ] All assets pass Roblox Studio import test
- [ ] All assets < 1500 triangles, < 500KB
- [ ] All assets visually recognizable from game bible descriptions
- [ ] Core gameplay loop testable with placeholder assets
