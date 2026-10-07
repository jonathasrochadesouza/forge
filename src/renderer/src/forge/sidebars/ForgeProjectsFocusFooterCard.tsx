// Bottom-most, fixed card in the left sidebar rail showing which project (and workspace) is
// open and in focus right now. Clicking it opens the forge secondary sidebar and reveals the
// active workspace; hidden entirely when no workspace is active. Visual recipe matches the
// rail's nav rows (restrained surface, subtle hover) per docs/STYLEGUIDE.md.
import React from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store'
import { useRepoMap, useWorktreeMap } from '@/store/selectors'
import { translate } from '@/i18n/i18n'
import { RepoIconGlyph } from '@/components/repo/repo-icon'
import { useWorktreeActivityStatus } from '@/components/sidebar/use-worktree-activity-status'
import StatusIndicator from '@/components/sidebar/StatusIndicator'
import { openForgeSecondarySidebar } from './forge-secondary-sidebar-store'
import type { Repo } from '../../../../shared/repo-types'
import type { Worktree } from '../../../../shared/worktree/types'

export function ForgeProjectsFocusFooterCard(): React.JSX.Element | null {
  useTranslation()
  const activeWorktreeId = useAppStore((s) => s.activeWorktreeId)
  const worktreeMap = useWorktreeMap()
  const repoMap = useRepoMap()
  const worktree = activeWorktreeId !== null ? (worktreeMap.get(activeWorktreeId) ?? null) : null
  const repo = worktree !== null ? (repoMap.get(worktree.repoId) ?? null) : null

  if (worktree === null || repo === null || activeWorktreeId === null) {
    return null
  }

  return (
    <div className="mx-2 mb-2">
      <ForgeProjectsFocusFooterCardContent
        worktreeId={activeWorktreeId}
        worktree={worktree}
        repo={repo}
      />
    </div>
  )
}

function ForgeProjectsFocusFooterCardContent({
  worktreeId,
  worktree,
  repo
}: {
  worktreeId: string
  worktree: Worktree
  repo: Repo
}): React.JSX.Element {
  const status = useWorktreeActivityStatus(worktreeId)
  const reveal = (): void => {
    openForgeSecondarySidebar('projects')
    useAppStore.getState().revealWorktreeInSidebar(worktreeId, {
      behavior: 'auto',
      highlight: true
    })
  }

  return (
    <button
      type="button"
      onClick={reveal}
      aria-label={translate(
        'auto.forge.sidebars.ForgeProjectsFocusFooterCard.currentProject',
        'Current project: {{value0}}',
        { value0: repo.displayName }
      )}
      className="group flex w-full items-center gap-2 rounded-md bg-worktree-sidebar-foreground/5 px-2 py-1.5 text-left transition-colors hover:bg-worktree-sidebar-foreground/8"
    >
      <RepoIconGlyph
        repoIcon={repo.repoIcon}
        className="size-4 shrink-0"
        iconClassName="text-worktree-sidebar-foreground/45"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-[13px] font-medium text-worktree-sidebar-foreground/85">
            {repo.displayName}
          </span>
          <StatusIndicator status={status} />
        </span>
        <span className="min-w-0 truncate text-[11px] text-worktree-sidebar-foreground/50">
          {worktree.displayName}
        </span>
      </span>
      <ChevronRight
        className="size-3.5 shrink-0 text-worktree-sidebar-foreground/30 transition-colors group-hover:text-worktree-sidebar-foreground/70"
        strokeWidth={1.75}
      />
    </button>
  )
}
