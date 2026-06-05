import json, re
from pathlib import Path

filepath = Path(r"D:\OB-1-CANONICAL\RRL\RRL-CURRENT.txt")
content = filepath.read_text(encoding="utf-8")
lines = content.splitlines()

SKIP_EXACT = {"Command", "Output", "Load earlier messages"}

SKIP_PREFIXES_LOWER = [
    "let me", "reading ", "writing ", "running ", "command", "output",
    "building ", "here ", "now ", "i need ", "we ", "given ", "actually",
    "first ", "stage ", "looking ", "total ", "the user", "i should ",
    "wait", "halted", "the fix", "the approach ", "understood",
    "runs ", "from json", "dna-log", "the soul", "rebuild", "script",
    "the core", "youre right", "confirmed runs", "immediate remediation:",
    "wait —", "top level", "key insight", "the 420", "the numbered",
    "the issue", "the actual", "the user wants", "the user said",
    "the truth", "the system", "the file", "the real", "the new",
    "the old", "the first", "the current", "the capture", "the work",
    "the catalog", "the bloat", "the next", "the phase", "the final",
]

# Block lines that start with these markdown/system patterns
SKIP_PREFIXES_LOWER += ["===", "---", "====", "thinking", "type a message",
    "stopped.", "good data", "traceback", 'file "<stdin>"', "f, line",
    "json.decoder", "parsererror:", "line |", "---", "===", "===="]

METADATA_ONLY = re.compile(r'^(?:\d{1,3}%|[\\/][^\\/\s]+\.[a-zA-Z0-9]+|\d+$|\d+:\s)$')

PROMPT_NUMBERED = re.compile(r'^\[(\d+)\]\s+[\d\-]+\s+[—\-]\s+(.*)$')

prompts = []
seen_texts = set()

for ln in lines:
    s = ln.rstrip("\n")
    stripped = s.strip()
    if not stripped:
        continue
    if stripped in SKIP_EXACT:
        continue
    if METADATA_ONLY.match(stripped):
        continue
    if re.match(r'^(cd |python |\./|test\s)', stripped, re.IGNORECASE):
        continue

    lower = stripped.lower()

    skip = False
    for prefix in SKIP_PREFIXES_LOWER:
        if lower.startswith(prefix):
            skip = True
            break
    if skip:
        continue

    m = PROMPT_NUMBERED.match(stripped)
    if m:
        num = int(m.group(1))
        text = m.group(2).strip()
        if text and text not in seen_texts:
            seen_texts.add(text)
            prompts.append({
                "number": num,
                "char_count": len(text),
                "text": text,
                "first_line": text.splitlines()[0][:140]
            })
        continue

    if len(stripped) < 5:
        continue
    if not re.search(r'[a-zA-Z]', stripped):
        continue
    if re.search(r'[\\/][^\\/\s]+\.[a-zA-Z0-9]+', stripped):
        continue

    text = stripped
    if text not in seen_texts:
        seen_texts.add(text)
        prompts.append({
            "number": None,
            "char_count": len(text),
            "text": text,
            "first_line": text.splitlines()[0][:140]
        })

out_path = Path(r"D:\OB-1-CANONICAL\extracted_user_prompts.json")
out_path.write_text(json.dumps(prompts, ensure_ascii=False, indent=2), encoding="utf-8")
print("TOTAL_PROMPTS %d" % len(prompts))
for p in prompts:
    n = p["number"] if p["number"] is not None else "-"
    print("%3s | %6d | %s" % (n, p["char_count"], p["first_line"]))
print("Saved to %s" % out_path)
