# SIXKUL (Sistem Informasi dan Manajemen Ekstrakurikuler untuk Suatu SMA)

## STUDENT EXTRACURRICULAR DISCOVERY & ENROLLMENT

### FULL IMPLEMENTATION SPECIFICATION (FOR AGENTIC AI LLM IDEs)

---

## 0. PURPOSE OF THIS DOCUMENT

This specification defines **everything required** to fully implement, integrate, and test the **STUDENT EXTRACURRICULAR DISCOVERY** and **STUDENT ENROLLMENT** features in the SIXKUL system.

This document is written to be **directly handed to AGENTIC AI LLM IDEs (AI IDE)** such that:

* all required UI pages are built
* all API endpoints are implemented
* database models are used correctly
* test data is seeded if missing
* the feature set is usable end‑to‑end by real STUDENT users

This specification document assumes:

* Next.js 16 (App Router)
* **Clerk Authentication** for authentication, session management, route protection, and role-based access control (RBAC)
* **Supabase PostgreSQL** as the primary database
* RESTful API routes (Next.js Route Handlers)
* role-based access control (STUDENT enforced via Clerk metadata)

---

## 1. FEATURE SCOPE (STRICT)

### Included:

* Browse extracurriculars
* View extracurricular detail
* Enroll into extracurricular
* Enrollment state handling (Not Enrolled / Pending / Active)
* Empty states
* Error handling
* Test data seeding

### Explicitly excluded:

* Enrollment approval (PEMBINA)
* Schedule editing
* Attendance input
* Grading / scoring

---

## 2. AUTHENTICATION, AUTHORIZATION & USER ROLE HANDLING (CLERK)

### 2.1 Authentication & Session Management

* All authentication MUST be handled by **Clerk**
* User identity MUST be derived from `auth()` / `currentUser()` in server components or route handlers
* No custom password, login, or session logic may be implemented

### 2.2 Role Storage & Access Control

* User role MUST be stored in **Clerk public or private metadata** under the key `role`
* Allowed values: `STUDENT` or `SISWA`, `PEMBINA`, `ADMIN`
* All STUDENT-only pages and APIs MUST explicitly verify:

  * user is authenticated
  * `user.publicMetadata.role === 'STUDENT'` or `user.publicMetadata.role === 'SISWA'`

### 2.3 Route Protection (Protected Routes implementation)

* All `/ekstrakurikuler/*` and `/student/*` routes MUST be protected using Clerk middleware
* Unauthorized users MUST be redirected or receive `401/403`

---

## 3. USER ROLE & PERMISSIONS

### Role: STUDENT

STUDENT users may:

* view all active extracurriculars
* view detail of extracurriculars
* submit enrollment requests

STUDENT users may NOT:

* approve enrollment
* modify extracurricular data
* view other students’ private data

---

## 4. DATABASE MODELS (SUPABASE POSTGRESQL) (REQUIRED)

### 4.1 `users` (Clerk-synced, more-or-less)

```ts
id: uuid (PK)
username: string
email: string
role: 'SISWA' | 'PEMBINA' | 'ADMIN'  // mirrored from Clerk metadata
```

### 3.2 `extracurriculars`

```ts
id: uuid (PK)
name: string
description: text
category: 'Seni' | 'Olahraga' | 'Teknologi'
status: 'ACTIVE' | 'INACTIVE'
pembina_id: uuid (FK → users)
created_at: datetime
```

### 3.3 `enrollments`

```ts
id: uuid (PK)
student_id: uuid (FK → users)
extracurricular_id: uuid (FK → extracurriculars)
status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ALUMNI' | 'CANCELLED'
created_at: datetime
```

### 3.4 `schedules` (read-only)

```ts
id: uuid
extracurricular_id: uuid (it depends on what its currently set to in the database)
day_of_week: string
start_time: time
end_time: time
```

---

## 5. DATABASE SEEDING (SUPABASE, MANDATORY IF EMPTY) (MANDATORY IF EMPTY)

If `extracurriculars` table is empty:

### Seed at least:

* 1 Seni (e.g. Drum Band)
* 1 Olahraga (Basket)
* 1 Teknologi (Game Development)

Each seeded extracurricular MUST:

* be ACTIVE
* have a valid pembina

Seed at least:

* 1 STUDENT user (linked to a real Clerk user ID)
* 1 PEMBINA user (linked to a real Clerk user ID)

NOTE:

* User records MUST reference `clerk_user_id`
* Do NOT create fake authentication records outside Clerk

---

## 6. FRONTEND ROUTES TO IMPLEMENT (NEXT.JS + CLERK)

### 5.1 Browse Extracurriculars

```
/ekstrakurikuler
```

#### UI Requirements:

* Page title: "Jelajahi Ekstrakurikuler"
* Search input (by name)
* Grid/list of cards

#### Card UI MUST show:

* Name
* Short description
* Category badge
* Pembina name
* Member count
* CTA: "Lihat Detail"

#### Empty State:

* Text: "Belum ada ekstrakurikuler tersedia"

---

### 5.2 Extracurricular Detail

```
/ekstrakurikuler/[id]
```

#### UI Sections:

1. Header

   * Name
   * Category badge
   * Status badge
2. Description
3. Pembina info card
4. Schedule section

   * List schedules OR empty state
5. Enrollment action panel

#### Enrollment Panel States:

| Student State | Button Text          | Enabled |
| ------------- | -------------------- | ------- |
| Not enrolled  | Daftar Sekarang      | YES     |
| Pending       | Menunggu Persetujuan | NO      |
| Active        | Sudah Terdaftar      | NO      |

---

## 7. API ENDPOINTS TO IMPLEMENT (CLERK-PROTECTED)

### 6.1 List Extracurriculars

```
GET /api/ekstrakurikuler
```

Returns only ACTIVE extracurriculars

---

### 6.2 Extracurricular Detail

```
GET /api/ekstrakurikuler/{id}
```

---

### 6.3 Create Enrollment

```
POST /api/enrollments
```

Payload:

```json
{
  "extracurricular_id": "uuid"
}
```

#### Validation (Server-Side, Required):

* user authenticated via Clerk
* role === SISWA
* clerk_user_id matches student_id
* extracurricular exists
* extracurricular ACTIVE
* no duplicate enrollment
* user is STUDENT
* extracurricular exists
* extracurricular ACTIVE
* no duplicate enrollment

Creates enrollment with status = PENDING

---

### 6.4 Get Student Enrollment Status (Optional)

```
GET /api/enrollments/status?extracurricular_id=uuid
```

---

## 8. FRONTEND DATA FLOW (CLERK-AWARE)

1. `/ekstrakurikuler`
   → fetch list
2. click card
   → `/ekstrakurikuler/[id]`
3. fetch detail + enrollment status
4. click "Daftar Sekarang"
5. POST enrollment
6. UI updates to Pending
7. Dashboard reflects change

---

## 9. ERROR HANDLING

### Required Errors:

* Duplicate enrollment
* Unauthorized access
* Inactive extracurricular

UI must display friendly messages

---

## 10. TEST CASES (CLERK + SUPABASE) (MUST PASS)

* student sees list of extracurriculars
* student opens detail page
* student enrolls successfully
* enrollment status updates
* duplicate enrollment blocked
* Role-Based Access Control (RBAC) Enforced

---

## 11. SUCCESS CRITERIA

This feature is COMPLETE if:

* no hardcoded data
* no broken states
* all empty states handled
* student can discover and enroll

---

## END OF SPECIFICATION

AGENTIC AI LLM IDEs MUST implement all sections above "exactly" (more or less, PLEASE DO NOT HESITATE TO ASK ME FOR FURTHER CLARIFICATION BEFORE PROCEEDING WITH THE IMPLEMENTATION!!).
