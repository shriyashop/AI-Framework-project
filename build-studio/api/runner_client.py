"""HTTP client for the Agent Runner. The API holds no provider credential."""
import httpx

from . import config

_transport: httpx.AsyncBaseTransport | None = None  # tests inject an ASGI transport


class RunnerError(Exception):
    """Runner unreachable or returned an error."""


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=config.RUNNER_URL, timeout=60, transport=_transport,
        headers={"Authorization": f"Bearer {config.RUNNER_SHARED_TOKEN}"},
    )


async def _call(method: str, path: str, **kw) -> dict:
    try:
        async with _client() as c:
            r = await c.request(method, path, **kw)
    except httpx.HTTPError as e:
        raise RunnerError(f"runner unreachable: {e}") from e
    if r.status_code >= 400:
        raise RunnerError(f"runner {r.status_code}: {r.text[:300]}")
    return r.json()


async def push(workspace_path: str) -> str:
    return (await _call("POST", "/v1/push", json={"workspace_path": workspace_path}))["sha"]


async def remote_sha() -> str | None:
    return (await _call("GET", "/v1/remote-sha"))["sha"]


async def start_task(requirement_id: int, slug: str, text: str) -> dict:
    return await _call("POST", "/v1/tasks", json={"requirement_id": requirement_id, "project_slug": slug,
                                                  "input_text": text})


async def task_status(task_id: str, slug: str, requirement_id: int) -> dict:
    return await _call("GET", f"/v1/tasks/{task_id}",
                       params={"project_slug": slug, "requirement_id": requirement_id})


async def close_pr(task_id: str, pr_number: int, comment: str) -> None:
    await _call("POST", f"/v1/tasks/{task_id}/close-pr", json={"pr_number": pr_number, "comment": comment})
