// State for Forge's auxiliary secondary sidebar: one panel at a time (starting with
// 'projects'), docked next to the left sidebar. Opening collapses the left sidebar; every
// close path restores the default initial sidebar (left sidebar open). Ephemeral — a fresh
// launch always starts closed, so the app opens in its default sidebar state.
import type { MutableRefObject } from 'react'
import { useSyncExternalStore } from 'react'
import { useAppStore } from '@/store'
import type { VirtualizedScrollAnchor } from '@/hooks/useVirtualizedScrollAnchor'

export type ForgeSecondarySidebarPanel = 'projects'

type ForgeSecondarySidebarState = {
  open: boolean
  panel: ForgeSecondarySidebarPanel
}

const CLOSED_STATE: ForgeSecondarySidebarState = { open: false, panel: 'projects' }

let state: ForgeSecondarySidebarState = CLOSED_STATE
const listeners = new Set<() => void>()

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getState(): ForgeSecondarySidebarState {
  return state
}

function isOpen(): boolean {
  return state.open
}

/** Full-state subscription for the panel host; re-renders only when open/panel change. */
export function useForgeSecondarySidebar(): ForgeSecondarySidebarState {
  return useSyncExternalStore(subscribe, getState, getState)
}

/** Primitive-open subscription for readers like the sidebar body gate; skips panel-only churn. */
export function useForgeSecondarySidebarOpen(): boolean {
  return useSyncExternalStore(subscribe, isOpen, isOpen)
}

export function isForgeSecondarySidebarOpen(): boolean {
  return state.open
}

// Scroll memory for the panel's projects tree; module-level so reopens keep position.
export const forgeProjectsWorktreeScrollOffsetRef: MutableRefObject<number> = { current: 0 }
export const forgeProjectsWorktreeScrollAnchorRef: MutableRefObject<VirtualizedScrollAnchor> = {
  current: null
}

// Scroll memory for the panel's activity list; same rationale as the tree refs above.
export const forgeAgentsScrollTopRef: MutableRefObject<number> = { current: 0 }

/** Opens a panel and collapses the left sidebar so the panel owns the left edge. */
export function openForgeSecondarySidebar(panel: ForgeSecondarySidebarPanel = 'projects'): void {
  if (!state.open || state.panel !== panel) {
    state = { open: true, panel }
    emitChange()
  }
  useAppStore.getState().setSidebarOpen(false)
}

/** Closes the panel and restores the default initial sidebar (left sidebar open). */
export function closeForgeSecondarySidebar(): void {
  if (!state.open) {
    return
  }
  state = { ...state, open: false }
  emitChange()
  useAppStore.getState().setSidebarOpen(true)
}
