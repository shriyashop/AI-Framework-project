"""The shared POC repo, constructed by us and never received.

Finding F1: a `.claude/settings.json`, `.mcp.json` or similar sitting in a
workspace can get code executed with no trust prompt. So:

* the repo is built by copying template files one at a time;
* every file we write is recorded in a manifest (path -> sha256);
* before each run `preflight` fails closed if anything else is present,
  except Studio-committed BRD output under projects/<slug>/docs/**;
* uploaded documents are never written here.
"""
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

from . import config

REPO_NAME = "poc-repo"
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")
GIT_IDENT = ["-c", "user.name=Build Studio", "-c", "user.email=studio@localhost"]
FORBIDDEN_NAMES = {".mcp.json", "mcp.json", "settings.json", "settings.local.json"}
FORBIDDEN_PREFIXES = (".github/workflows/copilot-setup-steps", ".github/copilot/")


class PreflightFailed(Exception):
    """Workspace contains something we did not write. Run refused."""


def repo_dir() -> Path:
    return config.WORKSPACES_DIR / REPO_NAME


def _manifest_path() -> Path:
    return config.WORKSPACES_DIR / f"{REPO_NAME}.manifest.json"  # outside the repo


def _load_manifest() -> dict[str, str]:
    p = _manifest_path()
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def _save_manifest(m: dict[str, str]) -> None:
    _manifest_path().write_text(json.dumps(m, indent=1, sort_keys=True), encoding="utf-8")


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git(*args: str, cwd: Path | None = None) -> str:
    out = subprocess.run(["git", *GIT_IDENT, *args], cwd=cwd or repo_dir(), capture_output=True, text=True)
    if out.returncode:
        raise RuntimeError(f"git {' '.join(args)} failed: {out.stderr.strip()}")
    return out.stdout.strip()


def head_sha() -> str:
    return git("rev-parse", "HEAD")


def _copy_tree(src_root: Path, dest_root: Path, manifest: dict[str, str], prefix: str = "") -> None:
    """Copy file by file; never unpack an archive."""
    for src in sorted(p for p in src_root.rglob("*") if p.is_file()):
        rel = src.relative_to(src_root).as_posix()
        dest = dest_root / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        manifest[f"{prefix}{rel}"] = _sha256(dest)


def ensure_repo() -> Path:
    """Create the local repo from templates/repo on first use."""
    d = repo_dir()
    if (d / ".git").exists():
        return d
    d.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, str] = {}
    _copy_tree(config.TEMPLATES_DIR / "repo", d, manifest)
    git("init", "-b", config.WORKSPACE_BRANCH, cwd=d)
    git("add", "-A", cwd=d)
    git("commit", "-m", "Seed shared POC repo from template", cwd=d)
    _save_manifest(manifest)
    return d


def create_project_folder(slug: str) -> Path:
    if not SLUG_RE.match(slug):
        raise ValueError("slug must be lowercase letters, digits and dashes (max 40)")
    d = ensure_repo()
    target = d / "projects" / slug
    if target.exists():
        raise FileExistsError(f"project folder {slug} already exists")
    manifest = _load_manifest()
    _copy_tree(config.TEMPLATES_DIR / "project", target, manifest, prefix=f"projects/{slug}/")
    _save_manifest(manifest)
    git("add", "-A", cwd=d)
    git("commit", "-m", f"Create project {slug} from template", cwd=d)
    return target


def _forbidden(rel: str) -> bool:
    parts = rel.split("/")
    return (
        ".claude" in parts
        or parts[-1] in FORBIDDEN_NAMES
        or rel.startswith(FORBIDDEN_PREFIXES)
        or rel.startswith(".vscode/")
    )


def _is_output(rel: str) -> bool:
    return bool(re.match(r"^projects/[a-z0-9-]+/docs/brd/BRD-[\w.-]+\.md$", rel))


def preflight() -> str:
    """Fail closed unless the workspace holds only what we wrote. Returns HEAD sha."""
    d = ensure_repo()
    manifest = _load_manifest()
    tracked = git("ls-files", "-co", "--exclude-standard", cwd=d).splitlines()
    problems = []
    for rel in tracked:
        if _forbidden(rel):
            problems.append(f"forbidden path: {rel}")
        elif rel in manifest:
            if _sha256(d / rel) != manifest[rel]:
                problems.append(f"template file modified: {rel}")
        elif not _is_output(rel):
            problems.append(f"unexpected file: {rel}")
    for rel in manifest:
        if rel not in tracked:
            problems.append(f"template file missing: {rel}")
    if git("status", "--porcelain", cwd=d):
        problems.append("working tree has uncommitted changes")
    if problems:
        raise PreflightFailed("; ".join(problems[:10]))
    return head_sha()


def commit_brd_files(slug: str, files: dict[str, str], message: str) -> str:
    """Write validated BRD output into the clone and commit it. Returns new HEAD."""
    d = ensure_repo()
    for rel, text in files.items():
        if not _is_output(rel) or not rel.startswith(f"projects/{slug}/"):
            raise PreflightFailed(f"refusing to write non-output path: {rel}")
        (d / rel).write_text(text, encoding="utf-8", newline="\n")
    git("add", "--", *files, cwd=d)
    git("commit", "-m", message, cwd=d)
    return head_sha()
