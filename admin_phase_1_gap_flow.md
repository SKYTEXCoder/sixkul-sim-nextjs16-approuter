# ADMIN Phase 1 — GAP CLOSURE FLOW (Verbose)

## Document Authority
**Type:** Specification-Driven Development — GAP Flow Document  
**Scope:** ADMIN Phase 1 ONLY (Gap Closure)  
**Binding:** YES — Execution must follow this flow exactly

This document defines **ONLY the missing application flows** required to close ADMIN Phase 1. It assumes all existing Phase 1 flows are already correct and must not be altered.

---

## 1. Foundational Principle (Non-Negotiable)

> A flow is NOT considered implemented unless it is **usable end-to-end by a real ADMIN user via the browser UI**, without developer intervention.

Partial flows, API-only flows, or UI-only flows are considered **FAILURES**.

---

## 2. GAP FLOW 1 — Edit Existing User

### 2.1 Entry Point

- Route: `/admin/users`
- User Action: ADMIN clicks **Edit** on a user row

### 2.2 UI Flow

1. Edit action opens a **modal or dedicated edit page**
2. Existing user data is pre-filled
3. Editable fields are enabled:
   - Display name
   - Role
   - Status

### 2.3 Submission Flow

1. ADMIN submits form
2. UI validates input
3. Client sends `PUT /api/admin/users/[id]`
4. Server validates ADMIN role
5. Prisma updates user record
6. Server returns updated user
7. UI updates user list reactively
8. Success feedback is shown

### 2.4 Failure Handling

- Validation errors → inline messages
- Authorization failure → block
- API failure → error feedback

### 2.5 Completion Criteria

- ADMIN sees updated data immediately
- No page reload required

---

## 3. GAP FLOW 2 — Deactivate / Reactivate User

### 3.1 Entry Point

- Route: `/admin/users/[id]` OR inline action

### 3.2 UI Flow

1. ADMIN clicks **Deactivate** or **Activate**
2. Confirmation dialog appears

### 3.3 Submission Flow

1. UI sends `PUT /api/admin/users/[id]/status`
2. Server updates user status
3. Access control enforced immediately
4. UI reflects new status

### 3.4 Behavioral Guarantees

- Deactivated users cannot log in
- Reactivated users regain access

### 3.5 Completion Criteria

- Status change is visible
- Authentication behavior matches status

---

## 4. GAP FLOW 3 — Edit Extracurricular Metadata

### 4.1 Entry Point

- Route: `/admin/ekstrakurikuler/[id]`
- Action: ADMIN clicks **Edit Ekstrakurikuler**

### 4.2 UI Flow

1. Edit form opens with current metadata
2. Editable fields:
   - Name
   - Category
   - Description

### 4.3 Submission Flow

1. UI validates input
2. Client sends `PUT /api/admin/ekstrakurikuler/[id]`
3. Prisma updates record
4. UI reflects changes immediately

### 4.4 Completion Criteria

- Updated metadata persists
- No historical data affected

---

## 5. GAP FLOW 4 — Archive Extracurricular (Soft Delete)

### 5.1 Entry Point

- Route: `/admin/ekstrakurikuler/[id]`
- Action: ADMIN clicks **Archive**

### 5.2 UI Flow

1. Confirmation dialog explains consequences
2. ADMIN confirms

### 5.3 Submission Flow

1. Client sends `DELETE /api/admin/ekstrakurikuler/[id]`
2. Server performs soft archive
3. No cascade deletes
4. UI removes item from active list

### 5.4 Completion Criteria

- Archived items hidden from active views
- Data remains queryable historically

---

## 6. GAP FLOW 5 — Change PEMBINA Assignment

### 6.1 Entry Point

- Route: `/admin/ekstrakurikuler/[id]`

### 6.2 UI Flow

1. ADMIN opens **Pembina Assignment** section
2. Current Pembina list shown
3. ADMIN can add/remove PEMBINA

### 6.3 Submission Flow

1. UI validates at least one PEMBINA remains
2. Client sends `PUT /api/admin/ekstrakurikuler/[id]/pembina`
3. Server updates assignment
4. UI updates immediately

### 6.4 Completion Criteria

- Assignment persists
- PEMBINA dashboards reflect changes

---

## 7. Global Flow Invariants

- No flow bypasses UI
- No flow bypasses API
- No flow bypasses Prisma
- All flows provide user feedback

---

## 8. Final Acceptance Rule

ADMIN Phase 1 GAP is closed ONLY when **all five flows** above are:
- Implemented
- Tested manually
- Verified usable by a real ADMIN user

No exceptions.

