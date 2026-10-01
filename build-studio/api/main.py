"""Studio API: state machine, database, gates. Serves the built console."""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from . import config, db, runner_client, stage_brd, state_machine as sm
from .routes import router

log = logging.getLogger("studio")


async def poll_once() -> None:
    with db.session() as conn:
        for req in conn.execute("SELECT * FROM requirement WHERE status IN (?,?)", sm.ACTIVE).fetchall():
            try:
                await stage_brd.poll(conn, req)
            except runner_client.RunnerError as e:
                log.warning("requirement %s: transient runner error: %s", req["id"], e)
            except Exception:  # keep the poller alive; the run times out if it never recovers
                log.exception("requirement %s: poll failed", req["id"])


async def _poll_loop() -> None:
    while True:
        await poll_once()
        await asyncio.sleep(config.POLL_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    task = asyncio.create_task(_poll_loop())  # also resumes runs left active across a restart
    yield
    task.cancel()


app = FastAPI(title="Build Studio API", lifespan=lifespan)
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}


if config.CONSOLE_DIST.exists():
    app.mount("/", StaticFiles(directory=config.CONSOLE_DIST, html=True), name="console")
