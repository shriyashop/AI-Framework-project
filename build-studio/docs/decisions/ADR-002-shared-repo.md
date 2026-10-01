# ADR-002: POC workspace on an orphan branch of the code repo, one folder per project

**Status:** accepted 2026-10-01, revised 2026-10-01 · deviates from build plan §2.3 ("one git repo per project")

**Decision.** For the POC, Copilot works in the same GitHub repo as the Studio code (`shriyashop/AI-Framework-project`), on an **orphan branch** `poc-workspace` that shares no history with `main` and holds only the template and `projects/<slug>/` folders. Generated apps are built in those subfolders. After the POC we move to a separate repo per the build plan.

**Why a branch.** Copilot works on the branch it is given, so it sees the workspace, not `build-studio/`. The runner pushes only to that branch; pushing the workspace history to `main` would be rejected, and forcing it would wipe the code.

**Controls.**
- The runner refuses to push to, or start a task against, `main` or `master` (`PROTECTED_BRANCHES`).
- The PR diff guard still allows only the two BRD output paths.

**Residual risk.** A fine-grained PAT cannot be limited to one branch, so the token has Contents write on the code repo. Enable branch protection on `main` (require a pull request) so a bug or leaked token cannot push there.

**Unverified.** Whether Copilot loads the `brd` custom agent from the working branch or only the default branch. Spike A answers it. If it needs the default branch, the agent file must also exist on `main`.

**Other consequence.** Copilot can read other projects' folders on the same branch. The agent file forbids it, but the diff guard is the control.
