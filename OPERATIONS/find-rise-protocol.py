with open('RRL/RRL-Run0-verbatim.txt', encoding='utf-8') as f:
    lines = f.read().splitlines()
# Find the RISE protocol block
for i, l in enumerate(lines):
    if 'reincarnaterise' in l.lower() or 'reincarnat' in l.lower() or 'Session Rise Protocol' in l:
        print(f"MATCH at {i}: {l[:80]}")
    if l.strip() == '---':
        print(f"HR at {i}")
    if l.strip().startswith('The user has issued'):
        print(f"AGENT at {i}: {l[:80]}")
