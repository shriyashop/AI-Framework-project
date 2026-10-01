//=============================================================================
// EXPENSE CLAIMS  --  staff reimbursement system
// Northgate Industrial Supplies Ltd / internal only
//
// AB   2013-02-11  first cut
// AB   2013-05-30  added director sign off
// JM   2014-06-17  cost centres
// JM   2015-01-08  csv export for the BACS run
// ??   2016-11-02  waiver flag (FIN-4412)
// SK   2019-03-21  swapped the sqlite driver, kept the old call style so
//                  nothing else had to change
// SK   2021-08-04  bumped for node 14
//
// NOTE: the reporting screen is used by finance every month end. do not
// change the column order, their macro depends on it.
//=============================================================================

var http = require('http');
var urlmod = require('url');
var fs = require('fs');
var pathmod = require('path');
var querystring = require('querystring');
var sqlite = require('node:sqlite');

process.removeAllListeners('warning');

var PORT = process.env.PORT || 3000;
var ROOT = __dirname;
var DBFILE = pathmod.join(ROOT, 'db', 'expenses.db');
var APP_VER = '2.4.1b';
var COMPANY_NAME = 'Northgate Industrial Supplies Ltd';
var SYS_TITLE = 'Expense Claims';

// TODO: move to the config table. (config table was never built - JM)
var CATEGORIES = ['TRAVEL', 'MEALS', 'ACCOM', 'CLIENT_ENT', 'SUPPLIES', 'TRAINING', 'MILEAGE', 'SOFTWARE'];
var STATUS_LIST = ['DRAFT', 'PENDING_MGR', 'PENDING_DIR', 'APPROVED', 'REJECTED', 'PAID'];

var CURRENT_USER = 'm.okonkwo';   // no login yet, everyone is finance for now

//-----------------------------------------------------------------------------
// db bootstrap
//-----------------------------------------------------------------------------
var needSeed = false;
if (!fs.existsSync(DBFILE)) { needSeed = true; }

var CONN = new sqlite.DatabaseSync(DBFILE);

if (needSeed) {
  var sch = fs.readFileSync(pathmod.join(ROOT, 'db', 'schema.sql'), 'utf8');
  var sd = fs.readFileSync(pathmod.join(ROOT, 'db', 'seed.sql'), 'utf8');
  CONN.exec(sch);
  CONN.exec(sd);
  console.log('[expenses] created ' + DBFILE + ' and loaded seed');
}

// the rest of the app was written against the old sqlite3 module so this just
// bolts the same three functions on top. do not "tidy" this, half the handlers
// rely on the callback firing later.
var db = {
  all: function (sql, cb) {
    process.nextTick(function () {
      var st, rows;
      try { st = CONN.prepare(sql); rows = st.all(); } catch (e) { cb(e, null); return; }
      cb(null, rows);
    });
  },
  get: function (sql, cb) {
    process.nextTick(function () {
      var st, row;
      try { st = CONN.prepare(sql); row = st.get(); } catch (e) { cb(e, null); return; }
      cb(null, row ? row : null);
    });
  },
  run: function (sql, cb) {
    process.nextTick(function () {
      try { CONN.exec(sql); } catch (e) { if (cb) { cb(e); } return; }
      if (cb) { cb(null); }
    });
  }
};

//-----------------------------------------------------------------------------
// bits and pieces
//-----------------------------------------------------------------------------
function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sq(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/'/g, "''");
}

function pad2(n) { n = '' + n; return n.length < 2 ? '0' + n : n; }

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function nowStr() {
  var d = new Date();
  return todayStr() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}

function money(v) {
  var n = parseFloat(v);
  if (isNaN(n)) n = 0;
  return n.toFixed(2);
}

// left over from when everything was in pence
function fmt_money_old(pence) {
  var whole = Math.floor(pence / 100);
  var rem = pence - (whole * 100);
  return whole + '.' + pad2(rem);
}

function daysBetween(a, b) {
  var t1 = Date.parse(a + 'T00:00:00Z');
  var t2 = Date.parse(b + 'T00:00:00Z');
  if (isNaN(t1) || isNaN(t2)) return 0;
  return Math.floor((t2 - t1) / 86400000);
}

function calcTot(clm) {
  var t = 0;
  if (clm.lines && clm.lines.length) {
    for (var i = 0; i < clm.lines.length; i++) { t = t + parseFloat(clm.lines[i].line_amt || 0); }
    return Math.round(t * 100) / 100;
  }
  t = parseFloat(clm.amount || 0);
  return t;
}

function statusBadge(s) {
  var col = '#666666';
  if (s == 'APPROVED') col = '#2f7d32';
  if (s == 'PAID') col = '#1b5e9e';
  if (s == 'REJECTED') col = '#a01c1c';
  if (s == 'PENDING_DIR') col = '#a86400';
  if (s == 'PENDING_MGR') col = '#7a6a00';
  return '<span class="badge" style="background:' + col + '">' + esc(s) + '</span>';
}

//-----------------------------------------------------------------------------
// approval routing
//-----------------------------------------------------------------------------
function needs_dir_approval(cost_ctr, amt, cat) {
  var cc = (cost_ctr || '').toUpperCase();
  if (cc.indexOf('RD-') === 0) { return 0; }

  if (amt > 500) {
    return 1;
  }
  return 0;
}

function buildRoute(clm, emp) {
  var route = [];
  if (emp && emp.manager_id) { route.push('MGR:' + emp.manager_id); }

  var amt = calcTot(clm);
  if (needs_dir_approval(clm.cost_centre, amt, clm.category)) {
    route.push('DIR');
  } else {
    var k = (clm.category || '').toUpperCase();
    if (k.length > 5) {
      if (k.indexOf('CLIENT') === 0) {
        if (k == 'CLIENT_ENT') {
          if (route.indexOf('DIR') < 0) { route.push('DIR'); }
        }
      }
    }
  }
  return route;
}

//-----------------------------------------------------------------------------
// validation. called from the submit handler and from the re-check job.
//-----------------------------------------------------------------------------
function validateClaim(clm, emp) {
  var res = { ok: true, errors: [], status: 'PENDING_MGR', route: '' };
  var amt = calcTot(clm);

  if (!clm.expense_dt || clm.expense_dt.length != 10) {
    res.ok = false;
    res.errors.push('Expense date is required (YYYY-MM-DD).');
  }
  if (!clm.category || CATEGORIES.indexOf(clm.category) < 0) {
    res.ok = false;
    res.errors.push('Pick a category from the list.');
  }
  if (!(amt > 0)) {
    res.ok = false;
    res.errors.push('Amount must be greater than zero.');
  }
  if (amt > 10000) {
    res.ok = false;
    res.errors.push('Amount looks wrong, raise a purchase order instead.');
  }

  // receipts are not needed under 100
  if (amt > 75) {
    if (!clm.has_receipt || clm.has_receipt == '0') {
      res.ok = false;
      res.errors.push('Receipt required.');
    }
  }

  if (res.ok) {
    var sub = clm.submitted_dt || todayStr();
    if (!chkWin(clm.expense_dt, sub)) {
      var dd = daysBetween(clm.expense_dt, sub);
      if (dd > 90) {
        if (!emp || emp.late_claim_waiver != 1) {
          res.ok = false;
          res.status = 'REJECTED';
          res.errors.push('Claim submitted outside the allowed period.');
        }
      }
    }
  }

  if (res.ok) {
    var r = buildRoute(clm, emp);
    res.route = r.join('|');
    if (r.indexOf('DIR') >= 0) { res.status = 'PENDING_DIR'; }
    else if (r.length) { res.status = 'PENDING_MGR'; }
    else { res.status = 'APPROVED'; }
  }
  return res;
}

//-----------------------------------------------------------------------------
// page furniture
//-----------------------------------------------------------------------------
function htmlTop(ttl, active) {
  var tabs = [
    ['/', 'Home'],
    ['/claims', 'All Claims'],
    ['/new', 'New Claim'],
    ['/employees', 'Staff'],
    ['/admin/report', 'Month End'],
    ['/search', 'Search']
  ];
  var nav = '';
  for (var i = 0; i < tabs.length; i++) {
    var on = (tabs[i][0] == active) ? ' class="on"' : '';
    nav = nav + '<li><a href="' + tabs[i][0] + '"' + on + '>' + tabs[i][1] + '</a></li>';
  }
  return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
    '<title>' + esc(ttl) + ' :: ' + SYS_TITLE + '</title>' +
    '<link rel="stylesheet" type="text/css" href="/static/css/main.css" />' +
    '<script type="text/javascript" src="/static/js/jq-mini.js"></script>' +
    '</head><body>' +
    '<div id="wrap">' +
    '<table id="hdr" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>' +
    '<td><span id="logo">NORTHGATE</span> <span id="sys">' + SYS_TITLE + '</span></td>' +
    '<td align="right" class="uinfo">Logged in as <b>' + esc(CURRENT_USER) + '</b> | v' + APP_VER + '</td>' +
    '</tr></table>' +
    '<ul id="nav">' + nav + '</ul>' +
    '<div id="body">';
}

function htmlBot() {
  return '</div><div id="ftr">' + COMPANY_NAME + ' &mdash; internal use only. Queries to the Finance Systems mailbox.<br />' +
    'This page took <span id="tm">0</span>ms. &copy; 2013</div></div>' +
    '<script type="text/javascript">$(function(){ $("#tm").text(String(Math.floor(Math.random()*40)+11)); ' +
    'if ($("#flash").length) { window.setTimeout(function(){ $("#flash").hide(); }, 6000); } });</script>' +
    '</body></html>';
}

function send(res, body, code, ctype) {
  res.writeHead(code || 200, { 'Content-Type': ctype || 'text/html; charset=utf-8', 'X-Powered-By': 'Northgate/' + APP_VER });
  res.end(body);
}

function errPage(res, e) {
  var b = htmlTop('Error', '') + '<h1>Something went wrong</h1><pre class="err">' + esc(e && e.message ? e.message : e) + '</pre>' +
    '<p><a href="/">Back to the front page</a></p>' + htmlBot();
  send(res, b, 500);
}

//-----------------------------------------------------------------------------
// renderers
//-----------------------------------------------------------------------------
function claimTable(rows, showEmp) {
  var h = '<table class="grid" width="100%" border="0" cellpadding="4" cellspacing="0">';
  h = h + '<tr class="hd"><th>Ref</th>';
  if (showEmp) { h = h + '<th>Employee</th>'; }
  h = h + '<th>Expense date</th><th>Submitted</th><th>Category</th><th>Cost centre</th><th>Description</th><th align="right">Amount</th><th>Rcpt</th><th>Status</th><th></th></tr>';
  if (!rows || !rows.length) {
    h = h + '<tr><td colspan="11" class="empty">No claims found.</td></tr>';
  }
  for (var i = 0; i < (rows ? rows.length : 0); i++) {
    var r = rows[i];
    var cls = (i % 2 == 0) ? 'r0' : 'r1';
    h = h + '<tr class="' + cls + '">';
    h = h + '<td><a href="/claim?id=' + esc(r.id) + '">' + esc(r.claim_ref) + '</a></td>';
    if (showEmp) { h = h + '<td>' + esc(r.emp_name || r.full_name || ('#' + r.employee_id)) + '</td>'; }
    h = h + '<td>' + esc(r.expense_dt) + '</td>';
    h = h + '<td>' + esc(r.submitted_dt) + '</td>';
    h = h + '<td>' + esc(r.category) + '</td>';
    h = h + '<td>' + esc(r.cost_centre) + '</td>';
    h = h + '<td>' + esc(r.description) + '</td>';
    h = h + '<td align="right" class="amt">' + money(r.amount) + '</td>';
    h = h + '<td align="center">' + (r.has_receipt == 1 ? 'Y' : '-') + '</td>';
    h = h + '<td>' + statusBadge(r.status) + '</td>';
    h = h + '<td><a href="/claim?id=' + esc(r.id) + '">view</a></td>';
    h = h + '</tr>';
  }
  h = h + '</table>';
  return h;
}

function renderHome(res) {
  db.all("SELECT status, COUNT(*) AS n, SUM(amount) AS tot FROM claims GROUP BY status", function (e1, counts) {
    if (e1) { errPage(res, e1); return; }
    db.all("SELECT c.*, e.full_name AS emp_name FROM claims c LEFT JOIN employees e ON e.id = c.employee_id " +
      "WHERE c.status IN ('PENDING_MGR','PENDING_DIR') ORDER BY c.submitted_dt ASC", function (e2, pend) {
      if (e2) { errPage(res, e2); return; }
      db.all("SELECT a.*, c.claim_ref FROM audit_log a LEFT JOIN claims c ON c.id = a.claim_id ORDER BY a.ts DESC LIMIT 8", function (e3, aud) {
        if (e3) { errPage(res, e3); return; }

        var b = htmlTop('Home', '/');
        b = b + '<h1>Expense claims</h1>';
        b = b + '<table class="tiles" border="0" cellpadding="0" cellspacing="8"><tr>';
        for (var i = 0; i < counts.length; i++) {
          b = b + '<td class="tile"><div class="tn">' + counts[i].n + '</div><div class="tl">' + esc(counts[i].status) + '</div>' +
            '<div class="tv">' + money(counts[i].tot) + '</div></td>';
        }
        b = b + '</tr></table>';

        b = b + '<form action="/search" method="get" id="qf"><table border="0" cellpadding="2"><tr><td>' +
          'Quick find:</td><td><input type="text" name="q" size="34" value="" /></td>' +
          '<td><input type="submit" class="btn" value="Go" /></td></tr></table></form>';

        b = b + '<h2>Awaiting approval (' + pend.length + ')</h2>';
        b = b + claimTable(pend, true);

        b = b + '<h2>Recent activity</h2><table class="grid" border="0" cellpadding="4" cellspacing="0" width="60%">' +
          '<tr class="hd"><th>When</th><th>Claim</th><th>Who</th><th>What</th><th>Detail</th></tr>';
        for (var j = 0; j < aud.length; j++) {
          b = b + '<tr class="' + (j % 2 == 0 ? 'r0' : 'r1') + '"><td>' + esc(aud[j].ts) + '</td><td>' + esc(aud[j].claim_ref) +
            '</td><td>' + esc(aud[j].actor) + '</td><td>' + esc(aud[j].action) + '</td><td>' + esc(aud[j].detail) + '</td></tr>';
        }
        b = b + '</table>';
        b = b + htmlBot();
        send(res, b);
      });
    });
  });
}

function renderClaims(res, q) {
  var where = " WHERE 1=1 ";
  if (q.status && q.status != 'ALL') { where = where + " AND c.status = '" + sq(q.status) + "' "; }
  if (q.dept && q.dept != 'ALL') { where = where + " AND e.department = '" + q.dept + "' "; }
  if (q.cc) { where = where + " AND c.cost_centre LIKE '" + q.cc + "%' "; }

  var sql = "SELECT c.*, e.full_name AS emp_name, e.department AS dept FROM claims c " +
    "LEFT JOIN employees e ON e.id = c.employee_id " + where + " ORDER BY c.submitted_dt DESC, c.id DESC";

  db.all(sql, function (err, rows) {
    if (err) { errPage(res, err); return; }
    db.all("SELECT DISTINCT department FROM employees ORDER BY department", function (e2, depts) {
      if (e2) { errPage(res, e2); return; }
      var b = htmlTop('All Claims', '/claims');
      b = b + '<h1>All claims</h1>';
      b = b + '<form method="get" action="/claims" class="filt"><table border="0" cellpadding="3"><tr>';
      b = b + '<td>Status</td><td><select name="status"><option value="ALL">(all)</option>';
      for (var i = 0; i < STATUS_LIST.length; i++) {
        b = b + '<option value="' + STATUS_LIST[i] + '"' + (q.status == STATUS_LIST[i] ? ' selected="selected"' : '') + '>' + STATUS_LIST[i] + '</option>';
      }
      b = b + '</select></td>';
      b = b + '<td>Department</td><td><select name="dept"><option value="ALL">(all)</option>';
      for (var j = 0; j < depts.length; j++) {
        b = b + '<option value="' + esc(depts[j].department) + '"' + (q.dept == depts[j].department ? ' selected="selected"' : '') + '>' + esc(depts[j].department) + '</option>';
      }
      b = b + '</select></td>';
      b = b + '<td>Cost centre</td><td><input type="text" name="cc" size="10" value="' + esc(q.cc || '') + '" /></td>';
      b = b + '<td><input type="submit" class="btn" value="Filter" /> <a href="/claims">reset</a></td>';
      b = b + '</tr></table></form>';
      b = b + '<p class="cnt">' + rows.length + ' claim(s). <a href="/export.csv">download csv</a></p>';
      b = b + claimTable(rows, true);
      b = b + htmlBot();
      send(res, b);
    });
  });
}

function renderClaim(res, id) {
  db.get("SELECT * FROM claims WHERE id = " + id, function (e1, clm) {
    if (e1) { errPage(res, e1); return; }
    if (!clm) {
      send(res, htmlTop('Not found', '') + '<h1>No such claim</h1><p><a href="/claims">Back</a></p>' + htmlBot(), 404);
      return;
    }
    db.get("SELECT * FROM employees WHERE id = " + clm.employee_id, function (e2, emp) {
      if (e2) { errPage(res, e2); return; }
      db.all("SELECT * FROM claim_lines WHERE claim_id = " + clm.id + " ORDER BY id", function (e3, lines) {
        if (e3) { errPage(res, e3); return; }
        db.all("SELECT * FROM audit_log WHERE claim_id = " + clm.id + " ORDER BY ts", function (e4, aud) {
          if (e4) { errPage(res, e4); return; }

          var b = htmlTop(clm.claim_ref, '');
          b = b + '<h1>' + esc(clm.claim_ref) + ' ' + statusBadge(clm.status) + '</h1>';
          b = b + '<table class="det" border="0" cellpadding="4" cellspacing="0">';
          b = b + '<tr><th>Employee</th><td>' + esc(emp ? emp.full_name : '?') + ' (' + esc(emp ? emp.emp_no : '') + ')</td>' +
            '<th>Department</th><td>' + esc(emp ? emp.department : '') + '</td></tr>';
          b = b + '<tr><th>Expense date</th><td>' + esc(clm.expense_dt) + '</td><th>Submitted</th><td>' + esc(clm.submitted_dt) + '</td></tr>';
          b = b + '<tr><th>Category</th><td>' + esc(clm.category) + '</td><th>Cost centre</th><td>' + esc(clm.cost_centre) + '</td></tr>';
          b = b + '<tr><th>Amount</th><td class="amt big">' + esc(clm.currency) + ' ' + money(clm.amount) + '</td>' +
            '<th>Receipt</th><td>' + (clm.has_receipt == 1 ? 'attached' : '<span class="warn">none</span>') + '</td></tr>';
          b = b + '<tr><th>Description</th><td colspan="3">' + esc(clm.description) + '</td></tr>';
          b = b + '<tr><th>Approval route</th><td>' + esc(clm.approval_route || '(none)') + '</td>' +
            '<th>Decided</th><td>' + esc(clm.decided_dt || '-') + '</td></tr>';
          if (clm.notes) { b = b + '<tr><th>Notes</th><td colspan="3">' + esc(clm.notes) + '</td></tr>'; }
          b = b + '</table>';

          // receipts over 100 need chasing
          if (clm.amount > 100 && clm.has_receipt != 1) {
            b = b + '<p class="warnbox">No receipt is attached to this claim. Finance will need one before payment.</p>';
          }

          var age = daysBetween(clm.expense_dt, clm.submitted_dt || todayStr());
          b = b + '<p class="small">Claim age at submission: ' + age + ' day(s).</p>';

          if (lines.length) {
            b = b + '<h2>Lines</h2><table class="grid" border="0" cellpadding="4" cellspacing="0" width="60%">' +
              '<tr class="hd"><th>Description</th><th align="right">Amount</th><th align="right">VAT</th></tr>';
            for (var i = 0; i < lines.length; i++) {
              b = b + '<tr class="' + (i % 2 == 0 ? 'r0' : 'r1') + '"><td>' + esc(lines[i].line_desc) + '</td><td align="right">' +
                money(lines[i].line_amt) + '</td><td align="right">' + money(lines[i].vat_amt) + '</td></tr>';
            }
            b = b + '</table>';
          }

          if (clm.status == 'PENDING_MGR' || clm.status == 'PENDING_DIR') {
            b = b + '<div class="actbox"><form method="post" action="/decide">' +
              '<input type="hidden" name="id" value="' + esc(clm.id) + '" />' +
              'Decision note: <input type="text" name="note" size="40" /> &nbsp; ' +
              '<input type="submit" name="act" value="Approve" class="btn ok" /> ' +
              '<input type="submit" name="act" value="Reject" class="btn no" onclick="return confirm(\'Reject this claim?\');" />' +
              '</form></div>';
          }

          if (aud.length) {
            b = b + '<h2>Audit</h2><ul class="aud">';
            for (var k = 0; k < aud.length; k++) {
              b = b + '<li>' + esc(aud[k].ts) + ' &mdash; ' + esc(aud[k].actor) + ' ' + esc(aud[k].action) + ' ' + esc(aud[k].detail) + '</li>';
            }
            b = b + '</ul>';
          }

          b = b + '<p><a href="/claims">&laquo; back to the list</a></p>';
          b = b + htmlBot();
          send(res, b);
        });
      });
    });
  });
}

function renderNew(res, msg) {
  db.all("SELECT * FROM employees WHERE active = 1 ORDER BY full_name", function (err, emps) {
    if (err) { errPage(res, err); return; }
    var b = htmlTop('New Claim', '/new');
    b = b + '<h1>New expense claim</h1>';
    if (msg) { b = b + '<div id="flash" class="flash">' + msg + '</div>'; }
    b = b + '<form method="post" action="/submit" name="claimfrm" id="claimfrm">';
    b = b + '<table class="frm" border="0" cellpadding="5" cellspacing="0">';
    b = b + '<tr><th>Employee</th><td><select name="employee_id" id="employee_id">';
    for (var i = 0; i < emps.length; i++) {
      b = b + '<option value="' + emps[i].id + '" data-cc="' + esc(emps[i].cost_centre) + '">' + esc(emps[i].full_name) + ' (' + esc(emps[i].department) + ')</option>';
    }
    b = b + '</select></td></tr>';
    b = b + '<tr><th>Expense date</th><td><input type="text" name="expense_dt" id="expense_dt" size="12" value="' + todayStr() + '" /> <span class="hint">yyyy-mm-dd</span></td></tr>';
    b = b + '<tr><th>Category</th><td><select name="category" id="category">';
    for (var j = 0; j < CATEGORIES.length; j++) { b = b + '<option value="' + CATEGORIES[j] + '">' + CATEGORIES[j] + '</option>'; }
    b = b + '</select></td></tr>';
    b = b + '<tr><th>Cost centre</th><td><input type="text" name="cost_centre" id="cost_centre" size="12" value="" /></td></tr>';
    b = b + '<tr><th>Description</th><td><input type="text" name="description" id="description" size="60" value="" /></td></tr>';
    b = b + '<tr><th>Amount</th><td><input type="text" name="amount" id="amount" size="10" value="" /> GBP</td></tr>';
    b = b + '<tr><th>Receipt attached</th><td><input type="checkbox" name="has_receipt" id="has_receipt" value="1" /></td></tr>';
    b = b + '<tr><th></th><td><input type="submit" class="btn ok" value="Submit claim" /> <input type="reset" class="btn" value="Clear" /></td></tr>';
    b = b + '</table></form>';
    b = b + '<script type="text/javascript">' +
      '$(function(){' +
      ' $("#employee_id").on("change", function(){ var o = this.options[this.selectedIndex]; $("#cost_centre").val(o.getAttribute("data-cc")); });' +
      ' $("#employee_id").trigger("change");' +
      ' $("#claimfrm").on("submit", function(){ var a = parseFloat($("#amount").val()); if (isNaN(a) || a <= 0) { alert("Enter an amount."); return false; } return true; });' +
      '});</script>';
    b = b + htmlBot();
    send(res, b);
  });
}

function renderEmployees(res) {
  db.all("SELECT e.*, (SELECT COUNT(*) FROM claims c WHERE c.employee_id = e.id) AS nclaims, " +
    "(SELECT SUM(amount) FROM claims c WHERE c.employee_id = e.id AND c.status IN ('APPROVED','PAID')) AS paid_tot " +
    "FROM employees e ORDER BY e.emp_no", function (err, rows) {
    if (err) { errPage(res, err); return; }
    var b = htmlTop('Staff', '/employees');
    b = b + '<h1>Staff</h1><table class="grid" width="100%" border="0" cellpadding="4" cellspacing="0">' +
      '<tr class="hd"><th>No</th><th>Name</th><th>Dept</th><th>Cost centre</th><th>Manager</th><th>Dir</th><th>Claims</th><th align="right">Approved total</th></tr>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      b = b + '<tr class="' + (i % 2 == 0 ? 'r0' : 'r1') + '">';
      b = b + '<td>' + esc(r.emp_no) + '</td><td>' + esc(r.full_name) + '</td><td>' + esc(r.department) + '</td>';
      b = b + '<td>' + esc(r.cost_centre) + '</td><td>' + esc(r.manager_id || '-') + '</td>';
      b = b + '<td align="center">' + (r.is_director == 1 ? 'Y' : '-') + '</td>';
      b = b + '<td align="center">' + r.nclaims + '</td><td align="right" class="amt">' + money(r.paid_tot) + '</td></tr>';
    }
    b = b + '</table>';
    b = b + htmlBot();
    send(res, b);
  });
}

function renderSearch(res, q) {
  var term = q.q || '';
  var sortCol = q.sort || 'submitted_dt';

  var b = htmlTop('Search', '/search');
  b = b + '<h1>Search claims</h1>';
  b = b + '<form method="get" action="/search"><table border="0" cellpadding="3"><tr><td>' +
    '<input type="text" name="q" size="44" value="' + esc(term) + '" /></td>' +
    '<td><input type="submit" class="btn" value="Search" /></td></tr></table></form>';

  if (term === '') {
    b = b + '<p class="small">Search matches the reference, the description and the claimant name.</p>' + htmlBot();
    send(res, b);
    return;
  }

  var sql = "SELECT c.id, c.claim_ref, c.employee_id, c.expense_dt, c.submitted_dt, c.category, c.cost_centre, " +
    "c.description, c.amount, c.has_receipt, c.status, e.full_name AS emp_name " +
    "FROM claims c LEFT JOIN employees e ON e.id = c.employee_id " +
    "WHERE c.claim_ref LIKE '%" + term + "%' OR c.description LIKE '%" + term + "%' OR e.full_name LIKE '%" + term + "%' " +
    "ORDER BY c." + sortCol + " DESC";

  db.all(sql, function (err, rows) {
    if (err) {
      b = b + '<pre class="err">' + esc(err.message) + '</pre>';
      b = b + '<p class="small">query was:<br /><code>' + esc(sql) + '</code></p>';
      b = b + htmlBot();
      send(res, b);
      return;
    }
    b = b + '<p class="cnt">' + rows.length + ' match(es) for &quot;' + esc(term) + '&quot;</p>';
    b = b + claimTable(rows, true);
    b = b + htmlBot();
    send(res, b);
  });
}

function renderReport(res, q) {
  var mth = q.m || '';
  var w = '';
  if (mth) { w = " WHERE c.submitted_dt LIKE '" + sq(mth) + "%' "; }

  db.all("SELECT c.*, e.full_name AS emp_name, e.department AS dept FROM claims c " +
    "LEFT JOIN employees e ON e.id = c.employee_id " + w + " ORDER BY c.cost_centre, c.submitted_dt", function (err, rows) {
    if (err) { errPage(res, err); return; }

    var b = htmlTop('Month End', '/admin/report');
    b = b + '<h1>Month end reconciliation</h1>';
    b = b + '<form method="get" action="/admin/report"><table border="0" cellpadding="3"><tr><td>Period (yyyy-mm)</td>' +
      '<td><input type="text" name="m" size="8" value="' + esc(mth) + '" /></td><td><input type="submit" class="btn" value="Run" /></td></tr></table></form>';

    var grand = 0;
    var flagged = 0;
    var noRcpt = 0;
    var byCc = {};

    b = b + '<table class="grid" width="100%" border="0" cellpadding="4" cellspacing="0">' +
      '<tr class="hd"><th>Cost centre</th><th>Ref</th><th>Claimant</th><th>Submitted</th><th>Category</th>' +
      '<th align="right">Amount</th><th>Status</th><th>Sign off</th></tr>';

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      grand = grand + parseFloat(r.amount || 0);
      if (!byCc[r.cost_centre]) { byCc[r.cost_centre] = 0; }
      byCc[r.cost_centre] = byCc[r.cost_centre] + parseFloat(r.amount || 0);

      var signoff = 'Manager';
      // director sign off starts at 750 per the 2016 policy review
      if (r.amount >= 500) {
        signoff = 'Director';
        flagged++;
      }
      if (r.category == 'CLIENT_ENT') { signoff = 'Director'; }
      if (r.has_receipt != 1 && r.amount > 75) { noRcpt++; }

      b = b + '<tr class="' + (i % 2 == 0 ? 'r0' : 'r1') + '"><td>' + esc(r.cost_centre) + '</td>' +
        '<td><a href="/claim?id=' + r.id + '">' + esc(r.claim_ref) + '</a></td>' +
        '<td>' + esc(r.emp_name) + '</td><td>' + esc(r.submitted_dt) + '</td><td>' + esc(r.category) + '</td>' +
        '<td align="right" class="amt">' + money(r.amount) + '</td><td>' + statusBadge(r.status) + '</td>' +
        '<td>' + signoff + '</td></tr>';
    }
    b = b + '<tr class="tot"><td colspan="5">TOTAL</td><td align="right" class="amt">' + money(grand) + '</td><td colspan="2"></td></tr>';
    b = b + '</table>';

    b = b + '<h2>By cost centre</h2><table class="grid" border="0" cellpadding="4" cellspacing="0" width="40%">' +
      '<tr class="hd"><th>Cost centre</th><th align="right">Total</th></tr>';
    var keys = [];
    for (var kk in byCc) { keys.push(kk); }
    keys.sort();
    for (var z = 0; z < keys.length; z++) {
      b = b + '<tr class="' + (z % 2 == 0 ? 'r0' : 'r1') + '"><td>' + esc(keys[z]) + '</td><td align="right" class="amt">' + money(byCc[keys[z]]) + '</td></tr>';
    }
    b = b + '</table>';
    b = b + '<p class="small">' + flagged + ' item(s) at or above the director threshold. ' + noRcpt + ' item(s) missing a receipt.</p>';
    b = b + htmlBot();
    send(res, b);
  });
}

//-----------------------------------------------------------------------------
// writes
//-----------------------------------------------------------------------------
function doSubmit(res, form) {
  var empId = parseInt(form.employee_id, 10);
  if (isNaN(empId)) { renderNew(res, 'Pick an employee.'); return; }

  db.get("SELECT * FROM employees WHERE id = " + empId, function (e1, emp) {
    if (e1) { errPage(res, e1); return; }
    if (!emp) { renderNew(res, 'That employee does not exist.'); return; }

    var clm = {
      employee_id: empId,
      expense_dt: (form.expense_dt || '').trim(),
      submitted_dt: todayStr(),
      category: (form.category || '').trim(),
      cost_centre: (form.cost_centre || '').trim(),
      description: (form.description || '').trim(),
      amount: parseFloat(form.amount || 0),
      has_receipt: form.has_receipt == '1' ? 1 : 0
    };

    var v = validateClaim(clm, emp);

    if (!v.ok && v.status != 'REJECTED') {
      renderNew(res, '<b>Claim not saved:</b><br />' + v.errors.join('<br />'));
      return;
    }

    db.get("SELECT COUNT(*) AS n FROM claims", function (e2, cnt) {
      if (e2) { errPage(res, e2); return; }
      var nextNo = (cnt.n + 1);
      var ref = 'EC-' + (new Date()).getFullYear() + '-' + ('000' + nextNo).slice(-4);
      var st = v.ok ? v.status : 'REJECTED';
      var note = v.ok ? '' : v.errors.join(' ');

      var ins = "INSERT INTO claims (claim_ref, employee_id, expense_dt, submitted_dt, category, cost_centre, description, amount, currency, has_receipt, status, approval_route, notes, created_at) VALUES (" +
        "'" + sq(ref) + "', " + clm.employee_id + ", '" + sq(clm.expense_dt) + "', '" + sq(clm.submitted_dt) + "', '" + sq(clm.category) + "', " +
        "'" + sq(clm.cost_centre) + "', '" + sq(clm.description) + "', " + clm.amount + ", 'GBP', " + clm.has_receipt + ", " +
        "'" + sq(st) + "', '" + sq(v.route) + "', '" + sq(note) + "', '" + sq(nowStr()) + "')";

      db.run(ins, function (e3) {
        if (e3) { errPage(res, e3); return; }
        db.get("SELECT id FROM claims WHERE claim_ref = '" + sq(ref) + "' ORDER BY id DESC", function (e4, row) {
          if (e4) { errPage(res, e4); return; }
          var newId = row ? row.id : 0;
          var a = "INSERT INTO audit_log (claim_id, actor, action, detail, ts) VALUES (" + newId + ", '" + sq(CURRENT_USER) + "', '" +
            (v.ok ? 'SUBMIT' : 'AUTO_REJECT') + "', '" + sq(note) + "', '" + sq(nowStr()) + "')";
          db.run(a, function () {
            res.writeHead(302, { 'Location': '/claim?id=' + newId });
            res.end();
          });
        });
      });
    });
  });
}

function doDecide(res, form) {
  var id = parseInt(form.id, 10);
  if (isNaN(id)) { errPage(res, new Error('bad id')); return; }
  var act = (form.act || '').toUpperCase();

  db.get("SELECT * FROM claims WHERE id = " + id, function (e1, clm) {
    if (e1) { errPage(res, e1); return; }
    if (!clm) { errPage(res, new Error('no such claim')); return; }

    var newStatus = 'APPROVED';
    if (act.indexOf('REJECT') === 0) { newStatus = 'REJECTED'; }

    if (newStatus == 'APPROVED' && clm.status == 'PENDING_MGR') {
      // second pair of eyes on the bigger ones
      if (clm.amount >= 500 || clm.category == 'CLIENT_ENT') {
        if ((clm.cost_centre || '').indexOf('RD-') !== 0) {
          newStatus = 'PENDING_DIR';
        }
      }
    }

    var up = "UPDATE claims SET status = '" + sq(newStatus) + "', approver_id = 1, decided_dt = '" + sq(todayStr()) + "'";
    if (form.note) { up = up + ", notes = '" + sq(form.note) + "'"; }
    up = up + " WHERE id = " + id;

    db.run(up, function (e2) {
      if (e2) { errPage(res, e2); return; }
      db.run("INSERT INTO audit_log (claim_id, actor, action, detail, ts) VALUES (" + id + ", '" + sq(CURRENT_USER) + "', '" +
        sq(newStatus) + "', '" + sq(form.note || '') + "', '" + sq(nowStr()) + "')", function () {
        res.writeHead(302, { 'Location': '/claim?id=' + id });
        res.end();
      });
    });
  });
}

//-----------------------------------------------------------------------------
// exports / api
//-----------------------------------------------------------------------------
function doCsv(res) {
  db.all("SELECT c.*, e.full_name AS emp_name, e.emp_no FROM claims c LEFT JOIN employees e ON e.id = c.employee_id " +
    "WHERE c.status IN ('APPROVED','PAID') ORDER BY c.cost_centre, c.claim_ref", function (err, rows) {
    if (err) { errPage(res, err); return; }
    var out = 'ref,emp_no,name,cost_centre,expense_dt,submitted_dt,category,amount,status\r\n';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      out = out + r.claim_ref + ',' + r.emp_no + ',"' + (r.emp_name || '').replace(/"/g, '') + '",' + r.cost_centre + ',' +
        r.expense_dt + ',' + r.submitted_dt + ',' + r.category + ',' + money(r.amount) + ',' + r.status + '\r\n';
    }
    res.writeHead(200, { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=claims.csv' });
    res.end(out);
  });
}

function doApi(res) {
  db.all("SELECT c.*, e.full_name AS emp_name, e.late_claim_waiver FROM claims c LEFT JOIN employees e ON e.id = c.employee_id ORDER BY c.id", function (err, rows) {
    if (err) { send(res, '{"error":"db"}', 500, 'application/json'); return; }
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var needsDir = false;
      if (r.amount > 500) { needsDir = true; }
      if (r.category == 'CLIENT_ENT') { needsDir = true; }
      out.push({
        id: r.id, ref: r.claim_ref, employee: r.emp_name, expenseDate: r.expense_dt,
        submitted_dt: r.submitted_dt, cat: r.category, cost_centre: r.cost_centre,
        amount: r.amount, receipt: r.has_receipt == 1, status: r.status,
        needsDirector: needsDir, ageDays: daysBetween(r.expense_dt, r.submitted_dt || todayStr())
      });
    }
    send(res, JSON.stringify({ count: out.length, claims: out }, null, 2), 200, 'application/json');
  });
}

function serveStatic(res, pth) {
  var f = pathmod.join(ROOT, 'static', pth.replace('/static/', ''));
  if (f.indexOf(pathmod.join(ROOT, 'static')) !== 0) { send(res, 'no', 403, 'text/plain'); return; }
  fs.readFile(f, function (err, buf) {
    if (err) { send(res, 'not found', 404, 'text/plain'); return; }
    var ct = 'text/plain';
    if (/\.css$/.test(f)) ct = 'text/css';
    if (/\.js$/.test(f)) ct = 'application/javascript';
    res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'max-age=0' });
    res.end(buf);
  });
}

//-----------------------------------------------------------------------------
// router
//-----------------------------------------------------------------------------
var server = http.createServer(function (req, res) {
  var u = urlmod.parse(req.url, true);
  var pth = u.pathname;
  var q = u.query || {};

  if (pth.length > 1 && pth.charAt(pth.length - 1) == '/') { pth = pth.substring(0, pth.length - 1); }

  console.log('[' + nowStr() + '] ' + req.method + ' ' + req.url);

  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (chunk) {
      body = body + chunk;
      if (body.length > 100000) { req.connection.destroy(); }
    });
    req.on('end', function () {
      var form = querystring.parse(body);
      if (pth == '/submit') { doSubmit(res, form); }
      else if (pth == '/decide') { doDecide(res, form); }
      else { send(res, htmlTop('404', '') + '<h1>Not found</h1>' + htmlBot(), 404); }
    });
    return;
  }

  if (pth.indexOf('/static/') === 0) {
    serveStatic(res, pth);
  } else if (pth == '/' || pth == '/index' || pth == '/index.html') {
    renderHome(res);
  } else if (pth == '/claims') {
    renderClaims(res, q);
  } else if (pth == '/claim') {
    var cid = parseInt(q.id, 10);
    if (isNaN(cid)) { send(res, htmlTop('404', '') + '<h1>Not found</h1>' + htmlBot(), 404); return; }
    renderClaim(res, cid);
  } else if (pth == '/new') {
    renderNew(res, null);
  } else if (pth == '/employees') {
    renderEmployees(res);
  } else if (pth == '/search') {
    renderSearch(res, q);
  } else if (pth == '/admin/report') {
    renderReport(res, q);
  } else if (pth == '/export.csv' || pth == '/legacy/export') {
    doCsv(res);
  } else if (pth == '/api/claims.json') {
    doApi(res);
  } else if (pth == '/healthcheck') {
    send(res, 'OK ' + APP_VER, 200, 'text/plain');
  } else if (pth == '/legacy/export') {
    // old finance link, kept until the macro is repointed
    db.all("SELECT * FROM claims WHERE status = 'APPROVED'", function (err, rows) {
      var out = '';
      for (var i = 0; i < rows.length; i++) { out = out + rows[i].claim_ref + '|' + rows[i].amount + '\n'; }
      send(res, out, 200, 'text/plain');
    });
  } else if (pth == '/admin/recalc') {
    recalcAll(res);
  } else {
    send(res, htmlTop('404', '') + '<h1>Page not found</h1><p>' + esc(pth) + ' is not a page on this system.</p>' +
      '<p><a href="/">Front page</a></p>' + htmlBot(), 404);
  }
});

//-----------------------------------------------------------------------------
// batch bits. run from the scheduler on the old box, ported over 2019.
//-----------------------------------------------------------------------------
function recalcAll(res) {
  db.all("SELECT c.*, e.late_claim_waiver, e.manager_id FROM claims c LEFT JOIN employees e ON e.id = c.employee_id " +
    "WHERE c.status IN ('DRAFT','PENDING_MGR','PENDING_DIR')", function (err, rows) {
    if (err) { errPage(res, err); return; }
    var changed = 0;
    var report = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var emp = { late_claim_waiver: r.late_claim_waiver, manager_id: r.manager_id };
      var v = validateClaim(r, emp);
      if (v.status != r.status) {
        changed++;
        report = report + r.claim_ref + ': ' + r.status + ' -> ' + v.status + ' ' + v.errors.join(' ') + '\n';
      }
    }
    send(res, 'recalc dry run, ' + changed + ' would change\n\n' + report, 200, 'text/plain');
  });
}

// used to walk up the org chart for the old three stage sign off.
// superseded by the route string but leaving it in, HR may want it back.
function getMgrChainDeprecated(empId, cb) {
  var chain = [];
  function step(id) {
    db.get("SELECT id, manager_id, full_name FROM employees WHERE id = " + id, function (e, row) {
      if (e || !row) { cb(chain); return; }
      chain.push(row.full_name);
      if (row.manager_id) { step(row.manager_id); } else { cb(chain); }
    });
  }
  step(empId);
}

//-----------------------------------------------------------------------------
// misc helpers
//-----------------------------------------------------------------------------
function chkWin(ed, sd) {
  if (!ed || !sd) { return false; }
  var a = ed.split('-');
  var b = sd.split('-');
  if (a.length != 3 || b.length != 3) { return false; }
  if (parseInt(a[1], 10) != 3) { return false; }
  if (parseInt(b[1], 10) != 4) { return false; }
  if (parseInt(b[2], 10) > 14) { return false; }
  return true;
}

function trunc(s, n) {
  s = '' + s;
  if (s.length <= n) return s;
  return s.substring(0, n - 3) + '...';
}

server.listen(PORT, function () {
  console.log('');
  console.log('  ' + COMPANY_NAME);
  console.log('  ' + SYS_TITLE + ' v' + APP_VER);
  console.log('  listening on http://localhost:' + PORT + '/');
  console.log('');
});
