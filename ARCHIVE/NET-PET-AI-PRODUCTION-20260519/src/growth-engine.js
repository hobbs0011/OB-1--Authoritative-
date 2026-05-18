// src/growth-engine.js — OBI Auto Post Engine v1
// Mistake Data → Content Brain → Formatter → Queue → Platform Adapters → Auto Post
// Core principle: Every post must originate from REAL student learning data.

// ── Content Brain: Generate posts from real correction data ───────────────────

async function generatePosts(env, limit = 5) {
  if (!env.LEDGER) return [];

  // Pull recent corrections from a system-level ledger query
  // We aggregate from all students via the system-roster
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];

  const corrections = [];
  for (const student of students.slice(0, 20)) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(student.student_id));
      const histRes = await stub.fetch(new Request("https://do/history?limit=5&eventType=correction"));
      const histData = await histRes.json();
      for (const entry of (histData.entries || [])) {
        try {
          const payload = JSON.parse(entry.payload);
          if (!payload.wasCorrect && payload.original && payload.corrected) {
            corrections.push({
              original: payload.original,
              corrected: payload.corrected,
              ts: entry.ts,
            });
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  if (corrections.length === 0) return [];

  // Deduplicate by original text and pick the most recent
  const seen = new Set();
  const unique = corrections.filter(c => {
    const key = c.original.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => b.ts - a.ts).slice(0, limit);

  // Generate posts from real mistakes
  return unique.map(c => ({
    text: buildInsightPost(c),
    platforms: getPlatforms(env),
    source: { original: c.original, corrected: c.corrected, ts: c.ts },
  }));
}

// ── Post Builder: Real learning data → shareable content ──────────────────────

function buildInsightPost(correction) {
  const hooks = [
    "This is the #1 mistake Vietnamese English learners make:",
    "Your English teacher won't tell you this:",
    "Stop saying this wrong. Here's the fix:",
    "Real student. Real mistake. Real fix:",
    "3 seconds to better English:",
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  return `${hook}

❌ "${correction.original}"
✅ "${correction.corrected}"

This is why daily speaking practice matters.

Not studying. Training.

#EnglishPractice #LearnEnglish #VietnamEnglish #OBI`;
}

// ── Content Filter: Only post if it has real correction data ──────────────────

function isValidPost(post) {
  return post.text && post.source?.original && post.source?.corrected;
}

// ── Platform detection: which adapters are configured ─────────────────────────

function getPlatforms(env) {
  const platforms = [];
  if (env.DISCORD_WEBHOOK) platforms.push("discord");
  if (env.FB_TOKEN && env.FB_PAGE_ID) platforms.push("facebook");
  if (env.LINKEDIN_TOKEN && env.LINKEDIN_USER) platforms.push("linkedin");
  // TikTok = export only (no API), Instagram = via Facebook Graph
  return platforms.length > 0 ? platforms : ["discord"]; // default to Discord
}

// ── Router: Distribute post to all configured platforms ───────────────────────

async function routePost(env, post) {
  if (!isValidPost(post)) return { skipped: true, reason: "invalid_post" };

  const results = {};

  if (post.platforms.includes("discord") && env.DISCORD_WEBHOOK) {
    results.discord = await postDiscord(post.text, env.DISCORD_WEBHOOK);
  }

  if (post.platforms.includes("facebook") && env.FB_TOKEN && env.FB_PAGE_ID) {
    results.facebook = await postFacebook(post.text, env);
  }

  if (post.platforms.includes("linkedin") && env.LINKEDIN_TOKEN && env.LINKEDIN_USER) {
    results.linkedin = await postLinkedIn(post.text, env);
  }

  // Log the post to LedgerDO for history
  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName("system-growth"));
      await stub.fetch(new Request("https://do/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "system-growth",
          eventType: "auto_post",
          payload: JSON.stringify({
            text: post.text.slice(0, 500),
            platforms: Object.keys(results),
            results: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.ok])),
            ts: Date.now(),
          }),
        }),
      }));
    } catch (_) {}
  }

  return results;
}

// ── Platform Adapters ─────────────────────────────────────────────────────────

// Discord — webhook post
async function postDiscord(text, webhookUrl) {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.slice(0, 2000) }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Facebook — Graph API page post
async function postFacebook(text, env) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${env.FB_PAGE_ID}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          access_token: env.FB_TOKEN,
        }),
      }
    );
    const data = await res.json();
    return { ok: !data.error, id: data.id || null, error: data.error?.message };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// LinkedIn — UGC Post API
async function postLinkedIn(text, env) {
  try {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.LINKEDIN_TOKEN}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${env.LINKEDIN_USER}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// TikTok — export only (no clean public posting API)
function exportTikTok(post) {
  return {
    caption: post.text,
    hook: post.text.split("\n")[0],
    format: "text_overlay",
  };
}

export { generatePosts, routePost, buildInsightPost, exportTikTok, isValidPost };
