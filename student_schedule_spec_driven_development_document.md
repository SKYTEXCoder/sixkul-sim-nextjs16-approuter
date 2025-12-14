# SIXKUL — JADWAL SAYA (STUDENT SCHEDULE)

## `/student/schedule`

### **Specification-Driven Development (SDD) v2 — SESSION / PERTEMUAN–BASED IMPLEMENTATION**

### (SPECIFICALLY INTENDED FOR AGENTIC AI LLM IDEs — CLAUDE OPUS 4.5 THINKING)

---

## 0. EXECUTION MODE (READ FIRST — ABSOLUTE CONTRACT)

You are an **Agentic AI IDE** responsible for **end-to-end delivery and controlled refactoring** of the **Jadwal Saya** feature for the **STUDENT / SISWA** role.

You **MUST**:

* treat this document as a **binding specification**
* implement frontend, backend, and data access logic
* use **Prisma ORM directly** (NO REST APIs)
* use **React Server Components** by default
* integrate **Clerk Authentication** and enforce strict ownership
* refactor existing student-facing schedule logic **safely and intentionally**
* keep all existing student features **functionally correct**

You **MUST NOT**:

* guess requirements
* invent new features
* silently change feature meaning
* break existing enrollment or attendance semantics

### Mandatory Clarification Rule (NON-NEGOTIABLE)

If at **ANY point in time** you encounter uncertainty, ambiguity, missing information, or a situation where you think *"I am not sure what the correct behavior should be"*, you **MUST STOP** and **consult the project owner (user)** before proceeding.

Correctness, intent alignment, and specification fidelity **ALWAYS outweigh speed, autonomy, or creativity**.

---

## 1. DOMAIN MODEL — AUTHORITATIVE RULES

### 1.1 Core Concepts (NON-NEGOTIABLE)

The system MUST distinguish between the following entities:

### **Schedule (Jadwal)**

* A **recurring template** managed by **PEMBINA**
* Defines:

  * `day_of_week`
  * `default start_time`
  * `default end_time`
  * `default location`
* Represents a **rule**, NOT an event

### **Session (Pertemuan)**

* A **concrete, absolute, calendar-dated event**
* Generated from a Schedule
* Represents **what students actually attend**
* Defines:

  * `date`
  * `start_time`
  * `end_time`
  * `location`
* MAY override Schedule defaults (future PEMBINA feature)

### **Attendance**

* Represents student presence **for a specific Session**
* Session is the canonical unit of attendance

> ⚠️ **Students NEVER see raw Schedules. ALL student-facing “jadwal” features operate exclusively on Sessions.**

---

## 2. SESSION LIFECYCLE & SCOPE (CRITICAL CLARIFICATION)

### Session Creation Responsibility

* Sessions are assumed to **already exist** in the database at runtime
* Session creation, generation, cancellation, or rescheduling is **OUT OF SCOPE** for this feature
* Sessions are expected to be created by **PEMBINA-side logic** (current or future)

### AI IMPLEMENTATION CONSTRAINT

* The Agentic AI **MUST NOT** automatically generate Sessions
* The Agentic AI **MUST NOT** infer or invent Session creation rules
* If Sessions are missing in the database, the AI **MUST ASK THE USER** how to proceed

---

## 3. FEATURE INTENT

### Feature Name

**Jadwal Saya — Kalender Pertemuan Ekstrakurikuler**

### Route

```text
/student/schedule
```

### User Role

```text
SISWA (STUDENT)
```

### Primary Question This Page Answers

> “Kapan **pertemuan (session)** ekstrakurikuler yang saya ikuti akan berlangsung?”

This page is a **global session calendar** aggregating **ALL FUTURE SESSIONS** from **ACTIVE enrollments only**.

---

## 4. ACCESS CONTROL & DATA SCOPE

### Authentication

* Use **Clerk Authentication** exclusively
* Resolve authenticated user → `StudentProfile`

### Authorization Rules

Only include Sessions that:

* belong to enrollments with status `ACTIVE`
* belong to the authenticated student
* have `session.date >= today`

Sessions from `PENDING`, `REJECTED`, or `ALUMNI` enrollments **MUST NOT** appear.

---

## 5. DATE & TIME INTERPRETATION RULES (MANDATORY)

To avoid ambiguity, the following rules apply:

* `session.date` is stored in the database as a **calendar date in UTC**
* A Session is considered **future** if:

```text
session.date >= startOfToday() (server timezone)
```

* Sessions earlier on the same calendar day are considered **past** and MUST NOT be shown

If timezone handling becomes ambiguous during implementation, the AI **MUST CONSULT THE USER**.

---

## 6. DATA OWNERSHIP & QUERY MODEL

### Canonical Entry Point

```text
Student → Enrollment (ACTIVE) → Session
```

### Required Session Fields

Each session item MUST include:

* `session.id`
* `date`
* `start_time`
* `end_time`
* `location`
* `enrollment_id`
* `extracurricular.name`
* `extracurricular.category`

---

## 7. SERVER-SIDE DATA FETCHING (NO API ROUTES)

### File Location

```text
src/app/(dashboard)/student/schedule/page.tsx
```

### Component Type

* React Server Component (RSC)

### Data Fetching Flow

1. Authenticate user via Clerk
2. Resolve StudentProfile
3. Fetch ACTIVE enrollments
4. Fetch ALL future Sessions related to those enrollments
5. Apply optional filters (extracurricular, date range)
6. Render UI

### Prisma Query (ILLUSTRATIVE)

```ts
prisma.session.findMany({
  where: {
    date: { gte: startOfToday() },
    enrollment: {
      student_id: studentId,
      status: 'ACTIVE',
    },
  },
  include: {
    enrollment: {
      include: {
        extracurricular: true,
      },
    },
  },
  orderBy: { date: 'asc' },
});
```

---

## 8. UI / UX SPECIFICATION

### 8.1 Page Header

**Title**

```text
Jadwal Saya
```

**Subtitle**

```text
Semua pertemuan ekstrakurikuler yang akan kamu hadiri
```

Sidebar highlight:

```text
Jadwal Saya
```

---

### 8.2 Filters (OPTIONAL BUT REQUIRED)

Available filters:

* Dropdown: Ekstrakurikuler (ALL)
* Date range: Dari tanggal – Sampai tanggal

### Filter Behavior Rules

* If no filters are applied → show all future Sessions
* If only start date is provided → show Sessions from that date onward
* If only end date is provided → show Sessions up to that date
* If both dates are provided → show Sessions within the range
* If no Sessions match filters → show empty state

Filters MUST operate on **Session.date**.

---

### 8.3 Session List (PRIMARY CONTENT)

* List view grouped by **date**
* Each date group shows:

  * Date header (e.g., “Senin, 8 Desember 2025”)
  * One or more Session cards

### Session Card MUST show:

* Nama ekstrakurikuler
* Kategori badge
* Waktu (start – end)
* Lokasi

Each card MUST be clickable.

---

### 8.4 Navigation Contract

Clicking a Session card MUST navigate to:

```text
/student/enrollments/[enrollment_id]
```

---

## 9. EMPTY & ERROR STATES

### No Active Enrollments OR No Future Sessions

Display:

```text
Kamu belum memiliki jadwal kegiatan
```

CTA:

```text
Jelajahi Ekstrakurikuler
```

Routes to:

```text
/student/ekstrakurikuler
```

---

## 10. CONTROLLED REFACTOR AUTHORIZATION (CRITICAL)

The Agentic AI LLM IDE is **COMPLETELY AND FULLY AUTHORIZED as well as REQUIRED** to refactor existing student-facing features to align with the Session-based model.

### The Agentic AI LLM IDE MAY refactor:

* student dashboard “upcoming schedule” widgets
* helper functions that compute virtual schedule occurrences
* student schedule-related queries

### The Agentic AI LLM IDE MUST NOT:

* change enrollment meaning or lifecycle
* change attendance semantics (presence/absence)
* break existing routes or navigation contracts
* refactor PEMBINA or ADMIN features beyond data compatibility

All refactors MUST preserve **user-visible behavior**, while changing only the **internal data source** from Schedule → Session.

---

## 11. TESTING & ACCEPTANCE CRITERIA (PASS / FAIL)

This feature is COMPLETE only if:

* `/student/schedule` renders without 404
* only ACTIVE enrollment sessions appear
* only future sessions are shown
* sessions are grouped by date
* filters work according to defined rules
* clicking a session navigates to enrollment detail
* empty states render correctly
* Prisma ORM is used directly
* NO student-facing feature displays raw Schedule templates

---

## END OF SPECIFICATION

Claude Opus 4.5 Thinking MUST implement everything above exactly, and MUST consult the user if any uncertainty arises.
