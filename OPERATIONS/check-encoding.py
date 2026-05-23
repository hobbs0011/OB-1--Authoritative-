with open('SCRIPTS/rrl-failsafe.ps1', 'rb') as f:
    data = f.read()
lines = data.split(b'\n')
targets = [164, 165, 166, 210, 211, 225, 226, 240, 242]
for lineno in targets:
    if lineno < len(lines):
        line_bytes = lines[lineno]
        line_utf8 = line_bytes.decode('utf-8', errors='replace')
        # Write to file to avoid encoding issue
        with open('OPERATIONS/failsafe-debug.txt', 'a', encoding='utf-8') as out:
            out.write(f'Line {lineno+1}: {line_utf8}\n')
print('Done')
