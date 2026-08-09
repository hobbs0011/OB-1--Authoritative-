# CASA Dei Sol Montessori — Parent Portal Proposal

**Date:** 2026-08-09  
**Prepared for:** Anh Bảo, CASA Dei Sol Montessori  
**By:** Michael Hobbs / NET English Training  
**Status:** PITCH — ready for review

---

## What This Is

A **working demo** of a parent portal for Casa Dei Sol Montessori. This is not a finished product — it's a proof-of-concept showing exactly what we can build for your school. Open it in a browser, log in with the demo credentials, and see the experience firsthand.

**Live demo:** `public/casa-parent-portal/index.html`

---

## Why Parents Need This

Modern parents expect digital access to their child's education. Right now, most Montessori schools rely on:
- Paper newsletters (lost, forgotten, outdated)
- Casual pick-up conversations (missed, forgotten)
- Group Zalo broadcasts (noise, not personal)

A parent portal changes this. Parents get:
- **Real-time visibility** into their child's daily journey
- **Photo galleries** of their child at work
- **Direct messaging** with teachers
- **Progress tracking** across all five Montessori areas
- **Event reminders** that actually get seen

This isn't just nice-to-have. In a competitive market like HCMC preschool, this is a **differentiator**.

---

## What's In The Demo

| Feature | Status | Notes |
|---------|--------|-------|
| **Parent Login** | Working | Email + password, demo credentials provided |
| **Child Selector** | Working | Switch between multiple children |
| **Daily Activity Timeline** | Working | Shows time-stamped activities by Montessori area |
| **Photo Gallery** | Working | Weekly photo grid with captions |
| **Upcoming Events** | Working | Calendar view with school events |
| **Teacher Messaging** | Working | Message list with unread indicators |
| **Progress Tracking** | Working | Ring charts for Practical Life, Sensorial, Language, Math |
| **Stats Dashboard** | Working | Days present, milestones, photos, messages |

---

## Brand Alignment

The portal uses Casa Dei Sol's actual brand assets:
- **Logo:** Live from `casadeisol.edu.vn`
- **Colors:** Teal `#257c84` (your brand color), warm cream, gold accents
- **Fonts:** Playfair Display (headings), Inter (body), Dancing Script (accent)
- **Vibe:** Warm, educational, professional — matches your WordPress theme

---

## Implementation Plan

### Phase 1 — MVP (4-6 weeks)
- Parent authentication (email/password)
- Teacher dashboard to upload photos and notes
- Daily activity feed
- Basic messaging

### Phase 2 — Enhanced (2-4 weeks)
- Photo gallery with albums
- Event calendar with RSVP
- Progress tracking with Montessori framework
- Push notifications

### Phase 3 — Advanced (optional)
- AI-powered milestone detection from photos/notes
- Parent-teacher video call integration
- Billing and payment portal
- Multi-language support (VI/EN)

---

## Technical Stack

- **Frontend:** Static HTML/CSS/JS (as shown in demo)
- **Hosting:** Cloudflare Pages (same infrastructure as NET)
- **Backend:** Cloudflare Workers + D1 database
- **Auth:** Email/password with secure token-based sessions
- **Storage:** Cloudflare R2 for photos and media
- **Cost:** Minimal — runs on edge infrastructure, scales with usage

---

## What I Need From Anh Bảo

1. **Review this demo** — open `public/casa-parent-portal/index.html` and navigate through it
2. **Feedback on features** — what's missing? What's not needed?
3. **Teacher workflow** — how do teachers currently share updates? What would they need?
4. **Timeline** — when would you want this live?
5. **Pricing discussion** — this is a custom build, not a template

---

## The Pitch

> "Anh Bảo, imagine this: every parent at Casa Dei Sol opens their phone and sees exactly what their child did today — the math beads they counted, the story they read, the friend they played with. They see photos. They get reminders about field trips. They can message the teacher directly. All in one place, branded like Casa Dei Sol, secure and private."

> "This isn't a website. This is the parent experience. And right now, none of your competitors have it."

---

## Next Steps

1. Schedule a 30-minute demo call
2. Walk through the portal together
3. Discuss customization needs
4. Agree on timeline and pricing
5. Sign contract and begin Phase 1

---

**Contact:** mrmichaelhobbs123@gmail.com  
**Demo:** `public/casa-parent-portal/index.html`  
**School website:** https://casadeisol.edu.vn
