/*
 * Dashboard settings: teams, time periods, categories, time ranges.
 * Edit this file to change WHO and WHEN the dashboard covers.
 * KPI definitions live in kpis.js; sample numbers come from data.js.
 *
 * TEAM LEVEL ONLY: never add individual people here. The dashboard has
 * no concept of a person, by design (see project brief).
 */
window.DASH_CONFIG = {
  title: '402 SWEG Software Metrics',
  orgName: '402 Software Engineering Group',

  // Shows a banner reminding viewers the numbers are made up.
  sampleData: true,

  // Placeholder team names. Replace with real 402 SWEG team names.
  teams: [
    { id: 'alpha',   name: 'Team Alpha',   project: 'Mission planning' },
    { id: 'bravo',   name: 'Team Bravo',   project: 'Flight controls' },
    { id: 'charlie', name: 'Team Charlie', project: 'Avionics test tools' },
    { id: 'delta',   name: 'Team Delta',   project: 'Sensor integration' },
    { id: 'echo',    name: 'Team Echo',    project: 'Ground support' }
  ],

  // Reporting periods. Sprints are generated backwards from lastPeriodEnd.
  periods: {
    label: 'Sprint',            // what one period is called
    lengthDays: 14,
    count: 12,                  // how many periods of history to generate
    lastPeriodEnd: '2026-11-20',
    firstNumber: 31             // number of the oldest sprint shown
  },

  // Time-range filter in the header.
  ranges: [
    { id: 'last3',  label: 'Last 3 sprints',  count: 3 },
    { id: 'last6',  label: 'Last 6 sprints',  count: 6 },
    { id: 'last12', label: 'Last 12 sprints', count: 12 }
  ],
  defaultRange: 'last6',

  // KPI groups. Order here = order on screen.
  // Balance the final set across speed, quality, stability and team health.
  categories: [
    { id: 'speed',     label: 'Speed and flow',        blurb: 'How quickly work moves from idea to delivered build.' },
    { id: 'quality',   label: 'Quality',               blurb: 'Whether what we deliver works.' },
    { id: 'stability', label: 'Stability and security', blurb: 'How often deliveries break, and how fast teams recover.' },
    { id: 'health',    label: 'Team health and collaboration', blurb: 'Whether the pace is sustainable.' }
  ],

  // Colors for team lines in charts. Each passes WCAG AA (4.5:1) on white,
  // and every line also gets its own dash pattern and an end label, so
  // color is never the only cue.
  seriesStyles: [
    { color: '#0B5FA5', dash: '' },
    { color: '#A34700', dash: '6 3' },
    { color: '#1A7346', dash: '2 3' },
    { color: '#7B3FA0', dash: '10 3 2 3' },
    { color: '#4D4D4D', dash: '4 4' },
    { color: '#8A1C4A', dash: '1 2' }
  ],
  groupStyle: { color: '#111111', dash: '', width: 3.5 }
};
