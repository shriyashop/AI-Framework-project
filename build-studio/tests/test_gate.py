import sqlite3

import pytest

from api import state_machine as sm
from tests.conftest import add_requirement


def events(conn):
    return [dict(r) for r in conn.execute("SELECT gate, decision, actor FROM gate_event ORDER BY id")]


def test_approve_below_75_is_refused_and_names_capping_field(conn):
    rid = add_requirement(conn, sm.DRAFT_BLOCKED, 70, "Acceptance criteria")
    with pytest.raises(sm.Refused) as e:
        sm.approve(conn, rid, "alice")
    assert e.value.confidence == 70 and e.value.capped_by == "Acceptance criteria"
    assert "Acceptance criteria" in e.value.reason
    assert events(conn) == [{"gate": "G0", "decision": "refused", "actor": "alice"}]
    assert conn.execute("SELECT status FROM requirement WHERE id=?", (rid,)).fetchone()[0] == sm.DRAFT_BLOCKED


def test_not_a_requirement_is_refused(conn):
    rid = add_requirement(conn, sm.NOT_A_REQUIREMENT, 0, "Business problem")
    with pytest.raises(sm.Refused):
        sm.approve(conn, rid, "alice")
    assert all(e["decision"] != "approved" for e in events(conn))


def test_unscored_requirement_is_refused(conn):
    rid = add_requirement(conn, "parse_failed", None)
    with pytest.raises(sm.Refused):
        sm.approve(conn, rid, "alice")


def test_approve_ready_succeeds_once(conn):
    rid = add_requirement(conn, sm.READY, 92, "not capped")
    assert sm.approve(conn, rid, "alice", "ok")["status"] == sm.APPROVED
    assert events(conn)[-1]["decision"] == "approved"
    with pytest.raises(sm.Refused):
        sm.approve(conn, rid, "alice")


def test_gate_event_rejects_update_and_delete(conn):
    rid = add_requirement(conn, sm.READY, 92)
    sm.approve(conn, rid, "alice")
    with pytest.raises(sqlite3.IntegrityError, match="append-only"):
        conn.execute("UPDATE gate_event SET decision='refused'")
    with pytest.raises(sqlite3.IntegrityError, match="append-only"):
        conn.execute("DELETE FROM gate_event")
