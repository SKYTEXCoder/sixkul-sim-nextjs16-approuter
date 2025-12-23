# ADMIN Phase 3 — Application User Flow (SDD)

## Document Metadata
- **Project**: SIXKUL — Sistem Informasi Ekstrakurikuler
- **Role**: ADMIN
- **Phase**: Phase 3 — Reporting & Decision Support
- **Methodology**: Specification-Driven Development (SDD)
- **Status**: Authoritative Flow Document (Binding)

---

## 1. Flow Design Philosophy (Absolute)

ADMIN Phase 3 flows are designed to support **real, formal, decision-making workflows** performed by school administrators.

**Non‑negotiable principles:**
- End‑to‑end usability for real ADMIN users
- Zero dead clicks or placeholder screens
- Reports must be understandable without technical assistance
- Every flow must result in a usable **decision artifact** (on‑screen or exported)

Phase 3 flows are **evaluative and documentary**, not operational.

---

## 2. Entry Flow — Accessing Phase 3

### Flow: ADMIN Login → Reporting Hub

```mermaid
flowchart TD
  A[ADMIN Login] --> B[/admin/dashboard]
  B --> C[Reports & Decision Support Entry]
  C --> D[/admin/reports]
```

**Entry Conditions**:
- Authenticated ADMIN role
- Phase 3 feature flag enabled

**Failure States**:
- Unauthorized → `/unauthorized`
- Session expired → `/sign-in`

---

## 3. Flow 1 — Reporting Period Selection (Foundational)

### User Intent
> “Saya ingin melihat laporan untuk periode tertentu.”

### Route
```
/admin/reports
```

### Flow Steps
1. ADMIN opens Reporting Hub
2. System displays:
   - Predefined periods (Semester Ganjil / Genap)
   - Custom date range selector
3. ADMIN selects reporting period
4. System locks period context for all subsequent views

### UX Rules
- Selected period is always visible
- Changing period requires explicit confirmation

### Failure Handling
- Invalid range → inline validation

---

## 4. Flow 2 — Extracurricular Performance Report

### User Intent
> “Ekstrakurikuler mana yang paling dan paling kurang efektif pada periode ini?”

### Route
```
/admin/reports/extracurriculars
```

### Flow Diagram
```mermaid
flowchart TD
  A[/admin/reports] --> B[Extracurricular Report List]
  B --> C[Extracurricular Performance Table]
```

### Flow Steps
1. System computes metrics scoped to selected period
2. Table renders with:
   - Total sessions
   - Average attendance
   - Active members
   - Performance classification
3. ADMIN may sort and filter

### Edge Cases
- No data in period → explanatory empty state

---

## 5. Flow 3 — Extracurricular Performance Detail

### User Intent
> “Mengapa ekstrakurikuler ini dikategorikan seperti ini?”

### Route
```
/admin/reports/extracurriculars/[id]
```

### Flow Steps
1. ADMIN selects an extracurricular
2. Detail report renders:
   - Session count timeline
   - Attendance trend
   - Enrollment context
3. Contextual explanation of performance status

### UX Rules
- Read‑only
- Narrative explanation accompanies numbers

---

## 6. Flow 4 — Pembina Performance Report

### User Intent
> “Bagaimana kinerja pembina selama periode ini?”

### Route
```
/admin/reports/pembina
```

### Flow Steps
1. System aggregates pembina metrics for the period
2. Table renders with:
   - Extracurriculars handled
   - Sessions conducted
   - Attendance consistency
3. Highlights:
   - Inactive pembina
   - Overloaded pembina

---

## 7. Flow 5 — Student Participation Report

### User Intent
> “Bagaimana tingkat partisipasi siswa secara keseluruhan?”

### Route
```
/admin/reports/students
```

### Flow Steps
1. System aggregates student participation
2. Displays:
   - Participation rate
   - Multi‑ekskul involvement
   - Zero‑attendance cases

### Notes
- Student identities may be anonymized or summarized

---

## 8. Flow 6 — Report Export & Documentation

### User Intent
> “Saya perlu laporan resmi untuk dokumentasi atau rapat.”

### Routes
```
/admin/reports/export
```

### Flow Steps
1. ADMIN selects report type
2. ADMIN selects export format (PDF / CSV)
3. System generates report with:
   - Period metadata
   - Generation timestamp
   - Data scope explanation
4. File downloads automatically

### Failure Handling
- Export failure → retry with error message

---

## 9. Global UX, Error & Empty State Rules

- Empty report → explain *why* data is missing
- Partial data → visible disclaimer
- Computation failure → block report generation with explanation

---

## 10. Navigation Contract Enforcement

Phase 3 routes MUST:
- Remain under `/admin/*`
- Not link to operational pages
- Not expose mutation routes

---

## 11. Completion Criteria (Flow)

Phase 3 flows are complete when:
- ADMIN can produce reports unaided
- Reports are interpretable and exportable
- No dead routes or clicks exist
- All flows respect read‑only boundaries

---

## 12. SDD Halt Clause

If implementation requires:
- Data mutation
- Operational overrides
- Ambiguous aggregation logic

STOP execution and request clarification.

This flow document is binding for ADMIN Phase 3.

