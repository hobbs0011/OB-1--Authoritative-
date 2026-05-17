# OBI Chrome Extension — Sideload Guide for Students
**For:** Mai Tram, Huong, Quy (and any new students)
**Last Updated:** 2026-03-31
**Cost:** $0 (no Chrome Web Store publish needed)

---

## 🎯 What This Does

The OBI Chrome Extension gives students:
1. **Magic Chat** — AI-powered English conversation practice
2. **Homework Checker** — Take a photo of schoolwork → get instant feedback
3. **Translation + Summarization** — Built into the browser

---

## 📱 Student Setup (5 minutes)

### Step 1: Download the Extension

**Option A — From GitHub (recommended):**
1. Go to: `https://github.com/hobbs0011/Phoenix-Rising-Protocol-Ultimate`
2. Click green **"Code"** button → **"Download ZIP"**
3. Unzip the file
4. Find the folder: `APPS/obi-chrome-extension/`

**Option B — Teacher sends ZIP:**
1. Teacher creates a ZIP of the `APPS/obi-chrome-extension/` folder
2. Send via Zalo, email, or USB
3. Student unzips on their computer

### Step 2: Load in Chrome

1. Open Chrome browser
2. Type in the address bar: `chrome://extensions`
3. Turn ON **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `obi-chrome-extension` folder
6. Done! The OBI icon appears in the toolbar

### Step 3: Set Up Gemini API Key (for Homework Checker)

1. Go to: https://aistudio.google.com/apikey
2. Sign in with any Google account
3. Click **"Create API Key"**
4. Copy the key
5. Open the Homework Checker (click OBI icon → Homework tab)
6. Paste the key when prompted
7. The key is saved locally — students only do this once

---

## 📸 Using the Homework Checker (Phone)

Students can also use the Homework Checker directly from their phone:

1. Open this URL on their phone browser: 
   - **GitHub Pages:** (deploy pending)
   - **Local:** Open `homework-checker.html` directly
2. Tap **"Take a photo"**
3. Camera opens → snap homework
4. Select subject
5. Tap **"Check My Work"**
6. Get instant feedback!

**Note:** Works on any phone with a camera and internet. No app install needed.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not loading | Make sure Developer Mode is ON |
| "Load unpacked" grayed out | You need to enable Developer Mode first |
| API key not working | Get a new key at aistudio.google.com/apikey |
| Photo not uploading | Try a smaller/clearer photo (under 20MB) |
| Homework Checker says error | Check internet connection, try again |

---

## 🔒 Privacy

- **API key** stays on the student's device (localStorage)
- **Photos** are sent directly to Google's Gemini API and NOT stored
- **No data** is collected by Natural English Training
- Students can delete the extension at any time

---

## 📋 Teacher Setup Checklist (Michael)

- [ ] Git pull latest from `hobbs0011/Phoenix-Rising-Protocol-Ultimate`
- [ ] ZIP the `APPS/obi-chrome-extension/` folder
- [ ] Send ZIP to Mai Tram, Huong, Quy via Zalo
- [ ] Walk them through Steps 2-3 during private class
- [ ] Have them test with a real homework photo
- [ ] Optionally: deploy `homework-checker.html` to GitHub Pages for phone access

---

*Natural English Training — OBI Homework Checker v1.0*
*Mouse → Tiger: Permission → Confidence → Competence → Mastery*
