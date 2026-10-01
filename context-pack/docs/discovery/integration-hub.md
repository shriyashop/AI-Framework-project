# Integration Hub duplication — Discovery

**Lane:** A (modernize)
**Produced by:** `/understand` applied to the two Integration Hub implementations
**Date:** 2026-09-07 · **Author:** TBD (assign before this is used as a review baseline) · **Reviewed by:** TBD

> Output of the Understand step. Nothing here proposes a change. If a rule below
> is dropped by a later change, that is a defect — this document is what a review
> checks against.

## What it does

Two independent systems both call themselves "Integration Hub" and both manage the same kind of data — integration projects, Boomi/API processes, reusable connector assets, best practices, and connected systems. Neither knows the other exists at the data layer.

The first is a Django app: 8 models in [backend/api/models.py](../../backend/api/models.py) (`IntegrationHubProject`, `IntegrationHubProcess`, `IntegrationHubAPI`, `IntegrationHubAPIEndpoint`, `IntegrationHubAsset`, `IntegrationHubBestPractice`, `IntegrationHubSystem`, `IntegrationHubUser`), served under `/api/hub/*` and rendered by [frontend/src/pages/IntegrationHubDashboard.jsx](../../frontend/src/pages/IntegrationHubDashboard.jsx) at the `/integrationhubdashboard` route. The second is a Node/Express app: 15 tables in [practicehub-backend/db/schema.js](../../practicehub-backend/db/schema.js) (`ph_hub_projects`, `ph_hub_processes`, `ph_hub_apis`, `ph_hub_endpoints`, `ph_hub_assets`, `ph_hub_best_practices`, `ph_hub_systems`, `ph_hub_connections`, `ph_hub_users`, plus four join tables and `ph_hub_p2p`), served from [practicehub-backend/routes/hub.js](../../practicehub-backend/routes/hub.js) and rendered by [practicehub-frontend/src/IntegrationHubApp.jsx](../../practicehub-frontend/src/IntegrationHubApp.jsx) at the `/integrationhub` route.

Both share the same `amplify` Postgres instance but write to entirely separate tables with separate auth (`IntegrationHubUser` vs `ph_hub_users`, checked by [middleware/hubAuth.js](../../practicehub-backend/middleware/hubAuth.js)). A user or record created in one is invisible to the other. There is no sync job, no shared identifier, no canonical source.

## Entry points

| Entry point | File:line | Purpose |
|---|---|---|
| `router.register(r'hub/projects', ...)` | [backend/api/urls.py:59](../../backend/api/urls.py#L59) | Django REST route for Hub projects |
| `router.register(r'hub/processes', ...)` | [backend/api/urls.py:60](../../backend/api/urls.py#L60) | Django REST route for Hub processes |
| `router.register(r'hub/apis', ...)` | [backend/api/urls.py:61](../../backend/api/urls.py#L61) | Django REST route for Hub APIs |
| `/integrationhubdashboard` route | [frontend/src/App.jsx:34](../../frontend/src/App.jsx#L34) | Django-backed Hub UI |
| `router.get('/projects', ...)` | [practicehub-backend/routes/hub.js:56](../../practicehub-backend/routes/hub.js#L56) | Node REST route for Hub projects |
| `/integrationhub/*` route | [practicehub-frontend/src/App.jsx:9](../../practicehub-frontend/src/App.jsx#L9) | Node-backed Hub UI, inside Practice HUB |

## Data

**Reads/writes (Django path):** `IntegrationHubProject/Process/API/APIEndpoint/Asset/BestPractice/System/User` tables, via Django ORM — [backend/api/models.py:530-664](../../backend/api/models.py#L530-L664).
**Reads/writes (Node path):** `ph_hub_*` tables (15 total, including 4 join tables), via raw SQL — [practicehub-backend/db/schema.js:150-379](../../practicehub-backend/db/schema.js#L150-L379).
**External calls:** none observed in either path beyond the shared Postgres instance.

## Business rules

| # | Rule | File:line | Documented | Confidence |
|---|---|---|---|---|
| 1 | A project has a G1/G2 gate status and date pair (both implementations) | [backend/api/models.py:530](../../backend/api/models.py#L530), [schema.js:150](../../practicehub-backend/db/schema.js#L150) | No | High |
| 2 | Project code / id must be unique and human-readable (`PR_006` style) | [frontend/src/pages/IntegrationHubDashboard.jsx:233](../../frontend/src/pages/IntegrationHubDashboard.jsx#L233), [routes/hub.js:9-16](../../practicehub-backend/routes/hub.js#L9-L16) | No | High |
| 3 | A process's connection count and source/target systems are computed, not stored (Node path only) | [routes/hub.js:29-51](../../practicehub-backend/routes/hub.js#L29-L51) | No | Medium |

### Undocumented rules

**R1 — Project categorisation fields exist only in the Node implementation**
- Behaviour: `ph_hub_projects` carries `value_tower`, `business_group`, `project_driver`, `pm_name`, `architect_name` — none of these exist on Django's `IntegrationHubProject`.
- Trigger: any project created or edited through the Practice HUB UI ([practicehub-frontend/src/components/hub/HubProjects.jsx:33](../../practicehub-frontend/src/components/hub/HubProjects.jsx#L33)).
- Consequence if dropped / if the Django path were treated as canonical: value-tower and driver reporting for every Practice-HUB-created project silently disappears.
- Characterisation test: none exists today.

**R2 — Process categorisation fields exist only in the Node implementation**
- Behaviour: `ph_hub_processes` carries `integration_type`, `trigger_type`, `is_enhancement`, `flow_id` — none exist on Django's `IntegrationHubProcess`.
- Trigger: any process created or edited through [practicehub-frontend/src/components/hub/HubProcesses.jsx:34](../../practicehub-frontend/src/components/hub/HubProcesses.jsx#L34).
- Consequence if dropped: loses the on-demand/real-time/scheduler trigger classification and P2P-vs-API integration type entirely.
- Characterisation test: none exists today.

**R3 — Two independent user/auth stores for the same conceptual "Hub user"**
- Behaviour: `IntegrationHubUser` (Django, `role` choices business/developer/manager) and `ph_hub_users` (Node, same three roles) are separate tables with separate password hashes and no cross-reference.
- Trigger: logging in via either `/integrationhubdashboard` or `/integrationhub`.
- Consequence if dropped: a "canonical" merge must resolve two account records per real person, by email, with no shared ID to join on.
- Characterisation test: none exists today.

## Diverged implementations

| Logic | Implementations (file:line) | How they differ | Which is correct |
|---|---|---|---|
| Integration project record | [backend/api/models.py:530](../../backend/api/models.py#L530) vs [schema.js:150](../../practicehub-backend/db/schema.js#L150) | Node has 5 extra business fields (R1); Django's `project_code` (CharField, app-assigned) vs Node's `id` (TEXT PK, sequential via [routes/hub.js:9](../../practicehub-backend/routes/hub.js#L9) `nextId()`); default emoji differs (`''` vs `'📁'`) | Cannot determine — no record of which UI is actually in active use, or whether the two have diverged data for the same real projects. |
| Integration process record | [backend/api/models.py:549](../../backend/api/models.py#L549) vs [schema.js:172](../../practicehub-backend/db/schema.js#L172) | Node has 4 extra business fields (R2) | Cannot determine, same reason |
| Hub user / auth | [backend/api/models.py:653](../../backend/api/models.py#L653) vs [schema.js:276](../../practicehub-backend/db/schema.js#L276) | Fully separate credential stores, no shared identifier | Cannot determine — resolving requires a decision on which login flow is authoritative, which is a product decision, not a code-reading one |

> "Cannot determine" is the correct answer for all three — this is escalated, not guessed at.

## Unreachable code

None found in either path during this pass — both routers and both frontend routes are live and reachable.

## Traps for a new maintainer

- Extending either implementation's project/process model without checking the other will widen the field gap identified in R1/R2, not close it.
- Nothing in either codebase flags that the other implementation exists — a developer working in one will not discover the other without reading [CLAUDE.md](../../CLAUDE.md) or this document.
- The two use different ID schemes (Django auto PK + `project_code` string; Node string PK generated by `nextId()`), so any future merge cannot join records by primary key.

## Open questions

| Question | Who can answer | Blocking? |
|---|---|---|
| Which of the two is actually used day-to-day, and by whom? | Whoever owns Integration Hub adoption / the D&IS division | Yes — blocks any reconciliation plan |
| Do the two have diverged data today for the same real-world projects, or has only one ever been populated with real records? | Whoever has DB access to compare `IntegrationHubProject` vs `ph_hub_projects` row counts/content | Yes |
| Is either login (`IntegrationHubUser` vs `ph_hub_users`) the one people currently use, or do both have active accounts? | Same as above | Yes |

## Observations for later

> Worth changing. Not changed now. Raise as tickets; do not fold into an in-flight change.

- Reconciling this duplication is the best-available Lane A pilot candidate: this discovery work is already done, the ambiguity is scoped, and the fix produces a governed Change Record end-to-end (per reconciliation-memo.md §6 and the ANSWERS doc's Correction 1).
- Whichever implementation is retired should keep its data available read-only during a transition window — R1/R2's extra Node-side fields would need an explicit decision (add to Django, or accept the loss) before cutover, not an implicit one.
