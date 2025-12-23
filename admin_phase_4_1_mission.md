# ADMIN Phase 4.1 — Mission SDD (Infrastructure Execution Contract)

## Document Authority & Binding Nature

This Mission SDD is **authoritative and binding** for ADMIN Phase 4.1.

Phase 4.1 is a **pure infrastructure phase** whose sole purpose is to prepare the SIXKUL system for ADMIN Phase 4 UI (Pengumuman, Profil Saya, Pengaturan).

🚫 UI work is FORBIDDEN in this phase.
🚫 Route creation is FORBIDDEN in this phase.
🚫 Navigation changes are FORBIDDEN in this phase.

---

## 0. Absolute Laws (Non-Negotiable)

1. Infrastructure only — no end-user features
2. Backward compatibility is mandatory
3. Zero breaking schema changes
4. All semantics must be explicit
5. Fail loudly — no silent degradation

Any violation is an automatic rejection.

---

## 1. Phase 4.1 Objectives

ADMIN Phase 4.1 exists to:

- Enable system-level ADMIN announcements
- Persist ADMIN preferences safely
- Decouple notification context from enrollment-only assumptions
- Preserve existing SISWA and PEMBINA behavior

This phase MUST NOT attempt to solve UI or UX problems.

---

## 2. Mandatory Deliverables

### 2.1 Infrastructure Artifacts

- Updated Announcement schema supporting SYSTEM scope
- AdminPreferences data model
- Notification context abstraction
- Server-side validation & guards

### 2.2 Documentation Artifacts

- Migration explanation
- Compatibility notes
- Verification report

---

## 3. Execution Phases (STRICT ORDER)

### P1 — Announcement Infrastructure

**Objective**: Support system-level announcements without hacks.

**Tasks**:
- Make `extracurricular_id` nullable OR introduce explicit scope enum
- Ensure scope derivation is deterministic
- Update all announcement queries

**Rules**:
- No dummy foreign keys
- No breaking existing queries

**Verification**:
- Existing PEMBINA announcements still resolve correctly

---

### P2 — Admin Preferences Infrastructure

**Objective**: Persist ADMIN settings cleanly.

**Tasks**:
- Introduce AdminPreferences model
- Link 1:1 with ADMIN user
- Implement lazy default creation

**Rules**:
- No reuse of StudentPreferences
- No UI coupling

**Verification**:
- Preferences can be created, read, updated via backend

---

### P3 — Notification Context Refactor

**Objective**: Support ADMIN-originated system notifications.

**Tasks**:
- Abstract notification context resolution
- Preserve Enrollment-based notifications
- Enable system context

**Rules**:
- No enum breaking without fallback

**Verification**:
- Existing notifications still function

---

### P4 — Backward Compatibility Validation

**Objective**: Guarantee zero regressions.

**Tasks**:
- Regression test existing flows
- Validate schema compatibility

**Verification**:
- No runtime errors
- No data corruption

---

### P5 — Final Verification & Sign-off

**Objective**: Prove Phase 4.1 readiness.

**Tasks**:
- Produce Phase 4.1 Verification Report
- Explicitly confirm:
  - No UI changes
  - No route changes
  - Infra is ready for Phase 4 UI

---

## 4. Halt Conditions (MANDATORY)

STOP execution immediately if:

- Schema change risks breaking existing rows
- Announcement semantics become ambiguous
- Notification routing becomes unclear
- UI work is required to proceed

Ask for clarification. DO NOT GUESS.

---

## 5. Completion Criteria (Definition of Done)

Phase 4.1 is COMPLETE only when:

- System announcements are representable
- Admin preferences persist safely
- Notification infra supports ADMIN context
- PEMBINA & SISWA features are unaffected
- No UI/routes were added
- Verification report confirms readiness

---

## END OF MISSION SDD

