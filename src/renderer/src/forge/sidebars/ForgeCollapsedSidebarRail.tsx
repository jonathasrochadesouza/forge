// Collapsed-sidebar rail (FORGE-94): when the worktree sidebar is collapsed, a narrow strip keeps
// every nav button reachable as an icon with a tooltip. Same actions and active states as
// SidebarNav; the Forge-owned entries (pinned apps, Projects) render their own compact variants.
import React from 'react'
import {
  BookOpen,
  CalendarClock,
  Files,
  LayoutDashboard,
  List,
  Search,
  Smartphone
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store'
import { translate } from '@/i18n/i18n'
import { TooltipProvider } from '@/components/ui/tooltip'
import { resolveLeftSidebarStyleVariables } from '@/lib/left-sidebar-appearance'
import { useSystemPrefersDark } from '@/components/terminal-pane/use-system-prefers-dark'
import {
  shouldShowAgentDashboardButton,
  shouldShowArtifactsButton,
  shouldShowAutomationsButton,
  shouldShowMobileButton,
  shouldShowSkillsButton
} from '@/components/sidebar/SidebarNav'
import { useMobileSidebarOnboardingBadge } from '@/components/sidebar/mobile-sidebar-onboarding-badge'
import {
  getSetupGuideSidebarEntryReady,
  shouldShowSetupGuideEntry
} from '@/components/sidebar/SetupGuideSidebarEntry'
import { SetupGuideProgressRing } from '@/components/setup-guide/SetupGuideProgressRing'
import { useSetupGuideProgress } from '@/components/setup-guide/use-setup-guide-progress'
import { getFirstIncompleteFeatureWallSetupStepId } from '../../../../shared/feature-wall-setup-steps'
import { ForgeSecondarySidebarNavEntry } from './ForgeSecondarySidebarNavEntry'
import { ForgeSidebarIconButton } from './ForgeSidebarIconButton'
import { ForgeWebAppFavoriteSidebarEntry } from '../web-apps/ForgeWebAppFavoriteSidebarEntry'
import { ForgeWebAppSidebarEntry } from '../web-apps/ForgeWebAppSidebarEntry'

// Why: one gap above the first icon so it clears the floating titlebar header like the nav does.
const RAIL_TOP_PADDING = 8

function RailSetupGuideButton(): React.JSX.Element | null {
  const openModal = useAppStore((s) => s.openModal)
  const activeModal = useAppStore((s) => s.activeModal)
  const persistedUIReady = useAppStore((s) => s.persistedUIReady)
  const dismissed = useAppStore((s) => s.setupGuideSidebarDismissed)
  const progress = useSetupGuideProgress(true, false, false)
  const visible = shouldShowSetupGuideEntry({
    ready: getSetupGuideSidebarEntryReady(persistedUIReady, progress.ready),
    setupComplete: progress.coreDoneCount >= progress.coreTotal,
    dismissed
  })
  if (!visible) {
    return null
  }
  return (
    <ForgeSidebarIconButton
      label={translate(
        'auto.components.sidebar.SetupGuideSidebarEntry.88d402b71d',
        'Onboarding checklist'
      )}
      active={activeModal === 'setup-guide'}
      onClick={() =>
        openModal('setup-guide', {
          setupStepId: getFirstIncompleteFeatureWallSetupStepId(progress.stepDone),
          telemetrySource: 'sidebar'
        })
      }
    >
      <SetupGuideProgressRing
        done={progress.coreDoneCount}
        total={progress.coreTotal}
        sizeClassName="size-4"
      />
    </ForgeSidebarIconButton>
  )
}

export function ForgeCollapsedSidebarRail({
  reserveTitlebarHeight = 0
}: {
  /** Height of the floating titlebar header the rail must sit under (0 when none floats). */
  reserveTitlebarHeight?: number
}): React.JSX.Element {
  // Why: translate() reads the locale live; this boundary needs its own language subscription.
  useTranslation()
  const activeView = useAppStore((s) => s.activeView)
  const settings = useAppStore((s) => s.settings)
  const openModal = useAppStore((s) => s.openModal)
  const openTaskPage = useAppStore((s) => s.openTaskPage)
  const openArtifactsPage = useAppStore((s) => s.openArtifactsPage)
  const openSkillsPage = useAppStore((s) => s.openSkillsPage)
  const openAutomationsPage = useAppStore((s) => s.openAutomationsPage)
  const openMobilePage = useAppStore((s) => s.openMobilePage)
  const drawerOpen = useAppStore((s) => s.agentDashboardDrawerOpen)
  const setAgentDashboardDrawerOpen = useAppStore((s) => s.setAgentDashboardDrawerOpen)
  const systemPrefersDark = useSystemPrefersDark()
  const leftSidebarStyle = React.useMemo(
    () =>
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: LeftSidebarStyleVariables is a record of CSS custom properties built for style props; same cast the Sidebar root applies.
      resolveLeftSidebarStyleVariables(settings, systemPrefersDark) as
        | React.CSSProperties
        | undefined,
    [settings, systemPrefersDark]
  )
  const showMobile = shouldShowMobileButton(settings)
  const mobileOnboardingBadge = useMobileSidebarOnboardingBadge(showMobile)

  return (
    <TooltipProvider delayDuration={400}>
      <nav
        data-forge-collapsed-sidebar-rail=""
        className="worktree-sidebar-scrollbar flex min-h-0 shrink-0 flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden bg-worktree-sidebar px-1.5 pb-2"
        style={{
          ...leftSidebarStyle,
          width: 'var(--forge-rail-width, 44px)',
          paddingTop: reserveTitlebarHeight + RAIL_TOP_PADDING
        }}
      >
        <ForgeSidebarIconButton
          label={translate('auto.components.sidebar.SidebarNav.80611a8b10', 'Search')}
          onClick={() => openModal('worktree-palette')}
        >
          <Search className="size-4" strokeWidth={1.75} />
        </ForgeSidebarIconButton>
        <RailSetupGuideButton />
        {settings?.showTasksButton !== false ? (
          <ForgeSidebarIconButton
            label={translate('auto.components.sidebar.SidebarNav.fee535205b', 'Tasks')}
            active={activeView === 'tasks'}
            onClick={() => openTaskPage()}
          >
            <List className="size-4" strokeWidth={activeView === 'tasks' ? 2.25 : 1.75} />
          </ForgeSidebarIconButton>
        ) : null}
        <ForgeWebAppFavoriteSidebarEntry compact />
        <ForgeWebAppSidebarEntry compact />
        {shouldShowArtifactsButton(settings) ? (
          <ForgeSidebarIconButton
            label={translate('auto.components.sidebar.SidebarNav.artifacts', 'Artifacts')}
            active={activeView === 'artifacts'}
            onClick={openArtifactsPage}
          >
            <Files className="size-4" strokeWidth={activeView === 'artifacts' ? 2.25 : 1.75} />
          </ForgeSidebarIconButton>
        ) : null}
        {shouldShowSkillsButton(settings) ? (
          <ForgeSidebarIconButton
            label={translate('auto.components.sidebar.SidebarNav.skills', 'Skills')}
            active={activeView === 'skills'}
            onClick={openSkillsPage}
          >
            <BookOpen className="size-4" strokeWidth={activeView === 'skills' ? 2.25 : 1.75} />
          </ForgeSidebarIconButton>
        ) : null}
        {shouldShowAutomationsButton(settings) ? (
          <ForgeSidebarIconButton
            label={translate('auto.components.sidebar.SidebarNav.f323383e9a', 'Automations')}
            active={activeView === 'automations'}
            onClick={openAutomationsPage}
          >
            <CalendarClock
              className="size-4"
              strokeWidth={activeView === 'automations' ? 2.25 : 1.75}
            />
          </ForgeSidebarIconButton>
        ) : null}
        {shouldShowAgentDashboardButton(settings) ? (
          <ForgeSidebarIconButton
            label={translate('dashboard.sidebar.dashboardLabel', 'Agent Dashboard')}
            onClick={() => {
              if (settings?.experimentalAgentDashboardMode === 'popout') {
                void window.api.dashboard.openPopout()
              } else {
                setAgentDashboardDrawerOpen(!drawerOpen)
              }
            }}
          >
            <LayoutDashboard className="size-4" strokeWidth={1.75} />
          </ForgeSidebarIconButton>
        ) : null}
        {showMobile ? (
          <ForgeSidebarIconButton
            label={translate('auto.components.sidebar.SidebarNav.1b5c41caee', 'Orca Mobile')}
            active={activeView === 'mobile'}
            onClick={() => {
              mobileOnboardingBadge.dismiss()
              openMobilePage()
            }}
            badge={
              mobileOnboardingBadge.visible ? (
                <span className="pointer-events-none absolute right-1 top-1 size-2 rounded-full bg-primary" />
              ) : null
            }
          >
            <Smartphone className="size-4" strokeWidth={activeView === 'mobile' ? 2.25 : 1.75} />
          </ForgeSidebarIconButton>
        ) : null}
        <ForgeSecondarySidebarNavEntry compact />
      </nav>
    </TooltipProvider>
  )
}
