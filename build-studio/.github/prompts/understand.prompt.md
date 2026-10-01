---
name: understand
description: 'Lane A step 1 — build a grounded description of what an existing application actually does, including behaviour nobody documented.'
argument-hint: '<path to the module, file or feature to understand>'
agent: agent
---

# Understand

You are producing the description a maintainer needs before anything is changed. This is the highest-value step in modernization work and the one most often skipped.

**You are not fixing anything in this step. You are not proposing changes. You are reading.**

## Method

Work in this order. Do not skip ahead to conclusions.

### 1. Map the surface

List every entry point: routes, exported functions, scheduled jobs, event handlers, CLI commands. For each, one line on what it appears to do. Cite file and line.

### 2. Trace the data

What tables, files or external services does this read and write? Where does the data come from and where does it go? Name the actual identifiers, not categories.

### 3. Find the business rules — this is the important part

Read the conditional logic line by line. Every threshold, every magic number, every early return, every nested branch encodes a decision somebody made for a reason.

For each rule you find, record:

| Rule | Where | Documented? | Confidence |
|---|---|---|---|

**Rules that appear nowhere in documentation are the finding.** They are also the ones a rewrite silently drops, which is how modernization projects break production.

Look specifically for:
- Magic numbers and thresholds with no named constant
- Early returns that bypass later logic
- Helper functions called from one place, far from their definition, with uninformative names
- Conditions on codes, prefixes or flags (`startsWith`, category equality, boolean columns)
- Date and window arithmetic — fiscal periods, grace windows, cut-offs
- Anything comparing against a field that exists only for that comparison

### 4. Find the divergence

Where is the same rule implemented more than once? Compare the implementations character by character. **Where they differ, say which is correct or state that you cannot tell.** Diverged duplicates are the most dangerous thing in a legacy codebase because any single reading of the code looks consistent.

### 5. Find what is not reachable

Routes shadowed by earlier ones, functions never called, parameters never used, branches that cannot execute. List them. Do not delete them yet.

### 6. Find the traps

What would a competent developer break here on their first day? Be specific and concrete.

## Rules for this step

- **Cite everything.** Every claim carries a file and line. If you have not opened it, you do not describe it.
- **Never infer a rule from a name.** `validateClaim()` may not validate. Read the body.
- **Comments are evidence, not truth.** Where a comment and the code disagree, record both and say which one the machine obeys.
- **Mark uncertainty as `ASSUMPTION:`** with the basis for it.
- **Do not propose changes.** If you notice something that should change, add it to an "Observations for later" list at the end and leave it there.

## Output

Write to `docs/discovery/<component>.md`:

```markdown
# <Component> — Discovery

## What it does
[Two paragraphs, plain language, for someone who has never seen this code.]

## Entry points
| Entry point | File:line | Purpose |

## Data
[Reads / writes / external calls]

## Business rules
| # | Rule | File:line | Documented | Confidence |

### Undocumented rules
[Each one expanded: what it does, what triggers it, what breaks if it is dropped.]

## Diverged implementations
| Logic | Implementations | Differences | Which is correct |

## Unreachable code

## Traps for a new maintainer

## Open questions
[What you could not determine from the code alone and who could answer it.]

## Observations for later
[Things worth changing. Not changed now.]
```

## Then stop

End with the three questions someone should be able to answer about this component before they are allowed to change it. Do not proceed to planning.
