# Panel chrome and collapsed sidebar rail (FORGE-94, FORGE-95)

## Collapsed sidebar rail (FORGE-94)

Collapsing the worktree sidebar no longer hides it. `ForgeCollapsedSidebarRail`
(`src/renderer/src/forge/sidebars/`) renders a 44px strip of icon-only buttons with the same
actions and active states as `SidebarNav`, and a tooltip (the shared `Tooltip` primitive) naming
each icon.

- Mounted by `AppWorkspaceShell` next to the (now empty) `Sidebar` whenever the sidebar is
  collapsed and the view has a sidebar. Reopening unmounts the rail and restores the full sidebar.
- Reuses the visibility predicates exported from `SidebarNav`, so a button hidden in the expanded
  sidebar is hidden in the rail too.
- Forge-owned entries (Projects, Pinned apps, favorite app) take a `compact` prop instead of a
  second implementation. Their one-time effects (navigation guards, reveal bridge) keep running
  while the sidebar is collapsed because the compact variants are mounted by the rail.
- Opening the Projects dock collapses the sidebar by design, so the rail and the dock share the
  left edge as one panel.

## Floating panels (FORGE-95)

`ForgePanelFrame` (`src/renderer/src/forge/panels/`) wraps the three window regions — left
(sidebar or rail, plus the Projects dock), center (pages and the terminal workbench), right — in
rounded, 1px-bordered panels with a gutter, styled by `forge-panel-chrome.css`.

| Token                        | Value                                        | Role                                                           |
| ---------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `--forge-panel-radius`       | `calc(var(--radius) * 1.4)` (= `rounded-xl`) | Outer corner radius                                            |
| `--forge-panel-gap`          | `6px`                                        | Space between neighboring panels                               |
| `--forge-panel-inset`        | `4px`                                        | Space between a panel and the window edge                      |
| `--forge-panel-border-width` | `1px`                                        | Panel border                                                   |
| `--forge-panel-radius-inner` | `max(0px, radius - border-width)`            | Radius of the clip box inside the border (concentric, clamped) |
| `--forge-panel-gutter`       | `color-mix(foreground 4%, background)`       | Colour visible in the gaps                                     |

Rules worth knowing:

- Sidebar and dock share one frame: the pair has four outer corners and a straight, gap-free seam
  (`[data-forge-secondary-sidebar]` gets a left border). Dock closed → the sidebar alone has all
  four corners.
- When the titlebar is embedded in the panels' top rows (workspace view), panels touch the window
  top and their top corners are square. The native macOS traffic lights and the 36px header bands
  are aligned to that edge, so a top inset would shift them. Views with a full-width titlebar
  hang the panels below it with the normal gap and four rounded corners.
- The right panel stays mounted at zero width while closed; its frame collapses (`margin: 0`,
  `border-width: 0`) so no strip remains.
- The collapsed sidebar header floats over the panels, so it is rendered as the frame's `overlay`,
  outside the rounded clip box. The center panel's first tab strip reserves only the header's
  overhang past the rail (`resolveCollapsedHeaderReserve`); with the Projects dock open it keeps
  upstream's full-width reservation.
- The sidebar resize handle is pulled inside the left panel (`right: 0; width: 8px`) because the
  clip box would cut its outer half.

## Known limits (not done in FORGE-95)

- Individual workbench splits are not separate rounded panels. Terminal and browser panes are
  position-anchored overlays above the tab groups (`RetainedPaneHost`, `BrowserPaneOverlayLayer`),
  so rounding a split's own box would not clip them. The center region as a whole is clipped.
- No Layout Density toggle yet; the gap and inset tokens are the knobs for one.
- Not verified in a running Electron window: window-controls overlay alignment on Windows/Linux,
  the board and dashboard sheets that offset from the sidebar edge by `sidebarWidth`, and
  `<webview>` clipping at the rounded corners.
