# KILO FULL-TAB SCOUT — every tab and every tab-in-tab (2026-11-06)

Ordered by sovereign: research EVERY single tab and every tab inside those tabs, no lane closed without documentation + reasoning. n8n included. Method: sitemap-index enumeration (7 sitemaps, 626 kilo.ai URLs), then fetch+record of every URL, then this report. Raw records: scratch/scout/records-*.json, digests: scratch/scout/digest-*.md. Zero unresolved fetches (one wrong-guess URL corrected, documented below).

## 0. EXECUTIVE VERDICTS (reasoning first, details after)

1. **KiloClaw is delisted — dead as a purchasable product.** Four independent evidences, all gathered today: (a) `kilo.ai/kiloclaw` returns HTTP 200 but serves the generic homepage with zero claw mentions — the page is gone, the URL falls through; (b) the pricing page has zero claw/SKU lines; (c) the current Cloud product is Cloud Agents (ephemeral coding containers, hourly billing, webhook triggers, repo skills — no OpenClaw, no Telegram/Discord control, no always-on, sessions deleted after 7 idle days); (d) Kilo's OWN buyer's guide "Best OpenClaw Alternatives For Secure, Fully Managed Agents" (updated 2026-04-01, full 42,632-char text searched) recommends xCloud, DockClaw, Perplexity Computer, Claude Cowork, Lindy AI — and never mentions KiloClaw once. A vendor that omits its own product from its own alternatives guide has sunset it. It existed (GA blog 2026-02-24: one-click hosted OpenClaw, 60s, 500+ models, cron automations, Telegram/Discord/Slack, same Kilo account/credits). The $10 charge with no instance = a charge against a delisted SKU — that is the refund/dispute lever if sovereign ever reopens it (standing: not pursuing).
2. **No in-Kilo tab replaces the always-on personal-agent shape.** Closest in-Kilo assembly: Cloud Agent (ephemeral container + webhook triggers + repo skills + session portability) fired by our OWN runner cron + Slack @Kilo + mobile app for approvals. Covers scheduled automation + chat-ops (~70%). NOT replaceable in-Kilo: Telegram control, true always-on, cross-session memory (must be carried in repo/skill files instead). The missing 30% is exactly what the box + runner already do — so the standing architecture (box always-on brain, runner cron, free lane) IS the Claw replacement. No chase, no new SKU, no spend.
3. **n8n is the strongest outside candidate for the automation half** (schedules, Telegram, webhooks, 600+ integrations, self-hostable Community Edition free, AI Agent node with tools+memory, MCP client/server nodes). It does NOT replace the autonomous coding-agent half — n8n's own AI page says "if it's just you, use Claude Code or Codex" and positions agents as judgment added onto deterministic workflows. Honest pairing: n8n for triggers/integrations/schedules, Kilo/box for coding. Needs a box it can live on (ours exists) and setup labor. No action without order.
4. **No other hidden always-on product was found anywhere in 626 pages.** The full product surface is: IDE plugins (VS Code, JetBrains), CLI, Desktop Beta, Cloud Agents, Mobile (iOS/Android control plane, not compute), Slack app, Code Reviewer, Security Agent, Gateway (inference API), Marketplace (plans/integrations for credits), MCP servers, skills, sessions/portability. Nothing else sells compute or persistence.

## 1. COVERAGE (the lane is closed only because every URL is accounted for)

Sitemap totals vs fetched-200: pages 135/135, openclaw 11/11, features 20/20, docs 210/210 (core 54, surfaces 96, providers+contributing 60), comparison 58, articles 31, events 22, models 159/159. Free-slug models (19): tencent-hy3-preview-free, tencent-hy3-free, minimax-minimax-m3-free, inclusionai-ling-3-0-flash-free, minimax-minimax-m2-7-free, nex-agi-nex-n2-5-pro-free, nvidia-nemotron-3-super-120b-a12b-free, google-gemma-4-26b-a4b-it-free, nvidia-nemotron-3-5-super-vl-free, nex-agi-nex-n2-pro-free, inclusionai-ring-2-6-1t-free, nvidia-nemotron-3-ultra-550b-a55b-free, poolside-laguna-s-2-1-free, dots-studio-dots-3-note-preview-free, inclusionai-ling-2-6-flash-free, inclusionai-ling-2-6-1t-free, minimax-minimax-m3-1-flash-free, inclusionai-ling-3-0-flash-vl-free, baidu-cobuddy-free.

Fails: none — every URL returned HTTP 200. Thin pages (real content behind JS/app shell, recorded as-is): /vscode-marketplace (188 chars), /cursor-to-kilo (280 chars, interactive hold-space page). Corrected wrong guess: docs scheduleTrigger first tried under trigger-nodes (404) — real path is core-nodes (documented in n8n section).

## 2. THE /code TABS (start point) + 20 FEATURE TABS

/code is the product overview (Meet Kilo Code: plan/write/debug/review across VS Code, JetBrains, CLI; 500+ models; BYOK; local). Its tab bar = Desktop Beta, VS Code, JetBrains, CLI, Cloud Agents, Slack, Code Reviewer, Gateway + feature sub-tabs below (the 20 /features/* pages, each also linked to its docs page = the tabs-in-tabs, all crawled in section 4).

### agent-manager
DESC: Run multiple AI agents directly in your IDE. See GitHub PR status badges on worktrees, run scripts in-place, and use embedded terminal tabs — all without switching windows.
BEN: Run multiple agents in your IDE GitHub PR status badges on worktrees Embedded terminal tabs per worktree Run scripts directly from Agent Manager Visual progress tracking 
USE: 1 Multi-module feature development 2 Coordinated bug fixes 3 Coordinated refactoring 4 Testing multiple approaches 
### ai-adoption-score
DESC: Track and measure your team&#x27;s AI adoption effectiveness with comprehensive analytics. Understand usage patterns, identify opportunities, and optimize your AI-assisted development workflow.
BEN: Quantify AI tool adoption and effectiveness Identify team members who need additional training Track productivity improvements over time Optimize AI tool usage patterns Demonstrate ROI of AI investments to stakeholders 
USE: 1 Measuring team AI proficiency and adoption rates 2 Identifying training needs for team members 3 Reporting AI impact to executive stakeholders 4 Comparing adoption across different teams or projects 5 Setting and track
### android-app
DESC: Run Cloud Agents, control desktop sessions, review pull requests, and respond to coding agents from Android.
BEN: Available now on Google Play Launch Cloud Agents and queue follow-up instructions Control supported Kilo CLI and VS Code sessions remotely Review GitHub pull requests with comments and merge controls Get notified when a live agent needs input 
USE: 1 Starting a Cloud Agent when an idea comes up away from your laptop 2 Reviewing and approving a pull request from your phone 3 Dictating a prompt or sharing a file into a running session 4 Keeping a long-running desktop
### auto-model
DESC: Auto Model routes coding tasks to the right AI model based on complexity, speed, and cost, reducing manual model switching and helping Kilo Gateway credits go further.
BEN: 
USE: 
### auto-top-ups
DESC: Nothing breaks your flow like running out of credits mid-task. Available for individuals and organizations, Auto Top-Ups replenish your balance when usage or a requested credit-funded service triggers a top-up below your threshold—not when credits expire or you view your balance.
BEN: Stay in the flow without interruptions Keep using Kilo across all products—IDE, CLI, Cloud Agents that never stall mid-run Full audit trail of top-up events Zero-downtime credit top-ups 
USE: 1 Long-running Cloud Agents 2 CI/CD pipelines that never stall 3 Handle traffic spikes during product launches 4 Manage cashflow with just-in-time spend 
### autocomplete
DESC: Fast inline completion including multiline suggestions. Get intelligent code completions that understand your codebase and coding patterns.
BEN: Multi-line code suggestions that understand context Works with 500+ AI models including Claude, GPT-5.5, and Gemini Learns from your codebase and coding patterns Fast response times with minimal latency Privacy-first with local model support via Ollama Consistent experience across VS Code, JetBrains, and CLI 
USE: 1 Completing complex function signatures and implementations 2 Generating boilerplate code and common patterns 3 Suggesting appropriate variable and method names 4 Auto-completing API calls and library usage 5 Accelerati
### browser-extension
DESC: A cloud AI agent that lives in your browser side panel, reads the page you are on, and acts on it — summarizing, analyzing data, and collecting information — using almost any model you choose.
BEN: Available now on the Chrome Web Store and Firefox Add-ons Always-accessible side-panel chat that stays open while you browse Context-aware: understands the page you are currently on Read-only or Danger mode — let the agent act on pages on your behalf Runs on almost any model: open-weight, frontier closed, free, or auto-routed 
USE: 1 Summarizing long articles, docs, and threads without leaving the page 2 Analyzing tables, dashboards, and on-screen data in place 3 Collecting and structuring information from web pages 4 Asking grounded questions abou
### centralized-byok
DESC: Manage Bring Your Own Key centrally for your organization. Control providers, rotate keys, and enforce usage policies across teams.
BEN: Organization-wide key management in one place Granular scopes by provider, model, and region Complete audit logs and access history Enforce least-privilege access by role 
USE: 1 Rapidly rotate a compromised provider key across all teams 2 Migrate providers without updating local developer configs 3 Manage credentials for your organization centrally 
### cloud-agents
DESC: Run AI agents in the cloud without consuming local resources. Execute long-running tasks, complex workflows, and resource-intensive operations while your machine stays free for other work.
BEN: No local resource consumption Run tasks even when your machine is off Perfect for long-running operations Access from any device Secure cloud execution 
USE: 1 Large codebase migrations that take hours 2 Complex refactoring across many files 3 Running multiple agents simultaneously 4 Working on resource-intensive tasks 
### code-reviews
DESC: Automated code review agents that analyze pull requests, suggest improvements, catch bugs, and ensure code quality standards. Get instant feedback before merging.
BEN: Instant automated code reviews Catch bugs before they reach production Enforce coding standards consistently Learn from review suggestions Complement human code review 
USE: 1 Pre-merge quality checks 2 Enforcing team coding standards 3 Catching common bug patterns 4 Onboarding new team members 
### codebase-indexing
DESC: Semantic search across your entire codebase. Kilo builds a local index so the agent finds relevant code without you specifying files.
BEN: Automatic semantic indexing of your entire project Find relevant code without specifying files Faster, more accurate agent responses Works with any language or framework Local-first — your code never leaves your machine 
USE: 1 Navigating large, unfamiliar codebases 2 Finding usage patterns across thousands of files 3 Asking architectural questions about your project 4 Refactoring with full project awareness 
### ios-app
DESC: Run Cloud Agents, control desktop sessions, review pull requests, and respond to coding agents from iPhone or iPad.
BEN: Available now on the App Store Launch Cloud Agents and queue follow-up instructions Control supported Kilo CLI and VS Code sessions remotely Review GitHub pull requests with comments and merge controls Use side-by-side pull request diffs on iPad 
USE: 1 Starting a Cloud Agent when an idea comes up away from your laptop 2 Reviewing and approving a pull request from iPhone or iPad 3 Dictating a prompt or sharing a file into a running session 4 Responding as soon as an a
### jetbrains-native
DESC: Turn JetBrains into a multi-agent control room. Run parallel AI coding agents in isolated git worktrees, test changes, follow diffs and PRs, and choose from 600+ models.
BEN: 
USE: 
### kilo-pass
DESC: Your monthly or annual payment converts 1:1 into paid credits, plus free bonus credits on top. Get up to 50% more AI usage with Kilo Pass.
BEN: 
USE: 
### minimum-balance-alerts
DESC: Get notified before your balance runs low. Configure thresholds and recipients to avoid interruptions.
BEN: Prevent downtime from unexpected balance depletion Configurable thresholds per workspace or team Actionable alerts with quick top-up links 
USE: 1 Notify finance before balances run low during heavy usage 2 Prevent CI/CD pipelines from failing due to empty credits 
### pdf-document-upload
DESC: Upload PDFs and documents directly to AI models for code review, analysis, or additional context. Feed specs, design docs, or research papers straight into your conversation.
BEN: Share design specs and requirements directly Reference documentation without copy-pasting Works with Claude, GPT, and Grok models Supports PDFs, images, and text documents 
USE: 1 Implementing features from a design spec PDF 2 Code review against API documentation 3 Analyzing research papers for implementation 4 Referencing compliance or regulatory documents during development 
### session-forks
DESC: Fork a conversation at any message to explore alternate approaches without losing your original thread. Like git branches for your AI chats.
BEN: Explore multiple approaches without losing progress Compare solutions side by side Safe experimentation with full context preserved Non-destructive — original thread stays intact 
USE: 1 Trying alternative implementations before committing 2 A/B testing different architectural approaches 3 Exploring risky changes without losing a working conversation 4 Branching off to debug while preserving the main t
### sessions
DESC: Start a Kilo Session in one place and seamlessly continue it on another platform. Your AI agents, context, and progress follow you across devices and environments.
BEN: Seamless cross-platform continuity Preserved AI agent context and conversations Pick up work exactly where you left off Unified experience across all Kilo Code platforms No need to restart or reconfigure sessions 
USE: 1 Switching between work and personal devices 2 Moving from office desktop to home laptop 3 Transitioning between VS Code and CLI workflows 4 Collaborating across different development environments 5 Maintaining context 
### skills
DESC: Extend Kilo Code with skills. Skills are sharable packages of domain expertise, new capabilities, and repeatable workflows.
BEN: Extend Kilo Code with new capabilities, expertise, and workflows Self-documenting: Anyone can read a SKILL.md file and understand what it does Extensible: Range from simple text instructions to bundled scripts, templates, and assets Shareable: Portable and easily shared between projects and developers Agent-specific: Create skil
USE: 1 Standardizing API design patterns across your codebase 2 Creating reusable refactoring workflows 3 Documenting best practices the AI should follow 4 Building specialized tools for your development workflow 5 Sharing do
### voice-prompting-ide
DESC: Use natural voice commands to interact with AI agents directly in your IDE. Speak your requests instead of typing, making AI assistance more accessible and efficient.
BEN: Natural voice interaction with AI agents Faster input for complex, multi-step instructions More accessible for developers with typing limitations Hands-free coding during debugging sessions Improved productivity for verbal thinkers 
USE: 1 Complex refactoring tasks with detailed instructions 2 Debugging sessions where you need to explain issues verbally 3 Pair programming with AI using natural conversation 4 Accessibility support for developers with moto

Reasoning per feature tab (Claw-replacement relevance):
- cloud-agents: the compute tab. Ephemeral, webhook-fired, skills-equipped. The 70% vehicle — needs OUR cron to be "always-on".
- android-app / ios-app: control plane (launch agents, queue follow-ups, approve PRs, get pinged). Chat-ops surface, not compute.
- sessions / session-forks: portability + branching. Memory strategy = keep state in repo, resume anywhere.
- skills: the extension contract (.kilocode/skills/, SKILL.md packages). Where our pointer-doc approach docks.
- codebase-indexing: local semantic index. Quality booster for box loops, not automation.
- browser-extension: page-grounded side-panel agent (Chrome/Firefox, read-only or Danger). Research surface, not automation.
- agent-manager: parallel IDE agents over worktrees. Dev-throughput, not always-on.
- code-reviews: PR agents. Dev-throughput.
- autocomplete / voice-prompting-ide / jetbrains-native / pdf-document-upload: editor UX. Irrelevant to Claw shape.
- auto-model / kilo-pass / auto-top-ups / minimum-balance-alerts / centralized-byok / ai-adoption-score: the money/governance layer. Relevant only to spend control (auto-top-ups + min-balance-alerts matter for unattended Cloud Agents so a run never stalls mid-job).

## 3. PRODUCT + COMPANY + SEO TABS (pages sitemap)

### https://kilo.ai/mobile
T: Kilo Mobile - Run AI Coding Agents on iOS and Android
D: Run Cloud Agents, control Kilo CLI and VS Code sessions, review GitHub pull requests, and respond to coding agents from Kilo Mobile for iPhone, iPad, and Android.
H: Your coding agents. In your pocket. | Keep work moving when you leave your desk | Start real coding work from anywhere | Your desktop sessions do not stop at your desk | Review the PR before you get back to your laptop | Step in at the right moment | More of Kilo, in one app | The same open Kilo platform, wherever you are | Keep your agents moving
X: Kilo Mobile - Run AI Coding Agents on iOS and Android Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Mobile for iOS and Android Your coding agents. In you
### https://kilo.ai/slack
T: Kilo - for Slack
D: Ship code directly from Slack with AI-powered code generation. Get instant code reviews, generate snippets, and collaborate with your team.
H: Your favorite AI coding agent , now in Slack | Trusted by developers at the world&#x27;s most innovative companies | Everything you need, right in Slack | How it works | AI disclaimer | References and platform context
X: Kilo - for Slack Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Trusted by 5M+ developers worldwide Your favorite AI coding agent , now in Slack Push PRs with 
### https://kilo.ai/cli
T: Kilo CLI – Open Source CLI Coding Agent
D: Run AI coding agents from your terminal. Access 500+ models, automate with CI/CD, and build faster with Kilo CLI.
H: Open Source CLI Coding Agent | Key benefits | AI coding from your terminal | Get started in minutes | Built on proven foundations | Kilo is more than a CLI | Kilo CLI resources | Ready to build faster?
X: Kilo CLI – Open Source CLI Coding Agent Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Open Source CLI Coding Agent Any model, zero markup: frontier, open weig
### https://kilo.ai/gateway
T: Kilo Gateway - Universal AI Inference API
D: Route LLM requests to any provider, power your own AI apps, or bring existing provider keys through Kilo Gateway without another model subscription.
H: The Universal Gateway for AI Inference | The intelligent routing layer for all your AI inference needs | Features for developers | Gateway is the model network. Auto Model is the router. | Granular controls for teams, not just individuals | Pricing &amp; Access Tiers | Get started in minutes | Ready to start building with Kilo Gateway ?
X: Kilo Gateway - Universal AI Inference API Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Gateway The Universal Gateway for AI Inference Route LLM requests
### https://kilo.ai/code-reviewer
T: Kilo Code Reviewer - AI-Powered Code Reviews
D: AI-powered code reviews that understand your codebase, catch bugs before merge, and help your team ship faster.
H: Kilo Code Reviewer | Key benefits | See how Kilo Code Reviewer works | Get started in minutes | Catch bugs before you commit | Kilo is more than code reviews | Trusted by developers at the world&#x27;s most innovative companies | Learn more | Ready to catch bugs?
X: Kilo Code Reviewer - AI-Powered Code Reviews Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Code Reviewer AI-powered code reviews that understand your cod
### https://kilo.ai/marketplace
T: Kilo Marketplace — AI Coding Plans, Apps &amp; Integrations
D: Browse the Kilo Marketplace for AI coding plans, productivity apps, and dev tool integrations. Pay with Kilo Credits — no separate billing. BytePlus Coding Plan Lite and Exa Search are live now.
H: Kilo Marketplace | Pay with Your Kilo Credits | Access Coding Plans from Partners | Power Your Workflow | How It Works | Get First Access to Exclusive Deals
X: Kilo Marketplace — AI Coding Plans, Apps &amp; Integrations Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Marketplace AI Coding Plans, Apps &amp; Integra
### https://kilo.ai/auto-model
T: Auto Model - Kilo Chooses the Right AI Model for Each Task
D: Auto Model routes coding tasks to the right AI model based on complexity, speed, and cost, reducing manual model switching and helping Kilo Gateway credits go further.
H: The right model for every task | Model freedom without model management | Auto Efficient delivers near-frontier coding performance at dramatically lower cost. | How Auto Model works | Choose your routing tier | Set the routing policy once. We enforce it for your organization. | Related | Gateway gives Auto Model reach | Kilo Pass helps credits go further | Leaderboard shows real-world usage | KiloBench measures coding performance | You still control the model stack.
X: Auto Model - Kilo Chooses the Right AI Model for Each Task Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Automatic model routing The right model for every tas
### https://kilo.ai/autocomplete
T: Kilo Code Autocomplete - AI-Powered Code Completions
D: Get intelligent inline code completions powered by Codestral. Auto-trigger or manual trigger, context-aware suggestions, and multi-line completions. Free and open source.
H: AI-Powered Code Completions | Key benefits | How Autocomplete Works | Kilo is more than autocomplete | Trusted by developers at the world&#x27;s most innovative companies | Learn more | Ready to code faster?
X: Kilo Code Autocomplete - AI-Powered Code Completions Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started AI-Powered Code Completions Intelligent inline suggestions 
### https://kilo.ai/security-agent
T: Kilo - Security Agent: Find and Fix Dependency Risk
D: Turn GitHub Dependabot alerts into actionable Security Findings, identify reachable risk, open remediation PRs, track SLAs, and preserve audit-ready history.
H: Find, fix, and prove which dependency alerts matter. | Turn alert volume into defensible action | Triage quickly. Analyze deeply when it matters. | From GitHub alert to verified outcome | Match your security policy | Know where attention is due | Keep every decision attached to recorded evidence | Make every dependency decision traceable.
X: Kilo - Security Agent: Find and Fix Dependency Risk Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Dependency security, from alert to evidence Find, fix, and p
### https://kilo.ai/linear
T: Kilo - for Linear
D: Ship code directly from Linear with AI-powered code generation. Get instant code reviews, generate snippets, and collaborate with your team.
H: Your favorite AI coding agent , now in Linear | Trusted by developers at the world&#x27;s most innovative companies | Everything you need, right in Linear | How it works | AI disclaimer | References and platform context
X: Kilo - for Linear Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Trusted by 5M+ developers worldwide Your favorite AI coding agent , now in Linear Push PRs wit
### https://kilo.ai/jetbrains
T: Multi-agent AI coding plugin for JetBrains | Kilo Code
D: Turn JetBrains into a multi-agent control room. Run parallel AI coding agents in isolated git worktrees, test changes, follow diffs and PRs, and choose from 600+ models.
H: Kilo turns your JetBrains IDE into a multi-agent control room | A native experience, not an editor migration | Run parallel coding agents without leaving JetBrains | From delegated task to reviewed change | Native from the start. Split-mode ready by design. | Compare JetBrains AI agents | Start coding with Kilo in minutes | The right agent for each stage of the task | Choose the model. Keep the workflow. | Standardize the agent layer, not the editor | Open source by default | Governance for engi
X: Multi-agent AI coding plugin for JetBrains | Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / JetBrains Native JetBrains plugin, built for remot
### https://kilo.ai/connect/github
T: Kilo - for GitHub
D: Ship code directly from GitHub with AI-powered code generation. Get instant code reviews, generate snippets, and collaborate with your team.
H: Your favorite AI coding agent , now in GitHub | Trusted by developers at the world&#x27;s most innovative companies | What You Can Do | How it works | AI disclaimer | References and platform context
X: Kilo - for GitHub Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Trusted by 5M+ developers worldwide Your favorite AI coding agent , now in GitHub Chat with Ki
### https://kilo.ai/install
T: Install Kilo: Desktop App, VS Code, JetBrains &amp; CLI
D: Download the Kilo Desktop beta for macOS, Windows, and Linux, or add Kilo to VS Code, JetBrains, Cursor, your terminal, phone, and Slack. Free to download, 500+ models.
H: One agent. Every model. Zero markup. | Already have an editor? | All Downloads | Get Kilo Desktop.
X: Install Kilo: Desktop App, VS Code, JetBrains &amp; CLI Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Desktop · Beta One agent. Every model. Zero markup.
### https://kilo.ai/vscode-marketplace
T: Install Kilo Code from the VS Code Marketplace
D: Install the free Kilo Code VS Code extension from the Visual Studio Marketplace to start coding with open source AI agents and flexible model access.
H: 
X: Install Kilo Code from the VS Code Marketplace Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Redirecting...
### https://kilo.ai/teams
T: Kilo for Teams | Centralized Billing, Analytics &amp; Shared AI Coding
D: Kilo for Teams adds centralized billing, a shared Kilo Gateway balance, usage analytics, AI adoption scoring, shared agents, role-based team management, and priority support for $15/user/month. Compare Teams and Enterprise side by side.
H: Centralized AI coding for your whole team | Individual accounts stop working once a team adopts AI coding. | Everything in the free agent, plus the collaboration layer around it. | Collaboration features developers never have to configure twice | See the team dashboard before you buy seats | Trusted by developers at the world&#x27;s most innovative companies | Separate the platform plan from model usage | Know exactly which plan you need | Teams that standardized on Kilo | Put your team on one p
X: Kilo for Teams | Centralized Billing, Analytics &amp; Shared AI Coding Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo for Teams Webinar: scaling AI coding
### https://kilo.ai/enterprise
T: Kilo for Enterprise | AI Coding Governance Without Model Lock-In
D: Govern AI coding across VS Code, JetBrains, CLI, Cloud, Slack, and code review with model freedom, agent sandboxing, AI adoption analytics, sub-org budgets, SSO, SCIM, audit logs, and provider controls.
H: AI coding governance without model lock-in | The BYOAI problem isn&#x27;t coming. It&#x27;s here. | AI coding has moved from experimentation to governed rollout. | A buying package your security, platform, and finance teams can evaluate. | Built for teams scaling Kilo from pilot to governed rollout. | Enterprise controls without developer lock-in | The controls security teams ask for, applied where developers already work. | Kilo is a governance layer, not another model lock-in. | Separate platf
X: Kilo for Enterprise | AI Coding Governance Without Model Lock-In Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo for Enterprise AI coding governance withou
### https://kilo.ai/eu
T: Kilo - EU-First AI Coding for European Teams
D: Build an EU-first AI coding setup with EU-hosted inference options, provider controls, BYOK regional endpoints, and Enterprise governance for European development teams.
H: EU-first AI coding without giving up model choice | Sovereign AI starts with routing control | Be precise about what stays in the EU | Make approved EU routes visible and enforceable | Kilo is a coding agent, not a model provider | Inceptron brings EU-hosted open-weight models to Kilo | A practical path to an EU-only provider policy | Centralize AI coding policy for European teams | Go deeper on Europe&#x27;s AI and software landscape | Keep model freedom while adding regional control
X: Kilo - EU-First AI Coding for European Teams Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started 🇪🇺 EU Data Residency Options EU-first AI coding without giving up
### https://kilo.ai/inference
T: AI Coding Plans &amp; Inference Options 2026 | Kilo
D: Compare AI coding plans and pay-as-you-go inference options: Kilo Gateway, Kilo Pass, BYOK API keys, coding plans you buy with Kilo Credits like BytePlus, ChatGPT and SuperGrok subscriptions, and local models. See what to buy and how to bring it into Kilo.
H: AI Coding Plans &amp; Inference Options | Four ways to power Kilo | Compare your options | Inference options FAQ
X: AI Coding Plans &amp; Inference Options 2026 | Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started AI Coding Plans &amp; Inference Options Pay-as-you-go, subsc
### https://kilo.ai/costs
T: Optimize AI Coding Costs with Model Routing | Kilo
D: Control AI coding costs with task routing, usage analytics, efficient context, BYOK, Gateway, and transparent model pricing.
H: Optimize AI Costs | Compare model pricing | Kilo Tools | Make AI usage easier to trust
X: Optimize AI Coding Costs with Model Routing | Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Optimize AI Costs Scale AI coding without surprise bills. Kil
### https://kilo.ai/kilobench
T: AI Coding Benchmark &amp; Coding Agent Benchmark | KiloBench
D: KiloBench is an agentic coding benchmark built on the Kilo agent harness, tracking completion rates and costs on Terminal Bench 2.0.
H: AI Coding Benchmark: KiloBench | Kilo Benchmark | Official KiloBench Results | How to read KiloBench results | Generic benchmarks answer generic questions. We needed more. | What KiloBench measures that others don&#x27;t | Don&#x27;t want to choose? Let Kilo choose for you.
X: AI Coding Benchmark &amp; Coding Agent Benchmark | KiloBench Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Proprietary benchmark suite AI Coding Benchmark: Ki
### https://kilo.ai/open
T: Is Kilo Code Open Source? MIT Clients &amp; Source Availability
D: Kilo Code’s VS Code extension, JetBrains plugin, and CLI are MIT licensed. See what is open source, what is source available, and what Kilo hosts as a service.
H: What Open Means at Kilo | Why Platforms Beat Point Solutions | Production-Proven Speed | Join the Community
X: Is Kilo Code Open Source? MIT Clients &amp; Source Availability Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started MIT Licensed Kilo Code is open MIT-licensed clie
### https://kilo.ai/manifesto
T: Kilo Speed: A Manifesto
D: Speed is the ultimate competitive advantage in software development. Our philosophy on building the future of AI-assisted development.
H: Kilo Speed: A Manifesto | The Transformation | Shipping at Kilo Speed | Culture meets product | Kilo is built for Kilo Speed | The proof is in production | Bringing Kilo Speed to all
X: Kilo Speed: A Manifesto Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Speed: A Manifesto Scott Breitenother Co-founder &amp; CEO @ Kilo Kilo Speed - you 
### https://kilo.ai/about
T: About Kilo Code - Open-Source AI Coding Orchestration
D: We&#x27;re building the open-source orchestration environment for AI coding agents. #1 Open Source Product of the Month with 5M+ Kilo Coders.
H: We&#x27;re building the open-source orchestrator for AI coding agents. | Kilo is the fastest growing AI coding app because we&#x27;re open . | The Transformation | Shipping at Kilo Speed | Culture meets product | Kilo is built for Kilo Speed | The proof is in production | Bringing Kilo Speed to all | Working at Kilo | What this means in practice | Join us
X: About Kilo Code - Open-Source AI Coding Orchestration Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started We&#x27;re building the open-source orchestrator for AI co
### https://kilo.ai/customers
T: Kilo - Customer Stories
D: See how developers, teams, and companies are building faster with Kilo Code. Real success stories from our community.
H: Customer Stories | Plug&amp;Pay | Dona Dowlan | Andrey Guenov | Ida Infront | IntraPhone
X: Kilo - Customer Stories Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Success Stories Customer Stories See how developers, teams, and companies are building f
### https://kilo.ai/agencies
T: Kilo - Agency Partner Program for Data and AI Consultancies
D: Bring agentic engineering to modern data and AI engagements. Data agencies and independent consultants can apply as early Kilo design partners.
H: Join the partner program for end-to-end agentic engineering | Built for AI consultants and data engineers | 1000x every engagement | A stronger foundation for client transformation | A program that grows with your practice | Become an early agency design partner
X: Kilo - Agency Partner Program for Data and AI Consultancies Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Agency Partner Program Join the partner program for 
### https://kilo.ai/partners
T: Kilo - Partner Program
D: Earn commissions on qualified Kilo Pass referrals through the Kilo Partner Program.
H: Earn Partner Commissions on Kilo Pass | Kilo Pass commissions · accepting applications | What is commissionable | Traffic Rules | Sign up
X: Kilo - Partner Program Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Affiliate Program Earn Partner Commissions on Kilo Pass Have a social media audience of d
### https://kilo.ai/oss
T: Kilo Open Source Sponsorship Program
D: Kilo&#x27;s sponsorship program for open-source projects. Get free access to Kilo&#x27;s suite of tools, including Code Reviews and Enterprise features.
H: Kilo Open Source Sponsorship Program | Sponsorship Tiers | What We Offer | Requirements | Selection Process | Ready to Apply?
X: Kilo Open Source Sponsorship Program Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Loves Open Source Kilo Open Source Sponsorship Program Selected projec
### https://kilo.ai/support
T: Kilo - Support
D: Get help with Kilo Code. Contact our support team, find answers to frequently asked questions, or join our Discord community for assistance.
H: How can we help you?
X: Kilo - Support Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started How can we help you? Get in touch with our support team or find answers to common questions below
### https://kilo.ai/security
T: Security Disclosure
D: Security Disclosure Policy for Kilo Code
H: Security Disclosure | We Value Security Researchers | Scope | How to Report
X: Security Disclosure Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Security Disclosure Security Disclosure Last Updated: February 25th, 2026 We Value Security 
### https://kilo.ai/security-and-compliance
T: Kilo Security and Compliance | Enterprise AI Governance
D: Review Kilo security, compliance, data retention, encryption, access controls, subprocessors, incident response, DPA availability, and Trust Center resources for enterprise AI coding rollouts.
H: Security and compliance for governed AI coding | What buyers can validate | Designed for the questions security teams ask first | A scannable control map for enterprise evaluators. | Move from security review to governed rollout faster | Give every evaluator the right destination | Ready to bring security into your AI coding rollout?
X: Kilo Security and Compliance | Enterprise AI Governance Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Enterprise security overview Security and compliance for
### https://kilo.ai/cursor-exodus
T: The Cursor Exodus | Kilo Enterprise, Free for Your Team
D: Switch from Cursor to Kilo Enterprise free for your remaining contract term, up to 12 months, with seats matched 1:1 to your Cursor seats. 500+ models and granular provider controls. AI usage separate. Discretionary offer.
H: Leave Cursor. Bring your team. Kilo Enterprise is on us. | Your coding editor&#x27;s terms can change. You can change editors. | We cover Kilo Enterprise. You choose how to power it. | Bring your seats. We&#x27;ll cover Enterprise. | Your AI stack. Your ground rules. | A model dropdown is not model freedom. | What Anaconda&#x27;s engineering team found when they moved from Cursor to Kilo. | The Cursor Exit Field Guide. | A few good questions. | Your next model should be your decision.
X: The Cursor Exodus | Kilo Enterprise, Free for Your Team Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started The Cursor Exodus / A Kilo offer Leave Cursor. Bring you
### https://kilo.ai/cursor-to-kilo
T: Cursor to Kilo — Launch Sequence
D: Cursor just picked a co-pilot you didn&#x27;t choose. Hold space to escape — a mission briefing for developers moving from Cursor to Kilo Code.
H: Cursor to Kilo Launch Sequence
X: Cursor to Kilo — Launch Sequence Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Cursor to Kilo Launch Sequence Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started
### https://kilo.ai/roo-migration
T: The Great Roo Migration — Move from Roo Code to Kilo
D: Roo Code is archiving on May 15. Three million developers need a new home — your kangaroo knows the way. A step-by-step migration guide to Kilo Code.
H: The Great Roo Migration | Roo Code hit 3 million installs. Now the trail leads on. | Before you hit the trail, pack what matters. | Every Roo file has a Kilo equivalent. | One command and you&#x27;re in. | Your new home runs on kilo.jsonc. | You made it.
X: The Great Roo Migration — Move from Roo Code to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer The former Roo Code team is now building Roomote . Read what happened to Roo Code → Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Star
### https://kilo.ai/pricing/kilo-pass
T: Kilo Pass — Up to 50% Free AI Credits
D: Your monthly or annual payment converts 1:1 into paid credits, plus free bonus credits on top. Get up to 50% more AI usage with Kilo Pass.
H: Kilo Pass | Kilo Pass Calculator | How It Works | Your Kilo Balance, Your Rules | Make every credit work harder | Key Benefits | Use Cases | About Kilo Pass | Use Kilo Everywhere | Frequently Asked Questions
X: Kilo Pass — Up to 50% Free AI Credits Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Now Available Kilo Pass Maximize your AI output per dollar. A monthly AI t
### https://kilo.ai/open-source-models
T: Kilo - Best Open-Weight AI Models for Coding (2026)
D: Compare current open-weight AI models for coding by benchmarks, licenses, weight access, local deployment, and hosted availability. Evidence-backed rankings for 2026.
H: Best Open-Weight AI Models for Coding | Best Open-Weight Coding Models Ranked | How We Rank Open Models | Coding Benchmarks, Licenses, and Access | Open Source vs Open Weight | Local, Hosted, or BYOK | Choose the Right Ranking | Primary Model Sources | Open-Weight AI Models FAQ | Related Model Guides | Use Open Models Without Lock-In
X: Kilo - Best Open-Weight AI Models for Coding (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / AI Model Leaderboard / Open-Weight AI Models Last rev
### https://kilo.ai/best-local-llm-for-coding
T: Kilo - Best Local LLM for Coding by Hardware (2026)
D: Find the best local coding model for 8 GB, 16 GB, 24 GB, and 48 GB+ GPUs or Apple Silicon. Compare memory, context, quantization, and setup options.
H: Best Local LLM for Coding by Hardware | 8 GB VRAM | 16 GB VRAM | 24 GB VRAM | 48 GB+ VRAM | Best Local Coding Models for 8 GB VRAM | Best Local Coding Models for 16 GB VRAM | Best Local Coding Models for 24 GB VRAM | Best Local Coding Models for 48 GB+ VRAM | Best Local Models for Apple Silicon RAM Tiers | Best Small Coding Models | Set Up Ollama or LM Studio
X: Kilo - Best Local LLM for Coding by Hardware (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Local models matched to your machine Best Local LLM for Codi

### https://kilo.ai/inference/subscriptions
T: AI Coding Subscriptions &amp; Coding Plans 2026 | Kilo
D: Compare ChatGPT, SuperGrok, Z.ai, Kimi Code, BytePlus, Xiaomi, and OpenCode Go. See prices, connection methods, and step-by-step Kilo setup guides.
H: Compare AI coding subscriptions and plans | Account subscription | Coding plan key | Buy with Kilo Credits | Choose a setup guide | Not sure which route fits?
X: AI Coding Subscriptions &amp; Coding Plans 2026 | Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Inference options Compare AI coding subscriptions and pla
### https://kilo.ai/inference/subscriptions/chatgpt
T: ChatGPT subscription → OpenAI&#x27;s top coding models in Kilo
D: Your existing ChatGPT subscription gives you flat-rate access to powerful OpenAI models. Run OpenAI’s top coding models in IDEs like VS Code and JetBrains. No extra charges beyond your ChatGPT subscription.
H: ChatGPT subscription → OpenAI&#x27;s top coding models in Kilo | Why developers use their ChatGPT subscription with Kilo | How to connect your OpenAI subscription access | Recommended OpenAI models | Want more model options? | Trusted by developers at the world&#x27;s most innovative companies | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Ready to use your ChatGPT subscription in your IDE?
X: ChatGPT subscription → OpenAI&#x27;s top coding models in Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started ChatGPT subscription → OpenAI&#x27;s top coding m
### https://kilo.ai/inference/subscriptions/supergrok
T: Use your SuperGrok subscription in Kilo Code
D: Connect SuperGrok or X Premium+ to Kilo Code with xAI OAuth and use supported Grok models without an API key.
H: Use your SuperGrok subscription in Kilo Code | How to connect SuperGrok / X Premium+ to Kilo | Before you connect | Compare this with every inference option
X: Use your SuperGrok subscription in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Subscriptions and coding plans Account subscription Use your SuperG
### https://kilo.ai/inference/subscriptions/z-ai
T: Connect a Z.ai Coding Plan to Kilo
D: Add a Z.ai GLM Coding Plan key to Kilo using the dedicated coding-plan route and quota.
H: Connect a Z.ai Coding Plan to Kilo | How to connect Z.ai Coding Plan to Kilo | Before you connect | Compare this with every inference option
X: Connect a Z.ai Coding Plan to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Subscriptions and coding plans Coding plan Connect a Z.ai Coding Plan to Kilo
### https://kilo.ai/inference/subscriptions/kimi-code
T: Connect Kimi Code to Kilo
D: Create a Kimi Code membership key and connect its coding quota to Kilo.
H: Connect Kimi Code to Kilo | How to connect Kimi Code to Kilo | Before you connect | Compare this with every inference option
X: Connect Kimi Code to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Subscriptions and coding plans Coding plan Connect Kimi Code to Kilo Kimi Code members
### https://kilo.ai/inference/subscriptions/byteplus
T: Buy the BytePlus Coding Plan Lite in Kilo
D: Buy BytePlus Coding Plan Lite directly with your Kilo Credits and use BytePlus coding models with zero extra setup.
H: Buy the BytePlus Coding Plan Lite in Kilo | How to connect BytePlus Coding Plan Lite to Kilo | Before you connect | Compare this with every inference option
X: Buy the BytePlus Coding Plan Lite in Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Subscriptions and coding plans B Coding plan Buy the BytePlus Coding P
### https://kilo.ai/inference/subscriptions/xiaomi
T: Connect a Xiaomi MiMo Token Plan to Kilo
D: Add a regional Xiaomi MiMo Token Plan key to Kilo and use the correct Europe, Singapore, or China endpoint.
H: Connect a Xiaomi MiMo Token Plan to Kilo | How to connect Xiaomi MiMo Token Plan to Kilo | Before you connect | Compare this with every inference option
X: Connect a Xiaomi MiMo Token Plan to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Subscriptions and coding plans X Coding plan Connect a Xiaomi MiMo Toke
### https://kilo.ai/inference/subscriptions/opencode-go
T: Connect OpenCode Go to Kilo
D: Check OpenCode Go compatibility and configure its coding-plan credential in Kilo when the provider entry is available.
H: Connect OpenCode Go to Kilo | How to connect OpenCode Go to Kilo | Before you connect | Compare this with every inference option
X: Connect OpenCode Go to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Subscriptions and coding plans O Coding plan Connect OpenCode Go to Kilo OpenCode Go
### https://kilo.ai/inference/byok
T: BYOK AI Coding: Bring Your Own API Key to Kilo
D: Bring API keys from Anthropic, OpenAI, Google, xAI, DeepSeek, AWS Bedrock, OpenRouter, and more to Kilo. Compare providers and follow exact setup guides.
H: Bring your own AI provider keys | When BYOK is the right choice | Choose a setup guide | Not sure which route fits?
X: BYOK AI Coding: Bring Your Own API Key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Inference options Bring your own AI provider keys Use an existing
### https://kilo.ai/inference/byok/anthropic
T: Add an Anthropic API key to Kilo
D: Connect your Anthropic API account to Kilo and use Claude models through your own provider billing.
H: Add an Anthropic API key to Kilo | How to connect Anthropic to Kilo | Before you connect | Compare this with every inference option
X: Add an Anthropic API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add an Anthropic API key to Kilo Anthropi
### https://kilo.ai/inference/byok/openai
T: Add an OpenAI API key to Kilo
D: Connect an OpenAI Platform project key to Kilo and pay OpenAI directly for API usage.
H: Add an OpenAI API key to Kilo | How to connect OpenAI to Kilo | Before you connect | Compare this with every inference option
X: Add an OpenAI API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add an OpenAI API key to Kilo OpenAI BYOK us
### https://kilo.ai/inference/byok/google
T: Add a Google Gemini API key to Kilo
D: Create a Gemini API authorization key in Google AI Studio and connect it to Kilo.
H: Add a Google Gemini API key to Kilo | How to connect Google AI Studio to Kilo | Before you connect | Compare this with every inference option
X: Add a Google Gemini API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add a Google Gemini API key to Kilo Go
### https://kilo.ai/inference/byok/xai
T: Add an xAI API key to Kilo
D: Connect xAI API credits to Kilo with your own team-scoped key.
H: Add an xAI API key to Kilo | How to connect xAI to Kilo | Before you connect | Compare this with every inference option
X: Add an xAI API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add an xAI API key to Kilo xAI BYOK is the API-
### https://kilo.ai/inference/byok/deepseek
T: Add a DeepSeek API key to Kilo
D: Connect a funded DeepSeek API account to Kilo with your own key.
H: Add a DeepSeek API key to Kilo | How to connect DeepSeek to Kilo | Before you connect | Compare this with every inference option
X: Add a DeepSeek API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add a DeepSeek API key to Kilo DeepSeek BYO
### https://kilo.ai/inference/byok/mistral
T: Add a Mistral API key to Kilo
D: Connect your Mistral API account and use Mistral and Codestral models in Kilo.
H: Add a Mistral API key to Kilo | How to connect Mistral AI to Kilo | Before you connect | Compare this with every inference option
X: Add a Mistral API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add a Mistral API key to Kilo Mistral BYOK g
### https://kilo.ai/inference/byok/moonshot
T: Add a Moonshot API key to Kilo
D: Connect Moonshot pay-as-you-go API billing to Kilo for Kimi models.
H: Add a Moonshot API key to Kilo | How to connect Moonshot AI to Kilo | Before you connect | Compare this with every inference option
X: Add a Moonshot API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add a Moonshot API key to Kilo Moonshot BYO
### https://kilo.ai/inference/byok/minimax
T: Add a MiniMax API key to Kilo
D: Connect MiniMax pay-as-you-go API billing to Kilo with your own key.
H: Add a MiniMax API key to Kilo | How to connect MiniMax to Kilo | Before you connect | Compare this with every inference option
X: Add a MiniMax API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add a MiniMax API key to Kilo The MiniMax To
### https://kilo.ai/inference/byok/z-ai
T: Add a Z.ai API key to Kilo
D: Connect Z.ai pay-as-you-go API billing to Kilo for GLM models.
H: Add a Z.ai API key to Kilo | How to connect Z.ai to Kilo | Before you connect | Compare this with every inference option
X: Add a Z.ai API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add a Z.ai API key to Kilo Generic Z.ai BYOK us
### https://kilo.ai/inference/byok/fireworks
T: Add a Fireworks API key to Kilo
D: Connect Fireworks-hosted open models to Kilo through your own provider account.
H: Add a Fireworks API key to Kilo | How to connect Fireworks to Kilo | Before you connect | Compare this with every inference option
X: Add a Fireworks API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key F Bring your own key Add a Fireworks API key to Kilo Firework
### https://kilo.ai/inference/byok/aws-bedrock
T: Connect AWS Bedrock to Kilo
D: Configure AWS credentials, region, permissions, and Bedrock model access in Kilo.
H: Connect AWS Bedrock to Kilo | How to connect AWS Bedrock to Kilo | Before you connect | Compare this with every inference option
X: Connect AWS Bedrock to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bedrock Bring your own key Connect AWS Bedrock to Kilo AWS Bedroc
### https://kilo.ai/inference/byok/novita
T: Add a Novita API key to Kilo
D: Connect Novita-hosted open models to Kilo through your own account.
H: Add a Novita API key to Kilo | How to connect Novita to Kilo | Before you connect | Compare this with every inference option
X: Add a Novita API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key N Bring your own key Add a Novita API key to Kilo Novita BYOK ro
### https://kilo.ai/inference/byok/inception
T: Add an Inception API key to Kilo
D: Connect Inception-hosted models to Kilo with your own provider key.
H: Add an Inception API key to Kilo | How to connect Inception to Kilo | Before you connect | Compare this with every inference option
X: Add an Inception API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key I Bring your own key Add an Inception API key to Kilo Incept
### https://kilo.ai/inference/byok/xiaomi
T: Add a Xiaomi MiMo API key to Kilo
D: Connect Xiaomi MiMo pay-as-you-go API billing to Kilo.
H: Add a Xiaomi MiMo API key to Kilo | How to connect Xiaomi MiMo to Kilo | Before you connect | Compare this with every inference option
X: Add a Xiaomi MiMo API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key X Bring your own key Add a Xiaomi MiMo API key to Kilo Gene
### https://kilo.ai/inference/byok/ollama-cloud
T: Add an Ollama Cloud API key to Kilo
D: Connect Ollama Cloud hosted models to Kilo with your own key.
H: Add an Ollama Cloud API key to Kilo | How to connect Ollama Cloud to Kilo | Before you connect | Compare this with every inference option
X: Add an Ollama Cloud API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key O Bring your own key Add an Ollama Cloud API key to Kilo 
### https://kilo.ai/inference/byok/chutes
T: Add a Chutes API key to Kilo
D: Connect Chutes-hosted models to Kilo through your own provider account.
H: Add a Chutes API key to Kilo | How to connect Chutes to Kilo | Before you connect | Compare this with every inference option
X: Add a Chutes API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key C Bring your own key Add a Chutes API key to Kilo Chutes BYOK us
### https://kilo.ai/inference/byok/crofai
T: Add a CrofAI API key to Kilo
D: Connect CrofAI-hosted models to Kilo through your own provider account.
H: Add a CrofAI API key to Kilo | How to connect CrofAI to Kilo | Before you connect | Compare this with every inference option
X: Add a CrofAI API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key C Bring your own key Add a CrofAI API key to Kilo CrofAI BYOK us
### https://kilo.ai/inference/byok/inceptron
T: Add an Inceptron API key to Kilo
D: Connect Inceptron models to Kilo through your own provider billing.
H: Add an Inceptron API key to Kilo | How to connect Inceptron to Kilo | Before you connect | Compare this with every inference option
X: Add an Inceptron API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key I Bring your own key Add an Inceptron API key to Kilo Incept
### https://kilo.ai/inference/byok/martian
T: Add a Martian API key to Kilo
D: Connect Martian-routed models to Kilo with your provider key.
H: Add a Martian API key to Kilo | How to connect Martian to Kilo | Before you connect | Compare this with every inference option
X: Add a Martian API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key M Bring your own key Add a Martian API key to Kilo Martian BYOK
### https://kilo.ai/inference/byok/neuralwatt
T: Add a Neuralwatt API key to Kilo
D: Connect Neuralwatt models to Kilo through your own provider account.
H: Add a Neuralwatt API key to Kilo | How to connect Neuralwatt to Kilo | Before you connect | Compare this with every inference option
X: Add a Neuralwatt API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key N Bring your own key Add a Neuralwatt API key to Kilo Neural
### https://kilo.ai/inference/byok/orcarouter
T: Add an OrcaRouter API key to Kilo
D: Connect OrcaRouter models to Kilo with your own routing account.
H: Add an OrcaRouter API key to Kilo | How to connect OrcaRouter to Kilo | Before you connect | Compare this with every inference option
X: Add an OrcaRouter API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key O Bring your own key Add an OrcaRouter API key to Kilo Orca
### https://kilo.ai/inference/byok/synthetic
T: Add a Synthetic API key to Kilo
D: Connect Synthetic-hosted models to Kilo with your own provider account.
H: Add a Synthetic API key to Kilo | How to connect Synthetic to Kilo | Before you connect | Compare this with every inference option
X: Add a Synthetic API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key S Bring your own key Add a Synthetic API key to Kilo Syntheti
### https://kilo.ai/inference/byok/openrouter
T: Add an OpenRouter API key to Kilo
D: Connect one OpenRouter key to Kilo for access to hundreds of routed models.
H: Add an OpenRouter API key to Kilo | How to connect OpenRouter to Kilo | Before you connect | Compare this with every inference option
X: Add an OpenRouter API key to Kilo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Bring your own key Bring your own key Add an OpenRouter API key to Kilo OpenRo
### https://kilo.ai/landing/vs-code
T: Kilo - AI Coding Assistant for VS Code — Free, 500+ Models
D: The free, open-source AI coding extension for VS Code. 500+ models, parallel agents, no vendor lock-in. Install free and start coding smarter today.
H: The AI coding extension VS Code was missing | Let agents run fast without giving them the whole machine | An agent that doesn&#x27;t just think faster - it works faster | One interface for every agent session | Review agent changes like a teammate PR | Run parallel agents without stepping on each other | Compare model output side by side on the same prompt | Start in CLI, pick up in VS Code, share in Slack | All-in-one platform, same core | Install Kilo Code and go parallel | Trusted by develope
X: Kilo - AI Coding Assistant for VS Code — Free, 500+ Models Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started The AI coding extension VS Code was missing Powered b
### https://kilo.ai/landing/deepseek-v3
T: DeepSeek in Kilo Code - Open Source AI Coding Agent
D: Use DeepSeek V3.1 Terminus in Kilo Code. 10-50x cheaper than competitors, 128K context window. The open-source model that rivals the giants.
H: Use DeepSeek V3 in Kilo Code | How to use DeepSeek in Kilo Code | Why DeepSeek in Kilo Code? | Trusted by developers at the world&#x27;s most innovative companies | Related and alternative models in Kilo Code | Glide through your workflow with an agent for every step | Compare Kilo Code with Other Tools | Ready to code with DeepSeek?
X: DeepSeek in Kilo Code - Open Source AI Coding Agent Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started DeepSeek-V4 is now live in Kilo Code — see what&#x27;s new O
### https://kilo.ai/landing/deepseek-v4
T: DeepSeek V4 in Kilo Code – 1M Context, Open Source
D: DeepSeek-V4 is live in Kilo Code. V4-Pro (1.6T total / 49B active) and V4-Flash (284B / 13B active) with 1M context, DeepSeek Sparse Attention, and open-source SOTA agentic coding.
H: Use DeepSeek V4 in Kilo Code | How to use DeepSeek V4 in Kilo Code | Two models, one API | Why DeepSeek V4 in Kilo Code? | Trusted by developers at the world&#x27;s most innovative companies | Related and alternative models in Kilo Code | Glide through your workflow with an agent for every step | Compare Kilo Code with Other Tools | Ready to code with DeepSeek V4?
X: DeepSeek V4 in Kilo Code – 1M Context, Open Source Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started New • DeepSeek-V4 is live in Kilo Code Use DeepSeek V4 in Kil
### https://kilo.ai/landing/free-models
T: Best Free AI Coding Models Available Now | Kilo Code
D: Find 3 free AI coding models in Kilo Code. Live catalog with $0 input and $0 output pricing, updated every 60 seconds.
H: Best Free AI Coding Models Available Now | Why Free Models in Kilo | Best Currently Tested Free Coding Models | Latest Free Models | Related Model Guides | Model option comparison | Free model FAQ | Start coding with free AI models
X: Best Free AI Coding Models Available Now | Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Best tested free models plus live catalog Best Free AI Codi
### https://kilo.ai/landing/glm
T: Code with GLM Models in Kilo Code
D: GLM-5 is faster on Kilo Code. The all-in-one agentic engineering platform with 500+ AI models including Z.ai GLM.
H: Code with GLM Models in Kilo Code | Why developers choose GLM models with Kilo Code | How to use GLM-5 — faster on Kilo Code | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Ready to code with GLM-5 — faster on Kilo Code?
X: Code with GLM Models in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started GLM-5 Is Faster on Kilo Code Code with GLM Models in Kilo Code GLM-5 is faster
### https://kilo.ai/landing/gpt-5-3-codex
T: Use GPT-5.3 Codex in Kilo Code
D: OpenAI&#x27;s most powerful coding model — 77.3% on Terminal-Bench 2.0 and 56.8% on SWE-Bench Pro. Use GPT-5.3 Codex in Kilo Code via Kilo Gateway or your ChatGPT subscription.
H: Use GPT-5.3 Codex in Kilo Code | Two Ways to Use GPT-5.3 Codex in Kilo Code | One Model, Your Coding Workflow | Why GPT-5.3 Codex | GPT-5.3 Codex Benchmark Performance | Get Started with GPT-5.3 Codex | Trusted by developers at the world&#x27;s most innovative companies | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Ready to Code with GPT-5.3 Codex?
X: Use GPT-5.3 Codex in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started GPT-5.3 Codex Available Now in Kilo Code Use GPT-5.3 Codex in Kilo Code OpenAI&#x
### https://kilo.ai/landing/grok-code-fast-1-optimized
T: Optimized Grok Code Fast 1 — Free in Kilo Code
D: Use the optimized Grok Code Fast 1 model free in Kilo Code. Faster, smarter coding with test-time compute scaling across VS Code, JetBrains, and CLI.
H: Optimized Grok Code Fast 1 in Kilo Code | Why Optimized Grok Code Fast 1 | About the Optimization | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Ready to try Optimized Grok Code Fast 1?
X: Optimized Grok Code Fast 1 — Free in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Free for a Limited Time Optimized Grok Code Fast 1 in Kilo Code G
### https://kilo.ai/landing/kimi-k25
T: Kimi K2.5 is Faster in Kilo Code
D: Use Kimi K2.5 in Kilo Code. Moonshot&#x27;s latest AI model delivers strong performance in general reasoning, visual coding, and agentic tool-calling.
H: Kimi K2.5 is Faster in Kilo Code | Kimi K2.5 | Why try Kimi K2.5? | Trusted by developers at the world&#x27;s most innovative companies | How to use Kimi K2.5 in Kilo Code | Other free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Try Kimi K2.5 in Kilo Code Today
X: Kimi K2.5 is Faster in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kimi K2.5 is Faster in Kilo Code It delivers strong performance in general reas
### https://kilo.ai/landing/minimax-m25
T: MiniMax M2.5 - New SOTA Model from MiniMax Free in Kilo Code
D: Experience MiniMax M2.5, the latest state-of-the-art model from MiniMax. Top-tier performance, completely free in Kilo Code CLI, VS Code extension, and more.
H: MiniMax M2.5 Free for One Week Only | Why developers choose MiniMax M2.5 | Trusted by developers at the world&#x27;s most innovative companies | Popular MiniMax models in Kilo Code | About MiniMax | Glide through your workflow with an agent for every step | Compare Kilo Code with Other Tools | Ready to code with MiniMax M2.5?
X: MiniMax M2.5 - New SOTA Model from MiniMax Free in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Free in Kilo for one week only MiniMax M2.5 Free fo
### https://kilo.ai/landing/minimax-m27
T: MiniMax M2.7 - Available Now in Kilo Code - Free, Open Source AI Coding Agent
D: Use MiniMax M2.7 in Kilo Code. #5 on PinchBench at $0.30/M input. Available in VS Code and CLI. Open source, 500+ models, BYOK, $0/month.
H: MiniMax M2.7 is here | Why M2.7 matters | Use it everywhere in Kilo | Trusted by developers at the world&#x27;s most innovative companies | Why Kilo Code | When to use M2.7 | Glide through your workflow with an agent for every step | Compare Kilo Code with Other Tools | Start using M2.7 in under 60 seconds.
X: MiniMax M2.7 - Available Now in Kilo Code - Free, Open Source AI Coding Agent Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Available Now in Kilo Code MiniMax
### https://kilo.ai/landing/mistralai-devstral
T: Code faster with Devstral 2 in Kilo Code
D: Use Mistral Devstral 2 in Kilo Code — a 123B-parameter open-source model built for agentic coding with a 256K context window. Access it free or pay-as-you-go in the all-in-one agentic engineering platform.
H: Code faster with Devstral 2 in Kilo Code | Why developers choose Devstral 2 | How to use Devstral 2 in Kilo Code | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Ready to code with Devstral 2?
X: Code faster with Devstral 2 in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Devstral 2 Available in Kilo Code Code faster with Devstral 2 in Kilo C

### https://kilo.ai/open-source-agentic-cli
T: Kilo - Open Source Agentic CLI — Evaluation Guide &amp; Comparison
D: A neutral guide to evaluating agentic AI coding CLIs: open source, model choice, permissions, sandboxing, logs, MCP, and CI readiness. Compare Claude Code, Aider, Codex, Gemini CLI, OpenCode, and Kilo CLI.
H: The open source agentic CLI | What is an agentic CLI? | What to look for in an agentic CLI | CLI agents carry higher lock-in and safety risk than chat tools | Open, extensible, and model-flexible by design | Coming from another agentic CLI? | Running agentic CLIs safely at scale | Evaluate it from your terminal
X: Kilo - Open Source Agentic CLI — Evaluation Guide &amp; Comparison Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Evaluation Guid
### https://kilo.ai/agentic-engineering
T: Kilo - Agentic Engineering: How Teams Ship Faster Without Losing Control
D: Give AI agents scoped work, context, validation loops, and human review so your team ships faster without losing control. Learn how Kilo enables the workflow.
H: Ship Faster Without Losing Control with Agentic Engineering | What is Agentic Engineering? | How It Differs from Autocomplete and Vibe Coding | The Agentic Engineering Loop | Roles and Rituals for Teams | How Kilo Supports the Workflow | Adoption Checklist | Frequently Asked Questions | Ready to move from individual AI usage to team-wide agentic engineering?
X: Kilo - Agentic Engineering: How Teams Ship Faster Without Losing Control Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started For Engin
### https://kilo.ai/model-freedom-ai-coding
T: Kilo - Model Freedom for AI Coding: Why Multi-Model Wins
D: Model-agnostic AI coding improves quality, cuts costs, and removes vendor lock-in. Learn how to choose the right model for each coding task.
H: Model Freedom in AI Coding | Focused model guides | What is model freedom ? | Why single-model workflows break | Task-to-model mapping | BYOK &amp; Gateway architecture | Open-source and open-weight model options | The Open-Weight Revolution | How teams govern model choice without creating chaos | Related resources | Model freedom is an operating advantage
X: Kilo - Model Freedom for AI Coding: Why Multi-Model Wins Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Educational Guide Model F
### https://kilo.ai/human-in-the-loop-ai-coding
T: Kilo - Human-in-the-Loop AI Coding
D: Keep humans responsible for intent, review, and merge while AI agents handle scoped implementation work. Approval gates, review loops, and merge discipline built in.
H: Ship faster without surrendering judgment | What is human-in-the-loop AI coding? | Six places a human stays in the loop | How effective teams run supervised agents | What supervision is not | Supervision, built in at every layer | Implementation checklist | Trusted by developers at the world&#x27;s most innovative companies | Go deeper | Supervision, not chaos
X: Kilo - Human-in-the-Loop AI Coding Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started For teams that take AI coding seriously Ship fa
### https://kilo.ai/design-systems-for-ai-agents
T: Kilo - Design Systems for AI Agents and AI-Generated UI
D: Design systems for AI agents turn tokens, components, examples, and review rules into context. Learn what to document and how to wire it into your agentic loop.
H: Keep AI-generated UI consistent | What are design systems for AI agents? | Why AI-generated UI drifts without constraints | What to document for your agents | How to wire your design system into the agentic loop | The same task, with and without constraints | Who owns what in an agentic design system | Make your design system agent-ready
X: Kilo - Design Systems for AI Agents and AI-Generated UI Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Agentic engineering infras
### https://kilo.ai/landing/opus-4-6
T: Code with Claude Opus 4.6 in Kilo Code
D: Use Anthropic&#x27;s most powerful AI model in Kilo Code — #1 on agentic coding benchmarks with adaptive thinking and a 1M token context window.
H: Code with Claude Opus 4.6 in Kilo Code | Why developers choose Opus 4.6 | Opus 4.6 Benchmark Performance | Claude Opus 4.6 in Kilo Code | How to use Claude Opus 4.6 | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Ready to code with the most powerful 
X: Code with Claude Opus 4.6 in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Opus 4.6 Available Now in Kilo Code Code wi
### https://kilo.ai/landing/opus-4-8
T: Code with Claude Opus 4.8 in Kilo Code
D: Use Anthropic&#x27;s most powerful AI model in Kilo Code — leading agentic coding benchmarks with adaptive thinking and a 1M token context window.
H: Code with Claude Opus 4.8 in Kilo Code | Why developers choose Opus 4.8 | Save 20% on select Claude models through Kilo Gateway | Opus 4.8 Benchmark Performance | Claude Opus 4.8 in Kilo Code | How to use Claude Opus 4.8 | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare AI models 
X: Code with Claude Opus 4.8 in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Opus 4.8 Available Now in Kilo Code Code wi
### https://kilo.ai/landing/qwen3
T: Code with Qwen3 Models in Kilo Code
D: Use Qwen3-Coder in Kilo Code — frontier-level coding performance at a fraction of the cost. The all-in-one agentic engineering platform with 500+ AI models including Alibaba Qwen3.
H: Code with Qwen3 Models in Kilo Code | Why coders choose Qwen3 | Qwen3 Models in Kilo Code | How to use Qwen3 in Kilo Code | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | Ready to code with Qwen3?
X: Code with Qwen3 Models in Kilo Code Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Qwen3-Coder Available in Kilo Code Code with Q
### https://kilo.ai/landing/sonnet-4-6
T: Claude Sonnet 4.6 — Free in Code Reviewer &amp; Kilo Cloud
D: Celebrate the launch of Claude Sonnet 4.6 — Anthropic&#x27;s most capable Sonnet yet. Try it free in Kilo Code Reviewer and Kilo Cloud. Opus-level intelligence at Sonnet pricing.
H: Claude Sonnet 4.6 is Here | Why Sonnet 4.6 | Free to Try — Celebrate the Launch | Save 20% on select Claude models through Kilo Gateway | Sonnet 4.6 Benchmark Performance | How to use Claude Sonnet 4.6 | Trusted by developers at the world&#x27;s most innovative companies | Other affordable and free models available in Kilo Code | Glide through your workflow with an agent for every step | Use Kilo Everywhere | Compare Kilo Code with Other Tools | 
X: Claude Sonnet 4.6 — Free in Code Reviewer &amp; Kilo Cloud Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started 🎉 Sonnet 4.6 — Free to
### https://kilo.ai/open-source-vs-open-weight-models
T: Kilo - Open Source vs Open Weight AI Models Explained
D: Compare open source AI vs open-weight models: licensing, redistribution, fine-tuning, auditability, and procurement considerations.
H: Open Source vs Open Weight AI Models | Open Source AI | Open Weight | Restricted Weights | Closed/API-only | Open-source coding software | Open-weight model artifacts | What To Review | Registry Examples | Primary References | FAQ | Related Model Guides
X: Kilo - Open Source vs Open Weight AI Models Explained Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Terminology and licensing gu
### https://kilo.ai/new-open-weight-models
T: Kilo - New Open-Weight AI Coding Models
D: Dynamic Kilo and OpenRouter watchlist for recent open-weight and coding-focused AI model launches, with pricing and Kilo availability status.
H: New Open-Weight AI Coding Models Released in October and November 2026 | Live catalogue first | Verification stays honest | Chronological, not best | Live Open-Weight Catalogue Watchlist | Status Definitions | What We Do Not Infer | Next Step | Related Model Guides
X: Kilo - New Open-Weight AI Coding Models Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Live catalogue tracker New Open-Weight AI 
### https://kilo.ai/models/compare
T: Compare AI Coding Models - Side-by-Side LLM Comparison
D: Compare AI coding models side-by-side. View pricing, performance benchmarks, context windows, and capabilities to find the best model for your development workflow.
H: Compare AI Models
X: Compare AI Coding Models - Side-by-Side LLM Comparison Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started All models Browse by lab Co
### https://kilo.ai/providers
T: AI Inference Providers - Kilo Gateway Retention &amp; Policy
D: Compare the inference providers behind Kilo Gateway: who trains on prompts, who retains them, where they are headquartered, and policy links.
H: Model Providers
X: AI Inference Providers - Kilo Gateway Retention &amp; Policy Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Kilo Gateway Model Pr
### https://kilo.ai/models/by
T: AI Models by Lab - Browse Coding Models by Provider
D: Browse AI coding models by lab, including Claude, GPT, Gemini, DeepSeek, Qwen, Kimi, Grok, and other providers in Kilo Code.
H: AI Coding Models by Lab | Focused model guides | DeepSeek | OpenAI | Google | Qwen | Anthropic | Z.ai | MiniMax | inclusionAI | xAI | MoonshotAI
X: AI Models by Lab - Browse Coding Models by Provider Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Model leaderboard AI Coding Mo
### https://kilo.ai/models/by/anthropic
T: Anthropic Coding Models on Kilo Code (2026)
D: Every Anthropic Claude coding model in Kilo Code: Opus 4.7, Opus 4.6, Sonnet 4.6, Haiku 4.5. Pricing, benchmarks, and how to use Claude across VS Code, JetBrains, and the terminal.
H: Anthropic Coding Models on Kilo Code | Every Anthropic Coding Model in Kilo Code, Ranked | About Anthropic | Anthropic Pricing on Kilo Code | How to Use Anthropic Models in Kilo Code | Compare Anthropic with Other Labs | Why Choose Anthropic Models for Coding? | Anthropic Coding Models: FAQ | Use Anthropic Coding Models in Kilo Today
X: Anthropic Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Anthropic All
### https://kilo.ai/models/by/openai
T: OpenAI Coding Models on Kilo Code (2026)
D: Every OpenAI coding model in Kilo Code: GPT-5.5, GPT-5.4, GPT-5.3-Codex, GPT-5.2-Codex, GPT-5.1. Pricing, benchmarks, and how to use GPT across VS Code, JetBrains, and the terminal.
H: OpenAI Coding Models on Kilo Code | Every OpenAI Coding Model in Kilo Code, Ranked | About OpenAI | OpenAI Pricing on Kilo Code | How to Use OpenAI Models in Kilo Code | Compare OpenAI with Other Labs | Why Choose OpenAI Models for Coding? | OpenAI Coding Models: FAQ | Use OpenAI Coding Models in Kilo Today
X: OpenAI Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / OpenAI All labs 
### https://kilo.ai/models/by/google
T: Google Coding Models on Kilo Code (2026)
D: Every Google AI coding model in Kilo Code: Gemini 3.1 Pro, Gemini 3 Pro, Gemini 3 Flash, Gemma 4 31B and 26B. Closed-frontier and open-weight, with benchmarks and pricing.
H: Google Coding Models on Kilo Code | Every Google Coding Model in Kilo Code, Ranked | About Google | Google Pricing on Kilo Code | How to Use Google Models in Kilo Code | Compare Google with Other Labs | Why Choose Google Models for Coding? | Google Coding Models: FAQ | Use Google Coding Models in Kilo Today
X: Google Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Google All labs 
### https://kilo.ai/models/by/deepseek
T: DeepSeek Coding Models on Kilo Code (2026)
D: Every DeepSeek coding model in Kilo Code: V4-Pro (1.6T MoE, 1M context), V4-Flash, V3.1 Terminus. MIT-licensed open weights, pricing, benchmarks, run locally or hosted.
H: DeepSeek Coding Models on Kilo Code | Every DeepSeek Coding Model in Kilo Code, Ranked | About DeepSeek | DeepSeek Pricing on Kilo Code | How to Use DeepSeek Models in Kilo Code | Compare DeepSeek with Other Labs | Why Choose DeepSeek Models for Coding? | DeepSeek Coding Models: FAQ | Use DeepSeek Coding Models in Kilo Today
X: DeepSeek Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / DeepSeek All l
### https://kilo.ai/models/by/xiaomi
T: Xiaomi Coding Models on Kilo Code (2026)
D: Xiaomi MiMo coding models in Kilo Code: MiMo-V2.5-Pro, MiMo-V2.5, MiMo-V2-Pro, and MiMo-V2-Flash. Open weights, 1M context, pricing, benchmarks.
H: Xiaomi Coding Models on Kilo Code | Every Xiaomi Coding Model in Kilo Code, Ranked | About Xiaomi | Xiaomi Pricing on Kilo Code | How to Use Xiaomi Models in Kilo Code | Compare Xiaomi with Other Labs | Why Choose Xiaomi Models for Coding? | Xiaomi Coding Models: FAQ | Use Xiaomi Coding Models in Kilo Today
X: Xiaomi Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Xiaomi All labs 
### https://kilo.ai/models/by/z-ai
T: Z.ai Coding Models on Kilo Code (2026)
D: Every Z.ai GLM coding model in Kilo Code, including GLM 4.7, GLM 5, and GLM 5.2. Compare pricing, benchmarks, and agentic coding fit.
H: Z.ai Coding Models on Kilo Code | Every Z.ai Coding Model in Kilo Code, Ranked | About Z.ai | Z.ai Pricing on Kilo Code | How to Use Z.ai Models in Kilo Code | Compare Z.ai with Other Labs | Why Choose Z.ai Models for Coding? | Z.ai Coding Models: FAQ | Use Z.ai Coding Models in Kilo Today
X: Z.ai Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Z.ai All labs Z.ai
### https://kilo.ai/models/by/qwen
T: Qwen Coding Models on Kilo Code (2026)
D: Every Qwen coding model in Kilo Code, including Qwen3 Coder and Qwen3.7 variants. Compare benchmarks, pricing, and open-weight options.
H: Qwen Coding Models on Kilo Code | Every Qwen Coding Model in Kilo Code, Ranked | About Qwen | Qwen Pricing on Kilo Code | How to Use Qwen Models in Kilo Code | Compare Qwen with Other Labs | Why Choose Qwen Models for Coding? | Qwen Coding Models: FAQ | Use Qwen Coding Models in Kilo Today
X: Qwen Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Qwen All labs Qwen
### https://kilo.ai/models/by/inclusionai
T: inclusionAI Coding Models on Kilo Code (2026)
D: inclusionAI Ling and Ring coding models in Kilo Code. Compare long-context coding performance, pricing, and free hosted options.
H: inclusionAI Coding Models on Kilo Code | Every inclusionAI Coding Model in Kilo Code, Ranked | About inclusionAI | inclusionAI Pricing on Kilo Code | How to Use inclusionAI Models in Kilo Code | Compare inclusionAI with Other Labs | Why Choose inclusionAI Models for Coding? | inclusionAI Coding Models: FAQ | Use inclusionAI Coding Models in Kilo Today
X: inclusionAI Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / inclusionAI
### https://kilo.ai/models/by/minimax
T: MiniMax Coding Models on Kilo Code (2026)
D: MiniMax M-series coding models in Kilo Code. Compare MiniMax M2.7, M3, and related models by benchmark, speed, and price.
H: MiniMax Coding Models on Kilo Code | Every MiniMax Coding Model in Kilo Code, Ranked | About MiniMax | MiniMax Pricing on Kilo Code | How to Use MiniMax Models in Kilo Code | Compare MiniMax with Other Labs | Why Choose MiniMax Models for Coding? | MiniMax Coding Models: FAQ | Use MiniMax Coding Models in Kilo Today
X: MiniMax Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / MiniMax All lab
### https://kilo.ai/models/by/moonshotai
T: MoonshotAI Coding Models on Kilo Code (2026)
D: MoonshotAI Kimi coding models in Kilo Code. Compare Kimi K2.7 Code, Kimi K2.5, pricing, benchmarks, and context windows.
H: MoonshotAI Coding Models on Kilo Code | Every MoonshotAI Coding Model in Kilo Code, Ranked | About MoonshotAI | MoonshotAI Pricing on Kilo Code | How to Use MoonshotAI Models in Kilo Code | Compare MoonshotAI with Other Labs | Why Choose MoonshotAI Models for Coding? | MoonshotAI Coding Models: FAQ | Use MoonshotAI Coding Models in Kilo Today
X: MoonshotAI Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / MoonshotAI A
### https://kilo.ai/models/by/nvidia
T: NVIDIA Coding Models on Kilo Code (2026)
D: NVIDIA Nemotron coding models in Kilo Code. Compare Nemotron Ultra and Super variants by pricing, speed, and coding benchmarks.
H: NVIDIA Coding Models on Kilo Code | Every NVIDIA Coding Model in Kilo Code, Ranked | About NVIDIA | NVIDIA Pricing on Kilo Code | How to Use NVIDIA Models in Kilo Code | Compare NVIDIA with Other Labs | Why Choose NVIDIA Models for Coding? | NVIDIA Coding Models: FAQ | Use NVIDIA Coding Models in Kilo Today
X: NVIDIA Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / NVIDIA All labs 
### https://kilo.ai/models/by/x-ai
T: xAI Coding Models on Kilo Code (2026)
D: xAI Grok coding models in Kilo Code. Compare Grok Build, Grok 4.3, Grok Code Fast 1, pricing, and benchmarks.
H: xAI Coding Models on Kilo Code | Every xAI Coding Model in Kilo Code, Ranked | About xAI | xAI Pricing on Kilo Code | How to Use xAI Models in Kilo Code | Compare xAI with Other Labs | Why Choose xAI Models for Coding? | xAI Coding Models: FAQ | Use xAI Coding Models in Kilo Today
X: xAI Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / xAI All labs xAI Co
### https://kilo.ai/models/by/mistralai
T: Mistral AI Coding Models on Kilo Code (2026)
D: Mistral AI coding models in Kilo Code, including Devstral and Mistral Medium. Compare pricing, open-weight posture, and coding benchmarks.
H: Mistral AI Coding Models on Kilo Code | Every Mistral AI Coding Model in Kilo Code, Ranked | About Mistral AI | Mistral AI Pricing on Kilo Code | How to Use Mistral AI Models in Kilo Code | Compare Mistral AI with Other Labs | Why Choose Mistral AI Models for Coding? | Mistral AI Coding Models: FAQ | Use Mistral AI Coding Models in Kilo Today
X: Mistral AI Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Mistral AI A
### https://kilo.ai/models/by/stepfun
T: StepFun Coding Models on Kilo Code (2026)
D: StepFun Step coding models in Kilo Code. Compare Step 3.5 Flash pricing, speed, and coding fit.
H: StepFun Coding Models on Kilo Code | Every StepFun Coding Model in Kilo Code, Ranked | About StepFun | StepFun Pricing on Kilo Code | How to Use StepFun Models in Kilo Code | Compare StepFun with Other Labs | Why Choose StepFun Models for Coding? | StepFun Coding Models: FAQ | Use StepFun Coding Models in Kilo Today
X: StepFun Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / StepFun All lab
### https://kilo.ai/models/by/poolside
T: Poolside Coding Models on Kilo Code (2026)
D: Poolside Laguna coding models in Kilo Code. Compare coding-native model performance, pricing, and free hosted access.
H: Poolside Coding Models on Kilo Code | Every Poolside Coding Model in Kilo Code, Ranked | About Poolside | Poolside Pricing on Kilo Code | How to Use Poolside Models in Kilo Code | Compare Poolside with Other Labs | Why Choose Poolside Models for Coding? | Poolside Coding Models: FAQ | Use Poolside Coding Models in Kilo Today
X: Poolside Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Poolside All l
### https://kilo.ai/models/by/tencent
T: Tencent Coding Models on Kilo Code (2026)
D: Tencent Hunyuan coding models in Kilo Code. Compare hosted Hunyuan pricing, benchmarks, and developer workflow fit.
H: Tencent Coding Models on Kilo Code | Every Tencent Coding Model in Kilo Code, Ranked | About Tencent | Tencent Pricing on Kilo Code | How to Use Tencent Models in Kilo Code | Compare Tencent with Other Labs | Why Choose Tencent Models for Coding? | Tencent Coding Models: FAQ | Use Tencent Coding Models in Kilo Today
X: Tencent Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Tencent All lab
### https://kilo.ai/models/by/baidu
T: Baidu Coding Models on Kilo Code (2026)
D: Baidu coding models in Kilo Code, including CoBuddy-style free hosted models. Compare availability, pricing, and coding fit.
H: Baidu Coding Models on Kilo Code | Every Baidu Coding Model in Kilo Code, Ranked | About Baidu | Baidu Pricing on Kilo Code | How to Use Baidu Models in Kilo Code | Compare Baidu with Other Labs | Why Choose Baidu Models for Coding? | Baidu Coding Models: FAQ | Use Baidu Coding Models in Kilo Today
X: Baidu Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Baidu All labs Ba
### https://kilo.ai/models/by/nex-agi
T: Nex AGI Coding Models on Kilo Code (2026)
D: Nex AGI coding models in Kilo Code. Compare free hosted Nex-N2-Pro availability, benchmarks, and developer workflow fit.
H: Nex AGI Coding Models on Kilo Code | Every Nex AGI Coding Model in Kilo Code, Ranked | About Nex AGI | Nex AGI Pricing on Kilo Code | How to Use Nex AGI Models in Kilo Code | Compare Nex AGI with Other Labs | Why Choose Nex AGI Models for Coding? | Nex AGI Coding Models: FAQ | Use Nex AGI Coding Models in Kilo Today
X: Nex AGI Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Nex AGI All lab
### https://kilo.ai/models/by/openrouter
T: OpenRouter Coding Models on Kilo Code (2026)
D: OpenRouter-hosted experimental models in Kilo Code. Compare free hosted community models and model-router availability.
H: OpenRouter Coding Models on Kilo Code | Every OpenRouter Coding Model in Kilo Code, Ranked | About OpenRouter | OpenRouter Pricing on Kilo Code | How to Use OpenRouter Models in Kilo Code | Compare OpenRouter with Other Labs | Why Choose OpenRouter Models for Coding? | OpenRouter Coding Models: FAQ | Use OpenRouter Coding Models in Kilo Today
X: OpenRouter Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / OpenRouter A
### https://kilo.ai/models/by/kwaipilot
T: Kwaipilot Coding Models on Kilo Code (2026)
D: Kwaipilot KAT-Coder models in Kilo Code. Compare coding-agent benchmarks, pricing, and developer workflow fit.
H: Kwaipilot Coding Models on Kilo Code | Every Kwaipilot Coding Model in Kilo Code, Ranked | About Kwaipilot | Kwaipilot Pricing on Kilo Code | How to Use Kwaipilot Models in Kilo Code | Compare Kwaipilot with Other Labs | Why Choose Kwaipilot Models for Coding? | Kwaipilot Coding Models: FAQ | Use Kwaipilot Coding Models in Kilo Today
X: Kwaipilot Coding Models on Kilo Code (2026) Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Home / Models / By Lab / Kwaipilot All
### https://kilo.ai/customers/plug-and-pay
T: Kilo - Plug&amp;Pay: 80% Developer Adoption
D: How Plug&amp;Pay consolidated their AI stack and drove 80% developer adoption with Kilo Code.
H: How Plug&amp;Pay Consolidated Their AI Stack and Drove 80% Developer Adoption | Key Outcomes | At a Glance | About Plug&amp;Pay | The Stakes: Mired in Tool Fragmentation and “Rugpull” Pricing | The Turning Point: Transparency as a Feature | The Transformation: “Kilo is Like Dough” | The Victory: Iteration at the Speed of Thought | Read More Customer Stories | Ready to Transform Your Development?
X: Kilo - Plug&amp;Pay: 80% Developer Adoption Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started How Plug&amp;Pay Consolidated Their AI
### https://kilo.ai/customers/dona-dowlan
T: Kilo - Dona Dowlan: Rebuilt Her App in 2 Weeks
D: How Dona Dowlan escaped platform lock-in and rebuilt her entire event management app in just two weeks with Kilo Code.
H: How Dona Dowlan Escaped Platform Lock-In and Rebuilt Her App in Two Weeks | Key Outcomes | At a Glance | About Dona Dowlan | The Stakes: Trapped by “Anyone Can Build” Promises | The Turning Point: An Escape Hatch That Works | The Transformation: Two Weeks to Rebuild Everything | The Victory: Apps That Improve Physical Life | Read More Customer Stories | Ready to Transform Your Development?
X: Kilo - Dona Dowlan: Rebuilt Her App in 2 Weeks Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started How Dona Dowlan Escaped Platform Lo
### https://kilo.ai/customers/andrey-guenov
T: Kilo - Andrey Guenov: 20% to MVP in One Week
D: How Andrey Guenov went from 20% to near-MVP in just one week with Kilo Code and transparent pay-for-what-you-use pricing.
H: How Andrey Guenov Went from 20% to MVP in One Week with Kilo Code | Key Outcomes | At a Glance | About Andrey Guenov | The Stakes: The Solo Founder’s Spiral | The Turning Point: No Hidden Fees, No Limits | The Transformation: One Hour, Real Progress | The Victory: A Faithful Partner | Read More Customer Stories | Ready to Transform Your Development?
X: Kilo - Andrey Guenov: 20% to MVP in One Week Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started How Andrey Guenov Went from 20% to MV
### https://kilo.ai/customers/ida-infront
T: Kilo - Ida Infront: Taking an Engineering Org Agentic
D: How Ida Infront is rolling out Kilo Code to 70 engineers with structured onboarding, MCP integrations, and a goal to double development speed.
H: How Ida Infront Is Taking a Whole Engineering Organization Agentic | Key Outcomes | At a Glance | About Ida Infront | The Stakes: When Legacy Becomes Liability | The Plan: Structure Over Experimentation | The Shift: From Coding Assistant to a Different Way of Working | Read More Customer Stories | Ready to Transform Your Development?
X: Kilo - Ida Infront: Taking an Engineering Org Agentic Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started How Ida Infront Is Taking a 
### https://kilo.ai/customers/intraphone
T: Kilo - IntraPhone: From Legacy Code to Beating the Roadmap
D: How IntraPhone went from 20 years of legacy backlog to 5-10x developer velocity, shipping Android dark mode in 4 hours and a 9.9/10-rated iOS prototype.
H: How IntraPhone Went From Legacy Code Bottleneck to Outrunning Its Own Roadmap | Key Outcomes | At a Glance | About IntraPhone | The Stakes: Throttled by Legacy | The Turning Point: The Secret Prototype | The Transformation: A Codebase Understood, a Role Expanded | The Victory: Development Is No Longer the Constraint | Read More Customer Stories | Ready to Transform Your Development?
X: Kilo - IntraPhone: From Legacy Code to Beating the Roadmap Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started How IntraPhone Went Fro
### https://kilo.ai/launch-partner
T: Kilo - Launch Partner Program
D: Partner with Kilo Code to launch your AI model, inference API, or developer platform to a highly engaged developer community. Get beta testing, technical content, and strategic amplification.
H: Launch Your AI Model or API with Kilo Code | Complete Launch Partnership Package | 1,500+ Registrations for Gemini 3 Model Launch | 1,000+ Developers at Anthropic Claude Opus Webinar | Why AI Labs and Providers Choose Kilo Code | Ready to Launch Your AI Model or API?
X: Kilo - Launch Partner Program Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Launch Your AI Model or API with Kilo Code Partner w
### https://kilo.ai/contact-sales
T: Kilo for Enterprise | Book an AI Coding Platform Demo
D: Book a Kilo enterprise demo to cut AI coding spend with transparent per-token pricing, model freedom, usage governance, SSO, and security controls.
H: Why Enterprises Choose Kilo | 1 . Cut your AI bill, not your output | 2 . Your data stays yours | 3 . See and control every dollar | EU Data Residency Options | Trusted by developers at the world&#x27;s most innovative companies | Model freedom, governance, and auditable tooling in one platform. | Transparent by design. | Ready to see it on your codebase?
X: Kilo for Enterprise | Book an AI Coding Platform Demo Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Get Started Kilo for Enterprise Why Enterprises Choose
### https://kilo.ai/privacy
T: Privacy Policy
D: Privacy Policy for Kilo Code
H: Privacy Policy | Introduction | Applicability of this Privacy Policy | Personal information we collect | Mobile App (Kilo App for iOS and Android) | Information Kilo Code does not collect | How Kilo Code uses and protects your personal information | Google User Data | Cross-border transfer of personal information | Kilo Code communications with you | Your choices | Global privacy practices and your rights
X: Privacy Policy Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Privacy Policy Last Updated: May 29, 2026 Introduction This privacy
### https://kilo.ai/terms
T: Terms of Service
D: Terms of Service for Kilo Code
H: 
X: Terms of Service Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Terms of Service Last updated November 2, 2026. These Terms are e
### https://kilo.ai/eu/configurator
T: Kilo - EU AI Coding Rollout Planner
D: Answer eight practical questions and build an AI coding rollout plan covering inference, compute, model access, product surfaces, and governance for European organizations.
H: Build your European AI coding rollout plan | What are your priorities for this rollout?
X: Kilo - EU AI Coding Rollout Planner Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started 🇪🇺 EU AI Coding Rollout Planner Build your E
### https://kilo.ai/local-models/ollama
T: Use Ollama with Kilo Code for Local AI Coding
D: Connect Ollama to Kilo Code for local AI coding in VS Code, JetBrains, and the CLI. Follow setup, validation, privacy, hardware, and troubleshooting guidance.
H: Use Ollama with Kilo Code for Local AI Coding | Connect Ollama to Kilo | Before you connect | Troubleshooting | Ollama and Kilo FAQ | Choose the right local coding model
X: Use Ollama with Kilo Code for Local AI Coding Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Local models in Kilo Local runtime s
### https://kilo.ai/local-models/lm-studio
T: Use LM Studio with Kilo Code for Local AI Coding
D: Connect LM Studio to Kilo Code for local AI coding in VS Code, JetBrains, and the CLI. Follow model selection, server, privacy, hardware, and troubleshooting guidance.
H: Use LM Studio with Kilo Code for Local AI Coding | Connect LM Studio to Kilo | Before you connect | Troubleshooting | LM Studio and Kilo FAQ | Choose the right local coding model
X: Use LM Studio with Kilo Code for Local AI Coding Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Local models in Kilo Local runtim
### https://kilo.ai/leaderboard
T: Kilo - Best AI Coding Models 2026 | Live AI Leaderboard
D: Compare the best AI coding models by real Kilo usage, industry benchmarks, pricing, speed, and context window. See live rankings for coding and agent workflows.
H: Best AI Models in Kilo | Top Coding Models in Kilo This Week | Kilo Benchmark | Top Models by Agent | Top Models Today | Daily Top Models | All Models | Models earn their rank from the developers using them, not from a spec sheet. | Read the leaderboard like a pro | AI model FAQ
X: Kilo - Best AI Coding Models 2026 | Live AI Leaderboard Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Print report Best AI Model
### https://kilo.ai/leaderboard/race
T: Kilo - AI Provider Token Race
D: Watch how AI provider usage evolved week by week, from Jun 2025 – Oct 2026. See the rise and fall of different providers as developers shift their preferences.
H: AI Provider Token Race | How open models gained ground | What 70 weeks of model usage tell us | Top open-weight model labs by usage | Open-weight releases that drove adoption | Real usage from real developers | How to read the race
X: Kilo - AI Provider Token Race Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Back to Leaderboard AI Provider Token Race Watch how
### https://kilo.ai/leaderboard/tier-list
T: AI Coding Model Tier List | Official KiloBench Results
D: A capability-only AI coding model tier list built from officially promoted KiloBench Terminal Bench 2.0 completion results, with a transparent score rubric.
H: AI Coding Model Tier List | How tiers are assigned | Official KiloBench tiers
X: AI Coding Model Tier List | Official KiloBench Results Cursor loses OpenAI on November 12. Keep GPT and 500+ models on Kilo Enterprise, free through your Cursor contract Claim Offer Skip to main content Kilo GitHub Product Models Enterprise Resources Pricing Sign in Contact sales Get Started Officially promoted KiloBen

Reasoning highlights: /inference defines the four ways to power Kilo (Gateway pay-go, Kilo Pass 1:1+bonus, BYOK incl. ChatGPT subscription attach, local) — the money map. /teams ($15/user/mo: shared balance, analytics, adoption score, shared agents) and /enterprise (SSO/SCIM/audit/sub-org budgets; AWS Marketplace Teams $180/user/yr, Enterprise $720/user/yr, usage at cost) are governance, not compute. /marketplace sells partner coding plans + integrations for credits (BytePlus, Exa live) — adjacent to MCP, not a Claw. /cursor-exodus (Enterprise free through your Cursor contract, seats 1:1, up to 12 mo) + Anaconda-acquisition banner = context for the enterprise push that plausibly shelved Claw. /open (MIT clients) + /oss + /manifesto + /about = the open-source trust story. Landing/* (20) + open-weight/local-model guides = model SEO, no product. Customers (5) + agencies/partners/launch-partner = social proof. Privacy/terms/security/compliance = legal. leaderboards/kilobench/models-compare/providers/models-by (21) = the transparency layer (benchmarks + 159-model catalog).

## 4. DOCS TABS (210 — the tabs-in-tabs)

### https://kilo.ai/docs/automate
T: null
D: Automate your development workflows with Kilo Code
H: Automate | Code Reviews | Agent Manager | MCP (Model Context Protocol) | Integrations | Extending Kilo | Common Automation Patterns | Get Started
X: Automate Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize Col
### https://kilo.ai/docs/automate/agent-manager
T: null
D: Manage and orchestrate multiple AI agents
H: Agent Manager | Orchestration model | Opening the Agent Manager | Requirements | Project-scoped settings | Providers and Authentication | Working with Worktrees | Starting and orchestrating sessions from chat | Sections | Sending Messages, Approvals, and Control | Previewing pending edits | Diff / Review Panel | Documents inspector | Browser previews | Terminals
X: Agent Manager Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customiz
### https://kilo.ai/docs/automate/agent-manager-projects
T: null
D: Manage Agent Manager sessions across multiple Git repositories
H: Multi-project Agent Manager | Default project | Add repositories | Project scope | When the workspace folder is not a Git repository
X: Multi-project Agent Manager Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code wi
### https://kilo.ai/docs/automate/agent-manager-workflows
T: null
D: Scaling from the sidebar to multiple agents in parallel worktrees
H: Agent Manager Workflows | Sidebar vs. Agent Manager | Task subagents vs. Agent Manager sessions | What parallelizes well | The default loop | Workflows | Running and testing | Reviewing changes | Merging worktree and parent branch | Hygiene | Common mistakes | Cheatsheet | Related
X: Agent Manager Workflows Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with A
### https://kilo.ai/docs/automate/code-reviews/github
T: null
D: Set up automated AI code reviews on GitHub pull requests
H: GitHub Code Reviews | Prerequisites | Setup | What to Expect | Repository Selection | Troubleshooting
X: GitHub Code Reviews Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Cu
### https://kilo.ai/docs/automate/code-reviews/gitlab
T: null
D: Set up automated AI code reviews on GitLab merge requests
H: GitLab Code Reviews | Prerequisites | Setup | What to Expect | How the Bot Identity Works | Webhooks | Disconnecting | Troubleshooting
X: GitLab Code Reviews Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Cu
### https://kilo.ai/docs/automate/code-reviews/overview
T: null
D: Automate code reviews with AI assistance
H: Code Reviews | What Code Reviews Enable | Supported Platforms | Prerequisites | Cost | Concurrent reviews | Getting Started | Repository Guidance with REVIEW.md | Local Code Reviews | How Code Reviews Work | Review Styles | Focus Areas | Perfect For | Limitations and Guidance
X: Code Reviews Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize
### https://kilo.ai/docs/automate/extending/local-models
T: null
D: Run AI models locally with Kilo Code
H: Using Local Models | Supported Local Model Providers | Setting Up Local Models | Troubleshooting
X: Local Models Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize
### https://kilo.ai/docs/automate/extending/plugins
T: null
D: Extend the Kilo CLI with custom hooks, tools, auth providers, and more
H: Plugins | What plugins can do | Use a plugin | Create a plugin | Publish your plugin to the Marketplace | Hooks reference | Custom tools | Examples | TUI plugins | Troubleshooting | Reference
X: Plugins Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize Coll
### https://kilo.ai/docs/automate/extending/shell-integration
T: null
D: Integrate Kilo Code with your shell environment
H: Terminal Shell Integration | How Shell Execution Works | The bash Tool | Agent Manager Terminals (VS Code Extension) | Troubleshooting | Support
X: Shell Integration Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Cust
### https://kilo.ai/docs/automate/how-tools-work
T: null
D: Learn how Kilo Code&#x27;s tools automate your development workflow
H: How Tools Work | Tool Workflow | Tool Categories | Example: Using Tools | Tool Safety and Approval | Core Tools Reference | Learn More About Tools
X: How Tools Work Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customi
### https://kilo.ai/docs/automate/integrations
T: null
D: Overview of Kilo Code integrations
H: Kilo Code Integrations | Supported Platforms | What You Can Do With Integrations | Prerequisites | Connecting GitHub | Connecting GitLab | Connecting DoltHub | What Happens After Connecting | Managing or Removing the Integration | Troubleshooting
X: Integrations Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize
### https://kilo.ai/docs/automate/mcp/mcp-vs-api
T: null
D: Comparing MCP to traditional APIs
H: MCP vs REST APIs: A Fundamental Distinction | Architectural Differences | Different Layers, Different Purposes | Context Preservation: Critical for AI Workflows | Dynamic Tool Discovery | Real-World Example: Multi-Tool Workflow | Why Kilo Code Uses MCP | Conclusion: Complementary, Not Competing Technologies
X: MCP vs API Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize C
### https://kilo.ai/docs/automate/mcp/overview
T: null
D: Overview of the Model Context Protocol
H: Model Context Protocol (MCP) | MCP Documentation | Contributing to the Marketplace
X: MCP Overview Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize
### https://kilo.ai/docs/automate/mcp/server-transports
T: null
D: Understanding MCP server transport options
H: MCP Server Transports: STDIO &amp; SSE | STDIO Transport | SSE Transport | Local vs. Hosted: Deployment Aspects | Choosing Between STDIO and SSE | Configuring Transports in Kilo Code
X: Server Transports Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Cust
### https://kilo.ai/docs/automate/mcp/using-in-cli
T: null
D: How to configure and use MCP servers in the Kilo CLI
H: Using MCP in the CLI | Configuration Location | Configuration Format | Transport Types | Managing MCP Servers | Examples | Tool Permissions | Environment Variables | Finding MCP Servers
X: Using MCP in CLI Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Custo
### https://kilo.ai/docs/automate/mcp/using-in-kilo-code
T: null
D: How to use MCP servers in Kilo Code
H: Using MCP in Kilo Code | Configuring MCP Servers | Configuration Format | Understanding Transport Types | Managing MCP Servers | Platform-Specific Local Server Commands | MCP Server Examples | Finding and Installing MCP Servers | Using MCP Tools in Your Workflow | Troubleshooting MCP Servers
X: Using MCP in Kilo Code Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI
### https://kilo.ai/docs/automate/mcp/what-is-mcp
T: null
D: Introduction to the Model Context Protocol
H: What is MCP? | How It Works | Common Questions | MCP in Kilo Code | Learn More About MCP
X: What is MCP Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Automate Agents Overview Integrations Code Reviews Agent Manager Extending Kilo Local Models Shell Integration Plugins New MCP Tools How Tools Work Tools Details Home Get Started Code with AI Customize 
### https://kilo.ai/docs/automate/tools
T: null
D: Learn how Kilo Code&#x27;s tools automate your development workflow
H: Tool Use Overview | Core Concepts | Available Tools | Tool Calling Mechanism | Technical Implementation | Mode Integration | Best Practices | Error Handling and Recovery
X: Tool Use Details Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing automate/tools Tools Overview Semantic Search Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing automate/tools Tools Overview Sem
### https://kilo.ai/docs/automate/tools/semantic-search
T: null
D: Learn how the semantic_search tool uses AI embeddings and vector search to find semantically relevant code across your indexed codebase.
H: semantic_search | Parameters | What It Does | When is it used? | Key Features | Requirements | Limitations | How It Works | Search Query Best Practices | Directory Scoping | Result Interpretation | Examples When Used | Usage Examples
X: Semantic Search Tool | Kilo Code Docs Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing automate/tools Tools Overview Semantic Search Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing automate/too
### https://kilo.ai/docs/deploy-secure
T: null
D: Deploy applications and manage security with Kilo Code
H: Deploy &amp; Secure | Deploy | Security Reviews | Get Started | Best Practices
X: Deploy &amp; Secure Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Deploy &amp; Secure Deployment Overview Deploy Security Security Agent Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Deplo
### https://kilo.ai/docs/deploy-secure/deploy
T: null
D: Deploy your applications with Kilo Code
H: Deploy | Supported Platforms | Prerequisites | Deploying Your App | Deployment History &amp; Rollbacks | Database Support | Environment Variables | Common Use Cases
X: Deploy Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Deploy &amp; Secure Deployment Overview Deploy Security Security Agent Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Deploy &amp; Secur
### https://kilo.ai/docs/deploy-secure/security-reviews
T: null
D: Manage and remediate GitHub Dependabot alerts with AI
H: Security Agent | Prerequisites | Get started | Organization permissions | How Security Agent works | Use the dashboard | Browse findings | Inspect a finding | Understand statuses and outcomes | Dismiss findings | Remediate findings | Configure Security Agent | Notification delivery | Audit reports | Clear orphaned findings
X: Security Agent Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Deploy &amp; Secure Deployment Overview Deploy Security Security Agent Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Deploy &am
### https://kilo.ai/docs/gateway
T: null
D: A unified API to access hundreds of AI models through a single endpoint, with built-in usage tracking, BYOK support, and organization controls.
H: AI Gateway | Key features | Base URL | More resources
X: AI Gateway Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get Started Code 
### https://kilo.ai/docs/gateway/api-reference
T: null
D: Complete API reference for the Kilo AI Gateway, including chat completions, FIM completions, and model listing endpoints.
H: API Reference | Chat completions | Tool calling | FIM completions | TypeSafe System One | List models | List providers | Request size limits | Error codes
X: API Reference Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get Started Co
### https://kilo.ai/docs/gateway/authentication
T: null
D: Learn how to authenticate with the Kilo AI Gateway using API keys, session tokens, and Bring Your Own Key (BYOK).
H: Authentication | API key authentication | Organization tokens | Anonymous access | Bring Your Own Key (BYOK) | Request headers
X: Authentication Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get Started C
### https://kilo.ai/docs/gateway/models-and-providers
T: null
D: Learn about the AI models available through the Kilo AI Gateway, including model IDs and how to use them.
H: Models &amp; Providers | Specifying a model | Available models | Auto models
X: Models &amp; Providers Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get S
### https://kilo.ai/docs/gateway/quickstart
T: null
D: Get started with the Kilo AI Gateway in minutes. Make your first AI model request using the Vercel AI SDK, OpenAI SDK, Python, or cURL.
H: Quickstart | Prerequisites | Using the Vercel AI SDK | Using the OpenAI SDK | Using cURL | Next steps
X: Quickstart Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get Started Code 
### https://kilo.ai/docs/gateway/sdks-and-frameworks
T: null
D: Integrate with the Kilo AI Gateway using the Vercel AI SDK, OpenAI SDK, Python, cURL, or any OpenAI-compatible client.
H: SDKs &amp; Frameworks | Vercel AI SDK (Recommended) | OpenAI SDK | cURL | Other languages | Framework integrations
X: SDKs &amp; Frameworks Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get St
### https://kilo.ai/docs/gateway/streaming
T: null
D: Learn how to implement real-time streaming responses with the Kilo AI Gateway using Server-Sent Events (SSE).
H: Streaming | Enabling streaming | Streaming with the Vercel AI SDK | Streaming with the OpenAI SDK | Raw SSE format | Stream cancellation | Error handling during streaming | Recommended SSE clients
X: Streaming Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get Started Code w
### https://kilo.ai/docs/gateway/usage-and-billing
T: null
D: Understand how the Kilo AI Gateway tracks costs, manages balances, and enforces organization-level spending controls.
H: Usage &amp; Billing | How billing works | Balance management | Organization controls | Rate limiting | Usage data | Token counting
X: Usage &amp; Billing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing AI Gateway Introduction Overview Quickstart Configuration Authentication Models &amp; Providers Features Streaming Usage &amp; Billing Reference API Reference SDKs &amp; Frameworks Home Get Star
### https://kilo.ai/docs/getting-started
T: null
D: Get started with Kilo Code - the leading open source agentic engineering platform
H: Introduction to Kilo Code | Where to Use Kilo | What Kilo Can Do | Quick Start | Open Source | Get Help
X: Introduction to Kilo Code Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficienc
### https://kilo.ai/docs/getting-started/adding-credits
T: null
D: How to add credits to your Kilo Code account
H: Adding More Kilo Credits | Transparent Pricing | Credit expiration and spending order | Future Plans
X: Adding Credits Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Mod
### https://kilo.ai/docs/getting-started/byok
T: null
D: Use your own API keys or connect a ChatGPT subscription with Kilo Gateway while retaining platform features
H: Bring Your Own Key (BYOK) | Supported BYOK providers | Connect a ChatGPT subscription | Add a BYOK key | How Bring Your Own Key works | Using BYOK in the Extensions and CLI
X: Bring Your Own Key (BYOK) Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficienc
### https://kilo.ai/docs/getting-started/cost-controls-and-usage-safeguards
T: null
D: How to prevent runaway agent usage, reduce token consumption, choose the right model, and govern spend at the individual and organization level
H: Cost Controls and Usage Safeguards | Overview | Preventing Loops and Runaway Usage | Reducing Context and Token Usage | Choosing Models for Specific Tasks | Enterprise Cost Controls | Recommended Configurations | Troubleshooting Unexpected Usage | Related
X: Cost Controls and Usage Safeguards Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost 
### https://kilo.ai/docs/getting-started/faq
T: null
D: Frequently Asked Questions about Kilo Code
H: FAQ | General | Setup and Installation | Credits and Billing | Account and Integration
X: FAQ Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Model Selectio
### https://kilo.ai/docs/getting-started/faq/account-and-integration
T: null
D: Questions about accounts and integrations in Kilo Code
H: Account and Integration | Account | Integrations
X: Account and Integration Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency 
### https://kilo.ai/docs/getting-started/faq/credits-and-billing
T: null
D: Questions about credits, billing, and pricing in Kilo Code
H: Credits and Billing | Credits | Billing
X: Credits and Billing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp
### https://kilo.ai/docs/getting-started/faq/general
T: null
D: General questions about Kilo Code
H: General | How does Kilo Code work? | Is Kilo Code free to use?
X: General Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Model Sele
### https://kilo.ai/docs/getting-started/faq/setup-and-installation
T: null
D: Frequently asked questions about setting up and installing Kilo Code
H: Setup and Installation
X: Setup and Installation Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &
### https://kilo.ai/docs/getting-started/installing
T: null
D: How to install Kilo Code on your system
H: Installation | Choose Your Platform | VS Code Extension | Manual Installations | Troubleshooting | Next Steps | Getting Support
X: Installation Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Model
### https://kilo.ai/docs/getting-started/migrating
T: null
D: Guide for migrating to Kilo Code from other AI coding tools
H: Migrating from Cursor or Windsurf | Why Kilo Code&#x27;s Rules System? | Quick Migration Guide | Migrating from Cursor | Migrating from Windsurf | AGENTS.md Support | Understanding Mode-Specific Rules | Post-Migration Checklist | Troubleshooting | Advanced: Creating Custom Modes | Next Steps | Additional Resources
X: Migrating from Cursor/Windsurf Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Effi
### https://kilo.ai/docs/getting-started/quickstart
T: null
D: Get up and running with Kilo Code in minutes
H: Your First Task | Step by Step Guide | What You Can Do Next
X: Your First Task Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Mo
### https://kilo.ai/docs/getting-started/rate-limits-and-costs
T: null
D: How to choose the right Auto Model tier and reduce token spend in Kilo Code
H: Cost Efficiency &amp; Model Selection | Understanding Auto Models | What Makes Auto Efficient Efficient? | How to Switch Auto Models | Tips for Optimizing Token Usage | Rate Limits | How Costs Are Calculated | Related
X: Cost Efficiency &amp; Model Selection Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Co
### https://kilo.ai/docs/getting-started/settings
T: null
D: Configure Kilo Code settings and preferences
H: Settings | Configuring with the Agent | Managing Settings | Sandbox | Kilo Swarm | Experimental Features
X: Settings Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Model Sel
### https://kilo.ai/docs/getting-started/settings/auto-approving-actions
T: null
D: Configure automatic approval settings for Kilo Code operations
H: Auto-Approving Actions | Overview | Permission Levels | Available Tool Permissions | Runtime Permission Requests | MCP Tool Permissions | Defaults
X: Auto-Approving Actions Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &
### https://kilo.ai/docs/getting-started/settings/keep-awake
T: null
D: Prevent system sleep while Kilo agents work
H: Keep Awake | Platform support
X: Keep Awake Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Model S
### https://kilo.ai/docs/getting-started/settings/notifications
T: null
D: Configure sounds and alerts when Kilo needs your attention
H: Notifications
X: Notifications Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Mode
### https://kilo.ai/docs/getting-started/settings/sandboxing
T: null
D: Understand and configure filesystem write and network restrictions for agent tools
H: Sandboxing | Enable the sandbox | When to use sandboxing | Sandboxing and permissions | Filesystem restrictions | Network restrictions | Leaving the sandbox | Session behavior | Platform support
X: Sandboxing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Model S
### https://kilo.ai/docs/getting-started/setup-authentication
T: null
D: Configure Kilo Code and connect to your AI providers
H: Authentication | Quick Start with Kilo Account | Kilo Gateway API Key | Using Another API Provider
X: Authentication Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Mod
### https://kilo.ai/docs/getting-started/troubleshooting
T: null
D: Guides for diagnosing and resolving issues with Kilo Code
H: Troubleshooting | Guides
X: Troubleshooting Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp; Mo
### https://kilo.ai/docs/getting-started/troubleshooting/troubleshooting-extension
T: null
D: How to capture console logs and report issues with Kilo Code
H: Capturing Console Logs | Opening Developer Tools | Capturing the Error | SQLite database is malformed | Diagnosing WSL disconnects | Contact Support
X: Troubleshooting IDE Extensions Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Effi
### https://kilo.ai/docs/getting-started/using-docs-with-agents
T: null
D: Access the full Kilo Code documentation in machine-readable formats for LLMs and AI agents
H: Using Kilo Docs with Agents | Full documentation | Individual pages
X: Using Kilo Docs with Agents Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficie
### https://kilo.ai/docs/getting-started/using-kilo-for-free
T: null
D: How to use Kilo Code for free — Auto Free, finding free models, autocomplete costs, and free background tasks
H: Using Kilo for Free | Where Kilo Uses Models | Free Agentic Usage | Autocomplete costs | Free Background Tasks | Related Resources
X: Using Kilo for Free Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Get Started Get Started Overview Installation Authentication Your First Task Configuration Using Kilo for Free Bring Your Own Key (BYOK) AI Providers Settings Adding Credits Cost Efficiency &amp

### https://kilo.ai/docs/code-with-ai
T: null
D: Learn how to code with AI using Kilo Code across different platforms and interfaces
H: Code with AI | Getting Started | Platforms | Working with Agents | Features | Next Steps
X: Code with AI Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/code-with-ai/agents/auto-model
T: null
D: Smart model routing that selects an AI model for each Auto Model tier
H: Auto Model | How It Works | Tiers | Benefits | Requirements | Getting Started | When to Use Auto Model | When to Use a Specific Model | Feedback | Related
X: Auto Model Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Cod
### https://kilo.ai/docs/code-with-ai/agents/chat-interface
T: null
D: Learn how to use the Kilo Code chat interface effectively
H: Chatting with Kilo Code | Quick Setup | How to Talk to Kilo Code | The Chat Interface | Quick Interactions | Common Mistakes to Avoid | Suggested Responses | Tips for Better Workflow
X: The Chat Interface Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/code-with-ai/agents/context-mentions
T: null
D: How to provide context to Kilo Code using mentions
H: Context Mentions | How Context Works | Best Practices
X: Context &amp; Mentions Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Cont
### https://kilo.ai/docs/code-with-ai/agents/custom-models
T: null
D: How to configure custom or unlisted models for any provider
H: Custom Models | Defining a Custom Model | Model Configuration Fields | Examples | Model Loading Priority | Provider-Level Options | Filtering Available Models | Troubleshooting
X: Custom Models Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing 
### https://kilo.ai/docs/code-with-ai/agents/goals
T: null
D: Keep an agent working toward a single objective with the /goal command
H: Session Goals | Starting a goal | Goal controls | Agent-started goals | Goal statuses | Automatic pauses | Completion reports | Clarification questions | Attachments and drafts in VS Code | Limits and integration | Related
X: Session Goals Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing 
### https://kilo.ai/docs/code-with-ai/agents/model-selection
T: null
D: Guide to choosing the right AI model for your tasks
H: Model Selection Guide | Model Routing and Configuration | Check the Live Models List | General Guidance | Free and Budget Model Picks | Context Windows Matter | Models During Delegation | Selecting a Model or Agent via a Link (VS Code) | Stay Current
X: Model Selection Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/code-with-ai/agents/orchestrator-mode
T: null
D: Orchestrator mode is no longer needed — agents with full tool access now support subagents natively
H: Orchestrator Mode (Deprecated) | What Changed | What You Should Do | How Subagents Work
X: Orchestrator Mode Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribut
### https://kilo.ai/docs/code-with-ai/agents/session-history
T: null
D: Find, search, inspect, and resume local Kilo Code sessions
H: Session history and search | Choose a search method | Search in the UI | Ask Kilo to search past chats | Search with CLI commands | Query SQLite directly | Search through the API or SDK | Local and cloud sessions
X: Session History and Search Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop 
### https://kilo.ai/docs/code-with-ai/agents/using-agents
T: null
D: Understanding and using different agents in Kilo Code
H: Using Agents | Why Use Different Agents? | Switching Agents | Built-in Agents | Custom Agents
X: Using Agents Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/code-with-ai/features/autocomplete
T: null
D: AI-powered code autocompletion in Kilo Code
H: Autocomplete | How Autocomplete Works | Triggering Options | Provider and Model | Status Bar | Copilot Conflict Detection | Best Practices | Tips | Related Features
X: Autocomplete Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/code-with-ai/features/autocomplete/mistral-setup
T: null
D: Build, ship, and iterate faster with the most popular open source coding agent.
H: Setting up Mistral for autocomplete | Prerequisites | Step 1: Create a Mistral API key | Step 2: Add your key via BYOK in Kilo | Step 3: Verify autocomplete | How it works | Troubleshooting | Next steps
X: Kilo Code Documentation Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Con
### https://kilo.ai/docs/code-with-ai/features/browser-use
T: null
D: Using Kilo Code to interact with web browsers
H: Browser Use | How Browser Use Works | Using Browser Use | How Browser Actions Work | Browser Use Settings
X: Browser Use Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/code-with-ai/features/checkpoints
T: null
D: Save and restore code states with checkpoints
H: Checkpoints | Configuration Options | Automatic Session Cleanup | How Checkpoints Work | Working with Checkpoints | Technical Implementation | Git Installation
X: Checkpoints Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/code-with-ai/features/code-actions
T: null
D: Quick code actions and refactoring with Kilo Code
H: Code Actions | Available Code Actions
X: Code Actions Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/code-with-ai/features/enhance-prompt
T: null
D: Automatically improve your prompts for better results
H: Enhance Prompt | Why Use Enhance Prompt? | How to Use Enhance Prompt | Customizing the Enhancement Process | Limitations and Best Practices
X: Enhance Prompt Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing
### https://kilo.ai/docs/code-with-ai/features/file-encoding
T: null
D: How Kilo handles text file encodings when reading and editing files
H: File Encoding | Supported Encodings | Not Supported | Reporting Issues
X: File Encoding Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing 
### https://kilo.ai/docs/code-with-ai/features/git-commit-generation
T: null
D: Automatically generate meaningful git commit messages
H: Generate Commit Messages | How It Works | Using the Feature | Configuration | Best Practices | Example Generated Messages | Troubleshooting | Related Features
X: Git Commit Generation Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contr
### https://kilo.ai/docs/code-with-ai/features/message-feedback
T: null
D: Rate assistant responses with thumbs up/down to help Kilo improve
H: Message Feedback | How to use it | Why it matters | What we send | Turning it off
X: Message Feedback Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributi
### https://kilo.ai/docs/code-with-ai/features/speech-to-text
T: null
D: Dictate prompts through your signed-in Kilo account.
H: Voice Transcription | Get ready | Choose a model | Use your own transcription service | Record prompts | Review details | Fix issues | Know limits
X: Voice Transcription Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contrib
### https://kilo.ai/docs/code-with-ai/features/task-todo-list
T: null
D: Track and manage tasks with AI-generated todo lists
H: Task Todo List | How to trigger todo lists | How todo lists are updated | The old way vs. the new way | Where todo lists appear | Task status decoded | Editing todo lists | Common questions | Settings
X: Task Todo List Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing
### https://kilo.ai/docs/code-with-ai/gastown
T: null
D: Autonomous AI agent orchestration for your codebase
H: Gas Town by Kilo | What Makes Gastown Different | How It Works | Core Concepts | The Mayor — Your Interface to the Town | What You Can Build With Gastown | Getting Started | Guides
X: Gas Town by Kilo Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributi
### https://kilo.ai/docs/code-with-ai/gastown/code-review
T: null
D: How the refinery agent reviews and merges code
H: Code Review | The Review Pipeline | Micro-Adversarial Loops | Merge Strategies | Convoy-Level Review | Combining with Kilo Code Review | The Merge Queue | Review Configuration | Handling Review Feedback
X: Code Review Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/code-with-ai/gastown/concepts
T: null
D: Understand the building blocks of Gas Town — towns, beads, convoys, rigs, and agents
H: Concepts | Towns | Beads | Convoys | Rigs | Agents | The Reconciler | The Micro-Adversarial Loop | How It All Fits Together
X: Concepts Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code 
### https://kilo.ai/docs/code-with-ai/gastown/mayor
T: null
D: How to interact with your town&#x27;s coordination agent
H: The Mayor | What the Mayor Does | Talking to the Mayor | Mayor Tools | Tips for Effective Communication | Mayor Limitations
X: The Mayor Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code
### https://kilo.ai/docs/code-with-ai/gastown/quick-start
T: null
D: Get your first Gas Town running in minutes
H: Quick Start | Prerequisites | 1. Create a Town | 2. Connect a Repository | 3. Add a GitHub Personal Access Token | 4. Sling Your First Task | 5. Watch Agents Work | 6. Talk to the Mayor | What&#x27;s Next?
X: Quick Start Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/code-with-ai/gastown/settings
T: null
D: Configure models, merge strategies, and agent behavior
H: Settings | Models | Git &amp; Authentication | Merge Strategy | Refinery Configuration | Agent Limits | Environment Variables | Custom Instructions | Convoy Settings | Per-Rig Overrides
X: Settings Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code 
### https://kilo.ai/docs/code-with-ai/gastown/sling-work
T: null
D: Creating tasks and convoys for agents to work on
H: Sling Work | Single Tasks | Convoys | Assigning Priority | Watching Progress
X: Sling Work Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Cod
### https://kilo.ai/docs/code-with-ai/gastown/troubleshooting
T: null
D: Common issues and how to resolve them
H: Troubleshooting | Agents Not Picking Up Work | Container Not Starting | Git Authentication Failures | Review Loop / Stuck in Review | The Mayor is Unresponsive | Convoy Stuck / Never Completes | Agent Permanently Stuck | High Failure Rate | Getting Help
X: Troubleshooting Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/code-with-ai/gastown/wasteland
T: null
D: Federated work protocol connecting Gas Towns into a shared network of tasks, reputation, and collaboration
H: Wasteland | What is the Wasteland? | The Federation Model | Roles | Why Use It Through Gas Town by Kilo? | Where to Go Next
X: Wasteland Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code
### https://kilo.ai/docs/code-with-ai/gastown/wasteland/admin
T: null
D: Running a Wasteland: posting wanted items, reviewing submissions, stamping, merging, and managing members
H: Wasteland Administration | Why Run Your Own Wasteland | Spinning Up a Wasteland in Gas Town | Posting Wanted Items | The Review Inbox | Stamping Work | Managing Members | Moderation | Federation Choices | Admin Settings
X: Wasteland Administration Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Co
### https://kilo.ai/docs/code-with-ai/gastown/wasteland/concepts
T: null
D: Core concepts: Wasteland instances, federation, Wanted Board, claims, evidence, stamps, reputation, DoltHub PRs, validators, and rig identity
H: Wasteland Concepts | Wasteland Instance | Federation | Rig Identity | Wanted Board | Wanted Item Lifecycle | Claims | Evidence | Stamps | Reputation Ledger | Validators | DoltHub PRs
X: Wasteland Concepts Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/code-with-ai/gastown/wasteland/quick-start
T: null
D: Connect your town to the Commons wasteland, claim your first wanted item, and submit evidence
H: Wasteland Quick Start | 1. Before You Start | 2. Connect Your Town to the Commons Wasteland | 3. Browse the Wanted Board | 4. Claim Your First Wanted Item | 5. Let Agents Do the Work | 6. Submit Evidence | 7. Get Stamped | 8. What&#x27;s Next
X: Wasteland Quick Start Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contr
### https://kilo.ai/docs/code-with-ai/gastown/wasteland/settings
T: null
D: Wasteland connection settings in the Gas Town dashboard, DoltHub credentials, and rig identity
H: Wasteland Settings | Wasteland Connection | Upstream | Rig Handle | DoltHub credentials | Wanted Item Filters | Evidence Auto-Submit | Wasteland Admin Settings
X: Wasteland Settings Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/code-with-ai/gastown/wasteland/workflow
T: null
D: End-to-end workflow for working on Wasteland items: browse, claim, work, submit evidence, and get stamped
H: Wasteland Workflow | Step 1: Browse | Step 2: Claim | Step 3: Work | Step 4: Submit Evidence | Step 5: Stamping | Checking Your Reputation | Canceling/Abandoning | What Can Go Wrong
X: Wasteland Workflow Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/code-with-ai/platforms/cli
T: null
D: Using Kilo Code from the command line
H: Kilo Code CLI: AI Coding Agent in Your Terminal | Getting Started | Opening Links | Update | What you can do with Kilo Code CLI | CLI Reference | Local Code Reviews | Config Reference | CLI Notifications and Sounds | Slash Commands | Permissions | Configuration
X: Kilo Code CLI: Run the AI Coding Agent from Your Terminal Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; 
### https://kilo.ai/docs/code-with-ai/platforms/cli-reference
T: null
D: Complete reference for all Kilo CLI commands and subcommands
H: CLI Command Reference | kilo acp | kilo mcp | kilo [project] | kilo attach | kilo run | kilo debug | kilo auth | kilo agent | kilo upgrade | kilo uninstall | kilo serve
X: CLI Command Reference Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contr
### https://kilo.ai/docs/code-with-ai/platforms/cloud-agent
T: null
D: Using Kilo Code in the browser
H: Cloud Agent | What Cloud Agents Enable | Prerequisites | Cost | How to Use | Choosing where sessions run | Queueing follow-up messages | Starting Tasks from the CLI | How Cloud Agents Work | Worktrees and chats | Reviewing changes | Agent Environment Profiles
X: Cloud Agent Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/code-with-ai/platforms/github
T: null
D: Using Kilo Code in GitHub issues, pull requests, and review comments
H: Kilo for GitHub | What You Can Do | How It Works | Prerequisites | Setup | Use Cases | Cost | Tips for Best Results | Troubleshooting
X: GitHub Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code wi
### https://kilo.ai/docs/code-with-ai/platforms/jetbrains
T: null
D: Using Kilo Code in JetBrains IDEs
H: Kilo Code for JetBrains: Free AI Coding Plugin | Installation | Settings | Chat and worktrees | Diagrams in chat | Reviewing session changes | Session controls | Permission requests
X: Kilo Code for JetBrains: Free Open-Source AI Coding Plugin Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp;
### https://kilo.ai/docs/code-with-ai/platforms/kilo-connect
T: null
D: Use Kilo Code from Slack, GitHub, and Linear, and connect DoltHub data
H: Kilo Connect | Supported Integrations | How to Set Up
X: Kilo Connect Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/code-with-ai/platforms/linear
T: null
D: Using Kilo Code in Linear
H: Kilo for Linear | What You Can Do | How It Works | Prerequisites | Setup | Use Cases | Cost | Tips for Best Results | Troubleshooting
X: Linear Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code wi
### https://kilo.ai/docs/code-with-ai/platforms/mobile
T: null
D: Using Kilo Code on iOS and Android
H: Mobile Apps | What you can do | App actions | Finding sessions | Privacy and telemetry | Language and region | Kilo Pass and billing | Choosing where a session runs | Agent environment profiles | Starting a session from a picture | Continuing a finished session | Live session counts
X: Mobile Apps Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/code-with-ai/platforms/slack
T: null
D: Using Kilo Code in Slack
H: Kilo for Slack | What You Can Do | How to Interact | Prerequisites | Setup | How It Works | Changing the Model | Cost | Tips for Best Results | Troubleshooting
X: Slack Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Code wit
### https://kilo.ai/docs/code-with-ai/platforms/vscode
T: null
D: Using Kilo Code in Visual Studio Code
H: Kilo Code for VS Code | Installation | Key Features | Background agents | Follow-up messages | Multi-root workspaces | Shared Settings | Interface Language | Proxy and Certificate Troubleshooting
X: Kilo Code for VS Code: Free Open-Source AI Coding Extension Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp
### https://kilo.ai/docs/code-with-ai/platforms/vscode/whats-new
T: null
D: The Kilo Code extension has been rebuilt from the ground up on the Kilo CLI — faster, more flexible, and with access to 500+ models.
H: What&#x27;s New in Kilo Code | Adjusting to the new version
X: What&#x27;s New in Kilo Code (April 2026) Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gatewa
### https://kilo.ai/docs/collaborate
T: null
D: Work together with Kilo Code team features
H: Collaborate | Sessions &amp; Sharing | Teams | Enterprise | Adoption Dashboard | Get Started with Teams
X: Collaborate Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/collaborate/adoption-dashboard/for-team-leads
T: null
D: AI adoption insights for team leaders
H: For Team Leads | Reading Team-Wide Metrics | Identifying Adoption Gaps | Running Adoption Initiatives | Benchmarking Against Goals | Privacy and Data Considerations | Future Enhancements | Quick Reference: Dashboard Actions | Next Steps
X: For Team Leads Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing
### https://kilo.ai/docs/collaborate/adoption-dashboard/improving-your-score
T: null
D: Tips and strategies to improve your AI adoption score
H: Improving Your Score | Improving Frequency | Improving Depth | Improving Coverage | Common Patterns and Anti-Patterns | Quick Wins by Score Range | Next Steps
X: Improving Your Score Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contri
### https://kilo.ai/docs/collaborate/adoption-dashboard/overview
T: null
D: AI Adoption Dashboard overview
H: AI Adoption Dashboard Overview | Who Is It For? | Accessing the Dashboard | Dashboard Overview | The Three Dimensions | Quick Reference: Score Tiers | Next Steps
X: Overview Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Colla
### https://kilo.ai/docs/collaborate/adoption-dashboard/understanding-your-score
T: null
D: Learn how your AI adoption score is calculated
H: Understanding Your Score | The Three Dimensions | Score Tiers | How Scores Are Calculated | Why Scores Fluctuate | Interpreting Your Score | What About Individual Scores? | Next Steps
X: Understanding Your Score Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Co
### https://kilo.ai/docs/collaborate/enterprise/audit-logs
T: null
D: Track and audit team activity
H: Audit Logs | Viewing Audit Logs | Filters | Log Details | Logged Events
X: Audit Logs Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Col
### https://kilo.ai/docs/collaborate/enterprise/groups
T: null
D: Organize members into groups and compose policies like model access
H: Groups | Roles | Managing groups | Model access policies
X: Groups Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Collabo
### https://kilo.ai/docs/collaborate/enterprise/migration
T: null
D: Migrate your team to Kilo Code Enterprise
H: Migration | Why Teams Switch to Kilo | Migrating from Cursor | Migrating from GitHub Copilot | Migrating from Other AI Coding Tools | Technical Migration: Rules and Configurations | Cost Comparison Analysis | Team Training and Adoption | Common Migration Challenges | Migration Support | Success Stories | Next Steps
X: Migration Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Coll
### https://kilo.ai/docs/collaborate/enterprise/model-access-controls
T: null
D: Control which AI models your team can access
H: Model Access Controls | How It Works | Managing Model Access | Virtual models | Model pricing | Filtering Options | Example Use Cases | Notes
X: Model Access Controls Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contr
### https://kilo.ai/docs/collaborate/enterprise/sso
T: null
D: Configure Single Sign-On for your organization
H: SSO | Prerequisites | Initiating SSO Configuration | Implementing SSO Configuration | Signing in with SSO
X: SSO Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Collaborat
### https://kilo.ai/docs/collaborate/enterprise/sub-organizations
T: null
D: Manage people, usage, credits, model policy, and permissions across enterprise sub-organizations
H: Manage sub-organizations | Access sub-organization management | Create a sub-organization | Use the management sections | Recommended setup | Related documentation
X: Manage sub-organizations Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Co
### https://kilo.ai/docs/collaborate/sessions-sharing
T: null
D: Share and collaborate on Kilo Code sessions
H: Sessions &amp; Sharing | What a session keeps for you | Quick start: Create a session | Continue where you left off | Share a session (read‑only) | Fork a shared session (make it yours) | Where your session data lives | Power‑user tips
X: Sessions &amp; Sharing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Cont
### https://kilo.ai/docs/collaborate/teams/about-plans
T: null
D: Overview of Kilo Code plans and pricing
H: About Plans | What You Get from Kilo Teams | What You Get from Kilo Enterprise
X: About Plans Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Co
### https://kilo.ai/docs/collaborate/teams/analytics
T: null
D: Track team usage and performance analytics
H: Analytics | Analytics Dashboard Overview | Summary Metrics | Time Period Filters | Usage View Options | Understanding the Data | Next Steps
X: Analytics Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Coll
### https://kilo.ai/docs/collaborate/teams/billing
T: null
D: Manage billing and subscriptions for your team
H: Billing | Organization Credits | Managing Seats Subscriptions | Kilo Pass for Organizations | Automatic Top-Up | Spend alerts | Invoices | Next Steps
X: Billing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Collab
### https://kilo.ai/docs/collaborate/teams/custom-modes-org
T: null
D: Create organization-wide custom modes
H: Custom Modes (Org) | Creating a Custom Mode | Managing Custom Modes
X: Custom Modes (Org) Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/collaborate/teams/dashboard
T: null
D: Manage your team from the Kilo Code dashboard
H: Dashboard | Dashboard Navigation | Organization Tab | Usage Tab | Billing Tab | Subscriptions Tab | Providers and Models (Enterprise Only) | Single Sign-On (SSO) (Enterprise Only) | Audit Logs (Enterprise Only) | Next Steps
X: Dashboard Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Coll
### https://kilo.ai/docs/collaborate/teams/getting-started
T: null
D: Set up your Kilo Code team account
H: Get Started with Kilo Seats in 10 Minutes | Before You Begin | Quick Setup Guide | What Happens Next | First Steps for Your Team | Getting Support | Next Steps
X: Getting Started with Teams Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop 
### https://kilo.ai/docs/collaborate/teams/team-management
T: null
D: Add and manage team members in Kilo Code
H: Managing Your Team | Adding Team Members | Joining automatically with a verified domain | Removing Team Members | Changing Team Member Roles | Next Steps
X: Team Management Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/customize
T: null
D: Make Kilo Code work your way with custom agents, rules, instructions, and more
H: Customize | Customization | Context &amp; Indexing | Getting Started | Best Practices | Next Steps
X: Customize Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Cust
### https://kilo.ai/docs/customize/agent-permissions
T: null
D: Configure Kilo Code agent permission rules for tools, shell commands, files, and subagents
H: Agent Permissions | Actions | Rule Precedence | Patterns | File Paths | Shell Commands | Sensitive Files | Subagent Delegation | Troubleshooting | Related
X: Agent Permissions Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribut
### https://kilo.ai/docs/customize/agents-md
T: null
D: Project-level configuration with agents.md files
H: agents.md | What is AGENTS.md? | Why Use AGENTS.md? | File Location and Naming | File Protection | Basic Syntax and Structure | Best Practices | How AGENTS.md Works in Kilo Code | Related Features | External Resources
X: Agents.md Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Cust
### https://kilo.ai/docs/customize/context/codebase-indexing
T: null
D: Index your codebase for improved AI understanding
H: Codebase Indexing | What It Does | Key Benefits | Setup | Setting Up Qdrant | Understanding Index Status | How Files Are Processed | Tuning Parameters | Best Practices | Current Limitations | Troubleshooting | Using the Search Feature
X: Codebase Indexing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribut
### https://kilo.ai/docs/customize/context/context-condensing
T: null
D: Manage conversation context to optimize token usage and maintain long sessions
H: Context Condensing | Overview | The Problem: Context Window Limits | The Solution: Auto-Compaction | How Compaction Triggers | Defaults | Configuration | Best Practices | Related Features
X: Context Condensing Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/customize/context/kilocodeignore
T: null
D: Control which files Kilo Code can access
H: .kilocodeignore | Overview | Quick Start | Pattern Rules | What It Affects | Configuration Details | Checkpoints vs .kilocodeignore | Troubleshooting
X: .kilocodeignore Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/customize/context/memory
T: null
D: Store useful project details that Kilo remembers across sessions
H: Memory | What memory stores | Enable memory | Automatic memory (auto-save) | Explicit memory | How memory is used | Command reference | Storage and maintenance | Privacy | Related features
X: Memory Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Customi
### https://kilo.ai/docs/customize/custom-instructions
T: null
D: Provide custom instructions to guide Kilo Code
H: Custom Instructions | What Are Custom Instructions? | Per-Agent Prompts | Instruction Files | Additional Instruction Sources | Legacy .kilocoderules Support | Related Features
X: Custom Instructions Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contrib
### https://kilo.ai/docs/customize/custom-modes
T: null
D: Create and configure custom agents in Kilo Code
H: Custom Modes | Why use custom agents? | Organization-managed agents | What&#x27;s Included in a Custom Agent? | Methods for Creating and Configuring Agents | Agent Property Reference | Configuration Precedence | Overriding Built-in Agents | Migration from VSCode Extension Modes | Restricting Agent File Access | Example Configurations | Troubleshooting
X: Custom Modes Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/customize/custom-rules
T: null
D: Define custom rules for Kilo Code behavior
H: Custom Rules | Overview | Rule Format | Rule Types | Rule Location | Managing Rules Through the UI | Rule Loading Order | Creating Custom Rules | Example Rules | Use Cases | Examples of Custom Rules | Best Practices
X: Custom Rules Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing C
### https://kilo.ai/docs/customize/custom-subagents
T: null
D: Create and configure custom subagents in Kilo Code&#x27;s CLI
H: Custom Subagents | What Are Subagents? | Agent Modes | Configuring Custom Subagents | Configuration Options | Using Custom Subagents | Inspecting delegated sessions in VS Code | Configuration Precedence | Examples | Overriding Built-in Agents | Related
X: Custom Subagents Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributi
### https://kilo.ai/docs/customize/marketplace
T: null
D: Install agents, skills, MCP servers, and plugins from the Kilo Marketplace
H: Marketplace | What you can install | Project or global | Files changed by installation | MCP security and permissions | Plugin security | Removing an item | Contributing
X: Marketplace Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Cu
### https://kilo.ai/docs/customize/prompt-engineering
T: null
D: Best practices for writing effective prompts
H: Prompt Engineering | General Principles | Thinking vs. Doing | Using Custom Instructions | Handling Ambiguity | Providing Feedback | Examples
X: Prompt Engineering Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/customize/skills
T: null
D: Extend Kilo Code capabilities with skills
H: Skills | What Are Agent Skills? | How Skills Work in Kilo Code | Skill Locations | Mode-Specific Skills | Priority and Overrides | When Skills Are Loaded | SKILL.md Format | Optional Bundled Resources | Shell commands in skills | Example: Creating a Skill | Finding Skills
X: Skills Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Customi
### https://kilo.ai/docs/customize/workflows
T: null
D: Create automated workflows with Kilo Code
H: Workflows | Creating Workflows | Common Workflow Patterns | Example: PR Submission Workflow
X: Workflows Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Cust
### https://kilo.ai/docs/desktop/features
T: null
D: Explore Kilo Desktop&#x27;s capabilities: notebooks, an in-app browser, terminal, git, local inference, environments, and files.
H: Features
X: Features Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Kilo 
### https://kilo.ai/docs/desktop/features/browser
T: null
D: Browse the web next to your chat, including pages the agent opens for you, in Kilo Desktop.
H: In-app browser | Pages the agent opens | Links from chat | Workspace HTML files | Browse on your own
X: In-app browser Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing
### https://kilo.ai/docs/desktop/features/environments
T: null
D: Create, import, and manage conda environments and their packages from Kilo Desktop.
H: Conda environments | Why conda? | Conda concepts | Use a conda environment in your work | Working with the agent | If installs fail | Browse your conda environments | Create a conda environment | Import from a file | Work with a conda environment&#x27;s packages | Choose a channel
X: Conda Environments Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contribu
### https://kilo.ai/docs/desktop/features/files
T: null
D: Browse and edit your workspace files — including rendered Markdown, Mermaid, and data tables — mention them in chat, and open file links from the agent&#x27;s responses in Kilo Desktop.
H: Files | Browse the workspace | Open and edit files | Mention files in chat | Open file links from responses | Open in another editor
X: Files Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Kilo Des
### https://kilo.ai/docs/desktop/features/git
T: null
D: Review your uncommitted changes, switch branches, and run sessions in a new or existing worktree, without leaving the chat in Kilo Desktop.
H: Git integration | Review changes | Commit, push, and open a pull request | Switch and create branches | Work locally or in a worktree | Set up git for a folder
X: Git integration Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/desktop/features/local-inference
T: null
D: Run models on your own machine with the local model server in Kilo Desktop.
H: Local inference | Set up a local model | Pick it in chat
X: Local inference Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/desktop/features/notebooks
T: null
D: Analyze data in interactive Python notebooks alongside your chat in Kilo Desktop.
H: Notebooks | Open a notebook | Work with cells | Edit with the agent | Environment and packages | Runtime status
X: Notebooks Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Kilo
### https://kilo.ai/docs/desktop/features/terminal
T: null
D: Run commands in an interactive shell scoped to your workspace in Kilo Desktop.
H: Terminal | Working with the agent | Work in multiple terminals | Select and copy | Keyboard shortcuts | Sessions that survive reloads
X: Terminal Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Kilo 
### https://kilo.ai/docs/desktop/installation
T: null
D: Install Kilo Desktop and complete first-time setup, including optional dependencies for git and local model features.
H: Installation | System requirements | Install the app | Optional dependencies | After installing
X: Installation Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing K
### https://kilo.ai/docs/desktop/overview
T: null
D: Kilo Desktop brings Kilo&#x27;s agents to your machine, uniting coding, notebooks, terminals, git, and local models all in one place.
H: Overview | What you can do | How it works | Where to go next
X: Overview Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Kilo 
### https://kilo.ai/docs/desktop/quickstart
T: null
D: Sign in, open a workspace, and start your first agentic session in Kilo Desktop.
H: Quickstart | Complete onboarding | Navigate the home screen | Chat with the agent | Work in tab groups
X: Quickstart Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Kil
### https://kilo.ai/docs/desktop/release-notes
T: null
D: New features, improvements, bug fixes, and security updates in each Kilo Desktop release.
H: Release notes | Kilo Desktop 0.1.15 | Kilo Desktop 0.1.14 | Kilo Desktop 0.1.13 | Kilo Desktop 0.1.12 | Kilo Desktop 0.1.11 | Kilo Desktop 0.1.10
X: Release notes Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing 
### https://kilo.ai/docs/desktop/settings/ai
T: null
D: Configure agent behavior, AI providers, and the local model server in Kilo Desktop.
H: AI settings | Agent behavior | AI providers | Local model server
X: AI settings Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributing Ki
### https://kilo.ai/docs/desktop/settings/general
T: null
D: Manage the app version, your account, appearance, notifications, conda environments, notebooks, privacy, and keyboard shortcuts in Kilo Desktop.
H: General settings | About | Account | Appearance | Notifications | Conda Environments | Notebooks | Privacy | Shortcuts
X: General settings Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributi
### https://kilo.ai/docs/desktop/troubleshooting
T: null
D: Fixes for common Kilo Desktop issues, including the local server, git, workspaces, and local models.
H: Troubleshooting | The app can&#x27;t reach the agent | The Changes tab or branch switcher isn&#x27;t available | A workspace shows a warning icon | The agent asks you to sign in | A local model isn&#x27;t listed in a chat | The agent can&#x27;t find a file in a gitignored folder
X: Troubleshooting Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributin
### https://kilo.ai/docs/desktop/what-you-can-ask
T: null
D: Example prompts for Kilo Desktop, mapped to the capability each one uses.
H: What you can ask | Tips
X: What you can ask Kilo Code DOCS GitHub Sign in Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure Kilo Gateway Kilo Desktop Beta Contributing Contributing Help Home Get Started Code with AI Customize Collaborate Automate Deploy &amp; Secure AI Gateway Kilo Desktop Contributi

### https://kilo.ai/docs
T: null
D: Build, ship, and iterate faster with the most popular open source coding agent.
H1: Kilo Documentation
### https://kilo.ai/docs/ai-providers
T: null
D: Configure and connect different AI model providers to Kilo Code
H1: AI Providers
### https://kilo.ai/docs/ai-providers/alibaba
T: null
D: Build, ship, and iterate faster with the most popular open source coding agent.
H1: Using Alibaba Cloud With Kilo Code
### https://kilo.ai/docs/ai-providers/anaconda-desktop
T: null
D: Connect Kilo Code to a local Anaconda Desktop text-generation model server from the TUI or VS Code.
H1: Using Anaconda Desktop With Kilo Code
### https://kilo.ai/docs/ai-providers/anthropic
T: null
D: Configure Anthropic&#x27;s Claude models in Kilo Code. Guide to getting an API key, setting up Claude Sonnet and Opus in VS Code and the CLI.
H1: Using Anthropic With Kilo Code
### https://kilo.ai/docs/ai-providers/atomic-chat
T: null
D: Run local models in Kilo Code via Atomic Chat&#x27;s OpenAI-compatible API. Setup for VS Code and the CLI.
H1: Using Atomic Chat With Kilo Code
### https://kilo.ai/docs/ai-providers/bedrock
T: null
D: Configure AWS Bedrock in Kilo Code to access Claude, Llama, and other foundation models through your AWS account.
H1: Using AWS Bedrock With Kilo Code
### https://kilo.ai/docs/ai-providers/cerebras
T: null
D: Run Llama and Qwen models at record-breaking speeds by configuring Cerebras in Kilo Code. Setup for VS Code and the CLI.
H1: Using Cerebras With Kilo Code
### https://kilo.ai/docs/ai-providers/chutes-ai
T: null
D: Access open-source AI models through Chutes AI in Kilo Code. Setup guide for getting an API key and configuring models.
H1: Using Chutes AI With Kilo Code
### https://kilo.ai/docs/ai-providers/cloudflare
T: null
D: Build, ship, and iterate faster with the most popular open source coding agent.
H1: Using Cloudflare With Kilo Code
### https://kilo.ai/docs/ai-providers/daoxe
T: null
D: Connect Kilo Code to DaoXE&#x27;s multi-model API gateway with an API key and an account-available model ID.
H1: Using DaoXE With Kilo Code
### https://kilo.ai/docs/ai-providers/deepseek
T: null
D: Connect DeepSeek&#x27;s reasoning and coding models to Kilo Code. Setup guide for DeepSeek-V3 and DeepSeek-R1 in VS Code and the CLI.
H1: Using DeepSeek With Kilo Code
### https://kilo.ai/docs/ai-providers/edenai
T: null
D: Configure Eden AI in Kilo Code, an EU-based OpenAI-compatible gateway, for one API key across many vendors and an EU endpoint for data residency.
H1: Using Eden AI With Kilo Code
### https://kilo.ai/docs/ai-providers/fireworks
T: null
D: Run open-source and proprietary models on Fireworks AI&#x27;s high-performance platform in Kilo Code. Setup guide for VS Code and the CLI.
H1: Using Fireworks AI With Kilo Code
### https://kilo.ai/docs/ai-providers/gemini
T: null
D: Connect Google Gemini models to Kilo Code. Guide to getting an API key from Google AI Studio and configuring Gemini in VS Code and the CLI.
H1: Using Google Gemini With Kilo Code
### https://kilo.ai/docs/ai-providers/gmicloud
T: null
D: Configure GMI Cloud in Kilo Code. Built-in OpenAI-compatible provider with one API key for a catalog of open and frontier models.
H1: Using GMI Cloud With Kilo Code
### https://kilo.ai/docs/ai-providers/groq
T: null
D: Run Llama, Mixtral, and other models at ultra-low latency by configuring Groq in Kilo Code. Setup guide for VS Code and the CLI.
H1: Using Groq With Kilo Code
### https://kilo.ai/docs/ai-providers/inception
T: null
D: Connect Inception Labs&#x27; Mercury diffusion LLMs to Kilo Code for ultra-fast code generation. Setup guide for VS Code and the CLI.
H1: Using Inception With Kilo Code
### https://kilo.ai/docs/ai-providers/kilocode
T: null
D: The built-in Kilo Code provider gives you access to top AI models with one account. Setup and sign-in guide.
H1: Using Kilo Code&#x27;s Built-in Provider
### https://kilo.ai/docs/ai-providers/lmstudio
T: null
D: Run local LLMs in Kilo Code by connecting to LM Studio&#x27;s OpenAI-compatible server. Setup guide for VS Code and the CLI.
H1: Using LM Studio With Kilo Code
### https://kilo.ai/docs/ai-providers/minimax
T: null
D: Configure MiniMax AI models in Kilo Code. Guide to getting an API key and setup for VS Code and the CLI.
H1: Using MiniMax With Kilo Code
### https://kilo.ai/docs/ai-providers/mistral
T: null
D: Configure Mistral AI models, including Codestral, in Kilo Code. Guide to getting an API key and setup for VS Code and the CLI.
H1: Using Mistral AI With Kilo Code
### https://kilo.ai/docs/ai-providers/mixlayer
T: null
D: Run open models like GLM and Qwen on Mixlayer&#x27;s OpenAI-compatible API in Kilo Code. Setup guide for VS Code and the CLI.
H1: Using Mixlayer With Kilo Code
### https://kilo.ai/docs/ai-providers/moonshot
T: null
D: Connect Moonshot&#x27;s Kimi models to Kilo Code. Setup guide for getting an API key and selecting models in VS Code and the CLI.
H1: Using Moonshot.ai With Kilo Code
### https://kilo.ai/docs/ai-providers/nebius
T: null
D: Configure Nebius Token Factory in Kilo Code — locally with your own API key, shared across your team via BYOK in Kilo Cloud, or org-wide through the Kilo Gateway.
H1: Using Nebius Token Factory With Kilo Code
### https://kilo.ai/docs/ai-providers/ollama
T: null
D: Run local AI models with Ollama in Kilo Code for offline, private coding. Setup guide for VS Code and the CLI.
H1: Using Ollama With Kilo Code
### https://kilo.ai/docs/ai-providers/openai
T: null
D: Connect the official OpenAI API to Kilo Code. Step-by-step guide to creating an API key and configuring GPT models in VS Code and the CLI.
H1: Using OpenAI With Kilo Code
### https://kilo.ai/docs/ai-providers/openai-chatgpt-plus-pro
T: null
D: Sign in to Kilo with ChatGPT on Go, Plus, or Pro, connect your subscription through BYOK, and see those requests in Usage. Learn how setup, limits, and billing work.
H1: Using ChatGPT subscriptions with Kilo Code
### https://kilo.ai/docs/ai-providers/openai-compatible
T: null
D: Connect OpenAI-compatible API endpoints like Together AI, Perplexity, and self-hosted servers.
H1: Using OpenAI Compatible Providers With Kilo Code
### https://kilo.ai/docs/ai-providers/openrouter
T: null
D: Access hundreds of AI models through a single API by configuring OpenRouter in Kilo Code. Setup guide for VS Code and the CLI.
H1: Using OpenRouter With Kilo Code
### https://kilo.ai/docs/ai-providers/ovhcloud
T: null
D: Connect OVHcloud&#x27;s European AI Endpoints to Kilo Code for sovereign, GDPR-compliant model access. Setup guide for VS Code and the CLI.
H1: Using OVHcloud AI Endpoints with Kilo Code
### https://kilo.ai/docs/ai-providers/poolside
T: null
D: Connect Poolside models to Kilo Code. Guide to getting a Poolside Platform API key and setting up the built-in Poolside provider in VS Code and the CLI.
H1: Using Poolside With Kilo Code
### https://kilo.ai/docs/ai-providers/requesty
T: null
D: Route AI model requests through Requesty in Kilo Code for cost optimization and access to multiple providers from one API key.
H1: Using Requesty With Kilo Code
### https://kilo.ai/docs/ai-providers/sap-ai-core
T: null
D: Connect SAP AI Core to Kilo Code to use enterprise foundation models from your SAP BTP account. Setup and authentication guide.
H1: Using SAP AI Core With Kilo Code
### https://kilo.ai/docs/ai-providers/synthetic
T: null
D: Access open-source AI models through Synthetic in Kilo Code. Setup guide for getting an API key and configuring models.
H1: Using Synthetic With Kilo Code
### https://kilo.ai/docs/ai-providers/trustedrouter
T: null
D: Configure TrustedRouter in Kilo Code through its OpenAI-compatible API for attested routing, zero-data-retention routing, and encrypted model routes.
H1: Using TrustedRouter With Kilo Code
### https://kilo.ai/docs/ai-providers/unbound
T: null
D: Access Claude, GPT, and other leading models through the Unbound proxy in Kilo Code. Setup guide for VS Code and the CLI.
H1: Using Unbound With Kilo Code
### https://kilo.ai/docs/ai-providers/v0
T: null
D: Connect Vercel&#x27;s v0 models to Kilo Code for UI-focused code generation. Setup guide for VS Code and the CLI.
H1: Using v0 With Kilo Code
### https://kilo.ai/docs/ai-providers/venice
T: null
D: Build, ship, and iterate faster with the most popular open source coding agent.
H1: Using Venice AI With Kilo Code
### https://kilo.ai/docs/ai-providers/vercel-ai-gateway
T: null
D: Configure the Vercel AI Gateway in Kilo Code to robustly access 100+ language models from various providers through a centralized interface.
H1: Using Vercel AI Gateway With Kilo Code
### https://kilo.ai/docs/ai-providers/vertex
T: null
D: Connect Google Cloud Vertex AI to Kilo Code to use Claude, Gemini, and other models through your GCP account.
H1: Using GCP Vertex AI With Kilo Code
### https://kilo.ai/docs/ai-providers/xai
T: null
D: Connect xAI&#x27;s Grok models to Kilo Code. Use a SuperGrok or X Premium subscription via OAuth or a paid API key. Guide to setup in VS Code and the CLI.
H1: Using xAI (Grok) With Kilo Code
### https://kilo.ai/docs/ai-providers/zenmux
T: null
D: Access OpenAI, Anthropic, Google, and other AI models through ZenMux in Kilo Code with automatic routing and cost optimization.
H1: Using ZenMux With Kilo Code
### https://kilo.ai/docs/contributing
T: null
D: Contribute to Kilo Code
H1: Contributing Overview
### https://kilo.ai/docs/contributing/architecture
T: null
D: Overview of the Kilo Code platform architecture
H1: Architecture Overview
### https://kilo.ai/docs/contributing/architecture/automation-services
T: null
D: Architecture of Kilo Cloud automation services that dispatch scoped work
H1: Automation Services Architecture
### https://kilo.ai/docs/contributing/architecture/cli-runtime
T: null
D: Architecture of the Kilo CLI runtime, daemon, server, persistence, SDK, and indexing
H1: CLI Runtime Architecture
### https://kilo.ai/docs/contributing/architecture/cloud-platform
T: null
D: Architecture overview for Kilo Cloud services and hosted runtimes
H1: Cloud Platform Architecture
### https://kilo.ai/docs/contributing/architecture/cloud-security
T: null
D: Security architecture overview for Kilo Cloud
H1: Kilo Cloud Security Architecture
### https://kilo.ai/docs/contributing/architecture/config-schema
T: null
D: How CLI runtime config and editor-facing JSON Schema stay aligned
H1: CLI Config Schema
### https://kilo.ai/docs/contributing/architecture/development-patterns
T: null
D: Contributor patterns for Kilo architecture implementation and fork maintenance
H1: Development Patterns
### https://kilo.ai/docs/contributing/architecture/jetbrains-plugin
T: null
D: Architecture of the Kilo JetBrains split-mode plugin
H1: JetBrains Plugin Architecture
### https://kilo.ai/docs/contributing/architecture/vscode-extension
T: null
D: Architecture of the Kilo VS Code extension and Agent Manager
H1: VS Code Extension Architecture
### https://kilo.ai/docs/contributing/development-environment
T: null
D: Set up your development environment for contributing
H1: Development Environment
### https://kilo.ai/docs/contributing/ecosystem
T: null
D: Build, ship, and iterate faster with the most popular open source coding agent.
H1: Building for the Kilo Ecosystem
### https://kilo.ai/docs/contributing/features
T: null
D: Design proposals and roadmaps for Kilo Code features
H1: Feature Proposals
### https://kilo.ai/docs/contributing/features/agent-observability
T: null
D: Current observability capabilities and roadmap for agentic coding systems
H1: Agent Observability
### https://kilo.ai/docs/contributing/features/benchmarking
T: null
D: Current evaluation evidence and roadmap for benchmarking Kilo Code
H1: Benchmarking
### https://kilo.ai/docs/contributing/features/enterprise-mcp-controls
T: null
D: Proposal for organization-managed MCP controls
H1: Enterprise MCP Controls
### https://kilo.ai/docs/contributing/features/onboarding-improvements
T: null
D: Partial roadmap for onboarding and engagement improvements
H1: Onboarding Improvements

Reasoning highlights: automate/* is the automation contract (Agent Manager, code reviews on GitHub/GitLab, MCP: overview/vs-api/transports/CLI/IDE, tools incl. semantic_search, shell integration, CLI plugins, integrations for GitHub/GitLab/DoltHub). gateway/* is the inference contract (unified API, OpenAI-compatible, BYOK, org tokens, streaming, usage/billing). getting-started/settings/keep-awake is ONLY anti-sleep for local runs — it is not server-side always-on (evidence for the 70% ceiling). getting-started/using-kilo-for-free + cost-controls + rate-limits = the free-lane operating manual. deploy-secure = app deploy + Dependabot/Security Agent. customize/* (15) + collaborate/* (19) + desktop/* (16) = editor/team/desktop config. code-with-ai/* (46) = per-surface usage. contributing/* (17) = dev docs. ai-providers/* (42) = per-provider wiring (table below; BYOK breadth is the model-freedom proof).

Provider wiring table (42 ai-providers docs):

| URL | Title |
|---|---|
| /docs/ai-providers/alibaba | null |
| /docs/ai-providers/anaconda-desktop | null |
| /docs/ai-providers/anthropic | null |
| /docs/ai-providers/atomic-chat | null |
| /docs/ai-providers/bedrock | null |
| /docs/ai-providers/cerebras | null |
| /docs/ai-providers/chutes-ai | null |
| /docs/ai-providers/cloudflare | null |
| /docs/ai-providers/daoxe | null |
| /docs/ai-providers/deepseek | null |
| /docs/ai-providers/edenai | null |
| /docs/ai-providers/fireworks | null |
| /docs/ai-providers/gemini | null |
| /docs/ai-providers/gmicloud | null |
| /docs/ai-providers/groq | null |
| /docs/ai-providers/inception | null |
| /docs/ai-providers/kilocode | null |
| /docs/ai-providers/lmstudio | null |
| /docs/ai-providers/minimax | null |
| /docs/ai-providers/mistral | null |
| /docs/ai-providers/mixlayer | null |
| /docs/ai-providers/moonshot | null |
| /docs/ai-providers/nebius | null |
| /docs/ai-providers/ollama | null |
| /docs/ai-providers/openai | null |
| /docs/ai-providers/openai-chatgpt-plus-pro | null |
| /docs/ai-providers/openai-compatible | null |
| /docs/ai-providers/openrouter | null |
| /docs/ai-providers/ovhcloud | null |
| /docs/ai-providers/poolside | null |
| /docs/ai-providers/requesty | null |
| /docs/ai-providers/sap-ai-core | null |
| /docs/ai-providers/synthetic | null |
| /docs/ai-providers/trustedrouter | null |
| /docs/ai-providers/unbound | null |
| /docs/ai-providers/v0 | null |
| /docs/ai-providers/venice | null |
| /docs/ai-providers/vercel-ai-gateway | null |
| /docs/ai-providers/vertex | null |
| /docs/ai-providers/xai | null |
| /docs/ai-providers/zenmux | null |

Contributor docs (17):

| URL | Title |
|---|---|
| /docs/contributing | null |
| /docs/contributing/architecture | null |
| /docs/contributing/architecture/automation-services | null |
| /docs/contributing/architecture/cli-runtime | null |
| /docs/contributing/architecture/cloud-platform | null |
| /docs/contributing/architecture/cloud-security | null |
| /docs/contributing/architecture/config-schema | null |
| /docs/contributing/architecture/development-patterns | null |
| /docs/contributing/architecture/jetbrains-plugin | null |
| /docs/contributing/architecture/vscode-extension | null |
| /docs/contributing/development-environment | null |
| /docs/contributing/ecosystem | null |
| /docs/contributing/features | null |
| /docs/contributing/features/agent-observability | null |
| /docs/contributing/features/benchmarking | null |
| /docs/contributing/features/enterprise-mcp-controls | null |
| /docs/contributing/features/onboarding-improvements | null |

## 5. COMPARISONS / ARTICLES / EVENTS (111)

| URL | Title |
|---|---|
| /kilo-code/alternatives | Kilo Code Alternatives — Cursor, Copilot, Windsurf &amp; More Compared |
| /kilo-code/vs/cursor | Kilo Code vs Cursor: AI Coding Platform Comparison 2026 |
| /kilo-code/vs/copilot | GitHub Copilot vs Kilo Code: Full Product Comparison 2026 |
| /kilo-code/vs/cline | Kilo Code vs Cline: Open-Source Coding Agent Comparison 2026 |
| /kilo-code/vs/windsurf | Kilo Code vs Devin Desktop (Formerly Windsurf) 2026 |
| /kilo-code/vs/roo-code | Kilo Code vs Roo Code After Discontinuation: Migration Guide 2026 |
| /kilo-code/vs/continue-dev | Kilo Code vs Continue After Discontinuation: Comparison 2026 |
| /kilo-code/vs/gemini-code-assist | Kilo Code vs Gemini Code Assist: IDE Comparison 2026 |
| /kilo-code/vs/codex | Kilo Code vs OpenAI Codex: Desktop, IDE, CLI and Cloud 2026 |
| /kilo-code/vs/claude-code | Kilo Code vs Claude Code: Models, Desktop, IDEs and Pricing |
| /kilo-code/vs/roomote | Kilo Code vs Roomote: Local Clients and Cloud Agents |
| /kilo-code/vs/tabnine | Kilo Code vs Tabnine: Model Choice and Enterprise Deployment |
| /kilo-code/vs/augment-code | Kilo Code vs Augment Code: Cosmos, Models and Team Pricing |
| /kilo-code/vs/lovable | Lovable vs Kilo Code - From Prototype to Production, No Export Required |
| /kilo-code/vs/replit | Why developers are switching from Replit to Kilo Code |
| /kilo-code/vs/antigravity | Kilo - Google Antigravity Alternative - Open Source AI Coding Agent |
| /kilo-code/vs/warp | Warp vs Kilo Code — IDE Agent vs Terminal-First ADE |
| /kilo-code/best-ai-coding-assistant | Kilo - Best AI for Coding in 2026 - Compare Top AI Coding Assistants |
| /kilo-code/vs/blackbox | Blackbox AI vs Kilo Code - AI Coding Assistant Comparison |
| /kilo-code/vs/coderabbit | CodeRabbit Alternative: Kilo Code Reviews vs CodeRabbit |
| /kilo-code/vs/graphite | Kilo vs Graphite - AI Code Review Comparison |
| /kilo-code/vs/ampcode | Kilo vs Amp: IDEs, Desktop, Agents &amp; Pricing |
| /kilo-code/vs/intellij | Kilo Code for IntelliJ — Open-Source Alternative to JetBrains AI |
| /enterprise/vs/claude-code | Claude Code Enterprise Alternative: Model Freedom | Kilo |
| /enterprise/vs/openai-codex | OpenAI Codex Enterprise Alternative: No Lock-In | Kilo |
| /enterprise/vs/cursor | Cursor Enterprise Alternative: Models &amp; IDE Choice | Kilo |
| /enterprise/vs/windsurf | Windsurf Enterprise Alternative: BYOK &amp; Model Freedom | Kilo |
| /enterprise/vs/tabnine | Tabnine Enterprise Alternative: Model Freedom | Kilo Code |
| /enterprise/vs/kiro | Kiro Enterprise Alternative: BYOK &amp; Local Models | Kilo |
| /enterprise/vs/opencode | OpenCode Enterprise Alternative: Governance at Scale | Kilo |
| /autocomplete/codeium | Kilo Autocomplete vs Codeium — Feature Comparison |
| /autocomplete/copilot | Kilo Autocomplete vs GitHub Copilot — Feature Comparison |
| /autocomplete/cursor | Kilo Autocomplete vs Cursor Tab — Feature Comparison |
| /cli/claude | Kilo CLI vs Claude Code — No Rate Limits, 500+ Models |
| /cli/codex | Kilo CLI vs OpenAI Codex CLI - Freedom From the OpenAI Ecosystem |
| /cli/aider | Kilo CLI vs Aider - The Next Generation of Model-Agnostic Coding |
| /cli/gemini | Kilo CLI vs Gemini CLI - More Models, Same Great Price |
| /cli/copilot | Kilo CLI vs GitHub Copilot CLI - Open, Multi-Model, No Lock-In |
| /cli/opencode | Kilo CLI vs OpenCode CLI: Comparison, Pricing &amp; Features |
| /cli/antigravity | Kilo Code vs Google Antigravity: CLI, Models &amp; Pricing |
| /cli/continue-dev | Continue Dev Alternative: Kilo Code Comparison |
| /kilo-code/vs/grok | Grok Build CLI Alternative - Kilo CLI vs xAI |
| /compare | AI Coding Tool Comparisons — Head-to-Head Reviews | Kilo |
| /compare/claude-code-alternatives | Best Claude Code Alternatives in 2026 | Kilo |
| /compare/grok-build-cli-alternatives | Best Grok Build CLI Alternatives in 2026 | Kilo |
| /compare/cursor-vs-claude-code | Cursor vs Claude Code (2026): Honest Comparison | Kilo |
| /compare/opencode-vs-claude-code | OpenCode vs Claude Code: Pricing, Features &amp; Verdict (2026) | Kilo |
| /compare/opencode-zen-vs-kilo-gateway | OpenCode Zen vs Kilo Gateway | AI Model Routing Comparison |
| /compare/roo-vs-cline-vs-kilo | Roo Code vs Cline vs Kilo Code - Three-Way Comparison 2026 |
| /compare/roo-code-shutdown-roomote | Kilo - Roo Code Shut Down: Best Alternatives to Roomote |
| /compare/cursor-vs-copilot | Cursor vs GitHub Copilot vs Kilo Code (2026) |
| /compare/windsurf-vs-cursor | Windsurf vs Cursor vs Kilo Code (2026) |
| /compare/aider-vs-claude-code | Aider vs Claude Code vs Kilo Code (2026) |
| /compare/kilo-app-vs-cursor-ios | Kilo Code App vs Cursor Mobile App (2026): Honest Comparison |
| /compare/kilo-app-vs-kiro | Kilo Code App vs Kiro Mobile App (2026): Honest Comparison |
| /compare/kilo-app-vs-claude-code-dispatch | Kilo Code App vs Claude Code Mobile (2026): Compared |
| /reviews/greptile | Kilo Code Reviews vs Greptile - AI Code Review Comparison |
| /reviews/graphite | Graphite vs Kilo Code Reviews - AI Code Reviews. Your Model. Your Rules |

| URL | Title |
|---|---|
| /articles | Kilo - Knowledge Base |
| /articles/how-we-made-kilo-faster | How We Made Kilo Faster |
| /articles/best-programming-ai | Kilo - Best Programming AI in 2026: Top Models Ranked |
| /articles/best-cli-coding-agents | Best CLI AI Tools in 2026: CLI Coding Agents Compared |
| /articles/cursor-to-kilo-migration-guide | Cursor to Kilo Code Migration Guide (2026) | Kilo |
| /articles/best-ai-coding-tools-for-enterprise | Best AI Coding Tools for Enterprise in 2026 | Kilo |
| /articles/claude-code-to-kilo-code-migration-guide | Claude Code to Kilo Code Migration Guide (2026) | Kilo |
| /articles/open-weight-models-code-review | State of Open-Weight Models for AI Code Review Workflows |
| /articles/ai-gateways-and-model-routers | AI Gateways and Model Routers: What They Are and Why They Matter | Kilo |
| /articles/best-ai-browser-extensions | Best AI Browser Extensions 2026: Kilo Code vs Claude, Gemini &amp; ChatGPT |
| /articles/claude-code-alternatives-for-terminal | Best Claude Code Alternatives for Terminal Coding in 2026 |
| /articles/top-ai-coding-agents | Best AI Coding Agents in 2026: Compare by Use Case &amp; Price |
| /articles/ai-coding-spend-infrastructure | How to Cut AI Coding Spend in Half | Kilo Code |
| /articles/best-ai-subscription-for-coding | Best AI Subscription for Coding in 2026: How to Choose |
| /articles/coding-agents-for-vscode | Best Coding Agents for VS Code in 2026: Compared &amp; Reviewed |
| /articles/open-source-github-copilot-alternatives | 6 Open-Source GitHub Copilot Alternatives for 2026 (Model-agnostic, BYOK) | Kilo |
| /articles/reduce-ai-coding-costs | How to Reduce AI Coding Costs for Engineering Teams | Kilo |
| /articles/coding-agents-for-jetbrains | Best AI Coding Agents for JetBrains IDEs 2026 |
| /articles/what-is-loop-engineering | What Is Loop Engineering? AI Feedback Loops | Kilo |
| /articles/cancel-github-copilot-subscription | Cancel GitHub Copilot Subscription: Steps &amp; Alternative |
| /articles/github-copilot-to-kilo-migration-guide | How to Move from GitHub Copilot to Kilo Code | Kilo |
| /articles/kilo-code-reviews | Kilo Code Reviews 2026: Real Developer Feedback Summarized |
| /articles/best-cli-coding-agents | Best CLI AI Tools in 2026: CLI Coding Agents Compared |
| /articles/open-source-cursor-alternatives | 7 Open-Source Cursor Alternatives for 2026 (BYOK, MCP, Agent Workflows) |
| /articles/windsurf-to-kilo-migration-guide | Windsurf to Kilo Code Migration Guide (2026) | Kilo |
| /articles/ai-coding-assistant-buyers-guide | AI Coding Assistant Buyer&#x27;s Guide 2026 | Kilo |
| /articles/scale-agency-ai-agents | How to scale an agency with AI agents for client ops and data entry | Kilo |
| /articles/roo-to-kilo-migration-guide | Roo Code to Kilo Code Migration Guide (2026) | Kilo |
| /articles/claude-cowork-alternatives | Best Claude Cowork alternatives for always-on AI agents (2026 guide) | Kilo |
| /articles/beyond-autocomplete | Beyond Autocomplete: Best Agentic Coding Workflow in 2026 | Kilo |
| /articles/what-is-an-ai-coding-agent | What Is an AI Coding Agent? | Kilo |

| URL | Title |
|---|---|
| /events | Kilo - Events |
| /events/claude-opus-45-and-autocomplete-overview-and-qa | Kilo - Claude Opus 4.5 &amp; Autocomplete: An Overview and Q&amp;A |
| /events/scaling-ai-coding-from-experiment-to-teams-workflow | Kilo - Scaling AI coding from experiment to integrated into engineering teams workflow |
| /events/parallel-agents | Parallel Agents in Kilo: Engineer Walkthrough |
| /events/making-the-switch-from-cursor-to-kilo | Making the switch from Cursor to Kilo |
| /events/live-qa-using-ai-coding-tools-in-your-team | Kilo - Live Q&amp;A: using AI coding tools in your team |
| /events/inside-kilo | Inside Kilo: Fundraising, New Features, and a Word from CEO Scott Breitenother |
| /events/inside-claude-opus-45-live-with-anthropics-ai-applied-team | Kilo - Inside Claude Opus 4.5: Live with Anthropic&#x27;s Applied AI Team |
| /events/copilot-vs-kilo-code | GitHub Copilot vs. Kilo Code: Why Developers Are Making the Switch |
| /events/gemini-3-pro-preview-an-overview-and-qa | Kilo - Gemini 3 Pro Preview: An overview and live Q&amp;A |
| /events/mistral-interview | Kilo - Devstral 2 Deep Dive: Live with the Mistral Team |
| /events/clawcon-miami | ClawCon Miami presented by Kilo Code |
| /events/openclaw-hackathon-amsterdam | OpenClaw Hackathon @ AI House by Antler | Prosus | Picnic | Fini | Langwatch | Orq | Kilo | MLOps | AI Foundry |
| /events/live-q-and-a-weekly-product-onboarding-with-kilo-team | Live Q&amp;A: Weekly Product Onboarding with Kilo Team |
| /events/the-kilo-show-live-2-6-26 | The Kilo Show, Live - 2.6.26 |
| /events/kilo-is-open-source | Kilo is Open Source. |
| /events/the-kilo-show-live-1-22 | The Kilo Show, Live - 1/22 |
| /events/opus-vs-sonnet-kilo-live-with-anthropic | Opus vs Sonnet: Kilo Live with Anthropic&#x27;s Applied AI Team |
| /events/kilo-emergency-broadcast-dont-panic | Kilo Emergency Broadcast - Don&#x27;t Panic |
| /events/the-kilo-show-live-1-9 | The Kilo Show, Live |
| /events/kilo-cli-deep-dive | Kilo CLI - Deep Dive and Open Discussion |
| /events/ai-code-security-discussion | Kilo - Discussion: AI Code That Doesn&#x27;t Get You Hacked |

Reasoning: comparisons are migration SEO (Cursor, Copilot, Cline, Windsurf, Roo, Claude Code, etc.) — no product facts beyond positioning. Articles of operational value: reduce-ai-coding-costs, ai-gateways-and-model-routers, open-weight-models-code-review, best-cli-coding-agents. Events are recordings/webinars (ClawCon Miami + OpenClaw hackathon Amsterdam = community aliveness of OpenClaw itself, distinct from KiloClaw the product).

## 6. MODEL CATALOG (159 pages)

| slug | title | free-slug |
|---|---|---|
| google-gemini-3-1-pro-preview | Google: Gemini 3.1 Pro Preview Coding Benchmark | Kilo Code | - |
| z-ai-glm-5 | Z.ai: GLM 5 Coding Benchmark | Kilo Code | - |
| xiaomi-mimo-v2-5-pro | Xiaomi: MiMo-V2.5-Pro Coding Benchmark | Kilo Code | - |
| x-ai-grok-4-6 | SpaceXAI: Grok 4.6 Coding Benchmark | Kilo Code | - |
| x-ai-grok-4-7 | SpaceXAI: Grok 4.7 Coding Benchmark | Kilo Code | - |
| tencent-hy3 | Tencent: Hy3 Coding Benchmark | Kilo Code | - |
| x-ai-grok-build-0-1 | SpaceXAI: Grok Build 0.1 Coding Benchmark | Kilo Code | - |
| tencent-hy3-preview-free | Tencent: Hy3 preview (free) Coding Benchmark | Kilo Code | yes |
| qwen-qwen3-8b | Qwen: Qwen3 8B (retires Oct 9) Coding Benchmark | Kilo Code | - |
| qwen-qwen3-5-397b-a17b | Qwen: Qwen3.5 397B A17B Coding Benchmark | Kilo Code | - |
| openai-gpt-5-nano | OpenAI: GPT-5 Nano Coding Benchmark | Kilo Code | - |
| poolside-laguna-s-2-1 | Poolside: Laguna S 2.1 (retires Oct 31) Coding Benchmark | Kilo Code | - |
| tencent-hy3-free | Tencent: Hy3 (free) Coding Benchmark | Kilo Code | yes |
| openai-gpt-5-6-terra | OpenAI: GPT-5.6 Terra Coding Benchmark | Kilo Code | - |
| openai-gpt-5-4 | OpenAI: GPT-5.4 Coding Benchmark | Kilo Code | - |
| openai-gpt-5-2-codex | OpenAI: GPT-5.2-Codex Coding Benchmark | Kilo Code | - |
| minimax-minimax-m3-free | MiniMax: MiniMax M3 (free) Coding Benchmark | Kilo Code | yes |
| openai-gpt-5-3-codex | OpenAI: GPT-5.3-Codex Coding Benchmark | Kilo Code | - |
| z-ai-glm-4-5 | Z.ai: GLM 4.5 Coding Benchmark | Kilo Code | - |
| meta-llama-llama-3-1-8b-instruct | Meta: Llama 3.1 8B Instruct Coding Benchmark | Kilo Code | - |
| inclusionai-ling-3-0-flash-free | Ling-3.0-flash (free) Coding Benchmark | Kilo Code | yes |
| openai-gpt-6-luna | OpenAI: GPT-6 Luna Coding Benchmark | Kilo Code | - |
| openai-gpt-4 | OpenAI: GPT-4 ($$$$) Coding Benchmark | Kilo Code | - |
| openai-gpt-3-5-turbo | OpenAI: GPT-3.5 Turbo Coding Benchmark | Kilo Code | - |
| z-ai-glm-4-7 | Z.ai: GLM 4.7 Coding Benchmark | Kilo Code | - |
| nvidia/nemotron-3-5-lightning | NVIDIA: Nemotron 3.5 Lightning (free) Coding Benchmark | Kilo Code | - |
| stepfun-step-3-5-flash | StepFun: Step 3.5 Flash Coding Benchmark | Kilo Code | - |
| qwen-qwen3-coder | Qwen: Qwen3 Coder 480B A35B Coding Benchmark | Kilo Code | - |
| minimax-minimax-m2-7-free | MiniMax: MiniMax M2.7 (free) Coding Benchmark | Kilo Code | yes |
| microsoft-phi-4 | Microsoft: Phi 4 Coding Benchmark | Kilo Code | - |
| nex-agi-nex-n2-5-pro-free | Nex AGI: Nex-N2.5-Pro (free) Coding Benchmark | Kilo Code | yes |
| openai-gpt-5-1 | OpenAI: GPT-5.1 Coding Benchmark | Kilo Code | - |
| moonshotai-kimi-k2-6 | MoonshotAI: Kimi K2.6 Coding Benchmark | Kilo Code | - |
| thinkingmachines-inkling | Thinking Machines: Inkling Coding Benchmark | Kilo Code | - |
| meta-muse-spark-1-2 | Meta: Muse Spark 1.2 Coding Benchmark | Kilo Code | - |
| qwen-qwen3-5-27b | Qwen: Qwen3.5-27B Coding Benchmark | Kilo Code | - |
| moonshotai-kimi-k2-thinking | MoonshotAI: Kimi K2 Thinking Coding Benchmark | Kilo Code | - |
| google-gemini-3-flash-preview | Google: Gemini 3 Flash Preview Coding Benchmark | Kilo Code | - |
| qwen-qwen3-5-122b-a10b | Qwen: Qwen3.5-122B-A10B Coding Benchmark | Kilo Code | - |
| qwen-qwen3-6-plus | Qwen: Qwen3.6 Plus Coding Benchmark | Kilo Code | - |
| nvidia-nemotron-3-super-120b-a12b-free | NVIDIA: Nemotron 3 Super (free) Coding Benchmark | Kilo Code | yes |
| google-gemini-3-6-flash | Google: Gemini 3.6 Flash Coding Benchmark | Kilo Code | - |
| google-gemini-2-5-pro | Google: Gemini 2.5 Pro Coding Benchmark | Kilo Code | - |
| minimax-minimax-m2 | MiniMax: MiniMax M2 (retires Nov 5) Coding Benchmark | Kilo Code | - |
| google-gemma-4-26b-a4b-it-free | Google: Gemma 4 26B A4B  (free) Coding Benchmark | Kilo Code | yes |
| z-ai-glm-4-7-flash | Z.ai: GLM 4.7 Flash Coding Benchmark | Kilo Code | - |
| openai-o4-mini | OpenAI: o4 Mini Coding Benchmark | Kilo Code | - |
| kwaipilot-kat-coder-pro-v2-5 | Kwaipilot: KAT-Coder-Pro V2.5 Coding Benchmark | Kilo Code | - |
| x-ai-grok-4-5 | SpaceXAI: Grok 4.5 Coding Benchmark | Kilo Code | - |
| anthropic-claude-opus-5-5 | Anthropic: Claude Opus 5.5 Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-v3-2-exp | DeepSeek: DeepSeek V3.2 Exp Coding Benchmark | Kilo Code | - |
| nvidia-nemotron-3-5-super-vl-free | NVIDIA: Nemotron 3.5 Super VL (free) Coding Benchmark | Kilo Code | yes |
| google-gemma-3-12b-it | Google: Gemma 3 12B Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-r1-0528 | DeepSeek: R1 0528 Coding Benchmark | Kilo Code | - |
| anthropic-claude-sonnet-4-6 | Anthropic: Claude Sonnet 4.6 Coding Benchmark | Kilo Code | - |
| z-ai-glm-5-turbo | Z.ai: GLM 5 Turbo Coding Benchmark | Kilo Code | - |
| xiaomi-mimo-v2-5 | Xiaomi: MiMo-V2.5 Coding Benchmark | Kilo Code | - |
| moonshotai-kimi-k2-5 | MoonshotAI: Kimi K2.5 Coding Benchmark | Kilo Code | - |
| qwen-qwen3-vl-235b-a22b-instruct | Qwen: Qwen3 VL 235B A22B Instruct Coding Benchmark | Kilo Code | - |
| openai-o3 | OpenAI: o3 Coding Benchmark | Kilo Code | - |
| z-ai-glm-5-1 | Z.ai: GLM 5.1 Coding Benchmark | Kilo Code | - |
| mistralai-mistral-small-24b-instruct-2501 | Mistral: Mistral Small 3 Coding Benchmark | Kilo Code | - |
| openai-gpt-5-6-luna | OpenAI: GPT-5.6 Luna Coding Benchmark | Kilo Code | - |
| nex-agi-nex-n2-pro-free | Nex AGI: Nex-N2-Pro (free) Coding Benchmark | Kilo Code | yes |
| minimax-minimax-m2-1 | MiniMax: MiniMax M2.1 (retires Nov 5) Coding Benchmark | Kilo Code | - |
| openai-o3-mini | OpenAI: o3 Mini Coding Benchmark | Kilo Code | - |
| openai-gpt-5-6-sol | OpenAI: GPT-5.6 Sol Coding Benchmark | Kilo Code | - |
| google-gemma-4-31b-it | Google: Gemma 4 31B Coding Benchmark | Kilo Code | - |
| inclusionai-ring-2-6-1t-free | inclusionAI: Ring-2.6-1T (free) Coding Benchmark | Kilo Code | yes |
| google-gemini-3-8-flash | Google: Gemini 3.8 Flash (50% off) Coding Benchmark | Kilo Code | - |
| openai-gpt-6-astra | OpenAI: GPT-6 Astra ($$$$) Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-chat | DeepSeek: DeepSeek V3 Coding Benchmark | Kilo Code | - |
| openai-gpt-4o-mini | OpenAI: GPT-4o-mini Coding Benchmark | Kilo Code | - |
| openai-gpt-6-1-sol | OpenAI: GPT-6.1 Sol Coding Benchmark | Kilo Code | - |
| openai-gpt-4o | OpenAI: GPT-4o Coding Benchmark | Kilo Code | - |
| inclusionai-ling-3-1-flash | inclusionAI: Ling 3.1 Flash Coding Benchmark | Kilo Code | - |
| moonshotai-kimi-k2-7-code | MoonshotAI: Kimi K2.7 Code Coding Benchmark | Kilo Code | - |
| qwen-qwen3-coder-next | Qwen: Qwen3 Coder Next Coding Benchmark | Kilo Code | - |
| nvidia-nemotron-3-ultra-550b-a55b-free | NVIDIA: Nemotron 3 Ultra (free) Coding Benchmark | Kilo Code | yes |
| stealth-space-bunny-alpha | Space Bunny Alpha (retires Oct 5) Coding Benchmark | Kilo Code | - |
| qwen-qwen3-7-max | Qwen: Qwen3.7 Max Coding Benchmark | Kilo Code | - |
| poolside-laguna-s-2-1-free | Poolside: Laguna S 2.1 (free) Coding Benchmark | Kilo Code | yes |
| meta-llama-llama-3-2-3b-instruct | Meta: Llama 3.2 3B Instruct (retires Nov 15) Coding Benchmark | Kilo Code | - |
| dots-studio-dots-3-note-preview-free | Dots Studio: Dots3-Note Preview (free) Coding Benchmark | Kilo Code | yes |
| anthropic-claude-sonnet-5 | Anthropic: Claude Sonnet 5 Coding Benchmark | Kilo Code | - |
| z-ai-glm-5-3 | Z.ai: GLM 5.3 Coding Benchmark | Kilo Code | - |
| openai-o1 | OpenAI: o1 ($$$$) Coding Benchmark | Kilo Code | - |
| openai-gpt-oss-20b | OpenAI: gpt-oss-20b Coding Benchmark | Kilo Code | - |
| anthropic-claude-haiku-4-5 | Anthropic: Claude Haiku 4.5 Coding Benchmark | Kilo Code | - |
| anthropic-claude-fable-5 | Anthropic: Claude Fable 5 ($$$$) Coding Benchmark | Kilo Code | - |
| openai-gpt-5-1-codex | OpenAI: GPT-5.1-Codex Coding Benchmark | Kilo Code | - |
| inclusionai-ling-2-6-flash-free | inclusionAI: Ling-2.6-flash (free) Coding Benchmark | Kilo Code | yes |
| openai-gpt-4-1-mini | OpenAI: GPT-4.1 Mini Coding Benchmark | Kilo Code | - |
| minimax-minimax-m2-5 | MiniMax: MiniMax M2.5 Coding Benchmark | Kilo Code | - |
| anthropic-claude-sonnet-4-5 | Anthropic: Claude Sonnet 4.5 Coding Benchmark | Kilo Code | - |
| moonshotai-kimi-k3 | MoonshotAI: Kimi K3 Coding Benchmark | Kilo Code | - |
| inclusionai-ling-2-6-1t | inclusionAI: Ling-2.6-1T (retires Aug 24) Coding Benchmark | Kilo Code | - |
| anthropic-claude-opus-5 | Anthropic: Claude Opus 5 Coding Benchmark | Kilo Code | - |
| openai-gpt-6-sol | OpenAI: GPT-6 Sol Coding Benchmark | Kilo Code | - |
| qwen-qwen3-7-plus | Qwen: Qwen3.7 Plus Coding Benchmark | Kilo Code | - |
| x-ai-grok-code-fast-1 | xAI: Grok Code Fast 1 Coding Benchmark | Kilo Code | - |
| openai-gpt-5-2 | OpenAI: GPT-5.2 Coding Benchmark | Kilo Code | - |
| anthropic-claude-opus-4-5 | Anthropic: Claude Opus 4.5 Coding Benchmark | Kilo Code | - |
| qwen-qwen3-5-35b-a3b | Qwen: Qwen3.5-35B-A3B Coding Benchmark | Kilo Code | - |
| poolside-laguna-xs-2-1 | Poolside: Laguna XS 2.1 (retires Oct 31) Coding Benchmark | Kilo Code | - |
| qwen-qwen3-30b-a3b | Qwen: Qwen3 30B A3B Coding Benchmark | Kilo Code | - |
| mistralai-mistral-medium-3-5 | Mistral: Mistral Medium 3.5 Coding Benchmark | Kilo Code | - |
| qwen-qwen3-coder-plus | Qwen: Qwen3 Coder Plus (retires Oct 9) Coding Benchmark | Kilo Code | - |
| minimax-minimax-m2-7 | MiniMax: MiniMax M2.7 Coding Benchmark | Kilo Code | - |
| openai-gpt-4-1 | OpenAI: GPT-4.1 Coding Benchmark | Kilo Code | - |
| z-ai-glm-5-2 | Z.ai: GLM 5.2 Coding Benchmark | Kilo Code | - |
| qwen-qwen3-235b-a22b | Qwen: Qwen3 235B A22B (retires Oct 9) Coding Benchmark | Kilo Code | - |
| google-gemini-3-pro-preview | Google: Gemini 3 Pro Preview Coding Benchmark | Kilo Code | - |
| inclusionai-ling-2-6-1t-free | inclusionAI: Ling-2.6-1T (free) Coding Benchmark | Kilo Code | yes |
| x-ai-grok-4-3 | SpaceXAI: Grok 4.3 Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-v3-1-terminus | DeepSeek: DeepSeek V3.1 Terminus Coding Benchmark | Kilo Code | - |
| kwaipilot-kat-coder-pro | Kwaipilot: KAT-Coder-Pro V1 Coding Benchmark | Kilo Code | - |
| anthropic-claude-opus-4-8 | Anthropic: Claude Opus 4.8 Coding Benchmark | Kilo Code | - |
| anthropic-claude-fable-5-1 | Anthropic: Claude Fable 5.1 ($$$$) Coding Benchmark | Kilo Code | - |
| meituan-longcat-2-0 | Meituan: LongCat 2.0 Coding Benchmark | Kilo Code | - |
| qwen-qwen3-8-max | Qwen: Qwen3.8 Max Coding Benchmark | Kilo Code | - |
| xiaomi-mimo-v-2-flash | Xiaomi: MiMo-V2-Flash  Coding Benchmark | Kilo Code | - |
| z-ai-glm-5-3-flash | Z.ai: GLM 5.3 Flash Coding Benchmark | Kilo Code | - |
| openai-gpt-oss-120b | OpenAI: gpt-oss-120b Coding Benchmark | Kilo Code | - |
| nvidia-nemotron-3-ultra-550b-a55b | NVIDIA: Nemotron 3 Ultra Coding Benchmark | Kilo Code | - |
| microsoft-wizardlm-2-8x22b | WizardLM-2 8x22B Coding Benchmark | Kilo Code | - |
| openai-gpt-5-5 | OpenAI: GPT-5.5 Coding Benchmark | Kilo Code | - |
| anthropic-claude-opus-4-6 | Anthropic: Claude Opus 4.6 Coding Benchmark | Kilo Code | - |
| google-gemma-3-4b-it | Google: Gemma 3 4B Coding Benchmark | Kilo Code | - |
| kilo-auto-efficient | kilo-auto/efficient Coding Benchmark | Kilo Code | - |
| openai-gpt-5 | OpenAI: GPT-5 Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-v4-1-flash | DeepSeek: DeepSeek V4.1 Flash Coding Benchmark | Kilo Code | - |
| openai-gpt-4-1-nano | OpenAI: GPT-4.1 Nano Coding Benchmark | Kilo Code | - |
| google-gemma-3-27b-it | Google: Gemma 3 27B Coding Benchmark | Kilo Code | - |
| google-gemma-2-27b-it | Google: Gemma 2 27B Coding Benchmark | Kilo Code | - |
| openai-gpt-5-mini | OpenAI: GPT-5 Mini Coding Benchmark | Kilo Code | - |
| cohere-command-r-plus-08-2024 | Cohere: Command R+ (08-2024) Coding Benchmark | Kilo Code | - |
| minimax-minimax-m3 | MiniMax: MiniMax M3 Coding Benchmark | Kilo Code | - |
| openrouter-pony-alpha | Pony Alpha (free) Coding Benchmark | Kilo Code | - |
| minimax-minimax-m3-1-flash-free | MiniMax: MiniMax M3.1 Flash (free) Coding Benchmark | Kilo Code | yes |
| openai-gpt-4o-2024-08-06 | OpenAI: GPT-4o (2024-08-06) Coding Benchmark | Kilo Code | - |
| tencent-hunyuan-a13b-instruct | Tencent: Hunyuan A13B Instruct Coding Benchmark | Kilo Code | - |
| meta-muse-spark-1-1 | Meta: Muse Spark 1.1 Coding Benchmark | Kilo Code | - |
| google-gemma-4-26b-a4b-it | Google: Gemma 4 26B A4B  Coding Benchmark | Kilo Code | - |
| inclusionai-ling-3-0-flash-vl-free | inclusionAI: Ling 3.0 Flash VL (free) Coding Benchmark | Kilo Code | yes |
| cohere-command-r7b-12-2024 | Cohere: Command R7B (12-2024) Coding Benchmark | Kilo Code | - |
| openai-gpt-4-turbo | OpenAI: GPT-4 Turbo ($$$$) Coding Benchmark | Kilo Code | - |
| ibm-granite-granite-4-0-h-micro | IBM: Granite 4.0 Micro Coding Benchmark | Kilo Code | - |
| z-ai-glm-4-6 | Z.ai: GLM 4.6 Coding Benchmark | Kilo Code | - |
| google-gemini-3-5-flash | Google: Gemini 3.5 Flash Coding Benchmark | Kilo Code | - |
| openai-gpt-oss-safeguard-20b | OpenAI: gpt-oss-safeguard-20b Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-v4-1-flash-1017 | DeepSeek: DeepSeek V4.1 Flash 1017 Coding Benchmark | Kilo Code | - |
| mistralai-devstral-2512 | Mistral: Devstral 2 2512 Coding Benchmark | Kilo Code | - |
| anthropic-claude-opus-4-7 | Anthropic: Claude Opus 4.7 Coding Benchmark | Kilo Code | - |
| google-gemini-2-5-flash | Google: Gemini 2.5 Flash Coding Benchmark | Kilo Code | - |
| meta-llama-llama-3-2-1b-instruct | Meta: Llama 3.2 1B Instruct (retires Nov 15) Coding Benchmark | Kilo Code | - |
| baidu-cobuddy-free | baidu/cobuddy:free Coding Benchmark | Kilo Code | yes |
| deepseek-deepseek-v4-pro | DeepSeek: DeepSeek V4 Pro 0423 Coding Benchmark | Kilo Code | - |
| deepseek-deepseek-v4-flash | DeepSeek: DeepSeek V4 Flash 0423 Coding Benchmark | Kilo Code | - |

Reasoning: the catalog is the Gateway shelf. Free-route truth lives in slugs: 19 carry `-free` suffix (list in coverage). The live free lane is verified at runtime via the Gateway catalog, not these pages — pages are reference, runtime is ground truth.

## 7. n8n SCOUT (ordered inclusion)

- What it is: workflow automation combining AI + business process (code flexibility + no-code speed). Deterministic↔agentic dial: deterministic steps by default, agents added where judgment earns it. Every run auditable step-by-step (inputs/outputs replayable) — their answer to "can't control agents you can't understand."
- Pricing: per EXECUTION (not per step/user): Starter 20€/mo annual (2.5K execs), Pro 50€/mo (10K), Business 667€/mo (40K), Enterprise custom; unlimited users/workflows/integrations on all; AI/MCP nodes + assistant credits included. Community Edition: free, self-hosted (Docker one-liner `curl -fsSL https://get.n8n.io | sh`, Compose, npm, AWS), same core product, license key unlocks Business/Enterprise.
- Automation half (all confirmed in docs): Schedule Trigger (cron-like, must publish workflow, timezone-aware), Telegram Trigger (event list + credentials doc), 600+ native integrations as agent tools, webhooks, error-handling/versioning/logs built in, self-host keeps data in-house.
- AI half: AI Agent node (chat model + ≥1 tool sub-node, agent picks tools per task; agent-type setting deprecated since 1.8), Tools Agent, memory sub-nodes, vector stores (Qdrant/Pinecone/PGVector/etc.), MCP client AND MCP server trigger nodes, evals for reliability. So: n8n can host an agent with tools+memory AND expose/consume MCP — the protocol bridge to our runner/MCP world exists.
- Honest fit vs the Claw shape: schedules+Telegram+integrations+self-host = YES, fully. Autonomous coding over a repo with shell/browser = weak (their own page concedes solo coding belongs in coding agents). Verdict: best outside candidate for the automation half; pairs with (not replaces) Kilo/box. Needs box residency + build labor. No move without sovereign order.

## 8. REPLACEMENT MAP (final, with reasoning per job)

| Claw job | In-Kilo answer | Evidence tab | Gap |
|---|---|---|---|
| Always-on presence | Runner cron */10 (live, 4/4 keys) firing Cloud Agent webhooks / box keepers | /cloud, /docs/gateway, runner /health 2026-11-06 | Container sleeps; wake-on-webhook only |
| Scheduled automation | Cloud Agent webhook triggers + cron-shaped prompts; n8n Schedule Trigger if outside | /cloud (webhook triggers), n8n docs | No native Kilo cron schedules |
| Chat control | Slack @Kilo + mobile approvals + notifications | /slack, /features/android-app + ios-app, docs notifications | No Telegram/Discord control in-Kilo |
| Repo coding | Cloud Agents (ephemeral) + IDE/CLI agents + Agent Manager | /code, /cli, /cloud, agent-manager docs | Ephemeral workspaces; state in git |
| Memory | Repo files + skills + sessions portability | /features/skills + sessions | No built-in cross-session memory |
| Models | Gateway 500+, Auto Model routing, BYOK, 19 free slugs | /gateway, /auto-model, /inference, catalog | Free-tier queue/empties (known lane behavior) |
| Cost guard | Auto top-ups, min-balance alerts, Kilo Pass 1:1+bonus, cost controls docs | features tabs + getting-started docs | Spend is real once off free |

Standing order preserved: box free lane + runner carry the movement; no new SKU, no spend, no email, no connects until Claw proves itself over 24h (it cannot arrive — delisted) or sovereign orders otherwise.
