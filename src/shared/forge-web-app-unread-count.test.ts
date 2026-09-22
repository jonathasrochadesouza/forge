import { describe, expect, it } from 'vitest'
import { readForgeWebAppUnreadCount } from './forge-web-app-unread-count'

describe('readForgeWebAppUnreadCount', () => {
  it('reads the count from a Teams-style title badge', () => {
    expect(readForgeWebAppUnreadCount('(3) Microsoft Teams')).toBe(3)
  })

  it('reads the count from an Outlook-style title badge', () => {
    expect(readForgeWebAppUnreadCount('(12) Calendar | Outlook')).toBe(12)
  })

  it('returns 0 for a title with no badge', () => {
    expect(readForgeWebAppUnreadCount('Microsoft Teams')).toBe(0)
  })

  it('returns 0 for a (0) badge', () => {
    expect(readForgeWebAppUnreadCount('(0) Microsoft Teams')).toBe(0)
  })

  it('returns 0 for null, undefined, or empty title', () => {
    expect(readForgeWebAppUnreadCount(null)).toBe(0)
    expect(readForgeWebAppUnreadCount(undefined)).toBe(0)
    expect(readForgeWebAppUnreadCount('')).toBe(0)
  })

  it('ignores a parenthesized number that is not a leading badge', () => {
    expect(readForgeWebAppUnreadCount('Microsoft Teams (3)')).toBe(0)
  })

  it('tolerates leading whitespace before the badge', () => {
    expect(readForgeWebAppUnreadCount('  (7) Microsoft Teams')).toBe(7)
  })
})
