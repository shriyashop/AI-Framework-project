---
name: plan
description: 'Produce an implementation plan for human approval. Ends at Gate 1 — no code is written.'
argument-hint: '<the requirement or story>'
agent: agent
---

# Plan

You are producing the artifact a human approves at **Gate 1**. No code is written in this step, including examples and sketches.

## Before you plan: check the requirement

List every ambiguity in what you were asked for. Do not resolve them by picking the likeliest reading.

For each: what is unclear, what the plausible readings are, and which one you would need confirmed. If the requirement is clear, say so explicitly rather than staying silent.

**A requirement that arrives fluent and complete is the one to distrust most.** Fluency is not specification.

## Then: search before you generate

This is mandatory and its result goes in the plan.

1. Does something in this repository already do this? Search properly — by behaviour, not just by name.
2. Is there a catalogued reusable asset that covers it?
3. Can configuration satisfy this instead of code?
4. Is there an existing pattern here this should follow?

State what you found. If you are not reusing something you found, say why in one sentence. **"I found nothing" is only acceptable if you say where you looked.**

## Then: the plan

```markdown
# Plan — <requirement>

## Requirement
[Restated in your own words. If your restatement differs from what was asked, that difference is a finding — flag it.]

## Ambiguities
[From above. If none: "None — requirement is unambiguous because …"]

## Lane
A (modernize) or B (build), and why.

## Verification tier
V1 / V2 / V3 / V4, and the reasoning. If V4, note that a human writes the final artifact.

## Reuse check
| Searched | Found | Reusing? | Why not |

## Approach
[Two or three paragraphs. The shape of the change and why this shape.]

## Alternative considered
[One real alternative and why you rejected it. If you cannot name one, you have not thought about this enough — go back.]

## Files to touch
| File | Change | Risk |

## Interfaces
[Anything added, changed or removed at a boundary. Breaking changes called out explicitly.]

## Behaviour preserved (Lane A only)
[Which existing behaviours must survive, and the characterisation tests that will prove it. Reference the discovery document.]

## Tests
[What will be written, and what each one would catch. Not "unit tests will be added".]

## Blast radius
[What breaks if this is wrong. Who notices. How quickly. How it is reversed.]

## Out of scope
[What you are deliberately not doing, including things you noticed and are leaving alone.]

## Open questions for the approver
[What you need answered before implementation.]
```

## Rules

- **No code.** Not even illustrative snippets. Code in a plan invites approval of the code rather than the approach.
- **Name a real alternative.** A plan with no rejected option is a plan that was not designed.
- **Blast radius is not optional.** If you cannot say what breaks, you do not understand the change well enough to plan it.
- **Lane A plans must reference a discovery document.** If none exists, run `/understand` first and say so instead of planning blind.

## Then stop

End with:

> **GATE 1 — awaiting human approval.**
> I will not begin implementation until this plan is approved. If you approve, tell me which parts you want changed first, or confirm the plan as written.
>
> Before approving, you should be able to answer:
> 1. [specific question about this change]
> 2. [specific question about this change]
> 3. [specific question about this change]

Do not begin implementing. Do not offer to "start on the easy parts". Wait.
