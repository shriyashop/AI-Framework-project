# Demo Runbook

**Audience:** leadership, architecture, engineering
**Duration:** 25 minutes plus questions
**What it proves:** governance is real, an inexperienced person can ship safely, and the pipeline is fast

Operator prep is at the end. Read it before the first rehearsal.

---

## The argument the demo makes

Three claims, in this order. Each act earns the right to make the next.

1. **AI without governance produces confident, wrong output that looks right.** Act 1 shows this happening.
2. **The context pack closes that gap** — the same model, the same task, a different result. Act 2.
3. **It works on real code, not just a prepared example.** Act 3.

Do not open by describing the framework. Show the failure first. The framework only means something to a room that has just watched the problem occur.

---

## Act 1 — The failure (4 minutes)

**Setup:** legacy expense-claims app open in VS Code. **Context pack not loaded.** Copilot in agent mode, Claude Sonnet.

Say: *"This is an internal expense system. Nobody who wrote it still works here. We want to modernize it. Here's what happens if we just ask."*

**Type:**

```
Reimplement the claim validation and approval routing from server.js
as a clean, modern TypeScript module. Keep the behaviour the same.
```

Let it run. It will produce something genuinely good-looking — typed, structured, tested, idiomatic. Better-written than the original by every visible measure.

**Then read the output against the answer key** (`legacy/expense-claims/LEGACY-NOTES-DO-NOT-SHIP.md`).

It will have captured the two documented rules — receipts over 75, director approval over 500. It will have dropped or mangled some of the four undocumented ones. The ones most reliably missed are the fiscal-year window (`chkWin()`, defined 650 lines from its only caller under a meaningless name) and the interaction where client-entertainment approval overrides the R&D cost-centre bypass.

**The line to land:**

> *"Every rule it missed is one somebody added because something went wrong. It didn't do a bad job — it did a confident job on an incomplete reading. And nothing about the output tells you which parts to distrust. That's the problem. Not code quality — verification."*

Do not rush this. This is the whole demo.

---

## Act 2 — The governed run (12 minutes)

**Setup:** same repository, context pack now present. Restart Copilot Chat so instructions load.

### 2a. Understand (4 min)

```
/understand legacy/expense-claims/server.js
```

It produces `docs/discovery/expense-claims.md`. Walk through what it finds:

- The **six rules**, each cited to a line, four marked undocumented
- The **four diverged implementations** of the director-approval threshold — no two alike, three of them wrong in different directions, one carrying a stale comment claiming a threshold the code does not use
- The receipt threshold disagreeing between validation and the UI warning
- The **SQL injection** in the search endpoint
- The unreachable export route, shadowed by an earlier one that emits a different format

> *"It read the code instead of pattern-matching on it. The rules it found are the same ones the first attempt dropped — and here they are, cited, with the ones nobody documented called out as the risk."*

**The strongest single moment in the demo** is the diverged threshold. Four implementations of one business rule, silently disagreeing. Nobody in the room will have known. Pause there.

### 2b. Plan and Gate 1 (4 min)

```
/plan Extract claim validation and approval routing into a single tested module,
preserving all current behaviour.
```

It produces the plan — and **stops at Gate 1**. It does not write code.

Point at the stop. That is the demo's central governance claim, and it is happening on screen rather than being asserted on a slide.

Show in the plan: the reuse check, the rejected alternative, the blast radius, and — the important one — **the ambiguity it refuses to resolve**: which of the four diverged threshold implementations is correct. It escalates rather than guessing.

> *"It can't know which one is right. Neither can I. That's a question for whoever owns this process — and the pipeline surfaced it instead of quietly picking one. Picking one is exactly what the first run did."*

Then read the three explain-back questions aloud.

> *"Nobody approves this gate unless they can answer these with the assistant closed. That's the control that stops a junior shipping something they don't understand. It costs about ninety seconds."*

Approve the plan out loud, as a named person.

### 2c. Characterise, implement, review (4 min)

```
/test Write characterisation tests for the current behaviour of claim validation
and approval routing.
```

Tests are written against the **unchanged** code and pass — including tests for behaviour that looks wrong, marked as deliberately preserved.

> *"Before we change anything, we've proved what it currently does. Including the parts that look like bugs — deciding whether to fix those is a separate conversation with the process owner, not a side effect of a refactor."*

```
/implement docs/plans/<the approved plan>
```

Then:

```
/review
```

The review checks the new implementation **rule by rule against the discovery document**, and labels itself as a first pass requiring an independent human reviewer.

> *"It won't approve its own work. It can't — the gate needs a named human. That's enforced, not encouraged."*

---

## Act 3 — Real code (6 minutes)

The credibility act. Point the same capability at the Amplify repository.

```
/understand the Integration Hub implementations across this repository
```

It finds the two parallel Integration Hub implementations — the Django-backed one and the Practice HUB one — **different data, not synchronised, no canonical answer.**

> *"That's not a prepared example. That's our codebase, this morning. Two implementations of the same capability, drifted apart, and the only reason we know is that somebody wrote it down in a context file. This is precisely what the platform is built to catch — and it just caught it on the first run against real code."*

If time allows, also run it against the `makemigrations`-on-startup behaviour and let it identify the version-control implication.

---

## Close (3 minutes)

Three things, no slides:

1. **What changed between Act 1 and Act 2 was not the model.** Same model, same task. The difference was context and gates — both of which are files in the repository, reviewed like code.
2. **The gates are cheap.** Roughly ninety seconds of explain-back and one plan approval, against a defect that would have reached production.
3. **This is what lets inexperienced people work safely.** Not because the AI makes them senior, but because the pipeline makes their work verifiable. Full throughput inside a boundary that widens as judgment is demonstrated.

**Anticipated challenge — "isn't this just slowing us down?"**

> *"The first run took ninety seconds and produced a defect nobody would have caught in review, because it looked better than the original. The governed run took eleven minutes and produced something we can ship. The comparison isn't ninety seconds against eleven minutes — it's eleven minutes against a production incident three months from now, in a system nobody understands."*

---

## Operator preparation

### Before the first rehearsal

- [ ] Read `legacy/expense-claims/LEGACY-NOTES-DO-NOT-SHIP.md` end to end. Know all six rules cold.
- [ ] Confirm `node server.js` starts and serves. Node 22+ required.
- [ ] Run the whole demo twice. Act 1's output varies between runs.

### Critical

**Rehearse Act 1 at least three times and note what it misses each time.** It is generative — it will not miss the same rules every run. Occasionally it finds five of six. Your Act 1 script must adapt to what actually appeared on screen. Never claim it missed something it caught; the room will be reading the same screen you are.

If a run catches all six — rare, but possible — the honest move is the strongest one:

> *"Good run. It got them all this time. Notice that I couldn't have told you that in advance, and neither could you — you'd have had to already know the answer. That's the actual problem. The governed version is repeatable."*

That reframe is better than the failure it replaces. Prepare it.

### Setup

- [ ] Context pack **removed** for Act 1 — verify by checking Copilot's referenced instructions, not by trusting the file move
- [ ] Restart Copilot Chat between acts so instruction changes take effect
- [ ] Font size up; the room reads the diff
- [ ] The answer key is **never on screen**
- [ ] Have `docs/discovery/expense-claims.md` from a good rehearsal saved as a fallback

### If something goes wrong

**Agent hangs or errors** — cut to the saved rehearsal output. *"I'll use the run from this morning so we're not watching a progress bar."* Nobody minds.

**It refuses a step** — that is the framework working. Say so and move on. Do not fight it on screen.

**Act 3 finds nothing interesting** — fall back to naming the duplication directly and showing the context file entry. The finding is real either way; only the theatre is lost.

**Someone asks to see the answer key** — show it, after the demo. It is a demo artifact, not a trick, and treating it as one costs you the room's trust.
