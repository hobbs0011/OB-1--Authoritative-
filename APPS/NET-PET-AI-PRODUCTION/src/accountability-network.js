/**
 * ACCOUNTABILITY NETWORK — Multi-Stakeholder Engagement Layer
 * 
 * Connects student learning to external accountability nodes:
 * Parent → receive weekly progress
 * Boss → receive speaking proficiency signals
 * Partner → mutual language exchange tracking
 * Self → internal reminder system
 * 
 * Architecture: Durable Object per student tracks accountability state + sends triggers
 */

export class AccountabilityNetwork {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * NODE TYPES: Who gets notified about what?
   */

  async registerNode(studentId, nodeType, contact, frequency = "weekly") {
    const nodeId = crypto.randomUUID();

    const node = {
      id: nodeId,
      studentId,
      type: nodeType, // "parent" | "boss" | "partner" | "self"
      contact, // email or phone or webhook
      frequency, // "immediate" | "daily" | "weekly" | "monthly"
      createdAt: Date.now(),
      lastNotified: null,
      status: "ACTIVE"
    };

    await this.storage.put(`accountability:${nodeId}`, node);

    // Add to student's node list
    const nodeList = await this.storage.get(`accountability_nodes:${studentId}`) || [];
    nodeList.push(nodeId);
    await this.storage.put(`accountability_nodes:${studentId}`, nodeList);

    return node;
  }

  /**
   * TRIGGER SYSTEM: When does accountability fire?
   */

  async shouldTriggerAccountability(studentId, context) {
    const nodes = await this.storage.get(`accountability_nodes:${studentId}`) || [];

    if (nodes.length === 0) return { shouldTrigger: false };

    // TRIGGER RULES:
    // 1. Student missed 2+ consecutive sessions
    // 2. Drift score > 7 (major deviation from learning path)
    // 3. Student downgraded mode (Tiger → Mouse)
    // 4. Streak broken (missed daily practice)

    const memory = context.memory || {};
    const metrics = context.metrics || {};

    let triggers = [];

    // Rule 1: Missed sessions
    if (metrics.sessionsMissed >= 2) {
      triggers.push({
        type: "PARENT",
        reason: `Student missed ${metrics.sessionsMissed} sessions`,
        severity: "HIGH"
      });
    }

    // Rule 2: Drift
    if (context.driftScore > 7) {
      triggers.push({
        type: "BOSS",
        reason: `Major drift detected in learning objective (score: ${context.driftScore}/10)`,
        severity: "HIGH"
      });
    }

    // Rule 3: Mode downgrade (Tiger → Mouse)
    if (context.previousMode === "TIGER" && context.currentMode === "MOUSE") {
      triggers.push({
        type: "PARTNER",
        reason: "Confidence dropped significantly this week",
        severity: "MEDIUM"
      });
    }

    // Rule 4: Streak broken
    if (memory.streak === 0 && context.prevStreak > 0) {
      triggers.push({
        type: "SELF",
        reason: `Daily streak broken (was ${context.prevStreak} days)`,
        severity: "MEDIUM"
      });
    }

    return {
      shouldTrigger: triggers.length > 0,
      triggers,
      nodeCount: nodes.length,
      nodes
    };
  }

  /**
   * NOTIFICATION PAYLOADS: What message goes to each stakeholder?
   */

  async formatNotification(nodeType, studentId, trigger) {
    const studentData = (await this.storage.get(`memory:${studentId}`)) || {};

    const baseSummary = {
      studentId,
      level: studentData.level || "A1",
      sessionsCompleted: studentData.sessionsCompleted || 0,
      streak: studentData.streak || 0,
      triggerReason: trigger.reason,
      timestamp: new Date().toISOString()
    };

    // PARENT NOTIFICATION: Focus on progress & encouragement
    if (nodeType === "PARENT") {
      return {
        to: "parent",
        subject: `${studentId}'s English Learning Progress Report`,
        body: `
Your child has completed ${baseSummary.sessionsCompleted} sessions and is at level ${baseSummary.level}.

Current Status: ${baseSummary.streak > 0 ? `On a ${baseSummary.streak}-day streak!` : "Re-engaging with learning"}

${trigger.reason}

Next Steps: Encourage ${studentId} to practice daily. Each session compounds!

Direct them to: https://naturalenglishtraining.net
        `,
        actionUrl: "https://teacher-dashboard.naturalenglishtraining.net/family",
        icon: "📚"
      };
    }

    // BOSS NOTIFICATION: Focus on speaking proficiency & business value
    if (nodeType === "BOSS") {
      return {
        to: "boss",
        subject: `${studentId}'s English Speaking Proficiency Update`,
        body: `
Speaking Level: ${baseSummary.level}
Learning Consistency: ${Math.round((baseSummary.sessionsCompleted / 30) * 100)}% of 30-day target

${trigger.reason}

This systematic practice will improve meeting effectiveness and client communication.

Track progress: https://boss-dashboard.naturalenglishtraining.net
        `,
        actionUrl: "https://boss-dashboard.naturalenglishtraining.net/team",
        icon: "💼"
      };
    }

    // PARTNER NOTIFICATION: Focus on mutual support & peer learning
    if (nodeType === "PARTNER") {
      return {
        to: "partner",
        subject: `${studentId} Learning Check-In`,
        body: `
Hey! ${studentId} is working on English together.

Level: ${baseSummary.level}
Progress: ${baseSummary.sessionsCompleted} sessions

${trigger.reason}

Want to practice together? Both of you at: https://exchange.naturalenglishtraining.net
        `,
        actionUrl: "https://exchange.naturalenglishtraining.net",
        icon: "🤝"
      };
    }

    // SELF NOTIFICATION: Gamified motivation + streaks
    if (nodeType === "SELF") {
      return {
        to: "self",
        subject: `🎯 Your Daily English Practice Reminder`,
        body: `
${trigger.reason}

Your current streak: ${baseSummary.streak} days
Total sessions: ${baseSummary.sessionsCompleted}

Next session target: Tomorrow at 7 AM (your usual time)

You're building a real skill. Keep going! 🐅
        `,
        actionUrl: "https://naturalenglishtraining.net/chat",
        icon: "⚡"
      };
    }
  }

  /**
   * SEND: Route notification to appropriate channel
   */
  async sendNotification(nodeType, contact, notification) {
    // In real implementation, integrate with:
    // - Email service (SendGrid/AWS SES)
    // - SMS (Twilio)
    // - Webhooks (custom integrations)
    // - In-app notifications (push via Cloudflare Durable Objects)

    // For MVP, just log + return success
    const record = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      nodeType,
      contact,
      subject: notification.subject,
      status: "SENT"
    };

    await this.storage.put(`notification:${record.id}`, record);

    console.log(`[ACCOUNTABILITY] ${nodeType.toUpperCase()} notification sent:`, notification.subject);

    return record;
  }

  /**
   * ACCOUNTABILITY DASHBOARD: What metrics does each stakeholder see?
   */

  async getStakeholderView(nodeType, studentId) {
    if (nodeType === "PARENT") {
      const memory = await this.storage.get(`memory:${studentId}`) || {};
      const sessions = await this.storage.get(`sessions:${studentId}`) || [];

      return {
        studentName: studentId,
        level: memory.level,
        sessionsThisWeek: sessions.filter(s => s.timestamp > Date.now() - 604800000).length,
        streak: memory.streak,
        weakAreas: memory.weakAreas,
        nextMilestone: memory.level === "A1" ? "Complete 10 sessions → A2" : "In progress",
        encouragementMessage: `${studentId} is making steady progress. Consistent daily practice is key!`
      };
    }

    if (nodeType === "BOSS") {
      const memory = await this.storage.get(`memory:${studentId}`) || {};
      const sessions = await this.storage.get(`sessions:${studentId}`) || [];

      return {
        employeeName: studentId,
        speakingLevel: memory.level,
        learningConsistency: (sessions.length / 30) * 100,
        communicationReadiness: memory.level >= "B1" ? "READY_FOR_CLIENT_CALLS" : "IN_DEVELOPMENT",
        businessMetrics: {
          meetingParticipationScore: memory.level === "A1" ? "NEEDS_SUPPORT" : "READY",
          presentationReadiness: memory.level >= "B2" ? "CONFIDENT" : "DEVELOPING"
        }
      };
    }

    if (nodeType === "PARTNER") {
      const memory = await this.storage.get(`memory:${studentId}`) || {};

      return {
        partnerName: studentId,
        currentLevel: memory.level,
        focusAreas: memory.weakAreas,
        suggestedExercises: [
          "Daily conversation practice: 15 min",
          "Focus on weak area: " + (memory.weakAreas[0] || "general"),
          "Record yourself speaking"
        ],
        mutualGoal: "Both reach B1 level together"
      };
    }

    if (nodeType === "SELF") {
      const memory = await this.storage.get(`memory:${studentId}`) || {};
      const mouseTiger = await this.storage.get(`mouse_tiger_history:${studentId}`) || [];

      return {
        myLevel: memory.level,
        myStreak: memory.streak,
        todaysPractice: "Not yet started",
        confidence: mouseTiger.length > 0 ? mouseTiger[mouseTiger.length - 1] : 50,
        nextLessonTopic: memory.weakAreas[0] || "speaking fluency",
        dailyGoal: "Complete 1 session (10 min)"
      };
    }
  }

  /**
   * RETRIEVE: List all nodes for a student (admin view)
   */
  async listNodes(studentId) {
    const nodeIds = await this.storage.get(`accountability_nodes:${studentId}`) || [];
    const nodes = [];

    for (const nodeId of nodeIds) {
      const node = await this.storage.get(`accountability:${nodeId}`);
      if (node) nodes.push(node);
    }

    return nodes;
  }
}
