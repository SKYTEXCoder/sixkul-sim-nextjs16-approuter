# SIXKUL — ABSENSI SAYA (STUDENT ATTENDANCE)

## `/student/attendance`

### **SDD — SESSION-BASED, STUDENT-WIDE IMPLEMENTATION**

### (FOR AGENTIC AI IDE — CLAUDE OPUS 4.5 THINKING)

---

## 0. EXECUTION MODE (ABSOLUTE CONTRACT)

You are an **Agentic AI Software Development & Engineering Agent** tasked with **end-to-end implementation** of the **Absensi Saya** feature for the **STUDENT / SISWA** role.

You **MUST**:

- Treat this document as a **binding, authoritative specification**
- Implement **frontend, server-side data access, and integration**
- Use **Prisma ORM directly** (NO REST API routes)
- Use **React Server Components (RSC)** by default
- Use **Clerk Authentication** for auth & ownership validation
- Integrate with the existing **Session-based model**
- Preserve all existing student features and navigation contracts

You **MUST NOT**:

- Guess requirements
- Invent features not specified here
- Expose raw database internals to the UI
- Break existing `/student/enrollments` or `/student/schedule` behavior
- Introduce new routes without explicit instruction

### Mandatory Consultation Rule

If **ANY ambiguity, uncertainty, or design decision** arises during implementation,
you **MUST STOP and consult the project owner (user)** before proceeding.

Correctness > Speed. Alignment > Assumptions.

---

## 1. DOMAIN MODEL — AUTHORITATIVE RULES

### 1.1 Core Attendance Concepts (NON-NEGOTIABLE)

The **canonical unit** of attendance is:

```text
Session (Pertemuan)
```

### Attendance Definition

Attendance represents a **student’s presence for a specific Session**, not a Schedule.

```text
Student → Enrollment (ACTIVE) → Session → Attendance
```

### Attendance Status Values

Attendance.status MUST be one of:

- `HADIR`
- `IZIN`
- `SAKIT`
- `ALPHA`
- `TERLAMBAT` (optional but supported)

---

## 2. FEATURE INTENT

### Feature Name

**Absensi Saya — Riwayat Kehadiran Ekstrakurikuler**

### Route

```text
/student/attendance
```

### User Role

```text
SISWA (STUDENT)
```

### Primary Question This Page Answers

> “Bagaimana riwayat kehadiran saya di seluruh ekstrakurikuler yang saya ikuti?”

This page is a **global, read-only attendance history** across **ALL ACTIVE enrollments**, derived from **Sessions**.

---

## 3. ACCESS CONTROL & DATA SCOPE

### Authentication

- Use **Clerk Authentication**
- Resolve authenticated user → StudentProfile

### Authorization Rules

Only include Attendance records that:

- belong to the authenticated student
- belong to an Enrollment with status `ACTIVE`
- are linked to valid Sessions
- sessions are NOT cancelled (`is_cancelled = false`)

No student may ever see:

- other students’ attendance
- attendance for inactive enrollments

---

## 4. DATA OWNERSHIP & QUERY MODEL

### Canonical Data Path

```text
Student → Enrollment (ACTIVE) → Attendance → Session → Extracurricular
```

### Required Attendance View Fields

Each attendance row MUST include:

- `attendance.id`
- `attendance.status`
- `attendance.notes`
- `session.date`
- `session.start_time`
- `session.end_time`
- `extracurricular.name`
- `extracurricular.category`
- `enrollment_id`

---

## 5. GROUPING & VIEW MODES (CORE REQUIREMENT)

The Absensi Saya page MUST support **TWO PRIMARY GROUPING MODES**:

### 5.1 Group by **Tanggal (Date-first)** — DEFAULT

Structure:

```text
Tanggal
 ├─ Ekstrakurikuler
 │   ├─ Status
 │   └─ Catatan
```

### 5.2 Group by **Ekstrakurikuler (Activity-first)**

Structure:

```text
Ekstrakurikuler
 ├─ Tanggal
 │   ├─ Status
 │   └─ Catatan
```

### View Toggle Requirement

A **clear UI control** MUST exist allowing the student to switch between:

- `Kelompokkan berdasarkan Tanggal`
- `Kelompokkan berdasarkan Ekstrakurikuler`

The toggle MUST NOT cause navigation or page reload.

---

## 6. PAGE UI / UX SPECIFICATION

### 6.1 Page Header

**Title**

```text
Absensi Saya
```

**Subtitle**

```text
Riwayat kehadiran di semua ekstrakurikuler yang kamu ikuti
```

Sidebar highlight:

```text
Absensi Saya
```

---

### 6.2 Summary Cards (TOP SECTION)

The following summary cards MUST be shown:

1. **Persentase Kehadiran**
2. **Total Pertemuan**
3. **Hadir**
4. **Tidak Hadir / Terlambat**

These MUST be computed dynamically via Prisma.

---

## 7. GLOBAL NAVIGATION CONTRACT (MANDATORY COMPLIANCE)

### Absolute Rule

This feature **MUST strictly comply** with the already-established **Global Navigation Contract** for the SIXKUL system.

The Global Navigation Contract defines **which routes are allowed, forbidden, and canonical** for each user role (Student / Pembina / Admin).

You are REQUIRED to treat that contract as **authoritative and non-negotiable**.

But with all of that being said, please, do not be afraid to ask me if you have any questions or uncertainties.

---

### Student / Siswa Navigation Rules (RECAP)

For the STUDENT role:

✅ **Allowed canonical routes**:

- `/student/dashboard`
- `/student/ekstrakurikuler`
- `/student/enrollments`
- `/student/enrollments/[enrollment_id]`
- `/student/schedule`
- `/student/attendance`

❌ **Forbidden routes (MUST NEVER be introduced)**:

- `/student/schedule/[id]`
- `/student/session/[id]`
- `/student/attendance/[id]`
- Any route that bypasses enrollment context

---

### Navigation Semantics (CRITICAL)

All student-facing clicks related to **jadwal, absensi, atau aktivitas** MUST:

```text
ALWAYS route through:
/student/enrollments/[enrollment_id]
```

This ensures:

- enrollment context is preserved
- authorization is enforceable
- future Pembina/Admin extensions remain consistent

---

### Enforcement Requirements

While implementing **Absensi Saya**, you MUST:

- Audit all links, buttons, and click handlers
- Ensure no accidental deep-linking to forbidden routes
- Ensure dashboard widgets, tables, or cards reuse the SAME navigation destination

If you encounter ANY uncertainty about where a click should navigate:

🛑 **STOP immediately and consult the project owner (user).**

Do NOT guess. Do NOT improvise.

---

### Click Behavior

Attendance rows MAY be clickable (optional), but if clickable MUST route to:

```text
/student/enrollments/[enrollment_id]
```

### Click Behavior

Attendance rows MAY be clickable (optional), but if clickable MUST route to:

```text
/student/enrollments/[enrollment_id]
```

❌ No links to:

- `/student/session/[id]`
- `/student/schedule/[id]`
- `/student/attendance/[id]`

---

## 8. EMPTY & ERROR STATES

### No Attendance Records

Display:

```text
Belum ada data absensi
```

Subtext:

```text
Absensi akan muncul setelah kamu mengikuti pertemuan ekstrakurikuler
```

CTA:

```text
Lihat Jadwal Saya
```

Route:

```text
/student/schedule
```

---

## 9. SERVER-SIDE DATA FETCHING (NO API ROUTES)

### Page Location

```text
src/app/(dashboard)/student/attendance/page.tsx
```

### Component Type

- React Server Component (RSC)

### Data Fetch Flow

1. Authenticate user (Clerk)
2. Resolve StudentProfile
3. Fetch ACTIVE enrollments
4. Fetch Attendance records
5. Join with Session + Extracurricular
6. Compute summaries
7. Render grouped UI

---

## 10. CONTROLLED REFACTOR AUTHORIZATION

The AI is **AUTHORIZED** to:

- replace any mock attendance data
- refactor existing UI-only attendance code
- align dashboard attendance stats to Session-based logic

The AI is **NOT AUTHORIZED** to:

- change Attendance semantics
- change Enrollment lifecycle
- add student editing capabilities

---

## 11. TESTING & ACCEPTANCE CRITERIA (PASS / FAIL)

This feature is COMPLETE only if:

- `/student/attendance` renders without 404
- Data is fetched via Prisma (no mocks)
- Only ACTIVE enrollment attendance is shown
- Group by Date works
- Group by Extracurricular works
- Summary cards compute correctly
- Navigation respects Global Navigation Contract
- No raw Schedule templates are exposed
- Empty states render correctly

---

## END OF SPECIFICATION

Claude Opus 4.5 Thinking MUST implement everything above exactly and MUST consult the user if any uncertainty arises.
