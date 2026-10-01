# ADR-003: The Agent Runner, not the Studio API, holds the provider credential

**Status:** accepted 2026-10-01 · deviates from handover ("Studio API is the only process that holds the API key")

**Decision.** `GITHUB_COPILOT_PAT` is read only by `runner/`. The Studio API holds the database and no provider credential. The API and runner share `RUNNER_SHARED_TOKEN`; the runner listens on 127.0.0.1 and refuses all requests if that token is unset.

**Why.** With Copilot the runner is the process that talks to the provider, and it executes nothing locally. Proxying every call through the API would blur the boundary the handover wants.
