import { useState, useCallback, useRef } from 'react';
import opLogo from './assets/opmobility-logo.png';
import RequirementsLive from './RequirementsLive';
import {
  ViewId, ROLES, TEMPLATES, TECH, FLOWS, MOCKS, INC, EPICS,
  CRS_INIT, PRS_INIT, FINDINGS_INIT, SCRIPTS_INIT, RESULTS,
  UAT_INIT, TESTERS, EXIT_INIT, ISSUES_INIT, GATES_INIT, AUDIT_INIT,
  CLAUDE_TALK, FILES, POLICIES_INIT, ROUTING, PROJECTS, ANOMALIES, RECS, Gate,
} from './data';

// ─── download helper ──────────────────────────────────────────────────────

function download(filename: string, content: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── helpers ───────────────────────────────────────────────────────────────

function pillFor(s: string) {
  const m: Record<string,string> = {
    Approved:'ok', Passed:'ok', Pass:'ok', Merged:'ok', signed:'ok', done:'ok', 'Signed off':'ok',
    Pending:'warn', 'Awaiting review':'warn', 'Needs review':'warn', review:'warn', 'In sign-off':'warn',
    Feedback:'vio', Failed:'bad', Rejected:'bad', 'Changes requested':'bad', changes:'bad',
    Draft:'nt', draft:'nt', 'Not run':'nt', 'Not started':'nt', Trial:'info', Contain:'warn',
    'Not permitted':'bad', prog:'info', todo:'nt', cr:'vio', open:'warn',
  };
  return m[s] || 'nt';
}

function Pill({ s }: { s: string }) {
  return <span className={`pill ${pillFor(s)}`}>{s}</span>;
}

// ─── Wireframe shapes ──────────────────────────────────────────────────────

function WfLogin() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h" style={{margin:'10px auto',width:'45%'}}/>
        <div className="l f"/>
        <div className="l f"/>
        <div className="l b" style={{width:'100%',justifySelf:'stretch'}}/>
        <div style={{display:'flex',gap:8,marginTop:4}}>
          <div className="l" style={{flex:1,height:10,background:'var(--brand-light2)'}}/>
          <div className="l" style={{flex:1,height:10,background:'var(--brand-light2)'}}/>
        </div>
      </div>
    </div>
  );
}
function WfRoles() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/>
        <div className="row2">{[1,2,3,4].map(k=><div key={k} className="l f" style={{height:22}}/>)}</div>
      </div>
    </div>
  );
}
function WfDash() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/>
        <div className="row3"><div className="l f" style={{height:24}}/><div className="l f" style={{height:24}}/><div className="l f" style={{height:24}}/></div>
        <div className="l"/><div className="l w7"/>
      </div>
    </div>
  );
}
function WfList() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="side">
          <div className="nv"/>
          <div style={{display:'grid',gap:5}}>
            <div className="l h"/>
            <div className="l f"/>
            {[1,2,3].map(k=><div key={k} className="l"/>)}
          </div>
        </div>
      </div>
    </div>
  );
}
function WfForm() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/><div className="l f"/><div className="l f"/><div className="l f"/>
        <div className="l b"/>
      </div>
    </div>
  );
}
function WfRecord() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/><div className="row2"><div className="l"/><div className="l"/></div>
        <div className="chipl"><i/><i/><i/></div>
        <div className="l"/><div className="l w5"/>
      </div>
    </div>
  );
}
function WfQueue() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="side">
          <div className="nv"/>
          <div style={{display:'grid',gap:5}}>
            <div className="l h"/>
            {[1,2,3].map(k=><div key={k} className="row3"><div className="l"/><div className="l f"/><div className="l" style={{background:'var(--warn-bg)'}} /></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
function WfApproval() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/><div className="l w7"/><div className="l w5"/>
        <div className="row2"><div className="l r" style={{width:'100%'}}/><div className="l g" style={{width:'100%'}}/></div>
      </div>
    </div>
  );
}
function WfImport() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/>
        <div className="l f" style={{height:30,borderStyle:'dashed'}}/>
        <div className="row3"><div className="l"/><div className="l"/><div className="l"/></div>
        <div className="l b"/>
      </div>
    </div>
  );
}
function WfMerge() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="l h"/>
        <div className="row2">{[1,2].map(k=><div key={k} style={{display:'grid',gap:4}}><div className="l"/><div className="l f"/><div className="l"/></div>)}</div>
        <div className="l b"/>
      </div>
    </div>
  );
}
function WfMobile() {
  return (
    <div className="wfbox"><div className="tb"><i/><i/><i/></div>
      <div className="wfin">
        <div className="phone">
          <div className="l h" style={{width:'100%'}}/>
          <div className="l f"/>
          <div className="l"/>
          <div className="l w5"/>
        </div>
      </div>
    </div>
  );
}

const WF_MAP: Record<string, React.FC> = {
  login: WfLogin, roles: WfRoles, dash: WfDash, list: WfList, form: WfForm,
  record: WfRecord, queue: WfQueue, approval: WfApproval, import: WfImport,
  merge: WfMerge, mobile: WfMobile,
};

// ─── Gate component ────────────────────────────────────────────────────────

function GateComp({
  id, gate, role, findings, checks, exit,
  onApprove, onReturn, onResubmit,
  inbox = false,
  onGo,
}: {
  id: string;
  gate: Gate;
  role: string;
  findings: typeof FINDINGS_INIT;
  checks: Record<string,boolean>;
  exit: typeof EXIT_INIT;
  onApprove: (id: string, comment: string) => void;
  onReturn: (id: string, comment: string) => void;
  onResubmit: (id: string) => void;
  inbox?: boolean;
  onGo?: (view: ViewId) => void;
}) {
  const [comment, setComment] = useState('');

  const gateStatus = (g: Gate) => {
    if (g.steps.some(s => s[2] === 'rej')) return 'returned';
    if (g.steps.every(s => s[2] === 'done')) return 'approved';
    return 'pending';
  };

  const needsMet = (g: Gate) => {
    if (!g.needs) return true;
    if (g.needs === 'uatexit') return exit.every(x => x.met);
    if (g.needs === 'g8done') return gateStatus(GATES_INIT.G8) === 'approved';
    if (g.needs === 'g5' && findings.some(f => f.st === 'open')) return false;
    const relevant = Object.entries(checks).filter(([k]) => k.startsWith(g.needs!));
    return relevant.length > 0 && relevant.every(([, v]) => v);
  };

  const st = gateStatus(gate);
  const cur = gate.steps.find(s => s[2] === 'pending');
  const ok = needsMet(gate);

  const pillEl = st === 'approved'
    ? <span className="pill ok">Approved</span>
    : st === 'returned'
    ? <span className="pill bad">Returned</span>
    : <span className="pill warn">Waiting for {cur ? (ROLES[cur[0]]?.label || 'Claude') : ''}</span>;

  return (
    <div className={`gate ${st === 'approved' ? 'approved' : ''}`}>
      <div className="gate-h">
        <span className="dia"/>
        <strong>{gate.title}</strong>
        <span className="sm-t muted">{gate.sub}</span>
        {pillEl}
        {inbox && onGo && <button className="btn sm" onClick={() => onGo(gate.stage as ViewId)}>Open stage</button>}
      </div>
      <div className="gate-b">
        <div className="chain">
          {gate.steps.map((s, i) => {
            const who = s[0] === 'ai' ? 'Claude' : (ROLES[s[0]]?.who || s[0]);
            const roleLabel = s[0] === 'ai' ? 'AI agent' : (ROLES[s[0]]?.label || s[0]);
            return (
              <div key={i} className={`step ${s[2] === 'done' ? 'done' : s[2] === 'pending' ? 'pending' : s[2] === 'rej' ? 'rej' : ''}`}>
                <b>{s[1]}</b>
                <span className="who">{who}, {roleLabel}</span>
                <div className="st">
                  {s[2] === 'done' && <span className="pill ok">Done {s[3] || ''}</span>}
                  {s[2] === 'pending' && <span className="pill warn">Now</span>}
                  {s[2] === 'rej' && <span className="pill bad">Returned</span>}
                  {s[2] === 'wait' && <span className="pill nt">Next</span>}
                </div>
              </div>
            );
          })}
        </div>
        {st === 'pending' && cur && (
          <>
            <div className="gate-f">
              <input
                className="inp"
                placeholder="Comment (required when returning)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={cur[0] !== role || !ok}
              />
              <button className="btn" disabled={cur[0] !== role} onClick={() => { onReturn(id, comment); setComment(''); }}>Return</button>
              <button className="btn good" disabled={cur[0] !== role || !ok} onClick={() => { onApprove(id, comment); setComment(''); }}>Approve</button>
            </div>
            <div className="role-hint">
              {cur[0] !== role
                ? `Waiting for ${ROLES[cur[0]]?.who || cur[0]} (${ROLES[cur[0]]?.label || cur[0]}). Switch "Viewing as" to act.`
                : !ok
                ? 'Complete the checklist on this page first.'
                : 'Your decision is recorded with your name and time.'}
            </div>
          </>
        )}
        {st === 'returned' && (
          <div className="gate-f">
            <button className="btn" onClick={() => onResubmit(id)}>Rework done, resubmit</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tabs helper ──────────────────────────────────────────────────────────

function Tabs({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect: (t: string) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(t => (
        <button key={t} className={`tab ${active === t ? 'active' : ''}`} role="tab" onClick={() => onSelect(t)}>{t}</button>
      ))}
    </div>
  );
}

// ─── Filter chips ─────────────────────────────────────────────────────────

function FilterChips({ options, active, onSelect }: { options: string[]; active: string; onSelect: (o: string) => void }) {
  return (
    <div className="filter">
      {options.map(o => (
        <button key={o} className={`fchip ${active === o ? 'active' : ''}`} onClick={() => onSelect(o)}>{o}</button>
      ))}
    </div>
  );
}

// ─── View: Design ─────────────────────────────────────────────────────────

function DesignView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, onToast }: GateProps & { onToast: (msg: string) => void }) {
  const [tab, setTab] = useState('Mockups');
  const [selectedMock, setSelectedMock] = useState(MOCKS[0]);
  const [flowId, setFlowId] = useState('APR-01');
  const incFilters = ['All', '1', '2', '3', '4', '5'];
  const [incFilter, setIncFilter] = useState('All');
  const [selectedStack, setSelectedStack] = useState<string[]>(['React + TypeScript', 'Microsoft Dataverse', 'Boomi iPaaS', 'Microsoft Entra ID', 'Playwright + Vitest', 'Power Automate']);
  const filtered = MOCKS.filter(m => incFilter === 'All' || String(m.inc) === incFilter);
  const flow = FLOWS[flowId];

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 2 of 9</div><h1>Design</h1>
          <p>Developers document mockups, approval flows and the solution design here. Business users review mockups in a 30-minute daily business review and sign off in the platform.</p></div>
        <div className="actions">
          <button className="btn" onClick={() => onToast('Design document shared with business users for review')}>Share with business users</button>
          <button className="btn primary">Download design document (Word)</button>
        </div>
      </div>
      <Tabs tabs={['Mockups','Approval flows','Design document','Technology stack']} active={tab} onSelect={setTab}/>
      {tab === 'Mockups' && (
        <div className="grid c12">
          <div style={{alignContent:'start'}}>
            <FilterChips options={incFilters.map(f => f === 'All' ? 'All' : `Increment ${f}`)} active={incFilter === 'All' ? 'All' : `Increment ${incFilter}`} onSelect={v => setIncFilter(v === 'All' ? 'All' : v.replace('Increment ',''))}/>
            <div className="gallery">
              {filtered.map(m => {
                const Wf = WF_MAP[m.wf] || WfDash;
                return (
                  <button key={m.id} className={`mcard ${selectedMock.id === m.id ? 'selected' : ''}`} onClick={() => setSelectedMock(m)}>
                    <div className="wfbox" style={{border:0,borderBottom:'1px solid var(--line)',borderRadius:0}}><Wf/></div>
                    <div className="cap"><b>{m.id}: {m.name}</b><span>{m.ver} · <Pill s={m.st}/></span></div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid" style={{alignContent:'start'}}>
            <div className="panel">
              <h2>{selectedMock.id}: {selectedMock.name} <Pill s={selectedMock.st}/></h2>
              <dl className="kv"><dt>Requirement</dt><dd>{selectedMock.req}</dd><dt>Increment</dt><dd>{INC[selectedMock.inc]}</dd><dt>Version</dt><dd>{selectedMock.ver}</dd></dl>
              <div style={{position:'relative',marginTop:12}}>
                {React.createElement(WF_MAP[selectedMock.wf] || WfDash)}
                {selectedMock.pins?.map(([x,y,n]) => (
                  <div key={String(n)} className="pin" style={{left:`${x}%`,top:`${y}%`}}>{n}</div>
                ))}
              </div>
              {selectedMock.comments?.length > 0 && (
                <div className="mt">
                  {selectedMock.comments.map(([who, text, res], i) => (
                    <div key={i} className="comment">
                      <span className="pn">{who.split(',')[0].split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</span>
                      <div><b>{who}</b><br/>{text}<br/><span className="muted sm-t">{res}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <GateComp id="G2" gate={gates.G2} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
          </div>
        </div>
      )}
      {tab === 'Approval flows' && (
        <div className="panel">
          <h2>ContactHUB approval flows <small>Designed from requirements APR-01 to APR-05</small></h2>
          <FilterChips options={Object.keys(FLOWS)} active={flowId} onSelect={setFlowId}/>
          <p className="sm-t muted">{flow.name}</p>
          <div className="flow">
            {flow.nodes.map(([cls, label, desc], i) => (
              <div key={i} className={`fnode ${cls}`}><b>{label}</b>{desc}</div>
            ))}
          </div>
          <div className="tw mt8"><table><thead><tr><th>Rule</th><th>Detail</th></tr></thead><tbody>
            {flow.rules.map(([k, v], i) => <tr key={i}><td><b>{k}</b></td><td>{v}</td></tr>)}
          </tbody></table></div>
          <div className="legend mt8">
            <span><i style={{background:'var(--violet-bg)',border:'1px solid var(--violet)'}}/>Human decision</span>
            <span><i style={{background:'var(--brand-light)',border:'1px solid var(--brand2)'}}/>System step</span>
            <span><i style={{background:'var(--good-bg)',border:'1px solid var(--good)'}}/>Outcome</span>
            <span><i style={{background:'var(--bad-bg)',border:'1px solid var(--bad)'}}/>Blocked or rejected</span>
          </div>
        </div>
      )}
      {tab === 'Design document' && (
        <div className="grid c21">
          <div className="doc">
            <div className="dh"><b>ContactHUB — Solution Design Document</b><span>v1.1</span></div>
            <h3>1. Architecture overview</h3>
            <p>React 19 + TypeScript Power Apps code app, Dataverse tables, Power Automate for notifications, Boomi for ERP/SAP integration, Entra ID for identity.</p>
            <h3>2. Data model</h3>
            <p>Contact, ContactRelationship, ConfidentialityAuditLog, ApprovalRequest, ApprovalStep, DelegationRule.</p>
            <h3>3. Security design</h3>
            <p>Field-level security enforced server-side. Every view of a Highly Restricted record written to audit log. Role matrix in Annex A defines column visibility per role.</p>
            <h3>4. Architecture decisions</h3>
            <p>ADR-001: Power Apps code app over canvas (maintainability). ADR-002: Custom approval engine over Power Automate connector (audit + delegation). ADR-003: Boomi for all ERP integration. ADR-004: Dataverse over Azure SQL (platform coherence).</p>
          </div>
          <div className="grid" style={{alignContent:'start'}}>
            <GateComp id="G2b" gate={gates.G2b} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
            <div className="panel"><h2>Built from</h2>
              <ul className="tight sm-t"><li>Template: <b>Solution Design Document v3.0</b></li><li>DRD v1.2 (signed off)</li><li>Mockups M01–M11</li><li>Technology stack (permitted)</li><li>ADR-001 to ADR-004</li></ul>
            </div>
          </div>
        </div>
      )}
      {tab === 'Technology stack' && (
        <div className="panel">
          <h2>Technology stack for ContactHUB <small>Only permitted technologies can be selected</small></h2>
          <div className="stackpick">
            {[{cat:'Front end',name:'React + TypeScript',note:'Power Apps code app'},
              {cat:'Data',name:'Microsoft Dataverse',note:'Default for Power Platform'},
              {cat:'Integration',name:'Boomi iPaaS',note:'All system-to-system'},
              {cat:'Identity',name:'Microsoft Entra ID',note:'Mandatory SSO'},
              {cat:'Testing',name:'Playwright + Vitest',note:'E2E and unit tests'},
              {cat:'Workflow',name:'Power Automate',note:'Notifications only'}].map(t => {
              const isSel = selectedStack.includes(t.name);
              return (
              <div key={t.name} className="panel" style={{border:`2px solid ${isSel ? 'var(--brand)' : 'var(--line)'}`,background:isSel ? 'var(--brand-light)' : 'var(--surface)',cursor:'pointer'}} onClick={() => setSelectedStack(prev => isSel ? prev.filter(n => n !== t.name) : [...prev, t.name])}>
                <div style={{fontSize:11,color:'var(--muted)',fontWeight:600,marginBottom:2}}>{t.cat}</div>
                <b style={{fontSize:13.5}}>{t.name}</b>
                <div style={{fontSize:12,color:'var(--muted)'}}>{t.note}</div>
                {isSel && <div className="lock" style={{marginTop:4}}>✓ Selected</div>}
              </div>
              );
            })}
          </div>
          <div className="note mt">The chosen stack is written into CLAUDE.md. Claude will refuse to add libraries outside it, and the build pipeline blocks any package not on the permitted list.</div>
        </div>
      )}
    </section>
  );
}

// ─── View: Plan ───────────────────────────────────────────────────────────

function PlanView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, crs, onToast }: GateProps & { crs: typeof CRS_INIT; onToast: (msg: string) => void }) {
  const [tab, setTab] = useState('Delivery timeline');
  const [showCrForm, setShowCrForm] = useState(false);
  const [crTitle, setCrTitle] = useState('');
  const [crSeverity, setCrSeverity] = useState('Medium');
  const DAYS = ['14 Sep','15 Sep','16 Sep','17 Sep','18 Sep','21 Sep','22 Sep','23 Sep','24 Sep','25 Sep','26 Sep','29 Sep','30 Sep','1 Oct','3 Oct'];
  const rows = [
    { lab:'Requirements',  cells:[1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0], type:'done' },
    { lab:'Design',        cells:[0,1,1,1,1, 1,0,0,0,0, 0,0,0,0,0], type:'done' },
    { lab:'G1–G2 sign-off',cells:[0,0,1,0,0, 1,0,0,0,0, 0,0,0,0,0], type:'hum'  },
    { lab:'Code (blocks)', cells:[0,0,0,1,1, 1,1,1,1,1, 1,1,0,0,0], type:'now'  },
    { lab:'Review (PRs)',  cells:[0,0,0,0,1, 1,1,1,1,1, 1,1,0,0,0], type:'fut'  },
    { lab:'Test',          cells:[0,0,0,0,0, 0,1,1,1,1, 1,1,0,0,0], type:'fut'  },
    { lab:'UAT',           cells:[0,0,0,0,0, 0,0,0,0,0, 0,1,1,0,0], type:'hum'  },
    { lab:'Go-live',       cells:[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1], type:'gl'   },
  ];

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 3 of 9</div><h1>Plan</h1>
          <p>No sprints. Features are split into small blocks that flow continuously. Small blocks are the main defence against unmaintainable AI code. Changes go through impact analysis and approval.</p></div>
        <div className="actions">
          <button className="btn" onClick={() => setShowCrForm(s => !s)}>Raise change request</button>
          <button className="btn primary" onClick={() => download('contacthub-plan.md', '# ContactHUB — Delivery Plan\n\nVersion: 1.3\n\n## Timeline\n\n15 working days from prompt to production.\n\n## Increments\n\nIncrement 1: Sign-in, roles, confidentiality\nIncrement 2: Directory, create contact, record\nIncrement 3: Update validation and approval flows\n')}>Download plan (Word)</button>
        </div>
        {showCrForm && (
          <div className="panel mt" style={{maxWidth:480}}>
            <h2>Raise a change request</h2>
            <div className="field"><label>Title</label><input className="inp" value={crTitle} onChange={e => setCrTitle(e.target.value)} placeholder="Describe the change"/></div>
            <div className="field"><label>Severity</label>
              <select className="inp" value={crSeverity} onChange={e => setCrSeverity(e.target.value)}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <button className="btn primary" onClick={() => { onToast('Change request raised'); setShowCrForm(false); setCrTitle(''); setCrSeverity('Medium'); }}>Submit</button>
              <button className="btn" onClick={() => setShowCrForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <Tabs tabs={['Delivery timeline','Features and blocks','Change requests','Plan versions']} active={tab} onSelect={setTab}/>

      {tab === 'Delivery timeline' && (
        <>
          <div className="panel">
            <h2>ContactHUB: 15 working days from prompt to production <small>Started Mon 14 Sep, today is day 10</small></h2>
            <div className="tw">
              <div className="tl">
                <div/>
                {DAYS.map((d,i) => <div key={i} className={`hd ${i===9?'today':''}`}><b>{d.split(' ')[0]}</b>{d.split(' ')[1]}</div>)}
                {rows.map((r,ri) => (
                  <React.Fragment key={ri}>
                    <div className="lab">{r.lab}</div>
                    {r.cells.map((on,ci) => (
                      r.type === 'gl' && on
                        ? <div key={ci} className="gl">Go-live</div>
                        : <div key={ci} className={`cell ${on ? 'on ' + (ci < 9 ? (r.type === 'hum' ? 'hum done' : 'done') : r.type === 'now' && ci === 9 ? 'now' : r.type === 'fut' || ci > 9 ? 'fut' : 'on') : ''}`}/>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="legend mt8">
              <span><i style={{background:'var(--good)'}}/>Done</span>
              <span><i style={{background:'var(--brand2)'}}/>Claude building, with human review</span>
              <span><i style={{background:'var(--violet)'}}/>People: sign-off, UAT, CAB</span>
              <span><i style={{background:'var(--navy)'}}/>Go-live</span>
            </div>
          </div>
          <div className="grid c2 mt">
            <div className="panel">
              <h2>Where the 15 days go <small>Claude working time vs people's time</small></h2>
              {[['Claude: all 38 blocks',73,'ai'],['Requirements sign-off',5,'hu'],['Design sign-off',8,'hu'],['Code review (every block)',55,'hu'],['UAT (days 13–14)',12,'hu'],['CAB and go-live',5,'hu']].map(([lab,pct,cls],i) => (
                <div key={i} className="tbar">
                  <span>{lab}</span>
                  <div className="track"><i className={cls as string} style={{width:`${pct}%`}}/></div>
                </div>
              ))}
              <div className="note mt">Claude's build time for all 38 blocks is about 20 hours. The elapsed time is set by people reviewing every block, signing off, testing and approving the release.</div>
            </div>
            <div className="grid" style={{alignContent:'start'}}>
              <div className="panel">
                <h2>Compared with a traditional build <small>Illustrative, similar scope</small></h2>
                <div className="bigcmp">
                  <span>Traditional (waterfall or 2-week sprints)</span><div className="bb" style={{background:'var(--muted)',width:'100%'}}>4 to 6 months</div>
                  <span>AI coding without guardrails</span><div className="bb" style={{background:'var(--warn)',width:'12%'}}>Days</div>
                  <span/><span className="sm-t muted">Fast, but the code is hard to maintain</span>
                  <span>Build Studio, AI-native</span><div className="bb" style={{background:'var(--brand)',width:'17%'}}>3 weeks</div>
                  <span/><span className="sm-t muted">Fast and maintainable, with human sign-off at every gate</span>
                </div>
              </div>
              <div className="panel"><h2>What could stretch it</h2>
                <ul className="tight sm-t">
                  <li>Slow decisions: an unsigned gate stops the line</li>
                  <li>Other teams' calendars: SAP changes via Boomi, DPIA, CAB slots</li>
                  <li>Unclear requirements that surface late in UAT</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="panel mt">
            <h2>Agile, without sprints</h2>
            <div className="keepdrop">
              <div className="k"><b>Keep from agile</b><ul className="tight"><li>Small increments of working software</li><li>Business feedback every day, not every two weeks</li><li>Change welcome at any time, with impact shown in minutes</li></ul></div>
              <div className="d"><b>Drop</b><ul className="tight"><li>Two-week sprint cadence and sprint planning</li><li>Story-point estimation and velocity tracking</li><li>End-of-sprint demos (replaced by a 30-minute daily business review)</li></ul></div>
            </div>
            <div className="note mt">The new bottleneck is human review, not coding. Build Studio limits each developer to two blocks waiting for review, so Claude never builds faster than people can check.</div>
          </div>
        </>
      )}

      {tab === 'Features and blocks' && (
        <>
          <div className="grid c2">
            <div className="panel"><h2>Small-block rules <small>Enforced by CLAUDE.md and the pipeline</small></h2>
              <ul className="tight sm-t">
                <li><b>One responsibility</b> per block, named in plain language</li>
                <li><b>At most 300 changed lines</b> and 8 files</li>
                <li><b>Own tests</b> written and passing before review</li>
                <li><b>Own pull request</b>, reviewed by a human within one working day</li>
                <li><b>Behind a feature flag</b>, so it can ship or roll back alone</li>
                <li><b>Traceable</b> to a requirement ID and a mockup</li>
              </ul>
            </div>
            <div className="panel"><h2>Plan health</h2><div className="meter">
              <div className="m-row"><span>Blocks planned</span><b>41</b></div>
              <div className="m-row"><span>Average block size</span><b>142 lines</b><div className="bar"><i className="ok" style={{width:'47%'}}/></div></div>
              <div className="m-row"><span>Largest block (B3.1.2)</span><b>220 of 300</b><div className="bar"><i className="warn" style={{width:'73%'}}/></div></div>
              <div className="m-row"><span>Blocks done</span><b>19 of 41</b><div className="bar"><i style={{width:'46%'}}/></div></div>
            </div></div>
          </div>
          <div className="mt">
            {EPICS.map(e => (
              <details key={e.id} className="epic">
                <summary><span className="eid">{e.id}</span><span className="et">{e.name}<small>Increment {e.inc} · {INC[e.inc]}</small></span><Pill s="done"/></summary>
                {e.feats.map(f => (
                  <div key={f.id} className="feat">
                    <div className="feat-h"><b>{f.id}: {f.name}</b><Pill s="done"/></div>
                    <div className="feat-meta">
                      <div><span>Requirement</span>{f.req}</div>
                      <div><span>Mockup</span>{f.mock}</div>
                      <div><span>Depends on</span>{f.dep}</div>
                    </div>
                    <div className="tw"><table className="blk"><thead><tr><th>Block</th><th>Name</th><th>Size</th><th>Tests</th><th>Status</th></tr></thead><tbody>
                      {(f.blocks as [string,string,number,number,string][]).map(([bid,bname,lines,tests,bst]) => (
                        <tr key={bid}>
                          <td>{bid}</td>
                          <td>{bname}</td>
                          <td><span className="sizebar"><i className={lines>200?'hi':''} style={{width:`${lines/300*100}%`}}/></span>{lines} lines</td>
                          <td>{tests}</td>
                          <td><Pill s={bst}/></td>
                        </tr>
                      ))}
                    </tbody></table></div>
                  </div>
                ))}
              </details>
            ))}
          </div>
        </>
      )}

      {tab === 'Change requests' && (
        <div className="grid c21">
          <div className="panel">
            <h2>How the plan changes at run time</h2>
            <div className="proc">
              <div><b>Raise</b>Anyone raises a change request</div>
              <div><b>Impact analysis</b>Claude lists affected requirements, blocks, tests, dates</div>
              <div className="h"><b>Route</b>Scope to PO, architecture to Architect, go-live change to Steering</div>
              <div className="h"><b>Approve</b>Approver decides with the impact in front of them</div>
              <div><b>Re-baseline</b>plan.md and spec.md versioned, blocks re-queued</div>
            </div>
            <div className="tw mt">
              <table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Impact</th><th>Route</th><th>Status</th></tr></thead><tbody>
                {crs.map(cr => (<tr key={cr.id}><td><code>{cr.id}</code></td><td>{cr.title}</td><td>{cr.type}</td><td className="sm-t">{cr.impact}</td><td>{cr.route}</td><td><Pill s={cr.st}/></td></tr>))}
              </tbody></table>
            </div>
          </div>
          <GateComp id="G3" gate={gates.G3} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
        </div>
      )}

      {tab === 'Plan versions' && (
        <div className="panel"><h2>Plan versions <small>Every version is kept; compare any two</small></h2>
          <div className="tw"><table><thead><tr><th>Version</th><th>Date</th><th>Reason</th><th>Blocks</th><th>Go-live</th><th>Approved by</th></tr></thead><tbody>
            <tr><td>1.0 baseline</td><td>Wed 16 Sep</td><td>Initial plan from DRD v1.1</td><td>33</td><td>Sat 3 Oct</td><td>Product Owner, Tech Lead</td></tr>
            <tr><td>1.1</td><td>Fri 18 Sep</td><td>CR-01: French labels in approval emails</td><td>34</td><td>Sat 3 Oct</td><td>Product Owner</td></tr>
            <tr><td>1.2</td><td>Mon 21 Sep</td><td>CR-02: EA approves on behalf of CEO</td><td>36</td><td>Sat 3 Oct</td><td>Product Owner, Architect</td></tr>
            <tr className="sel"><td>1.3 draft</td><td>Fri 25 Sep</td><td>CR-03: Czech language</td><td>38</td><td>Sat 3 Oct</td><td><Pill s="Pending"/></td></tr>
          </tbody></table></div>
        </div>
      )}
    </section>
  );
}

// ─── View: Code ───────────────────────────────────────────────────────────

function CodeView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, onCheck, onToast }: GateProps & { onCheck: (g: string, k: string, v: boolean) => void; onToast: (msg: string) => void }) {
  const [paused, setPaused] = useState(false);
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 4 of 9</div><h1>Code</h1>
          <p>Claude builds one block at a time from plan.md, inside the rules in CLAUDE.md, then stops. The developer checks the block before it can go to review.</p></div>
        <div className="actions">
          <button className="btn" onClick={() => { onToast(paused ? 'Claude resumed' : 'Claude paused'); setPaused(p => !p); }}>{paused ? 'Resume Claude' : 'Pause Claude'}</button>
          <button className="btn" onClick={() => window.open('https://claude.ai/code', '_blank')}>Open in Claude Code</button>
        </div>
      </div>
      <div className="grid c21">
        <div className="grid" style={{alignContent:'start'}}>
          <div className="panel">
            <h2>Block B3.2.2: approver inbox and decision <span className="pill info">In progress</span></h2>
            <dl className="kv"><dt>Feature</dt><dd>F3.2 Highly Restricted contact approval</dd><dt>Requirement</dt><dd>APR-01, acceptance criteria AC-3 to AC-5</dd><dt>Mockup</dt><dd>M08 Highly Restricted approval (v2)</dd><dt>Developer</dt><dd>R. Iyer</dd></dl>
            <div className="mt8 sm-t muted">Claude loaded this context before writing any code:</div>
            <div className="ctx mt8">
              {['intent.md','spec.md#APR-01','plan.md#B3.2.2','CLAUDE.md','tasks/B3.2.2.md','ADR-002','mockups/M08.png'].map(f => <span key={f}>{f}</span>)}
            </div>
          </div>
          <div className="panel">
            <h2>What Claude did <small>Plain-language log</small></h2>
            <ul className="log">
              {[['09:40','Read the task card and acceptance criteria AC-3 to AC-5'],['09:44','Wrote 9 tests first: approve, reject with reason, EA on behalf of CEO, no self-approval'],['09:58','Built the approver inbox list using the existing Dataverse table, no new libraries'],['10:11','Added Approve and Reject with a mandatory comment, bilingual labels EN/FR'],['10:15','Ran block tests: 9 of 9 passing. Ran full suite: 212 of 212 passing'],['10:16','Stopped. Waiting for developer confirmation']].map(([t,s],i) => (
                <li key={i}><time>{t}</time><span>{s}</span></li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h2>Change preview <small>5 files, +164 −12</small></h2>
            <pre className="code">
              <span className="c">{'// src/approvals/ApproverInbox.tsx  (feature flag: hr-approval-v1)'}</span>
              <span className="d">{'- const items = await getRequests()'}</span>
              <span className="a">{'+ const items = await approvals.pendingFor(user, { level: "HighlyRestricted" })'}</span>
              <span className="a">{'+ if (item.requestedBy === user.id) return block("self-approval")   // AC-4'}</span>
              <span className="a">{'+ const actingFor = delegation.resolve(user)                          // CR-02'}</span>
              <span className="a">{'+ await approvals.decide(item, decision, { comment, actingFor })     // AC-5'}</span>
            </pre>
          </div>
        </div>
        <div className="grid" style={{alignContent:'start'}}>
          <div className="panel">
            <h2>AI spend — this block</h2>
            <div className="meter">
              <div className="m-row"><span>Tokens used</span><b>4.2 M</b></div>
              <div className="m-row"><span>Estimated</span><b>3.8 M</b><div className="bar"><i className="warn" style={{width:'110%'}}/></div></div>
              <div className="m-row"><span>Cost (Sonnet)</span><b>€ 0.31</b></div>
            </div>
          </div>
          <div className="panel">
            <h2>Guardrails <small>Live</small></h2>
            <div className="meter">
              <div className="m-row"><span>Changed lines</span><b>164 / 300</b><div className="bar"><i className="ok" style={{width:'55%'}}/></div></div>
              <div className="m-row"><span>Files touched</span><b>5 / 8</b><div className="bar"><i className="ok" style={{width:'62%'}}/></div></div>
              <div className="m-row"><span>Max function complexity</span><b>6 / 10</b><div className="bar"><i className="ok" style={{width:'60%'}}/></div></div>
              <div className="m-row"><span>Permitted technologies only</span><Pill s="Approved"/></div>
              <div className="m-row"><span>Stays within block scope</span><Pill s="Approved"/></div>
            </div>
          </div>
          <div className="panel">
            <h2>Developer checkpoint</h2>
            {[['g4-1','I ran the block in the Development environment'],['g4-2','It matches mockup M08 and acceptance criteria'],['g4-3','I understand every change and can maintain it']].map(([k,label]) => (
              <label key={k} className="chk">
                <input type="checkbox" checked={!!checks[k]} onChange={e => onCheck('g4', k, e.target.checked)}/>{label}
              </label>
            ))}
          </div>
          <GateComp id="G4" gate={gates.G4} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
        </div>
      </div>
    </section>
  );
}

// ─── View: Review ─────────────────────────────────────────────────────────

function ReviewView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, prs, onCheck, onFinding }: GateProps & { prs: typeof PRS_INIT; onCheck: (g: string, k: string, v: boolean) => void; onFinding: (id: number, st: string) => void }) {
  const [selPr, setSelPr] = useState(prs[1]);

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 5 of 9</div><h1>Review</h1>
          <p>Every block gets three layers of review: Claude's automated review, a human peer review, and an architect review when security or data design is touched. Nothing merges without a named human approval.</p></div>
        <div className="actions"><button className="btn" onClick={() => window.open('https://github.com/opmobility/contacthub/pulls', '_blank')}>Open on GitHub</button></div>
      </div>
      <div className="panel">
        <h2>Pull requests <small>One block per pull request</small></h2>
        <div className="tw"><table><thead><tr><th>PR</th><th>Block</th><th>Description</th><th>Lines</th><th>Claude review</th><th>Human review</th><th>Status</th></tr></thead><tbody>
          {prs.map(p => (
            <tr key={p.n} className="click" onClick={() => setSelPr(p)}>
              <td>#{p.n}</td><td><code>{p.b}</code></td><td>{p.t}</td><td>{p.lines}</td>
              <td>{p.ai}</td><td>{p.hu}</td><td><Pill s={p.st}/></td>
            </tr>
          ))}
        </tbody></table></div>
      </div>
      <div className="grid c21 mt">
        <div className="grid" style={{alignContent:'start'}}>
          <div className="panel">
            <h2>PR #{selPr.n}</h2>
            <ol className="rtl">
              <li><div className="dot ai">C</div><div><b>Claude wrote tests first</b><span>9 tests from acceptance criteria AC-3 to AC-5</span></div></li>
              <li><div className="dot ai">C</div><div><b>Claude built the block</b><span>164 lines, 5 files, all tests passing</span></div></li>
              <li><div className="dot ai">C</div><div><b>Claude reviewed the PR</b><span>3 findings (1 security, 1 maintainability, 1 info)</span></div></li>
              <li><div className="dot hu">AK</div><div><b>Peer review in progress</b><span>A. Kulkarni, Tech Lead — awaiting</span></div></li>
            </ol>
          </div>
          <div className="panel">
            <h2>Claude's findings <small>Accept, reject or discuss each one</small></h2>
            {findings.map(f => (
              <div key={f.id} className="finding">
                <Pill s={f.sev}/>
                <div>
                  <h4>{f.t}</h4>
                  <p>{f.d}</p>
                  <div className="fa">
                    <span className="pill nt">{f.cat}</span>
                    <button className="btn sm" onClick={() => onFinding(f.id, 'accepted')}>Accept</button>
                    <button className="btn sm" onClick={() => onFinding(f.id, 'rejected')}>Reject</button>
                    {f.st !== 'open' && <Pill s={f.st}/>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="panel">
            <h2>Maintainability scorecard</h2>
            <div className="score">
              {[{v:'A',l:'Readability',cls:'ok'},{v:'B+',l:'Complexity',cls:'ok'},{v:'A',l:'Test coverage',cls:'ok'},{v:'B',l:'Naming',cls:'warn'}].map(s => (
                <div key={s.l} className={`sc ${s.cls}`}><b>{s.v}</b><span>{s.l}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid" style={{alignContent:'start'}}>
          <div className="panel">
            <h2>Reviewer checklist</h2>
            {[['g5-1','I read every changed line and understand it'],['g5-2','Structure and naming follow CLAUDE.md'],['g5-3','Tests prove the acceptance criteria, not just coverage'],['g5-4','No technology outside the permitted list'],['g5-5','Confidentiality rules are enforced on the server'],['g5-6','Every Claude finding is resolved']].map(([k,label]) => (
              <label key={k} className="chk"><input type="checkbox" checked={!!checks[k]} onChange={e => onCheck('g5', k, e.target.checked)}/>{label}</label>
            ))}
          </div>
          <GateComp id="G5" gate={gates.G5} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
          <div className="panel">
            <h2>Discussion</h2>
            <div className="comment"><span className="pn" style={{background:'var(--brand)'}}>C</span><div><b>Claude</b><br/>Routing picks the Executive Sponsor from the contact's Business Group. If none is set, the request goes to the Group CEO office.</div></div>
            <div className="comment"><span className="pn">AK</span><div><b>A. Kulkarni, Tech Lead</b><br/>Good. Please log the fallback in the audit trail so admins can see it.</div></div>
            <div className="comment"><span className="pn" style={{background:'var(--brand)'}}>C</span><div><b>Claude</b><br/>Added in commit 3 of this PR, with a test.</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── View: Test ───────────────────────────────────────────────────────────

function TestView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, scripts, onCheck, onToast }: GateProps & { scripts: typeof SCRIPTS_INIT; onCheck: (g: string, k: string, v: boolean) => void; onToast: (msg: string) => void }) {
  const [tab, setTab] = useState('Test scripts');
  const [selScript, setSelScript] = useState(scripts[0]);
  const [running, setRunning] = useState(false);

  const runTests = () => {
    setRunning(true);
    onToast('Running all tests in Development…');
    setTimeout(() => { setRunning(false); onToast('All tests complete — 34 passed, 1 failed'); }, 2500);
  };

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 6 of 9</div><h1>Test</h1>
          <p>Claude writes test scripts from the acceptance criteria. A QA Lead reviews the scripts before they run, and a human reviews every result before the build moves on.</p></div>
        <div className="actions">
          <button className="btn" onClick={() => download('contacthub-test-report.md', '# ContactHUB — Test Report\n\nRun #58, build 1.0.0-rc3, Development\n\nTotal: 214 | Passed: 212 | Failed: 0 | Skipped: 2\n\nDuration: 6m 41s\n')}>Download test report (Word)</button>
          <button className="btn primary" onClick={runTests} disabled={running}>{running ? 'Running…' : 'Run all tests in Development'}</button>
        </div>
      </div>
      <div className="panel">
        <h2>How test scripts are created</h2>
        <div className="proc">
          <div><b>Acceptance criteria</b>From signed-off spec.md</div>
          <div><b>Claude drafts scripts</b>Plain-language scenarios, then automated code</div>
          <div className="h"><b>G6 Script review</b>QA Lead approves what will be tested</div>
          <div><b>Run in Development</b>After every block and every change</div>
          <div className="h"><b>G7 Results review</b>Human reviews all results, even when green</div>
        </div>
      </div>
      <Tabs tabs={['Test scripts','Results','Traceability']} active={tab} onSelect={setTab}/>
      {tab === 'Test scripts' && (
        <div className="grid c2">
          <div className="panel">
            <h2>Scripts <small>{scripts.length} scripts, {scripts.filter(s=>s.st==='Approved').length} approved</small></h2>
            <div className="tw"><table><thead><tr><th>ID</th><th>Description</th><th>Type</th><th>Source</th><th>Status</th></tr></thead><tbody>
              {scripts.map(s => (
                <tr key={s.id} className="click" onClick={() => setSelScript(s)}>
                  <td><code>{s.id}</code></td><td>{s.t}</td><td>{s.type}</td><td>{s.src}</td><td><Pill s={s.st}/></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
          <div className="grid" style={{alignContent:'start'}}>
            <div className="panel">
              <h2>Script {selScript.id}</h2>
              <dl className="kv"><dt>Requirement</dt><dd>{selScript.req}</dd><dt>Type</dt><dd>{selScript.type}</dd><dt>Source</dt><dd>{selScript.src}</dd><dt>Status</dt><dd><Pill s={selScript.st}/></dd></dl>
              <pre className="code md"><span style={{color:'#8fc1ff'}}>Feature: {selScript.t}</span>{'\n\n'}<span>  Given the system is ready</span>{'\n'}<span>  When the test runs</span>{'\n'}<span>  Then expectations are verified</span></pre>
            </div>
            <GateComp id="G6" gate={gates.G6} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
          </div>
        </div>
      )}
      {tab === 'Results' && (
        <>
          <div className="tiles">
            {[{v:'214',l:'Total',cls:''},{v:'212',l:'Passed',cls:'ok'},{v:'0',l:'Failed',cls:''},{v:'2',l:'Skipped',cls:'warn'},{v:'6m 41s',l:'Duration',cls:''}].map(t => (
              <div key={t.l} className={`tile ${t.cls}`}><b>{t.v}</b><span>{t.l}</span></div>
            ))}
          </div>
          <div className="grid c21 mt">
            <div className="panel">
              <h2>Run #58 on build 1.0.0-rc3 <small>Development, 25 Sep 18:02, 6 min 41 s</small></h2>
              <div className="tw"><table><thead><tr><th>Suite</th><th>Total</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Time</th><th>Evidence</th></tr></thead><tbody>
                {RESULTS.map((r,i) => (<tr key={i}><td>{r.suite}</td><td>{r.total}</td><td>{r.pass}</td><td>{r.fail||'—'}</td><td>{r.skip||'—'}</td><td><code>{r.time}</code></td><td className="sm-t">{r.evidence}</td></tr>))}
              </tbody></table></div>
            </div>
            <div className="grid" style={{alignContent:'start'}}>
              <div className="panel">
                <h2>Results reviewer checklist</h2>
                {[['g7-1','Reviewed all 214 results, including passes'],['g7-2','Accepted the reason for 2 skipped tests'],['g7-3','Every Must requirement has a passing test'],['g7-4','No test was changed just to make it pass'],['g7-5','Evidence attached for approval-flow tests']].map(([k,label]) => (
                  <label key={k} className="chk"><input type="checkbox" checked={!!checks[k]} onChange={e => onCheck('g7', k, e.target.checked)}/>{label}</label>
                ))}
              </div>
              <GateComp id="G7" gate={gates.G7} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
            </div>
          </div>
        </>
      )}
      {tab === 'Traceability' && (
        <div className="panel">
          <h2>Requirement to test traceability</h2>
          <div className="tw"><table><thead><tr><th>Requirement</th><th>Name</th><th>Scripts</th><th>Status</th></tr></thead><tbody>
            {[['FR-03','Search limits by access level',2,'ok'],['FR-04','Create with duplicate check',2,'ok'],['FR-05','Confidentiality access log',1,'ok'],['APR-01','Highly Restricted approval',7,'warn'],['APR-02','Update validation',4,'ok'],['APR-03','Duplicate merge',3,'ok'],['APR-04','Restricted access grants',2,'ok']].map(([id,name,n,cls]) => (
              <tr key={id as string}><td><code>{id}</code></td><td>{name}</td><td>{n} script{Number(n)>1?'s':''}</td><td><span className={`pill ${cls}`}>{cls==='ok'?'Covered':'In review'}</span></td></tr>
            ))}
          </tbody></table></div>
        </div>
      )}
    </section>
  );
}

// ─── View: UAT ────────────────────────────────────────────────────────────

function UATView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, uat, exitCrit, onExitCheck, onToast }: GateProps & { uat: typeof UAT_INIT; exitCrit: typeof EXIT_INIT; onExitCheck: (i: number, v: boolean) => void; onToast: (msg: string) => void }) {
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 7 of 9</div><h1>User acceptance testing</h1>
          <p>Code moves from Development to Quality, where business users test it in their own words. The final end-to-end UAT runs on days 13 and 14, and only a business sign-off moves it towards Production.</p></div>
        <div className="actions">
          <button className="btn" onClick={() => download('contacthub-uat-report.md', '# ContactHUB — UAT Report\n\nEnvironment: Quality (contacthub-qa)\nBuild: 1.0.0-rc3\n\nTotal scenarios: 42 | Passed: 36 | Failed: 1 | Feedback: 1 | Not run: 4\n\nBusiness sign-off: Pending\n')}>Download UAT report (Word)</button>
          <button className="btn primary" onClick={() => onToast('Invitations sent to all business testers')}>Invite business testers</button>
        </div>
      </div>
      <div className="envs">
        <div className="env"><h3>Development</h3><div className="sub">Build 1.0.0-rc3</div><ul><li>Claude automated tests: 212 passed, 2 skipped</li><li>Developer extra tests: 18 of 18</li><li>G7 results review <Pill s="Signed off"/></li></ul></div>
        <div className="envgate"><div><div className="dia"/><div>Promoted 25 Sep<br/>by pipeline</div></div></div>
        <div className="env cur"><h3>Quality (UAT)</h3><div className="sub">Build 1.0.0-rc3, synthetic data</div><ul><li>42 business scenarios</li><li>5 business testers</li><li>Test clock enabled</li></ul></div>
        <div className="envgate wait"><div><div className="dia"/><div>G8 UAT sign-off<br/>then G9 CAB</div></div></div>
        <div className="env"><h3>Production</h3><div className="sub">Not live yet</div><ul><li>Release 1.0.0 planned Sat 3 Oct</li></ul></div>
      </div>
      <div className="tiles mt">
        {[{v:String(TESTERS.reduce((s,t)=>s+t.total,0)),l:'Scenarios',cls:''},{v:String(uat.filter(u=>u.st==='Passed').length),l:'Passed',cls:'ok'},{v:'1',l:'Failed',cls:'bad'},{v:'1',l:'Feedback',cls:'vio'},{v:'4',l:'Not run',cls:'warn'}].map(t => (
          <div key={t.l} className={`tile ${t.cls}`}><b>{t.v}</b><span>{t.l}</span></div>
        ))}
      </div>
      <div className="grid c21 mt">
        <div className="panel">
          <h2>UAT scenarios <small>Written by Claude in business language, approved by the Business Owner</small></h2>
          <div className="tw"><table><thead><tr><th>ID</th><th>Scenario</th><th>Tester</th><th>Role</th><th>Critical</th><th>Status</th><th>Note</th></tr></thead><tbody>
            {uat.map(u => (<tr key={u.id}><td>{u.id}</td><td>{u.t}</td><td>{u.who}</td><td>{u.r}</td><td>{u.crit?'Yes':'—'}</td><td><Pill s={u.st}/></td><td className="sm-t">{u.note}</td></tr>))}
          </tbody></table></div>
        </div>
        <div className="panel">
          <h2>Business testers</h2>
          {TESTERS.map(t => (
            <div key={t.ini} className="tester">
              <div className="av">{t.ini}</div>
              <div><b>{t.name}</b><span>{t.role}</span></div>
              <div style={{textAlign:'right',fontSize:13}}><b>{t.done}/{t.total}</b><div className="bar mt8"><i style={{width:`${t.done/t.total*100}%`}}/></div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid c2 mt">
        <div className="panel">
          <h2>Exit criteria</h2>
          {exitCrit.map((c, i) => (
            <label key={i} className="chk">
              <input type="checkbox" checked={c.met} onChange={e => onExitCheck(i, e.target.checked)}/>
              <span>{c.crit}<span className="muted" style={{marginLeft:8,fontSize:12}}>{c.note}</span></span>
            </label>
          ))}
        </div>
        <GateComp id="G8" gate={gates.G8} role={role} findings={findings} checks={checks} exit={exitCrit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
      </div>
    </section>
  );
}

// ─── View: Deploy ─────────────────────────────────────────────────────────

function DeployView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit }: GateProps) {
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 8 of 9</div><h1>Deploy</h1>
          <p>Claude prepares the release, the change request and the runbook. Production changes need UAT sign-off, CAB approval and a business go-live decision.</p></div>
        <div className="actions"><button className="btn" onClick={() => download('contacthub-release-notes.md', '# ContactHUB — Release Notes\n\nRelease: 1.0.0\nGo-live: Saturday 3 Oct 07:00 CET\n\n## What is included\n\nAll 5 increments: sign-in, directory, approval flows, import/scan, mobile and Czech.\n\nExternal portal feature flag is off until pilot ends.\n')}>Download release notes (Word)</button></div>
      </div>
      <div className="grid c2">
        <div className="panel">
          <h2>Release 1.0.0 contents <small>Generated from merged blocks</small></h2>
          <div className="tw"><table><thead><tr><th>Increment</th><th>Scope</th><th>Blocks</th><th>Flag</th></tr></thead><tbody>
            {[['1','Sign-in, roles, confidentiality','7','On'],['2','Directory, create contact, record','8','On'],['3','Update validation and approval flows','11','On'],['4','Import, card scan, duplicate merge','6','On'],['5','Mobile, Czech; external portal as pilot','6','Portal off until pilot ends']].map(([inc,scope,blocks,flag]) => (
              <tr key={inc}><td>{inc}</td><td>{scope}</td><td>{blocks}</td><td>{flag}</td></tr>
            ))}
          </tbody></table></div>
        </div>
        <div className="panel">
          <h2>Guided release steps <small>Claude does it, people confirm</small></h2>
          <ol className="log" style={{listStyle:'none'}}>
            <li><time>✓</time><span>Export managed solution from Quality, version 1.0.0</span></li>
            <li><time>✓</time><span>Pre-fill CAB change request CHG-20931 with scope, test evidence and rollback</span></li>
            <li><time>…</time><span>Import into Production through Power Platform pipeline, Saturday 3 Oct 07:00 CET</span></li>
            <li><time>…</time><span>Smoke tests with a production-safe test account</span></li>
            <li><time>…</time><span>If any smoke test fails: app hidden automatically, current contact lists stay in use</span></li>
          </ol>
        </div>
      </div>
      <div className="grid c2 mt">
        <div className="panel">
          <h2>Hosting and environments <small>From permitted technologies</small></h2>
          <dl className="kv">
            <dt>Platform</dt><dd>Power Platform managed environments</dd>
            <dt>Development</dt><dd>contacthub-dev</dd>
            <dt>Quality</dt><dd>contacthub-qa</dd>
            <dt>Production</dt><dd>contacthub-prod</dd>
            <dt>Secrets</dt><dd>Azure Key Vault</dd>
          </dl>
        </div>
        <GateComp id="G9" gate={gates.G9} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
      </div>
    </section>
  );
}

// ─── View: Maintain ───────────────────────────────────────────────────────

function MaintainView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, issues, onToast }: GateProps & { issues: typeof ISSUES_INIT; onToast: (msg: string) => void }) {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Stage 9 of 9</div><h1>Maintain</h1>
          <p>After go-live, issues are fixed as small blocks through the same gates. Claude also keeps spec.md and plan.md in line with the code, so the next team inherits documents that are true.</p></div>
        <div className="actions"><button className="btn primary" onClick={() => setShowIssueForm(s => !s)}>Log an issue</button></div>
      </div>
      {showIssueForm && (
        <div className="panel mt" style={{maxWidth:480}}>
          <h2>Log an issue</h2>
          <div className="field"><label>Title</label><input className="inp" value={issueTitle} onChange={e => setIssueTitle(e.target.value)} placeholder="Describe the issue"/></div>
          <div className="field"><label>Severity</label>
            <select className="inp" value={issueSeverity} onChange={e => setIssueSeverity(e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn primary" onClick={() => { onToast('Issue logged'); setShowIssueForm(false); setIssueTitle(''); setIssueSeverity('Medium'); }}>Submit</button>
            <button className="btn" onClick={() => setShowIssueForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="grid c21">
        <div className="panel">
          <h2>Open issues</h2>
          <div className="tw"><table><thead><tr><th>#</th><th>Title</th><th>Type</th><th>Severity</th><th>Status</th></tr></thead><tbody>
            {issues.map(i => (<tr key={i.n}><td>#{i.n}</td><td>{i.t}</td><td>{i.type}</td><td>{i.sev}</td><td>{i.st}</td></tr>))}
          </tbody></table></div>
        </div>
        <div className="panel">
          <h2>Health <small>Quality, pilot users, 7 days</small></h2>
          <div className="meter">
            <div className="m-row"><span>Hypercare</span><b>Mon 5 – Fri 16 Oct</b></div>
            <div className="m-row"><span>Median search time</span><b>0.8 s</b></div>
            <div className="m-row"><span>Pending validations past day 10</span><b>6</b></div>
            <div className="m-row"><span>Docs in sync with code</span><Pill s="Approved"/></div>
            <div className="m-row"><span>Dependencies to update</span><b>3</b></div>
          </div>
        </div>
      </div>
      <div className="grid c2 mt">
        <div className="panel">
          <h2>Fix path <small>Same gates, faster</small></h2>
          <div className="proc">
            <div><b>Issue</b>Logged by user or monitoring</div>
            <div><b>Claude fix</b>One block, tests first</div>
            <div className="h"><b>Review</b>Tech Lead</div>
            <div className="h"><b>Spec update</b>Product Owner approves</div>
            <div className="h"><b>Release</b>Emergency CAB if needed</div>
          </div>
        </div>
        <GateComp id="G10" gate={gates.G10} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
      </div>
    </section>
  );
}

// ─── View: Workspace ──────────────────────────────────────────────────────

function WorkspaceView({ onToast }: { onToast: (msg: string) => void }) {
  const fileNames = Object.keys(FILES);
  const [activeFile, setActiveFile] = useState(fileNames[0]);
  const file = FILES[activeFile];

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">AI-native workspace</div><h1>Spec files: the source of truth</h1>
          <p>In AI-native delivery the documents are not paperwork after the fact. Intent, spec, plan and project rules live in the repository next to the code. Claude reads them before every block, and humans approve every change to them.</p></div>
        <div className="actions"><button className="btn" onClick={() => download(activeFile, file.body)}>Download this file</button></div>
      </div>
      <div className="panel">
        <h2>One requirement, traced end to end</h2>
        <div className="thread-x">
          {[['INT-2','intent.md: protect sensitive relationships'],['APR-01','spec.md: Highly Restricted approval'],['M08','Mockup signed off'],['F3.2','plan.md feature'],['B3.2.2','task card and PR #218'],['TS-APR01-03','Test script and result'],['UAT-09','Business scenario'],['1.0.0','Release']].map(([k,v])=>(
            <div key={k}><b>{k}</b>{v}</div>
          ))}
        </div>
      </div>
      <div className="ws mt">
        <div className="tree">
          {fileNames.map(f => (
            <button key={f} className={activeFile === f ? 'active' : ''} onClick={() => setActiveFile(f)}>
              {f}<em>{FILES[f].meta.split(',')[0]}</em>
            </button>
          ))}
        </div>
        <div className="fileview">
          <div className="fv-h"><b>{activeFile}</b><span className="sm-t muted">{file.meta}</span></div>
          <pre className="code md"><span>{file.body}</span></pre>
        </div>
      </div>
      <div className="panel mt">
        <h2>Why this produces maintainable code</h2>
        <div className="tw"><table className="cmp">
          <thead><tr><th/><th>Prompt-and-paste AI coding</th><th>AI-native SDLC in Build Studio</th></tr></thead>
          <tbody>
            {[['Source of truth','Chat history, lost after the session','intent.md, spec.md and plan.md in the repo, versioned and approved'],['Size of change','Whole features or apps in one go','Blocks under 300 lines, one responsibility each'],['Standards','Whatever the model chooses that day','CLAUDE.md rules loaded before every block'],['Technology','Random libraries and frameworks','Permitted technologies only, enforced by the pipeline'],['Tests','Few or none, written after','Written first from acceptance criteria, reviewed by QA'],['Human oversight','A final look, if any','Named approval at ten gates, recorded in the audit trail'],['AI spend','Unknown until the invoice arrives','Tracked per block, capped per person and project, stopped automatically when looping'],['Next developer','Reverse-engineers the code','Reads the spec, plan, decisions and task cards']].map(([k,bad,good])=>(
              <tr key={k}><td><b>{k}</b></td><td>{bad}</td><td>{good}</td></tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </section>
  );
}

// ─── View: Approvals ──────────────────────────────────────────────────────

function ApprovalsView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, audit, onGo }: GateProps & { audit: typeof AUDIT_INIT; onGo: (v: ViewId) => void }) {
  const [filter, setFilter] = useState('All');
  const stages = ['All', ...new Set(Object.values(GATES_INIT).map(g => g.stage))];
  const gateEntries = Object.entries(gates);
  const filtered = filter === 'All' ? gateEntries : gateEntries.filter(([,g]) => g.stage === filter);

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Human oversight</div><h1>Approvals</h1>
          <p>Every gate in the life cycle, in one inbox. Switch "Viewing as" in the top bar to act as each approver and see how a decision moves through its chain.</p></div>
        <div className="actions"><button className="btn" onClick={() => download('contacthub-audit-trail.md', '# ContactHUB — Audit Trail\n\n' + audit.map(a => `## ${a.time}\n\n**${a.who}** — ${a.action}\n`).join('\n'))}>Download audit trail</button></div>
      </div>
      <FilterChips options={stages.map(s => s.charAt(0).toUpperCase() + s.slice(1))} active={filter.charAt(0).toUpperCase() + filter.slice(1)} onSelect={v => setFilter(v.toLowerCase())}/>
      <div className="grid c21">
        <div className="grid">
          {filtered.map(([id, gate]) => (
            <GateComp key={id} id={id} gate={gate} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit} inbox onGo={onGo}/>
          ))}
        </div>
        <div className="panel" style={{alignContent:'start'}}>
          <h2>Audit trail</h2>
          <ul className="log">
            {audit.map((a, i) => <li key={i}><time>{a.time}</time><span><b>{a.who}</b> — {a.action}</span></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── View: Templates ──────────────────────────────────────────────────────

function TemplatesView({ onToast }: { onToast: (msg: string) => void }) {
  const stages = ['All', ...new Set(TEMPLATES.map(t => t.stage))];
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.stage === filter);
  const [templateName, setTemplateName] = useState('');
  const [templateStage, setTemplateStage] = useState('Requirements');
  const [templateDefault, setTemplateDefault] = useState(true);
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Platform governance</div><h1>OPmobility templates</h1>
          <p>Upload the company's own templates for every stage. Claude uses the default template whenever it generates a document, so every project looks and reads the same way.</p></div>
        <div className="actions"><button className="btn primary" onClick={() => { if (!templateName.trim()) { onToast('Enter a template name first'); } else { onToast('Template uploaded'); } }}>Upload template</button></div>
      </div>
      <div className="grid c21">
        <div className="panel">
          <FilterChips options={stages} active={filter} onSelect={setFilter}/>
          <div className="tw"><table><thead><tr><th>Stage</th><th>Template</th><th>Version</th><th>Owner</th><th>Default</th><th>Updated</th></tr></thead><tbody>
            {filtered.map((t, i) => (<tr key={i}><td>{t.stage}</td><td><b>{t.name}</b></td><td>{t.ver}</td><td>{t.owner}</td><td>{t.def?<span className="pill ok">Default</span>:'—'}</td><td>{t.up}</td></tr>))}
          </tbody></table></div>
        </div>
        <div className="panel" style={{alignContent:'start'}}>
          <h2>Upload details</h2>
          <div className="field"><label>Stage</label>
            <select className="inp" value={templateStage} onChange={e => setTemplateStage(e.target.value)}><option>Requirements</option><option>Design</option><option>Plan</option><option>Code</option><option>Review</option><option>Test</option><option>UAT</option><option>Deploy</option><option>Maintain</option></select></div>
          <div className="field"><label>Template name</label><input className="inp" placeholder="e.g. Data Protection Impact Assessment" value={templateName} onChange={e => setTemplateName(e.target.value)}/></div>
          <label className="chk"><input type="checkbox" checked={templateDefault} onChange={e => setTemplateDefault(e.target.checked)}/>Make this the default for its stage</label>
          <label className="chk"><input type="checkbox" defaultChecked disabled/>Claude reads section headings and guidance notes</label>
          <div className="note mt">Uploading a new version keeps the old one. Documents already signed off stay on the version they were created with.</div>
        </div>
      </div>
    </section>
  );
}

// ─── View: Tech ───────────────────────────────────────────────────────────

function TechView({ onToast }: { onToast: (msg: string) => void }) {
  const cats = ['All', ...new Set(TECH.map(t => t.cat))];
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? TECH : TECH.filter(t => t.cat === filter);
  const [showTechForm, setShowTechForm] = useState(false);
  const [techName, setTechName] = useState('');
  const [techCat, setTechCat] = useState('Frontend');
  const [techStatus, setTechStatus] = useState('Approved');
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Platform governance</div><h1>Permitted technologies</h1>
          <p>The Architecture board maintains this list. Developers pick their stack from it in Design, Claude is limited to it in Code, and the pipeline blocks anything else.</p></div>
        <div className="actions"><button className="btn primary" onClick={() => setShowTechForm(s => !s)}>Add technology</button></div>
      </div>
      {showTechForm && (
        <div className="panel mt" style={{maxWidth:480}}>
          <h2>Add technology</h2>
          <div className="field"><label>Name</label><input className="inp" value={techName} onChange={e => setTechName(e.target.value)} placeholder="e.g. Zod"/></div>
          <div className="field"><label>Category</label>
            <select className="inp" value={techCat} onChange={e => setTechCat(e.target.value)}>
              <option>Frontend</option><option>Backend</option><option>Database</option><option>Infrastructure</option><option>AI</option><option>Other</option>
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select className="inp" value={techStatus} onChange={e => setTechStatus(e.target.value)}>
              <option>Approved</option><option>Trial</option><option>Review</option>
            </select>
          </div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn primary" onClick={() => { onToast('Technology added to permitted list'); setShowTechForm(false); setTechName(''); setTechCat('Frontend'); setTechStatus('Approved'); }}>Submit</button>
            <button className="btn" onClick={() => setShowTechForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <FilterChips options={cats} active={filter} onSelect={setFilter}/>
      <div className="grid c21">
        <div className="panel">
          <div className="tw"><table><thead><tr><th>Category</th><th>Technology</th><th>Version</th><th>Status</th><th>Notes</th></tr></thead><tbody>
            {filtered.map((t, i) => (<tr key={i}><td>{t.cat}</td><td><b>{t.name}</b></td><td>{t.ver}</td><td><Pill s={t.st}/></td><td className="sm-t">{t.note}</td></tr>))}
          </tbody></table></div>
        </div>
        <div className="grid" style={{alignContent:'start'}}>
          <div className="panel"><h2>Status meaning</h2>
            <ul className="tight sm-t">
              <li><Pill s="Approved"/> Use freely</li>
              <li><Pill s="Trial"/> Allowed with Architect approval</li>
              <li><Pill s="Contain"/> Existing apps only, no new use</li>
              <li><Pill s="Not permitted"/> Blocked by the pipeline</li>
            </ul>
          </div>
          <div className="panel"><h2>Enforced in three places</h2>
            <ul className="tight sm-t">
              <li><b>Design</b>: stack picker only lists Approved and Trial</li>
              <li><b>Code</b>: CLAUDE.md tells Claude what it may use</li>
              <li><b>Pipeline</b>: dependency check fails the build</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── View: FinOps ─────────────────────────────────────────────────────────

function FinOpsView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, onToast }: GateProps & { onToast: (msg: string) => void }) {
  const [tab, setTab] = useState('Portfolio');
  const totalBudget = PROJECTS.reduce((s,p) => s + p.budget, 0);
  const totalSpend = PROJECTS.reduce((s,p) => s + p.budget * p.pct / 100, 0);
  const [anomalyStates, setAnomalyStates] = useState<Record<number, string>>({});

  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Token FinOps</div><h1>Usage and spend</h1>
          <p>Every token Claude uses is tagged to a project, stage, block, person, model and Business Group. That gives visibility of where money goes, unit costs to optimise, and controls that stop runaway spend before it happens.</p></div>
        <div className="actions">
          <button className="btn" onClick={() => download('contacthub-usage.csv', 'project,stage,model,tokens,cost\nContactHUB,Code,Claude Sonnet 5,4200000,€0.31\nContactHUB,Review,Claude Sonnet 5,1800000,€0.13\nContactHUB,Requirements,Claude Haiku 4.5,900000,€0.04\n')}>Export usage (CSV)</button>
          <button className="btn primary" onClick={() => download('contacthub-finops.md', '# ContactHUB — FinOps Report\n\nProject: ContactHUB\nPeriod: September 2025\n\nAI spend to day 10: €432\nProject budget: €600\nBudget used: 72%\n\nCache hit rate: 84%\nForecast final: ~€90\n')}>Download FinOps report (Word)</button>
        </div>
      </div>
      <Tabs tabs={['Portfolio','ContactHUB','Unit economics','Showback / chargeback','Optimise']} active={tab} onSelect={setTab}/>

      {tab === 'Portfolio' && (
        <>
          <div className="tiles" style={{gridTemplateColumns:'repeat(6,minmax(0,1fr))'}}>
            {[{v:`€${Math.round(totalSpend)}`,l:'September spend'},{v:`€${totalBudget.toLocaleString()}`,l:'Total budget'},{v:`${Math.round(totalSpend/totalBudget*100)}%`,l:'Budget used'},{v:'9',l:'Active projects'},{v:'158',l:'Blocks merged'},{v:'84%',l:'Cache hit rate'}].map(t => (
              <div key={t.l} className="tile"><b>{t.v}</b><span>{t.l}</span></div>
            ))}
          </div>
          <div className="grid c21 mt">
            <div className="panel">
              <h2>September spend against budget <small>D&IS AI engineering, cumulative</small></h2>
              <div style={{height:100,background:'var(--surface2)',borderRadius:8,display:'flex',alignItems:'flex-end',gap:4,padding:'0 8px 8px',overflow:'hidden'}}>
                {Array.from({length:26},(_,i)=>{
                  const pct = Math.min(100, Math.round((i/25)*100 + (Math.sin(i)*8)));
                  const isOver = pct > 85;
                  return <div key={i} style={{flex:1,background: isOver?'var(--bad)':'var(--brand)',borderRadius:'3px 3px 0 0',height:`${pct}%`,opacity:i>10?0.5:1}}/>
                })}
              </div>
              <div className="legend mt8">
                <span><i style={{background:'var(--brand)'}}/>Actual</span>
                <span><i style={{background:'var(--brand2)',opacity:.5}}/>Forecast</span>
                <span><i style={{background:'var(--bad)'}}/>Budget €2,800</span>
              </div>
            </div>
            <div className="panel">
              <h2>Anomalies <small>Caught by guardrails</small></h2>
              <div style={{maxHeight:300,overflow:'auto'}}>
                {ANOMALIES.map(a => (
                  <div key={a.id} className="appr">
                    <div className="appr-h">
                      <Pill s={a.sev === 'bad' ? 'Failed' : 'Pending'}/><b>{a.t}</b>
                    </div>
                    <div className="sm-t muted">{a.p} — {a.d}</div>
                    <div className="actions mt8">
                      {a.acts.map(act => <button key={act} className="btn sm" onClick={() => { setAnomalyStates(prev => ({...prev, [a.id]: act})); onToast(`Anomaly ${a.id}: ${act}`); }}>{act}</button>)}
                      {anomalyStates[a.id] && <span className="pill ok">{anomalyStates[a.id]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid c21 mt">
            <div className="panel">
              <h2>By project <small>Month to date against monthly budget</small></h2>
              <div className="tw"><table><thead><tr><th>Project</th><th>Business Group</th><th>Tier</th><th>Budget</th><th>Spend</th><th>Used</th></tr></thead><tbody>
                {PROJECTS.map(p => (
                  <tr key={p.n}>
                    <td>{p.own?<b>{p.n}</b>:p.n}</td><td>{p.bg}</td><td><span className={`pill ${p.tier==='Citizen'?'vio':p.tier==='Batch'?'nt':'info'}`}>{p.tier}</span></td>
                    <td>€{p.budget}</td><td>€{Math.round(p.budget*p.pct/100)}</td>
                    <td><div className="bar"><i className={p.pct>90?'warn':''} style={{width:`${Math.min(100,p.pct)}%`}}/></div></td>
                  </tr>
                ))}
              </tbody></table></div>
            </div>
            <div className="grid" style={{alignContent:'start'}}>
              <div className="panel"><h2>By model</h2>
                {[{m:'Claude Opus 5.5',pct:22,col:'var(--violet)'},{m:'Claude Sonnet 5',pct:58,col:'var(--brand)'},{m:'Claude Haiku 4.5',pct:20,col:'var(--brand2)'}].map(r=>(
                  <div key={r.m} className="tbar"><span className="sm-t">{r.m}</span><div className="track"><i style={{width:`${r.pct}%`,background:r.col}}/></div></div>
                ))}
              </div>
              <div className="panel"><h2>By developer tier</h2>
                {[{t:'Pro developers',pct:82},{t:'Citizen developers',pct:10},{t:'Batch (shared)',pct:8}].map(r=>(
                  <div key={r.t} className="tbar"><span className="sm-t">{r.t}</span><div className="track"><i className="ai" style={{width:`${r.pct}%`}}/></div></div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'ContactHUB' && (
        <>
          <div className="tiles">
            {[{v:'€432',l:'AI spend to day 10'},{v:'€600',l:'Project budget'},{v:'72%',l:'Budget used'},{v:'17',l:'Blocks merged'},{v:'84%',l:'Cache hit rate'},{v:'~€90',l:'Forecast final'}].map(t=>(
              <div key={t.l} className="tile"><b>{t.v}</b><span>{t.l}</span></div>
            ))}
          </div>
          <div className="grid c2 mt">
            <div className="panel"><h2>AI spend by life-cycle stage <small>Day 1 to 10</small></h2>
              {[['Requirements',12,'var(--violet)'],['Design',18,'var(--brand2)'],['Plan',8,'var(--brand)'],['Code',48,'var(--brand)'],['Review',22,'var(--warn)'],['Test',18,'var(--brand2)'],['UAT/Deploy',4,'var(--good)']].map(([s,pct,col])=>(
                <div key={s as string} className="tbar"><span>{s}</span><div className="track"><i style={{width:`${pct}%`,background:col as string}}/></div></div>
              ))}
            </div>
            <div className="panel"><h2>Daily AI spend <small>Days 1–10 actual, forecast 11–15</small></h2>
              <div style={{height:100,background:'var(--surface2)',borderRadius:8,display:'flex',alignItems:'flex-end',gap:4,padding:'0 8px 8px'}}>
                {[22,18,35,48,29,41,52,38,44,60,65,58,40,30,25].map((h,i)=>(
                  <div key={i} style={{flex:1,background:i<10?'var(--brand)':'var(--brand-light2)',borderRadius:'3px 3px 0 0',height:`${h/70*100}%`,border:i>=10?'1px dashed var(--brand2)':'none'}}/>
                ))}
              </div>
              <div className="note mt">AI spend of around €<b>540</b> is about <b>1.4%</b> of delivery cost at €600/day × 4 people × 15 days. The FinOps risk is not the unit price — it is waste and uncontrolled growth as more teams join.</div>
            </div>
          </div>
        </>
      )}

      {tab === 'Unit economics' && (
        <div className="grid c21">
          <div className="panel"><h2>Unit economics <small>Portfolio, September</small></h2>
            <div className="tw"><table><thead><tr><th>Metric</th><th>Value</th><th>Trend</th></tr></thead><tbody>
              {[['Cost per block merged','€2.73','↓ from €3.10 in Aug'],['Cost per test written','€0.41','↓ from €0.48'],['Cost per requirement drafted','€1.82','stable'],['Rework share (blocks redone)','12%','↑ from 8% — see Warranty Claims'],['Cache hit rate, portfolio avg','84%','stable']].map(([m,v,t])=>(
                <tr key={m as string}><td>{m}</td><td><b>{v}</b></td><td className="sm-t muted">{t}</td></tr>
              ))}
            </tbody></table></div>
          </div>
          <div className="panel"><h2>Why unit costs, not just totals</h2>
            <p className="sm-t" style={{marginTop:0}}>Total spend will rise as more apps move onto the platform, and that is good news. What should fall is the cost of each useful outcome: a merged block, a passing test, a signed-off requirement.</p>
            <p className="sm-t"><b>Rework share</b> is the most telling number. Tokens spent on blocks that were rejected or redone usually point to unclear requirements, not to Claude. Fixing the spec is cheaper than buying more tokens.</p>
          </div>
        </div>
      )}

      {tab === 'Showback / chargeback' && (
        <div className="grid c21">
          <div className="panel"><h2>By Business Group and cost centre <small>September month to date</small></h2>
            <div className="tw"><table><thead><tr><th>Business Group</th><th>Cost centre</th><th>Projects</th><th>Spend</th><th>Budget</th></tr></thead><tbody>
              {[['Group functions','CC-1100, CC-1120, CC-1130','3','€541','€830'],['Exterior Systems','CC-2140','1','€252','€400'],['Lighting','CC-3120','1','€311','€350'],['C-Power','CC-5110','1','€84','€300'],['Modules','CC-4150','1','€51','€60'],['H2-Power','CC-6110','1','€57','€60'],['Shared platform','CC-1000','1','€33','€150']].map(([bg,cc,n,s,b])=>(
                <tr key={bg as string}><td>{bg}</td><td className="mono sm-t">{cc}</td><td>{n}</td><td>{s}</td><td>{b}</td></tr>
              ))}
            </tbody></table></div>
          </div>
          <div className="grid" style={{alignContent:'start'}}>
            <div className="panel"><h2>Model</h2>
              <label className="chk"><input type="radio" name="cbm" checked={chargebackModel === 'showback'} onChange={() => setChargebackModel('showback')}/><span><b>Showback</b> (now): each Business Group sees its spend monthly</span></label>
              <label className="chk"><input type="radio" name="cbm" checked={chargebackModel === 'chargeback'} onChange={() => setChargebackModel('chargeback')}/><span><b>Chargeback</b> (from Q1 2027): costs booked to cost centres</span></label>
              <div className="note mt">Shared platform work is split by each project's share of blocks merged.</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Optimise' && (
        <div className="panel">
          <h2>Savings found by Claude and FinOps rules <small>Total potential: €{RECS.reduce((s,r)=>s+r.save,0)}/month</small></h2>
          {RECS.map((r, i) => (
            <div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--line)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:4}}>
                <b style={{fontSize:14}}>{r.t}</b>
                <span className="pill ok">Save €{r.save}/mo</span>
              </div>
              <div className="sm-t muted">{r.d}</div>
              <div style={{fontSize:12.5,marginTop:4}}>Owner: <b>{r.needs}</b></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── View: Budgets ────────────────────────────────────────────────────────

function BudgetsView({ gates, role, findings, checks, exit, onApprove, onReturn, onResubmit, policies, onPolicyToggle, onToast }: GateProps & { policies: typeof POLICIES_INIT; onPolicyToggle: (id: string) => void; onToast: (msg: string) => void }) {
  const [tab, setTab] = useState('Budgets');
  const [budgetProject, setBudgetProject] = useState(PROJECTS[0]?.n || '');
  const [budgetAmount, setBudgetAmount] = useState(30);
  const [budgetReason, setBudgetReason] = useState('Final UAT fixes before go-live');
  const [cacheRead, setCacheRead] = useState(0.1);
  const [cacheWrite, setCacheWrite] = useState(1.25);
  const [batchRate, setBatchRate] = useState(0.5);
  const [chargebackModel, setChargebackModel] = useState<'showback'|'chargeback'>('showback');
  return (
    <section>
      <div className="vh">
        <div><div className="crumb">Token FinOps</div><h1>Budgets and controls</h1>
          <p>Spend is controlled before it happens, not reported after. Budgets cascade from Group to project and person, thresholds trigger actions automatically, and every increase is a human decision.</p></div>
      </div>
      <Tabs tabs={['Budgets','Guardrails','Model routing','Developer tiers','Rate card']} active={tab} onSelect={setTab}/>

      {tab === 'Budgets' && (
        <>
          <div className="panel">
            <h2>Threshold actions <small>Apply to every budget</small></h2>
            <div className="proc">
              <div><b>50%</b>Owner notified</div>
              <div><b>80%</b>Practice Lead and FinOps notified, Opus switched off except security review</div>
              <div className="h"><b>100%: soft stop</b>Running blocks finish; new blocks need approval</div>
              <div className="h"><b>120%: hard stop</b>Agent sessions blocked until budget released</div>
            </div>
          </div>
          <div className="grid c21 mt">
            <div className="panel"><h2>Budget hierarchy <small>September</small></h2>
              <div className="tw"><table><thead><tr><th>Level</th><th>Name</th><th>Budget</th><th>Spend</th><th>Used</th></tr></thead><tbody>
                {[['Group','D&IS AI engineering','€2,800','€1,329','47%'],['Practice','Digital Solutions & AI','€2,000','€1,131','57%'],['Project','ContactHUB','€600','€432','72%'],['Project','Supplier Deviation Portal','€400','€252','63%'],['Person','R. Iyer (Dev)','€150','€89','59%']].map(([level,name,bud,sp,pct])=>(
                  <tr key={name as string}><td className="sm-t muted">{level}</td><td>{name}</td><td>{bud}</td><td>{sp}</td><td>
                    <div className="bar"><i className={Number((pct as string).replace('%',''))>85?'warn':''} style={{width:pct as string}}/></div>
                  </td></tr>
                ))}
              </tbody></table></div>
            </div>
            <div className="grid" style={{alignContent:'start'}}>
              <GateComp id="GF1" gate={gates.GF1} role={role} findings={findings} checks={checks} exit={exit} onApprove={onApprove} onReturn={onReturn} onResubmit={onResubmit}/>
              <div className="panel"><h2>Raise a budget request</h2>
                <div className="field"><label>Project</label><select className="inp" value={budgetProject} onChange={e => setBudgetProject(e.target.value)}>{PROJECTS.map(p=><option key={p.n}>{p.n}</option>)}</select></div>
                <div className="field"><label>Increase (€)</label><input className="inp" type="number" value={budgetAmount} onChange={e => setBudgetAmount(Number(e.target.value))}/></div>
                <div className="field"><label>Reason</label><input className="inp" value={budgetReason} onChange={e => setBudgetReason(e.target.value)}/></div>
                <button className="btn primary" onClick={() => onToast('Budget request submitted — Claude analysis will arrive by email')}>Ask Claude for cost analysis and submit</button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'Guardrails' && (
        <div className="grid c2">
          {policies.map(p => (
            <div key={p.id} className="panel">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:8}}>
                <b style={{fontSize:14}}>{p.t}</b>
                <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,whiteSpace:'nowrap'}}>
                  <input type="checkbox" checked={p.on} onChange={() => onPolicyToggle(p.id)} style={{accentColor:'var(--brand)'}}/>{p.on ? 'On' : 'Off'}
                </label>
              </div>
              <div className="sm-t muted">{p.d}</div>
              <div style={{marginTop:8,fontSize:12.5,fontFamily:'var(--mono)',background:'var(--surface2)',padding:'4px 8px',borderRadius:6,display:'inline-block'}}>{p.v}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Model routing' && (
        <div className="panel"><h2>Which model does what <small>Right-sizing is the biggest lever on cost</small></h2>
          <div className="tw"><table><thead><tr><th>Task</th><th>Default model</th><th>Allowed</th><th>Citizen developer</th></tr></thead><tbody>
            {ROUTING.map(r => (<tr key={r.task}><td>{r.task}</td><td><code>{r.def}</code></td><td>{r.allowed}</td><td>{r.citizen}</td></tr>))}
          </tbody></table></div>
          <div className="note mt">Claude Code picks the default model for each task automatically. Overriding it is logged, and repeated overrides show up as anomalies.</div>
        </div>
      )}

      {tab === 'Developer tiers' && (
        <>
          <div className="grid c2">
            <div className="panel"><h2>Pro developer <Pill s="Approved"/></h2>
              <dl className="kv"><dt>Who</dt><dd>D&IS developers and partner developers</dd><dt>Monthly cap</dt><dd>€150 per person, project budgets on top</dd><dt>Models</dt><dd>Haiku, Sonnet; Opus by policy</dd><dt>Technology</dt><dd>Full permitted list</dd><dt>Stages</dt><dd>All nine stages and all gates</dd><dt>Review</dt><dd>Peer review, Architect when security is touched</dd></dl>
            </div>
            <div className="panel"><h2>Citizen developer <Pill s="Trial"/></h2>
              <dl className="kv"><dt>Who</dt><dd>Certified business makers (Build Studio maker course)</dd><dt>Monthly cap</dt><dd>€30 per person, €60 per app</dd><dt>Models</dt><dd>Haiku and Sonnet only</dd><dt>Technology</dt><dd>Power Apps and Dataverse from approved templates</dd><dt>Stages</dt><dd>Requirements, design, code, test; deploy through a Pro sponsor</dd><dt>Review</dt><dd>Every block reviewed by a Pro developer</dd></dl>
            </div>
          </div>
          <div className="panel mt"><h2>Path to wider citizen development</h2>
            <div className="proc"><div><b>Pilot</b>4 makers, 2 apps, tight caps</div><div className="h"><b>Review</b>Cost per app, quality, support load</div><div><b>Maker academy</b>Certification and templates</div><div className="h"><b>Scale</b>Business Group budgets and local champions</div></div>
          </div>
        </>
      )}

      {tab === 'Rate card' && (
        <div className="grid c21">
          <div className="panel"><h2>Rate card <small>€ per million tokens (illustrative)</small></h2>
            <div className="tw"><table><thead><tr><th>Model</th><th>Input</th><th>Output</th></tr></thead><tbody>
              {[['Claude Opus 5.5','€5','€25'],['Claude Sonnet 5','€3','€15'],['Claude Haiku 4.5','€1','€5']].map(([m,i,o])=>(
                <tr key={m as string}><td>{m}</td><td>{i}</td><td>{o}</td></tr>
              ))}
            </tbody></table></div>
            <div className="grid c3 mt" style={{gap:10}}>
              <div className="field"><label>Cache read (share of input rate)</label><input className="inp" type="number" step={0.05} value={cacheRead} onChange={e => setCacheRead(Number(e.target.value))}/></div>
              <div className="field"><label>Cache write (multiple of input rate)</label><input className="inp" type="number" step={0.05} value={cacheWrite} onChange={e => setCacheWrite(Number(e.target.value))}/></div>
              <div className="field"><label>Batch (share of normal rate)</label><input className="inp" type="number" step={0.05} value={batchRate} onChange={e => setBatchRate(Number(e.target.value))}/></div>
            </div>
            <button className="btn primary" onClick={() => onToast('Rates updated — all figures recalculated')}>Apply rates and recalculate</button>
          </div>
          <div className="panel"><h2>About these rates</h2>
            <p className="sm-t" style={{marginTop:0}}>The rates shown are <b>illustrative</b>. Enter OPmobility's contracted Anthropic rates here and every figure in Build Studio recalculates, including history, forecasts and chargeback.</p>
            <p className="sm-t">Seat-based licences, such as Claude Team or Enterprise seats, are tracked separately as a fixed monthly cost per active user.</p>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Claude sidebar ───────────────────────────────────────────────────────

function ClaudePanel({ view }: { view: ViewId }) {
  const ctx = CLAUDE_TALK[view] || CLAUDE_TALK['requirements'];
  const [msgs, setMsgs] = useState(ctx.m);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, ['u', text], ['a', `I'll look into "${text}" in the context of ${ctx.ctx}.`]]);
    setInput('');
  };

  return (
    <>
      <div className="cl-h">
        <div className="cl-mark">C</div>
        <div><h2>Claude</h2><p>{ctx.ctx}</p></div>
      </div>
      <div className="cl-t">
        {msgs.map(([role, text], i) => (
          <div key={i} className={`msg ${role}`}>{text}</div>
        ))}
      </div>
      <div className="cl-chips">
        {ctx.chips.map(c => (
          <button key={c} onClick={() => send(c)}>{c}</button>
        ))}
      </div>
      <div className="cl-c">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask Claude about ${view}`}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button className="btn primary" onClick={() => send(input)}>Send</button>
      </div>
    </>
  );
}

// ─── Gate props type ──────────────────────────────────────────────────────

interface GateProps {
  gates: Record<string, Gate>;
  role: string;
  findings: typeof FINDINGS_INIT;
  checks: Record<string,boolean>;
  exit: typeof EXIT_INIT;
  onApprove: (id: string, comment: string) => void;
  onReturn: (id: string, comment: string) => void;
  onResubmit: (id: string) => void;
}

// ─── Toast ────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return <div className={`toast ${msg ? 'show' : ''}`}>{msg}</div>;
}

// ─── Rail nav items ───────────────────────────────────────────────────────

function NavItem({ num, label, sub, status, view, active, onClick }: {
  num?: number | string; label: string; sub: string; status: 'done'|'live'|''; view: ViewId; active: boolean; onClick: () => void;
}) {
  return (
    <button className={`nav-btn ${status} ${active?'active':''}`} onClick={onClick}>
      {num !== undefined
        ? <span className="n">{num}</span>
        : <span className="ic">{label[0]}</span>}
      <span><span className="t">{label}</span><span className="s">{sub}</span></span>
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────

import React from 'react';

export default function App() {
  const [view, setView] = useState<ViewId>('requirements');
  const [role, setRole] = useState('dev');
  const [showClaude, setShowClaude] = useState(true);
  const [gates, setGates] = useState({ ...GATES_INIT });
  const [crs, setCrs] = useState([...CRS_INIT]);
  const [prs] = useState([...PRS_INIT]);
  const [findings, setFindings] = useState([...FINDINGS_INIT]);
  const [scripts] = useState([...SCRIPTS_INIT]);
  const [uat] = useState([...UAT_INIT]);
  const [exit, setExit] = useState([...EXIT_INIT]);
  const [issues] = useState([...ISSUES_INIT]);
  const [audit, setAudit] = useState([...AUDIT_INIT]);
  const [checks, setChecks] = useState<Record<string,boolean>>({});
  const [policies, setPolicies] = useState([...POLICIES_INIT]);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }, []);

  const handleApprove = useCallback((id: string, comment: string) => {
    setGates(prev => {
      const g = { ...prev[id], steps: prev[id].steps.map((s,i) => {
        const steps = prev[id].steps;
        const pi = steps.findIndex(s => s[2] === 'pending');
        if (i === pi) return [s[0],s[1],'done','Now',comment] as typeof s;
        if (i === pi+1) return [s[0],s[1],'pending',s[3],s[4]] as typeof s;
        return s;
      })};
      return { ...prev, [id]: g };
    });
    const d = new Date();
    const time = `26 Sep ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    setAudit(a => [{ time, who: ROLES[role].who, action: `Approved ${id} — ${gates[id]?.sub || ''}` }, ...a]);
    showToast(`${id} approved by ${ROLES[role].who}`);
  }, [role, gates, showToast]);

  const handleReturn = useCallback((id: string, comment: string) => {
    setGates(prev => {
      const g = { ...prev[id], steps: prev[id].steps.map(s =>
        s[2] === 'pending' ? [s[0],s[1],'rej',s[3],comment || 'Returned'] as typeof s : s
      )};
      return { ...prev, [id]: g };
    });
    showToast(`${id} returned by ${ROLES[role].who}`);
  }, [role, showToast]);

  const handleResubmit = useCallback((id: string) => {
    setGates(prev => {
      const g = { ...prev[id], steps: prev[id].steps.map(s =>
        s[2] === 'rej' ? [s[0],s[1],'pending',s[3],s[4]] as typeof s : s
      )};
      return { ...prev, [id]: g };
    });
    showToast(`${id} resubmitted for review`);
  }, [showToast]);

  const handleCheck = useCallback((group: string, key: string, value: boolean) => {
    setChecks(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFinding = useCallback((id: number, st: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, st } : f));
    showToast(`Finding ${id} ${st}`);
  }, [showToast]);

  const handleExitCheck = useCallback((i: number, v: boolean) => {
    setExit(prev => prev.map((e,j) => j === i ? { ...e, met: v } : e));
  }, []);

  const handlePolicyToggle = useCallback((id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, on: !p.on } : p));
  }, []);

  const pendingGates = Object.values(gates).filter(g => {
    const cur = g.steps.find(s => s[2] === 'pending');
    return cur && cur[0] === role;
  }).length;

  const gateProps: GateProps = { gates, role, findings, checks, exit, onApprove: handleApprove, onReturn: handleReturn, onResubmit: handleResubmit };

  const ALL_VIEWS: ViewId[] = [
    'requirements','design','plan','code','review','test','uat','deploy','maintain',
    'workspace','approvals','finops','budgets','templates','tech',
  ];
  const curIdx = ALL_VIEWS.indexOf(view);
  const goBack = () => curIdx > 0 && setView(ALL_VIEWS[curIdx - 1]);
  const goNext = () => curIdx < ALL_VIEWS.length - 1 && setView(ALL_VIEWS[curIdx + 1]);

  const NAV_PIPELINE: { num: number; label: string; sub: string; status: 'done'|'live'|''; view: ViewId; gate: string }[] = [
    { num:1, label:'Requirements', sub:'DRD v1.3 awaiting sign-off', status:'done', view:'requirements', gate:'G1' },
    { num:2, label:'Design',       sub:'8 of 11 mockups signed off', status:'live', view:'design',       gate:'G2' },
    { num:3, label:'Plan',         sub:'15 days, 1 change pending',  status:'live', view:'plan',         gate:'G3' },
    { num:4, label:'Code',         sub:'Block B3.2.2 in progress',   status:'live', view:'code',         gate:'G4' },
    { num:5, label:'Review',       sub:'2 PRs need human review',    status:'live', view:'review',       gate:'G5' },
    { num:6, label:'Test',         sub:'7 scripts to review',        status:'live', view:'test',         gate:'G6' },
    { num:7, label:'UAT',          sub:'Quality env, 38 of 42 run',  status:'live', view:'uat',          gate:'G8' },
    { num:8, label:'Deploy',       sub:'Go-live Sat 3 Oct',          status:'',     view:'deploy',       gate:'G9' },
    { num:9, label:'Maintain',     sub:'4 open issues',              status:'live', view:'maintain',     gate:'G10'},
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={opLogo} alt="OPmobility" className="brand-logo" />
          <span className="prod">Build Studio</span>
        </div>
        <div className="spacer"/>
        <div className="tb-field">
          <label htmlFor="projSel">Application</label>
          <select id="projSel" onChange={e => showToast(`Switched to ${e.target.value}`)}><option>ContactHUB</option><option>Supplier Deviation Portal</option></select>
        </div>
        <div className="tb-field">
          <label htmlFor="roleSel">Viewing as</label>
          <select id="roleSel" value={role} onChange={e => { setRole(e.target.value); showToast(`Now acting as ${ROLES[e.target.value].who}`); }}>
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({v.who})</option>
            ))}
          </select>
        </div>
        <button className="icon-btn" onClick={() => setShowClaude(s => !s)}>Claude panel</button>
        <div className="avatar" title={`${ROLES[role].who}, ${ROLES[role].label}`}>{ROLES[role].ini}</div>
      </header>

      <div className={`body ${!showClaude ? 'no-claude' : ''}`}>
        <nav className="rail" aria-label="Build Studio navigation">
          <div className="proj">
            <h2>ContactHUB</h2>
            <p>Enterprise external contact management</p>
            <p className="mono" style={{marginTop:6,fontSize:11.5,color:'var(--muted)',wordBreak:'break-all'}}>github.com/opmobility/contacthub</p>
            <div className="sprint"><span>Day 10 of 15</span><span>Go-live Sat 3 Oct</span></div>
            <div className="bar"><i style={{width:'66%'}}/></div>
            <div className="sprint" style={{marginTop:8}}><span>AI spend</span><span>€432 / €600</span></div>
            <div className="bar"><i style={{width:'72%',background:'var(--good)'}}/></div>
          </div>

          <h3>Delivery pipeline</h3>
          <ul className="nav-list">
            {NAV_PIPELINE.map(n => (
              <React.Fragment key={n.view}>
                <li>
                  <NavItem num={n.num} label={n.label} sub={n.sub} status={n.status} view={n.view} active={view===n.view} onClick={() => setView(n.view)}/>
                </li>
                {n.gate && n.num < 9 && (
                  <li className={`g-label ${['G1','G2','G5','G6','G7'].includes(n.gate) ? 'wait' : 'ok'}`}>
                    {n.gate}{n.num === 6 ? ' · G7 Results review' : ''}
                    {['G1','G2','G3','G5','G6','G7'].includes(n.gate) ? ' sign-off' : ' Developer confirms block'}
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>

          <h3>AI-native workspace</h3>
          <ul className="nav-list">
            <li><button className={`nav-btn ${view==='workspace'?'active':''}`} onClick={() => setView('workspace')}><span className="ic">⌘</span><span><span className="t">Spec files</span><span className="s">intent.md, spec.md, plan.md…</span></span></button></li>
            <li><button className={`nav-btn ${view==='approvals'?'active':''}`} onClick={() => setView('approvals')}><span className="ic">✓</span><span><span className="t">Approvals{pendingGates > 0 && <span className="badge">{pendingGates}</span>}</span><span className="s">Human oversight inbox</span></span></button></li>
          </ul>

          <h3>Token FinOps</h3>
          <ul className="nav-list">
            <li><button className={`nav-btn ${view==='finops'?'active':''}`} onClick={() => setView('finops')}><span className="ic">€</span><span><span className="t">Usage and spend</span><span className="s">Portfolio, projects, unit costs</span></span></button></li>
            <li><button className={`nav-btn ${view==='budgets'?'active':''}`} onClick={() => setView('budgets')}><span className="ic">⛨</span><span><span className="t">Budgets and controls</span><span className="s">Caps, guardrails, routing, rates</span></span></button></li>
          </ul>

          <h3>Platform governance</h3>
          <ul className="nav-list">
            <li><button className={`nav-btn ${view==='templates'?'active':''}`} onClick={() => setView('templates')}><span className="ic">▤</span><span><span className="t">Templates</span><span className="s">OPmobility standards per stage</span></span></button></li>
            <li><button className={`nav-btn ${view==='tech'?'active':''}`} onClick={() => setView('tech')}><span className="ic">◈</span><span><span className="t">Permitted technologies</span><span className="s">What developers may use</span></span></button></li>
          </ul>
        </nav>

        <main className="main">
          {view === 'requirements' && <RequirementsLive actor={ROLES[role].who} onToast={showToast}/>}
          {view === 'design'       && <DesignView {...gateProps} onToast={showToast}/>}
          {view === 'plan'         && <PlanView {...gateProps} crs={crs} onToast={showToast}/>}
          {view === 'code'         && <CodeView {...gateProps} onCheck={handleCheck} onToast={showToast}/>}
          {view === 'review'       && <ReviewView {...gateProps} prs={prs} onCheck={handleCheck} onFinding={handleFinding}/>}
          {view === 'test'         && <TestView {...gateProps} scripts={scripts} onCheck={handleCheck} onToast={showToast}/>}
          {view === 'uat'          && <UATView {...gateProps} uat={uat} exitCrit={exit} onExitCheck={handleExitCheck} onToast={showToast}/>}
          {view === 'deploy'       && <DeployView {...gateProps}/>}
          {view === 'maintain'     && <MaintainView {...gateProps} issues={issues} onToast={showToast}/>}
          {view === 'workspace'    && <WorkspaceView onToast={showToast}/>}
          {view === 'approvals'    && <ApprovalsView {...gateProps} audit={audit} onGo={setView}/>}
          {view === 'templates'    && <TemplatesView onToast={showToast}/>}
          {view === 'tech'         && <TechView onToast={showToast}/>}
          {view === 'finops'       && <FinOpsView {...gateProps} onToast={showToast}/>}
          {view === 'budgets'      && <BudgetsView {...gateProps} policies={policies} onPolicyToggle={handlePolicyToggle} onToast={showToast}/>}
          <div className="bottom-nav">
            <button className="bottom-nav-btn" onClick={goBack} disabled={curIdx <= 0}>‹ Back</button>
            <span className="bottom-nav-pos">{curIdx + 1} / {ALL_VIEWS.length}</span>
            <button className="bottom-nav-btn" onClick={goNext} disabled={curIdx >= ALL_VIEWS.length - 1}>Next ›</button>
          </div>
        </main>

        <aside className="claude-panel" aria-label="Claude">
          <ClaudePanel view={view}/>
        </aside>
      </div>

      <Toast msg={toast}/>
    </div>
  );
}
