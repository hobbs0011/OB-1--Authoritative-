"""RRL-0 verbatim extract — survives everything, PowerShell be damned.

Input:  RRL/RRL-0.txt  (156,676 bytes / 152,786 chars — full session)
Output: RRL/RRL-verbatim-Run0.txt  (Michael verbatim only)

Rules:
  1. Strip all RISE protocol sections by line-content pattern
  2. Strip all agent/procedural blocks by structural markers
  3. Strip UI chrome (Command/Output/Modified/blocks/banners)
  4. What survives is Michael's verbatim or the RISE protocol assistant's
     deliverables (SWC receipts, tables) which ARE part of the record.
"""
import re, sys

path = "RRL/RRL-0.txt"
with open(path, encoding="utf-8") as f:
    raw = f.read()

lines = raw.splitlines()
total = len(lines)
print(f"INPUT: {total} lines, {len(raw)} chars")

# ── PHASE 1: label every line ──────────────────────────────────────────────────
# Types: SKIP, HEADER, AGENT, UI, SYNTAX, SOUL (Michael or protocol artifact)
in_skip_block = False
skip_reasons = {}
output = []
dropped = 0

for i, line in enumerate(lines):
    stripped = line.rstrip()

    # ── Always-SKIP patterns ──
    # Cost badge lines
    if re.match(r'^\$\d+\.\d{2}$', stripped):
        dropped += 1; continue
    if re.match(r'^\d+%$', stripped):
        dropped += 1; continue

    # Session metadata: "1: Session rise protocol definition" etc.
    if re.match(r'^\d+: Session (Rise|Death) Protocol', stripped):
        dropped += 1; continue

    # RISE protocol section markers
    if re.match(r'^(# |## )+ /?(reincarnate|reincarnateDeath|PhoenixCoder|Centurion|SoulScholar)', stripped):
        if stripped.startswith('#'):
            dropped += 1; continue  # the section header itself

    # Explicit UI chrome
    if re.match(r'^(Command|Output|Modified|Type a message)\b', stripped):
        dropped += 1; continue
    if re.match(r'^Modified \d+ files?$', stripped):
        dropped += 1; continue

    # Bash metadata block
    if stripped.startswith('<bash_metadata>') or stripped.startswith('</bash_metadata>'):
        dropped += 1; continue

    # Makefile-style markers
    if re.match(r'^\?\?\s', stripped):
        dropped += 1; continue

    # Agent sign-off banners
    if re.match(r'^[═╒╕╞╡╪╧╨╤╥╬╦╩╠╣]*$', stripped):
        dropped += 1; continue   # ≈40 chars of box-drawing

    # ── AGENT BLOCK patterns — drop entire paragraph ──
    # Agent dictionaries / JSON objects (indented key-value)
    if stripped.startswith('    ') and re.match(r'^\s{4,}[\w_]+:', stripped):
        dropped += 1; continue

    # PowerShell variable assignments
    if re.match(r'^\$\w+\s*=', stripped):
        dropped += 1; continue

    # PowerShell "(\w+) =" pattern (variable binding from parenthesized expression)
    if re.match(r'^(\w+)\s*=', stripped) and i < len(lines)-1:
        # check next few lines for PS code pattern
        nxt = ' '.join(lines[i:i+4])
        if re.search(r'Invoke-RestMethod|Invoke-WebRequest|\.ps1|Get-ChildItem|git ', nxt):
            dropped += 1; continue

    # Output block continuation
    if re.match(r'^───', stripped):
        dropped += 1; continue

    # SCAN INTEL, STATUS, HEAD checks etc.
    if re.match(r'^(SCAN|SOULCOUNT|HEAD|EVENTS|BEFORE|AFTER|DELTA|STATUS)\s*:', stripped):
        dropped += 1; continue

    # SCAN/SCOUT  marker lines
    if re.match(r'^(SCOUT|PHOENIX|SITE|\.kilo|VAULT|OPERATIONS|CANON|PIPELINE)\s*:', stripped):
        dropped += 1; continue

    # Lines in All-Caps disciple names
    if re.match(r'^[A-Z]{4,}[…:]$', stripped):
        dropped += 1; continue

    # ── Strip "Step N:" header lines ──
    if re.match(r'^(Step|WHAT THIS|STEP \d)', stripped):
        dropped += 1; continue

    # ── STRIP ALL BULLETS ──
    # Dash, star, arrow bullets — "soul bullets are the destroyer"
    if re.match(r'^[•·\-→ΓòÉΓöéΓòæΓòå]\s', stripped):
        dropped += 1; continue

    # ── What survives ──
    output.append(stripped)

verbatim = '\n'.join(output)
kept = len(output)
print(f"OUTPUT: {kept} lines kept, {dropped} lines dropped")
print(f"CHARS:  {len(verbatim)}")

# Write output
out_path = f"RRL/RRL-Run0-verbatim.txt"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(verbatim + '\n')
print(f"WROTE:  {out_path}")
print(f"\nFRACTIONS OF METAL PASS. {dropped} dead, {kept} alive.")
