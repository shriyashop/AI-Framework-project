---
name: 'Lane B — Build'
description: 'Rules for new applications and components. Standards enforceable from the first commit.'
applyTo: '**'
---

# Lane B — building something new

> **Precedence.** This file's `applyTo` is `**`, so it loads everywhere — including on files that already exist. That is a limitation of glob matching, not a statement that this lane applies. **If the file you are touching already exists and has users, Lane A governs and its stricter defaults win**, including its V3 minimum verification tier. Lane B applies only to components you are creating now, in a new location. If you are unsure which applies, assume Lane A and say so.

No existing behaviour to preserve, bounded consequences, and standards you can enforce from the first commit rather than negotiate with. This is the lane where doing it properly is cheapest.

## The debt you are incurring

**Everything built here becomes a Lane A application** — usually within eighteen months, faster when it was generated quickly by someone who could not fully explain it.

So the test for every decision is not "does this work" but **"can somebody who has never met me change this safely in two years?"**

That means, from the first commit and not as a later documentation exercise:

- **Business rules are named, not embedded.** Every threshold is a named constant with a comment saying why it has that value and who decided. Today's obvious rule is next year's unexplained magic number.
- **Decisions are recorded.** When you choose between real alternatives, write down what you rejected and why. Two paragraphs in `docs/decisions/`. The reasoning is the part that evaporates.
- **Rules live in one place.** If a rule is enforced in two places, it will diverge. It always diverges. Extract it now.
- **Documentation is generated from or checked against the code**, never written separately to drift.
- **Tests express the requirement**, so they read as a specification of intended behaviour rather than a description of what the code happens to do.
- **Dependencies are justified.** Every one added is one a future maintainer must understand, update and secure.

## Rules

- **Reuse before build, always.** Search the repository and the asset catalogue first. State what you found. Building something that already exists is the most common waste in this lane, and it is invisible until someone has to maintain both.
- **Configuration before customisation.** If a parameter or an existing component satisfies the requirement, propose that first.
- **Smallest thing that satisfies the requirement.** No speculative abstraction, no layer for a future requirement nobody has stated, no framework for one use. Volume of code is a cost, not an achievement.
- **House patterns over your preferences.** Match what this codebase already does.
- **No new top-level dependency without saying why** the standard library or an existing dependency will not do.

## Why this lane suits people new to software

Bounded blast radius, no tribal knowledge required, and standards enforceable from the outset. Being wrong here is cheap and correctable, which makes it the right place to build the judgment that Lane A requires.

That is the honest version of "work like someone experienced": **full throughput inside a boundary that widens as judgment is demonstrated** — not the same autonomy on day one.

So in this lane, when working with someone early in their career, the assistant should:

- Explain the reasoning, not just produce the result
- Name the pattern being used and point to where else it appears here
- Say what was rejected and why
- Raise the thing they did not ask about but should know
- Never let a gate advance on work that cannot be explained

## Default verification tier

**V2** for standard new components.
**V3** for anything crossing a boundary others will depend on — a public interface, a shared library, a contract.
**V4** for auth, schema, financial logic, or anything touching production infrastructure. New does not mean low-consequence: a new payment path is V4 on its first commit.
