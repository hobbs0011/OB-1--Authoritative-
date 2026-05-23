with open('RRL/RRL-Run0-verbatim.txt', encoding='utf-8') as f:
    L = f.readlines()
for i in range(min(40, len(L))):
    line = L[i].rstrip()
    if line:
        print(f"{i+1:4}: {line[:100]}")
