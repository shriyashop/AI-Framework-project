// Thin client for the Studio API. Same origin: FastAPI serves this console.

export interface Project { id: number; slug: string; name: string }

export interface ScoreRow { number: number; field: string; score: number; justification: string; critical: boolean }

export interface Computed { raw: number; pct: number; cap: number | null; capped_fields: string[]; final: number; status: string }

export interface BrdResult {
  title?: string; lane?: string; lane_reason?: string; tier?: string; tier_reason?: string; ac_signed?: boolean
  rows?: ScoreRow[]; computed?: Computed; gaps?: { question: string; owner: string }[]
  critical_zero?: string[]; critical_one?: string[]
  raw_excerpt?: string; agent_claimed?: { confidence: number; status: string; capped_by: string }; recomputed?: Computed
}

export interface AgentRun {
  id: number; session_id: string; provider_ref: string | null; pr_url: string | null; model: string | null
  workspace_sha: string; input_tokens: number | null; output_tokens: number | null; cost_cents: number | null
  exit_status: string | null; started_at: string; finished_at: string | null
}

export interface GateEvent { id: number; gate: string; actor: string; decision: string; rationale: string; at: string }

export interface Requirement {
  id: number; project_id: number; raw_text: string; status: string; status_reason: string | null
  confidence: number | null; capped_by: string | null; brd_path: string | null
  result: BrdResult | null; runs: AgentRun[]; gate_events: GateEvent[]
}

export interface Refusal { reason: string; confidence: number | null; capped_by: string | null }

async function call<T>(method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const r = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data: data as T }
}

function detail(d: unknown): string {
  const x = (d as { detail?: unknown })?.detail
  return typeof x === 'string' ? x : x ? JSON.stringify(x) : 'Request failed'
}

export async function listProjects(): Promise<Project[]> {
  return (await call<Project[]>('GET', '/projects')).data
}

export async function createProject(name: string): Promise<Project> {
  const r = await call<Project>('POST', '/projects', { name })
  if (!r.ok) throw new Error(detail(r.data))
  return r.data
}

export async function submitRequirement(projectId: number, text: string): Promise<number> {
  const r = await call<{ id: number }>('POST', '/requirements', { project_id: projectId, text })
  if (!r.ok) throw new Error(detail(r.data))
  return r.data.id
}

export async function getRequirement(id: number): Promise<Requirement> {
  return (await call<Requirement>('GET', `/requirements/${id}`)).data
}

export async function listRequirements(projectId: number) {
  return (await call<{ id: number; status: string; confidence: number | null; summary: string }[]>(
    'GET', `/requirements?project_id=${projectId}`)).data
}

export async function approve(id: number, actor: string, rationale: string): Promise<{ approved: boolean; refusal?: Refusal }> {
  const r = await call<Refusal>('POST', `/requirements/${id}/approve`, { actor, rationale })
  if (r.ok) return { approved: true }
  if (r.status === 409) return { approved: false, refusal: r.data }
  throw new Error(detail(r.data))
}
