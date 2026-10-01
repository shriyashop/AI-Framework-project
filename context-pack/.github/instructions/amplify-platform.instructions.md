---
name: 'Amplify platform conventions'
description: 'House conventions for the Amplify D&IS governance portal — Django/DRF backend, React/Vite frontends, Docker Compose, nginx.'
applyTo: 'backend/**,frontend/**,backlog-frontend/**,practicehub-backend/**,practicehub-frontend/**,nginx/**,docker-compose*.yml'
---

# Amplify platform conventions

> Adapt the specifics below to the repository as it actually is. Where this file and the code disagree, the code is the truth and this file is a bug — say so.

## What this platform is

A centralised Digital & AI governance portal for the D&IS division. Twelve operational modules plus two standalone sub-apps, all data-driven from PostgreSQL. Eight Docker Compose services behind an nginx reverse proxy on port 3010.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Django 4.2 + Django REST Framework, Gunicorn |
| Database | PostgreSQL 15 |
| Proxy | nginx (single entry point, port 3010) |
| Styling | Custom CSS matching the Amplify design system — **no UI framework** |
| HTTP client | Axios |

## Architecture rules

- **nginx is the single entry point.** New surfaces are routed there, not exposed directly, unless following the Practice HUB precedent deliberately and saying so.
- **Two application patterns exist.** Django app inside `backend/` served under `/api/` (the norm), or an independent service in its own directory with its own stack sharing the `amplify` database (Practice HUB). Choose deliberately and state which you are following and why.
- **Postgres is shared, table namespaces are not.** An independent service owns its own prefixed tables (`ph_*`) and does not write another service's.
- **The `practicehub` Django app is `managed=False`** — a mirror of tables the Node service owns. Never write through it. Never add migrations for it. **It is not safely read-only in practice — see Known traps.**

## Known traps

These have caused real confusion. Read them before proposing anything nearby.

**Two Integration Hub implementations exist side by side.** A Django-backed one (`IntegrationHub*` models, served at `/integrationhubdashboard`) and a separate one in `practicehub-backend` (`ph_hub_*` tables, served at Practice HUB's `/integrationhub`). **They are not the same data and are not kept in sync.** Before extending either, establish which is canonical — and treat the duplication itself as a finding worth raising, not a fact to work around.

**`makemigrations` runs on every container start** via `entrypoint.sh`, for both `api` and `backlog`. Migrations are therefore generated at runtime and can differ between environments. Do not rely on committed migration state matching what a running container has. This contradicts "everything version controlled" and should be fixed rather than accommodated — flag it if work brings you near it.

**The `practicehub` Django app is a live write path, not a read-only mirror.** Discovery (`docs/discovery/practicehub-app.md`) found **twelve** `managed=False` models — not the five that `CLAUDE.md` and `PRACTICEHUB.md` claim — and found that Django Admin registers them **with no permission overrides**. Any staff user can therefore write directly into tables the Node service owns, with no ownership boundary and no audit path. Treat this as a live data-integrity risk. Do not repeat the reassurance that it is read-only; it is not.

**Credentials in compose are parameterised but not removed.** Every secret uses its real value as the `:-` fallback (`${POSTGRES_PASSWORD:-amplify123}`, both JWT secrets, the pgAdmin password), so the values are still readable in the file and a missing `.env` starts the stack silently on the published credentials. Two further problems in the same file: `SECRET_KEY` was given a default, which **defeats the mandatory-secret check the application previously enforced**, and `DEBUG` is still hard-coded `"True"`. Anything secret should use `:?` so Compose refuses to start. Do not copy this pattern, and do not add model-provider API keys anywhere near it.

**`docker-compose down -v` destroys all data.** Never suggest it as a routine fix. `restart` runs migrations and is almost always what was meant.

## Conventions

- Django apps register in `INSTALLED_APPS` and route in `urls.py`. An app in one but not the other is a bug — the `practicehub` app is the deliberate exception and is documented as such.
- DRF `ModelViewSet` with a `DefaultRouter` is the norm; function-based views for auth and aggregate endpoints.
- Computed values belong in serializers, not in the frontend.
- Seed commands are **idempotent** and must stay that way — they run on every startup.
- Soft delete where the model has soft-delete fields. Do not hard-delete records that carry them.
- React pages are route-level components that fetch their own data on mount, through the shared Axios client in `src/api/client.js`.
- **Styling uses the CSS variables in `frontend/src/index.css`.** Never introduce a UI framework, and never hard-code a colour that exists as a variable.

## Out of bounds without design review

- `docker-compose.yml` service topology and nginx routing
- `entrypoint.sh` migration and seed sequence
- Anything touching both Integration Hub implementations
- Auth in any of the three schemes (Django, backlog `BacklogUser`, Practice HUB JWT + separate hub JWT)
- Adding a service that reaches the `amplify` database

## If the AI Engineering Factory is added here

The control plane follows the Practice HUB pattern: its own service, own tables, own port, sharing Postgres. `pgvector` is an extension on the existing database, not a new service.

**The execution sandbox does not go in this compose stack.** It runs untrusted generated code and must have no network path to the `amplify` database. It lives on separate infrastructure and is reached over an API. If a task seems to need the sandbox inside the stack, that is a design error — raise it rather than solving it.
