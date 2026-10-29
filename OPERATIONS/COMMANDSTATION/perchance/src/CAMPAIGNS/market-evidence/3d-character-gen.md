# 3D character generation — options + best offer (2026-10-29)

Need: Train 6-7 enemies/boss (wave survival, stylized horror). Every number measured
today or marked UNCONFIRMED. Raw: `scratch/market/raw/3d-*.html`, `avatar-setup.md`,
`modeling-specs.md`, `search-avatar-rig.json`.

## Roblox hard constraints (first-party docs, fetched today)
- **20,000 triangles per mesh**, watertight, quads, volume required.
- Rigged imports: bones frozen, root at origin, **≤4 bone influences per vertex**.
- **One animation track per FBX export** (each anim = separate export).
- PBR textures supported. **Avatar Setup (free, in-Studio)** auto-adds R15 rig +
  skinning + facial + cages + attachments to custom meshes — but it builds
  HUMANOID R15 rigs; Deer/Ram/Owl-style creatures need custom Blender rigs.

## Options (price + license + Roblox fit)
| Option | Price (measured) | License | Roblox fit |
|--------|-----------------|---------|------------|
| **Meshy** (text/image→3D) | **Free $0** (100 credits/mo, CC BY, NO model downloads); **Starter ~$5.99/mo** ($ price seen on pricing page; 20 downloads included); **Pro $20/mo** (1,000 credits); **Premium $40/mo** (3,000); **Ultra $100/mo** (8,000); **50% off first month**; credits reset monthly | Paid = full ownership + unlimited downloads; Free = CC BY 4.0 | Exports .fbx/.obj/.glb — direct FBX path; outputs need decimation/cleanup |
| **Tripo** | ~$20/mo annual ($240/yr) = 3,000 credits ≈ 200 models; per-model from $0.09 (Free) / $0.16; free tier exists | Per plan (see site) | Same FBX path as Meshy |
| **Sloyd** (procedural+AI stylized) | Free to start; Plus/Pro = unlimited AI gen + commercial license + plugins; exact prices UNCONFIRMED | Commercial on paid | Stylized output suits low-poly horror; Blender plugin |
| **Synty store** (hand-made packs) | Apocalypse Zombies **$60** (sale, reg $199.99); Skeletons $199.99; Vikings $199.99; **Spooky Bundle $315.99** (reg $1,579.92, 80% off, 8 packs incl. zombies + horror maps); tags confirm FBX | Game-ready low-poly, modular (40+ parts, 120+ zombie parts) |
| **Quaternius** | **$0 CONFIRMED** | **CC0 confirmed** | **Zombie Apocalypse Kit: 4 playable chars × 20 anims each, 4 enemies, 2 dogs, env + vehicles, FBX/OBJ/glTF/Blend.** Plus Bestiary Dungeon Monsters, Universal Base Characters, Universal Animation Library |
| **Kenney** | $0 (site live) | UNCONFIRMED statically | Catalog JS-driven |
| **Mixamo** (animations) | Site live (Adobe); free status UNCONFIRMED from static fetch (login-walled app) | — | Standard complement for rigged humanoids |
| **Ready Player Me** | pricing fetch FAILED (refusal) | — | Humanoid avatars only — marginal for creatures |

## Meshy map (measured from help center + API docs, 2026-10-29)
Plans: Free $0 / Pro $20 / Premium $40 / Ultra $100 (+ Studio $70/seat, Enterprise custom).
50% off first month (Pro/Premium/Ultra, first-time subscribers). Credits reset monthly,
no rollover; failed tasks refunded.
- **Free cannot download models** — generation preview only. Minimum viable paid:
  Starter (~$5.99, 20 downloads) or Pro (unlimited downloads, API access, 10 concurrent
  tasks, 60% faster, 600+ animation presets, multi-view Image-to-3D).
- Webapp task costs (Meshy 7): Image/Text-to-3D model stage 25 + texture 10 (2K/4K) =
  **~35 credits per textured model** → Pro 1,000/mo ≈ **28 models/mo (~$0.71/model,
  ~$0.36 first month)**. Smart Topology (low-poly!) model stage only 5–15 + texture.
  Retexture 10, Rigging 5/request, animation 3/action, Text-to-Motion 3–10.
- Free top-ups (stack on the 100/mo): Discord connect 100 (one-time), featured community
  model 50 each, X shares per-click, follow creators; Contributor Program = free Pro/mo.
- API per-request (meshy-7.1): preview mesh 20 / +texture 30 / 8K 35 / Ultra +5;
  refine 10–15; convert/resize 1. lowpoly model_type retires 2026-10-30 — use
  Smart Topology / meshy-6-lite path for game-ready low-poly counts.

## Best offer (verdict — updated with confirmed prices)
1. **$0 lane is CONCRETE, not theoretical:** Quaternius Zombie Apocalypse Kit (CC0, FBX,
   4 enemies + 4 chars × 20 anims + 2 dogs) covers wave-zombie enemies and animation
   source material TODAY. Pair with Tripo free tier for the boss + Deer/Ram/Owl
   analogues (Meshy Free can't download — preview only), Blender cleanup to <20k tris.
   Cash cost $0.
2. **Best confirmed paid value:** Synty **Apocalypse Zombies $60 on sale** (reg $200) —
   120+ zombie parts, modular, FBX, horror-lane exact. Or the **Spooky Bundle $315.99**
   (reg $1,579.92 — 80% off, limited time, 8 packs) if maps + HUD + survivors are wanted
   too. One purchase, no subscription, no cleanup labor.
3. **AI-gen subscriptions only if the roster outgrows packs:** Meshy first-month 50% off
   / Tripo $20/mo annual (~200 models). Cancel after generation month.
4. **Do not bake meme likenesses into purchased/generated IP** (see slang-freshness.md):
   ownable archetypes, reskin per season.

## Open (needs browser, not fetch)
Exact Sloyd Plus/Pro prices, Mixamo current free terms, RPM pricing,
Kenney creature-pack availability. (Meshy, Synty + Quaternius CLOSED.)
