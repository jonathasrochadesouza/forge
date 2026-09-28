// Sidebar entry that lists pinned web apps (src/shared/forge-web-app-registry.ts) and opens
// one as a floating browser tab on selection. Shows each app's brand glyph and unread badge,
// plus a star that sets the single favorited app (forge-web-app-favorite.ts).
import { LayoutGrid, Star } from 'lucide-react'
import { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { translate } from '@/i18n/i18n'
import { listForgeWebAppEntries } from '../../../../shared/forge-web-app-registry'
import { ForgeWebAppBrandGlyph } from './forge-web-app-brand-icons'
import { setForgeWebAppFavoriteId, useForgeWebAppFavorite } from './forge-web-app-favorite'
import { openForgeWebApp } from './forge-web-app-launch'
import { installForgeWebAppNavigationGuards } from './forge-web-app-navigation-guard'
import { useForgeWebAppUnreadCounts } from './use-forge-web-app-unread-counts'

export function ForgeWebAppSidebarEntry(): React.JSX.Element {
  const entries = listForgeWebAppEntries()
  const unreadCounts = useForgeWebAppUnreadCounts()
  const favoriteId = useForgeWebAppFavorite()
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)

  // Why: this entry mounts once with the sidebar, making it a convenient place to keep the
  // pinned-app navigation guard alive for the app's lifetime without a dedicated bootstrap hook.
  useEffect(() => installForgeWebAppNavigationGuards(), [])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium tracking-tight text-worktree-sidebar-foreground/60 transition-colors hover:bg-worktree-sidebar-foreground/8"
          aria-label={translate('auto.forge.web-apps.ForgeWebAppSidebarEntry.title', 'Pinned apps')}
        >
          <LayoutGrid
            className="size-4 shrink-0 text-worktree-sidebar-foreground/30"
            strokeWidth={1.75}
          />
          <span className="flex-1">
            {translate('auto.forge.web-apps.ForgeWebAppSidebarEntry.title', 'Pinned apps')}
          </span>
          {totalUnread > 0 ? (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold text-primary-foreground">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56">
        <DropdownMenuLabel>
          {translate('auto.forge.web-apps.ForgeWebAppSidebarEntry.title', 'Pinned apps')}
        </DropdownMenuLabel>
        {entries.map((entry) => {
          const unreadCount = unreadCounts[entry.id] ?? 0
          const favorited = favoriteId === entry.id
          return (
            <DropdownMenuItem
              key={entry.id}
              className="group/item"
              onSelect={() => void openForgeWebApp(entry.id)}
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
              <button
                type="button"
                aria-label={translate(
                  favorited
                    ? 'auto.forge.web-apps.ForgeWebAppSidebarEntry.unfavorite'
                    : 'auto.forge.web-apps.ForgeWebAppSidebarEntry.favorite',
                  favorited ? 'Remove from favorites' : 'Favorite'
                )}
                className={cn(
                  'shrink-0 rounded-sm p-0.5 transition-opacity hover:bg-worktree-sidebar-foreground/10',
                  favorited
                    ? 'opacity-100'
                    : 'opacity-0 focus-visible:opacity-100 group-hover/item:opacity-100'
                )}
                onClick={(event) => {
                  // Why: stop the click from bubbling to the item, or Radix would fire the
                  // item's onSelect and open the app instead of just toggling the favorite.
                  event.preventDefault()
                  event.stopPropagation()
                  setForgeWebAppFavoriteId(favorited ? null : entry.id)
                }}
              >
                <Star
                  className={cn('size-3.5', favorited && 'fill-current text-primary')}
                  strokeWidth={1.75}
                />
              </button>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
