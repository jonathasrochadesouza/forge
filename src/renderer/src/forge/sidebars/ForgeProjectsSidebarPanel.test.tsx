// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

const mocks = vi.hoisted<{ setSidebarOpen: Mock }>(() => ({ setSidebarOpen: vi.fn() }))

vi.mock('@/store', () => ({
  useAppStore: { getState: () => ({ setSidebarOpen: mocks.setSidebarOpen }) }
}))
vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))

type PanelWorktreeListProps = {
  scrollOffsetRef: { current: number }
  scrollAnchorRef: { current: unknown }
  onWorktreeCardClick: () => void
}

const worktreeListSpy = vi.hoisted(() => ({
  component: vi.fn((_props: PanelWorktreeListProps) => <div data-testid="worktree-list" />)
}))

vi.mock('@/components/sidebar/WorktreeList', () => ({ default: worktreeListSpy.component }))

import { ForgeProjectsSidebarPanel } from './ForgeProjectsSidebarPanel'
import {
  closeForgeSecondarySidebar,
  forgeProjectsWorktreeScrollAnchorRef,
  forgeProjectsWorktreeScrollOffsetRef,
  openForgeSecondarySidebar
} from './forge-secondary-sidebar-store'

describe('ForgeProjectsSidebarPanel', () => {
  afterEach(() => {
    cleanup()
    closeForgeSecondarySidebar()
    worktreeListSpy.component.mockClear()
  })

  it('renders the workspace tree with the panel scroll refs and card-close wiring', () => {
    openForgeSecondarySidebar('projects')
    render(<ForgeProjectsSidebarPanel />)

    expect(screen.getByTestId('worktree-list')).toBeTruthy()
    const props = worktreeListSpy.component.mock.calls[0]![0]
    expect(props.scrollOffsetRef).toBe(forgeProjectsWorktreeScrollOffsetRef)
    expect(props.scrollAnchorRef).toBe(forgeProjectsWorktreeScrollAnchorRef)

    props.onWorktreeCardClick()
    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(true)
  })
})
