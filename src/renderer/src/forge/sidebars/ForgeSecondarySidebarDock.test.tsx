// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'

const mocks = vi.hoisted<{ setSidebarOpen: Mock; revealRedirect: Mock }>(() => ({
  setSidebarOpen: vi.fn(),
  revealRedirect: vi.fn()
}))

const storeBox = vi.hoisted<{ state: DockTestStoreState | null }>(() => ({ state: null }))

type DockTestStoreState = {
  sidebarWidth: number
  sidebarBody: 'workspaces' | 'agents'
  settings: null
  setSidebarBody: Mock
}

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: DockTestStoreState) => unknown) => selector(storeBox.state!),
    { getState: () => ({ setSidebarOpen: mocks.setSidebarOpen }) }
  )
}))
vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string, params?: { value0?: string }) =>
    params?.value0 !== undefined ? fallback.replace('{{value0}}', params.value0) : fallback,
  i18n: { language: 'en' }
}))
vi.mock('@/components/terminal-pane/use-system-prefers-dark', () => ({
  useSystemPrefersDark: () => false
}))
vi.mock('@/lib/left-sidebar-appearance', () => ({
  resolveLeftSidebarStyleVariables: () => undefined
}))
vi.mock('@/components/sidebar/sidebar-header-actions', () => ({
  SidebarHeaderActions: () => <div data-testid="panel-actions" />
}))
vi.mock('@/components/sidebar/use-workspace-reveal-body-redirect', () => ({
  useWorkspaceRevealBodyRedirect: mocks.revealRedirect
}))
vi.mock('./ForgeProjectsSidebarPanel', () => ({
  ForgeProjectsSidebarPanel: () => <div data-testid="projects-panel" />
}))
vi.mock('./ForgeActivitySidebarPanel', () => ({
  ForgeActivitySidebarPanel: () => <div data-testid="activity-panel" />
}))

import {
  ForgeSecondarySidebarDock,
  buildForgeSecondarySidebarDockStyle
} from './ForgeSecondarySidebarDock'
import {
  closeForgeSecondarySidebar,
  openForgeSecondarySidebar
} from './forge-secondary-sidebar-store'
import { TooltipProvider } from '@/components/ui/tooltip'

function renderDock(): void {
  render(
    <TooltipProvider delayDuration={0}>
      <ForgeSecondarySidebarDock reserveTitlebarHeight={36} />
    </TooltipProvider>
  )
}

describe('ForgeSecondarySidebarDock', () => {
  beforeEach(() => {
    mocks.revealRedirect.mockClear()
    storeBox.state = {
      sidebarWidth: 280,
      sidebarBody: 'workspaces',
      settings: null,
      setSidebarBody: vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
    closeForgeSecondarySidebar()
  })

  it('renders nothing while the panel is closed', () => {
    renderDock()

    expect(document.querySelector('[data-forge-secondary-sidebar]')).toBeNull()
  })

  it('renders the header back row, actions strip, and projects body when open', () => {
    renderDock()
    act(() => {
      openForgeSecondarySidebar('projects')
    })

    const dock = document.querySelector('[data-forge-secondary-sidebar]')
    expect(dock).not.toBeNull()
    expect(dock?.className).toContain('shrink-0')
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy()
    expect(screen.getByTestId('panel-actions')).toBeTruthy()
    expect(screen.getByTestId('projects-panel')).toBeTruthy()
  })

  it('closes the panel from anywhere in the full-row header and restores the default sidebar', () => {
    renderDock()
    act(() => {
      openForgeSecondarySidebar('projects')
    })
    mocks.setSidebarOpen.mockClear()

    fireEvent.click(screen.getByText('Projects'))

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(true)
    expect(document.querySelector('[data-forge-secondary-sidebar]')).toBeNull()
  })

  it('shows the activity body while the sidebar body is agents', () => {
    storeBox.state = { ...storeBox.state!, sidebarBody: 'agents' }
    renderDock()
    act(() => {
      openForgeSecondarySidebar('projects')
    })

    expect(screen.getByTestId('activity-panel')).toBeTruthy()
    expect(screen.queryByTestId('projects-panel')).toBeNull()
  })

  it('marks the activity toggle pressed and toggles the sidebar body from it', () => {
    renderDock()
    act(() => {
      openForgeSecondarySidebar('projects')
    })

    const bell = screen.getByRole('button', { name: 'View activity' })
    expect(bell.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(bell)
    expect(storeBox.state!.setSidebarBody).toHaveBeenCalledWith('agents')
  })

  it('reserves the titlebar height via the dock style', () => {
    renderDock()
    act(() => {
      openForgeSecondarySidebar('projects')
    })

    const dock = document.querySelector<HTMLElement>('[data-forge-secondary-sidebar]')
    expect(dock?.style.paddingTop).toBe('36px')
  })

  it('dock style tracks the left sidebar width for the content push', () => {
    const style = buildForgeSecondarySidebarDockStyle(280, 36, undefined)

    expect(style.width).toBe('var(--workspace-sidebar-live-width, 280px)')
    expect(style.paddingTop).toBe(36)
  })
})
