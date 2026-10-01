# Handover: Build Studio, increment 1

Written 2026-10-01 for whoever continues this (a new machine, a fresh Claude Code session). It captures what was decided and learned in the first working session, so nothing has to be re-derived.

Status in one line: **increment 1 is built and tested against a fake runner; it has never run live through a real model, because the Copilot route is blocked by an admin policy.**

---

## 1. What Build Studio is

A requirement goes in; the `/brd` prompt scores how completely it is specified; a scored Business Requirements Document comes back and renders in a console. The point of the increment is the refusal path, not the happy path:

- A vague one-liner must score **below 50**, return **questions only** and write **no BRD**.
- Gate 0 (G0) approval of anything **below 75** must be **refused by the state machine**, naming the capping field.

Specs it was built from are in [`inputs/`](../inputs/): `BUILD-PLAN-studio.md` (architecture, findings F1 to F5, increments 0 to 6) and `HANDOVER-01-build-studio-increment-1.md` (steps 1 to 7, the six definition-of-done items). The context pack that governs the prompts is in [`context-pack/`](../context-pack/), notably `.github/prompts/brd.prompt.md` (scoring rules) and `docs/templates/BRD-TEMPLATE.md` (the 18-row table).

## 2. State of increment 1

Commit at time of writing: `7c3158a` on `main`. **59 tests pass** (`build-studio`, about 90 s). Containers run from `build-studio/` via `docker compose up -d --build`; console and API at http://localhost:8020.

| # | Definition of done | Status |
|---|---|---|
| 1 | Vague one-liner scores below 50, questions only, no BRD written | Passes on the **fake runner**. Not proven live. |
| 2 | Approve below 75 is refused, capping field named | Passes. When no cap applies (score 0), the refusal names the unspecified critical fields. |
| 3 | Well-specified requirement gives a full BRD with the 18-row table | Passes on the fake runner. |
| 4 | Every run recorded in `agent_run` with workspace SHA | Partly: SHA, model and provider refs recorded. **Tokens and cost are NULL** because Copilot does not report them. |
| 5 | BRD committed in the workspace git history | Passes (commit carries `Copilot-Task` and `Copilot-PR` trailers). |
| 6 | `UPDATE` on `gate_event` rejected | Passes (SQLite triggers). |

Not built, by design: stages 2 to 9, document upload, Word export, the budget guard. Only the Requirements screen of the console is live; the other eight stages are still the demo's mock data.

## 3. Architecture as built

Details and rationale are in `build-studio/docs/decisions/ADR-001…007`.

- **Studio API** (`build-studio/api/`, port 8020, also serves the compiled console). State machine, SQLite, the only database writer. Holds no provider credential.
- **Strict BRD parser** (`api/brd_parser.py`). Requires exactly 18 rows with template field names and scores in {0,1,2}. **Recomputes** raw/36 rounded down, cap 40 if any critical field is 0, else cap 70 if any is 1. Any disagreement with the agent's own numbers is `score_mismatch`. Unparseable is `parse_failed`. There is no default score (ADR-005).
- **Workspace** (`api/workspace.py`). The workspace repo is constructed from `templates/` file by file, never unpacked from an upload (finding F1). A manifest of every file we wrote is kept, and a **preflight fails closed** before every run if anything else is present (`.mcp.json`, `.claude/`, workflow files and so on).
- **Diff guard** (`api/stage_brd.py`). The agent's PR may touch only two paths: `projects/<slug>/docs/brd/BRD-<id>.result.md` (always) and `…/BRD-<id>-<slug>.md` (only if score is 50 or more). Anything else is `governance_violation`. Studio then commits the validated files itself and closes the PR rather than merging it (ADR-006).
- **Agent Runner** (`build-studio/runner/`, port 8021, **not published** outside Docker). The only process that reads `GITHUB_COPILOT_PAT`. Builds the prompt with the requirement inside a delimited data block (finding F5), calls the GitHub Agent Tasks API, reports PR files and contents. `RUNNER_MODE=fake` returns recorded fixtures, selectable with `FAKE_SCENARIO=vague|mid|good` in the requirement text. The runner refuses to push to or run tasks against `main` or `master`.
- **Console** (`build-studio/console/`). The demo React app from `inputs/hdlc AI framework.zip`, with the Figma-only plugins stripped. `RequirementsLive.tsx` and `api.ts` are the live parts. Compiled inside the Docker image build.
- **Workspace branch.** For the POC, Copilot works in the same repo as the code, on an orphan branch `poc-workspace`, with generated apps in `projects/<slug>/` (ADR-002). This was the user's choice; a separate repo is intended after the POC.

## 4. Decision log (in order, with the reasoning)

1. **Scope:** increment 1 only; Lane B; 300-line blocks; no stages 2 to 9.
2. **Location:** a separate project, not inside the Amplify repo (now `AI-Framework project/build-studio`).
3. **Frontend:** use the React app from the zip, do not redesign. User: use FastAPI, not Node, "unless node is absolutely necessary" (matches the existing stack). So the TSX is compiled in a throwaway Docker `node:22` stage and FastAPI serves the static output.
4. **Ports:** user asked for the 8000 series. 8020 (API and console) and 8021 (runner). 8000 is Amplify's.
5. **Model access:** the user chose **GitHub Copilot agent tasks** over an Anthropic key. Consequences: no structured output (score parsed from markdown), no token or cost data, preview API on a personal token.
6. **Where Copilot works:** first "one shared POC repo, folder per project", then, after discussion, the same repo as the code on an orphan branch. The user: use the same repo for the POC, new apps in subfolders, switch to a new-repo style after the POC.
7. **Credential holder:** the Agent Runner holds the PAT, not the Studio API (deviation from the handover; ADR-003).
8. **Budget guard:** the user said to skip it for now. It is still skipped, so the Copilot allowance has no in-product protection.
9. **Azure DevOps instead of GitHub:** asked and answered. The Copilot cloud agent works only on GitHub-hosted repos; Microsoft's docs say Azure Repos are not supported. Azure Boards and Pipelines can sit alongside GitHub.
10. **Housekeeping:** all work moved into one repo, `AI-Framework-project`, with four commits by area (inputs, context pack, factory demo pack, build studio). The Amplify repo was left clean.

## 5. What is blocked

**The Copilot cloud agent is disabled by an administrator.** The repo's Settings page shows: "you won't be able to assign tasks to Copilot because the Copilot cloud agent policy has been disabled by an administrator." The Agent Tasks API is the same feature, so live runs are expected to be refused. This has not been confirmed with a live call.

Also: the first live check found the PAT could see only the code repo and that the placeholder repo name in `.env` did not exist. That is fixed in principle by pointing `GITHUB_REPO` at `shriyashop/AI-Framework-project`, but moot while the policy is off.

**Alternatives, best first:**
1. **Claude via Microsoft Foundry.** The build plan's production path; company tenant and billing; needs Azure-side approval, not the Copilot admin.
2. **Anthropic API key.** About $20 for the POC. Fastest. Check that sending company requirement text to Anthropic is allowed.
3. Another company-approved model (for example Azure OpenAI). Prompts and structured output need adapting.
4. Claude Code headless (`claude -p`) in the runner. Terms for automated use of a subscription login are unclear, and it reintroduces finding F1's workspace-code-execution risk.
5. A local model (Ollama). Free and private; quality on 18-row scoring unknown.
6. Run `/brd` by hand in the IDE. No automation.

## 6. Recommended next steps

1. **Add a Claude-API runner mode** next to the Copilot one, behind the same runner endpoints (`/v1/tasks`, status, close). Direct Anthropic and Foundry share the Anthropic SDK; only credentials and base URL differ. Use structured output (a JSON schema for the 18 rows and the result block), so the score is typed instead of scraped. The runner would write the BRD files itself, so stage 1 needs no GitHub repo or PR in this mode. Keep Studio's recomputation and diff guard.
2. **Build the budget guard** (it becomes possible with real token counts): per-run token ceiling in the runner, cumulative spend checked before each run, a configurable cap, cost logged per run.
3. Run the **live proof**: a vague one-liner, a well-specified requirement and a refused approval, against the real model. Only then is DoD 1 to 3 proven.
4. Increment 2 (stages 2 and 3: spec and plan). Not before step 3.

The Copilot mode can stay in the code as a switch (`RUNNER_MODE`) in case the policy is enabled later.

## 7. Noticed and left untouched

- The demo's `App.tsx` has TypeScript errors in the FinOps view (`chargebackModel` and `setChargebackModel` are undefined), so that view probably throws when opened. Found by `pnpm typecheck`; the build itself succeeds.
- Gate naming differs: `AGENTS.md` calls it Gate 0, the demo and build plan call it G1. The API uses `G0`.
- `Build-Studio-Architecture.html` is referenced by the handover but was never supplied.
- There is no UI for signing acceptance criteria, so a score of 75 or more is only reachable if the requirement text itself contains signed criteria.
- Two diverging copies of the context pack exist (`context-pack/` here, and `factory-demo-pack/extracted/factory-demo/`).
- The staged context-pack files were removed from the Amplify repo's working tree as part of the move. That reverses the earlier plan to put them into Amplify after the demo.

## 8. Security and exposure log

Described in words only; no credentials are recorded here.

- **This repo was made public** while it contained internal material: real employee names and work emails alongside the Amplify demo accounts' shared default password (`context-pack/README.md`), internal memos (`reconciliation-memo.md`), the OPmobility logo, ContactHUB and client material in the demo data, the `LEGACY-NOTES-DO-NOT-SHIP.md` answer key, and a deliberately vulnerable app. Commits carry a company email address. The history keeps all of it. The plan was to make the repo private again. Treat the public window as possible exposure: retire the default password if any account is real, and consider deleting and recreating the repo.
- **The Amplify repository's git remote URL embeds an Azure DevOps access token in plain text.** It appeared in terminal output during this session. Rotate it and use the credential manager.
- The raw Claude Code transcript of the first session contains that token. **Do not commit or share the transcript** through a repo. If you want it on the new machine, move it over a private channel. It lives under `~/.claude/projects/c--python/` as a `.jsonl` file.
- Fine-grained PATs cannot be scoped to a branch, so the Copilot token needs Contents write on this repo. Enable branch protection on `main` (require a pull request).
- The code repo sits on a personal GitHub account. The company's Copilot licence and credits almost certainly do not apply to it, and company requirement text would sit on a personal account.

## 9. Environment gotchas (Windows, Git Bash, Docker Desktop)

- Combining several heredocs in one Bash call broke once; write files with an editor tool instead.
- `robocopy` fails with exit code 16 on an invalid flag (`/NDJ` is not valid; use `/NJH /NJS`). Exit codes 1 to 7 are success.
- A folder cannot be moved or deleted while VS Code, a terminal or the Claude Code working directory is inside it.
- Docker Desktop may need starting before `docker` works; wait for `docker info`.
- Git warns about LF to CRLF on Windows; it is harmless here.
- The test suite takes about 90 s, mostly git operations on Windows.
- Do not pass a venv between machines: its scripts hold absolute paths. Recreate it.

## 10. Where the repo's own decisions live

`build-studio/docs/decisions/` has ADR-001 (Copilot agent tasks), 002 (workspace branch), 003 (runner holds the PAT), 004 (Docker Node build), 005 (Studio recomputes the score), 006 (Studio commits the BRD, PR closed), 007 (runner is a separate process but the same OS user on the dev box).
