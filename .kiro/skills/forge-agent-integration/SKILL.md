---
name: forge-agent-integration
description: Use when the user asks to add support for a new coding agent CLI (like Claude, Codex, OpenCode, Kiro, Antigravity) into forge, or to customize how an existing agent launches. Triggers on "add agent", "suporte ao agente X", "integração com <cli>", "new provider".
---

# Add a new agent integration

Upstream integrates each agent CLI as its own directory under `src/main/`
(e.g. `src/main/claude/`, `src/main/codex/`, `src/main/opencode/`). We follow
the identical pattern additively so future upstream work stays compatible.

## Procedure

1. **Study two existing adapters first.** Read the smallest and the largest:
   `src/main/codex/` (or `src/main/grok/`) for the minimal shape, and
   `src/main/claude/` for the full-featured shape (structured session adapter,
   prompt registry, background tasks). Note which upstream `src/shared/`
   contracts each one consumes (`agent-detection.ts`, agent CLI flag detection,
   hook endpoint files, completion time, headless command).
2. **Check upstream registries before creating new ones.** Some registration
   points are upstream-owned (detection lists, launch menus). If integration
   truly requires touching an upstream-owned registry file:
   - keep the diff to **append-only additions** (new entries, nothing moved
     or deleted),
   - log it in `FORGE-OVERRIDES.md`,
   - and flag it to the user as a low-risk-but-real merge point.
   If the registry cannot be extended append-only, stop and tell the user.
3. **Create `src/main/<agent-id>/`** with:
   - `<agent-id>-session-adapter.ts` (if the CLI has structured sessions)
   - `<agent-id>-launch.ts` / process spawn via `src/shared/child-process/`
   - co-located `.test.ts` for each
   - naming and test conventions exactly like sibling agent dirs
4. **Terminal readiness/status.** If you write rules that read what the agent
   paints on a terminal, capture a transcript first — see
   `docs/reference/agent-pty-transcript-capture.md`. Status writes go to the
   single hook-server store (`docs/reference/agent-status-store.md`); never
   add a parallel status store.
5. **Cross-cutting requirements** (non-negotiable): macOS/Linux/Windows,
   SSH-remote hosts, account/subscription handling in `<agent-id>-accounts/`
   style if relevant, and the agent must work inside worktrees *and* folder
   workspaces.

## Verify

```
pnpm tc
pnpm test src/main/<agent-id>
pnpm run check:code-quality:changed
```

Report to the user: adapter files created, upstream files touched (must be
zero, or append-only + logged), gates green, and what manual QA remains
(install the real CLI and run it once in a worktree).
