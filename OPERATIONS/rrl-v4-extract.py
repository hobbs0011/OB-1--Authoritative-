"""RRL-0 clean verbatim extract v4 — block-based, not line-by-line.

Strategy: The file starts with the /reincarnaterise protocol DEFINITION (plastered
in by Kilo's chat UI).  That definition ends at the first line of actual session/
execution output.  We SKIP from line 0 until we see a transition marker, then
take EVERYTHING from that point forward, then do a second pass to drop the
obvious UI chrome and Michael's duplicates within the output.
"""
import re, os

path = "RRL/RRL-0.txt"
with open(path, encoding="utf-8") as f:
    raw = f.read()

lines = raw.splitlines()
total = len(lines)
print(f"INPUT: {total} lines / {len(raw)} chars")

# ── PHASE 1: Find skip_extent ──────────────────────────────────────────────────
# The /reincarnaterise protocol is at the VERY TOP of the file.
# Find the LAST non-empty-to-empty transition before actual execution begins.
# The block transitions from "protocol prose" → "actual command output" when:
#   a) the SWC Receipt text begins (═══), OR
#   b) "The user has issued the /reincarnaterise" line appears, OR
#   c) any "COMPLETE/SOULCOUNT/HEAD:" summary banner line appears

SKIP_END = 0  # default: skip nothing
for i in range(len(lines)):
    s = lines[i].strip().lstrip('\ufeff')
    if not s:
        continue
    # Detect start of actual session execution
    if ('═' in s and len(s) > 30) \
       or 'The user has issued' in s \
       or s.startswith('COMPLETE.') \
       or re.match(r'^(SOULCOUNT:|HEAD:|\?  HEAD|\*\*COMPLETE\*\*)', s):
        SKIP_END = i
        break

# If we found nothing, default to 0
print(f"Phase 1: SKIP_END = line {SKIP_END}")

# ── PHASE 2: Build candidate set ───────────────────────────────────────────────
candidate = set(range(SKIP_END, total))  # from SKIP_END onward
kept_lines = [lines[i] for i in sorted(candidate)]
print(f"Phase 2: {len(kept_lines)} candidate lines (from line {SKIP_END} to end)")

# ── PHASE 3: Drop UI chrome from candidates ────────────────────────────────────
SKIP_CAND = set()
for i, s in enumerate(kept_lines):
    s = s.strip().lstrip('\ufeff')
    if not s:
        SKIP_CAND.add(i); continue

    # Cost / pct
    if re.match(r'^\$\d+\.\d{2}$', s) or re.match(r'^\d+%$', s):
        SKIP_CAND.add(i); continue

    # UI chrome
    if re.match(r'^(Command|Output|Modified \d+ files?|Type a message)', s):
        SKIP_CAND.add(i); continue
    if '<bash_metadata>' in s or '</bash_metadata>' in s:
        SKIP_CAND.add(i); continue
    if re.match(r'^\?\? ', s):
        SKIP_CAND.add(i); continue
    if re.match(r'^───+', s):
        SKIP_CAND.add(i); continue
    if re.match(r'^[═╒╕╔╗╚╝╠╣╬╦╩╪╧╨╤╥╫╬┌┐└┘├┤┬┴┼─│┏┓┗┛┣┫┳┻╋┄┅┆┇┈┉┊┋╌╍]*$', s):
        SKIP_CAND.add(i); continue

    # Code fences  
    if s in ('```','```powershell','```json','```text'):
        SKIP_CAND.add(i); continue

    # PS assignment lines (anything starting $ or body=data= or = Invoke etc)
    if s.startswith('$') or re.match(r'^(body|data|r|extractBody)\s*=', s):
        SKIP_CAND.add(i); continue

    # PS output lines (lines that look like Write-Host, [PASS], [FAIL], STEP N etc.)
    if re.match(r'^(Write-Host|Write-Step|\[PASS\]|\[FAIL\]|\[WARN\]|STEP \d|VERSION|DRONE|STATUS)', s):
        SKIP_CAND.add(i); continue

    # SWC receipt frame
    if re.match(r'^(════|RISE RECEIPT|SOULCOUNT:|BOOT_SOURCE|HEAD_VERIFIED|'
                r'STATE_ALIGNMENT|ACTIVE_OBJECTIVE|OPEN_FLAGS|TOP_PRIORITY|'
                r'NEXT_COMMAND|PRIOR DEATH|LIVE SOUL|SOUL DELTA|FIELD|Value|'
                r'Source|Modifi|Untracked|All \d+)', s):
        SKIP_CAND.add(i); continue

    # SCAN / STATUS / SCOUT / PULSE  
    if re.match(r'^(SCAN|SCOUT|STATUS|PULSE|PHOENIX)', s):
        SKIP_CAND.add(i); continue

    # Michael saying "ΓÜí" (Centurion activation markers)
    if s.startswith('ΓÜí') or s.startswith('ΓÜÖ'):
        SKIP_CAND.add(i); continue

    # Execution footer
    if re.search(r'(elapsed|execution time|Memory usage|Cache hits)', s, re.I):
        SKIP_CAND.add(i); continue

# ── PHASE 4: Build output ──────────────────────────────────────────────────────
final = [(SKIP_END + i, lines[SKIP_END + i])
         for i in range(len(kept_lines))
         if i not in SKIP_CAND]
text = '\n'.join(l for _, l in final).strip()

out = "RRL/RRL-Run0-verbatim.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write(text + '\n')

print(f"Phase 3/4: {len(final)} lines / {len(text)} chars  "
      f"({len(kept_lines)-len(final)} dropped from candidate)")
print(f"WROTE:  {out}")
print("FRACTIONS OF METAL PASS.")
