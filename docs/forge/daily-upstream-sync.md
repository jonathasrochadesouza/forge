# Daily upstream sync (FORGE-90)

Forge is a fork of [stablyai/orca](https://github.com/stablyai/orca), which ships
daily. The `.github/workflows/forge-sync-upstream.yml` workflow fixes the sync
cadence that the `forge-sync` skill (FORGE-76) left manual: once a day it
mechanically replays that procedure and opens a review PR, so divergence never
accumulates silently.

## Cadence

- **Schedule:** daily at `08:33 UTC` (cron `33 8 * * *`) — `05:33` in
  America/Sao_Paulo (UTC-3, no DST). That is after the US workday's pushes and
  before the Brazilian workday; minute 33 avoids collision with upstream's
  scheduled workflows, which fire on minutes 0/15/17/23/30.
- **Manual run:** Actions → Forge Upstream Sync → Run workflow
  (`workflow_dispatch`). Useful after resolving conflicts or when the schedule
  was missed (GitHub can delay cron runs under load).

## Activation on the fork (one-time, required)

Two repository settings gate this workflow, and both default to off on a
personal-account fork of a public repo:

1. **Allow workflows to open PRs.** By default GitHub blocks the default
   `GITHUB_TOKEN` from creating pull requests — the PR step would fail with
   403 ("GitHub Actions is not permitted to create or approve pull requests").
   Settings → Actions → General → Workflow permissions → check
   **Allow GitHub Actions to create and approve pull requests** → Save. (The
   workflow's own `permissions:` block covers contents/issues write; only this
   toggle is a separate policy the YAML cannot grant.)
2. **Enable the schedule.** Scheduled workflows come disabled on forks
   (`disabled_fork`). Actions tab → Forge Upstream Sync → **Enable workflow**.
   Keep the upstream scheduled workflows disabled — they reference upstream
   secrets and only add failure noise to the fork.

Two rules from GitHub's triggers documentation to keep in mind: schedules fire
only on the default branch (here `forge`, where this workflow lives), and on
public repos GitHub auto-disables schedules after 60 days without repository
activity (`disabled_inactivity`). The daily sync PRs keep the repo active; if a
run ever disappears without a red run behind it, re-enable via the same button.

First-run checklist: push to `forge` → apply the two toggles above → Actions →
Run workflow → the first sync PR should carry every commit accumulated since
the last manual sync.

## What the run does

1. Fetches `upstream/main` and counts pending commits (`forge..upstream/main`).
   Zero pending commits → run succeeds with an "up to date" summary and stops.
2. Cuts the fixed branch `forge-sync/upstream` from `forge` and merges
   `upstream/main` into it (merge commit, same shape as manual syncs).
3. **On conflict: stops without resolving.** Legitimate conflicts only exist in
   files listed in `FORGE-OVERRIDES.md`, and resolving them needs
   user-approved decisions (see the `forge-sync` skill). The run aborts the
   merge, annotates the conflicted files, and updates the failure issue.
4. Otherwise runs the fast gates on the merged tree:
   - `pnpm tc`
   - scoped vitest set: the identity/rebrand pins from `FORGE-OVERRIDES.md`
     (`dev-instance-identity`, `daemon-host-relocation`,
     `local-build-compatibility*`, `mac-build-compatibility`,
     `electron-builder-mac-channel-config`, `verify-dev-channel-packaging`)
     plus the forge namespaces (`forge-web-app-*`, `src/renderer/src/forge`,
     `forge-provider`).
5. Gates green → force-pushes `forge-sync/upstream` and opens (or refreshes)
   a PR `forge-sync/upstream` → `forge` with the commit count, highlights, and
   a review checklist.

The workflow never pushes a merge directly to `forge` — a broken sync lands as
a closed PR, not a broken default branch.

## Failure notification

- A run that fails (conflict or gate) opens or updates a single recurring issue
  labeled `forge-sync-failure`, with the run link and either the conflicted
  files or the failed gate. One issue per failure streak — each new failure is
  a comment, and the issue is auto-closed when a later run succeeds.
- The sync job also emits a `::error` annotation with the conflicted file list.

## Known limits

- The sync PR is created with the default `GITHUB_TOKEN`, so GitHub does not
  run the upstream `pull_request` workflows on it (recursive-run protection).
  The workflow's own gates are the pre-PR verification; run the full suite
  manually when the sync touched core areas (pty, worktrees, wire, status
  store) — same rule the `forge-sync` skill applies to manual syncs.
- Merge the PR with a **merge commit** (no squash) to preserve the sync
  structure in history.

## Manual sync still applies

The `forge-sync` skill remains the source of truth for resolving conflicts and
for release-grade syncs (full `pnpm lint` / full `pnpm test`). After resolving
a conflicted run by hand, finish with the skill's steps and re-run the workflow
or open the PR manually.
