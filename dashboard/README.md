# Dashboard prototype

A clickable HTML prototype of the 402 SWEG metrics dashboard. It runs on sample data, has no backend, and needs no install.

**To open it:** double-click `index.html`, or drag it into a browser.

## Views

| View | Who it's for | What it shows |
|---|---|---|
| **Overview** | Leadership | Status summary; teams × KPIs grid (alphabetical, not ranked); group-wide KPI cards |
| **Teams** | Team leaders, PMs | One team's KPIs: current value, status, trend vs last sprint, sparkline, target, balancing metric |
| **KPI detail** | Everyone (drill-down) | Trend chart for any mix of teams plus the group average, target line, data table, and the full framework entry |
| **KPI framework** | PO, report | The framework table from the brief, plus "considered, not selected" with reasons |

The **Time range** filter in the header applies to every view.

## Where to put content

You shouldn't need to touch `app.js`, `charts.js` or the HTML.

| To change… | Edit |
|---|---|
| Which KPIs appear, their definitions, formulas, targets, gaming risks | `js/kpis.js` |
| Choose / reject a KPI | `enabled: true/false` in `js/kpis.js` (add `rejectedReason` when false) |
| Team names, sprint dates, KPI categories, time ranges | `js/config.js` |
| Real or hand-made numbers instead of generated ones | `data/team-data.js` |
| Colors, fonts, spacing (design system) | the `:root` tokens at the top of `css/styles.css` |
| Hide the "Sample data" banner | `sampleData: false` in `js/config.js` |

### Adding a KPI
Copy an existing entry in `js/kpis.js`, give it a new `id`, and fill in the fields. Its `category` must match an id in `config.js`. It then appears automatically on every view.

### Status rules
Each KPI has a `direction` (`higher` or `lower` is better), a `target` and a `warn` threshold:
- meets target → **✓ On target**
- between target and warn → **! Watch**
- past warn → **✕ Off target**
- `direction: 'neutral'` → **i For context** (no good/bad)

## Design rules built in

- **Team level only.** There is no concept of a person anywhere in the data model.
- **No ranking.** Teams are always sorted alphabetically.
- **Status is never color alone.** Every status has an icon and a word; chart lines differ by dash pattern and have end labels; every chart has a "Show the numbers" table.
- **Speed is paired with quality.** Each KPI names its balancing metric (`pairedWith`).
- **Contrast.** Text and line colors are chosen for WCAG 2.2 AA on white.

## Files

```
index.html          page shell
css/styles.css      design tokens + styles
js/config.js        teams, periods, categories, ranges, chart colors
js/kpis.js          KPI framework (main content file)
data/team-data.js   optional real numbers
js/data.js          builds periods + sample data
js/charts.js        SVG sparkline and line chart
js/app.js           views and navigation
```
