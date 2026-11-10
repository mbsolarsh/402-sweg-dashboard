# Guerrilla Usability Test Plan: 402 SWEG Metrics Dashboard

**Sprint:** 3, Test and refine (Mon Nov 23 to Thu Dec 3)
**Owner:** Molly (Scrum Master, Sprint 3)
**Status:** Draft, generic version. Swap in persona-based wording once personas are final.

## 1. Goal

Find out whether people can **answer real questions about team performance quickly** using the dashboard prototype, and fix the biggest problems before the final presentation.

### Questions this test answers
1. Can users tell the **current status** of teams within seconds (quick glance)?
2. Can users tell whether a metric is **getting better or worse** over time (trends)?
3. Do users **understand what a KPI means** and what its target is?
4. Do users notice **balancing metrics**, or do they judge a team on speed alone?
5. Can users **use the filters** (team, time range, comparison) without help?

## 2. Method

| Item | Plan |
|---|---|
| Type | Guerrilla, moderated, think-aloud |
| Sessions | 5 |
| Length | 10 to 15 minutes each |
| Tasks | 3 per session (see script) |
| Prototype | `dashboard/index.html`, opened in Safari on a laptop |
| Location | In person (classroom, library, office) or video call with screen share |
| Team per session | 1 facilitator + 1 note-taker |

## 3. Participants

- **Best:** project managers or team leaders from 402 SWEG. Ask the instructor whether the Product Owner can arrange 1 or 2.
- **Otherwise:** anyone with project management or software team experience (developers, PMs, team leads, MIS/CS students with internship or team-project experience).
- Avoid teammates and anyone who has already seen the prototype.

### Recruiting checklist
- [ ] Ask the instructor about PO-arranged participants (do this before Nov 23)
- [ ] Each team member finds 1 participant
- [ ] Book all 5 sessions for **Mon Nov 23 to Wed Nov 25**, before Thanksgiving
- [ ] Have 1 backup participant

| # | Participant (initials only) | Background | Date / time | Facilitator | Note-taker |
|---|---|---|---|---|---|
| P1 | | | | | |
| P2 | | | | | |
| P3 | | | | | |
| P4 | | | | | |
| P5 | | | | | |

## 4. Before testing

- [ ] **Freeze the prototype:** no changes once session 1 starts, so every participant sees the same version.
- [ ] Set the default view: **All teams**, **Last 6 sprints**, **Compare to: previous 6 sprints**, dark theme.
- [ ] Fill in the **answer key** in `test-script.md` from the frozen prototype. The sample data is fixed, so the answers stay the same for every session.
- [ ] Do 1 practice run with a teammate (does it fit in 15 minutes?).
- [ ] Print or copy one **note sheet** per session.

## 5. What we measure

| Measure | How |
|---|---|
| Task success | Success / Partial / Fail (definitions in the script) |
| Time on task | Stopwatch from "go" to answer |
| Wrong turns | Count clicks into the wrong place before finding the answer |
| Ease rating | After each task: "How easy was that?" 1 (very hard) to 7 (very easy) |
| Quotes | Things participants say, written down word for word |

**Targets** (what "good" looks like):
- Task 1 (quick glance): answered in **under 30 seconds** by at least 4 of 5
- All tasks: **at least 4 of 5** succeed without help
- Average ease rating **5 or higher**

## 6. Rating problems

Each problem gets a severity score:

| Score | Severity | Meaning | Action |
|---|---|---|---|
| 4 | Critical | Participant could not finish the task, or got a wrong answer and believed it | Must fix before Dec 3 |
| 3 | Major | Finished, but with real struggle or help | Fix if at all possible |
| 2 | Minor | Small delay or confusion | Fix if time allows |
| 1 | Cosmetic | Noticed, didn't slow them down | Backlog |

Log every problem in `findings-log.md`. A problem seen by more participants ranks higher at the same severity.

## 7. Schedule

| Date | Activity |
|---|---|
| Before Nov 23 | Recruit, book sessions, ask instructor about PO participants |
| Mon Nov 23 | Sprint 3 planning; practice run; freeze prototype; fill answer key |
| Mon Nov 23 to Wed Nov 25 | Run sessions P1 to P5 |
| Same day as each session | Note-taker types notes into `findings-log.md` |
| Fri Nov 27 to Sun Nov 29 | Rank problems, decide fixes, update prototype |
| Mon Nov 30 to Tue Dec 1 | Write testing report (final report Section 6) |
| Thu Dec 3 | Submit report; show before/after in presentation |

## 8. Deliverables from this test

- Testing report: method, participants, results per task, problems ranked by severity, what we changed (final report Section 6, 1 to 2 pages)
- Before/after screenshots of fixes
- Test script and notes (report appendix)

## 9. Ethics

- Participation is voluntary; participants can stop at any time.
- No names in notes, only P1 to P5.
- No audio or video recording unless the participant agrees out loud.
- We are testing the dashboard, not the person.
