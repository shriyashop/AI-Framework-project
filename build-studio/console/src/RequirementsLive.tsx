import { useCallback, useEffect, useState } from 'react'
import {
  approve, createProject, getRequirement, listProjects, listRequirements, submitRequirement,
  Project, Refusal, Requirement,
} from './api'

const POLL_MS = 5000
const ACTIVE = ['queued', 'running']
const LABELS: Record<string, [string, string]> = {
  queued: ['Queued', 'info'], running: ['Running', 'info'],
  not_a_requirement: ['Not a requirement yet', 'bad'], draft_blocked: ['Draft, blocked', 'warn'],
  ready_open_questions: ['Ready with open questions', 'ok'], ready: ['Ready', 'ok'], approved: ['Approved at G0', 'ok'],
  parse_failed: ['Result not understood', 'bad'], score_mismatch: ['Score mismatch', 'bad'],
  governance_violation: ['Governance violation', 'bad'], timed_out: ['Timed out', 'bad'], failed: ['Failed', 'bad'],
}

function Pill({ status }: { status: string }) {
  const [label, tone] = LABELS[status] ?? [status, 'nt']
  return <span className={`pill ${tone}`}>{label}</span>
}

function download(name: string, content: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

function toMarkdown(r: Requirement): string {
  const x = r.result
  if (!x?.rows) return `# BRD-${r.id}\n\nNo scored result.\n`
  const rows = x.rows.map(w => `| ${w.number}${w.critical ? ' ★' : ''} | ${w.field} | ${w.score} | ${w.justification} |`)
  const gaps = (x.gaps ?? []).map((g, i) => `${i + 1}. ${g.question} → ${g.owner}`)
  return `# BRD-${r.id} — ${x.title}\n\nConfidence: ${r.confidence}/100 [${r.status}]\n\n| # | Field | Score | Justification |\n|---|---|---|---|\n${rows.join('\n')}\n\n## Gaps\n${gaps.join('\n')}\n`
}

function ScoreTable({ r }: { r: Requirement }) {
  const x = r.result
  if (!x?.rows || !x.computed) return null
  const c = x.computed
  return (
    <div className="panel mt">
      <h2>Confidence scoring <small>computed by Studio from the 18 rows below</small></h2>
      <div className="tw"><table>
        <thead><tr><th>#</th><th>Field</th><th>Score</th><th>Justification</th></tr></thead>
        <tbody>{x.rows.map(w => (
          <tr key={w.number}><td>{w.number}{w.critical ? ' ★' : ''}</td><td>{w.field}</td><td><b>{w.score}</b></td><td>{w.justification}</td></tr>
        ))}</tbody>
      </table></div>
      <p className="sm-t mt">
        Raw {c.raw} / 36 = {c.pct}% (rounded down). Cap: {c.cap === null ? 'none' : `${c.cap}${c.capped_fields.length ? ` — ${c.capped_fields.join(', ')}` : ' (does not bind)'}`}.
        {' '}<b>Final {c.final}/100.</b> Critical fields (★) cap the total.
      </p>
    </div>
  )
}

function Gaps({ r }: { r: Requirement }) {
  const gaps = r.result?.gaps ?? []
  if (!gaps.length) return null
  return (
    <div className="panel mt">
      <h2>{r.status === 'not_a_requirement' ? 'Questions to answer before this is a requirement' : 'Open questions'}</h2>
      {gaps.map((g, i) => <div className="ask" key={i}>{g.question}{g.owner && <b> — {g.owner}</b>}</div>)}
    </div>
  )
}

function GateZero({ r, actor, onDone }: { r: Requirement; actor: string; onDone: () => void }) {
  const [comment, setComment] = useState('')
  const [refusal, setRefusal] = useState<Refusal | null>(null)
  const [err, setErr] = useState('')
  async function go() {
    setErr(''); setRefusal(null)
    try {
      const res = await approve(r.id, actor, comment)
      if (!res.approved) setRefusal(res.refusal ?? null)
      onDone()
    } catch (e) { setErr((e as Error).message) }
  }
  return (
    <div className="panel">
      <h2>G0 Requirements sign-off <Pill status={r.status} /></h2>
      <p className="sm-t muted">The API refuses approval below 75. The refusal is enforced in the state machine, not the prompt.</p>
      <div className="field"><label htmlFor="g0c">Comment</label>
        <input className="inp" id="g0c" value={comment} onChange={e => setComment(e.target.value)} /></div>
      <button className="btn primary" onClick={go} disabled={r.status === 'approved'}>Approve as {actor}</button>
      {refusal && <div className="ask mt"><b>Refused.</b> {refusal.reason}</div>}
      {err && <div className="ask mt">{err}</div>}
      {r.gate_events.length > 0 && (
        <div className="tw mt"><table><thead><tr><th>When</th><th>Who</th><th>Decision</th></tr></thead>
          <tbody>{r.gate_events.map(e => <tr key={e.id}><td>{e.at.slice(0, 19)}</td><td>{e.actor}</td><td>{e.decision}</td></tr>)}</tbody>
        </table></div>
      )}
    </div>
  )
}

export default function RequirementsLive({ actor, onToast }: { actor: string; onToast: (m: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [current, setCurrent] = useState<Requirement | null>(null)
  const [history, setHistory] = useState<{ id: number; status: string; confidence: number | null; summary: string }[]>([])

  const refreshHistory = useCallback(async (pid: number) => setHistory(await listRequirements(pid)), [])
  const reload = useCallback(async (id: number) => {
    const r = await getRequirement(id)
    setCurrent(r)
    if (r.project_id) refreshHistory(r.project_id)
  }, [refreshHistory])

  useEffect(() => { listProjects().then(p => { setProjects(p); if (p.length) setProjectId(p[0].id) }) }, [])
  useEffect(() => { if (projectId) refreshHistory(projectId) }, [projectId, refreshHistory])
  useEffect(() => {
    if (!current || !ACTIVE.includes(current.status)) return
    const t = setInterval(() => reload(current.id), POLL_MS)
    return () => clearInterval(t)
  }, [current, reload])

  async function addProject() {
    try {
      const p = await createProject(newName)
      setProjects(prev => [...prev, p]); setProjectId(p.id); setNewName('')
    } catch (e) { onToast((e as Error).message) }
  }

  async function submit() {
    if (!projectId) return onToast('Create or pick a project first')
    setBusy(true)
    try { await reload(await submitRequirement(projectId, text)) }
    catch (e) { onToast((e as Error).message) }
    finally { setBusy(false) }
  }

  const active = current && ACTIVE.includes(current.status)
  const run = current?.runs[current.runs.length - 1]
  return (
    <section>
      <div className="vh">
        <div>
          <div className="crumb">Stage 1 of 9</div>
          <h1>Requirements</h1>
          <p>Describe a requirement. Studio runs /brd through Copilot and scores how completely it is specified. A vague request returns questions only, and no BRD is written.</p>
        </div>
        <div className="actions">
          <button className="btn" disabled={!current?.result?.rows} onClick={() => current && download(`BRD-${current.id}.md`, toMarkdown(current))}>Download .md</button>
        </div>
      </div>
      <div className="grid c2">
        <div className="panel">
          <h2>Project</h2>
          <div className="field"><label htmlFor="proj">Project</label>
            <select className="inp" id="proj" value={projectId ?? ''} onChange={e => setProjectId(Number(e.target.value))}>
              {projects.length === 0 && <option value="">No projects yet</option>}
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>)}
            </select></div>
          <div className="field"><label htmlFor="np">New project name</label>
            <input className="inp" id="np" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <button className="btn sm" disabled={!newName.trim()} onClick={addProject}>Create project</button>
          <h2 className="mt">What should the application do?</h2>
          <div className="field"><textarea className="inp" aria-label="Requirement" style={{ minHeight: 180 }} value={text} onChange={e => setText(e.target.value)} /></div>
          <button className="btn primary" disabled={busy || !text.trim() || !projectId || !!active} onClick={submit}>Generate BRD</button>
          <div className="note mt">Document upload and the Word export arrive in a later increment. Uploaded files are never written into the workspace.</div>
        </div>
        <div className="panel">
          <h2>Result {current && <Pill status={current.status} />}</h2>
          {!current && <p className="muted">Nothing run yet.</p>}
          {current && active && <p>Copilot is working on BRD-{current.id}. This takes minutes; this page keeps polling.{run?.provider_ref && <> <a href={run.provider_ref} target="_blank" rel="noreferrer">Open task</a></>}</p>}
          {current && !active && (
            <>
              {current.confidence !== null && <div className="m-row"><span>Confidence {current.capped_by && current.capped_by !== 'not capped' ? `(capped by ${current.capped_by})` : ''}</span><b>{current.confidence}/100</b>
                <div className="bar"><i className={current.confidence >= 75 ? 'ok' : 'warn'} style={{ width: `${current.confidence}%` }} /></div></div>}
              {current.status_reason && <div className="ask">{current.status_reason}</div>}
              {current.result?.lane && <p className="sm-t">Lane {current.result.lane} — {current.result.lane_reason}. Tier {current.result.tier} — {current.result.tier_reason}</p>}
              {current.status === 'not_a_requirement' && <p className="sm-t">Below 50: no BRD was written. Answer the questions and re-run.</p>}
              {current.result?.agent_claimed && <p className="sm-t">Agent claimed {current.result.agent_claimed.confidence}/100 [{current.result.agent_claimed.status}].</p>}
              {run && <p className="sm-t muted">Run {run.session_id} · {run.model ?? 'model unknown'} · workspace {run.workspace_sha.slice(0, 8)} · tokens/cost not reported by provider</p>}
            </>
          )}
        </div>
      </div>
      {current && !active && <><Gaps r={current} /><ScoreTable r={current} /></>}
      {current && !active && <div className="mt"><GateZero r={current} actor={actor} onDone={() => reload(current.id)} /></div>}
      {history.length > 0 && (
        <div className="panel mt"><h2>Previous requirements</h2>
          <div className="tw"><table><thead><tr><th>#</th><th>Summary</th><th>Status</th><th>Score</th><th /></tr></thead>
            <tbody>{history.map(h => (
              <tr key={h.id}><td>{h.id}</td><td>{h.summary}</td><td><Pill status={h.status} /></td><td>{h.confidence ?? '—'}</td>
                <td><button className="btn sm" onClick={() => reload(h.id)}>Open</button></td></tr>
            ))}</tbody></table></div>
        </div>
      )}
    </section>
  )
}
