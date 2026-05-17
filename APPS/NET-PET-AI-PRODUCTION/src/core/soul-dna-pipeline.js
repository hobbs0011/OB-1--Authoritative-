// soul-dna-pipeline.js
// Complete integration: Capture → Extract → Index → Commit → Update Dashboard
// Ready to deploy to Cloudflare Workers or Node.js

const { SoulCaptureEngine } = require("./soul-capture-engine");
const { GitHubSoulCommitter } = require("./github-soul-committer");
const { AgentOBI } = require("./agent-99-obi-engine");

class SoulDNAPipeline {
  constructor(config = {}) {
    this.config = {
      repoPath: config.repoPath || process.cwd(),
      gitBranch: config.gitBranch || "canon",
      llmClient: config.llmClient || null,
      notionClient: config.notionClient || null,
      ...config
    };

    this.captureEngine = SoulCaptureEngine;
    this.gitCommitter = new GitHubSoulCommitter(
      this.config.repoPath,
      this.config.gitBranch
    );
    this.obiEngine = new AgentOBI();
  }

  /**
   * MAIN ENTRY POINT: Process student input end-to-end
   * 
   * Flow:
   * 1. Capture raw verbatim
   * 2. Extract soul (LLM)
   * 3. Generate DNA (LLM)
   * 4. Run OBI correction
   * 5. Commit to GitHub
   * 6. Update Notion database
   * 7. Return result to student
   */
  async processStudentInput(userInput, studentId, sessionMetadata = {}) {
    console.log(`\n🧬 SOUL DNA PIPELINE STARTED`);
    console.log(`─────────────────────────────`);

    try {
      // PHASE 1: Capture & Extract
      console.log(`\n📝 PHASE 1: Soul Capture & Extraction`);
      const soulDNAEvent = await this.captureEngine.fullPipeline(
        userInput,
        {
          student_id: studentId,
          session_type: sessionMetadata.session_type || "learning_session",
          ...sessionMetadata
        },
        this.config.llmClient
      );

      console.log(`✅ Soul DNA captured and validated`);
      console.log(`   Event ID: ${soulDNAEvent.event.event_id}`);
      console.log(`   Drift Risk: ${(soulDNAEvent.event.dna_index.drift_risk * 100).toFixed(0)}%`);

      // PHASE 2: OBI Correction
      console.log(`\n🤖 PHASE 2: OBI Correction & Enforcement`);
      const obiResult = await this.obiEngine.processUserInput(
        userInput,
        studentId,
        sessionMetadata
      );

      console.log(`✅ OBI processing complete`);
      console.log(`   Errors detected: ${obiResult.errors_detected.length}`);
      console.log(`   Repetition required: ${obiResult.repetition_required}`);

      // PHASE 3: Persist to GitHub
      console.log(`\n📦 PHASE 3: GitHub Persistence`);
      const gitResult = this.gitCommitter.commitSoulDNAEvent(soulDNAEvent.event);

      console.log(`✅ Committed to GitHub`);
      console.log(`   Date: ${gitResult.dateStr}`);
      console.log(`   Drift Alert: ${soulDNAEvent.event.dna_index.drift_risk > 0.7 ? "YES ⚠️" : "NO"}`);

      // PHASE 4: Update Notion (if available)
      let notionResult = null;
      if (this.config.notionClient) {
        console.log(`\n📊 PHASE 4: Notion Database Update`);
        notionResult = await this.updateNotionDatabase(
          soulDNAEvent.event,
          obiResult
        );
        console.log(`✅ Notion updated`);
      }

      // PHASE 5: Generate Response
      console.log(`\n💬 PHASE 5: Generate Student Response`);
      const studentResponse = this.generateStudentResponse(
        obiResult,
        soulDNAEvent.event
      );

      console.log(`✅ Response generated`);

      // FINAL RESULT
      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        event_id: soulDNAEvent.event.event_id,
        student_id: studentId,

        // Raw data
        soul_dna_event: soulDNAEvent.event,
        obi_result: obiResult,
        git_result: gitResult,
        notion_result: notionResult,

        // For student
        student_response: studentResponse,

        // Metrics
        metrics: {
          drift_risk: soulDNAEvent.event.dna_index.drift_risk,
          action_required: soulDNAEvent.event.dna_index.action,
          skills_affected: soulDNAEvent.event.dna_index.skills,
          weak_points: soulDNAEvent.event.dna_index.weak_points
        }
      };

      console.log(`\n✅ SOUL DNA PIPELINE COMPLETE`);
      console.log(`─────────────────────────────\n`);

      return result;
    } catch (error) {
      console.error(`\n❌ PIPELINE ERROR: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update Notion database with soul DNA event
   */
  async updateNotionDatabase(soulEvent, obiResult) {
    if (!this.config.notionClient) {
      return { skipped: true };
    }

    try {
      // Prepare Notion entry
      const notionEntry = {
        properties: {
          "Event ID": {
            title: [{ text: { content: soulEvent.event_id } }]
          },
          Timestamp: {
            date: { start: soulEvent.timestamp }
          },
          "Raw Verbatim": {
            rich_text: [{ text: { content: soulEvent.raw_verbatim } }]
          },
          "Student ID": {
            rich_text: [{ text: { content: soulEvent.metadata.student_id || "unknown" } }]
          },
          "Session Type": {
            select: { name: soulEvent.metadata.session_type }
          },
          "Soul Intent": {
            rich_text: [{ text: { content: soulEvent.soul_extraction.core_intent } }]
          },
          "Behavioral Pattern": {
            select: { name: soulEvent.soul_extraction.behavioral_pattern }
          },
          "Skills Affected": {
            multi_select: soulEvent.dna_index.skills.map(skill => ({
              name: skill
            }))
          },
          "Weak Points": {
            rich_text: [
              {
                text: { content: soulEvent.dna_index.weak_points.join(", ") }
              }
            ]
          },
          "Drift Risk": {
            number: Math.round(soulEvent.dna_index.drift_risk * 100)
          },
          Urgency: {
            number: Math.round(soulEvent.dna_index.urgency * 100)
          },
          "Action Required": {
            select: { name: soulEvent.dna_index.action }
          },
          "Error Count": {
            number: obiResult.errors_detected.length
          }
        }
      };

      // Call Notion API
      const response = await this.config.notionClient.pages.create(notionEntry);

      return {
        success: true,
        page_id: response.id,
        url: response.url
      };
    } catch (error) {
      console.error(`Notion update failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate response to send back to student
   */
  generateStudentResponse(obiResult, soulEvent) {
    let response = obiResult.obi_response.message;

    // Add drill assignment if high drift
    if (soulEvent.dna_index.drift_risk > 0.7) {
      response += `\n\n⚠️ SYSTEM ALERT: We detected a learning pattern that needs attention.`;
      response += `\nDrill focus: ${soulEvent.dna_index.weak_points.join(", ")}`;
      response += `\nAction: ${soulEvent.dna_index.action}`;
    }

    // Add encouragement
    if (obiResult.errors_detected.length === 0) {
      response += `\n\n🎉 Perfect session! Your streak is growing.`;
    }

    return response;
  }

  /**
   * Generate daily drill for student (run at start of session)
   */
  generateDailyDrill(studentId) {
    return this.obiEngine.generateDailyDrill(studentId);
  }

  /**
   * Generate end-of-session report
   */
  generateSessionReport(studentId) {
    return this.obiEngine.generateDailyReport(studentId);
  }

  /**
   * Export learning metrics (for dashboard)
   */
  exportStudentMetrics(studentId) {
    const state = this.obiEngine.memory.get(studentId);
    if (!state) {
      return null;
    }

    return {
      student_id: studentId,
      streak: state.streak,
      total_sessions: state.error_history.length,
      weak_skills: Object.entries(state.weak_skills)
        .filter(([_, data]) => data.count > 0)
        .sort((a, b) => b[1].count - a[1].count)
        .reduce((acc, [skill, data]) => {
          acc[skill] = data.count;
          return acc;
        }, {}),
      drills_tomorrow: state.drills_required,
      last_session: state.last_session
    };
  }
}

module.exports = { SoulDNAPipeline };
