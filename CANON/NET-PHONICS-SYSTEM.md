# NET Phonics System — Living Doctrine

**Status:** ACTIVE — Run 36 (2026-05-31)  
**Author:** OB1 / Michael Hobbs  
**Supersedes:** Pillar 3 Jolly Phonics reference in NET-TEACHING-METHODOLOGY.md  
**Version:** 1.1 — GROUP NAMES LOCKED  

> *This document is the living spec for NET Phonics. It evolves as Michael refines the system. All updates must be committed with a run number.*

---

## ⚠️ NEXT SESSION — IMPLEMENTATION PENDING

Group names locked Run 36. The following must be implemented in the next session:
1. Rewrite `phonics-drills.js` — update group IDs + drill sentences to match new sound assignments for DRUMBLE and HOGFEZ (sounds changed from HOLD/GRUFF)
2. Update `index.js` phonics mode prompt with new group names (SATNIP → OYSTER)
3. Resolve z-assignment: z currently in HOGFEZ (group 3) — WYVEX (group 4) gets k/c instead
4. Deploy

---

## Origin & Philosophy

NET Phonics is inspired by the 42-sound alphabetic code approach to English phonics, adapted specifically for:
- **Vietnamese adult and teen learners** (L1 interference patterns inform group clustering)
- **Age-neutral delivery** — no childish songs, no embarrassing actions, no nursery rhyme framing
- **Conversational acquisition** — phonics integrated into real sentences, not isolated drills

NET Phonics is **not affiliated with, derived from, or copying** any proprietary phonics curriculum. The 42 sounds of English are not owned by anyone. The grouping logic, names, rhymes, actions, and pedagogical approach are original to Natural English Training.

---

## The 7 Groups — LOCKED NAMES (Run 36)

**Design principle:** The group name IS the sounds. Say the name, practice the sounds. Each name has a ridiculous/vivid memory story — the weirder, the stickier (method of loci applied to phonics). Groups 1–3 are true phonetic words (every letter fires). Groups 4–7 contain 2–3 key sounds from the group; the story covers the rest.

| # | Name | Sounds | Memory story |
| --- | --- | --- | --- |
| 1 | **SATNIP** | s, a/æ/, t, n, i/ɪ/, p | A man **SAT** on a **PIN** — **OUCH!** |
| 2 | **DRUMBLE** | d, r, u/ʌ/, m, b, l | A drummer who can't stop **STUMBLING**. He drums and trips and rumbles to the floor. |
| 3 | **HOGFEZ** | h, o/ɒ/, g, f, e/ɛ/, z | A fat HOG meets a funny little man called **FEZ**. They shake hands. |
| 4 | **WYVEX** | w, v, j, k/c, y, x | A WYVEX is a wild dragon: **WHISPERS** (w), **VIBRATES** (v), **JUMPS** (j), **YELLS YAY** (y), **EXPLODES** (x). Most chaotic creature alive. |
| 5 | **CHUSHANG** | ch, sh, th/θ, th/ð, ng, qu | A kung-fu master shouts **CHUSHANG!** before every chop. **CHOPS** (ch), **SHUSHES** (sh), **THINKS** tongue-out (th), **BREATHES** fire (ð), **SINGS** through nose (ng), asks **QUESTIONS** (qu). |
| 6 | **BEEHIVE** | ee/iː/, ai/eɪ/, oa/əʊ/, ie/aɪ/, oo/uː/, oo/ʊ/ | A BEEHIVE full of long-vowel bees. Each one makes a different sweet sound: EEEeee · AYyyy · OHhhh · EYEeee · OOOooo · ooOOK. |
| 7 | **OYSTER** | or/ɔː/, ar/ɑː/, er/ɜː/, ou/aʊ/, oi/ɔɪ/, ue/juː/ | Every OYSTER holds a pearl. Work **HARD** (ar), sail **FAR from SHORE** (or), in the **OUTDOOR** wind (ou), crack the **OILY** shell (oi), grunt **ERRGH** (er), find something **TRULY PURE** inside (ue). |

**Sound assignment note:** z sits in HOGFEZ (group 3) because the name requires it. WYVEX (group 4) gets k/c in z's place. This is intentional — z is taught in the context of the HOGFEZ story alongside h,o,g,f,e.

---

## The 7 Groups — Sound Detail

---

### Group 1: ANTS
**Sounds:** s /s/ · a /æ/ · t /t/ · n /n/ · i /ɪ/ · p /p/  
**Teaching order:** First  
**Logic:** Foundation six. These sounds exist in Vietnamese in some form — the work is on SHORT vowel precision (/æ/ wider than Vietnamese "a"). These six sounds make the most decodable word combinations in English.

**Rhyme:**
> Sit down. Sign in. Start at nine.  
> Pass the report — it looks fine.  
> Six items on the list today.  
> Simple. Steady. Push through. Stay.

**Physical anchor:** Tap each fingertip to thumb — one per sound. Like counting ants. Discrete, works on Zoom.

**Key Vietnamese L1 notes:**
- /æ/ (sat, pan): jaw drops MORE than Vietnamese "a" — wider and longer
- /ɪ/ (pin, sit): shorter and tenser than Vietnamese "i" — tight quick smile, then stop
- Final /t/ and /p/: English LANDS on them. "sto_" ≠ "stop". Touch your lips.

---

### Group 2: HOLD
**Sounds:** b /b/ · e /e/ · h /h/ · o /ɒ/ · l /l/ · d /d/  
**Teaching order:** Second  
**Logic:** Introduces short /e/ and short /ɒ/ — two new vowel positions not present in Vietnamese. HOLD is an action word everyone can picture. You can spell "bold", "hold", "bled", "led" using Groups 1+2.

**Rhyme:**
> Bold move. Hold the line.  
> Let it go. The bell will chime.  
> Old doors close — new ones open.  
> Be the kind of person spoken of.

**Physical anchor:** Cup both hands together like holding something valuable — a cup, a precious object.

**Key Vietnamese L1 notes:**
- /e/ (bed): "eh?" surprise face — mouth half-open, lips slightly spread
- /ɒ/ (hot): quick, wide open jaw — NOT the same as /əʊ/ in "hold" (long)
- HOT vs HOLD: short /ɒ/ is quick. Long /əʊ/ is long + lip rounding.
- Final /d/: English lands on it. "lea_" ≠ "lead"

---

### Group 3: GRUFF
**Sounds:** g /g/ · r /r/ · u /ʌ/ · f /f/ · m /m/ · k /k/  
**Teaching order:** Third  
**Logic:** Completes the short vowel set (short /ʌ/). Introduces /r/ and /f/ — the two consonants most absent from Vietnamese phonology. GRUFF = a tough, determined character. Energy matches the work required.

**Rhyme:**
> Rough morning? Grab your mug.  
> Get up. Make a move. No shrug.  
> Luck favors the one who works —  
> Come back stronger. Cut the quirks.

**Physical anchor:** Fist to chest — one firm tap. Gruff, strong, determined.

**Key Vietnamese L1 notes:**
- /r/: curl tongue BACK, touch NOTHING — it floats. NOT an /l/. New muscle entirely.
- /f/: top teeth on LOWER lip, air blows through. NOT /ph/ (Vietnamese aspirated bilabial)
- /tr/ cluster (truck, train): no vowel between T and R. Not "ta-ruck"
- /fr/ cluster (front, fresh): same rule

---

### Group 4: WING
**Sounds:** w /w/ · v /v/ · j /dʒ/ · z /z/ · y /j/ · x /ks/  
**Teaching order:** Fourth  
**Logic:** These are the "orphan consonants" — all absent or severely distorted in Vietnamese phonology. W/V is the #1 phoneme confusion for Vietnamese speakers. Grouped together so the contrast can be drilled directly.

**Rhyme:**
> View the sky. Go zero waste.  
> Wing it, yeah — no time to wait.  
> Jazz the vibe. Zoom through the haze.  
> Every exit starts a new phase.

**Physical anchor:** Arms spread wide, then pull in — like wings opening. Big but brief. Or spread both hands outward on a desk (Zoom-friendly).

**Key Vietnamese L1 notes:**
- /w/ vs /v/: W = lips ROUND, push forward, NO teeth contact. V = top teeth on LOWER lip, buzz. COMPLETELY different muscles. This is the top priority for this group.
- /dʒ/ (job, jump, just): jaw drops forward, like chewing. Does not exist in Vietnamese.
- /z/: voiced /s/. SSSS → ZZZZ. Feel your throat vibrate.
- /ks/ (exact): between vowels, X is often /gz/ — "eGZact" not "eKSact"

---

### Group 5: CHUNKS
**Sounds:** ch /tʃ/ · sh /ʃ/ · th (unvoiced) /θ/ · th (voiced) /ð/ · ng /ŋ/ · qu /kw/  
**Teaching order:** Fifth  
**Logic:** All six are consonant digraphs (2 letters = 1 sound). The hardest group for Vietnamese speakers — /θ/ and /ð/ require a completely new mouth gesture. The two TH sounds are paired by design to force the voiced/unvoiced contrast. /ŋ/ (ng) already exists in Vietnamese — anchor point.

**Rhyme:**
> Think before you speak — think right.  
> The thing is: strength takes time, not fight.  
> Challenge what you think you know.  
> Show your work. Watch your language grow.

**Physical anchor:** Single karate chop downward — chunk it down. For /θ/ specifically: point to tongue between teeth (this is the teaching gesture for that sound).

**Key Vietnamese L1 notes:**
- /θ/ (think, three, bath): tongue tip BETWEEN teeth, release air. NOT /t/ or /s/.
- /ð/ (this, the, breathe): same position as /θ/ but add voice.
- /ʃ/ vs /tʃ/: SH = smooth air. CH = burst of air. Switch drill: "sh — ch — sh — ch"
- /ŋ/ (ng in "sing", "thing"): identical to Vietnamese "ng". NO /g/ after it in English — "sing" ends on the nose hum, not "sing-guh"

---

### Group 6: SWEET
**Sounds:** ee /iː/ · ai /eɪ/ · oa /əʊ/ · ie /aɪ/ · oo (long) /uː/ · oo (short) /ʊ/  
**Teaching order:** Sixth  
**Logic:** Long vowels and common vowel digraphs. The core insight: Vietnamese is TONAL — vowel LENGTH is a completely new concept. Short /ɪ/ (sit) vs long /iː/ (seat) are different words. This group builds gliding vowel awareness. All six are MOVING sounds — the mouth changes position as you produce them.

**Rhyme:**
> Read the email. Coast is clear.  
> Deep breaths — the meeting's here.  
> Try the idea. Float the plan.  
> Green light. Good move. You can.

**Physical anchor:** Slow wide smile — draw the corners of your mouth out and HOLD. Long vowels need time, like savoring something sweet. The smile stays open longer than feels natural.

**Key Vietnamese L1 notes:**
- /iː/ (need, seat, email): lips WIDE, long — like a smile frozen. NOT short /ɪ/ (sit)
- /eɪ/ (main, wait, day): GLIDE — /e/ → /ɪ/. Your mouth moves. Not flat.
- /əʊ/ (hope, go, show): GLIDE — /ə/ → /ʊ/. Lips round as you finish.
- /uː/ vs /ʊ/ (food vs good): FOOD = long + very round. GOOD = short + round. Different lengths.

---

### Group 7: PEARL
**Sounds:** or /ɔː/ · ar /ɑː/ · er /ɜː/ · ou /aʊ/ · oi /ɔɪ/ · ue /juː/  
**Teaching order:** Seventh (final group)  
**Logic:** R-controlled vowels + diphthongs. The name PEARL contains the /ɜː/ being taught — that's the built-in mnemonic. R-controlled vowels are new for Vietnamese speakers (the /r/ transforms the preceding vowel). Three spellings of /ɜː/ (heard/word/worth) are taught as one sound with three faces.

**Rhyme:**
> Hard work earns more than gold.  
> Your voice, your worth — be bold, be told.  
> Found the words? Now say them loud.  
> A true choice cuts through any cloud.

**Physical anchor:** Roll thumb and index finger together — rolling a pearl. Precious, takes time to form. Subtle enough for any professional setting.

**Key Vietnamese L1 notes:**
- /ɔː/ (more, for, or): lips ROUND, jaw lower. Vietnamese speakers often say flat /o/ — add the roundness.
- /ɑː/ (hard, start, car): jaw WIDE open, no lip rounding.
- /ɜː/ (heard, word, worth, earn): THREE different spellings, ONE sound. Lips slightly forward, jaw relaxed.
- /aʊ/ (out, loud, crowd): jaw DROPS open then jaw CLOSES. Big physical movement.
- /ɔɪ/ (oil, noise, choice): starts round /ɔ/, ends with smile /ɪ/.

---

## Progression Logic

Students work through groups **sequentially**. Skipping is discouraged — each group builds vocabulary range before introducing complexity.

| Group | After mastering this group, student can decode/produce... |
|-------|-----------------------------------------------------------|
| ANTS | sit, pan, tip, snap, nap, spin, pin, tan |
| +HOLD | bold, hold, bed, hot, bled, old, belt, help |
| +GRUFF | mug, rough, fun, gruff, rock, from, make |
| +WING | very, watch, job, zoom, yes, exit |
| +CHUNKS | think, check, should, thing, question, strength |
| +SWEET | need, wait, hope, tried, food, good |
| +PEARL | more, hard, earn, out, noise, true |

**Mastery threshold:** Student produces target sounds correctly in 4/5 drills without prompting.

---

## Tracking (Implementation Spec)

Each student profile should store:
```json
{
  "phonics_current_group": "hold",
  "phonics_mastered": ["ants"],
  "phonics_drill_history": [
    { "drill_id": "ant-01", "attempts": 3, "mastered": true, "date": "2026-05-31" }
  ]
}
```

**Agent behavior:**
- At session start in Phonics mode: check `phonics_current_group` and resume there
- After 4/5 correct: congratulate + suggest advancing to next group
- Display mastered groups with a visual unlock (e.g., ✅ ANTS → ✅ HOLD → 🔓 GRUFF)

---

## Marketing Notes

Each group name is a common visual thing — marketable as a standalone concept:

| Group | Marketing angle |
|-------|----------------|
| **ANTS** | "Small but powerful. These 6 sounds are in everything." |
| **HOLD** | "Bold move. Hold your ground in any conversation." |
| **GRUFF** | "Rough start, strong finish. These sounds build character." |
| **WING** | "Break free from your L1 cage. Take flight." |
| **CHUNKS** | "Crack the code. These are the sounds that separate learners from speakers." |
| **SWEET** | "The sweetest sounds in English — once you hear them right, everything changes." |
| **PEARL** | "Hard work earns a pearl. The final group is worth every session." |

---

## Version History

| Version | Run | Date | Change |
|---------|-----|------|--------|
| 1.0 | 36 | 2026-05-31 | Initial NET Phonics system created. 7 groups, 42 sounds, 35 drills, group names finalized. Replaces JP reference in methodology. |
