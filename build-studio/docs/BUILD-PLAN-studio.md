# Build Studio — build plan and findings

**Goal:** turn the HTML demo into a working application. A business requirement goes in one end; the context pack governs the work; a deployed application comes out the other end. One VM, one Anthropic API key, containers for generated apps.

**Scope agreed:** POC that does not paint us into a corner · small internal web apps · same VM, one container per generated app.

---

## Part 1 — Findings

Five things from the Agent SDK documentation that change the design. Three are security findings and one of them is serious.

### F1 — `claude -p` executes code from the workspace, without a trust prompt

From the headless documentation, verbatim:

> "Without `--bare`, a `-p` session runs the hooks in a project's `.claude/settings.json` and connects the servers in its `.mcp.json`, even in a folder you've never trusted. A `-p` session shows no workspace trust dialog and no per-server approval prompt."

**Why this matters here.** Build Studio's whole job is to run an agent inside a workspace directory. If anything ever places a `.claude/settings.json` into that workspace — an uploaded requirements archive, a cloned repository, a template from outside our control, a generated file — its hooks execute on our VM, as our user, with our API key in the environment. No prompt, no dialog.

That is arbitrary code execution reached through a document upload.

**Mitigation, and it is not optional:**

- The workspace is **constructed**, never **received**. Built from a template we control, file by file. No archive is ever unpacked into it.
- Uploaded documents are parsed into text and stored as data. They never land in the workspace as files.
- Run with `--bare` and pass context explicitly (`--settings`, `--plugin-dir`, `--add-dir`, `--append-system-prompt-file`). Bare mode skips auto-discovery entirely, which is exactly the property we want.
- Before each run, assert the workspace contains no `.claude/settings.json`, `.mcp.json` or `.claude/hooks/` other than the ones we wrote. Fail closed.

Note the trade-off: `--bare` also skips auto-loading of `CLAUDE.md`, commands and subagents. We pass those explicitly instead. That is more work and it is the correct amount of work.

### F2 — The generated application is the second untrusted input

The agent writes code. That code then runs. On the same VM.

For the POC this is acceptable **only** with the container boundary you have already chosen, and only if these hold:

- The generated app container receives **no** `ANTHROPIC_API_KEY`, no git credentials, no host filesystem mount of the workspace.
- It gets its own Docker network, `--read-only` root filesystem where possible, a memory and CPU cap, and no Docker socket.
- Build happens in the runner; the container receives only the build output.

The API key is the crown jewel here. One key, no scoping, and it bills to your account — a generated app that can read it is a live financial and data risk, not a theoretical one.

### F3 — Cost figures from the SDK are estimates

`--output-format json` returns `total_cost_usd` and a per-model breakdown, which is genuinely useful and is the answer to token tracking. The documentation is explicit that these are **client-side estimates and can differ from the actual bill**.

Use them for in-flight control — loop breakers, per-block ceilings, showback. Reconcile monthly against the Console. Never present an SDK figure as the invoice.

### F4 — Long runs need to be stepwise, not one call

Background bash tasks are terminated about five seconds after the run returns. Subagents and workflows hold the process open, but with a **ten-minute idle ceiling** by default (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`).

So: one agent invocation per block, not one per feature. That happens to be the same shape the 300-line rule already pushes us toward, which is a good sign. Each invocation is resumable by session ID (`--resume`), so stage-to-stage continuity is free.

### F5 — The requirement text is an injection surface

A BRD is user-supplied prose that becomes agent instructions. `security-and-data.instructions.md` already says untrusted content is data, not instructions — but instructions are a strong default, not a control.

At the API level: requirement text is passed inside a delimited data block, never concatenated into the system prompt. The system prompt comes from our files only.

---

## Part 2 — Architecture

Five components. The split between them is the thing that keeps the POC from becoming a corner.

```
┌──────────────────────────────────────────────────────────────┐
│ VM                                                            │
│                                                               │
│  ┌────────────┐   HTTP    ┌──────────────┐                   │
│  │  Console   │──────────▶│  Studio API  │  ← holds the DB   │
│  │  (the HTML)│           │  (orchestr.) │  ← holds the key  │
│  └────────────┘           └──────┬───────┘                   │
│                                  │ sandbox contract           │
│                                  ▼                            │
│                           ┌──────────────┐                    │
│                           │ Agent Runner │  own user, own     │
│                           │ (Agent SDK)  │  container         │
│                           └──────┬───────┘                    │
│                                  │ writes                     │
│                                  ▼                            │
│                           ┌──────────────┐                    │
│                           │  Workspace   │  git repo per      │
│                           │  (per app)   │  project           │
│                           └──────┬───────┘                    │
│                                  │ build output only          │
│                                  ▼                            │
│                           ┌──────────────┐                    │
│                           │ App runtime  │  container per app │
│                           │              │  no key, no creds  │
│                           └──────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 Studio API — the orchestrator

Owns the workflow state machine, the database, the gates, the budget ledger and the audit trail. **It is the only component that holds the Anthropic API key and the only writer to the database.**

Recommended stack: **Python 3.11 + FastAPI**, because the Agent SDK has a first-class Python package and the orchestration is state-machine work rather than throughput work. TypeScript is equally valid if the team is stronger there — the SDK supports both.

### 2.2 Agent Runner — the sandbox, logically separated now

A separate process in its own container, with its own OS user. It receives a task, runs the agent, returns artifacts. It never touches the database.

**Use the Agent SDK, not the raw Messages API, and not `claude -p` as the primary path.** The SDK gives four things we would otherwise build and get wrong:

| SDK capability | What we use it for |
|---|---|
| `canUseTool` permission callback | Gate enforcement **in code**. This is where a V4 tier refuses to author, in a callback, not in a prompt |
| Hooks | Deterministic checks: block size, protected paths, test-edit lock during fixes |
| Sessions and resume | Stage-to-stage continuity without re-sending context |
| Cost tracking | Per-block spend, feeding the budget ladder |

`claude -p` remains useful for one-off scripted tasks and CI. The SDK is the runtime.

> **Worth evaluating before building the runner:** Anthropic's **Managed Agents** offers a hosted agent harness with sessions in a managed sandbox — and supports **self-hosted sandboxes on your own infrastructure**. That is precisely the layer we are about to build. If it fits, it removes the hardest component from our scope. Spend half a day on this before writing runner code.

### 2.3 Workspace — one git repo per project

Constructed from our template (F1). Contains the context pack, the artifact chain, and the generated source.

```
workspaces/<project-slug>/
  .github/            ← context pack, copied from template
  CLAUDE.md           ← project memory: stack, conventions, permitted tech
  intent.md           ← Plan stage
  spec.md             ← Design stage
  plan.md             ← Plan stage — blocks and increments
  docs/
    brd/ discovery/ plans/ change-records/ decisions/
  tasks/              ← one card per block
  app/                ← the generated application
```

Every stage commits. The git history *is* the audit trail, which is the playbook's best idea and costs us nothing.

### 2.4 App runtime — a container per generated app

`docker build` from `app/`, run with no key, no credentials, own network, resource caps. Reverse proxy maps `/apps/<slug>` to the container.

### 2.5 Console — the HTML made real

Your demo already specifies this: nine stages, the pipeline rail, stage workspace, Claude panel, role switcher, token meter. Keep the layout exactly; replace the mock data with API calls.

---

## Part 3 — How a requirement flows through

The loop, concretely. Each step is one agent invocation with a fixed prompt file from the context pack.

| # | Stage | Prompt | Agent produces | Gate |
|---|---|---|---|---|
| 1 | Requirements | `/brd` | `docs/brd/BRD-n.md` + confidence score | **G1** — below 75 it stops. Business owner signs criteria |
| 2 | Design | — | `spec.md`, stack from permitted list, ADRs | **G2** — architect approves |
| 3 | Plan | `/plan` | `plan.md` — blocks ≤300 lines, grouped into increments | **G3** — product owner approves |
| 4 | Code | `/implement` | One block: diff + tests, on a branch | **G4** — explain-back, three questions |
| 5 | Review | `/review` | Findings by severity, never approves | **G5** — named human merges |
| 6 | Test | `/test` | Tests from signed criteria; agent cannot edit tests while fixing | **G6/G7** |
| 7 | UAT | — | Increment deployed to its container | **G8** — business signs off |
| 8 | Deploy | — | Release notes, rollback plan | **G9** — human authorises |
| 9 | Maintain | `/understand` | Incident → new `intent.md` | **G10** |

Steps 4–6 loop per block. Step 7 fires per increment, every one to three days.

**Gates are enforced in the state machine, not in the prompt.** The API refuses the transition. The prompt files are the strong default; the state machine is the control. This is the same distinction as F1 and it is the one that survives a security review.

---

## Part 4 — Data model

Minimum viable, and it is most of the work people underestimate.

| Table | Key fields |
|---|---|
| `project` | slug, name, workspace_path, repo_url, status, budget_cents |
| `requirement` | project_id, brd_path, confidence, status, capped_by |
| `stage_run` | project_id, stage, status, started_at, gate_status, approver, approved_at |
| `block` | project_id, plan_ref, requirement_ref, lines_changed, branch, pr_url, status |
| `agent_run` | block_id, session_id, prompt_ref, model, input_tokens, output_tokens, cost_cents, exit_status, workspace_sha |
| `gate_event` | stage_run_id, gate, actor, decision, rationale, explain_back_result, at |
| `budget_event` | scope, threshold_hit, action_taken, at |
| `artifact` | run_id, type, path, sha256 |

Two properties to build in from the start, because retrofitting them is painful:

- **`gate_event` is append-only.** No updates, no deletes, enforced at the grant level. An approval that was edited is not an audit trail.
- **`agent_run` records `workspace_sha`** — the git SHA the agent saw. Without it you cannot reproduce or explain any run after the fact.

---

## Part 5 — Increments

Six, each independently demonstrable. Do not start the next until the current one runs end to end.

### Increment 0 — Two spikes, one day each
Before committing to an architecture, prove the two facts the plan rests on.

- **Spike A:** call `POST /agents/repos/{owner}/{repo}/tasks` against a throwaway repo containing the context pack. Does the coding agent read `.github/copilot-instructions.md` and the `applyTo`-scoped instruction files? Does it respect a stop instruction? What does one session cost against your allowance?
- **Spike B:** evaluate Managed Agents with a self-hosted sandbox. It may remove the runner entirely.

*Done when:* you know which architecture you are building, on evidence rather than on this document.

### Increment 1 — One stage, one loop
Studio API skeleton, database, workspace template, agent invocation, and **stage 1 only**: a requirement goes in, `/brd` runs, a scored BRD comes back and renders in the console.

*Done when:* a vague one-liner produces a score below 50 and a list of questions, and nothing else. That is the single most important behaviour to prove first, because it is the one that proves governance is real rather than decorative.

### Increment 2 — The artifact chain
Stages 2 and 3. `spec.md` and `plan.md` generated, blocks with a 300-line ceiling, increments grouped. Git commits per stage.

*Done when:* the console shows a real plan with real blocks, each traced to a requirement, and `git log` tells the story.

### Increment 3 — Code and gates
Stage 4 and 5. Agent implements one block. Hooks enforce block size and protected paths. Explain-back at G4 — three questions, answers recorded in `gate_event`. PR opened.

*Done when:* the state machine **refuses** to advance a block whose explain-back was not passed. Prove the refusal, not the happy path.

### Increment 4 — Tests and the independence rule
Stage 6. Tests generated from the signed acceptance criteria only. Test-edit lock hook active during fixes.

*Done when:* `/test` refuses to run against unsigned criteria.

### Increment 5 — Deploy
Container build, container run, reverse proxy route, health check, rollback. UAT environment per increment.

*Done when:* a generated app is reachable in a browser and demonstrably has no API key in its environment.

### Increment 6 — Money and evidence
Token ledger per block, the 80/100/120 budget ladder with an in-agent loop breaker, cost per merged block, rework tokens, and the audit view.

*Done when:* work actually stops at 120% of budget, and the audit trail reconstructs a change end to end without anyone explaining it.

---

## Part 5a — Model access, and a second architecture this opens up

**A Copilot subscription still cannot be turned into an Anthropic API key.** No supported path exists, and extracting the editor plugin's OAuth credential breaks GitHub's terms, would not survive a security review at the company whose licence it is, and rotates without warning.

But 10,000 **credits** is a different proposition from 10,000 tokens, and it opens an architecture worth taking seriously.

### The enabling facts

| Fact | Source |
|---|---|
| A **Copilot Agent Tasks REST API** exists — `POST /agents/repos/{owner}/{repo}/tasks` with a `prompt`, optional `base_ref`, `model` and `create_pull_request`. Task states: `queued`, `in_progress`, `completed`, `failed`, `timed_out`, `waiting_for_user` | Public preview since May 2026. Requires Copilot Business or Enterprise and a fine-grained PAT with Copilot Requests read |
| **Each cloud agent session consumes one premium request** | GitHub billing documentation |
| Advanced reasoning models carry multipliers — 5× or 20× the standard rate | GitHub billing documentation |

**Confirmed: the allowance is 10,000 AI credits, which at the published rate of 1 credit = $0.01 is $100.** Not premium requests, so not the thousands-of-sessions reading.

That changes the argument, and it is worth being clear about how. **$100 of Copilot credits against $70–150 of pay-as-you-go is the same order of magnitude.** So routing the code stages through Copilot is no longer a money decision — it is a **security and isolation decision** that happens to be budget-neutral. The case for it stands on removing the API key from the VM and moving code execution off your infrastructure, not on the spend.

It also means the budget guard is mandatory rather than prudent. $100 is the whole allowance, and a runaway agent loop can take a visible bite of it in an afternoon.

### Architecture B — Copilot drives the code stages

Instead of the Studio calling the Agent SDK on your VM, it creates a Copilot agent task against the repository. Copilot works in GitHub's infrastructure and opens a pull request. The Studio watches by webhook, runs its gates, and records the change.

```
Studio API ──POST /agents/repos/…/tasks──▶ Copilot coding agent (GitHub infra)
     ▲                                              │
     └──────── webhook: PR opened ◀─────────────────┘
     │
     └──▶ gates, change record, merge via branch protection
```

**What this buys, and it is more than the money:**

- **The sandbox problem largely disappears.** The agent executes on GitHub's infrastructure, not your VM. Finding F1 — workspace config executing on your host — stops applying to the build step, because there is no `claude -p` running in a workspace on your box. F2 shrinks to the deployment container alone.
- **No Anthropic API key on the VM at all** for the code stages. The most valuable secret in the design simply is not there.
- **The context pack already fits.** `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` and `AGENTS.md` are Copilot's own conventions — which is what the pack was written for. Verify this holds for the coding agent specifically in increment 1, but the format is right.
- **Branch protection becomes a real control** rather than a simulated one, and the audit trail is GitHub-native: PRs, checks, reviews, approvals.

**What it costs you:**

- **Much less programmatic control.** No `canUseTool` callback, no Agent SDK hooks. Gate enforcement moves to branch protection, required status checks and the Studio state machine. Arguably *better* — those are deterministic rather than instruction-based — but different, and you configure less of the agent loop.
- **A slower, coarser loop.** Queue, runner start, PR. Status is polled, not streamed, so the console shows stage transitions rather than live progress.
- **No structured output.** The BRD confidence score cannot come back as schema-validated JSON; it arrives as a markdown file in a PR that you parse. Workable, clunkier, and more fragile.
- **Preview API on human credentials.** Installation tokens are not yet supported, so the POC runs under a person's PAT. Acceptable for a POC, not for production, and it will need revisiting.

### The recommendation: split by stage, not by principle

The two halves of the pipeline want different things.

| Stages | Character | Run via | Why |
|---|---|---|---|
| **1–3** Requirements, Design, Plan | Documents. Low volume. Need schema-validated JSON for the confidence score. Touch no code, execute nothing | **Small Anthropic API key** | Structured output matters here and nothing else provides it. Roughly $20 of traffic for the whole POC — the volume is tiny |
| **4–6** Code, Review, Test | Code. High volume. Need isolation. Benefit from native PR, branch protection and checks | **Copilot agent tasks, company credits** | This is where the spend, the risk and the sandbox problem all live — and GitHub absorbs all three |

That split spends a trivial amount where structured output matters and puts the company allowance where the isolation matters, and it removes the hardest component of the plan.

**With $100 total, there is a simpler option worth considering first.** Managing two providers for one POC budget has its own cost. Running everything through Copilot agent tasks — and parsing the BRD score out of a committed markdown file instead of getting typed JSON — needs no personal spend at all and no second credential. The parser is more fragile and must fail loudly rather than defaulting a missing score to a passing one, but that is a contained problem. Start there; add a small Anthropic key for stage 1 only if the parsing proves unreliable in practice.

### If you want a single provider instead

**Claude via Microsoft Foundry on Azure** remains the cleanest long-term answer, and it is what your own Build Studio deck already proposes. The Agent SDK reads Foundry credentials natively — the documentation confirms Bedrock, Google Cloud and Microsoft Foundry all continue to use their own provider credentials. It bills to the company and needs no new procurement. Ask for it now regardless of which architecture you pick, because it is the production path either way.

### For calibration

Increments 1–3 under Architecture A need roughly 200–400 agent runs, landing near **$70–150** on pay-as-you-go, with prompt caching cutting the input side because the context pack is re-sent every run. The Build Studio deck puts ContactHUB — a complete delivered application — at about €520. The POC is a fraction of one app either way.

**Build the per-run ceiling in increment 1, not increment 6.** Twenty lines in the runner, and it protects everything after it regardless of whose money is at risk.

---

## Part 6 — What to decide before writing code

| # | Decision | Recommendation |
|---|---|---|
| 0 | Model access and execution architecture | **Split it** — small Anthropic key for stages 1–3, Copilot agent tasks for stages 4–6. Confirm first whether your 10,000 are premium requests or AI credits. Ask for Foundry in parallel; it is the production path either way. Part 5a |
| 1 | Managed Agents vs our own runner | **Evaluate Managed Agents with a self-hosted sandbox first.** Half a day. It may remove our hardest component |
| 2 | Python or TypeScript | Python + FastAPI unless the team is stronger in TS. Both SDKs are first-class |
| 3 | Permitted stack for generated apps | Fix **one** stack for the POC and write it into the workspace `CLAUDE.md`. An open stack choice makes everything else harder |
| 4 | Git hosting | Local bare repos are enough for the POC. GitHub if you want branch protection as a real control rather than a simulated one |
| 5 | Who approves gates in the POC | You, in every role, with the role switcher. Fine for a POC — but the competency model is still the open question behind it |

---

## Part 7 — Honest risks

**The console is more work than the agent.** The interesting part is the loop; the expensive part is nine stage screens, an approvals inbox, a role switcher and a token meter. Your HTML demo has already done the hard design thinking, which is a real head start — but building it for real is most of the effort, and it is worth saying that to anyone estimating this.

**Agent runs are slow and non-deterministic.** A block takes minutes and the same prompt gives different output. Design the UI for that: stream events, show progress, never block a page on a run. And never demonstrate a live agent run without a recorded fallback.

**The 300-line rule will be breached legitimately.** A first scaffold is not 300 lines. Allow justified exceptions from the start, record them, and watch the rate — a rising rate means blocks are being scoped wrong in planning, which is upstream of where it shows up.

**Deployment is where POCs stall.** Building a container is easy; health checks, port allocation, rollback, logs and cleanup are a week nobody plans for. Increment 5 is bigger than it looks.

**One API key is a single point of financial failure.** A runaway loop can spend a lot before anyone opens a dashboard. Build the loop breaker in increment 1, not increment 6 — a per-run token ceiling enforced in the runner is twenty lines and it protects everything after it.

---

## Part 8 — What this gives you

At the end of increment 3 you can demonstrate, on real code: a requirement scored and refused for being too vague; a plan broken into traceable blocks; an agent that implements one block and stops; a gate that will not advance without explain-back; and a git history that reconstructs all of it.

That is the Build Studio thesis proven, on one VM, with one API key — and with every boundary in the right place, so the production split is a deployment change rather than a rewrite.
