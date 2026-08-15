# Module 1: AI 3D Modeling Fundamentals
*Created: 2026-08-11 | Run 27 | Incarnate-27-Phoenix-RISING-GAME-DEVELOPMENT*

**Duration:** 2 weeks (Weeks 1-2)
**Tool:** TripoSR (local, free)
**Prerequisites:** Basic computer literacy, no prior 3D modeling experience

## Lesson 1.1: What is 3D Modeling? Why AI-Assisted?

**Duration:** 30 minutes

### Objectives
- Understand what 3D modeling is and where it's used
- Learn why AI-assisted 3D modeling is transformative
- Identify use cases for AI 3D in game development

### Content
- Traditional 3D modeling: manual vertex/edge/face manipulation (hours per asset)
- AI-assisted 3D: text-to-3D generation (minutes per asset)
- Current state of AI 3D tools (TripoSR, Meshy AI, 3D AI Studio)
- Why Train-67 needs 60-80 assets and can't wait for manual modeling

### Exercise
Write down 3 objects you'd want to create in 3D. Describe them in 1-2 sentences each.

### Assessment
- [ ] Can explain difference between traditional and AI-assisted 3D modeling
- [ ] Can identify 3 use cases for AI 3D in game dev

---

## Lesson 1.2: TripoSR Setup and First Generation

**Duration:** 45 minutes

### Objectives
- Install and configure TripoSR locally
- Generate first 3D asset from text prompt
- Understand the generation pipeline

### Setup Instructions
```bash
# 1. Clone TripoSR repository
git clone https://github.com/VAST-AI-Research/TripoSR.git
cd TripoSR

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download model weights (one-time)
python download_weights.py

# 5. Start server
python app.py
# Server runs on http://localhost:8000
```

### First Generation Exercise
Generate a simple asset:
```
Prompt: "wooden crate, brown wood texture, simple design, low poly, game asset, roblox style"
```

### Assessment
- [ ] TripoSR server running locally
- [ ] Successfully generated first GLB file
- [ ] Can open GLB in Roblox Studio or online viewer

---

## Lesson 1.3: Understanding 3D Formats

**Duration:** 30 minutes

### Objectives
- Understand GLB, OBJ, FBX formats
- Know when to use each format
- Understand poly count and texture basics

### Content
- **GLB:** Binary glTF, best for web/Roblox, includes textures
- **OBJ:** Legacy format, geometry only, widely supported
- **FBX:** Autodesk format, supports animation, complex scenes
- **Poly count:** Triangles = performance cost. Target < 5000 for Roblox mobile
- **Textures:** Diffuse (color), Normal (surface detail), Roughness/Metalness (PBR)

### Exercise
Inspect the GLB file from Lesson 1.2 using online viewer. Count triangles, check texture sizes.

### Assessment
- [ ] Can explain difference between GLB, OBJ, FBX
- [ ] Can identify poly count and texture resolution of a GLB file
- [ ] Knows target poly count for Roblox mobile assets

---

## Lesson 1.4: Prompt Engineering Basics for 3D

**Duration:** 45 minutes

### Objectives
- Write effective prompts for TripoSR
- Understand prompt structure for 3D generation
- Iterate on prompts to improve output quality

### Prompt Structure
```
[object type], [specific name], [style descriptor], [key visual features], [technical specs]
```

### Good vs Bad Prompts
- **Bad:** `"zombie"`
- **Good:** `"zombie, Skibidi Shambler, brainrot meme style, rotting flesh, torn clothes, low poly, game asset, roblox style, neutral background"`

### Exercise
Improve these prompts:
1. `"sword"` → ?
2. `"tree"` → ?
3. `"car"` → ?

### Assessment
- [ ] Can write structured prompts following the template
- [ ] Can identify weaknesses in bad prompts
- [ ] Generated 3 improved prompts for Train-67 assets

---

## Lesson 1.5: Validating and Iterating on Generated Assets

**Duration:** 30 minutes

### Objectives
- Evaluate generated 3D assets for quality
- Identify common generation failures
- Iterate on prompts to fix issues

### Common Issues
- **Inverted normals:** Asset appears dark/wrong shading → add `"correct normals"` to prompt
- **Non-manifold geometry:** Asset has holes → add `"watertight mesh"` to prompt
- **Wrong proportions:** Asset too thin/fat → add `"correct proportions"` to prompt
- **Missing features:** Asset lacks expected details → add `"detailed [feature]"` to prompt

### Iteration Exercise
Take a failed generation from Lesson 1.4. Identify the issue and write an improved prompt.

### Assessment
- [ ] Can identify 3 common generation failures
- [ ] Can write improved prompts to fix failures
- [ ] Successfully iterated on at least 2 assets

---

## Lesson 1.6: Importing Assets into Roblox Studio

**Duration:** 45 minutes

### Objectives
- Import GLB files into Roblox Studio
- Set up materials and textures correctly
- Test asset in-game

### Import Steps
1. Open Roblox Studio
2. Open Test Place (or new Baseplate)
3. Go to `Home` → `Import 3D`
4. Select GLB file
5. Set material properties (Plastic, Metal, etc.)
6. Adjust scale if needed
7. Test in Play mode

### Exercise
Import 3 assets from Lessons 1.2-1.4 into Roblox Studio. Verify they render correctly.

### Assessment
- [ ] Successfully imported GLB into Roblox Studio
- [ ] Asset renders with correct materials
- [ ] Asset is properly scaled (1 unit = 1 stud)
- [ ] No import errors in output console

---

## Module 1 Assessment: Generate 5 Prototype Assets

**Task:** Generate 5 assets for Train-67 using TripoSR and import into Roblox Studio.

**Required Assets:**
1. Skibidi Zombie (enemy)
2. Rusty Pipe (weapon)
3. Engine Car (environment)
4. Shop Terminal (UI)
5. Basic Mouse Pet (cosmetic)

**Criteria:**
- [ ] All 5 assets generated as GLB files
- [ ] All assets < 1500 triangles
- [ ] All assets < 500KB file size
- [ ] All assets imported successfully into Roblox Studio
- [ ] All assets visually recognizable from descriptions
- [ ] Prompts documented for each asset
