// 'Projects' panel content: the workspace tree, relocated here by the forge secondary sidebar.
// Reuses the upstream WorktreeList untouched; activating a workspace closes the panel and
// restores the default sidebar, matching the panel's canonical back behavior.
import React from 'react'
import WorktreeList from '@/components/sidebar/WorktreeList'
import {
  closeForgeSecondarySidebar,
  forgeProjectsWorktreeScrollAnchorRef,
  forgeProjectsWorktreeScrollOffsetRef
} from './forge-secondary-sidebar-store'

export function ForgeProjectsSidebarPanel(): React.JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden scrollbar-sleek-parent">
      <WorktreeList
        scrollOffsetRef={forgeProjectsWorktreeScrollOffsetRef}
        scrollAnchorRef={forgeProjectsWorktreeScrollAnchorRef}
        onWorktreeCardClick={closeForgeSecondarySidebar}
      />
    </div>
  )
}
