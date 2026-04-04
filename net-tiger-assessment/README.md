# net-tiger-assessment
NET Tiger Assessment — Bilingual English Assessment for Vietnamese Students

## OBI Agent Widget

The site ships with OBI — a floating bilingual AI assistant widget — included on all three pages:

- **`index.html`** (main assessment page)
- **`assessment.html`** (assessment entry point)
- **`about.html`** (founder & NET-PET-AI page)

Each page loads the same shared `assets/css/obi-widget.css` and `assets/js/obi-widget.js`. Each page has its own widget instance, but these instances do **not** run concurrently across the site: only the instance on the page currently open in the browser is active at any given time.
