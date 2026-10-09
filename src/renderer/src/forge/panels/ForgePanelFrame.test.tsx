// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { ForgePanelFrame } from './ForgePanelFrame'

function frame(): HTMLElement {
  const el = document.querySelector<HTMLElement>('[data-forge-panel]')
  if (!el) {
    throw new Error('frame not rendered')
  }
  return el
}

describe('ForgePanelFrame', () => {
  afterEach(cleanup)

  it('tags the region and clips its children in a dedicated box', () => {
    render(
      <ForgePanelFrame region="center" flushTop={false}>
        <span data-testid="content" />
      </ForgePanelFrame>
    )

    expect(frame().dataset.forgePanel).toBe('center')
    const clip = frame().querySelector('.forge-panel-clip')
    expect(clip?.querySelector('[data-testid="content"]')).not.toBeNull()
  })

  it('emits each layout flag only when set', () => {
    render(
      <ForgePanelFrame region="center" flushTop hasLeadingPanel hasTrailingPanel>
        <span />
      </ForgePanelFrame>
    )

    const { dataset } = frame()
    expect(dataset.forgePanelFlushTop).toBe('')
    expect(dataset.forgePanelLeading).toBe('')
    expect(dataset.forgePanelTrailing).toBe('')
    expect(dataset.forgePanelCollapsed).toBeUndefined()
  })

  it('leaves every flag off by default', () => {
    render(
      <ForgePanelFrame region="left" flushTop={false}>
        <span />
      </ForgePanelFrame>
    )

    const { dataset } = frame()
    expect(dataset.forgePanelFlushTop).toBeUndefined()
    expect(dataset.forgePanelLeading).toBeUndefined()
    expect(dataset.forgePanelTrailing).toBeUndefined()
    expect(dataset.forgePanelCollapsed).toBeUndefined()
  })

  it('marks a mounted-but-closed panel as collapsed', () => {
    render(
      <ForgePanelFrame region="right" flushTop collapsed>
        <span />
      </ForgePanelFrame>
    )

    expect(frame().dataset.forgePanelCollapsed).toBe('')
  })

  it('scopes the collapsed-header reservation to the frame when given one', () => {
    render(
      <ForgePanelFrame region="center" flushTop collapsedHeaderReserve="12px">
        <span />
      </ForgePanelFrame>
    )

    expect(frame().style.getPropertyValue('--collapsed-sidebar-header-width')).toBe('12px')
  })

  it('adds no inline style without a reservation override', () => {
    render(
      <ForgePanelFrame region="center" flushTop>
        <span />
      </ForgePanelFrame>
    )

    expect(frame().getAttribute('style')).toBeNull()
  })

  it('renders the overlay outside the clip box so it can overflow the rounded shape', () => {
    render(
      <ForgePanelFrame region="left" flushTop overlay={<div data-testid="floating-header" />}>
        <span />
      </ForgePanelFrame>
    )

    const header = document.querySelector('[data-testid="floating-header"]')
    expect(header?.parentElement).toBe(frame())
    expect(frame().querySelector('.forge-panel-clip [data-testid="floating-header"]')).toBeNull()
  })
})
