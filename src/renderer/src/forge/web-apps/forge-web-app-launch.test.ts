import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { openForgeWebApp } from './forge-web-app-launch'

type ForgeWebAppLaunchTestMocks = {
  createBrowserTab: Mock
  setActiveBrowserTab: Mock
  updateSettings: Mock
  resolveProfile: Mock
  toastError: Mock
  storeSettings: { floatingTerminalEnabled?: boolean } | null
  tabsByWorktree: Record<string, { id: string; url: string }[]>
}

const mocks = vi.hoisted<ForgeWebAppLaunchTestMocks>(() => ({
  createBrowserTab: vi.fn(),
  setActiveBrowserTab: vi.fn(),
  updateSettings: vi.fn(),
  resolveProfile: vi.fn(),
  toastError: vi.fn(),
  storeSettings: { floatingTerminalEnabled: true },
  tabsByWorktree: {}
}))

vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }))
vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('@/lib/floating-workspace-terminal-actions', () => ({
  isFloatingWorkspacePanelVisible: () => true
}))
vi.mock('./forge-web-app-session-profile', () => ({
  resolveForgeWebAppSessionProfile: mocks.resolveProfile
}))
vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => ({
      settings: mocks.storeSettings,
      browserTabsByWorktree: mocks.tabsByWorktree,
      createBrowserTab: mocks.createBrowserTab,
      setActiveBrowserTab: mocks.setActiveBrowserTab,
      updateSettings: mocks.updateSettings
    })
  }
}))

const TEAMS_PROFILE = {
  id: 'profile-teams',
  scope: 'isolated',
  partition: 'persist:orca-browser-session-abc123',
  label: 'forge-web-app:teams:Teams',
  source: null
}

describe('openForgeWebApp', () => {
  beforeEach(() => {
    mocks.createBrowserTab.mockReset()
    mocks.setActiveBrowserTab.mockReset()
    mocks.updateSettings.mockReset()
    mocks.resolveProfile.mockReset()
    mocks.toastError.mockReset()
    mocks.storeSettings = { floatingTerminalEnabled: true }
    mocks.tabsByWorktree = {}
  })

  it('creates the tab with the resolved profile id AND partition on first open', async () => {
    mocks.resolveProfile.mockResolvedValue(TEAMS_PROFILE)

    await openForgeWebApp('teams')

    expect(mocks.resolveProfile).toHaveBeenCalledWith('teams')
    expect(mocks.createBrowserTab).toHaveBeenCalledWith(
      FLOATING_TERMINAL_WORKTREE_ID,
      'https://teams.microsoft.com',
      {
        title: 'Teams',
        activate: true,
        sessionProfileId: 'profile-teams',
        sessionPartition: 'persist:orca-browser-session-abc123'
      }
    )
  })

  it('omits session options when profile resolution returns null', async () => {
    mocks.resolveProfile.mockResolvedValue(null)

    await openForgeWebApp('teams')

    expect(mocks.createBrowserTab).toHaveBeenCalledWith(
      FLOATING_TERMINAL_WORKTREE_ID,
      'https://teams.microsoft.com',
      { title: 'Teams', activate: true }
    )
  })

  it('focuses the existing same-origin tab instead of creating one', async () => {
    mocks.tabsByWorktree[FLOATING_TERMINAL_WORKTREE_ID] = [
      { id: 'tab-1', url: 'https://teams.microsoft.com/v2/' }
    ]

    await openForgeWebApp('teams')

    expect(mocks.setActiveBrowserTab).toHaveBeenCalledWith('tab-1')
    expect(mocks.createBrowserTab).not.toHaveBeenCalled()
    expect(mocks.resolveProfile).not.toHaveBeenCalled()
  })

  it('enables the floating terminal when it is off', async () => {
    mocks.storeSettings = { floatingTerminalEnabled: false }
    mocks.resolveProfile.mockResolvedValue(TEAMS_PROFILE)

    await openForgeWebApp('teams')

    expect(mocks.updateSettings).toHaveBeenCalledWith({ floatingTerminalEnabled: true })
    expect(mocks.createBrowserTab).toHaveBeenCalled()
  })

  it('surfaces a toast and does not throw when profile resolution fails', async () => {
    mocks.resolveProfile.mockRejectedValue(new Error('ipc failed'))

    await expect(openForgeWebApp('teams')).resolves.toBeUndefined()

    expect(mocks.toastError).toHaveBeenCalledOnce()
    expect(mocks.createBrowserTab).not.toHaveBeenCalled()
  })

  it('no-ops for an unknown pinned app id', async () => {
    await openForgeWebApp('does-not-exist')

    expect(mocks.resolveProfile).not.toHaveBeenCalled()
    expect(mocks.createBrowserTab).not.toHaveBeenCalled()
  })
})
