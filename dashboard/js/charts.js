/*
 * Small, dependency-free SVG charts.
 *   DashCharts.sparkline(values, { target })        -> tiny trend line for cards
 *   DashCharts.lineChart({ labels, series, target, format, title })
 *        series: [{ name, values, color, dash, width }]
 *
 * Accessibility: lines differ by dash pattern and carry end labels, not
 * just color. The full chart has a text title, and the app adds a data
 * table under each chart.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nums(arr) { return arr.filter(function (v) { return v != null && !isNaN(v); }); }

  function niceTicks(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    var span = max - min;
    var step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
  }

  function sparkline(values, opts) {
    opts = opts || {};
    var w = 120, h = 32, pad = 3;
    var v = nums(values);
    if (v.length < 2) return '';
    var all = opts.target != null ? v.concat([opts.target]) : v;
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    if (min === max) { min -= 1; max += 1; }
    var x = function (i) { return pad + i * (w - pad * 2) / (values.length - 1); };
    var y = function (val) { return h - pad - (val - min) / (max - min) * (h - pad * 2); };
    var pts = [], last = null;
    values.forEach(function (val, i) {
      if (val == null) return;
      pts.push(x(i).toFixed(1) + ',' + y(val).toFixed(1));
      last = [x(i), y(val)];
    });
    var target = opts.target != null
      ? '<line class="spark-target" x1="0" x2="' + w + '" y1="' + y(opts.target).toFixed(1) + '" y2="' + y(opts.target).toFixed(1) + '"/>'
      : '';
    return '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false">' +
      target +
      '<polyline class="spark-line" points="' + pts.join(' ') + '"/>' +
      '<circle class="spark-dot" cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.5"/>' +
      '</svg>';
  }

  var uid = 0;
  function lineChart(o) {
    var W = 760, H = 320, m = { t: 20, r: 128, b: 40, l: 64 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var fmt = o.format || function (v) { return String(v); };
    var all = [];
    o.series.forEach(function (s) { all = all.concat(nums(s.values)); });
    if (o.target != null) all.push(o.target);
    if (!all.length) return '<p class="empty">No data for this selection.</p>';
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    var padv = (max - min) * 0.1 || 1;
    var lo = o.floor != null ? Math.max(o.floor, min - padv) : min - padv;
    var hi = o.ceil != null ? Math.min(o.ceil, max + padv) : max + padv;
    var ticks = niceTicks(lo, hi, 5);
    lo = ticks[0]; hi = ticks[ticks.length - 1];
    var n = o.labels.length;
    var x = function (i) { return m.l + (n === 1 ? iw / 2 : i * iw / (n - 1)); };
    var y = function (v) { return m.t + ih - (v - lo) / (hi - lo) * ih; };
    var id = 'chart-' + (++uid);
    var out = [];

    out.push('<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + id + '-t">');
    out.push('<title id="' + id + '-t">' + esc(o.title || 'Trend chart') + '</title>');

    // grid + y axis
    ticks.forEach(function (t) {
      out.push('<line class="grid" x1="' + m.l + '" x2="' + (m.l + iw) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>');
      out.push('<text class="tick" x="' + (m.l - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + esc(fmt(t)) + '</text>');
    });
    // x labels (thin out when crowded)
    var every = n > 8 ? 2 : 1;
    o.labels.forEach(function (lab, i) {
      if ((n - 1 - i) % every) return;
      out.push('<text class="tick" x="' + x(i) + '" y="' + (H - m.b + 20) + '" text-anchor="middle">' + esc(lab) + '</text>');
    });
    out.push('<line class="axis" x1="' + m.l + '" x2="' + (m.l + iw) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>');

    // target line
    if (o.target != null) {
      var ty = y(o.target);
      out.push('<line class="target" x1="' + m.l + '" x2="' + (m.l + iw) + '" y1="' + ty + '" y2="' + ty + '"/>');
      out.push('<text class="target-label" x="' + (m.l + iw - 4) + '" y="' + (ty + 16) + '" text-anchor="end">' + esc(o.targetLabel || ('Target ' + fmt(o.target))) + '</text>');
    }

    // series
    var ends = [];
    o.series.forEach(function (s) {
      var pts = [], lastI = -1;
      s.values.forEach(function (v, i) { if (v != null) { pts.push(x(i) + ',' + y(v)); lastI = i; } });
      if (!pts.length) return;
      out.push('<polyline class="series" points="' + pts.join(' ') + '" stroke="' + s.color + '" stroke-width="' + (s.width || 2.25) + '"' +
        (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/>');
      s.values.forEach(function (v, i) {
        if (v == null) return;
        out.push('<circle class="pt" cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" fill="' + s.color + '"><title>' +
          esc(s.name + ', ' + o.labels[i] + ': ' + fmt(v)) + '</title></circle>');
      });
      ends.push({ name: s.name, color: s.color, y: y(s.values[lastI]), x: x(lastI) });
    });

    // end labels, nudged so they never overlap
    ends.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < ends.length; i++) {
      if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
    }
    ends.forEach(function (e) {
      out.push('<text class="end-label" x="' + (m.l + iw + 10) + '" y="' + (e.y + 4) + '" fill="' + e.color + '">' + esc(e.name) + '</text>');
    });

    out.push('</svg>');
    return out.join('');
  }

  window.DashCharts = { sparkline: sparkline, lineChart: lineChart, esc: esc };
})();
