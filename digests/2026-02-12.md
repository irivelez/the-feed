# 📡 AI Digest — February 12, 2026

## Big Picture
The AI coding agent war just went nuclear — OpenAI, Anthropic, and Google are all shipping CLI-native tools simultaneously, but the real story is that engineers are no longer writing code, they're orchestrating fleets of agents that do.

## TL;DR
- OpenAI (Codex), Anthropic (Claude Code), and Google (Gemini CLI) are in a three-way race for the AI coding terminal — IDEs are the new battleground
- The engineer role is visibly shifting from writing code to coordinating agents: Anthropic's own report confirms single→multi-agent is the 2026 paradigm
- Claude Code's ecosystem is maturing fast — hooks, sandboxing, permissions, custom agents via .md files, and plugins are turning it into a full agentic platform
- Memory and orchestration are becoming first-class infrastructure (LangSmith Agent Builder, semantic crons, Skills APIs) — the plumbing for multi-agent systems is being laid now
- Quality concerns are real: the HN debate on Claude Code 'being dumbed down' (673 comments) signals growing pains as these tools scale from early adopters to mainstream

## Data Points
| Stat | Context |
|------|---------|
| 93,000 lines in 5 days | Real-world Claude Code vs GPT-5.3 Codex benchmark showing industrial-scale AI code generation |
| 1M downloads in week one | Codex App adoption confirms massive market pull for AI coding agents |
| ASL-4 threshold triggered | Claude Opus 4.5 prompted Anthropic's autonomous capability safety review |
| 60%+ week-over-week growth | Codex usage curve steeper than ChatGPT's early days |

---

## 🛠️ Tools & Platforms

- **[Claude Opus 4.6 vs GPT-5.3 Codex: 93,000 lines of code in 5 days](https://www.lennysnewsletter.com/p/claude-opus-46-vs-gpt-53-codex-how)** — Direct Claude Code vs Codex comparison with real metrics *(Lenny Rachitsky, relevance: 10)* `#claude-code` `#agentic` `#tools`
- **[GPT-5.3-Codex launches in Cursor, GitHub, and VS Code](https://x.com/sama/status/2020940847190356092)** — OpenAI's coding model now in major IDEs — direct competitor to Claude Code *(Sam Altman, 7.2K likes)* `#agentic` `#claude-code` `#tools`
- **[Google launches Gemini CLI](https://x.com/GoogleCloudTech/status/2021728458313789630)** — Google entering the CLI-based AI coding tool space *(Google Cloud)* `#claude-code` `#tools`
- **[LangSmith Agent Builder Ships with Built-in Memory](https://x.com/LangChain/status/2021646666739413450)** — Memory as first-class in agent infra *(LangChain)* `#agentic` `#multi-agent`
- **[OpenAI deep research now connects to external apps](https://x.com/OpenAI/status/2021299936948781095)** — Deep research gets tool-use: app connections, site-specific search *(OpenAI, 1.4K likes)* `#agentic`
- **[Claude Cowork Legal plugin for NDA triage](https://x.com/alliekmiller/status/2021586268573024337)** — Real-world agentic legal plugin demo *(Allie K Miller, 517 likes)* `#agentic` `#claude-code`
- **[Codex App hits 1M downloads, 60%+ growth](https://x.com/sama/status/2020977975081177343)** — Validates massive demand for AI coding agents *(Sam Altman, 7K likes)* `#agentic`
- **[Simon Willison on OpenAI Skills API](https://x.com/simonw/status/2021665686020620384)** — New agentic capability from OpenAI *(Simon Willison)* `#agentic`
- **[Perplexity upgrades Deep Research to Opus 4.6](https://x.com/AravSrinivas/status/2020969022154735736)** — Model upgrade in production agent system *(Arav Srinivas, 519 likes)* `#models` `#agentic`

## 📚 Tutorials & How-To

- **[Karpathy: GPT in 243 lines of pure Python](https://x.com/karpathy/status/2021694437152157847)** — Full GPT train+inference with zero dependencies *(Karpathy, 2.5K likes)* `#research` `#tutorials`
- **[Claude Code Tips: Custom Agents via .md Files](https://x.com/bcherny/status/2021700144039903699)** — Drop .md files to create named agents with custom configs `#claude-code` `#multi-agent`
- **[Claude Code Tips: Plugins, MCPs, and Skills](https://x.com/bcherny/status/2021699862522364149)** — Extensibility layer for Claude Code `#claude-code` `#agentic`
- **[How to build an AI boardroom in Claude Code](https://x.com/alliekmiller/status/2021578555034149188)** — Multi-agent simulation for strategy debates *(Allie K Miller, 331 likes)* `#claude-code` `#multi-agent`
- **[How to build your own AI developer tools with Claude Code](https://www.lennysnewsletter.com/p/this-week-on-how-i-ai-how-to-build)** — Tutorial format, directly on-niche *(Lenny Rachitsky)* `#claude-code` `#agentic`
- **[Claude Code Tips: Hooks for Lifecycle Automation](https://x.com/bcherny/status/2021701059253874861)** — Deterministic hooks for routing, formatting, permissions `#claude-code`
- **[Claude Code Tips: Sandboxing for Safety](https://x.com/bcherny/status/2021700506465579443)** — Open source sandbox runtime `#claude-code`
- **[Claude Code Tips: Permission Pre-Approval](https://x.com/bcherny/status/2021700332292911228)** — Sophisticated permission system with prompt injection defenses `#claude-code`

## 🔬 Research & Models

- **[Anthropic: models approaching ASL-4 autonomous capability](https://x.com/AnthropicAI/status/2021397952791707696)** — Claude Opus 4.5 triggered ASL-4 proximity review *(Anthropic, 5.5K likes)* `#models` `#agentic`
- **[Anthropic report: engineers shifting to agent coordinators](https://x.com/fun000001/status/2021735674035241184)** — Key 2026 shift: orchestration over coding, multi-agent replacing sequential `#multi-agent` `#agentic`
- **[GLM-5: Complex systems engineering and long-horizon agentic tasks](https://z.ai/blog/glm-5)** — New model targeting agentic workloads *(HN: 212 pts, 379 comments)* `#models` `#agentic`
- **[General agent solves all 30 steps of benchmark](https://x.com/sucralose__/status/2021733850422956118)** — General agent solving complex multi-step tasks without hardcoding `#agentic` `#research`
- **[Is a secure AI assistant possible?](https://www.technologyreview.com/2026/02/11/1132768/is-a-secure-ai-assistant-possible/)** — Core question for agentic system builders *(MIT Tech Review)* `#agentic`
- **[LLM Reasoning Continues to Be Deeply Flawed](https://garymarcus.substack.com/p/breaking-llm-reasoning-continues)** — Fresh evidence on LLM reasoning limits *(Gary Marcus)* `#models` `#research`

## 💬 Opinion & Analysis

- **[Claude Code is being dumbed down?](https://symmetrybreak.ing/blog/claude-code-is-being-dumbed-down/)** — High-engagement debate on quality regression *(HN: 673 pts, 458 comments)* `#claude-code`
- **[Karpathy on DeepWiki and software malleability](https://x.com/karpathy/status/2021633574089416993)** — AI making codebases deeply navigable *(3.5K likes)* `#tools` `#agentic`
- **[Harrison Chase proposes semantic crons](https://x.com/hwchase17/status/2021696693268345179)** — LLM-driven fuzzy event triggers instead of structured metrics `#agentic` `#multi-agent`
- **[Sam Altman: Codex will eventually win as coding agent](https://x.com/sama/status/2021606985469211065)** — Competitive signal for Claude Code users *(4.9K likes)* `#agentic`
- **[Context management as the real bottleneck for AI agents](https://x.com/somi_ai/status/2021730004728787297)** — The underrated challenge separating useful agents from demos `#agentic` `#multi-agent`
- **[AI productivity claims vs reality: 56% faster or 19% slower?](https://x.com/Test_Sprite/status/2021736164856914183)** — Real-world data challenges inflated benchmarks `#research`

## 💼 Business

- **[Agentic platforms reshaping C-suite AI strategy](https://x.com/alliekmiller/status/2021610678931570834)** — Claude Code, Codex shifting enterprise adoption *(Allie K Miller, 112 likes)* `#agentic` `#business`
- **[OpenAI launches ads in ChatGPT](https://x.com/OpenAI/status/2020936703763153010)** — Major business model shift *(3.5K likes)* `#business`
- **[AI-First Company Memos](https://the-ai-native.company/)** — Collection of real company memos on AI adoption *(HN: 114 pts, 180 comments)* `#business`
- **[YC Request for Startups: AI-Native Agencies](https://x.com/DTrembois/status/2021732948450717837)** — YC signals AI-native agencies as key category `#agentic` `#business`

---

## Source Stats
- **Raw fetched:** 283 items
- **Kept:** 82 items (29%)
- **Sources:** X/Twitter (229), Hacker News (13), RSS (41)
- **Generated:** 2026-02-12T00:08:31Z
