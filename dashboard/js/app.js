/*
 * Views and navigation. You should not need to edit this file to change
 * content: teams/periods live in config.js, KPIs in kpis.js, numbers in
 * data/team-data.js.
 *
 * Views (URL hash):
 *   #/overview             leadership quick glance across all teams
 *   #/team/<teamId>        one team's KPIs with trends
 *   #/kpi/<kpiId>?team=<id> one KPI over time, all teams, with its definition
 *   #/framework            the full KPI framework table
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

  // ---------- state ----------
  var state = { rangeId: C.defaultRange, chartTeams: null };
  try {
    var saved = localStorage.getItem('sweg-range');
    if (saved && C.ranges.some(function (r) { return r.id === saved; })) state.rangeId = saved;
  } catch (e) { /* storage unavailable: use default */ }

  function range() { return C.ranges.find(function (r) { return r.id === state.rangeId; }) || C.ranges[0]; }
  function win(arr) { return arr.slice(-range().count); }

  // ---------- formatting ----------
  var UNIT = {
    percent: function (v, d) { return v.toFixed(d) + '%'; },
    days:    function (v, d) { return v.toFixed(d) + (v === 1 ? ' day' : ' days'); },
    hours:   function (v, d) { return v.toFixed(d) + ' h'; },
    perWeek: function (v, d) { return v.toFixed(d) + ' / wk'; },
    count:   function (v, d) { return v.toFixed(d); },
    score:   function (v, d) { return v.toFixed(d) + ' / 5'; }
  };
  function fmt(k, v) {
    if (v == null || isNaN(v)) return '—';
    return (UNIT[k.unit] || UNIT.count)(v, k.decimals || 0);
  }
  function fmtAxis(k) {
    return function (v) {
      var d = Math.abs(v) < 10 && v % 1 ? 1 : 0;
      return (UNIT[k.unit] || UNIT.count)(v, d).replace(' days', 'd').replace(' day', 'd');
    };
  }
  function targetText(k) {
    if (k.direction === 'neutral' || k.target == null) return 'No target (context only)';
    return 'Target ' + (k.direction === 'higher' ? '≥ ' : '≤ ') + fmt(k, k.target);
  }

  // ---------- status + trend ----------
  var STATUS = {
    ok:     { key: 'ok',     label: 'On target',   icon: '✓' },
    watch:  { key: 'watch',  label: 'Watch',       icon: '!' },
    off:    { key: 'off',    label: 'Off target',  icon: '✕' },
    info:   { key: 'info',   label: 'For context', icon: 'i' },
    nodata: { key: 'nodata', label: 'No data',     icon: '–' }
  };
  function status(k, v) {
    if (v == null || isNaN(v)) return STATUS.nodata;
    if (k.direction === 'neutral' || k.target == null) return STATUS.info;
    var hi = k.direction === 'higher';
    if (hi ? v >= k.target : v <= k.target) return STATUS.ok;
    if (k.warn != null && (hi ? v >= k.warn : v <= k.warn)) return STATUS.watch;
    return STATUS.off;
  }
  function lastTwo(arr) {
    var vals = [];
    for (var i = arr.length - 1; i >= 0 && vals.length < 2; i--) if (arr[i] != null) vals.push(arr[i]);
    return { cur: vals[0], prev: vals[1] };
  }
  function trend(k, arr) {
    var lt = lastTwo(arr);
    if (lt.cur == null || lt.prev == null) return { key: 'none', label: 'Not enough data', arrow: '', delta: '' };
    var d = lt.cur - lt.prev;
    var rel = Math.abs(d) / Math.max(Math.abs(lt.prev), 1e-9);
    var arrow = d > 0 ? '▲' : d < 0 ? '▼' : '▬';
    var delta = (d > 0 ? '+' : d < 0 ? '−' : '±') + fmt(k, Math.abs(d)) + ' vs last ' + C.periods.label.toLowerCase();
    if (rel < 0.02) return { key: 'steady', label: 'Steady', arrow: '▬', delta: delta };
    if (k.direction === 'neutral') return { key: 'steady', label: d > 0 ? 'Up' : 'Down', arrow: arrow, delta: delta };
    var better = (d > 0) === (k.direction === 'higher');
    return { key: better ? 'better' : 'worse', label: better ? 'Improving' : 'Worsening', arrow: arrow, delta: delta };
  }

  // ---------- shared pieces ----------
  function badge(s) {
    return '<span class="badge badge--' + s.key + '"><span class="badge__icon" aria-hidden="true">' + s.icon + '</span>' + s.label + '</span>';
  }
  function kpiCard(k, values, teamId) {
    var w = win(values);
    var cur = lastTwo(w).cur;
    var s = status(k, cur), t = trend(k, w);
    var pair = k.pairedWith && kpiById[k.pairedWith];
    var href = '#/kpi/' + k.id + (teamId ? '?team=' + teamId : '');
    return '<a class="kpi-card kpi-card--' + s.key + '" href="' + href + '">' +
      '<div class="kpi-card__head"><h3 class="kpi-card__name">' + esc(k.name) + '</h3>' + badge(s) + '</div>' +
      '<div class="kpi-card__row"><span class="kpi-card__value">' + esc(fmt(k, cur)) + '</span>' + CH.sparkline(w, { target: k.target }) + '</div>' +
      '<p class="trend trend--' + t.key + '"><span aria-hidden="true">' + t.arrow + '</span> <strong>' + t.label + '</strong>' +
      (t.delta ? ' <span class="muted">· ' + esc(t.delta) + '</span>' : '') + '</p>' +
      '<p class="kpi-card__def">' + esc(k.definition) + '</p>' +
      '<p class="kpi-card__meta">' + esc(targetText(k)) +
      (pair ? '<br>Balanced by: ' + esc(pair.name) : '') + '</p>' +
      '<span class="kpi-card__more">View trend and definition <span aria-hidden="true">→</span></span>' +
      '</a>';
  }
  function categorySections(renderCard) {
    return C.categories.map(function (cat) {
      var ks = KPIS.filter(function (k) { return k.category === cat.id; });
      if (!ks.length) return '';
      return '<section class="cat" aria-labelledby="cat-' + cat.id + '">' +
        '<h2 id="cat-' + cat.id + '">' + esc(cat.label) + '</h2>' +
        '<p class="cat__blurb">' + esc(cat.blurb) + '</p>' +
        '<div class="card-grid">' + ks.map(renderCard).join('') + '</div></section>';
    }).join('');
  }
  function periodSpan() {
    var ps = win(D.periods);
    var f = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    return ps[0].label + ' to ' + ps[ps.length - 1].label + ' (' + f(ps[0].start) + ' to ' + f(ps[ps.length - 1].end) + ', ' + ps[ps.length - 1].end.getFullYear() + ')';
  }
  function statusCounts(values) {
    var c = { ok: 0, watch: 0, off: 0 };
    values.forEach(function (s) { if (c[s.key] != null) c[s.key]++; });
    return c;
  }
  function summaryStrip(c, noun) {
    return '<ul class="summary" aria-label="Status summary">' +
      '<li class="summary__item summary__item--ok">' + badge(STATUS.ok) + '<span class="summary__n">' + c.ok + '</span> ' + noun + '</li>' +
      '<li class="summary__item summary__item--watch">' + badge(STATUS.watch) + '<span class="summary__n">' + c.watch + '</span> ' + noun + '</li>' +
      '<li class="summary__item summary__item--off">' + badge(STATUS.off) + '<span class="summary__n">' + c.off + '</span> ' + noun + '</li>' +
      '</ul>';
  }

  // ---------- views ----------
  function viewOverview() {
    var groupStatuses = KPIS.map(function (k) { return status(k, lastTwo(win(D.group(k.id))).cur); });
    var html = '<header class="page-head"><h1 tabindex="-1">Group overview</h1>' +
      '<p class="muted">All teams combined · ' + esc(periodSpan()) + '</p></header>' +
      summaryStrip(statusCounts(groupStatuses), 'group KPIs');

    // Team × KPI matrix
    html += '<section aria-labelledby="matrix-h"><h2 id="matrix-h">Teams at a glance</h2>' +
      '<p class="cat__blurb">Latest ' + esc(C.periods.label.toLowerCase()) + ' for each team. Teams are listed alphabetically: this is not a ranking. Select a team or a value for details.</p>' +
      '<div class="table-wrap" tabindex="0" role="region" aria-label="Teams at a glance table"><table class="matrix"><thead><tr><th scope="col">Team</th>' +
      KPIS.map(function (k) { return '<th scope="col"><abbr title="' + esc(k.name) + '">' + esc(k.short) + '</abbr></th>'; }).join('') +
      '</tr></thead><tbody>' +
      C.teams.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (t) {
        return '<tr><th scope="row"><a href="#/team/' + t.id + '">' + esc(t.name) + '</a><span class="muted small">' + esc(t.project || '') + '</span></th>' +
          KPIS.map(function (k) {
            var v = lastTwo(win(D.series[t.id][k.id])).cur, s = status(k, v);
            return '<td class="cell cell--' + s.key + '"><a href="#/kpi/' + k.id + '?team=' + t.id + '" aria-label="' + esc(t.name + ', ' + k.name + ': ' + fmt(k, v) + ', ' + s.label) + '">' +
              '<span class="cell__icon" aria-hidden="true">' + s.icon + '</span>' + esc(fmt(k, v)) + '</a></td>';
          }).join('') + '</tr>';
      }).join('') +
      '</tbody></table></div>' +
      '<p class="legend small">' + badge(STATUS.ok) + ' ' + badge(STATUS.watch) + ' ' + badge(STATUS.off) + '</p></section>';

    // Group-wide KPI cards
    html += '<h2 class="section-title">Group KPIs</h2>' +
      categorySections(function (k) { return kpiCard(k, D.group(k.id), null); });
    return html;
  }

  function viewTeam(teamId) {
    var team = teamById[teamId];
    if (!team) return viewNotFound();
    var statuses = KPIS.map(function (k) { return status(k, lastTwo(win(D.series[teamId][k.id])).cur); });
    return '<header class="page-head"><div>' +
      '<p class="crumbs"><a href="#/overview">Overview</a> <span aria-hidden="true">/</span> Teams</p>' +
      '<h1 tabindex="-1">' + esc(team.name) + '</h1>' +
      '<p class="muted">' + esc(team.project || '') + ' · ' + esc(periodSpan()) + '</p></div>' +
      '<label class="inline-field">Switch team <select data-action="team">' +
      C.teams.map(function (t) { return '<option value="' + t.id + '"' + (t.id === teamId ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') +
      '</select></label></header>' +
      summaryStrip(statusCounts(statuses), 'KPIs') +
      categorySections(function (k) { return kpiCard(k, D.series[teamId][k.id], teamId); });
  }

  function viewKpi(kpiId, params) {
    var k = kpiById[kpiId];
    if (!k) return viewNotFound();
    var focusTeam = params.team && teamById[params.team] ? params.team : null;
    if (!state.chartTeams || state.chartKpi !== kpiId) {
      state.chartTeams = focusTeam ? [focusTeam, 'group'] : C.teams.map(function (t) { return t.id; }).concat(['group']);
      state.chartKpi = kpiId;
    }
    var pair = k.pairedWith && kpiById[k.pairedWith];
    var cat = C.categories.find(function (c) { return c.id === k.category; });
    var back = focusTeam ? '<a href="#/team/' + focusTeam + '">' + esc(teamById[focusTeam].name) + '</a>' : '<a href="#/overview">Overview</a>';

    var options = C.teams.map(function (t, i) {
      var st = C.seriesStyles[i % C.seriesStyles.length];
      return checkbox(t.id, t.name, st);
    }).join('') + checkbox('group', 'Group average', C.groupStyle);

    function checkbox(id, label, st) {
      return '<label class="chip"><input type="checkbox" data-action="series" value="' + id + '"' + (state.chartTeams.indexOf(id) > -1 ? ' checked' : '') + '>' +
        '<svg width="28" height="10" aria-hidden="true"><line x1="0" x2="28" y1="5" y2="5" stroke="' + st.color + '" stroke-width="' + (st.width || 2.5) + '"' + (st.dash ? ' stroke-dasharray="' + st.dash + '"' : '') + '/></svg>' +
        esc(label) + '</label>';
    }

    return '<header class="page-head"><div>' +
      '<p class="crumbs">' + back + ' <span aria-hidden="true">/</span> ' + esc(cat ? cat.label : '') + '</p>' +
      '<h1 tabindex="-1">' + esc(k.name) + (k.enabled === false ? ' <span class="pill">Not selected</span>' : '') + '</h1>' +
      '<p class="lead">' + esc(k.definition) + '</p></div></header>' +
      '<div class="kpi-layout">' +
        '<section class="panel" aria-labelledby="trend-h"><h2 id="trend-h">Trend · ' + esc(range().label.toLowerCase()) + '</h2>' +
          '<fieldset class="chips"><legend>Show on chart</legend>' + options + '</fieldset>' +
          '<div id="chart-slot"></div></section>' +
        '<aside class="panel facts" aria-labelledby="facts-h"><h2 id="facts-h">About this KPI</h2><dl>' +
          fact('Question it answers', k.question) +
          fact('Formula', k.formula) +
          fact('Data source', k.dataSource) +
          fact('Target', targetText(k)) +
          fact('Benchmark', k.benchmark) +
          fact('Risk of gaming', k.gamingRisk) +
          (pair ? '<dt>Balanced by</dt><dd><a href="#/kpi/' + pair.id + (focusTeam ? '?team=' + focusTeam : '') + '">' + esc(pair.name) + '</a></dd>' : '') +
        '</dl></aside>' +
      '</div>';
    function fact(t, d) { return d ? '<dt>' + esc(t) + '</dt><dd>' + esc(d) + '</dd>' : ''; }
  }

  function renderKpiChart(kpiId) {
    var k = kpiById[kpiId];
    var slot = document.getElementById('chart-slot');
    if (!slot) return;
    var ps = win(D.periods);
    var series = [];
    C.teams.forEach(function (t, i) {
      if (state.chartTeams.indexOf(t.id) < 0) return;
      var st = C.seriesStyles[i % C.seriesStyles.length];
      series.push({ name: t.name, values: win(D.series[t.id][k.id]), color: st.color, dash: st.dash });
    });
    if (state.chartTeams.indexOf('group') > -1) {
      series.push({ name: 'Group avg', values: win(D.group(k.id)), color: C.groupStyle.color, dash: C.groupStyle.dash, width: C.groupStyle.width });
    }
    if (!series.length) { slot.innerHTML = '<p class="empty">Select at least one team to show the trend.</p>'; return; }
    var chart = CH.lineChart({
      labels: ps.map(function (p) { return p.short; }),
      series: series,
      target: k.direction === 'neutral' ? null : k.target,
      targetLabel: targetText(k),
      format: fmtAxis(k),
      floor: k.unit === 'percent' || k.sample && k.sample.min != null ? (k.sample && k.sample.min != null ? k.sample.min : 0) : null,
      ceil: k.unit === 'percent' ? 100 : (k.sample && k.sample.max != null ? k.sample.max : null),
      title: k.name + ' by ' + C.periods.label.toLowerCase() + ', ' + series.map(function (s) { return s.name; }).join(', ') + '. ' + targetText(k) + '.'
    });
    var table = '<details class="data-table"><summary>Show the numbers</summary><div class="table-wrap" tabindex="0" role="region" aria-label="Chart data"><table><thead><tr><th scope="col">' + esc(C.periods.label) + '</th>' +
      series.map(function (s) { return '<th scope="col">' + esc(s.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      ps.map(function (p, i) {
        return '<tr><th scope="row">' + esc(p.label) + '</th>' + series.map(function (s) {
          var v = s.values[i], st = status(k, v);
          return '<td>' + esc(fmt(k, v)) + ' <span class="sr-only">(' + st.label + ')</span><span class="cell__icon cell--' + st.key + '" aria-hidden="true">' + st.icon + '</span></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div></details>';
    slot.innerHTML = '<figure class="chart">' + chart + '</figure>' + table;
  }

  function viewFramework() {
    var cols = ['KPI', 'Formula', 'Data source', 'Question it answers', 'Benchmark or target', 'Risk of gaming'];
    function rows(list) {
      return list.map(function (k) {
        var cat = C.categories.find(function (c) { return c.id === k.category; });
        return '<tr><th scope="row"><a href="#/kpi/' + k.id + '">' + esc(k.name) + '</a><span class="small muted">' + esc(cat ? cat.label : '') + '</span><span class="small">' + esc(k.definition) + '</span></th>' +
          '<td>' + esc(k.formula) + '</td><td>' + esc(k.dataSource) + '</td><td>' + esc(k.question) + '</td>' +
          '<td><strong>' + esc(targetText(k)) + '</strong><br>' + esc(k.benchmark) + '</td><td>' + esc(k.gamingRisk) + '</td></tr>';
      }).join('');
    }
    var rejected = ALL.filter(function (k) { return k.enabled === false; });
    return '<header class="page-head"><h1 tabindex="-1">KPI framework</h1>' +
      '<p class="muted">' + KPIS.length + ' recommended KPIs, balanced across speed, quality, stability and team health. All are measured per team, never per person.</p></header>' +
      '<div class="table-wrap" tabindex="0" role="region" aria-label="KPI framework table"><table class="framework"><thead><tr>' +
      cols.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + rows(KPIS) + '</tbody></table></div>' +
      (rejected.length ? '<h2 class="section-title">Considered, not selected</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Rejected metrics"><table class="framework"><thead><tr><th scope="col">Metric</th><th scope="col">Why not</th></tr></thead><tbody>' +
        rejected.map(function (k) { return '<tr><th scope="row"><a href="#/kpi/' + k.id + '">' + esc(k.name) + '</a><span class="small">' + esc(k.definition) + '</span></th><td>' + esc(k.rejectedReason || '') + '</td></tr>'; }).join('') +
        '</tbody></table></div>' : '') +
      '<p class="small muted">Not considered at all: lines of code, and any individual or per-person metric.</p>';
  }

  function viewNotFound() {
    return '<h1 tabindex="-1">Page not found</h1><p><a href="#/overview">Back to the overview</a></p>';
  }

  // ---------- router ----------
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var q = {}, qi = h.indexOf('?');
    if (qi > -1) {
      h.slice(qi + 1).split('&').forEach(function (p) { var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
      h = h.slice(0, qi);
    }
    var parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'overview', id: parts[1], params: q };
  }

  function render() {
    var r = parse();
    var html;
    if (r.name === 'overview') html = viewOverview();
    else if (r.name === 'team') html = viewTeam(r.id || C.teams[0].id);
    else if (r.name === 'kpi') html = viewKpi(r.id, r.params);
    else if (r.name === 'framework') html = viewFramework();
    else html = viewNotFound();
    app.innerHTML = html;
    if (r.name === 'kpi' && kpiById[r.id]) renderKpiChart(r.id);

    document.querySelectorAll('.nav a').forEach(function (a) {
      var on = a.getAttribute('data-route') === r.name;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var h1 = app.querySelector('h1');
    document.title = (h1 ? h1.textContent + ' · ' : '') + C.title;
    return h1;
  }

  function navigate() {
    if (parse().name !== 'kpi') state.chartTeams = null;
    var h1 = render();
    window.scrollTo(0, 0);
    if (h1) h1.focus({ preventScroll: true });
  }

  // ---------- events ----------
  document.addEventListener('change', function (e) {
    var t = e.target;
    var action = t.getAttribute('data-action');
    if (action === 'range') {
      state.rangeId = t.value;
      try { localStorage.setItem('sweg-range', t.value); } catch (err) { /* ignore */ }
      render();
    } else if (action === 'team') {
      location.hash = '#/team/' + t.value;
    } else if (action === 'series') {
      var boxes = document.querySelectorAll('[data-action="series"]');
      state.chartTeams = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).map(function (b) { return b.value; });
      renderKpiChart(parse().id);
    }
  });

  // ---------- shell ----------
  document.getElementById('brand-title').textContent = C.title;
  document.getElementById('brand-org').textContent = C.orgName;
  document.getElementById('team-link').setAttribute('href', '#/team/' + C.teams[0].id);
  var sel = document.getElementById('range');
  sel.innerHTML = C.ranges.map(function (r) { return '<option value="' + r.id + '"' + (r.id === state.rangeId ? ' selected' : '') + '>' + esc(r.label) + '</option>'; }).join('');
  if (!C.sampleData) document.getElementById('sample-banner').hidden = true;

  window.addEventListener('hashchange', navigate);
  if (!location.hash) history.replaceState(null, '', '#/overview');
  render();
})();
