# 📄 ADMIN Phase 4.1 — Product Requirements Document (PRD)

## Document Purpose

This PRD defines **ADMIN Phase 4.1**, a **foundational backend & infrastructure phase** required before implementing any ADMIN-facing UI for:

- Pengumuman (Announcements)
- Profil Saya (Profile)
- Pengaturan (Settings)

This phase **MUST be completed** before ADMIN Phase 4 UI development begins.

---

## 1. Problem Statement

The current SIXKUL system cannot correctly support **ADMIN-level announcements, settings, and profile features** due to **schema rigidity and missing infrastructure abstractions**.

Attempting to implement ADMIN Phase 4 UI without addressing these constraints would introduce:

- Data model violations
- Semantic inconsistencies
- Long-term technical debt

---

## 2. Scope Definition (CRITICAL)

### 2.1 In-Scope (Phase 4.1)

This phase includes **ONLY**:

1. Announcement system infrastructure changes (schema + data access)
2. ADMIN preferences data model
3. Notification system abstraction to support ADMIN context
4. Backward-compatible migrations and validations

### 2.2 Explicitly Out of Scope

🚫 No UI pages
🚫 No route creation
🚫 No dashboard widgets
🚫 No visual styling
🚫 No new features beyond infrastructure

> Any UI implementation is **forbidden** in Phase 4.1.

---

## 3. User Roles

| Role    | Involvement                         |
| ------- | ----------------------------------- |
| ADMIN   | Indirect (future consumer of infra) |
| PEMBINA | Must remain fully functional        |
| SISWA   | Must remain fully functional        |

---

## 4. Functional Requirements (Atomic & Testable)

### FR-1 — Announcement System Must Support System-Level Announcements

**Requirement**
The system MUST support announcements that are **not tied to an Extracurricular**.

**Acceptance Criteria**

- Announcement records may exist **without `extracurricular_id`**
- Existing extracurricular announcements continue to work unchanged
- No fake or placeholder extracurriculars are introduced

---

### FR-2 — Announcement Target Semantics Must Be Explicit

**Requirement**
Each announcement MUST have a clearly defined **scope**.

**Acceptance Criteria**

- Announcement scope is machine-interpretable
- Scope MUST distinguish between:
  - Extracurricular-scoped announcements
  - System / Admin announcements

- Queries MUST filter announcements correctly by scope

---

### FR-3 — Admin Preferences Must Be Persistable

**Requirement**
ADMIN users MUST have a dedicated preferences data model.

**Acceptance Criteria**

- Preferences are stored independently of StudentPreferences
- Preferences are linked 1-to-1 with ADMIN users
- Defaults are created lazily (on first access)
- No settings are hardcoded in UI

---

### FR-4 — Notification Infrastructure Must Support ADMIN Context

**Requirement**
The notification system MUST support ADMIN-originated system notifications.

**Acceptance Criteria**

- Notifications are not hard-wired to Enrollment context
- Existing notification flows for SISWA and PEMBINA remain unaffected
- Routing metadata supports ADMIN destinations (future use)

---

### FR-5 — Backward Compatibility Is Mandatory

**Requirement**
No existing functionality may break.

**Acceptance Criteria**

- All PEMBINA announcements still resolve correctly
- Student notifications still function
- Existing database rows remain valid
- No destructive migration is allowed

---

## 5. Data & Schema Requirements

### 5.1 Announcement Model

The system MUST evolve to support **dual-context announcements**:

- Extracurricular-scoped (existing behavior)
- System-scoped (ADMIN)

**Non-Negotiable Rules**

- No dummy foreign keys
- No ambiguous ownership
- Semantics must be enforceable in code

---

### 5.2 Admin Preferences Model

A new model MUST exist to persist ADMIN settings.

**Minimum Fields**

- user_id (ADMIN)
- theme (light / dark / system)
- notification toggles (future-proofed)

---

### 5.3 Notification Model

The notification model MUST allow:

- Context-agnostic notifications
- ADMIN-level routing metadata

No breaking changes to existing enums are allowed without justification.

---

## 6. Non-Functional Requirements

### NFR-1 — Security

- All ADMIN data access must be role-guarded
- No preference or notification data may be writable by other roles

### NFR-2 — Migration Safety

- Migrations must be additive or nullable
- Zero production-breaking changes

### NFR-3 — Performance

- Announcement queries must remain index-friendly
- No N+1 patterns introduced

---

## 7. Constraints & Invariants

- Clerk remains the **single source of truth** for authentication
- Prisma remains the ORM
- PostgreSQL remains the database
- Global Navigation Contract MUST NOT be violated
- Phase 4.1 MUST NOT introduce routes

---

## 8. Success Criteria (Definition of Done)

Phase 4.1 is considered **COMPLETE** when:

- ✅ System-level announcements are representable in the database
- ✅ ADMIN preferences can be created, read, updated via backend
- ✅ Notification infrastructure supports ADMIN context
- ✅ No existing feature regresses
- ✅ Zero UI or route changes are introduced
- ✅ A verification report confirms all above points

---

## 9. Handoff to Phase 4.2

Phase 4.2 (ADMIN UI: Pengumuman, Profil Saya, Pengaturan) may **ONLY** begin after:

- This PRD is fully implemented
- A verification walkthrough confirms infra readiness
- No TODOs remain in Phase 4.1 scope

---

## END OF DOCUMENT

---
