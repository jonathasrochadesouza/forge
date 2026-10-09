// Icon-only sidebar button used by the collapsed rail. Name comes from a tooltip (the existing
// Tooltip primitive) and the aria-label, so the visible chrome stays icon-only.
import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ForgeSidebarIconButtonProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & {
  label: string
  active?: boolean
  badge?: React.ReactNode
  children: React.ReactNode
}

// Why forwardRef + prop spread: Radix triggers (DropdownMenuTrigger/ContextMenuTrigger with
// asChild) inject their handlers and ref through the child, so this must forward them.
export const ForgeSidebarIconButton = React.forwardRef<
  HTMLButtonElement,
  ForgeSidebarIconButtonProps
>(function ForgeSidebarIconButton(
  { label, active = false, badge, className, children, ...buttonProps },
  ref
) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          {...buttonProps}
          className={cn(
            'relative flex size-8 shrink-0 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-1 focus-visible:ring-worktree-sidebar-ring',
            active
              ? 'bg-worktree-sidebar-accent text-worktree-sidebar-accent-foreground'
              : 'text-worktree-sidebar-foreground/60 hover:bg-worktree-sidebar-foreground/8',
            className
          )}
        >
          {children}
          {badge}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
})

/** Unread count pinned to the corner of a rail button; same pill the expanded rows use. */
export function ForgeSidebarIconBadge({ count }: { count: number }): React.JSX.Element | null {
  if (count <= 0) {
    return null
  }
  return (
    <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-3.5 rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-3.5 text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}
