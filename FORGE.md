# FORGE — AI Agent Operating Manual

> **READ THIS FIRST.** This file is the single source of truth for how any AI agent
> (opencode, Claude Code, Codex, etc.) works in this repository. `AGENTS.md` and
> `CLAUDE.md` at the root are **upstream-owned** design-system notes — read them,
> never edit them.

## What this repository is

**Forge** is a customized fork of [stablyai/orca](https://github.com/stablyai/orca)
(v1.4.x, MIT license, Copyright Lovecast Inc. — keep the LICENSE and attribution
intact). Upstream ships **daily**. This fork exists to apply our own customizations
**without ever diverging into an unmaintainable merge war**.

- Upstream code: ~400k lines of TypeScript (Electron + React + pnpm monorepo).
- Our goal: **reuse 100% of upstream, add our features additively, sync forever.**

## The Golden Rules (never violate these)

1. **ADDITIVE-ONLY.** Never modify, rename, or delete a file that exists in
   `upstream-main`. Create new files instead. If a change seems to require editing
   an upstream file, see "The Mutation Whitelist" below — and if the file is not on
   it, find an additive way or ask the user.
2. **NEVER commit to `upstream-main`.** All work happens on `forge`. `upstream-main`
   is a read-only mirror of `upstream/main`.
3. **RECORD EVERY MUTATION.** If you do touch a whitelisted upstream file, append a
   one-line entry to `FORGE-OVERRIDES.md` (file path + what changed + why). That
   log is our conflict map for the next sync.
4. **RESPECT UPSTREAM CONTRACTS.** Before touching wire protocol, agent status,
   SSH, worktrees, git, or cross-platform behavior, read the corresponding
   `docs/reference/*.md` (listed below). These docs are law.
5. **RUN THE GATES.** After any change: `pnpm tc` (typecheck) and scoped
   `pnpm test <path/to/file.test.ts>`. Before declaring a sync done: full
   verification (see "Verification commands").
6. **pnpm only.** Node >= per `.nvmrc`/engines. Never `npm`/`yarn`. Spawn processes
   via `src/shared/child-process/` helpers (`runProcess`/`spawnProcess`), never
   `child_process` directly — a ratchet test fails the build otherwise.
7. **Match upstream style.** Concrete file names (no `utils`/`helpers`/`misc`),
   co-located tests (`foo.ts` + `foo.test.ts`), minimal comments ("why", not
   "how"), no `max-lines` disables, `.ts` over `.d.ts` for owned types.

## Branch & remote model

```
remote "upstream"  → https://github.com/stablyai/orca.git   (read-only, never push)
upstream-main      → tracks upstream/main                   (mirror, never commit)
forge              → OUR branch: all customizations live here (current branch)
main               → (optional, later) our public fork on GitHub, fast-forwarded from forge
```

## Where our code goes (namespaces)

| Kind | Location |
|---|---|
| Main-process features | `src/main/forge-<feature>.ts` / `src/main/forge/<feature>/` |
| New agent integration | `src/main/<agent-id>/` (own dir, mirrors `src/main/claude/` pattern) |
| Renderer UI | `src/renderer/src/forge/` |
| Shared contracts/types | `src/shared/forge-<contract>.ts` |
| CLI handlers | `src/cli/handlers/forge-<command>.ts` + registry entry (generated where applicable) |
| Docs | `docs/forge/` |
| Anything config-driven | `orca.yaml`, hooks, `skills/`, plugins — prefer these over code |

Every new file needs its co-located test file, and must pass:
`pnpm tc` + `pnpm test <file>` + `pnpm run check:code-quality:changed`.

## The Mutation Whitelist (only upstream files we may edit)

These require edits for rebranding and are **expected to conflict on sync** —
resolve keeping upstream's structure and our branding values:

| File | What we change there |
|---|---|
| `package.json` | `name`, `description`, `homepage`, `author`, `version` (ours), `bin` |
| `electron-builder` config files under `config/` | product name, appId, icons, artifact naming |
| `src/main/app-icon.ts` + icon assets | branding |
| Updater feed URLs (search `updater` config) | point to OUR release feed, never theirs |
| Telemetry/analytics config | disabled or pointed at ours |

Anything else: additive only. When upstream refactors near a whitelist file, prefer
re-applying our small diff on top of their new version over "ours wins".

## Upstream architecture map (what lives where)

```
src/main/      Electron main process (~539 modules): pty, worktrees, git, per-agent
               adapters (claude/, codex/, opencode/, cursor/, gemini/...), ssh, wsl,
               ephemeral VMs, hooks, skills, persistence, updater, orcad/ (daemon)
src/renderer/  React UI (App.tsx, store/, components/ui/ = shadcn, Ghostty-style term)
src/shared/    Cross-layer contracts (~1860 files) — including the RPC params catalog
               (GENERATED: `pnpm run generate:rpc-params-catalog`, never hand-edit)
src/cli/       `orca` headless CLI: handler groups + registry-parity tests
src/relay/     RPC server pairing mobile app ↔ desktop (~371 files)
mobile/        Expo/React Native companion app
native/        Per-platform addons (computer-use, node-pty, keyboard layouts)
cloud/         Separate pnpm workspace (mobile pairing relay, apps, infra)
docs/reference/  Binding contracts — READ before touching related areas
```

Design patterns in use (follow them): **Adapter** (per-agent session adapters),
**Registry** (tool registries, CLI handler groups, RPC method routing),
**single canonical Store + subscribers** (agent status, persistence),
**capability negotiation** (stream opcodes), **ratchet/contract tests** (CI-enforced
invariants), **daemon + supervisor split** (orcad vs terminal daemon).

## Binding contracts (docs/reference/*.md — read before touching)

| Before changing… | Read first |
|---|---|
| Anything client↔host exchange (RPC params, stream frames) | `remote-wire-compatibility.md` — new optional JSON field = safe; new opcode = negotiate or it is silently dropped; opcodes are permanent |
| Agent status (sidebar, CLI, mobile) | `agent-status-store.md` — one store, host-owned; readers subscribe; never add a second copy |
| Remote/SSH anything | `ssh-execution-boundary.md` — verdicts are `live`/`unverifiable`/`exited`, no synonyms |
| Git commands | `git-compatibility.md` — Git 2.25 baseline, `GitCapabilityCache`, scoped per host |
| Process spawning (any platform) | AGENTS.md "Windows child processes" section |
| Running headless/on a server | `orcad-operations.md` — orcad vs terminal daemon lifecycle |
| Skills install/share | `agent-skill-sharing-*.md` — independent implementation boundary |
| UI | `docs/STYLEGUIDE.md` + tokens in `src/renderer/src/assets/main.css`; never hardcode hex |
| Any platform behavior | must work macOS + Linux + Windows, local + SSH + folder workspaces |

## Verification commands (same gates as upstream CI)

```bash
pnpm install                  # after lockfile changes; cross-arch: pnpm install:release
pnpm tc                       # typecheck (tc:node / tc:cli / tc:web for scoped)
pnpm test <path>              # targeted vitest
pnpm run check:code-quality:changed   # lint gate for your diff (fast)
pnpm lint                     # FULL gate — slow; required before sync completion
pnpm build                    # only before cutting our own release
```

## How sync works (summary — the forge-sync skill has the full procedure)

`forge` merges `upstream/main` regularly (weekly or on request). Because our changes
are additive, merges are usually clean; conflicts should only ever appear in
Mutation-Whitelist files. Every completed sync ends with `FORGE-OVERRIDES.md`
up-to-date and the full gates green.

## Legal

MIT. Keep upstream's `LICENSE` untouched. We own our additions; mark new files
normally (no need for extra headers, but never remove theirs).
