-- expense claims db
-- created 2013-02-11 (AB)
-- 2014-06 added cost_centre (JM)
-- 2016-11 added late_claim_waiver for the field engineers, see FIN ticket 4412
-- 2019-03 approval_route was a varchar(40), widened. do not shrink.

CREATE TABLE IF NOT EXISTS employees (
  id                INTEGER PRIMARY KEY,
  emp_no            TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  email             TEXT,
  department        TEXT,
  cost_centre       TEXT,
  manager_id        INTEGER,
  is_director       INTEGER DEFAULT 0,
  late_claim_waiver INTEGER DEFAULT 0,
  active            INTEGER DEFAULT 1,
  joined_dt         TEXT
);

CREATE TABLE IF NOT EXISTS claims (
  id             INTEGER PRIMARY KEY,
  claim_ref      TEXT NOT NULL,
  employee_id    INTEGER NOT NULL,
  expense_dt     TEXT NOT NULL,
  submitted_dt   TEXT,
  category       TEXT,
  cost_centre    TEXT,
  description    TEXT,
  amount         REAL DEFAULT 0,
  currency       TEXT DEFAULT 'GBP',
  has_receipt    INTEGER DEFAULT 0,
  status         TEXT DEFAULT 'DRAFT',
  approval_route TEXT,
  approver_id    INTEGER,
  decided_dt     TEXT,
  notes          TEXT,
  created_at     TEXT
);

-- was going to normalise this out into claim_lines. never happened.
CREATE TABLE IF NOT EXISTS claim_lines (
  id         INTEGER PRIMARY KEY,
  claim_id   INTEGER NOT NULL,
  line_desc  TEXT,
  line_amt   REAL DEFAULT 0,
  vat_amt    REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_log (
  id        INTEGER PRIMARY KEY,
  claim_id  INTEGER,
  actor     TEXT,
  action    TEXT,
  detail    TEXT,
  ts        TEXT
);

CREATE INDEX IF NOT EXISTS ix_claims_emp ON claims (employee_id);
CREATE INDEX IF NOT EXISTS ix_claims_status ON claims (status);
