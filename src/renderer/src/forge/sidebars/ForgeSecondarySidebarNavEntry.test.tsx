// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const mocks = vi.hoisted<{ setSidebarOpen: Mock }>(() => ({ setSidebarOpen: vi.fn() }))

vi.mock('@/store', () => ({
  useAppStore: { getState: () => ({ setSidebarOpen: mocks.setSidebarOpen }) }
}))
vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))

import { ForgeSecondarySidebarNavEntry } from './ForgeSecondarySidebarNavEntry'
import {
  closeForgeSecondarySidebar,
  useForgeSecondarySidebar
} from './forge-secondary-sidebar-store'

function renderedOpenState(): boolean {
  let open = false
  function Probe(): null {
    open = useForgeSecondarySidebar().open
    return null
  }
  render(<Probe />)
  cleanup()
  return open
}

describe('ForgeSecondarySidebarNavEntry', () => {
  afterEach(() => {
    cleanup()
    closeForgeSecondarySidebar()
  })

  it('renders the Projects button inactive while the panel is closed', () => {
    render(<ForgeSecondarySidebarNavEntry />)

    const button = screen.getByRole('button', { name: 'Projects' })
    expect(button.getAttribute('aria-current')).toBeNull()
    expect(button.textContent).toContain('Projects')
  })

  it('clicking it opens the panel and collapses the left sidebar', () => {
    render(<ForgeSecondarySidebarNavEntry />)

    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false)
    expect(renderedOpenState()).toBe(true)
  })

  it('marks the button active while the panel is open', () => {
    closeForgeSecondarySidebar()
    render(<ForgeSecondarySidebarNavEntry />)
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))

    cleanup()
    render(<ForgeSecondarySidebarNavEntry />)

    expect(screen.getByRole('button', { name: 'Projects' }).getAttribute('aria-current')).toBe(
      'page'
    )
  })

  it('clicking it again closes the panel and restores the default sidebar', () => {
    render(<ForgeSecondarySidebarNavEntry />)
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))
    mocks.setSidebarOpen.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(true)
    expect(renderedOpenState()).toBe(false)
  })
})
