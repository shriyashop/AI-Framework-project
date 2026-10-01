"""RUNNER_MODE=fake: recorded-style fixtures instead of calling GitHub.

Drives the test suite and gives a safe fallback for demos (never demonstrate a
live agent run without one). Scenario is chosen by a marker in the requirement
text (FAKE_SCENARIO=vague|mid|good) or, failing that, by length.
"""
import itertools
import re
import subprocess
from pathlib import Path

from . import prompt

FIELDS = [
    "Business problem", "Success criteria", "Users", "Scope boundary (out of scope)", "Lane",
    "Data classification", "Constraints", "Acceptance criteria (signed)",
    "What happens if we do nothing", "Current workaround understood", "Functional requirements traceable",
    "Reuse checked", "Technology recommendation", "Deviation reason recorded (n/a scores 2)",
    "UI/UX inputs (n/a scores 2)", "Dependencies identified", "Risks identified", "Negative and boundary cases",
]
SCENARIOS = {
    "vague": [0] * 18,
    "mid": [1] * 8 + [2] * 9 + [0],
    "good": [2] * 18,
}
_tasks: dict[str, dict] = {}
_ids = itertools.count(1)
_last_pushed = {"sha": None}


def _scenario(text: str) -> str:
    m = re.search(r"FAKE_SCENARIO=(vague|mid|good)", text)
    return m.group(1) if m else ("vague" if len(text.strip()) < 200 else "good")


def _short(i: int) -> str:
    return FIELDS[i].split(" (")[0]


def _result(scenario: str, brd_id: str) -> str:
    scores = SCENARIOS[scenario]
    raw = sum(scores) * 100 // 36
    crit = scores[:8]
    level = 0 if 0 in crit else 1 if 1 in crit else None
    cap = {0: 40, 1: 70, None: None}[level]
    final = min(raw, cap) if cap else raw
    if final < 50:
        status = "NOT A REQUIREMENT YET"
    elif final < 75:
        status = "DRAFT — BLOCKED"
    elif final < 90:
        status = "READY WITH OPEN QUESTIONS"
    else:
        status = "READY"
    capped = next((_short(i) for i in range(8) if scores[i] == level), None)
    cap_line = capped if cap and raw > cap else "not capped"

    def names(v: int) -> str:
        return ", ".join(_short(i) for i in range(8) if scores[i] == v) or "none"

    rows = "\n".join(
        f"| {i + 1}{' ★' if i < 8 else ''} | {FIELDS[i]} | {s} | fake fixture |" for i, s in enumerate(scores)
    )
    if final < 75:
        gaps = "1. What is wrong today? → business owner\n2. How will we know it worked? → business owner"
    else:
        gaps = "1. Confirm retention period → data owner"
    signed = "SIGNED by A. Owner on 2026-10-01" if scores[7] > 0 else "DRAFT, unsigned"
    nxt = "/plan" if final >= 75 else "answer the gaps above and re-run /brd"
    return f"""| # | Field | Score | Justification |
|---|---|---|---|
{rows}

```
BRD-{brd_id} — Fake fixture

Confidence:   {final}/100   [{status}]
Capped by:    {cap_line}
Lane:         B — new build
Tier:         V2 — standard

Critical fields at 0:  {names(0)}
Critical fields at 1:  {names(1)}

GAPS — each needs an answer before this can proceed:
{gaps}

Acceptance criteria: {signed}

Next step: {nxt}
```
"""


def start(slug: str, brd_id: str, input_text: str) -> dict:
    tid = f"fake-{next(_ids)}"
    sc = _scenario(input_text)
    files = {prompt.result_path(slug, brd_id): _result(sc, brd_id)}
    if sc != "vague":
        files[prompt.brd_path(slug, brd_id)] = f"# BRD-{brd_id} (fake fixture)\n"
    _tasks[tid] = {"polls": 0, "files": files, "slug": slug}
    return {"task_id": tid, "html_url": f"fake://tasks/{tid}", "model": "fake-model", "state": "queued"}


def status(tid: str) -> dict:
    t = _tasks[tid]
    t["polls"] += 1
    if t["polls"] < 2:
        return {"state": "in_progress", "pr_number": None, "pr_url": None, "head_sha": None, "files": [], "contents": {}}
    return {"state": "completed", "pr_number": 1, "pr_url": f"fake://pr/{tid}", "head_sha": "f" * 40,
            "files": list(t["files"]), "contents": t["files"]}


def push(workspace: Path) -> str:
    sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=workspace, capture_output=True, text=True).stdout.strip()
    _last_pushed["sha"] = sha
    return sha


def remote_sha() -> str | None:
    return _last_pushed["sha"]
