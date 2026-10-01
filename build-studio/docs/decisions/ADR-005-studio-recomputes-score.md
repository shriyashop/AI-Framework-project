# ADR-005: Studio recomputes the confidence score

**Status:** accepted 2026-10-01

**Decision.** The agent's stated confidence, status, cap and critical-field lists are claims. `api/brd_parser.py` rebuilds them from the 18 rows (raw/36, rounded down, cap 40 if any critical field is 0, else 70 if any is 1). Any disagreement is `score_mismatch` and the run is not trusted. Unsigned acceptance criteria must score 0 on field 8.

**Why.** The prompt is a strong default; this is the control. It also covers a model that nudges a 74 up to 75.
