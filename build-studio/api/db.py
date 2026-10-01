"""SQLite access. The Studio API is the only writer to this database."""
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from . import config

SCHEMA = Path(__file__).with_name("schema.sql")


def connect(path: Path | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path or config.DB_PATH), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(path: Path | None = None) -> None:
    with connect(path) as conn:
        conn.executescript(SCHEMA.read_text(encoding="utf-8"))


@contextmanager
def session(path: Path | None = None):
    conn = connect(path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
