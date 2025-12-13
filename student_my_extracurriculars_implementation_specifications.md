# SIXKUL

## STUDENT – EKSTRAKURIKULER SAYA (ENROLLMENTS)

### ABSOLUTE END‑TO‑END IMPLEMENTATION SPECIFICATION

### (FOR AGENTIC AI IDE – CLAUDE OPUS 4.5)

---

## 0. DOCUMENT INTENT (READ THIS FIRST)

This document is a **command‑level implementation specification**.

The Agentic AI IDE (Claude Opus 4.5 Thinking) MUST:

* design the UI/UX
* implement all frontend pages
* implement all backend **data-access logic using Prisma ORM**
* **MUST NOT create new REST API endpoints for this feature**
* integrate Clerk Authentication
* integrate Supabase PostgreSQL **via Prisma Client**
* strictly use the existing `schema.prisma` models
* respect the existing `seed.ts` data (DO NOT reseed unless explicitly required)
* handle RBAC correctly
* deliver a **fully usable, testable feature** for end users

This document does **NOT** describe ideas. It describes **required behavior**.

---

## 1. FEATURE SCOPE (STRICT, NON‑NEGOTIABLE)

### Feature Name

**Eksktrakurikuler Saya** – Student Enrollment Management

### Frontend Route

```
/student/enrollments
```

### Role

STUDENT (SISWA) ONLY

### Purpose

Allow a student to:

* view all extracurriculars they are enrolled in
* clearly see enrollment status
* navigate to related student features (detail, schedule, attendance)

---

## 2. AUTHENTICATION & AUTHORIZATION (MANDATORY)

### Authentication

* Use **Clerk Authentication** exclusively
* Identify user via `auth()` / `currentUser()`

### Role Validation

* User role MUST be stored in Clerk metadata under `role`
* Access is allowed ONLY if:

```
role === 'STUDENT' || role === 'SISWA'
```

### Route Protection (Protected Routes Implementation)

* `/student/enrollments` MUST be protected via Clerk middleware
* Unauthorized users MUST receive `403` or redirect.

---

## 3. DATABASE MODELS (SUPABASE POSTGRESQL VIA PRISMA ORM)

### 3.1 users (Prisma model: `User`)

```ts
id: uuid (PK)
clerk_user_id: string (unique)
name: string
email: string
role: 'STUDENT' | 'PEMBINA' | 'ADMIN'
```

### 3.2 extracurriculars (Prisma model: `Extracurricular`)

```ts
id: uuid (PK)
name: string
description: text
category: 'Seni' | 'Olahraga' | 'Teknologi'
status: 'ACTIVE' | 'INACTIVE'
pembina_id: uuid (FK → users)
created_at: timestamp
```

### 3.3 enrollments (Prisma model: `Enrollment`)

```ts
id: uuid (PK)
student_id: uuid (FK → users)
extracurricular_id: uuid (FK → extracurriculars)
status: 'PENDING' | 'ACTIVE'
created_at: timestamp
```

### 3.4 schedules (Prisma model: `Schedule`, READ-ONLY) (READ‑ONLY)

```ts
id: uuid
extracurricular_id: uuid
day: string
time_start: time
time_end: time
location: string
```

---

## 4. DATABASE SEEDING (PRISMA-AWARE, CONDITIONAL)

If **no enrollments exist** for the currently-logged-in STUDENT / SISWA user account:

* FIRST check existing data using Prisma Client
* DO NOT re-run `seed.ts`
* DO NOT create duplicate data
* Only rely on existing seeded data created by `seed.ts`

Seeding rules:

* `seed.ts` is already executed and considered the source of truth
* The application MUST gracefully handle empty datasets
* No runtime seeding logic may mutate production data

---

## 5. BACKEND DATA ACCESS (PRISMA, NO REST API ROUTE HANDLERS)

### 5.1 Fetch Student Enrollments (Prisma Query)

Data MUST be fetched directly in **Server Components or Server Actions** using Prisma Client.

#### Authorization (REQUIRED)

* Clerk authenticated
* role === STUDENT

#### Prisma Query (REQUIRED)

```ts
const enrollments = await prisma.enrollment.findMany({
  where: {
    student: {
      clerk_id: clerkUserId,
    },
  },
  include: {
    extracurricular: {
      include: {
        pembina: true,
        schedules: true,
      },
    },
  },
  orderBy: {
    created_at: 'desc',
  },
});
```

The data MUST then be mapped into a view model for rendering.      }
}
]
}

```

---

## 6. FRONTEND UI / UX SPECIFICATION

### 6.0 Side Navigation Bar Representation
- Icon: 🏛️
- Label: Ekstrakurikuler Saya

### 6.1 Page Header
- Title: **Ekstrakurikuler Saya**
- Subtitle: "Daftar ekstrakurikuler yang kamu ikuti"

---

### 6.2 Empty State (MANDATORY)

Displayed when enrollment list is empty.

UI:
- Icon illustration
- Text: "Kamu belum mengikuti ekstrakurikuler apa pun"
- Primary CTA: "Jelajahi Ekstrakurikuler" → `/ekstrakurikuler`

---

### 6.3 Enrollment Card (CORE COMPONENT)

Each enrollment MUST render a card with:

#### Identity Section
- Extracurricular name
- Category badge

#### Status Badge
| Status | Label | Color |
|------|------|------|
| PENDING | Menunggu Persetujuan | Yellow |
| ACTIVE | Aktif | Green |

#### Metadata
- Pembina name
- Jumlah jadwal ("Belum ada jadwal" if 0)

#### Actions
| Status | Actions |
|------|--------|
| PENDING | Lihat Detail (disabled) |
| ACTIVE | Lihat Detail, Jadwal, Absensi |

Routing:
- Lihat Detail → `/ekstrakurikuler/[id]`
- Jadwal → `/student/schedule`
- Absensi → `/student/attendance`

---

## 7. FRONTEND DATA FLOW (PRISMA + SERVER COMPONENTS)

1. `/student/enrollments` loads as a **Server Component**
2. Clerk session is resolved server-side
3. Prisma Client fetches enrollments
4. Data is transformed into UI view models
5. Empty or populated UI is rendered
6. Navigation actions route correctly

---

## 8. ERROR HANDLING

Must gracefully handle:
- 401 Unauthorized
- 403 Forbidden
- Network failure

User‑friendly messages required.

---

## 9. TESTING REQUIREMENTS (PRISMA-BASED) (MANDATORY)

The implementation is COMPLETE only if:

- Student with no enrollments sees empty state
- Student with PENDING enrollment sees correct badge
- Student with ACTIVE enrollment sees action buttons
- Unauthorized users are blocked
- No hardcoded data exists

---

## 10. SUCCESS CRITERIA (FINAL CHECK)

This feature is considered DONE when:
- UI matches spec
- API matches contract
- RBAC enforced
- Data seeded when needed
- Student can use the page without errors

---

## END OF SPECIFICATION

Claude Opus 4.5 Thinking MUST implement all steps above exactly, end-to-end **using Prisma ORM for all database access**. No REST API endpoints may be introduced for this feature.

```
