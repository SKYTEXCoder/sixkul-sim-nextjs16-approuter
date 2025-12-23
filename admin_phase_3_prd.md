# ADMIN Phase 3 — Product Requirements Document (PRD)

## Document Metadata
- **Project**: SIXKUL — Sistem Informasi Ekstrakurikuler
- **Role**: ADMIN
- **Phase**: Phase 3 — Reporting & Decision Support
- **Methodology**: Specification-Driven Development (SDD)
- **Status**: Authoritative PRD (Binding)

---

## 1. Purpose & Strategic Positioning

### 1.1 Purpose of ADMIN Phase 3

ADMIN Phase 3 exists to provide **formal reporting, historical analysis, and decision-support artifacts** for school administrators based on **stable, truthful, and immutable data** guaranteed by Phase 1, Phase 1.5, and Phase 2.

If:
- Phase 1 = *operational control*, and
- Phase 2 = *monitoring & evaluation*,

then **Phase 3 = institutional decision support & accountability**.

Phase 3 enables ADMIN users to:
- Evaluate extracurricular performance over defined periods (semester/year)
- Produce official reports for internal or external stakeholders
- Support policy decisions (continuation, improvement, or termination of activities)
- Demonstrate accountability using evidence-backed system data

---

### 1.2 Academic Alignment (SIM Context)

In the context of **Sistem Informasi Manajemen (SIM)**, Phase 3 directly supports:
- *Pelaporan manajerial*
- *Evaluasi kinerja kegiatan ekstrakurikuler*
- *Pengambilan keputusan berbasis data*

This phase is explicitly aligned with the expectations of a final SIM project deliverable.

---

## 2. Phase Boundary & Scope Discipline (Critical)

### 2.1 What Phase 3 IS

Phase 3 introduces:
- Read-heavy reporting interfaces
- Historical summaries
- Exportable decision-support artifacts
- Comparative and trend-based analysis

Phase 3 **builds on** Phase 2 insights but transforms them into **formalized outputs**.

---

### 2.2 What Phase 3 IS NOT (Non-Negotiable)

Phase 3 MUST NOT:
- Introduce new operational controls
- Modify attendance, enrollments, sessions, or schedules
- Bypass soft-delete or immutability rules
- Perform real-time operational monitoring (belongs to Phase 2)

Phase 3 is **evaluative**, not **operational**.

---

## 3. Target User & User Intent

### 3.1 Primary User

**ADMIN (School Administrator / Management)**

### 3.2 User Intent

When entering Phase 3 features, an ADMIN intends to:
- Review historical performance
- Compare extracurricular activities
- Justify administrative decisions
- Produce formal reports
- Answer questions such as:
  - “Which extracurriculars were effective last semester?”
  - “Which pembina were consistently active?”
  - “How did student participation change over time?”

---

## 4. Core Principles (Absolute)

1. **Evidence-Based Reporting** — No subjective metrics
2. **Historical Accuracy** — Past data must never change
3. **Explainability** — Reports must be understandable by non-technical users
4. **Exportability** — Data must be usable outside the system
5. **End-to-End Usability** — Reports must be usable without developer assistance

---

## 5. Phase 3 Feature Scope Overview

ADMIN Phase 3 introduces five major feature groups:

1. Period-Based Reporting
2. Extracurricular Performance Reports
3. Pembina Performance Reports
4. Student Participation Reports
5. Export & Documentation Support

Each group is detailed below.

---

## 6. Feature Set & Requirements

### 6.1 Period-Based Reporting (Foundational)

**Purpose**: Allow ADMIN to select and lock a reporting period.

**Requirements**:
- Period selector (semester / custom date range)
- Period context applied consistently across all reports
- Clear display of active reporting period

**Rules**:
- Reporting period does NOT modify data
- All calculations scoped to the selected period

---

### 6.2 Extracurricular Performance Report

**Purpose**: Evaluate each extracurricular over a reporting period.

**Metrics**:
- Total sessions conducted
- Average attendance rate
- Number of active members
- Participation trend (start vs end of period)

**Output**:
- Ranked list of extracurriculars
- Status classification (High / Medium / Low performance)

**Rules**:
- Classification derived from explicit thresholds
- No manual overrides

---

### 6.3 Pembina Performance Report

**Purpose**: Assess pembina engagement and workload over time.

**Metrics**:
- Number of extracurriculars handled
- Sessions conducted per period
- Attendance consistency
- Inactivity periods

**Output**:
- Pembina summary table
- Highlight consistently inactive or overloaded pembina

---

### 6.4 Student Participation Report

**Purpose**: Understand student involvement trends.

**Metrics**:
- Number of students participating per period
- Average extracurriculars per student
- Students with zero attendance despite ACTIVE enrollment

**Output**:
- Aggregated tables
- Participation trend indicators

---

### 6.5 Export & Documentation Support

**Purpose**: Produce formal outputs for reporting and decision-making.

**Export Formats**:
- PDF (formal reports)
- CSV (raw data)

**Requirements**:
- Exports reflect selected reporting period
- Exports include generation timestamp
- Exports clearly label data scope and limitations

---

## 7. Data & Technical Constraints

### 7.1 Data Integrity Assumptions

Phase 3 relies on:
- Attendance immutability
- Session-based attendance
- Soft-delete preservation
- UTC-normalized timestamps

If assumptions are violated, report generation must fail loudly.

---

### 7.2 Aggregation & Computation Rules

- All reports must be generated from explicit aggregation queries
- No cached or inferred values without traceability
- Heavy computations may be pre-aggregated, but must remain reproducible

---

## 8. UX & Presentation Requirements

- Clear report titles and descriptions
- Consistent terminology with Phase 2
- Visual hierarchy prioritizing conclusions
- Printable-friendly layouts

---

## 9. Non-Goals (Explicit)

Phase 3 does NOT include:
- Real-time dashboards
- Predictive analytics
- Automated recommendations
- Role impersonation
- Policy enforcement

---

## 10. Success Criteria

ADMIN Phase 3 is successful when:
- ADMIN can produce a semester report without guidance
- Reports are understandable and defensible
- Exports are accepted as formal documentation
- No data inconsistency is observed

---

## 11. Acceptance Criteria

- All Phase 3 features usable via UI
- All reports export correctly
- Period scoping is consistent
- No mutation paths exist

---

## 12. SDD Enforcement Clause

If ambiguity arises during implementation:
1. Halt execution
2. Request clarification
3. Avoid assumption-based logic

This PRD is binding for ADMIN Phase 3.

