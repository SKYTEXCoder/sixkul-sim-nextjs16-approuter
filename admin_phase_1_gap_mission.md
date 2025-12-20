# ADMIN Phase 1 — GAP CLOSURE MISSION (Execution Contract)

## Document Authority
**Type:** Specification-Driven Development — GAP Mission Document  
**Scope:** ADMIN Phase 1 ONLY  
**Binding:** ABSOLUTE

This document defines the **only acceptable execution plan** for closing ADMIN Phase 1 gaps. Any deviation constitutes a failed Phase 1.

---

## 0. Mission Objective (Non-Negotiable)

Deliver **FULL END-TO-END USABILITY** for ALL ADMIN Phase 1 features.

Completion means:
- All features work via UI
- All features are production-usable
- No dead buttons
- No partial flows

---

## 1. Execution Rules (Strict)

- UI, API, and DB must be wired together
- No visible UI element may be non-functional
- No backend-only completion allowed
- No placeholder or TODO logic
- Halt execution on ambiguity

---

## 2. Phase G1 — Edit User Implementation

### Tasks
- Implement Edit User modal/page
- Wire to `PUT /api/admin/users/[id]`
- Add optimistic UI update or re-fetch

### Verification
- Edit name/role/status
- Changes persist
- UI updates immediately

---

## 3. Phase G2 — Deactivate / Reactivate User

### Tasks
- Add activate/deactivate UI controls
- Wire to status update endpoint
- Enforce access control immediately

### Verification
- Deactivated user blocked from login
- Reactivated user regains access

---

## 4. Phase G3 — Edit Extracurricular

### Tasks
- Implement Edit Ekstrakurikuler UI
- Wire to `PUT /api/admin/ekstrakurikuler/[id]`

### Verification
- Metadata updates persist
- UI reflects changes

---

## 5. Phase G4 — Archive Extracurricular

### Tasks
- Implement Archive action with confirmation
- Wire to `DELETE /api/admin/ekstrakurikuler/[id]`
- Ensure soft archive only

### Verification
- Item removed from active list
- Data preserved

---

## 6. Phase G5 — PEMBINA Assignment Management

### Tasks
- Implement PEMBINA assignment UI
- Wire to assignment update endpoint
- Validate at least one PEMBINA

### Verification
- Assignment persists
- PEMBINA sees changes

---

## 7. Phase G6 — Manual End-to-End Testing (Mandatory)

### Required Manual Tests

- Create user → edit → deactivate → reactivate
- Create extracurricular → edit → archive
- Assign PEMBINA → reassign

All tests must be performed via browser UI.

---

## 8. Final Deliverable (Mandatory)

Produce:

**ADMIN Phase 1 — FINAL Usability Verification Report**

This report MUST explicitly state:
- All Phase 1 features are end-to-end usable
- No UI element is non-functional

---

## 9. Acceptance Criteria

ADMIN Phase 1 is COMPLETE only when:
- All GAP phases G1–G6 pass
- Verification report is approved

No partial acceptance allowed.

