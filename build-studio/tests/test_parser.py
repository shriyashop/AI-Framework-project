import pytest

from api import brd_parser as bp
from tests.fixtures import GOOD, MID, READYQ, VAGUE, make_result


def test_vague_scores_below_50_with_questions():
    p = bp.parse_result(make_result(VAGUE))
    assert p.computed.final == 0 and p.computed.status == bp.NOT_A_REQUIREMENT
    assert p.gaps and p.computed.capped_fields == []  # cap does not bind at 0


def test_mid_is_capped_at_70_and_blocked():
    p = bp.parse_result(make_result(MID))
    assert (p.computed.pct, p.computed.final, p.computed.status) == (72, 70, bp.DRAFT_BLOCKED)
    assert p.computed.capped_fields[0] == "Business problem"


def test_ready_with_open_questions():
    p = bp.parse_result(make_result(READYQ, signed=True))
    assert p.computed.final == 77 and p.computed.status == bp.READY_OPEN_QUESTIONS


def test_good_is_ready():
    p = bp.parse_result(make_result(GOOD, signed=True))
    assert p.computed.final == 100 and p.computed.status == bp.READY


def test_floor_never_rounds_up():
    # raw 27 -> 75.0 exactly ok; raw 26 -> 72.2 must floor to 72, not 73
    assert bp.compute(bp.parse_rows(make_result(MID))).pct == 72


def test_unparseable_is_failure_not_a_default():
    with pytest.raises(bp.ParseFailed):
        bp.parse_result("this is not a BRD result")


def test_seventeen_rows_fail():
    text = make_result(GOOD, signed=True).replace("| 18 | Negative and boundary cases | 2 | because |\n", "")
    with pytest.raises(bp.ParseFailed, match="expected 18"):
        bp.parse_result(text)


def test_score_of_three_fails():
    text = make_result(GOOD, signed=True).replace("| 3 ★ | Users | 2 |", "| 3 ★ | Users | 3 |")
    with pytest.raises(bp.ParseFailed, match="not 0, 1 or 2"):
        bp.parse_result(text)


def test_wrong_field_name_fails():
    text = make_result(GOOD, signed=True).replace("| Users |", "| Customers |")
    with pytest.raises(bp.ParseFailed, match="does not match template"):
        bp.parse_result(text)


def test_missing_end_block_fails():
    text = make_result(GOOD, signed=True).split("```")[0]
    with pytest.raises(bp.ParseFailed, match="BRD-<id>"):
        bp.parse_result(text)


def test_below_50_without_questions_fails():
    with pytest.raises(bp.ParseFailed, match="questions"):
        bp.parse_result(make_result(VAGUE, gaps=()))


def test_inflated_confidence_is_a_mismatch():
    with pytest.raises(bp.ScoreMismatch) as e:
        bp.parse_result(make_result(MID, claim={"confidence": 80}))
    assert any("confidence" in d for d in e.value.differences)


def test_agent_ignoring_cap_is_a_mismatch():
    with pytest.raises(bp.ScoreMismatch) as e:
        bp.parse_result(make_result(MID, claim={"confidence": 72, "status": "DRAFT — BLOCKED"}))
    assert any("confidence" in d for d in e.value.differences)


def test_wrong_capped_by_is_a_mismatch():
    with pytest.raises(bp.ScoreMismatch):
        bp.parse_result(make_result(MID, capped_by="not capped"))


def test_unsigned_criteria_must_score_zero():
    scores = [2] * 18  # field 8 scored 2 but criteria unsigned
    with pytest.raises(bp.ScoreMismatch, match="unsigned"):
        bp.parse_result(make_result(scores, signed=False))
