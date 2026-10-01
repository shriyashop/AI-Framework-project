---
name: change-record
description: 'Produce the immutable audit artifact linking requirement to approval for an AI-assisted change.'
argument-hint: '<the change to record>'
agent: agent
---

# Change record

The audit artifact. It must let someone reconstruct, months later and without you, what was asked, what was produced, what was checked and who accepted it.

Written incrementally as the work moves through states. Append; never rewrite history. If something turns out to be wrong, add a correcting entry — do not edit the original.

## Format

Write to `docs/change-records/CR-<id>.md` and link it from the PR description.

```markdown
# CR-<id>

## Identity
| Field | Value |
|---|---|
| Requirement / story | |
| Lane | A (modernize) / B (build) |
| Verification tier | V1 / V2 / V3 / V4 |
| Author (human, accountable) | |
| AI assistance material to this change | yes / no |
| Model and version | |
| Prompt files used | |
| Repository / branch | |

## Requirement as understood
[The restatement from the plan, plus any ambiguities raised and how they were answered — by whom.]

## Reuse check
| Searched | Found | Reused | Why not |

## Plan
Link. Approved by: <name>, <date>.
Alternative considered and rejected: …

## Implementation
Commits: …
Deviations from the approved plan: [each one, with why. "None" if none.]
Assumptions made: [each, with location in code]

## Tests
| Criterion | Test | Result |
Acceptance criteria authored by: <human name>, <date> — before tests: yes/no
Lane A: characterisation suite passing before change: yes/no · after change: yes/no

## Deterministic gates
| Gate | Result |
| SAST | |
| Dependency / licence scan | |
| Quality gate | |

## Review
First-pass (AI): link. Blocking findings: <n>, resolved: <n>.
Human reviewer: <name>, <date>.

## Explain-back
Run before Gate <n> by: <name>. Result: PASS / PARTIAL / FAIL.
Gaps identified: …

## Maintainability delta
| Dimension | Before | After | Δ |
| Complexity | | | |
| Duplication | | | |
| Coupling | | | |
| Net lines (added − deleted) | | | |
| Test coverage of changed code | | | |

Recommendations rejected, with justification:
[Required whenever a maintainability recommendation was declined. One line each. This is the audit trail of why complexity was accepted.]

## Approvals
| Gate | Approver | Date | Notes |
| 1 — Plan | | | |
| 2 — Pull request | | | |
| 3 — Production | | | |

## Open items carried forward
[Noticed but deliberately not addressed, with a ticket reference where one exists.]
```

## Rules

- **Never record an approval that did not happen.** An empty approval row is correct and honest; a filled one that did not occur is fabricating an audit trail, which is the most serious failure possible in this pipeline.
- **Never record a test result you did not observe.**
- **"AI assistance material: yes"** carries no stigma. It exists for defect analysis and audit, never as a judgement of the author. Record it accurately — the data is worthless if people learn to under-report it.
- Assumptions and rejected recommendations are the most valuable fields here. They are what a future investigation actually reads.
