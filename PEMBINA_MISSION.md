# PEMBINA MVP — Mission Plan (Execution Contract)

## Referenced Contract — Global Navigation Contract

All routing decisions must comply with the Global Navigation Contract.

---

## 0. Mission Objective

Deliver a **fully functional PEMBINA MVP** that:

- Is structurally compliant with the Global Navigation Contract
- Contains no mock data or legacy navigation
- Uses Extracurricular as the sole PEMBINA context anchor
- Implements session-based attendance and explicit enrollment approval

This mission is designed for **Agentic IDE execution** with human approval gates.

---

## 1. Phase 0 — Structural Safety & Contract Repair (MANDATORY FIRST)

### 1.1 Remove Forbidden Navigation

Tasks:

- Remove all non-contract PEMBINA routes from navigation:
  - `/pembina/my-ekskul`
  - `/pembina/members`
  - `/pembina/schedule`
  - `/pembina/reports`
  - `/pembina/profile`

Acceptance Criteria:

- No PEMBINA link points to a non-contract route
- Sidebar contains only:
  - Dashboard
  - Ekstrakurikuler Saya → `/pembina/ekstrakurikuler`

---

### 1.2 Validate Middleware Enforcement

Tasks:

- Verify PEMBINA role enforcement in middleware
- Ensure unauthorized access redirects correctly

Acceptance Criteria:

- Non-PEMBINA cannot access `/pembina/*`
- PEMBINA cannot access student/admin routes

---

## 2. Phase 1 — Extracurricular Index (FOUNDATIONAL)

### 2.1 Implement `/pembina/ekstrakurikuler`

Tasks:

- Create page route
- Fetch extracurriculars owned by PEMBINA
- Render list with navigation to management hub

Acceptance Criteria:

- No mock data
- Ownership enforced by backend query

---

## 3. Phase 2 — Extracurricular Management Hub

### 3.1 Implement `/pembina/ekstrakurikuler/[id]`

Tasks:

- Ownership validation
- Load extracurricular metadata
- Render internal navigation

Acceptance Criteria:

- All sub-features accessible only via this hub

---

## 4. Phase 3 — Schedule Template Management

### 4.1 Implement Schedules Page

Route:

```
/pembina/ekstrakurikuler/[id]/schedules
```

Tasks:

- CRUD schedule templates
- Prevent deletion if sessions exist

Acceptance Criteria:

- Schedule templates persist correctly
- Guards enforced

---

## 5. Phase 4 — Session Management

### 5.1 Implement Sessions Page

Route:

```
/pembina/ekstrakurikuler/[id]/sessions
```

Tasks:

- List sessions
- Generate sessions from schedules

Acceptance Criteria:

- Sessions are concrete records
- No manual editing

---

## 6. Phase 5 — Attendance Refactor (Session-Based)

### 6.1 Refactor Attendance Flow

Route:

```
/pembina/ekstrakurikuler/[id]/attendance
```

Tasks:

- Replace schedule-based selection with session-based
- Ensure batch save uses session_id

Acceptance Criteria:

- Attendance cannot be saved without a session

---

## 7. Phase 6 — Enrollment Approval

### 7.1 Wire Approval Actions

Context:

```
/pembina/ekstrakurikuler/[id]
```

Tasks:

- Fetch PENDING enrollments
- Implement approve/reject actions

Acceptance Criteria:

- Enrollment transitions correctly
- Notifications triggered

---

## 8. Phase 7 — Announcement Management

### 8.1 Implement Announcements CRUD

Route:

```
/pembina/ekstrakurikuler/[id]/announcements
```

Tasks:

- Create, edit, delete announcements
- Scope visibility to enrolled students

Acceptance Criteria:

- Author-only edit/delete

---

## 9. Phase 8 — Verification & Proof

### 9.1 Walkthrough Artifact

Tasks:

- Provide navigation walkthrough
- Demonstrate:
  - Schedule → Session → Attendance
  - Enrollment approval

Acceptance Criteria:

- Video or screenshot proof

---

## 10. Completion Criteria

The mission is complete when:

- No PEMBINA mock data exists
- All routes comply with contract
- Attendance is session-based
- Enrollment approval is functional

---

## 11. Execution Rule

Agents must:

- Generate an Implementation Plan Artifact
- Wait for human approval before execution
- Halt on ambiguity
