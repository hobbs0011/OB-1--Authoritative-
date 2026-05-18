/**
 * RETENTION CRON JOB
 * ─────────────────────────────────────────────────────────────
 * Runs every 6 hours to:
 * 1. Scan all active students for inactivity
 * 2. Trigger Zalo alerts for escalation levels
 * 3. Log metrics for analytics
 * 
 * Add this to your Worker's scheduled handler:
 * 
 *   export async function scheduled(event, env, ctx) {
 *     return await handleRetentionCron(event, env, ctx);
 *   }
 */

import { RetentionEngineV1 } from "./retention-engine-v1.js";
import { ZaloPressureAPI } from "./zalo-pressure-api.js";

export async function handleRetentionCron(event, env, ctx) {
  console.log("[CRON] Retention sweep started");

  try {
    // ─ STEP 1: Fetch all active students from D1
    const students = await fetchActiveStudentsFromD1(env);
    console.log(`[CRON] Found ${students.length} active students`);

    if (students.length === 0) {
      return new Response(JSON.stringify({ message: "No active students" }), {
        status: 200,
      });
    }

    // ─ STEP 2: Run retention check on each
    const inactiveStudents = [];
    for (const student of students) {
      const studentBrainId = env.STUDENT_BRAIN.idFromName(student.id);
      const stub = env.STUDENT_BRAIN.get(studentBrainId);

      // Call /retention-check on the student's Durable Object
      const checkResponse = await stub.fetch(
        new Request("https://do/retention-check", {
          method: "GET",
        })
      );

      const checkData = await checkResponse.json();

      if (checkData.retention_check_result.needsAttention) {
        inactiveStudents.push({
          ...student,
          ...checkData.retention_check_result,
          escalationLevel: checkData.student_memory_snapshot.escalation_level,
        });
      }
    }

    console.log(
      `[CRON] Found ${inactiveStudents.length} students needing attention`
    );

    // ─ STEP 3: Fire Zalo alerts
    let zaloResults = { sent: 0, failed: 0, skipped: 0 };
    if (inactiveStudents.length > 0) {
      zaloResults = await fireZaloAlerts(inactiveStudents, env);
    }

    // ─ STEP 4: Log metrics
    const cronResult = {
      timestamp: Date.now(),
      studentsScanned: students.length,
      inactiveCount: inactiveStudents.length,
      zaaloAlerts: zaloResults,
      status: "completed",
    };

    console.log(
      "[CRON] Retention sweep completed:",
      JSON.stringify(cronResult)
    );

    // Store result in KV for inspection
    if (env.CRON_LOGS_KV) {
      await env.CRON_LOGS_KV.put(
        `retention_cron_${Date.now()}`,
        JSON.stringify(cronResult),
        { expirationTtl: 86400 * 7 } // 7 days
      );
    }

    return new Response(JSON.stringify(cronResult), { status: 200 });
  } catch (err) {
    console.error("[CRON] Retention sweep error:", err);
    return new Response(
      JSON.stringify({
        error: "Retention sweep failed",
        message: err.message,
      }),
      { status: 500 }
    );
  }
}

/**
 * FETCH ACTIVE STUDENTS: Query D1 database
 */
async function fetchActiveStudentsFromD1(env) {
  if (!env.DB) {
    console.warn("[CRON] No D1 database binding. Using mock data.");
    return []; // Fallback: no students to scan
  }

  try {
    const students = await env.DB.prepare(
      `SELECT 
        id, name, phone, 
        accountability_partner_phone,
        accountability_partner_type,
        last_active
      FROM users 
      WHERE is_active = 1 
      ORDER BY last_active DESC 
      LIMIT 1000`
    ).all();

    return students.results || [];
  } catch (err) {
    console.error("[CRON] D1 query error:", err);
    return [];
  }
}

/**
 * FIRE ZALO ALERTS: Send escalation messages
 */
async function fireZaloAlerts(inactiveStudents, env) {
  const zalo = new ZaloPressureAPI(env);
  const results = {
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const student of inactiveStudents) {
    if (!student.accountability_partner_phone) {
      results.skipped++;
      continue;
    }

    const sendResult = await zalo.sendEscalationMessage(
      student.accountability_partner_phone,
      student.name,
      student.escalationLevel
    );

    if (sendResult.success) {
      results.sent++;
      console.log(`[ZALO] Message sent to ${student.id}`);
    } else {
      results.failed++;
      console.error(
        `[ZALO] Failed for ${student.id}: ${sendResult.error}`
      );
    }

    // Rate limit: 200ms between messages
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * ADD TO YOUR WORKER (src/index.js):
 * 
 * import { handleRetentionCron } from './retention-cron.js';
 * 
 * export default {
 *   async fetch(request, env) { ... },
 *   async scheduled(event, env, ctx) {
 *     return await handleRetentionCron(event, env, ctx);
 *   }
 * };
 */
