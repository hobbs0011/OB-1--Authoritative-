with open('RRL/RRL-Run0-verbatim.txt', encoding='utf-8') as f:
    L = f.readlines()
print(f"TOTAL: {len(L)} lines\n")
print("--- FIRST 20 NON-EMPTY ---")
cnt = 0
for i, l in enumerate(L):
    s = l.rstrip()
    if s:
        print(f"{i+1:4}: {s[:100]}")
        cnt += 1
        if cnt >= 20:
            break

print("\n--- LAST 10 NON-EMPTY ---")
cnt2 = 0
for i in range(len(L)-1, -1, -1):
    s = L[i].rstrip()
    if s:
        print(f"{i+1:4}: {s[:100]}")
        cnt2 += 1
        if cnt2 >= 10:
            break
