"""Strict parser and independent scorer for the /brd result file.

Copilot agent tasks cannot return schema-validated JSON (ADR-001), so the agent
writes a markdown result file and we parse it here. Two rules:

* An unrecognised shape is a failure (ParseFailed), never a default score.
* Studio recomputes the score from the 18 rows. If it disagrees with what the
  agent claimed, that is ScoreMismatch and the run is not trusted (ADR-005).
"""
import re
from dataclasses import dataclass, field

from . import config

FIELD_NAMES = [
    "Business problem", "Success criteria", "Users", "Scope boundary",
    "Lane", "Data classification", "Constraints", "Acceptance criteria",
    "What happens if we do nothing", "Current workaround understood",
    "Functional requirements traceable", "Reuse checked",
    "Technology recommendation", "Deviation reason recorded",
    "UI/UX inputs", "Dependencies identified", "Risks identified",
    "Negative and boundary cases",
]
ACCEPTANCE_FIELD = 8

NOT_A_REQUIREMENT = "not_a_requirement"
DRAFT_BLOCKED = "draft_blocked"
READY_OPEN_QUESTIONS = "ready_open_questions"
READY = "ready"

_STATUS_TEXT = {
    "NOT A REQUIREMENT YET": NOT_A_REQUIREMENT,
    "DRAFT BLOCKED": DRAFT_BLOCKED,
    "READY WITH OPEN QUESTIONS": READY_OPEN_QUESTIONS,
    "READY": READY,
}

_ROW = re.compile(r"^\|\s*(\d+)\s*(★)?\s*\|\s*(.+?)\s*\|\s*([^|]*?)\s*\|\s*(.*?)\s*\|?\s*$")
_CONF = re.compile(r"^Confidence:\s*(\d+)\s*/\s*100\s*\[([^\]]+)\]\s*$", re.M)
_CAPPED = re.compile(r"^Capped by:\s*(.+?)\s*$", re.M)
_LANE = re.compile(r"^Lane:\s*([AB])\b\s*(?:[—–-]+\s*(.*))?$", re.M)
_TIER = re.compile(r"^Tier:\s*(V[1-4])\b\s*(?:[—–-]+\s*(.*))?$", re.M)
_ZERO = re.compile(r"^Critical fields at 0:\s*(.+?)\s*$", re.M)
_ONE = re.compile(r"^Critical fields at 1:\s*(.+?)\s*$", re.M)
_HEAD = re.compile(r"^(BRD-[\w.]+)\s*[—–-]+\s*(.+?)\s*$", re.M)
_GAP = re.compile(r"^\s*(\d+)\.\s+(.+?)\s*$")
_AC = re.compile(r"^Acceptance criteria:\s*(.+?)\s*$", re.M)


class ParseFailed(Exception):
    """Result file did not have the expected shape."""


class ScoreMismatch(Exception):
    """Agent's stated score disagrees with Studio's recomputation."""

    def __init__(self, differences: list[str], parsed: "ParsedBRD"):
        super().__init__("; ".join(differences))
        self.differences = differences
        self.parsed = parsed


@dataclass
class Row:
    number: int
    field: str
    score: int
    justification: str
    critical: bool


@dataclass
class Computed:
    raw: int
    pct: int
    cap: int | None
    capped_fields: list[str]
    final: int
    status: str


@dataclass
class ParsedBRD:
    brd_id: str
    title: str
    rows: list[Row]
    agent_confidence: int
    agent_status: str
    agent_capped_by: str
    lane: str
    lane_reason: str
    tier: str
    tier_reason: str
    gaps: list[dict]
    ac_signed: bool
    computed: Computed = field(default=None)  # type: ignore[assignment]


def _norm(text: str) -> str:
    text = re.sub(r"\(.*?\)", "", text)
    return re.sub(r"\s+", " ", text).strip().lower()


def _need(pattern: re.Pattern, text: str, label: str) -> re.Match:
    m = pattern.search(text)
    if not m:
        raise ParseFailed(f"missing or malformed '{label}' line in result block")
    return m


def parse_rows(text: str) -> list[Row]:
    found: dict[int, Row] = {}
    for line in text.splitlines():
        m = _ROW.match(line.strip())
        if not m or m.group(3).lower() in ("field", "---"):
            continue
        num = int(m.group(1))
        if not 1 <= num <= config.NUM_FIELDS:
            continue
        if num in found:
            raise ParseFailed(f"scoring row {num} appears more than once")
        if m.group(4) not in ("0", "1", "2"):
            raise ParseFailed(f"row {num}: score {m.group(4)!r} is not 0, 1 or 2")
        if _norm(m.group(3)) != _norm(FIELD_NAMES[num - 1]):
            raise ParseFailed(
                f"row {num}: field {m.group(3)!r} does not match template field {FIELD_NAMES[num - 1]!r}"
            )
        found[num] = Row(num, FIELD_NAMES[num - 1], int(m.group(4)), m.group(5), num in config.CRITICAL_FIELD_NUMBERS)
    if sorted(found) != list(range(1, config.NUM_FIELDS + 1)):
        missing = sorted(set(range(1, config.NUM_FIELDS + 1)) - set(found))
        raise ParseFailed(f"expected {config.NUM_FIELDS} scoring rows, found {len(found)}; missing {missing}")
    return [found[i] for i in range(1, config.NUM_FIELDS + 1)]


def compute(rows: list[Row], ac_signed: bool = True) -> Computed:
    raw = sum(r.score for r in rows)
    pct = (raw * 100) // config.MAX_RAW  # floor: never round up to clear a threshold
    crit = [r for r in rows if r.critical]
    zeros = [r.field for r in crit if r.score == 0]
    ones = [r.field for r in crit if r.score == 1]
    cap, capped = None, []
    if zeros:
        cap, capped = config.CAP_CRITICAL_ZERO, zeros
    elif ones:
        cap, capped = config.CAP_CRITICAL_ONE, ones
    final = min(pct, cap) if cap is not None else pct
    if final < config.THRESHOLD_NOT_A_REQUIREMENT:
        status = NOT_A_REQUIREMENT
    elif final < config.THRESHOLD_DRAFT_BLOCKED:
        status = DRAFT_BLOCKED
    elif final < config.THRESHOLD_READY:
        status = READY_OPEN_QUESTIONS
    else:
        status = READY
    binding = cap is not None and pct > cap
    return Computed(raw, pct, cap, capped if binding else [], final, status)


def _fields_in(line: str, rows: list[Row]) -> set[str]:
    if _norm(line) in ("none", "n/a", "-"):
        return set()
    low = _norm(line)
    return {r.field for r in rows if r.critical and _norm(r.field) in low}


def _parse_gaps(text: str) -> list[dict]:
    head = re.search(r"^GAPS\b.*$", text, re.M)
    if not head:
        raise ParseFailed("missing 'GAPS' section in result block")
    gaps = []
    for line in text[head.end():].splitlines():
        if _AC.match(line):
            break
        m = _GAP.match(line)
        if m:
            q, _, who = m.group(2).partition("→")
            gaps.append({"question": q.strip(), "owner": who.strip()})
    return gaps


def parse_result(text: str) -> ParsedBRD:
    """Parse and verify a BRD result file. Raises ParseFailed or ScoreMismatch."""
    rows = parse_rows(text)
    head = _need(_HEAD, text, "BRD-<id> — <title>")
    conf = _need(_CONF, text, "Confidence")
    status_key = re.sub(r"\s+", " ", re.sub(r"[—–-]", " ", conf.group(2))).strip().upper()
    if status_key not in _STATUS_TEXT:
        raise ParseFailed(f"unrecognised status {conf.group(2)!r}")
    lane = _need(_LANE, text, "Lane")
    tier = _need(_TIER, text, "Tier")
    zero_line = _need(_ZERO, text, "Critical fields at 0").group(1)
    one_line = _need(_ONE, text, "Critical fields at 1").group(1)
    ac = _need(_AC, text, "Acceptance criteria").group(1)
    parsed = ParsedBRD(
        brd_id=head.group(1), title=head.group(2), rows=rows,
        agent_confidence=int(conf.group(1)), agent_status=_STATUS_TEXT[status_key],
        agent_capped_by=_need(_CAPPED, text, "Capped by").group(1),
        lane=lane.group(1), lane_reason=(lane.group(2) or "").strip(),
        tier=tier.group(1), tier_reason=(tier.group(2) or "").strip(),
        gaps=_parse_gaps(text), ac_signed=ac.upper().startswith("SIGNED"),
    )
    parsed.computed = compute(rows)
    c = parsed.computed
    if c.final < config.THRESHOLD_NOT_A_REQUIREMENT and not parsed.gaps:
        raise ParseFailed("score below 50 must return a list of questions; none were given")

    diffs = []
    if parsed.agent_confidence != c.final:
        diffs.append(f"confidence: agent said {parsed.agent_confidence}, recomputed {c.final}")
    if parsed.agent_status != c.status:
        diffs.append(f"status: agent said {parsed.agent_status}, recomputed {c.status}")
    stated = _norm(parsed.agent_capped_by)
    compact = stated.replace(" ", "")
    names_cap = any(_norm(r.field) in stated or f"★{r.number}" in compact
                    for r in rows if r.field in c.capped_fields)
    if c.capped_fields and not names_cap:
        diffs.append(f"capped by: agent said {parsed.agent_capped_by!r}, recomputed {c.capped_fields}")
    if not c.capped_fields and stated not in ("not capped", "none", "n/a"):
        diffs.append(f"capped by: agent said {parsed.agent_capped_by!r}, but no cap applies")
    zeros = {r.field for r in rows if r.critical and r.score == 0}
    ones = {r.field for r in rows if r.critical and r.score == 1}
    if _fields_in(zero_line, rows) != zeros:
        diffs.append(f"critical fields at 0: agent listed {zero_line!r}, recomputed {sorted(zeros)}")
    if _fields_in(one_line, rows) != ones:
        diffs.append(f"critical fields at 1: agent listed {one_line!r}, recomputed {sorted(ones)}")
    if not parsed.ac_signed and rows[ACCEPTANCE_FIELD - 1].score != 0:
        diffs.append("acceptance criteria are unsigned but field 8 did not score 0")
    if diffs:
        raise ScoreMismatch(diffs, parsed)
    return parsed
