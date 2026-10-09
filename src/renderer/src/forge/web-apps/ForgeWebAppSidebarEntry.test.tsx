// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { TooltipProvider } from '@/components/ui/tooltip'

const mocks = vi.hoisted<{
  tabsByWorktree: Record<string, { id: string; url: string; title: string }[]>
  installGuards: ReturnType<typeof vi.fn>
}>(() => ({
  tabsByWorktree: {},
  installGuards: vi.fn(() => () => {})
}))

vi.mock('./forge-web-app-launch', () => ({ openForgeWebApp: vi.fn() }))
vi.mock('./forge-web-app-navigation-guard', () => ({
  installForgeWebAppNavigationGuards: mocks.installGuards
}))
vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: unknown) => unknown) =>
      selector({ browserTabsByWorktree: mocks.tabsByWorktree }),
    { getState: () => ({}) }
  )
}))

import { ForgeWebAppSidebarEntry } from './ForgeWebAppSidebarEntry'

describe('ForgeWebAppSidebarEntry', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.tabsByWorktree = {}
    mocks.installGuards.mockClear()
  })

  afterEach(cleanup)

  it('renders the expanded row with its visible label', () => {
    render(<ForgeWebAppSidebarEntry />)

    expect(screen.getByRole('button', { name: 'Pinned apps' }).textContent).toBe('Pinned apps')
  })

  describe('compact (collapsed rail)', () => {
    function renderCompact(): void {
      render(
        <TooltipProvider delayDuration={0}>
          <ForgeWebAppSidebarEntry compact />
        </TooltipProvider>
      )
    }

    it('renders an icon-only dropdown trigger named by its label', () => {
      renderCompact()

      const trigger = screen.getByRole('button', { name: 'Pinned apps' })
      expect(trigger.textContent).toBe('')
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    })

    it('sums every pinned app unread count into one corner badge', () => {
      mocks.tabsByWorktree = {
        [FLOATING_TERMINAL_WORKTREE_ID]: [
          { id: 'tab-1', url: 'https://teams.microsoft.com/', title: '(5) Microsoft Teams' }
        ]
      }
      renderCompact()

      expect(screen.getByRole('button', { name: 'Pinned apps' }).textContent).toBe('5')
    })

    it('keeps the pinned-app navigation guards installed while the sidebar is collapsed', () => {
      renderCompact()

      expect(mocks.installGuards).toHaveBeenCalledTimes(1)
    })
  })
})
