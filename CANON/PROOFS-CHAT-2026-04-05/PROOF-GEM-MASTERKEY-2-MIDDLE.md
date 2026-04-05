# PROOF - GEM-MASTERKEY-2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\GEM-MASTERKEY-2.txt

if (obj === null) return "null";

if (typeof obj !== "object") return JSON.stringify(obj);

if (Array.isArray(obj)) return "[" + obj.map(this.serialize).join(",") + "]";

return "{" + Object.keys(obj).sort().map(k => JSON.stringify(k) + ":" + this.serialize(obj[k])).join(",") + "}";

}

