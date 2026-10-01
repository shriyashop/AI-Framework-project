# Handover 01 — Build Studio, increment 1

**To:** the local agent
**Task:** stand up Build Studio far enough to run one requirement through stage 1 end to end
**Scope:** increment 1 only. Do not build stages 2–9. Do not build the full console.

---

## Before you write any code — stop and ask

Four things. **Ask all four in one message, then wait.** Do not guess any of them, and do not start on "the parts that are clear" — the parts that look clear inside an unclear setup are clear because they were assumed.

### 1. The frontend file path

> "What is the full path to the Build Studio HTML demo I should use as the frontend base? I need the file itself — the nine-stage pipeline layout, stage workspace and Claude panel are the spec for the console, and I should build from it rather than redesign it."

Do not rebuild the UI from scratch. The existing demo has already settled the layout, the stage rail, the role switcher, the token meter and the panel structure. You are replacing its mock data with real API calls, not reinventing it. If the path given does not exist or is not readable, say so and ask again — do not substitute your own design.

### 2. Which port is free

> "Which port should Build Studio use? I plan to check what is free and default to 3020 for the console and 8020 for the API — both outside the range your Amplify stack uses. Confirm or give me different ones."

**Run this first and include the result in your question**, so the answer is informed:

```bash
ss -ltnp 2>/dev/null | awk 'NR>1{print $4}' | sed 's/.*://' | sort -n | uniq
```

Known-occupied on the Amplify stack: `3000`, `3001`, `3002`, `3003`, `3010`, `5050`, `5432`, `8000`. Avoid all of them. Generated applications get their own ports later, allocated from `3100–3199`.

### 3. Model access

> "Which do I use for the agent calls: an Anthropic API key, or GitHub Copilot agent tasks against a repo? If Anthropic, where is the key — I will read it from an environment variable and never write it to a file."

Budget context you should state back to them: the available Copilot allowance is **10,000 AI credits, which is $100**, not an unlimited pool. That is enough for this increment and not much more, so the budget guard below is mandatory rather than optional.

### 4. Where it lives

> "Which directory should the Build Studio project live in? It must be its own project, not inside the Amplify repository."

---

## What you are building

A small web application that takes a business requirement as text, runs the `/brd` prompt against it through Claude, and returns a scored Business Requirements Document that renders in the console.

**That is the whole of increment 1.** One stage. No code generation, no deployment, no containers.

The thing that makes it worth building is not the happy path. It is this:

> **A vague one-line requirement must produce a score below 50, return only a list of questions, and refuse to write a BRD at all.**

If the system will happily produce a confident-looking document from a sentence, it has failed, no matter how good the document looks. Build for that outcome first and demonstrate it before anything else.

---

## Architecture you are implementing

Read these before starting. They are the specification, not background:

- `docs/BUILD-PLAN-studio.md` — architecture, findings, increments
- `Build-Studio-Architecture.html` — the three diagrams
- `.github/prompts/brd.prompt.md` — the prompt you will run; its scoring rules are the contract
- `docs/templates/BRD-TEMPLATE.md` — the output shape

### Components for this increment

| Component | Responsibility |
|---|---|
| **Studio API** | State machine, database, gate transitions. **The only process that holds the API key. The only writer to the database.** |
| **Agent Runner** | Separate process, own OS user. Runs the agent, returns artifacts. Never touches the database. |
| **Workspace** | One git repo per project, built from a template. Holds the context pack and the artifact chain. |
| **Console** | The HTML demo, wired to the API. |

Keep the runner a separate process even though everything is on one machine. That boundary is what lets the sandbox move to its own host later as a deployment change rather than a rewrite. Collapsing it now to save an hour costs a week later.

### Stack

Python 3.11, FastAPI, SQLite for this increment (Postgres later), the Claude Agent SDK for Python. Choose TypeScript instead only if the person handing this to you prefers it — say so and ask, do not switch silently.

### Layout

```
build-studio/
  api/            FastAPI app, state machine, db
  runner/         agent runner — separate process
  console/        the HTML, wired up
  workspaces/     one git repo per project (gitignored)
  templates/      the workspace template, including the context pack
  .env.example    every variable by name, no real values
```

---

## Build steps

### Step 1 — Skeleton and health
API starts on the agreed port. `GET /health` returns `{"status":"ok"}`. Console served and reachable. Nothing else.

### Step 2 — Database
Tables for this increment only:

```
project       id, slug, name, workspace_path, created_at
requirement   id, project_id, raw_text, brd_path, confidence,
              status, capped_by, created_at
agent_run     id, requirement_id, session_id, prompt_ref, model,
              input_tokens, output_tokens, cost_cents, exit_status,
              workspace_sha, started_at, finished_at
gate_event    id, requirement_id, gate, actor, decision, rationale, at
```

Two properties that must be right from the start, because retrofitting them is painful:

- **`gate_event` is append-only.** No UPDATE, no DELETE — enforce it at the schema or grant level, not by convention. An approval that can be edited is not an audit trail.
- **`agent_run` records `workspace_sha`** — the git SHA the agent actually saw. Without it no run can be reproduced or explained afterwards.

### Step 3 — Workspace template and creation
`POST /projects` creates a workspace by **copying the template file by file** and running `git init`.

**Never unpack an archive into a workspace. Never write an uploaded file into one.** From the plan, finding F1: a `.claude/settings.json` or `.mcp.json` sitting in a workspace gets its hooks executed and its MCP servers connected, with no trust prompt. The workspace is constructed by us, from files we control, or it is a code-execution path that opens with a document upload.

Before every agent run, assert the workspace contains no `.claude/settings.json`, `.mcp.json` or `.claude/hooks/` beyond the ones the template wrote. Fail closed.

### Step 4 — Agent Runner
Separate process. Receives `{requirement_id, workspace_path, prompt_ref, input_text}`. Runs the agent. Returns artifacts and usage.

Three things it must do:

- **Pass the requirement as data, never as instructions.** The system prompt comes from our files only. User text goes inside a clearly delimited block. It is untrusted input and a plausible injection surface.
- **Enforce a hard token ceiling per run**, refusing to continue past it. See the budget guard below.
- **Return usage** — input tokens, output tokens, cost — and write it to `agent_run`.

### Step 5 — The BRD stage
`POST /requirements` takes raw text, runs `/brd`, writes `docs/brd/BRD-n.md` into the workspace, commits it, parses the score block, stores it.

Parse the result block that `brd.prompt.md` specifies — confidence, capped-by field, lane, tier, gaps. If you are using the Anthropic API directly, use structured output with a JSON schema so the score comes back typed rather than scraped. If you are on Copilot agent tasks, you will be parsing markdown — make the parser strict and **fail loudly on a shape it does not recognise** rather than defaulting the score to something.

**Never default a missing score to a passing value.** An unparseable result is a failure, not a 75.

### Step 6 — Console
Requirement input, a run in progress, the scored result, the gap list. Show the score with its table so a person can check the arithmetic — a bare number is not the point.

Agent runs take minutes and are non-deterministic. Stream or poll; never block a page on a run.

### Step 7 — Gate 0
`POST /requirements/{id}/approve` writes a `gate_event`. **The API refuses the transition when confidence is below 75**, returns the reason and the capping field, and records nothing as approved.

The refusal lives in the state machine, not in the prompt. The prompt is a strong default; the state machine is the control.

---

## Budget guard — build this in step 4, not later

$100 is the whole allowance. A runaway loop can take a visible bite of it in one afternoon.

- Hard token ceiling per run, enforced in the runner.
- Cumulative spend tracked in `agent_run` and checked before each run starts.
- A configurable cap that stops new runs when reached.
- Log cost per run to stdout so it is visible while developing.

Cost figures from the SDK are **client-side estimates and can differ from the actual bill**. Use them for control, not for accounting.

---

## Definition of done

Demonstrate all six. Numbers 1 and 2 are the point of the increment.

1. **A one-line vague requirement scores below 50, returns only questions, and no BRD is written.**
2. **`POST /approve` on a BRD scoring below 75 is refused, with the capping field named.**
3. A well-specified requirement produces a complete BRD with a visible 18-row scoring table.
4. Every run has a row in `agent_run` with real token counts, cost and the workspace SHA.
5. The workspace is a git repo whose history shows the BRD committed.
6. `gate_event` rejects an UPDATE attempt.

---

## Rules

- **Follow the context pack.** It governs this build too. Lane B applies — you are creating something new. Named constants, recorded decisions in `docs/decisions/`, real tests.
- **Blocks of 300 lines or fewer, one concern each.** You are building the thing that enforces this; build it that way.
- **No secrets in any file.** Key from the environment. `.env.example` lists names with no values. `.env` is gitignored before the first commit, not after.
- **Do not touch the Amplify stack.** Different directory, different ports, its own database file. Nothing shared.
- **Do not build ahead.** No stage 2, no containers, no deployment. If you finish early, write tests.
- **When the plan is wrong, stop and say so.** Do not adapt silently, and do not fix the adjacent thing you noticed — raise it.

---

## Report back with

```
Increment 1 — status

Answers received:   frontend path / port / model access / directory
Ports in use:       <what ss showed>
Chosen ports:       console <n>, api <n>

Built:              <steps completed>
Definition of done: <each of the 6, pass or fail>

Spend so far:       $<n> of $100
Assumptions made:   <each, with where>
Noticed, untouched: <things worth a ticket>

Blocked on:         <what you need from a person>
```
