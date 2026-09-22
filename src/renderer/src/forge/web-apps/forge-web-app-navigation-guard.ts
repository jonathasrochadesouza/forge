// Keeps navigation inside a pinned web app's floating browser tab on the app's own domain;
// anything else is sent to the system browser. Attaches to the existing <webview> registry
// (src/renderer/src/components/browser-pane/host-guest/webview-registry.ts) — no new tab surface.
import { webviewRegistry } from '@/components/browser-pane/host-guest/webview-registry'
import { useAppStore } from '@/store'
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { listForgeWebAppEntries, type ForgeWebAppEntry } from '../../../../shared/forge-web-app-registry'
import { decideForgeWebAppNavigation } from '../../../../shared/forge-web-app-navigation-policy'

const tabsWithNavigationGuard = new Set<string>()

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

function matchEntryForUrl(url: string): ForgeWebAppEntry | undefined {
  const hostname = hostnameOf(url)
  if (!hostname) {
    return undefined
  }
  return listForgeWebAppEntries().find((entry) => hostnameOf(entry.url) === hostname)
}

function attachNavigationGuard(browserTabId: string, entry: ForgeWebAppEntry): void {
  if (tabsWithNavigationGuard.has(browserTabId)) {
    return
  }
  const webview = webviewRegistry.get(browserTabId)
  if (!webview) {
    return
  }
  tabsWithNavigationGuard.add(browserTabId)

  const handleWillNavigate = (event: Electron.WillNavigateEvent): void => {
    if (decideForgeWebAppNavigation(entry.id, event.url) === 'open-externally') {
      event.preventDefault()
      void window.api.shell.openUrl?.(event.url)
    }
  }
  webview.addEventListener('will-navigate', handleWillNavigate)
  webview.addEventListener('destroyed', () => tabsWithNavigationGuard.delete(browserTabId))
}

/** Watches floating browser tabs and attaches the pinned-app navigation guard as they mount. */
export function installForgeWebAppNavigationGuards(): () => void {
  return useAppStore.subscribe((state) => {
    const tabs = state.browserTabsByWorktree[FLOATING_TERMINAL_WORKTREE_ID] ?? []
    for (const tab of tabs) {
      const entry = matchEntryForUrl(tab.url)
      if (entry) {
        attachNavigationGuard(tab.id, entry)
      }
    }
  })
}
