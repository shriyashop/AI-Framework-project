"""Runner settings. This process is the only reader of GITHUB_COPILOT_PAT (ADR-003)."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

PAT = os.getenv("GITHUB_COPILOT_PAT", "")
REPO = os.getenv("GITHUB_REPO", "")  # owner/name of the shared POC repo
MODEL = os.getenv("COPILOT_MODEL", "claude-sonnet-4.6")
CUSTOM_AGENT = os.getenv("COPILOT_CUSTOM_AGENT", "brd")
SHARED_TOKEN = os.getenv("RUNNER_SHARED_TOKEN", "")
MODE = os.getenv("RUNNER_MODE", "live")  # live | fake
API_VERSION = "2026-03-10"
GITHUB_API = os.getenv("GITHUB_API_URL", "https://api.github.com")
# The workspace lives on its own orphan branch of the repo (ADR-002). The runner refuses to
# push to, or start tasks against, a branch that could hold the Studio source.
BASE_BRANCH = os.getenv("GITHUB_BASE_BRANCH", "poc-workspace")
PROTECTED_BRANCHES = ("main", "master")
MAX_INPUT_CHARS = int(os.getenv("MAX_REQUIREMENT_CHARS", "8000"))
