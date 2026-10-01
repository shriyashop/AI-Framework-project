---
name: test
description: 'Derive and generate tests from human-authored acceptance criteria — never from the implementation.'
argument-hint: '<the acceptance criteria, or the component to characterise>'
agent: agent
---

# Test

## The independence rule

**Acceptance criteria must be human-authored and must predate the tests.**

If you write the criteria and then the tests that check them, you have built a closed loop. It reliably produces green pipelines over shipped defects, because the thing being verified and the thing doing the verifying came from the same understanding — including the same misunderstanding.

Before you write a single test, open the linked BRD and check §6:

- **Signed by a named human, with a date** → those are your criteria. Use them as written.
- **Unsigned, or marked DRAFT** → stop. The criteria are a proposal, not a specification. Ask for them to be reviewed and signed.
- **No BRD** → stop and ask for one.

Do not offer to draft criteria and then test against your draft. You may help someone write criteria in a separate conversation, before this one — that is the whole reason the BRD is a separate step with a human signature on it.

## Two jobs, depending on lane

### Lane A — characterisation tests, written first

You are capturing what the system does *now*, before anything changes. This is not the same as testing what it *should* do.

- Write tests against current behaviour, including behaviour that looks wrong.
- **Run them against unchanged code.** They must pass. A characterisation test that fails on unchanged code is testing your assumption, not the system — fix the test.
- Cover every business rule in the discovery document, including the undocumented ones, especially the undocumented ones.
- Test the boundaries exactly: if a threshold is 75, test 74, 75 and 76.
- Where behaviour looks like a bug, capture it anyway and mark it `// CURRENT BEHAVIOUR — possibly a defect, preserved deliberately`. Deciding whether to fix it is a separate, human decision.

### Lane B — tests from criteria

- One test per acceptance criterion, traceable to it by name.
- Then the negative cases: what a careless user does, what a hostile user does, what happens at zero, at one, at the maximum, and past it.
- Then the boundaries the criteria did not mention, which is where the criteria were incomplete. Flag those gaps — they are a finding about the requirement, not just a test.

## Every test must answer one question

**What defect would this catch?**

If the answer is "none, it just runs the code", delete it and write a better one. Coverage that catches nothing is worse than no coverage, because it is reported as safety.

State the answer for each test in a comment or the test name. It should be possible to read the test list and understand the risk model.

## Test data

- Synthetic only. Never real customer records, never a production extract, never "anonymised" real data.
- Shaped like production: realistic distributions, realistic edge cases, realistic messiness.
- Fixtures contain no secrets, no real emails, no real identifiers.

## Then

Run them. Report real results — pass, fail, error, skipped, with actual output.

Never report a test as passing that you have not executed. If you could not run them, say that clearly and say why; an unexecuted test suite is a draft, not a result.

```
Tests: <n> written, <n> executed
Passing: <n>   Failing: <n>   Not run: <n>

Criteria covered:      [each, by name]
Criteria NOT covered:  [each, and why]
Gaps found in criteria: [boundaries the criteria did not specify]

Lane A only:
Characterisation suite passes against unchanged code: [yes/no]
Business rules from discovery covered: [n of n — list any missing]
```
