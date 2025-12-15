# SIXKUL — RIWAYAT SAYA (STUDENT HISTORY)

## `/student/history`

### **Specification-Driven Development (SDD)**

### **(FOR AGENTIC AI IDE — Gemini 3 Pro (High))**

---

## 0. EXECUTION MODE — ABSOLUTE CONTRACT

You are an **Agentic AI Software Development & Engineering Agent**.

You are tasked with **fully implementing the STUDENT / SISWA “Riwayat Saya” feature**, end-to-end, in strict accordance with this specification.

### You **MUST**:

- Treat this document as a **binding contract**
- Implement **frontend + server-side data access**
- Use **Prisma ORM directly** (NO REST APIs)
- Use **React Server Components (RSC)** by default
- Use **Clerk Authentication** as the source of identity
- Respect the **Global Navigation Contract**
- Preserve all existing student features

### You **MUST NOT**:

- Implement grades, scores, or evaluations
- Add new database models
- Introduce new navigation routes
- Expose internal IDs other than `enrollment_id`
- Break or modify existing student flows

### Mandatory Consultation Rule

If **ANY ambiguity, uncertainty, or architectural doubt** arises,
you **MUST STOP and consult the project owner (user)** before proceeding.

---

## 1. FEATURE INTENT

### Feature Name

**Riwayat Saya — Riwayat Keikutsertaan Ekstrakurikuler**

### Route

```text
/student/history
```

### User Role

```text
SISWA (STUDENT)
```

### Core Question This Page Answers

> “Ekstrakurikuler apa saja yang pernah dan sedang saya ikuti?”

This feature shows a **READ-ONLY historical record** of extracurricular participation.

---

## 2. SCOPE DEFINITION (CRITICAL)

### INCLUDED

- Past extracurricular enrollments
- Current extracurricular enrollments
- Enrollment status history (ACTIVE, ALUMNI, CANCELLED, REJECTED)
- Academic year per enrollment
- Join date per enrollment

### EXPLICITLY EXCLUDED

- ❌ Grades / Nilai
- ❌ Assessments
- ❌ Certificates
- ❌ Achievements

This is a **history-only feature**.

---

## 3. DATA SOURCES

### Authoritative Sources

- **Clerk User** → authentication & identity
- **Enrollment (Prisma)** → participation history
- **Extracurricular (Prisma)** → metadata (name, category)

### Enrollment States to Display

All statuses must be included:

- `ACTIVE`
- `ALUMNI`
- `CANCELLED`
- `REJECTED`

---

## 4. ACCESS CONTROL

### Authentication

- Must use Clerk `auth()`
- Redirect unauthenticated users to `/sign-in`

### Authorization

- Student may only view **their own** enrollments
- No cross-user access allowed

---

## 5. PAGE STRUCTURE (MANDATORY)

### 5.1 Page Header

**Title**

```text
Riwayat Saya
```

**Subtitle**

```text
Riwayat keikutsertaan ekstrakurikuler yang pernah kamu ikuti
```

Sidebar item highlighted:

```text
Riwayat Saya
```

---

### 5.2 Summary Section

Display high-level stats:

- Total Ekstrakurikuler Pernah Diikuti
- Ekstrakurikuler Aktif Saat Ini
- Ekstrakurikuler Tidak Aktif (ALUMNI / CANCELLED)

Computed server-side via Prisma.

---

### 5.3 History List

Each record must display:

- Extracurricular name
- Category badge
- Academic year
- Enrollment status badge
- Joined date

### Sorting

- Default: most recent enrollment first

### Grouping (Optional, MVP-safe)

- Group by Academic Year

---

## 6. NAVIGATION CONTRACT (STRICT)

Allowed navigation:

- `/student/enrollments/[enrollment_id]`

Forbidden:

- ❌ `/student/history/[id]`
- ❌ `/student/extracurricular/[id]`
- ❌ `/student/session/[id]`

All clicks must resolve through **enrollment context only**.

---

## 7. EMPTY & ERROR STATES

### No History

If student has no enrollments:

```text
Kamu belum memiliki riwayat ekstrakurikuler.
```

CTA:

- Button → `/student/ekstrakurikuler`

### Error State

Show friendly error card without crashing page.

---

## 8. SERVER-SIDE IMPLEMENTATION

### Page Location

```text
src/app/(dashboard)/student/history/page.tsx
```

### Component Type

- React Server Component (RSC)

### Data Fetch Flow

1. Authenticate user (Clerk)
2. Resolve StudentProfile
3. Fetch ALL enrollments for student
4. Join extracurricular metadata
5. Compute summary counts
6. Render UI

No client-side data fetching.

---

## 9. DATA LAYER

### File

```text
src/lib/history-data.ts
```

### Function

```ts
getStudentHistory(): HistoryResult
```

### Returned Data

- Enrollment list
- Summary counts

---

## 10. AUTHORIZED REFACTOR SCOPE

The AI **IS AUTHORIZED** to:

- Replace placeholder UI
- Reuse enrollment card components
- Normalize naming

The AI **IS NOT AUTHORIZED** to:

- Add grades
- Modify database schema
- Introduce new routes

---

## 11. ACCEPTANCE CRITERIA

This feature is COMPLETE only if:

- `/student/history` renders without 404
- Shows real enrollment data from Prisma
- Includes past and current enrollments
- Is READ-ONLY
- Navigation contract respected
- No grades or evaluations appear

---

## END OF SPECIFICATION

Gemini 3 Pro (High) MUST implement everything above **exactly**,
and MUST consult the project owner if **any uncertainty** arises.
