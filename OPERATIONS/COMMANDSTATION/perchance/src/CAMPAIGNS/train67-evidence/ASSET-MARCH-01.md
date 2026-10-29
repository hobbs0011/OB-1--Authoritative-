# ASSET-MARCH-01 — $0 enemy roster claim + integration order (2026-10-29)

Status: ORDER WRITTEN, claim is a 5-minute user-side action (itch requires an email for
the $0 "purchase" — no account, no payment; I will not invent an email, so the click
is yours). Everything after the claim is specified below.

## Step 1 — claim (Michael, ~5 min, $0)
1. https://quaternius.itch.io/animated-easy-enemies → Download Now → price $0.00 →
   email → Easy Animated Enemy Pack zip (2.9 MB).
2. quaternius.com → Zombie Apocalypse Kit → Download (same $0 flow): 4 playable chars
   × 20 anims, 4 enemies, 2 dogs, env + vehicles, FBX/OBJ/glTF/Blend, CC0.
3. Same flow for Bestiary Dungeon Monsters + Universal Base Characters + Universal
   Animation Library (all CC0, all itch, all $0).

## Step 2 — Blender pass (per mesh)
- Decimate to **<20,000 tris** (hard Roblox cap), watertight, quads, volume.
- Bones frozen (scale 1,1,1 / rot 0,0,0), root at origin, **≤4 influences/vertex**.
- One animation per FBX export (idle / walk / attack as separate files).
- Enemy mapping: zombie-kit enemies → waves 1–3 grunts; Bestiary monsters → mid-tier;
  Easy-Enemies pack → swarm filler; dogs → fast chasers. Boss stays bespoke
  (Meshy Pro one-month or Synty Zombies $60 — decision below).

## Step 3 — Studio import
- Importer (MeshPart) → Rig check → Animate script hooks to EnemyData states.
  Humanoid NPCs can alternatively ride Avatar Setup auto-rig; creatures use the
  Blender custom rigs from Step 2.
- Verify: boot test, Play Solo, 5-client shadow sim per the build campaign's
  standing defect list (boot/tree mismatch STILL OPEN — Incarnate-28 rides onward).

## Decisions for the sovereign (not executed)
- **Boss source:** Synty Apocalypse Zombies $60 sale vs Meshy Pro first-month $10.
  Recommendation: Synty (modular + rigged now, no cleanup labor).
- **Rename "Baron Skibidi"** → ownable archetype (slang at 7% of peak; filed in
  market-evidence/slang-freshness.md). Needs your call before thumbnails are made.
