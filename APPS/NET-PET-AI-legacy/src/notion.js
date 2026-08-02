// src/notion.js — Notion API integration for Natural English Training
// Cloudflare-native: uses fetch() directly — no npm deps, no external runtime.
// Connects Notion databases to NET-PET-AI for lesson management and progress tracking.
//
// Required secrets (set via `wrangler secret put`):
//   NOTION_API_KEY      — Internal integration token from https://www.notion.so/my-integrations
//   NOTION_LESSONS_DB   — Database ID for lesson content
//   NOTION_PROGRESS_DB  — Database ID for student progress tracking

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function notionFetch(apiKey, endpoint, method = "GET", body = null, retries = 2) {
  const opts = {
    method,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${NOTION_API}${endpoint}`, opts);
  const data = await res.json();

  if (!res.ok) {
    // Retry on transient server errors (5xx) only
    if (retries > 0 && res.status >= 500) {
      await new Promise(r => setTimeout(r, 600 * (3 - retries)));
      return notionFetch(apiKey, endpoint, method, body, retries - 1);
    }
    throw new Error(data.message || `Notion API ${res.status}`);
  }
  return data;
}

// ── Lessons: Query lesson database ────────────────────────────────────────────

export async function queryLessons(apiKey, databaseId, filters = {}) {
  const body = { page_size: filters.limit || 20 };

  const conditions = [];
  if (filters.level) {
    conditions.push({ property: "Level", select: { equals: filters.level } });
  }
  if (filters.topic) {
    conditions.push({ property: "Topic", rich_text: { contains: filters.topic } });
  }
  if (conditions.length === 1) body.filter = conditions[0];
  else if (conditions.length > 1) body.filter = { and: conditions };

  body.sorts = [{ property: "Order", direction: "ascending" }];

  const data = await notionFetch(apiKey, `/databases/${databaseId}/query`, "POST", body);

  return data.results.map(page => ({
    id: page.id,
    title: extractTitle(page.properties),
    level: extractSelect(page.properties, "Level"),
    topic: extractRichText(page.properties, "Topic"),
    content: extractRichText(page.properties, "Content"),
    order: extractNumber(page.properties, "Order"),
    status: extractSelect(page.properties, "Status"),
    lastEdited: page.last_edited_time,
  }));
}

// ── Progress: Write student progress to Notion ────────────────────────────────

export async function writeProgress(apiKey, databaseId, progress) {
  const { studentId, lessonId, score, level, notes, xp } = progress;

  const properties = {
    "Student ID": { title: [{ text: { content: studentId } }] },
    "Lesson": { rich_text: [{ text: { content: lessonId || "" } }] },
    "Score": { number: score || 0 },
    "Level": { select: { name: level || "Mouse" } },
    "XP": { number: xp || 0 },
    "Notes": { rich_text: [{ text: { content: notes || "" } }] },
    "Date": { date: { start: new Date().toISOString() } },
  };

  return notionFetch(apiKey, "/pages", "POST", {
    parent: { database_id: databaseId },
    properties,
  });
}

// ── Progress: Query student history from Notion ───────────────────────────────

export async function queryProgress(apiKey, databaseId, studentId, limit = 20) {
  const body = {
    page_size: limit,
    filter: {
      property: "Student ID",
      title: { equals: studentId },
    },
    sorts: [{ property: "Date", direction: "descending" }],
  };

  const data = await notionFetch(apiKey, `/databases/${databaseId}/query`, "POST", body);

  return data.results.map(page => ({
    id: page.id,
    studentId: extractTitle(page.properties),
    lesson: extractRichText(page.properties, "Lesson"),
    score: extractNumber(page.properties, "Score"),
    level: extractSelect(page.properties, "Level"),
    xp: extractNumber(page.properties, "XP"),
    notes: extractRichText(page.properties, "Notes"),
    date: page.properties.Date?.date?.start || null,
  }));
}

// ── Sync: Push all student progress to Notion in batch ────────────────────────

export async function syncStudentProgress(apiKey, progressDbId, env, studentId) {
  // Pull recent ledger entries for this student
  const ledgerId = env.LEDGER.idFromName(studentId);
  const ledgerStub = env.LEDGER.get(ledgerId);

  const ledgerReq = new Request("https://do/history?limit=50", { method: "GET" });
  const ledgerRes = await ledgerStub.fetch(ledgerReq);
  const ledgerData = await ledgerRes.json();

  if (!ledgerData.entries?.length) return { synced: 0 };

  // Filter to chat/lesson entries and push to Notion
  let synced = 0;
  for (const entry of ledgerData.entries.slice(0, 10)) {
    if (entry.type === "chat" || entry.type === "lesson" || entry.type === "practice") {
      await writeProgress(apiKey, progressDbId, {
        studentId,
        lessonId: entry.type,
        score: entry.payload?.confidence || 0,
        level: entry.payload?.level || "Mouse",
        notes: entry.payload?.summary || entry.type,
        xp: entry.payload?.xp || 0,
      });
      synced++;
    }
  }

  return { synced, studentId };
}

// ── Property extractors ───────────────────────────────────────────────────────

function extractTitle(props) {
  for (const key of Object.keys(props)) {
    if (props[key].type === "title" && props[key].title?.length) {
      return props[key].title.map(t => t.plain_text).join("");
    }
  }
  return "";
}

function extractRichText(props, name) {
  const prop = props[name];
  if (!prop || prop.type !== "rich_text") return "";
  return (prop.rich_text || []).map(t => t.plain_text).join("");
}

function extractSelect(props, name) {
  const prop = props[name];
  if (!prop || prop.type !== "select") return "";
  return prop.select?.name || "";
}

function extractNumber(props, name) {
  const prop = props[name];
  if (!prop || prop.type !== "number") return 0;
  return prop.number || 0;
}

// ── Soul DNA: Write Soul DNA entry to Notion database ─────────────────────────

export async function writeSoulDNA(apiKey, databaseId, payload) {
  const properties = {
    "Entry": { title: [{ text: { content: payload.source || "soul_dna_capture" } }] },
    "Run": { rich_text: [{ text: { content: String(payload.run || "") } }] },
    "Hash": { rich_text: [{ text: { content: payload.entryHash || "" } }] },
    "Date": { date: { start: new Date().toISOString() } },
  };

  if (payload.text) {
    properties["Content"] = { rich_text: [{ text: { content: payload.text.slice(0, 2000) } }] };
  }

  return notionFetch(apiKey, "/pages", "POST", {
    parent: { database_id: databaseId },
    properties,
  });
}

// ── Chat Exchange: Mirror chat to Notion progress DB ──────────────────────────

export async function writeChatExchange(apiKey, databaseId, exchange) {
  const { studentId, userMessage, obiReply, level } = exchange;

  const properties = {
    "Student ID": { title: [{ text: { content: studentId } }] },
    "Lesson": { rich_text: [{ text: { content: "chat_exchange" } }] },
    "Level": { select: { name: level || "Mouse" } },
    "Notes": { rich_text: [{ text: { content: `User: ${(userMessage || "").slice(0, 800)}\nOBI: ${(obiReply || "").slice(0, 800)}` } }] },
    "Date": { date: { start: new Date().toISOString() } },
    "Score": { number: 0 },
    "XP": { number: 0 },
  };

  return notionFetch(apiKey, "/pages", "POST", {
    parent: { database_id: databaseId },
    properties,
  });
}
