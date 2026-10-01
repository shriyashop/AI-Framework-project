# AI Framework project

The AI engineering framework (governed `/brd → /plan → /implement …` pipeline) and **Build Studio**, the application that runs it.

| Folder | What it is |
|---|---|
| [`build-studio/`](build-studio/) | The application: Studio API, Agent Runner, React console, Docker setup, tests and ADRs. Increment 1 covers stage 1 (`/brd`). Start with its README. |
| [`inputs/`](inputs/) | The specs it was built from: the build plan, the increment 1 handover and the Figma Make console. |
| [`context-pack/`](context-pack/) | The framework's context pack (`.github/`, `.claude/`, `AGENTS.md`, discovery and plan docs, memo, runbook), as it stood in the Amplify repo. Its `README.md` is Amplify's own README as edited there. |
| [`factory-demo-pack/`](factory-demo-pack/) | The original demo pack zips and the extracted demo. It contains a deliberately vulnerable legacy app and an operator answer key; keep this repo private. |

## Notes

- `build-studio/.env` holds secrets (runner token, and later the GitHub PAT). It is gitignored. Copy `build-studio/.env.example` to create it.
- The Copilot workspace repo that Build Studio drives is a **separate** repo, set with `GITHUB_REPO`. It is not this one.
