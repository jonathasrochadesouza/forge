// Docked auxiliary secondary sidebar: a flex column that sits between the worktree sidebar
// and the content area, pushing the content the same way the left sidebar does. Width tracks
// the left sidebar (including in-flight drag via --workspace-sidebar-live-width). The whole
// header row is the back control; every close path restores the default initial sidebar.
import React from 'react'
import { ArrowLeft, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import {
  resolveLeftSidebarStyleVariables,
  type LeftSidebarStyleVariables
} from '@/lib/left-sidebar-appearance'
import { useSystemPrefersDark } from '@/components/terminal-pane/use-system-prefers-dark'
import { SidebarHeaderActions } from '@/components/sidebar/sidebar-header-actions'
import { useWorkspaceRevealBodyRedirect } from '@/components/sidebar/use-workspace-reveal-body-redirect'
import {
  closeForgeSecondarySidebar,
  useForgeSecondarySidebar
} from './forge-secondary-sidebar-store'
import { ForgeProjectsSidebarPanel } from './ForgeProjectsSidebarPanel'
import { ForgeActivitySidebarPanel } from './ForgeActivitySidebarPanel'

const NO_BOARD_MENU_CHANGE = (): void => {}

/** The dock's style: width tracks the left sidebar, plus its custom appearance variables. */
export function buildForgeSecondarySidebarDockStyle(
  sidebarWidth: number,
  reserveTitlebarHeight: number,
  leftSidebarStyle: LeftSidebarStyleVariables | undefined
): React.CSSProperties {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: LeftSidebarStyleVariables is a CSS custom-property record built for style props; same cast the Sidebar root (components/sidebar/index.tsx) applies before spreading it.
  return {
    width: `var(--workspace-sidebar-live-width, ${sidebarWidth}px)`,
    paddingTop: reserveTitlebarHeight,
    ...leftSidebarStyle
  } as React.CSSProperties
}

function ForgeActivityViewToggle({ agentsActive }: { agentsActive: boolean }): React.JSX.Element {
  const setSidebarBody = useAppStore((s) => s.setSidebarBody)
  const label = translate(
    agentsActive ? 'dashboard.sidebar.closeActivity' : 'dashboard.sidebar.openActivity',
    agentsActive ? 'Turn off activity view' : 'View activity'
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-worktree-sidebar-foreground/10 hover:text-worktree-sidebar-foreground',
            agentsActive && 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary'
          )}
          aria-label={label}
          aria-pressed={agentsActive}
          onClick={() => setSidebarBody(agentsActive ? 'workspaces' : 'agents')}
        >
          <Bell className="size-3.5" strokeWidth={2.25} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function ForgeSecondarySidebarDock({
  reserveTitlebarHeight = 0
}: {
  reserveTitlebarHeight?: number
}): React.JSX.Element | null {
  // Why: this boundary subscribes to locale changes itself — translate() reads the locale
  // live, and this component is not covered by another language subscription.
  useTranslation()
  const { open, panel } = useForgeSecondarySidebar()
  const sidebarWidth = useAppStore((s) => s.sidebarWidth)
  const sidebarBody = useAppStore((s) => s.sidebarBody ?? 'workspaces')
  const settings = useAppStore((s) => s.settings)
  const systemPrefersDark = useSystemPrefersDark()
  const leftSidebarStyle = React.useMemo(
    () => resolveLeftSidebarStyleVariables(settings, systemPrefersDark),
    [settings, systemPrefersDark]
  )
  // Why here: reveal requests must find the projects tree, which only exists inside this dock.
  useWorkspaceRevealBodyRedirect(open && sidebarBody === 'agents')

  if (!open) {
    return null
  }

  const agentsActive = sidebarBody === 'agents'
  const backLabel = translate('auto.forge.sidebars.ForgeSecondarySidebarDock.back', 'Back')
  const title =
    panel === 'projects'
      ? translate('auto.forge.sidebars.ForgeSecondarySidebarDock.projectsTitle', 'Projects')
      : ''

  return (
    <div
      data-forge-secondary-sidebar=""
      className="relative flex min-h-0 shrink-0 flex-col overflow-hidden bg-worktree-sidebar scrollbar-sleek-parent"
      style={buildForgeSecondarySidebarDockStyle(
        sidebarWidth,
        reserveTitlebarHeight,
        leftSidebarStyle
      )}
    >
      {/* Why full-row: the entire header is the back control, so users never have to aim at
      the small arrow icon; clicking anywhere returns to the default initial sidebar. Why no
      hover bg/ring: it must not read as a button — the center-out underline is the affordance. */}
      <button
        type="button"
        onClick={closeForgeSecondarySidebar}
        aria-label={backLabel}
        className="group relative mt-2 flex h-8 w-full shrink-0 items-center gap-1.5 px-1.5 text-left text-xs font-semibold tracking-tight text-muted-foreground/80 outline-none focus-visible:ring-1 focus-visible:ring-ring/60"
      >
        <ArrowLeft
          className="size-3.5 shrink-0 text-worktree-sidebar-foreground/55"
          strokeWidth={2.25}
        />
        <span className="min-w-0 flex-1 truncate select-none">{title}</span>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-worktree-sidebar-foreground/30 transition-transform duration-200 ease-out group-hover:scale-x-100"
        />
      </button>
      <div className="flex h-8 shrink-0 items-center gap-1 px-2">
        <ForgeActivityViewToggle agentsActive={agentsActive} />
        <SidebarHeaderActions
          onWorkspaceBoardMenuOpenChange={NO_BOARD_MENU_CHANGE}
          agentsViewActive={agentsActive}
        />
      </div>
      {agentsActive ? (
        <ForgeActivitySidebarPanel />
      ) : panel === 'projects' ? (
        <ForgeProjectsSidebarPanel />
      ) : null}
    </div>
  )
}
