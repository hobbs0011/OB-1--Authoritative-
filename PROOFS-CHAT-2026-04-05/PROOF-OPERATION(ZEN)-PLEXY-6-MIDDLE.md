# PROOF - OPERATION(ZEN)-PLEXY-6 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-6.txt

]);

function walk(dir, out = []) {
for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
if (ent.name === "node_modules" || ent.name === ".git") continue;
const p = path.join(dir, ent.name);
if (ent.isDirectory()) walk(p, out);
else out.push(p);
}
return out;
