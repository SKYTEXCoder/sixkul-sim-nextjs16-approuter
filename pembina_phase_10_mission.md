# PEMBINA Phase 10 — Mission Plan (Execution Contract)

## Referenced Contract

- Global Navigation Contract
- PEMBINA Phase 10 PRD & Flow

---

## 0. Mission Objective

Replace all mock data on the PEMBINA dashboard with real, derived data and wire all CTAs to existing management routes without adding new functionality.

---

## 1. Phase 10.1 — Data Layer (Read-Only Aggregates)

### Tasks

- Create `src/lib/pembina-dashboard-data.ts`
- Implement read-only aggregation functions:
  - `getPembinaDashboardSummary(userId)`
  - `getPembinaExtracurricularOverview(userId)`
  - `getUpcomingSessions(userId, dateRange)`

### Acceptance Criteria

- Uses existing Prisma models only
- No writes
- No schema changes

---

## 2. Phase 10.2 — Dashboard Page Refactor

### Tasks

- Refactor `/pembina/dashboard/page.tsx`
- Remove all hardcoded data
- Replace with server-side data fetching
- Render real summary cards and lists

### Acceptance Criteria

- Page renders correctly with real data
- Handles empty states

---

## 3. Phase 10.3 — CTA (Call-To-Action) Wiring

### Tasks

- Replace placeholder buttons with real links
- Ensure all links point to:
  - `/pembina/ekstrakurikuler`
  - `/pembina/ekstrakurikuler/[id]`
  - Sub-pages under `[id]`

### Acceptance Criteria

- No new routes
- No inline actions

---

## 4. Phase 10.4 — Navigation & Contract Audit

### Tasks

- Verify dashboard does not introduce forbidden actions
- Confirm Global Navigation Contract compliance

---

## 5. Phase 10.5 — Verification

### Manual Tests

- Dashboard loads real data
- Counts match database state
- All CTAs redirect correctly
- No mutations triggered from dashboard

---

## 6. Execution Rules

- Dashboard is strictly read-only
- No new PEMBINA capabilities added
- Halt execution on ambiguity
