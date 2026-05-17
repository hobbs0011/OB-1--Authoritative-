/**
 * ZALO PRESSURE API CONNECTOR v1
 * ─────────────────────────────────────────────────────────────
 * Weaponizes the Vietnamese fear of "losing face" (Mặt mũi)
 * by sending automated accountability pings to parents/bosses
 * 
 * This is your unforkable moat in Vietnam.
 * Competitors can clone your AI, but they cannot fork a student's
 * relationship with their parent or boss.
 */

export class ZaloPressureAPI {
  constructor(env) {
    this.accessToken = env.ZALO_ACCESS_TOKEN;
    this.oaAccessToken = env.ZALO_OA_ACCESS_TOKEN; // Official Account token
    this.apiUrl = "https://openapi.zalo.me/";
    this.version = "v3";
  }

  /**
   * SEND DIRECT MESSAGE to parent/boss Zalo via Official Account
   * This is the core "Pressure" mechanism
   */
  async sendPressureMessage(recipientPhoneOrUID, messageText, metadata = {}) {
    if (!this.oaAccessToken) {
      return {
        success: false,
        error: "ZALO_OA_ACCESS_TOKEN not configured",
        fallback: "SMS or email required as backup",
      };
    }

    try {
      const payload = {
        recipient: recipientPhoneOrUID, // Phone number or Zalo UID
        message: {
          text: messageText,
        },
        ...metadata, // Custom buttons, quick replies, etc.
      };

      const response = await fetch(`${this.apiUrl}${this.version}/oa/message/cs/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.oaAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`[ZALO] Send failed: ${result.error || result.message}`);
        return {
          success: false,
          error: result.error || result.message,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        messageId: result.data?.message_id,
        timestamp: Date.now(),
        recipient: recipientPhoneOrUID,
      };
    } catch (err) {
      console.error(`[ZALO] Connector error:`, err);
      return {
        success: false,
        error: err.message,
        fallback: "Network error. Check connection.",
      };
    }
  }

  /**
   * ESCALATION LADDER Messages (pre-templated)
   */
  async sendEscalationMessage(recipientPhone, studentName, escalationLevel) {
    const templates = {
      1: `Hi! ${studentName} hasn't trained with OBI today. No worries yet—but let's keep the streak alive. 💪 Check in?`,

      2: `⚠️ Update: ${studentName}'s streak is BROKEN (2 days inactive). Tiger Score reset to 0. Time to re-engage! 🎯`,

      3: `🔥 CRITICAL: ${studentName} hasn't trained for 3+ days. OBI system sending this: last chance to save progress before account review. Act now! 📞`,

      4: `❌ FINAL: ${studentName}'s account is FLAGGED (7 days inactive). Unless we see action TODAY, marking as abandoned. Refund or re-engage? Make the call. 🚨`,
    };

    const message = templates[escalationLevel] || templates[1];
    return this.sendPressureMessage(recipientPhone, message, {
      tracking_id: `escalation_level_${escalationLevel}_${Date.now()}`,
    });
  }

  /**
   * BULK ESCALATION SWEEP: Cron job for all inactive students
   * Called by Cloudflare Cron Triggers (every 6h or 24h)
   */
  async runEscalationSweep(inactiveStudents, env) {
    const results = [];

    for (const student of inactiveStudents) {
      const { studentId, studentName, escalationLevel, accountabilityPartner } =
        student;

      // Get the parent/boss phone from accountability mapping
      const partnerPhone = await this.getAccountabilityPartnerPhone(
        studentId,
        accountabilityPartner,
        env
      );

      if (!partnerPhone) {
        results.push({
          studentId,
          status: "SKIP_NO_PHONE",
          reason: "No accountability partner phone configured",
        });
        continue;
      }

      // Send the escalation message
      const sendResult = await this.sendEscalationMessage(
        partnerPhone,
        studentName,
        escalationLevel
      );

      results.push({
        studentId,
        status: sendResult.success ? "SENT" : "FAILED",
        escalationLevel,
        messageId: sendResult.messageId,
        error: sendResult.error || null,
        timestamp: Date.now(),
      });

      // Respect Zalo API rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return results;
  }

  /**
   * FETCH PARTNER PHONE: Query accountability network
   * This maps student → parent/boss → phone number
   * 
   * Expected structure in D1 or KV:
   * accountability_links: {
   *   "student-001": ["parent_phone_84909xxx", "boss_phone_84901xxx"]
   * }
   */
  async getAccountabilityPartnerPhone(studentId, partnerType, env) {
    // Priority: Check D1 first
    if (env.DB) {
      const links = await env.DB.prepare(
        `SELECT phone FROM accountability_links 
         WHERE student_id = ? AND partner_type = ?`
      )
        .bind(studentId, partnerType)
        .first();

      if (links) return links.phone;
    }

    // Fallback: Check KV store
    if (env.ACCOUNTABILITY_KV) {
      const kvKey = `${studentId}:${partnerType}`;
      const phone = await env.ACCOUNTABILITY_KV.get(kvKey);
      if (phone) return phone;
    }

    // If nothing found, skip (no accountability partner configured)
    return null;
  }

  /**
   * WEBHOOK RECEIVER: Listen for Zalo user responses
   * When parent/boss replies, log it for future personalization
   */
  async handleZaloInboundMessage(payload) {
    const { from_uid, message_text, message_id, timestamp } = payload;

    // Log the response
    return {
      status: "received",
      fromUid: from_uid,
      messageId: message_id,
      text: message_text,
      timestamp,
      action: "logged_for_analysis", // Could trigger re-engagement if positive
    };
  }

  /**
   * TEST MODE: Dry-run escalation without actually sending
   */
  async testEscalationFlow(studentName, phone) {
    const message = `[TEST] Hi! ${studentName} hasn't trained. Check in? (This is a TEST message—not sent to real Zalo)`;
    console.log(`[ZALO TEST] Would send to ${phone}: ${message}`);
    return {
      success: true,
      mode: "TEST",
      message,
      recipient: phone,
    };
  }
}

/**
 * INTEGRATION EXAMPLE (in your Worker or Cron trigger):
 * 
 * export async function handleCronEscalation(env) {
 *   const retention = new RetentionEngineV1({});
 *   const inactiveStudents = await retention.scanAllStudentsForEscalation(
 *     // fetch from D1 all students
 *   );
 *   
 *   const zalo = new ZaloPressureAPI(env);
 *   const results = await zalo.runEscalationSweep(inactiveStudents, env);
 *   
 *   return Response.json({
 *     totalStudentsScanned: inactiveStudents.length,
 *     messagesAttempted: results.length,
 *     sent: results.filter(r => r.status === "SENT").length,
 *     failed: results.filter(r => r.status === "FAILED").length,
 *   });
 * }
 */
