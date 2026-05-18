// src/virality.js — OBI Virality Engine v4.1
// Self-optimizing growth loop: Post → Metrics → Score → Learn → Evolve → Repeat
// Darwinian content selection — kill losers, scale winners

// ── Virality score calculation ─────────────────────────────
// Weighted engagement: shares > saves > comments > likes
// Watch time is TikTok/video bonus
export function calculateVirality(m) {
  const impressions = m.impressions || 1; // prevent division by zero
  const engagementRate =
    ((m.likes || 0) + (m.comments || 0) * 2 + (m.shares || 0) * 3 + (m.saves || 0) * 2) / impressions;
  const retentionWeight = m.watch_time ? Math.min(m.watch_time / 10, 1) : 0;
  const score = engagementRate * 0.7 + retentionWeight * 0.3;
  return Math.round(score * 10000) / 10000; // 4 decimal precision
}

// ── Conversion score (funnel-weighted) ─────────────────────
// Optimizes for business outcomes, not vanity metrics
export function calculateConversion(m) {
  const impressions = m.impressions || 1;
  const clicks = m.clicks || 0;
  const shares = m.shares || 0;
  const comments = m.comments || 0;
  const watchTime = m.watch_time ? Math.min(m.watch_time / 10, 1) : 0;

  const ctr = clicks / impressions;
  return Math.round((ctr * 0.4 + watchTime * 0.3 + (shares / impressions) * 0.2 + (comments / impressions) * 0.1) * 10000) / 10000;
}

// ── Experiment evaluation ──────────────────────────────────
// Minimum 100 impressions before judging
export function evaluateExperiment(exp) {
  if ((exp.impressions || 0) < 100) return "continue";
  const score = (exp.conversions || 0) / (exp.impressions || 1);
  if (score > 0.08) return "winner";
  if (score < 0.02) return "kill";
  return "continue";
}

// ── Variant generator ──────────────────────────────────────
// Creates hook variants from a base insight using different tones
export function generateVariants(baseInsight, winningPatterns) {
  const tones = [
    { tone: "shock", prefix: "This is why you still can't speak English." },
    { tone: "authority", prefix: "After teaching 500+ students in Vietnam," },
    { tone: "shame_gap", prefix: "Your classmates are improving. You're not." },
    { tone: "transformation", prefix: "This student went from Mouse to Tiger in 30 days." },
    { tone: "data", prefix: "We tested 100 students. Only 12 passed." },
  ];

  // If we have winning patterns, prioritize those tones
  const prioritized = winningPatterns && winningPatterns.length > 0
    ? tones.sort((a, b) => {
        const aWins = winningPatterns.filter(p => p.tone === a.tone).length;
        const bWins = winningPatterns.filter(p => p.tone === b.tone).length;
        return bWins - aWins;
      })
    : tones;

  return prioritized.slice(0, 3).map(t => ({
    hook: `${t.prefix} ${baseInsight}`,
    tone: t.tone,
    baseInsight,
  }));
}

// ── Pattern extraction ─────────────────────────────────────
// Extracts reusable patterns from winning posts
export function extractPattern(post, score) {
  return {
    hook_style: post.hook ? post.hook.substring(0, 60) : "",
    tone: post.tone || "unknown",
    platform: post.platform || "unknown",
    format: post.format || "text",
    score,
    insight: post.base_insight || "",
    extracted_at: Date.now(),
  };
}

// ── Hook optimizer ─────────────────────────────────────────
// Selects hooks based on historical performance
export function optimizeHook(hooks, patterns) {
  if (!patterns || patterns.length === 0) return hooks[0] || "";

  // Score each hook by matching tone to winning patterns
  const scored = hooks.map(h => {
    const toneMatch = patterns.filter(p => h.toLowerCase().includes(p.tone)).length;
    return { hook: h, score: toneMatch };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.hook || hooks[0] || "";
}

// ── Prompt mutation ────────────────────────────────────────
// Evolves the content generation prompt based on performance data
export function mutatePrompt(basePrompt, metrics) {
  const mutations = [];

  if (metrics.avgCtr < 0.03) mutations.push("Use shorter, punchier hooks (under 10 words).");
  if (metrics.avgShares < 2) mutations.push("Increase emotional contrast and transformation framing.");
  if (metrics.avgComments > metrics.avgShares) mutations.push("Add a clear call-to-action or challenge.");
  if (metrics.topTone) mutations.push(`Prioritize ${metrics.topTone} tone — it performs ${metrics.topToneMultiplier || 1}x better.`);
  if (metrics.avgWatchTime && metrics.avgWatchTime < 5) mutations.push("Front-load the hook in first 3 seconds.");

  if (mutations.length === 0) mutations.push("Current strategy is performing well. Maintain approach.");

  return `${basePrompt}\n\nAUTO-OPTIMIZATION RULES (from ${metrics.totalPosts || 0} posts analyzed):\n${mutations.map((m, i) => `${i + 1}. ${m}`).join("\n")}`;
}

// ── Learning loop — runs on cron ───────────────────────────
// Pulls metrics from CommandDO, scores, extracts patterns, evolves strategy
export async function runLearningLoop(env) {
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("virality-engine"));
  const report = { postsAnalyzed: 0, winners: 0, killed: 0, patternsExtracted: 0, errors: [] };

  try {
    // 1. Get unscored posts
    const unscoredRes = await stub.fetch(new Request("https://do/virality/unscored"));
    const unscoredData = await unscoredRes.json();
    const posts = unscoredData.posts || [];

    for (const post of posts) {
      try {
        const viralityScore = calculateVirality(post);
        const conversionScore = calculateConversion(post);

        // 2. Save scores
        await stub.fetch(new Request("https://do/virality/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.post_id, viralityScore, conversionScore }),
        }));
        report.postsAnalyzed++;

        // 3. Extract patterns from winners
        if (viralityScore > 0.05) {
          const pattern = extractPattern(post, viralityScore);
          await stub.fetch(new Request("https://do/virality/pattern", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pattern),
          }));
          report.patternsExtracted++;
          report.winners++;
        }

        // 4. Check experiments
        if (post.experiment_id) {
          const status = evaluateExperiment(post);
          if (status !== "continue") {
            await stub.fetch(new Request("https://do/virality/experiment/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ experimentId: post.experiment_id, status }),
            }));
            if (status === "kill") report.killed++;
          }
        }
      } catch (err) {
        report.errors.push({ postId: post.post_id, error: err.message });
      }
    }
  } catch (err) {
    report.errors.push({ phase: "fetch", error: err.message });
  }

  return report;
}
