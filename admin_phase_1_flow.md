# ADMIN Phase 1 — Application Flow Specification

## Referenced Contracts & Artifacts

- Global Navigation Contract
- ADMIN Phase 1 PRD

---

## 1. Purpose

This document defines the **end-to-end application flow** for ADMIN Phase 1.

It focuses on **system-level management workflows**, not daily operations.

---

## 2. Authentication & Entry Flow

1. User authenticates via Clerk
2. Middleware validates role = ADMIN
3. User is routed to:

```
/admin/dashboard
```

Unauthorized access redirects to `/unauthorized`.

---

## 3. ADMIN Dashboard Flow

### 3.1 Dashboard Behavior

- Display system summaries (user count, extracurricular count)
- Read-only information only
- CTAs redirect to management pages

---

## 4. User Management Flow

### 4.1 View Users

Route:

```
/admin/users
```

Flow:

1. System fetches all users
2. List is rendered with role and status

---

### 4.2 Create User

Flow:

1. ADMIN opens create-user form
2. ADMIN enters user details
3. System calls Clerk Backend API
4. Clerk returns `clerk_id`
5. System persists Prisma User
6. Success confirmation shown

Failure Handling:

- Clerk API failure → abort Prisma write

---

### 4.3 Edit / Deactivate User

Route:

```
/admin/users/[id]
```

Flow:

- ADMIN edits allowed fields
- Deactivation disables access but preserves data

---

## 5. Extracurricular Management Flow

### 5.1 View Extracurriculars

Route:

```
/admin/ekstrakurikuler
```

---

### 5.2 Create / Edit Extracurricular

Flow:

1. ADMIN creates or edits metadata
2. Prisma persists changes

---

## 6. PEMBINA Assignment Flow

Flow:

1. ADMIN selects an extracurricular
2. ADMIN assigns PEMBINA user(s)
3. Assignment saved

Constraints:

- At least one PEMBINA required

---

## 7. Error & Guard Flows

- Unauthorized access → redirect
- Clerk API error → rollback
- Invalid role assignment → blocked

---

## 8. Flow Invariants

- ADMIN never performs PEMBINA operations
- All user creation flows use Clerk API
- Global Navigation Contract preserved

---

## 9. SDD Enforcement

Execution must halt on ambiguity.
