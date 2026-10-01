"""Increment 0 / Spike A: does a Copilot agent task honour our context pack?

Run once, by hand, against the shared POC repo (needs GITHUB_COPILOT_PAT, GITHUB_REPO):

    .venv\\Scripts\\python scripts\\spike_copilot_task.py

It seeds and pushes templates/repo, starts one /brd task on a deliberately vague
one-liner and prints what came back. It answers four questions:
  1. Did the custom agent load and write only the result file?
  2. Did the vague input score below 50 with questions only (no BRD file)?
  3. Did the result parse with the strict parser?
  4. How long did it take? (Check GitHub billing by hand for the credit cost.)
If the answers are not all yes, stop and report; do not adapt the pipeline around it.
"""
import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api import brd_parser, workspace  # noqa: E402
from runner import config, github, prompt  # noqa: E402

VAGUE = "Build an app for managing our contacts."
SLUG, BRD_ID = "spike", "0"
POLL_SECONDS, TIMEOUT_SECONDS = 15, 1500


async def main() -> int:
    if not config.PAT or not config.REPO:
        print("Set GITHUB_COPILOT_PAT and GITHUB_REPO first.")
        return 2
    if not (workspace.repo_dir() / "projects" / SLUG).exists():
        workspace.create_project_folder(SLUG)
    sha = workspace.preflight()
    print(f"workspace {sha[:8]} pushed -> {github.push(workspace.repo_dir())[:8]}; remote {(await github.remote_sha() or '')[:8]}")

    task = await github.start_task(prompt.build_prompt(SLUG, BRD_ID, VAGUE, config.MAX_INPUT_CHARS))
    print(f"task {task['id']} {task.get('html_url')} model={config.MODEL}")
    started = time.time()
    while time.time() - started < TIMEOUT_SECONDS:
        t = await github.get_task(task["id"])
        print(f"  {int(time.time() - started):>4}s state={t['state']}")
        if t["state"] in ("completed", "failed", "timed_out", "cancelled", "idle", "waiting_for_user"):
            break
        await asyncio.sleep(POLL_SECONDS)
    print(f"elapsed {int(time.time() - started)}s, final state {t['state']}")
    pulls = [a["data"]["id"] for a in t.get("artifacts", []) if a.get("type") == "pull"]
    if not pulls:
        print("Q1 FAIL: no pull request produced")
        return 1
    pr = await github.pr_details(pulls[0])
    print("PR", pr["pr_url"], "files:", pr["files"])
    result_p, brd_p = prompt.result_path(SLUG, BRD_ID), prompt.brd_path(SLUG, BRD_ID)
    print("Q1 only allowed paths touched:", set(pr["files"]) <= {result_p, brd_p})
    print("Q2 no BRD file for vague input:", brd_p not in pr["files"])
    text = await github.file_at(result_p, pr["head_sha"])
    try:
        parsed = brd_parser.parse_result(text or "")
        print(f"Q3 parsed OK: confidence {parsed.computed.final}, status {parsed.computed.status}, {len(parsed.gaps)} questions")
    except (brd_parser.ParseFailed, brd_parser.ScoreMismatch) as e:
        print("Q3 FAIL:", type(e).__name__, e)
        print((text or "")[:2000])
        return 1
    print("Check the repo's PR/Actions page and GitHub billing for the credit cost of this session.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
