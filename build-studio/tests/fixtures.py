"""Builders for /brd result files used across tests."""
from api.brd_parser import FIELD_NAMES, compute, Row
from api import config


def _rows(scores):
    return [Row(i + 1, FIELD_NAMES[i], s, "", i + 1 in config.CRITICAL_FIELD_NUMBERS) for i, s in enumerate(scores)]


def make_result(scores, *, claim=None, gaps=("What is the problem? → business owner",),
                signed=None, capped_by=None, zero_line=None, one_line=None, brd_id="BRD-1"):
    """Render a result file. By default the agent's claims match the recomputation."""
    c = compute(_rows(scores))
    signed = (scores[7] > 0) if signed is None else signed
    claim = claim or {}
    conf = claim.get("confidence", c.final)
    status = claim.get("status", {"not_a_requirement": "NOT A REQUIREMENT YET", "draft_blocked": "DRAFT — BLOCKED",
                                  "ready_open_questions": "READY WITH OPEN QUESTIONS", "ready": "READY"}[c.status])
    if capped_by is None:
        capped_by = c.capped_fields[0] if c.capped_fields else "not capped"
    crit = lambda v: ", ".join(FIELD_NAMES[i] for i in range(8) if scores[i] == v) or "none"
    lines = ["| # | Field | Score | Justification |", "|---|---|---|---|"]
    for i, s in enumerate(scores):
        lines.append(f"| {i + 1}{' ★' if i < 8 else ''} | {FIELD_NAMES[i]} | {s} | because |")
    gap_lines = [f"{n + 1}. {g}" for n, g in enumerate(gaps)]
    return "\n".join(lines) + f"""

```
{brd_id} — Test requirement

Confidence:   {conf}/100   [{status}]
Capped by:    {capped_by}
Lane:         B — new build
Tier:         V2 — standard

Critical fields at 0:  {zero_line or crit(0)}
Critical fields at 1:  {one_line or crit(1)}

GAPS — each needs an answer before this can proceed:
""" + "\n".join(gap_lines) + f"""

Acceptance criteria: {'SIGNED by A. Owner on 2026-10-01' if signed else 'DRAFT, unsigned'}

Next step: answer the gaps above and re-run /brd
```
"""

VAGUE = [0, 0, 0, 0, 0, 0, 0, 0] + [0] * 10
MID = [1] * 8 + [2] * 9 + [0]   # raw 26 -> 72 (floor of 72.2) -> capped 70 -> draft_blocked
GOOD = [2] * 18               # 100 -> ready
READYQ = [2] * 8 + [2] * 6 + [0] * 4   # raw 28 -> 77, no cap -> ready_open_questions
