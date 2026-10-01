# Compile the React console in a throwaway Node container. Node is never installed
# on the host and never runs at runtime; the Studio API serves console/dist as static files.
$ErrorActionPreference = "Stop"
$console = Join-Path (Split-Path $PSScriptRoot -Parent) "console"
docker run --rm -v "${console}:/app" -w /app node:22 sh -c "corepack enable && pnpm install && pnpm build"
if ($LASTEXITCODE -ne 0) { throw "console build failed" }
Write-Host "Built $console\dist"
