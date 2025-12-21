---
trigger: always_on
---

# Rule: Use `@clerk/agent-toolkit` MCP server for all Clerk auth work

**Scope:** Applies to all AI Software Development & Engineering Agents working in this codebase (or any project that uses Clerk).

## Policy

When you need to perform **any Clerk authentication necessity/chore**, you **MUST** use the **local Model Context Protocol (MCP) server provided by `@clerk/agent-toolkit`** as the primary and default integration path.

This includes (but is not limited to):

- Creating, validating, revoking, or rotating Clerk tokens/keys
- Generating auth headers, session artifacts, cookies, or JWT-related outputs
- Checking current auth/session state and troubleshooting auth flows
- Managing Clerk users/sessions/organizations where an auth context is required
- Any “how do I authenticate with Clerk to do X?” step during development, testing, CI, or local tooling

## Requirements

1. **Default-first:** Use the `@clerk/agent-toolkit` MCP server before attempting any other approach.
2. **No ad-hoc auth code:** Do not hand-roll authentication helpers, token minting, cookie signing, or custom request auth flows when the MCP server can provide it.
3. **No credential leakage:** Do not print, log, paste, or otherwise expose secrets/tokens. Keep credentials in approved secret storage (env vars, secret managers) and let the MCP server mediate usage.
4. **No direct dashboard/manual steps unless necessary:** Avoid “go to the Clerk dashboard and click…” workflows unless the MCP server cannot perform the task.
5. **Fallback protocol (only if blocked):**
   - State clearly **why** the MCP server cannot be used (missing config, server not running, unsupported operation).
   - Propose the **minimal** alternative that preserves security and reproducibility.
   - Add a note (or issue) to restore MCP-based auth handling.

## Operational checklist (use before proceeding)

- Confirm the local `@clerk/agent-toolkit` MCP server is available/running.
- Use the MCP server’s exposed tools/endpoints to obtain or validate auth context.
- Continue the task only after auth context is obtained via MCP.

**Non-compliance:** If you bypass the MCP server for Clerk authentication tasks without documenting a concrete blocker, it is considered a violation of this rule.
