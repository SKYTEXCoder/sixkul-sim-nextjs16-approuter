# ADMIN Phase 2 — Mission SDD (Execution Contract)

## Document Authority & Intent

**Project**: SIXKUL — Sistem Informasi Ekstrakurikuler  
**Role**: ADMIN  
**Phase**: Phase 2 — Monitoring & Evaluation  
**Methodology**: Specification-Driven Development (SDD)

This document is the **binding execution contract** for ADMIN Phase 2.

> **NON‑NEGOTIABLE REQUIREMENT**  
> Every feature specified in Phase 2 MUST be **fully, completely, comprehensively, thoroughly, and robustly implemented end‑to‑end**, such that it is **actually usable by real, living, human ADMIN users** in a browser.  
> Partial wiring, mock data, placeholder UI, or API‑only completion **is a failure**.

Execution MUST halt and request clarification if any ambiguity or conflict arises.

---

## 0. Global Execution Rules (Absolute)

1. **End‑to‑End Only** — UI → Server → Data → UI must work for every feature.
2. **Read‑Only Guarantee** — Phase 2 introduces ZERO mutation paths.
3. **Truthful Data** — All metrics derive from hardened invariants (Phase 1.5).
4. **No Dead UX** — No visible control without function; no dead routes.
5. **Explainability** — Every metric shown must be explainable to a non‑technical admin.
6. **Fail Loudly** — If assumptions break, show blocking warnings (not silent zeros).

---

## 1. Phase 2 Deliverables (What MUST Exist)

### Pages / Routes
- `/admin/dashboard` — Phase 2 Overview & Monitoring
- `/admin/ekstrakurikuler` — Health List (read‑only)
- `/admin/ekstrakurikuler/[id]` — Health Detail (read‑only)

### Data Layers
- Server-side aggregation queries for all metrics
- Strict filters respecting soft-deletes
- Time‑windowed queries (UTC)

### UX Artifacts
- Loading states
- Empty states with explanations
- Error states with recovery guidance

---

## 2. Execution Phases (Ordered & Mandatory)

### Phase M1 — Aggregation Data Layer (FOUNDATIONAL)

**Objective**: Implement all Phase 2 metrics as explicit, testable server queries.

**Tasks**:
- Create a dedicated data module (e.g., `admin-phase2-data.ts`)
- Implement aggregations for:
  - System totals (users, pembina, students, extracurriculars)
  - ACTIVE vs archived extracurriculars
  - ACTIVE enrollments
  - Sessions per extracurricular (time‑bounded)
  - Attendance rates (locked attendance only)

**Rules**:
- Exclude `deleted_at != null` by default
- Use UTC time windows
- No caching without explicit invalidation strategy

**Verification**:
- Unit‑test aggregations with seed data
- Cross‑check counts against raw tables

---

### Phase M2 — System Overview Dashboard (END‑TO‑END)

**Objective**: Deliver a usable overview answering “Is the system healthy?”

**Tasks**:
- Render overview cards on `/admin/dashboard`
- Wire cards to M1 aggregations
- Add loading skeletons
- Implement empty states (e.g., no extracurriculars)

**Usability Acceptance**:
- Page loads without console errors
- Metrics update on refresh
- Admin understands system state in < 2 minutes

---

### Phase M3 — Extracurricular Health List (END‑TO‑END)

**Objective**: Allow admins to assess health across all extracurriculars.

**Tasks**:
- Implement list at `/admin/ekstrakurikuler`
- Show per‑row indicators:
  - Pembina assigned
  - ACTIVE members
  - Last session date
  - Derived health status
- Ensure sorting and basic filtering work

**Health Derivation Rules** (Explicit):
- **Healthy**: ACTIVE members > 0 AND recent session within N weeks
- **At Risk**: ACTIVE members > 0 BUT no recent session
- **Inactive**: ACTIVE members = 0 OR no sessions ever

**Verification**:
- Compare list with known seed data
- Validate health status classification

---

### Phase M4 — Extracurricular Health Detail (END‑TO‑END)

**Objective**: Provide drill‑down visibility without enabling control.

**Tasks**:
- Implement `/admin/ekstrakurikuler/[id]` detail page
- Render read‑only sections:
  - Session summary
  - Attendance aggregates
  - Enrollment counts
- Handle edge cases (no sessions, no attendance)

**Usability Acceptance**:
- No edit controls present
- Data matches list‑level summaries

---

### Phase M5 — Participation & Engagement Metrics (END‑TO‑END)

**Objective**: Show how students participate across the system.

**Tasks**:
- Compute attendance rates per extracurricular
- Compute average attendance per session
- Surface metrics on dashboard and detail pages

**Rules**:
- Use locked attendance only
- Do not infer missing data

**Verification**:
- Manual recomputation matches UI

---

### Phase M6 — Pembina Activity Oversight (END‑TO‑END)

**Objective**: Monitor pembina workload and activity.

**Tasks**:
- Compute per‑pembina:
  - Number of extracurriculars handled
  - Sessions conducted
  - Last activity date
- Render table on dashboard

**Flags**:
- No recent sessions → highlight
- Unusual load → informational badge

---

### Phase M7 — Inactivity & Anomaly Signals (END‑TO‑END)

**Objective**: Surface potential problems without enforcing action.

**Tasks**:
- Detect:
  - No sessions in N weeks
  - ACTIVE enrollments with zero attendance
  - Assigned pembina with no activity
- Render alerts section (read‑only)

**Rules**:
- No action buttons
- Clear explanations for each signal

---

### Phase M8 — UX Hardening & Error Handling

**Objective**: Ensure real‑world usability under imperfect conditions.

**Tasks**:
- Add skeleton loaders
- Add inline error messages
- Add explanatory empty states
- Ensure responsive layouts

---

### Phase M9 — Manual End‑to‑End Verification (MANDATORY)

**Objective**: Prove usability for real admins.

**Required Tests** (Browser‑Only):
1. Login as ADMIN
2. View dashboard metrics
3. Navigate to extracurricular list
4. Drill into an extracurricular
5. Interpret health status and alerts

All steps must work without dev tools.

---

## 3. Final Deliverable (Non‑Optional)

Produce:

**ADMIN Phase 2 — End‑to‑End Usability Verification Report**

The report MUST:
- Confirm every Phase 2 feature is usable via UI
- Confirm no mutation paths exist
- Include screenshots of each page
- State readiness for Phase 3

---

## 4. Acceptance & Sign‑Off Criteria

Phase 2 is COMPLETE only when:
- All phases M1–M9 pass
- No placeholder or mock data remains
- Real admins can use the features unaided

Anything less is a rejection.

---

## 5. SDD Halt Clause (Final)

If at any point:
- A feature cannot be implemented end‑to‑end
- Data assumptions break
- Read‑only boundaries are violated

**STOP. ASK. DO NOT ASSUME.**

This Mission SDD is binding for ADMIN Phase 2.

