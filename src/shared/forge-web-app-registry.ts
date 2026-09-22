// Declarative catalog of pinned web apps rendered by the existing browser pane (src/main/browser/).
// Adding a tool means adding one entry here — no new code per app.

export type ForgeWebAppCategory = 'comunicacao' | 'produtividade' | 'ia' | 'engenharia' | 'outros'

export type ForgeWebAppEntry = {
  /** Stable identifier; also used to derive the isolated session profile. */
  id: string
  title: string
  url: string
  /** lucide-react icon name, resolved by the renderer's icon map. */
  icon: string
  category: ForgeWebAppCategory
  /**
   * Hostnames allowed to load in-app (exact match or subdomain of one of these).
   * Navigation to any other host is sent to the system browser instead of the pinned tab.
   * Defaults to the `url` hostname when omitted.
   */
  allowedHosts?: string[]
}

export const FORGE_WEB_APP_REGISTRY: readonly ForgeWebAppEntry[] = [
  {
    id: 'teams',
    title: 'Teams',
    url: 'https://teams.microsoft.com',
    icon: 'teams',
    category: 'comunicacao',
    allowedHosts: ['teams.microsoft.com', 'login.microsoftonline.com']
  },
  {
    id: 'outlook-calendar',
    title: 'Calendário',
    url: 'https://outlook.office.com/calendar',
    icon: 'calendar',
    category: 'comunicacao',
    allowedHosts: ['outlook.office.com', 'outlook.office365.com', 'login.microsoftonline.com']
  },
  {
    id: 'openwebui',
    title: 'OpenWebUI',
    url: 'http://localhost:3000',
    icon: 'openwebui',
    category: 'ia'
  }
]

export function getForgeWebAppEntry(id: string): ForgeWebAppEntry | undefined {
  return FORGE_WEB_APP_REGISTRY.find((entry) => entry.id === id)
}

export function listForgeWebAppEntries(): readonly ForgeWebAppEntry[] {
  return FORGE_WEB_APP_REGISTRY
}
