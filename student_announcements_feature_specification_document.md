# SIXKUL — PENGUMUMAN SAYA (STUDENT ANNOUNCEMENTS)

## `/student/announcements`

### **SDD — ENROLLMENT-CENTRIC, STUDENT-WIDE IMPLEMENTATION**

### (FOR AGENTIC AI IDE — CLAUDE OPUS 4.5 THINKING)

---

## 0. EXECUTION MODE (ABSOLUTE CONTRACT)

You are an **Agentic AI Software Development & Engineering Agent** tasked with **end-to-end implementation** of the **Pengumuman Saya** feature for the **STUDENT / SISWA** role.

You **MUST**:

* Treat this document as a **binding, authoritative specification**
* Implement **frontend, server-side data access, and integration**
* Use **Prisma ORM directly** (NO REST API routes)
* Use **React Server Components (RSC)** by default
* Use **Clerk Authentication** for auth & ownership validation
* Respect the **Global Navigation Contract**
* Preserve all existing student features and routing semantics

You **MUST NOT**:

* Guess requirements
* Invent features not explicitly specified
* Allow students to create/edit/delete announcements
* Introduce new routes without instruction
* Bypass enrollment context

### Mandatory Consultation Rule

If **ANY uncertainty, ambiguity, or design question** arises during implementation, whether it is about the creation of the implementation plan, the creation of the task list, or the creation of the code itself, you **MUST STOP AND CONSULT THE PROJECT OWNER (USER)** before proceeding ANY FURTHER.

Correctness > Speed. Alignment > Assumptions.

---

## 1. DOMAIN MODEL — AUTHORITATIVE RULES

### 1.1 Core Announcement Concept

An **Announcement** represents an official communication from a **Pembina** to members of an **Extracurricular**.

Announcements are:

* authored by Pembina
* scoped to an Extracurricular
* visible only to students with **ACTIVE enrollments**
* **read-only** for students

---

## 2. FEATURE INTENT

### Feature Name

**Pengumuman Saya — Informasi Ekstrakurikuler**

### Route

```text
/student/announcements
```

### User Role

```text
SISWA (STUDENT)
```

### Primary Question This Page Answers

> “Pengumuman apa saja yang relevan dengan ekstrakurikuler yang saya ikuti?”

This page is a **global, student-wide announcement feed**, filtered strictly by the student’s **ACTIVE enrollments**.

---

## 3. ACCESS CONTROL & DATA SCOPE

### Authentication

* Use **Clerk Authentication**
* Resolve authenticated user → StudentProfile

### Authorization Rules (NON-NEGOTIABLE)

Only include announcements that:

* belong to an Extracurricular
* where the student has an **ACTIVE enrollment**
* are not soft-deleted (if applicable)
* are ordered by most recent first

A student must **never be able to see**:

* announcements for extracurriculars they are not enrolled in
* announcements from inactive enrollments
* announcements authored by other students

---

## 4. DATA OWNERSHIP & QUERY MODEL

### Canonical Data Path

```text
Student → Enrollment (ACTIVE) → Extracurricular → Announcement
```

### Required Announcement Fields (View Model)

Each announcement MUST include:

* `announcement.id`
* `announcement.title`
* `announcement.content`
* `announcement.created_at`
* `extracurricular.id`
* `extracurricular.name`
* `extracurricular.category`
* `author.name` (Pembina)
* `enrollment_id` (derived, for navigation context)

---

## 5. VIEW MODES & GROUPING (CORE REQUIREMENT)

The Pengumuman Saya page MUST support **TWO PRIMARY VIEW MODES**:

### 5.1 Global Feed (DEFAULT)

A unified, chronological feed:

```text
[Announcement Card]
Judul
Ekstrakurikuler
Tanggal
Preview konten
```

Ordered by:

```text
created_at DESC
```

---

### 5.2 Grouped by Ekstrakurikuler

Structure:

```text
Ekstrakurikuler
 ├─ Pengumuman 1
 ├─ Pengumuman 2
 └─ ...
```

---

### View Toggle Requirement

A clear UI toggle MUST exist allowing switching between:

* `Semua Pengumuman`
* `Kelompokkan per Ekstrakurikuler`

The toggle MUST NOT cause navigation or full page reload.

---

## 6. PAGE UI / UX SPECIFICATION

### 6.1 Page Header

**Title**

```text
Pengumuman Saya
```

**Subtitle**

```text
Informasi terbaru dari ekstrakurikuler yang kamu ikuti
```

Sidebar highlight:

```text
Pengumuman
```

---

### 6.2 Announcement Card

Each announcement card MUST display:

* Judul pengumuman
* Nama ekstrakurikuler + kategori badge
* Tanggal diposting (format Indonesia)
* Preview konten (truncate if long)
* Visual indicator for unread (optional, MVP-safe)

---

## 7. NAVIGATION CONTRACT (STRICT)

### Click Behavior

Clicking an announcement MUST route to:

```text
/student/enrollments/[enrollment_id]
```

and optionally auto-scroll or highlight the announcement.

❌ FORBIDDEN ROUTES:

* `/student/announcements/[id]`
* `/student/extracurricular/[id]`
* `/student/session/[id]`

Enrollment is the **only valid context**.

---

## 8. EMPTY & ERROR STATES

### No Announcements

Display:

```text
Belum ada pengumuman
```

Subtext:

```text
Pengumuman akan muncul setelah pembina membagikan informasi kegiatan
```

CTA:

```text
Lihat Ekstrakurikuler Saya
```

Route:

```text
/student/enrollments
```

---

## 9. SERVER-SIDE DATA FETCHING (NO API ROUTES)

### Page Location

```text
src/app/(dashboard)/student/announcements/page.tsx
```

### Component Type

* React Server Component (RSC)

### Data Fetch Flow

1. Authenticate user (Clerk)
2. Resolve StudentProfile
3. Fetch ACTIVE enrollments
4. Resolve extracurricular_ids
5. Fetch announcements via Prisma
6. Attach enrollment_id mapping
7. Render grouped UI

---

## 10. CONTROLLED REFACTOR AUTHORIZATION

The AI is **AUTHORIZED** to:

* replace any mock announcement data
* refactor UI-only announcement components
* normalize announcement formatting utilities

The AI is **NOT AUTHORIZED** to:

* change announcement ownership
* allow student mutations
* create new announcement routes

---

## 11. TESTING & ACCEPTANCE CRITERIA (PASS / FAIL)

This feature is COMPLETE only if:

* `/student/announcements` renders without 404 Not Found
* Data is fetched via Prisma (no mocks)
* Only ACTIVE enrollment announcements are shown
* Global feed works
* Group by Ekstrakurikuler works
* Toggle works without page reload
* Navigation respects Global Navigation Contract
* Empty states render correctly

---

## END OF SPECIFICATION

Claude Opus 4.5 Thinking **MUST implement everything above exactly**
and **MUST consult the user if any uncertainty arises**.
