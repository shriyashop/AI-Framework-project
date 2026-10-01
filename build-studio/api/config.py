"""Named constants and environment-driven settings for the Studio API.

The Studio API holds no provider credential (see ADR-003): the GitHub PAT is
read only by the runner process.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

# --- Scoring contract (brd.prompt.md) ---------------------------------------
NUM_FIELDS = 18
MAX_RAW = NUM_FIELDS * 2  # 36
CRITICAL_FIELD_NUMBERS = range(1, 9)  # fields 1-8 are critical
CAP_CRITICAL_ZERO = 40
CAP_CRITICAL_ONE = 70
THRESHOLD_NOT_A_REQUIREMENT = 50  # below this: questions only, no BRD
THRESHOLD_DRAFT_BLOCKED = 75  # below this: /plan and G0 refuse
THRESHOLD_READY = 90

# --- Runtime settings --------------------------------------------------------
API_PORT = int(os.getenv("API_PORT", "8020"))
RUNNER_URL = os.getenv("RUNNER_URL", "http://127.0.0.1:8021")
RUNNER_SHARED_TOKEN = os.getenv("RUNNER_SHARED_TOKEN", "")
DB_PATH = Path(os.getenv("DB_PATH", str(ROOT / "build_studio.db")))
WORKSPACES_DIR = Path(os.getenv("WORKSPACES_DIR", str(ROOT / "workspaces")))
CONSOLE_DIST = ROOT / "console" / "dist"
TEMPLATES_DIR = ROOT / "templates"
POLL_INTERVAL_SECONDS = float(os.getenv("POLL_INTERVAL_SECONDS", "5"))
RUN_TIMEOUT_SECONDS = int(os.getenv("RUN_TIMEOUT_SECONDS", "1200"))
MAX_REQUIREMENT_CHARS = int(os.getenv("MAX_REQUIREMENT_CHARS", "8000"))
