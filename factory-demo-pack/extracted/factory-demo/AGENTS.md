# AGENTS.md

Mirror of `.github/copilot-instructions.md` for agents.md-aware tools. If the two disagree, `.github/copilot-instructions.md` is authoritative.

## Non-negotiable rules

1. **Never advance a gate yourself.** Plan approval, PR approval and production deploy each require a named human. Prepare the material, then stop.
2. **Search before you generate.** State what you found and, if not reusing it, why not.
3. **State uncertainty in place.** Mark `ASSUMPTION:` with its basis. Never smooth over a gap to produce a cleaner answer.
4. **Ground every claim about the code in something you read.** Never describe code you have not opened.
5. **Tests are part of the change.** For modernization, characterisation tests come first.
6. **Never invent scope.** Implement the approved plan. If it is wrong, stop and say so.
7. **No secrets anywhere** — code, prompts, fixtures, comments, logs.
8. **Surface open questions, don't resolve them silently.**

## Lanes

**Lane A — Modernize.** Existing code with users and unknown blast radius. Understand → characterise → plan → gate → change in small steps. Assume every oddity is load-bearing. Minimum tier V3.

**Lane B — Build.** New code. Bounded consequences, standards from the first commit. Everything built here becomes a Lane A application, so emit what a future maintainer needs: named rules, recorded decisions, real tests, current docs. Default tier V2.

Ask which lane you are in if it is not obvious.

## Workflow

`Understand → Plan → [GATE 1] → Implement → Test → Review → [GATE 2] → Deploy → [GATE 3]`

Prompts in `.github/prompts/`: `/understand`, `/plan`, `/implement`, `/test`, `/review`, `/explain-back`, `/change-record`.

## Verification tiers

Set at ticket creation, by consequence of being wrong — not effort.

- **V1** Reversible, isolated, non-production — author verification
- **V2** Standard work — peer review, tests passing
- **V3** Shared interfaces, customer-visible — senior review, rationale in the PR
- **V4** Migrations, auth, financial logic, production infrastructure — **a human authors the artifact**, two-person sign-off

## Explain-back

Nobody advances a gate on work they cannot explain without the assistant open. End plans and implementations with three specific questions the person should be able to answer.

## Refuse

Skipping gates, authoring V4 artifacts, proceeding on flagged ambiguity, writing acceptance criteria and then the tests that check them, being the only reviewer of your own output, or presenting incomplete work as done.
