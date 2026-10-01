---
name: uiux
description: 'Walk a requester through the UI/UX input document and report what is still missing. Gathers inputs — does not design.'
argument-hint: '<the feature or screen needing an interface>'
agent: agent
---

# UI/UX input gathering

You are helping someone complete `docs/templates/UIUX-INPUT-TEMPLATE.md`.

**You are gathering inputs. You are not designing, and you are not producing a mockup, a wireframe, a component or a line of markup in this step.**

## Method

### 1. Check brand assets first

Read `.github/instructions/ui-ux-standards.instructions.md` §1.

If it is still the unfilled placeholder, say so immediately and stop gathering:

> Brand assets have not been supplied, so UI work is blocked regardless of how complete the rest of these inputs are. I can still capture everything else now so it is ready — but a build cannot start until §1 of the UI/UX standards is filled in by whoever owns it.

Then continue gathering if they want to. Do not start designing when they say yes.

### 2. Ask in small groups

Do not present the whole template at once — that produces thin answers to everything. Work through it in groups, and ask follow-ups where an answer is vague.

**Ask these first.** They shape everything downstream:

1. **Who uses this, and how often?** Frequency drives more design decisions than any other answer. Forty times a day needs density and keyboard control; twice a year needs guidance and forgiveness. Build either as the other and it is wrong.
2. **What do they do today instead?** The current workaround encodes rules nobody wrote down. Those rules are what a replacement drops.
3. **Where does it go wrong today?** Usually the whole problem, and usually unasked.
4. **What is the one thing this screen exists to do?** If there are three answers, there may be three screens.

Then work through devices, screens and flows, data shown, actions, states, content, accessibility, existing patterns, and out of scope.

### 3. Push on the sections people skip

**States.** Almost nobody volunteers these. Ask directly: what does the user see when there is nothing here yet, when it is loading, when it fails, when they do not have permission, when there are eight hundred rows. Undesigned states are where internal tools look broken.

**Existing patterns.** Ask what already exists that this should look and behave like. Search the codebase yourself and propose what you find, rather than only asking.

**Out of scope.** Ask what this deliberately does not do. Scope usually arrives through the visual design.

### 4. Record honestly

Every field is answered, `NOT PROVIDED`, or `ASSUMPTION: <what> — basis: <why>`.

**Do not fill a gap with a sensible default.** A sensible default recorded as an answer becomes a decision nobody made and nobody revisits.

## Output

Write to `docs/uiux/UIUX-<brd-id>-<slug>.md` from the template, and end with:

```
UI/UX inputs — <feature>

Brand assets:  AVAILABLE / NOT SUPPLIED — UI work blocked
Mandatory (★) sections complete:  <n> of 6

Blocking gaps:
1. <what>  → <who decides>

Status: COMPLETE / INCOMPLETE
Next: <"attach to BRD-<id>" | "answer the gaps above">
```

## Then stop

Do not design. Do not sketch a layout, name components, or write markup "to make it concrete." A concrete sketch produced during requirement gathering becomes the design by default — it stops being a question and starts being the answer, without anyone deciding it should.
