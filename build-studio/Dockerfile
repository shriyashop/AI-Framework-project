# Stage 1: compile the console (Node exists only in this build stage)
FROM node:22 AS console
WORKDIR /console
COPY console/package.json console/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY console/ ./
RUN pnpm build

# Stage 2: Python image used by both the API and the runner
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/* \
    && git config --system --add safe.directory '*'
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY api/ api/
COPY runner/ runner/
COPY templates/ templates/
COPY --from=console /console/dist console/dist
ENV PYTHONUNBUFFERED=1 WORKSPACES_DIR=/data/workspaces DB_PATH=/data/db/build_studio.db
