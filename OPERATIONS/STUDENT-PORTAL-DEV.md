# Student Portal Development — Session Context

Last updated: 2026-05-24

---

## What Exists Now

### Minh's Parent Portal
- **File:** `APPS/NET-PET-AI/public/minh-parent-portal.html`
- **Live URL:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/minh-parent-portal.html
- **Login:** michelletran2609@gmail.com / minh2026
- **Parent name in portal:** Dung (share with Duong)
- **Status:** V0 complete — deployed 2026-05-24

### Minh's Profile Page
- **File:** `APPS/NET-PET-AI/public/minh-profile.html`

---

## Audio Processing Pipeline (built this session)

### Source Files (local only — not in repo)
| File | Duration | Notes |
|---|---|---|
| `C:\Users\mrmic\Downloads\Minhmay1.m4a` | 52 min | Full session |
| `C:\Users\mrmic\Downloads\Minhmay8.m4a` | 1.4 min | Highlight clip |
| `C:\Users\mrmic\Downloads\Minhmay222026.m4a` | 56 min | Full session |
| `C:\Users\mrmic\Downloads\Minhmay19.m4a` | 67 min | Full session |
| `C:\Users\mrmic\Downloads\Telegram Desktop\minh\*.m4a` | various | March-April sessions + highlight clips |
| `C:\Users\mrmic\Downloads\Minhmay222026.m4a` (Telegram Desktop root) | 2.4MB | CORRUPTED — moov atom missing |

### Processed Clips
All output to `D:\OB-1-CANONICAL\minh-clips\`
- `clip1-superheroes.mp3` — April 13 highlight
- `clip2-helicopter.mp3` — April 24 highlight
- `clip3-march31.mp3` — March 31 @ 10min
- `clip4-may19.mp3` — May 19 @ 15min
- `may1-8min.mp3`, `may1-20min.mp3`, `may1-38min.mp3`
- `may22-10min.mp3`, `may22-25min.mp3`, `may22-42min.mp3`
- `may8-highlight.mp3`

Audio enhancement: `highpass=f=80 + acompressor + loudnorm` via ffmpeg

### Transcription
- **Endpoint:** `POST /api/stt?diarize=true` (Deepgram Nova-3 + speaker diarization)
- **Minh = Speaker 1 (S1)** across all clips — shorter turns, child patterns
- **Michael = Speaker 0 (S0)** — dominant, teacher language
- Full transcript + summaries: `D:\OB-1-CANONICAL\minh-clips\MINH-SNIPPETS.md`

---

## Teddy Bear Artwork (Minh's)
4 AI-generated images, all deployed to `public/`:
- `teddy-karate.jpg` — Bear in karate gi doing a kick
- `teddy-superhero.jpg` — Bear in superhero suit defeating villain
- `teddy-icecream-sad.jpg` — Bear on bench covered in ice cream, speech bubble "I ate too much icecream =("
- `teddy-icecream-feast.jpg` — Bear surrounded by Mini Scoops tubs

Displayed in portal as "MINH'S WORLD" section with captions tied to session quotes.

---

## NET-PET-AI Worker Changes (this session)
- Added `?diarize=true` query param support to `/api/stt` endpoint
- Returns `utterances[]` with `speaker`, `transcript`, `start`, `end` when diarize=true
- Deployed: Version `06980d83-a602-4d86-b63b-70c10d3da11d`

---

## Next Steps for Portal V1

- [ ] Add actual audio player (link to real MP3 clips hosted on R2 or ASSETS)
- [ ] Wire points counter to live KV data for Minh's studentId
- [ ] Add May 1, May 8, May 22 session cards to CLASS REVIEWS section
- [ ] Pull live quotes from MINH-SNIPPETS.md into the portal
- [ ] Add Minh's profile page link
- [ ] Mobile layout review
- [ ] Consider separate portals per student vs one template

---

## Student Roster (current)
| Student | Portal File | Profile | Notes |
|---|---|---|---|
| Minh | minh-parent-portal.html | minh-profile.html | 5yo, primary student for portal work |
| Quy | — | quy-profile.html | Female, A1, BlueTech employee |
| Mai Tram | — | mai-tram-profile.html | A2/B1 entry intermediate |
| Huong | — | huong-profile.html | |

---

## PCC (Phoenix-Command-Consul)
- **Code:** `APPS/PCC/src/index.js`
- **D1:** soul-archive (`c69a11bc-064b-478f-9b1f-e9b8e2431fb8`)
- **Status:** Not deployed as of 2026-05-24 (error 1042 — worker not found on CF account)
- **Function:** Empire dashboard — monitors worker health, soul-count, PhoenixCoder log, student portals
- **TODO:** Deploy with `cd APPS/PCC && npx wrangler deploy`
