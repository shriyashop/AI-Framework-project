"""Requirement state machine and Gate 0. The refusal lives here, not in a prompt."""
import json
import sqlite3

from . import config

QUEUED, RUNNING = "queued", "running"
NOT_A_REQUIREMENT, DRAFT_BLOCKED = "not_a_requirement", "draft_blocked"
READY_OPEN_QUESTIONS, READY = "ready_open_questions", "ready"
APPROVED = "approved"
FAILURES = ("parse_failed", "score_mismatch", "governance_violation", "timed_out", "failed")
ACTIVE = (QUEUED, RUNNING)
APPROVABLE = (READY_OPEN_QUESTIONS, READY)
GATE = "G0"


class Refused(Exception):
    """Gate transition refused. Carries what the console must show."""

    def __init__(self, reason: str, confidence: int | None, capped_by: str | None):
        super().__init__(reason)
        self.reason, self.confidence, self.capped_by = reason, confidence, capped_by

    def as_dict(self) -> dict:
        return {"reason": self.reason, "confidence": self.confidence, "capped_by": self.capped_by}


def has_active_run(conn: sqlite3.Connection, requirement_id: int) -> bool:
    row = conn.execute("SELECT status FROM requirement WHERE id=?", (requirement_id,)).fetchone()
    return bool(row and row["status"] in ACTIVE)


def _log(conn, requirement_id, actor, decision, rationale):
    conn.execute(
        "INSERT INTO gate_event(requirement_id, gate, actor, decision, rationale) VALUES (?,?,?,?,?)",
        (requirement_id, GATE, actor, decision, rationale),
    )
    conn.commit()  # a refusal must be recorded even though the caller gets an error


def _weak_fields(result_json: str | None) -> str:
    try:
        d = json.loads(result_json or "{}")
    except ValueError:
        return ""
    return ", ".join((d.get("critical_zero") or []) + (d.get("critical_one") or []))


def approve(conn: sqlite3.Connection, requirement_id: int, actor: str, rationale: str = "") -> dict:
    req = conn.execute("SELECT * FROM requirement WHERE id=?", (requirement_id,)).fetchone()
    if req is None:
        raise LookupError(f"requirement {requirement_id} not found")
    conf, capped = req["confidence"], req["capped_by"]

    def refuse(reason: str):
        _log(conn, requirement_id, actor, "refused", f"{reason} | {rationale}".strip(" |"))
        raise Refused(reason, conf, capped)

    if req["status"] == APPROVED:
        refuse("requirement is already approved")
    if conf is not None and conf < config.THRESHOLD_DRAFT_BLOCKED:
        reason = f"confidence {conf} is below {config.THRESHOLD_DRAFT_BLOCKED}"
        if capped and capped.lower() != "not capped":
            reason += f"; capped by: {capped}"
        else:
            weak = _weak_fields(req["result_json"])
            if weak:
                reason += f"; critical fields not specified: {weak}"
        refuse(reason)
    if req["status"] not in APPROVABLE or conf is None:
        refuse(f"requirement status is '{req['status']}'; only a scored, ready BRD can pass {GATE}")
    _log(conn, requirement_id, actor, "approved", rationale)
    conn.execute("UPDATE requirement SET status=? WHERE id=?", (APPROVED, requirement_id))
    conn.commit()
    return {"requirement_id": requirement_id, "status": APPROVED, "confidence": conf}
