// Sidebar nav entry that opens Forge's auxiliary secondary sidebar. For now the only panel is
// 'projects' (the workspace tree, relocated behind this button); more panels share the same host.
import React from 'react'
import { FolderTree } from 'lucide-react'
import { cn } from '@/lib/utils'
import { translate } from '@/i18n/i18n'
import {
  closeForgeSecondarySidebar,
  openForgeSecondarySidebar,
  useForgeSecondarySidebar
} from './forge-secondary-sidebar-store'
import { installForgeSecondarySidebarRevealBridge } from './forge-secondary-sidebar-reveal-bridge'
import { ForgeSidebarIconButton } from './ForgeSidebarIconButton'

export function ForgeSecondarySidebarNavEntry({
  compact = false
}: {
  /** Icon-only rendering for the collapsed sidebar rail. */
  compact?: boolean
}): React.JSX.Element {
  const { open } = useForgeSecondarySidebar()
  const toggle = React.useCallback(() => {
    if (open) {
      closeForgeSecondarySidebar()
    } else {
      openForgeSecondarySidebar('projects')
    }
  }, [open])
  // Why: this entry mounts once with the sidebar, making it a convenient place to keep the
  // reveal bridge alive for the app's lifetime without a dedicated bootstrap hook.
  React.useEffect(() => installForgeSecondarySidebarRevealBridge(), [])

  if (compact) {
    return (
      <ForgeSidebarIconButton
        label={translate('auto.forge.sidebars.ForgeSecondarySidebarNavEntry.title', 'Projects')}
        active={open}
        onClick={toggle}
      >
        <FolderTree className="size-4" strokeWidth={open ? 2.25 : 1.75} />
      </ForgeSidebarIconButton>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-current={open ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium tracking-tight transition-colors',
        open
          ? 'bg-worktree-sidebar-accent text-worktree-sidebar-accent-foreground'
          : 'text-worktree-sidebar-foreground/60 hover:bg-worktree-sidebar-foreground/8'
      )}
    >
      <FolderTree
        className={cn('size-4 shrink-0', !open && 'text-worktree-sidebar-foreground/30')}
        strokeWidth={open ? 2.25 : 1.75}
      />
      <span className="flex-1">
        {translate('auto.forge.sidebars.ForgeSecondarySidebarNavEntry.title', 'Projects')}
      </span>
    </button>
  )
}
