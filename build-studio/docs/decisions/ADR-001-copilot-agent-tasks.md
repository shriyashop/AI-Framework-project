# ADR-001: Copilot agent tasks run stage 1; no structured output, no token data

**Status:** accepted 2026-10-01 · **Lane:** B

**Decision.** `/brd` runs as a GitHub Copilot agent task (`POST /agents/repos/{owner}/{repo}/tasks`, public preview, custom agent `brd`). The user chose this over an Anthropic API key.

**Consequences.**
- The score arrives as a markdown file in a PR, not typed JSON. A strict parser fails loudly on any unrecognised shape and Studio recomputes the score (ADR-005).
- The API returns no token counts or cost. `agent_run.input_tokens`, `output_tokens` and `cost_cents` are NULL, meaning "not reported by provider", never zero. Handover DoD #4 is met for workspace SHA, model and provider refs only.
- **Budget guard deferred by the user (2026-10-01).** The $100 allowance has no in-product protection yet. Revisit before any unattended use.
- Preview API on a personal PAT. Needs revisiting before production.
- Azure Repos is not supported by the Copilot cloud agent; the code must live in GitHub.
