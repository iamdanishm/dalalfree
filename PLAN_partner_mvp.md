Partner Dashboard MVP Redesign Plan
Overview
- Redesign the current partner page to MVP UI that mirrors the admin dashboard's header and navbar.
- Remove all existing code in app/(dashboard)/partner/page.jsx and replace with a clean UI skeleton featuring metric cards and charts.

Goals
- Create a clean, responsive UI with:
  - Header matching admin design (logo, user menu, sign out)
  - Consistent navbar/side nav as in admin
  - KPI cards: Total Properties, Sold Properties, Rejected Properties, Total Earnings, and additional MVP metrics
  - Charts: a compact Earnings chart and a simple status distribution chart
  - MVP scope: no leads/contacts sections

Plan & Milestones
- Milestone 1 — Plan validation (today)
  - Produce PLAN.md (current task)
- Milestone 2 — UI skeleton (1-2 days)
  - Create partner/ui-skeleton component matching admin header/navbar
  - Implement layout wrapper reusing admin styles
- Milestone 3 — KPI cards (1-2 days)
  - Create Card component and render 4-6 metric cards with placeholder data
- Milestone 4 — Charts (2-3 days)
  - Implement simple bar chart (monthly earnings) and a small status distribution chart
- Milestone 5 — MVP polish (1 day)
  - Ensure responsive layout, accessibility, keyboard navigation
- Milestone 6 — Review & handoff (1 day)
  - Validate matches admin design, ensure no leads/contacts blocks

Component Planning
- Card component
  - Props: title, value, deltaText, deltaPositive
- BarChart component
  - Props: data (array of {label, value})
- Donut/Donut-like or Pie placeholder? If heavy, skip; keep simple bars
- Layout integration
  - Import header/navbar from admin layout where possible; otherwise mimic structure

Data Strategy
- Static placeholder data for MVP
- Prepare to fetch actual partner metrics later without disrupting layout

Risks & Mitigations
- Risk: Inconsistent admin design tokens
  - Mitigation: reuse class names consistent with admin components; keep to Tailwind utilities
- Risk: Overcomplicating with heavy charts
  - Mitigation: start simple; use div-based bars; avoid external chart libs for MVP

Acceptance Criteria
- Partner page renders with header/navbar identical in look to admin
- There are 4-6 KPI cards with correct title/value
- There is at least one chart area that renders bar-like data
- No sections related to leads/contacts exist
- Page responsive and accessible
