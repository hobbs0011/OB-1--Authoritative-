// src/obi-orchestration-router.js — Request routing for Agent99 + Context Builder
// Integrates: ContextBuilder → Agent99Orchestrator → LedgerUpdate
// Authority: BIBLE-CH26 BLOCKS 1, 5, 7

import { ContextBuilder } from './context-builder.js';
import { Agent99Orchestrator } from './agent99-orchestrator.js';

export class OBIOrchestrationRouter {
  constructor(env) {
    this.env = env; // Cloudflare Worker env { STUDENT_BRAIN, LEDGER, etc }
    this.contextBuilder = new ContextBuilder({
      STUDENT_BRAIN: env.STUDENT_BRAIN,
      LEDGER: env.LEDGER,
    });
  }

  /**
   * MAIN ENTRY POINT: /chat handler
   * Orchestrates the full pipeline: Context → Reasoning → Update
   */
  async handleChatRequest(studentId, userMessage) {
    try {
      // Phase 1: Build full context (Soul + SessionLog + Student)
      const contextResult = await this.contextBuilder.buildFullContext(studentId);

      if (contextResult.error) {
        return {
          statusCode: 400,
          error: contextResult.error,
          message: "Failed to build context: " + contextResult.details?.error,
          userMessage: "System error. Please try again.",
        };
      }

      const studentState = contextResult.context;

      // Phase 1.5: Validate context quality
      const qualityCheck = this.contextBuilder.validateContextQuality(studentState);
      if (!qualityCheck.isValid && qualityCheck.qualityScore < 50) {
        return {
          statusCode: 400,
          error: "CONTEXT_QUALITY_FAILED",
          issues: qualityCheck.issues,
          userMessage: "System needs more context. Please complete a session first.",
        };
      }

      // Phase 2: Initialize Agent99 Orchestrator with full context
      const orchestrator = new Agent99Orchestrator(
        this.env.DEEPSEEK_API_KEY,
        studentState
      );

      // Phase 3: Execute unified reasoning pipeline
      const orchestrationResult = await orchestrator.powerfulExecute(userMessage);

      if (orchestrationResult.error) {
        return {
          statusCode: 500,
          error: orchestrationResult.error,
          message: orchestrationResult.failureMode,
          userMessage: orchestrationResult.userMessage || "System error. Trying again...",
        };
      }

      // Phase 4: Write ledger event for audit trail
      const ledgerWrite = await this.writeLedgerEvent(
        studentId,
        userMessage,
        orchestrationResult.ledgerEvent
      );

      if (!ledgerWrite.success) {
        console.warn("Ledger write failed:", ledgerWrite);
        // Don't fail the user response, just log it
      }

      // Return success
      return {
        statusCode: 200,
        success: true,
        reply: orchestrationResult.studentMessage,
        internalLog: {
          tigerScoreUpdate: orchestrationResult.ledgerEvent?.streakUpdate,
          optimization: orchestrationResult.optimizationRecommendations,
          auditScore: orchestrationResult.ledgerEvent?.auditScore,
        },
      };
    } catch (error) {
      console.error("Chat orchestration error:", error);
      return {
        statusCode: 500,
        error: "ORCHESTRATION_CRASHED",
        message: error.message,
        userMessage: "System crashed. Support has been notified.",
      };
    }
  }

  /**
   * Write the ledger event to the HeavyLedger DO
   * Creates immutable audit trail for every interaction
   */
  async writeLedgerEvent(studentId, userMessage, ledgerEvent) {
    try {
      const ledgerId = this.env.LEDGER.idFromName(`student-${studentId}`);
      const ledger = this.env.LEDGER.get(ledgerId);

      const eventToWrite = {
        eventId: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        studentId,
        type: ledgerEvent.type || "CHAT_EXCHANGE",
        timestamp: Date.now(),
        payload: {
          inputMessage: userMessage.slice(0, 500), // Truncate long messages
          correction: ledgerEvent.correction,
          mistakeType: ledgerEvent.mistakeType,
          sessionOutcome: ledgerEvent.sessionOutcome,
          tigerScoreDelta: ledgerEvent.tigerScoreDelta,
          nextSessionHint: ledgerEvent.nextSessionHint,
          auditScore: ledgerEvent.auditScore,
        },
      };

      const request = new Request("https://obi/internal/write-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToWrite),
      });

      const response = await ledger.fetch(request);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data };
      }

      return {
        success: true,
        eventId: eventToWrite.eventId,
        hash: data.hash, // If ledger returns hash
      };
    } catch (error) {
      return {
        success: false,
        error: "Ledger write exception",
        details: error.message,
      };
    }
  }

  /**
   * DEBUG: Get full orchestration report (for monitoring + debugging)
   */
  async getOrchestrationReport(studentId) {
    try {
      // Get context
      const contextResult = await this.contextBuilder.buildFullContext(studentId);
      if (contextResult.error) {
        return { error: contextResult.error };
      }

      const context = contextResult.context;
      const summary = this.contextBuilder.summarizeContext(context);

      return {
        success: true,
        student: studentId,
        report: summary,
        fullContext: context, // In dev only; remove in production
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default OBIOrchestrationRouter;
