"""Thin client for the GitHub Agent Tasks API (public preview) and PR plumbing."""
import base64
import os
import subprocess
from pathlib import Path

import httpx

from . import config


def _headers(raw: bool = False) -> dict:
    return {
        "Authorization": f"Bearer {config.PAT}",
        "Accept": "application/vnd.github.raw+json" if raw else "application/vnd.github+json",
        "X-GitHub-Api-Version": config.API_VERSION,
    }


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(base_url=config.GITHUB_API, timeout=30)


async def start_task(prompt: str) -> dict:
    body = {"prompt": prompt, "model": config.MODEL, "custom_agent": config.CUSTOM_AGENT,
            "create_pull_request": True, "base_ref": config.BASE_BRANCH}
    async with _client() as c:
        r = await c.post(f"/agents/repos/{config.REPO}/tasks", json=body, headers=_headers())
    r.raise_for_status()
    return r.json()


async def get_task(task_id: str) -> dict:
    async with _client() as c:
        r = await c.get(f"/agents/repos/{config.REPO}/tasks/{task_id}", headers=_headers())
    r.raise_for_status()
    return r.json()


async def pr_details(number: int) -> dict:
    async with _client() as c:
        pr = (await c.get(f"/repos/{config.REPO}/pulls/{number}", headers=_headers())).json()
        files, page = [], 1
        while True:
            r = await c.get(f"/repos/{config.REPO}/pulls/{number}/files",
                            params={"per_page": 100, "page": page}, headers=_headers())
            r.raise_for_status()
            batch = r.json()
            files += [f["filename"] for f in batch]
            if len(batch) < 100:
                break
            page += 1
    return {"pr_url": pr["html_url"], "head_sha": pr["head"]["sha"], "files": files}


async def file_at(path: str, ref: str) -> str | None:
    async with _client() as c:
        r = await c.get(f"/repos/{config.REPO}/contents/{path}", params={"ref": ref}, headers=_headers(raw=True))
    return r.text if r.status_code == 200 else None


async def close_pr(number: int, comment: str) -> None:
    async with _client() as c:
        await c.post(f"/repos/{config.REPO}/issues/{number}/comments", json={"body": comment}, headers=_headers())
        r = await c.patch(f"/repos/{config.REPO}/pulls/{number}", json={"state": "closed"}, headers=_headers())
    r.raise_for_status()


async def remote_sha() -> str | None:
    async with _client() as c:
        r = await c.get(f"/repos/{config.REPO}/git/ref/heads/{config.BASE_BRANCH}", headers=_headers())
    return r.json()["object"]["sha"] if r.status_code == 200 else None


def push(workspace: Path) -> str:
    """Push main using the PAT from process env only; nothing is written to disk."""
    auth = base64.b64encode(f"x-access-token:{config.PAT}".encode()).decode()
    env = {**os.environ, "GIT_CONFIG_COUNT": "1",
           "GIT_CONFIG_KEY_0": "http.extraheader", "GIT_CONFIG_VALUE_0": f"AUTHORIZATION: basic {auth}",
           "GIT_TERMINAL_PROMPT": "0"}
    url = f"https://github.com/{config.REPO}.git"
    for args in (["remote", "remove", "origin"], ["remote", "add", "origin", url],
                 ["push", "origin", f"HEAD:refs/heads/{config.BASE_BRANCH}"]):
        out = subprocess.run(["git", *args], cwd=workspace, env=env, capture_output=True, text=True)
        if out.returncode and args[0] == "push":
            raise RuntimeError(f"git push failed: {out.stderr.replace(auth, '***').strip()}")
    return subprocess.run(["git", "rev-parse", "HEAD"], cwd=workspace, capture_output=True, text=True).stdout.strip()
