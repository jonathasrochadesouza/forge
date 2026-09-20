---
name: forge-extend
description: Use when the user asks to add a feature, change behavior, customize UI, or build anything new in the forge fork. Triggers on "adicione", "create", "customiza", "mude o comportamento", "feature". Enforces the additive-only fork strategy and routes the change to the correct extension point.
---

# Extend forge without breaking upstream sync

Read `FORGE.md` (root) first if not already in context. The one rule that
decides everything: **never modify an upstream file unless it is on the
Mutation Whitelist**; everything else is a new file in a forge namespace.

## Decision procedure (walk in order)

1. **Can it be done with zero code?** Prefer, in this order:
   - `orca.yaml` + hooks (automation, agent behavior)
   - `skills/` (procedural knowledge — data, not code)
   - a plugin in `examples/plugins/` / `src/main/plugins/` style
   - config/branding tokens (UI rebrand via `main.css` tokens is whitelist-
     adjacent: token *values* are ours, token *names* are upstream's)
2. **Is it a new agent CLI integration?** → use the `forge-agent-integration`
   skill instead of this one.
3. **Is it renderer UI?** → new files under `src/renderer/src/forge/`, follow
   `docs/STYLEGUIDE.md`, use existing shadcn primitives in `components/ui/`
   and tokens from `src/renderer/src/assets/main.css`. Never hardcode hex;
   the design-system lint gate fails on it.
4. **Main-process feature?** → new files `src/main/forge-<feature>.ts` (or a
   `src/main/forge/<feature>/` dir for multi-file). Reuse existing modules
   first (upstream AGENTS.md: "Reuse Before Reimplementing" — search before
   writing). Subscribe to existing stores; never create a second copy of
   agent status or persistence state.
5. **CLI command?** → handler under `src/cli/handlers/` in the existing
   handler-group pattern; if it changes the RPC surface, run the generator
   (`pnpm run generate:rpc-params-catalog`) instead of editing the catalog.
6. **Does it edit a protocol/wire, opcode, or shared contract?** → STOP and
   read the matching `docs/reference/*.md` (table in FORGE.md). New optional
   JSON field = safe; new opcode = needs capability negotiation; new required
   field = forbidden (breaks mixed-version pairing).

## Hard requirements for every new file

- Concrete name (no `utils`, `helpers`, `common`, `misc`, `shared-stuff`).
- Co-located test: `<name>.test.ts` next to `<name>.ts`.
- Cross-platform: macOS + Linux + Windows; runtime platform checks, never
  hardcoded `metaKey`; `path.join` for paths.
- Consider SSH/remote and folder-workspace cases (not every workspace is a
  local git worktree).
- Process spawning only via `src/shared/child-process/` helpers.
- TypeScript: `.ts` over `.d.ts`; avoid type assertions except `as const`.
- Comments: only non-obvious "why", one line when possible.

## Before declaring done

```
pnpm tc
pnpm test <your new test files>
pnpm run check:code-quality:changed
```

Fix all failures. Then summarize to the user: files created (all new — or any
whitelist edits, which must be logged in `FORGE-OVERRIDES.md`), gates run,
and anything you intentionally left out.
