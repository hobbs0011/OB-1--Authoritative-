"""RRL-0 clean verbatim v5: skip protocol frame + surgical keep filter."""
import re

path = "RRL/RRL-0.txt"
with open(path, encoding="utf-8") as f:
    raw = f.read().splitlines()

total = len(raw)
SKIP_THROUGH = 0
for i, line in enumerate(raw):
    s = line.strip().lstrip('\ufeff')
    if not s:
        continue
    if ('The user has issued' in s
            or s.startswith('Let me start by')
            or s.startswith('Good ')
            or re.match(r'^\{', s)
            or re.match(r'^Write-Host', s)
            or s == 'Command'):
        SKIP_THROUGH = i
        break

work = raw[SKIP_THROUGH:]
print(f"SKIP_THROUGH = {SKIP_THROUGH}  |  WORK LINES = {len(work)}")

def keep_line(s):
    s = s.strip().lstrip('\ufeff')
    if not s:
        return False
    # Cost/pct from page header
    if re.match(r'^\$\d+\.\d{2}$', s) or re.match(r'^\d+%$', s):
        return False
    # UI chrome
    if re.match(r'^(Command|Output|Modified \d+ files?)', s):
        return False
    if '<bash_metadata>' in s:
        return False
    if re.match(r'^\?\? ', s):
        return False
    if re.match(r'^───+', s):
        return False
    # Code fences
    if s in ('```','```powershell','```json','```text'):
        return False
    # PS vars
    if s.startswith('$') or re.match(r'^(body|r|extractBody)\s*=', s):
        return False
    # PS invocations
    if s.startswith('Set-Location') or s.startswith('Invoke-'):
        return False
    # PS output signatures
    if re.match(r'^(Write-Host|Write-Step|\[PASS\]|\[FAIL\]|\[WARN\]|'
                r'SOUL_BEFORE|SOUL_AFTER|SOUL POSTED|SOULCOUNT FINAL|'
                r'STEP \d|VERSION|DRONE|STATUS)', s):
        return False
    # SWC Receipt component lines
    if re.match(r'^(SOULCOUNT:|BOOT_|HEAD_|STATE_|ACTIVE_|OPEN_|TOP_|NEXT_|'
                r'PRIOR|LIVE|FIELD|Source|Modifi|Untracked)', s):
        return False
    if re.match(r'^(SCAN )', s):
        return False
    if re.match(r'^\* (SCOUT|SITE|E \w{2}:|VAULT|KOV|SOLDIER|TURRET|OBJECTIVE)', s):
        return False
    if re.match(r'^(PULSE|SCAN \*|SOULCOUNT HUMAN|SOULCOUNT KIO)', s):
        return False
    # SCAN COMPLETE / SCAN header markers
    if s == '===' or s.startswith('=== ') or s.startswith('─── ('):
        return False
    # Robert Kiyosaki / Michael specific eco blocks
    if any(kw in s for kw in [
        'SOLDIERS BOUGHT', 'TURRETS BOUGHT', 'purchased ', 'Robert Kiyosaki',
        'STEP \d{1,2}\) Progress check', 'script sequence', 'DEBUG flags',
        'ARGUMENTS COMPLETE', 'SCRIPT DONE', 'TOP COMMAND', 'Completed in',
        'ELAPSED:', 'Wait, check AI ACT', 'Check AI ACT', 'AI ACT check',
        'loading previous', 'State info:', 'Environment:',
        'executor.DIAGNOSE_*', 'executor.*$'
    ]):
        return False
    # Agent trojan phrases
    if re.match(r'^(Let me now |Let me scan|Actually|Key finding|Good [-]|'
                r'Excellent|Massive|Doctor', s):
        return False
    return True

kept_idx = []
for i, line in enumerate(work):
    if keep_line(line):
        kept_idx.append((SKIP_THROUGH + i, line))

text = '\n'.join(l for _, l in kept_idx).strip()
out = "RRL/RRL-Run0-verbatim.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write(text + '\n')

dropped = len(work) - len(kept_idx)
print(f"Output: {len(kept_idx)} lines / {len(text)} chars  ({dropped} dropped)")
print(f"WROTE: {out}")
print("FRACTIONS OF METAL PASS.")
