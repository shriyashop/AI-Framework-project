"""HTTP routes for projects, requirements and Gate 0."""
import json
import re
import sqlite3

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from . import db, state_machine as sm, stage_brd, workspace

router = APIRouter()


class ProjectIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    slug: str | None = None


class RequirementIn(BaseModel):
    project_id: int
    text: str


class ApproveIn(BaseModel):
    actor: str = Field(min_length=1, max_length=80)
    rationale: str = ""


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40] or "project"


@router.post("/projects", status_code=201)
def create_project(body: ProjectIn):
    slug = body.slug or _slugify(body.name)
    try:
        path = workspace.create_project_folder(slug)
    except (ValueError, FileExistsError) as e:
        raise HTTPException(422, str(e))
    with db.session() as conn:
        try:
            pid = conn.execute("INSERT INTO project(slug,name,workspace_path) VALUES (?,?,?)",
                               (slug, body.name, str(path))).lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(409, f"project {slug} already exists")
    return {"id": pid, "slug": slug, "name": body.name}


@router.get("/projects")
def list_projects():
    with db.session() as conn:
        return [dict(r) for r in conn.execute("SELECT id, slug, name, created_at FROM project ORDER BY id")]


def _requirement_view(conn, row) -> dict:
    d = dict(row)
    d["result"] = json.loads(d.pop("result_json") or "null")
    d["runs"] = [dict(r) for r in conn.execute("SELECT * FROM agent_run WHERE requirement_id=? ORDER BY id", (row["id"],))]
    d["gate_events"] = [dict(r) for r in conn.execute("SELECT * FROM gate_event WHERE requirement_id=? ORDER BY id", (row["id"],))]
    return d


@router.post("/requirements", status_code=202)
async def create_requirement(body: RequirementIn):
    with db.session() as conn:
        project = conn.execute("SELECT * FROM project WHERE id=?", (body.project_id,)).fetchone()
        if project is None:
            raise HTTPException(404, "project not found")
        try:
            rid = await stage_brd.start_run(conn, project, body.text)
        except stage_brd.StageError as e:
            raise HTTPException(409, str(e))
    return {"id": rid, "status": sm.RUNNING}


@router.get("/requirements")
def list_requirements(project_id: int | None = None):
    with db.session() as conn:
        q = "SELECT id, project_id, status, confidence, capped_by, created_at, substr(raw_text,1,120) AS summary FROM requirement"
        rows = conn.execute(q + (" WHERE project_id=?" if project_id else "") + " ORDER BY id DESC",
                            (project_id,) if project_id else ())
        return [dict(r) for r in rows]


@router.get("/requirements/{rid}")
def get_requirement(rid: int):
    with db.session() as conn:
        row = conn.execute("SELECT * FROM requirement WHERE id=?", (rid,)).fetchone()
        if row is None:
            raise HTTPException(404, "requirement not found")
        return _requirement_view(conn, row)


@router.post("/requirements/{rid}/approve")
def approve(rid: int, body: ApproveIn):
    with db.session() as conn:
        try:
            return sm.approve(conn, rid, body.actor, body.rationale)
        except LookupError:
            raise HTTPException(404, "requirement not found")
        except sm.Refused as e:
            return JSONResponse(status_code=409, content=e.as_dict())
