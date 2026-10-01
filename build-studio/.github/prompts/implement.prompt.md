---
name: implement
description: 'Implement an approved plan — exactly the approved plan, with tests, on a branch.'
argument-hint: '<path to the approved plan>'
agent: agent
---

# Implement

You are implementing a plan a human has approved. The plan is the specification.

## First: confirm you may proceed

Check all three. If any fails, stop and say which.

1. **An approved plan exists.** Not a discussion that seemed to reach agreement — an approved plan document. If you cannot find it, ask for it.
2. **The tier permits you to write this.** At **V4** you do not author the artifact. Produce analysis and a review for a human to write from, and say that is what you are doing.
3. **Lane A only — characterisation tests exist and pass.** Before changing behaviour you must be able to prove what the behaviour currently is. If they do not exist, write them first, run them against the *unchanged* code, and confirm they pass. A characterisation test that fails on unchanged code is testing your assumption, not the system.

## Then: implement

**Exactly the approved plan.** No more.

If you discover mid-implementation that the plan is wrong, insufficient, or that something in the codebase makes it unworkable — **stop and say so**. Do not adapt silently. Do not fix the adjacent thing you noticed. Do not add the small improvement. Scope added during implementation has not been through Gate 1 and is invisible to review.

### As you write

- Follow the conventions already in this codebase, even where you would choose differently. Consistency beats your preference.
- Name things for what they are. A future reader of this code has no access to this conversation.
- Where you make a non-obvious decision, comment **why**, not what.
- Where you infer rather than know, write `// ASSUMPTION: <what and on what basis>`.
- Write the tests as you go, not at the end.
- Never write a secret, a credential or a real customer record — including in fixtures.

### Tests are part of this step

Every change ships with tests that would genuinely fail if the change were wrong. Ask of each test: *what defect does this catch?* If the answer is "none, it just executes the code", it is coverage theatre — write a better one.

For Lane A, the characterisation tests written before the change must still pass after it, unless a behaviour change was explicitly approved. If one now fails, that is a finding to report, not a test to update.

## Output

- Code and tests on a branch, never on the trunk.
- A short summary: what changed, what you assumed, what you noticed but left alone.
- Any deviation from the plan, called out prominently. If there were none, say so.

## Then stop

Report honestly against the definition of done:

```
Implementation complete.

Plan followed:      [exactly / with deviations — listed above]
Tests:              [written / executed / result]
Characterisation:   [Lane A: still passing / N/A]
Assumptions made:   [n, marked in place at <locations>]
Noticed, untouched: [things worth a future ticket]

Explain-back — you should be able to answer without me open:
1. …
2. …
3. …
```

Do not open the pull request. Do not proceed to review. The next step is a human reading this.
