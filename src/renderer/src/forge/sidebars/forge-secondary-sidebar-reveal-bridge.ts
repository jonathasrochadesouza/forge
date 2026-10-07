// Opens the forge secondary sidebar when a reveal request targets the projects tree — the
// tree no longer renders in the left sidebar, so reveal flows (rename shortcut, scroll-to-
// current button, pin reveal, send-to-agent) must route through the panel.
import { useAppStore } from '@/store'
import { SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT } from '@/lib/scroll-to-current-workspace-status'
import {
  isForgeSecondarySidebarOpen,
  openForgeSecondarySidebar
} from './forge-secondary-sidebar-store'

// Why ~150ms: the panel's tree mounts after the store emit commits; the replayed event must
// land after the WorktreeList's own reveal listener registers.
const REPLAY_DELAY_MS = 150

let teardown: (() => void) | null = null
let installs = 0

function install(): () => void {
  // Why: the sidebar nav also mounts against partial store states (tests); skip there.
  if (typeof useAppStore.subscribe !== 'function') {
    return () => {}
  }
  const unsubscribe = useAppStore.subscribe((state, previous) => {
    const revealed = state.pendingRevealWorktree ?? state.pendingRevealSidebarRow
    const previouslyRevealed = previous?.pendingRevealWorktree ?? previous?.pendingRevealSidebarRow
    if (revealed && revealed !== previouslyRevealed && !isForgeSecondarySidebarOpen()) {
      openForgeSecondarySidebar('projects')
    }
  })

  const onRevealRequest = (event: Event): void => {
    if (isForgeSecondarySidebarOpen()) {
      return
    }
    openForgeSecondarySidebar('projects')
    // Why: nothing consumed the original dispatch (the tree was unmounted); replay it once
    // the panel's tree is mounted so scroll-to-current still finds its row.
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, {
          detail: event instanceof CustomEvent ? event.detail : undefined
        })
      )
    }, REPLAY_DELAY_MS)
  }
  window.addEventListener(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, onRevealRequest)

  return () => {
    unsubscribe()
    window.removeEventListener(SCROLL_TO_CURRENT_WORKSPACE_REVEAL_REQUEST_EVENT, onRevealRequest)
  }
}

/** Idempotent bridge install; the returned function fully removes it. */
export function installForgeSecondarySidebarRevealBridge(): () => void {
  installs += 1
  if (teardown === null) {
    teardown = install()
  }
  let done = false
  return () => {
    if (done) {
      return
    }
    done = true
    installs = Math.max(0, installs - 1)
    if (installs === 0 && teardown !== null) {
      teardown()
      teardown = null
    }
  }
}
