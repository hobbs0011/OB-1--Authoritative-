# Classroom Management App — Feature Spec (Raw Voice)

> **RAW VOICE SPEC.** Extracted verbatim from Gemini live dictation sessions. This is Soul DNA — organized but not summarized. Typos are authenticity markers.

---

## Product Identity

**Lane 1 — The Immediate Painkiller**
Classroom management for ~40 Grade 12 Vietnamese high school students per class.

> *"right now I need to use it as more of like uh in-class disciplinary thing for my high school students"*

> *"I kind of have two promises to keep. I have to keep the um the promise that I was going to have an app available for the high school, which is more about classroom management."*

---

## The Problem (Raw Voice)

> *"it's basically a scam system here like uh the my employer doesn't give a shit if the students learn or not. They just want uh them happy so that they keep paying uh the school"*

> *"I'm tired of uh, you know, uh going in and pretending to teach because it's not right at the end of the day"*

> *"you can't be the discipliner and the teacher at the same time, but unfortunately I have that role"*

> *"the teaching assistants they send uh you um are not qualified or trained at all, even though they have four years of university, but they refuse to discipline the students"*

> *"there's one one man in particular that is uh one of the kind of monitors that walks around, and he's actually been willing to help me this year. So, that's the only reason why I have this kind of opening."*

---

## Core Concept

Automate the **"bad cop"** role. Remove Michael from the disciplinarian position entirely.

> *"I don't make the rules, the system just flagged you"*

The app acts as an uncompromising automated enforcement layer. Michael taps a button → system logs the infraction → flags the account → eventually automates the report to school admin.

---

## User Roles

| Role | Access | Notes |
|------|--------|-------|
| **Teacher (Michael)** | Controller dashboard — tap to flag students | Logs in as controller |
| **Students (~40/class)** | Phone-based session login | Grade 12, Vietnamese |
| **School Admin** | Notified when rules are broken (future feature) | Separate login, receives flagged reports |

---

## Student Flow (Raw Voice)

> *"they're going to log in through their phones. And so it's going to be like a session. There's about 40 students per class. They'll log in and uh we'll go through the lesson"*

1. Students log in via phones → session-based
2. Weekly lessons created by Michael
3. Go through the lesson together
4. Complete minimum required work
5. Second period — free time with basic rules

---

## Minimum Required Work

> *"basically do the minimal amount of required work which is to um note down the uh 10 key vocabulary and then the 10 definitions and then do a short writing exercise"*

- Note down **10 key vocabulary**
- Note down **10 definitions**
- Complete a **short writing exercise**

---

## Rules Structure

### First Period
- Pay attention
- Don't interrupt class
- Do the minimum required work

### Second Period

> *"as long as they stay in their seats and um you know, don't don't have a large noise level"*

- Stay in seats
- Reasonable noise level
- Michael gives them free time (Grade 12 has huge workload)

---

## Enforcement Mechanism

> *"either follow the rules or don't, it's up to you, but um if you don't follow the rules you're the AI is going to flag you and send it off to uh the school"*

> *"the thing they're scared of most is their parents hearing about it. So, that's kind of the leverage I have against them."*

- AI flags rule-breakers → automated report to school admin
- Teacher dashboard: Michael taps to flag students
- School admin login: notified when rules are broken (future feature)
- **Goal:** Remove Michael from disciplinarian role entirely

---

## Pricing

> *"I won't charge any of the high school students uh any money for it. They can use it and then that'll be a good beta testing as well."*

- **Free for all high school students**
- Doubles as beta testing for the broader NET-PET-AI platform

---

## Technical Notes

- Web app (not Google Play Store)
- Hosted via Cloudflare (existing account)
- Phone-based access (no app install required)
- Session-based login per class
- Teacher dashboard for flagging
- School admin notification system (future)

---

## Relationship to NET-PET-AI

This is **Lane 1**. Lane 2 is the long-term revenue engine (NET-PET-AI — AI pronunciation correction + natural conversation training via Deepgram for private students).

> *"I didn't uh set out to create this app. I've I've um had this app in mind for a while. It's it's basically intended to help my students, right? Um I want to be able to offer an app that is not um just just about classroom management, but something that my students can use in their off time"*

The classroom management features will eventually merge into the broader OBI platform — one app, multiple modes.

---

## Gemini's Reality Check (Preserved)

> "The AI isn't an omniscient observer: The app won't be able to physically see or hear who is breaking the rules in the classroom. You (or your TA) will still need to trigger the flag — like tapping a button next to a student's name on your dashboard."

> "The real power is in the automation: Once you tap that button, the app takes over: it logs the infraction, flags the account, and (eventually) automates the report to the school admin. You just say, 'I don't make the rules, the system just flagged you.'"

> "Two different apps (for now): You essentially have two different products here. One is a workflow/accountability tool for a classroom of 40 kids. The other is a real-time, AI-driven audio processing tool (using Deepgram) for private IELTS students. To not get overwhelmed, we will absolutely need to build the simple classroom tracker first."
