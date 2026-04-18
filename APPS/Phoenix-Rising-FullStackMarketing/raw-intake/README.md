# raw-intake — DROP ZONE

Drop raw files here. Agent 99 will process them via the intake pipeline.

## Accepted formats
- `.pdf` — notebook exports, multi-page decks (each page = one asset)
- `.png` / `.jpg` / `.jpeg` / `.webp` — single images
- `.svg` — vector art
- `.pptx` — slide decks

## What happens next
1. Agent scans every page/image
2. Classifies: category, product, use slots, Gospel 444 compliance
3. Converts to WebP (where applicable)
4. Moves output to `processed/` with clean filename
5. Writes entry to `INDEX.json`
6. Commits with message: `intake: {asset-name} — {category}`

## Do NOT commit binaries to git
Large binaries (>5MB, video, audio) go to R2 instead.  
Index entry still gets created — R2 CDN URL is recorded.
