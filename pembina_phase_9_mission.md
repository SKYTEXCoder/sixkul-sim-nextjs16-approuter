# PEMBINA Phase 9 — Mission Plan (Execution Contract)

## Referenced Contract — Global Navigation Contract

All routing decisions must comply with the Global Navigation Contract.

---

## 0. Mission Objective

Complete PEMBINA as a **personal, secure, production-ready user account** without introducing ADMIN scope or new ownership contexts.

---

## 1. Phase 9.1 — Notifications

### 9.1.1 Data Layer

Tasks:

- Create `src/lib/pembina-notification-data.ts`
- Implement:
  - `getPembinaNotifications(userId)`
  - `getUnreadNotificationCount(userId)`
  - `markNotificationAsRead(id)`
  - `markAllNotificationsAsRead(userId)`

Acceptance Criteria:

- Uses existing Notification model
- No schema changes

---

### 9.1.2 UI Integration

Tasks:

- Update `TopNavbar.tsx`
- Wire bell icon to dropdown panel
- Display unread badge count
- Implement click-to-redirect behavior

Acceptance Criteria:

- No new routes created
- All links target existing pages

---

## 2. Phase 9.2 — Profil Saya

### 9.2.1 Data Layer

Tasks:

- Create `src/lib/pembina-profile-data.ts`
- Implement:
  - `getPembinaProfile(userId)`
  - `updatePembinaProfile(userId, data)`

---

### 9.2.2 Page Implementation

Tasks:

- Create `/pembina/profile/page.tsx`
- Render profile view
- Implement edit form with validation

Acceptance Criteria:

- User can edit only own profile
- Changes persist correctly

---

## 3. Phase 9.3 — Account Settings

### 9.3.1 Page Implementation

Tasks:

- Create `/pembina/settings/page.tsx`
- Integrate Clerk password change / reset flows

Acceptance Criteria:

- No Prisma writes
- All security handled by Clerk

---

## 4. Phase 9.4 — Navigation Update

Tasks:

- Update PEMBINA sidebar
- Add:
  - Profil Saya
  - Pengaturan

Acceptance Criteria:

- Global Navigation Contract preserved

---

## 5. Phase 9.5 — Verification

Tasks:

- Trigger notification via enrollment request
- Verify bell badge updates
- Verify profile edit persistence
- Verify password change via Clerk

---

## 6. Execution Rules

- Do not introduce new routes for notifications
- Do not modify domain workflows
- Halt on ambiguity and request clarification.
