# 402 SWEG Software Metrics Dashboard

CBIS 4230 / 5230 UX final project (Fall 2026). The team designs a **team-level** software development metrics dashboard for the 402 Software Engineering Group (402 SWEG). The dashboard gives project managers, team leaders, and leadership a quick view of current KPIs and how they trend over time.

> **The core problem:** choosing the *right* KPIs. Avoid vanity metrics like lines of code. Every KPI must name the decision it supports. Measure teams only: no individual developer views, rankings, or leaderboards.

## Team

| Member | Role |
|---|---|
| Conner | Scrum Master, Sprint 1 |
| Olivia | Scrum Master, Sprint 2 |
| Molly | Scrum Master, Sprint 3 |
| Ritvik | Developer |
| Taylor | Developer |

## Sprints

| Sprint | Dates | Scrum Master | Focus |
|---|---|---|---|
| 1. Discovery and metrics | Thu Oct 29 to Sun Nov 8 | Conner | Kickoff, PO interview, survey, comparable dashboards, candidate KPIs |
| 2. Design and prototype | Mon Nov 9 to Sun Nov 22 | Olivia | Survey analysis, personas, KPI framework, wireframes, Figma prototype |
| 3. Test and refine | Mon Nov 23 to Thu Dec 3 | Molly | Guerrilla testing, refined prototype, final report, presentation |

Weekly deliverables are due Sundays at 11:59 PM in GeorgiaView. Final deliverables are due **Thu Dec 3, before class**. Thanksgiving is Thu Nov 26, so schedule Sprint 3 testing around it.

## Deliverables checklist

**Sun Nov 1**
- [x] Project charter (roles, SM rotation, team agreement, schedule, top 5 risks)
- [x] Additional kickoff interview questions for Dexter
- [x] 8 to 10 draft survey questions

**Sun Nov 8 (end of Sprint 1)**
- [ ] Kickoff interview summary
- [ ] Current practice analysis
- [x] Comparable dashboards review (3): SquaredUp, Terramate, LinearB
- [x] Candidate KPI catalog (15 candidates)
- [ ] Product backlog draft in Trello
- [ ] Peer evaluation

**Sun Nov 15**
- [ ] Survey results analysis (responses arrive Fri Nov 13)
- [ ] 2 personas
- [ ] 1 journey map
- [ ] KPI framework v1 (6 to 10 KPIs)

**Sun Nov 22 (end of Sprint 2)**
- [ ] Dashboard structure (views and drill-downs)
- [ ] Annotated wireframes (4 to 6 views)
- [ ] Design system with accessible chart palette (WCAG 2.2 AA)
- [ ] Fully functional Figma prototype (all KPIs, sample data)
- [ ] Guerrilla testing plan
- [ ] Updated backlog and peer evaluation

**Thu Dec 3 (end of Sprint 3)**
- [ ] Guerrilla testing report (5 sessions)
- [ ] Refined prototype
- [ ] Final KPI framework
- [ ] Implementation plan
- [ ] Final report (15 to 20 pages)
- [ ] Presentation slides (15 min + 5 min Q&A)
- [ ] Final backlog and peer evaluation

## KPI framework columns

Each recommended KPI needs: **KPI** (name and definition) · **Formula** (with units) · **Data source** · **Question it answers** · **Benchmark or target** · **Risk of gaming**. Balance the set across speed, quality, stability, and team health, and pair every speed metric with a quality metric.

## Dashboard prototype

Open `dashboard/index.html` in a browser. All content (KPIs, teams, targets, numbers) lives in a few data files, so the dashboard updates when the framework changes. See [`dashboard/README.md`](dashboard/README.md).

## Repo layout

```
dashboard/               Clickable HTML prototype (open dashboard/index.html)
docs/                    Original instructions and charter
01-research/             PO interview, survey, current practice, comparables, personas, journey map
02-kpi-framework/        Candidate catalog, framework table, rejected metrics
03-design/               Structure, wireframes, design system, Figma links
04-usability-testing/    Test plan, script, session notes, findings
05-final-report/         Report drafts
06-presentation/         Slides
agile/                   Backlog, sprint goals, retrospectives
```

## Scope

**In:** team-level KPIs, research, personas, journey map, Figma prototype with sample data, usability testing, final report, presentation.
**Out:** individual developer metrics or rankings, real data connections, coded dashboard.
