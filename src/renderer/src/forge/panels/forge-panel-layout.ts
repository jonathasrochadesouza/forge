// Which edges each floating panel (FORGE-95) must treat as flush or neighbored. Pure so the
// shell's layout rules stay testable without mounting the app.
export type ForgePanelLayoutInput = {
  showSidebar: boolean
  // True when the window titlebar is embedded in the panels' own top rows (workspace view,
  // stacked sidebar, creation) instead of a full-width strip above them.
  titlebarEmbedded: boolean
  sidebarOpen: boolean
  showRightSidebar: boolean
  rightSidebarOpen: boolean
}

export type ForgePanelLayout = {
  showLeft: boolean
  // Panels touch the window top when the titlebar is embedded, so macOS traffic lights and the
  // 36px header rows keep their native alignment; otherwise they hang below the full titlebar.
  flushTop: boolean
  // The sidebar is collapsed: its header floats over the panels and the icon rail takes the column.
  floatingHeader: boolean
  centerHasLeading: boolean
  centerHasTrailing: boolean
  rightCollapsed: boolean
}

export function resolveForgePanelLayout(input: ForgePanelLayoutInput): ForgePanelLayout {
  const showLeft = input.showSidebar
  const rightVisible = input.showRightSidebar && input.rightSidebarOpen
  return {
    showLeft,
    flushTop: input.titlebarEmbedded,
    floatingHeader: showLeft && input.titlebarEmbedded && !input.sidebarOpen,
    centerHasLeading: showLeft,
    centerHasTrailing: rightVisible,
    // Why: the right sidebar stays mounted while closed; its frame must collapse to nothing
    // instead of leaving a border and margin strip.
    rightCollapsed: !rightVisible
  }
}

/**
 * Width the center panel's first tab strip must still reserve for the floating sidebar header.
 * The icon rail already covers part of that width, so only the overhang past it is reserved.
 * Undefined keeps upstream's full-width reservation (header not floating, or the dock — whose
 * width the rail footprint does not include — is open).
 */
export function resolveCollapsedHeaderReserve(input: {
  floatingHeader: boolean
  dockOpen: boolean
  headerWidth: number
}): string | undefined {
  if (!input.floatingHeader || input.dockOpen) {
    return undefined
  }
  return `max(0px, calc(${input.headerWidth}px - var(--forge-panel-rail-footprint)))`
}
