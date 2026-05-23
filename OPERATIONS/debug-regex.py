with open('RRL/RRL-0.txt', encoding='utf-8') as f:
    line1 = f.readline()

print("repr:", repr(line1[:60]))
import re
pat = r'^\d+:\s*(Session|Let me|MR HOBBS)'
m = re.match(pat, line1)
print("match:", m)
m2 = re.match(r'^\d+', line1)
print("digit:", m2)
