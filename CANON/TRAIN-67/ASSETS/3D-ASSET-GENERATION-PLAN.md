# Train 67 — 3D Asset Generation Plan
*Created: 2026-08-11 | Run 27 | Incarnate-27-Phoenix-RISING-GAME-DEVELOPMENT*

This plan operationalizes the 3D-ASSET-MANIFEST.md into an executable pipeline with specific tool configurations, prompt templates, and quality gates.

## Pipeline Overview

```
TripoSR (free local) → Validate → Meshy AI Pro ($16/mo) → Polish → Blender (manual) → Roblox Import
```

## Phase 1: TripoSR Prototyping (Free)

**Objective:** Generate all 72 assets as low-poly prototypes to validate concept and unblock gameplay.

**Setup:**
- Install TripoSR locally via `git clone https://github.com/VAST-AI-Research/TripoSR.git`
- Requirements: Python 3.10+, PyTorch 2.0+, CUDA-capable GPU (minimum 8GB VRAM)
- Run local inference server on `http://localhost:8000`
- Alternative: Use Hugging Face Spaces API if local GPU unavailable (rate-limited)

**Prompt Template for TripoSR:**
```
[asset type], [specific name], [style descriptor], [key visual features], low poly, game asset,roblox style,neutral background
```

**Examples:**
- Enemy: `"zombie, Skibidi Shambler, brainrot meme style, rotting flesh, torn clothes, low poly, game asset, roblox style, neutral background"`
- Weapon: `"melee weapon, Rusty Pipe, metal pipe with rust texture, low poly, game asset, roblox style, neutral background"`
- Environment: `"prop, Rusted Barrel, metal barrel with rust and dents, low poly, game asset, roblox style, neutral background"`

**Output Specifications:**
- Format: GLB/OBJ
- Poly count: 500-1500 triangles (low-poly for Roblox mobile)
- Textures: Single 512x512 diffuse map (no PBR in prototype phase)
- Scale: 1 unit = 1 Roblox stud

**Quality Gates:**
- [ ] Asset recognizable as intended object from 10 meters in-game
- [ ] No inverted normals or non-manifold geometry
- [ ] File size < 500KB per asset
- [ ] Import succeeds in Roblox Studio without errors

**Timeline:** 3-5 days for all 72 assets at 10-15 assets/day with batch processing.

## Phase 2: Meshy AI Pro Production ($16/mo)

**Objective:** Upgrade priority assets to production quality with PBR textures and commercial rights.

**Activation:**
- Subscribe at https://meshy.ai/pricing
- Select Pro plan ($16/mo)
- Generate API key from dashboard
- Store API key in secure credential manager (NOT in repo)

**API Configuration:**
- Endpoint: `https://api.meshy.ai/v1/image-to-3d`
- Rate limit: 100 credits/month (Pro plan)
- 1 credit = 1 text-to-3d generation or 1 image-to-3d generation
- Batch processing: Queue up to 10 assets simultaneously

**Prompt Template for Meshy:**
```
[asset type]: [specific name]. Style: [game style descriptor]. Key features: [list]. Technical: game-ready, PBR textures, 2000-5000 polygons, Roblox-compatible scale, neutral background, [camera angle if needed].
```

**Priority 1 Assets (Produce First):**
1. Skibidi Zombie (core enemy)
2. Ohio Anomaly (core enemy)
3. Rizz Merchant (core enemy)
4. Brainrot Mutant (core enemy)
5. Sigma Boss (core enemy)
6. Rusty Pipe (starter weapon)
7. Wooden Bat (starter weapon)
8. Machete (uncommon weapon)
9. Fire Axe (uncommon weapon)
10. Engine Car (train environment)

**Output Specifications:**
- Format: GLB/FBX
- Poly count: 2000-5000 triangles (production quality)
- Textures: PBR (albedo, normal, roughness, metallic) 1024x1024
- Scale: 1 unit = 1 Roblox stud
- Rigging: Auto-rigged for enemies, static for props

**Quality Gates:**
- [ ] Asset passes visual review against concept art/game bible
- [ ] PBR textures render correctly in Roblox Studio
- [ ] Animation-ready (enemies have skeletal rig)
- [ ] File size < 2MB per asset
- [ ] Commercial rights confirmed (Meshy Pro includes full commercial license)

**Timeline:** 2-3 weeks for all Priority 1-2 assets (20-40 assets).

## Phase 3: 3D AI Studio Backup ($19/mo)

**Trigger:** Activate if Meshy AI Pro insufficient for volume or specific asset types fail.

**Setup:**
- Subscribe at https://3d-ai-studio.com/pricing
- Select Basic plan ($19/mo, 1000 credits)
- Integrate via web UI or API

**Use Cases:**
- Complex organic models (mutants, bosses) where Meshy output inconsistent
- High-detail props where PBR quality critical
- Bulk generation when Meshy queue backed up

## Phase 4: Manual Blender Polish (Free)

**Objective:** Final polish, rigging, animation prep for animated assets.

**Workflow:**
1. Import GLB/FBX from Meshy/3D AI Studio into Blender
2. Clean up geometry (remove doubles, fix normals, recalculate UVs)
3. Retopology for animated meshes (enemies, weapons with abilities)
4. Rigging: Auto-rig humanoid enemies, manual rig for weapons
5. Animation: Idle, walk, attack, death, hit-react for enemies
6. Export: GLB with animations embedded

**Blender Add-ons Required:**
- `io_scene_gltf2` (built-in) for GLB export
- `Rigify` for auto-rigging humanoids
- `Auto-Rig Pro` (optional, $30) for complex rigs

## Batch Execution Plan

### Batch-001: Core Prototypes (20 assets) — TripoSR
**Objective:** Unblock gameplay testing with low-poly placeholders.

**Assets:**
- ENEM-001: Skibidi Zombie
- ENEM-002: Ohio Anomaly
- ENEM-003: Rizz Merchant
- ENEM-004: Brainrot Mutant
- ENEM-005: Sigma Boss
- WPN-001: Rusty Pipe
- WPN-002: Wooden Bat
- WPN-003: Machete
- WPN-004: Fire Axe
- WPN-005: Katana
- ENV-001: Engine Car
- ENV-002: Shield Car
- ENV-003: Living Quarters
- UI-001: Shop Terminal
- UI-002: Crate Opener
- UI-003: HUD Coin Counter
- UI-004: HUD Wave Timer
- UI-005: HUD Combo Counter
- COS-001: Basic Mouse Pet
- COS-002: Starter Cub Pet

**Execution:**
1. Start TripoSR local server
2. Generate prompts from asset registry
3. Batch process 5 assets at a time
4. Validate output quality
5. Import into Roblox Studio test place
6. Iterate on failed prompts

### Batch-002: Extended Prototypes (20 assets) — TripoSR
**Objective:** Complete enemy roster and expand weapon selection.

### Batch-003: Production Assets (32 assets) — Meshy AI Pro + 3D AI Studio
**Objective:** Final production-quality assets for launch.

## Asset Naming Convention

```
[CATEGORY]-[ID]_[NAME]_[VARIANT].glb

Examples:
ENEM-001_SkibidiZombie_Core.glb
ENEM-008_SkibidiShamblerKing_Boss.glb
WPN-005_Katana_Rare.glb
ENV-001_EngineCar_Train.glb
UI-003_HUDCoinCounter_HUD.glb
COS-001_BasicMousePet_Common.glb
```

## Directory Structure

```
CANON/TRAIN-67/ASSETS/
├── asset-registry.json
├── 3D-ASSET-GENERATION-PLAN.md
├── batch-001-first-20-assets.md
├── batch-002-next-20-assets.md
├── batch-003-final-32-assets.md
├── prototypes/
│   ├── ENEM-001_SkibidiZombie_Core.glb
│   └── ...
├── production/
│   ├── ENEM-001_SkibidiZombie_Core.glb
│   └── ...
├── prompts/
│   ├── enemy-prompts.txt
│   ├── weapon-prompts.txt
│   ├── environment-prompts.txt
│   └── cosmetic-prompts.txt
└── README.md
```

## Roblox Import Standards

- Format: GLB preferred, FBX accepted
- Scale: 1 unit = 1 Roblox stud
- Up axis: Y-up
- Textures: PNG, 512x512 or 1024x1024, sRGB
- Materials: `MeshPart` with `MeshId`, textures in `SurfaceAppearance`
- Rigging: Humanoid for characters, `Motor6D` joints for weapons
- LOD: Single LOD for mobile (no LOD chains needed at launch)

## Cost Estimate

| Tool | Cost | Duration | Assets |
|------|------|----------|--------|
| TripoSR (local) | $0 | 1 week | 72 prototypes |
| Meshy AI Pro | $16/mo | 1-2 months | 40 production assets |
| 3D AI Studio | $19/mo | 1 month (backup) | 20 assets if needed |
| Blender | $0 | Ongoing | Polish/rigging |
| **Total** | **$35-54/mo** | **2-3 months** | **72 assets** |
