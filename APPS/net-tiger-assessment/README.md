# net-tiger-assessment
NET Tiger Assessment — Bilingual English Assessment for Vietnamese Students

## OBI Agent Widget

The site ships with OBI — a floating bilingual AI assistant widget — included on all three pages:

- **`index.html`** (main assessment page & entry point)
- **`about.html`** (founder & NET-PET-AI page)
- **`classroom.html`** (Classroom Manager for teachers)

Each of these pages loads the shared `assets/css/obi-widget.css` and `assets/js/obi-widget.js`. Each page has its own widget instance, but these instances do **not** run concurrently across the site: only the instance on the page currently open in the browser is active at any given time.

The OBI knowledge base covers both student-facing topics (assessment sections, phonics recording, submission) and teacher-facing topics (Notes Checker, Roster, Session Log, Gemini API key setup).

## Site Pages

- **`index.html`** — Main assessment & landing page
- **`about.html`** — Founder bio & NET-PET-AI section
- **`classroom.html`** — Classroom Manager for teachers
