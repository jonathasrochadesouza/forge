// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

const mocks = vi.hoisted<{ setSidebarOpen: Mock }>(() => ({ setSidebarOpen: vi.fn() }))

type BridgeTestStoreState = {
  pendingRevealWorktree: unknown
  pendingRevealSidebarRow: unknown
}

const storeBox = vi.hoisted<{
  state: BridgeTestStoreState
  listeners: ((state: BridgeTestStoreState, previous: BridgeTestStoreState) => void)[]
}>(() => ({
  state: { pendingRevealWorktree: null, pendingRevealSidebarRow: null },
  listeners: []
}))

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => ({ setSidebarOpen: mocks.setSidebarOpen }),
    subscribe: (
      listener: (state: BridgeTestStoreState, previous: BridgeTestStoreState) => void
    ) => {
      storeBox.listeners.push(listener)
      return () => {
        storeBox.listeners = storeBox.listeners.filter((entry) => entry !== listener)
      }
    }
  }
}))

import { SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT } from '@/lib/scroll-to-current-workspace-status'
import { installForgeSecondarySidebarRevealBridge } from './forge-secondary-sidebar-reveal-bridge'
import {
  closeForgeSecondarySidebar,
  isForgeSecondarySidebarOpen,
  openForgeSecondarySidebar
} from './forge-secondary-sidebar-store'

function emitStoreChange(next: Partial<BridgeTestStoreState>): void {
  // Why capture before reassigning: the store passes the PREVIOUS state to subscribers.
  const previous = storeBox.state
  storeBox.state = { ...storeBox.state, ...next }
  for (const listener of storeBox.listeners) {
    listener(storeBox.state, previous)
  }
}

function nextRevealEvent(): Promise<CustomEvent> {
  return new Promise((resolve) => {
    const observer = (event: Event): void => {
      window.removeEventListener(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, observer)
      if (!(event instanceof CustomEvent)) {
        throw new Error('unexpected event type')
      }
      resolve(event)
    }
    window.addEventListener(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, observer)
  })
}

describe('forge-secondary-sidebar-reveal-bridge', () => {
  beforeEach(() => {
    closeForgeSecondarySidebar()
    storeBox.state = { pendingRevealWorktree: null, pendingRevealSidebarRow: null }
    storeBox.listeners = []
  })

  afterEach(() => {
    closeForgeSecondarySidebar()
  })

  it('opens the panel when a pending worktree reveal appears while it is closed', () => {
    const uninstall = installForgeSecondarySidebarRevealBridge()

    emitStoreChange({ pendingRevealWorktree: { worktreeId: 'wt-1', behavior: 'smooth' } })

    expect(isForgeSecondarySidebarOpen()).toBe(true)
    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false)
    uninstall()
  })

  it('ignores pending reveals while the panel is already open', () => {
    openForgeSecondarySidebar('projects')
    mocks.setSidebarOpen.mockClear()
    const uninstall = installForgeSecondarySidebarRevealBridge()

    emitStoreChange({ pendingRevealSidebarRow: { rowKey: 'row-1', behavior: 'smooth' } })

    expect(mocks.setSidebarOpen).not.toHaveBeenCalled()
    uninstall()
  })

  it('replays the scroll-to-current event after opening the closed panel', async () => {
    const uninstall = installForgeSecondarySidebarRevealBridge()
    const detail = { target: { type: 'active-workspace' }, beginRename: true }
    const replayed = nextRevealEvent()

    window.dispatchEvent(
      new CustomEvent(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, { detail })
    )

    expect(isForgeSecondarySidebarOpen()).toBe(true)
    expect((await replayed).detail).toEqual(detail)
    uninstall()
  })

  it('does not replay the scroll-to-current event while the panel is open', () => {
    openForgeSecondarySidebar('projects')
    const uninstall = installForgeSecondarySidebarRevealBridge()
    const seen: CustomEvent[] = []
    const observer = (event: Event): void => {
      if (!(event instanceof CustomEvent)) {
        return
      }
      seen.push(event)
    }
    window.addEventListener(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, observer)

    window.dispatchEvent(new CustomEvent(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT))

    expect(seen).toHaveLength(1)
    window.removeEventListener(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, observer)
    uninstall()
  })

  it('stays installed until every install is uninstalled', () => {
    const first = installForgeSecondarySidebarRevealBridge()
    const second = installForgeSecondarySidebarRevealBridge()
    second()

    emitStoreChange({ pendingRevealWorktree: { worktreeId: 'wt-2', behavior: 'smooth' } })
    expect(isForgeSecondarySidebarOpen()).toBe(true)

    closeForgeSecondarySidebar()
    first()

    emitStoreChange({ pendingRevealWorktree: { worktreeId: 'wt-3', behavior: 'smooth' } })
    expect(isForgeSecondarySidebarOpen()).toBe(false)
  })
})
