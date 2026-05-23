import os, glob

files = [
    'SCRIPTS/rrl-extract.ps1',
    'SCRIPTS/rrl-pipeline.ps1',
    'SCRIPTS/rrl-failsafe.ps1'
]

report = []
for path in files:
    with open(path, 'rb') as f:
        data = f.read()
    lines = data.split(b'\n')
    count = 0
    for i, line in enumerate(lines):
        if b'\xe2\x80\x94' in line:  # em-dash
            count += 1
            text = line.decode('utf-8', errors='replace')
            # Clean for ascii-safe writing
            clean = text.encode('ascii', errors='replace').decode()
            report.append(f"{path}:{i+1}: {clean[:100]}")
    report.append(f"  TOTAL em-dashes in {path}: {count}")

with open('OPERATIONS/encoding-survey.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))

# Also print to stdout
for line in report:
    print(line)
