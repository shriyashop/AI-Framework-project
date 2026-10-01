export type ViewId =
  | 'requirements' | 'design' | 'plan' | 'code' | 'review'
  | 'test' | 'uat' | 'deploy' | 'maintain' | 'workspace'
  | 'approvals' | 'templates' | 'tech' | 'finops' | 'budgets';

export interface RoleDef { label: string; who: string; ini: string; }
export const ROLES: Record<string, RoleDef> = {
  dev:    { label: 'Developer',            who: 'R. Iyer',       ini: 'RI' },
  tl:     { label: 'Tech Lead',            who: 'A. Kulkarni',   ini: 'AK' },
  bo:     { label: 'Business Owner',       who: 'Nadia Haddad',  ini: 'NH' },
  po:     { label: 'Product Owner',        who: 'M. Dubois',     ini: 'MD' },
  arch:   { label: 'Enterprise Architect', who: 'L. Fontaine',   ini: 'LF' },
  sec:    { label: 'IT Security',          who: 'S. Moreau',     ini: 'SM' },
  qa:     { label: 'QA Lead',              who: 'P. Deshmukh',   ini: 'PD' },
  cab:    { label: 'Change Advisory Board',who: 'CAB chair',     ini: 'CB' },
  admin:  { label: 'Platform Admin',       who: 'K. Shirke',     ini: 'KS' },
  pl:     { label: 'Practice Lead',        who: 'V. Patil',      ini: 'VP' },
  finops: { label: 'FinOps Owner',         who: 'C. Martin',     ini: 'CM' },
  cit:    { label: 'Citizen Developer',    who: 'E. Morel',      ini: 'EM' },
};

export const TEMPLATES = [
  { stage:'Requirements', name:'Detailed Requirement Document',    ver:'2.1', owner:'D&IS PMO',                def:true,  up:'12 Jun 2026' },
  { stage:'Requirements', name:'Business Requirement Document',    ver:'1.4', owner:'D&IS PMO',                def:false, up:'02 Mar 2026' },
  { stage:'Requirements', name:'User story and acceptance criteria',ver:'1.2', owner:'Agile CoE',              def:false, up:'20 May 2026' },
  { stage:'Design',       name:'Solution Design Document',         ver:'3.0', owner:'Enterprise Architecture', def:true,  up:'01 Jul 2026' },
  { stage:'Design',       name:'UI mockup and brand standards',    ver:'2.0', owner:'Digital Solutions & AI',  def:true,  up:'14 Jul 2026' },
  { stage:'Design',       name:'Architecture Decision Record',     ver:'1.1', owner:'Enterprise Architecture', def:true,  up:'01 Jul 2026' },
  { stage:'Design',       name:'Data Protection Impact Assessment',ver:'1.3', owner:'Group DPO',               def:true,  up:'08 Apr 2026' },
  { stage:'Plan',         name:'Release plan (AI-native)',         ver:'2.0', owner:'Digital Solutions & AI',  def:true,  up:'20 May 2026' },
  { stage:'Plan',         name:'Change request form',              ver:'2.0', owner:'D&IS PMO',                def:true,  up:'20 May 2026' },
  { stage:'Code',         name:'CLAUDE.md coding standards',       ver:'1.2', owner:'Digital Solutions & AI',  def:true,  up:'10 Sep 2026' },
  { stage:'Code',         name:'Task card (block) template',       ver:'1.0', owner:'Digital Solutions & AI',  def:true,  up:'10 Sep 2026' },
  { stage:'Review',       name:'Pull request template',            ver:'1.1', owner:'Digital Solutions & AI',  def:true,  up:'10 Sep 2026' },
  { stage:'Review',       name:'Code and security review checklist',ver:'2.2',owner:'IT Security',             def:true,  up:'30 Jun 2026' },
  { stage:'Test',         name:'Test strategy',                    ver:'1.3', owner:'QA CoE',                  def:true,  up:'15 May 2026' },
  { stage:'Test',         name:'Test script (Given / When / Then)',ver:'1.1', owner:'QA CoE',                  def:true,  up:'15 May 2026' },
  { stage:'Test',         name:'Test summary report',              ver:'1.0', owner:'QA CoE',                  def:true,  up:'15 May 2026' },
  { stage:'UAT',          name:'UAT scenario pack',                ver:'1.2', owner:'QA CoE',                  def:true,  up:'15 May 2026' },
  { stage:'UAT',          name:'UAT sign-off form',                ver:'1.0', owner:'D&IS PMO',                def:true,  up:'15 May 2026' },
  { stage:'Deploy',       name:'CAB change request',               ver:'3.1', owner:'IT Service Management',   def:true,  up:'05 Feb 2026' },
  { stage:'Deploy',       name:'Release notes',                    ver:'1.0', owner:'D&IS PMO',                def:true,  up:'05 Feb 2026' },
  { stage:'Deploy',       name:'Deployment and rollback runbook',  ver:'2.0', owner:'Global Operations',       def:true,  up:'05 Feb 2026' },
  { stage:'Maintain',     name:'Support handover (hypercare)',     ver:'1.4', owner:'Global Operations',       def:true,  up:'11 Mar 2026' },
  { stage:'Maintain',     name:'Incident post-mortem',             ver:'1.1', owner:'Global Operations',       def:true,  up:'11 Mar 2026' },
];

export const TECH = [
  { cat:'Front end',   name:'React + TypeScript',               ver:'React 19, TS 5', st:'Approved',      note:'Default for web and Power Apps code apps' },
  { cat:'Front end',   name:'Power Apps code apps',             ver:'GA',             st:'Approved',      note:'React apps hosted on Power Platform' },
  { cat:'Front end',   name:'Power Apps canvas',                ver:'—',              st:'Approved',      note:'Citizen development, low complexity' },
  { cat:'Front end',   name:'Angular',                          ver:'17',             st:'Contain',       note:'Existing apps only' },
  { cat:'Front end',   name:'Vue.js',                           ver:'—',              st:'Not permitted', note:'No support skills in D&IS' },
  { cat:'Back end',    name:'Node.js',                          ver:'22 LTS',         st:'Approved',      note:'APIs and Azure Functions' },
  { cat:'Back end',    name:'.NET',                             ver:'8 LTS',          st:'Approved',      note:'APIs, plug-ins' },
  { cat:'Back end',    name:'Python',                           ver:'3.12',           st:'Trial',         note:'Data and AI services only' },
  { cat:'Back end',    name:'PHP',                              ver:'—',              st:'Not permitted', note:'—' },
  { cat:'Database',    name:'Microsoft Dataverse',              ver:'—',              st:'Approved',      note:'Default for Power Platform apps' },
  { cat:'Database',    name:'Azure SQL Database',               ver:'—',              st:'Approved',      note:'Relational workloads' },
  { cat:'Database',    name:'Azure Database for PostgreSQL',    ver:'16',             st:'Trial',         note:'Architect approval needed' },
  { cat:'Database',    name:'MongoDB (self-hosted)',            ver:'—',              st:'Not permitted', note:'Use Cosmos DB request instead' },
  { cat:'Integration', name:'Boomi iPaaS',                      ver:'—',              st:'Approved',      note:'All system-to-system integration' },
  { cat:'Integration', name:'Power Automate',                   ver:'—',              st:'Approved',      note:'In-app workflow and notifications' },
  { cat:'Integration', name:'Point-to-point REST to SAP',       ver:'—',              st:'Not permitted', note:'Must go through Boomi' },
  { cat:'Hosting',     name:'Power Platform managed envs',      ver:'—',              st:'Approved',      note:'Dev, Quality, Production' },
  { cat:'Hosting',     name:'Azure App Service',                ver:'—',              st:'Approved',      note:'OPmobility tenant only' },
  { cat:'Hosting',     name:'Vercel / Netlify',                 ver:'—',              st:'Not permitted', note:'Prototypes with no company data only' },
  { cat:'Identity',    name:'Microsoft Entra ID',               ver:'—',              st:'Approved',      note:'Mandatory single sign-on' },
  { cat:'Testing',     name:'Playwright',                       ver:'1.5x',           st:'Approved',      note:'End-to-end tests' },
  { cat:'Testing',     name:'Vitest',                           ver:'3',              st:'Approved',      note:'Unit tests' },
  { cat:'AI',          name:'Claude (Anthropic, enterprise)',   ver:'—',              st:'Approved',      note:'Coding agent and in-app AI' },
];

export const FLOWS: Record<string, { name: string; nodes: [string,string,string][]; rules: [string,string][] }> = {
  'APR-01': {
    name: 'Highly Restricted contact creation',
    nodes: [['hum','Request','Contact Owner or EA creates contact'],['sys','Checks','Duplicate check, confidentiality set'],['hum','Contact Administrator','Reviews purpose and data'],['hum','Executive Sponsor','BG CEO approves; EA may act on behalf'],['end','Live','Visible only to the named access list']],
    rules: [['Rejection','Requester told the reason; record stays as draft'],['SLA','2 business days; reminder after 1 day'],['Escalation','After 2 days, to Group CEO office'],['Audit','Both approvers, timestamps and comments kept 7 years']],
  },
  'APR-02': {
    name: 'Update validation from connected sources',
    nodes: [['sys','Change proposed','From Outlook, Covve scan or ERP'],['hum','Contact Owner','Confirms, corrects or rejects'],['sys','Day 5','Reminder to Contact Owner'],['hum','Day 10','Escalated to Contact Administrator'],['stop','Day 15','Record auto-blocked until reviewed']],
    rules: [['At any step','Confirmation applies the change and closes the request'],['Blocked records','Hidden from search except for administrators'],['Bulk','Owner can confirm up to 50 changes at once'],['Audit','Old and new values kept']],
  },
  'APR-03': {
    name: 'Duplicate merge',
    nodes: [['sys','Match found','Name, email or phone, 65%+'],['hum','Contact Owner','Chooses which values to keep'],['hum','Contact Administrator','Only if either record is Restricted'],['end','Merged','One record, history of both kept']],
    rules: [['Not a duplicate','Pair is remembered and not suggested again'],['Undo','Merge can be undone within 30 days'],['Auto-merge','Never — a human always decides']],
  },
  'APR-04': {
    name: 'Access to Restricted contacts',
    nodes: [['hum','Request','User asks with a business reason'],['hum','Line manager','Confirms the need'],['hum','Contact Administrator','Grants access'],['sys','Access for 90 days','Owner notified'],['end','Expires','Renewal needs a new request']],
    rules: [['Highly Restricted','Not available through this flow; Executive Sponsor only'],['Revocation','Owner or Administrator can revoke at any time'],['Audit','Every grant and view logged']],
  },
  'APR-05': {
    name: 'External contact self-update',
    nodes: [['hum','External contact','Edits own phone, email or title'],['sys','Held','Change is not live yet'],['hum','Contact Owner','Validates within 5 days'],['end','Live','Contact receives confirmation']],
    rules: [['No response','Same reminder rules as APR-02'],['Scope','External contacts never see confidentiality level or internal notes']],
  },
};

export const MOCKS = [
  { id:'M01', name:'Sign-in, EN/FR',             wf:'login',    inc:1, st:'signed',  ver:'v2', req:'FR-01', pins:[], comments:[] },
  { id:'M02', name:'Choose role',                wf:'roles',    inc:1, st:'signed',  ver:'v1', req:'FR-02', pins:[], comments:[] },
  { id:'M03', name:'Role dashboard',             wf:'dash',     inc:1, st:'signed',  ver:'v3', req:'FR-02, FR-10', pins:[], comments:[] },
  { id:'M04', name:'Contact directory',          wf:'list',     inc:2, st:'signed',  ver:'v2', req:'FR-03', pins:[], comments:[] },
  { id:'M05', name:'Create contact',             wf:'form',     inc:2, st:'signed',  ver:'v2', req:'FR-04, FR-05', pins:[], comments:[] },
  { id:'M06', name:'Contact record',             wf:'record',   inc:2, st:'signed',  ver:'v2', req:'FR-05, FR-10', pins:[], comments:[] },
  { id:'M07', name:'Update validation queue',    wf:'queue',    inc:3, st:'review',  ver:'v3', req:'FR-08, APR-02',
    pins:[[62,38,'1'],[30,70,'2'],[78,78,'3']],
    comments:[['Julien Perrot, Contact Owner','Can I confirm several updates at once? I get 20 a week from Outlook.','Claude added bulk confirm in v3.'],['Nadia Haddad, Business Owner','Show how many days are left before the record is blocked.','Added a day counter in v3.'],['Julien Perrot, Contact Owner','Colour for "escalated" is hard to tell from "reminder sent".','Open']] },
  { id:'M08', name:'Highly Restricted approval', wf:'approval', inc:3, st:'changes', ver:'v2', req:'APR-01',
    pins:[[70,72,'1'],[35,45,'2']],
    comments:[['Sophie Laurent, Executive Assistant','I need to show I am approving on behalf of Philippe Nguyen.','Changes requested'],['Nadia Haddad, Business Owner','Reason for rejection must be mandatory.','Changes requested']] },
  { id:'M09', name:'Import and card scan',       wf:'import',   inc:4, st:'signed',  ver:'v1', req:'FR-06, FR-07', pins:[], comments:[] },
  { id:'M10', name:'Duplicate merge',            wf:'merge',    inc:4, st:'signed',  ver:'v1', req:'FR-09, APR-03', pins:[], comments:[] },
  { id:'M11', name:'Mobile home',                wf:'mobile',   inc:5, st:'draft',   ver:'v1', req:'FR-12', pins:[], comments:[] },
];

export const INC: Record<number,string> = { 1:'Days 4–5', 2:'Days 6–7', 3:'Days 8–10', 4:'Day 11', 5:'Day 12' };

export const EPICS = [
 { id:'E1', name:'Foundation', inc:1, feats:[
   { id:'F1.1', name:'Sign-in and bilingual shell',        req:'FR-01',              mock:'M01', dep:'—',
     blocks:[['B1.1.1','Entra ID sign-in',120,6,'done'],['B1.1.2','Language switch EN/FR',90,5,'done'],['B1.1.3','App shell and navigation',160,7,'done']] },
   { id:'F1.2', name:'Roles and confidentiality model',   req:'FR-02, FR-05, NFR-01',mock:'M02', dep:'F1.1',
     blocks:[['B1.2.1','Dataverse security roles',140,9,'done'],['B1.2.2','Confidentiality field rules',180,12,'done'],['B1.2.3','Access log',110,6,'done'],['B1.2.4','Role dashboards',200,8,'done']] },
 ]},
 { id:'E2', name:'Directory and contact creation', inc:2, feats:[
   { id:'F2.1', name:'Search directory',    req:'FR-03',           mock:'M04', dep:'F1.2',
     blocks:[['B2.1.1','Search service',150,10,'done'],['B2.1.2','Results grid and filters',210,8,'done'],['B2.1.3','Scope by confidentiality',130,11,'done']] },
   { id:'F2.2', name:'Create contact',      req:'FR-04, FR-05',    mock:'M05', dep:'F2.1',
     blocks:[['B2.2.1','Contact form and validation',190,9,'done'],['B2.2.2','Real-time duplicate check',170,10,'done'],['B2.2.3','Save draft',80,4,'done']] },
   { id:'F2.3', name:'Contact record',      req:'FR-05, FR-10',    mock:'M06', dep:'F2.2',
     blocks:[['B2.3.1','Record view',180,6,'done'],['B2.3.2','Interaction log',150,7,'done']] },
 ]},
 { id:'E3', name:'Validation and approvals', inc:3, feats:[
   { id:'F3.1', name:'Update validation queue (APR-02)',     req:'FR-08, APR-02',  mock:'M07', dep:'F2.3',
     blocks:[['B3.1.1','Proposed-change model',120,8,'done'],['B3.1.2','Review queue with bulk confirm',220,11,'done'],['B3.1.3','Reminder and escalation scheduler',160,12,'review'],['B3.1.4','Auto-block and unblock',90,6,'todo']] },
   { id:'F3.2', name:'Highly Restricted approval (APR-01)', req:'APR-01, CR-02',   mock:'M08', dep:'F1.2',
     blocks:[['B3.2.1','Approval request and routing',150,11,'review'],['B3.2.2','Approver inbox and decision',164,9,'prog'],['B3.2.3','SLA reminders and escalation',100,6,'todo'],['B3.2.4','Approval audit trail',90,5,'todo']] },
   { id:'F3.3', name:'Access requests (APR-04)',             req:'APR-04',          mock:'M06', dep:'F3.2',
     blocks:[['B3.3.1','Request form and routing',140,7,'todo'],['B3.3.2','Time-bound grant',110,8,'todo'],['B3.3.3','Expiry job and notice',80,5,'todo']] },
 ]},
 { id:'E4', name:'Import, scan and duplicates', inc:4, feats:[
   { id:'F4.1', name:'Import CSV, Excel, vCard', req:'FR-06', mock:'M09', dep:'F2.2',
     blocks:[['B4.1.1','File parser',170,10,'todo'],['B4.1.2','Mapping and preview',200,8,'todo']] },
   { id:'F4.2', name:'Business-card scan',        req:'FR-07', mock:'M09', dep:'F4.1',
     blocks:[['B4.2.1','Scan service via Boomi',150,7,'todo'],['B4.2.2','Review extracted fields',140,6,'todo']] },
   { id:'F4.3', name:'Duplicate merge (APR-03)',  req:'FR-09, APR-03', mock:'M10', dep:'F2.2',
     blocks:[['B4.3.1','Match engine',180,12,'todo'],['B4.3.2','Merge screen and approval',190,9,'todo']] },
 ]},
 { id:'E5', name:'Mobile, portal and languages', inc:5, feats:[
   { id:'F5.1', name:'Mobile experience',              req:'FR-12',          mock:'M11', dep:'E2',
     blocks:[['B5.1.1','Responsive layouts',200,6,'todo'],['B5.1.2','Camera scan on phone',120,5,'todo']] },
   { id:'F5.2', name:'External contact portal',        req:'FR-11, APR-05',  mock:'M06', dep:'F3.1',
     blocks:[['B5.2.1','Portal sign-in',130,6,'todo'],['B5.2.2','Self-update and hold',150,8,'todo']] },
   { id:'F5.3', name:'Czech language (CR-03)',          req:'NFR-06',         mock:'—',   dep:'F1.1',
     blocks:[['B5.3.1','Czech resource files',60,3,'cr'],['B5.3.2','Czech email templates',70,3,'cr']] },
 ]},
];

export const CRS_INIT = [
  { id:'CR-01', title:'French labels in approval emails',    type:'Scope',              impact:'+1 block, 1 hour, AI ≈ €4; go-live unchanged',                                     route:'Product Owner',            st:'Approved' },
  { id:'CR-02', title:'EA may approve on behalf of CEO',     type:'Scope + security',   impact:'+2 blocks, 3 h Claude + half a day review, AI ≈ €19; go-live unchanged',           route:'Product Owner, Architect', st:'Approved' },
  { id:'CR-03', title:'Add Czech language for plants',       type:'Scope',              impact:'+2 blocks in increment 5, about half a day incl. review, AI ≈ €11; go-live unchanged', route:'Product Owner',         st:'Pending' },
];

export const PRS_INIT = [
  { n:218, tok:4.2,  b:'B3.2.2', t:'Approver inbox and decision',          lines:164, ai:'Not started',   hu:'—',                            st:'Draft' },
  { n:214, tok:5.6,  b:'B3.2.1', t:'Approval request and routing',         lines:150, ai:'3 findings',    hu:'Awaiting peer review',          st:'Needs review' },
  { n:216, tok:9.8,  b:'B3.1.3', t:'Reminder and escalation scheduler',    lines:160, ai:'2 findings',    hu:'Changes requested',             st:'Changes requested' },
  { n:209, tok:7.4,  b:'B3.1.2', t:'Review queue with bulk confirm',       lines:220, ai:'Passed',        hu:'Approved by A. Kulkarni',       st:'Merged' },
];

export const FINDINGS_INIT = [
  { id:1, sev:'Medium', cat:'Security',        t:'Sponsor lookup trusts a value sent from the browser',   d:'The Business Group comes from the request body. Claude proposes reading it from the stored contact instead.', st:'open' },
  { id:2, sev:'Low',    cat:'Maintainability', t:'Routing rules live inside the screen component',         d:'Move them to approvals/routing.ts so the screen stays thin and the rules can be tested alone.',              st:'open' },
  { id:3, sev:'Info',   cat:'Performance',     t:'Sponsor list could be cached',                           d:"Claude's own view: not needed yet at current volumes. Recommend rejecting to keep the block small.",         st:'open' },
];

export const SCRIPTS_INIT = [
  { id:'TS-FR03-01',  t:'Search hides records above the user\'s access',   req:'FR-03',  type:'End-to-end', src:'Claude',    st:'Approved',        res:'Pass' },
  { id:'TS-FR04-02',  t:'Duplicate warning shown at 65% match',            req:'FR-04',  type:'Integration',src:'Claude',    st:'Approved',        res:'Pass' },
  { id:'TS-FR05-01',  t:'View of Highly Restricted record is logged',      req:'FR-05',  type:'Security',   src:'Claude',    st:'Approved',        res:'Pass' },
  { id:'TS-APR02-01', t:'Reminder sent to Contact Owner on day 5',         req:'APR-02', type:'Integration',src:'Claude',    st:'Approved',        res:'Pass' },
  { id:'TS-APR02-02', t:'Escalation to Administrator on day 10',           req:'APR-02', type:'Integration',src:'Claude',    st:'Approved',        res:'Pass' },
  { id:'TS-APR02-03', t:'Record auto-blocked on day 15',                   req:'APR-02', type:'End-to-end', src:'Claude',    st:'Approved',        res:'Pass' },
  { id:'TS-APR02-04', t:'Bulk confirm of 50 changes',                      req:'APR-02', type:'Performance',src:'Developer', st:'Approved',        res:'Pass' },
  { id:'TS-APR01-01', t:'Request routed to Contact Administrator',         req:'APR-01', type:'Integration',src:'Claude',    st:'Awaiting review', res:'—' },
  { id:'TS-APR01-02', t:'Sponsor taken from contact\'s Business Group',    req:'APR-01', type:'Security',   src:'Claude',    st:'Awaiting review', res:'—' },
  { id:'TS-APR01-03', t:'EA approves on behalf of CEO, both names logged', req:'APR-01', type:'End-to-end', src:'Claude',    st:'Awaiting review', res:'—' },
  { id:'TS-APR01-04', t:'Approver cannot approve own request',             req:'APR-01', type:'Security',   src:'Claude',    st:'Awaiting review', res:'—' },
  { id:'TS-APR01-05', t:'Rejection needs a reason',                        req:'APR-01', type:'Unit',       src:'Claude',    st:'Awaiting review', res:'—' },
  { id:'TS-APR01-06', t:'Escalation to CEO office after 2 days',          req:'APR-01', type:'Integration',src:'Claude',    st:'Awaiting review', res:'—' },
  { id:'TS-APR01-07', t:'Approver sees approval request in French',        req:'APR-01', type:'End-to-end', src:'Developer', st:'Awaiting review', res:'—' },
];

export const RESULTS = [
  { suite:'Sign-in and roles',                  total:18, pass:18, fail:0, skip:0, time:'0:32', evidence:'Log' },
  { suite:'Search and confidentiality',         total:34, pass:34, fail:0, skip:0, time:'1:05', evidence:'Log, screenshots' },
  { suite:'Create and duplicate check',         total:26, pass:26, fail:0, skip:0, time:'0:48', evidence:'Log' },
  { suite:'Update validation (APR-02)',         total:29, pass:29, fail:0, skip:0, time:'0:57', evidence:'Video of day 5/10/15' },
  { suite:'Highly Restricted approval (APR-01)',total:22, pass:22, fail:0, skip:0, time:'0:44', evidence:'Video, audit export' },
  { suite:'Access requests (APR-04)',           total:17, pass:17, fail:0, skip:0, time:'0:29', evidence:'Log' },
  { suite:'Duplicate merge (APR-03)',           total:15, pass:15, fail:0, skip:0, time:'0:26', evidence:'Screenshots' },
  { suite:'Import and scan',                    total:21, pass:19, fail:0, skip:2, time:'0:40', evidence:'2 skipped: scan sandbox offline' },
  { suite:'Security (OWASP, field-level)',      total:20, pass:20, fail:0, skip:0, time:'0:36', evidence:'Scan report' },
  { suite:'Accessibility',                      total:12, pass:12, fail:0, skip:0, time:'0:24', evidence:'Axe report' },
];

export const UAT_INIT = [
  { id:'UAT-01', t:'Find a customer contact I\'m allowed to see',          who:'Amara Okafor',  r:'Senior Leader',       st:'Passed',   crit:true,  note:'' },
  { id:'UAT-04', t:'Create a Restricted contact and see the duplicate warning', who:'Julien Perrot', r:'Contact Owner',  st:'Passed',   crit:true,  note:'' },
  { id:'UAT-06', t:'Confirm 20 Outlook updates in one go',                 who:'Julien Perrot',  r:'Contact Owner',      st:'Passed',   crit:false, note:'' },
  { id:'UAT-07', t:'Approve a Highly Restricted contact',                  who:'Nadia Haddad',   r:'Contact Administrator', st:'Passed', crit:true, note:'' },
  { id:'UAT-08', t:'Receive reminder on day 5 (test clock)',               who:'Julien Perrot',  r:'Contact Owner',      st:'Passed',   crit:true,  note:'' },
  { id:'UAT-09', t:'Approve on behalf of the CEO',                         who:'Sophie Laurent', r:'Executive Assistant', st:'Failed',  crit:true,  note:'DEF-31: audit shows only EA\'s name' },
  { id:'UAT-10', t:'Update my own phone number',                           who:'Elena Kovac',    r:'External Contact',   st:'Feedback', crit:false, note:'Expected a message saying it needs validation. Triaged as CR-05' },
  { id:'UAT-11', t:'Request access to a Restricted contact',               who:'Amara Okafor',   r:'Senior Leader',      st:'Not run',  crit:false, note:'' },
  { id:'UAT-12', t:'Blocked record hidden from search',                    who:'Nadia Haddad',   r:'Contact Administrator', st:'Passed', crit:true, note:'' },
];

export const TESTERS = [
  { ini:'NH', name:'Nadia Haddad',    role:'Contact Administrator',     done:12, total:12 },
  { ini:'JP', name:'Julien Perrot',   role:'Contact Owner',             done:10, total:11 },
  { ini:'SL', name:'Sophie Laurent',  role:'Executive Assistant',       done:7,  total:8  },
  { ini:'AO', name:'Amara Okafor',    role:'Senior Leader',             done:6,  total:7  },
  { ini:'EK', name:'Elena Kovac',     role:'External Contact (pilot)',  done:3,  total:4  },
];

export const EXIT_INIT = [
  { crit:'All 42 scenarios executed',                            met:false, note:'38 of 42' },
  { crit:'All critical scenarios passed',                        met:false, note:'UAT-09 failed' },
  { crit:'No open severity 1 or 2 defects',                      met:false, note:'DEF-31 open' },
  { crit:'Feedback triaged into defects or change requests',     met:true,  note:'CR-05 logged' },
  { crit:'Synthetic data only in Quality',                       met:true,  note:'Verified' },
];

export const ISSUES_INIT = [
  { n:71, t:'Excel export drops accents (e.g. Société Générale)', type:'Bug',         sev:'S3', st:'Fix ready for build 1.0.0-rc4' },
  { n:69, t:'Czech interface for plants',                         type:'Request',     sev:'—',  st:'CR-03 in plan approval' },
  { n:66, t:'Outlook sync repeats phone numbers',                 type:'Bug',         sev:'S3', st:'Claude investigating' },
  { n:63, t:'Search slower with Restricted filter',               type:'Performance', sev:'S4', st:'Block B2.1.4 added, increment 4' },
];

export type GateStep = [string, string, 'done'|'pending'|'wait'|'rej', string?, string?];
export interface Gate {
  stage: string;
  title: string;
  sub: string;
  needs?: string;
  steps: GateStep[];
}

export const GATES_INIT: Record<string, Gate> = {
  G1:  { stage:'requirements', title:'G1 Requirements sign-off',    sub:'DRD v1.3',
         steps:[['ai','Claude drafted v1.3','done','24 Sep'],['tl','Developer feasibility review','done','25 Sep'],['bo','Business sign-off','pending'],['po','Baseline requirements','wait']] },
  G2:  { stage:'design',       title:'G2 Mockup sign-off',          sub:'Increment 3: M07 update validation queue',
         steps:[['dev','Developer documented v3','done','23 Sep'],['po','Shown in daily business review','done','24 Sep'],['bo','Business sign-off','pending']] },
  G2b: { stage:'design',       title:'G2 Design document approval', sub:'Solution Design v1.1',
         steps:[['ai','Claude drafted from template','done','15 Sep'],['arch','Architecture review','done','16 Sep'],['sec','Security and DPIA review','pending']] },
  G3:  { stage:'plan',         title:'G3 Plan change approval',     sub:'Plan v1.3 (CR-03 Czech)',
         steps:[['ai','Claude impact analysis','done','25 Sep'],['tl','Tech Lead check','done','25 Sep'],['po','Product Owner approval','pending']] },
  G4:  { stage:'code',         title:'G4 Block ready for review',   sub:'B3.2.2 approver inbox',    needs:'g4',
         steps:[['ai','Guardrails passed','done','10:16'],['dev','Developer confirms','pending']] },
  G5:  { stage:'review',       title:'G5 Human code review',        sub:'PR #214, B3.2.1',          needs:'g5',
         steps:[['ai','Claude review, 3 findings','done','24 Sep'],['tl','Peer review','pending'],['arch','Architect review (security roles touched)','wait']] },
  G6:  { stage:'test',         title:'G6 Test script review',       sub:'Batch 7: 7 scripts for APR-01',
         steps:[['ai','Claude drafted scripts','done','24 Sep'],['qa','QA Lead approves scripts','pending']] },
  G7:  { stage:'test',         title:'G7 Test results review',      sub:'Run #58, build 1.0.0-rc3', needs:'g7',
         steps:[['ai','Claude ran 214 tests','done','25 Sep'],['dev','Developer extra tests','done','25 Sep'],['qa','QA Lead reviews all results','pending']] },
  G8:  { stage:'uat',          title:'G8 UAT sign-off',             sub:'Final UAT, days 13 and 14', needs:'uatexit',
         steps:[['qa','Exit criteria confirmed','pending'],['bo','Business Owner signs off UAT','wait']] },
  G9:  { stage:'deploy',       title:'G9 Production go-live',       sub:'Release 1.0.0, CHG-20931', needs:'g8done',
         steps:[['ai','Claude prepared release and CAB form','done','25 Sep'],['cab','CAB approval','pending'],['bo','Business go-live decision','wait']] },
  G10: { stage:'maintain',     title:'G10 Fix approval',            sub:'Issue #71, build 1.0.0-rc4',
         steps:[['ai','Claude fix with 3 tests','done','26 Sep'],['tl','Tech Lead review','pending'],['po','spec.md change approved','wait']] },
  GF1: { stage:'budgets',      title:'Budget increase request',     sub:'Warranty Claims Tracker +€150 for September',
         steps:[['ai','Claude cost analysis: 38% of overspend from one looping block','done','26 Sep'],['pl','Practice Lead approves','pending'],['finops','FinOps Owner releases budget','wait']] },
};

export const AUDIT_INIT = [
  { time:'26 Sep 08:40', who:'Build Studio',   action:'Loop breaker paused Warranty Claims Tracker B4.1.2 at 8 failed runs' },
  { time:'25 Sep 18:10', who:'P. Deshmukh',    action:'Approved test script batch 6 (G6)' },
  { time:'25 Sep 16:02', who:'A. Kulkarni',    action:'Developer review of DRD v1.3 (G1)' },
  { time:'24 Sep 15:30', who:'M. Dubois',      action:'Showed M07 in daily business review (G2)' },
  { time:'24 Sep 11:12', who:'A. Kulkarni',    action:'Approved PR #209 (G5)' },
  { time:'16 Sep 17:05', who:'L. Fontaine',    action:'Approved Solution Design v1.1 architecture (G2)' },
];

export const CLAUDE_TALK: Record<string, { ctx: string; m: [string,string][]; chips: string[] }> = {
  requirements: { ctx:'Requirements, DRD v1.3', chips:['Show changes since v1.2','Check for contradictions','Explain APR-02 simply'],
    m:[['u','Turn my prompt into a proper requirement document.'],['a','Done on the Detailed Requirement Document v2.1 template: 12 functional requirements, 5 approval flows, 6 non-functional requirements. I found 4 gaps and listed them as open questions instead of guessing.'],['u','What changed in v1.3?'],['a','Only CR-03: Czech added to NFR-06. Everything else is unchanged from the signed-off v1.2, so the business owner only needs to review that change.']] },
  design: { ctx:'Design, increment 3 mockups', chips:['Create M07 v4','Summarise business comments','Check design against DRD'],
    m:[['u','Julien says escalated and reminder colours look too similar.'],['a',"I'll make 'escalated' use the warning colour with an icon and label, so it doesn't rely on colour alone. That will be M07 v4 for your review."],['u','Which technologies did we choose?'],['a','React with TypeScript as a Power Apps code app, Dataverse, Boomi and Entra ID. All are on the permitted list.']] },
  plan: { ctx:'Plan v1.3 draft', chips:['What would move go-live?','Which blocks wait for review?','Split B3.1.2'],
    m:[['u','Why is B3.1.2 at 220 lines?'],['a','Bulk confirm added logic to the queue. It\'s still under the 300 limit. If it grows, I\'ll split it into \'queue\' and \'bulk confirm\' blocks.'],['u','Why 15 days and not 3?'],['a','My build time for all 38 blocks is about 20 hours. The rest is people: reviewing each block, signing off requirements and designs, UAT and CAB. Those gates are what make the code maintainable, so I don\'t try to go faster than the reviewers.']] },
  code: { ctx:'Code, block B3.2.2', chips:['Why 5 files?','Show the tests','Explain for a business user'],
    m:[['a','B3.2.2 is built: 164 lines across 5 files, and all 9 block tests pass. I stopped before starting B3.2.3.'],['u','Explain the on-behalf logic simply.'],['a','When Sophie approves, the app checks she is Philippe\'s assistant in the delegation table. It then records the decision under both names, so the audit trail shows \'Sophie Laurent on behalf of Philippe Nguyen\'.']] },
  review: { ctx:'Review, PR #214', chips:['Apply finding 1 fix','Why is architect review needed?','Compare with PR #209'],
    m:[['a','I found 3 things in PR #214. The security one matters: the sponsor should come from the stored contact, not from the browser.'],['u','Should we cache the sponsor list?'],['a','Not now. Volumes are low and caching adds code to maintain. I suggest rejecting finding 3 and revisiting if search slows down.']] },
  test: { ctx:'Test, run #58', chips:['Which requirements lack tests?','Explain a script','Re-run skipped tests'],
    m:[['u','How did you create these test scripts?'],['a','Each acceptance criterion in spec.md becomes at least one plain-language scenario. After QA approves the scenarios, I write the automated test. APR-01 has 7 criteria, so it has 7 scripts in batch 7.'],['u','Why were 2 tests skipped?'],['a','The business-card scan sandbox from the vendor was offline. Those 2 tests will run again tonight, and I\'ll flag them if they still can\'t run.']] },
  uat: { ctx:'UAT, Quality environment', chips:['Draft UAT summary','Who hasn\'t finished testing?','Explain the test clock'],
    m:[['u','What did Elena\'s feedback turn into?'],['a','It\'s a change request, not a defect. The app works as specified, but she expected a message saying her change needs validation. I logged it as CR-05 for the Product Owner.'],['u','And UAT-09?'],['a','That\'s a real defect, DEF-31, severity 2. The audit trail only shows Sophie\'s name. The fix goes back to block B3.2.2, with a new test.']] },
  deploy: { ctx:'Deploy, release 1.0.0', chips:['Show rollback plan','Draft go-live email','What\'s behind feature flags?'],
    m:[['a','I\'ve pre-filled CAB change CHG-20931. It includes the release scope, test evidence, UAT results and a rollback plan: if smoke tests fail, the app is hidden and current contact lists stay in use.'],['u','Can we go live before UAT is signed off?'],['a','No. G9 stays locked until G8 is approved. That rule is part of the platform, not something I can override.']] },
  maintain: { ctx:'Maintain, pilot issues', chips:['Summarise this month','Prioritise issues','Check outdated packages'],
    m:[['u','Fix issue 71.'],['a','The export used the wrong character encoding. I fixed it as one block with 3 tests, including \'Société Générale\'. The fix is waiting for Tech Lead review under G10.'],['u','Did anything else change?'],['a','Yes, one line in spec.md: FR-06 now says exports keep accents. The Product Owner approves that as part of G10.']] },
  workspace: { ctx:'Spec files', chips:['What\'s in CLAUDE.md?','Show APR-01 trace','Is the spec in sync?'],
    m:[['u','Why keep intent, spec and plan as files?'],['a','Because I read them before every block. The code then follows agreed requirements and rules rather than my guesses. A new developer, or a new Claude session, starts from the same truth.']] },
  approvals: { ctx:'Approvals inbox', chips:['What\'s waiting longest?','Who is blocking release?'],
    m:[['a','Switch \'Viewing as\' to act as each approver. A button only unlocks for the person whose turn it is, and checklists must be complete first.']] },
  templates: { ctx:'Templates', chips:['Compare template versions','Which stages lack templates?'],
    m:[['u','What happens when we upload a new DRD template?'],['a','New documents use it right away. Signed-off documents keep their version, so the audit trail stays valid. I follow its headings and guidance notes.']] },
  tech: { ctx:'Permitted technologies', chips:['Draft technology request','What changed this quarter?'],
    m:[['u','A developer wants MongoDB.'],['a','It isn\'t permitted, so the build would fail. I\'d suggest Dataverse or Azure SQL, or a technology request to the Architecture board.']] },
  finops: { ctx:'Token FinOps, usage', chips:['What\'s driving costs?','Forecast end of month','Show savings'],
    m:[['u','What\'s costing most this month?'],['a','Code stage, mostly Sonnet with prompt caching. The loop breaker caught Warranty Claims Tracker before it got too expensive.']] },
  budgets: { ctx:'Budgets and controls', chips:['Which project is near its cap?','Review guardrails','Model routing'],
    m:[['u','When does the hard stop kick in?'],['a','At 120% of budget. Running blocks finish; new ones are blocked until the Practice Lead approves more. The budget request panel is just below.']] },
};

export const FILES: Record<string, { meta: string; body: string }> = {
  'intent.md': { meta:'v1.2, approved by Nadia Haddad and M. Dubois', body:`# Intent: ContactHUB

## Why
OPmobility's external relationships (OEM customers, suppliers, investors,
officials, board members) are spread across mailboxes, spreadsheets and
personal phones. Sensitive contacts are not protected and data goes stale.

## Outcomes we want
INT-1  One trusted record per external contact across the Group
INT-2  Sensitive relationships protected by confidentiality and approvals
INT-3  Data kept current by the people accountable for it
INT-4  Executives walk into every meeting with context

## Who it is for
CEO / Board, Executive Assistants, Senior Leaders, Contact Owners,
Contact Administrators, System Administrators, External Contacts

## Not in scope
- Marketing campaigns and newsletters (stays in the marketing tool)
- Customer opportunities and pipeline (stays in CRM)

## How we will know it worked
- 95% of pending updates confirmed within 10 days
- Zero views of Highly Restricted records without access
- Duplicate rate below 2% after 6 months` },
  'spec.md': { meta:'v1.3 draft, generated from DRD v1.3', body:`# Spec: ContactHUB   (traces to intent.md)

## APR-01  Highly Restricted contact creation      [INT-2]
A contact marked Highly Restricted is not live until approved.

Flow: Requester -> Contact Administrator -> Executive Sponsor -> Live

Acceptance criteria
AC-1  Request goes to the Contact Administrator queue on save
AC-2  Executive Sponsor = CEO of the contact's Business Group,
      read from the stored contact, never from the browser
AC-3  Approver sees purpose, requester and data summary
AC-4  Nobody can approve their own request
AC-5  An Executive Assistant may approve on behalf of their executive;
      the audit trail records both names              (CR-02)
AC-6  Rejection requires a reason, shown to the requester
AC-7  No decision in 2 business days -> Group CEO office

## APR-02  Update validation from connected sources [INT-3]
AC-1  Proposed changes never overwrite a live value
AC-2  Reminder day 5, escalate day 10, auto-block day 15
AC-3  Owner can confirm up to 50 changes at once

## NFR-01  Confidentiality is enforced on the server, not only hidden in the UI` },
  'plan.md': { meta:'v1.3 draft, pending Product Owner (G3)', body:`# Plan: ContactHUB   (traces to spec.md)

Rules: one responsibility per block, <= 300 changed lines, <= 8 files,
tests first, one PR per block, behind a feature flag.

## Increment 3  (days 8-10, 23-25 Sep)   no sprints: blocks flow continuously
### F3.1 Update validation queue          APR-02   mockup M07
- [x] B3.1.1 Proposed-change model                 120 lines
- [x] B3.1.2 Review queue with bulk confirm        220 lines
- [~] B3.1.3 Reminder and escalation scheduler     160 lines   PR #216
- [ ] B3.1.4 Auto-block and unblock                 90 lines

### F3.2 Highly Restricted approval       APR-01   mockup M08
- [~] B3.2.1 Approval request and routing          150 lines   PR #214
- [~] B3.2.2 Approver inbox and decision           164 lines   PR #218
- [ ] B3.2.3 SLA reminders and escalation          100 lines
- [ ] B3.2.4 Approval audit trail                   90 lines

## Change log
v1.1  CR-01 French labels in approval emails
v1.2  CR-02 EA approves on behalf of CEO (+2 blocks, +4 days)
v1.3  CR-03 Czech language (+2 blocks, increment 5)   <- awaiting G3

Go-live: Sat 3 Oct (unchanged by v1.1 to v1.3)` },
  'CLAUDE.md': { meta:"From template 'CLAUDE.md coding standards v1.2'", body:`# CLAUDE.md: rules for this repository

## Before writing code
1. Read intent.md, the spec section and the task card for the block
2. If the spec is unclear, stop and ask. Never guess requirements
3. Work on ONE block from plan.md. Never start the next block

## Permitted stack (from Build Studio, do not add others)
Front end : React 19 + TypeScript 5 (Power Apps code app)
Data      : Microsoft Dataverse
Workflow  : Power Automate for notifications only
Integration: Boomi (never call SAP or ERP directly)
Tests     : Vitest (unit), Playwright (end-to-end)

## Size and structure
- Max 300 changed lines and 8 files per block
- Functions under 40 lines, complexity under 10
- Folders: src/<feature>/{components,services,rules}
- Business rules live in rules/, never inside components
- Names in plain English matching spec terms

## Tests
- Write tests from acceptance criteria BEFORE the code
- Never edit a test just to make it pass. Explain and ask instead

## Security
- Confidentiality is checked on the server for every read and write
- No secrets in code. Use Key Vault references

## When done
Update plan.md checkbox, write a plain-language summary, then STOP` },
  'decisions/ADR-002.md': { meta:'Approved by L. Fontaine, 15 Sep', body:`# ADR-002: Approval engine for APR-01 to APR-05

## Status
Accepted

## Context
Five approval flows with reminders, escalation, delegation (CR-02)
and a 7-year audit requirement.

## Decision
B. One ApprovalRequest table and one ApprovalStep table for all flows.

## Why
- Audit and delegation fully under our control
- One pattern for five flows: easier to maintain
- No new technology outside the permitted list

## Consequences
- Reminder timing handled by a scheduled flow reading ApprovalStep
- Test clock in Quality can shift dates for UAT` },
  'tasks/B3.2.2.md': { meta:'Task card, created by Claude from plan.md', body:`# Task B3.2.2: Approver inbox and decision

Feature : F3.2 Highly Restricted approval
Spec    : APR-01 AC-3, AC-4, AC-5, AC-6
Mockup  : M08 v2 (changes requested: on-behalf label, mandatory reason)
Depends : B3.2.1 (routing), ADR-002

## Do
- List pending approvals for the signed-in approver
- Approve / Reject with comment; reason mandatory on reject
- Support "on behalf of" for Executive Assistants (CR-02)

## Do not
- Change routing logic (belongs to B3.2.1)
- Add new libraries

## Done when
- 9 block tests pass and full suite stays green
- Under 300 lines, 8 files
- plan.md updated and summary written` },
  'tests/TS-APR01-03.feature': { meta:'Awaiting QA review (G6)', body:`Feature: Executive Assistant approves on behalf of the CEO   (APR-01 AC-5)

  Background:
    Given Sophie Laurent is Executive Assistant to Philippe Nguyen
    And a Highly Restricted contact "Heinrich Vogel" awaits sponsor approval

  Scenario: EA approves on behalf of the CEO
    When Sophie approves the request on behalf of Philippe Nguyen
    Then the contact becomes live
    And the audit trail shows "Sophie Laurent on behalf of Philippe Nguyen"

  Scenario: EA cannot approve for someone else's executive
    Given Sophie is not the assistant of Amara Okafor
    When Sophie opens a request sponsored by Amara Okafor
    Then the Approve button is not available
    And the server rejects a direct approval call` },
};

export const POLICIES_INIT = [
  { id:'P1', t:'Block token ceiling',      d:'Pause Claude when a block uses more than 2× its token estimate. A Tech Lead decides whether to resume, split or stop.', v:'2× estimate', on:true },
  { id:'P2', t:'Loop breaker',             d:'Stop after 8 consecutive failed test runs on the same block. Prevents an agent burning tokens on a problem it cannot solve.', v:'8 attempts', on:true },
  { id:'P3', t:'Opus by exception',        d:'Opus is the default only for requirements, architecture and security-sensitive review. Other use needs a one-line justification.', v:'Target under 25% of spend', on:true },
  { id:'P4', t:'Batch for non-urgent work',d:'Nightly regression test generation, documentation and release notes run through the Batch API at a lower rate.', v:'−50% on eligible work', on:true },
  { id:'P5', t:'Prompt caching enforced',  d:'CLAUDE.md, spec.md and repository context are cached. Alert when a project\'s cache hit rate falls below 70%.', v:'Alert under 70%', on:true },
  { id:'P6', t:'Context hygiene',          d:'Claude loads only the spec sections and files a block needs, never the whole repository.', v:'Max 150k tokens per request', on:true },
  { id:'P7', t:'Idle session timeout',     d:'Close agent sessions after 30 minutes without developer activity.', v:'30 minutes', on:true },
  { id:'P8', t:'Personal monthly caps',    d:'Each person has a monthly cap by tier. Reaching it pauses new work until the Practice Lead approves more.', v:'Pro €150, Citizen €30', on:true },
];

export const ROUTING = [
  { task:'Requirements and DRD',              def:'opus',   allowed:'Opus, Sonnet',         citizen:'Sonnet' },
  { task:'Architecture and design document',  def:'opus',   allowed:'Opus, Sonnet',         citizen:'Not allowed' },
  { task:'Mockup generation',                 def:'sonnet', allowed:'Sonnet, Haiku',        citizen:'Sonnet, Haiku' },
  { task:'Block coding',                      def:'sonnet', allowed:'Sonnet, Opus with reason', citizen:'Sonnet' },
  { task:'Code review, security-sensitive',   def:'opus',   allowed:'Opus',                 citizen:'Pro developer reviews' },
  { task:'Code review, standard',             def:'sonnet', allowed:'Sonnet',               citizen:'Pro developer reviews' },
  { task:'Test scripts from acceptance criteria', def:'sonnet', allowed:'Sonnet, Haiku',   citizen:'Haiku' },
  { task:'Lint, format, code comments',       def:'haiku',  allowed:'Haiku',                citizen:'Haiku' },
  { task:'UAT feedback triage',               def:'haiku',  allowed:'Haiku, Sonnet',        citizen:'Haiku' },
  { task:'Release notes and CAB form',        def:'haiku',  allowed:'Haiku (batch)',         citizen:'Not allowed' },
];

export const PROJECTS = [
  { n:'ContactHUB',                bg:'Group functions',  cc:'CC-1100', pr:'Digital Solutions & AI', tier:'Pro',     budget:600, pct:72, own:true,  cache:84, blocks:17 },
  { n:'Supplier Deviation Portal',  bg:'Exterior Systems', cc:'CC-2140', pr:'Digital Solutions & AI', tier:'Pro',     budget:400, pct:63, own:false, cache:81, blocks:31 },
  { n:'Warranty Claims Tracker',    bg:'Lighting',         cc:'CC-3120', pr:'Digital Solutions & AI', tier:'Pro',     budget:350, pct:89, own:false, cache:77, blocks:22 },
  { n:'Tooling Change Request',     bg:'C-Power',          cc:'CC-5110', pr:'Digital Solutions & AI', tier:'Pro',     budget:300, pct:28, own:false, cache:48, blocks:9  },
  { n:'Boomi mapping assistant',    bg:'Group functions',  cc:'CC-1130', pr:'Integration',            tier:'Pro',     budget:250, pct:38, own:false, cache:88, blocks:14 },
  { n:'SAP custom code remediation',bg:'Group functions',  cc:'CC-1120', pr:'SAP & EDI',              tier:'Pro',     budget:330, pct:52, own:false, cache:86, blocks:41 },
  { n:'Plant Visitor Registration', bg:'Modules',          cc:'CC-4150', pr:'Citizen pilot',          tier:'Citizen', budget:60,  pct:85, own:false, cache:79, blocks:11 },
  { n:'Shift Handover Notes',       bg:'H2-Power',         cc:'CC-6110', pr:'Citizen pilot',          tier:'Citizen', budget:60,  pct:95, own:false, cache:74, blocks:13 },
  { n:'Shared: nightly regression', bg:'Shared',           cc:'CC-1000', pr:'Platform',               tier:'Batch',   budget:150, pct:22, own:false, cache:91, blocks:0  },
];

export const ANOMALIES = [
  { id:'A1', sev:'bad',  p:'Warranty Claims Tracker',   t:'Block B4.1.2 paused by loop breaker',         d:'27M tokens, 4.5× its estimate. 8 failed test runs against an unstable SAP mock.',          acts:['Resume (Tech Lead)','Split block','Stop and fix mock'],       st:'open' },
  { id:'A2', sev:'warn', p:'Supplier Deviation Portal', t:'Opus share at 62% for one developer',         d:'Policy target is under 25%. Most use was routine block coding.',                            acts:['Ask for justification','Route to Sonnet'],                     st:'open' },
  { id:'A3', sev:'warn', p:'Tooling Change Request',    t:'Cache hit rate fell to 48%',                  d:'CLAUDE.md was edited 12 times this week, so cached context kept being rebuilt.',            acts:['Freeze CLAUDE.md for 5 days','Explain to team'],               st:'open' },
  { id:'A4', sev:'warn', p:'Shift Handover Notes',      t:'Citizen project at 95% of monthly cap',       d:'New work will pause at 100% until the Practice Lead approves an increase.',                 acts:['Request increase','Notify maker'],                             st:'open' },
];

export const RECS = [
  { t:'Route lint, format and comment tasks to Haiku',                   d:'Three Pro projects still use Sonnet for these tasks.',                                              save:42, needs:'FinOps Owner' },
  { t:'Move nightly test generation to Batch in 2 more projects',        d:'Warranty Claims Tracker and Tooling Change Request generate tests on demand overnight.',           save:58, needs:'FinOps Owner' },
  { t:'Stabilise CLAUDE.md in Tooling Change Request',                   d:'Restoring an 80% cache hit rate cuts input cost for that project.',                                save:31, needs:'Tech Lead'   },
  { t:'Tighten spec for Warranty Claims F4',                             d:'31% of that project\'s tokens went on reworked blocks. Clearer acceptance criteria reduce rework.',save:76, needs:'Product Owner'},
  { t:'Load spec sections, not the whole spec',                          d:'Two projects load all of spec.md for every block.',                                                 save:24, needs:'Tech Lead'   },
];
