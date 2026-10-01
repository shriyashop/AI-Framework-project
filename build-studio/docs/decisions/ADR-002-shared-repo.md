# ADR-002: One shared POC repo, a folder per project

**Status:** accepted 2026-10-01 · deviates from build plan §2.3 ("one git repo per project")

**Decision.** One private GitHub repo, `projects/<slug>/` per project. Chosen by the user for setup simplicity.

**Consequences.** Copilot can read other projects' folders in the same repo. Acceptable for a POC with internal requirements; revisit before any confidential requirement is entered. The agent file forbids opening other folders, but that is an instruction, not a control. The PR diff guard (only two allowed paths) is the control.
