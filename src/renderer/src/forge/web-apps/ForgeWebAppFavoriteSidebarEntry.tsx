// Standalone sidebar entry for the single favorited pinned web app (forge-web-app-favorite.ts).
// Renders nothing until an app is favorited from the pinned-apps dropdown; right-click offers
// removing the favorite. Reuses the sidebar's plain nav-button styling.
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { translate } from '@/i18n/i18n'
import { getForgeWebAppEntry } from '../../../../shared/forge-web-app-registry'
import { ForgeWebAppBrandGlyph } from './forge-web-app-brand-icons'
import { setForgeWebAppFavoriteId, useForgeWebAppFavorite } from './forge-web-app-favorite'
import { openForgeWebApp } from './forge-web-app-launch'
import { useForgeWebAppUnreadCounts } from './use-forge-web-app-unread-counts'

export function ForgeWebAppFavoriteSidebarEntry(): React.JSX.Element | null {
  const favoriteId = useForgeWebAppFavorite()
  const unreadCounts = useForgeWebAppUnreadCounts()
  const entry = favoriteId ? getForgeWebAppEntry(favoriteId) : undefined
  if (!entry) {
    return null
  }
  const unreadCount = unreadCounts[entry.id] ?? 0
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={() => void openForgeWebApp(entry.id)}
          aria-label={translate(
            'auto.forge.web-apps.ForgeWebAppFavoriteSidebarEntry.open',
            'Open pinned app'
          )}
          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium tracking-tight text-worktree-sidebar-foreground/60 transition-colors hover:bg-worktree-sidebar-foreground/8"
        >
          <ForgeWebAppBrandGlyph
            iconId={entry.iconId}
            className="size-4 shrink-0 text-worktree-sidebar-foreground/30"
            strokeWidth={1.75}
          />
          <span className="flex-1">{entry.title}</span>
          {unreadCount > 0 ? (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setForgeWebAppFavoriteId(null)}>
          {translate(
            'auto.forge.web-apps.ForgeWebAppFavoriteSidebarEntry.remove',
            'Remove from favorites'
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
