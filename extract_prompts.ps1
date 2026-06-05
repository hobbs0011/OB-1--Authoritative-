import json
import re

filepath = r"D:\OB-1-CANONICAL\RRL\RRL-CURRENT.txt"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

skip_markers = [
    "Let me", "Reading", "Writing", "Running", "Command", "Output",
    "Building", "Here", "Now", "I need", "We ", "Given", "Actually",
    "First", "Stage ", "Looking", "Total ", "The user", "I should",
    "Wait", "Halted", "The fix", "The approach", "Understood",
    "Runs ", "From JSON", "DNA-LOG", "The SOUL", "Rebuild", "script",
    "format", "audit", "JSON", "Bible", "SOUL", "DNA", "OB1", "Phoenix",
    "Centurion", "Roman", "Prompt", "extract", "parse", "===", "---"
]

def is_skip_marker(line):
    upper = line.upper()
    for m in skip_markers:
        if upper.startswith(m.upper()):
            return True
    return False

def looks_like_metadata(line):
    s = line.strip()
    if not s:
        return False
    # percentage like 89%
    if re.match(r'^\d{1,3}%$', s):
        return True
    # file path (contains backslash or slash and extension)
    if re.search(r'[\\/][^\\/\s]+\.[a-zA-Z0-9]+', s):
        return True
    # bare number line in context of small numeric values? hard to blanket-reject numbers.
    if re.match(r'^\d+$', s):
        return True
    if re.match(r'^\d+:\s', s):
        return True
    return False

segments = content.split('</environment_details>')
prompts = []

for idx, seg in enumerate(segments[1:], start=1):
    lines = seg.splitlines()
    # Gather first 20 non-empty lines
    non_empty = [ln.rstrip() for ln in lines if ln.strip()][:20]
    if not non_empty:
        continue
    # Check skips
    skip = False
    for ln in non_empty:
        if is_skip_marker(ln):
            skip = True
            break
    if skip:
        continue
    # Check metadata-only
    all_meta = all(looks_like_metadata(ln) for ln in non_empty)
    if all_meta:
        continue
    # Take first real text block (join up to first blank line or first line that ends a sentence but looks complete?)
    # Take up to first empty line separator
    chunk_lines = []
    for ln in lines:
        if ln.strip():
            chunk_lines.append(ln.rstrip())
        else:
            break
    text = '\n'.join(chunk_lines).strip()
    if not text:
        continue
    # If text starts with a numbered line like '1: foo' strip the leading number
    text = re.sub(r'^\d+:\s*', '', text)
    prompts.append({
        'index': idx,
        'char_count': len(text),
        'text': text,
        'first_line': text.splitlines()[0][:120]
    })

out_path = r'D:\OB-1-CANONICAL\extracted_prompts.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

print('TOTAL_PROMPTS', len(prompts))
for p in prompts[:20]:
    print(p['index'], p['char_count'], '|', p['first_line'])
print('...')
print('Saved to', out_path)
