# Dexter (Product Owner) chat: KPI notes

Date logged: 2026-11-17. Source: pasted chat notes.

## Context
- 402 SWEG is research and development software engineering.
- Teams build, then hand off for maintenance and incremental updates.
- Not a delivery-cycle organization, so several DORA-style metrics do not map.

## KPI reactions
| KPI | Reaction | Dashboard action |
|---|---|---|
| Sprint commitment | Top priority. All levels want to see it quickly. | Enabled, lead with it |
| Lead time | Iffy as defined. R&D measures "change identified" to "change in a branch / implemented in code", not delivery. | Enabled, redefined |
| Recovery time | In his top 5 | Enabled |
| Cycle time | Good to implement. Shows how long tasks take and helps estimate work. | Enabled (was rejected) |
| Change failure rate | Good but not used much. Wants it known when it is used. | Enabled, low prominence |
| Delivery frequency | N/A, they are not "delivering". | Disabled |
| Rework rate | N/A, not user-interactive work. | Stays disabled |
| Escaped defect rate | Said N/A, but later said team leads want it. | **Open question** |

Top 5 as noted: 1. Sprint commitment, 2. Lead time, 3. Recovery time, 4. and 5. not captured.

## Audience
- High level: wants to know "are we doing the work we want to do, effectively". Not concerned with pipeline or coverage rates.
- Team lead: does want pipeline, coverage, and escaped defects.
- Implication: the leadership view and team-lead view need different default KPI sets.

## Visual preferences
Line graphs, trend lines, bars.

## Follow-ups for Dexter
1. Items 4 and 5 of his top 5.
2. Escaped defects: N/A, or wanted by team leads? (notes conflict)
3. Confirm the lead-time definition (change identified to in branch).
