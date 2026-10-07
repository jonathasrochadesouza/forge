// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const mocks = vi.hoisted<{
  setSidebarOpen: Mock
  revealWorktreeInSidebar: Mock
  activeWorktreeId: string | null
}>(() => ({
  setSidebarOpen: vi.fn(),
  revealWorktreeInSidebar: vi.fn(),
  activeWorktreeId: 'wt-1'
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: FooterCardTestStoreState) => unknown) =>
      selector({ activeWorktreeId: mocks.activeWorktreeId }),
    {
      getState: () => ({
        setSidebarOpen: mocks.setSidebarOpen,
        revealWorktreeInSidebar: mocks.revealWorktreeInSidebar
      })
    }
  )
}))
vi.mock('@/store/selectors', () => ({
  useRepoMap: () => new Map([['repo-1', { id: 'repo-1', displayName: 'forge', repoIcon: null }]]),
  useWorktreeMap: () =>
    new Map([['wt-1', { id: 'wt-1', repoId: 'repo-1', displayName: 'feat/sidebar' }]])
}))
vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string, params?: { value0?: string }) =>
    params?.value0 !== undefined ? fallback.replace('{{value0}}', params.value0) : fallback,
  i18n: { language: 'en' }
}))
vi.mock('@/components/repo/repo-icon', () => ({
  RepoIconGlyph: () => <span data-testid="repo-glyph" />
}))
vi.mock('@/components/sidebar/use-worktree-activity-status', () => ({
  useWorktreeActivityStatus: () => 'working'
}))
vi.mock('@/components/sidebar/StatusIndicator', () => ({
  default: () => <span data-testid="status-dot" />
}))

type FooterCardTestStoreState = {
  activeWorktreeId: string | null
}

import { ForgeProjectsFocusFooterCard } from './ForgeProjectsFocusFooterCard'

describe('ForgeProjectsFocusFooterCard', () => {
  afterEach(() => {
    cleanup()
    mocks.activeWorktreeId = 'wt-1'
  })

  it('shows the focused project name, workspace, status dot, and repo glyph', () => {
    render(<ForgeProjectsFocusFooterCard />)

    expect(screen.getByText('forge')).toBeTruthy()
    expect(screen.getByText('feat/sidebar')).toBeTruthy()
    expect(screen.getByTestId('status-dot')).toBeTruthy()
    expect(screen.getByTestId('repo-glyph')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Current project: forge' })).toBeTruthy()
  })

  it('renders nothing when no workspace is active', () => {
    mocks.activeWorktreeId = null
    const { container } = render(<ForgeProjectsFocusFooterCard />)

    expect(container.childElementCount).toBe(0)
  })

  it('clicking it opens the panel and reveals the active workspace', () => {
    render(<ForgeProjectsFocusFooterCard />)

    fireEvent.click(screen.getByRole('button', { name: 'Current project: forge' }))

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false)
    expect(mocks.revealWorktreeInSidebar).toHaveBeenCalledWith('wt-1', {
      behavior: 'auto',
      highlight: true
    })
  })
})
