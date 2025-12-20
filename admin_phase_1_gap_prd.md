# ADMIN Phase 1 — GAP CLOSURE PRD (Verbose)

## Status of This Document
**Type:** Specification-Driven Development (SDD) — Gap Closure PRD  
**Applies To:** ADMIN Phase 1 ONLY  
**Authority:** Subordinate to `ADMIN_PHASE1_PRD.md`, but **binding for closure execution**  

This document exists to close **confirmed, in-scope gaps** discovered after the initial ADMIN Phase 1 implementation and verification audit.

---

## 1. Background & Rationale

### 1.1 Context

ADMIN Phase 1 was designed to deliver **full end-to-end system governance capabilities**, including:
- User management via Clerk + Prisma
- Extracurricular lifecycle management
- Assignment of PEMBINA to extracurriculars

While the **architectural foundation, APIs, routing, and authentication layers are correct**, a **post-implementation gap audit** identified that several **in-scope Phase 1 features are not yet fully usable by end ADMIN users via the UI**.

Specifically, these gaps are **not design errors** and **not scope expansion**, but **incomplete UI → API wiring** that prevents real-world usability.

### 1.2 Why a Gap PRD Is Required

Under Specification-Driven Development (SDD):

> A phase is not complete unless all specified features are **usable end-to-end by real users**, not merely present in code or APIs.

The gap audit confirms that:
- Backend coverage is effectively complete
- The remaining work is **finite, well-defined, and UI-centric**

Therefore, a **focused Gap Closure PRD** is the correct and minimal artifact to:
- Preserve architectural integrity
- Prevent scope creep
- Formally close ADMIN Phase 1

---

## 2. Scope Definition (Critical)

### 2.1 IN SCOPE — GAP CLOSURE ONLY

This PRD covers **ONLY the following missing Phase 1 capabilities**, all of which were explicitly part of the original ADMIN Phase 1 scope:

1. Edit existing users
2. Deactivate / reactivate users
3. Edit existing extracurricular metadata
4. Archive (soft-delete) extracurriculars via UI
5. Change PEMBINA assignment for an extracurricular

No additional features are introduced.

---

### 2.2 OUT OF SCOPE (Reaffirmed)

The following remain **explicitly out of scope** for Phase 1 and must NOT be implemented as part of this gap closure:

- Attendance input or modification
- Enrollment approval or rejection
- Session or schedule management
- Reporting, analytics, or exports
- Notification management
- Role impersonation
- ADMIN Phase 2 or Phase 3 features

If any of the above are implemented, it constitutes a **scope violation**.

---

## 3. Gap 1 — Edit User (ADMIN)

### 3.1 Problem Statement

ADMIN users can currently **view users** but cannot **edit existing user details** via the UI, despite the capability being part of Phase 1 scope.

### 3.2 Required Capability

ADMIN must be able to:
- Open a user detail or edit dialog
- Modify editable fields
- Persist changes
- See updates reflected immediately in the UI

### 3.3 Editable Fields (Explicit)

Allowed:
- Display name
- Role (ADMIN / PEMBINA / SISWA)
- Status (active / inactive)

Not allowed:
- Passwords
- Authentication credentials
- Clerk-managed identity fields

### 3.4 Success Criteria

- Changes persist in Prisma
- UI updates without full reload
- Unauthorized fields are not editable

---

## 4. Gap 2 — Deactivate / Reactivate User

### 4.1 Problem Statement

ADMIN cannot currently deactivate or reactivate users via the UI, despite this being necessary for real system governance.

### 4.2 Required Capability

ADMIN must be able to:
- Deactivate a user (soft disable)
- Reactivate a previously deactivated user

### 4.3 Behavioral Rules

- Deactivated users:
  - Cannot log in
  - Retain all historical data
- Reactivation restores access

### 4.4 Success Criteria

- Status change is persisted
- Access control reflects status immediately
- No data is deleted

---

## 5. Gap 3 — Edit Extracurricular Metadata

### 5.1 Problem Statement

ADMIN can create extracurriculars but cannot edit existing ones via the UI.

### 5.2 Required Capability

ADMIN must be able to:
- Edit name
- Edit description
- Edit category

### 5.3 Constraints

- Changes affect future operations only
- Historical sessions and enrollments remain intact

### 5.4 Success Criteria

- Changes persist in database
- UI reflects updated metadata

---

## 6. Gap 4 — Archive Extracurricular (Soft Delete)

### 6.1 Problem Statement

Archiving (soft deletion) of extracurriculars is not currently reachable via the UI.

### 6.2 Required Capability

ADMIN must be able to:
- Archive an extracurricular from the UI

### 6.3 Archival Rules (Non-Negotiable)

- Archiving is a **soft operation**
- No cascading deletes
- The extracurricular:
  - Becomes inactive
  - Is hidden from active listings
  - Retains all historical data

### 6.4 Success Criteria

- Status changes correctly
- Data integrity preserved

---

## 7. Gap 5 — Change PEMBINA Assignment

### 7.1 Problem Statement

ADMIN can assign PEMBINA at creation time but cannot modify PEMBINA assignment afterward via the UI.

### 7.2 Required Capability

ADMIN must be able to:
- Add PEMBINA to an extracurricular
- Remove PEMBINA from an extracurricular
- Replace PEMBINA assignment

### 7.3 Constraints

- At least one PEMBINA must remain assigned
- Historical data must not be affected

### 7.4 Success Criteria

- Assignment updates persist
- PEMBINA dashboards reflect changes

---

## 8. UX & Usability Enforcement Rules

The following rules apply globally to all gap-closure work:

- No visible button may be non-functional
- No form may exist without submission logic
- No input may exist without effect
- All changes must provide user feedback (success or error)

If a UI element cannot be made functional, it **must be removed** for Phase 1.

---

## 9. Completion Criteria (Phase 1 Closure)

ADMIN Phase 1 is considered **FULLY COMPLETE** only when:

- All five gaps are implemented end-to-end
- All features are usable via browser UI
- No scope violations exist
- A final verification report confirms usability

Only after this point may the project proceed to **ADMIN Phase 2**.

---

## 10. SDD Enforcement Clause

Any ambiguity during gap-closure implementation must:
1. Halt execution
2. Request clarification
3. Avoid assumption-based development

This document is binding for Phase 1 closure.

