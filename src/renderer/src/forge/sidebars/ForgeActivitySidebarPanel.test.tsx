// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'

const mocks = vi.hoisted<{
  agentsReadFilter: string
  setAgentsReadFilter: Mock
  agentsGroupBy: string
  setAgentGroupBy: Mock
}>(() => ({
  agentsReadFilter: 'unread',
  setAgentsReadFilter: vi.fn(),
  agentsGroupBy: 'agent',
  setAgentGroupBy: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: ActivityTestStoreState) => unknown) =>
    selector({
      agentsReadFilter: mocks.agentsReadFilter,
      setAgentsReadFilter: mocks.setAgentsReadFilter,
      agentsGroupBy: mocks.agentsGroupBy,
      setAgentGroupBy: mocks.setAgentGroupBy
    })
}))
vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string) => fallback,
  i18n: { language: 'en' }
}))

type ActivityTestStoreState = {
  agentsReadFilter: string
  setAgentsReadFilter: Mock
  agentsGroupBy: string
  setAgentGroupBy: Mock
}

type AgentsListProps = {
  readFilter: string
  groupBy: string
  query: string
  optionsTarget: HTMLDivElement | null
  scrollTopRef: { current: number }
}

const agentsListSpy = vi.hoisted(() => ({
  component: vi.fn((_props: AgentsListProps) => <div data-testid="agents-list" />)
}))

vi.mock('@/components/sidebar/SidebarAgentsList', () => ({ default: agentsListSpy.component }))

import { ForgeActivitySidebarPanel } from './ForgeActivitySidebarPanel'
import {
  closeForgeSecondarySidebar,
  forgeAgentsScrollTopRef
} from './forge-secondary-sidebar-store'

describe('ForgeActivitySidebarPanel', () => {
  afterEach(() => {
    cleanup()
    closeForgeSecondarySidebar()
    agentsListSpy.component.mockClear()
  })

  it('renders the agents list with the store filters and the panel scroll ref', async () => {
    render(<ForgeActivitySidebarPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('agents-list')).toBeTruthy()
    })
    const props = agentsListSpy.component.mock.calls.at(-1)![0]
    expect(props.readFilter).toBe('unread')
    expect(props.groupBy).toBe('agent')
    expect(props.scrollTopRef).toBe(forgeAgentsScrollTopRef)
  })

  it('provides the options-menu portal slot inside the panel body', async () => {
    const { container } = render(<ForgeActivitySidebarPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('agents-list')).toBeTruthy()
    })
    const slot = agentsListSpy.component.mock.calls.at(-1)![0].optionsTarget
    expect(slot).toBeInstanceOf(HTMLDivElement)
    expect(container.contains(slot)).toBe(true)
  })
})
