"""RRL-0 clean verbatim extract — Python, no regex drift, no Unicode traps.

Input:  RRL/RRL-0.txt (152,786 chars / full /reincarnaterise session output)
Output: RRL/RRL-Run0-verbatim.txt (Michael verbatim only)

Filter rules: all Python str ops, no PS regex
  a) Drop any line that is pure RISE/DEATH protocol definition text
  b) Drop any "Command:" / "Output:" / "Modified N files" UI chrome
  c) Drop any SOULCOUNT audit table rows (agent-generated)
  d) Drop any Powershell variable/assignment lines
  e) Drop any box-drawing banner lines
  f) Drop empty lines at start and end
  g) What survives = Michael's words + minor protocol meta
"""
import re

path = "RRL/RRL-0.txt"
with open(path, encoding="utf-8") as f:
    raw = f.read()

lines = raw.splitlines()
print(f"INPUT: {len(lines)} lines / {len(raw)} chars")

SKIP = set()

def skip(i):
    SKIP.add(i)

for i, line in enumerate(lines):
    # Strip: trailing newline + leading BOM + any whitespace
    s = line.strip().lstrip('\ufeff')

    # ── Cost / percentage badges ──
    if re.match(r'^\$\d+\.\d{2}$', s):
        skip(i); continue
    if re.match(r'^\d+%$', s):
        skip(i); continue

    # ── Session metadata headers ──
    if re.match(r'^(Session (Rise|Death)|Let me |MR HOBBS|ΓÜí )', s):
        skip(i); continue

    # ── RISE/DEATH protocol section headers ──
    if re.match(r'^(# |## |### )', s):
        is_proto = bool(re.search(
            r'RISE|DEATH|SOULCOUNT|STAGNATION|DRIFT|STATE|LEDGER|DNA|STARMAP|'
            r'KEYWORD|PIPELINE|COLD[\s-]START|FINGERPRINT|SWC|RECEIPT|GATE|FAILSAFE|'
            r'PIPELINE RUNNER|EXTRACT|REINCARNATE', s, re.I
        ))
        if is_proto:
            skip(i); continue

    # ── UI chrome ──
    if re.match(r'^(Command|Output|Modified \d+ files?|Type a message)', s):
        skip(i); continue

    # ── Bash metadata ──
    if '<bash_metadata>' in s or '</bash_metadata>' in s:
        skip(i); continue

    # ── Git untracked lines ──
    if re.match(r'^\?\? ', s):
        skip(i); continue

    # ── Box-drawing divider banners ──
    if re.match(r'^[═╒╕╔╗╚╝╠╣╬╦╩╪╧╨╤╥╫╬┌┐└┘├┤┬┴┼─│┏┓┗┛┣┫┳┻╋┄┅┆┇┈┉┊┋╌╍╎╏]*$', s):
        skip(i); continue

    # ── Roman corps direction arrows ──
    if re.match(r'^[A-Z]{4,}\s+──', s):
        skip(i); continue

    # ── SOUL/HEAD audit table rows ──
    if re.match(r'^(SOULCOUNT|SOUL:|HEAD|EVENTS|BEFORE|AFTER|DELTA)\s*[|:]', s):
        skip(i); continue

    # ── PS/Python assignment lines ──
    if s.startswith('$') or s.startswith('body =') or s.startswith('data ='):
        skip(i); continue

    # ── PULSE / SCAN / SCOUT status blocks ──
    if re.match(r'^(PULSE|STATUS|SCAN|SCOUT|PHOENIX):', s):
        skip(i); continue

    # ── Execution footer ──
    if re.search(r'(execution time|elapsed|Memory usage|Cache hits)', s, re.I):
        skip(i); continue

    # ── Date lines ──
    if re.match(r'^\d{1,2}/\d{1,2}/\d{4}', s):
        skip(i); continue

    # ── "───..." separator banners ──
    if re.match(r'^───+', s):
        skip(i); continue

kept = [lines[i] for i in range(len(lines)) if i not in SKIP]
text = '\n'.join(kept).strip()

out = "RRL/RRL-Run0-verbatim.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write(text + '\n')

print(f"OUTPUT: {len(kept)} lines kept / {len(text)} chars  ({len(lines)-len(kept)} dropped)")
print(f"FRACTIONS OF METAL PASS.")
