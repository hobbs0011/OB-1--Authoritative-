// github-soul-committer.js
// Commits Soul DNA events to GitHub in proper folder structure
// Creates /soul-dna/ hierarchy with raw, indexed, dna, drift layers

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class GitHubSoulCommitter {
  constructor(repoPath, branchName = "canon") {
    this.repoPath = repoPath;
    this.branchName = branchName;
    this.ensureDirectories();
  }

  /**
   * Create proper directory structure
   */
  ensureDirectories() {
    const dirs = [
      "SOUL-DNA/raw",
      "SOUL-DNA/indexed",
      "SOUL-DNA/dna",
      "SOUL-DNA/drift"
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.repoPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Append event to raw verbatim file (JSONL format)
   * One event per line = append-only ledger
   */
  appendToRaw(soulEvent, dateStr) {
    const rawPath = path.join(this.repoPath, `SOUL-DNA/raw/${dateStr}.jsonl`);
    
    const rawEntry = {
      event_id: soulEvent.event_id,
      timestamp: soulEvent.timestamp,
      verbatim: soulEvent.raw_verbatim,
      metadata: soulEvent.metadata
    };

    fs.appendFileSync(rawPath, JSON.stringify(rawEntry) + "\n");
    console.log(`📝 Appended to raw: ${rawPath}`);
  }

  /**
   * Append event to indexed file (JSONL format)
   * Includes soul extraction + DNA
   */
  appendToIndexed(soulEvent, dateStr) {
    const indexedPath = path.join(
      this.repoPath,
      `SOUL-DNA/indexed/${dateStr}.index.jsonl`
    );

    const indexedEntry = {
      event_id: soulEvent.event_id,
      timestamp: soulEvent.timestamp,
      soul: soulEvent.soul_extraction,
      dna: soulEvent.dna_index
    };

    fs.appendFileSync(indexedPath, JSON.stringify(indexedEntry) + "\n");
    console.log(`🧬 Appended to indexed: ${indexedPath}`);
  }

  /**
   * Write latest DNA state (useful for real-time dashboards)
   */
  updateDNAState(soulEvent) {
    const stateDir = path.join(this.repoPath, "SOUL-DNA/dna");
    
    // By student ID
    if (soulEvent.metadata.student_id) {
      const studentPath = path.join(
        stateDir,
        `student_${soulEvent.metadata.student_id}_state.json`
      );
      fs.writeFileSync(studentPath, JSON.stringify(soulEvent.dna_index, null, 2));
      console.log(`📊 Updated student state: student_${soulEvent.metadata.student_id}_state.json`);
    }

    // Latest overall
    const latestPath = path.join(stateDir, "latest_state.json");
    fs.writeFileSync(latestPath, JSON.stringify(soulEvent.dna_index, null, 2));
    console.log(`📊 Updated latest state: latest_state.json`);
  }

  /**
   * Log drift events if drift_risk > 0.7
   */
  logDriftIfHigh(soulEvent, dateStr) {
    if (soulEvent.dna_index.drift_risk > 0.7) {
      const driftPath = path.join(this.repoPath, `SOUL-DNA/drift/${dateStr}.drift.jsonl`);

      const driftEntry = {
        event_id: soulEvent.event_id,
        timestamp: soulEvent.timestamp,
        drift_risk: soulEvent.dna_index.drift_risk,
        weak_points: soulEvent.dna_index.weak_points,
        action: soulEvent.dna_index.action
      };

      fs.appendFileSync(driftPath, JSON.stringify(driftEntry) + "\n");
      console.log(`⚠️  DRIFT ALERT LOGGED: ${driftEntry.drift_risk} — ${soulEvent.dna_index.action}`);
    }
  }

  /**
   * Commit all changes to Git
   */
  commitToGit(eventDate, eventType, summary) {
    const dateStr = eventDate.toISOString().split("T")[0];
    const commitMessage = `soul-dna: ${dateStr} — ${eventType} — ${summary}`;

    try {
      // Stage all SOUL-DNA changes
      execSync(`cd "${this.repoPath}" && git add SOUL-DNA/ 2>&1`, {
        stdio: "pipe"
      });

      // Commit
      execSync(
        `cd "${this.repoPath}" && git commit -m "${commitMessage}" 2>&1`,
        { stdio: "pipe" }
      );

      console.log(`✅ Git committed: ${commitMessage}`);
      return { success: true, message: commitMessage };
    } catch (error) {
      // May fail if nothing to commit; that's OK
      console.log(`ℹ️  Git status: ${error.message.slice(0, 50)}`);
      return { success: false, message: "Nothing to commit or git error" };
    }
  }

  /**
   * FULL COMMIT FLOW: Write files + Git commit
   */
  commitSoulDNAEvent(soulEvent) {
    const eventDate = new Date(soulEvent.timestamp);
    const dateStr = eventDate.toISOString().split("T")[0];
    const eventType = soulEvent.metadata.session_type || "learning";

    // Write to appropriate files
    this.appendToRaw(soulEvent, dateStr);
    this.appendToIndexed(soulEvent, dateStr);
    this.updateDNAState(soulEvent);
    this.logDriftIfHigh(soulEvent, dateStr);

    // Git commit
    const summary =
      soulEvent.dna_index.drift_risk > 0.7
        ? `HIGH_DRIFT (${(soulEvent.dna_index.drift_risk * 100).toFixed(0)}%)`
        : "normal";

    const gitResult = this.commitToGit(eventDate, eventType, summary);

    return {
      timestamp: soulEvent.timestamp,
      event_id: soulEvent.event_id,
      dateStr,
      eventType,
      drift_risk: soulEvent.dna_index.drift_risk,
      action: soulEvent.dna_index.action,
      git_commit: gitResult
    };
  }
}

module.exports = { GitHubSoulCommitter };
