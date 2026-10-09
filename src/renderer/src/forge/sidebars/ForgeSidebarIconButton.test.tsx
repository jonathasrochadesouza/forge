// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ForgeSidebarIconBadge, ForgeSidebarIconButton } from './ForgeSidebarIconButton'

function renderButton(ui: React.ReactElement): void {
  render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

describe('ForgeSidebarIconButton', () => {
  afterEach(cleanup)

  it('names the icon-only button by its label and shows no visible text', () => {
    renderButton(
      <ForgeSidebarIconButton label="Tasks">
        <svg data-testid="icon" />
      </ForgeSidebarIconButton>
    )

    const button = screen.getByRole('button', { name: 'Tasks' })
    expect(button.textContent).toBe('')
    expect(screen.getByTestId('icon')).toBeTruthy()
  })

  it('shows the label in a tooltip when the pointer rests on it', async () => {
    renderButton(
      <ForgeSidebarIconButton label="Tasks">
        <svg />
      </ForgeSidebarIconButton>
    )

    fireEvent.focus(screen.getByRole('button', { name: 'Tasks' }))

    expect((await screen.findAllByText('Tasks')).length).toBeGreaterThan(0)
    expect(document.querySelector('[data-slot="tooltip-content"]')).not.toBeNull()
  })

  it('marks the active button with aria-current and the active surface', () => {
    renderButton(
      <ForgeSidebarIconButton label="Tasks" active>
        <svg />
      </ForgeSidebarIconButton>
    )

    const button = screen.getByRole('button', { name: 'Tasks' })
    expect(button.getAttribute('aria-current')).toBe('page')
    expect(button.className).toContain('bg-worktree-sidebar-accent')
  })

  it('leaves aria-current off while inactive and forwards clicks', () => {
    const onClick = vi.fn()
    renderButton(
      <ForgeSidebarIconButton label="Tasks" onClick={onClick}>
        <svg />
      </ForgeSidebarIconButton>
    )

    const button = screen.getByRole('button', { name: 'Tasks' })
    fireEvent.click(button)

    expect(button.getAttribute('aria-current')).toBeNull()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a badge slot inside the button', () => {
    renderButton(
      <ForgeSidebarIconButton label="Pinned apps" badge={<ForgeSidebarIconBadge count={120} />}>
        <svg />
      </ForgeSidebarIconButton>
    )

    expect(screen.getByRole('button', { name: 'Pinned apps' }).textContent).toBe('99+')
  })
})

describe('ForgeSidebarIconBadge', () => {
  afterEach(cleanup)

  it('renders nothing for a zero count', () => {
    const { container } = render(<ForgeSidebarIconBadge count={0} />)

    expect(container.childElementCount).toBe(0)
  })

  it('shows the exact count up to 99', () => {
    render(<ForgeSidebarIconBadge count={7} />)

    expect(screen.getByText('7')).toBeTruthy()
  })
})
