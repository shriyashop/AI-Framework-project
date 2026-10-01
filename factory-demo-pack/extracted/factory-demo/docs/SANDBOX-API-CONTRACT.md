# Sandbox API Contract

**Status:** Proposed. Answers question 5 from the implementation review.
**Governs:** the boundary between the Amplify-hosted control plane and the isolated execution sandbox.

This is the security boundary of the whole platform. Everything else is a design choice; this is the control that makes agent-driven code execution acceptable at all.

---

## The invariants

Five properties. If a design change breaks any of them, it is not a design change — it is a decision to accept a different risk posture, and it needs the same sign-off the original did.

1. **The sandbox has no network route to the `amplify` database.** Not restricted access. No route. Separate VNet, no peering, no service endpoint, no firewall rule.
2. **The sandbox holds no Amplify credentials.** It cannot authenticate to the control plane at all except through the single signed callback in §4.
3. **Amplify initiates; the sandbox does not.** One exception, §4, and it is write-only to an append-only endpoint.
4. **Production-reaching actions are prepared, never executed.** A migration script, a deployment manifest, a terraform plan. The existing CI/CD pipeline applies them under its own audited identity, after a human gate.
5. **Credentials are per-task, scoped and time-limited.** Minted at task creation, revoked at completion. No standing service account, never a developer's own permissions.

> **The load-bearing one is #1.** Everything else can be tightened later. A sandbox with database reachability cannot be retrofitted into one without it — you rebuild.

---

## Hosting

**Not decided — this needs your Azure estate.** The requirement, in descending order of preference:

| Option | Isolation | Recommendation |
|---|---|---|
| **Separate subscription**, own VNet, no peering to the Amplify VNet | Strongest — blast radius stops at the subscription boundary, separate billing makes sandbox cost visible for FinOps | **Preferred** |
| Same subscription, **separate VNet, no peering**, own resource group | Adequate if subscription-level separation is not practical | Acceptable |
| Same VNet, separated by NSG | **Not acceptable** — one misconfigured rule away from invariant #1 | Reject |

Whichever is chosen, the sandbox needs: its own AKS cluster or Container Apps environment, its own Key Vault, its own container registry, and default-deny egress with an explicit allow-list (the model gateway, the package registry, the Git remote — nothing else).

**What we need from you:** subscription and resource-group naming, whether a new subscription is obtainable, and who owns the VNet topology.

---

## 1. Create a task

```http
POST /v1/tasks
Authorization: Bearer <short-lived OIDC token, workload identity>
Content-Type: application/json
```

```json
{
  "task_id": "uuid",
  "change_record_id": "CR-1234",
  "agent_role": "developer | reviewer | tester | analyst | architect | docs | devops | security",
  "lane": "A | B",
  "verification_tier": "V1 | V2 | V3 | V4",
  "source": {
    "repo": "org/repo",
    "ref": "commit SHA — never a mutable branch name",
    "checkout": "readonly | branch",
    "branch": "factory/CR-1234"
  },
  "tool_allowlist": ["git", "npm", "pytest"],
  "network_allowlist": ["gateway.internal", "registry.npmjs.org"],
  "resource_budget": {
    "cpu": "2", "memory_gb": 4,
    "wall_seconds": 900,
    "token_budget": 200000,
    "max_output_mb": 50
  },
  "credential_scope": {
    "repo": "org/repo",
    "branch": "factory/CR-1234",
    "permissions": ["contents:write"],
    "ttl_seconds": 900
  },
  "task_spec": { "prompt_ref": "understand@v3", "inputs": {} }
}
```

**→ `202 Accepted`**

```json
{ "task_id": "uuid", "status": "queued", "expires_at": "..." }
```

**Rejected with `400` if:** `ref` is a branch name rather than a SHA · `credential_scope` exceeds the invoking human's own permissions · any budget is absent · `network_allowlist` contains a wildcard · `verification_tier` is V4 and `agent_role` would author an artifact.

That last rule is the V4 tier enforced at the boundary rather than trusted to the agent's instructions. **Instructions are a strong default; this is a control.**

## 2. Poll status

```http
GET /v1/tasks/{task_id}
```

```json
{
  "task_id": "uuid",
  "status": "queued | running | succeeded | failed | timeout | killed | budget_exceeded",
  "exit_code": 0,
  "artifacts": [
    { "id": "a1", "type": "diff | file | report | test_results | sbom",
      "path": "…", "sha256": "…", "size_bytes": 4096 }
  ],
  "resource_used": { "wall_seconds": 412, "tokens": 84000, "egress_bytes": 120400 },
  "egress_denied": [ { "host": "…", "count": 3 } ],
  "started_at": "…", "completed_at": "…"
}
```

`egress_denied` is not diagnostics — it is a security signal. Repeated denials to an unexpected host on a task means either a broken allow-list or an agent doing something it should not. **Surface it in the console; alert on patterns.**

## 3. Retrieve artifacts

```http
GET /v1/tasks/{task_id}/artifacts/{artifact_id}
```

Returns content plus its `sha256`. **Artifacts move as content, never as database writes** — the sandbox never writes to any Amplify table, directly or indirectly. The control plane validates the hash, then persists.

```http
POST /v1/tasks/{task_id}/cancel
```

## 4. The one callback

The sandbox's only outbound call to Amplify:

```http
POST https://amplify.internal/api/factory/audit/events
Authorization: <request-signed, sandbox's own key>
```

```json
{ "task_id": "uuid", "change_record_id": "CR-1234",
  "event": "task.started | task.completed | tool.invoked | egress.denied | budget.exceeded",
  "timestamp": "…", "detail": {} }
```

**Append-only. No read path. No other endpoint reachable.** If this endpoint is unavailable the sandbox buffers and retries — it never proceeds silently unaudited, and a task whose audit events cannot be delivered fails closed.

---

## Control-plane responsibilities

The control plane, not the sandbox, owns: minting scoped credentials at task creation and revoking at completion; refusing any `credential_scope` broader than the invoking human's; enforcing V4 at the boundary; writing the Change Record; and being the only writer to Factory tables.

---

## What this rules out

Stated plainly, because these will be proposed as conveniences:

- The sandbox reading the marketplace catalogue directly from Postgres — it receives catalogue results as task inputs instead
- The sandbox writing test results into the database — it returns them as artifacts
- Sharing the Amplify Docker network "just for local development" — local development uses a local sandbox with the same contract, never a shortened one
- A long-lived service principal "to simplify credential management"

Each is a small convenience that removes an invariant. The first one that gets accepted is the one that ends the security review.
