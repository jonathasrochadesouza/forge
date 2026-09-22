// Opens a pinned web app (src/shared/forge-web-app-registry.ts) as a floating browser tab,
// reusing the existing floating-workspace browser pane (src/main/browser/) — no new tab surface.
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { TOGGLE_FLOATING_TERMINAL_EVENT } from '@/lib/floating-terminal'
import { isFloatingWorkspacePanelVisible } from '@/lib/floating-workspace-terminal-actions'
import { useAppStore } from '@/store'
import { getForgeWebAppEntry } from '../../../../shared/forge-web-app-registry'
import { resolveForgeWebAppSessionProfile } from './forge-web-app-session-profile'

function revealFloatingWorkspacePanel(): void {
  requestAnimationFrame(() => {
    if (!isFloatingWorkspacePanelVisible()) {
      window.dispatchEvent(new CustomEvent(TOGGLE_FLOATING_TERMINAL_EVENT))
    }
  })
}

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin
  } catch {
    return false
  }
}

/** Opens (or focuses, if already open) the pinned web app's floating browser tab. */
export async function openForgeWebApp(webAppId: string): Promise<void> {
  const entry = getForgeWebAppEntry(webAppId)
  if (!entry) {
    return
  }
  const store = useAppStore.getState()
  if (store.settings?.floatingTerminalEnabled !== true) {
    await store.updateSettings({ floatingTerminalEnabled: true })
  }

  const existingTab = (store.browserTabsByWorktree[FLOATING_TERMINAL_WORKTREE_ID] ?? []).find(
    (tab) => sameOrigin(tab.url, entry.url)
  )
  if (existingTab) {
    store.setActiveBrowserTab(existingTab.id)
    revealFloatingWorkspacePanel()
    return
  }

  const profile = await resolveForgeWebAppSessionProfile(webAppId)
  store.createBrowserTab(FLOATING_TERMINAL_WORKTREE_ID, entry.url, {
    title: entry.title,
    activate: true,
    ...(profile ? { sessionProfileId: profile.id } : {})
  })
  revealFloatingWorkspacePanel()
}
