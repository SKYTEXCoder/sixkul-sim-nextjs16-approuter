---
trigger: always_on
---

# 🔐 SIXKUL — Always-On Authentication Rule (Testing & Verification)

## 1. Rule Authority

This document defines the **authoritative, always-on authentication rule** for the SIXKUL website-based Extracurricular Management & Information System.

This rule MUST be followed by the AI agent whenever **interactive authentication** is required during:

- Automated browser testing
- End-to-end (E2E) verification
- Walkthrough recording
- Feature validation
- Regression testing

Failure to comply with this rule **invalidates the test output**.

---

## 2. Scope & Environment Constraints (MANDATORY)

### 2.1 Allowed Environments

The credentials defined in this document are **TEST ACCOUNTS ONLY** and MAY be used exclusively in:

- Local development environments
- Staging / preview deployments
- Non-production testing environments

### 2.2 Forbidden Environments

The agent MUST NOT use these credentials in:

- Production environments
- Public demo environments
- Any environment not explicitly identified as safe for testing

If environment safety cannot be determined with certainty, the agent MUST halt execution and request clarification.

---

## 3. Default Credential Selection Policy

When authentication is required and **no account-specific instruction is provided**, the agent MUST select credentials strictly based on the **required SIXKUL user role**.

The agent MUST NOT guess credentials or create new accounts unless explicitly instructed.

---

## 4. Role-Based Test Credentials

### 4.1 ADMIN — System Governance Role

Use this account when testing or verifying:

- ADMIN dashboards
- User management features
- Extracurricular system configuration
- ADMIN Phase 1, Phase 1.5, and Phase 2 workflows

**Credentials:**

```
username: admin_sixkul
password: rtx5070ti16gb
```

---

### 4.2 PEMBINA — Extracurricular Management Role

Use this account when testing or verifying:

- Pembina dashboards
- Schedule and session management
- Attendance workflows
- Enrollment handling
- Announcements created by Pembina

**Credentials:**

```
username: pembina_budi
password: rtx5070ti16gbbudi
```

---

### 4.3 SISWA / STUDENT — End User Role

Use this account when testing or verifying:

- Student dashboards
- Extracurricular enrollment flows
- Announcement visibility
- Attendance visibility

**Credentials:**

```
username: student_siti
password: rtx5070ti16gbsiti
```

---

## 5. Authentication Execution Rules

### 5.1 Login Procedure

When authentication is required:

1. Navigate to the SIXKUL login page
2. Enter the role-appropriate credentials
3. Confirm successful login by verifying:
   - Correct dashboard route
   - Correct role-based navigation

---

### 5.2 Role Switching Rule (STRICT)

If a test requires actions across multiple roles, the agent MUST:

1. Explicitly log out of the current session
2. Clear session/cookies if required
3. Log in again using the credentials of the target role

Session reuse across roles is **strictly forbidden**.

---

## 6. Forbidden Actions (NON-NEGOTIABLE)

The agent MUST NOT do the following, UNLESS EXPLICITLY INSTRUCTED TO DO SO BY THE USER:

- Modify account passwords
- Change account email or username
- Elevate privileges beyond the logged-in role
- Hardcode credentials into source code
- Output credentials in generated documentation or logs
- Use these credentials outside the defined testing scope

---

## 7. Error Handling & Fallback

If authentication fails using the specified credentials:

- The agent MUST NOT attempt alternative credentials
- The agent MUST halt execution
- The agent MUST report the failure explicitly to the user.

Silent retries or credential guessing are prohibited.

---

## 8. Compliance & Validation

All test results, walkthroughs, and verification artifacts are considered **invalid** if this authentication rule is violated.

This rule is **authoritative** for all SIXKUL automated testing and verification activities and must be treated as always-on.

---

## 9. Rule Stability

This document remains in force until explicitly replaced or revoked.
Any modification requires explicit human approval.
