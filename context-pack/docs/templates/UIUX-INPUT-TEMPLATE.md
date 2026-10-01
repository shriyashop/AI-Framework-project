# UI/UX Input — <feature or application>

**Linked BRD:** `BRD-<id>`
**Completed by:** `<name>` · **Date:** `<date>`
**Status:** ☐ Incomplete — UI work blocked ☐ Complete

> This is an **input** document, not a design. It captures what somebody must decide before an interface is built. Every unanswered field here becomes an invented decision later, and invented interface decisions are expensive, highly visible, and the kind of wrong that people remember.
>
> Fields are answered, `NOT PROVIDED`, or `ASSUMPTION: <what> — basis: <why>`. Nothing is guessed silently.

---

## 1. Brand and design system

☐ **Brand assets confirmed available** — see `.github/instructions/ui-ux-standards.instructions.md`

| | |
|---|---|
| Design system / token source | |
| Component library (if any) | |
| Logo usage rules | |
| Anything explicitly forbidden | |

> **If brand assets are not available, UI work does not start.** Building against invented visual decisions and retrofitting a brand afterwards costs more than waiting, and the retrofit is never complete.

---

## 2. Who uses this

| | |
|---|---|
| Primary user | |
| Their technical confidence | ☐ Low ☐ Medium ☐ High |
| How often they use it | ☐ Constantly ☐ Daily ☐ Occasionally ☐ Rarely |
| Context of use | *At a desk? On a factory floor? On a phone between meetings? In a hurry? Under pressure?* |
| What they are doing immediately before and after | |

**Frequency drives the design more than anything else here.** A screen someone uses forty times a day should be dense, keyboard-driven and sparing with confirmations. A screen someone uses twice a year should be guided, explicit and forgiving. Building either one as the other is the most common interface mistake, and both directions are wrong.

---

## 3. Devices and environment

| | |
|---|---|
| Primary device | ☐ Desktop ☐ Laptop ☐ Tablet ☐ Phone |
| Must also work on | |
| Smallest supported width | |
| Browsers to support | |
| Accessibility target | ☐ WCAG 2.2 AA ☐ Other: |
| Network conditions | |
| Constraints | *Gloves? Bright light? Shared screen? Offline?* |

---

## 4. Screens and flows

| # | Screen | Purpose | Reached from | Leads to |
|---|---|---|---|---|
| S1 | | | | |

### 4.1 The main flow
*Step by step, the path a user takes to do the one thing this exists for. Number the steps.*

### 4.2 Where people go wrong
*The step where users hesitate, misread, or do the wrong thing today. If this is unknown, say so — it is worth finding out before designing, and it is usually the whole problem.*

---

## 5. What each screen shows

For each screen, per the BRD's data section:

| Screen | Data shown | Source | Who may see it | Editable? |
|---|---|---|---|---|

### 5.1 What must be visible without scrolling
*Forces a priority decision that is otherwise made accidentally by whoever writes the markup.*

### 5.2 What can be hidden behind an interaction

---

## 6. Actions

| Action | Who can do it | Confirmation needed? | Reversible? | What happens after |
|---|---|---|---|---|

> **Irreversible actions need a confirmation step and must say what will happen, specifically.** "Are you sure?" is not a confirmation — it tells the user nothing they did not already know and trains them to click through.

---

## 7. States

*The most commonly skipped section, and the source of most of the ugly parts of most internal tools.*

| State | What the user sees | What they can do |
|---|---|---|
| **Empty** — nothing here yet | | |
| **Loading** | | |
| **Partial** — some data, some still arriving | | |
| **Error — retryable** | | |
| **Error — not retryable** | | |
| **Permission denied** | | |
| **Success** | | |
| **Too much data** — hundreds of rows | | |

**Empty state matters most.** It is the first thing every new user sees, and left undesigned it is a blank rectangle that makes a working system look broken.

---

## 8. Content

| | |
|---|---|
| Tone | ☐ Formal ☐ Neutral ☐ Conversational |
| Terminology that must be used exactly | |
| Terminology that must be avoided | |
| Languages | |
| Date, number and currency formats | |
| Who writes error messages | |

*Error messages are a design decision. "An error occurred" means somebody skipped this row.*

---

## 9. Accessibility

| | |
|---|---|
| Keyboard-only operation required | ☐ Yes ☐ No |
| Screen reader support | ☐ Required ☐ Best effort |
| Minimum contrast | |
| Colour alone must never carry meaning | ☐ Confirmed |
| Text resizing to 200% | ☐ Required |
| Known user needs | |

*Treat AA as the floor unless there is a stated reason otherwise. Retrofitting accessibility costs several times what building it in does, and internal tools are exactly where it gets skipped.*

---

## 10. Existing patterns to follow

| Pattern | Where it already exists | Follow exactly? |
|---|---|---|

> **Reuse before build applies to interface as much as to code.** A new date picker, a second table style or a third button variant is duplication with a visual signature — it is obvious to users, and it is the thing that makes an internal estate feel unmaintained.

---

## 11. Explicitly out of scope

*What this interface deliberately does not do. Prevents scope arriving through the visual design, which is where it usually arrives.*

---

## 12. Open questions

| # | Question | Who decides | Blocking? |
|---|---|---|---|

---

## 13. Completeness

| Section | Complete? | Note |
|---|---|---|
| 1 Brand assets ★ | | |
| 2 Users ★ | | |
| 3 Devices and accessibility target ★ | | |
| 4 Screens and flows ★ | | |
| 5 Data shown | | |
| 6 Actions | | |
| 7 States ★ | | |
| 8 Content | | |
| 9 Accessibility | | |
| 10 Existing patterns | | |
| 11 Out of scope ★ | | |

**★ sections are mandatory. Any one incomplete means UI work does not begin.**

```
UI/UX inputs: <COMPLETE | INCOMPLETE>
Blocking gaps: <list>
```
