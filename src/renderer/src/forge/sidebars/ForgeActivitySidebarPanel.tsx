// Hosts the agents activity list inside the forge secondary sidebar panel. The wiring mirrors
// the left sidebar's former agents branch (components/sidebar/index.tsx): store-backed filters,
// local query + collapsed-group state, and the portal slot the options menu renders into.
import React from 'react'
import { useAppStore } from '@/store'
import { ActivityThreadCollapseContext } from '@/components/activity/activity-thread-collapse-context'
import { lazyWithRetry } from '@/lib/lazy-with-retry'
import { forgeAgentsScrollTopRef } from './forge-secondary-sidebar-store'

const SidebarAgentsList = lazyWithRetry(() => import('@/components/sidebar/SidebarAgentsList'))

export function ForgeActivitySidebarPanel(): React.JSX.Element {
  const agentReadFilter = useAppStore((s) => s.agentsReadFilter)
  const setAgentReadFilter = useAppStore((s) => s.setAgentsReadFilter)
  const agentGroupBy = useAppStore((s) => s.agentsGroupBy)
  const setAgentGroupBy = useAppStore((s) => s.setAgentsGroupBy)
  const [agentQuery, setAgentQuery] = React.useState('')
  const [agentOptionsTarget, setAgentOptionsTarget] = React.useState<HTMLDivElement | null>(null)
  // Held here so collapsed groups survive the list unmounting on body switches.
  const [agentsCollapsedGroupKeys, setAgentsCollapsedGroupKeys] = React.useState<
    ReadonlySet<string>
  >(() => new Set())
  const agentsCollapseState = React.useMemo(
    () => ({
      collapsedGroupKeys: agentsCollapsedGroupKeys,
      onToggleGroupCollapse: (groupKey: string) =>
        setAgentsCollapsedGroupKeys((prev) => {
          const next = new Set(prev)
          if (next.has(groupKey)) {
            next.delete(groupKey)
          } else {
            next.add(groupKey)
          }
          return next
        })
    }),
    [agentsCollapsedGroupKeys]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Why here instead of the panel header: the options menu portals into this slot. */}
      <div ref={setAgentOptionsTarget} className="flex items-center" />
      <ActivityThreadCollapseContext.Provider value={agentsCollapseState}>
        <React.Suspense fallback={<div className="min-h-0 flex-1" />}>
          <SidebarAgentsList
            readFilter={agentReadFilter}
            setReadFilter={setAgentReadFilter}
            groupBy={agentGroupBy}
            setGroupBy={setAgentGroupBy}
            query={agentQuery}
            setQuery={setAgentQuery}
            optionsTarget={agentOptionsTarget}
            scrollTopRef={forgeAgentsScrollTopRef}
          />
        </React.Suspense>
      </ActivityThreadCollapseContext.Provider>
    </div>
  )
}
