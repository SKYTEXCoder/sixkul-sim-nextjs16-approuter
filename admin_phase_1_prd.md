# ADMIN Phase 1 — Product Requirements Document (PRD)

## Referenced Contracts & Artifacts

- Global Navigation Contract
- SIXKUL SIM Final Project Report
- Database Technical Documentation
- schema.prisma (latest)
- seed.ts (latest)

---

## 1. Purpose

This document defines **ADMIN Phase 1** for the SIXKUL Extracurricular Management & Information System.

ADMIN Phase 1 establishes **core system management capabilities** required to operate the platform safely and correctly, without encroaching on PEMBINA or SISWA operational workflows.

This phase focuses on:

- User account management (via Clerk + Prisma)
- Extracurricular lifecycle management
- Assignment of PEMBINA to extracurriculars

---

## 2. ADMIN Role Definition

### 2.1 Core Responsibilities

ADMIN users are responsible for **system-level configuration and governance**, including:

- Creating and managing user accounts
- Creating and managing extracurricular entities
- Assigning PEMBINA to extracurriculars
- Viewing high-level system summaries

### 2.2 Explicit Non-Responsibilities

ADMIN users must NOT:

- Input attendance
- Approve student enrollments
- Manage sessions or schedules day-to-day
- Perform PEMBINA operational tasks

---

## 3. Scope Definition

### IN SCOPE (Phase 1)

#### 3.1 User Management

- Create users via Clerk Backend API
- Persist users in Prisma with valid `clerk_id`
- Assign roles: ADMIN, PEMBINA, SISWA
- Edit non-auth profile fields (name, role, status)
- Deactivate users (soft disable)

#### 3.2 Extracurricular Management

- Create extracurriculars
- Edit extracurricular metadata
- Activate / archive extracurriculars

#### 3.3 PEMBINA Assignment

- Assign one or more PEMBINA users to an extracurricular
- Change PEMBINA assignment

---

### OUT OF SCOPE (Explicit)

- Attendance input or editing
- Enrollment approval
- Session or schedule management
- System-wide analytics or reports
- Notification management

---

## 4. Routing & Navigation

### 4.1 ADMIN Base Routes

```
/admin/dashboard
/admin/users
/admin/users/[id]
/admin/ekstrakurikuler
/admin/ekstrakurikuler/[id]
```

All routes must comply with the Global Navigation Contract.

---

## 5. User Management Requirements

### 5.1 User Creation (Critical)

Flow:

1. ADMIN submits user creation form
2. System calls Clerk Backend API to create user
3. Clerk returns valid `clerk_id`
4. System persists User in Prisma linked to `clerk_id`

This flow is **mandatory** and non-negotiable.

---

### 5.2 User Editing

Editable fields:

- Display name
- Role
- Status (active / inactive)

Non-editable fields:

- Password
- Authentication credentials

---

## 6. Extracurricular Management Requirements

ADMIN may:

- Create new extracurriculars
- Edit name, description, category
- Archive (soft delete) extracurriculars

ADMIN may NOT:

- Manage sessions
- Manage attendance

---

## 7. PEMBINA Assignment Rules

- An extracurricular must have at least one PEMBINA
- PEMBINA assignment is explicit and auditable
- Reassignment does not delete historical data

---

## 8. Success Criteria

ADMIN Phase 1 is complete when:

- Users are created with valid Clerk identities
- No placeholder `clerk_id` exists
- Extracurriculars can be fully managed
- PEMBINA assignment works end-to-end
- No PEMBINA or SISWA workflows are affected

---

## 9. SDD Enforcement

Any ambiguity during implementation must cause execution to halt and request clarification.
