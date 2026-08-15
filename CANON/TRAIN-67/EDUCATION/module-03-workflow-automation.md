# Module 3: Workflow Automation and Batch Processing
*Created: 2026-08-11 | Run 27 | Incarnate-27-Phoenix-RISING-GAME-DEVELOPMENT*

**Duration:** 2 weeks (Weeks 5-6)
**Tools:** 3D AI Studio + custom Python scripts
**Prerequisites:** Module 2 complete (Meshy AI Pro prompt engineering)

## Lesson 3.1: 3D AI Studio Integration

**Duration:** 30 minutes

### Objectives
- Set up 3D AI Studio as backup tool
- Understand when to use 3D AI Studio vs Meshy AI
- Execute first generation with 3D AI Studio

### Setup Instructions
1. Go to https://3d-ai-studio.com/pricing
2. Select Basic plan ($19/mo, 1000 credits)
3. Complete payment
4. Access web UI or API

### When to Use 3D AI Studio
- Meshy AI queue backed up
- Complex organic models fail in Meshy
- High-detail props where PBR quality critical
- Bulk generation when credits available

### Exercise
Generate 1 asset in 3D AI Studio and compare output with Meshy AI.

### Assessment
- [ ] 3D AI Studio account active
- [ ] Successfully generated first asset
- [ ] Can compare output quality between tools

---

## Lesson 3.2: Batch Processing Strategies

**Duration:** 45 minutes

### Objectives
- Design batch processing pipeline
- Manage multiple tools and queues
- Optimize for throughput

### Batch Processing Pipeline
```
1. Prepare prompt list (from asset registry)
2. Submit to TripoSR (free, unlimited)
3. Validate prototypes
4. Submit Priority 1 assets to Meshy AI Pro
5. Submit Priority 2 assets to 3D AI Studio
6. Download and validate outputs
7. Re-iterate on failed generations
8. Polish in Blender
9. Export final GLBs
```

### Queue Management
- TripoSR: Unlimited, local, batch 5 at a time
- Meshy AI Pro: 100 credits/month, batch 10 at a time
- 3D AI Studio: 1000 credits/month, batch 5 at a time

### Exercise
Design batch processing schedule for 72 assets across 3 tools.

### Assessment
- [ ] Can design batch processing pipeline
- [ ] Can manage multiple tool queues
- [ ] Can estimate throughput and timeline

---

## Lesson 3.3: Automation with Python Scripts

**Duration:** 60 minutes

### Objectives
- Write Python scripts to automate generation
- Use Meshy AI and 3D AI Studio APIs
- Implement retry logic and error handling

### Automation Script Structure
```python
import requests
import time
import json

class AssetGenerator:
    def __init__(self, meshy_api_key, studio_api_key):
        self.meshy_key = meshy_api_key
        self.studio_key = studio_api_key
        self.results = []

    def generate_meshy(self, prompt, asset_id):
        """Generate asset via Meshy AI API"""
        response = requests.post(
            "https://api.meshy.ai/v1/text-to-3d",
            headers={"Authorization": f"Bearer {self.meshy_key}"},
            json={
                "prompt": prompt,
                "art_style": "realistic",
                "topology": "quad",
                "target_polycount": 3000,
                "texture_size": 1024
            }
        )
        return response.json()

    def generate_studio(self, prompt, asset_id):
        """Generate asset via 3D AI Studio API"""
        # Implementation depends on studio API
        pass

    def batch_generate(self, asset_list):
        """Generate multiple assets with retry logic"""
        for asset in asset_list:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    result = self.generate_meshy(asset["prompt"], asset["id"])
                    self.results.append(result)
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        print(f"Failed: {asset['id']} — {e}")
                    time.sleep(5)

    def export_manifest(self):
        """Export generation manifest"""
        with open("generation-manifest.json", "w") as f:
            json.dump(self.results, f, indent=2)
```

### Exercise
Write automation script for generating 5 assets from batch-001.

### Assessment
- [ ] Can write Python script for Meshy AI API
- [ ] Can implement retry logic
- [ ] Can export generation manifest

---

## Lesson 3.4: Asset Pipeline Management

**Duration:** 45 minutes

### Objectives
- Manage asset pipeline from generation to game import
- Track asset status and versions
- Coordinate with game development workflow

### Pipeline Stages
```
Concept → Prompt → Generation → Validation → Polish → Export → Import → Game
```

### Asset Status Tracking
```json
{
  "asset_id": "ENEM-001",
  "name": "Skibidi Zombie",
  "status": "generated",
  "tool": "Meshy AI Pro",
  "poly_count": 2450,
  "file_size": "1.2MB",
  "textures": ["albedo", "normal", "roughness"],
  "validation": "passed",
  "roblox_import": "success",
  "version": "1.0.0"
}
```

### Exercise
Set up asset pipeline tracking for 10 assets.

### Assessment
- [ ] Can define pipeline stages
- [ ] Can track asset status
- [ ] Can coordinate with game dev workflow

---

## Lesson 3.5: Integration with Game Development Workflow

**Duration:** 45 minutes

### Objectives
- Understand how 3D assets integrate into Train-67
- Coordinate with code modules (EnemySpawner, WeaponManager, etc.)
- Deploy assets to Roblox via Rojo CI/CD

### Game Integration Points
- **Enemies:** `CANON/TRAIN-67/CODE/EnemySpawner.lua` — loads enemy models
- **Weapons:** `CANON/TRAIN-67/CODE/WeaponData.lua` — references weapon models
- **Environment:** `CANON/TRAIN-67/CODE/WorldBoss.lua` — loads environment props
- **UI:** `CANON/TRAIN-67/CODE/UnifiedClient.client.lua` — renders HUD assets

### Rojo CI/CD Integration
```yaml
# .github/workflows/rojo-build.yml
- name: Build with Rojo
  run: rojo build -o Train-67.rbxmx
- name: Deploy to Roblox
  run: rojo deploy -j ${{ secrets.ROBLOX_COOKIE }} -p 12345678
```

### Exercise
Map 5 assets to their corresponding code modules in Train-67.

### Assessment
- [ ] Can map assets to game code modules
- [ ] Understands Rojo CI/CD pipeline
- [ ] Can explain asset deployment workflow

---

## Lesson 3.6: Portfolio Development and Next Steps

**Duration:** 30 minutes

### Objectives
- Document completed work for portfolio
- Plan next steps in 3D modeling journey
- Identify career/learning paths

### Portfolio Deliverables
- GitHub repository with generated assets
- Documentation of prompts and parameters
- Before/after comparisons (prompt → output)
- Roblox Studio test place showcasing assets
- Process blog or video walkthrough

### Next Steps
1. Continue generating remaining 52 assets for Train-67
2. Explore advanced techniques (rigging, animation)
3. Contribute to other game projects
4. Build personal 3D asset portfolio
5. Consider monetization (asset store, freelance)

### Exercise
Create portfolio page showcasing 3 best assets from the course.

### Assessment
- [ ] Can document work for portfolio
- [ ] Can identify next learning steps
- [ ] Has actionable plan for continued growth

---

## Module 3 Assessment: Execute Full 20-Asset Pipeline

**Task:** Execute the complete asset generation pipeline for 20 assets and deliver to game.

**Required Assets:** batch-001 (20 core prototypes) or batch-002 (20 extended prototypes)

**Criteria:**
- [ ] All 20 assets generated via automated scripts
- [ ] Generation manifest exported
- [ ] All assets validated against quality checklist
- [ ] All assets imported into Roblox Studio test place
- [ ] All assets mapped to game code modules
- [ ] Pipeline documentation updated
- [ ] Portfolio showcase created
