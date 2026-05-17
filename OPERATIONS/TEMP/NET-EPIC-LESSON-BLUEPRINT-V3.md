# NET EPIC LESSON BLUEPRINT v3.0 — Master Template

**Source:** NET EPIC LESSON BLUEPRINT — The Ultimate Plug-and-Play Guide for AI Assistants
**Type:** PRODUCT ARTIFACT — Canonical master template for Galaxy Lessons
**Version:** 3.0 — January 2025
**Dump Date:** 2026-03-25
**Status:** 📥 INTAKE — awaiting consolidation orders

---

## 📘 WHAT THIS DOCUMENT IS

This is the complete instruction manual for creating world-class, interactive English lessons in the NET (Natural English Training) style. Any AI assistant can follow this guide to create epic lessons that match NET's brand aesthetics, functionality, and business standards.

Use this guide to create:
- 90-minute interactive lessons
- Engaging team games (3+ per lesson)
- Beautiful, modern UI with neon glow effects
- Mobile-responsive, professional designs
- Progress tracking and gamification

---

## 🎨 PART 1: AESTHETICS GOSPEL

### The NET Brand Identity

**Core Philosophy:** Modern tech aesthetic with organic warmth. Think cyberpunk meets education.

### Official Color Palette (CSS Variables)

```css
--neon-purple: #a855f7;    /* Primary brand color */
--gold-accent: #f59e0b;    /* Secondary accent */
--deep-dark: #0a0a0f;      /* Background base */
--navy-tint: #0d0a14;      /* Background gradient */
--text-primary: #e5e7eb;   /* Main text */
--success-green: #10b981;  /* Positive feedback */
--danger-red: #ef4444;     /* Warnings/errors */
--glass-bg: rgba(26,26,38,0.7); /* Card backgrounds */
```

### Typography Rules

| Element | Font | Weight | Notes |
|---------|------|--------|-------|
| Headings | Inter, system-ui, sans-serif | 700-900 | letter-spacing: -0.02em |
| Body Text | Inter, system-ui, sans-serif | 400-600 | line-height: 1.6 |
| Code/Tech | JetBrains Mono, monospace | 500-700 | — |

**Note:** Galaxy Lessons also use Orbitron + Rajdhani (cyberpunk style). This blueprint uses Inter (glassmorphism style). Both are valid.

### Essential Visual Effects

#### 1. NEON GLOW (Required on all interactive elements)
```css
box-shadow: 0 0 20px rgba(168, 85, 247, 0.6),
            0 0 40px rgba(245, 158, 11, 0.3);
text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
```

#### 2. GLASSMORPHISM (All cards and panels)
```css
background: rgba(26, 26, 38, 0.7);
backdrop-filter: blur(12px) saturate(150%);
border: 1px solid rgba(168, 85, 247, 0.2);
border-radius: 1.5rem;
```

#### 3. ORGANIC GRADIENT BLOBS (Background depth)
```css
position: absolute;
background: radial-gradient(circle,
    rgba(168, 85, 247, 0.3),
    rgba(245, 158, 11, 0.2));
filter: blur(80px);
animation: pulse 10s infinite alternate;
```

#### 4. HOVER STATES (All clickable elements)
```css
transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
transform: translateY(-5px) scale(1.05);
box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
```

### Layout Requirements

- **Spacing:** Small 0.5rem (8px) / Medium 1rem (16px) / Large 2rem (32px) / XL 4rem (64px)
- **Border Radius:** Buttons 0.75rem-999px (pill) / Cards 1rem-1.5rem / Modals 1.5rem-2rem
- **Responsive Breakpoints:** Mobile ≤768px / Tablet+ ≥769px / Desktop ≥1024px

---

## 🎮 PART 2: LESSON STRUCTURE

### Standard 90-Minute Lesson Format (10 Sections)

| # | Section | Duration | Key Elements |
|---|---------|----------|--------------|
| 1 | Landing Page | 5 min | Hero title (5rem+), subtitle, CTA button, 3-4 feature cards, gradient blobs |
| 2 | Introduction | 5 min | Welcome, 3-5 objectives, overview, coins/points system |
| 3 | Vocabulary | 10 min | 8-10 words, definitions, examples, pronunciation tips, neon cards |
| 4 | Reading Passage | 10 min | 3-5 paragraphs, narrative with dialogue, comprehension questions |
| 5 | Team Game #1 | 15 min | High-energy, competitive, 4 teams, scoring, timers |
| 6 | Content Deep Dive | 10 min | Grammar/concept explanation, examples, visual aids, exercises |
| 7 | Team Game #2 | 15 min | Different style from Game 1, physical/creative, collaboration |
| 8 | Application Activity | 10 min | Create/write/speak, use vocab, individual/pair, save/submit |
| 9 | Team Game #3 | 15 min | Review game, fast-paced, determines winner |
| 10 | Summary & Celebration | 5 min | Recap objectives, final scores, certificates/badges, closing |

---

## 🎲 PART 3: INTERACTIVE GAMES BLUEPRINT

### Universal Game Requirements
- ✅ Clear on-screen instructions
- ✅ Countdown timer (10-60 seconds)
- ✅ Team buzzers or answer buttons
- ✅ Instant visual feedback (correct/wrong)
- ✅ Point values displayed
- ✅ Progress indicator (Round X/Y)
- ✅ Teacher control buttons

### Game Type 1: Speed Race (Identification)

**Best For:** Quick recall, true/false, multiple choice

```javascript
const gameState = {
    currentRound: 0,
    totalRounds: 5,
    timer: 10,
    questions: [
        {
            text: "Statement or question",
            options: ["Option A", "Option B"],
            correct: "Option A"
        }
    ]
};

function startRound() {
    // 1. Display question
    // 2. Start 10-second timer
    // 3. Enable answer buttons
    // 4. Wait for team to click
}

function checkAnswer(teamAnswer) {
    // 1. Stop timer
    // 2. Show correct/wrong feedback
    // 3. Display point award instructions
    // 4. Auto-advance after 3 seconds
}
```

**Points:** First correct 50pts / Second 30pts / Wrong = sit out

### Game Type 2: Charades/Acting (Physical)

**Best For:** Vocabulary demonstration, career/action words

```javascript
const items = [
    { name: "Chef", emoji: "👨‍🍳", hints: "Stirring, tasting, chopping" },
    { name: "Doctor", emoji: "👨‍⚕️", hints: "Stethoscope, pulse, prescription" }
];

function pickRandomItem() {
    // 1. Select random item
    // 2. Show to actor only (large display)
    // 3. Start 60-second timer
    // 4. Enable team buzzers
}

function teamBuzz(teamNumber) {
    // 1. Stop timer
    // 2. Display which team buzzed
    // 3. Show teacher judge buttons
    // 4. Wait for correct/wrong click
}
```

**Points:** Correct 100pts / Speed bonus (<30s) 150pts / Steal 50pts

### Game Type 3: Relay Race (Knowledge)

**Best For:** Definitions, sentence creation, vocabulary mastery

```javascript
const vocabWords = [
    {
        word: "CONTEXT",
        definition: "The background situation",
        example: "Without context, I couldn't tell if he was joking."
    }
];

function revealWord() {
    // 1. Display word in huge text (4rem)
    // 2. Start 20-second discussion timer
    // 3. Enable team buzzers
    // 4. Show expected answer to teacher
}

function judgeAnswer(correct) {
    // 1. Award points if correct
    // 2. Allow re-buzzing if wrong
    // 3. Auto-advance when time expires
}
```

**Points:** Correct 75pts / First team bonus +50pts

---

## 💻 PART 4: TECHNICAL IMPLEMENTATION

- **Single HTML file** — all CSS + JS inline
- **Google Fonts:** Inter + JetBrains Mono loaded in `<head>`
- **Mobile-first responsive design**
- **No external dependencies** (works offline after load)
- **Performance target:** <3 seconds load, 60fps animations, zero console errors

---

## 📊 PART 8: BUSINESS & FUNCTIONALITY STANDARDS

### Quality Markers (5 Categories)

1. **Visual Excellence** — brand colors exact, smooth animations, responsive, WCAG AA
2. **Engagement Mechanics** — 3+ games, points, progress tracking, celebrations
3. **Educational Value** — clear objectives, 8-10 vocab, reading passage, exercises
4. **Technical Performance** — <3s load, no errors, 60fps, offline, mobile
5. **User Experience** — intuitive nav, clear instructions, error prevention

### Business Requirements

- Scalability: 4-40 students, 4 teams standard
- Teacher-friendly: minimal setup, clear instructions
- Brand consistent: NET colors throughout, market-ready

---

## 🎓 PART 9: AI PROMPT TEMPLATES

### Template 1: Complete Lesson

```
Create a 90-minute NET English lesson on [TOPIC] for [LEVEL] students.
Requirements:
- Include 10 vocabulary words with definitions and examples
- Write a 400-word reading passage about [THEME]
- Create 3 interactive team games:
  * Game 1: Speed race (true/false or multiple choice)
  * Game 2: Charades or creative activity
  * Game 3: Vocabulary challenge
Use NET aesthetics:
- Neon purple (#a855f7) + gold (#f59e0b) colors
- Glassmorphism cards with blur effects
- Neon glow on all buttons
- Organic gradient blobs in background
- Interactive timers and buzzers
Make it:
- Mobile responsive
- Professional quality
- High energy and engaging
- Teacher-friendly (clear instructions)
Provide complete HTML file ready to use.
```

### Template 2: Game Only

```
Create an interactive team game for NET English lessons.
Game Type: [Speed Race / Charades / Vocab Challenge]
Topic: [TOPIC]
Duration: [15] minutes
Requirements:
- 4 teams compete
- Countdown timer
- Team buzzers or answer buttons
- Instant feedback (correct/wrong)
- Point system (50/30/75 pts)
- Teacher control buttons
- Auto-advance rounds
Use NET aesthetics with neon purple, gold, glassmorphism.
Provide complete HTML/JS code ready to paste.
```

### Template 3: Visual Enhancement

```
Take this HTML lesson and apply NET aesthetics:
[PASTE HTML]
Enhance with:
✅ Neon purple (#a855f7) + gold (#f59e0b) colors
✅ Glassmorphism with backdrop-filter blur
✅ Neon glow effects (box-shadow)
✅ Organic gradient blobs (radial gradients)
✅ Smooth hover states
✅ Modern Inter font
✅ Responsive design
Keep all functionality, just upgrade visuals.
```

---

## 💡 PART 10: TROUBLESHOOTING GUIDE

### Common Issues & Fixes

1. **White screen** — missing closing tags, unclosed template literals, typos
2. **Timer doesn't count** — ensure setInterval is set with clearInterval on 0
3. **Buttons don't work** — check onclick, function definitions, event binding
4. **Games don't reset** — add resetGame() function clearing all state
5. **Mobile layout breaks** — add responsive CSS @media queries
6. **Colors wrong** — verify CSS variables in :root, use var() references

---

## 🎯 FINAL CHECKLIST

- [ ] Neon purple + gold color scheme
- [ ] Glassmorphism on cards
- [ ] Neon glow effects
- [ ] Organic gradient blobs
- [ ] Smooth animations
- [ ] Inter font family
- [ ] Responsive design
- [ ] 8-10 vocabulary words
- [ ] Reading passage (300-500 words)
- [ ] Clear learning objectives
- [ ] 3 complete games
- [ ] Countdown timers
- [ ] Team buzzers
- [ ] Instant feedback
- [ ] Point system
- [ ] Progress tracking
- [ ] No console errors
- [ ] Fast load time
- [ ] Works on mobile
- [ ] All buttons functional
- [ ] Spell-checked
- [ ] Tested thoroughly

---

**Document Version:** 3.0
**Last Updated:** January 2025
**Maintained By:** NET English Training
**For:** AI Assistants & Developers
