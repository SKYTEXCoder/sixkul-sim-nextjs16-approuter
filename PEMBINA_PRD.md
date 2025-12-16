# PEMBINA MVP — Product Requirements Document (PRD)

## Referenced Contract — Global Navigation Contract

All routing decisions must comply with the Global Navigation Contract.

---

## 1. Purpose

This document defines the **Minimum Viable Product (MVP)** scope for the **PEMBINA (Extracurricular Advisor)** role in the SIXKUL system. It is written as an **authoritative, executable specification** for Agentic IDE execution using Specification-Driven Development (SDD).

This PRD intentionally **resets PEMBINA development** as a clean-slate MVP. Existing mock dashboards, legacy routes, and placeholder UI are **out of scope** and must not constrain implementation decisions.

---

## 2. PEMBINA Persona

**Role:** Pembina Ekstrakurikuler (Teacher / Advisor)

**Primary Responsibilities:**

- Manage extracurriculars they are assigned to
- Define recurring schedules
- Generate and manage concrete sessions (pertemuan)
- Record attendance per session
- Publish announcements to enrolled students
- Approve or reject student enrollment requests

**Non-Responsibilities (Explicit Non-Goals):**

- System-wide reporting
- Cross-extracurricular analytics
- Student-facing views
- Admin-level user management

---

## 3. Canonical Context Anchor (Non-Negotiable)

> **Extracurricular is the PEMBINA context anchor.**

All PEMBINA activities MUST occur within the context of an owned extracurricular:

```
/pembina/ekstrakurikuler/[extracurricular_id]
```

PEMBINA must never:

- Navigate through enrollment context
- Use student routes
- Access standalone session, schedule, or attendance routes

---

## 4. MVP Feature Scope

### 4.1 Extracurricular Management Hub (FOUNDATIONAL)

**Route:** `/pembina/ekstrakurikuler`

Capabilities:

- List extracurriculars owned by the authenticated PEMBINA
- Display basic metadata (name, category, status)
- Navigate into the management hub for a selected extracurricular

---

### 4.2 Extracurricular Management Hub (Per Extracurricular)

**Route:** `/pembina/ekstrakurikuler/[id]`

Acts as the **single gateway** to all PEMBINA actions for that extracurricular.

Sub-features exposed via internal navigation (tabs or sub-links):

- Schedules
- Sessions
- Attendance
- Announcements
- Enrollment Requests

---

### 4.3 Schedule Template Management

**Route:** `/pembina/ekstrakurikuler/[id]/schedules`

Capabilities:

- Create recurring schedule templates (day, time, location)
- Edit existing schedule templates
- Delete schedule templates **only if no sessions depend on them**

Constraints:

- Schedules define recurrence rules only
- Schedules do NOT represent attendance dates

---

### 4.4 Session Management

**Route:** `/pembina/ekstrakurikuler/[id]/sessions`

Capabilities:

- Generate sessions from schedule templates
- List upcoming and past sessions
- View session metadata (date, time, location)

Constraints:

- Sessions are generated records
- PEMBINA cannot edit or delete sessions once attendance exists

---

### 4.5 Attendance Input (Session-Based)

**Route:** `/pembina/ekstrakurikuler/[id]/attendance`

Capabilities:

- Select a session
- View enrolled students with ACTIVE status
- Record attendance per student
- Save attendance in batch

Constraints:

- Attendance MUST be tied to a session
- Schedule-based attendance selection is forbidden

---

### 4.6 Announcement Management

**Route:** `/pembina/ekstrakurikuler/[id]/announcements`

Capabilities:

- Create announcements scoped to the extracurricular
- Edit announcements authored by the PEMBINA
- Delete announcements authored by the PEMBINA

Constraints:

- Announcements are visible only to enrolled students
- Announcements must not leak to non-members

---

### 4.7 Enrollment Approval

**Context:** `/pembina/ekstrakurikuler/[id]`

Capabilities:

- View PENDING enrollments
- Approve enrollment (PENDING → ACTIVE)
- Reject enrollment (PENDING → REJECTED)

Constraints:

- No auto-approval
- Approval requires explicit PEMBINA action

---

## 5. Explicit Exclusions (Out of Scope for MVP)

- PEMBINA profile page
- Reports or analytics
- Cross-extracurricular dashboards
- Editing past sessions with attendance
- Bulk approval across multiple extracurriculars

---

## 6. Success Criteria (MVP Acceptance)

The PEMBINA MVP is considered complete when:

- All PEMBINA navigation complies with the Global Navigation Contract
- No PEMBINA route returns mock data
- Attendance is fully session-based
- Enrollment approval is functional end-to-end
- All actions are scoped to owned extracurriculars only

---

## 7. SDD Execution Note

This PRD MUST be used verbatim by Agentic IDE planning agents.
Any ambiguity must result in **agent halt and human consultation**.
