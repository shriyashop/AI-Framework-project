# ANSWER KEY — DEMO OPERATOR ONLY — DO NOT SHIP, DO NOT SHOW ON CAMERA

This file is **not part of the application**. It is the crib sheet for whoever is
running the AI-modernization showcase. Delete it (or keep it outside the repo the
agent is pointed at) before filming, otherwise the agent will simply read the
answers instead of discovering them.

The app itself has, deliberately: no README, no tests, no design docs, and no
correct comments. Everything below has to be recovered from `server.js` by
reading it.

---

## Running it

```
cd legacy/expense-claims
node server.js          # http://localhost:3000/
```

Node 22+ (uses the built-in `node:sqlite`). **Zero npm dependencies, no install
step, works offline.** `db/expenses.db` is created from `db/schema.sql` +
`db/seed.sql` on first boot. Delete that file to reset to a known state — worth
doing between takes, because the demo will have created claims.

---

## The six rules

Line numbers are for `server.js` as shipped (896 lines). They will drift if the
agent edits the file — the function names are the stable anchor.

### Rule 1 — Receipts required over 75 (documented-ish)

| | |
|---|---|
| Where | `validateClaim()` — **line 205**, `if (amt > 75)` |
| Comment above it | **line 204**: `// receipts are not needed under 100` — *wrong*, the code says 75 |
| Discoverability | Easy. This is the one people find. |

**Diverged duplicates** (the modernization trap — three places, three numbers):

* `renderClaim()` **line 425**: `if (clm.amount > 100 && clm.has_receipt != 1)` — the
  "no receipt attached" warning banner on the claim detail page uses **100**, so a
  claim at 80 with no receipt is blocked on submit but shows *no* warning if it
  got in another way.
* `renderReport()` **line 597**: `if (r.has_receipt != 1 && r.amount > 75)` — the
  month-end "missing a receipt" counter uses 75. Agrees with `validateClaim`,
  disagrees with the detail page.

**Seed records:** `EC-2026-0003` (id 3) is **exactly 75.00 with no receipt and
was accepted** — the strict-inequality boundary. `EC-2026-0004` (id 4) is
**75.01 with no receipt and was auto-rejected**. `EC-2026-0032` (id 32) is 74.99
no receipt, accepted. Any naive rewrite to `>= 75` breaks claim 3.

---

### Rule 2 — Director approval required over 500 (documented-ish)

| | |
|---|---|
| Where | `needs_dir_approval()` — **line 154**, `if (amt > 500)` |
| Called from | `buildRoute()` line 165, which is called from `validateClaim()` line 227 (`var r = buildRoute(clm, emp);`) |

**Diverged duplicates — this is the richest trap in the file. Four
implementations, no two the same:**

| Place | Line | Threshold | Has the `RD-` bypass? | Has CLIENT_ENT? |
|---|---|---|---|---|
| `needs_dir_approval()` (the real one) | 154 | `> 500` | **yes** (line 152) | no (lives in `buildRoute`) |
| `renderReport()` month-end screen | 592 | `>= 500` | **no** | yes (line 596) |
| `doDecide()` approve handler | 695 | `>= 500` | **yes** (line 696) | yes |
| `doApi()` JSON feed | 742 | `> 500` | **no** | yes (line 743) |

So `EC-2026-0005` (exactly 500.00) is routed to a manager by the engine, but the
month-end report prints "Director" against it, and the API says `needsDirector:
false`. And every `RD-` claim over 500 is mislabelled by both the report and the
API.

**Stale comment:** **line 591** says *"director sign off starts at 750 per the
2016 policy review"* directly above code that uses 500. There is no 750 anywhere
in the system.

**Seed records:** `EC-2026-0005` (id 5, exactly 500.00 → manager only) and
`EC-2026-0006` (id 6, 500.01 → `PENDING_DIR`).

---

### Rule 3 — UNDOCUMENTED: `CLIENT_ENT` always needs a director, at any amount

| | |
|---|---|
| Where | `buildRoute()` — **lines 168–174**, inside the `else` branch |
| Exact site | line 171, `if (k == 'CLIENT_ENT') {` — nested three conditionals deep inside `if (k.length > 5) { if (k.indexOf('CLIENT') === 0) { ... } }` |
| Comment | none |

Why it is easy to miss: it is in the **`else`** arm of `if (needs_dir_approval(...))`,
i.e. in the branch that a reader skims as "no director needed". The
`k.length > 5` and `indexOf('CLIENT') === 0` guards read like dead defensive
noise, so the eye slides over them. It is also in a *different function* from
the 500 threshold, so reading `needs_dir_approval()` alone tells you nothing.

**Precedence note for the operator:** rule 3 **beats** rule 6. An `RD-` cost
centre returns `0` from `needs_dir_approval()`, falls into the `else`, and then
gets `DIR` pushed anyway if the category is `CLIENT_ENT`. This is intentional and
is the sharpest interaction in the file.

**Seed records:**
* `EC-2026-0016` (id 16) — **CLIENT_ENT at 10.00, no receipt → `PENDING_DIR`.**
  The showcase example: ten currency units needing a director.
* `EC-2026-0017` (id 17) — CLIENT_ENT 42.50, `PENDING_DIR`.
* `EC-2026-0018` (id 18) — **CLIENT_ENT 310.00 on cost centre `RD-410`** →
  still went to a director. This is the rule 3 / rule 6 collision.
* `EC-2026-0034`, `EC-2026-0039` — further CLIENT_ENT items.

---

### Rule 4 — UNDOCUMENTED: >90 days after the expense date is auto-rejected, unless the employee has `late_claim_waiver = 1`

| | |
|---|---|
| Where | `validateClaim()` — **lines 213–223** |
| Exact sites | line 216 `if (dd > 90)`, line 217 `if (!emp \|\| emp.late_claim_waiver != 1)` |
| Comment | none |

Note this branch sets `res.status = 'REJECTED'` **and** `res.ok = false`, and the
submit handler at `doSubmit()` line 647 treats `ok === false` differently
depending on whether the status is `REJECTED` — a rejected-for-age claim is
**still written to the database** (as `REJECTED`), whereas a claim that failed
any other validation is silently not saved at all. That asymmetry is easy to
miss and is a real behavioural requirement.

`daysBetween()` (line 120) is UTC-midnight based and floors, so "90 days" is
exact-day arithmetic, not wall-clock.

**Seed records:**
* `EC-2026-0012` (id 12) — 2026-05-05 → 2026-08-03 = **exactly 90 days, accepted**
  (boundary; a rewrite to `>= 90` breaks it).
* `EC-2026-0013` (id 13) — 2026-05-04 → 2026-08-03 = **91 days, rejected**.
* `EC-2026-0037` (id 37) — 116 days, no waiver, rejected.
* `EC-2026-0014` (id 14) — **Yuki Tanaka (EMP007, `late_claim_waiver = 1`), 222
  days late, approved.**
* `EC-2026-0015` (id 15) — Tomasz Nowak (EMP004, waiver), 191 days, approved.

Waiver holders in the seed: **EMP004 Tomasz Nowak, EMP007 Yuki Tanaka, EMP008
Robert Vance.** Everyone else is 0.

---

### Rule 5 — UNDOCUMENTED: the fiscal year-end window suspends rule 4 entirely

| | |
|---|---|
| Where | `chkWin()` — **lines 873–882**, at the very bottom of the file in the "misc helpers" block |
| Called from | exactly one place: `validateClaim()` **line 214**, `if (!chkWin(clm.expense_dt, sub))` |
| Comment | none, anywhere |

`chkWin(expenseDate, submittedDate)` returns true when:

1. the **expense** month is **March** (`parseInt(a[1]) != 3` → false), and
2. the **submitted** month is **April**, and
3. the submitted **day of month is 14 or lower**.

When it returns true, the whole `dd > 90` / waiver block is skipped — the age
rule does not run at all. Because it is the *outer* guard, the window overrides
both the 90-day limit **and** makes the waiver irrelevant.

**Why this is the subtlest one, and the trap inside the trap:** `chkWin()`
deliberately **never compares the years.** A March **2025** expense submitted on
5 April **2026** is 381 days late and sails straight through. Anyone
"modernizing" this will either (a) not notice the function is load-bearing at
all because of its name and its position 650 lines away from the validation, or
(b) notice it and "fix" the missing year check — which silently changes
behaviour for real historical claims. Decide before filming which of those two
you want the agent to hit.

Also note it is unreachable through the web form for most of the year: the form
always stamps `submitted_dt = today`, so the window only opens 1–14 April. The
seeded rows and the `/admin/recalc` endpoint are how you demonstrate it
off-season.

**Seed records:**
* `EC-2026-0009` (id 9) — **expense 2025-03-27, submitted 2026-04-08 = 377 days
  late, no waiver, APPROVED.** The proof that the window suspends rule 4. The
  detail page for this claim prints "Claim age at submission: 377 day(s)" next
  to an approved status, which is the on-screen tell.
* `EC-2026-0011` (id 11) — **expense 2025-03-30, submitted 2026-04-**15** = 381
  days, REJECTED.** One day past the window. This is the pair that makes the
  `> 14` boundary visible.
* `EC-2026-0010` (id 10) and `EC-2026-0040` (id 40) — in-window but only ~20 days
  old, so benign. Decoys: they look like window cases and are not.

**Live demonstration off-season:** insert two pending claims and hit
`/admin/recalc` (a dry-run endpoint, changes nothing):

```
node -e "var s=require('node:sqlite');var c=new s.DatabaseSync('db/expenses.db');
c.exec(\"INSERT INTO claims (claim_ref,employee_id,expense_dt,submitted_dt,category,cost_centre,description,amount,currency,has_receipt,status,approval_route) VALUES \
('TMP-IN',5,'2025-03-20','2026-04-05','MEALS','MKT-300','window test',40,'GBP',0,'PENDING_MGR','MGR:6'),\
('TMP-OUT',5,'2025-03-20','2026-04-20','MEALS','MKT-300','window test',40,'GBP',0,'PENDING_MGR','MGR:6')\")"
curl http://localhost:3000/admin/recalc
```

Only `TMP-OUT` flips to `REJECTED`. Delete the two rows afterwards, or reset the
db file.

---

### Rule 6 — UNDOCUMENTED: cost centres starting `RD-` bypass the director threshold but still need receipts

| | |
|---|---|
| Where | `needs_dir_approval()` — **line 152**, `if (cc.indexOf('RD-') === 0) { return 0; }` |
| Comment | none |

A single-line early return, second statement in the function, sitting directly
above the `if (amt > 500)` that everyone's eye jumps to. It is the classic
skim-past. It also silently uppercases the cost centre first (line 151), so
`rd-410` works too.

The "**but still requires receipts**" half is a *negative* fact and therefore
even harder to spot: rule 1 is checked at line 205, well **before** any routing
happens at line 227, so there is no code path in which `RD-` skips the receipt
check. A rewrite that folds "RD- is delegated authority" into a single
short-circuit will lose the receipt requirement.

`doDecide()` (line 696) re-implements the bypass correctly; `renderReport()` (592)
and `doApi()` (742) both forget it — see the rule 2 table.

**Seed records:**
* `EC-2026-0007` (id 7) — **RD-410, 1290.00, receipt → approved with route
  `MGR:6`, no director.** The headline example.
* `EC-2026-0023` (id 23) — RD-420, 2200.00, receipt, no director.
* `EC-2026-0030` (id 30) — RD-410, 545.00 (just over the threshold), no director.
* `EC-2026-0008` (id 8) — **RD-410, 940.00, NO receipt → REJECTED, "Receipt
  required."** The proof that the bypass does not extend to receipts.
* `EC-2026-0018` (id 18) — RD-410 CLIENT_ENT → director anyway (rule 3 wins).

---

## Rule interaction matrix (the thing a good agent should end up producing)

| Scenario | Seed row | Outcome |
|---|---|---|
| 75.00, no receipt | id 3 | accepted (strictly greater than) |
| 75.01, no receipt | id 4 | rejected |
| 500.00 | id 5 | manager only |
| 500.01 | id 6 | director |
| CLIENT_ENT 10.00 | id 16 | director |
| CLIENT_ENT on RD- cost centre | id 18 | director (rule 3 > rule 6) |
| RD- 1290.00 with receipt | id 7 | manager only |
| RD- 940.00 without receipt | id 8 | rejected |
| exactly 90 days late | id 12 | accepted |
| 91 days late | id 13 | rejected |
| 222 days late, waiver holder | id 14 | accepted |
| 377 days late, March expense, submitted 8 April | id 9 | accepted (window) |
| 381 days late, March expense, submitted 15 April | id 11 | rejected (window closed) |

---

## Other planted pathologies (for talking points, not rules)

**SQL injection — `renderSearch()`, line 543.** `q` is concatenated straight into
three `LIKE` clauses, and `sort` (line 526) is concatenated into `ORDER BY`.
Verified exploitable:

* `/search?q=' OR 1=1 OR '` returns all 40 claims.
* `/search?q=%25' UNION SELECT id,emp_no,1,joined_dt,joined_dt,department,cost_centre,email,late_claim_waiver,is_director,'LEAK',full_name FROM employees --`
  dumps every employee email address into the results grid.
* Stacked statements (`'; DROP TABLE claims; --`) are refused by the driver, so
  the demo cannot accidentally destroy the database on camera. Read-side
  exfiltration works fully.
* `renderClaims()` also concatenates `dept` (line 361) and `cc` (line 362)
  unescaped. `sq()` (line 90) exists and escapes quotes — it is applied to
  `status` on line 360 and skipped on lines 361 and 362. Same function, same
  block, inconsistent use.

**Dead / unreachable code**
* Route `/legacy/export` at **line 819** is unreachable — line 813 already
  matches it in the same `else if` chain (`pth == '/export.csv' || pth ==
  '/legacy/export'`). Looks like a bad merge. The dead branch has a *different
  output format* (pipe-delimited, not CSV), so it is not a harmless duplicate.
* `fmt_money_old()` — line 114, never called.
* `getMgrChainDeprecated()` — line 858, never called, and recursive via callbacks.
* `trunc()` — line 884, never called.
* `needs_dir_approval()` takes a `cat` parameter (line 150) that it never uses —
  a leftover from when rule 3 lived there.
* `claim_lines` table is populated for 5 claims but `calcTot()` (line 127) only
  reads `clm.lines`, which nothing ever sets on the claim object — so the
  line-item branch is effectively dead and totals always come from `amount`.

**Other smells**
* Naming: `needs_dir_approval` / `buildRoute` / `chkWin` / `doCsv` / `fmt_money_old`
  / `emp_no` / `claim_ref` / `nextNo` — snake_case, camelCase and abbreviations
  in the same file, sometimes the same function.
* `var` only, no `let`/`const`, no arrow functions, no promises. Four-deep
  callback nesting in `renderClaim()` (lines 396–406) and `renderHome()`.
* The `db` shim at line 59 fakes the old `sqlite3` async API on top of the
  synchronous `node:sqlite` with `process.nextTick` — a genuine "we swapped the
  driver and kept the call style" artefact.
* `CURRENT_USER` is a hardcoded constant at line 38. There is no authentication
  at all; every visitor is the finance director and can approve anything.
* `doDecide()` (line 681) lets one person approve their own claim, and always
  writes `approver_id = 1` regardless of who acted.
* Claim reference generation at `doSubmit()` line 655 is `COUNT(*) + 1` — it will
  collide as soon as anything is deleted, and it hardcodes the current calendar
  year.
* `/admin/report` and `/admin/recalc` have no access control.
* XSS: most output goes through `esc()`, but the `flash` message in
  `renderNew()` (line 473) is written raw because the validation errors are HTML.
* Frontend is `static/js/jq-mini.js`, a hand-rolled jQuery stand-in with a
  comment explaining that IT blocked the CDN in 2014. Table layouts,
  `cellpadding`, XHTML 1.0 Transitional doctype, `onclick="return confirm(...)"`.

---

## Suggested demo beats

1. Ask the agent to "add tests" or "document the business rules" **before** it
   touches anything. Rules 1 and 2 come out immediately. Score it on 3–6.
2. The specific miss to watch for is **rule 5** — nothing links `chkWin` to
   year-end unless the reader opens it, and its name gives nothing away.
3. The best single "gotcha" moment is claim **id 18**: CLIENT_ENT on an `RD-`
   cost centre. It requires having found rules 3 *and* 6 *and* worked out which
   wins.
4. If the agent proposes replacing the four director-approval implementations
   with one, ask which of the four it picked and why — three of them are wrong
   in different directions.
