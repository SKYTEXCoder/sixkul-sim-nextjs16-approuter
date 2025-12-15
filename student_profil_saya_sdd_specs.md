# SIXKUL — PROFIL SAYA (STUDENT PROFILE)

## `/student/profile`

### **Specification-Driven Development (SDD)**

### **(FOR AGENTIC AI IDE — Claude Opus 4.5 Thinking OR Gemini 3 Pro (High))**

---

## 0. EXECUTION MODE — ABSOLUTE CONTRACT

You are an **Agentic AI Software Development & Engineering Agent**.

You are tasked with **fully implementing the STUDENT / SISWA “Profil Saya” feature**, end-to-end, in strict accordance with this specification.

### You **MUST**:

- Treat this document as a **binding contract**
- Implement **frontend + server-side data access**
- Use **Prisma ORM directly** (NO REST APIs)
- Use **React Server Components (RSC)** by default
- Use **Clerk Authentication** as the source of identity
- Respect the **Global Navigation Contract**
- Preserve all existing student features

### You **MUST NOT**:

- Invent features not explicitly specified

- Add new navigation routes

- Allow profile editing (READ-ONLY for MVP, **CONFIRMED BY PDF REPORT**)

- Break Clerk as the identity authority

- Invent features not explicitly specified

- Add new navigation routes

- Allow profile editing (READ-ONLY for MVP)

- Break Clerk as the identity authority

### Mandatory Consultation Rule

If **ANY ambiguity, uncertainty, or architectural doubt** arises,
you **MUST STOP and consult the project owner (user)** before proceeding.

---

## 1. FEATURE INTENT

### READ-ONLY DECISION (AUTHORITATIVE)

Based on the **official SIXKUL PDF report**, the **Student / SISWA profile is informational only**.

There is **NO requirement** for students to:

- edit personal data
- update academic fields
- manage account settings

All profile data is:

- managed by **Admin** (academic data)
- managed by **Clerk / system** (identity data)

Therefore, **Profil Saya is READ-ONLY by design** for the Student role.

Any edit functionality belongs to **Admin** or **future scope**, not this feature.

---

### Feature Name

**Profil Saya — Informasi Akun & Akademik**

### Route

```text
/student/profile
```

### User Role

```text
SISWA (STUDENT)
```

### Primary Question This Page Answers

> “Siapa saya di sistem ini, dan bagaimana status akademik & keikutsertaan saya?”

This page is a **READ-ONLY profile dashboard** for the student.

---

## 2. DATA SOURCES & OWNERSHIP

### Identity Source (AUTHORITATIVE)

**Clerk User** is the source of truth for:

- Full Name
- Email
- Profile Image

### Academic Source

**StudentProfile (Prisma)** is the source of truth for:

- NIS / NISN
- Class / Grade
- Academic Year
- Enrollment relations

---

## 3. ACCESS CONTROL

### Authentication

- Must use Clerk `auth()`
- Redirect unauthenticated users to `/sign-in`

### Authorization

- Only the authenticated student may view their profile
- No cross-user access allowed

---

## 4. PAGE STRUCTURE (MANDATORY)

### 4.1 Page Header

**Title**

```text
Profil Saya
```

**Subtitle**

```text
Informasi akun dan data akademik kamu
```

Sidebar item highlighted:

```text
Profil Saya
```

---

### 4.2 Profile Summary Card

Display the following:

**Identity**

- Profile picture (from Clerk)
- Full name
- Email address

**Academic Info**

- NIS / NISN (if available)
- Kelas / Tingkat
- Tahun Akademik

If any academic fields are missing:

```text
Belum diisi oleh admin
```

---

### 4.3 Enrollment Summary Section

Display **high-level statistics only**:

- Total Ekstrakurikuler Diikuti
- Ekstrakurikuler Aktif
- Ekstrakurikuler Menunggu Persetujuan

Counts MUST be computed via Prisma from Enrollment data.

---

### 4.4 Account Status Section

Show:

- Role: `SISWA`
- Status Akun: `Aktif`
- Tanggal Bergabung (from Clerk `createdAt`)

---

## 5. NAVIGATION CONTRACT (STRICT)

This page is **NON-NAVIGATIONAL**.

Allowed links:

- NONE (read-only page)

Explicitly forbidden:

- ❌ `/student/profile/edit`
- ❌ `/student/settings`
- ❌ Any deep navigation from profile cards

> This is aligned with the **Global Navigation Contract** and the **PDF specification**.

Future edit/settings functionality is **OUT OF SCOPE**.

This page is **NON-NAVIGATIONAL**.

Allowed links:

- NONE (read-only page)

Explicitly forbidden:

- ❌ `/student/profile/edit`
- ❌ `/student/settings`
- ❌ Any deep navigation from profile cards

Future edit/settings functionality is **OUT OF SCOPE**.

---

## 6. EMPTY & ERROR STATES

### Missing StudentProfile Record

If Clerk user exists but StudentProfile does not:

Show non-blocking warning card:

```text
Data akademik belum lengkap. Silakan hubungi admin sekolah.
```

Page MUST still render.

---

## 7. SERVER-SIDE IMPLEMENTATION

### Page Location

```text
src/app/(dashboard)/student/profile/page.tsx
```

### Component Type

- React Server Component (RSC)

### Data Fetch Flow

1. Authenticate user (Clerk)
2. Resolve Clerk user
3. Fetch StudentProfile via Prisma
4. Fetch enrollment aggregates
5. Render UI

NO client-side fetching.

---

## 8. AUTHORIZED REFACTOR SCOPE

The AI is **AUTHORIZED** to:

- Replace mock profile data
- Normalize naming and formatting
- Reuse existing layout components

The AI is **NOT AUTHORIZED** to:

- Add editing functionality
- Modify Clerk user data
- Introduce new routes

---

## 9. ACCEPTANCE CRITERIA (PASS / FAIL)

This feature is COMPLETE only if:

- `/student/profile` renders without 404
- Clerk identity data is displayed correctly
- Academic data loads from Prisma
- Enrollment counts are accurate
- Page is READ-ONLY
- Navigation contract is respected
- No client-side data fetching exists
- No new routes are introduced

---

## END OF SPECIFICATION

Claude Opus 4.5 Thinking OR Gemini 3 Pro (High) MUST implement everything above **exactly**,
and MUST consult the project owner if **any uncertainty** arises.
