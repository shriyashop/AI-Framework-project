# Build Studio — increment 1

Stage 1 only: a requirement goes in, `/brd` runs through GitHub Copilot agent tasks, and a scored BRD comes back in the console. A vague one-liner must score below 50, return questions only and write no BRD. Gate 0 refuses approval below 75, in the state machine.

Spec: `docs/BUILD-PLAN-studio.md`, `docs/HANDOVER-01-build-studio-increment-1.md`. Decisions and deviations: `docs/decisions/`.

## Run it in containers (recommended)

```powershell
# .env needs RUNNER_SHARED_TOKEN (RUNNER_MODE=fake by default; add GITHUB_COPILOT_PAT + GITHUB_REPO and RUNNER_MODE=live for Copilot)
docker compose up -d --build     # console + API at http://localhost:8020
docker compose down              # stop (data persists in named volumes; add -v to wipe)
```

The console is compiled inside the image build, so no separate build step. The runner has no published port.

## Run it without containers

```powershell
python -m venv .venv; .venv\Scripts\pip install -r requirements.txt
scripts\build_console.ps1                      # needs Docker; compiles console/ -> console/dist
copy .env.example .env                         # fill in RUNNER_SHARED_TOKEN (+ GitHub values for live mode)
.venv\Scripts\python -m uvicorn runner.main:app --host 127.0.0.1 --port 8021
.venv\Scripts\python -m uvicorn api.main:app --port 8020     # console at http://localhost:8020
```

`RUNNER_MODE=fake` runs everything against recorded fixtures with no GitHub calls. Put `FAKE_SCENARIO=vague|mid|good` in the requirement text to pick the outcome.

Live mode needs a private GitHub repo with the Copilot cloud agent enabled (for the POC, the same repo as this code; the workspace goes on the `poc-workspace` branch, never `main`), and a fine-grained PAT on that repo only (Agent tasks RW, Contents RW, Pull requests RW, Metadata R). Run `scripts/spike_copilot_task.py` once first.

## Layout

| Path | What |
|---|---|
| `api/` | State machine, SQLite, strict BRD parser, workspace constructor, poller. The only DB writer. |
| `runner/` | Separate process on 127.0.0.1. The only reader of the GitHub PAT. Never touches the DB. |
| `console/` | The demo React app; only Requirements is live. Other stages are still mock data. |
| `templates/` | `repo/` seeds the shared GitHub repo (context pack, `brd` agent); `project/` is the per-project skeleton. |

## Tests

`.venv\Scripts\python -m pytest` runs about 60 tests in roughly 90 seconds. Most of that time is git on Windows.
