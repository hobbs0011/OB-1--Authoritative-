with open('RRL/RRL-Run0-verbatim.txt', encoding='utf-8-sig') as f:
    lines = f.read().splitlines()
print(f"TOTAL: {len(lines)} lines")
print("\n--- FIRST 20 LINES ---")
for i, l in enumerate(lines[:20], 1):
    print(f"{i:3}: {l}")
print("\n--- LAST 20 LINES ---")
for i, l in enumerate(lines[-20:], len(lines)-19):
    print(f"{i:3}: {l}")
