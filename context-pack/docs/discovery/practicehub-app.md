# `practicehub` Django app — Discovery

**Lane:** A (modernize)
**Produced by:** `/understand backend/practicehub/`
**Date:** 2026-09-07 · **Author:** TBD (assign before this is used as a review baseline) · **Reviewed by:** TBD

> Output of the Understand step. Nothing here proposes a change. If a rule below
> is dropped by a later change, that is a defect — this document is what a review
> checks against.

## What it does

`backend/practicehub/` is a Django app registered in `INSTALLED_APPS` ([backend/amplify/settings.py:36](../../backend/amplify/settings.py#L36)) but **not included** in [backend/amplify/urls.py](../../backend/amplify/urls.py) — only `api.urls` and `backlog.urls` are routed there. It defines 12 models, all `Meta.managed = False`, each mapped by `db_table` to a `ph_*` table that `practicehub-backend` (the separate Node/Express service) actually owns, migrates, and writes to via its own `pg` pool ([practicehub-backend/db/database.js](../../practicehub-backend/db/database.js)).

CLAUDE.md describes this app as a "5-model … unused/legacy read-only mirror." Both parts of that description are outdated: the app has **12 models**, not 5, and it is **not enforced read-only** — every model is registered in Django Admin with a plain `ModelAdmin` and no permission overrides, so any Django Admin user with staff access can create, edit, or delete rows in tables the Node service treats as its own.

## Entry points

| Entry point | File:line | Purpose |
|---|---|---|
| `INSTALLED_APPS` registration | [backend/amplify/settings.py:36](../../backend/amplify/settings.py#L36) | Loads the app; migrations, admin, and models become active |
| Django Admin registrations | [backend/practicehub/admin.py:8-95](../../backend/practicehub/admin.py#L8-L95) | Exposes all 12 models for CRUD at `/admin/` |
| `backend/amplify/urls.py` | [backend/amplify/urls.py:8-10](../../backend/amplify/urls.py#L8-L10) | Confirms no `practicehub` route is included — the app has no API surface of its own |

## Data

**Reads:** all 12 `ph_*` tables, via Django ORM against the shared `amplify` Postgres instance, whenever Django Admin renders a `practicehub` model's list or detail page.
**Writes:** none in normal operation (nothing in this repo currently calls create/update/delete against these models), but **nothing prevents a write** — see Undocumented rules.
**External calls:** none.

## Business rules

| # | Rule | File:line | Documented | Confidence |
|---|---|---|---|---|
| 1 | Each model's `db_table` must exactly match the Node service's schema (`ph_users`, `ph_demands`, etc.) | [backend/practicehub/models.py:4-233](../../backend/practicehub/models.py#L4-L233) | Partially — `managed=False` is documented in CLAUDE.md, the table-mapping mechanism is not | Medium |
| 2 | `managed=False` prevents Django from generating or applying migrations for these tables | [backend/practicehub/migrations/0001_initial.py](../../backend/practicehub/migrations/0001_initial.py) | Yes, in CLAUDE.md and `amplify-platform.instructions.md` | High |

### Undocumented rules

**R1 — `managed=False` does not make the app read-only**
- Behaviour: `managed=False` only stops Django from creating/altering the table structure via migrations. It has no effect on ORM reads or writes. Every model is registered with a bare `admin.ModelAdmin` subclass — [backend/practicehub/admin.py:8](../../backend/practicehub/admin.py#L8) onward — with no `has_add_permission`, `has_change_permission`, or `has_delete_permission` override, and no `readonly_fields`.
- Trigger: any Django staff user navigating to `/admin/practicehub/phuser/` (or any of the other 11 models) can add, edit, or delete rows.
- Consequence if this goes unnoticed: an edit made through Django Admin writes directly into a table the Node service owns and validates independently — bypassing whatever business rules `practicehub-backend` enforces on those same tables (uniqueness checks, computed fields, etc., not verified in this pass).
- Characterisation test: none exists today. Worth adding a test asserting the Django Admin change views for these models are either absent or explicitly read-only, if this app is kept.

**R2 — The model count has drifted from its own project documentation**
- Behaviour: CLAUDE.md states 5 models (`PhUser`, `PhDemand`, `PhResource`, `PhPracticeManager`, `PhSkill`). The actual file has 12: those five plus `PhRole`, `PhPartner`, `PhForecast`, `PhAllocation`, `PhTimesheet`, `PhCalendar`, `PhOverhead` — [backend/practicehub/models.py:106-233](../../backend/practicehub/models.py#L106-L233).
- Trigger: N/A — this is a documentation-vs-code drift, not a runtime condition.
- Consequence: anyone using CLAUDE.md's model count to scope a change (e.g. "just 5 models, quick to review") will underestimate the surface by more than half.
- Characterisation test: N/A.

## Diverged implementations

Not applicable — this app has no duplicate logic of its own; it is a mirror. (See the separate Integration Hub discovery document for the duplication that *does* exist between this repository's two Integration Hub implementations — that duplication does not involve this app; `practicehub`'s 12 models mirror Practice HUB's resource-management tables, `ph_users`/`ph_demands`/etc., not the `ph_hub_*` Integration Hub tables.)

## Unreachable code

| What | File:line | Superseded, or caller removed by accident? |
|---|---|---|
| The entire `practicehub` app's model/admin layer | [backend/practicehub/](../../backend/practicehub/) | Not superseded — appears to have been scaffolded (e.g. for a planned read-only reporting view) and never wired up. No `views.py` or `serializers.py` exists in this app, and it is absent from `urls.py`. |

## Traps for a new maintainer

- Assuming "unrouted" means "inert" — it is not; Django Admin access is live the moment a staff account exists, per R1.
- Assuming this app is the practicehub-backend's data layer — it is not; it is a passive mirror that neither validates nor is required by the Node service.
- Trusting CLAUDE.md's model count without opening the file, per R2.

## Open questions

| Question | Who can answer | Blocking? |
|---|---|---|
| Was this app ever used to view/edit `ph_*` data via Django Admin, and does any current staff account have access to it? | Whoever administers Django Admin access / practicehub-backend's data owner | Yes — blocks deciding whether "nothing reads it" (lane-a-modernize's bar for deletion) is actually true |
| Was a read-only reporting view the original intent, and is that still wanted? | Original author (per CLAUDE.md, "appears to be an unused/legacy read-only mirror") — author not identified in this repository | No, but relevant to whether this becomes "delete" or "finish and lock down" |

## Observations for later

> Worth changing. Not changed now. Raise as tickets; do not fold into an in-flight change.

- If this app is kept: lock every `ModelAdmin` down to read-only (`has_add_permission`/`has_change_permission`/`has_delete_permission` returning `False`) so R1 can no longer happen by accident.
- If this app is deleted: confirm via Django Admin access logs (or ask the team) that nobody currently relies on it before removing, per `lane-a-modernize.instructions.md`'s "appears unused is not the same as unused."
- Correct the model count in CLAUDE.md regardless of which direction is chosen (R2).
