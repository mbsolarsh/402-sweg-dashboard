# Usability Test Script: 402 SWEG Metrics Dashboard

**Length:** 10 to 15 minutes · **Roles:** Facilitator (reads the script and runs the laptop setup), Note-taker (times tasks, fills in the note sheet)

> Facilitator: read the text in quotes word for word. Text in *italics* is for you only.

---

## Setup (before the participant sits down)

*Open `dashboard/index.html` in Safari. Make sure it shows: **All teams**, **Last 6 sprints**, **Compare to: previous 6 sprints**, dark theme. Scroll to the top. Note-taker: stopwatch and note sheet ready.*

---

## 1. Introduction (about 1 minute)

"Thanks for helping us. We're a student team designing a dashboard that shows how software teams are performing over time. It's for project managers, team leaders, and leadership in a software engineering group.

We're testing the **dashboard**, not you. There are no wrong answers. If something is confusing, that's exactly what we need to know.

All the numbers are made up. The dashboard only shows **teams**, never individual people.

Please **think out loud** as you go: say what you're looking at, what you expect, and what surprises you. I may not answer questions during the tasks, because we want to see how it works without help, but I'll answer everything at the end.

This takes about 15 minutes, and you can stop at any time. My teammate will take notes. We won't write down your name. Is it OK if we begin?"

*If you want to record audio: "Is it OK if we record audio, just for our notes?" Only record on a clear yes.*

---

## 2. Warm-up (about 1 minute)

"Before we start, two quick questions:"

1. "What's your experience with project management or software teams?"
2. "Have you used a dashboard for work or school before? Which one?"

*Note-taker: write short answers.*

---

## 3. First impression (about 1 minute)

"Take about 10 seconds to look at this screen without clicking anything."

*Wait 10 seconds.*

"In a sentence or two, what is this showing you?"

*Listen for: team performance, status (on target / watch / off target), time period. Don't correct them.*

---

## 4. Tasks (about 8 to 10 minutes)

*Read each task, then say "go" and start the stopwatch. Stop it when they give an answer they're confident in. If they're stuck for 90 seconds, or ask to stop, mark it Fail and move on. Give a hint only if they're completely stuck, and mark the task Partial.*

*After each task ask: **"On a scale of 1 to 7, where 1 is very hard and 7 is very easy, how easy was that?"***

*Between tasks, go back to the starting view: click **All teams** in the sidebar.*

### Task 1: Quick glance
> "Imagine you're a manager who just opened this dashboard. Which team or teams look like they need attention right now, and on what?"

| | |
|---|---|
| **What it tests** | Quick glance: can they read status in seconds? |
| **Success** | Names at least one team with an Off target (✕) or Watch (!) status **and** the metric it applies to, in under 30 seconds |
| **Partial** | Correct but slow (over 30 seconds), or names a team without the metric |
| **Fail** | Wrong team, no answer, or gives up |
| **Watch for** | Do they use the "Teams at a glance" grid or the KPI rows? Do they understand the icons and words? Do they think the team order is a ranking? |
| **Answer key** | *Fill in from the frozen prototype:* ______________________ |

### Task 2: Trend over time
> "Pick Team Bravo. Is Team Bravo's software quality getting better or worse? How can you tell?"

| | |
|---|---|
| **What it tests** | Moving from overview to a team, then reading a trend |
| **Success** | Gets to Team Bravo (sidebar or Team filter), finds the **Quality** section, and gives a correct better/worse answer using the Improving/Worsening label or the chart |
| **Partial** | Right answer for only one quality metric, or needed a hint to find the team view |
| **Fail** | Wrong answer, or can't find the team view |
| **Watch for** | Do they understand the "vs previous 6 sprints" comparison? Do they read the bar chart, the target line, or the trend line? Does "lower is better" (e.g. escaped defects) confuse them? |
| **Answer key** | Coverage: ______ · Pipeline pass: ______ · Escaped defects: ______ |

### Task 3: Understand a KPI and its balance
> "Team Echo's delivery frequency has gone up. Is that good news? Find out what this metric means, what the target is, and whether it might have hurt anything else."

| | |
|---|---|
| **What it tests** | Understanding definitions and targets; noticing balancing metrics |
| **Success** | Opens the Delivery frequency detail for Team Echo, explains it in their own words, states the target, **and** checks Change failure rate (the "Balanced by" link) |
| **Partial** | Explains the metric and target but doesn't check the balancing metric |
| **Fail** | Can't find the definition or target |
| **Watch for** | Do they notice "Balanced by"? Do they use the Compare teams chart? Is the "About this KPI" panel clear? |
| **Answer key** | Target: ≥ 3.0 / wk · Echo's delivery frequency: ______ · Echo's change failure rate: ______ |

### Optional Task 4 (only if time allows): Filters
> "Now change the view to show the last 12 sprints instead of 6. Did anything about Team Bravo's quality look different?"

| | |
|---|---|
| **Success** | Uses the Time range filter without help and comments on the longer trend |
| **Watch for** | Is the filter bar easy to find? Do they understand the "Compare to" option? |

---

## 5. Wrap-up questions (about 2 minutes)

1. "What was the most useful thing on this dashboard?"
2. "What was the most confusing thing?"
3. "Is anything missing that you'd want to see?"
4. "If your team's numbers were on this, would you worry about how they might be used or misread? Why?"
5. "How often would you realistically check a dashboard like this?"

---

## 6. Close (about 30 seconds)

"That's everything. Thank you so much. This really helps. Do you have any questions for us?"

*Answer any questions they asked during the tasks.*

---

## Note sheet (one per session)

**Participant:** P__ · **Date:** ______ · **Facilitator:** ______ · **Note-taker:** ______
**Background:** ______________________________________________

**First impression:** ______________________________________________

| Task | Result (S / P / F) | Time | Wrong turns | Ease (1–7) | Notes and quotes |
|---|---|---|---|---|---|
| 1 Quick glance | | | | | |
| 2 Trend over time | | | | | |
| 3 Understand a KPI | | | | | |
| 4 Filters (optional) | | | | | |

**Wrap-up answers**
1. Most useful: ______________________________________________
2. Most confusing: ______________________________________________
3. Missing: ______________________________________________
4. Misuse concerns: ______________________________________________
5. How often: ______________________________________________

**Problems seen** (add each one to `findings-log.md`):
- ______________________________________________
- ______________________________________________
