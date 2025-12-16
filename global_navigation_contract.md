# SIXKUL — GLOBAL NAVIGATION CONTRACT

**Authoritative · Role-Aware · Non-Negotiable**

This document defines the **only valid navigation targets** for all clickable elements in the SIXKUL system, across **Student (SISWA)**, **Pembina**, and **Admin** roles.

Any AI agent (including **Claude Opus 4.5**) **MUST follow this contract exactly**.
If a feature requirement appears to conflict with this contract, the agent **MUST STOP and consult the project owner**.

---

## 0. CORE PRINCIPLE (READ FIRST)

> **Routes are not pages. Routes represent OWNERSHIP CONTEXT.**

No entity may be accessed outside the context of its owner.

- Students never access raw management entities
- Pembina never access student-private views
- Admin never reuse student or pembina routes

---

## 1. DOMAIN OWNERSHIP MODEL (FOUNDATIONAL)

| Entity              | Owned By             | Accessed Through       |
| ------------------- | -------------------- | ---------------------- |
| Extracurricular     | School               | Role-specific context  |
| Enrollment          | Student              | Student-only routes    |
| Schedule (template) | Pembina              | Pembina-only routes    |
| Session (pertemuan) | Extracurricular      | Contextual routes only |
| Attendance          | Enrollment + Session | Enrollment context     |
| Announcement        | Extracurricular      | Role-filtered context  |

> ⚠️ **Sessions NEVER have standalone routes.**
> They are always accessed _through Enrollment (Student)_ or _Extracurricular (Pembina/Admin)_.

---

## 2. STUDENT (SISWA) NAVIGATION CONTRACT

### 2.1 Student Route Namespace

```text
/student/*
```

### 2.2 Allowed Student Pages

| User Intent               | Route                                           | Notes                    |
| ------------------------- | ----------------------------------------------- | ------------------------ |
| Browse extracurriculars   | `/student/ekstrakurikuler`                      | Discovery only           |
| View extracurricular info | `/student/ekstrakurikuler/[extracurricular_id]` | Non-personal             |
| View my enrollments       | `/student/enrollments`                          | Enrollment list          |
| View my activity          | `/student/enrollments/[enrollment_id]`          | **PRIMARY ACTIVITY HUB** |
| View my schedule          | `/student/schedule`                             | Aggregated sessions      |
| View my attendance        | `/student/attendance`                           | Optional global view     |
| View announcements        | `/student/announcements`                        | Optional global view     |

---

### 2.3 Canonical Student Rules (NON-NEGOTIABLE)

#### Rule S-1 — Enrollment Is the Student Context Anchor

Any click related to **sessions, attendance, announcements, or activity** MUST navigate to:

```text
/student/enrollments/[enrollment_id]
```

This includes:

- Jadwal Saya cards
- Dashboard “Jadwal Mendatang”
- Attendance rows
- Announcement links

---

#### Rule S-2 — Session Pages DO NOT EXIST for Students

🚫 Forbidden routes:

```text
/student/schedule/[id]
/student/sessions/[id]
```

Sessions are accessed **only** via enrollment context.

---

#### Rule S-3 — Extracurricular Discovery Is Non-Personal

```text
/student/ekstrakurikuler/[extracurricular_id]
```

This page:

- MAY show join status
- MUST NOT show attendance
- MUST NOT show student-specific data

---

## 3. PEMBINA NAVIGATION CONTRACT

### 3.1 Pembina Route Namespace

```text
/pembina/*
```

### 3.2 Allowed Pembina Pages

| Intent                   | Route                                         | Notes            |
| ------------------------ | --------------------------------------------- | ---------------- |
| View my extracurriculars | `/pembina/ekstrakurikuler`                    | Owned by pembina |
| Manage extracurricular   | `/pembina/ekstrakurikuler/[id]`               | Management hub   |
| Manage schedules         | `/pembina/ekstrakurikuler/[id]/schedules`     | Templates        |
| Manage sessions          | `/pembina/ekstrakurikuler/[id]/sessions`      | Concrete dates   |
| Manage attendance        | `/pembina/ekstrakurikuler/[id]/attendance`    | Session-based    |
| Manage announcements     | `/pembina/ekstrakurikuler/[id]/announcements` |                  |

---

### 3.3 Canonical Pembina Rules

#### Rule P-1 — Pembina Owns Schedules & Sessions

- Pembina manages:
  - Schedules (recurring rules)
  - Sessions (pertemuan)

- Pembina NEVER navigates through Enrollment

---

#### Rule P-2 — Pembina Never Uses Student Routes

🚫 Forbidden:

```text
/student/*
```

---

## 4. ADMIN NAVIGATION CONTRACT

### 4.1 Admin Route Namespace

```text
/admin/*
```

### 4.2 Allowed Admin Pages

| Intent                  | Route                                 |
| ----------------------- | ------------------------------------- |
| System dashboard        | `/admin/dashboard`                    |
| Manage users            | `/admin/users`                        |
| Manage extracurriculars | `/admin/ekstrakurikuler`              |
| View extracurricular    | `/admin/ekstrakurikuler/[id]`         |
| Assign pembina          | `/admin/ekstrakurikuler/[id]/pembina` |
| View schedules          | `/admin/schedules`                    |
| Audit attendance        | `/admin/attendance`                   |

---

### 4.3 Canonical Admin Rules

#### Rule A-1 — Admin Is Observational

- Admin views data **without student context**
- Admin NEVER navigates to enrollment pages

🚫 Forbidden:

```text
/student/*
/pembina/*
```

---

## 5. GLOBAL FORBIDDEN ROUTES

The following routes must **never exist**:

```text
/*/schedule/[id]
/*/session/[id]
/*/attendance/[id]
```

Reason:

- These entities are context-dependent
- Standalone routes break ownership semantics

---

## 6. AI AGENT COMPLIANCE RULE (CRITICAL)

Any Agentic AI IDE:

- MUST reference this contract before creating links
- MUST refactor existing links to comply
- MUST NOT invent routes
- MUST STOP and consult the project owner if:
  - a new feature seems to require a forbidden route
  - a route’s ownership is unclear

---

## 7. REQUIRED SDD INTEGRATION

This contract MUST be:

1. Included verbatim in:
   - the **main project SDD**
   - **every feature-specific SDD** under a section titled:

     > **Referenced Contract — Global Navigation Contract**

2. Explicitly referenced in AI instructions with the phrase:

> **“All routing decisions must comply with the Global Navigation Contract.”**

---

## END OF GLOBAL NAVIGATION CONTRACT
