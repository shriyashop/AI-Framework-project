# CLAUDE.md

This repo is the **AI Framework project**: a governed engineering pipeline (`/brd → /plan → /implement → /test → /review`) and **Build Studio**, the app that runs it.

**Read `docs/HANDOVER.md` first.** It holds the state of the work, every decision taken so far and why, what is blocked, and the recommended next step. Then `docs/SETUP-NEW-ENV.md` to run it.

## Rules that apply to all work here

1. **Plan first.** The user wants a plan to review before anything is executed. Do not start building from a request without one.
2. **Never advance a gate yourself.** Gates need a named human. The state machine refuses transitions; prompts are only a default.
3. **No secrets anywhere.** `.env` is gitignored. Never print, log or commit a token. The GitHub PAT is read only by the Agent Runner container.
4. **Tests ship with the change.** `build-studio` has 59 tests; keep them green.
5. **Ask before irreversible or outward-facing actions** (pushing, deleting, changing repo visibility, spending Copilot or API credits).
6. **Do not guess scope.** If the plan is wrong, stop and say so.

## Decisions you must not silently reverse

- Backend is Python 3.11 + FastAPI; the React console is compiled in a throwaway Docker `node:22` stage. Node is not installed on the host and is not used at runtime unless truly unavoidable.
- Ports are in the 8000 series: API and console on **8020**, Agent Runner on **8021** (not published; reachable only from the API).
- Studio **recomputes** the BRD confidence score from the 18 rows and never trusts the agent's number. An unparseable result is a failure, never a default score.
- The Agent Runner, not the Studio API, holds provider credentials.
- Amplify (`Digital_POC_Amplify`) is a separate repo and must not be modified by this work.

## Where things are

| Path | What |
|---|---|
| `build-studio/` | The application, with its own README, Dockerfile, compose file, tests and `docs/decisions/ADR-001…007` |
| `inputs/` | The specs it was built from: build plan, handover 01, Figma console zip |
| `context-pack/` | The framework's context pack (`.github/`, `.claude/`, `AGENTS.md`, memo, runbook, discovery and plan docs) |
| `factory-demo-pack/` | Original demo pack, including a deliberately vulnerable app and an answer key |
| `docs/` | Handover, setup, plans and seed memory notes (`docs/claude-memory/`) |

Run the tests: `cd build-studio && .venv/Scripts/python -m pytest` (about 90 seconds; most of it is git on Windows).
