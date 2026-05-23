with open('RRL/RRL-0.txt', encoding='utf-8') as f:
    lines = f.read().splitlines()
# Find all bold-italic header lines
bold_lines = [(i, l) for i, l in enumerate(lines) if '**' in l and l.strip().startswith('**')]
for i, l in bold_lines[:30]:
    print(f"{i+1}: {l}")
