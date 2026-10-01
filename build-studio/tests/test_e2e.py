"""End to end through the real API and runner apps, with the runner in fake mode."""
import asyncio
import sqlite3

import httpx
import pytest
from fastapi.testclient import TestClient

from api import config, db, main, runner_client, workspace
from runner import config as rconfig, fake, main as rmain

VAGUE = "Build an app for contacts."
GOOD = "A detailed requirement. " * 20
POLLS = 2  # the fake runner needs two polls to report completion


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "DB_PATH", tmp_path / "t.db")
    monkeypatch.setattr(config, "WORKSPACES_DIR", tmp_path / "ws")
    config.WORKSPACES_DIR.mkdir()
    monkeypatch.setattr(config, "RUNNER_SHARED_TOKEN", "tok")
    monkeypatch.setattr(rconfig, "SHARED_TOKEN", "tok")
    monkeypatch.setattr(rconfig, "MODE", "fake")
    monkeypatch.setattr(runner_client, "_transport", httpx.ASGITransport(app=rmain.app))
    fake._last_pushed["sha"] = None
    fake._tasks.clear()
    db.init_db()
    c = TestClient(main.app)  # no lifespan: tests drive the poller explicitly
    c.project = c.post("/projects", json={"name": "Demo"}).json()
    return c


def run(client, text):
    rid = client.post("/requirements", json={"project_id": client.project["id"], "text": text}).json()["id"]
    for _ in range(POLLS):
        asyncio.run(main.poll_once())
    return client.get(f"/requirements/{rid}").json()


def test_vague_requirement_scores_below_50_and_writes_no_brd(client):  # DoD 1
    r = run(client, VAGUE)
    assert r["status"] == "not_a_requirement" and r["confidence"] < 50
    assert r["brd_path"] is None and r["result"]["gaps"]
    brd_dir = workspace.repo_dir() / f"projects/{client.project['slug']}/docs/brd"
    assert [p.name for p in brd_dir.glob("BRD-*") if not p.name.endswith(".result.md")] == []


def test_approve_below_75_refused_with_capping_field(client):  # DoD 2
    r = run(client, "FAKE_SCENARIO=mid " + GOOD)
    assert r["status"] == "draft_blocked" and r["confidence"] == 70
    resp = client.post(f"/requirements/{r['id']}/approve", json={"actor": "alice"})
    assert resp.status_code == 409
    assert "capped by" in resp.json()["reason"] and resp.json()["capped_by"] == r["capped_by"]
    events = client.get(f"/requirements/{r['id']}").json()["gate_events"]
    assert [e["decision"] for e in events] == ["refused"]


def test_vague_approve_names_weak_fields(client):
    r = run(client, VAGUE)
    resp = client.post(f"/requirements/{r['id']}/approve", json={"actor": "alice"})
    assert resp.status_code == 409 and "Business problem" in resp.json()["reason"]


def test_good_requirement_full_brd_with_18_rows(client):  # DoD 3
    r = run(client, GOOD)
    assert r["status"] == "ready" and len(r["result"]["rows"]) == 18 and r["brd_path"]
    assert (workspace.repo_dir() / r["brd_path"]).exists()
    ok = client.post(f"/requirements/{r['id']}/approve", json={"actor": "alice", "rationale": "ok"})
    assert ok.status_code == 200 and client.get(f"/requirements/{r['id']}").json()["status"] == "approved"


def test_agent_run_records_sha_and_unreported_usage(client):  # DoD 4 (adjusted: tokens not reported)
    r = run(client, GOOD)
    (a,) = r["runs"]
    assert len(a["workspace_sha"]) == 40 and a["session_id"] and a["model"] and a["prompt_ref"].startswith("brd.prompt.md@")
    assert a["input_tokens"] is None and a["output_tokens"] is None and a["cost_cents"] is None
    assert a["finished_at"] and a["exit_status"] == "completed"


def test_git_history_shows_brd_commit_with_trailers(client):  # DoD 5
    run(client, GOOD)
    log = workspace.git("log", "-1", "--format=%B")
    assert "Copilot-Task: fake-" in log and "Copilot-PR:" in log


def test_gate_event_update_rejected(client):  # DoD 6
    r = run(client, VAGUE)
    client.post(f"/requirements/{r['id']}/approve", json={"actor": "alice"})
    with db.session() as conn, pytest.raises(sqlite3.IntegrityError, match="append-only"):
        conn.execute("UPDATE gate_event SET decision='approved'")


def test_pr_touching_other_files_is_governance_violation(client):
    rid = client.post("/requirements", json={"project_id": client.project["id"], "text": VAGUE}).json()["id"]
    tid = next(iter(fake._tasks))
    fake._tasks[tid]["files"][".github/copilot-instructions.md"] = "weakened"
    for _ in range(POLLS):
        asyncio.run(main.poll_once())
    r = client.get(f"/requirements/{rid}").json()
    assert r["status"] == "governance_violation" and r["confidence"] is None
    assert workspace.preflight()  # nothing was committed


def test_unparseable_result_is_a_failure_never_a_default(client):
    rid = client.post("/requirements", json={"project_id": client.project["id"], "text": VAGUE}).json()["id"]
    tid = next(iter(fake._tasks))
    path = next(iter(fake._tasks[tid]["files"]))
    fake._tasks[tid]["files"][path] = "I think this is about 80% specified."
    for _ in range(POLLS):
        asyncio.run(main.poll_once())
    r = client.get(f"/requirements/{rid}").json()
    assert r["status"] == "parse_failed" and r["confidence"] is None
    assert client.post(f"/requirements/{rid}/approve", json={"actor": "a"}).status_code == 409


def test_empty_and_oversized_requirements_refused(client):
    pid = client.project["id"]
    assert client.post("/requirements", json={"project_id": pid, "text": "  "}).status_code == 409
    big = "x" * (config.MAX_REQUIREMENT_CHARS + 1)
    assert client.post("/requirements", json={"project_id": pid, "text": big}).status_code == 409


def test_injected_workspace_file_blocks_the_run(client):
    (workspace.repo_dir() / ".mcp.json").write_text("{}")
    resp = client.post("/requirements", json={"project_id": client.project["id"], "text": VAGUE})
    assert resp.status_code == 409 and "preflight" in resp.json()["detail"]
