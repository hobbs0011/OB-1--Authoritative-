# VS Code Latest Updates Summary

> **Generated:** 2026-04-02 | **Source:** [code.visualstudio.com/updates](https://code.visualstudio.com/updates)

---

## 🆕 Version 1.114 — April 2026 (Latest)

### Copilot Chat Improvements

- **Video Preview in Chat:** The image carousel now supports video playback. Videos can be previewed from chat attachments or via the Explorer context menu, so you can watch code demos without leaving the editor.
- **Copy Final Chat Response:** A new "Copy Final Response" command in the chat context menu copies only the final Markdown output from Copilot Chat, excluding intermediate tool calls and agent reasoning steps — ideal for clean documentation.
- **`/troubleshoot` Command:** Diagnose chat customization issues from previous sessions. Surfaces relevant debug logs and custom instruction diagnostics directly in the chat panel.

### Workspace & Semantic Search

- **Unified Semantic Codebase Index:** The Copilot `#codebase` tool now uses a single unified semantic index. The old split between local (limited) and remote (team-shared, semantic) indexes is gone — Copilot decides the best retrieval strategy automatically.
- **Automatic Index Management:** No manual "local vs. remote" configuration needed. Semantic search is prioritized when available; text/fuzzy search serves as fallback. This is especially impactful on large repositories.

### Deprecations

- **Edit Mode Deprecated:** Announced in v1.110, Edit Mode is scheduled for removal by v1.125. Users should migrate to the agentic workflow.

---

## 🔙 Version 1.107 — November 2025

- **Multi-Agent Orchestration:** Use GitHub Copilot alongside custom agents (including Claude, Codex, and third-party agents) for parallel work under a unified interface.
- **Agent HQ:** Manage all AI/code agents in one place. Background agents run in isolated workspaces, supporting multiple tasks simultaneously.
- **Task Delegation:** Assign tasks between local, background, and cloud agents for seamless multi-step workflows.
- **Unified Chat View:** Shows progress, file changes, and agent session management in a single panel. Supports session archiving/unarchiving and provider filtering.
- **MCP Support:** Upgraded support for Model Context Protocol, including a built-in GitHub MCP server (preview).
- **Rich Terminal Output, Accessibility Enhancements, TypeScript Rename Suggestions.**

---

## 🔙 Version 1.105 — September 2025

- **AI-Assisted Merge Conflict Resolution:** Copilot can now help resolve merge conflicts directly in the editor.
- **Resume Recent Chats:** Quickly pick up where you left off in previous chat sessions.
- **Native macOS Authentication:** Smoother OS-level authentication flow for macOS users.
- **Customizable Tool Naming:** Avoid naming conflicts when working with multiple MCP tools or agent skills.
- **Task Completion Notifications:** Get notified of task completions and chat responses from within the editor.

---

## 🔙 Version 1.99 — March 2025

- **Agent Mode (Stable):** Agent mode is now available in the stable release. Enable via `chat.agent.enabled: true`.
  - **MCP Support:** AI models can interact with external tools, databases, and services through the Model Context Protocol.
  - **Built-in Tools:** Fetch web content, find symbol references, and run deep-thinking analysis from within agent mode.
- **Next Edit Suggestions (GA):** AI-powered next-edit predictions are now generally available. Fewer interruptions during AI edits.
- **Unified Chat Experience:** Switch between Ask, Edit, and Agent modes in a single interface. Bring your own API keys for OpenAI, Anthropic Claude, and Google Gemini.
- **Remote Workspace Indexing:** Faster and more accurate instant semantic search across large codebases.
- **Notebook Editing:** Create and edit Jupyter notebooks with the same ease as code files, using both Edit and Agent modes.
- **Source Control:** Incoming/outgoing commit counts now displayed per Git repository.
- **Python + Pylance:** Pylance is now the default language server for the Python extension.

---

## 🔗 Resources

- Official release notes: https://code.visualstudio.com/updates
- Archive of all releases: https://code.visualstudio.com/updates/archive
- GitHub Copilot changelog: https://github.blog/changelog/
