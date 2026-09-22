// Resolves the isolated browser session profile for a pinned web app, reusing the existing
// sessionListProfiles/sessionCreateProfile IPC (browser-session-profile-ipc) so each app keeps
// its own cookie jar without a dedicated web-app IPC surface.
import type { BrowserSessionProfile } from '../../../../shared/browser-workspace-types'
import { getForgeWebAppEntry } from '../../../../shared/forge-web-app-registry'

// Why: profiles are keyed by label, not app id — prefix disambiguates from user-created labels.
function forgeWebAppProfileLabel(webAppId: string, title: string): string {
  return `forge-web-app:${webAppId}:${title}`
}

export async function resolveForgeWebAppSessionProfile(
  webAppId: string
): Promise<BrowserSessionProfile | null> {
  const entry = getForgeWebAppEntry(webAppId)
  if (!entry) {
    return null
  }
  const label = forgeWebAppProfileLabel(webAppId, entry.title)
  const profiles = await window.api.browser.sessionListProfiles()
  const existing = profiles.find((profile) => profile.label === label)
  if (existing) {
    return existing
  }
  return window.api.browser.sessionCreateProfile({ scope: 'isolated', label })
}
