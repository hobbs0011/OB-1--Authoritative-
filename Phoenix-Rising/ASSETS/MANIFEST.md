# ASSETS — R2 Asset Manifest System

## What goes here

Binary assets that should NOT be in git go to Cloudflare R2.

## R2 Bucket

- **Bucket:** `phoenix-rising-assets`
- **Account:** mrmichaelhobbs1234
- **CDN pattern:** `https://assets.naturalenglishtraining.net/{key}`

## Naming conventions

```
{product}/{type}/{filename}
e.g.
  net-pet-ai/audio/lesson-01-phonics.mp3
  net-pet-ai/images/obi-mascot.png
  galaxy/lessons/week-01-hero.mp4
  marketing/graphics/social-banner-v2.png
```

## Asset types → R2 (never git)

| Extension | Category | R2 Path Pattern |
|-----------|----------|----------------|
| mp4, mov, avi, mkv, webm | Video | `{product}/video/` |
| mp3, m4a, wav, aac, flac | Audio | `{product}/audio/` |
| pptx, ppt | Presentations | `{product}/slides/` |
| docx, doc, xlsx, xls | Office | `{product}/docs/` |
| pdf | Documents | `{product}/docs/` |
| zip, 7z, rar, tar.gz | Archives | `backups/` |

## How to add a new asset

1. Upload to R2 via Cloudflare dashboard or `SCRIPTS/upload-asset-r2.ps1`
2. Add entry to `manifest.json`:
   ```json
   {
     "key": "net-pet-ai/audio/phonics.mp3",
     "type": "audio",
     "product": "net-pet-ai",
     "size_mb": 2.4,
     "uploaded": "2026-04-10",
     "cdn_url": "https://assets.naturalenglishtraining.net/net-pet-ai/audio/phonics.mp3"
   }
   ```
3. Commit the manifest update (NOT the binary file)

## R2 Upload Script

See `SCRIPTS/upload-asset-r2.ps1` for the upload helper.

## manifest.json

Machine-readable index of all R2 assets. See `ASSETS/manifest.json`.
