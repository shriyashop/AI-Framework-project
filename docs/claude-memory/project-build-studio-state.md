---
name: project-build-studio-state
description: State of Build Studio increment 1 as of 2026-10-01 and where to find the detail
metadata:
  type: project
---

Increment 1 (stage 1, `/brd`) is built in `build-studio/` with 59 passing tests and Docker Compose on port 8020. It has only run against the fake runner; DoD items 1 to 3 are not proven live. The budget guard was skipped at the user's request. Detail: `docs/HANDOVER.md`, ADRs in `build-studio/docs/decisions/`.

**Why:** this is the resume point for a new session.
**How to apply:** read `docs/HANDOVER.md` before changing anything; keep Studio's score recomputation and the diff guard in any new runner mode.
