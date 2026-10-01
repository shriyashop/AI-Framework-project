# Setting up on a new machine

Needs: Git, Docker Desktop, Python 3.11, and Claude Code. Node is **not** needed; the console is compiled inside Docker.

## 1. Get the code

```powershell
git clone https://github.com/shriyashop/AI-Framework-project.git
cd AI-Framework-project
```
The repo is meant to be private, so you will need to sign in (or use a token with read access) when cloning. Claude Code will pick up the root `CLAUDE.md` automatically; ask it to read `docs/HANDOVER.md`.

## 2. Restore Claude's memory (optional)

Seed notes are in `docs/claude-memory/`. Copy them into the new project's memory folder (Claude Code shows the exact path; it is under `~/.claude/projects/<project-folder-name>/memory/`):

```powershell
$dest = "$HOME\.claude\projects\<project-folder-name>\memory"
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item docs\claude-memory\*.md $dest
```
Review them before relying on them; they record the situation on 2026-10-01 and may be stale.

## 3. Configure and run Build Studio

```powershell
cd build-studio
copy .env.example .env
```
Edit `.env` (never commit it):
- `RUNNER_SHARED_TOKEN`: generate with `python -c "import secrets;print(secrets.token_urlsafe(32))"`.
- Leave `RUNNER_MODE=fake` until a real model is available. In fake mode no GitHub or model credentials are used.
- For live Copilot mode (currently blocked, see the handover): `RUNNER_MODE=live`, `GITHUB_COPILOT_PAT`, `GITHUB_REPO=shriyashop/AI-Framework-project`, `GITHUB_BASE_BRANCH=poc-workspace` (never `main`).

```powershell
docker compose up -d --build     # console and API: http://localhost:8020
docker compose down              # stop; data stays in named volumes
```
In fake mode, put `FAKE_SCENARIO=vague`, `mid` or `good` in a requirement to choose the outcome.

If the machine has old volumes from earlier fake runs, wipe them before the first live run so test data is not pushed anywhere: `docker compose down -v`.

## 4. Run the tests

```powershell
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m pytest        # expect 59 passed, about 90 seconds
```

## 5. Check it works

`curl http://localhost:8020/health` returns `{"status":"ok"}`. In the console, submit a one-line requirement: it should score below 50 with questions only, and approving it should be refused.
