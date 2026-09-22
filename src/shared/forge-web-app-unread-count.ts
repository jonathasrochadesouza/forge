// Extracts an unread-message count from a pinned web app's tab title. Teams and Outlook both
// prefix the document title with a "(N)" badge while there is unread activity — the same signal
// the OS taskbar/dock badge reads on desktop. Pure logic, no Electron dependency.

const LEADING_COUNT_PATTERN = /^\((\d+)\)/

/**
 * Reads the unread count a pinned web app's tab title carries, if any.
 * Returns 0 when the title carries no such badge (including an unparsable or missing title).
 */
export function readForgeWebAppUnreadCount(title: string | null | undefined): number {
  if (!title) {
    return 0
  }
  const match = LEADING_COUNT_PATTERN.exec(title.trim())
  if (!match) {
    return 0
  }
  const count = Number.parseInt(match[1], 10)
  return Number.isFinite(count) && count > 0 ? count : 0
}
