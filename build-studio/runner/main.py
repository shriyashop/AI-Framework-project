"""Agent Runner: separate process, localhost only, never touches the database."""
import hmac
from pathlib import Path

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

from . import config, fake, github, prompt

app = FastAPI(title="Build Studio Agent Runner")


def require_token(authorization: str = Header(default="")) -> None:
    if not config.SHARED_TOKEN:
        raise HTTPException(503, "RUNNER_SHARED_TOKEN is not configured; refusing all requests")
    if not hmac.compare_digest(authorization, f"Bearer {config.SHARED_TOKEN}"):
        raise HTTPException(401, "bad runner token")


def _require_live_config() -> None:
    if config.MODE == "live" and (not config.PAT or not config.REPO):
        raise HTTPException(503, "GITHUB_COPILOT_PAT and GITHUB_REPO must be set (live mode)")


class PushIn(BaseModel):
    workspace_path: str


class TaskIn(BaseModel):
    requirement_id: int
    project_slug: str
    input_text: str


class CloseIn(BaseModel):
    pr_number: int
    comment: str


@app.get("/health")
def health():
    return {"status": "ok", "mode": config.MODE}


@app.post("/v1/push", dependencies=[Depends(require_token)])
def push(body: PushIn):
    _require_live_config()
    try:
        return {"sha": (fake.push if config.MODE == "fake" else github.push)(Path(body.workspace_path))}
    except RuntimeError as e:
        raise HTTPException(502, str(e))


@app.get("/v1/remote-sha", dependencies=[Depends(require_token)])
async def remote_sha():
    _require_live_config()
    return {"sha": fake.remote_sha() if config.MODE == "fake" else await github.remote_sha()}


@app.post("/v1/tasks", dependencies=[Depends(require_token)], status_code=201)
async def create_task(body: TaskIn):
    _require_live_config()
    brd_id = str(body.requirement_id)
    try:
        text = prompt.build_prompt(body.project_slug, brd_id, body.input_text, config.MAX_INPUT_CHARS)
    except ValueError as e:
        raise HTTPException(422, str(e))
    if config.MODE == "fake":
        return fake.start(body.project_slug, brd_id, body.input_text)
    try:
        t = await github.start_task(text)
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, f"GitHub rejected the task: {e.response.status_code} {e.response.text[:300]}")
    except RuntimeError as e:
        raise HTTPException(502, str(e))
    return {"task_id": t["id"], "html_url": t.get("html_url"), "model": config.MODEL, "state": t["state"]}


@app.get("/v1/tasks/{task_id}", dependencies=[Depends(require_token)])
async def task_status(task_id: str, project_slug: str, requirement_id: int):
    _require_live_config()
    if config.MODE == "fake":
        return fake.status(task_id)
    t = await github.get_task(task_id)
    out = {"state": t["state"], "pr_number": None, "pr_url": None, "head_sha": None, "files": [], "contents": {}}
    pulls = [a["data"]["id"] for a in t.get("artifacts", []) if a.get("type") == "pull"]
    if t["state"] == "completed" and pulls:
        out["pr_number"] = pulls[0]
        out.update(await github.pr_details(pulls[0]))
        brd_id = str(requirement_id)
        for path in (prompt.result_path(project_slug, brd_id), prompt.brd_path(project_slug, brd_id)):
            if path in out["files"]:
                out["contents"][path] = await github.file_at(path, out["head_sha"])
    return out


@app.post("/v1/tasks/{task_id}/close-pr", dependencies=[Depends(require_token)])
async def close_pr(task_id: str, body: CloseIn):
    if config.MODE != "fake":
        _require_live_config()
        await github.close_pr(body.pr_number, body.comment)
    return {"closed": True}
