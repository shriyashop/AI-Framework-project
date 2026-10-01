# <Component> — Discovery

**Lane:** A (modernize)
**Produced by:** `/understand <target>`
**Date:** <date> · **Author:** <human accountable> · **Reviewed by:** <name>

> Output of the Understand step. Nothing here proposes a change. If a rule below
> is dropped by a later change, that is a defect — this document is what a review
> checks against.

## What it does

<Two paragraphs, plain language, for someone who has never seen this code.>

## Entry points

| Entry point | File:line | Purpose |
|---|---|---|

## Data

**Reads:** <tables, files, services>
**Writes:** <tables, files, services>
**External calls:** <what, where, what happens when it fails>

## Business rules

| # | Rule | File:line | Documented | Confidence |
|---|---|---|---|---|

### Undocumented rules

> The ones that matter. Each expanded: what it does, what triggers it, what
> breaks if a rewrite drops it, and which test now covers it.

**R<n> — <name>**
- Behaviour:
- Trigger:
- Consequence if dropped:
- Characterisation test:

## Diverged implementations

| Logic | Implementations (file:line) | How they differ | Which is correct |
|---|---|---|---|

> "Cannot determine" is a valid and important answer. It escalates rather than guessing.

## Unreachable code

| What | File:line | Superseded, or caller removed by accident? |
|---|---|---|

## Traps for a new maintainer

## Open questions

| Question | Who can answer | Blocking? |
|---|---|---|

## Observations for later

> Worth changing. Not changed now. Raise as tickets; do not fold into an in-flight change.
