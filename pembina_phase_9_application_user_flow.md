# PEMBINA Phase 9 — Application User Flow Specification

## Referenced Contract — Global Navigation Contract

All routing decisions must comply with the Global Navigation Contract.

---

## 1. Purpose

This document defines **user-facing flows** for Phase 9 features:

- Notifications
- Profil Saya
- Account Settings

No domain workflows are altered.

---

## 2. Notification Flow

### 2.1 Notification Creation

Trigger events:

- Student submits enrollment request
- Enrollment approved / rejected
- Sessions generated
- Announcement created

Flow:

1. System creates Notification record for PEMBINA
2. `is_read = false`
3. Notification becomes visible in bell dropdown

---

### 2.2 Notification Consumption

Flow:

1. PEMBINA clicks bell icon
2. Dropdown panel opens
3. Unread notifications are visually highlighted
4. PEMBINA clicks a notification
5. System marks notification as read
6. User is redirected to the referenced page

Constraints:

- No management actions inside dropdown
- No inline approvals

---

### 2.3 Mark-as-Read

- Individual notifications are marked read on click
- Optional "Mark all as read" action

---

## 3. Profil Saya Flow

### 3.1 View Profile

1. PEMBINA navigates to `/pembina/profile`
2. System fetches User + PembinaProfile
3. Profile data is rendered

---

### 3.2 Edit Profile

1. PEMBINA clicks "Edit"
2. Editable fields become active
3. PEMBINA submits changes
4. Server validates input
5. Prisma updates profile
6. Confirmation toast shown

Guards:

- User may only edit their own profile

---

## 4. Account Settings Flow

### 4.1 Access Settings

1. PEMBINA navigates to `/pembina/settings`
2. Clerk authentication context is loaded

---

### 4.2 Password Change / Reset

Flow:

1. PEMBINA initiates password change
2. Clerk handles verification
3. Clerk updates credentials
4. User remains authenticated or is re-authenticated

Constraints:

- No password data reaches Prisma

---

## 5. Flow Invariants

- Notifications never introduce new routes
- Profile changes affect only the current user
- Account settings are Clerk-only
- Global Navigation Contract is preserved

---

## 6. SDD Enforcement Note

Agents must halt on ambiguity and request human clarification.
