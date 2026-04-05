# PROOF - PhoenixRisingThread39 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\PhoenixRisingThread39.txt


import { json, readJson } from "./util/http.js";
import { withAuth } from "./middleware/auth.js";
import { withHaltGate } from "./middleware/halt_gate.js";

// Route handlers
import { chatRoute } from "./routes/chat.js";
import { planRoute } from "./routes/plan.js";
import { simRoute } from "./routes/sim.js";
import { execRoute } from "./routes/exec.js";
