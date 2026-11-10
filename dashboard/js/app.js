/*
 * Views and navigation. You should not need to edit this file to change
 * content: teams/periods live in config.js, KPIs in kpis.js, numbers in
 * data/team-data.js.
 *
 * Views (URL hash):
 *   #/dashboard               all teams combined (leadership view)
 *   #/dashboard?team=<id>     one team (team leader view)
 *   #/kpi/<kpiId>?team=<id>   drill-down: one KPI, compare teams, full definition
 *   #/framework               the KPI framework table
 *
 * Every KPI follows one pattern, taken from the comparable-dashboards review:
 *   name + definition | big number with status word, "vs" comparison and
 *   context line | bar trend with target line and trend line
 */
(function () {
  'use strict';
  var C = window.DASH_CONFIG;
  var D = window.DASH_DATA;
  var CH = window.DashCharts;
  var esc = CH.esc;
  var ALL = window.DASH_KPIS;
  var KPIS = ALL.filter(function (k) { return k.enabled !== false; });
  var kpiById = {}; ALL.forEach(function (k) { kpiById[k.id] = k; });
  var teamById = {}; C.teams.forEach(function (t) { teamById[t.id] = t; });
  var app = document.getElementById('app');

  // ---------- state (filters persist per viewer when storage is available) ----------
  var state = { rangeId: C.defaultRange, compare: 'prev', theme: C.defaultTheme || 'dark', chartTeams: null, chartKpi: null };
  function load(key, ok) { try { var v = localStorage.getItem('sweg-' + key); if (v && ok(v)) state[key] = v; } catch (e) { /* no storage */ } }
  function save(key) { try { localStorage.setItem('sweg-' + key, state[key]); } catch (e) { /* no storage */ } }
  load('rangeId', function (v) { return C.ranges.some(function (r) { return r.id === v; }); });
  load('compare', function (v) { return v === 'prev' || v === 'none'; });
  load('theme', function (v) { return v === 'dark' || v === 'light'; });

  function range() { return C.ranges.find(function (r) { return r.id === state.rangeId; }) || C.ranges[0]; }
  // back = 0: the selected window; back = 1: the window just before it.
  function windowOf(arr, back) {
    var n = range().count, end = arr.length - (back || 0) * n;
    return end - n < 0 ? [] : arr.slice(end - n, end);
  }
  function isNum(v) { return v != null && !isNaN(v); }
  function mean(arr) {
    var v = arr.filter(isNum);
    return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : null;
  }
  function lastNum(arr) { for (var i = arr.length - 1; i >= 0; i--) if (isNum(arr[i])) return { v: arr[i], i: i }; return null; }
  function seriesFor(teamId, kpiId) { return teamId ? D.series[teamId][kpiId] : D.group(kpiId); }

  // ---------- formatting ----------
  var UNIT = { percent: '%', days: 'days', hours: 'hrs', perWeek: '/ wk', count: '', score: '/ 5' };
  function parts(k, v) {
    if (!isNum(v)) return { num: '—', unit: '' };
    var u = UNIT[k.unit] || '';
    if (k.unit === 'days' && Math.abs(v - 1) < 1e-9) u = 'day';
    return { num: v.toFixed(k.decimals || 0), unit: u };
  }
  function fmt(k, v) {
    var p = parts(k, v);
    if (p.num === '—') return '—';
    return p.unit === '%' ? p.num + '%' : (p.unit ? p.num + ' ' + p.unit : p.num);
  }
  function fmtAxis(k) {
    var short = { percent: '%', days: 'd', hours: 'h', perWeek: '', count: '', score: '' };
    return function (v) { return (Math.round(v * 10) / 10) + (short[k.unit] || ''); };
  }
  function targetText(k, prefix) {
    if (k.direction === 'neutral' || !isNum(k.target)) return 'No target (context only)';
    return (prefix == null ? 'Target ' : prefix) + (k.direction === 'higher' ? '≥ ' : '≤ ') + fmt(k, k.target);
  }

  // ---------- status + comparison ----------
  var STATUS = {
    ok:     { key: 'ok',     label: 'On target',   icon: '✓' },
    watch:  { key: 'watch',  label: 'Watch',       icon: '!' },
    off:    { key: 'off',    label: 'Off target',  icon: '✕' },
    info:   { key: 'info',   label: 'For context', icon: 'i' },
    nodata: { key: 'nodata', label: 'No data',     icon: '–' }
  };
  function status(k, v) {
    if (!isNum(v)) return STATUS.nodata;
    if (k.direction === 'neutral' || !isNum(k.target)) return STATUS.info;
    var hi = k.direction === 'higher';
    if (hi ? v >= k.target : v <= k.target) return STATUS.ok;
    if (isNum(k.warn) && (hi ? v >= k.warn : v <= k.warn)) return STATUS.watch;
    return STATUS.off;
  }
  function compare(k, cur, prev) {
    if (!isNum(cur) || !isNum(prev)) return null;
    var d = cur - prev;
    var rel = Math.abs(d) / Math.max(Math.abs(prev), 1e-9);
    var sign = d > 0 ? '+' : d < 0 ? '−' : '±';
    var text = sign + fmt(k, Math.abs(d)) + ' vs previous ' + range().count + ' sprints (' + fmt(k, prev) + ')';
    if (rel < 0.02) return { key: 'steady', label: 'Steady', arrow: '▬', text: text };
    var arrow = d > 0 ? '▲' : '▼';
    if (k.direction === 'neutral') return { key: 'steady', label: d > 0 ? 'Up' : 'Down', arrow: arrow, text: text };
    var better = (d > 0) === (k.direction === 'higher');
    return { key: better ? 'better' : 'worse', label: better ? 'Improving' : 'Worsening', arrow: arrow, text: text };
  }
  function stats(k, teamId) {
    var arr = seriesFor(teamId, k.id);
    var w = windowOf(arr, 0);
    var cur = mean(w);
    if (isNum(cur)) cur = Math.round(cur * Math.pow(10, k.decimals || 0)) / Math.pow(10, k.decimals || 0);
    var prev = mean(windowOf(arr, 1));
    if (isNum(prev)) prev = Math.round(prev * Math.pow(10, k.decimals || 0)) / Math.pow(10, k.decimals || 0);
    return { window: w, cur: cur, prev: prev, latest: lastNum(w), status: status(k, cur), cmp: compare(k, cur, prev) };
  }

  // ---------- shared pieces ----------
  function badge(s) {
    return '<span class="badge badge--' + s.key + '"><span class="badge__icon" aria-hidden="true">' + s.icon + '</span>' + s.label + '</span>';
  }
  function windowPeriods() { return windowOf(D.periods, 0); }
  function periodSpan() {
    var ps = windowPeriods();
    var f = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    var a = ps[0], b = ps[ps.length - 1];
    return a.label + ' – ' + b.label + ' · ' + f(a.start) + ' to ' + f(b.end) + ', ' + b.end.getFullYear();
  }
  function scopeName(teamId) { return teamId ? teamById[teamId].name : 'All teams'; }

  function filterBar(teamId, opts) {
    opts = opts || {};
    return '<div class="filters" role="group" aria-label="Filters">' +
      '<label class="field"><span class="field__label">Team</span><select data-action="team">' +
        '<option value="">All teams (combined)</option>' +
        C.teams.map(function (t) { return '<option value="' + t.id + '"' + (t.id === teamId ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') +
      '</select></label>' +
      '<label class="field"><span class="field__label">Time range</span><select data-action="range">' +
        C.ranges.map(function (r) { return '<option value="' + r.id + '"' + (r.id === state.rangeId ? ' selected' : '') + '>' + esc(r.label) + '</option>'; }).join('') +
      '</select></label>' +
      '<label class="field"><span class="field__label">Compare to</span><select data-action="compare">' +
        '<option value="prev"' + (state.compare === 'prev' ? ' selected' : '') + '>Previous ' + range().count + ' sprints</option>' +
        '<option value="none"' + (state.compare === 'none' ? ' selected' : '') + '>No comparison</option>' +
      '</select></label>' +
      '<p class="filters__note">' + esc(periodSpan()) + '<br><span class="muted">Team-level data only. There are no per-person filters.</span></p>' +
      '</div>';
  }

  function chartLegend() {
    return '<p class="chart-legend" aria-hidden="true">' +
      '<span>' + CH.swatch('bar') + 'Sprint value</span>' +
      '<span>' + CH.swatch('line', 'target') + 'Target</span>' +
      '<span>' + CH.swatch('line', 'trendline') + 'Trend</span>' +
      '</p>';
  }

  // One KPI row: info | value tile | chart
  function kpiRow(k, teamId, opts) {
    opts = opts || {};
    var s = stats(k, teamId);
    var p = parts(k, s.cur);
    var pair = k.pairedWith && kpiById[k.pairedWith];
    var q = teamId ? '?team=' + teamId : '';
    var ps = windowPeriods();
    var chart = CH.barTrend({
      labels: ps.map(function (x) { return x.short; }),
      values: s.window,
      target: k.direction === 'neutral' ? null : k.target,
      targetLabel: targetText(k, ''),
      format: fmtAxis(k),
      ceil: k.unit === 'percent' ? 100 : (k.unit === 'score' ? 5 : null),
      title: k.name + ', ' + scopeName(teamId) + ', ' + range().label.toLowerCase() + '. Average ' + fmt(k, s.cur) + ', ' + s.status.label + '. ' + targetText(k) + '.'
    });
    var cmp = state.compare === 'prev'
      ? (s.cmp ? '<p class="cmp cmp--' + s.cmp.key + '"><span aria-hidden="true">' + s.cmp.arrow + '</span> <strong>' + s.cmp.label + '</strong> <span class="muted">' + esc(s.cmp.text) + '</span></p>'
               : '<p class="cmp muted">No earlier data to compare</p>')
      : '';
    var latest = s.latest ? 'Latest (' + ps[s.latest.i].short + '): ' + fmt(k, s.latest.v) : 'No recent data';

    return '<article class="kpi-row kpi-row--' + s.status.key + '" aria-labelledby="row-' + k.id + '">' +
      '<div class="kpi-row__info">' +
        (opts.noLink
          ? '<h3 id="row-' + k.id + '">' + esc(k.name) + '</h3>'
          : '<h3 id="row-' + k.id + '"><a href="#/kpi/' + k.id + q + '">' + esc(k.name) + '</a></h3>') +
        '<p class="def">' + esc(k.definition) + '</p>' +
        (pair ? '<p class="pair">Balanced by <a href="#/kpi/' + pair.id + q + '">' + esc(pair.name) + '</a></p>' : '') +
        (opts.noLink ? '' : '<a class="more" href="#/kpi/' + k.id + q + '">Compare teams and details <span aria-hidden="true">→</span></a>') +
      '</div>' +
      '<div class="kpi-row__value">' +
        '<div class="tile-head"><span class="eyebrow">Avg · ' + esc(range().label.toLowerCase()) + '</span>' + badge(s.status) + '</div>' +
        '<p class="big"><span class="big__num">' + esc(p.num) + '</span>' + (p.unit ? '<span class="big__unit">' + esc(p.unit) + '</span>' : '') + '</p>' +
        cmp +
        '<p class="ctx">' + esc(latest) + ' · ' + esc(targetText(k)) + '</p>' +
      '</div>' +
      '<div class="kpi-row__chart">' + chart + '</div>' +
      '</article>';
  }

  function summary(teamId) {
    var c = { ok: 0, watch: 0, off: 0 };
    KPIS.forEach(function (k) { var s = stats(k, teamId).status; if (c[s.key] != null) c[s.key]++; });
    function tile(st, n) {
      return '<li class="stat stat--' + st.key + '"><span class="stat__n">' + n + '</span>' + badge(st) + '<span class="stat__of">of ' + KPIS.length + ' KPIs</span></li>';
    }
    return '<ul class="stats" aria-label="KPI status summary">' + tile(STATUS.ok, c.ok) + tile(STATUS.watch, c.watch) + tile(STATUS.off, c.off) + '</ul>';
  }

  function teamsMatrix() {
    return '<section class="panel" aria-labelledby="matrix-h">' +
      '<div class="panel__head"><h2 id="matrix-h">Teams at a glance</h2>' +
      '<p class="muted">Average for ' + esc(range().label.toLowerCase()) + '. Teams are listed alphabetically: this is not a ranking.</p></div>' +
      '<div class="table-wrap" tabindex="0" role="region" aria-label="Teams at a glance"><table class="matrix"><thead><tr><th scope="col">Team</th>' +
      KPIS.map(function (k) { return '<th scope="col"><abbr title="' + esc(k.name) + '">' + esc(k.short) + '</abbr></th>'; }).join('') +
      '</tr></thead><tbody>' +
      C.teams.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (t) {
        return '<tr><th scope="row"><a href="#/dashboard?team=' + t.id + '">' + esc(t.name) + '</a><span class="muted small">' + esc(t.project || '') + '</span></th>' +
          KPIS.map(function (k) {
            var s = stats(k, t.id);
            return '<td class="cell cell--' + s.status.key + '"><a href="#/kpi/' + k.id + '?team=' + t.id + '" aria-label="' + esc(t.name + ', ' + k.name + ': ' + fmt(k, s.cur) + ', ' + s.status.label) + '">' +
              '<span class="cell__icon" aria-hidden="true">' + s.status.icon + '</span>' + esc(fmt(k, s.cur)) + '</a></td>';
          }).join('') + '</tr>';
      }).join('') +
      '</tbody></table></div></section>';
  }

  function categoryBlocks(teamId) {
    return C.categories.map(function (cat) {
      var ks = KPIS.filter(function (k) { return k.category === cat.id; });
      if (!ks.length) return '';
      return '<section class="cat" aria-labelledby="cat-' + cat.id + '">' +
        '<div class="cat__head"><h2 id="cat-' + cat.id + '">' + esc(cat.label) + '</h2><p class="muted">' + esc(cat.blurb) + '</p></div>' +
        ks.map(function (k) { return kpiRow(k, teamId); }).join('') +
        '</section>';
    }).join('');
  }

  // ---------- views ----------
  function viewDashboard(params) {
    var teamId = params.team && teamById[params.team] ? params.team : null;
    var team = teamId ? teamById[teamId] : null;
    return '<header class="page-head">' +
        '<p class="crumbs">' + (team ? '<a href="#/dashboard">All teams</a> <span aria-hidden="true">/</span> Team view' : 'Leadership view') + '</p>' +
        '<h1 tabindex="-1">' + (team ? esc(team.name) : 'All teams') + '</h1>' +
        '<p class="muted">' + (team ? esc(team.project || '') : C.teams.length + ' teams combined') + '</p>' +
      '</header>' +
      filterBar(teamId) +
      summary(teamId) +
      (team ? '' : teamsMatrix()) +
      chartLegend() +
      categoryBlocks(teamId);
  }

  function viewKpi(kpiId, params) {
    var k = kpiById[kpiId];
    if (!k) return viewNotFound();
    var teamId = params.team && teamById[params.team] ? params.team : null;
    if (state.chartKpi !== kpiId + '|' + (teamId || '')) {
      state.chartTeams = teamId ? [teamId, 'group'] : C.teams.map(function (t) { return t.id; }).concat(['group']);
      state.chartKpi = kpiId + '|' + (teamId || '');
    }
    var pair = k.pairedWith && kpiById[k.pairedWith];
    var cat = C.categories.find(function (c) { return c.id === k.category; });
    var q = teamId ? '?team=' + teamId : '';
    function chip(id, label, i) {
      var cls = id === 'group' ? 'sgroup' : 's' + (i % 6 + 1);
      var dash = id === 'group' ? '' : C.seriesDashes[i % C.seriesDashes.length];
      return '<label class="chip"><input type="checkbox" data-action="series" value="' + id + '"' + (state.chartTeams.indexOf(id) > -1 ? ' checked' : '') + '>' +
        CH.swatch('line', 'series ' + cls, dash) + esc(label) + '</label>';
    }
    function fact(t, d) { return d ? '<dt>' + esc(t) + '</dt><dd>' + esc(d) + '</dd>' : ''; }

    return '<header class="page-head">' +
        '<p class="crumbs"><a href="#/dashboard' + q + '">' + esc(scopeName(teamId)) + '</a> <span aria-hidden="true">/</span> ' + esc(cat ? cat.label : '') + '</p>' +
        '<h1 tabindex="-1">' + esc(k.name) + (k.enabled === false ? ' <span class="pill">Not selected</span>' : '') + '</h1>' +
      '</header>' +
      filterBar(teamId) +
      chartLegend() +
      kpiRow(k, teamId, { noLink: true }) +
      '<div class="detail-grid">' +
        '<section class="panel" aria-labelledby="cmp-h"><div class="panel__head"><h2 id="cmp-h">Compare teams</h2>' +
          '<p class="muted">Each sprint, ' + esc(range().label.toLowerCase()) + '. Lines are not smoothed.</p></div>' +
          '<fieldset class="chips"><legend>Show on chart</legend>' +
            C.teams.map(function (t, i) { return chip(t.id, t.name, i); }).join('') + chip('group', 'Group average', 0) +
          '</fieldset><div id="chart-slot"></div></section>' +
        '<aside class="panel facts" aria-labelledby="facts-h"><h2 id="facts-h">About this KPI</h2><dl>' +
          fact('Definition', k.definition) +
          fact('Question it answers', k.question) +
          fact('Formula', k.formula) +
          fact('Data source', k.dataSource) +
          fact('Target', targetText(k)) +
          fact('Benchmark', k.benchmark) +
          fact('Risk of gaming', k.gamingRisk) +
          (pair ? '<dt>Balanced by</dt><dd><a href="#/kpi/' + pair.id + q + '">' + esc(pair.name) + '</a></dd>' : '') +
        '</dl></aside>' +
      '</div>';
  }

  function renderCompareChart(kpiId) {
    var k = kpiById[kpiId];
    var slot = document.getElementById('chart-slot');
    if (!slot || !k) return;
    var ps = windowPeriods();
    var series = [];
    C.teams.forEach(function (t, i) {
      if (state.chartTeams.indexOf(t.id) < 0) return;
      series.push({ name: t.name, values: windowOf(D.series[t.id][k.id], 0), cls: 's' + (i % 6 + 1), dash: C.seriesDashes[i % C.seriesDashes.length] });
    });
    if (state.chartTeams.indexOf('group') > -1) {
      series.push({ name: 'Group avg', values: windowOf(D.group(k.id), 0), cls: 'sgroup', dash: '', width: 3.5 });
    }
    if (!series.length) { slot.innerHTML = '<p class="empty">Select at least one team to show the trend.</p>'; return; }
    var lo = k.sample && k.sample.min != null ? k.sample.min : (k.unit === 'percent' ? 0 : null);
    var hi = k.unit === 'percent' ? 100 : (k.sample && k.sample.max != null ? k.sample.max : null);
    var chart = CH.lineChart({
      labels: ps.map(function (p) { return p.short; }),
      series: series,
      target: k.direction === 'neutral' ? null : k.target,
      targetLabel: targetText(k, ''),
      format: fmtAxis(k),
      floor: lo, ceil: hi,
      title: k.name + ' by sprint for ' + series.map(function (s) { return s.name; }).join(', ') + '. ' + targetText(k) + '.'
    });
    var table = '<details class="data-table"><summary>Show the numbers</summary><div class="table-wrap" tabindex="0" role="region" aria-label="Chart data"><table><thead><tr><th scope="col">Sprint</th>' +
      series.map(function (s) { return '<th scope="col">' + esc(s.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      ps.map(function (p, i) {
        return '<tr><th scope="row">' + esc(p.label) + '</th>' + series.map(function (s) {
          var v = s.values[i], st = status(k, v);
          return '<td class="cell--' + st.key + '"><span class="cell__icon" aria-hidden="true">' + st.icon + '</span> ' + esc(fmt(k, v)) + '<span class="sr-only"> (' + st.label + ')</span></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div></details>';
    slot.innerHTML = '<figure class="chart">' + chart + '</figure>' + table;
  }

  function viewFramework() {
    var cols = ['KPI', 'Formula', 'Data source', 'Question it answers', 'Benchmark or target', 'Risk of gaming'];
    var rejected = ALL.filter(function (k) { return k.enabled === false; });
    function catName(k) { var c = C.categories.find(function (x) { return x.id === k.category; }); return c ? c.label : ''; }
    return '<header class="page-head"><p class="crumbs">Reference</p><h1 tabindex="-1">KPI framework</h1>' +
      '<p class="muted">' + KPIS.length + ' recommended KPIs, balanced across speed, quality, stability and team health. All are measured per team, never per person.</p></header>' +
      '<section class="panel"><div class="table-wrap" tabindex="0" role="region" aria-label="KPI framework"><table class="framework"><thead><tr>' +
      cols.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      KPIS.map(function (k) {
        return '<tr><th scope="row"><a href="#/kpi/' + k.id + '">' + esc(k.name) + '</a><span class="tag">' + esc(catName(k)) + '</span><span class="small">' + esc(k.definition) + '</span></th>' +
          '<td>' + esc(k.formula) + '</td><td>' + esc(k.dataSource) + '</td><td>' + esc(k.question) + '</td>' +
          '<td><strong>' + esc(targetText(k)) + '</strong><br><span class="muted">' + esc(k.benchmark) + '</span></td><td>' + esc(k.gamingRisk) + '</td></tr>';
      }).join('') + '</tbody></table></div></section>' +
      (rejected.length ? '<section class="panel"><div class="panel__head"><h2>Considered, not selected</h2></div><div class="table-wrap" tabindex="0" role="region" aria-label="Rejected metrics"><table class="framework"><thead><tr><th scope="col">Metric</th><th scope="col">Why not</th></tr></thead><tbody>' +
        rejected.map(function (k) { return '<tr><th scope="row"><a href="#/kpi/' + k.id + '">' + esc(k.name) + '</a><span class="small">' + esc(k.definition) + '</span></th><td>' + esc(k.rejectedReason || '') + '</td></tr>'; }).join('') +
        '</tbody></table></div></section>' : '') +
      '<p class="small muted">Left out on purpose: lines of code, and any individual or per-person metric.</p>';
  }

  function viewNotFound() {
    return '<h1 tabindex="-1">Page not found</h1><p><a href="#/dashboard">Back to the dashboard</a></p>';
  }

  // ---------- router ----------
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var q = {}, qi = h.indexOf('?');
    if (qi > -1) {
      h.slice(qi + 1).split('&').forEach(function (p) { var kv = p.split('='); if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
      h = h.slice(0, qi);
    }
    var parts = h.split('/').filter(Boolean);
    var name = parts[0] || 'dashboard';
    if (name === 'overview') name = 'dashboard';
    if (name === 'team') { name = 'dashboard'; q.team = parts[1]; }
    return { name: name, id: parts[1], params: q };
  }

  function updateNav(r) {
    var team = r.params.team || '';
    document.querySelectorAll('.side-nav a').forEach(function (a) {
      var route = a.getAttribute('data-route'), t = a.getAttribute('data-team');
      var on = route === r.name && (route !== 'dashboard' || (t || '') === (r.name === 'dashboard' ? team : '__'));
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function render() {
    var r = parse();
    var html;
    if (r.name === 'dashboard') html = viewDashboard(r.params);
    else if (r.name === 'kpi') html = viewKpi(r.id, r.params);
    else if (r.name === 'framework') html = viewFramework();
    else html = viewNotFound();
    app.innerHTML = html;
    if (r.name === 'kpi') renderCompareChart(r.id);
    updateNav(r);
    var h1 = app.querySelector('h1');
    document.title = (h1 ? h1.textContent + ' · ' : '') + C.title;
    return h1;
  }

  function navigate() {
    var h1 = render();
    window.scrollTo(0, 0);
    if (h1) h1.focus({ preventScroll: true });
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    var btn = document.getElementById('theme-btn');
    if (btn) {
      btn.textContent = state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-pressed', state.theme === 'light' ? 'true' : 'false');
    }
  }

  // ---------- events ----------
  document.addEventListener('change', function (e) {
    var t = e.target, action = t.getAttribute('data-action');
    var r = parse();
    if (action === 'range') { state.rangeId = t.value; save('rangeId'); render(); }
    else if (action === 'compare') { state.compare = t.value; save('compare'); render(); }
    else if (action === 'team') {
      var base = r.name === 'kpi' ? '#/kpi/' + r.id : '#/dashboard';
      location.hash = base + (t.value ? '?team=' + t.value : '');
    } else if (action === 'series') {
      state.chartTeams = Array.prototype.filter.call(document.querySelectorAll('[data-action="series"]'), function (b) { return b.checked; })
        .map(function (b) { return b.value; });
      renderCompareChart(r.id);
    }
  });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-action="theme"]');
    if (!btn) return;
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    save('theme');
    applyTheme();
  });

  // ---------- shell ----------
  document.getElementById('brand-title').textContent = C.title;
  document.getElementById('brand-org').textContent = C.orgName;
  document.getElementById('team-links').innerHTML = C.teams.map(function (t) {
    return '<li><a href="#/dashboard?team=' + t.id + '" data-route="dashboard" data-team="' + t.id + '">' + esc(t.name) + '</a></li>';
  }).join('');
  if (!C.sampleData) document.getElementById('sample-note').hidden = true;
  applyTheme();

  window.addEventListener('hashchange', navigate);
  if (!location.hash) history.replaceState(null, '', '#/dashboard');
  render();
})();
