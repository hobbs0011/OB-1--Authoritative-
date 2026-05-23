with open('RRL/RRL-Run0-verbatim.txt', encoding='utf-8') as f:
    L = f.readlines()
with open('OPERATIONS/verbatim-lines-100-140.txt', 'w', encoding='utf-8') as out:
    for i in range(100, min(145, len(L))):
        out.write(f"{i+1:4}: {L[i].rstrip()}\n")
print("wrote OPERATIONS/verbatim-lines-100-140.txt")
