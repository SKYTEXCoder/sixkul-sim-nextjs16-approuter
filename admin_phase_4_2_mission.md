# ADMIN Phase 4.2 — Mission SDD (Execution Contract)

## Document Authority

This Mission SDD is **authoritative and binding** for **ADMIN Phase 4.2**.

Phase 4.2 delivers the **final end-user completion** of the ADMIN role in SIXKUL, covering:
- System-wide Announcements (Pengumuman Sekolah)
- Admin Profile (Profil Saya)
- Admin Settings (Pengaturan)

All features MUST be **fully usable end-to-end via the browser UI** by real human users.

---

## 0. Absolute Laws (Non-Negotiable)

1. End-to-end usability is mandatory (UI → Server → DB → UI)
2. No placeholder UI, mock data, or disabled actions
3. Role boundaries MUST be enforced strictly
4. Phase 4.1 infrastructure MUST be used as-is
5. Any ambiguity requires HALT and clarification

Violation of any law is automatic rejection.

---

## 1. Phase 4.2 Objectives

Phase 4.2 exists to:

- Enable ADMIN to broadcast system-wide announcements
- Allow PEMBINA & SISWA to consume announcements read-only
- Allow ADMIN to manage their profile safely
- Allow ADMIN to manage account settings securely

This phase completes the ADMIN role from an end-user perspective.

---

## 2. Mandatory Deliverables

### 2.1 User-Facing Pages

- `/admin/announcements`
- `/admin/profile`
- `/admin/settings`
- `/pembina/announcements` (read-only)
- `/student/announcements` (read-only)

### 2.2 System Components

- Announcement CRUD UI (ADMIN)
- Announcement read-only UI (PEMBINA & SISWA)
- Notification triggering & routing
- Profile display components
- Settings management components

---

## 3. Execution Phases (STRICT ORDER)

### P1 — Navigation & Route Wiring

**Objective**: Expose correct entry points without breaking navigation.

**Tasks**:
- Add "Pengumuman" to ADMIN sidebar
- Ensure PEMBINA & SISWA have access to announcements entry points
- Add profile & settings access via avatar menu

**Rules**:
- No dead links
- No 404 routes

---

### P2 — Admin Announcements UI (CRUD)

**Objective**: Enable ADMIN to manage SYSTEM announcements.

**Tasks**:
- Implement announcement list
- Implement create announcement form
- Implement edit flow
- Implement delete with confirmation

**Rules**:
- Use admin-announcement-data.ts exclusively
- Enforce ADMIN auth at every mutation

**Verification**:
- Create → visible immediately
- Edit → persists
- Delete → removed

---

### P3 — Announcement Consumption (PEMBINA & SISWA)

**Objective**: Allow all users to read system announcements.

**Tasks**:
- Implement read-only announcement pages
- Remove all mutation controls

**Verification**:
- Non-admin cannot create/edit/delete

---

### P4 — Notification Integration

**Objective**: Ensure announcements notify all roles.

**Tasks**:
- Trigger notifications on announcement creation
- Route notification click to announcement detail

**Verification**:
- Notification badge increments
- Click-through works

---

### P5 — Admin Profile UI

**Objective**: Display ADMIN profile safely.

**Tasks**:
- Display Clerk-backed identity fields
- Clearly mark read-only vs editable

**Rules**:
- No role editing

---

### P6 — Admin Settings UI

**Objective**: Enable account-level configuration.

**Tasks**:
- Theme selection (persisted)
- Password reset via Clerk
- Logout action

**Verification**:
- Theme persists across refresh
- Password reset flow opens correctly
- Logout invalidates session

---

### P7 — UX Hardening

**Objective**: Ensure real-world usability.

**Tasks**:
- Loading states
- Empty states
- Error feedback

---

### P8 — End-to-End Verification (MANDATORY)

**Required Browser Walkthrough**:

1. Login as ADMIN
2. Create system announcement
3. Verify notification appears
4. Login as PEMBINA → read announcement
5. Login as SISWA → read announcement
6. Open profile & settings
7. Change theme → refresh
8. Trigger password reset
9. Logout

All steps MUST succeed.

---

## 4. Completion Criteria (Definition of Done)

Phase 4.2 is COMPLETE only when:

- ADMIN can manage announcements end-to-end
- PEMBINA & SISWA can read announcements
- Notifications function correctly
- Profile & settings are usable
- No broken navigation exists

---

## 5. Halt Conditions

STOP execution if:

- Phase 4.1 infrastructure is bypassed
- Role boundaries are unclear
- UI requires new backend concepts

Ask for clarification. Do NOT assume.

---

## END OF MISSION SDD

