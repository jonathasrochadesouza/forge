// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { ForgeWebAppFavoriteSidebarEntry } from './ForgeWebAppFavoriteSidebarEntry'

type FavoriteTestStoreState = {
  browserTabsByWorktree: Record<string, { id: string; url: string; title: string }[]>
}

const storeBox = vi.hoisted<{ state: unknown }>(() => ({ state: null }))

const mocks = vi.hoisted<{
  openForgeWebApp: Mock
  tabsByWorktree: FavoriteTestStoreState['browserTabsByWorktree']
}>(() => ({
  openForgeWebApp: vi.fn(),
  tabsByWorktree: {}
}))

vi.mock('./forge-web-app-launch', () => ({ openForgeWebApp: mocks.openForgeWebApp }))
vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: FavoriteTestStoreState) => unknown) =>
      selector({
        browserTabsByWorktree: mocks.tabsByWorktree
      }),
    { getState: () => storeBox.state }
  )
}))

import { setForgeWebAppFavoriteId } from './forge-web-app-favorite'

describe('ForgeWebAppFavoriteSidebarEntry', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.openForgeWebApp.mockReset()
    mocks.tabsByWorktree = {}
  })

  afterEach(() => {
    cleanup()
    setForgeWebAppFavoriteId(null)
  })

  it('renders nothing when no app is favorited', () => {
    const { container } = render(<ForgeWebAppFavoriteSidebarEntry />)
    expect(container.childElementCount).toBe(0)
  })

  it('renders the favorited app as a sidebar button that opens it on click', async () => {
    setForgeWebAppFavoriteId('teams')
    render(<ForgeWebAppFavoriteSidebarEntry />)

    const button = screen.getByRole('button', { name: 'Open pinned app' })
    expect(button.textContent).toContain('Teams')

    fireEvent.click(button)
    await waitFor(() => {
      expect(mocks.openForgeWebApp).toHaveBeenCalledWith('teams')
    })
  })

  it('shows the unread badge from the floating tab title', () => {
    setForgeWebAppFavoriteId('teams')
    mocks.tabsByWorktree = {
      [FLOATING_TERMINAL_WORKTREE_ID]: [
        { id: 'tab-1', url: 'https://teams.microsoft.com/', title: '(5) Microsoft Teams' }
      ]
    }
    render(<ForgeWebAppFavoriteSidebarEntry />)

    expect(screen.getByRole('button', { name: 'Open pinned app' }).textContent).toContain('5')
  })

  it('removes the favorite from the context menu', async () => {
    setForgeWebAppFavoriteId('teams')
    render(<ForgeWebAppFavoriteSidebarEntry />)

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Open pinned app' }))
    fireEvent.click(screen.getByText('Remove from favorites'))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Open pinned app' })).toBeNull()
    })
    expect(window.localStorage.getItem('orca.forge.webAppFavorite.v1')).toBeNull()
  })
})
