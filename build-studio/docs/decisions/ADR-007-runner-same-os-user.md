# ADR-007: Runner is a separate process but not a separate OS user (dev box)

**Status:** accepted 2026-10-01 · deviates from handover ("own OS user")

**Decision.** The runner is a separate process on its own port, but runs as the developer's Windows user. Under Copilot it executes no agent code locally, so the OS-user boundary protects little here. Give it its own user when it moves to a server or when a local-execution runner is introduced.
