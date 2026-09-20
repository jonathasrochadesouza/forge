---
inclusion: always
---

# Forge Fork — Steering Rules

This project is **Forge**, a customized fork of [stablyai/orca](https://github.com/stablyai/orca) (MIT). Upstream ships daily. Our goal: reuse 100% of upstream, add features additively, sync forever.

Read `FORGE.md` at the project root for the full operating manual. The rules below are the non-negotiable subset.

## Golden Rules

1. **ADDITIVE-ONLY.** Never modify, rename, or delete a file that exists in `upstream-main`. Create new files instead. If a change seems to require editing an upstream file, check the Mutation Whitelist — if the file is not on it, find an additive way or ask the user.
2. **NEVER commit to `upstream-main`.** All work happens on `forge`. `upstream-main` is a read-only mirror of `upstream/main`.
3. **RECORD EVERY MUTATION.** If you touch a whitelisted upstream file, append a one-line entry to `FORGE-OVERRIDES.md` (file path + what changed + why).
4. **RESPECT UPSTREAM CONTRACTS.** Before touching wire protocol, agent status, SSH, worktrees, git, or cross-platform behavior, read the corresponding `docs/reference/*.md`.
5. **RUN THE GATES.** After any change: `pnpm tc` and scoped `pnpm test`. Before declaring sync done: full verification.
6. **pnpm only.** Never `npm`/`yarn`. Spawn processes via `src/shared/child-process/` helpers, never `child_process` directly.
7. **Match upstream style.** Concrete file names (no `utils`/`helpers`/`misc`), co-located tests, minimal comments ("why" not "how"), no `max-lines` disables, `.ts` over `.d.ts`.

## Mutation Whitelist (upstream files we may edit)

| File | What we change |
|---|---|
| `package.json` | `name`, `description`, `homepage`, `author`, `version`, `bin` |
| `electron-builder` config under `config/` | product name, appId, icons, artifact naming |
| `src/main/app-icon.ts` + icon assets | branding |
| Updater feed URLs | point to OUR release feed |
| Telemetry/analytics config | disabled or pointed at ours |

Anything else: additive only.

## Where our code goes

| Kind | Location |
|---|---|
| Main-process features | `src/main/forge-<feature>.ts` / `src/main/forge/<feature>/` |
| New agent integration | `src/main/<agent-id>/` |
| Renderer UI | `src/renderer/src/forge/` |
| Shared contracts | `src/shared/forge-<contract>.ts` |
| CLI handlers | `src/cli/handlers/forge-<command>.ts` |
| Docs | `docs/forge/` |

## Verification commands

```bash
pnpm tc                       # typecheck
pnpm test <path>              # targeted vitest
pnpm run check:code-quality:changed   # lint gate (fast)
pnpm lint                     # FULL gate (slow)
```

## Cross-platform requirements

- macOS + Linux + Windows. Runtime platform checks, never hardcoded `metaKey`.
- `path.join` for paths. Process spawning via `src/shared/child-process/`.
- SSH/remote and folder-workspace cases must work.
