/*
 * Dependency-free SVG charts. All colors come from CSS classes, so the
 * charts follow the dark/light theme automatically.
 *
 *   DashCharts.barTrend({ labels, values, target, targetLabel, format, title, ceil })
 *     One KPI over time: a bar per sprint (one neutral color: bar color
 *     carries no meaning), a dashed target line and a dotted linear trend
 *     line. Bars always start at zero so heights stay honest.
 *
 *   DashCharts.lineChart({ labels, series, target, targetLabel, format, title, floor, ceil })
 *     Several teams on one KPI. series: [{ name, values, cls, dash, width }]
 *     Straight segments only (no smoothing), end labels on every line.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isNum(v) { return v != null && !isNaN(v); }
  function nums(arr) { return arr.filter(isNum); }

  function niceTicks(min, max, count) {
    if (min === max) { max = min + 1; }
    var span = max - min;
    var step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
  }

  // Least-squares line through the non-empty points.
  function fit(values) {
    var xs = [], ys = [];
    values.forEach(function (v, i) { if (isNum(v)) { xs.push(i); ys.push(v); } });
    if (xs.length < 3) return null;
    var n = xs.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
    for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i]; sxx += xs[i] * xs[i]; }
    var d = n * sxx - sx * sx;
    if (!d) return null;
    var slope = (n * sxy - sx * sy) / d;
    return { slope: slope, at: function (x) { return (sy - slope * sx) / n + slope * x; } };
  }

  function targetLine(x1, x2, y, label) {
    return '<line class="target" x1="' + x1 + '" x2="' + x2 + '" y1="' + y + '" y2="' + y + '"/>' +
      (label ? '<text class="target-label" x="' + (x2 - 2) + '" y="' + (y - 5) + '" text-anchor="end">' + esc(label) + '</text>' : '');
  }

  function barTrend(o) {
    var W = 640, H = 168, m = { t: 18, r: 10, b: 26, l: 54 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var fmt = o.format || String;
    var vals = nums(o.values);
    if (!vals.length) return '<p class="empty">No data for this period.</p>';
    var max = Math.max.apply(null, vals.concat(isNum(o.target) ? [o.target] : []));
    var hi = max * 1.12;
    if (o.ceil != null) hi = Math.min(o.ceil, hi);
    var ticks = niceTicks(0, hi, 3);
    hi = ticks[ticks.length - 1];
    var n = o.values.length, slot = iw / n, bw = Math.min(42, slot * 0.62);
    var cx = function (i) { return m.l + slot * i + slot / 2; };
    var y = function (v) { return m.t + ih - (v / hi) * ih; };
    var out = ['<svg class="chart-svg chart-svg--bars" viewBox="0 0 ' + W + ' ' + H + '" role="img"><title>' + esc(o.title || '') + '</title>'];

    ticks.forEach(function (t) {
      out.push('<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>');
      out.push('<text class="tick" x="' + (m.l - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + esc(fmt(t)) + '</text>');
    });
    var every = n > 8 ? 2 : 1;
    o.values.forEach(function (v, i) {
      if (isNum(v)) {
        var top = y(v), last = i === n - 1;
        out.push('<rect class="bar' + (last ? ' bar--latest' : '') + '" x="' + (cx(i) - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + Math.max(0, m.t + ih - top) + '" rx="2">' +
          '<title>' + esc(o.labels[i] + ': ' + fmt(v)) + '</title></rect>');
      }
      if (!((n - 1 - i) % every)) {
        out.push('<text class="tick" x="' + cx(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(o.labels[i]) + '</text>');
      }
    });
    out.push('<line class="axis" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>');

    var f = fit(o.values);
    if (f) {
      out.push('<line class="trendline" x1="' + cx(0) + '" x2="' + cx(n - 1) + '" y1="' + y(Math.max(0, f.at(0))) + '" y2="' + y(Math.max(0, f.at(n - 1))) + '"/>');
    }
    if (isNum(o.target)) out.push(targetLine(m.l, W - m.r, y(o.target), o.targetLabel));
    out.push('</svg>');
    return out.join('');
  }

  function lineChart(o) {
    var W = 760, H = 320, m = { t: 22, r: 130, b: 40, l: 64 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var fmt = o.format || String;
    var all = [];
    o.series.forEach(function (s) { all = all.concat(nums(s.values)); });
    if (isNum(o.target)) all.push(o.target);
    if (!all.length) return '<p class="empty">No data for this selection.</p>';
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    var pad = (max - min) * 0.12 || 1;
    var lo = min - pad, hi = max + pad;
    if (o.floor != null) lo = Math.max(o.floor, lo);
    if (o.ceil != null) hi = Math.min(o.ceil, hi);
    var ticks = niceTicks(lo, hi, 5);
    lo = ticks[0]; hi = ticks[ticks.length - 1];
    var n = o.labels.length;
    var x = function (i) { return m.l + (n === 1 ? iw / 2 : i * iw / (n - 1)); };
    var y = function (v) { return m.t + ih - (v - lo) / (hi - lo) * ih; };
    var out = ['<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img"><title>' + esc(o.title || '') + '</title>'];

    ticks.forEach(function (t) {
      out.push('<line class="grid" x1="' + m.l + '" x2="' + (m.l + iw) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>');
      out.push('<text class="tick" x="' + (m.l - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + esc(fmt(t)) + '</text>');
    });
    var every = n > 8 ? 2 : 1;
    o.labels.forEach(function (lab, i) {
      if ((n - 1 - i) % every) return;
      out.push('<text class="tick" x="' + x(i) + '" y="' + (H - m.b + 20) + '" text-anchor="middle">' + esc(lab) + '</text>');
    });
    out.push('<line class="axis" x1="' + m.l + '" x2="' + (m.l + iw) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>');
    if (isNum(o.target)) out.push(targetLine(m.l, m.l + iw, y(o.target), o.targetLabel));

    var ends = [];
    o.series.forEach(function (s) {
      var pts = [], lastI = -1;
      s.values.forEach(function (v, i) { if (isNum(v)) { pts.push(x(i) + ',' + y(v)); lastI = i; } });
      if (!pts.length) return;
      out.push('<polyline class="series ' + s.cls + '" points="' + pts.join(' ') + '" stroke-width="' + (s.width || 2.25) + '"' +
        (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/>');
      s.values.forEach(function (v, i) {
        if (!isNum(v)) return;
        out.push('<circle class="pt ' + s.cls + '" cx="' + x(i) + '" cy="' + y(v) + '" r="3.5"><title>' +
          esc(s.name + ', ' + o.labels[i] + ': ' + fmt(v)) + '</title></circle>');
      });
      ends.push({ name: s.name, cls: s.cls, y: y(s.values[lastI]) });
    });
    ends.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
    ends.forEach(function (e) {
      out.push('<text class="end-label ' + e.cls + '" x="' + (m.l + iw + 10) + '" y="' + (e.y + 4) + '">' + esc(e.name) + '</text>');
    });
    out.push('</svg>');
    return out.join('');
  }

  // Small legend swatches used above charts.
  function swatch(kind, cls, dash) {
    if (kind === 'bar') return '<svg width="14" height="12" aria-hidden="true"><rect class="bar" x="1" y="1" width="12" height="10" rx="2"/></svg>';
    return '<svg width="28" height="10" aria-hidden="true"><line class="' + cls + '" x1="1" x2="27" y1="5" y2="5"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/></svg>';
  }

  window.DashCharts = { barTrend: barTrend, lineChart: lineChart, swatch: swatch, esc: esc };
})();
