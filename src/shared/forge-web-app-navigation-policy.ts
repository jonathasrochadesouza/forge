// Decides whether a navigation inside a pinned web app stays in the app's tab or should be
// handed to the system browser. Pure logic, usable from both main and renderer.
import { getForgeWebAppEntry } from './forge-web-app-registry'

export type ForgeWebAppNavigationDecision = 'stay-in-app' | 'open-externally'

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

function isHostAllowed(hostname: string, allowedHosts: readonly string[]): boolean {
  return allowedHosts.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`))
}

/**
 * Decides how a navigation target should be handled for a given pinned web app.
 * Same-domain (or explicit allowedHosts) navigation stays in the app's tab; everything else
 * — including a plain click on an external link — opens in the system browser.
 */
export function decideForgeWebAppNavigation(
  webAppId: string,
  targetUrl: string
): ForgeWebAppNavigationDecision {
  const entry = getForgeWebAppEntry(webAppId)
  if (!entry) {
    return 'open-externally'
  }
  const targetHost = hostnameOf(targetUrl)
  if (!targetHost) {
    return 'open-externally'
  }
  const allowedHosts =
    entry.allowedHosts ?? [hostnameOf(entry.url)].filter((host): host is string => host !== null)
  return isHostAllowed(targetHost, allowedHosts) ? 'stay-in-app' : 'open-externally'
}
