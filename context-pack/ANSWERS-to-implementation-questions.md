# Answers to Implementation Questions

**Re:** the 16 questions on the demo pack, runbook and reconciliation memo
**Status:** answers marked **[ANSWERED]** are settled. Answers marked **[DECISION NEEDED]** are not mine to make — they are flagged with a recommendation and who should decide.

---

## Read this first — two corrections

Two questions rest on a misreading of the memo, and one of them would cause real harm if acted on.

### Correction 1 — nothing broken is being preserved for the demo (Q11, Q13)

The memo lists four repo-hygiene items in §5 under the heading **"What in Amplify needs fixing first."** All four are things to fix. None of them is being kept as demo material.

What §6 says is narrower: the Integration Hub duplication is *persuasive material for the Act 3 demo*, because it is a real, documented instance of exactly the drift the platform exists to catch. That is an argument for **demonstrating the capability on a problem we already have**. It is not an argument for leaving the problem in place.

**Deliberately preserving a known defect so that a demo looks better is not acceptable, and if it were ever discovered it would destroy the credibility of the entire programme.** The sequence is: document it now, demo it next week, fix it after — and fixing it is the best Lane A pilot candidate we have, because the discovery work will already be done.

If the demo slips past the point where the fix should happen, the fix wins and the demo finds different material.

### Correction 2 — the prompts are Copilot files, not `.claude/` commands (Q1, Q2)

The pack ships `.github/prompts/*.prompt.md`, which is GitHub Copilot's documented convention. Several questions assume `.claude/` slash commands.

Both now work. I have added a thin `.claude/` adapter — `CLAUDE.md` plus seven files in `.claude/commands/` that each point at the corresponding `.github/prompts/` file. **The prompt content is not duplicated**, deliberately: two copies of a governance rule drift, and a drifted governance rule is worse than none. There is one source of truth per command and the adapter is three lines.

---

## Context pack / demo pack

### Q1 — What exactly is in the zip? **[ANSWERED]**

The original zip contained the legacy app, the answer key, and the Copilot prompt files. It did **not** contain `.claude/` commands or the `docs/discovery` and `docs/plans` templates — you were right to notice those were referenced but absent. Both are now included.

Full contents of the updated pack:

```
README.md                                   Start here
CLAUDE.md                                   Claude Code entry point → points at copilot-instructions
AGENTS.md                                   agents.md-aware tools

docs/
  reconciliation-memo.md                    The blueprint/deck reconciliation
  demo-runbook.md                           Turn-by-turn demo script
  ANSWERS-to-implementation-questions.md    This file
  SANDBOX-API-CONTRACT.md                   NEW — answers Q5
  discovery/_TEMPLATE.md                    NEW
  plans/_TEMPLATE.md                        NEW
  change-records/                           (schema is in change-record.prompt.md)
  decisions/                                For Lane B decision records

.github/
  copilot-instructions.md                   Repo-wide, always loaded — the operating model
  instructions/
    lane-a-modernize.instructions.md        applyTo: legacy/**
    lane-b-build.instructions.md            applyTo: **
    security-and-data.instructions.md       applyTo: **
    amplify-platform.instructions.md        applyTo: backend/**, frontend/**, …
  prompts/
    understand · plan · implement · test · review · explain-back · change-record

.claude/
  commands/                                 NEW — 7 thin wrappers, no duplicated content

legacy/expense-claims/
  server.js                                 896 lines, six business rules, four undocumented
  db/schema.sql, db/seed.sql                8 employees, 40 claims, every rule exercised
  static/                                   jQuery-era frontend
  LEGACY-NOTES-DO-NOT-SHIP.md               OPERATOR ANSWER KEY — never on screen
```

### Q2 — Are the commands meant to be `.claude/` slash commands, and what is their spec? **[ANSWERED]**

They are now available as both. The full spec for each is the corresponding file in `.github/prompts/` — those are the specification, not a summary of one. Read them; they are the substance of the pack.

Gate behaviour in brief:

| Command | Input | Output | Stops at |
|---|---|---|---|
| `/understand` | path to component | `docs/discovery/<name>.md` | End of discovery. **Proposes nothing.** |
| `/plan` | requirement | `docs/plans/<name>.md` | **GATE 1.** Writes no code, not even snippets. |
| `/implement` | approved plan path | code + tests on a branch | Before PR. Refuses if no approved plan, or if tier is V4. |
| `/test` | human-authored criteria | tests, executed | Refuses if criteria are absent or AI-authored. |
| `/review` | branch or diff | findings, split by confidence | **Never approves.** Ends with what a human must check. |
| `/explain-back` | the change | three questions, then waits | Waits for answers. Grades honestly. Blocks the gate on fail. |
| `/change-record` | the change | `docs/change-records/CR-<id>.md` | Append-only. Never records an approval that did not occur. |

Two behaviours are worth knowing because they will look like malfunctions:

- **`/plan` stops and does not write code.** That is the point, not a limitation. It will not "start on the easy parts" if asked.
- **`/explain-back` will not help you.** For that one prompt it is an examiner. It asks, waits, and grades. If someone asks it to skip, it declines.

### Q3 — Standalone repo or wired into Amplify permanently? **[ANSWERED — both, in two steps]**

**Now:** standalone. Unzip somewhere separate and rehearse. The demo needs Act 1 to run *without* the context pack, and you cannot cleanly remove it from a working repo without disturbing that repo.

**After the demo:** the `.github/` folder, `CLAUDE.md` and `AGENTS.md` go into `Digital_POC_Amplify` permanently. The `legacy/expense-claims` app does not — see Q14.

When you do move it, rewrite `amplify-platform.instructions.md` against the real codebase. **Its "Known traps" section is where the value is**; the generic conventions matter far less than the list of things that have actually broken.

---

## Scope and decisions (memo §7)

### Q4 — Both lanes in scope, Lane B first, and what timeline? **[DECISION NEEDED]**

Both lanes in scope and Lane B first are my recommendations, not settled facts. They are decisions 1 and 4 in memo §7 and need whoever sponsors this programme to take them.

**Timeline: I cannot give you one, and you should distrust anyone who does at this stage.** It depends on the four open items in memo §8 — what "upgrade" concretely means, what the legacy technologies are, whether those apps are in Git with tests and reproducible builds, and internal-versus-client.

What I can offer as a shape, for planning only:

| Milestone | Rough | Gated on |
|---|---|---|
| Demo rehearsable | days | Nothing — the pack is complete |
| Context pack live in Amplify, developers using it | 1–2 weeks | Nobody's approval but yours |
| Lane B: one new component through the full governed pipeline, manually orchestrated | 3–4 weeks | A volunteer team, a real backlog item |
| Lane B: gateway + sandbox + orchestrator automating it | Blueprint's Phase 0 + 1, ~14–16 weeks | Funding, the sandbox hosting decision (Q5), staffing |

The first two rows deliver real value with no platform build at all. **That is worth saying explicitly to whoever is deciding**: the context pack is not a demo prop, it is a working deliverable that improves output on day one, and it does not require the platform to exist.

### Q5 — Sandbox outside the compose stack: hosting target and API contract? **[SPLIT]**

**Confirmed, and this one is not open for discussion.** Memo §7 decision 2, and the sandbox invariants are non-negotiable.

**API contract: [ANSWERED]** — see `docs/SANDBOX-API-CONTRACT.md`, newly added. It specifies the five invariants, the four endpoints, the single audit callback, what the control plane owns, and the list of "convenient" changes that must be rejected. Build against it.

**Hosting target: [DECISION NEEDED]** — I cannot name a subscription, resource group or VNet because I do not know your Azure estate. The requirement, in preference order:

1. **Separate subscription**, own VNet, no peering — preferred. Blast radius stops at the subscription boundary and separate billing makes sandbox cost visible for FinOps.
2. Same subscription, separate VNet, **no peering**, own resource group — acceptable.
3. Same VNet with NSG separation — **reject.** One misconfigured rule from breaking the core invariant.

**What we need from you:** can a new subscription be obtained, who owns VNet topology, and who signs off the network design. That is a conversation with whoever owns the Azure landing zone, and it should start now because it has a lead time measured in weeks and blocks Phase 0.

### Q6 — Competency ladder: who writes it, and before or after the Lane B pilot? **[DECISION NEEDED on owner, ANSWERED on timing]**

**Timing: before.** It is not documentation of the pilot, it is the mechanism that makes the pilot safe. Without it the gates have no defined approver competency, which is the specific gap that makes the whole thing unsafe given the workforce premise. Writing it after means running the pilot with the control absent.

It does not need to be long. Four levels, entry and exit criteria, what each may ship without review, and the lane-routing rule. Two pages.

**Owner: yours to assign.** It needs someone who can make competency judgements stick — an engineering lead or head of practice, not the platform team. If the platform team writes it, it reads as tooling policy and gets ignored. Roughly a day's work with the discarded `.md` as source material, which already had the ladder drafted.

### Q7 — pgvector: shared `amplify` database or dedicated? What scale? **[ANSWERED]**

**A dedicated `factory` database on the same Postgres 15 instance.** Not a schema inside `amplify`.

Reasoning: separate backup and restore lifecycle, separate connection limits so an indexing run cannot exhaust Amplify's pool, and a hard boundary meaning a Factory bug cannot touch Amplify tables. It shares the instance, so no new infrastructure — you get the isolation without the operational cost.

**Sizing — this is not going to be a problem:**

| Input | Estimate |
|---|---|
| Chunking | ~40 lines of code per chunk |
| Per 100k LOC | ~2,500–4,000 chunks |
| Embedding dimensions | **1536** (recommended — good quality/size balance, widely supported) |
| Storage per vector | ~6 KB at 1536 dims, float32 |
| Per 100k LOC | **~15–25 MB**, plus ~1.5× for an HNSW index |
| Entire estate, say 2M LOC | **~1 GB** including indexes |

Postgres 15 with pgvector handles this without partitioning, tuning or a dedicated instance. Use HNSW rather than IVFFlat — better recall, and at this scale the build cost is irrelevant.

The thing that will actually cost you is **re-embedding on every merge**. Chunk by structure (function, class, module) rather than fixed line windows, hash each chunk, and only re-embed chunks whose hash changed. Without that you re-embed the world on every commit and the FinOps line item becomes visible for the wrong reason.

---

## Amplify integration (§5)

### Q8 — Practice HUB pattern, or a new Django app? **[ANSWERED — Practice HUB pattern]**

Confirmed: separate service, own tables, own port, own auth, sharing the Postgres instance.

Reasoning: the orchestrator wants LangGraph, which is Python but not Django; the gateway is a thin high-throughput proxy that should not sit behind Django's request cycle; and the sandbox client must be independently deployable and independently secured. Practice HUB already proves this shape works in this repo.

Two refinements to the pattern:

- **Own database, not just own tables** (Q7). Practice HUB shares `amplify` with `ph_*` prefixes; the Factory should go further because it will hold audit records.
- **Do route the console through nginx.** Practice HUB sits outside nginx on its own port; that is fine for an internal tool but the Factory console needs SSO and a stable URL. Follow Practice HUB for the *service topology*, not for the *routing exception*.

**And do not repeat the `managed=False` mirror.** The unused `practicehub` Django app is a mistake to learn from, not a pattern to copy. If Django needs to read Factory data, expose an API.

### Q9 — Which "extend, don't rebuild" items are in scope now? **[ANSWERED — none of them yet]**

**Reserve the integration points. Do not plan schema or API changes to existing Django models in this phase.**

Every one of those six is a *destination* for Factory data that does not exist yet. Changing `AIAgent` or `Asset` now means guessing at the shape of data no service is producing, and you will guess wrong. That is speculative coupling — precisely what `lane-b-build.instructions.md` tells the agent not to do, and it would be a poor look for the platform's own first commits.

**Now:** document the intended integration point for each in the design. One paragraph each: which Factory concept lands there, roughly what shape, what would have to change.

**When Phase 0 produces real Change Records and real cost data:** extend for real, against actual data, as normal Lane A work through the governed pipeline. That is also a good early dogfooding candidate.

The one possible exception is **Assets / the reusable-asset marketplace**, because reuse-before-build is enforced from the first agent task and needs something to search. Even there, seed 3–5 entries by hand for the MVP rather than building federation — that is exactly what the blueprint's MVP scope says.

### Q10 — One service or several? Which stack? **[ANSWERED]**

**Two services in Phase 0, not five, and not one.**

| Service | Contains | Stack | Why |
|---|---|---|---|
| `factory-gateway` | Model routing, cost metering, redaction, prompt-injection screening | Python or Node — **adopt LiteLLM and extend** | Different scaling profile, different failure mode, and it must be independently deployable so a model provider change never touches the orchestrator. Do not build this from scratch; it is commodity plumbing. |
| `factory-core` | Orchestrator (LangGraph), context/index service, maintainability engine, audit service | **Python 3.11+, FastAPI**, alongside Django rather than inside it | These four share the workflow state and the same database transactions. Splitting them in Phase 0 buys distributed-systems problems for no benefit. |

Split `factory-core` later, when a component has a genuinely different scaling or ownership profile — most likely the context/index service, once re-indexing becomes heavy. Splitting on day one is speculative architecture.

**On LangGraph specifically:** yes, a new Python service, distinct from Django `backend`. Do not attempt to host LangGraph inside Django — the execution model fights the request/response cycle and you will end up with Celery holding a state machine, which is the worst of both.

Isolate the orchestration framework behind an internal interface (blueprint ADR #3). LangGraph is the right call today and this space is moving quickly; a framework swap should be a contained change.

---

## Repo hygiene (§5)

### Q11 — `makemigrations` on every start: fix now or leave as demo material? **[ANSWERED — fix]**

Fix it. See Correction 1 — it was never demo material.

Not necessarily *now*, though. It is not blocking, and it is a change to `entrypoint.sh`, which `amplify-platform.instructions.md` lists as out-of-bounds without design review. **Treat it as its own small ticket**, ideally an early Lane A exercise through the governed pipeline once the pack is in place.

Fix it before the Factory ships, and definitely before anyone reviews this platform's own repository as evidence that it practises what it preaches. Runtime-generated migrations contradict "everything version controlled" directly, and that principle is in the blueprint.

### Q12 — Hard-coded credentials in compose: now or later? **[ANSWERED — now, it is 20 minutes]**

Move them to a `.env` file now, gitignored, with a committed `.env.example`. It is a small change with no design implications.

It becomes urgent the moment model-provider API keys enter this stack, and it is the first thing anyone auditing a governance platform will look at. Key Vault before pilot; `.env` this week.

Rotate anything that has been in the repository. Removing a credential from a file does not remove it from git history — assume it is compromised.

### Q13 — Do NOT reconcile the Integration Hub duplication? **[ANSWERED — no, that is backwards]**

See Correction 1. Do not preserve a defect for a demo.

**Sequence:**

1. **Now:** document it. `/understand` across both implementations, output to `docs/discovery/`. This is the discovery artifact.
2. **Demo:** show the discovery finding it. The finding is what impresses, and it exists whether or not the underlying problem has been fixed yet.
3. **After:** reconcile it. Establish which is canonical, plan the convergence, run it through the pipeline.

Step 3 is the **best Lane A pilot candidate available** — real, bounded, valuable, and the discovery work is already done from step 1. It also produces a far better second demo than the original: *"here is the problem we found, and here is the governed change that fixed it, with the audit trail."*

Same answer for the unused `practicehub` mirror app, which is a smaller job. Do confirm nothing reads it before deleting — "appears unused" is not the same as unused, per `lane-a-modernize.instructions.md`.

---

## Demo mechanics

### Q14 — Does the legacy app live in this repo or separately? **[ANSWERED — separately]**

Separate. It is a demo fixture, not part of the product, and committing a deliberately vulnerable application into the Amplify repository is a bad idea for three reasons: it will trip SAST in CI, someone will eventually find the SQL injection and file a real security ticket, and `LEGACY-NOTES-DO-NOT-SHIP.md` should not sit in a repo that people browse.

Keep the demo pack as its own folder or repo. Only `.github/`, `CLAUDE.md` and `AGENTS.md` migrate into Amplify.

### Q15 — Does `.claude/settings.local.json` need changes between acts? **[ANSWERED — no]**

No settings changes are needed for either tool.

**The reliable method for Act 1 is to run from a directory that does not contain the pack.** Keep two folders — one clean copy of `legacy/expense-claims` for Act 1, one full pack for Act 2 — and switch windows. Renaming `.github/` mid-demo is fiddly and fails silently, which is the worst failure mode in front of an audience.

**Verify rather than assume.** In Copilot Chat, check the References list on a response — it names the instruction files that were applied. In Claude Code, `/context`. Do that check on camera during rehearsal, never for the first time in the room.

Restarting the chat session between acts is still worth doing; instruction changes are picked up at session start.

### Q16 — Build the Factory, or prep the demo? **[ANSWERED — prep the demo]**

**Prep the demo. Do not build the platform yet.**

Concretely, in order:

1. Unzip the pack standalone; confirm `node server.js` runs (Node 22+)
2. Read `LEGACY-NOTES-DO-NOT-SHIP.md` end to end — know all six rules cold
3. Rehearse Act 1 **at least three times** and record what it misses each run. It is generative; it will not miss the same rules every time, and your script must match what is actually on screen
4. Rehearse Act 2 twice; save a good `docs/discovery/expense-claims.md` as a fallback
5. Run `/understand` against the real Integration Hub duplication for Act 3, and save that output too
6. Read `docs/demo-runbook.md` §"Operator preparation" — particularly the reframe for the run where the agent catches all six rules

Nothing above requires a gateway, an orchestrator or a sandbox. **The demo runs entirely on the context pack**, which is the point: the pipeline's value shows up before the platform is built.

The platform build starts after the §7 decisions are taken and Phase 0 is funded. Building it before those decisions means building against assumptions — and one of them, the sandbox hosting decision, cannot be retrofitted.

---

## Things you did not ask about, but need

**The pack is instructions, not enforcement.** Personal instructions override repository ones, so a developer can weaken these locally. They make the right thing easy and the wrong thing visible; they do not make the wrong thing impossible. Real enforcement is branch protection, required status checks, SAST in CI and a human who reads the diff. Overclaiming this is the fastest way to lose an architecture review — the README states it plainly and you should too.

**Context files decay, and a stale one is worse than none** because it actively steers output wrong. Assign an owner to each instruction file and review them at the same cadence as dependency updates.

**Capture the baseline before the demo, not after.** Current cycle time, defect escape rate, review rework loops, PR size distribution. Without a baseline, no claim about improvement is defensible later, and the moment before a visible pilot is the last moment anyone will agree the numbers are unbiased.

**Watch defect escape rate above everything else.** If it rises while velocity rises, the framework is failing regardless of how good adoption looks. That is the metric that tells the truth.

**Do not mandate usage.** Adoption targets produce theatre. Make the pack good and let usage follow — and if it does not, that is information about the pack, not about the people.

**Anticipate the "isn't this slowing us down" challenge**, because it will come in the first ten minutes. The runbook has the answer: the ungoverned run took ninety seconds and produced a defect that would have passed review because it looked better than the original; the governed run took eleven minutes and produced something shippable. The comparison is not ninety seconds against eleven minutes — it is eleven minutes against a production incident in a system nobody understands.
