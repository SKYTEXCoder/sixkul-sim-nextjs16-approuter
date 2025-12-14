# SIXKUL — STUDENT ENROLLMENT DETAIL

## `/student/enrollments/[enrollment_id]`

### ABSOLUTE END-TO-END IMPLEMENTATION SPECIFICATION

### (FOR AGENTIC AI IDE — CLAUDE OPUS 4.5 THINKING)

---

## 0. EXECUTION MODE (READ FIRST — NON-NEGOTIABLE)

You are an **Agentic AI IDE** tasked with **end-to-end delivery** of this feature.

You **MUST**:

* plan the full application flow
* design the complete UI/UX
* implement all frontend pages
* implement all backend logic **using Prisma ORM directly**
* integrate Clerk authentication
* enforce role-based access control (RBAC)
* handle all error and empty states
* deliver a **fully usable, testable, production-ready feature**

You **MUST NOT**:

* create REST API routes
* expose database logic to the client
* duplicate browse or discovery pages

### Mandatory Clarification & Consultation Rule

If **ANY ambiguity, uncertainty, conflict, or missing information** is encountered during implementation (including but not limited to UI behavior, data modeling assumptions, navigation flow, or business logic), the Agentic AI **MUST STOP implementation** and **explicitly ask the project owner (user) for clarification** before proceeding.

The AI **MUST NOT**:

* silently guess
* invent requirements
* assume behavior not stated in this specification

Correctness and alignment with the user's intent take priority over speed or completion.

---

## 1. FEATURE INTENT (CORE CONCEPT)

### Feature Name

**Detail Keikutsertaan Ekstrakurikuler**

### Route

```text
/student/enrollments/[enrollment_id]
```

### User Role

```text
SISWA (STUDENT)
```

### Primary Question This Page Answers

> “Apa status, aktivitas, dan keterlibatan **saya** di ekstrakurikuler ini?”

This page is **about the ENROLLMENT (relationship)** — **NOT** about discovering or browsing extracurriculars.

---

## 2. ACCESS CONTROL & SECURITY (MANDATORY)

### Authentication

* Use **Clerk Authentication** exclusively
* Identify the user via `auth()` / `sessionClaims`
* Perform **Just-In-Time user sync** via the existing student profile logic

### Authorization Rules

Access is allowed **ONLY IF**:

* the authenticated user has role `SISWA`
* the enrollment exists
* `enrollment.student_id` matches the current student profile ID

❌ If any condition fails:

* redirect to `/unauthorized` **OR**
* render an explicit access error message

---

## 3. DATA OWNERSHIP MODEL (CRITICAL)

### Canonical Data Owner

```text
Enrollment
```

All data on this page MUST be fetched starting from:

```text
enrollment.id === enrollment_id
```

### Required Relations

* StudentProfile
* Extracurricular
* PembinaProfile
* Schedule
* Attendance
* Announcement

These relations MUST be resolved using Prisma ORM.

---

## 4. SERVER-SIDE DATA FETCHING (NO API ROUTES)

### File Location

```text
src/app/(dashboard)/student/enrollments/[enrollment_id]/page.tsx
```

### Component Type

* React Server Component (RSC)

### Data Fetching Flow

1. Authenticate user via Clerk
2. Resolve student profile
3. Fetch enrollment via Prisma
4. Validate ownership and role
5. Render UI or error state

### Prisma Query Reference (Illustrative)

```ts
prisma.enrollment.findUnique({
  where: { id: enrollmentId },
  include: {
    extracurricular: {
      include: {
        pembina: { include: { user: true } },
        schedules: true,
        announcements: { orderBy: { created_at: 'desc' } },
      },
    },
    attendances: { orderBy: { date: 'desc' } },
  },
});
```

---

## 5. PAGE RESPONSIBILITIES (STRICT BOUNDARIES)

### This Page MUST

* display enrollment status
* show participation-specific information
* provide student-only participation tools

### This Page MUST NOT

* show enrollment or join CTAs
* replicate browse or discovery logic
* expose administrative controls

---

## 6. UI / UX SPECIFICATION (AUTHORITATIVE)

### 6.1 Page Header

**Title**

```text
Aktivitas Ekstrakurikuler
```

**Subtitle**

```text
Detail keikutsertaan dan aktivitas kamu
```

**Back Navigation**

```text
← Kembali ke Ekstrakurikuler Saya
```

Routes to:

```text
/student/enrollments
```

Sidebar highlight:

```text
Ekstrakurikuler Saya
```

---

### 6.2 Enrollment Status Card (TOP PRIORITY)

Displays:

* Nama ekstrakurikuler
* Kategori
* Status badge:

  * `PENDING` → Menunggu Persetujuan
  * `ACTIVE` → Aktif
  * `REJECTED` → Ditolak
  * `ALUMNI` → Alumni
* Tanggal bergabung
* Tahun akademik

---

### 6.3 Participation Actions (CONDITIONAL)

Visible **ONLY IF** enrollment status is `ACTIVE`:

Primary actions:

* **Jadwal Saya**
* **Absensi Saya**
* **Pengumuman**

All actions must be **filtered to this enrollment only**.

---

### 6.4 Jadwal Saya

Displays:

* Hari
* Waktu
* Lokasi

Empty state:

```text
Belum ada jadwal kegiatan
```

---

### 6.5 Absensi Saya

Displays a read-only table:

* Tanggal
* Status (HADIR / IZIN / SAKIT / ALPHA)
* Catatan (jika ada)

---

### 6.6 Pengumuman Ekstrakurikuler

Displays:

* Judul pengumuman
* Isi
* Tanggal dibuat
* Pembuat (Pembina)

Only announcements linked to:

```text
enrollment.extracurricular_id
```

---

## 7. EMPTY & ERROR STATES (MANDATORY)

### Enrollment Not Found

```text
Data keikutsertaan tidak ditemukan
```

### Unauthorized Access

```text
Kamu tidak memiliki akses ke data ini
```

### Non-active Enrollment

* Status shown
* Participation actions disabled

---

## 8. RECOMMENDED COMPONENT STRUCTURE

```text
/components/enrollment-detail/
├── EnrollmentHeader.tsx
├── EnrollmentStatusCard.tsx
├── EnrollmentSchedule.tsx
├── EnrollmentAttendance.tsx
├── EnrollmentAnnouncements.tsx
```

Use client components **only when interactivity is required**.

---

## 9. TESTING REQUIREMENTS (PASS / FAIL)

This feature is COMPLETE only if:

* students can view their own enrollment
* students cannot access other students’ enrollments
* pending enrollments show no participation actions
* active enrollments show full functionality
* Prisma ORM is used directly (no REST APIs)
* navigation and mental model are consistent

---

This feature is DONE when:

* `/student/enrollments/[id]` works end-to-end
* enrollment cards link to `/student/enrollments/[id]`
* the old `Lihat Detail → /student/ekstrakurikuler/[id]` path is fully removed from enrollment cards
* UI clearly differs from browse and discovery pages
* enrollment is treated as a first-class domain entity
* implementation aligns with the existing system design

---

## END OF SPECIFICATION

Claude Opus 4.5 Thinking MUST implement everything above exactly, end-to-end.
