# ADR-004: Console compiled in a throwaway Docker Node step

**Status:** accepted 2026-10-01

**Decision.** `scripts/build_console.ps1` compiles `console/` with `node:22` in a container. Node is not installed on the host and does not run at runtime; FastAPI serves `console/dist`. The Figma-only Vite plugins and `.figma/` were dropped. The original `pnpm-lock.yaml` was discarded because it no longer matched `package.json`; the first Docker build regenerated it, and that lockfile is committed.
