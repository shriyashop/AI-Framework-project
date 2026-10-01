# Ship Build Studio and its full context to a new environment

## Context

The user is switching dev environment (another machine, same Claude Code) and the product will be revamped there. They want the code plus **all context from this chat** shipped via `https://github.com/shriyashop/AI-Framework-project`. They have made that repo **public**.

**Decisions from the user:**
- Visibility: **make it private again, then ship.**
- New environment: another machine with Claude Code, so the bundle auto-loads through a `CLAUDE.md`.
- Revamp: **ship as-is, and the revamp happens in the new environment.** The handover includes a recommended direction.

**Why visibility is urgent.** A read-only check showed the public repo already contains:
- real employee names and work emails with the default password the shared default password (`context-pack/README.md`);
- internal memos (`reconciliation-memo.md`) and the OPmobility logo;
- ContactHUB and client material in the demo data;
- the `LEGACY-NOTES-DO-NOT-SHIP.md` answer key and a deliberately vulnerable app (`factory-demo-pack/`);
- the user's work email (`the work email address`) on all 5 commits.

The history holds all of it, so flipping to private stops further exposure but cannot undo any scraping during the public window.

## What gets shipped

All new files are committed at the repo root, so the new machine gets them with one `git clone`.

1. **`CLAUDE.md` (root).** It auto-loads in Claude Code. It is short: what the repo is, "read `docs/HANDOVER.md` first", the non-negotiable rules (never advance a gate, no secrets, tests with the change), the stack and port decisions, and where things live. There is no root `CLAUDE.md` today. The nested ones in `context-pack/` and `build-studio/` stay as they are.
2. **`docs/HANDOVER.md`.** It carries the context from this chat:
   - *What Build Studio is* and how it traces to `inputs/` (build plan, handover 01).
   - *State of increment 1.* The definition-of-done table (the 6 items, with what is proven on the fake runner versus not yet live). It also records 59 passing tests, commit `7c3158a`, and the containers on port 8020.
   - *Architecture as built.* Studio API, the Agent Runner (the only holder of the GitHub PAT), the console, the workspace branch `poc-workspace`, the strict parser that recomputes the score, and the diff guard.
   - *Decision log* in order, with the user's own words where it matters:
     - Copilot agent tasks, then blocked by the "Copilot cloud agent policy disabled by an administrator" setting.
     - Python and FastAPI over Node.
     - A Docker-only Node build.
     - The shared-repo-with-orphan-branch change.
     - Ports in the 8000 series.
     - The budget guard skipped.
     - The Azure DevOps answer: Copilot cloud agent needs GitHub, and Azure Repos is not supported.
   - *Blocked / open:* the Copilot policy, with the alternatives ranked: Foundry, an Anthropic key, another company model, a local model, or manual `/brd`. Spike A never ran live.
   - *Recommended next steps.* Build a Claude-API runner mode alongside the Copilot one (the same runner interface; structured JSON gives real token and cost data and makes the budget guard possible), then run the live spike, then increment 2.
   - *Noticed and untouched.* The demo's TypeScript errors in the FinOps view (`chargebackModel` undefined), the gate naming difference (G0 versus G1), the missing `Build-Studio-Architecture.html`, the two diverging context-pack copies, and the Amplify remote URL that carries an Azure DevOps token in plain text.
   - *Security and exposure log* (see below), in words only, with no credentials.
   - *Environment gotchas learned:* Windows and Git Bash heredoc quirks, `robocopy` needing valid flags, folders locked by VS Code, starting Docker Desktop, CRLF warnings, and pytest taking about 90 seconds because of git on Windows.
3. **`docs/SETUP-NEW-ENV.md`.** Steps to reproduce from scratch: clone, install Docker and Python 3.11, copy `build-studio/.env.example` to `.env` and generate `RUNNER_SHARED_TOKEN`, then `docker compose up -d --build`, then run the tests. It includes a note that the old Docker volumes hold fake test data and should be wiped before any live run.
4. **`docs/claude-memory/`.** Seed memory files (user preferences, project decisions, feedback) plus `MEMORY.md`, with a three-line copy instruction for the new machine's `~/.claude/projects/<project>/memory/`. They capture:
   - the Python/FastAPI stack preference (Node only if unavoidable);
   - ports in the 8000 series;
   - the Copilot-blocked state and the chosen direction;
   - that the user wants a plan before execution;
   - the repo and ownership facts (personal GitHub account, company repo for Amplify).
5. **`docs/plans/`.** A condensed copy of the approved increment-1 plan, and this shipping plan. The original increment-1 plan file was overwritten during the session, so I reconstruct it from this conversation.

**Deliberately not shipped:** the raw chat transcript (`~/.claude/projects/c--python/<session>.jsonl`). It contains the Azure DevOps token that appeared in command output, so it must not go into any repo. The handover says this and gives the path, in case the user wants to move it by a private channel. `.env` and the PAT are never committed.

## Steps

1. **Gate: the user flips the repo to Private** (Settings, Danger zone, Change visibility). I cannot do it. I verify with the unauthenticated GitHub API: a 404 means private. If it is still public, I write the files locally but do **not** push.
2. Write the five items above. Reuse `build-studio/docs/decisions/ADR-001…007` by linking, not copying. Reuse the DoD wording from `inputs/HANDOVER-01-build-studio-increment-1.md`.
3. Scan the new files: no `github_pat_`, no `ghp_`, no `://user:token@`, no the shared default password, no `.env` content, and no work email or password values (describe them, do not quote them).
4. Commit with the Co-Authored-By trailer and `git push` (existing login, prompts disabled, timeout).
5. Leave the containers as they are, and note this in the handover.

## Verification

- `git ls-remote origin` shows `main` at the local HEAD.
- Clone fresh into a temp folder and check that root `CLAUDE.md`, `docs/HANDOVER.md`, `docs/SETUP-NEW-ENV.md` and `docs/claude-memory/` exist and read correctly.
- From that clone, run `docker compose config` and the test suite (expected: 59 passing).
- Grep the clone for secret patterns (expected: none), and confirm no `.env` is tracked.
- Confirm the repo is private (unauthenticated API returns 404).

## User actions I will list at the end

- Set the repo to Private now.
- Rotate or retire the the shared default password passwords if any are real.
- Rotate the Azure DevOps token in Amplify's remote URL, and move it to the credential manager.
- Consider deleting and recreating the GitHub repo (or rewriting history) if the public window is a concern, and switching the commit email to a personal or noreply address.
- Ask the Copilot admin about the cloud-agent policy, or pick one of the alternatives in the handover.
