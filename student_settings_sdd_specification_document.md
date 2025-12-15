# SIXKUL — STUDENT SETTINGS (PENGATURAN SISWA)

## `/student/settings`

### **Specification-Driven Development (SDD)**

### **(FOR AGENTIC AI IDE — CLAUDE OPUS 4.5 (THINKING))**

---

## 0. EXECUTION MODE — ABSOLUTE CONTRACT

You are an **Agentic AI Software Development & Engineering Agent** running as **CLAUDE OPUS 4.5 (THINKING)**.

You are tasked with **fully implementing the STUDENT / SISWA “Pengaturan” (Settings) feature**, fully, completely, comprehensively, thoroughly, absolutely, and ultimately, end-to-end, in strict accordance with this specification.

### You **MUST**:

- Treat this document as a **binding contract**
- Implement **frontend + server-side data access** where applicable
- Use **Prisma ORM directly** (NO REST APIs)
- Use **React Server Components (RSC)** by default
- Use **Clerk Authentication** as the identity authority
- Respect the **Global Navigation Contract**
- Preserve all existing student features
- Implement **password management via Clerk**, not Prisma

### You **MUST NOT**:

- Invent features not explicitly specified
- Modify academic or enrollment data
- Store passwords in the database
- Break Clerk as the identity authority

### Mandatory Consultation Rule

If **ANY ambiguity, uncertainty, or architectural doubt** arises,
you **MUST STOP and consult the project owner (user)** before proceeding.

---

## 1. FEATURE INTENT

### Feature Name

**Pengaturan — Preferensi & Keamanan Akun**

### Route

```text
/student/settings
```

### User Role

```text
SISWA (STUDENT)
```

### Primary Question This Page Answers

> “How do I want this system to behave for me, and how do I manage the security of my account?”

This page is a **student-controlled preferences and security dashboard**.

---

## 2. FEATURE SCOPE OVERVIEW

This feature contains **two distinct but related domains**:

1. **User Preferences (stored in Prisma)**
2. **Account Security (handled exclusively by Clerk)**

No academic or administrative data is editable here.

---

## 3. DATA OWNERSHIP & SOURCES

### Identity & Security (AUTHORITATIVE)

**Clerk User** is the sole authority for:

- Password changes
- Password reset flows
- Authentication state
- Email ownership

### Preferences (NEW DATA MODEL)

**StudentPreferences (Prisma)** is the source of truth for:

- UI preferences
- Notification preferences
- Schedule display preferences

---

## 4. DATABASE MODEL (PRISMA)

### StudentPreferences

```prisma
model StudentPreferences {
  id                     String   @id @default(cuid())
  student_id              String   @unique

  // Appearance
  theme                  String   @default("system") // light | dark | system
  language               String   @default("id")     // id | en

  // Notifications
  notify_announcements   Boolean  @default(true)
  notify_schedule_changes Boolean @default(true)
  notify_attendance      Boolean  @default(true)

  // Schedule Preferences
  schedule_default_view  String   @default("date")   // date | extracurricular
  schedule_range_days    Int      @default(7)

  created_at             DateTime @default(now())
  updated_at             DateTime @updatedAt

  student StudentProfile @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@map("student_preferences")
}
```

Defaults MUST be created automatically if no record exists.

---

## 5. PAGE STRUCTURE (MANDATORY)

### 5.1 Page Header

**Title**

```text
Pengaturan
```

**Subtitle**

```text
Preferensi pribadi dan keamanan akun kamu
```

Sidebar item highlighted:

```text
Pengaturan
```

---

### 5.2 Section A — Appearance & Language

Controls:

- Theme selector: Light / Dark / System
- Language selector: Bahasa Indonesia / English

Behavior:

- Changes persist to Prisma
- Theme affects all dashboard pages

---

### 5.3 Section B — Notification Preferences

Controls (toggles):

- Pengumuman ekstrakurikuler
- Perubahan jadwal
- Status absensi

Notes:

- These settings **DO NOT send notifications**
- They only define behavior for future notification systems

---

### 5.4 Section C — Schedule Preferences

Controls:

- Default view (Tanggal / Ekstrakurikuler)
- Default range (7 / 14 / 30 days)

These preferences must be respected by:

- `/student/schedule`

---

### 5.5 Section D — Account Security (PASSWORD MANAGEMENT)

#### Password Change

Implementation:

- Provide a **Change Password** action
- Action MUST redirect to **Clerk-hosted password management**
- NO custom password UI or storage

Examples:

- Redirect to Clerk User Profile
- Or trigger Clerk password reset flow

#### Password Reset

- Allow triggering a password reset email
- Implemented via Clerk APIs

⚠️ Password logic MUST NEVER touch Prisma

---

## 6. SAVE STRATEGY

### Required Behavior

- Preference changes must persist immediately (auto-save)
- Show visual confirmation:

```text
Perubahan tersimpan
```

No global "Save" button.

---

## 7. ACCESS CONTROL

### Authentication

- Use Clerk `auth()`
- Redirect unauthenticated users to `/sign-in`

### Authorization

- Student may only edit their own preferences

---

## 8. NAVIGATION CONTRACT (STRICT)

Allowed:

- `/student/settings`

Forbidden:

- ❌ `/student/settings/password`
- ❌ `/student/settings/notifications`
- ❌ `/student/settings/*`

Single-page settings only.

---

## 9. EMPTY & ERROR STATES

### Missing Preferences Record

Behavior:

- Auto-create defaults
- Page still renders
- No blocking error

### Clerk Error

Show non-blocking error message and disable security actions.

---

## 10. SERVER-SIDE IMPLEMENTATION

### Page Location

```text
src/app/(dashboard)/student/settings/page.tsx
```

### Component Strategy

- Page: React Server Component
- Toggles/selectors: Client Components

### Data Flow

1. Authenticate user
2. Resolve StudentProfile
3. Fetch or create StudentPreferences
4. Render settings

---

## 11. ACCEPTANCE CRITERIA (PASS / FAIL)

Feature is COMPLETE only if:

- `/student/settings` renders without 404
- Preferences persist correctly
- Defaults auto-create
- Theme & schedule preferences affect behavior
- Password actions route through Clerk
- No academic data is editable
- Global Navigation Contract respected

---

## 12. GLOBAL PREFERENCE PROPAGATION (MANDATORY SYSTEM-WIDE REFRACTOR)

### ABSOLUTE REQUIREMENT

This feature is **NOT COMPLETE** unless **all existing student-facing pages** are refactored to **actively respect and consume StudentPreferences**.

Preferences are **NOT decorative**. They are **system-wide behavioral contracts**.

CLAUDE OPUS 4.5 (THINKING) MUST treat `StudentPreferences` as a **first-class dependency** across the student dashboard.

---

### 12.1 REQUIRED GLOBAL BEHAVIOR CHANGES

The following pages **MUST be audited and updated** to consume preferences:

#### Appearance & Language

Pages affected (minimum):

- `/student/dashboard`
- `/student/schedule`
- `/student/attendance`
- `/student/announcements`
- `/student/history`
- `/student/profile`

Required behavior:

- Theme preference (light/dark/system) must be applied globally.
- Language preference must control all labels, empty states, and system text.

---

### 12.2 SCHEDULE PREFERENCE INTEGRATION (MANDATORY)

Pages affected:

- `/student/schedule`

Required changes:

- Default grouping MUST respect `schedule_default_view`
- Default date range MUST respect `schedule_range_days`
- Manual user overrides MAY exist, but defaults come from preferences

---

### 12.3 NOTIFICATION PREFERENCE ENFORCEMENT

Even though notifications are not yet implemented:

- All future notification logic MUST consult:

  - `notify_announcements`
  - `notify_schedule_changes`
  - `notify_attendance`

Gemini MUST:

- Centralize preference access (helper or hook)
- Avoid hardcoded assumptions anywhere in student features

---

### 12.4 IMPLEMENTATION STRATEGY (REQUIRED)

CLAUDE OPUS 4.5 (THINKING) MUST:

- Introduce a shared preference resolver (server-side)
- Pass preferences into RSC pages as needed
- Use client context ONLY where unavoidable
- Avoid duplicating preference-fetch logic

If any existing student page **ignores preferences**, the task is **DEEMED AS FAILED**.

---

## END OF SPECIFICATION

CLAUDE OPUS 4.5 (THINKING) MUST implement everything above **exactly**,
and MUST consult the project owner if **any uncertainty** arises.
