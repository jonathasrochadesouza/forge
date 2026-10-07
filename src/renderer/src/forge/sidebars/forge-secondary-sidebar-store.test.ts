// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'

const mocks = vi.hoisted<{ setSidebarOpen: Mock }>(() => ({ setSidebarOpen: vi.fn() }))

vi.mock('@/store', () => ({
  useAppStore: { getState: () => ({ setSidebarOpen: mocks.setSidebarOpen }) }
}))

import {
  closeForgeSecondarySidebar,
  forgeProjectsWorktreeScrollOffsetRef,
  isForgeSecondarySidebarOpen,
  openForgeSecondarySidebar,
  useForgeSecondarySidebar,
  useForgeSecondarySidebarOpen
} from './forge-secondary-sidebar-store'

describe('forge-secondary-sidebar-store', () => {
  beforeEach(() => {
    mocks.setSidebarOpen.mockClear()
    closeForgeSecondarySidebar()
    mocks.setSidebarOpen.mockClear()
  })

  afterEach(() => {
    cleanup()
    closeForgeSecondarySidebar()
  })

  it('starts closed so a fresh launch shows the default sidebar', () => {
    const { result } = renderHook(() => useForgeSecondarySidebar())
    expect(result.current).toEqual({ open: false, panel: 'projects' })
  })

  it('opening a panel collapses the left sidebar', () => {
    act(() => {
      openForgeSecondarySidebar('projects')
    })

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false)
    const { result } = renderHook(() => useForgeSecondarySidebar())
    expect(result.current).toEqual({ open: true, panel: 'projects' })
  })

  it('closing the panel restores the default sidebar', () => {
    openForgeSecondarySidebar('projects')
    mocks.setSidebarOpen.mockClear()

    act(() => {
      closeForgeSecondarySidebar()
    })

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(true)
    const { result } = renderHook(() => useForgeSecondarySidebar())
    expect(result.current.open).toBe(false)
  })

  it('closing while already closed does not touch the left sidebar', () => {
    closeForgeSecondarySidebar()

    expect(mocks.setSidebarOpen).not.toHaveBeenCalled()
  })

  it('reopening after a close works again', () => {
    openForgeSecondarySidebar('projects')
    closeForgeSecondarySidebar()
    openForgeSecondarySidebar('projects')

    const { result } = renderHook(() => useForgeSecondarySidebar())
    expect(result.current.open).toBe(true)
  })

  it('reopening with the same panel while open does not emit extra state', () => {
    openForgeSecondarySidebar('projects')
    mocks.setSidebarOpen.mockClear()

    openForgeSecondarySidebar('projects')

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false)
    const { result } = renderHook(() => useForgeSecondarySidebar())
    expect(result.current).toEqual({ open: true, panel: 'projects' })
  })

  it('exposes a primitive open hook and imperative reader', () => {
    const openHook = renderHook(() => useForgeSecondarySidebarOpen())
    expect(openHook.result.current).toBe(false)

    act(() => {
      openForgeSecondarySidebar('projects')
    })
    openHook.rerender()
    expect(openHook.result.current).toBe(true)
    expect(isForgeSecondarySidebarOpen()).toBe(true)
  })

  it('keeps the projects tree scroll memory across reopen cycles', () => {
    forgeProjectsWorktreeScrollOffsetRef.current = 240

    openForgeSecondarySidebar('projects')
    closeForgeSecondarySidebar()
    openForgeSecondarySidebar('projects')

    expect(forgeProjectsWorktreeScrollOffsetRef.current).toBe(240)
    forgeProjectsWorktreeScrollOffsetRef.current = 0
  })
})
