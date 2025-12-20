# ADMIN Phase 1 — Mission Plan (Execution Contract)

## Referenced Contracts & Artifacts

- Global Navigation Contract
- ADMIN Phase 1 PRD
- ADMIN Phase 1 Flow

---

## 0. Mission Objective

Deliver **ADMIN Phase 1** core system-management functionality safely and completely, without impacting PEMBINA or SISWA workflows.

---

## 1. Phase 1.1 — API Completion (Critical)

### Tasks

- Complete `/admin/users` API
- Implement `/admin/users/[id]` API
- Complete `/admin/ekstrakurikuler` API
- Implement `/admin/ekstrakurikuler/[id]` API

Acceptance Criteria:

- All CRUD operations functional
- Role validation enforced

---

## 2. Phase 1.2 — Clerk Integration

### Tasks

- Integrate Clerk Backend API for user creation
- Remove placeholder `clerk_id` logic

Acceptance Criteria:

- Every new user has valid `clerk_id`

---

## 3. Phase 1.3 — UI Pages

### Tasks

- Implement `/admin/users` page
- Implement `/admin/users/[id]` page
- Implement `/admin/ekstrakurikuler` page
- Implement `/admin/ekstrakurikuler/[id]` page

---

## 4. Phase 1.4 — PEMBINA Assignment

### Tasks

- Implement PEMBINA assignment UI
- Persist assignments in Prisma

---

## 5. Phase 1.5 — Dashboard Wiring

### Tasks

- Replace mock dashboard data
- Wire CTAs to real pages

---

## 6. Phase 1.6 — Verification

### Verification Steps

- Create user via ADMIN
- Confirm Clerk account exists
- Confirm Prisma user linked
- Create extracurricular
- Assign PEMBINA

---

## 7. Execution Rules

- No PEMBINA or SISWA logic added
- No schema changes without approval
- Halt on ambiguity
