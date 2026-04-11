# SKILL: art-arsenal-marketing-intake

## Mission

Intake raw marketing assets (PDFs, images, multi-page notebooks) → classify → index → produce R2-ready entries for the ART-ARSENAL library. Every asset gets a machine-readable record for Agent 99 / MagicChat to recall on command.

## Trigger Phrases

"here's the PDF", "scan this image", "add this to art-arsenal", "index this artwork", "classify these assets", "stage 1 intake", "marketing asset drop"

## Gospel 444 Compliance Check (run before indexing)

Every new asset gets scored:

| Check | Pass Condition |
|-------|---------------|
| Background | Void Black #0f0f1a or transparent |
| Accent | Purple #a855f7 and/or Gold #f59e0b only |
| NO BLUE | Zero blue tones anywhere |
| Visual stack | Glow or glass layer present = bonus |
| Typography | Orbitron/Rajdhani header OR Inter body |
| Grade | PASS / CONDITIONAL / FAIL |

## Stage 1 — Intake Protocol

### For a single image file

1. `view_image` → describe: dimensions, dominant colors, subject, text present
2. Infer category from subject
3. Infer all valid use_slots from platform_dimensions in INDEX.json
4. Propose canonical `id` using schema: `{product}-{category}-{descriptor}`
5. Propose `file` path using schema: `{product}/{category}/{descriptor}.webp`
6. Record Gospel 444 compliance grade
7. Output as ready-to-append INDEX.json block

### For a PDF / multi-page document

1. Use `mcp_microsoft_mar_convert_to_markdown` on the file → extract text + page structure
2. Each visually distinct page = one asset entry
3. Number pages `01`, `02`, etc. if no natural name present
4. For each page: apply single-image protocol above
5. If page is clearly a slide deck, use category `slides` and `id` schema: `{product}-slides-{nn}`
6. Output: full array of INDEX.json ready-to-append blocks, one per page

### For a batch of images

- Process each independently
- Group by product/category for output
- At end: report total count, categories found, any Gospel 444 failures

## Output Schema (per asset)

```json
{
  "id": "{product}-{category}-{descriptor}",
  "file": "{product}/{category}/{descriptor}.webp",
  "name": "{Human Readable Name}",
  "category": "{category from taxonomy}",
  "product": "{product from taxonomy}",
  "format": "webp",
  "dimensions": "{WxH}",
  "tags": ["{search tags}"],
  "use": ["{use_slots from INDEX taxonomy}"],
  "gospel_444": "{PASS|CONDITIONAL|FAIL}",
  "source": "{original filename or PDF page}",
  "intake_date": "{YYYY-MM-DD}"
}
```

## Category → Use Slot Mapping (default suggestions)

| Category | Auto-suggest use_slots |
|----------|----------------------|
| logos | logo-primary-dark, logo-primary-light, discord-server-icon-512x512, app-header, print |
| wordmarks | logo-primary-dark, logo-primary-light, logo-variation-stacked, email-header-600x200 |
| banners | facebook-cover-820x312, linkedin-cover-1584x396, discord-banner-960x540, website-banner |
| icons | discord-emoji-56x56, app-header, logo-variation-icon |
| stickers | discord-sticker-320x320, social-square-1080 |
| emojis | discord-emoji-56x56 |
| marketing | facebook-post-1080x1080, linkedin-post-1200x627, sales-funnel-hero, sales-funnel-step, website-hero |
| social | social-square-1080, social-story-1080x1920, facebook-post-1080x1080 |
| slides | presentation-slide, lesson-body, website-banner |
| core-artwork | website-hero, core-artwork, print |
| diagrams | website-hero, app-about, presentation-slide, lesson-header |
| characters | website-hero, lesson-header, discord-sticker-320x320, discord-emoji-56x56 |
| lesson-art | lesson-header, lesson-body |
| portraits | website-hero, app-about, social-square-1080, email-header-600x200 |

## After Intake: Auto-Append Checklist

1. Paste new blocks into `ASSETS/ART-ARSENAL/INDEX.json` under `"assets"`
2. Create physical file slot in `ASSETS/ART-ARSENAL/{product}/{category}/` directory
3. If asset is already in R2, add entry to `ASSETS/manifest.json` as well
4. Commit: `art-arsenal: intake {N} assets — {session-slug}`
5. Push to origin main

## MagicChat Retrieval Format

After indexing, the entry is retrievable by Agent 99 via:
- `by id`: exact match
- `by use_slot`: "give me all facebook-cover assets"  
- `by product`: "all net/ marketing assets"
- `by tag`: "all assets tagged 'tiger'"
- `by g444_grade`: "all PASS assets only"
