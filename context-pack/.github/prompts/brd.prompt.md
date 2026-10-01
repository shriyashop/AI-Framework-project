---
name: brd
description: 'Capture a requirement as a Business Requirements Document, score its completeness, and stop for a human wherever it is incomplete. The front door to the pipeline.'
argument-hint: '<the requirement, however roughly stated>'
agent: agent
---

# BRD — Business Requirements Document

This is the front door. Every piece of work enters here, before `/understand` and long before `/plan`.

**Your job is not to produce a complete-looking document. It is to find out what nobody has decided yet, and refuse to paper over it.**

A BRD that reads as finished while three critical fields were guessed is worse than no BRD, because the guesses acquire the authority of a signed document and nobody revisits them.

---

## The two failure modes you must avoid

**Filling gaps with plausible content.** You will be able to write a convincing "Success criteria" section from nothing. Do not. An invented success criterion is how a project ships the wrong thing on time and under budget.

**Treating a fluent request as a specified one.** A requirement that arrives in polished prose is the one to distrust most. Fluency is not specification. Someone who writes three tidy paragraphs has usually decided less than someone who writes six messy questions.

When you do not know, the field reads `NOT PROVIDED` and it costs the score. That is the mechanism working.

---

## Method

### Step 1 — Capture what was actually said

Restate the request in your own words before analysing it. If your restatement differs from what was asked, that difference is your first finding — surface it rather than silently adopting your version.

### Step 2 — Fill what you were given, mark what you were not

Work through the template at `docs/templates/BRD-TEMPLATE.md`. For every field, exactly one of:

- **The answer**, when it was stated or is unambiguously implied by something you read.
- **`NOT PROVIDED`**, when it was not. Never a guess, never a plausible default.
- **`ASSUMPTION: <what> — basis: <why>`**, when you are inferring. Assumptions are allowed; unmarked assumptions are not.

### Step 3 — Determine the lane

| Test | Lane |
|---|---|
| Does the thing already exist and have users? | **A — Modernize** |
| Are you creating something new, in a new location? | **B — Build** |
| Both — a new component inside an existing system? | **A**, because the existing system constrains it |
| Cannot tell | **A**, and say so. Being wrong towards caution is cheap; the reverse is not |

State the reasoning. This drives which instruction files govern the work, so it is not a label.

### Step 4 — Recommend the technology, then record any deviation

Two separate things, and the distinction matters.

**Our recommendation.** What you would build this with, given the house stack, what already exists in the repository, and the requirement. Give the reason for each choice in one line. Where an existing component or configuration would satisfy the requirement without new code, say so — that is a recommendation of *nothing*, and it is often the right one.

**Their deviation, if any.** If the requester wants something different, record:
- what they want instead,
- **their reason, in their words, not your paraphrase**,
- the consequences of the deviation that they may not have considered,
- whether it changes the verification tier.

**A deviation is never blocked here.** Recording it is the point. You are building the decision record that explains, in two years, why this service is not like the others. That record is what stops someone "fixing" it back.

If the reason is missing, that is a `NOT PROVIDED` on a critical field. "The requester preferred X" is not a reason.

### Step 5 — Score it

Fill the scoring table honestly. The score is computed, not judged — see below.

### Step 6 — Stop where the score says stop

---

## Scoring

Score each field **0, 1 or 2**:

| Value | Meaning |
|---|---|
| **0** | Absent, `NOT PROVIDED`, or answered with something that does not answer it |
| **1** | Present but thin — directionally right, not actionable. Someone would still have to ask a follow-up before building |
| **2** | Specified — a builder could act on it without coming back |

Show the table with a one-line justification per field. **A score without its table is not a score.** Anyone reading this must be able to check your arithmetic and disagree with a specific row.

### The eight critical fields

These cap the total regardless of how well everything else scored:

1. Business problem — what is wrong today
2. Success criteria — how we know it worked
3. Users — who does what, and what they do instead today
4. Scope boundary — what is explicitly *not* in this
5. Lane
6. Data classification — T1/T2/T3/T4
7. Constraints — deadlines, compliance, systems that must not change
8. Acceptance criteria — human-authored, testable

**Caps:**

- Any critical field at **0** → confidence **cannot exceed 40**
- Any critical field at **1** → confidence **cannot exceed 70**

Apply the cap even when the arithmetic gives more. Say which field caused the cap.

### Thresholds and what happens

| Score | Status | What you do |
|---|---|---|
| **Below 50** | **NOT A REQUIREMENT YET** | Stop. Do not write the rest of the BRD. Return the gap list as a set of questions and nothing else. |
| **50–74** | **DRAFT — BLOCKED** | Write the BRD, mark it blocked, list every gap with who can answer it. `/plan` will refuse this. |
| **75–89** | **READY WITH OPEN QUESTIONS** | Proceed, carrying the named open questions into the plan where they must be resolved before Gate 1. |
| **90+** | **READY** | Proceed. |

**`/plan` refuses any BRD scoring below 75.** That is the human-in-the-loop mechanism: not a suggestion to check with someone, a stop.

**Never round up to clear a threshold.** If it scores 74, it scores 74, and the correct action is to ask four questions rather than to find a generous reading of one field. A BRD nudged over the line is the single most damaging thing you can produce in this step — it converts a known gap into an invisible one.

---

## Acceptance criteria — read this before writing them

The acceptance criteria in this document are the ones `/test` will later be forbidden from writing itself. The independence rule exists because criteria and tests written from the same understanding share the same blind spot.

So:

- **You may draft criteria as a proposal.** Mark the section `DRAFT — REQUIRES HUMAN AUTHORSHIP`.
- **A human must review, edit and sign them** before they count. The BRD records who and when.
- **Unsigned criteria score 0** on critical field 8, which caps confidence at 40. A BRD cannot be READY with unsigned acceptance criteria.

This is where the independence rule is actually enforced. If it is skipped here, `/test` has nothing legitimate to work from and the whole verification chain is a closed loop.

---

## UI work

If the requirement involves any user interface, the BRD is **not complete** without `docs/templates/UIUX-INPUT-TEMPLATE.md` filled in and the brand assets referenced in `.github/instructions/ui-ux-standards.instructions.md` available.

Missing UI/UX inputs score 0 on their own field and are listed as a gap. Do not invent screens, flows, states or visual decisions — building the wrong interface is expensive and highly visible, and it is the kind of wrong that people remember.

---

## Output

Write to `docs/brd/BRD-<id>-<slug>.md` using the template.

End with exactly this block:

```
BRD-<id> — <title>

Confidence:   <n>/100   [<STATUS>]
Capped by:    <field, or "not capped">
Lane:         A / B — <one line why>
Tier:         V1–V4 — <one line why>

Critical fields at 0:  <list, or none>
Critical fields at 1:  <list, or none>

GAPS — each needs an answer before this can proceed:
1. <question>  → <who can answer>
2. …

Acceptance criteria: DRAFT, unsigned / SIGNED by <name> on <date>

Next step: <"/plan" if ≥75, otherwise "answer the gaps above and re-run /brd">
```

## Then stop

Do not run `/understand`. Do not run `/plan`. Do not begin designing.

If the score is below 75, do not offer to "start on the parts that are clear." Parts that look clear inside an unclear requirement are exactly where the misunderstanding hides — the clear-looking parts are clear because they were assumed, not because they were decided.
