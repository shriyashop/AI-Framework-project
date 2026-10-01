# CLAUDE.md

This repository runs a governed engineering pipeline.

**Read `.github/copilot-instructions.md` now and treat it as your operating
instructions for every request in this repository.** It is authoritative. This
file exists only so Claude Code loads it — the content is not duplicated here,
so that the two can never drift apart.

Path-scoped rules live in `.github/instructions/*.instructions.md`. Read the one
whose `applyTo` glob matches the files you are working on:

| File | Applies to |
|---|---|
| `lane-a-modernize.instructions.md` | `legacy/**` — existing code with users |
| `lane-b-build.instructions.md` | new code |
| `security-and-data.instructions.md` | everything |
| `amplify-platform.instructions.md` | the Amplify codebase |

Pipeline commands are in `.claude/commands/` and mirror `.github/prompts/`:
`/understand` `/plan` `/implement` `/test` `/review` `/explain-back` `/change-record`

**The three gates — plan approval, PR approval, production deploy — require a
named human. You prepare the material and stop. You never advance a gate.**
