# ⚡ IMMEDIATE EXECUTION SEQUENCE — READY NOW

**Status:** All prep complete. Awaiting your 4 inputs to GO LIVE.

---

## YOUR 4 INPUTS (Copy-Paste Ready)

**Paste these into your terminal right now:**

### INPUT 1: API Keys
```
What you need to do:
1. Go to https://platform.deepseek.com/ → Get DEEPSEEK_API_KEY
2. Go to https://console.deepgram.com/ → Get DEEPGRAM_API_KEY
3. Already have NOTION_API_KEY? Confirm or get new one

Then paste here or in DM:
DEEPSEEK_API_KEY=[paste]
DEEPGRAM_API_KEY=[paste]
NOTION_API_KEY=[paste]
```

### INPUT 2: ManyChat Setup
```
Status: START THIS NOW (takes 24-48 hours)
Go to: https://go.manychat.com/
Create business account → Verify email
Get API keys from dashboard
Estimated time: 30 min setup + 24-48 hr approval
```

### INPUT 3: Stripe Testing
```
Already have Stripe? Sign in: https://dashboard.stripe.com/

If new:
1. Create account
2. Create Product: "NET-PET-AI Group Class" ($500k VND)
3. Generate payment link
4. Test with card: 4242 4242 4242 4242 (expires: 12/25, CVC: 123)

Estimated time: 30 min
```

### INPUT 4: Student List
```
Provide 10-15 high school students:

Student Name | Phone/Contact | Accountability Partner (if any)
---|---|---
Tram Nguyen | +84912345678 | Mom (Lan)
Quy Pham | +84987654321 | Boss (Mr. Duc)
... (8-13 more) | ... | ...

Estimated time: 5 min
```

---

## EXECUTION COMMANDS (Run These in Terminal Once You Have Inputs)

### Once You Have API Keys:

```powershell
# From D:\OB-1\APPS\NET-PET-AI directory
cd d:\OB-1\APPS\NET-PET-AI

# Set production secrets (replace YOUR_KEY_HERE with actual values)
npx wrangler secret put DEEPSEEK_API_KEY --env production
# Paste your key when prompted

npx wrangler secret put DEEPGRAM_API_KEY --env production
# Paste your key when prompted

npx wrangler secret put NOTION_API_KEY --env production
# Paste your key when prompted

# Verify secrets were set
npx wrangler secret list --env production
# Should show all 3 keys (values hidden for security)
```

### Deploy to Production:

```powershell
# Still in D:\OB-1\APPS\NET-PET-AI
npx wrangler deploy --env production

# Verify deployment
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/health
# Should return: { "status": "ok" }
```

### Enroll First 10 Students (I'll run this, you just provide names):

```javascript
// I will generate this script once you provide student list
// It will:
// 1. Create ProfileDO for each student
// 2. Generate parent dashboard links
// 3. Create enrollment record

// Example output:
// Student: Tram Nguyen (ID: student-001)
// Parent Link: https://net-pet-ai.workers.dev/dashboard/parent/token-xyz
// Email to send: [generated email with link + lesson pack]
```

---

## TIMELINE (Once You Hit GO)

```
NOW - Next 2 hours:     You collect API keys + confirm ManyChat in progress + setup Stripe
EOD Today (6 hours):    Deployment complete + first 10 students live
Day 2 (24 hours):       ManyChat approves + you pitch to students
Day 3-7:                Revenue tracking + bug fixes + scale to 50 students
```

---

## SUCCESS SIGNALS (Watch For These)

✅ **Deployment Success:**
```
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/health
→ Response: { "status": "ok" }
```

✅ **First Student Account Created:**
```
Student Name: Tram Nguyen
Student ID: student-001
Enrollment Time: 2026-04-20T14:30:00Z
First Lesson: Level 1 - Past Tense Basics
```

✅ **First Chat Test:**
```
Student message: "I goed to school"
OBI response: "Good effort! The correct form is 'I went to school.'
Why: 'went' is the past tense of 'go,' not 'goed.'
Confidence: 95%"
```

✅ **Parent Dashboard Live:**
```
URL: https://net-pet-ai.workers.dev/dashboard/parent/token-xyz
Shows: Student name + sessions count + weak areas
```

---

## DECISION GATE: DO YOU HAVE THE INPUTS?

**YES:** Provide them below (or via DM), I execute in parallel with your setup tasks
**NO:** Which ones are you missing? I can help you find them

---

## FINAL CHECKLIST (Before You Hit GO)

- [ ] API keys obtained (or know where to get them)
- [ ] ManyChat account creation started
- [ ] Stripe account ready (or will create today)
- [ ] Student list drafted (10-15 names)
- [ ] Canary Scope reviewed + approved
- [ ] Ready to deploy within 6 hours

**Once all checked: Signal GO and provide inputs**

---

**STANDING BY FOR ACTIVATION**
