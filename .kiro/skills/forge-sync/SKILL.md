---
name: forge-sync
description: Use when the user asks to sync, update, or pull changes from upstream (stablyai/orca) into the forge fork, or when a merge from upstream/main is needed. Triggers on "sync", "atualizar do upstream", "pull da upstream", "pegar as novidades do orca".
---

# Sync forge with upstream

Goal: bring `upstream/main` into the `forge` branch with zero lost customizations
and all gates green. Read `FORGE.md` (root) before anything else if not already
in context — especially the Golden Rules and the Mutation Whitelist.

## Preconditions (abort and report if any fail)

1. `git status --porcelain` is clean (no uncommitted work). If dirty: ask the user
   whether to stash or commit first; never merge over a dirty tree.
2. Current branch is `forge`. Never merge into `upstream-main`.
3. `FORGE-OVERRIDES.md` exists — it lists every upstream file we have ever
   modified. Conflicts are only legitimate in files listed there.

## Procedure

1. `git fetch upstream` — then show the user a short summary of what's new:
   `git log --oneline forge..upstream/main | head -30` and the total count.
2. `git merge upstream/main --no-edit`.
3. If the merge is clean → continue. If there are conflicts:
   - Legitimate conflict (file is in `FORGE-OVERRIDES.md` / Mutation Whitelist):
     resolve keeping **upstream's structure** with **our whitelisted values**
     (branding, feed URLs). Re-apply our small diff on top of their new version.
   - Any other conflicted file: STOP. Do not resolve silently. Something violated
     the additive-only rule. Report the file to the user with
     `git diff --theirs -- <file>` context and propose either an additive
     rework or an explicit, user-approved whitelist addition.
4. If `pnpm-lock.yaml` changed: `pnpm install --frozen-lockfile` (fallback:
   plain `pnpm install` if frozen fails, and report that).
5. Verify, in order — stop and fix at the first failure:
   - `pnpm tc`
   - `pnpm run check:code-quality:changed`
   - `pnpm test src/shared src/main/forge*` (our namespaces) — plus, if the
     merge touched core areas (pty, worktrees, wire, status store), run the
     scoped suites for those areas instead of the full suite; full `pnpm lint`
     and full `pnpm test` only when the user asks for a release-grade sync.
6. Update `FORGE-OVERRIDES.md` if any whitelist resolution changed what we
   override (new file, removed override, changed value).
7. Commit the merge (`git commit --no-edit` if not auto-committed).
   Never push unless the user asks.

## Report back to the user

- Upstream commits merged (count + highlights).
- Conflicts found and how each was resolved (or why you stopped).
- Gate results (pass/fail per command).
- Whether `FORGE-OVERRIDES.md` changed.
