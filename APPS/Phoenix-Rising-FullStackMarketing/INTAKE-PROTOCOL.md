# INTAKE PROTOCOL — Agent 99 Marketing Intake Pipeline

## When Michael drops files into `raw-intake/`

Agent 99 runs `/marketing-intake` with the following steps:

### Step 1 — SCAN
- If PDF: detect page count. Each page = one asset to process.
- If image: classify directly.
- Report: file type, page count (if PDF), estimated asset count.

### Step 2 — CLASSIFY each asset
Determine and record:
```json
{
  "id": "{product}-{category}-{descriptor}",
  "file": "{folder}/{filename}.webp",
  "source_file": "raw-intake/{original}",
  "source_page": 1,
  "name": "Human-readable name",
  "category": "one of: core-art | logo | icon | emoji | discord-sticker | facebook-cover | linkedin-cover | social-square | sales-funnel-hero | website-hero | character-art | ...",
  "product": "one of: obi | net | train-67 | galaxy | sovereign | brand | shared",
  "use_slots": ["list of applicable use slots from INDEX.json _meta"],
  "format": "webp",
  "dimensions": "WxH",
  "tags": ["descriptive", "tags"],
  "gospel_444_grade": "PASS | CONDITIONAL | FAIL",
  "gospel_444_notes": "any compliance notes",
  "cdn_url": "https://assets.naturalenglishtraining.net/marketing/{path}"
}
```

### Step 3 — GOSPEL 444 CHECK
For every asset, verify:
- Background is void black `#0f0f1a` or compliant dark surface ✅/❌
- No blue in primary design elements ✅/❌
- Purple `#a855f7` and/or gold `#f59e0b` present as accent ✅/❌
- Typography if present: Orbitron/Rajdhani or Inter ✅/❌
- Grade: PASS / CONDITIONAL (minor deviation) / FAIL (brand violation)

#### Visible Text — Hybrid Copy Rule
**KEEP** (do not flag): Creative brand language, narrative metaphors, and product story terms that read
as intentional marketing copy — even if they originated from internal vocabulary.
Examples of KEEP: "Tiger Mode", "The Grammar Prison", "Phoenix Way", "The Empire", "AI is Coach"

**FLAG for removal**: Internal system metadata that leaked into visible slide/image text.
This includes: design token names with hex codes (`Sovereign Gold (#f59e0b)`), font name annotations
(`JetBrains Mono` as a panel label), color variable labels, protocol codes, file paths, and any
annotation that reads as a dev/design artifact rather than intentional copy.
Rule of thumb: **if a stranger would find the text confusing or technical, it's backroom — remove it.**

### Step 4 — CONVERT
- Convert to WebP if not already
- Name per convention: `{product}-{category}-{descriptor}.webp`
- Move to target folder (art/ | logos/ | iconology/ | social/ | etc.)

### Step 5 — INDEX
Append entry to `INDEX.json` assets array.
Check for duplicates before appending (`id` must be unique).

### Step 6 — COMMIT
```
git add INDEX.json {processed files}
git commit -m "intake: {asset-name} — {category} ({page count if PDF})"
git push origin main
```

### Step 7 — REPORT back to Michael
```
INTAKE COMPLETE — {asset-name}
Assets processed: {N}
Gospel 444: {X} PASS | {Y} CONDITIONAL | {Z} FAIL
INDEX entries added: {N}
SHA: {commit hash}
Use slots ready: {list most  important ones}
```

---

## Example INDEX entry (reference)

```json
{
  "id": "net-marketing-tiger-mode-evolution",
  "file": "sales-funnel/tiger-mode-evolution.webp",
  "source_file": "raw-intake/tiger-deck.pdf",
  "source_page": 3,
  "name": "Tiger Mode Evolution",
  "category": "sales-funnel-hero",
  "product": "net",
  "use_slots": ["sales-funnel-hero", "website-hero", "social-square-1080", "linkedin-post-1200x627"],
  "format": "webp",
  "dimensions": "1200x628",
  "tags": ["tiger-mode", "evolution", "progression", "transformation", "mouse-to-tiger"],
  "gospel_444_grade": "PASS",
  "gospel_444_notes": "void black bg, gold accent, purple typography",
  "cdn_url": "https://assets.naturalenglishtraining.net/marketing/sales-funnel/tiger-mode-evolution.webp"
}
```
