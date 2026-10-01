# Increment 1 plan (as approved, condensed)

Reconstructed from the planning session on 2026-10-01; the original plan file was overwritten. For what was actually built, see `../HANDOVER.md`.

**Goal:** a requirement goes in, `/brd` runs, a scored BRD renders in the console. Prove the refusal path: a vague one-liner scores below 50 with questions only and no BRD; G0 refuses approval below 75, naming the capping field.

**Agreed decisions:** separate project outside Amplify; React console from the zip, compiled in a throwaway Docker `node:22` stage and served by FastAPI; GitHub Copilot agent tasks for model access; the Agent Runner holds the PAT; the budget guard deferred; ports 8020 (API and console) and 8021 (runner).

**Steps:**
0. Spike: run one real Copilot task against the context pack (never ran live; see the handover).
1. Skeleton and `/health`; named constants in `api/config.py`; `.env.example`; `.gitignore` first.
2. SQLite: `project`, `requirement`, `agent_run` (token and cost columns nullable), `gate_event` (append-only via triggers).
3. Workspace constructed file by file from templates, with a manifest and a fail-closed preflight.
4. Agent Runner: separate process, token-authenticated, prompt builder with the requirement as delimited data, GitHub Agent Tasks client, `RUNNER_MODE=fake`.
5. BRD stage: strict parser that recomputes the score, diff guard, Studio commits the validated files and closes the PR, poller with a wall-clock timeout.
6. Console: Requirements screen wired live (project picker, submit, polling, 18-row table with the arithmetic, gaps, G0 panel); the other eight stages stay mock.
7. Gate G0 in the state machine; a refusal is recorded as a `gate_event` and nothing is approved.

**Definition of done:** the six items in `inputs/HANDOVER-01-build-studio-increment-1.md`.
