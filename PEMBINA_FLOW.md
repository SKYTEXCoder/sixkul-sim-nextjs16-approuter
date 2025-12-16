# PEMBINA MVP — Application Flow Specification

## Referenced Contract — Global Navigation Contract

All routing decisions must comply with the Global Navigation Contract.

---

## 1. Purpose

This document defines the **end-to-end application flow** for the **PEMBINA MVP**. It describes **how a PEMBINA user moves through the system**, how state transitions occur, and how data authority is enforced.

This is a **behavioral specification**, not a UI mock or implementation guide.

---

## 2. Canonical PEMBINA Entry Flow

### 2.1 Authentication & Routing

1. User authenticates via Clerk
2. Middleware validates role = `PEMBINA`
3. User is routed to:

```
/pembina/dashboard
```

Constraints:

- Dashboard is informational only
- No management actions are performed here

---

## 3. Primary PEMBINA Journey (Happy Path)

### Step 1 — View Owned Extracurriculars

**Route:** `/pembina/ekstrakurikuler`

Flow:

1. System queries extracurriculars where `pembina_id = currentPembina`
2. List is rendered (no mock data)
3. PEMBINA selects one extracurricular

Result:

- Context is now locked to a single extracurricular

---

### Step 2 — Enter Extracurricular Management Hub

**Route:** `/pembina/ekstrakurikuler/[extracurricular_id]`

Flow:

1. System validates ownership (pembina_id match)
2. Hub page loads metadata + summary counts
3. Internal navigation becomes available:

   - Schedules
   - Sessions
   - Attendance
   - Announcements
   - Enrollment Requests

Constraint:

- All subsequent actions remain scoped to this `extracurricular_id`

---

## 4. Schedule → Session → Attendance Flow

### 4.1 Schedule Template Management

**Route:** `/pembina/ekstrakurikuler/[id]/schedules`

Flow:

1. PEMBINA views existing schedule templates
2. PEMBINA creates or edits a schedule template

   - day_of_week
   - start_time
   - end_time
   - location

3. System persists template

Guards:

- Delete disabled if sessions exist

---

### 4.2 Session Generation & Listing

**Route:** `/pembina/ekstrakurikuler/[id]/sessions`

Flow:

1. PEMBINA views list of sessions

   - upcoming
   - past

2. PEMBINA triggers session generation
3. System generates concrete session records from schedules

Guards:

- No manual session editing
- No deletion if attendance exists

---

### 4.3 Attendance Input (Session-Based)

**Route:** `/pembina/ekstrakurikuler/[id]/attendance`

Flow:

1. PEMBINA selects a session
2. System fetches ACTIVE enrollments
3. Attendance grid is rendered
4. PEMBINA records attendance
5. Batch save is executed

Constraints:

- Attendance must reference a session
- Schedule-based attendance selection is forbidden

---

## 5. Enrollment Approval Flow

### 5.1 View Enrollment Requests

**Context:** `/pembina/ekstrakurikuler/[id]`

Flow:

1. System fetches enrollments with status = `PENDING`
2. List is rendered

---

### 5.2 Approve / Reject Enrollment

Flow:

1. PEMBINA selects Approve or Reject
2. System validates ownership
3. Enrollment status transitions:

   - `PENDING → ACTIVE`
   - `PENDING → REJECTED`

4. Notifications are generated

Constraints:

- No bulk approval
- No auto-approval

---

## 6. Announcement Management Flow

**Route:** `/pembina/ekstrakurikuler/[id]/announcements`

Flow:

1. PEMBINA views announcements
2. PEMBINA creates announcement
3. System persists with `author_id`
4. Announcement becomes visible to enrolled students only

Guards:

- PEMBINA may edit/delete own announcements only

---

## 7. Error & Guard Flows

### 7.1 Unauthorized Access

- If `pembina_id` mismatch → redirect to `/unauthorized`

### 7.2 Invalid State Transitions

- Editing past sessions with attendance → blocked
- Deleting schedules with sessions → blocked

### 7.3 Empty States

- No extracurriculars → show instructional empty state
- No schedules → prompt to create schedule
- No sessions → prompt to generate sessions

---

## 8. Flow Invariants (Must Always Hold)

- PEMBINA never navigates through enrollment context
- Sessions are the only valid attendance anchor
- All management flows require extracurricular context
- Navigation never violates the Global Navigation Contract

---

## 9. SDD Execution Note

This flow specification is **binding**.
Agents must halt on ambiguity and request human clarification.
