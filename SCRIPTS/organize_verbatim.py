#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
CANON = ROOT / 'CANON'

def extract_json_lines(p: Path):
    out = []
    for line in p.read_text(encoding='utf-8', errors='replace').splitlines():
        if '{' in line and '"id"' in line:
            try:
                jpart = line[line.find('{'): line.rfind('}')+1]
                obj = json.loads(jpart)
                out.append(json.dumps(obj, ensure_ascii=False))
            except Exception:
                # best-effort fallback: grab from first { to end
                jpart = line[line.find('{'):]
                out.append(jpart)
    return out

def make_proofs(normalized_lines, proofs_dir: Path):
    proofs_dir.mkdir(parents=True, exist_ok=True)
    n = len(normalized_lines)
    if n==0:
        return
    def chunk(lines, start, length=5):
        return lines[start:start+length]
    first = chunk(normalized_lines, 0)
    middle = chunk(normalized_lines, max(0, n//2 - 2))
    last = chunk(normalized_lines, max(0, n-5))
    (proofs_dir / 'PROOF-FIRST.md').write_text('\n'.join(first), encoding='utf-8')
    (proofs_dir / 'PROOF-MIDDLE.md').write_text('\n'.join(middle), encoding='utf-8')
    (proofs_dir / 'PROOF-LAST.md').write_text('\n'.join(last), encoding='utf-8')

def normalize_file(src: Path):
    if not src.exists():
        print('MISSING', src)
        return
    lines = extract_json_lines(src)
    if not lines:
        print('NO JSON LINES FOUND IN', src)
        return
    today = date.today().strftime('%Y-%m-%d')
    out_name = src.stem.replace('SOUL-LOG-VERBATIM-', 'SOUL-LOG-VERBATIM-') + f'-NORMALIZED-{today}.md'
    out_path = src.parent / out_name
    out_path.write_text('\n'.join(lines), encoding='utf-8')
    print('WROTE', out_path)
    # create proofs folder
    proofs_dir = src.parent.parent / f'PROOFS-{src.stem.replace("SOUL-LOG-VERBATIM-", "").upper()}-{today}'
    make_proofs(lines, proofs_dir)
    print('WROTE PROOFS', proofs_dir)

def main():
    args = sys.argv[1:]
    targets = []
    if args:
        for a in args:
            targets.append(Path(a))
    else:
        # find verbatim files
        for p in CANON.glob('SOUL-LOG-VERBATIM*.md'):
            targets.append(p)
    for t in targets:
        normalize_file(t)

if __name__ == '__main__':
    main()
