# ADR-006: Studio commits the BRD; the Copilot PR is closed, not merged

**Status:** accepted 2026-10-01

**Decision.** After the diff guard and parser pass, Studio writes the validated files into its own clone, commits them with `Copilot-Task`, `Copilot-PR` and `Copilot-Head` trailers, pushes, and closes the PR. Studio stays the only writer of the history, and nothing the agent wrote is merged unchecked. The PR is a transport, not the record.
