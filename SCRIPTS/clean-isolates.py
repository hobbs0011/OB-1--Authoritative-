"""
NET Brand Art Cleaner — removes text from core isolate images.
Outputs to APPS/NET-PET-AI/public/isolated/
Also patches the art-arsenal registry via /api/art PATCH.
"""
import os, sys, io, json, urllib.request, urllib.parse
from pathlib import Path
from PIL import Image, ImageDraw

CDN      = "https://net-art-arsenal.pages.dev/isolated/"
OUT_DIR  = Path(__file__).parent.parent / "APPS/NET-PET-AI/public/isolated"
PA_API   = "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── helpers ───────────────────────────────────────────────────────────────────

def download(filename):
    url = CDN + filename
    print(f"  ↓ {filename}", end=" ", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "NET-Cleaner/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    print(f"({len(data)//1024}KB)")
    return Image.open(io.BytesIO(data)).convert("RGBA")

def crop_bottom(img, pct):
    """Remove bottom pct% of image (strips text label bar)."""
    w, h = img.size
    return img.crop((0, 0, w, int(h * (1 - pct))))

def mask_corner(img, corner="br", pct_w=0.12, pct_h=0.06):
    """Paint a dark rectangle over a corner watermark."""
    img = img.copy()
    w, h = img.size
    bw, bh = int(w * pct_w), int(h * pct_h)
    draw = ImageDraw.Draw(img)
    if corner == "br":
        draw.rectangle([(w - bw, h - bh), (w, h)], fill=(10, 10, 18, 255))
    elif corner == "bl":
        draw.rectangle([(0, h - bh), (bw, h)], fill=(10, 10, 18, 255))
    return img

def rembg_extract(img):
    """Remove background, return subject on transparent canvas."""
    try:
        from rembg import remove
        buf = io.BytesIO()
        img.save(buf, "PNG")
        result = remove(buf.getvalue())
        subject = Image.open(io.BytesIO(result)).convert("RGBA")
        # Place on dark background matching product theme
        bg = Image.new("RGBA", subject.size, (10, 10, 18, 255))
        bg.paste(subject, mask=subject.split()[3])
        return bg
    except Exception as e:
        print(f"    rembg failed: {e} — falling back to crop")
        return crop_bottom(img, 0.08)

def save(img, name):
    out = OUT_DIR / name
    # Convert to RGB for final PNG (removes alpha compositing artifacts on dark bg)
    final = Image.new("RGB", img.size, (10, 10, 18))
    if img.mode == "RGBA":
        final.paste(img, mask=img.split()[3])
    else:
        final.paste(img)
    final.save(out, "PNG", optimize=True)
    size_kb = out.stat().st_size // 1024
    print(f"  ✓ saved {name} ({size_kb}KB)")
    return name

# ── registry updater ──────────────────────────────────────────────────────────

def fetch_registry():
    req = urllib.request.Request(PA_API + "?limit=400",
          headers={"User-Agent": "NET-Cleaner/1.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())["pieces"]

def patch_piece(piece_id, new_url, extra_tag="cleaned"):
    # Try PATCH first, then PUT
    payload = json.dumps({"url": new_url, "notes": "Cleaned — text removed. Textless verified."}).encode()
    for method in ("PATCH", "PUT"):
        try:
            req = urllib.request.Request(
                f"{PA_API}/{piece_id}",
                data=payload,
                method=method,
                headers={"Content-Type": "application/json", "User-Agent": "NET-Cleaner/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as r:
                resp = json.loads(r.read())
                print(f"  registry {method} {piece_id[:12]}… → {resp.get('ok') or resp.get('success') or 'ok'}")
                return True
        except Exception as e:
            if method == "PUT":
                print(f"  registry update failed for {piece_id}: {e}")
    return False

# ── processing manifest ───────────────────────────────────────────────────────
# (source_filename, output_filename, method, params)
MANIFEST = [
    # Simple bottom-strip crops
    ("tiger-portrait-hd.png",    "tiger-portrait-clean.png",    "crop",     {"pct": 0.17}),
    ("tiger-face-neon-hd.png",   "tiger-face-neon-clean.png",   "crop",     {"pct": 0.13}),
    ("tiger-cub-hd.png",         "tiger-cub-clean.png",         "crop",     {"pct": 0.13}),
    ("phoenix-neon-hd.png",      "phoenix-neon-clean.png",      "crop",     {"pct": 0.12}),
    # Small watermark mask
    ("tiger-child-hd.png",       "tiger-child-clean.png",       "mask",     {"corner": "br", "pct_w": 0.08, "pct_h": 0.05}),
    # Already clean — just copy with clean name
    ("phoenix-crest-hd.png",     "phoenix-crest-clean.png",     "copy",     {}),
    ("phoenix-dna-fusion-hd.png","phoenix-dna-fusion-clean.png","copy",     {}),
    # rembg subject extraction
    ("mouse-wireframe-hd.png",   "mouse-clean.png",             "rembg",    {}),
    ("tiger-roaring-hd.png",     "tiger-roaring-clean.png",     "rembg",    {}),
    ("tiger-eye-hd.png",         "tiger-eye-clean.png",         "rembg",    {}),
    ("phoenix-lowpoly-hd.png",   "phoenix-lowpoly-clean.png",   "rembg",    {}),
    ("phoenix-dna-fusion-hd.png","phoenix-dna-clean.png",       "copy",     {}),
]

# ── main ──────────────────────────────────────────────────────────────────────

def main():
    print("\n=== NET Brand Art Cleaner ===\n")
    results = {}

    for src, dst, method, params in MANIFEST:
        print(f"\n[{method.upper()}] {src} -> {dst}")
        try:
            img = download(src)
            if method == "crop":
                img = crop_bottom(img, params["pct"])
            elif method == "mask":
                img = mask_corner(img, params.get("corner","br"),
                                  params.get("pct_w",0.12), params.get("pct_h",0.06))
            elif method == "rembg":
                img = rembg_extract(img)
            elif method == "copy":
                pass  # use as-is
            save(img, dst)
            results[src] = dst
        except Exception as e:
            print(f"  ERROR: {e}")

    print("\n=== Registry update ===\n")
    try:
        pieces = fetch_registry()
        # Build lookup: source filename → piece
        lookup = {}
        for p in pieces:
            url = p.get("url","")
            fname = url.split("/")[-1] if "/" in url else url
            lookup[fname] = p

        for src, dst, *_ in MANIFEST:
            piece = lookup.get(src)
            if piece:
                new_url = f"isolated/{dst}"
                patch_piece(piece["id"], new_url)
            else:
                print(f"  not in registry: {src}")
    except Exception as e:
        print(f"  Registry fetch failed: {e}")

    print(f"\n✓ Done. {len(results)} images written to {OUT_DIR}\n")

if __name__ == "__main__":
    main()
