---
name: 'Lane A — Modernize'
description: 'Rules for changing existing and legacy applications. Applies to code with users and unknown blast radius.'
applyTo: 'backend/**,frontend/**,backlog-frontend/**,practicehub-backend/**,practicehub-frontend/**,nginx/**,docker-compose*.yml,entrypoint.sh,legacy/**,**/legacy/**'
---

# Lane A — changing what already exists

This code has users. Something depends on every behaviour here, including the behaviours that look like mistakes.

> **In this repository, Lane A is the default.** Every directory listed in `applyTo` above is existing, running code with users. Lane B applies only when you are creating a genuinely new component in a new location. If both this file and `lane-b-build.instructions.md` are loaded for a file that already exists, **this file wins** — including its stricter default verification tier.

## The governing assumption

**Assume every oddity is load-bearing until proven otherwise.**

Legacy code accumulates rules the way sediment accumulates: each one was added because something went wrong, and the reason left with the person who added it. A magic number is a decision. An early return is a decision. A condition on an obscure flag is almost always somebody's production incident, encoded.

The developer who "cleans up" an unexplained conditional is the most common cause of modernization failure.

## Order of work — do not reorder

1. **Understand.** Run `/understand`. Produce the discovery document. Do not change anything.
2. **Characterise.** Write tests capturing current behaviour. Run them against unchanged code and confirm they pass.
3. **Plan.** Run `/plan`, referencing the discovery document explicitly.
4. **Gate 1.** Human approves. Stop here.
5. **Change.** One invariant at a time, tests green between each.
6. **Verify.** Characterisation tests still pass. Every rule in the discovery document still enforced.

Skipping step 1 or 2 is the failure mode this lane exists to prevent. If asked to skip them, say why they matter and what specifically is at risk.

## Specific dangers here

**Diverged duplicates.** The same rule implemented in several places, no longer identically. Any single reading looks consistent and correct. Before changing a rule, search for every implementation of it and compare them character by character. Where they differ, ask which is right — do not assume the one you found first.

**Stale comments.** A comment that disagrees with the code is not a documentation problem, it is a warning that somebody changed one and not the other. Record both. The machine obeys the code.

**Shadowed and dead code.** A route defined twice, a function never reached. Do not delete on sight — first determine whether the dead path is dead because it was superseded or dead because a caller was removed by accident.

**Behaviour that looks like a bug.** Capture it in a characterisation test, mark it, and raise it. Whether to fix it is a human decision taken separately, never a side effect of a refactor.

## Rules

- **Never rewrite a component wholesale.** Small, reversible steps with tests green between each. A large rewrite cannot be reviewed, and an unreviewable change defeats the entire pipeline.
- **Never change behaviour that was not in the approved plan** — even to fix something obviously broken. Raise it, do not take it.
- **Never delete code you do not understand.** "It appears unused" is not the same as unused.
- **Preserve interfaces** unless a break was explicitly approved. Something you cannot see may call this.
- **State what you did not read.** If you changed one file in a 40-file service, say so. Your confidence should be scoped to what you actually opened.

## Default verification tier

**V3 minimum** for any change to existing behaviour. **V4** for schema, auth, financial logic, or anything in the deployment path.

Lane A does not have a V1. There is no such thing as an isolated, reversible change to a system whose dependencies you have not mapped.
