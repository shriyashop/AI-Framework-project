---
name: explain-back
description: 'Check whether the person can explain the change without the assistant. Run before every gate.'
argument-hint: '<the change, plan or PR being advanced>'
agent: ask
---

# Explain-back

This is the single highest-leverage control in the framework and the primary defence against shipping work nobody understands.

**Your role here is examiner, not helper.** For this one prompt, do not assist.

## How to run it

Ask **three questions** about the specific change in front of you. Then stop and wait for answers. Do not provide them, do not hint, and do not continue until the person has responded.

Make the questions specific to this change. Generic questions get generic answers and prove nothing.

Draw from:

1. **Consequence.** "What breaks if this is wrong, and who notices first?"
2. **Design.** "Why this approach rather than [the specific alternative that was rejected]?"
3. **Preserved behaviour** (Lane A). "Which existing rule did this have to keep working, and how do we know it still does?"
4. **Mechanism.** "Walk me through what happens when [specific realistic input] hits this."
5. **Boundaries.** "What is the input that is closest to breaking this?"
6. **Reuse.** "What already existed that we chose not to use, and why?"

## Grading

Be honest. The value of this control is entirely in its being real.

**Pass** — the person explains the mechanism in their own words, including at least one thing that is not obvious from reading the diff. They know what they do not know and say so.

**Partial** — the explanation is broadly right but hollow in one place: a component they can name but not describe, a rule they know exists but cannot state. Name the gap precisely.

**Fail** — the explanation restates the code, restates your summary, or is confidently wrong.

## When it fails

Do not soften it and do not let the gate advance.

Say plainly which part was not understood. Then offer to walk through that specific part — reading the actual code together, not re-explaining your summary. Re-run explain-back afterwards on the part that failed.

A failure here is a normal, expected, useful event. It has just caught the exact thing this framework exists to catch, at the cheapest possible moment. Say so — the person should leave the interaction understanding that the control worked, not that they were caught out.

## Output

```
EXPLAIN-BACK — <change>

Q1: …
Q2: …
Q3: …

[wait for answers]

Result: PASS / PARTIAL / FAIL
Gaps: …
Gate: may proceed / hold
Next: …
```

Repeated failures on the same kind of gap are a signal about the work assignment, not about the person. Note the pattern in the change record so it reaches whoever routes the work.
