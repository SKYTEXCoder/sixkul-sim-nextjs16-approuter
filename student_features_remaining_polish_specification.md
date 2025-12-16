# 🔧 SIXKUL — STUDENT FEATURES REMAINING POLISH & CORRECTNESS SWEEP

## Specification-Driven Polishing Task (SDD)

**Target Agent:** Claude Opus 4.5 (Agentic AI LLM SDE)

---

## 0. EXECUTION MODE — READ FIRST (ABSOLUTE CONTRACT)

You are an **Agentic AI Software Development & Engineering Agent** operating under **Specification-Driven Development (SDD)**.

This task is **NOT** about adding new features or redesigning UI.
This task is about **verifying correctness, enforcing navigation contracts, fixing broken links, and preventing regressions** across all **STUDENT / SISWA** features.

### You MUST:

- Verify existing behavior against specifications
- Enforce the Global Navigation Contract
- Fix broken, undefined, or inconsistent routes
- Perform **minimal, surgical changes only**
- Keep all existing student features **functionally correct**

### You MUST NOT:

- Invent new features or routes
- Redesign layouts or UI systems
- Change domain semantics (Enrollment, Session, Attendance)
- Refactor unrelated modules
- Introduce breaking changes

### Mandatory Consultation Rule

If **any uncertainty or ambiguity** arises during implementation:

> **STOP and CONSULT THE PROJECT OWNER IMMEDIATELY!!**

Correctness and alignment **always outweigh speed and efficiency**.

---

## 1. CONTEXT — CURRENT STUDENT FEATURES STATE

### Fully Implemented Features (Reference Only)

- `/student/dashboard`
- `/student/ekstrakurikuler` (Browse & Enroll)
- `/student/ekstrakurikuler/[extracurricular_id]`
- `/student/enrollments`
- `/student/enrollments/[enrollment_id]`
- `/student/schedule` (Session-based)
- Session model (absolute pertemuan)
- Attendance linked to Session
- Announcements linked to Extracurricular

### Authoritative Constraint

The **Global Navigation Contract** is authoritative and must be followed strictly.

---

## 2. KNOWN ISSUE — DASHBOARD NAVIGATION BUG (CRITICAL)

### Problem Description

On the **Student Dashboard**, the widget **"Jadwal Mendatang"** contains cards that may still link to:

```text
/student/schedule/undefined
```

This route is invalid and results in a 404 error.

### Correct Behavior (Already Established Elsewhere)

- Cards in **Jadwal Saya (/student/schedule)** correctly navigate to:

```text
/student/enrollments/[enrollment_id]
```

This behavior is correct and must be mirrored everywhere.

---

## 3. TASK 1 — DASHBOARD NAVIGATION FIX

### Required Actions

You MUST:

1. Identify the dashboard component rendering upcoming schedule/session cards
2. Trace the data source feeding those cards
3. Ensure each card receives a valid `enrollment_id`
4. Update navigation so **every card links to**:

```text
/student/enrollments/[enrollment_id]
```

### Absolute Rules

- 🚫 No student-facing route may point to `/student/schedule/[id]`
- 🚫 No `undefined` or placeholder IDs are allowed
- 🚫 Do not hardcode IDs

If the enrollment ID is missing:

- Fix the query mapping
- Correct the data model usage
- Do NOT fabricate data

---

## 4. TASK 2 — STUDENT FEATURE COMPLETENESS AUDIT

You MUST produce a **clear audit** of all STUDENT / SISWA features.

### 4.1 Fully Implemented & Correct

List features that:

- Have routes
- Have data
- Behave correctly

Example:

- Student Dashboard
- Jadwal Saya (Session-based)
- Enrollment Detail Page
- Browse & Join Extracurriculars

### 4.2 Partially Implemented (Needs Follow-Up)

Explicitly verify and report status for:

- `/student/attendance` (global attendance view)
- `/student/announcements` (global announcements view)
- Notifications system (bell icon behavior)
- `/student/profile`
- `/student/settings`

For each item, specify:

- Route existence (yes/no)
- UI-only or functional
- Data integration status

### 4.3 Not Implemented

List any:

- Sidebar or menu items
- Routes referenced in UI

that **do not yet exist or 404**.

---

## 5. TASK 3 — GLOBAL NAVIGATION GUARD

You MUST verify that:

- All student-facing links comply with the Global Navigation Contract
- No student route exposes:
  - Session IDs
  - Schedule IDs
  - Pembina/Admin-only paths

### Required Outcome

All student interactions involving schedules or sessions must be mediated through:

```text
Enrollment → /student/enrollments/[enrollment_id]
```

If violations are found:

- Fix them
- Document them
- Ensure consistency across:
  - Dashboard widgets
  - List views
  - Detail pages

---

## 6. REQUIRED OUTPUTS

You MUST produce the following:

### 6.1 Implementation Summary

- What was fixed
- What was verified
- What remains intentionally unimplemented

### 6.2 Navigation Verification Table

Example:

| Component                  | Old Route                     | New Route                   | Status   |
| -------------------------- | ----------------------------- | --------------------------- | -------- |
| Dashboard Jadwal Mendatang | `/student/schedule/undefined` | `/student/enrollments/[id]` | ✅ Fixed |

### 6.3 Student Feature Status Ledger

A definitive list of:

- Completed features
- Partial features
- Missing features

This ledger will be used as the **gate** before implementing PEMBINA features.

---

## 7. SUCCESS CRITERIA (PASS / FAIL)

This task is **PASS** only if:

- No student click produces a 404
- Dashboard navigation matches Jadwal Saya behavior
- All student routes obey the Global Navigation Contract
- Remaining student features are clearly enumerated
- No unnecessary refactors were introduced

---

## FINAL NOTE

This task is about **stability, correctness, and trust**.

Do not optimize.
Do not redesign.
Do not expand scope.

**Make the student experience predictable, safe, and future-proof.**
