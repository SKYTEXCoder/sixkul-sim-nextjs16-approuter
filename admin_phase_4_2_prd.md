# ADMIN Phase 4.2 — Product Requirements Document (PRD)

## Document Authority

**Project**: SIXKUL — Sistem Informasi Ekstrakurikuler  
**Role**: ADMIN  
**Phase**: Phase 4.2 — Core Account & Communication (UI + UX)  
**Methodology**: Specification-Driven Development (SDD)

> 🔴 **ABSOLUTE REQUIREMENT**  
> Every feature defined in this PRD MUST be implemented **fully, completely, comprehensively, and end‑to‑end**, such that it is **directly usable by real human ADMIN users via the browser UI**, without developer tools, mock data, or manual database intervention.

---

## 1. Purpose & Rationale

ADMIN Phase 4.2 delivers the **final missing end‑user capabilities** for the ADMIN role:

1. **System-wide Announcements (Pengumuman Admin)**  
2. **Admin Profile (Profil Saya)**  
3. **Admin Settings (Pengaturan)**

These features are explicitly required to:
- Complete the ADMIN user experience
- Enable real administrative communication
- Allow admins to manage their own account safely

Phase 4.2 builds **only on infrastructure finalized in Phase 4.1** and introduces **no new backend concepts**.

---

## 2. Scope Definition

### 2.1 In-Scope Features

#### A. System-Wide Announcements (Pengumuman Sekolah)
- Announcements created by **ADMIN** and broadcast to **ALL roles**:
  - ADMIN
  - PEMBINA
  - SISWA
- Announcements are classified as `SYSTEM` scope (per Phase 4.1 infrastructure)
- ADMIN has full CRUD capability
- PEMBINA & SISWA have **read-only access**
- Announcements are delivered via:
  - Announcement listing pages
  - In-app notifications (where applicable)

#### B. Admin Profile (Profil Saya)
- Display authenticated ADMIN identity information
- Safe editable fields (explicitly defined)
- Non-editable identity fields clearly marked

#### C. Admin Settings (Pengaturan)
- Theme preference (light / dark / system)
- Password change / reset via Clerk
- Session & security actions (logout)

---

### 2.2 Explicitly Out of Scope

🚫 Hak Akses / Permissions management  
🚫 Data Sekolah management  
🚫 Role editing  
🚫 User impersonation  
🚫 Cross-role profile editing

---

## 3. User Personas

### ADMIN (Primary)

- School staff with full system responsibility
- Uses system daily or weekly
- Non-technical
- Expects clarity, safety, and predictability

---

## 4. Functional Requirements

### FR-1 — Admin Announcements (Pengumuman)

**Description**  
Admins MUST be able to manage system-wide announcements end-to-end.

**Capabilities**
- View list of system announcements
- Create new announcement
- Edit existing announcement
- Delete announcement with confirmation

**Constraints**
- Only SYSTEM announcements allowed
- Only ADMIN role can access

**Acceptance Criteria**
- Announcement appears immediately after creation
- Edited content persists
- Deleted announcements are no longer visible
- No extracurricular context is required

---

### FR-2 — Announcement UX Quality

**Requirements**
- Clear empty state when no announcements exist
- Confirmation dialog on delete
- Timestamp and author visibility

---

### FR-3 — Admin Profile (Profil Saya)

**Description**  
Admins MUST be able to view and manage their own profile safely.

**Displayed Fields**
- Name (from Clerk)
- Email (from Clerk)
- Role (ADMIN, read-only)

**Editable Fields**
- (Optional) Display name, if supported

**Constraints**
- No editing of role or identity-critical fields

---

### FR-4 — Admin Settings (Pengaturan)

**Description**  
Admins MUST be able to manage account-level settings.

**Capabilities**
- Change theme preference
- Change password via Clerk flow
- Logout securely

**Acceptance Criteria**
- Theme persists across sessions
- Password reset flow works end-to-end
- Logout invalidates session

---

## 5. UX & Usability Requirements (Non-Negotiable)

- No dead links or 404 pages
- No placeholder UI
- Clear navigation paths
- All actions provide feedback
- Accessible via mouse & keyboard

---

## 6. Security Requirements

- All routes are ADMIN-only
- All mutations require authenticated ADMIN
- No sensitive data exposed in client

---

## 7. Technical Constraints

- Must use existing Phase 4.1 backend infrastructure
- Must comply with Global Navigation Contract
- Must use Clerk for authentication flows
- No schema changes allowed in Phase 4.2

---

## 8. Success Metrics (Definition of Done)

Phase 4.2 is COMPLETE when:

- ADMIN can fully manage announcements via UI
- ADMIN can view profile and manage settings
- All features work end-to-end via browser
- No mock data exists
- No broken navigation exists
- Manual usability walkthrough passes

---

## 9. Dependencies

- Phase 4.1 infrastructure MUST be complete
- Clerk Authentication MUST be operational

---

## 10. Handoff

Completion of Phase 4.2 marks:

> 🏁 **FULL FUNCTIONAL COMPLETION OF THE ADMIN ROLE IN SIXKUL**

Any future work is considered enhancement, not requirement.

---

## END OF PRD

