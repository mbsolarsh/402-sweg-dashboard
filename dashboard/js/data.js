/*
 * Builds the time periods and the numbers behind every chart.
 *
 * By default every team/KPI gets generated sample data (seeded, so it is
 * the same on every load). To use your own numbers instead, fill in
 * data/team-data.js. Any team/KPI listed there replaces the sample series.
 *
 * Output: window.DASH_DATA = {
 *   periods: [{ id, label, short, start, end }],      oldest first
 *   series:  { teamId: { kpiId: [number|null, ...] } } one value per period
 *   group(kpiId): [number|null, ...]                   group-wide series
 * }
 */
(function () {
  'use strict';
  var C = window.DASH_CONFIG;
  var K = window.DASH_KPIS;
  var OVERRIDES = window.DASH_DATA_OVERRIDES || {};

  // ---- periods ----
  var p = C.periods;
  var end = new Date(p.lastPeriodEnd + 'T12:00:00');
  var periods = [];
  for (var i = p.count - 1; i >= 0; i--) {
    var e = new Date(end); e.setDate(end.getDate() - i * p.lengthDays);
    var s = new Date(e); s.setDate(e.getDate() - p.lengthDays + 1);
    var n = p.firstNumber + (p.count - 1 - i);
    periods.push({
      id: 's' + n,
      label: p.label + ' ' + n,
      short: 'S' + n,
      start: s,
      end: e
    });
  }

  // ---- seeded random so sample data is stable ----
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function round(v, d) { var f = Math.pow(10, d || 0); return Math.round(v * f) / f; }

  function sampleSeries(team, kpi) {
    var cfg = kpi.sample || { base: 50, spread: 10, drift: 0 };
    var r = rng(hash(team.id + '|' + kpi.id));
    var offset = (r() * 2 - 1) * cfg.spread;           // each team sits at its own level
    // drift = change per period in the KPI's own units; most teams follow
    // the sign given in kpis.js, about 1 in 4 go the other way.
    var drift = (cfg.drift || 0) * (0.5 + r() * 1.5) * (r() < 0.25 ? -1 : 1);
    var last = periods.length - 1;
    var out = [];
    for (var i = 0; i < periods.length; i++) {
      var noise = (r() * 2 - 1) * cfg.spread * 0.35;
      var v = cfg.base + offset + drift * (i - last) + noise; // latest period sits near base + offset
      if (cfg.min != null) v = Math.max(cfg.min, v);
      if (cfg.max != null) v = Math.min(cfg.max, v);
      out.push(round(v, kpi.decimals));
    }
    return out;
  }

  // ---- build series ----
  var series = {};
  C.teams.forEach(function (team) {
    series[team.id] = {};
    K.forEach(function (kpi) {
      var given = OVERRIDES[team.id] && OVERRIDES[team.id][kpi.id];
      if (Array.isArray(given)) {
        // Align real data to the newest periods; pad older ones with null.
        var arr = given.slice(-periods.length);
        while (arr.length < periods.length) arr.unshift(null);
        series[team.id][kpi.id] = arr;
      } else {
        series[team.id][kpi.id] = sampleSeries(team, kpi);
      }
    });
  });

  function group(kpiId) {
    var kpi = K.find(function (k) { return k.id === kpiId; });
    var out = [];
    for (var i = 0; i < periods.length; i++) {
      var vals = C.teams
        .map(function (t) { return series[t.id][kpiId][i]; })
        .filter(function (v) { return v != null && !isNaN(v); });
      if (!vals.length) { out.push(null); continue; }
      var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      out.push(round(kpi.aggregate === 'sum' ? sum : sum / vals.length, kpi.decimals));
    }
    return out;
  }

  window.DASH_DATA = { periods: periods, series: series, group: group };
})();
