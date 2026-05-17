/**
 * RETENTION ENGINE v1
 * ─────────────────────────────────────────────────────────────
 * The 70% of your product that generates revenue
 * 
 * What it does:
 * - Tracks daily active status per student
 * - Calculates streak decay (24h→-1, 48h→reset, 72h→escalate)
 * - Triggers Zalo accountability alerts  
 * - Generates escalation messages (Day 1,3,5,7 pressure ladder)
 * - Detects drift (needsAttention flag)
 * 
 * This is the system that turns casual users into committed learners
 * by making failure visible to their accountability partners
 */

export class RetentionEngineV1 {
  constructor(studentMemory) {
    this.memory = studentMemory || {
      streak: 0,
      last_active: Date.now(),
      inactive_since: null,
      attention_required: false,
      escalation_level: 0,
      parent_alerts_sent: 0,
      boss_pings: 0,
      partner_notifs: 0,
      last_escalation_at: null,
    };
  }

  /**
   * CORE LOGIC: Check stream decay and update status
   * Called on every interaction
   */
  updateActive() {
    const now = Date.now();
    this.memory.last_active = now;

    // Clear inactive flag if user returns
    if (this.memory.inactive_since) {
      this.memory.inactive_since = null;
    }

    if (this.memory.attention_required && this.memory.escalation_level < 4) {
      // User returned before Day 7 escalation. Reward.
      this.memory.attention_required = false;
      this.memory.escalation_level = 0;
      return { action: "RESET_PRESSURE", message: "Welcome back! Streak reset." };
    }

    return { action: "ACTIVE", message: "Session updated" };
  }

  /**
   * RETENTION HEARTBEAT: Run every 6h or 24h
   * This is what triggers parent/boss alerts
   */
  checkStreakDecay() {
    const now = Date.now();
    const hoursInactive = (now - this.memory.last_active) / (1000 * 60 * 60);

    // 24h threshold: streak begins to decay
    if (hoursInactive >= 24 && !this.memory.inactive_since) {
      this.memory.inactive_since = now;
      this.memory.escalation_level = 1; // Day 1 warning
      return {
        needsAttention: true,
        action: "DAY_1_WARNING",
        escalationLevel: 1,
        hoursInactive,
        message: "Student inactive for 24h. Day 1 warning started.",
      };
    }

    // 48h threshold: streak = 0, escalate to parent/boss
    if (hoursInactive >= 48 && this.memory.escalation_level < 2) {
      this.memory.streak = 0; // RESET
      this.memory.escalation_level = 2; // Day 2 escalation
      this.memory.attention_required = true;
      return {
        needsAttention: true,
        action: "DAY_2_ESCALATE_TO_PARENT",
        escalationLevel: 2,
        hoursInactive,
        message: "Streak reset. Parent/boss alert triggered.",
        triggerZaloWebhook: true,
        webhookTemplate: "streak_broken",
      };
    }

    // 72h threshold: Day 3 – doubled pressure
    if (hoursInactive >= 72 && this.memory.escalation_level < 3) {
      this.memory.escalation_level = 3; // Day 3 doubled pressure
      return {
        needsAttention: true,
        action: "DAY_3_DOUBLED_PRESSURE",
        escalationLevel: 3,
        hoursInactive,
        message: "Day 3 inactive. Sending second alert + penalty.",
        triggerZaloWebhook: true,
        webhookTemplate: "streak_critical",
        penalty: { points: -5, description: "3-day inactivity penalty" },
      };
    }

    // 168h (7 days) threshold: NUCLEAR OPTION
    if (hoursInactive >= 168 && this.memory.escalation_level < 4) {
      this.memory.escalation_level = 4; // Day 7 – account flagged
      return {
        needsAttention: true,
        action: "DAY_7_ACCOUNT_FLAGGED",
        escalationLevel: 4,
        hoursInactive,
        message: "7-day inactive. Account flagged. Final alert to accountability partners.",
        triggerZaloWebhook: true,
        webhookTemplate: "account_at_risk",
        accountStatus: "flagged_for_review",
      };
    }

    // User is active — all good
    return {
      needsAttention: false,
      action: "NO_ACTION",
      escalationLevel: this.memory.escalation_level,
      hoursInactive,
      message: "Student active. Streak maintained.",
    };
  }

  /**
   * TIGER SCORE BOOSTER: Bonus for consistency
   */
  calculateStreakBonus() {
    if (this.memory.streak === 0) return 0;
    if (this.memory.streak < 3) return 5;
    if (this.memory.streak < 7) return 10;
    if (this.memory.streak < 30) return 15;
    return 20; // Max 20-point bonus for 30+ day streak
  }

  /**
   * ESCALATION MESSAGE GENERATOR
   * Produces the exact text sent via Zalo to parents/bosses
   */
  generateEscalationMessage(studentName, accountabilityPartner) {
    const templates = {
      day_1: `Hi ${accountabilityPartner}, ${studentName} hasn't trained since yesterday. Tiger Score is dropping. One more day and we reset the streak. 💪`,

      day_2: `⚠️ ${studentName} has NOT trained for 2 days. Streak is BROKEN. Tiger Score reset to 0. Please check in. 🚨`,

      day_3: `🔥 CRITICAL: ${studentName} inactive for 3 days. OBI system sending final alert. Last chance to save progress before account review.`,

      day_7: `❌ ${studentName} account FLAGGED after 7 days inactive. Unless we see action TODAY, we're marking this as abandoned. Time to re-engage or refund. Make the call. 📞`,
    };

    const template =
      templates[`day_${this.memory.escalation_level}`] ||
      templates.day_1;
    return template;
  }

  /**
   * DAILY CRON JOB: Scans all students, fires webhooks
   * Returns list of students needing attention
   */
  static async scanAllStudentsForEscalation(studentsArray) {
    const needsAttention = [];

    for (const student of studentsArray) {
      const engine = new RetentionEngineV1(student.memory);
      const result = engine.checkStreakDecay();

      if (result.needsAttention) {
        needsAttention.push({
          studentId: student.id,
          studentName: student.name,
          escalationLevel: result.escalationLevel,
          action: result.action,
          webhookTemplate: result.webhookTemplate,
          message: result.message,
        });
      }
    }

    return needsAttention;
  }

  /**
   * RETENTION STAT SNAPSHOT: For dashboards/reporting
   */
  getRetentionSnapshot() {
    const now = Date.now();
    const daysSinceActive = (now - this.memory.last_active) / (1000 * 60 * 60 * 24);
    return {
      streak: this.memory.streak,
      daysSinceLastActive: Math.round(daysSinceActive * 100) / 100,
      needsAttention: this.memory.attention_required,
      escalationLevel: this.memory.escalation_level,
      parentAlertsCount: this.memory.parent_alerts_sent,
      status:
        daysSinceActive < 1
          ? "ACTIVE"
          : daysSinceActive < 2
            ? "AT_RISK"
            : daysSinceActive < 3
              ? "CRITICAL"
              : "ABANDONED",
    };
  }
}

/**
 * Durable Object Hook: Integrate into StudentDO
 * 
 * Inside your StudentDO.handleChat():
 * 
 *   const retention = new RetentionEngineV1(memory);
 *   retention.updateActive();  // User is active
 *   const result = retention.checkStreakDecay();
 *   
 *   if (result.needsAttention && result.triggerZaloWebhook) {
 *     await this.fireZaloWebhook(result.webhookTemplate, studentId);
 *   }
 */
