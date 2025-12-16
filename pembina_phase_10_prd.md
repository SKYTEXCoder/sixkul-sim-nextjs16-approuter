# PEMBINA Phase 10 — Dashboard Finalization PRD (Product Requirements Document)

## Referenced Contract

- Global Navigation Contract
- PEMBINA Phase 1–9 Specifications

---

## 1. Purpose

Phase 10 finalizes the **PEMBINA Dashboard** as a **fully real, non-authoritative administrative launchpad**.

This phase **does not introduce new PEMBINA capabilities**. It replaces mock data with real aggregates and wires dashboard CTAs to **existing, context-safe management routes**.

---

## 2. Scope Definition

### IN SCOPE

- Replace all mock / hardcoded dashboard data with real queries
- Display real PEMBINA-centric summaries
- Wire dashboard CTAs to existing pages
- Maintain read-only dashboard behavior

### OUT OF SCOPE (Explicit)

- Creating, editing, or deleting domain data from the dashboard
- Approval actions (enrollment, attendance, schedules)
- New routes or ownership contexts
- ADMIN functionality

---

## 3. Dashboard Role & Constraints

### 3.1 Dashboard Definition

The PEMBINA dashboard is:

- A **summary view** of PEMBINA responsibilities
- A **navigation launchpad** to existing management pages

The dashboard is NOT:

- A management surface
- A shortcut to bypass extracurricular context

---

### 3.2 Ownership Rule

All dashboard data must be derived from:

```
PEMBINA → owned Extracurriculars → existing domain entities
```

The dashboard itself introduces **no new ownership context**.

---

## 4. Required Dashboard Sections

### 4.1 Summary Cards (Aggregated)

Display:

- Total extracurriculars owned
- Total active members (across all owned extracurriculars)
- Total pending enrollment requests
- Total upcoming sessions (next 7 days)

Constraints:

- Read-only
- Clicking a card redirects to a relevant existing route

---

### 4.2 Ekstrakurikuler Overview List

Display:

- List of owned extracurriculars
- Metadata: name, category, active member count

CTA:

- Click → `/pembina/ekstrakurikuler/[id]`

---

### 4.3 Action Shortcuts (CTAs)

Allowed CTAs:

- "Kelola Ekstrakurikuler"
- "Lihat Permintaan Bergabung"
- "Kelola Jadwal & Pertemuan"

All CTAs MUST redirect to:

```
/pembina/ekstrakurikuler/[id]
```

or one of its sub-pages.

---

## 5. Data Sources (No Schema Changes)

All data must be derived from existing models:

- Extracurricular
- Enrollment
- Session
- Attendance

No Prisma schema changes are allowed.

---

## 6. Success Criteria

Phase 10 is complete when:

- No mock data exists on the PEMBINA dashboard
- All displayed data reflects real database state
- All CTAs navigate to existing pages
- No dashboard interaction mutates data
- Global Navigation Contract is preserved

---

## 7. Specification-Driven Development (SDD) Enforcement

Any attempt to add CRUD actions or new routes must cause execution to halt and request human clarification.
