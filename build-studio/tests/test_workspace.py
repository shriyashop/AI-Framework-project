import pytest

from api import config, workspace as ws


@pytest.fixture(autouse=True)
def isolated(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "WORKSPACES_DIR", tmp_path)
    ws.create_project_folder("demo")


def test_clean_workspace_passes_preflight():
    assert len(ws.preflight()) == 40


def test_template_copied_file_by_file_into_git_repo():
    assert (ws.repo_dir() / "projects/demo/CLAUDE.md").exists()
    assert ws.git("log", "--oneline").count("\n") >= 1


@pytest.mark.parametrize("rel", [
    ".mcp.json", ".claude/settings.json", ".claude/hooks/x.sh",
    ".github/workflows/copilot-setup-steps.yml", "projects/demo/docs/.mcp.json",
    "projects/demo/docs/brd/evil.sh", "stray.txt",
])
def test_preflight_rejects_injected_files(rel):
    p = ws.repo_dir() / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text("x")
    with pytest.raises(ws.PreflightFailed):
        ws.preflight()


def test_preflight_rejects_modified_template_file():
    (ws.repo_dir() / ".github/copilot-instructions.md").write_text("weakened")
    with pytest.raises(ws.PreflightFailed, match="modified"):
        ws.preflight()


def test_bad_slug_rejected():
    with pytest.raises(ValueError):
        ws.create_project_folder("../escape")


def test_commit_brd_files_only_allows_output_paths():
    sha = ws.commit_brd_files("demo", {"projects/demo/docs/brd/BRD-1.result.md": "r"}, "m")
    assert sha == ws.head_sha() and ws.preflight() == sha
    with pytest.raises(ws.PreflightFailed):
        ws.commit_brd_files("demo", {".github/copilot-instructions.md": "x"}, "m")
