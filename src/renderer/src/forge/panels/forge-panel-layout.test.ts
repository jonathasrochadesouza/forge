import { describe, expect, it } from 'vitest'
import {
  resolveCollapsedHeaderReserve,
  resolveForgePanelLayout,
  type ForgePanelLayoutInput
} from './forge-panel-layout'

const BASE: ForgePanelLayoutInput = {
  showSidebar: true,
  titlebarEmbedded: true,
  sidebarOpen: true,
  showRightSidebar: true,
  rightSidebarOpen: true
}

describe('resolveForgePanelLayout', () => {
  it('workspace view: every panel is present, flush with the window top', () => {
    expect(resolveForgePanelLayout(BASE)).toEqual({
      showLeft: true,
      flushTop: true,
      floatingHeader: false,
      centerHasLeading: true,
      centerHasTrailing: true,
      rightCollapsed: false
    })
  })

  it('hangs panels below the full titlebar when the titlebar is not embedded', () => {
    const layout = resolveForgePanelLayout({ ...BASE, titlebarEmbedded: false })

    expect(layout.flushTop).toBe(false)
    expect(layout.floatingHeader).toBe(false)
  })

  it('floats the header only when the sidebar is collapsed under an embedded titlebar', () => {
    expect(resolveForgePanelLayout({ ...BASE, sidebarOpen: false }).floatingHeader).toBe(true)
    expect(
      resolveForgePanelLayout({ ...BASE, sidebarOpen: false, titlebarEmbedded: false })
        .floatingHeader
    ).toBe(false)
  })

  it('drops the left panel and the center leading gap on sidebar-less views', () => {
    const layout = resolveForgePanelLayout({ ...BASE, showSidebar: false })

    expect(layout.showLeft).toBe(false)
    expect(layout.centerHasLeading).toBe(false)
    expect(layout.floatingHeader).toBe(false)
  })

  it('collapses the right panel while the right sidebar is closed or unavailable', () => {
    const closed = resolveForgePanelLayout({ ...BASE, rightSidebarOpen: false })
    const unavailable = resolveForgePanelLayout({ ...BASE, showRightSidebar: false })

    expect(closed.rightCollapsed).toBe(true)
    expect(closed.centerHasTrailing).toBe(false)
    expect(unavailable.rightCollapsed).toBe(true)
    expect(unavailable.centerHasTrailing).toBe(false)
  })
})

describe('resolveCollapsedHeaderReserve', () => {
  it('reserves only the header overhang past the icon rail', () => {
    expect(
      resolveCollapsedHeaderReserve({ floatingHeader: true, dockOpen: false, headerWidth: 220 })
    ).toBe('max(0px, calc(220px - var(--forge-panel-rail-footprint)))')
  })

  it('keeps upstream full-width reservation when the header does not float', () => {
    expect(
      resolveCollapsedHeaderReserve({ floatingHeader: false, dockOpen: false, headerWidth: 220 })
    ).toBeUndefined()
  })

  it('keeps upstream full-width reservation while the dock widens the left panel', () => {
    expect(
      resolveCollapsedHeaderReserve({ floatingHeader: true, dockOpen: true, headerWidth: 220 })
    ).toBeUndefined()
  })
})
