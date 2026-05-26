# OBI UI/UX Design System — Magic Chat

**Status:** Design-ready (5 key screens)  
**Color Scheme:** Gospel 444 (void black #0f0f1a, purple #a855f7, gold #f59e0b)  
**Typography:** Clean sans-serif, 30-second entry friction

---

## 🎨 SCREEN 1: ENTRY (FIRST IMPRESSION)

**Status:** Not logged in  
**Goal:** Zero friction to first use

```
┌─────────────────────────────────────┐
│                                     │
│          OBI 🤖                     │
│   English Speaking Coach            │
│                                     │
│  "Speak for 30 seconds"             │
│                                     │
│  [ START PRACTICE ]                 │
│                                     │
│  "Free. No login. Just speak."      │
│                                     │
└─────────────────────────────────────┘
```

**Design Rules:**
- NO login screen
- NO menu
- NO settings
- Icon + 1-line message + 1 button
- Large button (tap-friendly)
- Dark background (reduces eye strain)

**Behavior:**
- Tap START → Immediately to Screen 2

---

## 🎙️ SCREEN 2: LIVE PRACTICE (Speaking Phase)

**Status:** User is speaking  
**Goal:** Reduce anxiety, show listening

```
┌─────────────────────────────────────┐
│  OBI 🤖  |  Listening...            │
├─────────────────────────────────────┤
│                                     │
│      [ WAVEFORM ANIMATION ]         │
│      /\  /\  /\  /\  /\  /\         │
│      \/  \/  \/  \/  \/  \/         │
│                                     │
│     Speak naturally...              │
│     (30 seconds)                    │
│                                     │
├─────────────────────────────────────┤
│  [ STOP ] or speak for 30 sec       │
│                                     │
└─────────────────────────────────────┘
```

**Design Rules:**
- Animated waveform (shows active listening)
- Countdown timer
- Stop button (user has control)
- Calming colors (purple, no red)
- No error messages during speaking

**Behavior:**
- Auto-submit after 30 sec
- Or user taps STOP
- → Goes to Screen 3

---

## ✅ SCREEN 3: FEEDBACK MOMENT (Correction Delivery)

**Status:** AI has corrected  
**Goal:** CRITICAL → show clear correction, not overwhelm

```
┌─────────────────────────────────────┐
│  Feedback                 Day 3 🔥  │
├─────────────────────────────────────┤
│                                     │
│  ❌ What you said:                  │
│  "I go yesterday market"            │
│                                     │
│  ✅ Correct version:                │
│  "I went to the market yesterday"   │
│                                     │
│  💡 Why:                            │
│  Past tense verb + word order       │
│                                     │
│  🎯 Drill (say 3x):                 │
│  "I went to the market yesterday"   │
│                                     │
├─────────────────────────────────────┤
│  [ TRY AGAIN ] or [ NEXT DRILL ]    │
│                                     │
└─────────────────────────────────────┘
```

**Design Rules:**
- Clear ❌ and ✅ separation
- ONE main error (not multiple)
- Explanation in human language (not grammar jargon)
- Large repeatabletext (easy to read while drilling)
- Two options: retry or continue

**Behavior:**
- User can TRY AGAIN (go back to Screen 2)
- Or tap NEXT DRILL (go to Screen 4)

---

## 🎯 SCREEN 4: MINI DRILL (Targeted Practice)

**Status:** Reinforcement phase  
**Goal:** Make the weakness stick today

```
┌─────────────────────────────────────┐
│  Today's Focus    Streak: 3 days 🔥│
├─────────────────────────────────────┤
│                                     │
│  Focus skill:                       │
│  Past Tense Verbs                   │
│                                     │
│  Repeat after me:                   │
│  "I went to the market              │
│   yesterday to buy rice"            │
│                                     │
│  [ 🎙️ RECORD YOURSELF ]             │
│                                     │
│  or                                 │
│                                     │
│  [ ✅ I SAID IT ]                   │
│                                     │
├─────────────────────────────────────┤
│  "Tomorrow we'll continue           │
│   this drill"                       │
│                                     │
└─────────────────────────────────────┘
```

**Design Rules:**
- Show TODAY'S focus (not random drills)
- Drill text is LARGE and clear
- Option to record themselves (proof)
- Or skip (low friction)
- Always show "tomorrow continuation"

**Behavior:**
- Record → Goes to Screen 5
- Or I SAID IT → Goes to Screen 5

---

## 📊 SCREEN 5: PROGRESS & LOOP END (Reward Moment)

**Status:** Session complete  
**Goal:** Reinforce habit loop, show improvement

```
┌─────────────────────────────────────┐
│  Session Complete ✅                │
├─────────────────────────────────────┤
│                                     │
│  Stats:                             │
│  Streak: 3 days 🔥                  │
│  Mistakes fixed: 1                  │
│  New drill: Past tense              │
│                                     │
│  Weakness Update:                   │
│  📈 Past tense (improving)          │
│  📊 /TH/ sound (stable)             │
│  📉 Articles (needs work)           │
│                                     │
│  Next session: Tomorrow at 6pm      │
│  (automatic reminder)               │
│                                     │
├─────────────────────────────────────┤
│  [ SHARE PROGRESS ] [ DONE ]        │
│                                     │
└─────────────────────────────────────┘
```

**Design Rules:**
- Show CONCRETE improvement
- Streak displayed prominently
- Personalized next action
- Automatic reminder (pressure loop)
- Share button (social anchor)

**Behavior:**
- Tap DONE → Closes session
- Automatic notification tomorrow
- → User returns → Screen 2 (habit loop formed)

---

## 🎨 UI Component Library

### Header Component
```jsx
<header>
  <div className="flex justify-between items-center">
    <h1>🤖 OBI</h1>
    <div className="flex gap-4">
      <StatCard label="Streak" value={streak} icon="🔥" />
      <StatCard label="Focus" value={focus} icon="🎯" />
    </div>
  </div>
</header>
```

### Correction Card
```jsx
<Card>
  <div className="wrong">❌ {userText}</div>
  <div className="arrow">→</div>
  <div className="correct">✅ {correctedText}</div>
  <div className="explanation">💡 {why}</div>
  <div className="drill">🎯 {practiceText}</div>
</Card>
```

### Streak Counter
```jsx
<StreakCounter value={3} message="Day 3 streak!" />
// Displays: "3🔥" with pulsing animation
```

### Waveform Animation
```jsx
<Waveform isActive={isListening} />
// Shows: /\ /\ /\ /\ (animated)
```

---

## 📱 Mobile Responsiveness

All screens designed for 375px min width.
- Text: readable without zoom
- Buttons: thumb-friendly (min 48px height)
- Colors: high contrast (WCAG AA)
- No horizontal scroll

---

## 🎨 Color Palette (Gospel 444 + Extended)

| Use | Color | Hex |
|-----|-------|-----|
| Background | Void Black | #0f0f1a |
| Primary CTA | Purple | #a855f7 |
| Success | Gold | #f59e0b |
| Accent | Pink | #ec4899 |
| Text | Light Gray | #e5e7eb |
| Error | Red | #ef4444 |

---

## ⏱️ Interaction Timings

- Entry → Start: 0ms (instant)
- Speaking → Listening UI: animate waveform
- AI Response: show loading (max 2 sec)
- Transition between screens: 300ms fade
- Streak animation: pulsing (infinite)

---

**This is your product. These 5 screens = complete user experience.**
