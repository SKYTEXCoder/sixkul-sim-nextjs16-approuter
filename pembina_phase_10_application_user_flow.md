# PEMBINA Phase 10 — Dashboard Application Flow

## Referenced Contract

- Global Navigation Contract

---

## 1. Purpose

This document defines the **user interaction flow** for the finalized PEMBINA dashboard.

The dashboard is **read-only** and acts as an **administrative launchpad**.

---

## 2. Dashboard Entry Flow

1. PEMBINA authenticates via Clerk
2. Role-based middleware validates PEMBINA role
3. User is routed to:

```
/pembina/dashboard
```

---

## 3. Data Loading Flow

### 3.1 Server-Side Data Fetch

On page load:

- Fetch all extracurriculars owned by PEMBINA
- Aggregate derived metrics:
  - total extracurricular count
  - total active enrollments
  - pending enrollment count
  - upcoming sessions (date-based)

---

### 3.2 Rendering Rules

- All sections render real data
- Empty states shown if data is missing
- Skeleton loaders allowed

---

## 4. Interaction Flow (CTAs)

### 4.1 Summary Card Interaction

Flow:

1. PEMBINA clicks summary card
2. System redirects to:
   - `/pembina/ekstrakurikuler`
   - or `/pembina/ekstrakurikuler/[id]`

3. No state mutation occurs

---

### 4.2 Ekstrakurikuler List Interaction

Flow:

1. PEMBINA clicks an extracurricular card
2. Redirect to:

```
/pembina/ekstrakurikuler/[id]
```

---

### 4.3 Shortcut Button Interaction

Flow:

1. PEMBINA clicks CTA
2. Redirect to existing management page

---

## 5. Forbidden Flows

- Approving enrollments from dashboard
- Editing schedules from dashboard
- Inputting attendance from dashboard
- Creating announcements from dashboard

Any such interaction is invalid.

---

## 6. Flow Invariants

- Dashboard never mutates domain state
- Dashboard never bypasses extracurricular context
- Dashboard never introduces new routes

---

## 7. Specification-Driven Development (SDD) Enforcement

If ambiguity arises during implementation, execution must halt and request clarification.
