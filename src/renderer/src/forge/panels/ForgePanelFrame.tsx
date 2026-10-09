// Floating-panel frame (FORGE-95): a rounded, bordered region with a gutter around it, in the
// spirit of VS Code's Modern UI. The frame owns the border/radius/margins (forge-panel-chrome.css);
// the inner clip box clips content to the rounded shape.
import React from 'react'
import './forge-panel-chrome.css'

export type ForgePanelRegion = 'left' | 'center' | 'right'

// Why: React's CSSProperties rejects custom properties; this admits `--*` keys without a cast.
type CustomPropertyStyle = React.CSSProperties & Record<`--${string}`, string>

function flag(value: boolean): '' | undefined {
  return value ? '' : undefined
}

export function ForgePanelFrame({
  region,
  flushTop,
  hasLeadingPanel = false,
  hasTrailingPanel = false,
  collapsed = false,
  collapsedHeaderReserve,
  overlay,
  children
}: {
  region: ForgePanelRegion
  /** Panel touches the window top (the titlebar is embedded in its own top row). */
  flushTop: boolean
  hasLeadingPanel?: boolean
  hasTrailingPanel?: boolean
  /** Mounted but zero-width: no border or margin may remain. */
  collapsed?: boolean
  /** Overrides --collapsed-sidebar-header-width for descendants (see resolveCollapsedHeaderReserve). */
  collapsedHeaderReserve?: string
  /** Rendered over the frame but outside the clip, e.g. the floating sidebar header. */
  overlay?: React.ReactNode
  children: React.ReactNode
}): React.JSX.Element {
  const style: CustomPropertyStyle | undefined =
    collapsedHeaderReserve === undefined
      ? undefined
      : { '--collapsed-sidebar-header-width': collapsedHeaderReserve }
  return (
    <div
      data-forge-panel={region}
      data-forge-panel-flush-top={flag(flushTop)}
      data-forge-panel-leading={flag(hasLeadingPanel)}
      data-forge-panel-trailing={flag(hasTrailingPanel)}
      data-forge-panel-collapsed={flag(collapsed)}
      style={style}
    >
      {overlay}
      <div className="forge-panel-clip">{children}</div>
    </div>
  )
}
