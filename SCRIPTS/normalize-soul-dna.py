#!/usr/bin/env python3
"""Normalize JSON-bearing Soul DNA logs and emit proof snapshots.

Usage:
  python SCRIPTS/normalize-soul-dna.py
  python SCRIPTS/normalize-soul-dna.py CANON/SOUL-LOG-VERBATIM-*.md
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CANON = ROOT / "CANON"


def extract_json_lines(path: Path) -> list[str]:
    out: list[str] = []
    text = path.read_text(encoding="utf-8", errors="replace")
    for line in text.splitlines():
        if "{" not in line or '"id"' not in line:
            continue
        start = line.find("{")
        end = line.rfind("}")
        if end >= start:
            candidate = line[start : end + 1]
        else:
            candidate = line[start:]
        try:
            obj = json.loads(candidate)
            out.append(json.dumps(obj, ensure_ascii=False))
        except Exception:
            # Keep best-effort capture if line is malformed JSON.
            out.append(candidate)
    return out


def make_proofs(normalized_lines: list[str], proofs_dir: Path) -> None:
    proofs_dir.mkdir(parents=True, exist_ok=True)
    n = len(normalized_lines)
    if n == 0:
        return

    def chunk(start: int, length: int = 5) -> list[str]:
        return normalized_lines[start : start + length]

    first = chunk(0)
    middle = chunk(max(0, n // 2 - 2))
    last = chunk(max(0, n - 5))

    (proofs_dir / "PROOF-FIRST.md").write_text("\n".join(first), encoding="utf-8")
    (proofs_dir / "PROOF-MIDDLE.md").write_text("\n".join(middle), encoding="utf-8")
    (proofs_dir / "PROOF-LAST.md").write_text("\n".join(last), encoding="utf-8")


def normalize_file(src: Path) -> None:
    if not src.exists():
        print(f"MISSING {src}")
        return

    lines = extract_json_lines(src)
    if not lines:
        print(f"NO JSON LINES FOUND IN {src}")
        return

    today = date.today().strftime("%Y-%m-%d")
    base_stem = src.stem.split("-NORMALIZED-")[0]
    out_name = f"{base_stem}-NORMALIZED-{today}.md"
    out_path = src.parent / out_name
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"WROTE {out_path}")

    proofs_dir = src.parent.parent / f"PROOFS-{src.stem.upper()}-{today}"
    make_proofs(lines, proofs_dir)
    print(f"WROTE PROOFS {proofs_dir}")


def discover_targets(args: list[str]) -> list[Path]:
    if args:
        return [Path(a) for a in args]
    if not CANON.exists():
        return []
    return sorted(
        p for p in CANON.glob("SOUL-LOG-VERBATIM*.md") if "-NORMALIZED-" not in p.name
    )


def main() -> int:
    targets = discover_targets(sys.argv[1:])
    if not targets:
        print("NO TARGET FILES FOUND")
        return 1
    for target in targets:
        normalize_file(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
