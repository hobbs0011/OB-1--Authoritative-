# Stage 7 — Mobile-First Controls Audit
## Survive a Brainrot — Touch Optimization for 70% Mobile Playerbase

**Pipeline:** 20-Stage Train 6-7 Launch Pipeline
**Priority:** 🔴 TIER 1 LAUNCH BLOCKER
**Date:** 2026-03-26
**Status:** SPEC COMPLETE

---

## 🔴 WHY THIS MATTERS

**70% of Roblox players are on mobile.** Desktop-first design = death.

Current code has ZERO mobile optimization:
- No touch input handling
- HUD designed for desktop resolution
- Button sizes too small for thumbs
- No auto-aim/aim assist
- No mobile-specific UI layout

---

## 📱 CONTROL SCHEME

### Movement
| Control | Mobile | Desktop | Console |
|---------|--------|---------|---------|
| Move | Virtual joystick (left thumb) | WASD | Left stick |
| Camera | Touch drag (right thumb) | Mouse | Right stick |
| Jump | Jump button (right side) | Space | A/X |
| Sprint | Double-tap joystick or hold | Shift | L3 |

### Combat
| Control | Mobile | Desktop | Console |
|---------|--------|---------|---------|
| Attack | Large tap button (right thumb) | Left click | RT |
| Aim | Auto-aim + slight drag adjust | Mouse aim | Aim assist |
| Special | Swipe up on attack button | Q | LB |
| Switch weapon | Swipe left/right | 1-5 keys | D-pad |

### UI Interactions
| Control | Mobile | Desktop |
|---------|--------|---------|
| Open inventory | Backpack icon (top-right) | B or Tab |
| Trade | Long-press player | Right-click player |
| English Power-Up | Large centered popup, tap answer | Click answer |
| Daily reward | Full-screen overlay, tap to claim | Same |
| Chat | Mini chat, expandable | Full chat |

---

## 🎯 AUTO-AIM SYSTEM

### Why Auto-Aim is Required
Touch controls can't match mouse precision. Without aim assist, mobile players can't hit enemies = frustration = leave.

### Design
```
Auto-Aim Cone: 30 degrees from center of screen
Lock-on radius: 15 studs
Snap strength: 70% (strong but not 100%)
Priority: nearest enemy in cone
Visual: subtle Gold reticle highlight on target
Toggle: Settings > Combat > Aim Assist (ON by default)
```

### Balance
- Mobile: 30-degree cone, 70% snap
- Console: 20-degree cone, 50% snap  
- Desktop: No aim assist (mouse is precise enough)
- Competitive modes (future): reduce to 15-degree, 30% snap

---

## 🔲 BUTTON SIZING

### Minimum Touch Targets (Apple/Google guidelines)
- **Minimum**: 44x44 points (88x88 px on 2x devices)
- **Recommended**: 48x48 points for action buttons
- **Attack button**: 72x72 points (oversized for combat)

### Layout Zones
```
┌──────────────────────────────────────┐
│ [HP]  [Day]  [Coins/Gems]  [Menu] │  <- Top bar (info only, no buttons)
│                                      │
│           GAME VIEW                   │  <- Clean center (no clutter)
│                                      │
│ [JOY]              [ATK] [JMP]      │  <- Bottom: joystick left, actions right
│ [STICK]             [SPL] [INV]      │
└──────────────────────────────────────┘
```

### Notch/Safe Area Handling
- Detect `GuiService:GetGuiInset()` for notch offset
- All UI elements inside safe area
- Test on: iPhone (notch), iPad (no notch), Android (various)

---

## 🎮 HUD CONTROLLER CHANGES REQUIRED

### Current HUDController_PHASE1_REVISED.lua Issues
1. **Fixed pixel positions** → must convert to Scale (0-1) values
2. **Font sizes too small on mobile** → minimum 18pt on mobile
3. **No platform detection** → add `UserInputService.TouchEnabled` check
4. **No virtual joystick** → Roblox provides default, but custom is better
5. **English prompts need bigger buttons** → answer buttons must be 60x60pt minimum

### Implementation Priority
1. Convert all UI to Scale positioning (not Offset)
2. Add platform detection and layout switching
3. Implement auto-aim for touch/controller
4. Size up all interactive elements
5. Test on minimum spec device (iPhone 8 / entry Android)

---

## 📊 PERFORMANCE TARGETS (MOBILE)

| Metric | Target | Why |
|--------|--------|-----|
| FPS | 30+ stable | Below 30 = unplayable on mobile |
| Memory | <800 MB | Low-end Android has 2-3GB total |
| Load time | <15 seconds | Roblox penalizes slow-loading games |
| Texture quality | Auto-LOD | Reduce for mobile, full for desktop |
| Particle count | Max 50 on mobile | Particles kill mobile FPS |

---

## ✅ DEFINITION OF DONE

- [ ] All UI converted to Scale positioning
- [ ] Platform detection implemented
- [ ] Auto-aim system implemented for mobile/console
- [ ] All buttons meet 44pt minimum touch target
- [ ] English Power-Up prompts sized for thumbs
- [ ] Tested on iPhone 8 equivalent (minimum spec)
- [ ] FPS stable at 30+ on minimum spec device
- [ ] Gospel 444 palette maintained (no blue in any UI)

---

*Source: Q7 (Controls), Q9 (Performance), Q12 (Demographics) from Market Research Synthesis*
*Pipeline: Stage 7 of 20 — 20-Stage Train 6-7 Launch Pipeline*
