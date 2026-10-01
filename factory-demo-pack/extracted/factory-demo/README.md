# AI Engineering Factory — Demo Pack

Everything needed to run the showcase and to drop the governance layer into a real repository.

Built for **GitHub Copilot with Claude Sonnet**. The instruction and prompt files use Copilot's documented conventions, so they load automatically — no configuration.

---

## What's here

```
docs/
  reconciliation-memo.md      Read this first — resolves the blueprint/deck contradictions,
                              names the two lanes, sites the platform in Amplify
  demo-runbook.md             Turn-by-turn script for the 25-minute showcase
  ANSWERS-to-implementation-questions.md
                              16 implementation answers + two corrections. Read before building.
  SANDBOX-API-CONTRACT.md     The security boundary. Five invariants, four endpoints.
  discovery/_TEMPLATE.md      Output shape for /understand
  plans/_TEMPLATE.md          Output shape for /plan, with the Gate 1 block

.github/
  copilot-instructions.md     Repo-wide. Loads on every request. The operating model.
  instructions/
    lane-a-modernize.*        Rules for changing existing code (applyTo: legacy/**)
    lane-b-build.*            Rules for new code
    security-and-data.*       Classification, secrets, the sandbox boundary
    amplify-platform.*        House conventions + known traps for the Amplify repo
  prompts/
    understand.prompt.md      /understand  — grounded discovery, finds undocumented rules
    plan.prompt.md            /plan        — stops at Gate 1
    implement.prompt.md       /implement   — approved plan only, no added scope
    test.prompt.md            /test        — independence rule, characterisation tests
    review.prompt.md          /review      — first pass, never approves
    explain-back.prompt.md    /explain-back— the gate control
    change-record.prompt.md   /change-record — the audit artifact

AGENTS.md                     Mirror for agents.md-aware tools
CLAUDE.md                     Claude Code entry point — points at copilot-instructions.md
.claude/commands/             Claude Code adapter — 7 thin wrappers, content not duplicated

legacy/expense-claims/        The demo subject: a deliberately dated app with six
                              business rules, four undocumented, one answer key
```

---

## Quick start

**1. Run the legacy app** (Node 22+, zero dependencies, no install):

```bash
cd legacy/expense-claims
node server.js
```

**2. Open the repo root in VS Code** with GitHub Copilot, agent mode, Claude Sonnet.

**3. Try it:**

```
/understand legacy/expense-claims/server.js
```

**4. Read `docs/demo-runbook.md`** before showing anyone.

---

## How the files load

| File | When it applies | Support |
|---|---|---|
| `.github/copilot-instructions.md` | Every request | VS Code, JetBrains, Visual Studio, Eclipse, Xcode |
| `.github/instructions/*.instructions.md` | Files matching `applyTo` | VS Code, Visual Studio |
| `.github/prompts/*.prompt.md` | Invoked with `/name` | VS Code, JetBrains, Visual Studio |
| `AGENTS.md` | Every request | VS Code (and other agents.md tools) |
| `CLAUDE.md` + `.claude/commands/` | Every request / `/name` | Claude Code |

Personal instructions override repository ones, so a developer can weaken these locally. Worth knowing before relying on them as a control — they are a strong default, not an enforcement boundary. Enforcement lives in CI and branch protection.

---

## Using this on a real repository

1. Copy `.github/` and `AGENTS.md` into the target repo.
2. Rewrite `amplify-platform.instructions.md` for that codebase — **the "Known traps" section is where the value is.** Generic conventions change little; the traps that have caused real incidents change a lot.
3. Delete lane instructions that don't apply, and adjust `applyTo` globs to the real layout.
4. Give each file an owner and review it when standards change. **A stale context file is worse than none** — it actively steers output wrong.

The highest-value thing you can add is the list of things that have broken in production here, and the constraints that are not obvious from reading the code.

---

## What this pack does and doesn't do

**Does:** make AI output arrive already conformant to house standards; stop the agent at approval gates; force reuse to be searched before code is generated; make undocumented business rules discoverable before a rewrite drops them; produce an audit trail.

**Doesn't:** enforce anything. These are instructions to a cooperative agent, not controls. Real enforcement is branch protection, required checks, SAST in CI, and a human who reads the diff. The context pack makes the right thing easy and the wrong thing visible — it does not make the wrong thing impossible.

Anyone evaluating this should understand that distinction. Overclaiming it is the fastest way to lose an architecture review.

---

## Open decisions

Section 7 of the reconciliation memo. Four decisions, and everything downstream follows from them:

1. Both lanes in scope, stated explicitly in both documents?
2. Sandbox outside the Amplify compose stack? *(recommended: yes, non-negotiable)*
3. Competency ladder reinstated as a blueprint section?
4. Which lane goes first? *(recommended: Lane B)*
