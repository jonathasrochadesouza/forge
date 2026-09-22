// Sidebar entry that lists pinned web apps (src/shared/forge-web-app-registry.ts) and opens
// one as a floating browser tab on selection.
import { LayoutGrid } from 'lucide-react'
import { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { listForgeWebAppEntries } from '../../../../shared/forge-web-app-registry'
import { openForgeWebApp } from './forge-web-app-launch'
import { installForgeWebAppNavigationGuards } from './forge-web-app-navigation-guard'

export function ForgeWebAppSidebarEntry(): React.JSX.Element {
  const entries = listForgeWebAppEntries()

  // Why: this entry mounts once with the sidebar, making it a convenient place to keep the
  // pinned-app navigation guard alive for the app's lifetime without a dedicated bootstrap hook.
  useEffect(() => installForgeWebAppNavigationGuards(), [])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium tracking-tight text-worktree-sidebar-foreground/60 transition-colors hover:bg-worktree-sidebar-foreground/8"
          aria-label={translate(
            'auto.forge.web-apps.ForgeWebAppSidebarEntry.title',
            'Pinned apps'
          )}
        >
          <LayoutGrid
            className="size-4 shrink-0 text-worktree-sidebar-foreground/30"
            strokeWidth={1.75}
          />
          <span className="flex-1">
            {translate('auto.forge.web-apps.ForgeWebAppSidebarEntry.title', 'Pinned apps')}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
          {translate('auto.forge.web-apps.ForgeWebAppSidebarEntry.title', 'Pinned apps')}
        </DropdownMenuLabel>
        {entries.map((entry) => (
          <DropdownMenuItem key={entry.id} onSelect={() => void openForgeWebApp(entry.id)}>
            {entry.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
