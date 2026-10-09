// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

type RailTestState = {
  activeView: string
  settings: Record<string, unknown> | null
  activeModal: string | null
  persistedUIReady: boolean
  setupGuideSidebarDismissed: boolean
  agentDashboardDrawerOpen: boolean
  openModal: Mock
  openTaskPage: Mock
  openArtifactsPage: Mock
  openSkillsPage: Mock
  openAutomationsPage: Mock
  openMobilePage: Mock
  setAgentDashboardDrawerOpen: Mock
}

const box = vi.hoisted<{
  state: RailTestState | null
  setupProgress: {
    ready: boolean
    coreDoneCount: number
    coreTotal: number
    stepDone: Record<string, boolean>
  }
  mobileBadge: { visible: boolean; dismiss: Mock }
}>(() => ({
  state: null,
  setupProgress: { ready: true, coreDoneCount: 1, coreTotal: 4, stepDone: {} },
  mobileBadge: { visible: false, dismiss: vi.fn() }
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: RailTestState) => unknown) => selector(box.state!)
}))
vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({}) }))
vi.mock('@/lib/left-sidebar-appearance', () => ({
  resolveLeftSidebarStyleVariables: () => undefined
}))
vi.mock('@/components/terminal-pane/use-system-prefers-dark', () => ({
  useSystemPrefersDark: () => false
}))
vi.mock('@/components/sidebar/SidebarNav', () => ({
  shouldShowMobileButton: (s: { showMobileButton?: boolean } | null) =>
    s?.showMobileButton !== false,
  shouldShowAutomationsButton: (s: { showAutomationsButton?: boolean } | null) =>
    s?.showAutomationsButton !== false,
  shouldShowArtifactsButton: (s: { showArtifactsButton?: boolean } | null) =>
    s?.showArtifactsButton === true,
  shouldShowSkillsButton: (s: { showSkillsButton?: boolean } | null) =>
    s?.showSkillsButton === true,
  shouldShowAgentDashboardButton: (s: { experimentalAgentDashboardPopout?: boolean } | null) =>
    s?.experimentalAgentDashboardPopout === true
}))
vi.mock('@/components/sidebar/mobile-sidebar-onboarding-badge', () => ({
  useMobileSidebarOnboardingBadge: () => box.mobileBadge
}))
vi.mock('@/components/sidebar/SetupGuideSidebarEntry', () => ({
  shouldShowSetupGuideEntry: (i: { ready: boolean; setupComplete: boolean; dismissed: boolean }) =>
    i.ready && !i.setupComplete && !i.dismissed,
  getSetupGuideSidebarEntryReady: (a: boolean, b: boolean) => a && b
}))
vi.mock('@/components/setup-guide/SetupGuideProgressRing', () => ({
  SetupGuideProgressRing: () => <svg data-testid="setup-ring" />
}))
vi.mock('@/components/setup-guide/use-setup-guide-progress', () => ({
  useSetupGuideProgress: () => box.setupProgress
}))
vi.mock('../../../../shared/feature-wall-setup-steps', () => ({
  getFirstIncompleteFeatureWallSetupStepId: () => 'first-step'
}))
vi.mock('./ForgeSecondarySidebarNavEntry', () => ({
  ForgeSecondarySidebarNavEntry: ({ compact }: { compact?: boolean }) => (
    <div data-testid="projects-entry" data-compact={String(compact === true)} />
  )
}))
vi.mock('../web-apps/ForgeWebAppFavoriteSidebarEntry', () => ({
  ForgeWebAppFavoriteSidebarEntry: ({ compact }: { compact?: boolean }) => (
    <div data-testid="favorite-entry" data-compact={String(compact === true)} />
  )
}))
vi.mock('../web-apps/ForgeWebAppSidebarEntry', () => ({
  ForgeWebAppSidebarEntry: ({ compact }: { compact?: boolean }) => (
    <div data-testid="pinned-entry" data-compact={String(compact === true)} />
  )
}))

import { ForgeCollapsedSidebarRail } from './ForgeCollapsedSidebarRail'

function makeState(overrides: Partial<RailTestState> = {}): RailTestState {
  return {
    activeView: 'terminal',
    settings: {},
    activeModal: null,
    persistedUIReady: true,
    setupGuideSidebarDismissed: false,
    agentDashboardDrawerOpen: false,
    openModal: vi.fn(),
    openTaskPage: vi.fn(),
    openArtifactsPage: vi.fn(),
    openSkillsPage: vi.fn(),
    openAutomationsPage: vi.fn(),
    openMobilePage: vi.fn(),
    setAgentDashboardDrawerOpen: vi.fn(),
    ...overrides
  }
}

function setState(overrides: Partial<RailTestState> = {}): RailTestState {
  box.state = makeState(overrides)
  return box.state
}

describe('ForgeCollapsedSidebarRail', () => {
  beforeEach(() => {
    box.setupProgress = { ready: true, coreDoneCount: 4, coreTotal: 4, stepDone: {} }
    box.mobileBadge = { visible: false, dismiss: vi.fn() }
    setState()
  })

  afterEach(() => {
    cleanup()
    Reflect.deleteProperty(window, 'api')
  })

  it('renders the default nav as icon-only buttons with no visible text', () => {
    render(<ForgeCollapsedSidebarRail />)

    for (const name of ['Search', 'Tasks', 'Automations', 'Orca Mobile']) {
      expect(screen.getByRole('button', { name }).textContent).toBe('')
    }
    expect(screen.queryByRole('button', { name: 'Artifacts' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Skills' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Agent Dashboard' })).toBeNull()
  })

  it('mounts the Forge-owned entries in their compact variants', () => {
    render(<ForgeCollapsedSidebarRail />)

    for (const id of ['favorite-entry', 'pinned-entry', 'projects-entry']) {
      expect(screen.getByTestId(id).getAttribute('data-compact')).toBe('true')
    }
  })

  it('follows the same visibility settings as the expanded nav', () => {
    setState({
      settings: {
        showTasksButton: false,
        showAutomationsButton: false,
        showMobileButton: false,
        showArtifactsButton: true,
        showSkillsButton: true
      }
    })
    render(<ForgeCollapsedSidebarRail />)

    expect(screen.queryByRole('button', { name: 'Tasks' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Automations' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Orca Mobile' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Artifacts' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Skills' })).toBeTruthy()
  })

  it.each([
    ['tasks', 'Tasks'],
    ['automations', 'Automations'],
    ['mobile', 'Orca Mobile'],
    ['artifacts', 'Artifacts'],
    ['skills', 'Skills']
  ])('marks %s active only while that view is open', (view, name) => {
    setState({
      activeView: view,
      settings: { showArtifactsButton: true, showSkillsButton: true }
    })
    render(<ForgeCollapsedSidebarRail />)

    expect(screen.getByRole('button', { name }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Search' }).getAttribute('aria-current')).toBeNull()
  })

  it('routes clicks to the same actions as the expanded nav', () => {
    const state = setState({ settings: { showArtifactsButton: true, showSkillsButton: true } })
    render(<ForgeCollapsedSidebarRail />)

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }))
    fireEvent.click(screen.getByRole('button', { name: 'Artifacts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Skills' }))
    fireEvent.click(screen.getByRole('button', { name: 'Automations' }))
    fireEvent.click(screen.getByRole('button', { name: 'Orca Mobile' }))

    expect(state.openModal).toHaveBeenCalledWith('worktree-palette')
    expect(state.openTaskPage).toHaveBeenCalledWith()
    expect(state.openArtifactsPage).toHaveBeenCalledTimes(1)
    expect(state.openSkillsPage).toHaveBeenCalledTimes(1)
    expect(state.openAutomationsPage).toHaveBeenCalledTimes(1)
    expect(state.openMobilePage).toHaveBeenCalledTimes(1)
    expect(box.mobileBadge.dismiss).toHaveBeenCalledTimes(1)
  })

  it('opens the dashboard drawer, or the popout when configured', () => {
    const state = setState({ settings: { experimentalAgentDashboardPopout: true } })
    const openPopout = vi.fn()
    Object.defineProperty(window, 'api', {
      value: { dashboard: { openPopout } },
      configurable: true
    })
    const { unmount } = render(<ForgeCollapsedSidebarRail />)

    fireEvent.click(screen.getByRole('button', { name: 'Agent Dashboard' }))
    expect(state.setAgentDashboardDrawerOpen).toHaveBeenCalledWith(true)
    unmount()

    setState({
      settings: {
        experimentalAgentDashboardPopout: true,
        experimentalAgentDashboardMode: 'popout'
      }
    })
    render(<ForgeCollapsedSidebarRail />)
    fireEvent.click(screen.getByRole('button', { name: 'Agent Dashboard' }))
    expect(openPopout).toHaveBeenCalledTimes(1)
  })

  it('shows the onboarding checklist until setup completes, then hides it', () => {
    box.setupProgress = { ready: true, coreDoneCount: 1, coreTotal: 4, stepDone: {} }
    const state = setState()
    const { unmount } = render(<ForgeCollapsedSidebarRail />)

    fireEvent.click(screen.getByRole('button', { name: 'Onboarding checklist' }))
    expect(state.openModal).toHaveBeenCalledWith('setup-guide', {
      setupStepId: 'first-step',
      telemetrySource: 'sidebar'
    })
    unmount()

    box.setupProgress = { ready: true, coreDoneCount: 4, coreTotal: 4, stepDone: {} }
    render(<ForgeCollapsedSidebarRail />)
    expect(screen.queryByRole('button', { name: 'Onboarding checklist' })).toBeNull()
  })

  it('flags the Orca Mobile button while the onboarding badge is pending', () => {
    box.mobileBadge = { visible: true, dismiss: vi.fn() }
    render(<ForgeCollapsedSidebarRail />)

    const button = screen.getByRole('button', { name: 'Orca Mobile' })
    expect(button.querySelector('span')).not.toBeNull()
  })

  it('sits below the floating titlebar header when it reserves height', () => {
    render(<ForgeCollapsedSidebarRail reserveTitlebarHeight={36} />)

    const rail = document.querySelector<HTMLElement>('[data-forge-collapsed-sidebar-rail]')
    expect(rail?.style.paddingTop).toBe('44px')
  })

  it('keeps a plain top gap when no header floats', () => {
    render(<ForgeCollapsedSidebarRail />)

    const rail = document.querySelector<HTMLElement>('[data-forge-collapsed-sidebar-rail]')
    expect(rail?.style.paddingTop).toBe('8px')
  })
})
