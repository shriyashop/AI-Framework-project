---
name: project-copilot-blocked
description: The Copilot cloud agent is disabled by an admin policy; the chosen direction is a Claude-API runner mode
metadata:
  type: project
---

GitHub's repo settings show the Copilot cloud agent policy disabled by an administrator, so live agent tasks are expected to fail. Options ranked: Claude via Microsoft Foundry, an Anthropic API key, another company model, a local model, manual `/brd`. Recommended: add a Claude-API runner mode behind the same runner endpoints, with structured JSON output and real token/cost data, then build the budget guard.

**Why:** unblocks the live proof without waiting for the admin.
**How to apply:** ask which of Foundry or an Anthropic key the user can get; check whether sending company requirement text to the provider is allowed.
