import asyncio
import json

import httpx
import respx
from fastapi.testclient import TestClient

from runner import config, github, main

BASE = "https://api.github.com"


def _live(monkeypatch):
    monkeypatch.setattr(config, "PAT", "pat-secret")
    monkeypatch.setattr(config, "REPO", "acme/poc")
    monkeypatch.setattr(config, "MODE", "live")
    monkeypatch.setattr(config, "SHARED_TOKEN", "tok")


@respx.mock
def test_start_task_sends_custom_agent_and_pr(monkeypatch):
    _live(monkeypatch)
    route = respx.post(f"{BASE}/agents/repos/acme/poc/tasks").mock(
        return_value=httpx.Response(201, json={"id": "t1", "state": "queued", "html_url": "u"}))
    out = asyncio.run(github.start_task("do it"))
    sent = json.loads(route.calls[0].request.content)
    assert out["id"] == "t1" and sent["custom_agent"] == "brd" and sent["create_pull_request"] is True
    assert sent["base_ref"] == "main" and sent["model"] == config.MODEL
    h = route.calls[0].request.headers
    assert h["authorization"] == "Bearer pat-secret" and h["x-github-api-version"] == config.API_VERSION


@respx.mock
def test_pr_details_paginates_files(monkeypatch):
    _live(monkeypatch)
    respx.get(f"{BASE}/repos/acme/poc/pulls/5").mock(
        return_value=httpx.Response(200, json={"html_url": "pr", "head": {"sha": "abc"}}))
    pages = {"1": [{"filename": f"f{i}"} for i in range(100)], "2": [{"filename": "last"}]}
    respx.get(f"{BASE}/repos/acme/poc/pulls/5/files").mock(
        side_effect=lambda req: httpx.Response(200, json=pages[req.url.params["page"]]))
    out = asyncio.run(github.pr_details(5))
    assert out["head_sha"] == "abc" and len(out["files"]) == 101 and out["files"][-1] == "last"


@respx.mock
def test_file_at_returns_none_when_missing(monkeypatch):
    _live(monkeypatch)
    respx.get(f"{BASE}/repos/acme/poc/contents/x.md").mock(return_value=httpx.Response(404))
    assert asyncio.run(github.file_at("x.md", "abc")) is None


@respx.mock
def test_github_rejection_surfaces_as_502(monkeypatch):
    _live(monkeypatch)
    respx.post(f"{BASE}/agents/repos/acme/poc/tasks").mock(return_value=httpx.Response(403, text="no agent tasks permission"))
    r = TestClient(main.app).post("/v1/tasks", headers={"Authorization": "Bearer tok"},
                                  json={"requirement_id": 1, "project_slug": "demo", "input_text": "x"})
    assert r.status_code == 502 and "403" in r.json()["detail"]


def test_runner_requires_token(monkeypatch):
    _live(monkeypatch)
    c = TestClient(main.app)
    assert c.get("/v1/remote-sha").status_code == 401
    assert c.get("/v1/remote-sha", headers={"Authorization": "Bearer wrong"}).status_code == 401
    assert c.get("/health").status_code == 200


def test_runner_refuses_everything_without_configured_token(monkeypatch):
    monkeypatch.setattr(config, "SHARED_TOKEN", "")
    r = TestClient(main.app).get("/v1/remote-sha", headers={"Authorization": "Bearer "})
    assert r.status_code == 503


def test_live_mode_without_pat_is_refused(monkeypatch):
    monkeypatch.setattr(config, "SHARED_TOKEN", "tok")
    monkeypatch.setattr(config, "MODE", "live")
    monkeypatch.setattr(config, "PAT", "")
    r = TestClient(main.app).get("/v1/remote-sha", headers={"Authorization": "Bearer tok"})
    assert r.status_code == 503
