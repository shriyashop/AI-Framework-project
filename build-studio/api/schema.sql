CREATE TABLE IF NOT EXISTS project (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    slug           TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    workspace_path TEXT NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS requirement (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES project(id),
    raw_text    TEXT NOT NULL,
    brd_path    TEXT,
    confidence  INTEGER,
    status      TEXT NOT NULL,
    capped_by   TEXT,
    result_json TEXT,
    status_reason TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Token and cost columns are nullable: Copilot agent tasks do not report them
-- (ADR-001). NULL means "not reported by provider", never zero.
CREATE TABLE IF NOT EXISTS agent_run (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id INTEGER NOT NULL REFERENCES requirement(id),
    session_id     TEXT,
    provider_ref   TEXT,
    pr_url         TEXT,
    prompt_ref     TEXT NOT NULL,
    model          TEXT,
    input_tokens   INTEGER,
    output_tokens  INTEGER,
    cost_cents     INTEGER,
    exit_status    TEXT,
    workspace_sha  TEXT NOT NULL,
    started_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    finished_at    TEXT
);

CREATE TABLE IF NOT EXISTS gate_event (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id INTEGER NOT NULL REFERENCES requirement(id),
    gate           TEXT NOT NULL,
    actor          TEXT NOT NULL,
    decision       TEXT NOT NULL CHECK (decision IN ('approved','refused')),
    rationale      TEXT,
    at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TRIGGER IF NOT EXISTS gate_event_no_update
BEFORE UPDATE ON gate_event
BEGIN SELECT RAISE(ABORT, 'gate_event is append-only'); END;

CREATE TRIGGER IF NOT EXISTS gate_event_no_delete
BEFORE DELETE ON gate_event
BEGIN SELECT RAISE(ABORT, 'gate_event is append-only'); END;
