# Amplify Platform — Django + React + PostgreSQL

## Quick Start

```bash
docker-compose up --build
```

| Service | URL | Notes |
|---|---|---|
| Main Platform (React) | http://localhost:3010 | Served via nginx |
| Innovation Backlog | http://localhost:3010/innovationhubdashboard | Served via nginx |
| Integration Hub | http://localhost:3010/integrationhubdashboard | Served via nginx (main frontend) |
| **Practice HUB** | **http://localhost:3002** | **Direct — Vite dev server, separate from nginx** |
| API root (Amplify) | http://localhost:3010/api/ | Proxied by nginx → Django :8000 |
| API root (Practice HUB) | http://localhost:3002/api/ | Proxied by Vite → Node.js :3003 |
| Django Admin | http://localhost:3010/admin/ | Proxied by nginx |
| Innovation Backlog (direct) | http://localhost:3001 | backlog-frontend dev server (also exposed) |
| PGAdmin 4 | http://localhost:5050 | `admin@admin.com` / `ChangeThisNow_123!` |

> Port 8000 (Django) and port 3000 (main React) are **internal only** — not exposed to the host.  
> Port 3001 (backlog-frontend) and **port 3002 (Practice HUB)** are exposed directly on the host.  
> Port 3003 (Practice HUB backend) is **internal only** — accessed via Vite proxy on port 3002.  
> All production-grade Amplify access goes through nginx on **port 3010**.

The backend automatically runs migrations and seeds sample data on first start.

---

## Architecture

```
docker-compose.yml
├── db                   → PostgreSQL 15           (internal)
├── backend              → Django 4.2 + DRF        (internal :8000)
├── frontend             → React + Vite            (internal :3000)
├── backlog-frontend     → React + Vite            (host   :3001)
├── practicehub-backend  → Node.js/Express         (internal :3003)
├── practicehub-frontend → React + Vite            (host   :3002)
├── pgadmin              → PGAdmin 4               (host   :5050)
└── nginx                → Reverse proxy           (host  :3010 → :80)
                            /                          → frontend:3000
                            /innovationhubdashboard    → backlog-frontend:3001
                            /api/                      → backend:8000
                            /admin/                    → backend:8000
                            /static/                   → staticfiles volume (admin CSS/JS)
                            /media/                    → backend:8000
                            /agiletraining             → static HTML from backlog-frontend/public/
```

> The Integration Hub Dashboard (`/integrationhubdashboard`) is a route inside the main React frontend, not a separate container.
>
> Practice HUB runs **independently** on port 3002 and is **not** proxied by nginx. Its API calls (`/api/...`) are proxied internally by the Vite dev server to `practicehub-backend:3003`.

---

## Django Admin

### Access
```
http://localhost:3010/admin/
```

### First-time setup — create a superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Production / IP-based access
`CSRF_TRUSTED_ORIGINS` is auto-derived from `ALLOWED_HOSTS`, so if your IP or hostname is already in `ALLOWED_HOSTS` (in your `.env`), the admin login will work with no extra config.

If you still see a CSRF error, set it explicitly:

| Variable | Example value |
|---|---|
| `ALLOWED_HOSTS` | `10.117.155.86,yourdomain.com` |
| `CSRF_TRUSTED_ORIGINS` | `http://10.117.155.86,https://yourdomain.com` |
| `SECRET_KEY` | A long random string (never the dev default) |
| `DEBUG` | `False` |

Then create a superuser in the production database:
```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## Main Platform Pages (React Router — port 3010)

| Route | Module | Description |
|---|---|---|
| `/` | Overview | Hero stats, quick links |
| `/solutions` | 01 | Digital solution discovery + access management |
| `/notifications` | 02 | Centralised notifications hub |
| `/value` | 03 | Value KPI dashboard with tower drill-down |
| `/copilot` | 04 | M365 Copilot adoption & prompt library |
| `/admin` | 05 | Admin & access control |
| `/innovation` | 06 | Innovation backlog (Kanban) — live poll every 30 s |
| `/agents` | 07 | AI Agent monitoring hub |
| `/assets` | 08 | Reusable asset library |
| `/training` | 09 | Training catalogue + support chatbot |
| `/toolchain` | 10 | Integrated digital toolchain |
| `/integration` | 11 | Boomi Integration Command Centre (7-view) |
| `/integrationhubdashboard` | 12 | Integration HUB Governance — full CRUD portal |

> The `/innovation` Kanban polls the API every 30 seconds so concurrent users
> see each other's submissions without a manual refresh.

---

## Innovation Backlog App (`/innovationhubdashboard`)

A standalone multi-role portal for end-to-end idea lifecycle management.

### Roles & Demo Login Accounts

| Email | Password | Role | Capabilities |
|---|---|---|---|
| `test.employee@opmobility.com` | Amplify@2024 | Employee | Submit ideas, track status, earn points |
| `test.reviewer@opmobility.com` | Amplify@2024 | Reviewer | Score ideas, shortlist, request info |
| `test.business@opmobility.com` | Amplify@2024 | Business Owner | Author business cases |
| `test.tech@opmobility.com` | Amplify@2024 | Tech Expert | Author feasibility assessments |
| `test.admin@opmobility.com` | Amplify@2024 | Admin | Full access to all actions |

### Business Groups

| Value | Label |
|---|---|
| `exterior` | Exterior |
| `lighting` | Lighting |
| `modules` | Modules |
| `c_power` | C-Power |
| `h2_power` | H2-Power |
| `op_n_soft` | OP'nSoft |

### Idea Stage Flow

```
draft → submitted → in_review → shortlisted → approved
      → business_case_wip → business_case → business_case_approved
      → business_case_revision (loop back to business_case_wip)
      → feasibility → feasibility_submitted → feasibility_approved
      → implementation → completed
```

Side paths: `info_requested`, `more_info_requested`, `on_hold`, `rejected`

---

## Integration HUB Dashboard (`/integrationhubdashboard`)

A secured governance portal for OPmobility's Boomi integration platform. Full CRUD for projects, processes, APIs, reusable assets, and best practices, with role-based access control.

### Login

Credentials are managed via Django Admin (`http://localhost:3010/admin/` → **Integration Hub Users**). Admins can create users and set/change passwords from the admin panel.

### Demo Accounts

| Email | Password | Role | Access |
|---|---|---|---|
| `kisan.shirke@opmobility.com` | `amplify123` | Integration Manager | Full CRUD + Admin view |
| `alok.maurya@opmobility.com` | `amplify123` | Developer | View-only |
| `sophie.laurent@opmobility.com` | `amplify123` | Business User | View-only |

> Only **Integration Manager** accounts see Add / Edit / Delete controls.

### Views

| View | Description |
|---|---|
| Projects | Integration project registry with G-Gate status (G1 / G2 Approved Date) |
| Processes | Boomi process catalogue (status, protocol, source → target, data scope) |
| API Catalogue | Published REST APIs with endpoint, version strategy, change frequency |
| Reusable Assets | Connectors, libraries, frameworks, templates — with process assignment |
| Best Practices | Integration standards and templates |
| Analytics | Charts — project/process/API/asset status and domain distributions |
| BoomiAIOps | Real-time process health, KPIs, 24-hour message volume graph |
| Admin | Quick Actions, Assignment Management, Access Management, Connected Systems |

### UI Features

- **Search strip** — filter bar below the topbar with entity-type shortcuts (Projects / Processes / APIs / Assets) and one-click nav to Analytics and BoomiAIOps
- **Role badge** — coloured pill in the topbar (green = Integration Manager, blue = Developer, yellow = Business User)
- **Count badges** — live record counts on sidebar nav items
- **📎 Document Links** — every Add/Edit modal includes a link field where users paste SharePoint or web URLs; saved links open in a new tab from the detail view

### Admin Panel (Manager-only)

The **Admin** view (sidebar → Admin) has four sections:

| Section | Description |
|---|---|
| ⚡ Quick Actions | One-click buttons to open the Add modal for each entity type |
| 🔗 Assignment Management | Modals to assign processes → projects, APIs → processes, assets → processes |
| 🔐 Access Management | Live user table — managers can change roles or deactivate users inline |
| 🖥️ Connected Systems | Reference grid of all integrated systems |

### Managing Users

**Create / change password** — must be done via Django Admin (passwords are hashed server-side):

1. Go to `http://localhost:3010/admin/`
2. Click **Integration Hub Users** → **Add**
3. Fill in name, email, role, and set a password in the **Password** field
4. Save — the user can now log in at `/integrationhubdashboard`

To change a password, open the user record and type a new value in the **Password** field (leave blank to keep the existing password).

**Change role / deactivate** — can also be done directly from the in-app Admin panel (no Django Admin required):
- Open the Integration HUB → Admin → Access Management table
- Use the role dropdown to change a user's role (saved immediately to the database)
- Click 🗑️ to deactivate a user (they can no longer log in)

---

## Practice HUB (`http://localhost:3002`)

A standalone resource intelligence portal for D&IS practice managers covering demand management, capacity planning, resource allocation, timesheet tracking, and utilisation analytics. It runs as a separate stack (Node.js backend + React frontend) that shares the same PostgreSQL database via `ph_*` prefixed tables.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (port 3002, host-exposed, separate from nginx) |
| Backend | Node.js + Express (port 3003, internal only) |
| Auth | JWT (8 h expiry), bcryptjs password hashing |
| Database | Shared PostgreSQL 15 — `ph_*` prefixed tables |

### Demo Login Accounts

| Username | Password | Role | Practice |
|---|---|---|---|
| `admin` | `Admin@123` | System Administrator | All Practices |
| `sap-am` | `SapAm@123` | Practice Manager | Regional SAP Practice – Americas |
| `sap-em` | `SapEm@123` | Practice Manager | Regional SAP Practice – EMEA |
| `sap-ap` | `SapAp@123` | Practice Manager | Regional SAP Practice – APAC |
| `dsp` | `Dsp@1234` | Practice Manager | Global Digital Solutions Practice |
| `gip` | `Gip@1234` | Practice Manager | Global Integration Practice |

### Views

| View | Component | Description |
|---|---|---|
| **Dashboard** | `Dashboard.jsx` | Live KPIs: active demands, resources, avg planned/actual utilisation. Excludes Digital Solutions practice. Demand status pipeline chart, practice utilisation table, and recent demands all data-driven from DB. |
| **Demand Tracker** | `DemandTracker.jsx` | Full CRUD for project demands. Filters by practice, status, region, BG, VT. Auto-generates `D-2026-XXX` IDs. |
| **Skill Forecast** | `SkillForecast.jsx` | 12-month skill/role demand forecast per demand (Jan–Dec 2026). |
| **Net Capacity Calc** | `CapacityPlanning.jsx` | Country-level calendar management (working days, public holidays) and per-resource vacation/overhead tracking. |
| **Resource Allocation** | `ResourceAllocation.jsx` | Assign resources to demands with weekly day breakdown (W1–W5). Role auto-selects from master dropdown filtered by practice. Net Capacity auto-calculated from calendar; falls back to 20 days when country is not set. |
| **Utilisation** | `Utilisation.jsx` | Planned vs actual utilisation — 4 tabs: Planned, Actual, Variance, Individual Resource. All data from allocation + timesheet records. |
| **Weekly Timesheet** | `Timesheet.jsx` | Daily hour entry per resource per week. Draft → Submitted workflow. |
| **Analytics Hub** | `Analytics.jsx` | Demand Reports (status pie, region bar, type pie — live from DB, Digital Solutions excluded). Throughput and Skill Gap tabs are indicative. |
| **Master Data** | `MasterData.jsx` | CRUD for skills, roles, partners, and practice managers per practice. |

### Month Index Convention

Month index `0 = Jan 2026`, `11 = Dec 2026`. Used across allocations, forecasts, calendar, and overhead tables.

### Database Tables (`ph_*` prefix, shared PostgreSQL)

| Table | Description |
|---|---|
| `ph_users` | Practice HUB users (separate from Amplify users) |
| `ph_demands` | Project demands — `D-2026-XXX` IDs |
| `ph_resources` | People — practice, region, country, role, skill, type, status |
| `ph_practice_managers` | Practice manager registry per practice/region |
| `ph_skills` | Skill master per practice |
| `ph_roles` | Role master per practice |
| `ph_partners` | External partner catalogue |
| `ph_forecast` | Monthly demand forecast by role/skill (JSON `vals` array, 12 months) |
| `ph_allocations` | Resource-to-demand allocations: `net_cap`, `w1`–`w5`, `month_idx` |
| `ph_timesheets` | Weekly actual hours per resource |
| `ph_calendar` | Working days / public holidays per country per month |
| `ph_overhead` | Vacation + other overhead hours per resource per month |

> PGAdmin 4 at http://localhost:5050 provides a GUI to inspect all tables (both `api_*` Amplify tables and `ph_*` Practice HUB tables).

---

## API Endpoints

### Amplify Platform (`http://localhost:3010/api/`)

All Django REST API endpoints are served via nginx on port 3010.

### Main Platform

| Endpoint | Description |
|---|---|
| `GET /api/overview/` | Platform summary stats |
| `GET /api/solutions/` | Digital solutions (filter: `?tower=supply_chain`) |
| `GET /api/notifications/` | All notifications |
| `PATCH /api/notifications/{id}/mark_read/` | Mark as read |
| `PATCH /api/notifications/mark_all_read/` | Mark all as read |
| `GET /api/value/kpis/` | KPI metrics |
| `GET /api/value/towers/` | Tower value breakdown |
| `GET /api/copilot/stats/` | Copilot adoption stats |
| `GET /api/copilot/prompts/` | Prompt library |
| `GET /api/copilot/courses/` | Academy courses |
| `GET /api/admin-module/users/` | User access registry |
| `GET /api/admin-module/licenses/` | License management |
| `GET /api/admin-module/governance/` | Governance stats |
| `GET/POST /api/innovation/` | Innovation ideas (Kanban) |
| `GET /api/agents/` | AI agents |
| `GET /api/agents-activity/` | Agent activity feed |
| `GET /api/assets/` | Asset categories with assets |
| `GET/PATCH /api/training/courses/` | Training catalogue |
| `GET /api/toolchain/` | Toolchain tools |
| `GET /api/integration/kpis/` | Integration KPI cards |
| `GET /api/integration/projects/` | Integration projects + pipeline steps |
| `GET /api/integration/systems/` | System health matrix |
| `GET /api/integration/alerts/` | Alert feed (`?severity=critical\|warning\|info`) |
| `GET /api/integration/signals/` | Predictive maintenance signals |
| `GET /api/integration/agents/` | AI agents with journey maps |
| `GET /api/integration/boomi-process-count/` | Live Boomi process count (BoomiAIOps) |
| `GET /api/integration/boomi-failed-executions/` | Live failed execution count |
| `GET /api/integration/boomi-active-alerts/` | Live active alert count |
| `GET /api/integration/boomi-einv-stats/` | Boomi e-invoicing stats |
| `GET /api/health/` | Backend health check |

### Integration HUB (`/api/hub/`)

| Endpoint | Description |
|---|---|
| `POST /api/hub/auth/login/` | Login — returns `{id, name, email, role}` |
| `GET /api/hub/users/` | List active hub users |
| `PATCH /api/hub/users/{id}/role/` | Update a user's role (`business` \| `developer` \| `manager`) |
| `DELETE /api/hub/users/{id}/` | Deactivate a user (sets `is_active=False`) |
| `GET/POST /api/hub/projects/` | Projects (filter: `?status=Live`) |
| `GET/PUT/PATCH/DELETE /api/hub/projects/{id}/` | Single project CRUD |
| `GET/POST /api/hub/processes/` | Processes (filter: `?status=`, `?protocol=`) |
| `GET/PUT/PATCH/DELETE /api/hub/processes/{id}/` | Single process CRUD |
| `GET/POST /api/hub/apis/` | APIs (filter: `?status=`, `?domain=`) |
| `GET/PUT/PATCH/DELETE /api/hub/apis/{id}/` | Single API CRUD |
| `GET/POST /api/hub/assets/` | Reusable assets (filter: `?status=`) |
| `GET/PUT/PATCH/DELETE /api/hub/assets/{id}/` | Single asset CRUD |
| `POST /api/hub/assets/{id}/assign_processes/` | Link asset to processes |
| `GET/POST /api/hub/practices/` | Best practices (filter: `?category=`) |
| `GET/PUT/PATCH/DELETE /api/hub/practices/{id}/` | Single practice CRUD |
| `GET /api/hub/systems/` | Connected systems registry |

### Innovation Backlog (`/api/backlog/`)

| Endpoint | Description |
|---|---|
| `POST /api/backlog/auth/login/` | Login with email → returns name, role, avatar |
| `POST /api/backlog/auth/signup/` | Register a new user |
| `POST /api/backlog/auth/forgot-password/` | Send password reset link |
| `POST /api/backlog/auth/reset-password/` | Reset password via token |
| `GET /api/backlog/auth/users/` | List all active users |
| `PATCH /api/backlog/auth/profile/` | Update own profile |
| `GET /api/backlog/dashboard/` | Role-aware dashboard stats |
| `GET/POST /api/backlog/ideas/` | Idea list / create |
| `POST /api/backlog/ideas/{id}/advance_stage/` | Move idea to next stage |
| `POST /api/backlog/ideas/{id}/like/` | Toggle like |
| `POST /api/backlog/ideas/{id}/request_info/` | Request more information |
| `POST /api/backlog/ideas/{id}/respond_info/` | Respond to info request |
| `GET /api/backlog/ideas/{id}/audit/` | Idea audit log |
| `POST /api/backlog/ideas/save_draft/` | Auto-save draft |
| `GET /api/backlog/ideas/image_catalogue/` | List cover image URLs |
| `GET/POST /api/backlog/tags/` | Idea tags |
| `GET/POST /api/backlog/attachments/` | File attachments |
| `GET/POST /api/backlog/info-requests/` | Info request records |
| `GET/POST /api/backlog/comments/` | Idea comments |
| `DELETE /api/backlog/comments/{id}/soft_delete/` | Soft-delete a comment |
| `GET/POST /api/backlog/reviews/` | Idea review scores |
| `GET/POST /api/backlog/approval-workflows/` | Approval workflow records |
| `GET/POST /api/backlog/approval-decisions/` | Approval decision records |
| `GET/POST /api/backlog/business-cases/` | Business cases |
| `POST /api/backlog/business-cases/{id}/add_collaborator/` | Add collaborator to BC |
| `GET /api/backlog/business-cases/{id}/versions/` | List BC versions |
| `GET /api/backlog/business-cases/{id}/compare_versions/` | Diff two BC versions |
| `GET/POST /api/backlog/feasibility/` | Feasibility assessments |
| `GET/POST /api/backlog/value-measurements/` | Value measurement records |
| `GET/POST /api/backlog/profiles/` | Gamification profiles / leaderboard |
| `GET /api/backlog/profiles/my_profile/` | Own gamification profile |
| `GET/POST /api/backlog/badges/` | Badge catalogue |
| `GET/POST /api/backlog/user-badges/` | Awarded user badges |
| `GET/POST /api/backlog/points/` | Point event log |
| `GET/POST /api/backlog/challenges/` | Gamification challenges |
| `GET/POST /api/backlog/challenge-progress/` | User challenge progress |
| `GET /api/backlog/notifications/` | User notifications |
| `PATCH /api/backlog/notifications/{id}/mark_read/` | Mark notification read |
| `PATCH /api/backlog/notifications/mark_all_read/` | Mark all notifications read |

---

### Practice HUB (`http://localhost:3002/api/`)

All endpoints require `Authorization: Bearer <jwt>` except `/auth/login`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with username or email — returns `{token, user}` |
| GET | `/api/auth/me` | Return current user from JWT |
| GET | `/api/demands` | List demands (`?practice=`, `?status=`, `?region=`, `?bg=`, `?vt=`) |
| POST | `/api/demands` | Create demand (auto-generates `D-2026-XXX`) |
| PUT | `/api/demands/:id` | Update demand |
| DELETE | `/api/demands/:id` | Delete demand |
| GET | `/api/resources` | List all resources |
| POST | `/api/resources` | Create resource (auto-generates `R-XXX`) |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource (cascades to allocations + timesheets) |
| GET/POST | `/api/master/skills` | Skill master CRUD |
| PUT/DELETE | `/api/master/skills/:id` | Update / delete skill |
| GET/POST | `/api/master/roles` | Role master CRUD |
| PUT/DELETE | `/api/master/roles/:id` | Update / delete role |
| GET/POST | `/api/master/partners` | Partner CRUD |
| PUT/DELETE | `/api/master/partners/:id` | Update / delete partner |
| GET/POST | `/api/master/practice-managers` | Practice manager CRUD |
| PUT | `/api/master/practice-managers/:id` | Update practice manager |
| GET | `/api/forecast` | Forecast rows for a demand (`?demand_id=`) |
| POST | `/api/forecast` | Create forecast row |
| PUT/DELETE | `/api/forecast/:id` | Update / delete forecast row |
| GET | `/api/capacity/calendar` | Calendar entries (`?month_idx=`) |
| PUT | `/api/capacity/calendar` | Update working days / public holidays for a country+month |
| GET | `/api/capacity/overhead` | Overhead entries (`?practice=`, `?month_idx=`) |
| PUT | `/api/capacity/overhead` | Upsert overhead record for a resource+month |
| GET | `/api/allocation` | Allocation rows (`?demand_id=`, `?month_idx=`) |
| POST | `/api/allocation` | Assign resource to demand |
| PUT/DELETE | `/api/allocation/:id` | Update / delete allocation |
| GET | `/api/timesheet` | Timesheet rows (`?resource_name=`, `?week_start=`) |
| POST | `/api/timesheet` | Create timesheet row |
| PUT | `/api/timesheet/:id` | Update timesheet hours |
| POST | `/api/timesheet/:id/submit` | Submit timesheet (Draft → Submitted) |
| GET | `/api/utilisation` | Planned + actual utilisation % per practice per month (0–11) |
| GET | `/api/health` | Backend health check |

---

## Database

All content is database-driven via seed management commands.

```bash
# Re-seed all platform data (hub users + hub content included)
docker-compose exec backend python manage.py seed_data

# Seed backlog demo users only (always safe to run)
docker-compose exec backend python manage.py seed_backlog --users-only

# Full backlog seed (ideas + users)
docker-compose exec backend python manage.py seed_backlog

# Create Django admin superuser
docker-compose exec backend python manage.py createsuperuser
```

---

## CI/CD Pipeline (Azure DevOps)

Defined in [azure-pipelines.yml](azure-pipelines.yml). Triggers automatically on every push to `main`.

### What the pipeline does

| Step | Action |
|---|---|
| 1 | SSH into the production VM (`prod-vm-pool` agent) |
| 2 | `git pull origin main` — fetch latest code |
| 3 | `docker compose down` — stop containers (database volume preserved) |
| 4 | `docker compose up --build -d` — rebuild images and start all services |
| 5 | Wait up to 120 s for all containers to report healthy |
| 6 | Print container status + last 30 lines of backend logs |
| 7 | Fail the pipeline if any container exited unexpectedly |

### Why you see "errors" in the logs

Docker writes build progress (layer pulls, build steps) and `docker compose` output to **stderr**, not stdout. Azure DevOps shows stderr lines in red, making them look like errors even when everything succeeded. The pipeline uses `failOnStdErr: false` so these are cosmetic only. The pipeline only hard-fails if a container exits after startup.

### Pipeline requirements

| Requirement | Where to configure |
|---|---|
| Self-hosted agent named `prod-vm-pool` | Azure DevOps → Project Settings → Agent pools |
| SSH service connection named `prod-vm-ssh` | Azure DevOps → Project Settings → Service connections |
| Repo cloned at `/home/admin.sdixit@AD.PONET/amplify` on the VM | One-time manual setup on the VM |

---

## Demo Stack

A frozen, production-like demo stack runs separately via `docker-compose.demo.yml` using pre-built images (no live volume mounts).

| Service | Port | Notes |
|---|---|---|
| backlog-frontend | http://localhost:80 | Frozen build — no hot reload |
| demo-backend | http://localhost:8001 | Django API (also mapped to host port 8001) |

### Update the demo (rebuild images from current code)

```bash
./scripts/update-demo.sh
```

This snapshots the current `latest` images with a timestamp, rebuilds from source, and restarts the demo stack. The snapshot tag is printed so you can revert if needed.

### Revert the demo to a previous snapshot

```bash
./scripts/revert-demo.sh <timestamp>

# List available snapshots
./scripts/revert-demo.sh
```

> The demo database is preserved on revert — only the application images are swapped.

---

## Contributing — Branch Naming Convention

All branches must follow this naming structure:

```
feature/AB#42-short-description
fix/AB#67-notification-bug
chore/AB#80-update-requirements
hotfix/AB#91-prod-crash
docs/AB#55-api-readme
```

| Prefix | When to use |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `hotfix/` | Urgent fix for production |
| `chore/` | Dependency updates, config, no functional change |
| `docs/` | Documentation only |

The `AB#` number must match an existing Azure Boards work item.

```bash
git checkout main
git pull origin main
git checkout -b feature/AB#42-your-description
```

All PRs must target `main` and require approval before merging.

---

## Contributing — Commit Conventions

```
<type>(<scope>): <short description> AB#<work-item-id>
```

**Examples:**
```
feat(agents): add agent status cards AB#5
fix(notifications): mark-all-read returning 500 error AB#12
chore(deps): upgrade Django to 4.2.11 AB#18
docs(readme): add branch naming convention AB#3
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, deps, config |
| `docs` | Documentation only |
| `refactor` | Restructure with no behaviour change |
| `style` | CSS / formatting, no logic change |
| `test` | Adding or fixing tests |
| `hotfix` | Urgent production fix |

---

## Governance Framework

AI-assisted work in this repository follows a gated pipeline, not free-form generation:

```
BRD → [GATE 0: score ≥75] → Understand → Plan → [GATE 1] → Implement → Test → Review → [GATE 2] → Deploy → [GATE 3]
```

Every request starts at `/brd` — a scored requirements document — and every UI change requires `/uiux` inputs and approved brand assets before any markup is written. Full rules live in [`.github/copilot-instructions.md`](.github/copilot-instructions.md) (mirrored for agents.md-aware tools in [`AGENTS.md`](AGENTS.md)); the nine slash commands themselves are defined once in [`.github/prompts/`](.github/prompts/) and exposed to Claude Code via the thin wrappers in [`.claude/commands/`](.claude/commands/). Templates and worked examples live under [`docs/templates/`](docs/templates/), [`docs/brd/`](docs/brd/), [`docs/uiux/`](docs/uiux/), [`docs/discovery/`](docs/discovery/), [`docs/plans/`](docs/plans/) and [`docs/decisions/`](docs/decisions/).
