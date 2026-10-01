# BRD-<id> — <title>

| | |
|---|---|
| **Requester** | |
| **Business owner** (accountable for the outcome) | |
| **Date raised** | |
| **Status** | ☐ Not a requirement yet ☐ Draft — blocked ☐ Ready with open questions ☐ Ready |
| **Confidence** | `<n>`/100 |
| **Lane** | ☐ A — Modernize ☐ B — Build |
| **Verification tier** | ☐ V1 ☐ V2 ☐ V3 ☐ V4 |
| **Data classification** | ☐ T1 Public ☐ T2 Internal ☐ T3 Confidential ☐ T4 Restricted |

> Every field below is either answered, marked `NOT PROVIDED`, or marked `ASSUMPTION: <what> — basis: <why>`. Nothing is guessed silently.

---

## 1. What this is

### 1.1 In one paragraph
*Plain language. No jargon, no technology. A person outside the team should understand what is being asked for.*

### 1.2 The business problem
*What is wrong today. Not the solution — the problem. If this reads like a description of a feature, it is the wrong answer.*

### 1.3 What happens if we do nothing
*The honest version. Sometimes the answer is "very little," and that is worth knowing before anyone spends a quarter on it.*

### 1.4 Why now
*What changed. A requirement with no trigger is usually someone's idea rather than a business need — which can still be fine, but should be visible.*

---

## 2. Users

| User type | What they do today | What they would do instead | How many |
|---|---|---|---|

### 2.1 Primary user
*Who this is mainly for. One named type, not "all staff."*

### 2.2 Who else is affected
*People downstream who do not use it but feel it. Often where the real risk is.*

### 2.3 What they do today instead
*The current workaround. A spreadsheet, an email chain, a person who just knows. **Understand this before replacing it** — it usually encodes rules nobody wrote down, and those rules are what the replacement drops.*

---

## 3. Success

### 3.1 Success criteria
*How we know this worked, in terms someone could check. Not "improved efficiency."*

| # | Criterion | How it is measured | Baseline today | Target |
|---|---|---|---|---|

### 3.2 What would make this a failure
*Stated separately and deliberately. Not the inverse of success — the specific outcomes that would mean this should not have been built.*

---

## 4. Scope

### 4.1 In scope

### 4.2 Explicitly out of scope
***Critical field.** What this deliberately does not do. An unbounded requirement cannot be planned, estimated or verified. If this section is empty the requirement is not ready, whatever else is filled in.*

### 4.3 Later, maybe
*Named so it can be excluded now without argument, and so nobody builds for it speculatively.*

---

## 5. Functional requirements

| # | Requirement | Priority | Source | Notes |
|---|---|---|---|---|
| F1 | | Must / Should / Could | *who asked* | |

*Every requirement traces to a stated need from a named person. A requirement with no source is one somebody invented — including possibly the assistant.*

---

## 6. Acceptance criteria

> **DRAFT — REQUIRES HUMAN AUTHORSHIP**
>
> These may be drafted as a proposal, but a human must review, edit and sign them before they count. Unsigned criteria score 0 and cap confidence at 40.
>
> This is the independence rule's origin point: `/test` is forbidden from writing both the criteria and the tests that check them. If these are not genuinely human-authored, the entire verification chain is a closed loop.

| # | Given | When | Then |
|---|---|---|---|
| AC1 | | | |

**Negative and boundary cases** — what a careless user does, what a hostile user does, what happens at zero, at one, at the maximum, past it:

| # | Case | Expected |
|---|---|---|

**Authored by:** `<name>` · **Date:** `<date>` · **Signed:** ☐

---

## 7. Constraints

| Type | Constraint | Source | Hard or soft |
|---|---|---|---|
| Deadline | | | |
| Compliance / regulatory | | | |
| Systems that must not change | | | |
| Budget | | | |
| Skills available | | | |

### 7.1 Data
*What data this touches, where it comes from, who owns it, and its classification. **T4 data stops the requirement here** — escalate for a compliant path rather than designing around it.*

---

## 8. Technology

### 8.1 Our recommendation

| Layer | Recommended | Why |
|---|---|---|
| Frontend | | |
| Backend | | |
| Database | | |
| Auth | | |
| Hosting | | |
| Other | | |

### 8.2 Reuse check
*What already exists that could satisfy this. Done before recommending anything new.*

| Searched (where, how) | Found | Reusable? | Why not |
|---|---|---|---|

*If configuration of an existing component satisfies the requirement, say so plainly. The recommendation of "build nothing" is a valid and frequently correct output of this section.*

### 8.3 Requested deviation

*Complete only if the requester wants something different from §8.1.*

| | |
|---|---|
| **What they want instead** | |
| **Their reason, in their words** | *Verbatim. Not paraphrased, not improved.* |
| **Consequences they may not have considered** | |
| **Does it change the verification tier?** | |
| **Accepted by** | `<name>`, `<date>` |

> A deviation is **recorded, not blocked**. This section is the decision record that explains in two years why this service is unlike the others — and it is what stops a future maintainer "correcting" it back.
>
> **A deviation with no stated reason is a gap, not a decision.** "The requester preferred it" is not a reason.

---

## 9. User interface

☐ This requirement involves no UI — skip to §10.

Otherwise `docs/templates/UIUX-INPUT-TEMPLATE.md` must be completed and linked here:

**UI/UX input document:** `<link>`
**Brand assets available:** ☐ yes ☐ no — *if no, this is a gap and UI work cannot begin*

---

## 10. Dependencies and risks

| Dependency | On whom | Needed by | Confirmed? |
|---|---|---|---|

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

---

## 11. Open questions

| # | Question | Who can answer | Blocking? | Answer | Answered by | Date |
|---|---|---|---|---|---|---|

*The most valuable section in this document. An empty open-questions list on a first draft means they were not looked for.*

---

## 12. Confidence scoring

Score each field 0 (absent) / 1 (thin) / 2 (specified). **Critical fields are marked ★ and cap the total.**

| # | Field | Score | Justification |
|---|---|---|---|
| 1 ★ | Business problem | | |
| 2 ★ | Success criteria | | |
| 3 ★ | Users | | |
| 4 ★ | Scope boundary (out of scope) | | |
| 5 ★ | Lane | | |
| 6 ★ | Data classification | | |
| 7 ★ | Constraints | | |
| 8 ★ | Acceptance criteria (signed) | | |
| 9 | What happens if we do nothing | | |
| 10 | Current workaround understood | | |
| 11 | Functional requirements traceable | | |
| 12 | Reuse checked | | |
| 13 | Technology recommendation | | |
| 14 | Deviation reason recorded (n/a scores 2) | | |
| 15 | UI/UX inputs (n/a scores 2) | | |
| 16 | Dependencies identified | | |
| 17 | Risks identified | | |
| 18 | Negative and boundary cases | | |

```
Raw:     <sum> / 36  =  <n>%
Cap:     <none | 70 — field ★<n> scored 1 | 40 — field ★<n> scored 0>
FINAL:   <n>/100     <STATUS>
```

**Do not round up to clear a threshold.** 74 is 74. The correct response is four questions, not a generous re-reading of one row.

---

## 13. Sign-off

| Role | Name | Date | |
|---|---|---|---|
| Requester — this is what I asked for | | | ☐ |
| Business owner — I am accountable for the outcome | | | ☐ |
| Acceptance criteria author — I wrote these | | | ☐ |
| Technical reviewer — this is buildable as described | | | ☐ |

*A BRD below 75 cannot be signed off. Fix the gaps first.*

---

## Change log

| Date | Change | By | New confidence |
|---|---|---|---|

*Append only. A BRD that changed after work started is a finding worth surfacing in the change record, not an edit to make quietly.*
