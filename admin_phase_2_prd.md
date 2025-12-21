# ADMIN Phase 2 — Product Requirements Document (PRD)

## Document Metadata
- **Project**: SIXKUL — Sistem Informasi Ekstrakurikuler
- **Role**: ADMIN
- **Phase**: Phase 2 — Monitoring & Evaluation
- **Methodology**: Specification-Driven Development (SDD)
- **Status**: Authoritative PRD for Phase 2 implementation

---

## 1. Purpose & Positioning

### 1.1 Purpose of ADMIN Phase 2

ADMIN Phase 2 exists to provide **system-wide visibility, monitoring, and evaluative insight** into the operation of extracurricular activities managed by the SIXKUL system.

Unlike Phase 1 (system control) and Phase 1.5 (data integrity hardening), Phase 2 introduces **NO operational control**. It is strictly concerned with **observing, measuring, and evaluating** the health and usage of the system.

In SIM (Sistem Informasi Manajemen) terms, Phase 2 corresponds to:
- *Monitoring pelaksanaan kegiatan*
- *Evaluasi aktivitas ekstrakurikuler*
- *Pengawasan sistem informasi*

---

### 1.2 Phase Boundary (Critical)

Phase 2 is explicitly **read-only by default**.

ADMIN Phase 2 MUST NOT:
- Modify attendance
- Approve or reject enrollments
- Create or edit sessions or schedules
- Perform CRUD operations already handled in Phase 1

Phase 2 MAY:
- Aggregate data
- Display indicators
- Highlight anomalies
- Surface system health signals

Any deviation constitutes **scope violation**.

---

## 2. Target User & User Intent

### 2.1 Primary User

**ADMIN (School Administrator / System Manager)**

### 2.2 User Intent

ADMIN users entering Phase 2 interfaces intend to:
- Understand whether extracurriculars are running properly
- Identify inactive or problematic activities
- Monitor participation levels
- Evaluate pembina engagement
- Gain confidence in system usage without intervening operationally

ADMIN Phase 2 is **diagnostic**, not **corrective**.

---

## 3. Core Principles (Non-Negotiable)

1. **Read-Only First** — No data mutation in Phase 2
2. **Truth Over Beauty** — Accuracy is more important than visual polish
3. **Data-Backed Indicators** — Every metric must be derived from real data
4. **Explainability** — Metrics must be interpretable by non-technical admins
5. **No Silent Assumptions** — All aggregation logic must be explicit

---

## 4. Feature Scope Overview

ADMIN Phase 2 introduces **observational features**, grouped into five categories:

1. System Overview Dashboard
2. Extracurricular Health Monitoring
3. Participation & Engagement Metrics
4. Pembina Activity Oversight
5. Inactivity & Anomaly Detection

Each category is detailed below.

---

## 5. Feature Set & Requirements

### 5.1 System Overview Dashboard

**Purpose**: Provide a high-level snapshot of system usage and health.

**Required Metrics**:
- Total number of extracurriculars
- Number of active vs archived extracurriculars
- Total number of pembina
- Total number of students
- Total number of ACTIVE enrollments

**Constraints**:
- Metrics must reflect soft-delete rules
- Counts must exclude archived/inactive entities by default

---

### 5.2 Extracurricular Health Monitoring

**Purpose**: Allow ADMIN to assess whether each extracurricular is operational.

**Per-Extracurricular Indicators**:
- Assigned pembina (yes/no)
- Number of ACTIVE members
- Number of sessions conducted (within a defined period)
- Last session date

**Health Classification (Derived)**:
- Healthy: Active members + recent sessions
- At Risk: No recent sessions OR low participation
- Inactive: No sessions and/or no active members

**Note**: Health status is derived, not manually set.

---

### 5.3 Participation & Engagement Metrics

**Purpose**: Measure student participation levels system-wide.

**Metrics**:
- Total enrollments per extracurricular
- Attendance rate per extracurricular (aggregated)
- Average attendance per session

**Rules**:
- Attendance calculations must use locked attendance only
- Historical data must not be retroactively altered

---

### 5.4 Pembina Activity Oversight

**Purpose**: Ensure pembina involvement and workload balance.

**Metrics**:
- Number of extracurriculars per pembina
- Number of sessions conducted by pembina
- Time since last session per pembina

**Flags**:
- Pembina with no recent sessions
- Pembina with unusually high load

---

### 5.5 Inactivity & Anomaly Detection

**Purpose**: Surface potential issues requiring administrative attention.

**Examples**:
- Extracurriculars with no sessions in N weeks
- Extracurriculars with active members but zero attendance
- Pembina assigned but no activity recorded
- Students with ACTIVE enrollments but zero attendance

**Important**:
- Phase 2 only surfaces signals
- Resolution is handled outside Phase 2

---

## 6. Data & Technical Constraints

### 6.1 Data Integrity Assumptions

Phase 2 relies on guarantees established in Phase 1.5:
- Attendance is session-bound
- Attendance is immutable
- Soft deletes preserve history

If any assumption is violated, Phase 2 metrics must fail loudly.

---

### 6.2 Aggregation Logic

All metrics must be computed via:
- Explicit aggregation queries
- Documented grouping logic
- No inferred or cached values without traceability

---

## 7. UX & Presentation Guidelines

- Dashboards must be readable without training
- Terminology must match school context
- Visual emphasis on trends and flags
- Avoid overwhelming ADMIN with raw tables

---

## 8. Non-Goals (Explicit)

ADMIN Phase 2 does NOT include:
- Data exports
- Printable reports
- Role impersonation
- Notification dispatch
- Automated corrective actions

These belong to Phase 3 or later.

---

## 9. Success Criteria

ADMIN Phase 2 is considered successful when:
- ADMIN can assess system health in under 2 minutes
- No operational controls are exposed
- All metrics are accurate and reproducible
- Phase 2 introduces zero data mutation paths

---

## 10. Acceptance Criteria

- All Phase 2 features are read-only
- All metrics derive from real data
- No Phase 1 or Phase 3 features are implemented
- Manual verification confirms metric correctness

---

## 11. SDD Enforcement Clause

Any ambiguity during Phase 2 implementation MUST:
1. Halt execution
2. Request clarification
3. Avoid assumption-based logic

This PRD is binding for ADMIN Phase 2.

