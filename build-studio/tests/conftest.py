import pytest

from api import db


@pytest.fixture
def conn(tmp_path):
    path = tmp_path / "t.db"
    db.init_db(path)
    c = db.connect(path)
    c.execute("INSERT INTO project(slug,name,workspace_path) VALUES('p','P','x')")
    c.commit()
    yield c
    c.close()


def add_requirement(conn, status, confidence, capped_by=None):
    cur = conn.execute(
        "INSERT INTO requirement(project_id,raw_text,status,confidence,capped_by) VALUES(1,'t',?,?,?)",
        (status, confidence, capped_by),
    )
    conn.commit()
    return cur.lastrowid
