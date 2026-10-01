"""Stage 1: run /brd through the runner, verify the result, record it."""
import asyncio
import hashlib
import json
from dataclasses import asdict
from datetime import datetime, timezone

from . import brd_parser as bp
from . import config, runner_client, state_machine as sm, workspace

_workspace_lock = asyncio.Lock()  # one git operation at a time on the shared clone


class StageError(Exception):
    """Refused before a run started (bad input, workspace not clean)."""


def _paths(slug: str, rid: int) -> tuple[str, str]:
    return (f"projects/{slug}/docs/brd/BRD-{rid}.result.md", f"projects/{slug}/docs/brd/BRD-{rid}-{slug}.md")


def _prompt_ref() -> str:
    p = workspace.repo_dir() / ".github/prompts/brd.prompt.md"
    return f"brd.prompt.md@{hashlib.sha256(p.read_bytes()).hexdigest()[:12]}"


async def start_run(conn, project, text: str) -> int:
    text = (text or "").strip()
    if not text:
        raise StageError("requirement text is empty")
    if len(text) > config.MAX_REQUIREMENT_CHARS:
        raise StageError(f"requirement text exceeds {config.MAX_REQUIREMENT_CHARS} characters")
    async with _workspace_lock:
        try:
            sha = await asyncio.to_thread(workspace.preflight)
            pushed = await runner_client.push(str(workspace.repo_dir()))
            remote = await runner_client.remote_sha()
        except (workspace.PreflightFailed, runner_client.RunnerError) as e:
            raise StageError(f"workspace preflight failed: {e}") from e
        if pushed != sha or remote != sha:
            raise StageError("remote main does not match the local workspace; refusing to run")
    rid = conn.execute("INSERT INTO requirement(project_id, raw_text, status) VALUES (?,?,?)",
                       (project["id"], text, sm.QUEUED)).lastrowid
    conn.commit()
    try:
        task = await runner_client.start_task(rid, project["slug"], text)
    except runner_client.RunnerError as e:
        conn.execute("UPDATE requirement SET status='failed', status_reason=? WHERE id=?", (str(e), rid))
        conn.commit()
        raise StageError(str(e)) from e
    conn.execute(
        "INSERT INTO agent_run(requirement_id, session_id, provider_ref, prompt_ref, model, workspace_sha)"
        " VALUES (?,?,?,?,?,?)",
        (rid, task["task_id"], task.get("html_url"), _prompt_ref(), task.get("model"), sha),
    )
    conn.execute("UPDATE requirement SET status=? WHERE id=?", (sm.RUNNING, rid))
    conn.commit()
    return rid


def _set(conn, rid: int, status: str, reason: str = "", **cols) -> None:
    cols.update(status=status, status_reason=reason)
    conn.execute(f"UPDATE requirement SET {', '.join(f'{k}=?' for k in cols)} WHERE id=?", (*cols.values(), rid))
    conn.commit()


def _finish_run(conn, run_id: int, exit_status: str, pr_url: str | None = None) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%fZ")
    conn.execute("UPDATE agent_run SET exit_status=?, finished_at=?, pr_url=COALESCE(?, pr_url) WHERE id=?",
                 (exit_status, now, pr_url, run_id))
    conn.commit()


def _elapsed(run) -> float:
    started = datetime.strptime(run["started_at"], "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - started).total_seconds()


async def poll(conn, req) -> None:
    """Advance one running requirement. Transient runner errors leave it running."""
    rid = req["id"]
    run = conn.execute("SELECT * FROM agent_run WHERE requirement_id=? ORDER BY id DESC LIMIT 1", (rid,)).fetchone()
    slug = conn.execute("SELECT slug FROM project WHERE id=?", (req["project_id"],)).fetchone()["slug"]
    if run is None:
        return _set(conn, rid, "failed", "no agent run recorded")
    if _elapsed(run) > config.RUN_TIMEOUT_SECONDS:
        _finish_run(conn, run["id"], "timed_out")
        return _set(conn, rid, "timed_out", f"no result after {config.RUN_TIMEOUT_SECONDS}s")
    st = await runner_client.task_status(run["session_id"], slug, rid)
    if st["state"] in ("failed", "timed_out", "cancelled"):
        _finish_run(conn, run["id"], st["state"])
        return _set(conn, rid, "timed_out" if st["state"] == "timed_out" else "failed", f"provider state: {st['state']}")
    if st["state"] == "completed":
        await _finish(conn, req, run, slug, st)


async def _reject(conn, rid, run, st, status, reason, raw=None, parsed=None) -> None:
    detail = {"raw_excerpt": (raw or "")[:4000]}
    if parsed is not None:
        detail["agent_claimed"] = {"confidence": parsed.agent_confidence, "status": parsed.agent_status,
                                   "capped_by": parsed.agent_capped_by}
        detail["recomputed"] = asdict(parsed.computed)
    if st.get("pr_number") is not None:
        try:
            await runner_client.close_pr(run["session_id"], st["pr_number"], f"Closed by Build Studio: {status}: {reason}")
        except runner_client.RunnerError:
            pass
    _finish_run(conn, run["id"], status, st.get("pr_url"))
    _set(conn, rid, status, reason, result_json=json.dumps(detail))


async def _finish(conn, req, run, slug, st) -> None:
    rid = req["id"]
    result_p, brd_p = _paths(slug, rid)
    files = st.get("files") or []
    extra = [f for f in files if f not in (result_p, brd_p)]
    if extra:
        return await _reject(conn, rid, run, st, "governance_violation", f"PR touched files outside the allowed paths: {extra}")
    raw = (st.get("contents") or {}).get(result_p)
    if raw is None:
        return await _reject(conn, rid, run, st, "parse_failed", "result file was not produced")
    try:
        parsed = bp.parse_result(raw)
    except bp.ParseFailed as e:
        return await _reject(conn, rid, run, st, "parse_failed", str(e), raw)
    except bp.ScoreMismatch as e:
        return await _reject(conn, rid, run, st, "score_mismatch", str(e), raw, e.parsed)
    c = parsed.computed
    wrote_brd = brd_p in files
    if c.final < config.THRESHOLD_NOT_A_REQUIREMENT and wrote_brd:
        return await _reject(conn, rid, run, st, "governance_violation",
                             f"a BRD was written although the score is {c.final} (below 50)", raw, parsed)
    if c.final >= config.THRESHOLD_NOT_A_REQUIREMENT and not (st.get("contents") or {}).get(brd_p):
        return await _reject(conn, rid, run, st, "parse_failed", "score is 50 or more but no BRD file was produced", raw, parsed)
    to_commit = {result_p: raw}
    if wrote_brd:
        to_commit[brd_p] = st["contents"][brd_p]
    msg = (f"BRD-{rid}: {parsed.title} ({c.final}/100 {c.status})\n\nCopilot-Task: {run['session_id']}\n"
           f"Copilot-PR: {st.get('pr_url')}\nCopilot-Head: {st.get('head_sha')}")
    async with _workspace_lock:
        await asyncio.to_thread(workspace.commit_brd_files, slug, to_commit, msg)
        await runner_client.push(str(workspace.repo_dir()))
    if st.get("pr_number") is not None:
        await runner_client.close_pr(run["session_id"], st["pr_number"], "Recorded by Build Studio; PR closed, not merged.")
    detail = {"brd_id": parsed.brd_id, "title": parsed.title, "lane": parsed.lane, "lane_reason": parsed.lane_reason,
              "tier": parsed.tier, "tier_reason": parsed.tier_reason, "ac_signed": parsed.ac_signed,
              "rows": [asdict(r) for r in parsed.rows], "computed": asdict(c), "gaps": parsed.gaps,
              "critical_zero": [r.field for r in parsed.rows if r.critical and r.score == 0],
              "critical_one": [r.field for r in parsed.rows if r.critical and r.score == 1]}
    _finish_run(conn, run["id"], "completed", st.get("pr_url"))
    _set(conn, rid, c.status, "", confidence=c.final, capped_by=", ".join(c.capped_fields) or "not capped",
         brd_path=brd_p if wrote_brd else None, result_json=json.dumps(detail))
