# Plan — Stop generating migrations at runtime; commit them instead

**Produced by:** `/plan` · **Date:** 2026-09-07
**Status:** ☐ Draft ☑ **AWAITING GATE 1** ☐ Approved ☐ Rejected
**Approver:** _____________ · **Approved:** __________

> No code is written until the Approved box is ticked by a named person.

## Requirement

Stop `backend/entrypoint.sh` from running `makemigrations` for `api`, `backlog`, and `practicehub` on every container start. Migration files should be generated once, reviewed, and committed by a developer as part of the model change that needs them — the same discipline the repository's own `.gitignore` already states ("Migrations should be committed. Do NOT add migrations/ here.").

## Ambiguities

| Ambiguity | Plausible readings | Needs confirming by |
|---|---|---|
| Whether any migrations currently missing from the committed history exist right now (i.e. whether the working tree's migration files are already in sync with `models.py` for all three apps) | (a) fully in sync, this is a pure process fix; (b) one or more apps have model changes not yet captured in a committed migration, in which case this plan must also generate and commit those first | Whoever approves this plan — run `python manage.py makemigrations --check --dry-run` per app before approving, see Open Questions |

## Lane

☑ A (modernize) — this changes the startup behaviour of a live, seeded, running application (`entrypoint.sh` is also what the production deploy pipeline invokes, per `azure-pipelines.yml`'s `docker compose up --build -d`). Behaviour must be preserved; only the *mechanism* by which migrations come to exist changes.

**Lane A discovery document:** [docs/discovery/entrypoint-migrations.md](../discovery/entrypoint-migrations.md)

## Verification tier

☑ **V4** — because this is explicitly a **schema-migration** change, and `entrypoint.sh` is infrastructure that runs directly against production on every deploy (`azure-pipelines.yml` has no separate staging step — it SSHes into the production VM and runs `docker compose up --build -d`, which invokes this exact entrypoint). Both are named V4 categories in `copilot-instructions.md`'s verification tier table.

> **At V4 the assistant advises and reviews only. A human writes the final artifact.** Concretely: I will produce the reviewed diff for `entrypoint.sh` and the exact commands to generate/verify migrations as a checklist below, but a named human runs those commands and commits the result. I will not run `makemigrations` and commit on your behalf, and I will not edit `entrypoint.sh` myself once this plan is approved.

## Reuse check

| Searched (where, how) | Found | Reusing? | Why not |
|---|---|---|---|
| Whether any app already commits migrations without runtime regeneration, as a pattern to copy | Checked `backlog/migrations/` and `practicehub/migrations/` — both are invoked by the same three `makemigrations` lines in `entrypoint.sh` | No existing pattern within this repo does it differently | N/A — all three apps share the identical (flawed) pattern; there is nothing to reuse, only to fix uniformly |
| Whether `azure-pipelines.yml` has a migration-check CI step that could catch drift instead | Read the full pipeline — it has no build/test stage at all, only SSH deploy | No | Out of scope for this plan — adding CI migration checks is a separate, valuable follow-up (see Out of scope) |

## Approach

Remove the three `makemigrations --noinput` lines from `backend/entrypoint.sh`, leaving only `migrate --noinput`. Before that line ships, a human runs `makemigrations` locally for each of the three apps against the current `models.py`, inspects the generated files (there should be none, if Ambiguity #1 resolves to "already in sync" — confirmed via the dry-run check in Open Questions), and commits any that are genuinely missing, in the same commit as whatever model change produced them from now on.

This makes the migration history exactly what `.gitignore`'s existing comment already claims it is: committed, reviewed, and identical across every environment that runs `migrate` against it — instead of being silently regenerated per-container per-restart, as documented with concrete evidence (the back-to-back `0006`/`0007` emoji-default migrations, 13 minutes apart) in the discovery document.

## Alternative considered and rejected

**Alternative:** keep `makemigrations` in `entrypoint.sh` but add a `--check` flag first (`makemigrations --check --dry-run`) that fails the container start if a migration would be generated, rather than silently generating one.

**Rejected because:** this still leaves migration generation as something that happens (or fails) at container-start time rather than at model-change time, and a failed container start in production — per the same `entrypoint.sh` the deploy pipeline invokes — is a worse failure mode than a developer simply being expected to run `makemigrations` before committing, which is the normal Django workflow everywhere else.

## Files to touch

| File | Change | Risk |
|---|---|---|
| `backend/entrypoint.sh` | Remove the three `makemigrations --noinput` lines (api, backlog, practicehub); keep `migrate --noinput` | Low if Ambiguity #1 resolves to "already in sync"; if not, any pending model change would stop being silently migrated and would instead need its migration generated and committed first — this is the fix working as intended, not a regression |
| `backend/api/migrations/`, `backend/backlog/migrations/`, `backend/practicehub/migrations/` | Possibly a new migration file each, only if the dry-run check finds pending changes | Low — additive files only, reviewed before commit |
| `CLAUDE.md` / `.github/instructions/amplify-platform.instructions.md` | Update the "Known traps" entry once fixed, so the instructions don't describe a defect that no longer exists | None — documentation only |

## Interfaces

None added, changed, or removed. Container startup behaviour changes (one step removed); the Django admin, REST API, and DB schema surface are unaffected as long as Ambiguity #1 resolves cleanly.

## Behaviour preserved (Lane A)

| Rule (from discovery) | Characterisation test | Still enforced by |
|---|---|---|
| R1 (entrypoint-migrations.md) — migrations must exist before `migrate` runs | Manual: `docker-compose restart backend` after the change still starts cleanly with no pending migrations | `migrate --noinput`, now operating only on committed files |
| Rule 2 (entrypoint-migrations.md) — migration files are meant to be committed, per `.gitignore` | N/A — this plan makes the code match the existing stated intent, it does not change the intent | `.gitignore`'s existing (unchanged) comment |

## Tests

| Test | What defect it catches |
|---|---|
| `python manage.py makemigrations --check --dry-run` for `api`, `backlog`, `practicehub`, run by the approving human before merging | Confirms Ambiguity #1 resolves to "already in sync" — i.e., that removing the runtime `makemigrations` call does not silently drop a needed migration |
| `docker-compose down -v && docker-compose up --build` (destructive — full local rebuild, not run against any shared environment) | Confirms a completely fresh volume still migrates and seeds cleanly using only committed migrations, with no `makemigrations` step available to paper over a gap |
| `docker-compose restart backend` against the existing (non-wiped) local volume | Confirms the common case — a normal restart — still starts cleanly |

## Blast radius

- **What breaks if this is wrong:** if a model change exists today that has never had its migration generated and committed (Ambiguity #1 resolving unfavourably), removing the runtime `makemigrations` call means `migrate` will apply an incomplete schema on the next fresh environment (new dev machine, or the next production redeploy after a `down -v`), and Django will raise errors for the missing column/table at first access rather than at container start.
- **Who notices, how quickly:** whoever hits the first broken endpoint — likely immediately, since collectstatic/seed run right after migrate in the same entrypoint and would surface an error before Gunicorn even starts.
- **How it is reversed:** re-add the three `makemigrations` lines to `entrypoint.sh` (one-line-per-app revert) while the missing migration is generated and committed properly; no data is at risk since this plan does not touch `docker-compose down -v`.

## Out of scope

- Adding a CI step that runs `makemigrations --check` on every PR — valuable, catches this class of drift before merge, but a separate change to `azure-pipelines.yml` (which currently has no build/test stage at all) and a separate plan.
- Fixing the Integration Hub duplication or the `practicehub` app's admin-write exposure — tracked separately in their own discovery documents, not touched here.
- Rotating any credentials — unrelated to this change (see the separate credentials fix already applied).

## Open questions for the approver

1. Has anyone run `python manage.py makemigrations --check --dry-run` for `api`, `backlog`, and `practicehub` recently? If not, that should be the very first thing done under this plan, before touching `entrypoint.sh` — it tells us whether Ambiguity #1 is a non-issue or the plan's real risk.
2. Given this is tiered V4, who is the named human who will run the dry-run check, review any generated migration, and edit `entrypoint.sh`? I can prepare the exact diff and commands for them to execute, but per the operating instructions I will not run or commit them myself.

---

## GATE 1 — human approval

Before approving, you should be able to answer, without the assistant open:

1. Why does removing `makemigrations` from `entrypoint.sh` not risk losing a needed schema change, and what check proves that before the change ships?
2. What is the actual failure mode if this plan is wrong, and how would you notice it — in local dev, versus after the next production deploy?
3. Why is this tiered V4 rather than a quick self-approved fix, and what does that mean for who executes the `entrypoint.sh` edit itself?

☐ I can answer these · ☐ Plan approved — implementation may begin
**Approver:** ______________ **Date:** __________
