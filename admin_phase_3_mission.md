# ADMIN Phase 3 — Mission SDD (Execution Contract)

## Document Authority & Intent

**Project**: SIXKUL — Sistem Informasi Ekstrakurikuler  
**Role**: ADMIN  
**Phase**: Phase 3 — Reporting & Decision Support  
**Methodology**: Specification-Driven Development (SDD)

This document is the **final, binding execution contract** for ADMIN Phase 3.

> 🔴 **ABSOLUTE, NON-NEGOTIABLE REQUIREMENT**  
> Every Phase 3 feature MUST be **fully, completely, comprehensively, thoroughly, and robustly implemented end-to-end**, such that it is **actually usable by real, living, human ADMIN users** without developer assistance.
>
> Partial implementations, API-only work, mock data, placeholder UI, or “future work” markers are considered **FAILURE**.

This Mission SDD defines **how the system MUST be built, verified, and accepted**.

---

## 0. Global Execution Laws (Unbreakable)

1. **End-to-End Only** — UI → Server → Database → UI must function for every feature.
2. **Read-Only Guarantee** — Phase 3 introduces ZERO data mutation paths.
3. **Historical Truth** — Reports must be based on immutable historical data.
4. **Explainability** — Every metric must be understandable to non-technical admins.
5. **Export-Grade Quality** — Outputs must be acceptable as formal documentation.
6. **Fail Loudly** — If assumptions break, block report generation with explanation.

---

## 1. Mandatory Phase 3 Deliverables

### User-Facing Pages
- `/admin/reports` — Reporting Hub & Period Selector
- `/admin/reports/extracurriculars`
- `/admin/reports/extracurriculars/[id]`
- `/admin/reports/pembina`
- `/admin/reports/students`
- `/admin/reports/export`

### System Components
- Phase 3 aggregation data layer
- Report classification logic
- Export generation pipeline (PDF & CSV)
- UX hardening (loading, empty, error states)

---

## 2. Execution Phases (STRICT ORDER)

### Phase P1 — Reporting Aggregation Data Layer (FOUNDATIONAL)

**Objective**: Implement ALL Phase 3 metrics as explicit, reproducible queries.

**Tasks**:
- Create `admin-phase3-data.ts`
- Implement period-scoped aggregations:
  - Sessions per extracurricular
  - Attendance rates per period
  - Enrollment deltas (start vs end)
  - Pembina activity metrics
  - Student participation metrics

**Rules**:
- Respect soft deletes
- Use UTC timestamps
- Never infer missing data

**Verification**:
- Compare aggregates with raw table counts
- Document query logic

---

### Phase P2 — Reporting Hub & Period Context (END-TO-END)

**Objective**: Allow admins to select and lock a reporting period.

**Tasks**:
- Build `/admin/reports` hub
- Implement semester + custom range selector
- Lock period context globally
- Display active period persistently

**Usability Acceptance**:
- Admin understands which period is active at all times
- Changing period requires confirmation

---

### Phase P3 — Extracurricular Performance Reports (END-TO-END)

**Objective**: Deliver evaluative reports for extracurriculars.

**Tasks**:
- Implement `/admin/reports/extracurriculars`
- Rank extracurriculars by performance
- Classify performance (High / Medium / Low)
- Implement `/admin/reports/extracurriculars/[id]` detail

**Rules**:
- Classification logic must be explicit and documented
- Provide narrative explanations

---

### Phase P4 — Pembina Performance Reports (END-TO-END)

**Objective**: Evaluate pembina engagement over time.

**Tasks**:
- Implement `/admin/reports/pembina`
- Aggregate:
  - Sessions conducted
  - Activity consistency
  - Workload

**Usability Acceptance**:
- Admin can identify inactive or overloaded pembina

---

### Phase P5 — Student Participation Reports (END-TO-END)

**Objective**: Evaluate student involvement trends.

**Tasks**:
- Implement `/admin/reports/students`
- Aggregate:
  - Participation rates
  - Multi-ekskul involvement
  - Zero-attendance cases

**Rules**:
- Avoid exposing sensitive personal data unnecessarily

---

### Phase P6 — Export & Documentation Pipeline (CRITICAL)

**Objective**: Produce formal, shareable reports.

**Tasks**:
- Implement PDF export:
  - Structured layout
  - Titles, tables, summaries
- Implement CSV export:
  - Raw, period-scoped data
- Include metadata:
  - Period
  - Generation timestamp
  - Scope disclaimer

**Usability & Quality Acceptance**:
- Files open correctly
- Layout is readable
- Data matches on-screen reports

---

### Phase P7 — UX Hardening & Accessibility

**Objective**: Ensure real-world usability.

**Tasks**:
- Loading skeletons
- Explanatory empty states
- Inline error messages
- Print-friendly styling

---

### Phase P8 — Manual End-to-End Verification (MANDATORY)

**Objective**: Prove usability for real admins.

**Required Browser Tests**:
1. Login as ADMIN
2. Select reporting period
3. View extracurricular report
4. Drill into detail
5. View pembina report
6. View student report
7. Export PDF & CSV

All steps must work without dev tools.

---

## 3. Final Mandatory Deliverable

Produce:

📄 **ADMIN Phase 3 — End-to-End Usability Verification Report**

The report MUST include:
- Screenshots of all report pages
- Evidence of successful exports
- Confirmation of read-only boundaries
- Explicit sign-off that Phase 3 is production-usable

---

## 4. Acceptance & Completion Criteria

ADMIN Phase 3 is COMPLETE only when:
- All phases P1–P8 pass
- Reports are accurate and explainable
- Exports are formally usable
- No mutation paths exist

Anything less is a rejection.

---

## 5. SDD Halt Clause (Final)

If at any point:
- Aggregation logic is ambiguous
- Export cannot be implemented cleanly
- Data assumptions break

**STOP. ASK. DO NOT ASSUME.**

This Mission SDD is binding for ADMIN Phase 3.

