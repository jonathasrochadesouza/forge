// Derives each pinned web app's unread count from its floating browser tab's title, reusing the
// existing page-title-updated -> BrowserTab.title pipeline (no new webview listener needed).
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { listForgeWebAppEntries } from '../../../../shared/forge-web-app-registry'
import { readForgeWebAppUnreadCount } from '../../../../shared/forge-web-app-unread-count'
import { useAppStore } from '@/store'

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin
  } catch {
    return false
  }
}

/** Pure projection: pinned web app id -> unread count, given the floating tabs list. */
export function computeForgeWebAppUnreadCounts(
  tabs: readonly { url: string; title: string }[]
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const entry of listForgeWebAppEntries()) {
    const tab = tabs.find((candidate) => sameOrigin(candidate.url, entry.url))
    counts[entry.id] = tab ? readForgeWebAppUnreadCount(tab.title) : 0
  }
  return counts
}

/** Maps each pinned web app id to its current unread count (0 when not open or no badge). */
export function useForgeWebAppUnreadCounts(): Record<string, number> {
  return useAppStore((state) =>
    computeForgeWebAppUnreadCounts(state.browserTabsByWorktree[FLOATING_TERMINAL_WORKTREE_ID] ?? [])
  )
}
