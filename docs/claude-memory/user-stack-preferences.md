---
name: user-stack-preferences
description: The user prefers Python/FastAPI over Node and wants ports in the 8000 series
metadata:
  type: user
---

Prefers the stack they already have: Python and FastAPI, matching the Amplify backend style. Said to use FastAPI "unless node is absolutely necessary". Node is used only as a throwaway Docker build stage for the React console. Asked for ports in the 8000 series (API and console 8020, runner 8021).

**Why:** consistency with the existing stack; no Node on the host.
**How to apply:** default to Python 3.11 and FastAPI; do not introduce a Node runtime or a port outside 8000 to 8099 without asking.
