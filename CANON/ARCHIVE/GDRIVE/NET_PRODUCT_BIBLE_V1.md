# ═══════════════════════════════════════════════════════════════════════════════
# NET PRODUCT BIBLE V1 — THE COMPLETE TECHNICAL & PRODUCT SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════
# Version: 1.0 LOCKED CANON
# Created: November 21, 2025
# Owner: Michael Hobbs (Executor)
# Status: PRODUCTION READY
# Purpose: The immutable source of truth for all NET product architecture, technical systems, features, and roadmap
# ═══════════════════════════════════════════════════════════════════════════════

**THIS DOCUMENT IS CANON.**

All NET product development, technical decisions, feature implementations, and system architecture MUST adhere to this Bible.

Any deviation requires Executor approval and creates a new version.

---

## TABLE OF CONTENTS

1. [PRODUCT PHILOSOPHY & VISION](#1-product-philosophy--vision)
2. [PHOENIX ENGINE: THE SECURITY FOUNDATION](#2-phoenix-engine-the-security-foundation)
3. [NET PET AI: THE GAMIFICATION COACH](#3-net-pet-ai-the-gamification-coach)
4. [STORYFLOW ENGINE: THE NARRATIVE SYSTEM](#4-storyflow-engine-the-narrative-system)
5. [LESSON DELIVERY SYSTEM: THE CLASSROOM](#5-lesson-delivery-system-the-classroom)
6. [ENTERPRISE DASHBOARD: THE B2B PLATFORM](#6-enterprise-dashboard-the-b2b-platform)
7. [TECHNICAL ARCHITECTURE: THE STACK](#7-technical-architecture-the-stack)
8. [API SPECIFICATIONS: THE INTERFACES](#8-api-specifications-the-interfaces)
9. [DATA & ANALYTICS: THE INTELLIGENCE](#9-data--analytics-the-intelligence)
10. [PRODUCT ROADMAP: THE FUTURE](#10-product-roadmap-the-future)

---

# 1. PRODUCT PHILOSOPHY & VISION

## 1.1 CORE PHILOSOPHY

**NET products exist to remove friction from natural English acquisition.**

Every feature, every interaction, every design decision must answer:
> "Does this help students speak English confidently, or does it get in the way?"

### THE ANTI-PATTERNS (WHAT WE DON'T BUILD)

❌ **Grammar drill apps** (Duolingo-style)  
❌ **Test prep platforms** (exam-focused)  
❌ **Translation tools** (reinforces mental translation)  
❌ **Flashcard systems** (isolated vocabulary)  
❌ **Gamification for gamification's sake** (distracts from learning)

### THE NET WAY (WHAT WE BUILD)

✅ **Conversation practice tools** (real English usage)  
✅ **Confidence tracking** (behavioral change measurement)  
✅ **Community features** (social support)  
✅ **Contextual learning** (words in sentences)  
✅ **Meaningful gamification** (habit formation, not distraction)

---

## 1.2 PRODUCT VISION (3-YEAR HORIZON)

**2025: Foundation**
- NET V0 (consumer website, intake system)
- NET PET V1 (basic gamification: XP, streaks, mood)
- Phoenix Engine P0-P2 (security baseline)
- StoryFlow V1 (Echo Chamber Arc)

**2026: Scale**
- NET V2 (enterprise dashboard, corporate features)
- NET PET V2 (AI feedback, pronunciation analysis)
- StoryFlow V2 (5 arcs, adaptive difficulty)
- Mobile app V1 (iOS + Android)

**2027: Domination**
- NET V3 (franchise system, white-label platform)
- NET PET V3 (conversational AI coach, voice mode)
- StoryFlow V3 (procedurally generated content)
- API-first platform (3rd-party integrations)

---

## 1.3 PRODUCT PRINCIPLES

### PRINCIPLE 1: SECURITY FIRST
**Phoenix Engine P0 is non-negotiable.**

Every line of code must:
- Sanitize all user input
- Use event listeners (no inline handlers)
- Validate on client AND server
- Log security events

**Violation = immediate rollback.**

---

### PRINCIPLE 2: MOBILE-FIRST
**80% of Vietnamese users are mobile-only.**

Every feature must:
- Work flawlessly on mobile (iOS + Android)
- Support touch gestures
- Load in <3 seconds on 3G
- Work offline when possible

---

### PRINCIPLE 3: GOSPEL 444 COMPLIANCE
**All UI must follow Branding Bible aesthetics.**

Every pixel must:
- Use neon purple (#a855f7) + gold (#f59e0b)
- Deep dark backgrounds (#0f0f1a)
- Glassmorphism effects (blur ≥12px)
- NO BLUE (except semantic states)

---

### PRINCIPLE 4: DATA-DRIVEN DECISIONS
**Opinions are noise. Data is truth.**

Every product decision must:
- Be backed by user behavior data
- Have success metrics defined upfront
- Be A/B tested when feasible
- Be reversible if wrong

---

### PRINCIPLE 5: SIMPLICITY OVER FEATURES
**One great feature beats ten mediocre ones.**

Every feature must:
- Solve a real user problem (validated)
- Be easy to use (no manual needed)
- Work reliably (99.9% uptime)
- Be maintainable (documented code)

---

# 2. PHOENIX ENGINE: THE SECURITY FOUNDATION

## 2.1 OVERVIEW

**Phoenix Engine is NET's security and stability framework.**

It consists of **6 security phases (P0-P5)** that every NET product must implement.

### WHY "PHOENIX"?

Like a phoenix rising from ashes, NET systems must:
- **Survive attacks** (resilient)
- **Self-heal** (automated recovery)
- **Reborn stronger** (learn from failures)

---

## 2.2 P0: BASELINE SECURITY (MANDATORY FOR ALL)

### P0.1: NO INLINE EVENT HANDLERS

**RULE:** Never use `onclick=`, `onload=`, `oninput=`, etc.

**WHY:** Inline handlers create XSS vulnerabilities and violate CSP (Content Security Policy).

**CORRECT:**
```javascript
// ✅ GOOD: Use addEventListener
const button = document.getElementById('submit-btn');
button.addEventListener('click', handleSubmit);
```

**INCORRECT:**
```html
<!-- ❌ BAD: Inline handler -->
<button onclick="handleSubmit()">Submit</button>
```

---

### P0.2: INPUT SANITIZATION

**RULE:** All user input must be sanitized before processing.

**WHY:** Prevents XSS, SQL injection, and other injection attacks.

**IMPLEMENTATION:**
```javascript
function sanitizeInput(input) {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Usage:
const userInput = document.getElementById('name').value;
const safeInput = sanitizeInput(userInput);
```

---

### P0.3: CSP HEADERS

**RULE:** All pages must have Content Security Policy headers.

**IMPLEMENTATION:**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdnjs.cloudflare.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

**WHAT IT DOES:**
- Blocks unauthorized scripts
- Prevents inline script execution
- Limits external resources to whitelist

---

### P0.4: HTTPS ONLY

**RULE:** All NET products must use HTTPS exclusively.

**WHY:** Prevents man-in-the-middle attacks, protects user data.

**IMPLEMENTATION:**
- Force HTTPS redirect at server level
- Use HSTS (HTTP Strict Transport Security)
- Minimum TLS 1.2 (prefer TLS 1.3)

---

### P0.5: SESSION MANAGEMENT

**RULE:** Secure session tokens, httpOnly cookies, automatic timeout.

**IMPLEMENTATION:**
```javascript
// Server-side (Node.js example)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,      // HTTPS only
        httpOnly: true,    // Not accessible via JavaScript
        maxAge: 3600000,   // 1 hour timeout
        sameSite: 'strict' // CSRF protection
    }
}));
```

---

## 2.3 P1: DATA PROTECTION (MANDATORY FOR USER DATA)

### P1.1: ENCRYPTION AT REST

**RULE:** All sensitive data must be encrypted in database.

**WHAT TO ENCRYPT:**
- Passwords (bcrypt, 10+ rounds)
- Email addresses (AES-256)
- Payment information (never store full card numbers)
- Personal information (names, phone numbers)

**IMPLEMENTATION:**
```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

### P1.2: ENCRYPTION IN TRANSIT

**RULE:** All data transmission must use TLS 1.2+.

**IMPLEMENTATION:**
- API calls over HTTPS only
- WebSocket connections over WSS (secure WebSocket)
- Email delivery over TLS

---

### P1.3: PII HANDLING

**RULE:** Personally Identifiable Information (PII) must be:
- Minimally collected (only what's needed)
- Securely stored (encrypted)
- Protected by access controls (role-based)
- Deleted upon user request (GDPR compliance)

**PII INCLUDES:**
- Full name
- Email address
- Phone number
- Physical address
- Payment information
- Audio recordings (for pronunciation assessment)

---

### P1.4: AUDIT LOGGING

**RULE:** Log all security-relevant events.

**WHAT TO LOG:**
- Login attempts (success + failure)
- Password changes
- Data access (who viewed what, when)
- Admin actions (create/delete users)
- API calls (who, what, when, IP)

**IMPLEMENTATION:**
```javascript
function logSecurityEvent(event) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: event.type,
        user: event.userId,
        ip: event.ipAddress,
        details: event.details
    }));
}
```

---

## 2.4 P2: ATTACK PREVENTION (MANDATORY FOR PUBLIC APPS)

### P2.1: RATE LIMITING

**RULE:** Limit requests per IP to prevent brute-force and DDoS.

**IMPLEMENTATION:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

---

### P2.2: CSRF PROTECTION

**RULE:** All state-changing requests must include CSRF token.

**IMPLEMENTATION:**
```javascript
const csrf = require('csurf');

app.use(csrf({ cookie: true }));

// In forms:
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

---

### P2.3: SQL INJECTION PREVENTION

**RULE:** Always use parameterized queries, never string concatenation.

**CORRECT:**
```javascript
// ✅ GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [userEmail]);
```

**INCORRECT:**
```javascript
// ❌ BAD: String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
db.query(query);
```

---

### P2.4: XSS PREVENTION

**RULE:** Escape all user-generated content before rendering.

**IMPLEMENTATION:**
- Sanitize input (P0.2)
- Use templating engines that auto-escape (EJS, Handlebars)
- Set X-XSS-Protection header

---

## 2.5 P3-P5: ADVANCED SECURITY (ENTERPRISE ONLY)

### P3: COMPLIANCE & AUDITING
- GDPR compliance (data deletion, portability)
- SOC 2 certification (for enterprise clients)
- Regular penetration testing
- Third-party security audits

### P4: ADVANCED MONITORING
- Real-time threat detection
- Anomaly detection (unusual login patterns)
- Automated incident response
- Security dashboards (for admins)

### P5: ZERO-TRUST ARCHITECTURE
- Micro-segmentation (network isolation)
- Continuous authentication
- Least-privilege access (minimal permissions)
- Encrypted internal communications

**NOTE:** P3-P5 are future roadmap items, not required for V1 launch.

---

## 2.6 PHOENIX AUDIT PROTOCOL

**All code must pass Phoenix Audit before production deployment.**

### AUDIT CHECKLIST

**P0 (CRITICAL - MUST PASS):**
- [ ] No inline event handlers
- [ ] All input sanitized
- [ ] CSP headers present
- [ ] HTTPS enforced
- [ ] Secure session management

**P1 (HIGH PRIORITY):**
- [ ] Passwords hashed (bcrypt)
- [ ] Sensitive data encrypted
- [ ] PII minimally collected
- [ ] Audit logs implemented

**P2 (MANDATORY FOR PUBLIC APPS):**
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] SQL injection prevented
- [ ] XSS prevention verified

**FAILURE = NO DEPLOY.**

---

# 3. NET PET AI: THE GAMIFICATION COACH

## 3.1 OVERVIEW

**NET PET is the AI-powered companion that tracks habits, provides feedback, and motivates students.**

### WHY "PET"?

- **P**ersonal
- **E**nglish
- **T**rainer

Like a virtual pet (Tamagotchi), students must "care for" NET PET by:
- Practicing daily (feeding)
- Completing lessons (playing)
- Maintaining streaks (happiness)

**NET PET thrives when student thrives.**

---

## 3.2 CORE FEATURES (V1)

### 3.2.1 XP SYSTEM

**XP = Experience Points (gamification)**

**HOW STUDENTS EARN XP:**
- Daily listening practice: +10 XP (45 min)
- Daily speaking practice: +10 XP (15 min)
- Attend class: +50 XP
- Complete homework: +25 XP
- Buddy session: +30 XP
- Monthly event attendance: +100 XP

**LEVELS:**
- Level 1: 0-100 XP (Newbie)
- Level 2: 101-250 XP (Beginner)
- Level 3: 251-500 XP (Learner)
- Level 4: 501-1000 XP (Speaker)
- Level 5: 1001-2000 XP (Conversationalist)
- Level 6: 2001-5000 XP (Fluent)
- Level 7: 5000+ XP (Master)

**VISUAL:**
- Progress bar shows XP until next level
- Level badge displayed on profile
- Confetti animation on level-up

---

### 3.2.2 STREAK COUNTER

**STREAK = Consecutive days of practice**

**RULES:**
- +1 streak for completing daily practice (listening + speaking)
- Streak resets to 0 if student misses a day
- "Freeze" power-ups (save streak for 1 day) unlocked at Level 3

**MILESTONES:**
- 🔥 7-day streak: "Hot Start"
- 🔥 30-day streak: "On Fire"
- 🔥 90-day streak: "Unstoppable"
- 🔥 365-day streak: "Legendary"

**VISUAL:**
- Fire emoji 🔥 next to streak count
- Streak badge on profile
- Warning notification if at risk: "Don't break your 29-day streak!"

---

### 3.2.3 MOOD TRACKER

**MOOD = Student's emotional state (daily check-in)**

**OPTIONS:**
- 😊 Happy (confident, motivated)
- 😐 Neutral (okay, nothing special)
- 😔 Sad (frustrated, discouraged)

**TRACKED DAILY:**
- "How do you feel about your English today?"
- Student selects mood at end of practice

**TRIGGERS:**
- **3 consecutive sad days → Alert teacher** (intervention needed)
- **7+ happy days → Send encouragement** ("You're crushing it!")
- **Mood trends shown in progress dashboard**

---

### 3.2.4 ACHIEVEMENTS (BADGES)

**Students unlock badges for milestones:**

**SPEAKING BADGES:**
- 🎙️ "First Words" (complete first lesson)
- 🗣️ "Tiger Roar" (speak at 7+ volume for full class)
- 💬 "Conversation King" (complete 10 buddy sessions)

**CONSISTENCY BADGES:**
- 📆 "Week Warrior" (7-day streak)
- 🔥 "Month Master" (30-day streak)
- 🏆 "Year Legend" (365-day streak)

**MILESTONE BADGES:**
- ⭐ "Level 5 Unlocked"
- 🎓 "Graduate" (complete NET program)
- 🌟 "Alumni" (stay active 6+ months post-program)

---

## 3.3 ADVANCED FEATURES (V2)

### 3.3.1 AI PRONUNCIATION FEEDBACK

**HOW IT WORKS:**
1. Student records themselves speaking (in app)
2. AI analyzes audio using speech recognition API
3. AI compares to native speaker pronunciation
4. AI provides specific feedback

**EXAMPLE FEEDBACK:**
> "Your pronunciation of 'think' sounds like 'sink'. Try putting your tongue between your teeth for the 'th' sound. Record again!"

**TECH STACK:**
- Google Speech-to-Text API (or Azure Speech Services)
- Custom pronunciation model (trained on Vietnamese-English speakers)

---

### 3.3.2 CONVERSATIONAL AI COACH

**VISION:** Students can have text or voice conversations with NET PET.

**USE CASES:**
- Practice small talk ("How was your weekend?")
- Get instant grammar corrections
- Simulate job interview scenarios
- Debate topics (AI plays devil's advocate)

**IMPLEMENTATION:**
- Claude API (Anthropic) for conversational intelligence
- Voice mode using Speech-to-Text + Text-to-Speech
- Conversation history saved for progress tracking

**TECHNICAL NOTE:**
- This feature requires significant AI infrastructure
- Target: V2 launch (2026)

---

### 3.3.3 ADAPTIVE LESSON DIFFICULTY

**VISION:** AI adjusts lesson difficulty based on student performance.

**HOW:**
- Track accuracy in exercises (grammar, vocab, pronunciation)
- If student scores 90%+ → Increase difficulty
- If student scores <60% → Decrease difficulty
- Maintain 60-80% accuracy (optimal learning zone)

**EXAMPLE:**
- Student struggles with idioms → NET PET reduces idiom count from 5 to 3
- Student excels at vocab → NET PET adds 2 bonus words per lesson

---

## 3.4 NET PET DATA SCHEMA

### USER PROFILE
```javascript
{
    userId: "uuid",
    name: "Kiet Nguyen",
    email: "kiet@example.com",
    enrollmentDate: "2025-01-01",
    level: 3,
    xp: 450,
    streak: 29,
    mood: ["happy", "happy", "neutral", "happy"], // last 7 days
    badges: ["first-words", "week-warrior", "tiger-roar"],
    buddyId: "uuid-of-partner",
    lastActiveDate: "2025-11-21"
}
```

### DAILY LOG
```javascript
{
    userId: "uuid",
    date: "2025-11-21",
    listeningMinutes: 45,
    speakingMinutes: 15,
    classAttended: true,
    buddySession: false,
    mood: "happy",
    xpEarned: 70,
    streakActive: true
}
```

### ACHIEVEMENTS
```javascript
{
    userId: "uuid",
    badgeId: "week-warrior",
    unlockedDate: "2025-11-15",
    description: "Completed 7-day practice streak"
}
```

---

## 3.5 NET PET UI COMPONENTS

### DASHBOARD WIDGET
```
┌────────────────────────────────────┐
│  NET PET COACH                     │
├────────────────────────────────────┤
│  Level 3 | 450 / 500 XP           │
│  [████████░░] 90%                  │
│                                    │
│  🔥 29-day streak                  │
│  😊 Mood: Happy                    │
│                                    │
│  Today's Progress:                 │
│  ✅ Listening: 45 min              │
│  ✅ Speaking: 15 min               │
│  ⬜ Buddy Session                  │
└────────────────────────────────────┘
```

### LEVEL-UP ANIMATION
```
Confetti effect 🎉
"LEVEL UP! You're now Level 4!"
Sound effect: celebration chime
Badge unlocked: "Level 4 - Speaker"
```

### STREAK WARNING
```
⚠️ Notification:
"You haven't practiced today! 
Don't break your 29-day streak. 
Just 15 minutes of practice will keep it alive!"
[Practice Now] [Remind Me Later]
```

---

# 4. STORYFLOW ENGINE: THE NARRATIVE SYSTEM

## 4.1 OVERVIEW

**StoryFlow is NET's narrative framework that tracks student journey and triggers interventions.**

### WHY NARRATIVE?

Learning isn't linear. It's a story with:
- **Beginnings** (enrollment, first lesson)
- **Challenges** (plateaus, frustrations)
- **Conflicts** (wanting to quit, losing motivation)
- **Resolutions** (breakthroughs, transformations)

**StoryFlow models this journey and provides teachers with tools to guide students through their arc.**

---

## 4.2 THE ECHO CHAMBER ARC (PRIMARY STORY)

### OVERVIEW

**The Echo Chamber is the story that NET tells about language learning.**

**PREMISE:**
> "You're trapped in an echo chamber. You hear your own voice repeating the same mistakes, the same fears. To escape, you must speak a new language — the language of confidence."

**ACTS:**

**ACT 1: THE SILENCE (Week 1-2)**
- Student enrolls, timid, scared
- Realizes they can't speak despite years of study
- Mouse Voice dominates

**ACT 2: THE WHISPER (Week 3-4)**
- First words spoken
- Small wins (30-second speech, correct pronunciation)
- Hope emerges

**ACT 3: THE ECHO (Week 5-8)**
- Plateau hits
- Progress feels slow
- Old fears return ("Maybe I can't do this")

**ACT 4: THE BREAKTHROUGH (Week 9-10)**
- Tiger Voice emerges
- Student speaks confidently for first time
- Identity shifts ("I'm an English speaker")

**ACT 5: THE ESCAPE (Week 11-12)**
- Mastery begins
- Student completes program
- Echo chamber shattered

---

## 4.3 ARC STAGES & TRIGGERS

### STAGE 1: SILENCE (ENROLLMENT)

**STUDENT STATE:**
- Just enrolled
- Scared, uncertain
- Mouse Voice dominant

**TEACHER ACTIONS:**
- Warm welcome, build trust
- Set expectations (confidence first)
- Introduce buddy system

**AUTOMATED TRIGGERS:**
- Welcome email sequence
- NET PET intro video
- First lesson reminder (24 hours before)

---

### STAGE 2: WHISPER (FIRST WINS)

**STUDENT STATE:**
- Spoke for first time in class
- Small confidence boost
- Still hesitant

**TEACHER ACTIONS:**
- Celebrate every word spoken
- "Great job! That's your Tiger Voice!"
- Assign first buddy session

**AUTOMATED TRIGGERS:**
- "Congrats on your first class!" email
- Badge unlocked: "First Words"
- NET PET message: "You did it! Keep going!"

---

### STAGE 3: ECHO (PLATEAU)

**STUDENT STATE:**
- Progress feels slow
- Frustration builds
- Mood: Neutral or Sad
- At risk of quitting

**WARNING SIGNS:**
- Streak broken (missed 2+ days)
- 3+ consecutive "sad" moods
- Declining class attendance
- No buddy sessions completed

**TEACHER ACTIONS:**
- Crisis script #10 (Student Wants to Quit)
- Private check-in: "What's going on?"
- Remind of wins: "Look how far you've come"

**AUTOMATED TRIGGERS:**
- "We miss you" email (after 3 days inactive)
- Streak recovery prompt
- Teacher alert: "Nhan is at risk"

---

### STAGE 4: BREAKTHROUGH (TRANSFORMATION)

**STUDENT STATE:**
- Tiger Voice emerges
- Speaking confidently
- Mood: Happy
- Completes 30-day streak

**INDICATORS:**
- Volume increase (7+ in class)
- Volunteers answers frequently
- No apologies for mistakes
- Helps other students

**TEACHER ACTIONS:**
- Public celebration: "Nhan just had a breakthrough!"
- Document success story (video testimonial)
- Invite to advanced classes

**AUTOMATED TRIGGERS:**
- "You're unstoppable!" email
- Badge unlocked: "Breakthrough"
- Share success in community group

---

### STAGE 5: ESCAPE (MASTERY)

**STUDENT STATE:**
- Completes program (90 days)
- Confident English speaker
- Becomes alumni advocate

**TEACHER ACTIONS:**
- Final assessment + certification
- Alumni induction (invite to events)
- Referral program introduction

**AUTOMATED TRIGGERS:**
- Graduation email + certificate
- NET PET message: "You escaped the echo chamber!"
- Alumni community access granted

---

## 4.4 CRISIS EVENTS (AUTOMATED DETECTION)

### CRISIS #1: SILENCE RISK
**Trigger:** Student attends 3 classes, never speaks
**Action:** Teacher privately asks: "What's holding you back?"

### CRISIS #2: STREAK BREAK
**Trigger:** Student breaks 20+ day streak
**Action:** Email: "Let's rebuild that streak together"

### CRISIS #3: MOOD CRASH
**Trigger:** 3 consecutive "sad" moods
**Action:** Teacher reaches out: "Want to talk?"

### CRISIS #4: BUDDY GHOSTING
**Trigger:** 3 weeks, no buddy sessions
**Action:** Auto-message: "Your buddy misses you!"

### CRISIS #5: DROPOUT RISK
**Trigger:** 7 days inactive + declining metrics
**Action:** Urgent teacher alert + intervention call

---

## 4.5 STORYFLOW DATA SCHEMA

### ARC TRACKING
```javascript
{
    userId: "uuid",
    currentStage: "echo",
    stageEntryDate: "2025-11-01",
    daysInStage: 20,
    crisisEvents: [
        {
            event: "streak-break",
            date: "2025-11-15",
            resolved: false
        }
    ],
    breakthroughMoments: [
        {
            moment: "first-30sec-speech",
            date: "2025-10-25"
        }
    ],
    predictedCompletion: true, // AI prediction
    completionProbability: 0.78 // 78% likely to finish
}
```

---

## 4.6 STORYFLOW TEACHER DASHBOARD

**TEACHER SEES:**
- All students' arc stages (visual timeline)
- Students at risk (red alerts)
- Students thriving (green checks)
- Recommended interventions

**EXAMPLE:**
```
┌───────────────────────────────────────┐
│  STORYFLOW DASHBOARD                  │
├───────────────────────────────────────┤
│  🔴 AT RISK (3)                       │
│  - Nhan: Echo stage, 3 sad moods      │
│    [Intervene Now]                    │
│  - Huong: 7 days inactive             │
│    [Send Message]                     │
│                                       │
│  🟡 PLATEAU (5)                       │
│  - Quang: Echo stage, 15 days         │
│    [Check In]                         │
│                                       │
│  🟢 THRIVING (12)                     │
│  - Kiet: Breakthrough stage           │
│    [Celebrate]                        │
└───────────────────────────────────────┘
```

---

# 5. LESSON DELIVERY SYSTEM: THE CLASSROOM

## 5.1 OVERVIEW

**NET Lesson Delivery System is the digital classroom where lessons are accessed and completed.**

### FORMATS

1. **Web App** (primary, desktop + mobile browser)
2. **Mobile App** (iOS + Android, future)
3. **In-Person** (teacher uses projector + printed materials)

---

## 5.2 WEB APP STRUCTURE

### HOME SCREEN
```
┌────────────────────────────────────┐
│  Welcome back, Kiet!               │
│  Level 3 | 450 XP | 🔥 29 streak  │
├────────────────────────────────────┤
│  📚 Today's Lesson                 │
│  "Sarcasm Academy: Yeah Right"     │
│  [Start Lesson]                    │
│                                    │
│  🎯 Daily Practice                 │
│  Listening: ✅ 45 min              │
│  Speaking: ⬜ Not done             │
│  [Practice Now]                    │
│                                    │
│  👥 Buddy Session                  │
│  Next: Saturday 3pm with Nhan      │
│  [Message Buddy]                   │
└────────────────────────────────────┘
```

---

### LESSON INTERFACE (ROOM-BASED NAVIGATION)

**DESIGN PHILOSOPHY:** Lessons are not documents. They are **experiences**.

**STRUCTURE:**
- **Landing Page:** Epic hero section, "Enter" button
- **Room 1:** Vocabulary Arsenal (10 words)
- **Room 2:** Idiom Lab (5 idioms)
- **Room 3:** Slang Zone (5 slang)
- **Room 4:** Game 1 (Warm-up)
- **Room 5:** Input Chamber (Grammar/pattern)
- **Room 6:** Game 2 (Mid-lesson)
- **Room 7:** Free Practice Arena (conversation prompts)
- **Room 8:** Game 3 (Final challenge)
- **Room 9:** Feedback Throne (recap)
- **Room 10:** Homework Quest (assignment)

**NAVIGATION:**
- Progress indicator (dots showing current room)
- Previous/Next buttons
- Smooth fade-in transitions
- "Complete & Exit" button

---

### AUDIO RECORDER COMPONENT

**USE CASE:** Students record themselves speaking for pronunciation practice.

**FEATURES:**
- Record button (visual feedback while recording)
- Playback button (listen to recording)
- Download button (save audio file)
- Submit button (send to teacher for review)

**TECHNICAL:**
- Use Web Audio API (browser-based, no external library)
- Save as .webm or .mp3
- Upload to server securely (Phoenix P0 compliance)

---

### GAME INTERFACE

**GAME TYPES:**
1. **Quiz** (multiple choice, true/false)
2. **Matching** (drag-and-drop pairs)
3. **Fill-in-the-Blank** (type answer)
4. **Roleplay** (conversation simulator)
5. **Timer Challenge** (speak for X seconds)

**EXAMPLE: SARCASM QUIZ**
```
┌────────────────────────────────────┐
│  🎮 GAME: Sarcasm Detector         │
├────────────────────────────────────┤
│  Listen to the audio clip.         │
│  Is the speaker being sarcastic?   │
│                                    │
│  🔊 "Oh great, another meeting."   │
│                                    │
│  [ Yes, sarcastic ]                │
│  [ No, sincere ]                   │
│                                    │
│  Score: 4 / 10                     │
└────────────────────────────────────┘
```

---

## 5.3 MOBILE APP (FUTURE)

### MUST-HAVES
- Offline mode (download lessons)
- Push notifications (streak reminders)
- Voice input (hands-free practice)
- Swipe navigation (between rooms)

### NICE-TO-HAVES
- Dark mode (already default per Gospel 444)
- Widget (streak counter on home screen)
- Apple Watch integration (quick practice reminders)

---

# 6. ENTERPRISE DASHBOARD: THE B2B PLATFORM

## 6.1 OVERVIEW

**Enterprise Dashboard is NET's B2B product for corporate clients.**

### TARGET USERS
- **HR Managers** (track employee progress)
- **Team Leads** (monitor team performance)
- **Finance** (ROI calculation)

---

## 6.2 KEY FEATURES

### 6.2.1 COMPANY OVERVIEW

**METRICS:**
- Total employees enrolled
- Average attendance rate (target: 85%+)
- Average XP gain per week
- Completion rate (% who finish program)
- Mood trends (% happy, neutral, sad)

**VISUAL:**
```
┌────────────────────────────────────┐
│  COMPANY: BlueTech Solutions       │
├────────────────────────────────────┤
│  📊 Employees: 50                  │
│  📈 Attendance: 87%                │
│  🎯 Avg XP/week: 120               │
│  ✅ Completion: 82%                │
│                                    │
│  😊 Mood: 68% Happy                │
│  😐 Mood: 25% Neutral              │
│  😔 Mood: 7% Sad                   │
└────────────────────────────────────┘
```

---

### 6.2.2 INDIVIDUAL EMPLOYEE TRACKING

**HR MANAGERS CAN:**
- View each employee's progress
- See attendance history
- Track XP and level
- Read teacher comments
- Access audio recordings (pronunciation)

**PRIVACY:**
- Employees are anonymized (Employee ID, not full name)
- Audio recordings require employee consent

---

### 6.2.3 ROI CALCULATOR

**PURPOSE:** Show financial impact of NET training.

**INPUTS:**
- Number of employees
- Average salary
- Training cost per employee

**OUTPUTS:**
- Productivity gain estimate (based on confidence increase)
- Cost of miscommunication (meetings, deals lost)
- ROI in 6 months

**EXAMPLE:**
```
Investment: 50 employees x 5M VND = 250M VND
Estimated ROI (6 months):
- 10% productivity increase = 500M VND
- 2 deals closed (better communication) = 200M VND
- Total ROI: 700M VND (280% return)
```

---

### 6.2.4 CUSTOM REPORTING

**MANAGERS CAN:**
- Export CSV of all employee data
- Generate monthly progress reports
- Compare teams (Sales vs. Engineering)
- Track before/after assessment scores

---

## 6.3 ENTERPRISE API (FUTURE)

**VISION:** Companies can integrate NET data into their own HR systems.

**ENDPOINTS:**
- `GET /api/company/{id}/employees` (list all enrolled)
- `GET /api/employee/{id}/progress` (individual data)
- `POST /api/employee/enroll` (add new employee)
- `GET /api/company/{id}/analytics` (aggregated metrics)

**AUTHENTICATION:**
- API key (company-specific)
- OAuth 2.0 (for sensitive data)

---

# 7. TECHNICAL ARCHITECTURE: THE STACK

## 7.1 FRONTEND

### WEB APP (V1)

**FRAMEWORK:** Vanilla JavaScript (no React, per Gospel 444)

**WHY VANILLA JS?**
- Lightweight, fast loading
- No framework dependencies (reduces complexity)
- Better security control (Phoenix P0 compliance)
- Easier to maintain long-term

**LIBRARIES ALLOWED:**
- **Alpine.js** (optional, for reactive data binding)
- **HTMX** (optional, for server-side rendering enhancements)

**FONTS:**
- Inter (UI text)
- JetBrains Mono (code/tech)
- Loaded from Google Fonts CDN

**ICONS:**
- Lucide (primary)
- Phosphor (secondary)
- Inline SVGs (for performance)

---

### MOBILE APP (V2)

**FRAMEWORK:** React Native (cross-platform, iOS + Android)

**WHY REACT NATIVE?**
- Single codebase for both platforms
- Large community, stable ecosystem
- Native performance

**ALTERNATIVE:** Flutter (if preferred, both are acceptable)

---

## 7.2 BACKEND

### SERVER

**FRAMEWORK:** Node.js + Express.js

**WHY NODE.JS?**
- JavaScript on server = same language as frontend
- High performance for real-time features (WebSocket)
- Large ecosystem (NPM packages)

**ALTERNATIVE:** Python + FastAPI (acceptable for AI-heavy features)

---

### DATABASE

**PRIMARY:** PostgreSQL (relational database)

**WHY POSTGRES?**
- ACID compliance (data integrity)
- Powerful querying (joins, indexes)
- JSON support (flexible schema)

**SCHEMA:**
- Users (accounts, profiles)
- Lessons (content, metadata)
- Progress (XP, streaks, mood)
- Assessments (scores, recordings)

**BACKUP:**
- Daily automated backups
- 30-day retention

---

### FILE STORAGE

**AUDIO RECORDINGS:** AWS S3 (or DigitalOcean Spaces)

**WHY S3?**
- Scalable (infinite storage)
- Secure (encryption at rest)
- CDN integration (fast delivery)

---

## 7.3 INFRASTRUCTURE

### HOSTING

**OPTION 1:** Vercel (frontend) + Railway (backend)
- Easy deployment
- Automatic HTTPS
- Git-based CI/CD

**OPTION 2:** AWS (EC2 + RDS + S3)
- Full control
- Scalable to enterprise
- More expensive

**RECOMMENDATION:** Start with Vercel + Railway, migrate to AWS as needed.

---

### CDN

**PURPOSE:** Deliver static assets (CSS, JS, images) fast globally.

**PROVIDER:** Cloudflare

**WHY CLOUDFLARE?**
- Free tier (generous)
- DDoS protection
- Global edge network

---

### MONITORING

**UPTIME:** UptimeRobot (ping every 5 minutes)

**LOGS:** LogRocket or Sentry (error tracking)

**ANALYTICS:** 
- Google Analytics (user behavior)
- Custom dashboards (NET-specific metrics)

---

## 7.4 AI/ML SERVICES

### PRONUNCIATION ANALYSIS

**PROVIDER:** Google Cloud Speech-to-Text API

**FEATURES:**
- Transcribe audio
- Pronunciation assessment
- Confidence score

---

### CONVERSATIONAL AI (NET PET V2)

**PROVIDER:** Anthropic Claude API

**FEATURES:**
- Chatbot conversations
- Grammar correction
- Content generation (lesson ideas)

---

### PREDICTIVE ANALYTICS (STORYFLOW)

**PURPOSE:** Predict which students will complete program.

**MODEL:** Logistic regression (simple, interpretable)

**FEATURES:**
- Attendance rate
- XP growth rate
- Mood trends
- Buddy session completion

**OUTPUT:** Completion probability (0-100%)

---

# 8. API SPECIFICATIONS: THE INTERFACES

## 8.1 REST API (V1)

### AUTHENTICATION

**METHOD:** JWT (JSON Web Tokens)

**LOGIN FLOW:**
1. User sends email + password
2. Server validates credentials
3. Server returns JWT token
4. Client includes token in all subsequent requests

**HEADERS:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### ENDPOINTS

#### AUTH
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password
```

#### USER PROFILE
```
GET /api/user/profile
PUT /api/user/profile
GET /api/user/progress
```

#### LESSONS
```
GET /api/lessons (list all)
GET /api/lessons/:id (single lesson)
POST /api/lessons/:id/complete (mark done)
```

#### NET PET
```
GET /api/pet/status (XP, streak, mood)
POST /api/pet/log-practice (record daily practice)
GET /api/pet/badges (list achievements)
```

#### BUDDY SYSTEM
```
GET /api/buddy/partner (current buddy)
POST /api/buddy/session (log buddy session)
GET /api/buddy/availability (find available partners)
```

#### ASSESSMENTS
```
POST /api/assessment/intake (submit intake test)
GET /api/assessment/results
POST /api/assessment/audio-upload
```

---

## 8.2 GRAPHQL API (V2)

**VISION:** Replace REST with GraphQL for flexibility.

**BENEFITS:**
- Single endpoint
- Client requests only needed data
- Reduces over-fetching

**EXAMPLE QUERY:**
```graphql
query {
  user(id: "uuid") {
    name
    level
    xp
    streak
    mood(last: 7)
    lessons(completed: true) {
      title
      date
    }
  }
}
```

---

# 9. DATA & ANALYTICS: THE INTELLIGENCE

## 9.1 KEY METRICS (KPIs)

### USER METRICS
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Churn rate (% who quit)

### ENGAGEMENT METRICS
- Avg session duration
- Lessons completed per week
- Buddy sessions per month
- Monthly event attendance

### LEARNING METRICS
- Avg XP gain per week
- Streak length distribution
- Mood trends (happy/neutral/sad %)
- Completion rate (finish program)

### FINANCIAL METRICS
- MRR (Monthly Recurring Revenue)
- LTV (Lifetime Value per student)
- CAC (Customer Acquisition Cost)
- LTV/CAC ratio (target: 3:1)

---

## 9.2 ANALYTICS DASHBOARD (INTERNAL)

**FOR:** Michael Hobbs (Executor), NET team

**VIEWS:**
- Real-time user activity (live map)
- Revenue dashboard (MRR, churn, growth)
- Lesson popularity (most/least completed)
- Student cohort analysis (retention by month)

**TOOLS:**
- Google Data Studio (visualization)
- Metabase (SQL queries)
- Custom dashboards (React + Chart.js)

---

## 9.3 A/B TESTING

**PURPOSE:** Test product decisions with data.

**EXAMPLES:**
- Test 2 onboarding flows (which converts better?)
- Test streak reminder timing (morning vs. evening)
- Test lesson formats (10-5-5-3 vs. different structure)

**TOOL:** Google Optimize or custom implementation

---

# 10. PRODUCT ROADMAP: THE FUTURE

## 10.1 V0 (FOUNDATION) — COMPLETE

**STATUS:** ✅ SHIPPED

**FEATURES:**
- NET consumer website
- Intake assessment system
- Basic lesson delivery (web)
- Phoenix P0-P2 security
- NET PET V1 (XP, streaks, mood)

---

## 10.2 V1 (SCALE) — IN PROGRESS

**TARGET:** Q1 2026

**FEATURES:**
- [ ] StoryFlow V1 (Echo Chamber Arc)
- [ ] Buddy System (manual pairing)
- [ ] Enterprise Dashboard V1 (basic metrics)
- [ ] 80 lesson templates (complete curriculum)
- [ ] Mobile-responsive web app

---

## 10.3 V2 (GROWTH) — 2026

**TARGET:** Q4 2026

**FEATURES:**
- [ ] Mobile app (iOS + Android)
- [ ] NET PET V2 (AI pronunciation feedback)
- [ ] StoryFlow V2 (5 arcs, adaptive)
- [ ] Enterprise Dashboard V2 (ROI calculator, custom reports)
- [ ] API V1 (public endpoints for partners)
- [ ] Community platform (forums, events)

---

## 10.4 V3 (DOMINATION) — 2027

**TARGET:** 2027+

**FEATURES:**
- [ ] Franchise system (white-label platform)
- [ ] NET PET V3 (conversational AI coach)
- [ ] StoryFlow V3 (procedurally generated lessons)
- [ ] GraphQL API (replace REST)
- [ ] Advanced analytics (ML-powered insights)
- [ ] International expansion (Thailand, Philippines)

---

## 10.5 EXPERIMENTAL (FUTURE RESEARCH)

**VOICE-ONLY MODE:**
- Students practice entirely via voice (no typing)
- AI transcribes and provides feedback in real-time

**VR CLASSROOM:**
- Immersive English practice in virtual environments
- Simulate real-world scenarios (airport, restaurant, office)

**NEURAL INTERFACE:**
- Brain-computer interface for accelerated learning
- Science fiction today, possible tomorrow

---

# 🔒 CANON LOCK

This Product Bible is now **LOCKED**.

All NET product development, technical architecture, and feature implementations MUST align with this canon.

**Any deviation requires Executor approval and version update.**

**Next Update:** When product evolution requires new features or systems (expected: 6 months post-launch)

---

**END OF NET PRODUCT BIBLE V1 — THE COMPLETE TECHNICAL & PRODUCT SYSTEM**

🟣 Security First | AI-Powered | Data-Driven | Future-Ready