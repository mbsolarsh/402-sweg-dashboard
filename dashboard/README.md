# Dashboard prototype

A clickable HTML prototype of the 402 SWEG metrics dashboard. It runs on sample data, has no backend, and needs no install.

**To open it:** double-click `index.html`, or drag it into a browser.

## Views

| View | Who it's for | What it shows |
|---|---|---|
| **All teams** | Leadership | Status count tiles, a teams × KPIs grid (alphabetical, not ranked), and every KPI for the group |
| **Team** (sidebar or Team filter) | Team leaders, PMs | The same KPI rows for one team |
| **KPI detail** (click any KPI) | Everyone | The KPI row, a line chart comparing teams (pick which), a data table, and the full framework entry |
| **KPI framework** | PO, report | The framework table from the brief, plus "Considered, not selected" with reasons |

**Filter bar** (top of every dashboard page): Team · Time range (last 3 / 6 / 12 sprints) · Compare to (previous period or none). There is no per-person filter, by design.

### How each KPI is shown
Every KPI uses the same row, built from what the team liked in the three comparable dashboards:

| Part | What it shows | Borrowed from |
|---|---|---|
| Name + definition | What the number means, with its balancing metric | SquaredUp (definition beside every number) |
| Value tile | Average for the period, status **word + icon**, "vs previous period" change, a context line with the latest sprint and target | Terramate (tier word, "vs" comparison, context line) |
| Trend chart | One bar per sprint in a single neutral color, a dashed **target line**, a dotted **trend line**; bars start at zero | SquaredUp's trend line, with fixes for what the team wanted to avoid: meaningless bar colors and missing targets |

Dark theme by default (like SquaredUp and Terramate); the sidebar button switches to a light theme (like LinearB).

## Where to put content

You shouldn't need to touch `app.js`, `charts.js` or the HTML.

| To change… | Edit |
|---|---|
| Which KPIs appear, their definitions, formulas, targets, gaming risks | `js/kpis.js` |
| Choose / reject a KPI | `enabled: true/false` in `js/kpis.js` (add `rejectedReason` when false) |
| Team names, sprint dates, KPI categories, time ranges | `js/config.js` |
| Real or hand-made numbers instead of generated ones | `data/team-data.js` |
| Colors, fonts, spacing (design system) | the tokens at the top of `css/styles.css` (one block for dark, one for light) |
| Default theme | `defaultTheme` in `js/config.js` |
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
- **Status is never color alone.** Every status has an icon and a word; team lines differ by dash pattern and have end labels; the comparison chart has a "Show the numbers" table.
- **Honest charts.** Bars start at zero, lines are never smoothed, and every chart shows its target.
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
