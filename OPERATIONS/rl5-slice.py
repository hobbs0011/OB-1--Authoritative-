with open('RRL/RRL-Run0-verbatim.txt', encoding='utf-8') as f:
    L = f.read().splitlines()
# Write lines 1000-1100 to file, skip if too short
n = min(100, len(L) - 100)
with open('OPERATIONS/v5-slice.txt', 'w', encoding='utf-8') as out:
    for i in range(100, 100+max(n, 50)):
        out.write(f"{i+1:4}: {L[i].rstrip()}\n")
print(f"total lines={len(L)}, wrote {max(n,50)} lines")
