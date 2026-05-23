"""RRL-0 clean verbatim extract v3 — correct filters, no regex traps.

Input:  RRL/RRL-0.txt (152,786 chars / full /reincarnaterise session)
Output: RRL/RRL-Run0-verbatim.txt (Michael verbatim only)
"""
import re

path = "RRL/RRL-0.txt"
with open(path, encoding="utf-8") as f:
    lines = f.read().splitlines()

total = len(lines)
total_chars = sum(len(l) for l in lines)
print(f"INPUT: {total} lines / {total_chars} chars")

SKIP = set()

def B(i, tag):
    SKIP.add(i)

for i, s in enumerate(lines):
    s = s.strip().lstrip('\ufeff')   # strip BOM if present
    if not s:
        continue

    # ── Cost / pct badges ──
    if re.match(r'^\$\d+\.\d{2}$', s):
        B(i, 'cost'); continue
    if re.match(r'^\d+%$', s):
        B(i, 'pct'); continue

    # ── Session metadata (actual file starts: "Session Rise Protocol definition") ──
    if re.match(r'^(Session (Rise|Death)|Let me |MR HOBBS|ΓÜí )', s):
        B(i, 'meta'); continue

    # ── Markdown-bold section headers (actual file content is **Task:** and **MANDATORY:**) ──
    if s.startswith('**Task:**') or s.startswith('**MANDATORY:'):
        B(i, 'md-bold-hdr'); continue

    # ── RISE/DEATH protocol section headers ──
    if re.match(r'^(# |## |### )', s):
        proto_kw = 'RISE|DEATH|SOULCOUNT|STAGNATION|DRIFT|STATE|LEDGER|DNA|STARMAP|' \
                    'KEYWORD|PIPELINE|COLD[-_]START|FINGERPRINT|SWC|RECEIPT|GATE|FAILSAFE|EXTRACT'
        if re.search(proto_kw, s, re.I):
            B(i, 'proto'); continue

    # ── RISE protocol prose markers ──
    if (s.startswith('**STAGNATION CHECK:**') or s.startswith('**DRIFT CHECK:**')
            or s.startswith('The count IS') or s.startswith('Read the most recent death seal')
            or s.startswith('Cross-check') or s.startswith('If live count')
            or re.match(r'^(The user has issued|/reincarnaterise triggered|Executing RISE|'
                        r'Step \d|Step 0 |Step 1 |Step 2 |Step 3 |## Step|## WHAT|'
                        r'NOW QUERY|From state load|From COLD|Prior death seal)', s)):
        B(i, 'proto-prose'); continue

    # ── UI chrome ──
    if re.match(r'^(Command|Output|Modified \d+ files?|Type a message)', s):
        B(i, 'ui'); continue
    if '<bash_metadata>' in s:
        B(i, 'bash'); continue
    if re.match(r'^\?\? ', s):
        B(i, 'git'); continue
    if re.match(r'^───+', s):
        B(i, 'banner'); continue
    if re.match(r'^[═╒╕╔╗╚╝╠╣╬╦╩╪╧╨╤╥╫╬┌┐└┘├┤┬┴┼─│┏┓┗┛┣┫┳┻╋┄┅┆┇┈┉┊┋╌╍]*$', s):
        B(i, 'box'); continue

    # ── SWC Receipt frame ──
    if re.match(r'^(════|RISE RECEIPT|SOULCOUNT:|BOOT_SOURCE|HEAD_VERIFIED|'
                r'STATE_ALIGNMENT|ACTIVE_OBJECTIVE|OPEN_FLAGS|TOP_PRIORITY|'
                r'NEXT_COMMAND|PRIOR DEATH|LIVE SOUL|SOUL DELTA|FIELD|Value|'
                r'Source|Modifi|Untracked|All \d+)', s):
        B(i, 'receipt'); continue

    # ── Audit table rows ──
    if re.match(r'^(SOUL_BEFORE|SOUL_AFTER|SOUL POSTED|SOULCOUNT FINAL|'
                r'PASS\]|WARN\]|FAIL\]|STEP \d|VERSION|DRONE|STATUS)', s):
        B(i, 'audit'); continue

    # ── Code blocks ──
    if s in ('```','```powershell','```json','```text'):
        B(i, 'fence'); continue
    if re.match(r'^\$', s):
        B(i, 'psvar'); continue

    # ── PULSE/SCAN/SCOUT/PHOENIX status lines ──
    if re.match(r'^(PULSE|SCAN|SCOUT|PHOENIX)\b', s):
        B(i, 'status'); continue

    # ── Execution footer ──
    if re.search(r'(elapsed|execution time|Memory usage|Cache hits)', s, re.I):
        B(i, 'footer'); continue

    # ── Roman corps direction lines ──
    if re.match(r'^[A-Z]{4,}\s+─', s):
        B(i, 'roman-dir'); continue

kept = [lines[i] for i in range(total) if i not in SKIP]
text = '\n'.join(kept).strip()
out = "RRL/RRL-Run0-verbatim.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write(text + '\n')
print(f"OUTPUT: {len(kept)} lines / {len(text)} chars  ({total-len(kept)} dropped)")
print(f"WROTE:  {out}")
print("FRACTIONS OF METAL PASS.")
