with open('SCRIPTS/rrl-failsafe.ps1', 'rb') as f:
    data = f.read()
lines = data.split(b'\n')
# Find ALL lines containing em-dash
for i, line in enumerate(lines):
    if b'\xe2\x80\x94' in line:
        try:
            text = line.decode('utf-8')
        except:
            text = line.decode('latin-1', errors='replace')
        with open('OPERATIONS/failsafe-unicode-check.txt', 'w', encoding='utf-8') as out:
            out.write(str(i+1) + ': ' + text + '\n')
            # Also print to terminal using ascii fallback
            print(str(i+1) + ': ' + text.encode('ascii', errors='replace').decode())
print('Lines with em-dash written to OPERATIONS/failsafe-unicode-check.txt')
