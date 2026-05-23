with open('RRL/RRL-0.txt', encoding='utf-8') as f:
    lines = f.read().splitlines()
# Show all lines 7-80 (the protocol template section)
for i in range(6, min(80, len(lines))):
    print(f"{i+1:4}: {lines[i]}")
